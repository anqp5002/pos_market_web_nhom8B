import { Router } from 'express';
import * as reportCtrl from '../controllers/report.controller';

const router = Router();

// GET /api/reports/dashboard?period=today|week|month|year
router.get('/dashboard', reportCtrl.getDashboard);

// GET /api/reports/sales-chart?days=7
router.get('/sales-chart', reportCtrl.getSalesChart);

// GET /api/reports/top-products?limit=10&days=30
router.get('/top-products', reportCtrl.getTopProducts);

export default router;
