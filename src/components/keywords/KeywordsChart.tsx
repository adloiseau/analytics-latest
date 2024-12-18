import React from 'react';
import { useSearchConsoleData } from '../../hooks/useSearchConsoleData';
import { MetricsChart } from '../metrics/chart/MetricsChart';
import { useSelectedItem } from '../../contexts/SelectedItemContext';

export const KeywordsChart = () => {
  const { data, isLoading } = useSearchConsoleData('query');
  const { selectedItem } = useSelectedItem();

  if (isLoading) {
    return (
      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-[400px] bg-[#1a1b1e]/50 rounded-lg" />
        </div>
      </div>
    );
  }

  // Filter data based on selected item if any
  const chartData = selectedItem
    ? data?.rows?.filter(item => item.keys[0] === selectedItem)
    : data?.rows;

  // Transform data for the chart
  const transformedData = data?.chartData?.map(item => ({
    date: item.date,
    clicks: item.clicks,
    impressions: item.impressions,
    keys: item.keys
  })) || [];

  return (
    <MetricsChart 
      data={transformedData} 
      title="Évolution des Positions"
      dimension="query"
    />
  );
};