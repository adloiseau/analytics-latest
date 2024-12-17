import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';
import { formatMetric } from '../../utils/metrics';
import { SparklineGSC } from '../metrics/SparklineGSC';
import { SparklineGA } from '../metrics/SparklineGA';
import { calculateTrendForRange } from '../../utils/metrics/trends';
import { useFilters } from '../../contexts/FilterContext';

interface MetricBlockProps {
  type: 'clicks' | 'impressions' | 'custom';
  value: string | number;
  label?: string;
  color?: string;
  tooltip?: string;
  sparklineData?: number[];
  historicalData?: Array<{ date: string; value: number }>;
  isGAMetric?: boolean;
}

export const MetricBlock: React.FC<MetricBlockProps> = ({ 
  value, 
  label,
  color = '#3b82f6',
  tooltip,
  sparklineData,
  historicalData,
  isGAMetric = false
}) => {
  const { dateRange } = useFilters();
  
  const trend = React.useMemo(() => {
    if (!historicalData || historicalData.length < 2) {
      return null;
    }
    return calculateTrendForRange(historicalData, dateRange);
  }, [historicalData, dateRange]);

  const content = (
    <div className="w-full h-[70px] relative overflow-hidden">
      <div className="absolute inset-0 bg-[#1a1b1e]/50 rounded-lg border border-gray-800/10">
        {sparklineData && sparklineData.length > 0 && !isGAMetric && (
          <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
            <SparklineGSC data={sparklineData} color={color} />
          </div>
        )}
        {historicalData && historicalData.length > 0 && isGAMetric && (
          <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
            <SparklineGA data={historicalData} color={color} />
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-col h-full p-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium" style={{ color }}>
            {label}
          </span>
          {trend !== null && (
            <div className={`flex items-center gap-0.5 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? (
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