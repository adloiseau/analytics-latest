import { RealTimeMetrics } from '../../types/analytics';
import { TrafficSourceData } from '../../types/traffic';
import { mapSourceName } from './sourceMapping';
import { GA_PROPERTY_IDS } from '../../config/analytics.config';
import { subDays, format } from 'date-fns';

async function fetchPeriodData(propertyId: string, accessToken: string, startDate: string, endDate: string) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: 'date' },
          { name: 'sessionSource' }
        ],
        metrics: [
          { name: 'sessions' }
        ]
      })
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export const analyticsApi = {
  async getMetricsData(propertyId: string, accessToken: string): Promise<RealTimeMetrics> {
    try {
      const response = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dateRanges: [
              { startDate: '7daysAgo', endDate: 'today' },
              { startDate: '14daysAgo', endDate: '8daysAgo' }
            ],
            metrics: [
              { name: 'activeUsers' },
              { name: 'screenPageViews' },
              { name: 'averageSessionDuration' },
              { name: 'bounceRate' }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const currentPeriod = data.rows?.[0]?.metricValues;
      const previousPeriod = data.rows?.[1]?.metricValues;

      return {
        activeUsers: parseInt(currentPeriod?.[0]?.value || '0'),
        pageViews: parseInt(currentPeriod?.[1]?.value || '0'),
        avgSessionDuration: parseFloat(currentPeriod?.[2]?.value || '0'),
        bounceRate: parseFloat(currentPeriod?.[3]?.value || '0'),
        previousPeriod: {
          activeUsers: parseInt(previousPeriod?.[0]?.value || '0'),
          pageViews: parseInt(previousPeriod?.[1]?.value || '0'),
          avgSessionDuration: parseFloat(previousPeriod?.[2]?.value || '0'),
          bounceRate: parseFloat(previousPeriod?.[3]?.value || '0')
        }
      };
    } catch (error) {
      throw error;
    }
  },

  async getRealTimeData(propertyId: string, accessToken: string): Promise<RealTimeMetrics> {
    try {
      const response = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metrics: [
              { name: 'activeUsers' }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const activeUsers = parseInt(data.rows?.[0]?.metricValues?.[0]?.value || '0');

      return {
        activeUsers,
        pageViews: 0,
        avgSessionDuration: 0,
        bounceRate: 0
      };
    } catch (error) {
      throw error;
    }
  },

  async getTrafficSourceData(
    websiteUrl: string,
    accessToken: string,
    startDate: string,
    endDate: string
  ): Promise<{ sourceData: TrafficSourceData[], timelineData: TrafficSourceData[] }> {
    try {
      const hostname = new URL(websiteUrl).hostname;
      const propertyId = GA_PROPERTY_IDS[hostname];

      if (!propertyId) {
        throw new Error(`No property ID found for ${hostname}`);
      }

      const currentStartDate = new Date(startDate);
      const currentEndDate = new Date(endDate);
      const daysDiff = Math.ceil((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const previousStartDate = format(subDays(currentStartDate, daysDiff), 'yyyy-MM-dd');
      const previousEndDate = format(subDays(currentEndDate, daysDiff), 'yyyy-MM-dd');

      const [currentPeriod, previousPeriod] = await Promise.all([
        fetchPeriodData(propertyId, accessToken, startDate, endDate),
        fetchPeriodData(propertyId, accessToken, previousStartDate, previousEndDate)
      ]);

      const sourceData = this.processSourceData(currentPeriod, previousPeriod);
      const timelineData = this.processTimelineData(currentPeriod);

      return { sourceData, timelineData };
    } catch (error) {
      throw error;
    }
  },

  processSourceData(currentPeriod: any, previousPeriod: any) {
    const currentData = new Map();
    const previousData = new Map();

    currentPeriod.rows?.forEach((row: any) => {
      const source = mapSourceName(row.dimensionValues[1].value);
      const sessions = parseInt(row.metricValues[0].value);
      currentData.set(source, (currentData.get(source) || 0) + sessions);
    });

    previousPeriod.rows?.forEach((row: any) => {
      const source = mapSourceName(row.dimensionValues[1].value);
      const sessions = parseInt(row.metricValues[0].value);
      previousData.set(source, (previousData.get(source) || 0) + sessions);
    });

    const sourceData: TrafficSourceData[] = [];
    currentData.forEach((currentValue, source) => {
      const previousValue = previousData.get(source) || 0;
      const trend = previousValue === 0 ? 0 : ((currentValue - previousValue) / previousValue) * 100;
      
      sourceData.push({
        date: format(new Date(), 'yyyy-MM-dd'),
        source,
        visitors: currentValue,
        previousVisitors: previousValue,
        trend
      });
    });

    return sourceData;
  },

  processTimelineData(currentPeriod: any) {
    const timelineMap = new Map<string, TrafficSourceData>();

    currentPeriod.rows?.forEach((row: any) => {
      const date = row.dimensionValues[0].value;
      const source = mapSourceName(row.dimensionValues[1].value);
      const sessions = parseInt(row.metricValues[0].value);

      if (!timelineMap.has(date)) {
        timelineMap.set(date, { date });
      }
      const entry = timelineMap.get(date)!;
      entry[source] = (entry[source] || 0) + sessions;
    });

    return Array.from(timelineMap.values());
  }
};