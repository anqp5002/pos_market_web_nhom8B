import { Router } from 'express';
import * as orderCtrl from '../controllers/order.controller';
import { validateBody } from '../middleware/validate.middleware';
import { createOrderSchema } from '../validators/order.validator';
import { createPaymentSchema } from '../validators/payment.validator';

const router = Router();

// POST  /api/orders           - Tạo đơn hàng mới (validate body)
// GET   /api/orders           - Danh sách đơn hàng
// GET   /api/orders/:id       - Chi tiết đơn hàng
// PATCH /api/orders/:id/status - Cập nhật trạng thái (PENDING, COMPLETED, CANCELLED)
// POST  /api/orders/:id/pay   - Thanh toán đơn hàng (lưu giao dịch, xuất hóa đơn)

router.post('/', validateBody(createOrderSchema), orderCtrl.create);
router.get('/', orderCtrl.getAll);
router.get('/:id', orderCtrl.getById);
router.patch('/:id/status', orderCtrl.updateStatus);
router.post('/:id/pay', validateBody(createPaymentSchema), orderCtrl.pay);

export default router;
