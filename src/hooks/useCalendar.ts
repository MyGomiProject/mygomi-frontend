import { useQuery } from '@tanstack/react-query';
import { fetchCalendar } from '../api/calendar';
import { CalendarEvent } from '../types/calendar';

export const useWeeklyCalendar = (opts: { addressId?: number; from?: string; to?: string }) => {
  const { addressId, from, to } = opts || {};
  return useQuery<CalendarEvent[], Error>({
    queryKey: ['weeklyCalendar', addressId, from, to],
    queryFn: () => fetchCalendar(addressId, from, to),
    staleTime: 1000 * 60, // 1 minute
    enabled: Boolean(from && to && addressId),
  });
};

