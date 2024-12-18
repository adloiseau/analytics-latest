import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSite } from '../contexts/SiteContext';
import { useFilters } from '../contexts/FilterContext';
import { analyticsApi } from '../services/googleAnalytics/api';
import { getDateRange } from '../utils/dates';
import { GA_PROPERTY_IDS } from '../config/analytics.config';
import type { TrafficSource, TrafficSourceData } from '../types/traffic';

export const useTrafficSources = () => {
  const { accessToken } = useAuth();
  const { selectedSite } = useSite();
  const { dateRange } = useFilters();
  const { startDate, endDate } = getDateRange(dateRange);

  // Validate URL and get hostname
  const getPropertyId = (url: string | null) => {
    if (!url) return null;
    try {
      const hostname = new URL(url).hostname;
      return GA_PROPERTY_IDS[hostname] || null;
    } catch (error) {
      console.error('Invalid URL:', error);
      return null;
    }
  };

  const propertyId = getPropertyId(selectedSite);

  return useQuery(
    ['trafficSources', propertyId, dateRange],
    async () => {
      if (!accessToken || !selectedSite || !propertyId) {
        throw new Error('Missing required parameters');
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
      enabled: !!accessToken && !!selectedSite && !!propertyId,
      staleTime: 5 * 60 * 1000,
      keepPreviousData: true,
      retry: 1
    }
  );
};