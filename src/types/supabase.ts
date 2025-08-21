export interface SiteMetric {
  id: number;
  site_url: string;
  date: string;
  metric_type: string;
  value: number;
  created_at?: string;
}

export interface Database {
  public: {
    Tables: {
      site_metrics: {
        Row: SiteMetric;
        Insert: Omit<SiteMetric, 'id' | 'created_at'>;
        Update: Partial<Omit<SiteMetric, 'id' | 'created_at'>>;
      };
      fake_traffic: {
        Row: {
          id: number;
          time: string;
          ip: string;
          query: string;
          post_url: string;
          useragent: string;
          type: string;
          created_at: string;
          log_date: string;
        };
        Insert: Omit<{
          id: number;
          time: string;
          ip: string;
          query: string;
          post_url: string;
          useragent: string;
          type: string;
          created_at: string;
          log_date: string;
        }, 'id' | 'created_at'>;
        Update: Partial<Omit<{
          id: number;
          time: string;
          ip: string;
          query: string;
          post_url: string;
          useragent: string;
          type: string;
          created_at: string;
          log_date: string;
        }, 'id' | 'created_at'>>;
      };
    };
  };
}