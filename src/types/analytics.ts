export interface AnalyticsMetrics {
  activeUsers: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  previousPeriod?: {
    activeUsers: number;
    pageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
}

export interface MetricHistoryData {
  date: string;
  value: number;
}