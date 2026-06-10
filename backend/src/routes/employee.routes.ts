import { Router } from 'express';
import * as employeeCtrl from '../controllers/employee.controller';
import { roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

// === Tất cả route employee đều cần quyền Admin ===
// authMiddleware đã được gắn ở server.ts rồi
router.get('/roles/all', roleMiddleware('Admin'), employeeCtrl.getRoles);
router.get('/', roleMiddleware('Admin'), employeeCtrl.getAll);
router.get('/:id', roleMiddleware('Admin'), employeeCtrl.getById);
router.post('/', roleMiddleware('Admin'), employeeCtrl.create);
router.put('/:id', roleMiddleware('Admin'), employeeCtrl.update);
router.delete('/:id', roleMiddleware('Admin'), employeeCtrl.remove);

export default router;
