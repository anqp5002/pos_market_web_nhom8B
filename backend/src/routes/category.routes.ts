import { Router } from 'express';
import * as categoryCtrl from '../controllers/category.controller';
import { roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

// === Cả Admin + Cashier đều được xem ===
router.get('/', categoryCtrl.getAll);
router.get('/:id', categoryCtrl.getById);

// === Chỉ Admin mới được tạo/sửa/xóa ===
router.post('/', roleMiddleware('Admin'), categoryCtrl.create);
router.put('/:id', roleMiddleware('Admin'), categoryCtrl.update);
router.delete('/:id', roleMiddleware('Admin'), categoryCtrl.remove);

export default router;
