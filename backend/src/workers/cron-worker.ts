import cron from 'node-cron';
import { IngestWorker } from '../services/ingest-worker';

export class CronWorker {
  private ingestWorker: IngestWorker;
  
  constructor() {
    this.ingestWorker = new IngestWorker();
  }
  
  start() {
    // 매 1분마다 대기 중인 제출 처리
    cron.schedule('* * * * *', async () => {
      try {
        await this.ingestWorker.processPendingSubmissions(10);
      } catch (error) {
        console.error('Error in cron job:', error);
      }
    });
    
    console.log('Cron worker started');
  }
}

