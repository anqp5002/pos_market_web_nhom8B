import { Router } from 'express';
import * as employeeCtrl from '../controllers/employee.controller';
import { roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

import prisma from '../config/db';

router.get('/debug-db', async (req, res) => {
  try {
    const pkCheck: any = await prisma.$queryRaw`
      SELECT tc.constraint_name, tc.table_name
      FROM information_schema.table_constraints tc
      WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = 'NhanVien';
    `;
    const uniqueCheck: any = await prisma.$queryRaw`
      SELECT tc.constraint_name, tc.table_name
      FROM information_schema.table_constraints tc
      WHERE tc.constraint_type = 'UNIQUE' AND tc.table_name = 'NhanVien';
    `;
    
    // Auto-fix missing PK
    if (pkCheck.length === 0) {
      await prisma.$queryRaw`ALTER TABLE "NhanVien" ADD PRIMARY KEY ("id");`;
    }
    // Auto-fix missing UNIQUE
    if (uniqueCheck.length === 0) {
      await prisma.$queryRaw`ALTER TABLE "NhanVien" ADD CONSTRAINT "NhanVien_username_key" UNIQUE ("username");`;
    }

    res.json({ pkCheck, uniqueCheck, fixed: pkCheck.length === 0 || uniqueCheck.length === 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// === Cả Admin + Cashier đều được xem ===
// (không có route nào)

// === Tất cả route employee đều cần quyền Admin ===
// authMiddleware đã được gắn ở server.ts rồi
router.get('/roles/all', roleMiddleware('Admin'), employeeCtrl.getRoles);
router.get('/', roleMiddleware('Admin'), employeeCtrl.getAll);
router.get('/:id', roleMiddleware('Admin'), employeeCtrl.getById);
router.post('/', roleMiddleware('Admin'), employeeCtrl.create);
router.put('/:id', roleMiddleware('Admin'), employeeCtrl.update);
router.delete('/:id', roleMiddleware('Admin'), employeeCtrl.remove);

export default router;
