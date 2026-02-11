import { useQuery } from '@tanstack/react-query';
import { fetchCalendar } from '../api/calendar';
import { CalendarEvent } from '../types/calendar';
import { DEFAULT_ADDRESS_ID } from '../constants/constants';

export const useWeeklyCalendar = (opts: { addressId?: number; year: number; month: number }) => {
  const { addressId = DEFAULT_ADDRESS_ID, year, month } = opts;
  return useQuery<CalendarEvent[], Error>({
    // queryKey에 year와 month가 들어가야 달을 바꿀 때마다 리액트 쿼리가 재실행됩니다!
    queryKey: ['weeklyCalendar', addressId, year, month],
    queryFn: () => fetchCalendar(addressId, year, month),
    staleTime: 1000 * 60,
    enabled: !!year && !!month, // 연/월 정보가 있을 때만 실행
  });
};