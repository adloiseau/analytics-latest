import { TrafficSourceData } from '../../../types/traffic';
import { mapSourceName } from '../sourceMapping';
import { AnalyticsApiResponse } from '../types';

export function processTimelineData(currentPeriod: AnalyticsApiResponse): TrafficSourceData[] {
  const timelineMap = new Map<string, TrafficSourceData>();

  currentPeriod.rows?.forEach((row) => {
    const date = row.dimensionValues[0].value;
    const source = mapSourceName(row.dimensionValues[1].value);
    const sessions = parseInt(row.metricValues[0].value);

    if (!timelineMap.has(date)) {
      timelineMap.set(date, { date });
    }
    const entry = timelineMap.get(date)!;
    entry[source] = (entry[source] || 0) + sessions;
  });

  return Array.from(timelineMap.values());
}