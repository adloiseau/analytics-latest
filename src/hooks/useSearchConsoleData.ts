import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSite } from '../contexts/SiteContext';
import { searchConsoleApi } from '../services/googleAuth/api';
import { DateRange } from '../components/DateRangeSelector';
import { addDays, subDays, format } from 'date-fns';

type Dimension = 'page' | 'query';

const getDateRange = (range: DateRange) => {
  const endDate = new Date();
  let startDate: Date;

  switch (range) {
    case '24h':
      startDate = subDays(endDate, 1);
      break;
    case '7d':
      startDate = subDays(endDate, 7);
      break;
    case '30d':
      startDate = subDays(endDate, 30);
      break;
    case '90d':
      startDate = subDays(endDate, 90);
      break;
    default:
      startDate = subDays(endDate, 7);
  }

  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  };
};

export const useSearchConsoleData = (dimension: Dimension, dateRange: DateRange = '7d') => {
  const { accessToken, isAuthenticated } = useAuth();
  const { selectedSite } = useSite();
  const { startDate, endDate } = getDateRange(dateRange);

  return useQuery(
    ['searchConsole', dimension, selectedSite, dateRange],
    async () => {
      if (!accessToken || !isAuthenticated || !selectedSite) {
        throw new Error('Authentication required');
      }

      const data = await searchConsoleApi.fetchSearchAnalytics(accessToken, selectedSite, {
        startDate,
        endDate,
        dimensions: [dimension, 'date'],
        rowLimit: 1000,
      });

      return data;
    },
    {
      enabled: !!accessToken && !!isAuthenticated && !!selectedSite,
      staleTime: 5 * 60 * 1000,
    }
  );
};