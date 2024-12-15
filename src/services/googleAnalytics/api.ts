import { RealTimeMetrics } from '../../types/analytics';
import { TrafficSourceData } from '../../types/traffic';
import { mapSourceName } from './sourceMapping';
import { GA_PROPERTY_IDS } from '../../config/analytics.config';

export const analyticsApi = {
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
              { name: 'activeUsers' },
              { name: 'screenPageViews' },
              { name: 'eventCount' },
              { name: 'conversions' }
            ],
            minuteRanges: [{ 
              startMinutesAgo: 25,
              endMinutesAgo: 0
            }]
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const row = data.rows?.[0]?.metricValues || [];
      
      return {
        activeUsers: parseInt(row[0]?.value || '0'),
        pageViews: parseInt(row[1]?.value || '0'),
        avgSessionDuration: parseInt(row[2]?.value || '0'),
        bounceRate: parseFloat(row[3]?.value || '0')
      };
    } catch (error) {
      console.error('Error fetching Google Analytics data:', error);
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
      // Get the property ID from the configuration
      const hostname = new URL(websiteUrl).hostname;
      const propertyId = GA_PROPERTY_IDS[hostname];

      if (!propertyId) {
        throw new Error(`No property ID found for ${hostname}`);
      }

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

      const data = await response.json();
      const rows = data.rows || [];

      // Process data for both source summary and timeline
      const sourceData: TrafficSourceData[] = [];
      const timelineMap = new Map<string, TrafficSourceData>();

      rows.forEach((row: any) => {
        const date = row.dimensionValues[0].value;
        const source = mapSourceName(row.dimensionValues[1].value);
        const sessions = parseInt(row.metricValues[0].value);

        // Add to source data
        sourceData.push({
          date,
          source,
          visitors: sessions
        });

        // Add to timeline data
        if (!timelineMap.has(date)) {
          timelineMap.set(date, { date });
        }
        const timelineEntry = timelineMap.get(date)!;
        timelineEntry[source] = (timelineEntry[source] || 0) + sessions;
      });

      return {
        sourceData,
        timelineData: Array.from(timelineMap.values())
      };
    } catch (error) {
      console.error('Error fetching traffic source data:', error);
      throw error;
    }
  }
};