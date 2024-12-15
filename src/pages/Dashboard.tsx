import React from 'react';
import { useSearchConsoleData } from '../hooks/useSearchConsoleData';
import { Layout } from '../components/Layout';
import { SiteMetricsRow } from '../components/dashboard/SiteMetricsRow';
import { useFilters } from '../contexts/FilterContext';
import { getDateRange } from '../utils/dates';
import { subDays, format } from 'date-fns';

export const Dashboard = () => {
  const { dateRange } = useFilters();
  const { startDate, endDate } = getDateRange(dateRange);

  // Calculer la période précédente
  const currentStartDate = new Date(startDate);
  const currentEndDate = new Date(endDate);
  const daysDiff = Math.ceil((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const previousStartDate = format(subDays(currentStartDate, daysDiff), 'yyyy-MM-dd');
  const previousEndDate = format(subDays(currentEndDate, daysDiff), 'yyyy-MM-dd');

  const { data: currentData, isLoading, error } = useSearchConsoleData('site');
  const { data: previousData } = useSearchConsoleData('site', previousStartDate, previousEndDate);

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
            {currentData?.rows?.map((site, index) => {
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