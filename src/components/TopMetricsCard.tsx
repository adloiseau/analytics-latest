import React from 'react';
import { SearchAnalyticsRow } from '../services/googleAuth/types';
import { ArrowUpRight, ArrowDownRight, HelpCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface TopMetricsCardProps {
  title: string;
  data: SearchAnalyticsRow[];
  dimension: 'page' | 'query';
}

export const TopMetricsCard: React.FC<TopMetricsCardProps> = ({ title, data, dimension }) => {
  const top5 = data?.slice(0, 5) || [];

  const formatKey = (key: string) => {
    if (dimension === 'page') {
      try {
        const url = new URL(key);
        return url.pathname;
      } catch {
        return key;
      }
    }
    return key;
  };

  return (
    <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4 h-full border border-gray-800/10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          {title}
        </h2>
        <Tooltip content="Les 5 éléments les plus performants basés sur le nombre de clics">
          <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
        </Tooltip>
      </div>
      <div className="space-y-2">
        {top5.map((item, index) => (
          <div 
            key={index} 
            className="group p-3 rounded-lg bg-[#1a1b1e]/50 hover:bg-[#1a1b1e]/80 
                       transition-all duration-200 border border-gray-800/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Tooltip content={item.keys[0]}>
                  <div className="text-sm text-gray-300 truncate max-w-[300px] font-medium">
                    {formatKey(item.keys[0])}
                  </div>
                </Tooltip>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <span>{item.impressions.toLocaleString()} imp.</span>
                  <Tooltip content="Position moyenne dans les résultats de recherche">
                    <span className="px-1.5 py-0.5 rounded bg-gray-800/50 text-gray-400">
                      Pos. {item.position.toFixed(1)}
                    </span>
                  </Tooltip>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Tooltip content="Nombre de clics">
                  <span className="text-sm font-medium">{item.clicks.toLocaleString()}</span>
                </Tooltip>
                <Tooltip content="Taux de clic (CTR)">
                  <div className={`flex items-center ${item.ctr > 0.05 ? 'text-green-500' : 'text-red-500'}`}>
                    {item.ctr > 0.05 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span className="text-xs">{(item.ctr * 100).toFixed(1)}%</span>
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};