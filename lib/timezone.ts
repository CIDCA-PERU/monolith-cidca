/**
 * Utilidades para manejo de zonas horarias
 * CIDCA usa exclusively 'America/Lima'
 */

export const CIDCA_TIMEZONE = 'America/Lima';

/**
 * Obtiene la hora actual en la zona horaria de CIDCA
 */
export function getCurrentTimeInCIDCA(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: CIDCA_TIMEZONE }));
}

/**
 * Convierte un string de hora (HH:MM) a minutos desde media noche
 */
export function horaStringToMinutes(horaStr: string): number {
  const [horas, minutos] = horaStr.split(':').map(Number);
  return horas * 60 + minutos;
}

/**
 * Valida si la hora actual está dentro del rango permitido para asistencia
 * @param sesionInicio - Hora de inicio de sesión (HH:MM)
 * @param sesionFin - Hora de fin de sesión (HH:MM)
 * @returns { puedeAsistir, minutosAntes, minutosDespues }
 */
export function validarRangoAsistencia(
  sesionInicio: string,
  sesionFin: string,
  fechaSesion: string
) {
  const ahora = getCurrentTimeInCIDCA();
  const hoyString = ahora.toISOString().split('T')[0];

  // Si no es el día de la sesión, no puede asistir
  if (fechaSesion !== hoyString) {
    return {
      puedeAsistir: false,
      minutosAntes: Number.MAX_SAFE_INTEGER,
      minutosDespues: Number.MAX_SAFE_INTEGER,
      razon: 'La sesión no es hoy',
    };
  }

  const horaActualMinutos = ahora.getHours() * 60 + ahora.getMinutes();
  const inicioMinutos = horaStringToMinutes(sesionInicio);
  const finMinutos = horaStringToMinutes(sesionFin);

  const minutosAntes = inicioMinutos - horaActualMinutos;
  const minutosDespues = horaActualMinutos - inicioMinutos;

  // Puede asistir: 15 minutos antes hasta 30 minutos después del inicio
  const puedeAsistir =
    minutosAntes <= 15 && minutosDespues <= 30 && horaActualMinutos < finMinutos;

  return {
    puedeAsistir,
    minutosAntes,
    minutosDespues,
    razon: !puedeAsistir ? 'Fuera del rango permitido (-15 a +30 min)' : undefined,
  };
}

/**
 * Formatea una fecha para mostrar en UI (Zona horaria CIDCA)
 */
export function formatDateCIDCA(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-PE', {
    timeZone: CIDCA_TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formatea una hora para mostrar en UI
 */
export function formatTimeCIDCA(time: string): string {
  // time viene en formato HH:MM
  const [horas, minutos] = time.split(':');
  return `${horas}:${minutos}`;
}
