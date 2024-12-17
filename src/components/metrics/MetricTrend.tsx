import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricTrendProps {
  trend: number | null;
  className?: string;
}

export const MetricTrend: React.FC<MetricTrendProps> = ({ trend, className = '' }) => {
  if (trend === null) return null;

  return (
    <div className={`flex items-center gap-0.5 ${trend >= 0 ? 'text-green-500' : 'text-red-500'} ${className}`}>
      {trend >= 0 ? (
        <ArrowUpRight className="w-3 h-3" />
      ) : (
        <ArrowDownRight className="w-3 h-3" />
      )}
      <span className="text-[10px] font-medium">{Math.abs(trend).toFixed(1)}%</span>
    </div>
  );
};