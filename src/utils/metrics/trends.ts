import { subDays, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from '../../types/filters';
import { getDateRange } from '../dates';

export interface MetricDataPoint {
  date: string;
  value: number;
}

export const calculateTrendForRange = (
  data: MetricDataPoint[],
  dateRange: DateRange
): number => {
  if (!data || data.length < 2) return 0;

  // Sort data by date
  const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

  const { startDate, endDate } = getDateRange(dateRange);
  const start = startOfDay(parseISO(startDate));
  const end = endOfDay(parseISO(endDate));

  // Filter data for current period
  const currentPeriodData = sortedData.filter(item => {
    const date = parseISO(item.date);
    return !isBefore(date, start) && !isAfter(date, end);
  });

  // Calculate previous period dates
  const periodLength = end.getTime() - start.getTime();
  const previousStart = new Date(start.getTime() - periodLength);
  const previousEnd = new Date(start.getTime() - 1); // One millisecond before current period

  // Filter data for previous period
  const previousPeriodData = sortedData.filter(item => {
    const date = parseISO(item.date);
    return !isBefore(date, previousStart) && !isAfter(date, previousEnd);
  });

  // Get the latest values from each period
  const currentValue = currentPeriodData.length > 0 
    ? currentPeriodData[currentPeriodData.length - 1].value
    : 0;
  
  const previousValue = previousPeriodData.length > 0
    ? previousPeriodData[previousPeriodData.length - 1].value
    : 0;

  // Calculate trend percentage
  if (previousValue === 0) return currentValue > 0 ? 100 : 0;
  return ((currentValue - previousValue) / previousValue) * 100;
};