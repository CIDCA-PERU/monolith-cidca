/**
 * Funciones de validación reutilizables
 */

import { ValidationError } from './errors';

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('El email no es válido');
  }
}

export function validatePassword(password: string): void {
  if (password.length < 8) {
    throw new ValidationError('La contraseña debe tener al menos 8 caracteres');
  }
  // Validar complejidad: al menos una mayúscula, una minúscula y un número
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    throw new ValidationError(
      'La contraseña debe contener mayúsculas, minúsculas y números'
    );
  }
}

export function validatePasswordMatch(password: string, confirmPassword: string): void {
  if (password !== confirmPassword) {
    throw new ValidationError('Las contraseñas no coinciden');
  }
}

export function validateCursoNombre(nombre: string): void {
  if (!nombre || nombre.trim().length === 0) {
    throw new ValidationError('El nombre del curso es requerido');
  }
  if (nombre.length > 255) {
    throw new ValidationError('El nombre del curso no debe exceder 255 caracteres');
  }
}

export function validateFechas(fechaInicio: string, fechaFin: string): void {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  if (inicio >= fin) {
    throw new ValidationError('La fecha de inicio debe ser anterior a la fecha de fin');
  }
}

export function validateNumeroPositivo(valor: number | null | undefined): void {
  if (valor === null || valor === undefined) {
    throw new ValidationError('El valor es requerido');
  }
  if (valor <= 0) {
    throw new ValidationError('El valor debe ser mayor a 0');
  }
}

export function validateTipoItemApartado(
  tipo: string
): tipo is 'SEPARADOR' | 'PDF' | 'VIDEO' | 'EXAMEN' {
  return ['SEPARADOR', 'PDF', 'VIDEO', 'EXAMEN'].includes(tipo);
}

export function validateTipoPregunta(
  tipo: string
): tipo is 'MULTIPLE' | 'VERDADERO_FALSO' | 'RESPUESTA_CORTA' | 'NUMERICA' {
  return ['MULTIPLE', 'VERDADERO_FALSO', 'RESPUESTA_CORTA', 'NUMERICA'].includes(tipo);
}

export function validateEstadoExamen(
  estado: string
): estado is 'EN_PROGRESO' | 'COMPLETADO' | 'SUSPENDIDO' | 'FRAUDE' {
  return ['EN_PROGRESO', 'COMPLETADO', 'SUSPENDIDO', 'FRAUDE'].includes(estado);
}

export function validateCursoData(data: {
  nombre?: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    validateCursoNombre(data.nombre || '');
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Nombre inválido');
  }

  if (!data.descripcion || data.descripcion.trim().length === 0) {
    errors.push('La descripción del curso es requerida');
  }

  if (!data.fecha_inicio || !data.fecha_fin) {
    errors.push('Las fechas de inicio y fin son requeridas');
  } else {
    try {
      validateFechas(data.fecha_inicio, data.fecha_fin);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Fechas inválidas');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
