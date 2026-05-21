import { Router } from 'express';
import * as txnCtrl from '../controllers/transaction.controller';

const router = Router();

// GET /api/transactions       - Xem danh sách lịch sử giao dịch
// GET /api/transactions/stats - Thống kê doanh thu theo phương thức thanh toán

router.get('/', txnCtrl.getAll);
router.get('/stats', txnCtrl.getStats);

export default router;
