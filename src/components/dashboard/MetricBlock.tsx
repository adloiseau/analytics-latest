import React from 'react';
import { Search, BarChart3, Users, Clock, Eye, ArrowUpRight } from 'lucide-react';
import { SparklineChart } from '../metrics/SparklineChart';

type MetricType = 'clicks' | 'impressions' | 'users' | 'pageViews' | 'duration' | 'bounce';

interface MetricConfig {
  icon: any;
  label: string;
  color: string;
}

const metricConfigs: Record<MetricType, MetricConfig> = {
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
  trend?: 'up' | 'down';
  trendValue?: string;
}

export const MetricBlock: React.FC<MetricBlockProps> = ({ 
  type,
  value, 
  sparklineData,
  trend,
  trendValue
}) => {
  const config = metricConfigs[type];
  const Icon = config.icon;

  return (
    <div className="relative bg-[#1a1b1e]/50 rounded-lg p-3 border border-gray-800/10 overflow-hidden group 
                    hover:bg-[#1a1b1e]/70 transition-all duration-200 hover:border-gray-700/30">
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" style={{ color: config.color }} />
            <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
              {config.label}
            </span>
          </div>
          {trend && trendValue && (
            <span className={`text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
              <ArrowUpRight className={`w-3 h-3 ${trend === 'down' ? 'rotate-90' : ''}`} />
              {trendValue}
            </span>
          )}
        </div>
        <div className="text-lg font-semibold text-white mt-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>
      {sparklineData && (
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
          <SparklineChart data={sparklineData} color={config.color} />
        </div>
      )}
    </div>
  );
};