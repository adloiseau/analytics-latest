import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSite } from '../contexts/SiteContext';
import { useFilters } from '../contexts/FilterContext';
import { searchConsoleApi } from '../services/googleAuth/api';
import { getDateRange } from '../utils/dates';
import { filterData, deduplicateTableData, prepareChartData } from '../utils/metrics';
import { REFRESH_CONFIG } from '../config/refresh';
import { isAuthorizedSite } from '../config/analytics.config';
import type { SearchAnalyticsRow } from '../services/googleAuth/types';

type Dimension = 'page' | 'query' | 'site' | 'country';

export function useSearchConsoleData(
  dimension: Dimension,
  customStartDate?: string,
  customEndDate?: string,
  filterValue?: string
) {
  const { accessToken, isAuthenticated, isInitialized } = useAuth();
  const { selectedSite } = useSite();
  const { dateRange, searchQuery } = useFilters();

  const { startDate, endDate } = customStartDate && customEndDate 
    ? { startDate: customStartDate, endDate: customEndDate }
    : getDateRange(dateRange);

  return useQuery(
    ['searchConsole', dimension, selectedSite, startDate, endDate, searchQuery, filterValue],
    async () => {
      if (!isAuthenticated || !accessToken) {
        return { rows: [], chartData: [] };
      }

      if (dimension === 'site') {
        const { siteEntry: sites } = await searchConsoleApi.fetchSites(accessToken);
        if (!sites?.length) return { rows: [], chartData: [] };

        const authorizedSites = sites.filter(site => isAuthorizedSite(site.siteUrl));

        const allSitesData = await Promise.all(
          authorizedSites.map(async (site) => {
            try {
              const response = await searchConsoleApi.fetchSearchAnalytics(accessToken, site.siteUrl, {
                startDate,
                endDate,
                dimensions: [],
                rowLimit: 1
              });

              return {
                ...response.rows?.[0] || {
                  clicks: 0,
                  impressions: 0,
                  ctr: 0,
                  position: 0
                },
                keys: [site.siteUrl]
              };
            } catch {
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

      if (!selectedSite || !isAuthorizedSite(selectedSite)) {
        return { rows: [], chartData: [] };
      }

      try {
        const [dimensionResponse, timeResponse] = await Promise.all([
          searchConsoleApi.fetchSearchAnalytics(accessToken, selectedSite, {
            startDate,
            endDate,
            dimensions: [dimension],
            rowLimit: 1000,
            dimensionFilterGroups: filterValue ? [{
              filters: [{
                dimension,
                operator: 'equals',
                expression: filterValue
              }]
            }] : []
          }),
          searchConsoleApi.fetchSearchAnalytics(accessToken, selectedSite, {
            startDate,
            endDate,
            dimensions: ['date'],
            rowLimit: 1000
          })
        ]);

        const rows = dimensionResponse.rows || [];
        const timeRows = timeResponse.rows || [];

        const filteredRows = filterData(rows, searchQuery);
        const deduplicatedRows = deduplicateTableData(filteredRows);
        const chartData = prepareChartData(timeRows);

        return { rows: deduplicatedRows, chartData };
      } catch {
        return { rows: [], chartData: [] };
      }
    },
    {
      enabled: isInitialized && isAuthenticated && !!accessToken,
      staleTime: REFRESH_CONFIG.GSC_REFRESH_INTERVAL,
      keepPreviousData: true,
      retry: false
    }
  );
}