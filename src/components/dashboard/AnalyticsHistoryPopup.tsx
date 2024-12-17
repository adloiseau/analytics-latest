import React from 'react';
import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFilters } from '../../contexts/FilterContext';
import { DateRangeSelector } from '../DateRangeSelector';
import { getDateRange } from '../../utils/dates';
import { formatMetric } from '../../utils/metrics';
import type { AnalyticsMetrics } from '../../types/analytics';

interface AnalyticsHistoryPopupProps {
  metricKey: 'pageViews' | 'activeUsers' | 'realtimeUsers';
  analyticsMetrics: AnalyticsMetrics;
  onClose: () => void;
}

export const AnalyticsHistoryPopup: React.FC<AnalyticsHistoryPopupProps> = ({
  metricKey,
  analyticsMetrics,
  onClose
}) => {
  const { dateRange, setDateRange } = useFilters();
  const { startDate, endDate } = getDateRange(dateRange);

  const metricConfig = {
    pageViews: {
      label: 'Pages vues',
      color: '#f59e0b',
      history: analyticsMetrics.pageViewsHistory,
      current: analyticsMetrics.pageViews,
      previous: analyticsMetrics.previousPeriod?.pageViews
    },
    activeUsers: {
      label: 'Visiteurs 7j',
      color: '#ec4899',
      history: analyticsMetrics.activeUsersHistory,
      current: analyticsMetrics.activeUsers,
      previous: analyticsMetrics.previousPeriod?.activeUsers
    },
    realtimeUsers: {
      label: 'Visiteurs 30m',
      color: '#06b6d4',
      history: [],
      current: analyticsMetrics.realtimeUsers,
      previous: null
    }
  };

  const config = metricConfig[metricKey];
  const trend = config.previous ? ((config.current - config.previous) / config.previous) * 100 : null;

  // Préparer les données pour la période actuelle et précédente
  const prepareChartData = () => {
    if (!config.history || config.history.length === 0) return [];

    const currentStart = parseISO(startDate);
    const currentEnd = parseISO(endDate);
    const daysDiff = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));

    const allData = [...config.history].sort((a, b) => a.date.localeCompare(b.date));
    const result = [];

    // Filter data for current period
    const currentPeriodData = allData.filter(item => {
      const date = parseISO(item.date);
      return date >= currentStart && date <= currentEnd;
    });

    // For each data point in current period, add both current and previous values
    currentPeriodData.forEach(item => {
      const currentDate = parseISO(item.date);
      const previousDate = format(subDays(currentDate, daysDiff), 'yyyy-MM-dd');
      const previousItem = allData.find(d => d.date === previousDate);

      result.push({
        date: item.date,
        displayDate: format(currentDate, 'dd MMM', { locale: fr }),
        value: item.value,
        previousValue: previousItem?.value || null
      });
    });

    return result;
  };

  const chartData = prepareChartData();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#25262b] rounded-lg p-6 w-[90vw] max-w-4xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[#1a1b1e] text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">
              Historique - {config.label}
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-gray-400">
                Actuel: <span className="text-white">{formatMetric(config.current)}</span>
              </div>
              {config.previous !== null && (
                <>
                  <div className="text-gray-400">
                    Précédent: <span className="text-white">{formatMetric(config.previous)}</span>
                  </div>
                  {trend !== null && (
                    <div className={trend >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <DateRangeSelector selectedRange={dateRange} onChange={setDateRange} />
        </div>

        <div className="h-[400px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="displayDate"
                  stroke="#666"
                  tick={{ fill: '#666' }}
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
                          <p className="text-gray-400 text-xs mb-1">{label}</p>
                          {payload.map((entry: any) => {
                            if (entry.value === null) return null;
                            const isPrevious = entry.dataKey === 'previousValue';
                            return (
                              <p key={entry.name} className="text-white text-sm">
                                {isPrevious ? 'Période précédente' : 'Période actuelle'}: {formatMetric(entry.value)}
                              </p>
                            );
                          })}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  formatter={(value) => value === 'value' ? 'Période actuelle' : 'Période précédente'}
                />
                <Line
                  name="value"
                  type="monotone"
                  dataKey="value"
                  stroke={config.color}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                />
                <Line
                  name="previousValue"
                  type="monotone"
                  dataKey="previousValue"
                  stroke="#4B5563"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Aucune donnée historique disponible
            </div>
          )}
        </div>
      </div>
    </div>
  );
};