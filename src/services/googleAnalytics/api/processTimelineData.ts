import { AnalyticsApiResponse } from '../types';

export function processTimelineData(data: AnalyticsApiResponse) {
  if (!data.rows) return [];

  return data.rows.map(row => ({
    date: row.dimensionValues[0].value,
    activeUsers: parseInt(row.metricValues[0].value),
    pageViews: parseInt(row.metricValues[1].value)
  }));
}