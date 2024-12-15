import React from 'react';
import { Users, Clock, Eye } from 'lucide-react';
import { formatMetric } from '../../utils/metrics';

interface UserMetricsProps {
  realtimeUsers: number;
  totalUsers: number;
  pageViews: number;
  period: string;
}

export const UserMetrics: React.FC<UserMetricsProps> = ({ 
  realtimeUsers, 
  totalUsers, 
  pageViews,
  period 
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 h-full">
      <div className="flex items-center gap-2 bg-[#1a1b1e]/50 p-3 rounded-lg">
        <Users className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-gray-400 truncate">30 dernières min</span>
          <span className="text-sm font-semibold text-white">{formatMetric(realtimeUsers)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-[#1a1b1e]/50 p-3 rounded-lg">
        <Clock className="w-4 h-4 text-green-400 flex-shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-gray-400 truncate">Sur {period}</span>
          <span className="text-sm font-semibold text-white">{formatMetric(totalUsers)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-[#1a1b1e]/50 p-3 rounded-lg">
        <Eye className="w-4 h-4 text-purple-400 flex-shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-gray-400 truncate">Pages vues</span>
          <span className="text-sm font-semibold text-white">{formatMetric(pageViews)}</span>
        </div>
      </div>
    </div>
  );
};