import { parseISO, startOfDay, endOfDay, subDays } from 'date-fns';
import { DateRange } from '../../types/filters';
import { getDateRange } from '../dates';
import { MetricDataPoint } from './types';

export const calculateTrendForRange = (
  data: MetricDataPoint[],
  dateRange: DateRange
): number | null => {
  if (!data || data.length < 2) {
    console.log('Insufficient data for trend calculation');
    return null;
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));
  console.log('Raw data:', sortedData);

  // Get date range boundaries
  const { startDate, endDate } = getDateRange(dateRange);
  const currentStart = startOfDay(parseISO(startDate));
  const currentEnd = endOfDay(parseISO(endDate));
  
  // Calculate previous period boundaries
  const daysDiff = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
  const previousStart = startOfDay(subDays(currentStart, daysDiff));
  const previousEnd = endOfDay(subDays(currentEnd, daysDiff));

  console.log('Current period:', currentStart.toISOString(), 'to', currentEnd.toISOString());
  console.log('Previous period:', previousStart.toISOString(), 'to', previousEnd.toISOString());

  // Filter data for current and previous periods
  const currentPeriodData = sortedData.filter(item => {
    const date = parseISO(item.date);
    return date >= currentStart && date <= currentEnd;
  });

  const previousPeriodData = sortedData.filter(item => {
    const date = parseISO(item.date);
    return date >= previousStart && date < currentStart;
  });

  console.log('Current period data:', currentPeriodData);
  console.log('Previous period data:', previousPeriodData);

  // Calculate sums for both periods
  const currentSum = currentPeriodData.reduce((sum, item) => sum + item.value, 0);
  const previousSum = previousPeriodData.reduce((sum, item) => sum + item.value, 0);

  console.log('Current sum:', currentSum);
  console.log('Previous sum:', previousSum);

  // Return null if we don't have data for both periods
  if (currentPeriodData.length === 0 || previousPeriodData.length === 0) {
    console.log('Missing data for one or both periods');
    return null;
  }

  // Calculate trend percentage
  const trend = ((currentSum - previousSum) / previousSum) * 100;
  console.log('Calculated trend:', trend);
  return trend;
};