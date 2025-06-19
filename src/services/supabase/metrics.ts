import { supabaseClient } from './client';
import type { SiteMetric } from '../../types/supabase';

// Fonction pour normaliser les URLs
const normalizeUrl = (url: string): string => {
  try {
    // Ajouter https:// si ce n'est pas déjà présent
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    
    // Créer un objet URL pour normaliser
    const urlObj = new URL(url);
    
    // Retourner l'URL sans le slash final
    return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname === '/' ? '' : urlObj.pathname}`;
  } catch (error) {
    console.error('Error normalizing URL:', url, error);
    return url.replace(/\/$/, '');
  }
};

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
      const normalizedUrl = normalizeUrl(siteUrl);
      
      const { data, error } = await supabaseClient
        .from('site_metrics')
        .select('*')
        .eq('site_url', normalizedUrl)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Supabase error for getLatestMetrics:', error);
        return null;
      }

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
      const normalizedUrl = normalizeUrl(siteUrl);
      
      console.log(`Fetching metrics for: ${normalizedUrl}, type: ${metricType}, days: ${days}`);
      
      const { data, error } = await supabaseClient
        .from('site_metrics')
        .select('*')
        .eq('site_url', normalizedUrl)
        .eq('metric_type', metricType)
        .order('date', { ascending: false })
        .limit(days);

      if (error) {
        console.error('Supabase error for getMetricsHistory:', error);
        return [];
      }

      console.log(`Found ${data?.length || 0} metrics for ${normalizedUrl}`);
      return data || [];
    } catch (error) {
      console.error('Error in getMetricsHistory:', error);
      return [];
    }
  },

  async getMetricsByDate(
    siteUrl: string, 
    metricType: string, 
    date: string
  ): Promise<SiteMetric | null> {
    try {
      const normalizedUrl = normalizeUrl(siteUrl);
      
      const { data, error } = await supabaseClient
        .from('site_metrics')
        .select('*')
        .eq('site_url', normalizedUrl)
        .eq('metric_type', metricType)
        .eq('date', date)
        .single();

      if (error) {
        console.error('Supabase error for getMetricsByDate:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getMetricsByDate:', error);
      return null;
    }
  }
};