import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';
import { formatMetric } from '../../utils/metrics';

interface MetricBlockProps {
  type: 'clicks' | 'impressions' | 'custom';
  value: string | number;
  trend?: number;
  label?: string;
  color?: string;
  tooltip?: string;
}

export const MetricBlock: React.FC<MetricBlockProps> = ({ 
  value, 
  trend = 0,
  label,
  color = '#3b82f6',
  tooltip
}) => {
  const isPositiveTrend = trend >= 0;

  const content = (
    <div className="bg-[#1a1b1e]/50 rounded-lg p-2 border border-gray-800/10 hover:bg-[#1a1b1e]/70 
                   transition-all duration-200 hover:border-gray-700/30 h-[52px]">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400" style={{ color }}>
            {label}
          </span>
          {trend !== 0 && (
            <div className={`flex items-center gap-0.5 ${isPositiveTrend ? 'text-green-500' : 'text-red-500'}`}>
              {isPositiveTrend ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span className="text-[10px]">{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-white mt-1">
          {formatMetric(typeof value === 'number' ? value : parseInt(value))}
        </span>
      </div>
    </div>
  );

  return tooltip ? (
    <Tooltip content={tooltip}>{content}</Tooltip>
  ) : content;
};