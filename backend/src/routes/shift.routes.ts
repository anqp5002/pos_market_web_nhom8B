import { Router } from 'express';
import * as shiftCtrl from '../controllers/shift.controller';

const router = Router();

// POST /api/shifts/open — Mở ca mới (FR-04)
router.post('/open', shiftCtrl.openShift);

// GET  /api/shifts/current — Lấy ca đang mở
router.get('/current', shiftCtrl.getCurrentShift);

// GET  /api/shifts/low-stock — SP sắp hết hàng
router.get('/low-stock', shiftCtrl.getLowStock);

// POST /api/shifts/:id/close — Đóng ca (FR-05)
router.post('/:id/close', shiftCtrl.closeShift);

// GET  /api/shifts — Lịch sử ca làm việc
router.get('/', shiftCtrl.getHistory);

export default router;
