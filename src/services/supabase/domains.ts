import { supabaseClient } from './client';

export interface ExpiredDomain {
  id: number;
  domain_url: string;
  as_metric: number;
  to_metric: number;
  bl_metric: number;
  rd_metric: number;
  kd_metric: number;
  tf_root_metric: number;
  tf_subdomain_metric: number;
  cf_root_metric: number;
  cf_subdomain_metric: number;
  ttf_root_metric: number;
  ttf_subdomain_metric: number;
  created_at: string;
}

export const domainsService = {
  async getExpiredDomains(): Promise<ExpiredDomain[]> {
    try {
      const { data, error } = await supabaseClient
        .from('ndd_expirated')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expired domains:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getExpiredDomains:', error);
      return [];
    }
  }
};