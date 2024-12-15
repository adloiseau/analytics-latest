import React from 'react';
import { Globe, Users, BarChart3, Search } from 'lucide-react';
import { Header } from '../components/Header';
import { MetricCard } from '../components/MetricCard';
import { TrafficChart } from '../components/TrafficChart';
import { KeywordsTable } from '../components/KeywordsTable';

export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#141517] text-white">
      <Header />
      
      <main className="p-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Pages Indexées"
            value="79,000"
            change={2.5}
            icon={<Globe className="w-5 h-5" />}
          />
          <MetricCard
            title="Visiteurs Uniques"
            value="120,000"
            change={5.8}
            icon={<Users className="w-5 h-5" />}
          />
          <MetricCard
            title="Trafic Direct"
            value="32,334"
            change={-1.2}
            icon={<BarChart3 className="w-5 h-5" />}
          />
          <MetricCard
            title="Position Moyenne"
            value="4.2"
            change={0.8}
            icon={<Search className="w-5 h-5" />}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TrafficChart />
          <div className="bg-[#25262b] rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Trafic par Source</h2>
            <div className="space-y-4">
              {[
                { name: 'Google Search', value: '45,280', change: 12.5 },
                { name: 'Direct', value: '28,150', change: -5.2 },
                { name: 'Bing', value: '15,920', change: 8.7 },
              ].map((source) => (
                <div key={source.name} className="flex items-center justify-between">
                  <span className="text-gray-300">{source.name}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-white font-medium">{source.value}</span>
                    <span className={source.change > 0 ? 'text-green-500' : 'text-red-500'}>
                      {source.change > 0 ? '+' : ''}{source.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Keywords Table */}
        <KeywordsTable />
      </main>
    </div>
  );
};