import { Router, Request, Response } from 'express';
import prisma from '../config/db';

const router = Router();

// GET /api/products - Lấy danh sách sản phẩm (đã include category)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const products = await prisma.sanPham.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

export default router;
