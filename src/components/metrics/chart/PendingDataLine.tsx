import React from 'react';
import { Line } from 'recharts';

interface PendingDataLineProps {
  dataKey: string;
  yAxisId: 'left' | 'right';
  name: string;
  color: string;
}

export const PendingDataLine: React.FC<PendingDataLineProps> = ({
  dataKey,
  yAxisId,
  name,
  color
}) => (
  <>
    {/* Ligne principale pour les données confirmées */}
    <Line
      yAxisId={yAxisId}
      name={name}
      type="monotone"
      dataKey={`confirmed${dataKey}`}
      stroke={color}
      strokeWidth={2}
      dot={false}
      activeDot={{ r: 4, strokeWidth: 2 }}
    />
    
    {/* Ligne en pointillés pour les données en attente */}
    <Line
      yAxisId={yAxisId}
      name={`${name} (en attente)`}
      type="monotone"
      dataKey={`pending${dataKey}`}
      stroke={color}
      strokeWidth={2}
      strokeDasharray="5 5"
      dot={false}
      activeDot={{ r: 4, strokeWidth: 2 }}
    />
  </>
);