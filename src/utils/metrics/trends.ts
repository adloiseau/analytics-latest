import { parseISO, startOfDay, endOfDay, subDays } from 'date-fns';
import { DateRange } from '../../types/filters';
import { getDateRange } from '../dates';
import { MetricDataPoint } from './types';

export const calculateTrendForRange = (
  data: MetricDataPoint[],
  dateRange: DateRange
): number | null => {
  if (!data || data.length < 2) {
    return null;
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

  // Get date range boundaries
  const { startDate, endDate } = getDateRange(dateRange);
  const currentStart = startOfDay(parseISO(startDate));
  const currentEnd = endOfDay(parseISO(endDate));
  
  // Calculate previous period boundaries
  const daysDiff = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
  const previousStart = startOfDay(subDays(currentStart, daysDiff));
  const previousEnd = endOfDay(subDays(currentEnd, daysDiff));

  // Filter data for current and previous periods
  const currentPeriodData = sortedData.filter(item => {
    const date = parseISO(item.date);
    return date >= currentStart && date <= currentEnd;
  });

  const previousPeriodData = sortedData.filter(item => {
    const date = parseISO(item.date);
    return date >= previousStart && date < currentStart;
  });

  // Return null if we don't have data for both periods
  if (currentPeriodData.length === 0 || previousPeriodData.length === 0) {
    return null;
  }

  // Calculate sums for both periods
  const currentSum = currentPeriodData.reduce((sum, item) => sum + item.value, 0);
  const previousSum = previousPeriodData.reduce((sum, item) => sum + item.value, 0);

  // Calculate trend percentage
  return ((currentSum - previousSum) / previousSum) * 100;
};