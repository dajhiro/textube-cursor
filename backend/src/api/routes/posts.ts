import { Router } from 'express';
import { db } from '../../db/client';

const router = Router();

// 게시글 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 게시글 조회
    const postResult = await db.query(
      `SELECT * FROM posts WHERE id = $1`,
      [id]
    );
    
    if (postResult.rows.length === 0) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    
    const post = postResult.rows[0];
    
    // 관련 데이터 조회
    const [links, attempts, comments, sourceMetadata, classification] = await Promise.all([
      db.query(`SELECT * FROM post_links WHERE post_id = $1`, [id]),
      db.query(`SELECT * FROM post_attempts WHERE post_id = $1`, [id]),
      db.query(`SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at DESC`, [id]),
      db.query(`SELECT * FROM source_metadata WHERE post_id = $1 LIMIT 1`, [id]),
      db.query(`SELECT * FROM taxonomy_classifications WHERE post_id = $1 LIMIT 1`, [id]),
    ]);
    
    // 조회수 증가
    await db.query(
      `UPDATE posts SET view_count = view_count + 1 WHERE id = $1`,
      [id]
    );
    
    res.json({
      post,
      links: links.rows,
      attempts: attempts.rows,
      comments: comments.rows,
      sourceMetadata: sourceMetadata.rows[0] || null,
      classification: classification.rows[0] || null,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 게시글 목록 조회 (랭킹 기준)
router.get('/', async (req, res) => {
  try {
    const { limit = '20', offset = '0', sort = 'rank' } = req.query;
    
    let orderBy = 'rank_score DESC';
    if (sort === 'recent') {
      orderBy = 'created_at DESC';
    } else if (sort === 'views') {
      orderBy = 'view_count DESC';
    }
    
    const result = await db.query(
      `SELECT * FROM posts 
       ORDER BY ${orderBy}
       LIMIT $1 OFFSET $2`,
      [parseInt(limit as string), parseInt(offset as string)]
    );
    
    res.json({
      posts: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

