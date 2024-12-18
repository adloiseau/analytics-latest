import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatMetric } from '../../utils/metrics';
import { CustomTooltip } from './chart/CustomTooltip';
import { ChartContainer } from './chart/ChartContainer';
import { EmptyChart } from './chart/EmptyChart';
import { ChartLegend } from './chart/ChartLegend';
import { useWindowSize } from '../../hooks/useWindowSize';

interface ChartDataPoint {
  date: string;
  clicks: number;
  impressions: number;
  previousClicks?: number;
  previousImpressions?: number;
  keys?: string[];
}

interface SearchAnalyticsChartProps {
  data: ChartDataPoint[];
  title: string;
  dimension?: 'page' | 'query';
  showPreviousPeriod?: boolean;
}

export const SearchAnalyticsChart: React.FC<SearchAnalyticsChartProps> = ({ 
  data, 
  title, 
  dimension,
  showPreviousPeriod = false 
}) => {
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

  // Définition des couleurs pour une meilleure différenciation
  const colors = {
    currentClicks: '#3b82f6', // Bleu vif
    currentImpressions: '#10b981', // Vert vif
    previousClicks: '#93c5fd', // Bleu plus clair
    previousImpressions: '#6ee7b7' // Vert plus clair
  };

  return (
    <ChartContainer title={title}>
      <ChartLegend 
        items={[
          { color: colors.currentClicks, label: 'Clics', value: formatMetric(latestData.clicks) },
          { color: colors.currentImpressions, label: 'Impressions', value: formatMetric(latestData.impressions) }
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
              stroke={colors.currentClicks}
              tick={{ fill: colors.currentClicks, fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 40 : 60}
              tickFormatter={formatMetric}
              label={!isMobile ? { 
                value: 'Clics', 
                angle: -90, 
                position: 'insideLeft', 
                fill: colors.currentClicks,
                style: { fontSize: 12 }
              } : undefined}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke={colors.currentImpressions}
              tick={{ fill: colors.currentImpressions, fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 40 : 60}
              tickFormatter={formatMetric}
              label={!isMobile ? { 
                value: 'Impressions', 
                angle: 90, 
                position: 'insideRight', 
                fill: colors.currentImpressions,
                style: { fontSize: 12 }
              } : undefined}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Current period lines */}
            <Line
              yAxisId="left"
              name="Clics (période actuelle)"
              type="monotone"
              dataKey="clicks"
              stroke={colors.currentClicks}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              name="Impressions (période actuelle)"
              type="monotone"
              dataKey="impressions"
              stroke={colors.currentImpressions}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />

            {/* Previous period lines */}
            {showPreviousPeriod && (
              <>
                <Line
                  yAxisId="left"
                  name="Clics (période précédente)"
                  type="monotone"
                  dataKey="previousClicks"
                  stroke={colors.previousClicks}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  name="Impressions (période précédente)"
                  type="monotone"
                  dataKey="previousImpressions"
                  stroke={colors.previousImpressions}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};