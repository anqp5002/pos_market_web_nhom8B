import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/login — Đăng nhập
router.post('/login', (req, res) => authController.login(req, res));

// POST /api/auth/refresh — Refresh token
router.post('/refresh', (req, res) => authController.refresh(req, res));

// GET /api/auth/me — Lấy thông tin user (cần đăng nhập)
router.get('/me', authMiddleware, (req, res) => authController.me(req, res));

// POST /api/auth/change-password — Đổi mật khẩu nhân viên (cần đăng nhập)
router.post('/change-password', authMiddleware, (req, res) => authController.changePassword(req, res));

export default router;
