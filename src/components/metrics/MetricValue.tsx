import React from 'react';
import { formatMetric } from '../../utils/metrics';

interface MetricValueProps {
  value: number;
  label?: string;
  className?: string;
}

export const MetricValue: React.FC<MetricValueProps> = ({ value, label, className = '' }) => (
  <div className={`flex items-center space-x-1 ${className}`}>
    <span className="font-medium">{formatMetric(value)}</span>
    {label && <span className="text-sm text-gray-400">{label}</span>}
  </div>
);