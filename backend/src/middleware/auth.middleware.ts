import { Request, Response, NextFunction } from 'express';
import { authService, TokenPayload } from '../services/auth.service';

// Extend Request type để thêm user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware xác thực JWT token
 * FR-03: Kiểm tra quyền truy cập
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Chưa đăng nhập. Vui lòng cung cấp token.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = authService.verifyToken(token);

    // Gắn thông tin user vào request
    req.user = payload;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn',
    });
  }
}

/**
 * Middleware kiểm tra role
 * FR-03: Phân quyền theo vai trò (Admin, Cashier)
 */
export function roleMiddleware(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Chưa đăng nhập',
      });
      return;
    }

    const userRoleLower = user.role?.toLowerCase() || '';
    const isAllowed = allowedRoles.some(role => {
      const allowedLower = role.toLowerCase();
      if (allowedLower === 'admin') {
        return ['admin', 'quản trị viên'].includes(userRoleLower);
      }
      if (allowedLower === 'cashier') {
        return ['cashier', 'thu ngân'].includes(userRoleLower);
      }
      return userRoleLower === allowedLower;
    });

    if (!isAllowed) {
      res.status(403).json({
        success: false,
        message: `Bạn không có quyền truy cập. Yêu cầu vai trò: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}
