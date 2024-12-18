import { mapSourceName } from '../sourceMapping';
import { TrafficSource } from '../../../types/traffic';

export function processSourceData(data: any): TrafficSource[] {
  if (!data?.rows) return [];

  const sourceMap = new Map<string, TrafficSource>();

  // Process each row of data
  data.rows.forEach((row: any) => {
    const source = mapSourceName(row.dimensionValues[1].value || '(direct)');
    const visitors = parseInt(row.metricValues[0].value);

    if (!sourceMap.has(source)) {
      sourceMap.set(source, {
        name: source,
        visitors: 0,
        previousVisitors: 0,
        trend: 0,
        sparklineData: []
      });
    }

    const sourceData = sourceMap.get(source)!;
    sourceData.visitors += visitors;
    sourceData.sparklineData.push(visitors);
  });

  // Convert Map to array and calculate trends
  return Array.from(sourceMap.values())
    .map(source => ({
      ...source,
      trend: source.previousVisitors > 0 
        ? ((source.visitors - source.previousVisitors) / source.previousVisitors) * 100
        : source.visitors > 0 ? 100 : 0,
      hasSparkline: source.sparklineData.length > 0
    }))
    .sort((a, b) => b.visitors - a.visitors);
}