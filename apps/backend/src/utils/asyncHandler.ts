import type { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown> | unknown;

/**
 * Higher-Order Function wrapper untuk async route handlers Express.
 * Secara otomatis meneruskan exception ke Global Error Handler via `next(err)`.
 * Mengeliminasi boilerplate try...catch manual di setiap method controller.
 */
export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
