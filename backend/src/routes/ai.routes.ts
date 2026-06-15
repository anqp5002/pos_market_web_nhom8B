import { Router } from 'express';
import * as aiCtrl from '../controllers/ai.controller';

const router = Router();

// POST /api/ai/suggest - Gợi ý sản phẩm mua kèm từ AI
router.post('/suggest', aiCtrl.getSuggestions);

// POST /api/ai/chat - Trợ lý ảo AI
router.post('/chat', aiCtrl.getChatbotResponse);

export default router;
