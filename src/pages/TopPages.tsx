import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchConsoleData } from '../hooks/useSearchConsoleData';
import { Layout } from '../components/Layout';
import { TopMetricsCard } from '../components/TopMetricsCard';
import { MetricsChart } from '../components/metrics/chart/MetricsChart';
import { SiteSelector } from '../components/SiteSelector';
import { ViewSelector } from '../components/ViewSelector';
import { DataTable } from '../components/DataTable';
import { SelectedItemProvider } from '../contexts/SelectedItemContext';

export const TopPages: React.FC = () => {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') || 'pages';
  const dimension = view === 'countries' ? 'country' : view === 'keywords' ? 'query' : 'page';
  const { data, isLoading, error } = useSearchConsoleData(dimension);

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-[200px] bg-[#25262b] rounded-lg" />
          <div className="h-[400px] bg-[#25262b] rounded-lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">Erreur: {error.message}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SelectedItemProvider>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-full max-w-xs">
              <SiteSelector />
            </div>
            <ViewSelector />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <TopMetricsCard 
                title={`Top 5 ${view === 'countries' ? 'Pays' : view === 'keywords' ? 'Mots-clés' : 'Pages'}`} 
                data={data?.rows || []} 
                dimension={dimension}
              />
            </div>
            <div className="lg:col-span-8">
              <MetricsChart 
                data={data?.chartData || []} 
                title="Évolution du Trafic"
                dimension={dimension}
              />
            </div>
          </div>
          <DataTable data={data?.rows || []} dimension={dimension} />
        </div>
      </SelectedItemProvider>
    </Layout>
  );
};