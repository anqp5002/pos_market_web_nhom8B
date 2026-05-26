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

  /**
   * POST /api/auth/change-password
   * FR-03: Thay đổi mật khẩu nhân viên
   */
  async changePassword(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user || !user.userId) {
        res.status(401).json({
          success: false,
          message: 'Không tìm thấy thông tin người dùng đăng nhập',
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới',
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Mật khẩu mới phải có độ dài ít nhất 6 ký tự',
        });
        return;
      }

      await authService.changePassword(user.userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Thay đổi mật khẩu thành công',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Thay đổi mật khẩu thất bại',
      });
    }
  }
}

export const authController = new AuthController();
