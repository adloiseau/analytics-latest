import React from 'react';
import { useSearchConsoleData } from '../hooks/useSearchConsoleData';
import { Layout } from '../components/Layout';
import { TopMetricsCard } from '../components/TopMetricsCard';
import { MetricsChart } from '../components/metrics/chart/MetricsChart';
import { SiteSelector } from '../components/SiteSelector';

export const TopPages: React.FC = () => {
  const { data, isLoading, error } = useSearchConsoleData('page');

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
      <div className="space-y-4">
        <div className="w-full max-w-xs">
          <SiteSelector />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4">
            <TopMetricsCard 
              title="Top 5 Pages" 
              data={data?.rows || []} 
              dimension="page"
            />
          </div>
          <div className="lg:col-span-8">
            <MetricsChart 
              data={data?.chartData || []} 
              title="Évolution du Trafic"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};