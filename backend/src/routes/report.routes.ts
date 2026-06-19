import { Router } from 'express';
import * as reportCtrl from '../controllers/report.controller';

const router = Router();

// GET /api/reports/dashboard?period=today|week|month|year
router.get('/dashboard', reportCtrl.getDashboard);

// GET /api/reports/sales-chart?days=7
router.get('/sales-chart', reportCtrl.getSalesChart);

// GET /api/reports/top-products?limit=10&days=30
router.get('/top-products', reportCtrl.getTopProducts);

// GET /api/reports/enhanced-dashboard - Dashboard nâng cao (tiền mặt/chuyển khoản, VAT, tháng)
router.get('/enhanced-dashboard', reportCtrl.getEnhancedDashboard);

// GET /api/reports/today-shifts - Báo cáo ca làm việc hôm nay
router.get('/today-shifts', reportCtrl.getTodayShifts);

// GET /api/reports/daily        - Báo cáo doanh thu hàng ngày
router.get('/daily', reportCtrl.getDaily);

// GET /api/reports/period       - Báo cáo doanh thu theo chu kỳ (startDate, endDate)
router.get('/period', reportCtrl.getPeriod);

// GET /api/reports/export       - Xuất báo cáo doanh thu ra CSV/Excel
router.get('/export', reportCtrl.exportReport);

export default router;
