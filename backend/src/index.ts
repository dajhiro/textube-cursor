import app from './api';
import { config } from './config';
import { CronWorker } from './workers/cron-worker';

const PORT = config.port;

// 크론 워커 시작 (개발 환경에서는 선택적)
if (config.nodeEnv === 'production') {
  const cronWorker = new CronWorker();
  cronWorker.start();
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

