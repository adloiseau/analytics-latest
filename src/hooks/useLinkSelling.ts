import { useQuery, useMutation, useQueryClient } from 'react-query';
import { linkSellingService, LinkSellingFilters } from '../services/supabase/linkSelling';
import { LinkSelling } from '../types/linkSelling';

export const useLinkSelling = (filters: LinkSellingFilters = {}) => {
  return useQuery(
    ['linkSelling', filters],
    () => linkSellingService.getAllSales(filters),
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  );
};

export const useLinkSellingStats = (filters: LinkSellingFilters = {}) => {
  return useQuery(
    ['linkSellingStats', filters],
    () => linkSellingService.getStats(filters),
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  );
};

export const useSitePerformance = (filters: LinkSellingFilters = {}) => {
  return useQuery(
    ['sitePerformance', filters],
    () => linkSellingService.getSitePerformance(filters),
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  );
};

export const usePlatformPerformance = (filters: LinkSellingFilters = {}) => {
  return useQuery(
    ['platformPerformance', filters],
    () => linkSellingService.getPlatformPerformance(filters),
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  );
};

export const useAvailableSites = () => {
  return useQuery(
    'linkSellingSites',
    () => linkSellingService.getAvailableSites(),
    {
      staleTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  );
};

export const useAvailablePlatforms = () => {
  return useQuery(
    'linkSellingPlatforms',
    () => linkSellingService.getAvailablePlatforms(),
    {
      staleTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  );
};

export const useAddSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (sale: Omit<LinkSelling, 'id' | 'created_at'>) => linkSellingService.addSale(sale),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('linkSelling');
        queryClient.invalidateQueries('linkSellingStats');
        queryClient.invalidateQueries('linkSellingSites');
        queryClient.invalidateQueries('linkSellingPlatforms');
        queryClient.invalidateQueries('sitePerformance');
        queryClient.invalidateQueries('platformPerformance');
      }
    }
  );
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, updates }: { id: string; updates: Partial<Omit<LinkSelling, 'id' | 'created_at'>> }) => 
      linkSellingService.updateSale(id, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('linkSelling');
        queryClient.invalidateQueries('linkSellingStats');
        queryClient.invalidateQueries('linkSellingSites');
        queryClient.invalidateQueries('linkSellingPlatforms');
        queryClient.invalidateQueries('sitePerformance');
        queryClient.invalidateQueries('platformPerformance');
      }
    }
  );
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: string) => linkSellingService.deleteSale(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('linkSelling');
        queryClient.invalidateQueries('linkSellingStats');
        queryClient.invalidateQueries('linkSellingSites');
        queryClient.invalidateQueries('linkSellingPlatforms');
        queryClient.invalidateQueries('sitePerformance');
        queryClient.invalidateQueries('platformPerformance');
      }
    }
  );
};