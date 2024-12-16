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
    };
  };
}