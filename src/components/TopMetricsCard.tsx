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

  return (
    <div className="bg-[#25262b] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Tooltip content="Les 5 pages les plus performantes basées sur le nombre de clics">
          <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
        </Tooltip>
      </div>
      <div className="space-y-4">
        {top5.map((item, index) => (
          <div key={index} className="flex items-center justify-between group">
            <div className="flex-1">
              <Tooltip content={item.keys[0]}>
                <div className="text-sm text-gray-300 truncate max-w-[300px]">{item.keys[0]}</div>
              </Tooltip>
              <div className="text-xs text-gray-500 flex items-center space-x-2">
                <span>{item.impressions.toLocaleString()} impressions</span>
                <Tooltip content="Position moyenne dans les résultats de recherche">
                  <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded">
                    Position {item.position.toFixed(1)}
                  </span>
                </Tooltip>
              </div>
            </div>
            <div className="flex items-center space-x-2">
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
        ))}
      </div>
    </div>
  );
};