import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSite } from '../contexts/SiteContext';
import { useFilters } from '../contexts/FilterContext';
import { analyticsApi } from '../services/googleAnalytics/api';
import { getDateRange } from '../utils/dates';
import { TrafficSource, TrafficSourceData } from '../types/traffic';
import { GA_PROPERTY_IDS } from '../config/analytics.config';

export const useTrafficSources = () => {
  const { accessToken } = useAuth();
  const { selectedSite } = useSite();
  const { dateRange } = useFilters();
  const { startDate, endDate } = getDateRange(dateRange);

  const hostname = selectedSite ? new URL(selectedSite).hostname : null;
  const propertyId = hostname ? GA_PROPERTY_IDS[hostname] : null;

  if (!propertyId) {
    console.error('Property ID not found for selected site:', selectedSite);
    throw new Error('Invalid property ID');
  }

  return useQuery(
    ['trafficSources', propertyId, dateRange],
    async () => {
      if (!accessToken || !selectedSite) {
        throw new Error('Authentication or site selection required');
      }

      const data = await analyticsApi.getTrafficSourceData(
        propertyId,
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