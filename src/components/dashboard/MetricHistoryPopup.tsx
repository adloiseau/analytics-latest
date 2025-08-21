import React from 'react';
import { X } from 'lucide-react';
import { useSmartPopupPosition } from '../../hooks/useSmartPopupPosition';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, subDays, addDays } from 'date-fns';
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
  const popupRef = React.useRef<HTMLDivElement>(null);
  const [triggerElement, setTriggerElement] = React.useState<HTMLElement | null>(null);
  
  // Récupérer l'élément déclencheur depuis le DOM
  React.useEffect(() => {
    const hostname = new URL(siteUrl).hostname;
    const cards = document.querySelectorAll('[class*="rounded-xl"]');
    
    for (const card of cards) {
      if (card.textContent?.includes(hostname)) {
        setTriggerElement(card as HTMLElement);
        break;
      }
    }
  }, [siteUrl]);

  const position = useSmartPopupPosition({
    triggerElement,
    popupHeight: 500,
    popupWidth: 900,
    offset: 20
  });

  const { accessToken } = useAuth();
  const { dateRange, setDateRange } = useFilters();
  const { startDate, endDate } = getDateRange(dateRange);

  // Calculate previous period dates
  const currentStartDate = parseISO(startDate);
  const currentEndDate = parseISO(endDate);
  const daysDiff = Math.ceil((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const previousStartDate = format(subDays(currentStartDate, daysDiff), 'yyyy-MM-dd');
  const previousEndDate = format(subDays(currentEndDate, daysDiff), 'yyyy-MM-dd');

  // Adjust end date for Search Console data to account for data processing delay
  const searchConsoleEndDate = format(subDays(currentEndDate, 3), 'yyyy-MM-dd');
  const previousSearchConsoleEndDate = format(subDays(parseISO(previousEndDate), 3), 'yyyy-MM-dd');

  const { data: currentPeriod, isLoading: isCurrentLoading } = useQuery(
    ['metricHistory', siteUrl, metricKey, startDate, endDate],
    async () => {
      if (metricKey === 'clicks' || metricKey === 'impressions') {
        const response = await searchConsoleApi.fetchSearchAnalytics(accessToken!, siteUrl, {
          startDate,
          endDate: searchConsoleEndDate,
          dimensions: ['date'],
          rowLimit: 1000
        });
        
        const dates = [];
        let currentDate = new Date(startDate);
        const endDateObj = new Date(endDate);
        while (currentDate <= endDateObj) {
          dates.push(format(currentDate, 'yyyy-MM-dd'));
          currentDate = addDays(currentDate, 1);
        }

        return dates.map(date => {
          const row = response.rows?.find(r => r.keys[0] === date);
          const dateObj = parseISO(date);
          const searchConsoleEndDateObj = parseISO(searchConsoleEndDate);
          return {
            date,
            value: dateObj <= searchConsoleEndDateObj ? (row ? row[metricKey] : 0) : null
          };
        });
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
          endDate: previousSearchConsoleEndDate,
          dimensions: ['date'],
          rowLimit: 1000
        });

        const dates = [];
        let currentDate = new Date(previousStartDate);
        const endDateObj = new Date(previousEndDate);
        while (currentDate <= endDateObj) {
          dates.push(format(currentDate, 'yyyy-MM-dd'));
          currentDate = addDays(currentDate, 1);
        }

        return dates.map(date => {
          const row = response.rows?.find(r => r.keys[0] === date);
          const dateObj = parseISO(date);
          const searchConsoleEndDateObj = parseISO(previousSearchConsoleEndDate);
          return {
            date: format(addDays(parseISO(date), daysDiff), 'yyyy-MM-dd'),
            previousValue: dateObj <= searchConsoleEndDateObj ? (row ? row[metricKey] : 0) : null
          };
        });
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
        }
      });
    }

    return mergedData
      .sort((a, b) => a.date.localeCompare(b.date))
      .filter(item => item.value !== null || item.previousValue !== null);
  }, [currentPeriod, previousPeriod]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]">
      <div 
        ref={popupRef}
        className="fixed bg-[#25262b] rounded-lg p-6 w-[90vw] max-w-4xl relative shadow-2xl"
        style={{
          ...position,
          minWidth: '320px'
        }}
      >
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
                          <p className="text-gray-400 text-xs mb-1">
                            {format(parseISO(label), 'dd MMMM yyyy', { locale: fr })}
                          </p>
                          {payload.map((entry: any, index: number) => (
                            <p key={index} className="text-white text-sm">
                              {entry.name}: {formatMetric(entry.value)}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Line
                  name="Période actuelle"
                  type="monotone"
                  dataKey="value"
                  stroke={metricDefinition.color}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                />
                {previousPeriod && previousPeriod.length > 0 && (
                  <Line
                    name="Période précédente"
                    type="monotone"
                    dataKey="previousValue"
                    stroke="#4B5563"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4, strokeWidth: 2 }}
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