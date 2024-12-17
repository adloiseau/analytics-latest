import React, { useMemo } from 'react';
import { useSearchConsoleData } from '../hooks/useSearchConsoleData';
import { Layout } from '../components/Layout';
import { SiteMetricsRow } from '../components/dashboard/SiteMetricsRow';
import { useFilters } from '../contexts/FilterContext';
import { useAuth } from '../contexts/AuthContext';
import { getDateRange } from '../utils/dates';
import { subDays, format } from 'date-fns';

export const Dashboard = () => {
  const { dateRange } = useFilters();
  const { isInitialized } = useAuth();
  const { startDate, endDate } = getDateRange(dateRange);

  // Calculate previous period
  const currentStartDate = new Date(startDate);
  const currentEndDate = new Date(endDate);
  const daysDiff = Math.ceil((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const previousStartDate = format(subDays(currentStartDate, daysDiff), 'yyyy-MM-dd');
  const previousEndDate = format(subDays(currentEndDate, daysDiff), 'yyyy-MM-dd');

  const { data: currentData, isLoading, error } = useSearchConsoleData('site');
  const { data: previousData } = useSearchConsoleData('site', previousStartDate, previousEndDate);

  // Sort sites by organic traffic (TO)
  const sortedSites = useMemo(() => {
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
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
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
          <div className="space-y-4">
            {sortedSites.map((site, index) => {
              const previousSite = previousData?.rows?.find(
                prev => prev.keys[0] === site.keys[0]
              );
              return (
                <SiteMetricsRow 
                  key={index} 
                  site={site} 
                  previousPeriodData={previousSite}
                />
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};