import type { SearchAnalyticsRow } from '../services/googleAuth/types';

export const filterData = (data: SearchAnalyticsRow[], searchQuery: string) => {
  if (!searchQuery) return data;
  
  const query = searchQuery.toLowerCase();
  return data.filter(row => {
    const value = row.keys[0].toLowerCase();
    return value.includes(query);
  });
};

export const deduplicateTableData = (data: SearchAnalyticsRow[]) => {
  const seen = new Set<string>();
  return data.filter(row => {
    const key = row.keys[0];
    const isDuplicate = seen.has(key);
    seen.add(key);
    return !isDuplicate;
  }).sort((a, b) => b.clicks - a.clicks);
};

export const prepareChartData = (data: SearchAnalyticsRow[]) => {
  return data
    .map(row => ({
      date: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const formatMetric = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const calculateTrend = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};