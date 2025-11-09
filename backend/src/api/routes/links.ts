import { Router } from 'express';
import { LinkService } from '../../services/link-service';
import { SubmitLinkRequest } from '@textube/shared';
import { z } from 'zod';

const router = Router();
const linkService = new LinkService();

// TODO: 인증 미들웨어 추가
const authMiddleware = (req: any, res: any, next: any) => {
  // 임시: 사용자 ID를 헤더에서 가져옴
  req.userId = req.headers['x-user-id'] || 'temp-user-id';
  next();
};

const submitLinkSchema = z.object({
  url: z.string().url(),
  note: z.string().optional(),
});

router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const body = submitLinkSchema.parse(req.body);
    
    const result = await linkService.submitLink(userId, body);
    
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request', details: error.errors });
      return;
    }
    
    console.error('Error submitting link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

