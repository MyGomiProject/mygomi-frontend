import { WasteType } from './items';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // YYYY-MM-DD
  allDay?: boolean;
  extendedProps?: {
    wasteType?: WasteType;
  };
}

// [추가] 백엔드 응답 감싸는 껍데기 (CommonResponse)
export interface ScheduleApiResponse {
  data: CalendarEvent[]; // 백엔드가 data 안에 배열을 담아줍니다.
  meta?: {
    timestamp: string;
  };
  message?: string;
}