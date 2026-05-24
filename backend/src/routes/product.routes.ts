import { Router } from 'express';
import * as productCtrl from '../controllers/product.controller';
import { roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

// === Cả Admin + Cashier đều được xem ===
router.get('/', productCtrl.getAll);
router.get('/:id', productCtrl.getById);

// === Chỉ Admin mới được tạo/sửa/xóa ===
router.post('/', roleMiddleware('Admin'), productCtrl.create);
router.put('/:id', roleMiddleware('Admin'), productCtrl.update);
router.delete('/:id', roleMiddleware('Admin'), productCtrl.remove);

export default router;
