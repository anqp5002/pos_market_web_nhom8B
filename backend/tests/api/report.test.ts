import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/server';
import * as reportService from '../../src/services/report.service';
import * as aiUtil from '../../src/utils/ai';

// Mock report service and AI utility
jest.mock('../../src/services/report.service', () => ({
  getDailyStats: jest.fn(),
  getPeriodStats: jest.fn(),
  getTopSellingProducts: jest.fn(),
  exportCSV: jest.fn(),
}));

jest.mock('../../src/utils/ai', () => ({
  getAiSuggestions: jest.fn(),
}));

describe('API Integration Tests - Reports & AI Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('1. GET /api/reports/daily - Should return daily statistics', async () => {
    const mockDailyStats = {
      revenue: 19000,
      orderCounts: { PENDING: 0, COMPLETED: 1, CANCELLED: 1, TOTAL: 2 },
      avgOrderValue: 19000,
    };

    (reportService.getDailyStats as any).mockResolvedValue(mockDailyStats);

    const res = await request(app).get('/api/reports/daily');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockDailyStats);
    expect(reportService.getDailyStats).toHaveBeenCalled();
  });

  test('2. GET /api/reports/period - Should return period statistics', async () => {
    const mockPeriodStats = {
      chartData: [{ date: '2026-05-21', revenue: 19000, orderCount: 1 }],
      totalRevenue: 19000,
      totalOrders: 1,
    };

    (reportService.getPeriodStats as any).mockResolvedValue(mockPeriodStats);

    const res = await request(app)
      .get('/api/reports/period')
      .query({ startDate: '2026-05-20', endDate: '2026-05-22' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockPeriodStats);
    expect(reportService.getPeriodStats).toHaveBeenCalledWith('2026-05-20', '2026-05-22');
  });

  test('3. GET /api/reports/period - Should return 400 if dates are missing', async () => {
    const res = await request(app).get('/api/reports/period');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Vui lòng cung cấp startDate và endDate (YYYY-MM-DD)');
  });

  test('4. GET /api/reports/export - Should return CSV file attachment', async () => {
    const mockCSV = '\uFEFFMã đơn hàng,Ngày tạo,Thu ngân,Khách hàng,Tổng tiền (₫),Trạng thái\n1,15:58:05 21/5/2026,Quản Trị Viên,Nguyễn Văn An,19000,COMPLETED\n';

    (reportService.exportCSV as any).mockResolvedValue(mockCSV);

    const res = await request(app).get('/api/reports/export');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('attachment; filename=bao_cao_doanh_thu.csv');
    expect(res.text).toBe(mockCSV);
  });

  test('5. POST /api/ai/suggest - Should return AI cross-selling recommendations', async () => {
    const mockSuggestions = {
      suggestions: [
        { name: 'Xúc xích Vissan 175g', reason: 'Ăn kèm mì ăn liền siêu ngon' },
      ],
    };

    (aiUtil.getAiSuggestions as any).mockResolvedValue(mockSuggestions);

    const res = await request(app)
      .post('/api/ai/suggest')
      .send({ cartItems: [{ name: 'Mì Hảo Hảo' }] });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockSuggestions);
    expect(aiUtil.getAiSuggestions).toHaveBeenCalledWith([{ name: 'Mì Hảo Hảo' }]);
  });
});
