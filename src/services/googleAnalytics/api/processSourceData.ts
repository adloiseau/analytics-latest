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

  // Calculate totals
  const totals = data.rows.reduce((acc, row) => {
    return {
      activeUsers: acc.activeUsers + parseInt(row.metricValues[0].value),
      pageViews: acc.pageViews + parseInt(row.metricValues[1].value)
    };
  }, { activeUsers: 0, pageViews: 0 });

  // Create history arrays
  const history = data.rows.map(row => ({
    date: row.dimensionValues[0].value,
    activeUsers: parseInt(row.metricValues[0].value),
    pageViews: parseInt(row.metricValues[1].value)
  }));

  return {
    ...totals,
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