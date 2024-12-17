import React from 'react';
import { formatMetric } from '../../utils/metrics';

interface MetricValueProps {
  value: number;
  className?: string;
}

export const MetricValue: React.FC<MetricValueProps> = ({ value, className = '' }) => (
  <span className={`text-xl font-semibold text-white ${className}`}>
    {formatMetric(value)}
  </span>
);