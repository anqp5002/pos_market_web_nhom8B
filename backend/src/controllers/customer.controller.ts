import { Request, Response } from 'express';
import * as customerService from '../services/customer.service';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customer.validator';
import { ZodError } from 'zod';

// GET /api/customers
export const getAll = async (req: Request, res: Response) => {
  try {
    const { search, page, limit } = req.query;
    const result = await customerService.findAll({
      search: search as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.json(result);
  } catch (err) {
    console.error('Error getAll customers:', err);
    res.status(500).json({ error: 'Lỗi lấy danh sách khách hàng' });
  }
};

// GET /api/customers/:id
export const getById = async (req: Request, res: Response) => {
  try {
    const customer = await customerService.findById(Number(req.params.id));
    if (!customer) {
      res.status(404).json({ error: 'Không tìm thấy khách hàng' });
      return;
    }
    res.json(customer);
  } catch (err) {
    console.error('Error getById customer:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// GET /api/customers/phone/:phone (dùng trong màn hình POS để tìm KH nhanh)
export const getByPhone = async (req: Request, res: Response) => {
  try {
    const customer = await customerService.findByPhone(req.params.phone as string);
    if (!customer) {
      res.status(404).json({ error: 'Không tìm thấy khách hàng với số điện thoại này' });
      return;
    }
    res.json(customer);
  } catch (err) {
    console.error('Error getByPhone customer:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// POST /api/customers — Validate bằng Zod schema
export const create = async (req: Request, res: Response) => {
  try {
    const parsed = createCustomerSchema.parse(req.body);
    const customer = await customerService.create({
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email,
    });
    res.status(201).json(customer);
  } catch (err: any) {
    if (err instanceof ZodError) {
      const messages = err.errors.map((e) => e.message).join(', ');
      res.status(400).json({ error: messages });
      return;
    }
    console.error('Error create customer:', err);
    if (err.code === 'P2002') {
      res.status(400).json({ error: 'Số điện thoại đã được đăng ký' });
      return;
    }
    res.status(400).json({ error: 'Lỗi tạo khách hàng' });
  }
};

// PUT /api/customers/:id — Validate bằng Zod schema
export const update = async (req: Request, res: Response) => {
  try {
    const parsed = updateCustomerSchema.parse(req.body);
    const data: any = {};
    if (parsed.name !== undefined) data.name = parsed.name;
    if (parsed.phone !== undefined) data.phone = parsed.phone;
    if (parsed.email !== undefined) data.email = parsed.email;

    const customer = await customerService.update(Number(req.params.id), data);
    res.json(customer);
  } catch (err: any) {
    if (err instanceof ZodError) {
      const messages = err.errors.map((e) => e.message).join(', ');
      res.status(400).json({ error: messages });
      return;
    }
    console.error('Error update customer:', err);
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Không tìm thấy khách hàng' });
      return;
    }
    if (err.code === 'P2002') {
      res.status(400).json({ error: 'Số điện thoại đã được đăng ký' });
      return;
    }
    res.status(400).json({ error: 'Lỗi cập nhật khách hàng' });
  }
};

// DELETE /api/customers/:id
export const remove = async (req: Request, res: Response) => {
  try {
    await customerService.remove(Number(req.params.id));
    res.json({ message: 'Đã xóa khách hàng thành công' });
  } catch (err: any) {
    console.error('Error delete customer:', err);
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Không tìm thấy khách hàng' });
      return;
    }
    res.status(400).json({ error: 'Không thể xóa khách hàng (có thể đang có đơn hàng liên quan)' });
  }
};
