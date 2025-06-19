import React from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface SparklineGSCProps {
  data: number[];
  color: string;
  height?: number;
}

export const SparklineGSC: React.FC<SparklineGSCProps> = ({ 
  data, 
  color,
  height = 50
}) => {
  if (!data || data.length === 0) return null;

  const chartData = data.map((value, index) => ({ value, index }));

  // Calculer les valeurs min et max pour une meilleure visualisation
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue;
  const padding = range * 0.1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart 
        data={chartData} 
        margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
      >
        <defs>
          <linearGradient id={`gradient-gsc-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="50%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-gsc-${color.replace('#', '')})`}
          dot={false}
          isAnimationActive={true}
          animationDuration={1500}
          animationEasing="ease-in-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};