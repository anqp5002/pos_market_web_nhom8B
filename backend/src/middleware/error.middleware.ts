import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler middleware
 */
export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('❌ Error:', err.message);

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Lỗi server nội bộ'
      : err.message,
  });
}
