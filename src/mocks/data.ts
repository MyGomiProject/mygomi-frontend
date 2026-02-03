// Mock 데이터 정의

import { UserAddress } from '../types/address';
import { Area } from '../types/area';

// 도쿄도 23구 목록
export const tokyoWards = [
  '千代田区',
  '中央区',
  '港区',
  '新宿区',
  '文京区',
  '台東区',
  '墨田区',
  '江東区',
  '品川区',
  '目黒区',
  '大田区',
  '世田谷区',
  '渋谷区',
  '中野区',
  '杉並区',
  '豊島区',
  '北区',
  '荒川区',
  '板橋区',
  '練馬区',
  '足立区',
  '葛飾区',
  '江戸川区',
];

// 한국어 구 목록 (AddressInputPage에서 사용)
export const tokyoWardsKo = [
  '오타구',
  '기타구',
  '에도가와구',
  '가쓰시카구',
  '이타바시구',
  '아다치구',
  '시나가와구',
  '미나토구',
  '네리마구',
  '시부야구',
  '치요다구',
  '주오구',
  '신주쿠구',
  '도시마구',
  '스기나미구',
  '나카노구',
  '세타가야구',
  '메구로구',
  '다이토구',
  '고토구',
  '분쿄구',
  '스미다구',
  '아라카와구',
];

// Mock 주소 데이터
export const mockAddresses: UserAddress[] = [
  {
    id: 1,
    userId: 1,
    areaId: 1,
    prefecture: '東京都',
    ward: '大田区',
    town: '池上',
    chome: '1',
    banchiText: '1-22-1',
    isPrimary: true,
    lat: 35.5614,
    lng: 139.7164,
    createdAt: '2026-01-27T10:00:00Z',
    updatedAt: '2026-01-27T10:00:00Z',
  },
];

// Mock 지역 데이터
export const mockAreas: Area[] = [
  {
    id: 1,
    prefecture: '東京都',
    ward: '大田区',
    town: '池上',
    chome: '1',
    banchiRange: '1-22, 25, 26',
    lat: 35.5614,
    lng: 139.7164,
  },
  {
    id: 2,
    prefecture: '東京都',
    ward: '大田区',
    town: '池上',
    chome: '2',
    banchiRange: '1-15',
    lat: 35.5620,
    lng: 139.7170,
  },
];

