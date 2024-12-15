import { RealTimeMetrics } from '../../types/analytics';
import { TrafficSourceData } from '../../types/traffic';
import { mapSourceName } from './sourceMapping';
import { GA_PROPERTY_IDS } from '../../config/analytics.config';
import { subDays, format } from 'date-fns';

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
            dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
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
      const metrics = data.rows?.[0]?.metricValues || [];

      return {
        activeUsers: parseInt(metrics[0]?.value || '0'),
        pageViews: parseInt(metrics[1]?.value || '0'),
        avgSessionDuration: parseFloat(metrics[2]?.value || '0'),
        bounceRate: parseFloat(metrics[3]?.value || '0')
      };
    } catch (error) {
      console.error('Error fetching Google Analytics metrics data:', error);
      return {
        activeUsers: 0,
        pageViews: 0,
        avgSessionDuration: 0,
        bounceRate: 0
      };
    }
  },

  async getRealTimeData(propertyId: string, accessToken: string): Promise<RealTimeMetrics> {
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
            dateRanges: [{ startDate: '30min', endDate: 'now' }],
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
      const metrics = data.rows?.[0]?.metricValues || [];

      return {
        activeUsers: parseInt(metrics[0]?.value || '0'),
        pageViews: parseInt(metrics[1]?.value || '0'),
        avgSessionDuration: parseFloat(metrics[2]?.value || '0'),
        bounceRate: parseFloat(metrics[3]?.value || '0')
      };
    } catch (error) {
      console.error('Error fetching Google Analytics real-time data:', error);
      return {
        activeUsers: 0,
        pageViews: 0,
        avgSessionDuration: 0,
        bounceRate: 0
      };
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

      // Calculer la période précédente
      const currentStartDate = new Date(startDate);
      const currentEndDate = new Date(endDate);
      const daysDiff = Math.ceil((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const previousStartDate = format(subDays(currentStartDate, daysDiff), 'yyyy-MM-dd');
      const previousEndDate = format(subDays(currentEndDate, daysDiff), 'yyyy-MM-dd');

      // Récupérer les données pour les deux périodes
      const [currentPeriod, previousPeriod] = await Promise.all([
        this.fetchPeriodData(propertyId, accessToken, startDate, endDate),
        this.fetchPeriodData(propertyId, accessToken, previousStartDate, previousEndDate)
      ]);

      // Traiter les données
      const sourceData = this.processSourceData(currentPeriod, previousPeriod);
      const timelineData = this.processTimelineData(currentPeriod);

      return { sourceData, timelineData };
    } catch (error) {
      console.error('Error fetching traffic source data:', error);
      throw error;
    }
  },

  async fetchPeriodData(propertyId: string, accessToken: string, startDate: string, endDate: string) {
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
      const error = await response.json();
      throw new Error(error.error?.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  processSourceData(currentPeriod: any, previousPeriod: any) {
    const currentData = new Map();
    const previousData = new Map();

    // Agréger les données de la période actuelle
    currentPeriod.rows?.forEach((row: any) => {
      const source = mapSourceName(row.dimensionValues[1].value);
      const sessions = parseInt(row.metricValues[0].value);
      currentData.set(source, (currentData.get(source) || 0) + sessions);
    });

    // Agréger les données de la période précédente
    previousPeriod.rows?.forEach((row: any) => {
      const source = mapSourceName(row.dimensionValues[1].value);
      const sessions = parseInt(row.metricValues[0].value);
      previousData.set(source, (previousData.get(source) || 0) + sessions);
    });

    // Calculer les tendances
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