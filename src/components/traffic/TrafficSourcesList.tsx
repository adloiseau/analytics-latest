import React from 'react';
import { TrafficSourceItem } from './TrafficSourceItem';
import { useTrafficSources } from '../../hooks/useTrafficSources';
import { aggregateSourceData } from '../../utils/traffic';
import { TRAFFIC_SOURCES } from '../../config/traffic-sources.config';

export const TrafficSourcesList: React.FC = () => {
  const { data, isLoading, error } = useTrafficSources();

  if (isLoading) {
    return (
      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Trafic par Source
        </h2>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-[72px] bg-[#1a1b1e]/50 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4">
        <div className="text-red-400">Erreur lors du chargement des données</div>
      </div>
    );
  }

  const sources = aggregateSourceData(data?.sourceData || []);

  return (
    <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4 border border-gray-800/10">
      <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
        Trafic par Source
      </h2>
      <div className="space-y-2">
        {TRAFFIC_SOURCES.map((sourceConfig) => {
          const sourceData = sources.find(s => s.name === sourceConfig.name);
          if (!sourceData) return null;

          return (
            <TrafficSourceItem
              key={sourceConfig.name}
              source={sourceData}
              config={sourceConfig}
            />
          );
        })}
      </div>
    </div>
  );
};