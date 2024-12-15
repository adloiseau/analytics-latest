import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricChangeProps {
  value: number;
  threshold?: number;
  className?: string;
}

export const MetricChange: React.FC<MetricChangeProps> = ({ 
  value, 
  threshold = 0, 
  className = '' 
}) => {
  const isPositive = value > threshold;
  const colorClass = isPositive ? 'text-green-500' : 'text-red-500';

  return (
    <div className={`flex items-center ${colorClass} ${className}`}>
      {isPositive ? (
        <ArrowUpRight className="w-4 h-4" />
      ) : (
        <ArrowDownRight className="w-4 h-4" />
      )}
      <span className="text-xs">{Math.abs(value).toFixed(1)}%</span>
    </div>
  );
};