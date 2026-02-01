export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // YYYY-MM-DD
  allDay?: boolean;
  extendedProps?: {
    wasteType?: string;
  };
}

export interface ApiResponse<T> {
  data: T;
}

