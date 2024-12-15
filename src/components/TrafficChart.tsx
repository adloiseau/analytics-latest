import React from 'react';

export const TrafficChart = () => {
  return (
    <div className="bg-[#25262b] rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Évolution du Trafic</h2>
        <div className="flex space-x-2">
          {['Google', 'Bing', 'Direct'].map((source) => (
            <div key={source} className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-1 ${
                source === 'Google' ? 'bg-blue-500' :
                source === 'Bing' ? 'bg-purple-500' : 'bg-green-500'
              }`} />
              <span className="text-xs text-gray-400">{source}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="h-64 flex items-center justify-center text-gray-500">
        Graphique d'évolution du trafic
      </div>
    </div>
  );
}