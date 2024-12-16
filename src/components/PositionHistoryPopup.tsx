import React from 'react';
import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PositionHistoryPopupProps {
  item: any;
  dimension: 'page' | 'query';
  onClose: () => void;
}

export const PositionHistoryPopup: React.FC<PositionHistoryPopupProps> = ({ item, dimension, onClose }) => {
  const formatKey = (key: string) => {
    if (dimension === 'page') {
      try {
        const url = new URL(key);
        return url.pathname || '/';
      } catch {
        return key;
      }
    }
    return key;
  };

  // Simulated position history data
  const positionHistory = [
    { date: '2024-01-01', position: 5.2 },
    { date: '2024-01-08', position: 4.8 },
    { date: '2024-01-15', position: 4.3 },
    { date: '2024-01-22', position: 3.9 },
    { date: '2024-01-29', position: item.position }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#25262b] rounded-lg p-6 max-w-2xl w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[#1a1b1e] text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-white mb-1">
          Historique des positions
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          {formatKey(item.keys[0])}
        </p>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={positionHistory} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="date"
                stroke="#666"
                tick={{ fill: '#666' }}
                tickFormatter={(date) => format(parseISO(date), 'dd MMM', { locale: fr })}
              />
              <YAxis 
                stroke="#666"
                tick={{ fill: '#666' }}
                reversed
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#1a1b1e]/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-800/50">
                        <p className="text-gray-400 text-xs mb-1">
                          {format(parseISO(label), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                        <p className="text-white text-sm">
                          Position: {payload[0].value.toFixed(1)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="position"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};