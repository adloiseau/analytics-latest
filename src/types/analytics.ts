export interface AnalyticsMetrics {
  activeUsers: number;
  pageViews: number;
  realtimeUsers: number;
  previousPeriod?: {
    activeUsers: number;
    pageViews: number;
  };
  pageViewsHistory?: Array<{ date: string; value: number }>;
  activeUsersHistory?: Array<{ date: string; value: number }>;
}

export interface RealTimeMetrics extends AnalyticsMetrics {}