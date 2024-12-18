import { useQuery } from 'react-query';
import { searchConsoleApi } from '../services/googleAuth/api';
import { useAuth } from '../contexts/AuthContext';

export interface Site {
  siteUrl: string;
  permissionLevel: string;
}

export const useSearchConsoleSites = () => {
  const { accessToken, isAuthenticated } = useAuth();

  return useQuery<Site[]>(
    'sites',
    async () => {
      if (!accessToken) throw new Error('No access token');
      const response = await searchConsoleApi.fetchSites(accessToken);
      return response.siteEntry || [];
    },
    {
      enabled: !!accessToken && isAuthenticated,
      staleTime: 5 * 60 * 1000,
      retry: 2,
      onError: (error) => {
        console.error('Error fetching sites:', error);
      }
    }
  );
};