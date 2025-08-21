import React from 'react';
import { X } from 'lucide-react';
import { useQuery } from 'react-query';
import { metricsService } from '../../services/supabase/metrics';
import { format, subDays } from 'date-fns';
import { SparklineGSC } from '../metrics/SparklineGSC';
import { CoreWebVitalsTooltip } from './CoreWebVitalsTooltip';
import { LighthouseScoreCircle } from './LighthouseScoreCircle';

interface PageSpeedInsightsPopupProps {
  siteUrl: string;
  onClose: () => void;
}

interface PageSpeedMetric {
  current: number;
  j7: number;
  j30: number;
  j90: number;
  metricType: string;
  globalTrend: number;
  history: Array<{ date: string; value: number }>;
}

// Définition des métriques PageSpeed Insights avec groupes
const PAGESPEED_METRICS = {
  // Temps de réponse
  PING_HOME: {
    label: 'Temps de réponse',
    description: 'Ping du site (ms)',
    color: '#3b82f6',
    unit: 'ms',
    category: 'ping',
    partner: 'PING_ARTICLE'
  },
  PING_ARTICLE: {
    label: 'Temps de réponse Article',
    description: 'Ping des articles (ms)',
    color: '#06b6d4',
    unit: 'ms',
    category: 'ping',
    isPartner: true
  },
  
  // Core Web Vitals
  LCP_HOME: {
    label: 'LCP',
    description: 'Largest Contentful Paint',
    color: '#10b981',
    unit: 's',
    category: 'vitals',
    partner: 'LCP_ARTICLE'
  },
  LCP_ARTICLE: {
    label: 'LCP Article',
    description: 'LCP des articles',
    color: '#14b8a6',
    unit: 's',
    category: 'vitals',
    isPartner: true
  },
  
  FCP_HOME: {
    label: 'FCP',
    description: 'First Contentful Paint',
    color: '#14b8a6',
    unit: 's',
    category: 'vitals',
    partner: 'FCP_ARTICLE'
  },
  FCP_ARTICLE: {
    label: 'FCP Article',
    description: 'FCP des articles',
    color: '#16a34a',
    unit: 's',
    category: 'vitals',
    isPartner: true
  },
  
  INP_HOME: {
    label: 'INP',
    description: 'Interaction to Next Paint',
    color: '#6366f1',
    unit: 'ms',
    category: 'vitals',
    partner: 'INP_ARTICLE'
  },
  INP_ARTICLE: {
    label: 'INP Article',
    description: 'INP des articles',
    color: '#7c3aed',
    unit: 'ms',
    category: 'vitals',
    isPartner: true
  },
  
  CLS_HOME: {
    label: 'CLS',
    description: 'Cumulative Layout Shift',
    color: '#8b5cf6',
    unit: '',
    category: 'vitals',
    partner: 'CLS_ARTICLE'
  },
  CLS_ARTICLE: {
    label: 'CLS Article',
    description: 'CLS des articles',
    color: '#a855f7',
    unit: '',
    category: 'vitals',
    isPartner: true
  },
  
  TTFB_HOME: {
    label: 'TTFB',
    description: 'Time To First Byte',
    color: '#f59e0b',
    unit: 'ms',
    category: 'vitals',
    partner: 'TTFB_ARTICLE'
  },
  TTFB_ARTICLE: {
    label: 'TTFB Article',
    description: 'TTFB des articles',
    color: '#f97316',
    unit: 'ms',
    category: 'vitals',
    isPartner: true
  },
  
  // Scores Lighthouse
  PERFORMANCE_HOME: {
    label: 'Performance',
    description: 'Score Lighthouse Performance',
    color: '#ef4444',
    unit: '/100',
    category: 'lighthouse',
    partner: 'PERFORMANCE_ARTICLE'
  },
  PERFORMANCE_ARTICLE: {
    label: 'Performance Article',
    description: 'Performance des articles',
    color: '#dc2626',
    unit: '/100',
    category: 'lighthouse',
    isPartner: true
  },
  
  ACCESSIBILITY_HOME: {
    label: 'Accessibilité',
    description: 'Score Lighthouse Accessibilité',
    color: '#f97316',
    unit: '/100',
    category: 'lighthouse',
    partner: 'ACCESSIBILITY_ARTICLE'
  },
  ACCESSIBILITY_ARTICLE: {
    label: 'Accessibilité Article',
    description: 'Accessibilité des articles',
    color: '#ea580c',
    unit: '/100',
    category: 'lighthouse',
    isPartner: true
  },
  
  BEST_PRACTICES_HOME: {
    label: 'Bonnes Pratiques',
    description: 'Score Lighthouse Bonnes Pratiques',
    color: '#84cc16',
    unit: '/100',
    category: 'lighthouse',
    partner: 'BEST_PRACTICES_ARTICLE'
  },
  BEST_PRACTICES_ARTICLE: {
    label: 'Bonnes Pratiques Article',
    description: 'Bonnes pratiques des articles',
    color: '#65a30d',
    unit: '/100',
    category: 'lighthouse',
    isPartner: true
  },
  
  SEO_HOME: {
    label: 'SEO',
    description: 'Score Lighthouse SEO',
    color: '#22c55e',
    unit: '/100',
    category: 'lighthouse',
    partner: 'SEO_ARTICLE'
  },
  SEO_ARTICLE: {
    label: 'SEO Article',
    description: 'SEO des articles',
    color: '#16a34a',
    unit: '/100',
    category: 'lighthouse',
    isPartner: true
  }
};

