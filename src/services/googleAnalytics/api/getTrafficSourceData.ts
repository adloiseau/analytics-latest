import { DateRange } from '../../../types/filters';
import { fetchPeriodData } from './fetchPeriodData';
import { processSourceData } from './processSourceData';
import { processTimelineData } from './processTimelineData';

export async function getTrafficSourceData(
  propertyId: string,
  accessToken: string,
  dateRange: DateRange
): Promise<{
  currentPeriod: any;
  previousPeriod: any;
  timelineData: any[];
}> {
  try {
    // Fetch current period data
    const currentPeriodData = await fetchPeriodData(propertyId, accessToken, dateRange);
    
    // Process the data
    const processedData = processSourceData(currentPeriodData);
    const timelineData = processTimelineData(currentPeriodData);

    return {
      currentPeriod: processedData,
      previousPeriod: null, // Will be implemented if needed
      timelineData
    };
  } catch (error) {
    console.error('Error fetching traffic source data:', error);
    throw error;
  }
}