import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import type { DateRange } from '../types/filters';

export const getDateRange = (range: DateRange) => {
  const now = endOfDay(new Date());
  let startDate: Date;

  switch (range) {
    case '24h':
      startDate = startOfDay(subDays(now, 1));
      break;
    case '7d':
      startDate = startOfDay(subDays(now, 7));
      break;
    case '28d':
      startDate = startOfDay(subDays(now, 28));
      break;
    case '3m':
      startDate = startOfDay(subDays(now, 90));
      break;
    default:
      startDate = startOfDay(subDays(now, 1));
  }

  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(now, 'yyyy-MM-dd')
  };
};