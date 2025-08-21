import { supabaseClient } from './client';
import { LinkSelling, LinkSellingStats } from '../../types/linkSelling';
import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface LinkSellingFilters {
  year?: number;
  site?: string;
  platform?: string;
}

// Helper function to check if a platform is considered "direct"
const isDirectSale = (platform: string): boolean => {
  const normalizedPlatform = platform.toLowerCase().trim();
  return normalizedPlatform === 'direct' || 
         normalizedPlatform === 'vente directe' || 
         normalizedPlatform === 'direct sale' ||
         normalizedPlatform === 'directe' ||
         normalizedPlatform.includes('direct');
};

// Helper function to get date range based on filter
const getDateRangeFromFilter = (yearFilter: number) => {
  const now = new Date();
  
  switch (yearFilter) {
    case -4: // Mois en cours
      return {
        startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(now), 'yyyy-MM-dd')
      };
    case -10: // Année en cours
      return {
        startDate: format(startOfYear(now), 'yyyy-MM-dd'),
        endDate: format(endOfYear(now), 'yyyy-MM-dd')
      };
    default: // Année spécifique ou plage personnalisée
      if (yearFilter > 0) {
        return {
          startDate: format(startOfYear(new Date(yearFilter, 0, 1)), 'yyyy-MM-dd'),
          endDate: format(endOfYear(new Date(yearFilter, 11, 31)), 'yyyy-MM-dd')
        };
      }
      return null; // Pas de filtre de date
  }
};

