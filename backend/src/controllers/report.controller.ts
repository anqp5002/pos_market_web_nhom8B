import { Request, Response } from 'express';
import * as reportService from '../services/report.service';

// GET /api/reports/daily
export const getDaily = async (req: Request, res: Response) => {
  try {
    const stats = await reportService.getDailyStats();
    res.json(stats);
  } catch (err: any) {
    console.error('Error fetching daily reports:', err);
    res.status(500).json({ error: 'Lỗi lấy báo cáo doanh thu hàng ngày' });
  }
};

// GET /api/reports/period
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

// GET /api/reports/top-products
export const getTopProducts = async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const stats = await reportService.getTopSellingProducts(limit ? Number(limit) : 10);
    res.json(stats);
  } catch (err: any) {
    console.error('Error fetching top products:', err);
    res.status(500).json({ error: 'Lỗi lấy danh sách sản phẩm bán chạy' });
  }
};

// GET /api/reports/export
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
