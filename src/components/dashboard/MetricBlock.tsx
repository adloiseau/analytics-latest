import React from 'react';
import { Search, BarChart3, Users, Clock, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { SparklineChart } from '../metrics/SparklineChart';
import { Tooltip } from '../common/Tooltip';

type MetricType = 'clicks' | 'impressions' | 'users' | 'pageViews' | 'duration' | 'bounce' | 'custom';

interface MetricConfig {
  icon: any;
  label: string;
  color: string;
}

const metricConfigs: Record<Exclude<MetricType, 'custom'>, MetricConfig> = {
  clicks: { icon: Search, label: 'Clics', color: '#3b82f6' },
  impressions: { icon: BarChart3, label: 'Impressions', color: '#10b981' },
  users: { icon: Users, label: 'Utilisateurs', color: '#8b5cf6' },
  pageViews: { icon: Eye, label: 'Pages vues', color: '#f59e0b' },
  duration: { icon: Clock, label: 'Durée moy.', color: '#ec4899' },
  bounce: { icon: Clock, label: 'Taux rebond', color: '#6366f1' }
};

interface MetricBlockProps {
  type: MetricType;
  value: string | number;
  sparklineData?: number[];
  trend?: number;
  trendValue?: string;
  label?: string;
  color?: string;
  tooltip?: string;
}

export const MetricBlock: React.FC<MetricBlockProps> = ({ 
  type,
  value, 
  sparklineData,
  trend = 0,
  trendValue,
  label,
  color,
  tooltip
}) => {
  const config = type === 'custom' 
    ? { icon: BarChart3, label: label || '', color: color || '#3b82f6' }
    : metricConfigs[type];
  const Icon = config.icon;
  const isPositiveTrend = trend >= 0;

  const content = (
    <div className="relative bg-[#1a1b1e]/50 rounded-lg p-3 border border-gray-800/10 overflow-hidden group 
                    hover:bg-[#1a1b1e]/70 transition-all duration-300 hover:border-gray-700/30 hover:scale-[1.02]
                    hover:shadow-lg h-[90px]">
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" style={{ color: config.color }} />
            <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
              {label || config.label}
            </span>
          </div>
          {trendValue && (
            <div className={`flex items-center gap-1 ${isPositiveTrend ? 'text-green-500' : 'text-red-500'}`}>
              {isPositiveTrend ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span className="text-xs font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-lg font-semibold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
        </div>
      </div>
      {sparklineData && (
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
          <SparklineChart data={sparklineData} color={config.color} />
        </div>
      )}
    </div>
  );

  return tooltip ? (
    <Tooltip content={tooltip}>{content}</Tooltip>
  ) : content;
};