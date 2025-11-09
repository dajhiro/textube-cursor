import { SourceType } from '@textube/shared';

/**
 * URL 정규화 유틸리티
 */
export class URLNormalizer {
  /**
   * URL을 정규화하고 소스 타입을 감지
   */
  static normalize(url: string): { normalized: string; sourceType: SourceType } {
    try {
      const urlObj = new URL(url);
      
      // YouTube 처리
      if (urlObj.hostname === 'youtube.com' || urlObj.hostname === 'www.youtube.com') {
        const videoId = urlObj.searchParams.get('v');
        if (videoId) {
          return {
            normalized: `https://www.youtube.com/watch?v=${videoId}`,
            sourceType: SourceType.YOUTUBE,
          };
        }
      }
      
      if (urlObj.hostname === 'youtu.be') {
        const videoId = urlObj.pathname.slice(1);
        if (videoId) {
          return {
            normalized: `https://www.youtube.com/watch?v=${videoId}`,
            sourceType: SourceType.YOUTUBE,
          };
        }
      }
      
      // Reddit 처리
      if (urlObj.hostname === 'reddit.com' || urlObj.hostname === 'www.reddit.com') {
        // permalink 정규화 (쿼리 파라미터 제거)
        const path = urlObj.pathname;
        return {
          normalized: `https://www.reddit.com${path}`,
          sourceType: SourceType.REDDIT,
        };
      }
      
      // StackOverflow 처리
      if (urlObj.hostname === 'stackoverflow.com' || urlObj.hostname === 'www.stackoverflow.com') {
        // 질문 ID 추출
        const match = urlObj.pathname.match(/\/questions\/(\d+)/);
        if (match) {
          return {
            normalized: `https://stackoverflow.com/questions/${match[1]}`,
            sourceType: SourceType.STACKOVERFLOW,
          };
        }
      }
      
      // 일반 웹: 쿼리 파라미터 정리 (트래킹 파라미터 제거)
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
      trackingParams.forEach(param => {
        urlObj.searchParams.delete(param);
      });
      
      // 프래그먼트 제거
      urlObj.hash = '';
      
      return {
        normalized: urlObj.toString(),
        sourceType: SourceType.WEB,
      };
    } catch (error) {
      throw new Error(`Invalid URL: ${url}`);
    }
  }
  
  /**
   * 도메인 안전성 검사
   */
  static isAllowedDomain(url: string, allowedDomains: string[]): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace(/^www\./, '');
      
      return allowedDomains.some(domain => {
        return hostname === domain || hostname.endsWith(`.${domain}`);
      });
    } catch {
      return false;
    }
  }
  
  /**
   * URL이 안전한지 검사
   */
  static isSafe(url: string, allowedDomains: string[]): { safe: boolean; reason?: string } {
    try {
      const urlObj = new URL(url);
      
      // 프로토콜 검사
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { safe: false, reason: 'Unsafe protocol' };
      }
      
      // 도메인 검사
      if (!this.isAllowedDomain(url, allowedDomains)) {
        return { safe: false, reason: 'Domain not in allowlist' };
      }
      
      // 기본적인 위험 패턴 검사
      const suspiciousPatterns = [
        /\.exe$/i,
        /\.zip$/i,
        /\.rar$/i,
        /javascript:/i,
        /data:/i,
      ];
      
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(url)) {
          return { safe: false, reason: 'Suspicious URL pattern' };
        }
      }
      
      return { safe: true };
    } catch {
      return { safe: false, reason: 'Invalid URL format' };
    }
  }
}

