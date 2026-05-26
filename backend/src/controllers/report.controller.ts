import { Request, Response } from 'express';
import * as reportService from '../services/report.service';

/**
 * GET /api/reports/dashboard?period=today|week|month|year
 * FR-24: Thống kê tổng quan Dashboard
 */
export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as string) || 'today';
    const stats = await reportService.getDashboardStats(period);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ success: false, message: 'Lỗi lấy thống kê dashboard' });
  }
};

/**
 * GET /api/reports/sales-chart?days=7
 * FR-24: Dữ liệu biểu đồ doanh thu theo ngày
 */
export const getSalesChart = async (req: Request, res: Response): Promise<void> => {
  try {
    const days = Number(req.query.days) || 7;
    const chartData = await reportService.getSalesChart(days);
    res.json({ success: true, data: chartData });
  } catch (err: any) {
    console.error('Error fetching sales chart:', err);
    res.status(500).json({ success: false, message: 'Lỗi lấy dữ liệu biểu đồ' });
  }
};

/**
 * GET /api/reports/top-products?limit=10&days=30
 * FR-24: Top sản phẩm bán chạy (Sprint 6 version - hỗ trợ days)
 */
export const getTopProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 10;
    const days = Number(req.query.days) || 30;
    const topProducts = await reportService.getTopProducts(limit, days);
    res.json({ success: true, data: topProducts });
  } catch (err: any) {
    console.error('Error fetching top products:', err);
    res.status(500).json({ success: false, message: 'Lỗi lấy top sản phẩm' });
  }
};

// GET /api/reports/daily (Sprint 5)
export const getDaily = async (req: Request, res: Response) => {
  try {
    const stats = await reportService.getDailyStats();
    res.json(stats);
  } catch (err: any) {
    console.error('Error fetching daily reports:', err);
    res.status(500).json({ error: 'Lỗi lấy báo cáo doanh thu hàng ngày' });
  }
};

// GET /api/reports/period (Sprint 5)
export const getPeriod = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Vui lòng cung cấp startDate và endDate (YYYY-MM-DD)' });
      return;
    }
    const stats = await reportService.getPeriodStats(startDate as string, endDate as string);
    res.json(stats);
  } catch (err: any) {
    console.error('Error fetching period reports:', err);
    res.status(500).json({ error: 'Lỗi lấy báo cáo doanh thu theo chu kỳ' });
  }
};

// GET /api/reports/export (Sprint 5)
export const exportReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const csvContent = await reportService.exportCSV(
      startDate ? String(startDate) : undefined,
      endDate ? String(endDate) : undefined
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=bao_cao_doanh_thu.csv');
    res.status(200).send(csvContent);
  } catch (err: any) {
    console.error('Error exporting report:', err);
    res.status(500).json({ error: 'Lỗi xuất file báo cáo' });
  }
};
