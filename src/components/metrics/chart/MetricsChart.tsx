import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatMetric } from '../../../utils/metrics';
import { CustomTooltip } from './CustomTooltip';
import { ChartContainer } from './ChartContainer';
import { EmptyChart } from './EmptyChart';
import { ChartLegend } from './ChartLegend';
import { useWindowSize } from '../../../hooks/useWindowSize';

interface ChartDataPoint {
  date: string;
  clicks: number;
  impressions: number;
}

interface MetricsChartProps {
  data: ChartDataPoint[];
  title: string;
}

const formatDate = (dateStr: string) => {
  try {
    const date = parseISO(dateStr);
    return format(date, 'dd/MM', { locale: fr });
  } catch {
    return dateStr;
  }
};

export const MetricsChart: React.FC<MetricsChartProps> = ({ data, title }) => {
  const { width } = useWindowSize();
  const isMobile = width < 640;

  const formattedData = useMemo(() => 
    data?.map(item => ({
      ...item,
      displayDate: formatDate(item.date)
    })) || [], 
    [data]
  );

  if (!data?.length) {
    return (
      <ChartContainer title={title}>
        <EmptyChart />
      </ChartContainer>
    );
  }

  const latestData = formattedData[formattedData.length - 1];

  return (
    <ChartContainer title={title}>
      <ChartLegend 
        items={[
          { color: '#3b82f6', label: 'Clics', value: formatMetric(latestData.clicks) },
          { color: '#10b981', label: 'Impressions', value: formatMetric(latestData.impressions) }
        ]} 
      />
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={formattedData} 
          margin={{ 
            top: 10, 
            right: isMobile ? 10 : 30, 
            left: isMobile ? 0 : 10, 
            bottom: 5 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="displayDate"
            stroke="#666"
            tick={{ fill: '#666', fontSize: isMobile ? 10 : 12 }}
            tickMargin={10}
            interval={isMobile ? 'preserveStartEnd' : 0}
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
          <Tooltip 
            content={<CustomTooltip />}
            wrapperStyle={{ zIndex: 1000 }}
          />
          <Line 
            yAxisId="left"
            name="Clics"
            type="monotone" 
            dataKey="clicks" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: isMobile ? 3 : 4 }}
          />
          <Line 
            yAxisId="right"
            name="Impressions"
            type="monotone" 
            dataKey="impressions" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: isMobile ? 3 : 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};