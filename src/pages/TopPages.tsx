import React from 'react';
import { useSearchConsoleData } from '../hooks/useSearchConsoleData';
import { Layout } from '../components/Layout';
import { TopMetricsCard } from '../components/TopMetricsCard';
import { MetricsChart } from '../components/MetricsChart';

export const TopPages: React.FC = () => {
  const { data, isLoading, error } = useSearchConsoleData('page');

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse">Chargement des données...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-red-500">Erreur: {error.message}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Top Pages</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TopMetricsCard 
            title="Top 5 Pages" 
            data={data?.rows || []} 
            dimension="page"
          />
          <MetricsChart 
            data={data?.rows || []} 
            title="Évolution du Trafic"
          />
        </div>

        <div className="bg-[#25262b] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1a1b1e]">
                <th className="px-6 py-3 text-left text-sm font-semibold">Page</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Clicks</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Impressions</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">CTR</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data?.rows?.map((row, index) => (
                <tr key={index} className="hover:bg-[#2d2e33]">
                  <td className="px-6 py-4 text-sm">
                    <div className="max-w-md truncate">{row.keys[0]}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">{row.clicks}</td>
                  <td className="px-6 py-4 text-sm text-right">{row.impressions}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    {(row.ctr * 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    {row.position.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};