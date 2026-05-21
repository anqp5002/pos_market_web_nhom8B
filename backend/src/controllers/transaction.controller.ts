import { Request, Response } from 'express';
import * as txnService from '../services/transaction.service';

// GET /api/transactions
export const getAll = async (req: Request, res: Response) => {
  try {
    const { caLamViecId, ptttId, donHangId, status, page, limit } = req.query;
    const result = await txnService.getTransactions({
      caLamViecId: caLamViecId ? Number(caLamViecId) : undefined,
      ptttId: ptttId ? Number(ptttId) : undefined,
      donHangId: donHangId ? Number(donHangId) : undefined,
      status: status as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.json(result);
  } catch (err: any) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Lỗi lấy lịch sử giao dịch' });
  }
};

// GET /api/transactions/stats
export const getStats = async (req: Request, res: Response) => {
  try {
    const { caLamViecId } = req.query;
    const stats = await txnService.getPaymentStats(
      caLamViecId ? Number(caLamViecId) : undefined
    );
    res.json(stats);
  } catch (err: any) {
    console.error('Error fetching payment stats:', err);
    res.status(500).json({ error: 'Lỗi lấy thống kê doanh thu giao dịch' });
  }
};
