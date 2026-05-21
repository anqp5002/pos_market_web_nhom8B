import { Request, Response } from 'express';
import * as orderService from '../services/order.service';

// POST /api/orders
export const create = async (req: Request, res: Response) => {
  try {
    const order = await orderService.createOrder(req.body);
    res.status(201).json(order);
  } catch (err: any) {
    console.error('Error creating order:', err);
    res.status(400).json({ error: err.message || 'Lỗi tạo đơn hàng' });
  }
};

// GET /api/orders
export const getAll = async (req: Request, res: Response) => {
  try {
    const { status, nhanVienId, khachHangId, caLamViecId, page, limit } = req.query;
    const result = await orderService.findManyOrders({
      status: status as string,
      nhanVienId: nhanVienId ? Number(nhanVienId) : undefined,
      khachHangId: khachHangId ? Number(khachHangId) : undefined,
      caLamViecId: caLamViecId ? Number(caLamViecId) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.json(result);
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Lỗi lấy danh sách đơn hàng' });
  }
};

// GET /api/orders/:id
export const getById = async (req: Request, res: Response) => {
  try {
    const order = await orderService.findOrderById(Number(req.params.id));
    if (!order) {
      res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
      return;
    }
    res.json(order);
  } catch (err: any) {
    console.error('Error fetching order by ID:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// PATCH /api/orders/:id/status
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'COMPLETED', 'CANCELLED'].includes(status)) {
      res.status(400).json({ error: 'Trạng thái đơn hàng không hợp lệ' });
      return;
    }
    const order = await orderService.updateOrderStatus(Number(req.params.id), status);
    res.json(order);
  } catch (err: any) {
    console.error('Error updating order status:', err);
    res.status(400).json({ error: err.message || 'Lỗi cập nhật trạng thái đơn hàng' });
  }
};

// POST /api/orders/:id/pay
export const pay = async (req: Request, res: Response) => {
  try {
    const result = await orderService.processPayment(Number(req.params.id), req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Error processing payment:', err);
    res.status(400).json({ error: err.message || 'Lỗi xử lý thanh toán' });
  }
};
