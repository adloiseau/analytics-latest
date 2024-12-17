import { MetricDataPoint } from './types';
import { DateRange } from '../../types/filters';
import { getDateRange } from '../dates';
import { parseISO, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';

export const calculatePeriodAverage = (
  data: MetricDataPoint[],
  startDate: Date,
  endDate: Date
): number => {
  const periodData = data.filter(item => {
    const date = parseISO(item.date);
    return !isBefore(date, startDate) && !isAfter(date, endDate);
  });

  return periodData.reduce((sum, item) => sum + item.value, 0) / (periodData.length || 1);
};

export const calculateTrendPercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};