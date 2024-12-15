import React from 'react';
import { Users, Eye, Clock, ArrowUpRight } from 'lucide-react';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';
import { formatDuration } from '../../utils/metrics';
import { SparklineChart } from './SparklineChart';

interface RealTimeMetricsProps {
  websiteUrl: string;
}

const MetricBlock = ({ 
  icon: Icon, 
  label, 
  value, 
  color,
  sparklineData 
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  sparklineData?: number[];
}) => (
  <div className="bg-[#1a1b1e]/50 rounded-lg p-3 border border-gray-800/10 relative overflow-hidden group 
                  hover:bg-[#1a1b1e]/70 transition-all duration-200 hover:border-gray-700/30">
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{label}</span>
      </div>
      <div className="text-lg font-semibold text-white">{value}</div>
    </div>
    {sparklineData && <SparklineChart data={sparklineData} color={color} />}
  </div>
);

// ... reste du code inchangé ...