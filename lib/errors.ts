/**
 * Clases de error personalizadas para la capa de servicio
 */

export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// Alias base usado por actions y services
export class AppError extends ServiceError {
  constructor(
    message: string,
    code: string = 'APP_ERROR',
    statusCode: number = 400
  ) {
    super(message, code, statusCode);
    this.name = 'AppError';
  }
}

export class BusinessError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, 'BUSINESS_ERROR', statusCode);
    this.name = 'BusinessError';
  }
}

export class AuthenticationError extends ServiceError {
  constructor(message: string = 'Autenticación requerida') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ServiceError {
  constructor(message: string = 'No tiene permisos para esta acción') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ServiceError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ServiceError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class ExamSecurityError extends ServiceError {
  constructor(message: string) {
    super(message, 'EXAM_SECURITY_ERROR', 403);
    this.name = 'ExamSecurityError';
  }
}

export const handleServiceError = (error: unknown) => {
  if (error instanceof ServiceError) {
    return {
      success: false,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  console.error('[v0] Unexpected error:', error);

  return {
    success: false,
    message: 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  };
};

/**
 * Global handler for Server Actions to prevent DB errors from leaking to the client.
 */
export const handleActionError = (error: unknown): { success: false; error: string } => {
  if (error instanceof ServiceError) {
    return { success: false, error: error.message };
  }

  const err = error as any;

  // Errores comunes de PostgreSQL
  if (err?.code === '23505') {
    // Unique violation
    if (err.message?.includes('email')) {
      return { success: false, error: 'Este correo electrónico ya está registrado.' };
    }
    if (err.message?.includes('doc_num_vac')) {
      return { success: false, error: 'Este documento de identidad ya está registrado.' };
    }
    return { success: false, error: 'El registro ingresado ya existe.' };
  }

  if (err?.code === '23503') {
    // Foreign key violation
    return { success: false, error: 'No se puede realizar esta acción porque el registro está en uso o depende de otro.' };
  }

  if (err?.code === '22P02') {
    // Invalid text representation (UUID o Int mal formados)
    return { success: false, error: 'Datos de entrada inválidos.' };
  }

  console.error('[Server Action Error]:', error);
  
  // Evitar que el error crudo llegue al cliente
  return { success: false, error: 'Ha ocurrido un error inesperado. Por favor, inténtelo de nuevo.' };
};
