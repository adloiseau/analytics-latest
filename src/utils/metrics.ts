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
  const uniqueRows = new Map<string, SearchAnalyticsRow>();
  
  data.forEach(row => {
    const key = row.keys[0];
    if (!uniqueRows.has(key) || row.clicks > uniqueRows.get(key)!.clicks) {
      uniqueRows.set(key, row);
    }
  });

  return Array.from(uniqueRows.values())
    .sort((a, b) => b.clicks - a.clicks);
};

export const prepareChartData = (data: SearchAnalyticsRow[]) => {
  return data.map(row => ({
    date: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions
  })).sort((a, b) => a.date.localeCompare(b.date));
};