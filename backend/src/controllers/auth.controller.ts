import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  /**
   * POST /api/auth/login
   * FR-01: Xác thực nhân viên
   */
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: 'Vui lòng nhập tên đăng nhập và mật khẩu',
        });
        return;
      }

      const result = await authService.login({ username, password });

      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Đăng nhập thất bại',
      });
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token
   */
  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token là bắt buộc',
        });
        return;
      }

      const result = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: 'Refresh token không hợp lệ hoặc đã hết hạn',
      });
    }
  }

  /**
   * GET /api/auth/me
   * Lấy thông tin user hiện tại (cần auth middleware)
   */
  async me(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      res.json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  }
}

export const authController = new AuthController();
