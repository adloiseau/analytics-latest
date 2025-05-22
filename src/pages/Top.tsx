import React from 'react';
import { useSearchConsoleData } from '../hooks/useSearchConsoleData';
import { Layout } from '../components/Layout';
import { TopMetricsCard } from '../components/TopMetricsCard';
import { SiteSelector } from '../components/SiteSelector';
import { SelectedItemProvider } from '../contexts/SelectedItemContext';

export const Top: React.FC = () => {
  const { data: pagesData } = useSearchConsoleData('page');
  const { data: queriesData } = useSearchConsoleData('query');
  const { data: countriesData } = useSearchConsoleData('country');

  return (
    <Layout>
      <SelectedItemProvider>
        <div className="space-y-4">
          <div className="w-full max-w-[300px]">
            <SiteSelector />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <TopMetricsCard 
              title="Top 5 Pages" 
              data={pagesData?.rows || []} 
              dimension="page"
            />
            <TopMetricsCard 
              title="Top 5 Requêtes" 
              data={queriesData?.rows || []} 
              dimension="query"
            />
            <TopMetricsCard 
              title="Top 5 Pays" 
              data={countriesData?.rows || []} 
              dimension="country"
            />
          </div>
        </div>
      </SelectedItemProvider>
    </Layout>
  );
};