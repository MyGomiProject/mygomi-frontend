/* [src/constants/waste.ts] */
import { WasteType } from '../types/items'; // 타입 가져오기

// 2. yj이 작성한 타입들 그대로 유지
export const WASTE_TYPE_LABELS: Record<WasteType, { ko: string; ja: string; emoji: string; class: string }> = {
  BURNABLE: { ko: '가연성', ja: '可燃', emoji: '🔥', class: 'burnable' },
  NON_BURNABLE: { ko: '불연성', ja: '不燃', emoji: '🚫', class: 'non-burnable' },
  PLASTIC: { ko: '플라스틱', ja: 'プラスチック', emoji: '♻️', class: 'plastic' },
  CAN_BOTTLE: { ko: '병/캔', ja: 'びん・缶', emoji: '🥤', class: 'can-bottle' },
  PAPER: { ko: '종이', ja: '紙', emoji: '📄', class: 'paper' },
  SODAI: { ko: '대형 폐기물', ja: '粗大ごみ', emoji: '📦', class: 'sodai' },
};