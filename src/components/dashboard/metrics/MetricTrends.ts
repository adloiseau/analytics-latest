import { AnalyticsMetrics } from '../../../types/analytics';
import { DateRange } from '../../../types/filters';
import { SearchAnalyticsRow } from '../../../services/googleAuth/types';
import { getDateRange } from '../../../utils/dates';
import { subDays, parseISO } from 'date-fns';

export const calculateTrend = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const calculateMetricTrend = (
  data: { date: string; value: number }[],
  dateRange: DateRange
): number => {
  if (!data || data.length < 2) return 0;

  // Get the date range boundaries
  const { startDate, endDate } = getDateRange(dateRange);
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  // Filter data within the selected date range
  const currentPeriodData = data.filter(item => {
    const date = parseISO(item.date);
    return date >= start && date <= end;
  });

  // Calculate previous period boundaries
  const periodLength = end.getTime() - start.getTime();
  const previousStart = new Date(start.getTime() - periodLength);
  const previousEnd = new Date(end.getTime() - periodLength);

  // Filter data for previous period
  const previousPeriodData = data.filter(item => {
    const date = parseISO(item.date);
    return date >= previousStart && date < start;
  });

  // Calculate averages for both periods
  const currentAvg = currentPeriodData.reduce((sum, item) => sum + item.value, 0) / 
                    (currentPeriodData.length || 1);
  const previousAvg = previousPeriodData.reduce((sum, item) => sum + item.value, 0) / 
                     (previousPeriodData.length || 1);

  return calculateTrend(currentAvg, previousAvg);
};

export const calculateSearchConsoleTrend = (
  current: SearchAnalyticsRow,
  previous: SearchAnalyticsRow | undefined,
  metric: 'clicks' | 'impressions'
): number => {
  if (!previous) return 0;
  return calculateTrend(current[metric], previous[metric]);
};

export const calculateAnalyticsTrend = (
  metrics: AnalyticsMetrics | undefined,
  metric: 'pageViews' | 'activeUsers'
): number => {
  if (!metrics?.previousPeriod) return 0;
  return calculateTrend(
    metrics[metric],
    metrics.previousPeriod[metric]
  );
};