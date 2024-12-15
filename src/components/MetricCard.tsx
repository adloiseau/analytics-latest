import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
}

export const MetricCard = ({ title, value, change, icon }: MetricCardProps) => {
  const isPositive = change && change > 0;
  
  return (
    <div className="bg-[#25262b] rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{title}</span>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold text-white">{value}</span>
        {change && (
          <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            <span className="text-sm">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}