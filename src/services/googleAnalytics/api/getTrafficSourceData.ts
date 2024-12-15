import { subDays, format } from 'date-fns';
import { GA_PROPERTY_IDS } from '../../../config/analytics.config';
import { TrafficSourceData } from '../../../types/traffic';
import { fetchPeriodData } from './fetchPeriodData';
import { processSourceData } from './processSourceData';
import { processTimelineData } from './processTimelineData';

export async function getTrafficSourceData(
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
      fetchPeriodData(propertyId, accessToken, startDate, endDate),
      fetchPeriodData(propertyId, accessToken, previousStartDate, previousEndDate)
    ]);

    // Traiter les données avec les tendances
    const sourceData = processSourceData(currentPeriod, previousPeriod);
    const timelineData = processTimelineData(currentPeriod);

    return { sourceData, timelineData };
  } catch (error) {
    console.error('Error fetching traffic source data:', error);
    throw error;
  }
}