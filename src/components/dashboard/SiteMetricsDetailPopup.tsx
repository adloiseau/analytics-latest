import React from 'react';
import { X } from 'lucide-react';
import { useQuery } from 'react-query';
import { metricsService } from '../../services/supabase/metrics';
import { METRIC_DEFINITIONS } from '../../types/metrics';
import { format, subDays } from 'date-fns';
import { SparklineGSC } from '../metrics/SparklineGSC';

interface SiteMetricsDetailPopupProps {
  siteUrl: string;
  onClose: () => void;
}

interface MetricData {
  current: number;
  j7: number;
  j30: number;
  j90: number;
  metricType: string;
  globalTrend: number;
  history: Array<{ date: string; value: number }>;
}

export const SiteMetricsDetailPopup: React.FC<SiteMetricsDetailPopupProps> = ({
  siteUrl,
  onClose
}) => {
  const popupRef = React.useRef<HTMLDivElement>(null);

  // Gestionnaire pour fermer la popup en cliquant en dehors
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Gestionnaire pour les touches (Escape pour fermer)
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const hostname = new URL(siteUrl).hostname;
  const today = format(new Date(), 'yyyy-MM-dd');
  const j7Date = format(subDays(new Date(), 7), 'yyyy-MM-dd');
  const j30Date = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const j90Date = format(subDays(new Date(), 90), 'yyyy-MM-dd');

  const metricsToShow = ['TO', 'AS', 'BL', 'RD', 'KD', 'VI', 'TF_root', 'CF_root'];

  const { data: allMetrics, isLoading } = useQuery(
    ['siteMetricsDetail', siteUrl],
    async () => {
      const metrics: Record<string, MetricData> = {};
      
      for (const metricType of metricsToShow) {
        try {
          const history = await metricsService.getMetricsHistory(siteUrl, metricType, 90);
          
          const current = history.find(h => h.date === today)?.value || 0;
          const j7 = history.find(h => h.date === j7Date)?.value || 0;
          const j30 = history.find(h => h.date === j30Date)?.value || 0;
          const j90 = history.find(h => h.date === j90Date)?.value || 0;
          
          const globalTrend = j90 === 0 ? 0 : ((current - j90) / j90) * 100;
          
          // Préparer les données pour la sparkline (derniers 30 jours)
          const sparklineHistory = history
            .slice(0, 30)
            .reverse()
            .map(item => ({ date: item.date, value: item.value }));
          
          metrics[metricType] = {
            current,
            j7,
            j30,
            j90,
            metricType,
            globalTrend,
            history: sparklineHistory
          };
        } catch (error) {
          metrics[metricType] = {
            current: 0,
            j7: 0,
            j30: 0,
            j90: 0,
            metricType,
            globalTrend: 0,
            history: []
          };
        }
      }
      
      return metrics;
    },
    {
      staleTime: 5 * 60 * 1000,
      retry: 1
    }
  );

  const formatMetricValue = (value: number): string => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (absValue >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const formatDifference = (current: number, previous: number): string => {
    const diff = current - previous;
    if (diff === 0) return '(0)';
    
    const sign = diff > 0 ? '+' : '';
    const absValue = Math.abs(diff);
    
    let formattedValue: string;
    if (absValue >= 1000000) {
      formattedValue = `${(absValue / 1000000).toFixed(1)}M`;
    } else if (absValue >= 1000) {
      formattedValue = `${(absValue / 1000).toFixed(1)}K`;
    } else {
      formattedValue = absValue.toString();
    }
    
    return `(${sign}${formattedValue})`;
  };

  const getCardGradient = (trend: number) => {
    if (trend > 10) return 'from-green-500/20 to-emerald-600/20 border-green-500/30';
    if (trend > 0) return 'from-blue-500/20 to-cyan-600/20 border-blue-500/30';
    if (trend < -10) return 'from-red-500/20 to-rose-600/20 border-red-500/30';
    if (trend < 0) return 'from-orange-500/20 to-amber-600/20 border-orange-500/30';
    return 'from-gray-500/20 to-gray-600/20 border-gray-600/30';
  };

  const getSparklineColor = (trend: number) => {
    if (trend > 10) return '#10b981'; // Green
    if (trend > 0) return '#3b82f6'; // Blue
    if (trend < -10) return '#ef4444'; // Red
    if (trend < 0) return '#f59e0b'; // Orange
    return '#6b7280'; // Gray
  };

  const getTrendBadgeColor = (trend: number) => {
    if (trend > 10) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (trend > 0) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (trend < -10) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (trend < 0) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={popupRef}
        className="bg-[#1a1b1e] rounded-xl p-6 w-full max-w-7xl relative 
                   max-h-[90vh] overflow-y-auto border border-gray-800/50"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[#25262b] text-gray-400 hover:text-white z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <img 
                src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                alt={hostname}
                className="w-6 h-6 rounded-md"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                      <path d="M2 12h20"/>
                    </svg>
                  `)}`;
                }}
              />
              <h2 className="text-xl font-semibold text-white pr-8">{hostname}</h2>
            </div>
            <p className="text-sm text-gray-400">Métriques détaillées</p>
          </div>
        </div>

        {/* Content */}
        <div>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}

          {!isLoading && allMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {metricsToShow.map((metricType) => {
                const metric = allMetrics[metricType];
                const definition = METRIC_DEFINITIONS[metricType];
                if (!definition || !metric) return null;

                const sparklineData = metric.history.map(h => h.value);

                return (
                  <div 
                    key={metricType}
                    className={`relative rounded-xl p-4 border overflow-hidden bg-gradient-to-br ${getCardGradient(metric.globalTrend)} backdrop-blur-sm`}
                  >
                    {/* Background sparkline */}
                    {sparklineData.length > 0 && (
                      <div className="absolute inset-0 opacity-15">
                        <SparklineGSC 
                          data={sparklineData} 
                          color={getSparklineColor(metric.globalTrend)}
                          height={140}
                        />
                      </div>
                    )}
                    
                    <div className="relative z-10">
                      {/* Header avec nom et tendance */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: definition.color }}
                          />
                          <div>
                            <h3 className="text-base font-semibold text-white">{definition.label}</h3>
                            <p className="text-xs text-gray-400 leading-tight">{definition.description}</p>
                          </div>
                        </div>
                        
                        {/* Badge de tendance */}
                        {metric.globalTrend !== 0 && (
                          <div className={`px-2 py-1 rounded-full text-xs font-bold border ${getTrendBadgeColor(metric.globalTrend)}`}>
                            {metric.globalTrend > 0 ? '+' : ''}{metric.globalTrend.toFixed(1)}%
                          </div>
                        )}
                      </div>

                      {/* Valeur actuelle */}
                      <div className="mb-3">
                        <div className="text-xs text-gray-400 mb-0.5">Actuel</div>
                        <div className="text-xl font-bold text-white">{formatMetricValue(metric.current)}</div>
                      </div>

                      {/* Valeurs historiques */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <div className="text-xs text-gray-400 mb-0.5">J-7</div>
                          <div className="text-sm font-semibold text-white">{formatMetricValue(metric.j7)}</div>
                          <div className={`text-xs font-medium ${
                            metric.current > metric.j7 ? 'text-green-400' :
                            metric.current < metric.j7 ? 'text-red-400' :
                            'text-gray-500'
                          }`}>
                            {formatDifference(metric.current, metric.j7)}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-400 mb-0.5">J-30</div>
                          <div className="text-sm font-semibold text-white">{formatMetricValue(metric.j30)}</div>
                          <div className={`text-xs font-medium ${
                            metric.current > metric.j30 ? 'text-green-400' :
                            metric.current < metric.j30 ? 'text-red-400' :
                            'text-gray-500'
                          }`}>
                            {formatDifference(metric.current, metric.j30)}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-400 mb-0.5">J-90</div>
                          <div className="text-sm font-semibold text-white">{formatMetricValue(metric.j90)}</div>
                          <div className={`text-xs font-medium ${
                            metric.current > metric.j90 ? 'text-green-400' :
                            metric.current < metric.j90 ? 'text-red-400' :
                            'text-gray-500'
                          }`}>
                            {formatDifference(metric.current, metric.j90)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && (!allMetrics || Object.keys(allMetrics).length === 0) && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">Aucune métrique disponible</div>
              <div className="text-sm text-gray-500">
                Les données pour ce site ne sont pas encore disponibles
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};