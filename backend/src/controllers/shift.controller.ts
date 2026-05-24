import { Request, Response } from 'express';
import * as shiftService from '../services/shift.service';

/**
 * POST /api/shifts/open
 * FR-04: Mở ca làm việc (nhập số dư đầu ca)
 */
export const openShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const nhanVienId = req.user?.userId;
    if (!nhanVienId) {
      res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
      return;
    }

    const { openingBalance } = req.body;
    if (openingBalance === undefined || openingBalance < 0) {
      res.status(400).json({ success: false, message: 'Vui lòng nhập số dư đầu ca hợp lệ' });
      return;
    }

    const shift = await shiftService.openShift(nhanVienId, Number(openingBalance));
    res.status(201).json({ success: true, data: shift });
  } catch (err: any) {
    console.error('Error opening shift:', err);
    res.status(400).json({ success: false, message: err.message || 'Lỗi mở ca' });
  }
};

/**
 * POST /api/shifts/:id/close
 * FR-05: Đóng ca làm việc (nhập tiền thực tế cuối ca)
 */
export const closeShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const shiftId = Number(req.params.id);
    const { closingBalance } = req.body;

    if (closingBalance === undefined || closingBalance < 0) {
      res.status(400).json({ success: false, message: 'Vui lòng nhập số tiền thực tế cuối ca' });
      return;
    }

    const result = await shiftService.closeShift(shiftId, Number(closingBalance));
    res.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Error closing shift:', err);
    res.status(400).json({ success: false, message: err.message || 'Lỗi đóng ca' });
  }
};

/**
 * GET /api/shifts/current
 * Lấy ca đang mở của nhân viên hiện tại
 */
export const getCurrentShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const nhanVienId = req.user?.userId;
    if (!nhanVienId) {
      res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
      return;
    }

    const shift = await shiftService.getCurrentShift(nhanVienId);
    res.json({ success: true, data: shift });
  } catch (err: any) {
    console.error('Error getting current shift:', err);
    res.status(500).json({ success: false, message: 'Lỗi lấy ca hiện tại' });
  }
};

/**
 * GET /api/shifts?nhanVienId=&status=&page=&limit=
 * Lấy lịch sử ca làm việc
 */
export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nhanVienId, status, page, limit } = req.query;
    const result = await shiftService.getShiftHistory({
      nhanVienId: nhanVienId ? Number(nhanVienId) : undefined,
      status: status as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Error fetching shift history:', err);
    res.status(500).json({ success: false, message: 'Lỗi lấy lịch sử ca' });
  }
};

/**
 * GET /api/shifts/low-stock?threshold=10
 * Lấy danh sách sản phẩm sắp hết hàng
 */
export const getLowStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const threshold = Number(req.query.threshold) || 10;
    const products = await shiftService.getLowStockProducts(threshold);
    res.json({ success: true, data: products });
  } catch (err: any) {
    console.error('Error fetching low stock:', err);
    res.status(500).json({ success: false, message: 'Lỗi lấy SP sắp hết hàng' });
  }
};
