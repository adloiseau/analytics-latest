import { subDays, format } from 'date-fns';
import { TrafficSourceData } from '../../../types/traffic';
import { processSourceData } from './processSourceData';
import { processTimelineData } from './processTimelineData';

export async function getTrafficSourceData(
  propertyId: string,
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<{ sourceData: TrafficSourceData[], timelineData: TrafficSourceData[] }> {
  try {
    // Fetch current period data
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
            { name: 'activeUsers' }
          ],
          orderBys: [
            { dimension: { dimensionName: 'date' } }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch traffic data: ${response.statusText}`);
    }

    const data = await response.json();

    // Process the data
    const sourceData = processSourceData(data);
    const timelineData = processTimelineData(data);

    return { sourceData, timelineData };
  } catch (error) {
    throw error;
  }
}