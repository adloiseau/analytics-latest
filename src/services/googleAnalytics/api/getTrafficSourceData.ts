import { format, parseISO, subDays, eachDayOfInterval } from 'date-fns';
import { mapSourceName } from '../sourceMapping';
import { TRAFFIC_SOURCES } from '../../../config/traffic-sources.config';

export async function getTrafficSourceData(
  propertyId: string,
  accessToken: string,
  dateRange: { startDate: string; endDate: string }
) {
  try {
    console.log('[getTrafficSourceData] Starting fetch with params:', { propertyId, dateRange });

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
          dateRanges: [{ 
            startDate: dateRange.startDate, 
            endDate: dateRange.endDate 
          }],
          dimensions: [
            { name: 'date' },
            { name: 'sessionSource' }
          ],
          metrics: [
            { name: 'totalUsers' }
          ],
          orderBys: [
            { dimension: { dimensionName: 'date' } }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch traffic source data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[getTrafficSourceData] Raw response:', { 
      rowCount: data.rows?.length,
      firstRow: data.rows?.[0],
      lastRow: data.rows?.[data.rows?.length - 1] 
    });

    // Generate all dates in the range
    const allDates = eachDayOfInterval({
      start: parseISO(dateRange.startDate),
      end: parseISO(dateRange.endDate)
    }).map(date => format(date, 'yyyy-MM-dd'));

    // Initialize timeline data with all dates and sources
    const timelineData = allDates.map(date => ({
      date,
      ...TRAFFIC_SOURCES.reduce((acc, source) => ({ ...acc, [source.name]: 0 }), {})
    }));

    // Initialize source totals
    const sourceTotals = {};

    // Process the data
    let totalProcessedRows = 0;
    data.rows?.forEach(row => {
      const date = row.dimensionValues[0].value;
      const source = mapSourceName(row.dimensionValues[1].value || 'Other');
      const visitors = parseInt(row.metricValues[0].value);

      // Update timeline data
      const dayData = timelineData.find(d => d.date === date);
      if (dayData) {
        dayData[source] = (dayData[source] || 0) + visitors;
      }

      // Update source totals
      sourceTotals[source] = (sourceTotals[source] || 0) + visitors;
      totalProcessedRows++;
    });

    // Create source data array with complete information
    const sourceData = TRAFFIC_SOURCES.map(sourceConfig => {
      const visitors = sourceTotals[sourceConfig.name] || 0;
      const sparklineData = timelineData.map(day => day[sourceConfig.name] || 0);

      return {
        name: sourceConfig.name,
        visitors,
        sparklineData,
        color: sourceConfig.color
      };
    }).filter(source => source.visitors > 0);

    console.log('[getTrafficSourceData] Processed data:', {
      totalProcessedRows,
      sourcesWithData: sourceData.length,
      timelineDataPoints: timelineData.length
    });

    const result = {
      sourceData,
      timelineData: timelineData.sort((a, b) => a.date.localeCompare(b.date))
    };

    console.log('[getTrafficSourceData] Final result:', {
      sourceDataLength: result.sourceData.length,
      timelineDataLength: result.timelineData.length,
      sources: result.sourceData.map(s => ({
        name: s.name,
        visitors: s.visitors,
        hasSparkline: s.sparklineData.length > 0
      }))
    });

    return result;
  } catch (error) {
    console.error('[getTrafficSourceData] Error:', error);
    throw error;
  }
}