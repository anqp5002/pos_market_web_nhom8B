import { Request, Response, NextFunction } from 'express';

// Middleware to check if user has Admin role
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // auth.middleware should attach user to req
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({ error: 'Chưa xác thực người dùng' });
    return;
  }

  // Allow if role is ADMIN or Quản Trị Viên or roleId is 1 (typically admin)
  if (user.role?.name !== 'ADMIN' && user.role?.name !== 'Quản Trị Viên' && user.roleId !== 1) {
    res.status(403).json({ error: 'Chỉ Quản Trị Viên mới có quyền truy cập chức năng này' });
    return;
  }

  next();
};

// Configurable role middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
       res.status(401).json({ error: 'Chưa xác thực người dùng' });
       return;
    }

    if (!allowedRoles.includes(user.role?.name) && !allowedRoles.includes(user.roleName)) {
       res.status(403).json({ error: 'Bạn không có quyền truy cập chức năng này' });
       return;
    }

    next();
  };
};
