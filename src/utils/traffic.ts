import { TrafficSource, TrafficSourceData } from '../types/traffic';

export const calculateTrend = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const formatTrend = (trend: number): string => {
  const sign = trend >= 0 ? '+' : '';
  return `${sign}${trend.toFixed(1)}%`;
};

export const aggregateSourceData = (data: TrafficSourceData[]): TrafficSource[] => {
  // Group and aggregate data by source
  const aggregated = data.reduce((acc, curr) => {
    const source = curr.source as string;
    if (!acc[source]) {
      acc[source] = {
        name: source,
        visitors: 0,
        trend: 0,
        sparklineData: []
      };
    }
    acc[source].visitors += Number(curr.visitors || 0);
    acc[source].sparklineData.push(Number(curr.visitors || 0));
    return acc;
  }, {} as Record<string, TrafficSource>);

  return Object.values(aggregated);
};