import { useState, useEffect } from 'react';
import { searchConsoleApi } from '../services/googleAuth/api';
import { googleAuthClient } from '../services/googleAuth/client';

export interface Site {
  siteUrl: string;
  permissionLevel: string;
}

export const useSearchConsoleSites = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSites = async () => {
      const token = googleAuthClient.getAccessToken();
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const response = await searchConsoleApi.fetchSites(token);
        if (response.siteEntry) {
          setSites(response.siteEntry);
        }
      } catch (err) {
        setError('Erreur lors du chargement des sites');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  return { sites, loading, error };
};