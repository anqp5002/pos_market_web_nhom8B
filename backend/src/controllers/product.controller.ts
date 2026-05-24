import { Request, Response } from 'express';
import * as productService from '../services/product.service';

// GET /api/products
export const getAll = async (req: Request, res: Response) => {
  try {
    const { search, categoryId, page, limit } = req.query;
    const result = await productService.findAll({
      search: search as string,
      categoryId: categoryId ? Number(categoryId) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.json(result);
  } catch (err) {
    console.error('Error getAll products:', err);
    res.status(500).json({ error: 'Lỗi lấy danh sách sản phẩm' });
  }
};

// GET /api/products/:id
export const getById = async (req: Request, res: Response) => {
  try {
    const product = await productService.findById(Number(req.params.id));
    if (!product) {
      res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
      return;
    }
    res.json(product);
  } catch (err) {
    console.error('Error getById product:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// GET /api/products/barcode/:code (FR-07, FR-09)
export const getByBarcode = async (req: Request, res: Response) => {
  try {
    const product = await productService.findByBarcode(req.params.code as string);
    if (!product) {
      res.status(404).json({ error: 'Barcode không tồn tại' });
      return;
    }
    res.json(product);
  } catch (err) {
    console.error('Error getByBarcode:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// POST /api/products
export const create = async (req: Request, res: Response) => {
  try {
    const { barcode, name, price, stock, categoryId } = req.body;
    const product = await productService.create({
      barcode,
      name,
      price: Number(price),
      stock: Number(stock),
      categoryId: Number(categoryId),
    });
    res.status(201).json(product);
  } catch (err: any) {
    console.error('Error create product:', err);
    if (err.code === 'P2002') {
      res.status(400).json({ error: 'Barcode đã tồn tại' });
      return;
    }
    res.status(400).json({ error: 'Lỗi tạo sản phẩm' });
  }
};

// PUT /api/products/:id
export const update = async (req: Request, res: Response) => {
  try {
    const { barcode, name, price, stock, categoryId } = req.body;
    const data: any = {};
    if (barcode !== undefined) data.barcode = barcode;
    if (name !== undefined) data.name = name;
    if (price !== undefined) data.price = Number(price);
    if (stock !== undefined) data.stock = Number(stock);
    if (categoryId !== undefined) data.categoryId = Number(categoryId);

    const product = await productService.update(Number(req.params.id), data);
    res.json(product);
  } catch (err: any) {
    console.error('Error update product:', err);
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
      return;
    }
    if (err.code === 'P2002') {
      res.status(400).json({ error: 'Barcode đã tồn tại' });
      return;
    }
    res.status(400).json({ error: 'Lỗi cập nhật sản phẩm' });
  }
};

// DELETE /api/products/:id
export const remove = async (req: Request, res: Response) => {
  try {
    await productService.remove(Number(req.params.id));
    res.json({ message: 'Đã xóa sản phẩm thành công' });
  } catch (err: any) {
    console.error('Error delete product:', err);
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
      return;
    }
    res.status(400).json({ error: 'Không thể xóa sản phẩm (có thể đang được sử dụng)' });
  }
};
