import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';
import { formatMetric } from '../../utils/metrics';
import { SparklineChart } from '../metrics/SparklineChart';

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
  const trendData = Array.from({ length: 10 }, () => 
    Math.random() * (isPositiveTrend ? 100 : -100)
  );

  const content = (
    <div className="w-full h-[70px] relative overflow-hidden">
      {/* Background Trend */}
      <div className="absolute inset-0 bg-[#1a1b1e]/50 rounded-lg border border-gray-800/10">
        <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
          <SparklineChart 
            data={trendData} 
            color={color}
            height={200}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium" style={{ color }}>
            {label}
          </span>
          {trend !== 0 && (
            <div className={`flex items-center gap-0.5 ${isPositiveTrend ? 'text-green-500' : 'text-red-500'}`}>
              {isPositiveTrend ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span className="text-[10px] font-medium">{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <span className="text-xl font-semibold text-white mt-auto">
          {formatMetric(typeof value === 'number' ? value : parseInt(value))}
        </span>
      </div>
    </div>
  );

  return tooltip ? (
    <Tooltip content={tooltip}>{content}</Tooltip>
  ) : content;
};