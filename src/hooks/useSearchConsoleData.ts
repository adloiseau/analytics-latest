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
  const { accessToken, isAuthenticated } = useAuth();
  const { selectedSite } = useSite();
  const { dateRange, searchQuery } = useFilters();

  const { startDate, endDate } = customStartDate && customEndDate 
    ? { startDate: customStartDate, endDate: customEndDate }
    : getDateRange(dateRange);

  console.log('[useSearchConsoleData] Query params:', {
    dimension,
    dateRange,
    startDate,
    endDate,
    selectedSite,
    filterValue
  });

  return useQuery(
    ['searchConsole', dimension, selectedSite, startDate, endDate, searchQuery, filterValue],
    async () => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }

      // For site dimension, fetch data for all sites
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

      // For other dimensions, require a selected site
      if (!selectedSite) {
        throw new Error('No site selected');
      }

      const dimensionFilterGroups = filterValue ? [{
        filters: [{
          dimension,
          operator: 'equals',
          expression: filterValue
        }]
      }] : [];

      console.log('[useSearchConsoleData] Fetching data for site:', {
        site: selectedSite,
        startDate,
        endDate,
        filterValue,
        dimensionFilterGroups
      });

      const [dimensionResponse, timeResponse] = await Promise.all([
        searchConsoleApi.fetchSearchAnalytics(accessToken, selectedSite, {
          startDate,
          endDate,
          dimensions: [dimension],
          rowLimit: 1000,
          dimensionFilterGroups
        }),
        searchConsoleApi.fetchSearchAnalytics(accessToken, selectedSite, {
          startDate,
          endDate,
          dimensions: ['date'],
          rowLimit: 1000,
          dimensionFilterGroups
        })
      ]);

      console.log('[useSearchConsoleData] API responses:', {
        dimensionRows: dimensionResponse.rows?.length,
        timeRows: timeResponse.rows?.length,
        sampleDimensionRow: dimensionResponse.rows?.[0],
        sampleTimeRow: timeResponse.rows?.[0]
      });

      const rows = dimensionResponse.rows || [];
      const timeRows = timeResponse.rows || [];

      const filteredRows = filterData(rows, searchQuery);
      const deduplicatedRows = deduplicateTableData(filteredRows);
      const chartData = prepareChartData(timeRows);

      console.log('[useSearchConsoleData] Processed data:', {
        originalRows: rows.length,
        filteredRows: filteredRows.length,
        deduplicatedRows: deduplicatedRows.length,
        chartDataPoints: chartData.length
      });

      return { 
        rows: deduplicatedRows,
        chartData
      };
    },
    {
      enabled: !!accessToken && !!isAuthenticated && (dimension === 'site' || !!selectedSite),
      staleTime: REFRESH_CONFIG.GSC_REFRESH_INTERVAL,
      keepPreviousData: true,
      retry: 2,
      onError: (error) => {
        console.error('[useSearchConsoleData] Error:', error);
      }
    }
  );
}