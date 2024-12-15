import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatMetric } from '../utils/metrics';
import { CustomTooltip } from './metrics/chart/CustomTooltip';

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
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#25262b] rounded-lg p-6 h-full">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className="h-[400px] flex items-center justify-center text-gray-400">
          Aucune donnée disponible pour la période sélectionnée
        </div>
      </div>
    );
  }

  const formattedData = data.map(item => ({
    ...item,
    displayDate: formatDate(item.date)
  }));

  return (
    <div className="bg-[#25262b] rounded-lg p-6 h-full">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={formattedData} 
            margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="displayDate"
              stroke="#666"
              tick={{ fill: '#666', fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis 
              yAxisId="left"
              stroke="#3b82f6"
              tick={{ fill: '#3b82f6', fontSize: 12 }}
              width={60}
              tickFormatter={formatMetric}
              label={{ 
                value: 'Clics', 
                angle: -90, 
                position: 'insideLeft', 
                fill: '#3b82f6',
                style: { fontSize: 12 }
              }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              tick={{ fill: '#10b981', fontSize: 12 }}
              width={60}
              tickFormatter={formatMetric}
              label={{ 
                value: 'Impressions', 
                angle: 90, 
                position: 'insideRight', 
                fill: '#10b981',
                style: { fontSize: 12 }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36}
              wrapperStyle={{ fontSize: '12px' }}
            />
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
    </div>
  );
};