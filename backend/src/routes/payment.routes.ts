import { Router } from 'express';
import { createQR, handleWebhook } from '../controllers/payment.controller';

const router = Router();

/**
 * POST /api/payments/create-qr
 * Tạo link thanh toán QR từ PayOS
 */
router.post('/create-qr', createQR);

/**
 * POST /api/payments/webhook
 * Nhận webhook callback từ PayOS
 */
router.post('/webhook', handleWebhook);

export default router;
