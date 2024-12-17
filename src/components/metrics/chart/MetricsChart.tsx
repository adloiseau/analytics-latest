import React, { useMemo } from 'react';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatMetric } from '../../../utils/metrics';
import { isPendingData } from '../../../utils/metrics/searchConsole';
import { CustomTooltip } from './CustomTooltip';
import { ChartContainer } from './ChartContainer';
import { EmptyChart } from './EmptyChart';
import { ChartLegend } from './ChartLegend';
import { PendingDataLine } from './PendingDataLine';
import { useWindowSize } from '../../../hooks/useWindowSize';
import { useSelectedItem } from '../../../contexts/SelectedItemContext';

interface ChartDataPoint {
  date: string;
  clicks: number;
  impressions: number;
  keys?: string[];
}

interface MetricsChartProps {
  data: ChartDataPoint[];
  title: string;
  dimension?: 'page' | 'query';
}

const formatDate = (dateStr: string) => {
  try {
    const date = parseISO(dateStr);
    return format(date, 'dd/MM', { locale: fr });
  } catch {
    return dateStr;
  }
};

export const MetricsChart: React.FC<MetricsChartProps> = ({ data, title, dimension }) => {
  const { width } = useWindowSize();
  const { selectedItem } = useSelectedItem();
  const isMobile = width < 640;

  const formattedData = useMemo(() => {
    if (!data?.length) return [];

    let filteredData = data;
    if (selectedItem && dimension) {
      filteredData = data.filter(item => {
        if (item.date === selectedItem) return true;
        return false;
      });
    }

    return filteredData.map(item => {
      const pending = isPendingData(item.date);
      return {
        ...item,
        displayDate: formatDate(item.date),
        // Données confirmées
        confirmedClicks: pending ? null : item.clicks,
        confirmedImpressions: pending ? null : item.impressions,
        // Données en attente
        pendingClicks: pending ? item.clicks : null,
        pendingImpressions: pending ? item.impressions : null,
      };
    });
  }, [data, selectedItem, dimension]);

  if (!data?.length) {
    return (
      <ChartContainer title={title}>
        <EmptyChart />
      </ChartContainer>
    );
  }

  const latestData = formattedData[formattedData.length - 1];
  const chartHeight = isMobile ? 280 : 400;

  return (
    <ChartContainer title={title}>
      <ChartLegend 
        items={[
          { color: '#3b82f6', label: 'Clics', value: formatMetric(latestData.clicks) },
          { color: '#10b981', label: 'Impressions', value: formatMetric(latestData.impressions) }
        ]} 
      />
      <div className="h-full w-full touch-manipulation" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={formattedData} 
            margin={{ 
              top: 20, 
              right: isMobile ? 15 : 30, 
              left: isMobile ? -15 : 10, 
              bottom: 5 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="displayDate"
              stroke="#666"
              tick={{ fill: '#666', fontSize: isMobile ? 10 : 12 }}
              tickMargin={10}
            />
            <YAxis 
              yAxisId="left"
              stroke="#3b82f6"
              tick={{ fill: '#3b82f6', fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 40 : 60}
              tickFormatter={formatMetric}
              label={!isMobile ? { 
                value: 'Clics', 
                angle: -90, 
                position: 'insideLeft', 
                fill: '#3b82f6',
                style: { fontSize: 12 }
              } : undefined}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              tick={{ fill: '#10b981', fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 40 : 60}
              tickFormatter={formatMetric}
              label={!isMobile ? { 
                value: 'Impressions', 
                angle: 90, 
                position: 'insideRight', 
                fill: '#10b981',
                style: { fontSize: 12 }
              } : undefined}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <PendingDataLine
              dataKey="Clicks"
              yAxisId="left"
              name="Clics"
              color="#3b82f6"
            />
            <PendingDataLine
              dataKey="Impressions"
              yAxisId="right"
              name="Impressions"
              color="#10b981"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};