import { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sharePostApi, SharePostResponse } from '../api/sharePost';
import { getKeywordAlertKeywords } from '../utils/keywordAlert';
import { addKeywordAlertUnseen } from '../utils/keywordAlert';

function postMatchesKeyword(post: SharePostResponse, keyword: string): boolean {
  const k = keyword.trim().toLowerCase();
  if (!k) return false;
  const title = (post.title || '').toLowerCase();
  const content = (post.content || post.description || '').toLowerCase();
  return title.includes(k) || content.includes(k);
}

/**
 * 근처 나눔 글을 주기적으로 조회하고, 등록된 키워드가 제목/내용에 포함된 새 글이 있으면
 * 미확인 알림 목록에 추가하고 'keyword-alert-updated' 이벤트를 발생시킨다.
 * 키워드가 없거나 로그인하지 않았으면 폴링하지 않는다.
 */
export function useKeywordAlertPolling(enabled: boolean) {
  const [keywordsVersion, setKeywordsVersion] = useState(0);
  const keywords = getKeywordAlertKeywords();
  const knownPostIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    const handler = () => setKeywordsVersion((v) => v + 1);
    window.addEventListener('keyword-alert-keywords-changed', handler);
    return () => window.removeEventListener('keyword-alert-keywords-changed', handler);
  }, []);

  const { data } = useQuery({
    queryKey: ['keyword-alert-nearby', enabled, keywords.length, keywordsVersion],
    queryFn: () => sharePostApi.getNearbyPosts({ page: 0, size: 50 }),
    enabled: enabled && keywords.length > 0,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (!data?.data || !Array.isArray(data.data) || keywords.length === 0) return;

    const posts = data.data as SharePostResponse[];
    const openPosts = posts.filter(
      (p) => p.status === 'OPEN' || p.status === 'RESERVED'
    );

    if (isFirstLoadRef.current) {
      openPosts.forEach((p) => knownPostIdsRef.current.add(String(p.id)));
      isFirstLoadRef.current = false;
      return;
    }

    for (const post of openPosts) {
      const postId = String(post.id);
      if (knownPostIdsRef.current.has(postId)) continue;
      knownPostIdsRef.current.add(postId);

      for (const keyword of keywords) {
        if (postMatchesKeyword(post, keyword)) {
          addKeywordAlertUnseen({
            postId,
            title: post.title || '제목 없음',
            keyword: keyword.trim(),
            createdAt: new Date().toISOString(),
          });
          break;
        }
      }
    }
  }, [data, keywords]);
}
