import React from 'react';
import { SearchAnalyticsRow } from '../services/googleAuth/types';
import { ArrowUpRight, ArrowDownRight, HelpCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { useSelectedItem } from '../contexts/SelectedItemContext';

interface TopMetricsCardProps {
  title: string;
  data: SearchAnalyticsRow[];
  dimension: 'page' | 'query';
}

export const TopMetricsCard: React.FC<TopMetricsCardProps> = ({ title, data = [], dimension }) => {
  const { selectedItem, setSelectedItem } = useSelectedItem();

  // Ensure data is valid and not empty
  const validData = Array.isArray(data) ? data.filter(item => 
    item && 
    Array.isArray(item.keys) && 
    item.keys.length > 0 && 
    typeof item.clicks === 'number' && 
    typeof item.impressions === 'number' && 
    typeof item.ctr === 'number' && 
    typeof item.position === 'number'
  ) : [];

  const top5 = validData.slice(0, 5);

  const formatKey = (key: string) => {
    if (!key) return '';
    if (dimension === 'page') {
      try {
        const url = new URL(key);
        return url.pathname || '/';
      } catch {
        return key;
      }
    }
    return key;
  };

  if (validData.length === 0) {
    return (
      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4 h-full border border-gray-800/10">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
          {title}
        </h2>
        <div className="text-gray-400 text-sm">Aucune donnée disponible</div>
      </div>
    );
  }

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
        {top5.map((item, index) => {
          const key = item.keys[0];
          const isSelected = selectedItem === key;
          
          return (
            <div 
              key={index} 
              onClick={() => setSelectedItem(isSelected ? null : key)}
              className={`group p-3 rounded-lg ${isSelected ? 'bg-[#2d2e33]/80' : 'bg-[#1a1b1e]/50'} 
                         hover:bg-[#2d2e33]/60 transition-all duration-200 
                         border ${isSelected ? 'border-gray-700' : 'border-gray-800/10'}
                         hover:border-gray-700/30 cursor-pointer`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Tooltip content={key}>
                    <div className="text-sm text-gray-300 truncate max-w-[300px] font-medium">
                      {formatKey(key)}
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
          );
        })}
      </div>
    </div>
  );
};