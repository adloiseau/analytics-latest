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

  const filteredData = selectedItem
    ? data?.chartData?.filter(item => item.keys?.includes(selectedItem))
    : data?.chartData;

  return (
    <MetricsChart 
      data={filteredData || []} 
      title="Évolution des Positions"
      dimension="query"
    />
  );
};