export const linkSellingService = {
  async getAllSales(filters: LinkSellingFilters = {}): Promise<LinkSelling[]> {
    try {
      let query = supabaseClient
        .from('link_selling')
        .select('*');

      // Apply date filter based on year parameter
      if (filters.year !== undefined && filters.year !== 0) {
        const dateRange = getDateRangeFromFilter(filters.year);
        
        if (dateRange) {
          query = query.gte('date', dateRange.startDate).lte('date', dateRange.endDate);
        }
      }

      // Filter by site if specified
      if (filters.site) {
        query = query.eq('site', filters.site);
      }

      // Filter by platform if specified
      if (filters.platform) {
        query = query.eq('plateforme', filters.platform);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) {
        console.error('Error fetching link selling data:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllSales:', error);
      return [];
    }
  },

  async getAvailableYears(): Promise<number[]> {
    try {
      const { data, error } = await supabaseClient
        .from('link_selling')
        .select('date')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching years:', error);
        return [new Date().getFullYear()];
      }

      const years = Array.from(new Set(
        (data || []).map(sale => new Date(sale.date).getFullYear())
      )).sort((a, b) => b - a);

      return years.length > 0 ? years : [new Date().getFullYear()];
    } catch (error) {
      console.error('Error in getAvailableYears:', error);
      return [new Date().getFullYear()];
    }
  },

  async getAvailableSites(): Promise<string[]> {
    try {
      const { data, error } = await supabaseClient
        .from('link_selling')
        .select('site')
        .order('site', { ascending: true });

      if (error) {
        console.error('Error fetching sites:', error);
        return [];
      }

      const sites = Array.from(new Set(
        (data || []).map(sale => sale.site)
      )).sort();

      return sites;
    } catch (error) {
      console.error('Error in getAvailableSites:', error);
      return [];
    }
  },

  async getAvailablePlatforms(): Promise<string[]> {
    try {
      const { data, error } = await supabaseClient
        .from('link_selling')
        .select('plateforme')
        .order('plateforme', { ascending: true });

      if (error) {
        console.error('Error fetching platforms:', error);
        return [];
      }

      const platforms = Array.from(new Set(
        (data || []).map(sale => sale.plateforme)
      )).sort((a, b) => a.localeCompare(b));

      return platforms;
    } catch (error) {
      console.error('Error in getAvailablePlatforms:', error);
      return [];
    }
  },

  async getStats(filters: LinkSellingFilters = {}): Promise<LinkSellingStats> {
    try {
      const sales = await this.getAllSales(filters);
      
      if (sales.length === 0) {
        return {
          totalAmount: 0,
          directSalesPercentage: 0,
          platformSalesPercentage: 0,
          topPlatforms: [],
          monthlyData: [],
          totalSales: 0,
          averagePricePerSite: 0,
          uniqueSites: 0,
          averagePricePerSale: 0
        };
      }

      // Calculate total amounts using the helper function
      const directSales = sales.filter(sale => isDirectSale(sale.plateforme));
      const platformSales = sales.filter(sale => !isDirectSale(sale.plateforme));

      const totalDirectAmount = directSales.reduce((sum, sale) => sum + Number(sale.montant), 0);
      const totalPlatformAmount = platformSales.reduce((sum, sale) => sum + Number(sale.montant), 0);
      const totalAmount = totalDirectAmount + totalPlatformAmount;

      // Calculate percentages
      const directSalesPercentage = totalAmount > 0 ? (totalDirectAmount / totalAmount) * 100 : 0;
      const platformSalesPercentage = totalAmount > 0 ? (totalPlatformAmount / totalAmount) * 100 : 0;

      // Calculate additional metrics
      const totalSales = sales.length;
      const uniqueSites = new Set(sales.map(sale => sale.site)).size;
      const averagePricePerSite = uniqueSites > 0 ? totalAmount / uniqueSites : 0;
      const averagePricePerSale = totalSales > 0 ? totalAmount / totalSales : 0;

      // Calculate top platforms
      const platformStats = sales.reduce((acc, sale) => {
        const platform = sale.plateforme;
        if (!acc[platform]) {
          acc[platform] = { montant: 0, count: 0 };
        }
        acc[platform].montant += Number(sale.montant);
        acc[platform].count += 1;
        return acc;
      }, {} as Record<string, { montant: number; count: number }>);

      const topPlatforms = Object.entries(platformStats)
        .map(([plateforme, stats]) => ({
          plateforme,
          montant: stats.montant,
          count: stats.count,
          percentage: totalAmount > 0 ? (stats.montant / totalAmount) * 100 : 0,
          averagePrice: stats.count > 0 ? stats.montant / stats.count : 0
        }))
        .sort((a, b) => b.montant - a.montant);

      // Calculate monthly data - TOUJOURS TOUTES LES DONNÉES POUR LE GRAPHIQUE MENSUEL
      const allSalesForMonthly = await this.getAllSalesForMonthlyChart();
      
      const monthlyStats = allSalesForMonthly.reduce((acc, sale) => {
        const month = format(parseISO(sale.date), 'yyyy-MM');
        if (!acc[month]) {
          acc[month] = { directSales: 0, platformSales: 0, count: 0 };
        }
        
        const isDirect = isDirectSale(sale.plateforme);
        
        if (isDirect) {
          acc[month].directSales += Number(sale.montant);
        } else {
          acc[month].platformSales += Number(sale.montant);
        }
        acc[month].count += 1;
        
        return acc;
      }, {} as Record<string, { directSales: number; platformSales: number; count: number }>);

      // Sort monthly data chronologically and format properly
      const monthlyData = Object.entries(monthlyStats)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => {
          const monthDate = parseISO(`${month}-01`);
          const formattedMonth = format(monthDate, 'MMM yyyy', { locale: fr });
          
          return {
            month: formattedMonth,
            directSales: data.directSales,
            platformSales: data.platformSales,
            total: data.directSales + data.platformSales,
            count: data.count,
            average: data.count > 0 ? (data.directSales + data.platformSales) / data.count : 0,
            sortKey: month
          };
        });

      const result = {
        totalAmount,
        directSalesPercentage,
        platformSalesPercentage,
        topPlatforms,
        monthlyData,
        totalSales,
        averagePricePerSite,
        uniqueSites,
        averagePricePerSale
      };

      return result;
    } catch (error) {
      console.error('Error in getStats:', error);
      return {
        totalAmount: 0,
        directSalesPercentage: 0,
        platformSalesPercentage: 0,
        topPlatforms: [],
        monthlyData: [],
        totalSales: 0,
        averagePricePerSite: 0,
        uniqueSites: 0,
        averagePricePerSale: 0
      };
    }
  },

  // Nouvelle méthode pour récupérer toutes les données pour le graphique mensuel
  async getAllSalesForMonthlyChart(): Promise<LinkSelling[]> {
    try {
      const { data, error } = await supabaseClient
        .from('link_selling')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching all sales for monthly chart:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllSalesForMonthlyChart:', error);
      return [];
    }
  },

  async getSitePerformance(filters: LinkSellingFilters = {}): Promise<Array<{
    site: string;
    revenue: number;
    sales: number;
    averagePrice: number;
    percentage: number;
  }>> {
    try {
      const sales = await this.getAllSales(filters);
      
      if (sales.length === 0) return [];

      const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.montant), 0);

      const siteStats = sales.reduce((acc, sale) => {
        const site = sale.site;
        if (!acc[site]) {
          acc[site] = { revenue: 0, sales: 0 };
        }
        acc[site].revenue += Number(sale.montant);
        acc[site].sales += 1;
        return acc;
      }, {} as Record<string, { revenue: number; sales: number }>);

      const result = Object.entries(siteStats)
        .map(([site, stats]) => ({
          site,
          revenue: stats.revenue,
          sales: stats.sales,
          averagePrice: stats.sales > 0 ? stats.revenue / stats.sales : 0,
          percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0
        }))
        .sort((a, b) => b.revenue - a.revenue);

      return result;
    } catch (error) {
      console.error('Error in getSitePerformance:', error);
      return [];
    }
  },

  async getPlatformPerformance(filters: LinkSellingFilters = {}): Promise<Array<{
    platform: string;
    revenue: number;
    sales: number;
    averagePrice: number;
    percentage: number;
  }>> {
    try {
      const sales = await this.getAllSales(filters);
      
      if (sales.length === 0) return [];

      const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.montant), 0);

      const platformStats = sales.reduce((acc, sale) => {
        const platform = sale.plateforme;
        if (!acc[platform]) {
          acc[platform] = { revenue: 0, sales: 0 };
        }
        acc[platform].revenue += Number(sale.montant);
        acc[platform].sales += 1;
        return acc;
      }, {} as Record<string, { revenue: number; sales: number }>);

      const result = Object.entries(platformStats)
        .map(([platform, stats]) => ({
          platform,
          revenue: stats.revenue,
          sales: stats.sales,
          averagePrice: stats.sales > 0 ? stats.revenue / stats.sales : 0,
          percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0
        }))
        .sort((a, b) => b.revenue - a.revenue);

      return result;
    } catch (error) {
      console.error('Error in getPlatformPerformance:', error);
      return [];
    }
  },

  async addSale(sale: Omit<LinkSelling, 'id' | 'created_at'>): Promise<LinkSelling | null> {
    try {
      const { data, error } = await supabaseClient
        .from('link_selling')
        .insert([sale])
        .select()
        .single();

      if (error) {
        console.error('Error adding sale:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in addSale:', error);
      return null;
    }
  },

  async updateSale(id: string, updates: Partial<Omit<LinkSelling, 'id' | 'created_at'>>): Promise<LinkSelling | null> {
    try {
      const { data, error } = await supabaseClient
        .from('link_selling')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating sale:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateSale:', error);
      return null;
    }
  },

  async deleteSale(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('link_selling')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting sale:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteSale:', error);
      return false;
    }
  }
};