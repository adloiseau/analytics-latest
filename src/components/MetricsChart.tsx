import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SearchAnalyticsRow } from '../services/googleAuth/types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MetricsChartProps {
  data: SearchAnalyticsRow[];
  title: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    try {
      const date = parseISO(label);
      return (
        <div className="bg-[#1a1b1e] p-3 rounded-lg shadow-lg border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">
            {format(date, 'dd MMMM yyyy', { locale: fr })}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-300 text-sm">
                {entry.name}: {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  }
  return null;
};

export const MetricsChart: React.FC<MetricsChartProps> = ({ data, title }) => {
  const formattedData = data.map(row => {
    try {
      const date = row.keys[1]; // Assuming the date is the second key
      return {
        date,
        clicks: row.clicks,
        impressions: row.impressions,
        displayDate: format(parseISO(date), 'dd/MM', { locale: fr })
      };
    } catch (error) {
      console.error('Error processing data point:', error);
      return null;
    }
  }).filter(Boolean);

  return (
    <div className="bg-[#25262b] rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="displayDate"
              stroke="#666"
              tick={{ fill: '#666' }}
            />
            <YAxis 
              stroke="#666"
              tick={{ fill: '#666' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              name="Clics"
              type="monotone" 
              dataKey="clicks" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              name="Impressions"
              type="monotone" 
              dataKey="impressions" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};