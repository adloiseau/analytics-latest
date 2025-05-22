import React from 'react';
import { useSearchConsoleData } from '../hooks/useSearchConsoleData';
import { useMetrics } from '../hooks/useMetrics';
import { Layout } from '../components/Layout';
import { useFilters } from '../contexts/FilterContext';
import { useAuth } from '../contexts/AuthContext';
import { getDateRange } from '../utils/dates';
import { Globe, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatMetric } from '../utils/metrics';
import { SparklineGSC } from '../components/metrics/SparklineGSC';

const SiteCard = ({ site, previousSite }) => {
  const { data: siteMetrics } = useMetrics(site.keys[0]);
  const hostname = new URL(site.keys[0]).hostname;
  const favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

  const value = siteMetrics?.TO?.value || 0;
  const trend = siteMetrics?.TO?.trend || 0;
  
  // Generate more natural-looking data with smoother transitions
  const sparklineData = React.useMemo(() => {
    const baseValue = value * 0.7; // Base value for stability
    const variance = value * 0.3; // Maximum variance
    return [...Array(12)].map((_, i) => {
      // Use sine wave for smoother transitions
      const wave = Math.sin(i / 2) * 0.5 + 0.5;
      return baseValue + wave * variance;
    });
  }, [value]);

  return (
    <div className="bg-[#25262b]/50 rounded-lg border border-gray-800/10 hover:border-gray-700/30 
                    transition-all duration-200 hover:bg-[#25262b]/70 relative overflow-hidden group
                    h-[100px] flex flex-col">
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{
          background: `
            linear-gradient(180deg, 
              rgba(59, 130, 246, 0.08) 0%,
              rgba(59, 130, 246, 0.05) 30%,
              rgba(59, 130, 246, 0.02) 60%,
              rgba(59, 130, 246, 0.01) 100%
            ),
            linear-gradient(180deg,
              rgba(0, 0, 0, 0) 0%,
              rgba(0, 0, 0, 0.05) 100%
            )
          `
        }}>
          <div className="opacity-20 group-hover:opacity-30 transition-all duration-300 transform scale-110">
            <SparklineGSC data={sparklineData} color="#3b82f6" />
          </div>
        </div>
      </div>
      
      <div className="relative z-10 p-3 flex flex-col justify-between h-full">
        <div className="flex items-center gap-2">
          <img 
            src={favicon}
            alt={hostname}
            className="w-4 h-4 rounded-sm flex-shrink-0"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = Globe;
            }}
          />
          <h3 className="text-sm font-medium text-gray-300 truncate">{hostname}</h3>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className="text-2xl font-semibold text-white">{formatMetric(value)}</div>
          {trend !== 0 && (
            <div className={`flex items-center gap-0.5 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownRight className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const { dateRange } = useFilters();
  const { isInitialized } = useAuth();
  const { startDate, endDate } = getDateRange(dateRange);

  const { data: currentData, isLoading, error } = useSearchConsoleData('site');

  const sortedSites = React.useMemo(() => {
    if (!currentData?.rows) return [];
    return [...currentData.rows].sort((a, b) => b.clicks - a.clicks);
  }, [currentData?.rows]);

  if (!isInitialized) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-3">
        {isLoading ? (
          [...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-[100px] bg-[#25262b] rounded-lg" />
            </div>
          ))
        ) : error ? (
          <div className="col-span-full p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error.message}</p>
          </div>
        ) : (
          sortedSites.map((site, index) => (
            <SiteCard 
              key={index} 
              site={site} 
              previousSite={null}
            />
          ))
        )}
      </div>
    </Layout>
  );
};