import React from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatMetric } from '../../../utils/metrics';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  try {
    const date = parseISO(label || '');
    return (
      <div className="bg-[#1a1b1e]/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-800/50">
        <p className="text-gray-400 text-xs font-medium mb-2">
          {format(date, 'dd MMMM yyyy', { locale: fr })}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-300 text-sm font-medium">
                {entry.name}:{' '}
                <span className="text-white">
                  {formatMetric(entry.value)}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  } catch {
    return null;
  }
};