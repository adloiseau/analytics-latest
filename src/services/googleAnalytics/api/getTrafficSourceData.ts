import { format, parseISO, subDays, eachDayOfInterval } from 'date-fns';
import { mapSourceName } from '../sourceMapping';
import { TRAFFIC_SOURCES } from '../../../config/traffic-sources.config';

export async function getTrafficSourceData(
  propertyId: string,
  accessToken: string,
  dateRange: { startDate: string; endDate: string }
) {
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

    const allDates = eachDayOfInterval({
      start: parseISO(dateRange.startDate),
      end: parseISO(dateRange.endDate)
    }).map(date => format(date, 'yyyy-MM-dd'));

    const timelineData = allDates.map(date => ({
      date,
      ...TRAFFIC_SOURCES.reduce((acc, source) => ({ ...acc, [source.name]: 0 }), {})
    }));

    const sourceTotals = {};

    data.rows?.forEach(row => {
      const date = row.dimensionValues[0].value;
      const source = mapSourceName(row.dimensionValues[1].value || 'Other');
      const visitors = parseInt(row.metricValues[0].value);

      const dayData = timelineData.find(d => d.date === date);
      if (dayData) {
        dayData[source] = (dayData[source] || 0) + visitors;
      }

      sourceTotals[source] = (sourceTotals[source] || 0) + visitors;
    });

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

    return {
      sourceData,
      timelineData: timelineData.sort((a, b) => a.date.localeCompare(b.date))
    };
  } catch (error) {
    throw error;
  }
}