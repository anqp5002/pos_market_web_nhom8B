import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';

const router = Router();

// GET /api/customers?search=&page=&limit=
router.get('/', customerController.getAll);

// GET /api/customers/phone/:phone — tìm nhanh theo SĐT (dùng trong POS)
router.get('/phone/:phone', customerController.getByPhone);

// GET /api/customers/:id
router.get('/:id', customerController.getById);

// POST /api/customers
router.post('/', customerController.create);

// PUT /api/customers/:id
router.put('/:id', customerController.update);

// DELETE /api/customers/:id
router.delete('/:id', customerController.remove);

export default router;
