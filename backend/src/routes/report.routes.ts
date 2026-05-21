import { Router } from 'express';
import * as reportCtrl from '../controllers/report.controller';

const router = Router();

// GET /api/reports/daily        - Báo cáo doanh thu hàng ngày
// GET /api/reports/period       - Báo cáo doanh thu theo chu kỳ (startDate, endDate)
// GET /api/reports/top-products - Top sản phẩm bán chạy nhất
// GET /api/reports/export       - Xuất báo cáo doanh thu ra CSV/Excel

router.get('/daily', reportCtrl.getDaily);
router.get('/period', reportCtrl.getPeriod);
router.get('/top-products', reportCtrl.getTopProducts);
router.get('/export', reportCtrl.exportReport);

export default router;
