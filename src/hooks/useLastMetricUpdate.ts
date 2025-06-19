import { useQuery } from 'react-query';
import { supabaseClient } from '../services/supabase/client';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const useLastMetricUpdate = () => {
  return useQuery(
    'lastMetricUpdate',
    async () => {
      try {
        const { data, error } = await supabaseClient
          .from('site_metrics')
          .select('date, created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching last metric update:', error);
          return null;
        }

        // Utiliser created_at s'il est disponible, sinon date
        const timestamp = data.created_at || data.date;
        
        if (timestamp) {
          const date = parseISO(timestamp);
          return format(date, 'dd/MM/yyyy à HH:mm', { locale: fr });
        }

        return null;
      } catch (error) {
        console.error('Error in useLastMetricUpdate:', error);
        return null;
      }
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      retry: 1
    }
  );
};