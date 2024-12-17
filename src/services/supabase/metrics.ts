import { supabaseClient } from './client';
import type { SiteMetric } from '../../types/supabase';

export const metricsService = {
  async testConnection() {
    try {
      const { data, error } = await supabaseClient
        .from('site_metrics')
        .select('*')
        .limit(1);

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  },

  async getLatestMetrics(siteUrl: string): Promise<SiteMetric | null> {
    try {
      const normalizedUrl = siteUrl.replace(/\/$/, '');
      
      const { data, error } = await supabaseClient
        .from('site_metrics')
        .select('*')
        .eq('site_url', normalizedUrl)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  },

  async getMetricsHistory(
    siteUrl: string, 
    metricType: string, 
    days: number = 2
  ): Promise<SiteMetric[]> {
    try {
      const normalizedUrl = siteUrl.replace(/\/$/, '');
      
      const { data, error } = await supabaseClient
        .from('site_metrics')
        .select('*')
        .eq('site_url', normalizedUrl)
        .eq('metric_type', metricType)
        .order('date', { ascending: false })
        .limit(days);

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }
};