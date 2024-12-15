import React from 'react';
import { Users, Clock, Eye } from 'lucide-react';

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
    <div className="grid grid-cols-3 gap-2">
      <div className="flex items-center gap-2 bg-[#1a1b1e]/50 p-2 rounded-lg">
        <Users className="w-4 h-4 text-blue-400" />
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">Temps réel</span>
          <span className="text-sm font-semibold text-white">{realtimeUsers}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-[#1a1b1e]/50 p-2 rounded-lg">
        <Clock className="w-4 h-4 text-green-400" />
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">Sur {period}</span>
          <span className="text-sm font-semibold text-white">{totalUsers}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-[#1a1b1e]/50 p-2 rounded-lg">
        <Eye className="w-4 h-4 text-purple-400" />
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">Pages vues</span>
          <span className="text-sm font-semibold text-white">{pageViews}</span>
        </div>
      </div>
    </div>
  );
};