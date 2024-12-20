import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSite } from '../contexts/SiteContext';
import { useFilters } from '../contexts/FilterContext';
import { searchConsoleApi } from '../services/googleAuth/api';
import { getDateRange } from '../utils/dates';
import { filterData, deduplicateTableData, prepareChartData } from '../utils/metrics';
import { REFRESH_CONFIG } from '../config/refresh';
import type { SearchAnalyticsRow } from '../services/googleAuth/types';

type Dimension = 'page' | 'query' | 'site';

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
      if (!accessToken) {
        throw new Error('No access token');
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
                dimensionFilterGroups: []
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

      if (!selectedSite) {
        throw new Error('No site selected');
      }

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
          rowLimit: 1000,
          dimensionFilterGroups: []
        })
      ]);

      const rows = dimensionResponse.rows || [];
      const timeRows = timeResponse.rows || [];

      const filteredRows = filterData(rows, searchQuery);
      const deduplicatedRows = deduplicateTableData(filteredRows);
      const chartData = prepareChartData(timeRows);

      return { 
        rows: deduplicatedRows,
        chartData
      };
    },
    {
      enabled: !!accessToken && isAuthenticated && isInitialized && (dimension === 'site' || !!selectedSite),
      staleTime: REFRESH_CONFIG.GSC_REFRESH_INTERVAL,
      keepPreviousData: true,
      retry: 1,
      onError: (error) => {
        console.error(`Error fetching ${dimension} data:`, error);
      }
    }
  );
}