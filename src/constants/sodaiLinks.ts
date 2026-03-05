/**
 * 도쿄 23구 대형쓰레기(粗大ごみ) 접수 사이트 링크
 * 키: 구 이름 (한국어)
 * 값: 접수 사이트 URL
 */
const SODAI_LINKS: Record<string, string> = {
  // e-tumo 기반
  '치요다구': 'https://ecolife.e-tumo.jp/sodai.city.chiyoda-u/',
  '주오구': 'https://ecolife.e-tumo.jp/kankyo-chuo-tokyo-u/',
  '미나토구': 'https://ecolife.e-tumo.jp/sodai-minato-tokyo-u/',
  '다이토구': 'https://ecolife.e-tumo.jp/taitosodai-u/',
  '스기나미구': 'https://ecolife.e-tumo.jp/kankyo-suginami-tokyo-u/',
  '기타구': 'https://ecolife.e-tumo.jp/sodai-kita-tokyo-u/',
  '아다치구': 'https://ecolife.e-tumo.jp/sodai-adachi-u/',
  '이타바시구': 'https://ecolife.e-tumo.jp/itabashi_sodai-u/',
  '도시마구': 'https://ecolife.e-tumo.jp/toshima-sodai-u/',
  // 독자 시스템
  '신주쿠구': 'https://www.shinjuku-sodai.com/',
  // 시부야구는 콜센터/LINE 유도이므로 일단 보류.
};

// 매칭되는 링크가 없을 때 사용할 기본 통합 센터 링크
const DEFAULT_SODAI_LINK = 'https://tabunka.tokyo-tsunagari.or.jp/useful/guide_kor/life/04.html';

/**
 * 사용자의 구(ward)에 맞는 대형쓰레기 접수 링크를 반환합니다.
 * @param ward 사용자의 구 이름 (예: '치요다구')
 * @returns 해당 구의 접수 링크. 없으면 기본 통합 센터 링크.
 */
export const getSodaiLink = (ward?: string | null): string => {
  if (!ward) return DEFAULT_SODAI_LINK;
  return SODAI_LINKS[ward] || DEFAULT_SODAI_LINK;
};

