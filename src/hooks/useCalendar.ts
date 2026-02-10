import { useQuery } from '@tanstack/react-query';
import { fetchCalendar } from '../api/calendar';
import { CalendarEvent } from '../types/calendar';
import { DEFAULT_ADDRESS_ID } from '../constants/constants';

export const useWeeklyCalendar = (opts: { addressId?: number; from?: string; to?: string }) => {
  const { addressId = DEFAULT_ADDRESS_ID, from, to } = opts || {};
  return useQuery<CalendarEvent[], Error>({
    queryKey: ['weeklyCalendar', addressId, from, to],
    queryFn: () => fetchCalendar(addressId, from, to),
    staleTime: 1000 * 60, // 1 minute
    enabled: Boolean(from && to),
  });
};