import { Router } from 'express';
import { db } from '../../db/client';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// TODO: 인증 미들웨어
const authMiddleware = (req: any, res: any, next: any) => {
  req.userId = req.headers['x-user-id'] || 'temp-user-id';
  next();
};

const createCommentSchema = z.object({
  postId: z.string().uuid(),
  body: z.string().min(1),
  parentCommentId: z.string().uuid().optional(),
  lang: z.string().default('ko'),
});

// 댓글 작성
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const body = createCommentSchema.parse(req.body);
    
    const id = uuidv4();
    await db.query(
      `INSERT INTO comments (id, post_id, user_id, parent_comment_id, body, lang)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, body.postId, userId, body.parentCommentId || null, body.body, body.lang]
    );
    
    res.json({ id, ...body });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request', details: error.errors });
      return;
    }
    
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

