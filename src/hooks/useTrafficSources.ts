import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSite } from '../contexts/SiteContext';
import { useFilters } from '../contexts/FilterContext';
import { analyticsApi } from '../services/googleAnalytics/api';
import { getDateRange } from '../utils/dates';
import { TrafficSource, TrafficSourceData } from '../types/traffic';

export const useTrafficSources = () => {
  const { accessToken } = useAuth();
  const { selectedSite } = useSite();
  const { dateRange } = useFilters();
  const { startDate, endDate } = getDateRange(dateRange);

  return useQuery(
    ['trafficSources', selectedSite, dateRange],
    async () => {
      if (!accessToken || !selectedSite) {
        throw new Error('Authentication or site selection required');
      }

      const data = await analyticsApi.getTrafficSourceData(
        selectedSite,
        accessToken,
        startDate,
        endDate
      );

      return data;
    },
    {
      enabled: !!accessToken && !!selectedSite,
      staleTime: 5 * 60 * 1000,
      keepPreviousData: true
    }
  );
};