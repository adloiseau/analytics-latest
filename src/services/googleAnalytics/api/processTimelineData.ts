import { mapSourceName } from '../sourceMapping';
import { TrafficSourceData } from '../../../types/traffic';

export function processTimelineData(data: any): TrafficSourceData[] {
  if (!data?.rows) return [];

  const timelineMap = new Map();

  // Process each row of data
  data.rows.forEach((row: any) => {
    const date = row.dimensionValues[0].value;
    const source = mapSourceName(row.dimensionValues[1].value || '(direct)');
    const visitors = parseInt(row.metricValues[0].value);

    if (!timelineMap.has(date)) {
      timelineMap.set(date, {
        date,
        Direct: 0,
        Search: 0,
        Facebook: 0,
        Twitter: 0,
        Instagram: 0,
        YouTube: 0,
        'Other Social': 0,
        Other: 0
      });
    }

    const dateData = timelineMap.get(date);
    dateData[source] = (dateData[source] || 0) + visitors;
  });

  // Convert Map to array and sort by date
  return Array.from(timelineMap.values())
    .sort((a, b) => a.date.localeCompare(b.date));
}