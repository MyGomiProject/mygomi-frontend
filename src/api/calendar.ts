// src/api/calendar.ts
import apiClient from './client';
import { CalendarEvent, ScheduleApiResponse } from '../types/calendar';

export const fetchCalendar = async (
  addressId: number,
  year: number,
  month: number
): Promise<CalendarEvent[]> => {
  // 기존의 복잡한 targetDate, safeDate 계산을 모두 지워버리세요!
  console.log(`[API] 캘린더 요청: /api/schedules (year=${year}, month=${month})`);

  try {
    const res = await apiClient.get<ScheduleApiResponse>('/api/schedules', {
      params: { year, month } // 백엔드가 원하는 데이터를 직접 꽂아줍니다.
    });
    return res.data.data;
  } catch (error) {
    console.error('캘린더 API 에러:', error);
    throw error;
  }
};