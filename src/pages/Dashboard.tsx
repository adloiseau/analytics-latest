import React from 'react';
import { useSearchConsoleData } from '../hooks/useSearchConsoleData';
import { Layout } from '../components/Layout';
import { SiteMetricsRow } from '../components/dashboard/SiteMetricsRow';

export const Dashboard = () => {
  const { data, isLoading, error } = useSearchConsoleData('site');

  return (
    <Layout>
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-[160px] bg-[#25262b] rounded-lg" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error.message}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.rows?.map((site, index) => (
              <SiteMetricsRow key={index} site={site} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};