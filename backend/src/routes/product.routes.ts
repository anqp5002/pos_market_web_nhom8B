import { Router } from 'express';
import * as productCtrl from '../controllers/product.controller';

const router = Router();

// GET    /api/products              - Danh sách SP (search, filter, pagination)
// GET    /api/products/:id          - Chi tiết SP
// GET    /api/products/barcode/:code - Tìm SP theo barcode (FR-07, FR-09)
// POST   /api/products              - Tạo SP mới
// PUT    /api/products/:id          - Cập nhật SP
// DELETE /api/products/:id          - Xóa SP

router.get('/', productCtrl.getAll);
router.get('/barcode/:code', productCtrl.getByBarcode);
router.get('/:id', productCtrl.getById);
router.post('/', productCtrl.create);
router.put('/:id', productCtrl.update);
router.delete('/:id', productCtrl.remove);

export default router;
