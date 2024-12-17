import React from 'react';
import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useFilters } from '../../contexts/FilterContext';
import { metricsService } from '../../services/supabase/metrics';
import { searchConsoleApi } from '../../services/googleAuth/api';
import { formatMetric } from '../../utils/metrics';
import { DateRangeSelector } from '../DateRangeSelector';
import { getDateRange } from '../../utils/dates';
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
  const { accessToken } = useAuth();
  const { dateRange, setDateRange } = useFilters();
  const { startDate, endDate } = getDateRange(dateRange);

  // Calculate previous period dates
  const currentStartDate = parseISO(startDate);
  const currentEndDate = parseISO(endDate);
  const daysDiff = Math.ceil((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const previousStartDate = format(subDays(currentStartDate, daysDiff), 'yyyy-MM-dd');
  const previousEndDate = format(subDays(currentEndDate, daysDiff), 'yyyy-MM-dd');

  const { data: currentPeriod, isLoading: isCurrentLoading } = useQuery(
    ['metricHistory', siteUrl, metricKey, startDate, endDate],
    async () => {
      if (metricKey === 'clicks' || metricKey === 'impressions') {
        const response = await searchConsoleApi.fetchSearchAnalytics(accessToken!, siteUrl, {
          startDate,
          endDate,
          dimensions: ['date'],
          rowLimit: 1000
        });
        return response.rows?.map(row => ({
          date: row.keys[0],
          value: row[metricKey]
        })) || [];
      }
      
      const days = dateRange === '24h' ? 2 : 
                  dateRange === '7d' ? 7 : 
                  dateRange === '28d' ? 28 : 90;
                  
      const metrics = await metricsService.getMetricsHistory(siteUrl, metricKey, days);
      return metrics.map(metric => ({
        date: metric.date,
        value: metric.value
      }));
    },
    {
      enabled: !!accessToken || !['clicks', 'impressions'].includes(metricKey)
    }
  );

  const { data: previousPeriod, isLoading: isPreviousLoading } = useQuery(
    ['metricHistory', siteUrl, metricKey, previousStartDate, previousEndDate],
    async () => {
      if (metricKey === 'clicks' || metricKey === 'impressions') {
        const response = await searchConsoleApi.fetchSearchAnalytics(accessToken!, siteUrl, {
          startDate: previousStartDate,
          endDate: previousEndDate,
          dimensions: ['date'],
          rowLimit: 1000
        });
        return response.rows?.map(row => ({
          date: format(subDays(parseISO(row.keys[0]), -daysDiff), 'yyyy-MM-dd'),
          previousValue: row[metricKey]
        })) || [];
      }
      return [];
    },
    {
      enabled: !!accessToken && ['clicks', 'impressions'].includes(metricKey)
    }
  );

  const isLoading = isCurrentLoading || isPreviousLoading;

  const chartData = React.useMemo(() => {
    if (!currentPeriod) return [];

    const mergedData = [...currentPeriod];
    
    if (previousPeriod?.length) {
      previousPeriod.forEach(prev => {
        const index = mergedData.findIndex(curr => curr.date === prev.date);
        if (index !== -1) {
          mergedData[index] = { ...mergedData[index], previousValue: prev.previousValue };
        } else {
          mergedData.push(prev);
        }
      });
    }

    return mergedData.sort((a, b) => a.date.localeCompare(b.date));
  }, [currentPeriod, previousPeriod]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
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
              Historique - {metricDefinition.label}
            </h2>
            <p className="text-sm text-gray-400">{metricDefinition.description}</p>
          </div>
          <DateRangeSelector selectedRange={dateRange} onChange={setDateRange} />
        </div>

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
                          <p className="text-gray-400 text-xs mb-2">
                            {format(parseISO(label), 'dd MMMM yyyy', { locale: fr })}
                          </p>
                          {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-gray-300">{entry.name}:</span>
                              <span className="text-white font-medium">
                                {formatMetric(entry.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => (
                    <span className="text-gray-300">{value}</span>
                  )}
                />
                <Line
                  name="Période actuelle"
                  type="monotone"
                  dataKey="value"
                  stroke={metricDefinition.color}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
                {previousPeriod && previousPeriod.length > 0 && (
                  <Line
                    name="Période précédente"
                    type="monotone"
                    dataKey="previousValue"
                    stroke="#4B5563"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3, strokeWidth: 2, fill: '#4B5563' }}
                    activeDot={{ r: 5, strokeWidth: 2 }}
                    opacity={0.7}
                  />
                )}
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