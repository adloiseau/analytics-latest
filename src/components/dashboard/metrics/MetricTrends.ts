import { AnalyticsMetrics } from '../../../types/analytics';

export const calculateTrend = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const calculatePageViewsTrend = (metrics: AnalyticsMetrics): number => {
  if (!metrics?.pageViews || !metrics?.previousPeriod?.pageViews) return 0;
  return calculateTrend(metrics.pageViews, metrics.previousPeriod.pageViews);
};

export const calculateUsersTrend = (metrics: AnalyticsMetrics): number => {
  if (!metrics?.activeUsers || !metrics?.previousPeriod?.activeUsers) return 0;
  return calculateTrend(metrics.activeUsers, metrics.previousPeriod.activeUsers);
};