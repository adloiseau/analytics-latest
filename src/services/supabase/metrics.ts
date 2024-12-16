import { supabaseClient } from './client';
import type { SiteMetric } from '../../types/supabase';

export const metricsService = {
  async testConnection() {
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await supabaseClient
        .from('site_metrics')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Supabase connection test failed:', error);
        return false;
      }

      console.log('Supabase connection successful. Sample data:', data);
      return true;
    } catch (error) {
      console.error('Error testing Supabase connection:', error);
      return false;
    }
  },

  async getLatestMetrics(siteUrl: string): Promise<SiteMetric | null> {
    try {
      // Normalize URL by removing trailing slash
      const normalizedUrl = siteUrl.replace(/\/$/, '');
      console.log('Fetching latest metrics for normalized site URL:', normalizedUrl);
      
      const { data, error } = await supabaseClient
        .from('site_metrics')
        .select('*')
        .eq('site_url', normalizedUrl)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching latest metrics:', error);
        return null;
      }

      console.log('Latest metrics data:', data);
      return data;
    } catch (error) {
      console.error('Error in getLatestMetrics:', error);
      return null;
    }
  },

  async getMetricsHistory(
    siteUrl: string, 
    metricType: string, 
    days: number = 2
  ): Promise<SiteMetric[]> {
    try {
      // Normalize URL by removing trailing slash
      const normalizedUrl = siteUrl.replace(/\/$/, '');
      console.log(`Fetching metrics history for site: ${normalizedUrl}, type: ${metricType}, days: ${days}`);
      
      const { data, error } = await supabaseClient
        .from('site_metrics')
        .select('*')
        .eq('site_url', normalizedUrl)
        .eq('metric_type', metricType)
        .order('date', { ascending: false })
        .limit(days);

      if (error) {
        console.error('Error fetching metrics history:', error);
        return [];
      }

      console.log(`Metrics history for ${metricType}:`, data);
      return data || [];
    } catch (error) {
      console.error('Error in getMetricsHistory:', error);
      return [];
    }
  }
};