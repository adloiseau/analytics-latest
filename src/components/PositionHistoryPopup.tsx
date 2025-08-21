import React from 'react';
import { X } from 'lucide-react';
import { useSmartPopupPosition } from '../hooks/useSmartPopupPosition';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSearchConsoleData } from '../hooks/useSearchConsoleData';
import { useFilters } from '../contexts/FilterContext';
import { DateRangeSelector } from './DateRangeSelector';
import { getDateRange } from '../utils/dates';
import { formatMetric } from '../utils/metrics';

interface PositionHistoryPopupProps {
  item: any;
  dimension: 'page' | 'query';
  onClose: () => void;
}

export const PositionHistoryPopup: React.FC<PositionHistoryPopupProps> = ({ item, dimension, onClose }) => {
  const popupRef = React.useRef<HTMLDivElement>(null);
  
  const position = useSmartPopupPosition({
    triggerElement: null,
    popupHeight: 500,
    popupWidth: 900,
    offset: 20
  });
  const { dateRange, setDateRange } = useFilters();
  const { startDate, endDate } = getDateRange(dateRange);

  // Calculate previous period dates
  const currentStartDate = parseISO(startDate);
  const currentEndDate = parseISO(endDate);
  const daysDiff = Math.ceil((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const previousStartDate = format(subDays(currentStartDate, daysDiff), 'yyyy-MM-dd');
  const previousEndDate = format(subDays(currentEndDate, daysDiff), 'yyyy-MM-dd');

  // Fetch data for current and previous periods with the filter for the specific item
  const { data: currentData } = useSearchConsoleData(dimension, startDate, endDate, item.keys[0]);
  const { data: previousData } = useSearchConsoleData(dimension, previousStartDate, previousEndDate, item.keys[0]);

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

  // Prepare chart data
  const chartData = currentData?.chartData?.map(current => {
    const previousDay = previousData?.chartData?.find(prev => 
      format(subDays(parseISO(prev.date), -daysDiff), 'yyyy-MM-dd') === current.date
    );

    return {
      date: current.date,
      clicks: current.clicks,
      impressions: current.impressions,
      previousClicks: previousDay?.clicks,
      previousImpressions: previousDay?.impressions
    };
  }) || [];

  // Définition des couleurs pour une meilleure différenciation
  const colors = {
    currentClicks: '#3b82f6', // Bleu vif
    currentImpressions: '#10b981', // Vert vif
    previousClicks: '#93c5fd', // Bleu plus clair
    previousImpressions: '#6ee7b7' // Vert plus clair
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
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
              Historique des métriques
            </h2>
            <p className="text-sm text-gray-400">
              {formatKey(item.keys[0])}
            </p>
          </div>
          <DateRangeSelector selectedRange={dateRange} onChange={setDateRange} />
        </div>

        <div className="h-[400px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="date"
                  stroke="#666"
                  tick={{ fill: '#666' }}
                  tickFormatter={(date) => format(parseISO(date), 'dd MMM', { locale: fr })}
                />
                <YAxis 
                  yAxisId="left"
                  stroke={colors.currentClicks}
                  tick={{ fill: colors.currentClicks }}
                  tickFormatter={formatMetric}
                  label={{ 
                    value: 'Clics', 
                    angle: -90, 
                    position: 'insideLeft',
                    fill: colors.currentClicks
                  }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke={colors.currentImpressions}
                  tick={{ fill: colors.currentImpressions }}
                  tickFormatter={formatMetric}
                  label={{ 
                    value: 'Impressions', 
                    angle: 90, 
                    position: 'insideRight',
                    fill: colors.currentImpressions
                  }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#1a1b1e]/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-800/50">
                          <p className="text-gray-400 text-xs mb-1">
                            {format(parseISO(label), 'dd MMMM yyyy', { locale: fr })}
                          </p>
                          {payload.map((entry: any) => {
                            if (!entry.value) return null;
                            const isPrevious = entry.dataKey.startsWith('previous');
                            return (
                              <p key={entry.dataKey} className="text-white text-sm">
                                {isPrevious ? 'Période précédente' : 'Période actuelle'} - {' '}
                                {entry.dataKey.includes('clicks') ? 'Clics' : 'Impressions'}: {' '}
                                {formatMetric(entry.value)}
                              </p>
                            );
                          })}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="clicks"
                  name="Clics (période actuelle)"
                  stroke={colors.currentClicks}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="impressions"
                  name="Impressions (période actuelle)"
                  stroke={colors.currentImpressions}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="previousClicks"
                  name="Clics (période précédente)"
                  stroke={colors.previousClicks}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="previousImpressions"
                  name="Impressions (période précédente)"
                  stroke={colors.previousImpressions}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Aucune donnée disponible pour la période sélectionnée
            </div>
          )}
        </div>
      </div>
    </div>
  );
};