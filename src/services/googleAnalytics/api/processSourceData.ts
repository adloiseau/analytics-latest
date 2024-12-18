import { AnalyticsApiResponse } from '../types';

export function processSourceData(data: AnalyticsApiResponse) {
  if (!data.rows) {
    return {
      activeUsers: 0,
      pageViews: 0,
      activeUsersHistory: [],
      pageViewsHistory: []
    };
  }

  // Split rows into current and previous periods
  const midPoint = Math.floor(data.rows.length / 2);
  const currentPeriodRows = data.rows.slice(0, midPoint);
  const previousPeriodRows = data.rows.slice(midPoint);

  // Calculate totals for current period
  const currentTotals = currentPeriodRows.reduce((acc, row) => ({
    activeUsers: acc.activeUsers + parseInt(row.metricValues[0].value),
    pageViews: acc.pageViews + parseInt(row.metricValues[1].value)
  }), { activeUsers: 0, pageViews: 0 });

  // Calculate totals for previous period
  const previousTotals = previousPeriodRows.reduce((acc, row) => ({
    activeUsers: acc.activeUsers + parseInt(row.metricValues[0].value),
    pageViews: acc.pageViews + parseInt(row.metricValues[1].value)
  }), { activeUsers: 0, pageViews: 0 });

  // Create history arrays for current period
  const history = currentPeriodRows.map(row => ({
    date: row.dimensionValues[0].value,
    activeUsers: parseInt(row.metricValues[0].value),
    pageViews: parseInt(row.metricValues[1].value)
  }));

  return {
    ...currentTotals,
    previousPeriod: previousTotals,
    activeUsersHistory: history.map(item => ({
      date: item.date,
      value: item.activeUsers
    })),
    pageViewsHistory: history.map(item => ({
      date: item.date,
      value: item.pageViews
    }))
  };
}