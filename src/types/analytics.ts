export interface AnalyticsConfig {
  clientId: string;
  scopes: string[];
  apiKey: string;
}

export interface AnalyticsViewId {
  websiteUrl: string;
  viewId: string;
}

export interface RealTimeMetrics {
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