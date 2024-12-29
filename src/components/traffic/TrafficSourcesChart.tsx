import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CustomTooltip } from '../metrics/chart/CustomTooltip';
import { ChartContainer } from '../metrics/chart/ChartContainer';
import { useTrafficSources } from '../../hooks/useTrafficSources';
import { useTrafficSource } from '../../contexts/TrafficSourceContext';
import { TRAFFIC_SOURCES } from '../../config/traffic-sources.config';
import { formatMetric } from '../../utils/metrics';
import { useSite } from '../../contexts/SiteContext';

export const TrafficSourcesChart: React.FC = () => {
  const { selectedSite } = useSite();
  const { data, isLoading, error } = useTrafficSources();
  const { selectedSource } = useTrafficSource();

  if (!selectedSite) {
    return (
      <ChartContainer title="Évolution du Trafic par Source">
        <div className="h-[400px] w-full flex items-center justify-center text-gray-400">
          Veuillez sélectionner un site
        </div>
      </ChartContainer>
    );
  }

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

  if (!data?.timelineData?.length) {
    return (
      <ChartContainer title="Évolution du Trafic par Source">
        <div className="h-[400px] w-full flex items-center justify-center text-gray-400">
          Aucune donnée disponible
        </div>
      </ChartContainer>
    );
  }

  const sourcesToDisplay = selectedSource 
    ? [TRAFFIC_SOURCES.find(source => source.name === selectedSource)!]
    : TRAFFIC_SOURCES;

  return (
    <ChartContainer title="Évolution du Trafic par Source">
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data.timelineData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="date"
              stroke="#666"
              tick={{ fill: '#666' }}
              tickFormatter={(date) => format(parseISO(date), 'dd MMM', { locale: fr })}
              interval="preserveEnd"
            />
            <YAxis 
              stroke="#666"
              tick={{ fill: '#666' }}
              tickFormatter={formatMetric}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#1a1b1e]/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-800/50">
                      <p className="text-gray-400 text-xs mb-2">
                        {format(parseISO(label), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                      {payload.map((entry: any) => (
                        <div key={entry.name} className="flex items-center gap-2 text-sm">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-gray-300">{entry.name}:</span>
                          <span className="text-white font-medium">
                            {formatMetric(entry.value)}
                          </span>
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