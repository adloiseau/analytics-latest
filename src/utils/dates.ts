import { subDays, subHours, format, startOfDay, endOfDay } from 'date-fns';
import type { DateRange } from '../types/filters';

export const getDateRange = (range: DateRange) => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  switch (range) {
    case '24h':
      // For 24h, use the last 24 hours from now
      startDate = subHours(now, 24);
      break;
      
    case '7d':
      startDate = startOfDay(subDays(now, 7));
      endDate = endOfDay(now);
      break;
      
    case '28d':
      startDate = startOfDay(subDays(now, 28));
      endDate = endOfDay(now);
      break;
      
    case '3m':
      startDate = startOfDay(subDays(now, 90));
      endDate = endOfDay(now);
      break;
      
    default:
      startDate = startOfDay(subDays(now, 1));
      endDate = endOfDay(now);
  }

  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd')
  };
};