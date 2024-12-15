import React from 'react';
import { Tooltip } from '../common/Tooltip';

interface MetricPositionProps {
  position: number;
  className?: string;
}

export const MetricPosition: React.FC<MetricPositionProps> = ({ position, className = '' }) => (
  <Tooltip content="Position moyenne dans les résultats de recherche">
    <span className={`text-xs bg-gray-700 px-1.5 py-0.5 rounded ${className}`}>
      Position {position.toFixed(1)}
    </span>
  </Tooltip>
);