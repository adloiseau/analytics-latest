import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSite } from '../contexts/SiteContext';
import { useFilters } from '../contexts/FilterContext';
import { searchConsoleApi } from '../services/googleAuth/api';
import { getDateRange } from '../utils/dates';
import { filterData, deduplicateTableData, prepareChartData } from '../utils/metrics';
import type { SearchAnalyticsRow } from '../services/googleAuth/types';

type Dimension = 'page' | 'query' | 'site';

export const useSearchConsoleData = (
  dimension: Dimension,
  customStartDate?: string,
  customEndDate?: string
) => {
  const { accessToken, isAuthenticated } = useAuth();
  const { selectedSite } = useSite();
  const { dateRange, searchQuery } = useFilters();

  const { startDate, endDate } = customStartDate && customEndDate 
    ? { startDate: customStartDate, endDate: customEndDate }
    : getDateRange(dateRange);

  return useQuery(
    ['searchConsole', dimension, selectedSite, startDate, endDate, searchQuery],
    async () => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }

      if (dimension === 'site') {
        const { siteEntry: sites } = await searchConsoleApi.fetchSites(accessToken);
        if (!sites?.length) return { rows: [], chartData: [] };

        const allSitesData = await Promise.all(
          sites.map(async (site) => {
            try {
              const response = await searchConsoleApi.fetchSearchAnalytics(accessToken, site.siteUrl, {
                startDate,
                endDate,
                dimensions: [],
                rowLimit: 1,
              });

              const data = response.rows?.[0] || {
                clicks: 0,
                impressions: 0,
                ctr: 0,
                position: 0
              };

              return {
                ...data,
                keys: [site.siteUrl]
              };
            } catch (error) {
              console.error(`Error fetching data for ${site.siteUrl}:`, error);
              return {
                keys: [site.siteUrl],
                clicks: 0,
                impressions: 0,
                ctr: 0,
                position: 0
              };
            }
          })
        );

        return {
          rows: allSitesData.filter(row => row.clicks > 0 || row.impressions > 0),
          chartData: []
        };
      }

      // ... reste du code inchangé ...
    },
    {
      enabled: !!accessToken && !!isAuthenticated && (dimension === 'site' || !!selectedSite),
      staleTime: 5 * 60 * 1000,
      keepPreviousData: true,
      retry: 2,
    }
  );
};