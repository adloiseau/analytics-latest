import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
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
          Erreur lors du chargement des données: {error.message}
        </div>
      </ChartContainer>
    );
  }

  if (!data?.timelineData?.length) {
    return (
      <ChartContainer title="Évolution du Trafic par Source">
        <div className="h-[400px] w-full flex items-center justify-center text-gray-400">
          Aucune donnée disponible pour la période sélectionnée
        </div>
      </ChartContainer>
    );
  }

  const formatDate = (date: string) => {
    try {
      return format(parseISO(date), 'd MMM', { locale: fr });
    } catch {
      return date;
    }
  };

  // Ensure data is properly sorted by date
  const sortedData = [...data.timelineData].sort((a, b) => a.date.localeCompare(b.date));

  // Filter sources to display based on selection
  const sourcesToDisplay = selectedSource 
    ? [TRAFFIC_SOURCES.find(source => source.name === selectedSource)].filter(Boolean)
    : TRAFFIC_SOURCES;

  // Verify data has values for selected sources
  const hasData = sortedData.some(day => 
    sourcesToDisplay.some(source => day[source.name] !== undefined)
  );

  if (!hasData) {
    return (
      <ChartContainer title="Évolution du Trafic par Source">
        <div className="h-[400px] w-full flex items-center justify-center text-gray-400">
          Aucune donnée disponible pour les sources sélectionnées
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Évolution du Trafic par Source">
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={sortedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="date"
              stroke="#666"
              tick={{ fill: '#666' }}
              tickFormatter={formatDate}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis 
              stroke="#666"
              tick={{ fill: '#666' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#1a1b1e]/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-800/50">
                      <p className="text-gray-400 text-xs mb-1">
                        {format(parseISO(label), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                      {payload
                        .filter(entry => entry.value > 0)
                        .map((entry: any) => (
                          <div key={entry.name} className="text-sm">
                            <span style={{ color: entry.color }}>●</span>{' '}
                            {entry.name}: {entry.value.toLocaleString()} visiteurs
                          </div>
                        ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            {sourcesToDisplay.map((source) => (
              <Line
                key={source.name}
                name={source.name}
                type="monotone"
                dataKey={source.name}
                stroke={source.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};