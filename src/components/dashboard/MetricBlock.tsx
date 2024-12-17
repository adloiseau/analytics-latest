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
  sparklineData?: number[];
}

export const MetricBlock: React.FC<MetricBlockProps> = ({ 
  value, 
  trend = 0,
  label,
  color = '#3b82f6',
  tooltip,
  sparklineData
}) => {
  const isPositiveTrend = trend >= 0;
  
  // Generate realistic trend data if not provided
  const displayData = React.useMemo(() => {
    if (sparklineData && sparklineData.length > 0) {
      return sparklineData;
    }

    const baseValue = typeof value === 'number' ? value : parseInt(value);
    const variance = baseValue * 0.1; // 10% variance
    
    return Array.from({ length: 10 }, (_, i) => {
      const progress = i / 9;
      const randomVariance = (Math.random() - 0.5) * variance;
      const trendEffect = isPositiveTrend ? progress : -progress;
      return baseValue * (1 + trendEffect * 0.2) + randomVariance;
    });
  }, [value, isPositiveTrend, sparklineData]);

  const content = (
    <div className="w-full h-[70px] relative overflow-hidden">
      <div className="absolute inset-0 bg-[#1a1b1e]/50 rounded-lg border border-gray-800/10">
        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
          <SparklineChart 
            data={displayData} 
            color={color}
            height={70}
          />
        </div>
      </div>

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