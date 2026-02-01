import axios from 'axios';
import { CalendarEvent, ApiResponse } from '../types/calendar';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL });

export const fetchCalendar = async (
  addressId?: number,
  from?: string,
  to?: string
): Promise<CalendarEvent[]> => {
  const res = await api.get<ApiResponse<CalendarEvent[]>>('/api/collection/calendar', {
    params: { addressId, from, to },
  });
  return res.data.data;
};

