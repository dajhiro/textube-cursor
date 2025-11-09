import { BaseAdapter } from './base-adapter';
import { YouTubeAdapter } from './youtube-adapter';
import { RedditAdapter } from './reddit-adapter';
import { StackOverflowAdapter } from './stackoverflow-adapter';
import { SourceType } from '@textube/shared';

const adapters: Map<SourceType, BaseAdapter> = new Map([
  [SourceType.YOUTUBE, new YouTubeAdapter()],
  [SourceType.REDDIT, new RedditAdapter()],
  [SourceType.STACKOVERFLOW, new StackOverflowAdapter()],
]);

export function getAdapter(sourceType: SourceType): BaseAdapter | null {
  return adapters.get(sourceType) || null;
}

export { BaseAdapter, YouTubeAdapter, RedditAdapter, StackOverflowAdapter };

