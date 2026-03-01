/**
 * 키워드 알림: 등록한 키워드가 근처 나눔 글 제목/내용에 포함된 새 글이 올라오면 벨 알림
 * - 키워드 목록·미확인 알림은 localStorage에 저장
 */

const KEYWORD_ALERT_KEYWORDS = 'keyword_alert_keywords';
const KEYWORD_ALERT_UNSEEN = 'keyword_alert_unseen';

export interface KeywordAlertItem {
  postId: string;
  title: string;
  keyword: string;
  createdAt: string;
}

export function getKeywordAlertKeywords(): string[] {
  try {
    const raw = localStorage.getItem(KEYWORD_ALERT_KEYWORDS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((k: unknown) => typeof k === 'string' && k.trim()) : [];
  } catch {
    return [];
  }
}

export function setKeywordAlertKeywords(keywords: string[]): void {
  const list = keywords.map((k) => k.trim()).filter(Boolean);
  localStorage.setItem(KEYWORD_ALERT_KEYWORDS, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('keyword-alert-keywords-changed'));
}

export function getKeywordAlertUnseen(): KeywordAlertItem[] {
  try {
    const raw = localStorage.getItem(KEYWORD_ALERT_UNSEEN);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addKeywordAlertUnseen(item: KeywordAlertItem): void {
  const list = getKeywordAlertUnseen();
  if (list.some((a) => a.postId === item.postId && a.keyword === item.keyword)) return;
  list.unshift(item);
  localStorage.setItem(KEYWORD_ALERT_UNSEEN, JSON.stringify(list.slice(0, 50)));
  window.dispatchEvent(new CustomEvent('keyword-alert-updated'));
}

export function markKeywordAlertSeen(postId: string): void {
  const list = getKeywordAlertUnseen().filter((a) => a.postId !== postId);
  localStorage.setItem(KEYWORD_ALERT_UNSEEN, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('keyword-alert-updated'));
}

export function markAllKeywordAlertsSeen(): void {
  localStorage.setItem(KEYWORD_ALERT_UNSEEN, '[]');
  window.dispatchEvent(new CustomEvent('keyword-alert-updated'));
}
