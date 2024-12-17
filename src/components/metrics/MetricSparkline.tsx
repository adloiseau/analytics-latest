import React from 'react';
import { SparklineChart } from './SparklineChart';

interface MetricSparklineProps {
  data: number[];
  color: string;
}

export const MetricSparkline: React.FC<MetricSparklineProps> = ({ data, color }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Filter out null, undefined, and NaN values
  const validData = data.filter(value => value != null && !isNaN(value));

  if (validData.length === 0) {
    return null;
  }

  return (
    <SparklineChart 
      data={validData} 
      color={color}
      height={70}
    />
  );
};