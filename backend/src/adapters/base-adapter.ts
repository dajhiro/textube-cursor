import { SourceType, SourceMetadata } from '@textube/shared';

export interface FetchedContent {
  title: string;
  body: string;
  metadata: Record<string, any>;
  engagementSignals: {
    likes?: number;
    upvotes?: number;
    views?: number;
    comments?: number;
  };
}

export abstract class BaseAdapter {
  abstract sourceType: SourceType;
  
  /**
   * URL에서 콘텐츠를 가져옴
   */
  abstract fetchContent(url: string): Promise<FetchedContent>;
  
  /**
   * 외부 ID 추출 (YouTube videoId, Reddit id, etc.)
   */
  abstract extractExternalId(url: string): string | null;
}

