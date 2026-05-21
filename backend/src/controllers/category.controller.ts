import { Request, Response } from 'express';
import * as categoryService from '../services/category.service';

// GET /api/categories
export const getAll = async (_req: Request, res: Response) => {
  try {
    const categories = await categoryService.findAll();
    res.json(categories);
  } catch (err) {
    console.error('Error getAll categories:', err);
    res.status(500).json({ error: 'Lỗi lấy danh sách danh mục' });
  }
};

// GET /api/categories/:id
export const getById = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.findById(Number(req.params.id));
    if (!category) {
      res.status(404).json({ error: 'Không tìm thấy danh mục' });
      return;
    }
    res.json(category);
  } catch (err) {
    console.error('Error getById category:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// POST /api/categories
export const create = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Tên danh mục là bắt buộc' });
      return;
    }
    const category = await categoryService.create(name.trim());
    res.status(201).json(category);
  } catch (err: any) {
    console.error('Error create category:', err);
    if (err.code === 'P2002') {
      res.status(400).json({ error: 'Tên danh mục đã tồn tại' });
      return;
    }
    res.status(400).json({ error: 'Lỗi tạo danh mục' });
  }
};

// PUT /api/categories/:id
export const update = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Tên danh mục là bắt buộc' });
      return;
    }
    const category = await categoryService.update(Number(req.params.id), name.trim());
    res.json(category);
  } catch (err: any) {
    console.error('Error update category:', err);
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Không tìm thấy danh mục' });
      return;
    }
    res.status(400).json({ error: 'Lỗi cập nhật danh mục' });
  }
};

// DELETE /api/categories/:id
export const remove = async (req: Request, res: Response) => {
  try {
    await categoryService.remove(Number(req.params.id));
    res.json({ message: 'Đã xóa danh mục thành công' });
  } catch (err: any) {
    console.error('Error delete category:', err);
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Không tìm thấy danh mục' });
      return;
    }
    res.status(400).json({ error: 'Không thể xóa (danh mục đang có sản phẩm)' });
  }
};
