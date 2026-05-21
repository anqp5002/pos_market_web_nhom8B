import { Request, Response } from 'express';
import * as aiUtil from '../utils/ai';

// POST /api/ai/suggest
export const getSuggestions = async (req: Request, res: Response) => {
  try {
    const { cartItems } = req.body;
    if (!cartItems || !Array.isArray(cartItems)) {
      res.status(400).json({ error: 'cartItems phải là một mảng các mặt hàng' });
      return;
    }

    const suggestions = await aiUtil.getAiSuggestions(cartItems);
    res.json(suggestions);
  } catch (err: any) {
    console.error('Error in AI suggest controller:', err);
    res.status(500).json({ error: 'Lỗi lấy gợi ý từ AI' });
  }
};
