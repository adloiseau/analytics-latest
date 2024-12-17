export interface MetricDataPoint {
  date: string;
  value: number;
}

export interface MetricPeriodData {
  currentPeriod: MetricDataPoint[];
  previousPeriod: MetricDataPoint[];
}

export interface MetricTrendResult {
  trend: number;
  currentValue: number;
  previousValue: number;
}