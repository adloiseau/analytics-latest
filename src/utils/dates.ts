import { subDays, subHours, format, startOfDay, endOfDay } from 'date-fns';
import type { DateRange } from '../types/filters';

export const getDateRange = (range: DateRange) => {
  const now = new Date();
  let startDate: Date;
  let endDate = now;

  switch (range) {
    case '24h':
      // Pour 24h, utiliser l'heure exacte au lieu de startOfDay/endOfDay
      startDate = subHours(now, 24);
      endDate = now;
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

  // Format avec l'heure pour 24h, sinon juste la date
  const formatStr = range === '24h' ? "yyyy-MM-dd'T'HH:mm:ss'Z'" : 'yyyy-MM-dd';
  
  return {
    startDate: format(startDate, formatStr),
    endDate: format(endDate, formatStr)
  };
};