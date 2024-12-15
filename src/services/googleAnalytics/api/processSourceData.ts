import { format } from 'date-fns';
import { TrafficSourceData } from '../../../types/traffic';
import { mapSourceName } from '../sourceMapping';
import { AnalyticsApiResponse } from '../types';
import { calculateTrend } from '../../../utils/traffic';

export function processSourceData(
  currentPeriod: AnalyticsApiResponse, 
  previousPeriod: AnalyticsApiResponse
): TrafficSourceData[] {
  const currentData = new Map<string, number>();
  const previousData = new Map<string, number>();

  // Agréger les données de la période actuelle
  currentPeriod.rows?.forEach((row) => {
    const source = mapSourceName(row.dimensionValues[1].value);
    const sessions = parseInt(row.metricValues[0].value);
    currentData.set(source, (currentData.get(source) || 0) + sessions);
  });

  // Agréger les données de la période précédente
  previousPeriod.rows?.forEach((row) => {
    const source = mapSourceName(row.dimensionValues[1].value);
    const sessions = parseInt(row.metricValues[0].value);
    previousData.set(source, (previousData.get(source) || 0) + sessions);
  });

  // Calculer les tendances
  const sourceData: TrafficSourceData[] = [];
  currentData.forEach((currentValue, source) => {
    const previousValue = previousData.get(source) || 0;
    const trend = calculateTrend(currentValue, previousValue);
    
    sourceData.push({
      date: format(new Date(), 'yyyy-MM-dd'),
      source,
      visitors: currentValue,
      previousVisitors: previousValue,
      trend
    });
  });

  return sourceData;
}