export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
  jti: string;
  exp?: number;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};