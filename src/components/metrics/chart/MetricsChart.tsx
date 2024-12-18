import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
  keys?: string[];
}

interface MetricsChartProps {
  data: ChartDataPoint[];
  title: string;
  dimension?: 'page' | 'query';
}

export const MetricsChart: React.FC<MetricsChartProps> = ({ data, title, dimension }) => {
  const { width } = useWindowSize();
  const isMobile = width < 640;

  if (!data?.length) {
    return (
      <ChartContainer title={title}>
        <EmptyChart />
      </ChartContainer>
    );
  }

  const latestData = data[data.length - 1];
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
            data={data} 
            margin={{ 
              top: 20, 
              right: isMobile ? 15 : 30, 
              left: isMobile ? -15 : 10, 
              bottom: 5 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="date"
              stroke="#666"
              tick={{ fill: '#666', fontSize: isMobile ? 10 : 12 }}
              tickFormatter={(date) => format(parseISO(date), 'dd MMM', { locale: fr })}
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
            <Line
              yAxisId="left"
              name="Clics"
              type="monotone"
              dataKey="clicks"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              name="Impressions"
              type="monotone"
              dataKey="impressions"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};