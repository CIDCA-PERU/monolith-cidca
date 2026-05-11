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
