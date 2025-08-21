import { useQuery } from 'react-query';
import { gaPropertiesService } from '../services/supabase/gaProperties';

export const useGAProperties = () => {
  return useQuery(
    'gaProperties',
    () => gaPropertiesService.getAllProperties(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2
    }
  );
};

export const useGAPropertiesMap = () => {
  return useQuery(
    'gaPropertiesMap',
    () => gaPropertiesService.getPropertiesAsMap(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2
    }
  );
};