export const PageSpeedInsightsPopup: React.FC<PageSpeedInsightsPopupProps> = ({
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

  const metricsToShow = Object.keys(PAGESPEED_METRICS);

  const { data: allMetrics, isLoading } = useQuery(
    ['pageSpeedMetrics', siteUrl],
    async () => {
      const metrics: Record<string, PageSpeedMetric> = {};
      
      for (const metricType of metricsToShow) {
        try {
          const history = await metricsService.getMetricsHistory(siteUrl, metricType, 90);
          
          const current = history.find(h => h.date === today)?.value || 0;
          const j7 = history.find(h => h.date === j7Date)?.value || 0;
          const j30 = history.find(h => h.date === j30Date)?.value || 0;
          const j90 = history.find(h => h.date === j90Date)?.value || 0;
          
          const globalTrend = j90 === 0 ? 0 : ((current - j90) / j90) * 100;
          
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

  const formatMetricValue = (value: number, unit: string): string => {
    if (value === 0) return '0';
    
    if (unit === 'ms') {
      return `${Math.round(value)}`;
    } else if (unit === 's') {
      return `${(value / 1000).toFixed(2)}`;
    } else if (unit === '/100') {
      return `${Math.round(value)}`;
    } else {
      return value.toFixed(3);
    }
  };

  const formatDifference = (current: number, previous: number): string => {
    const diff = current - previous;
    if (diff === 0) return '(0)';
    
    const sign = diff > 0 ? '+' : '';
    const absValue = Math.abs(diff);
    
    if (absValue >= 1000) {
      return `(${sign}${(absValue / 1000).toFixed(1)}k)`;
    }
    return `(${sign}${absValue.toFixed(0)})`;
  };

  const getCardGradient = (trend: number, category: string) => {
    const isPerformanceMetric = category.includes('vitals') || category.includes('ping');
    const isGoodTrend = isPerformanceMetric ? trend < 0 : trend > 0;
    
    if (Math.abs(trend) > 10) {
      return isGoodTrend 
        ? 'from-green-500/20 to-emerald-600/20 border-green-500/30' 
        : 'from-red-500/20 to-rose-600/20 border-red-500/30';
    }
    if (trend !== 0) {
      return isGoodTrend 
        ? 'from-blue-500/20 to-cyan-600/20 border-blue-500/30' 
        : 'from-orange-500/20 to-amber-600/20 border-orange-500/30';
    }
    return 'from-gray-500/20 to-gray-600/20 border-gray-600/30';
  };

  const getSparklineColor = (trend: number, category: string) => {
    const isPerformanceMetric = category.includes('vitals') || category.includes('ping');
    const isGoodTrend = isPerformanceMetric ? trend < 0 : trend > 0;
    
    if (Math.abs(trend) > 10) {
      return isGoodTrend ? '#10b981' : '#ef4444';
    }
    if (trend !== 0) {
      return isGoodTrend ? '#3b82f6' : '#f59e0b';
    }
    return '#6b7280';
  };

  const getTrendBadgeColor = (trend: number, category: string) => {
    const isPerformanceMetric = category.includes('vitals') || category.includes('ping');
    const isGoodTrend = isPerformanceMetric ? trend < 0 : trend > 0;
    
    if (Math.abs(trend) > 10) {
      return isGoodTrend 
        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
        : 'bg-red-500/20 text-red-400 border-red-500/30';
    }
    if (trend !== 0) {
      return isGoodTrend 
        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
        : 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    }
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  // Grouper les métriques par catégorie et paires
  const groupedMetrics = React.useMemo(() => {
    const groups = {
      ping: { title: '🏓 Temps de Réponse', metrics: [] },
      vitals: { title: '⚡ Core Web Vitals', metrics: [] },
      lighthouse: { title: '💡 Scores Lighthouse', metrics: [] }
    };

    // Traiter seulement les métriques principales (pas les partners)
    const mainMetrics = metricsToShow.filter(metricType => {
      const definition = PAGESPEED_METRICS[metricType];
      return definition && !definition.isPartner;
    });

    mainMetrics.forEach(metricType => {
      const definition = PAGESPEED_METRICS[metricType];
      const partnerType = definition.partner;
      
      if (definition && allMetrics?.[metricType]) {
        const mainData = allMetrics[metricType];
        const partnerData = partnerType ? allMetrics[partnerType] : null;
        
        groups[definition.category]?.metrics.push({
          type: metricType,
          definition,
          data: mainData,
          partnerType,
          partnerDefinition: partnerType ? PAGESPEED_METRICS[partnerType] : null,
          partnerData
        });
      }
    });

    return Object.values(groups).filter(group => group.metrics.length > 0);
  }, [allMetrics, metricsToShow]);

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
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <span className="text-orange-400 text-lg">⚡</span>
              </div>
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
            <p className="text-sm text-gray-400">PageSpeed Insights & Core Web Vitals</p>
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
            <div className="space-y-6">
              {groupedMetrics.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <h3 className="text-base font-semibold text-white mb-4 border-b border-gray-800/30 pb-2">
                    {group.title}
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {group.metrics.map(({ type, definition, data, partnerType, partnerDefinition, partnerData }) => {
                      const sparklineData = data.history.map(h => h.value);

                      return (
                        <div 
                          key={type}
                          className={`relative rounded-xl p-4 border overflow-hidden bg-gradient-to-br ${getCardGradient(data.globalTrend, definition.category)} backdrop-blur-sm`}
                        >
                          {/* Background sparkline */}
                          {sparklineData.length > 0 && (
                            <div className="absolute inset-0 opacity-15">
                              <SparklineGSC 
                                data={sparklineData} 
                                color={getSparklineColor(data.globalTrend, definition.category)}
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
                                  <div className="flex items-center gap-1">
                                    <h3 className="text-base font-semibold text-white">{definition.label}</h3>
                                    {definition.category === 'vitals' && (
                                      <CoreWebVitalsTooltip
                                        metricType={type}
                                        value={data.current}
                                        unit={definition.unit}
                                      >
                                        <span className="text-gray-400 hover:text-white cursor-help text-sm">ℹ️</span>
                                      </CoreWebVitalsTooltip>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400 leading-tight">{definition.description}</p>
                                </div>
                              </div>
                              
                              {/* Badge de tendance */}
                              {data.globalTrend !== 0 && (
                                <div className={`px-2 py-1 rounded-full text-xs font-bold border ${getTrendBadgeColor(data.globalTrend, definition.category)}`}>
                                  {data.globalTrend > 0 ? '+' : ''}{data.globalTrend.toFixed(1)}%
                                </div>
                              )}
                            </div>

                            {/* Valeurs Home et Article */}
                            {definition.category === 'lighthouse' ? (
                              /* Affichage spécial pour les scores Lighthouse */
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                {/* Home Score */}
                                <div>
                                  <div className="flex items-center gap-1 mb-1">
                                    <span className="text-blue-300 text-sm">🏠</span>
                                    <span className="text-xs text-gray-400">Home</span>
                                  </div>
                                  <div className="flex justify-center">
                                    <LighthouseScoreCircle 
                                      score={Math.round(data.current)} 
                                      size={60}
                                    />
                                  </div>
                                </div>

                                {/* Article Score */}
                                {partnerData && partnerDefinition && (
                                  <div>
                                    <div className="flex items-center gap-1 mb-1">
                                      <span className="text-green-300 text-sm">📄</span>
                                      <span className="text-xs text-gray-400">Article</span>
                                    </div>
                                    <div className="flex justify-center">
                                      <LighthouseScoreCircle 
                                        score={Math.round(partnerData.current)} 
                                        size={60}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* Affichage normal pour les autres métriques */
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                {/* Home */}
                                <div>
                                  <div className="flex items-center gap-1 mb-1">
                                    <span className="text-blue-300 text-sm">🏠</span>
                                    <span className="text-xs text-gray-400">Home</span>
                                  </div>
                                  <div className="text-lg font-bold text-white">
                                    {formatMetricValue(data.current, definition.unit)}
                                    <span className="text-xs text-gray-400 ml-1">{definition.unit}</span>
                                  </div>
                                </div>

                                {/* Article */}
                                {partnerData && partnerDefinition && (
                                  <div>
                                    <div className="flex items-center gap-1 mb-1">
                                      <span className="text-green-300 text-sm">📄</span>
                                      <span className="text-xs text-gray-400">Article</span>
                                    </div>
                                    <div className="text-lg font-bold text-white">
                                      {formatMetricValue(partnerData.current, partnerDefinition.unit)}
                                      <span className="text-xs text-gray-400 ml-1">{partnerDefinition.unit}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            {/* Valeurs historiques compactes */}
                            {definition.category === 'lighthouse' ? (
                              /* Historique compact pour Lighthouse */
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">J-7</div>
                                  <div className="flex justify-center">
                                    <LighthouseScoreCircle 
                                      score={Math.round(data.j7)} 
                                      size={32}
                                      compact
                                    />
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">J-30</div>
                                  <div className="flex justify-center">
                                    <LighthouseScoreCircle 
                                      score={Math.round(data.j30)} 
                                      size={32}
                                      compact
                                    />
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">J-90</div>
                                  <div className="flex justify-center">
                                    <LighthouseScoreCircle 
                                      score={Math.round(data.j90)} 
                                      size={32}
                                      compact
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* Historique normal pour les autres métriques */
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <div className="text-xs text-gray-400 mb-0.5">J-7</div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                      <span className="text-blue-300 text-xs">🏠</span>
                                      <span className="text-xs font-medium text-white">{formatMetricValue(data.j7, definition.unit)}</span>
                                    </div>
                                    {partnerData && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-green-300 text-xs">📄</span>
                                        <span className="text-xs font-medium text-white">{formatMetricValue(partnerData.j7, partnerDefinition?.unit || '')}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <div className="text-xs text-gray-400 mb-0.5">J-30</div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                      <span className="text-blue-300 text-xs">🏠</span>
                                      <span className="text-xs font-medium text-white">{formatMetricValue(data.j30, definition.unit)}</span>
                                    </div>
                                    {partnerData && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-green-300 text-xs">📄</span>
                                        <span className="text-xs font-medium text-white">{formatMetricValue(partnerData.j30, partnerDefinition?.unit || '')}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <div className="text-xs text-gray-400 mb-0.5">J-90</div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                      <span className="text-blue-300 text-xs">🏠</span>
                                      <span className="text-xs font-medium text-white">{formatMetricValue(data.j90, definition.unit)}</span>
                                    </div>
                                    {partnerData && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-green-300 text-xs">📄</span>
                                        <span className="text-xs font-medium text-white">{formatMetricValue(partnerData.j90, partnerDefinition?.unit || '')}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && (!allMetrics || Object.keys(allMetrics).length === 0) && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">Aucune métrique PageSpeed disponible</div>
              <div className="text-sm text-gray-500">
                Les données PageSpeed Insights pour ce site ne sont pas encore disponibles
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};