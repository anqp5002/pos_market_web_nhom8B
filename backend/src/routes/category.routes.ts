import { Router } from 'express';
import * as categoryCtrl from '../controllers/category.controller';

const router = Router();

// GET    /api/categories     - Danh sách danh mục
// GET    /api/categories/:id - Chi tiết danh mục
// POST   /api/categories     - Tạo danh mục
// PUT    /api/categories/:id - Sửa danh mục
// DELETE /api/categories/:id - Xóa danh mục

router.get('/', categoryCtrl.getAll);
router.get('/:id', categoryCtrl.getById);
router.post('/', categoryCtrl.create);
router.put('/:id', categoryCtrl.update);
router.delete('/:id', categoryCtrl.remove);

export default router;
