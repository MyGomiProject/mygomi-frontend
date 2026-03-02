/** 나눔 글 카테고리 키 (API와 동일) */
export type SharePostCategoryKey =
  | 'FURNITURE'
  | 'ELECTRONICS'
  | 'CLOTHING'
  | 'BOOKS'
  | 'TOYS'
  | 'KITCHEN'
  | 'ETC';

export const SHARE_POST_CATEGORIES: Record<
  SharePostCategoryKey,
  { label: string; emoji: string }
> = {
  FURNITURE: { label: '가구', emoji: '🛋️' },
  ELECTRONICS: { label: '전자제품', emoji: '📱' },
  CLOTHING: { label: '의류', emoji: '👕' },
  BOOKS: { label: '도서', emoji: '📚' },
  TOYS: { label: '장난감', emoji: '🧸' },
  KITCHEN: { label: '주방용품', emoji: '🍳' },
  ETC: { label: '기타', emoji: '📦' },
};

/** 카테고리 키로 한글 라벨 반환 */
export function getCategoryLabel(category: string): string {
  const entry = SHARE_POST_CATEGORIES[category as SharePostCategoryKey];
  return entry?.label ?? category;
}

/** 카테고리 키로 이모지 반환 */
export function getCategoryEmoji(category: string): string {
  const entry = SHARE_POST_CATEGORIES[category as SharePostCategoryKey];
  return entry?.emoji ?? '📦';
}
