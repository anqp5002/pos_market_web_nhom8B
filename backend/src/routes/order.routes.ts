import { Router } from 'express';
import * as orderCtrl from '../controllers/order.controller';
import { validateBody } from '../middleware/validate.middleware';
import { createOrderSchema } from '../validators/order.validator';

const router = Router();

// POST  /api/orders           - Tạo đơn hàng mới (validate body)
// GET   /api/orders           - Danh sách đơn hàng
// GET   /api/orders/:id       - Chi tiết đơn hàng
// PATCH /api/orders/:id/status - Cập nhật trạng thái (PENDING, COMPLETED, CANCELLED)

router.post('/', validateBody(createOrderSchema), orderCtrl.create);
router.get('/', orderCtrl.getAll);
router.get('/:id', orderCtrl.getById);
router.patch('/:id/status', orderCtrl.updateStatus);

export default router;
