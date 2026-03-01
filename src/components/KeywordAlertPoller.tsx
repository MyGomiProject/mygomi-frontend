import { useAuth } from '../contexts/AuthContext';
import { useKeywordAlertPolling } from '../hooks/useKeywordAlertPolling';

/**
 * 로그인된 사용자에 대해 키워드 알림용 근처 글 폴링을 실행한다.
 * App에 한 번만 마운트하면 된다.
 */
export default function KeywordAlertPoller() {
  const { token } = useAuth();
  useKeywordAlertPolling(!!token);
  return null;
}
