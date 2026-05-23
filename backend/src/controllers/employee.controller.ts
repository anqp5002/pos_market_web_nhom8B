import { Request, Response } from 'express';
import * as employeeService from '../services/employee.service';

/**
 * GET /api/employees — Danh sách nhân viên
 */
export const getAll = async (_req: Request, res: Response) => {
  try {
    const employees = await employeeService.findAll();
    // Không trả password ra ngoài
    const safeData = employees.map(({ password, ...rest }) => rest);
    res.json({ success: true, data: safeData });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * GET /api/employees/:id — Chi tiết nhân viên
 */
export const getById = async (req: Request, res: Response) => {
  try {
    const employee = await employeeService.findById(Number(req.params.id));
    if (!employee) {
      res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
      return;
    }
    const { password, ...safeData } = employee;
    res.json({ success: true, data: safeData });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * POST /api/employees — Tạo nhân viên mới
 * FR-03: Admin cấp tài khoản
 */
export const create = async (req: Request, res: Response) => {
  try {
    const { username, password, fullName, roleId } = req.body;

    if (!username || !password || !fullName || !roleId) {
      res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
      return;
    }

    const employee = await employeeService.createEmployee({ username, password, fullName, roleId });
    const { password: _, ...safeData } = employee;
    res.status(201).json({ success: true, data: safeData });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Lỗi tạo nhân viên' });
  }
};

/**
 * PUT /api/employees/:id — Cập nhật nhân viên
 */
export const update = async (req: Request, res: Response) => {
  try {
    const employee = await employeeService.updateEmployee(Number(req.params.id), req.body);
    const { password, ...safeData } = employee;
    res.json({ success: true, data: safeData });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Lỗi cập nhật nhân viên' });
  }
};

/**
 * DELETE /api/employees/:id — Xóa nhân viên
 */
export const remove = async (req: Request, res: Response) => {
  try {
    await employeeService.deleteEmployee(Number(req.params.id));
    res.json({ success: true, message: 'Đã xóa nhân viên' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Lỗi xóa nhân viên' });
  }
};
