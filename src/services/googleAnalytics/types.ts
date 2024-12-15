export interface AnalyticsApiResponse {
  rows?: {
    dimensionValues: { value: string }[];
    metricValues: { value: string }[];
  }[];
}

export interface GoogleAnalyticsConfig {
  measurementId: string;
}

export interface RealTimeMetrics {
  activeUsers: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
}