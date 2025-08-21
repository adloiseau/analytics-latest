import { supabaseClient } from './client';
import { FakeTraffic, FakeTrafficFilters, QueryTrafficData, DailyDistribution, FakeTrafficStats } from '../../types/fakeTraffic';
import { format, parseISO } from 'date-fns';

export const fakeTrafficService = {
  async getAllLogs(filters: FakeTrafficFilters = {}, page: number = 1, limit: number = 50): Promise<{ data: FakeTraffic[], total: number }> {
    try {
      let query = supabaseClient
        .from('fake_traffic')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.query) {
        query = query.ilike('query', `%${filters.query}%`);
      }

      if (filters.domain) {
        query = query.ilike('post_url', `%${filters.domain}%`);
      }

      if (filters.startDate) {
        query = query.gte('log_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('log_date', filters.endDate);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching fake traffic logs:', error);
        return { data: [], total: 0 };
      }

      return { data: data || [], total: count || 0 };
    } catch (error) {
      console.error('Error in getAllLogs:', error);
      return { data: [], total: 0 };
    }
  },

  async getQueryTrafficData(filters: FakeTrafficFilters = {}): Promise<QueryTrafficData[]> {
    try {
      let query = supabaseClient
        .from('fake_traffic')
        .select('log_date, query');

      // Apply filters
      if (filters.query) {
        query = query.ilike('query', `%${filters.query}%`);
      }

      if (filters.domain) {
        query = query.ilike('post_url', `%${filters.domain}%`);
      }

      if (filters.startDate) {
        query = query.gte('log_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('log_date', filters.endDate);
      }

      const { data, error } = await query.order('log_date', { ascending: true });

      if (error) {
        console.error('Error fetching query traffic data:', error);
        return [];
      }

      // Group by date and query
      const groupedData = (data || []).reduce((acc, log) => {
        const date = log.log_date;
        const query = log.query;

        if (!acc[date]) {
          acc[date] = { date };
        }

        acc[date][query] = (acc[date][query] || 0) + 1;

        return acc;
      }, {} as Record<string, any>);

      return Object.values(groupedData).sort((a: any, b: any) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error in getQueryTrafficData:', error);
      return [];
    }
  },

  async getDailyDistribution(date: string, filters: FakeTrafficFilters = {}): Promise<DailyDistribution[]> {
    try {
      let query = supabaseClient
        .from('fake_traffic')
        .select('query')
        .eq('log_date', date);

      // Apply filters
      if (filters.query) {
        query = query.ilike('query', `%${filters.query}%`);
      }

      if (filters.domain) {
        query = query.ilike('post_url', `%${filters.domain}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching daily distribution:', error);
        return [];
      }

      // Count occurrences of each query
      const queryCounts = (data || []).reduce((acc, log) => {
        const query = log.query;
        acc[query] = (acc[query] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const total = Object.values(queryCounts).reduce((sum, count) => sum + count, 0);

      return Object.entries(queryCounts)
        .map(([query, count]) => ({
          query,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error in getDailyDistribution:', error);
      return [];
    }
  },

  async getAvailableQueries(filters: FakeTrafficFilters = {}): Promise<string[]> {
    try {
      let query = supabaseClient
        .from('fake_traffic')
        .select('query');

      if (filters.domain) {
        query = query.ilike('post_url', `%${filters.domain}%`);
      }

      if (filters.startDate) {
        query = query.gte('log_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('log_date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching available queries:', error);
        return [];
      }

      const uniqueQueries = Array.from(new Set((data || []).map(log => log.query)))
        .filter(query => query && query.trim().length > 0)
        .sort();

      return uniqueQueries;
    } catch (error) {
      console.error('Error in getAvailableQueries:', error);
      return [];
    }
  },

  async getAvailableDomains(filters: FakeTrafficFilters = {}): Promise<string[]> {
    try {
      let query = supabaseClient
        .from('fake_traffic')
        .select('post_url');

      if (filters.query) {
        query = query.ilike('query', `%${filters.query}%`);
      }

      if (filters.startDate) {
        query = query.gte('log_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('log_date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching available domains:', error);
        return [];
      }

      const domains = Array.from(new Set(
        (data || [])
          .map(log => {
            try {
              const url = new URL(log.post_url);
              return url.hostname;
            } catch {
              return null;
            }
          })
          .filter(domain => domain !== null)
      )).sort();

      return domains;
    } catch (error) {
      console.error('Error in getAvailableDomains:', error);
      return [];
    }
  },

  async getStats(filters: FakeTrafficFilters = {}): Promise<FakeTrafficStats> {
    try {
      let query = supabaseClient
        .from('fake_traffic')
        .select('log_date, query, post_url');

      // Apply filters
      if (filters.query) {
        query = query.ilike('query', `%${filters.query}%`);
      }

      if (filters.domain) {
        query = query.ilike('post_url', `%${filters.domain}%`);
      }

      if (filters.startDate) {
        query = query.gte('log_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('log_date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching stats:', error);
        return {
          totalLogs: 0,
          uniqueQueries: 0,
          uniqueDomains: 0,
          dateRange: { start: '', end: '' }
        };
      }

      const logs = data || [];
      const uniqueQueries = new Set(logs.map(log => log.query)).size;
      const uniqueDomains = new Set(
        logs.map(log => {
          try {
            return new URL(log.post_url).hostname;
          } catch {
            return null;
          }
        }).filter(domain => domain !== null)
      ).size;

      const dates = logs.map(log => log.log_date).sort();
      const dateRange = {
        start: dates[0] || '',
        end: dates[dates.length - 1] || ''
      };

      return {
        totalLogs: logs.length,
        uniqueQueries,
        uniqueDomains,
        dateRange
      };
    } catch (error) {
      console.error('Error in getStats:', error);
      return {
        totalLogs: 0,
        uniqueQueries: 0,
        uniqueDomains: 0,
        dateRange: { start: '', end: '' }
      };
    }
  }
};