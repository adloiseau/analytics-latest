export interface FakeTraffic {
  id: number;
  time: string;
  ip: string;
  query: string;
  post_url: string;
  useragent: string;
  type: string;
  created_at: string;
  log_date: string;
}

export interface FakeTrafficFilters {
  query?: string;
  domain?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export interface QueryTrafficData {
  date: string;
  [query: string]: number | string;
}

export interface DailyDistribution {
  query: string;
  count: number;
  percentage: number;
}

export interface FakeTrafficStats {
  totalLogs: number;
  uniqueQueries: number;
  uniqueDomains: number;
  dateRange: {
    start: string;
    end: string;
  };
}