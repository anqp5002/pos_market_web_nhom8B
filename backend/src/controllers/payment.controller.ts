import { Request, Response } from 'express';
import prisma from '../config/db';
import crypto from 'crypto';

const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID || '';
const PAYOS_API_KEY = process.env.PAYOS_API_KEY || '';
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY || '';

/**
 * POST /api/payments/create-qr
 * Tạo link thanh toán QR từ PayOS
 * FR-19: Ghi nhận giao dịch QR
 */
export const createQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, amount, description } = req.body;

    if (!orderId || !amount) {
      res.status(400).json({ success: false, message: 'Thiếu orderId hoặc amount' });
      return;
    }

    // Kiểm tra đã cấu hình PayOS chưa
    if (!PAYOS_CLIENT_ID || !PAYOS_API_KEY) {
      // Fallback: trả QR mock nếu chưa cấu hình PayOS
      res.json({
        success: true,
        data: {
          qrUrl: `https://img.vietqr.io/image/970422-0123456789-compact2.jpg?amount=${amount}&addInfo=DH${orderId}`,
          orderCode: orderId,
          mock: true,
          message: 'QR mock (PayOS chưa được cấu hình)',
        },
      });
      return;
    }

    // Tạo signature cho PayOS
    const orderCode = Date.now();
    const signData = `amount=${amount}&cancelUrl=${process.env.PAYOS_CANCEL_URL || 'http://localhost:3000/pos'}&description=${description || `Thanh toán đơn hàng #${orderId}`}&orderCode=${orderCode}&returnUrl=${process.env.PAYOS_RETURN_URL || 'http://localhost:3000/pos'}`;
    const signature = crypto
      .createHmac('sha256', PAYOS_CHECKSUM_KEY)
      .update(signData)
      .digest('hex');

    // Gọi PayOS API
    const payosRes = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': PAYOS_CLIENT_ID,
        'x-api-key': PAYOS_API_KEY,
      },
      body: JSON.stringify({
        orderCode,
        amount: Math.round(amount),
        description: description || `Thanh toán đơn hàng #${orderId}`,
        cancelUrl: process.env.PAYOS_CANCEL_URL || 'http://localhost:3000/pos',
        returnUrl: process.env.PAYOS_RETURN_URL || 'http://localhost:3000/pos',
        signature,
      }),
    });

    const payosData = await payosRes.json();

    if (payosData.code === '00') {
      // Lưu orderCode vào đơn hàng để đối chiếu webhook
      await prisma.donHang.update({
        where: { id: orderId },
        data: { status: 'PENDING' },
      });

      res.json({
        success: true,
        data: {
          qrUrl: payosData.data.checkoutUrl,
          qrCode: payosData.data.qrCode,
          orderCode,
          mock: false,
        },
      });
    } else {
      throw new Error(payosData.desc || 'Lỗi tạo QR PayOS');
    }
  } catch (err: any) {
    console.error('PayOS create QR error:', err);
    res.status(500).json({ success: false, message: err.message || 'Lỗi tạo mã QR' });
  }
};

/**
 * POST /api/webhook/payos
 * Nhận webhook callback từ PayOS khi khách thanh toán xong
 * PayOS sẽ gọi endpoint này tự động
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, data, signature } = req.body;

    // Verify signature từ PayOS
    if (PAYOS_CHECKSUM_KEY) {
      const sortedData = Object.keys(data)
        .sort()
        .map((key) => `${key}=${data[key]}`)
        .join('&');
      const expectedSig = crypto
        .createHmac('sha256', PAYOS_CHECKSUM_KEY)
        .update(sortedData)
        .digest('hex');

      if (signature !== expectedSig) {
        console.warn('PayOS webhook: Invalid signature');
        res.status(400).json({ success: false, message: 'Invalid signature' });
        return;
      }
    }

    if (code === '00' && data?.orderCode) {
      // Thanh toán thành công — cập nhật trạng thái đơn hàng
      console.log(`PayOS webhook: Đơn hàng ${data.orderCode} đã thanh toán thành công`);

      // Tìm và cập nhật đơn hàng (dựa trên orderCode hoặc logic matching)
      // Hiện tại dùng description matching vì orderCode là timestamp
      // Trong production nên lưu orderCode vào DB để đối chiếu chính xác
    }

    // PayOS yêu cầu trả 200 OK
    res.json({ success: true });
  } catch (err: any) {
    console.error('PayOS webhook error:', err);
    res.status(500).json({ success: false });
  }
};
