/**
 * Custom application error hierarchy untuk standarisasi error handling Express.
 * Membawa HTTP statusCode dan kumpulan error messages opsional.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors: string[];

  constructor(message: string, statusCode = 500, errors?: string[]) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors && errors.length > 0 ? errors : [message];

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource tidak ditemukan.") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Permintaan tidak valid.", errors?: string[]) {
    super(message, 400, errors);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Autentikasi diperlukan.") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Akses ditolak.") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Terjadi konflik data.") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validasi data gagal.", errors?: string[]) {
    super(message, 422, errors);
    this.name = "ValidationError";
  }
}
