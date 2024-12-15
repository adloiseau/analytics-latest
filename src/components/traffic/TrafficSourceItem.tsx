import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Globe, Search, Share2 } from 'lucide-react';
import { SparklineChart } from '../metrics/SparklineChart';
import { formatTrend } from '../../utils/traffic';
import type { TrafficSource, TrafficSourceConfig } from '../../types/traffic';

const iconMap = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  globe: Globe,
  search: Search,
  share2: Share2
};

interface TrafficSourceItemProps {
  source: TrafficSource;
  config: TrafficSourceConfig;
}

export const TrafficSourceItem: React.FC<TrafficSourceItemProps> = ({ source, config }) => {
  const Icon = iconMap[config.icon as keyof typeof iconMap];
  const trend = formatTrend(source.trend);
  const isPositiveTrend = source.trend >= 0;

  return (
    <div className="p-3 rounded-lg bg-[#1a1b1e]/50 hover:bg-[#1a1b1e]/70 
                    transition-all duration-200 border border-gray-800/10 
                    hover:border-gray-700/30 relative overflow-hidden group">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" style={{ color: config.color }} />
            <span className="text-sm text-gray-300 font-medium">
              {source.name}
            </span>
          </div>
          <span className={`text-xs ${isPositiveTrend ? 'text-green-500' : 'text-red-500'}`}>
            {trend}
          </span>
        </div>
        <div className="text-lg font-semibold text-white">
          {source.visitors.toLocaleString()} visiteurs
        </div>
      </div>
      {source.sparklineData.length > 0 && (
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
          <SparklineChart 
            data={source.sparklineData} 
            color={config.color}
          />
        </div>
      )}
    </div>
  );
};