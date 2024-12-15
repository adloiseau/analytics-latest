import { subDays, format } from 'date-fns';
import type { DateRange } from '../components/DateRangeSelector';

export const getDateRange = (range: DateRange) => {
  const now = new Date();
  let startDate: Date;
  const endDate = now;

  switch (range) {
    case '24h':
      startDate = subDays(now, 1);
      break;
    case '7d':
      startDate = subDays(now, 7);
      break;
    case '28d':
      startDate = subDays(now, 28);
      break;
    case '3m':
      startDate = subDays(now, 90);
      break;
    default:
      startDate = subDays(now, 7);
  }

  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd')
  };
};