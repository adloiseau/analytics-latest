import { useQuery } from 'react-query';
import { searchConsoleApi } from '../services/googleAuth/api';
import { useAuth } from '../contexts/AuthContext';

export interface Site {
  siteUrl: string;
  permissionLevel: string;
}

export const useSearchConsoleSites = () => {
  const { accessToken, isAuthenticated, isInitialized } = useAuth();

  return useQuery<Site[]>(
    'sites',
    async () => {
      if (!accessToken || !isAuthenticated) {
        return [];
      }
      const response = await searchConsoleApi.fetchSites(accessToken);
      return response.siteEntry || [];
    },
    {
      enabled: isInitialized && isAuthenticated && !!accessToken,
      staleTime: 5 * 60 * 1000,
      retry: false
    }
  );
};