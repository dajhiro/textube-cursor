import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://textube:textube_dev@localhost:5432/textube',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  objectStorage: {
    endpoint: process.env.OBJECT_STORAGE_ENDPOINT || 'http://localhost:9000',
    accessKey: process.env.OBJECT_STORAGE_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.OBJECT_STORAGE_SECRET_KEY || 'minioadmin',
    bucket: process.env.OBJECT_STORAGE_BUCKET || 'textube',
  },
  
  allowedDomains: [
    'youtube.com',
    'youtu.be',
    'reddit.com',
    'stackoverflow.com',
    'stackexchange.com',
    // 추가 허용 도메인은 여기에
  ],
  
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.AI_MODEL || 'gpt-4',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};

