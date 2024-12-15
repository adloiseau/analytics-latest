export interface TrafficSource {
  name: string;
  visitors: number;
  previousVisitors: number;
  trend: number;
  sparklineData: number[];
}

export interface TrafficSourceData {
  date: string;
  source?: string;
  visitors?: number;
  previousVisitors?: number;
  trend?: number;
  [key: string]: number | string | undefined;
}

export interface TrafficSourceConfig {
  name: string;
  color: string;
  icon: string;
}