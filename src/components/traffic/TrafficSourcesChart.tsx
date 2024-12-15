import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CustomTooltip } from '../metrics/chart/CustomTooltip';
import { ChartContainer } from '../metrics/chart/ChartContainer';
import { useTrafficSources } from '../../hooks/useTrafficSources';
import { useTrafficSource } from '../../contexts/TrafficSourceContext';
import { TRAFFIC_SOURCES } from '../../config/traffic-sources.config';

export const TrafficSourcesChart: React.FC = () => {
  const { data, isLoading, error } = useTrafficSources();
  const { selectedSource } = useTrafficSource();

  if (isLoading) {
    return (
      <ChartContainer title="Évolution du Trafic par Source">
        <div className="h-[400px] w-full animate-pulse bg-[#1a1b1e]/50 rounded-lg" />
      </ChartContainer>
    );
  }

  if (error) {
    return (
      <ChartContainer title="Évolution du Trafic par Source">
        <div className="h-[400px] w-full flex items-center justify-center text-red-400">
          Erreur lors du chargement des données
        </div>
      </ChartContainer>
    );
  }

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'd MMM', { locale: fr });
    } catch {
      return date;
    }
  };

  const sourcesToDisplay = selectedSource 
    ? TRAFFIC_SOURCES.filter(source => source.name === selectedSource)
    : TRAFFIC_SOURCES;

  return (
    <ChartContainer title="Évolution du Trafic par Source">
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data?.timelineData || []}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="date"
              stroke="#666"
              tick={{ fill: '#666' }}
              tickFormatter={formatDate}
              interval="preserveEnd"
            />
            <YAxis 
              stroke="#666"
              tick={{ fill: '#666' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {sourcesToDisplay.map((source) => (
              <Line
                key={source.name}
                type="monotone"
                dataKey={source.name}
                name={source.name}
                stroke={source.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};