import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQuery } from 'react-query';
import { metricsService } from '../../services/supabase/metrics';
import { formatMetric } from '../../utils/metrics';
import type { MetricDefinition } from '../../types/metrics';

interface MetricHistoryPopupProps {
  siteUrl: string;
  metricKey: string;
  metricDefinition: MetricDefinition;
  onClose: () => void;
}

export const MetricHistoryPopup: React.FC<MetricHistoryPopupProps> = ({
  siteUrl,
  metricKey,
  metricDefinition,
  onClose
}) => {
  const { data: history, isLoading } = useQuery(
    ['metricHistory', siteUrl, metricKey],
    () => metricsService.getMetricsHistory(siteUrl, metricKey, 30),
    {
      staleTime: 5 * 60 * 1000
    }
  );

  const chartData = useMemo(() => {
    if (!history) return [];
    return [...history]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        date: item.date,
        value: item.value
      }));
  }, [history]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-[#25262b] rounded-lg p-6 w-[90vw] max-w-4xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[#1a1b1e] text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-white mb-1">
          Historique - {metricDefinition.label}
        </h2>
        <p className="text-sm text-gray-400 mb-6">{metricDefinition.description}</p>

        <div className="h-[400px] w-full">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
                  tickFormatter={formatMetric}
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
                            {metricDefinition.label}: {formatMetric(payload[0].value)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={metricDefinition.color}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>
    </div>
  );
};