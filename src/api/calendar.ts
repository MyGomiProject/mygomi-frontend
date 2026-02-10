// src/api/calendar.ts
import apiClient from './client';
import { CalendarEvent, ScheduleApiResponse } from '../types/calendar';

export const fetchCalendar = async (
  addressId?: number,
  from?: string,
  to?: string
): Promise<CalendarEvent[]> => {
  // 1. 날짜 변환 (YYYY-MM-DD -> year, month)
  // 백엔드는 'from/to' 대신 'year', 'month'를 원합니다.
  const targetDate = from ? new Date(from) : new Date();
  
  // from 날짜는 보통 해당 월의 1일이나 전달 마지막 주부터 시작하므로,
  // 안전하게 +15일을 해서 '해당 월'을 구합니다.
  const safeDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 15);
  
  const year = safeDate.getFullYear();
  const month = safeDate.getMonth() + 1; // 0부터 시작하므로 +1

  console.log(`[API] 캘린더 요청: /api/schedules (year=${year}, month=${month})`);

  try {
    // 2. 주소 변경: /api/collection/calendar (X) -> /api/schedules (O)
    const res = await apiClient.get<ScheduleApiResponse>('/api/schedules', {
      params: { 
        year, 
        month 
        // addressId는 보내지 않아도 됩니다. (백엔드가 토큰에서 유저를 찾음)
      },
    });

    // 3. 데이터 반환
    // 백엔드가 이미 CalendarEvent 모양으로 주고 있으므로 바로 data 반환
    return res.data.data || [];

  } catch (error) {
    console.error('[API] 캘린더 조회 실패:', error);
    return []; // 에러 시 빈 배열 반환 (화면 깨짐 방지)
  }
};