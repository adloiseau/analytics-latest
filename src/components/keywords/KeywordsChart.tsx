import React from 'react';
import { useSearchConsoleData } from '../../hooks/useSearchConsoleData';
import { useFilters } from '../../contexts/FilterContext';
import { format, parseISO, subDays } from 'date-fns';
import { getDateRange } from '../../utils/dates';
import { SearchAnalyticsChart } from '../metrics/SearchAnalyticsChart';
import { useSite } from '../../contexts/SiteContext';

export const KeywordsChart = () => {
  const { dateRange } = useFilters();
  const { selectedSite } = useSite();
  const { startDate, endDate } = getDateRange(dateRange);

  // Calculate previous period dates
  const currentStartDate = parseISO(startDate);
  const currentEndDate = parseISO(endDate);
  const daysDiff = Math.ceil((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const previousStartDate = format(subDays(currentStartDate, daysDiff), 'yyyy-MM-dd');
  const previousEndDate = format(subDays(currentEndDate, daysDiff), 'yyyy-MM-dd');

  // Fetch data for current and previous periods
  const { data: currentData, isLoading } = useSearchConsoleData('query', startDate, endDate);
  const { data: previousData } = useSearchConsoleData('query', previousStartDate, previousEndDate);

  if (!selectedSite) {
    return (
      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4">
        <div className="text-gray-400 text-center">Veuillez sélectionner un site</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-[400px] bg-[#1a1b1e]/50 rounded-lg" />
        </div>
      </div>
    );
  }

  // Combine current and previous period data
  const combinedData = currentData?.chartData?.map(current => {
    const previousDay = previousData?.chartData?.find(prev => 
      format(subDays(parseISO(prev.date), -daysDiff), 'yyyy-MM-dd') === current.date
    );

    return {
      date: current.date,
      clicks: current.clicks,
      impressions: current.impressions,
      previousClicks: previousDay?.clicks,
      previousImpressions: previousDay?.impressions
    };
  }) || [];

  return (
    <SearchAnalyticsChart 
      data={combinedData} 
      title="Évolution du Trafic"
      dimension="query"
      showPreviousPeriod={true}
    />
  );
};