import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import linksRouter from './routes/links';
import postsRouter from './routes/posts';
import commentsRouter from './routes/comments';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/links', linksRouter);
app.use('/api/posts', postsRouter);
app.use('/api/comments', commentsRouter);

export default app;

