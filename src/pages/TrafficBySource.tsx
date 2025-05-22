import React from 'react';
import { Layout } from '../components/Layout';
import { SiteSelector } from '../components/SiteSelector';
import { TrafficSourcesList } from '../components/traffic/TrafficSourcesList';
import { TrafficSourcesChart } from '../components/traffic/TrafficSourcesChart';
import { TrafficSourceProvider } from '../contexts/TrafficSourceContext';

export const TrafficBySource: React.FC = () => {
  return (
    <Layout>
      <TrafficSourceProvider>
        <div className="space-y-4">
          <div className="w-full max-w-[300px]">
            <SiteSelector />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <TrafficSourcesList />
            </div>
            <div className="lg:col-span-8">
              <TrafficSourcesChart />
            </div>
          </div>
        </div>
      </TrafficSourceProvider>
    </Layout>
  );
};