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

  // Get the property ID for the selected site
  const hostname = selectedSite ? new URL(selectedSite).hostname : null;
  const propertyId = hostname ? GA_PROPERTY_IDS[hostname] : null;

  console.log('[useTrafficSources] Query params:', {
    propertyId,
    dateRange,
    startDate,
    endDate,
    hostname
  });

  return useQuery(
    ['trafficSources', propertyId, dateRange],
    async () => {
      if (!accessToken || !selectedSite || !propertyId) {
        console.error('[useTrafficSources] Missing required parameters:', {
          hasAccessToken: !!accessToken,
          hasSelectedSite: !!selectedSite,
          hasPropertyId: !!propertyId
        });
        throw new Error('Missing required parameters');
      }

      console.log('[useTrafficSources] Fetching data with params:', {
        propertyId,
        startDate,
        endDate
      });

      const data = await analyticsApi.getTrafficSourceData(
        propertyId,
        accessToken,
        {
          startDate,
          endDate
        }
      );

      console.log('[useTrafficSources] Received data:', {
        sourceDataLength: data.sourceData?.length,
        timelineDataLength: data.timelineData?.length,
        firstTimelineDate: data.timelineData?.[0]?.date,
        lastTimelineDate: data.timelineData?.[data.timelineData.length - 1]?.date
      });

      return data;
    },
    {
      enabled: !!accessToken && !!selectedSite && !!propertyId,
      staleTime: 5 * 60 * 1000,
      keepPreviousData: true,
      retry: 1,
      onError: (error) => {
        console.error('[useTrafficSources] Error:', error);
      }
    }
  );
};