import { Router } from 'express';
import * as productCtrl from '../controllers/product.controller';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

// === Cả Admin + Cashier đều được xem ===
router.get('/', productCtrl.getAll);
router.get('/:id', productCtrl.getById);

// === Chỉ Admin mới được tạo/sửa/xóa ===
router.post('/', requireAdmin, productCtrl.create);
router.put('/:id', requireAdmin, productCtrl.update);
router.delete('/:id', requireAdmin, productCtrl.remove);

export default router;
