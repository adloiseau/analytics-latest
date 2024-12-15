export interface GoogleAnalyticsConfig {
  measurementId: string;
}

export interface RealTimeMetrics {
  activeUsers: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
}