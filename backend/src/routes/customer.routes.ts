import { Router } from 'express';
import prisma from '../config/prisma';

const router = Router();

// GET /api/customers - Lấy danh sách khách hàng mẫu
router.get('/', async (req, res) => {
  try {
    const customers = await prisma.khachHang.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(customers);
  } catch (err: any) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Lỗi lấy danh sách khách hàng' });
  }
});

export default router;
