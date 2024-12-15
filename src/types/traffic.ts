export interface TrafficSource {
  name: string;
  visitors: number;
  trend: number;
  sparklineData: number[];
}

export interface TrafficSourceData {
  date: string;
  [key: string]: number | string;
}

export interface TrafficSourceConfig {
  name: string;
  color: string;
  icon: string;
}