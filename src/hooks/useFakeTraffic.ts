import { useQuery } from 'react-query';
import { fakeTrafficService } from '../services/supabase/fakeTraffic';
import { FakeTrafficFilters } from '../types/fakeTraffic';

export const useFakeTrafficLogs = (filters: FakeTrafficFilters = {}, page: number = 1, limit: number = 50) => {
  return useQuery(
    ['fakeTrafficLogs', filters, page, limit],
    () => fakeTrafficService.getAllLogs(filters, page, limit),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: false,
      keepPreviousData: true
    }
  );
};

export const useFakeTrafficQueryData = (filters: FakeTrafficFilters = {}) => {
  return useQuery(
    ['fakeTrafficQueryData', filters],
    () => fakeTrafficService.getQueryTrafficData(filters),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false
    }
  );
};

export const useFakeTrafficDailyDistribution = (date: string, filters: FakeTrafficFilters = {}) => {
  return useQuery(
    ['fakeTrafficDailyDistribution', date, filters],
    () => fakeTrafficService.getDailyDistribution(date, filters),
    {
      enabled: !!date,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  );
};

export const useFakeTrafficQueries = (filters: FakeTrafficFilters = {}) => {
  return useQuery(
    ['fakeTrafficQueries', filters],
    () => fakeTrafficService.getAvailableQueries(filters),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false
    }
  );
};

export const useFakeTrafficDomains = (filters: FakeTrafficFilters = {}) => {
  return useQuery(
    ['fakeTrafficDomains', filters],
    () => fakeTrafficService.getAvailableDomains(filters),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false
    }
  );
};

export const useFakeTrafficStats = (filters: FakeTrafficFilters = {}) => {
  return useQuery(
    ['fakeTrafficStats', filters],
    () => fakeTrafficService.getStats(filters),
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  );
};

export const useFakeTrafficTypes = (filters: FakeTrafficFilters = {}) => {
  return useQuery(
    ['fakeTrafficTypes', filters],
    () => fakeTrafficService.getAvailableTypes(filters),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false
    }
  );
};