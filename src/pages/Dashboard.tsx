import React, { useState } from 'react';
import { useSearchConsoleData } from '../hooks/useSearchConsoleData';
import { useLastMetricUpdate } from '../hooks/useLastMetricUpdate';
import { useGAPropertiesMap } from '../hooks/useGAProperties';
import { Layout } from '../components/Layout';
import { useFilters } from '../contexts/FilterContext';
import { useAuth } from '../contexts/AuthContext';
import { getDateRange } from '../utils/dates';
import { Globe, TrendingUp, TrendingDown, BarChart3, Zap } from 'lucide-react';
import { formatMetric } from '../utils/metrics';
import { SparklineGSC } from '../components/metrics/SparklineGSC';
import { useMetrics } from '../hooks/useMetrics';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { SiteMetricsDetailPopup } from '../components/dashboard/SiteMetricsDetailPopup';
import { PageSpeedInsightsPopup } from '../components/dashboard/PageSpeedInsightsPopup';

// Composant SiteCard qui reçoit les métriques TO en props
const SiteCard = React.memo(({ site, toMetrics, onMetricsClick, onPageSpeedClick, isGoogleConnected }) => {
  const hostname = new URL(site.keys[0]).hostname;
  const favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  
  // Récupérer les métriques Google Analytics pour les visiteurs en temps réel
  const { metrics: analyticsMetrics } = useGoogleAnalytics(site.keys[0]);

  // Utiliser les métriques TO passées en props
  const currentTO = toMetrics?.value || 0;
  const previousTO = toMetrics?.previousValue || 0;
  const trend = previousTO > 0 ? ((currentTO - previousTO) / previousTO) * 100 : 0;
  
  // Utiliser les vraies données historiques pour la sparkline
  const realSparklineData = React.useMemo(() => {
    if (toMetrics?.history && toMetrics.history.length > 0) {
      // Prendre les 7 derniers jours et inverser pour avoir l'ordre chronologique
      return toMetrics.history
        .slice(0, 7)
        .reverse()
        .map(item => item.value);
    }
    return [];
  }, [toMetrics?.history]);

  // Déterminer la couleur de la carte basée sur la performance
  const getCardGradient = () => {
    if (currentTO === 0) return 'from-gray-800/20 to-gray-900/20';
    if (trend > 10) return 'from-green-500/20 to-emerald-600/20';
    if (trend > 0) return 'from-blue-500/20 to-cyan-600/20';
    if (trend < -10) return 'from-red-500/20 to-rose-600/20';
    return 'from-orange-500/20 to-amber-600/20';
  };

  const getSparklineColor = () => {
    if (trend > 0) return '#10b981'; // Green
    if (trend < 0) return '#ef4444'; // Red
    return '#3b82f6'; // Blue
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group
                    ${currentTO > 0 ? 'border-gray-700/50 hover:border-gray-600/50' : 'border-gray-800/30 hover:border-gray-700/30'}
                    bg-gradient-to-br ${getCardGradient()} backdrop-blur-sm`}>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-white/5 to-transparent" />
      </div>

      {/* Sparkline Background */}
      {realSparklineData.length > 0 && (
        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-all duration-500">
          <SparklineGSC data={realSparklineData} color={getSparklineColor()} />
        </div>
      )}
      
      <div className="relative z-10 p-4 h-[120px] flex flex-col justify-between">
        {/* Header avec favicon et nom */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="relative">
            <img 
              src={favicon}
              alt={hostname}
              className="w-6 h-6 rounded-md shadow-sm"
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
            {/* Indicateur de statut */}
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900
                           ${currentTO > 0 ? 'bg-green-400' : 'bg-gray-500'}`} />
          </div>
          <div className="flex-1 min-w-0 mr-2">
            <h3 className="text-sm font-semibold text-white truncate">{hostname}</h3>
          </div>
          
          {/* Boutons d'action et badge visiteurs */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Visiteurs 30m si connecté aux APIs Google ET > 0 */}
            {isGoogleConnected && analyticsMetrics?.realtimeUsers > 0 && (
              <div className="px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-full text-xs text-white font-medium shadow-lg border border-white/20">
                👥 {formatMetric(analyticsMetrics.realtimeUsers)}
              </div>
            )}
            
            {/* Bouton Métriques du site */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMetricsClick(site.keys[0]);
              }}
              className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 
                       transition-colors border border-blue-500/30 hover:border-blue-500/50 shadow-sm"
              title="Métriques du site"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            
            {/* Bouton PageSpeed Insights */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPageSpeedClick(site.keys[0]);
              }}
              className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 
                       transition-colors border border-orange-500/30 hover:border-orange-500/50 shadow-sm"
              title="PageSpeed Insights"
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ligne séparatrice subtile */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700/30 to-transparent my-1.5" />

        {/* Métriques principales */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <div className="text-xl font-bold text-white mb-1">
              {formatMetric(currentTO)}
            </div>
            {previousTO > 0 && (
              <div className="text-xs text-gray-400">
                Précédent: {formatMetric(previousTO)}
              </div>
            )}
          </div>

          {/* Indicateur de tendance */}
          {trend !== 0 && (
            <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium
                           ${trend >= 0 
                             ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                             : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {trend >= 0 ? (
                <TrendingUp className="w-2.5 h-2.5" />
              ) : (
                <TrendingDown className="w-2.5 h-2.5" />
              )}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Barre de progression en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/50">
        <div 
          className={`h-full transition-all duration-1000 ${
            trend > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
            trend < 0 ? 'bg-gradient-to-r from-red-500 to-rose-400' :
            'bg-gradient-to-r from-blue-500 to-cyan-400'
          }`}
          style={{ 
            width: `${Math.min(100, Math.max(10, 50))}%`
          }}
        />
      </div>
    </div>
  );
});

SiteCard.displayName = 'SiteCard';

// Composant séparé pour gérer le chargement des métriques et le tri
const SitesGridWithMetrics = ({ sites, isLoading, error, totalSites, onMetricsClick, onPageSpeedClick, isGoogleConnected }) => {
  const [metricsLoaded, setMetricsLoaded] = React.useState(false);
  const [sitesWithMetrics, setSitesWithMetrics] = React.useState([]);

  // Charger les métriques TO pour chaque site individuellement
  const SiteWithMetrics = ({ site }) => {
    const { data: siteMetrics } = useMetrics(site.keys[0]);
    
    React.useEffect(() => {
      if (siteMetrics?.TO) {
        setSitesWithMetrics(prev => {
          const updated = prev.filter(s => s.siteUrl !== site.keys[0]);
          updated.push({
            ...site,
            siteUrl: site.keys[0],
            toMetrics: siteMetrics.TO,
            isLoaded: true
          });
          return updated;
        });
      }
    }, [siteMetrics, site]);

    return null;
  };

  // Vérifier si toutes les métriques sont chargées
  React.useEffect(() => {
    const loadedCount = sitesWithMetrics.filter(s => s.isLoaded).length;
    const totalCount = sites.length;
    
    if (loadedCount === totalCount && totalCount > 0) {
      setMetricsLoaded(true);
    }
  }, [sitesWithMetrics, sites.length]);

  // Trier par TO décroissant une fois que toutes les métriques sont chargées
  const sortedSites = React.useMemo(() => {
    if (!metricsLoaded || sitesWithMetrics.length === 0) {
      return [];
    }
    
    const sorted = [...sitesWithMetrics].sort((a, b) => {
      const aTO = a.toMetrics?.value || 0;
      const bTO = b.toMetrics?.value || 0;
      return bTO - aTO;
    });
    
    return sorted;
  }, [metricsLoaded, sitesWithMetrics]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
        {[...Array(totalSites)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-[120px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-800/30" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full p-4 sm:p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p className="text-red-400 text-center text-sm sm:text-base">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      {/* Composants invisibles pour charger les métriques */}
      {sites.map(site => (
        <SiteWithMetrics key={site.keys[0]} site={site} />
      ))}
      
      {/* Affichage des sites triés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
        {metricsLoaded ? (
          sortedSites.map((site, index) => (
            <SiteCard 
              key={site.siteUrl} 
              site={site}
              toMetrics={site.toMetrics}
              onMetricsClick={onMetricsClick}
              onPageSpeedClick={onPageSpeedClick}
              isGoogleConnected={isGoogleConnected}
            />
          ))
        ) : (
          sites.map((site, index) => (
            <div key={site.keys[0]} className="animate-pulse">
              <div className="h-[120px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-800/30 flex items-center justify-center">
                <div className="text-gray-400 text-sm">Chargement TO...</div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export const Dashboard = () => {
  const [selectedSiteForDetail, setSelectedSiteForDetail] = useState<string | null>(null);
  const [selectedSiteForPageSpeed, setSelectedSiteForPageSpeed] = useState<string | null>(null);
  const { dateRange } = useFilters();
  const { isAuthenticated: isGoogleConnected } = useAuth();
  const { data: lastUpdate, isLoading: isLoadingUpdate } = useLastMetricUpdate();
  const { data: gaPropertiesMap, isLoading: isLoadingProperties } = useGAPropertiesMap();

  const { data: currentData, isLoading, error } = useSearchConsoleData('site');

  // Créer une liste complète des sites avec leurs métriques TO
  const allSitesWithMetrics = React.useMemo(() => {
    if (!gaPropertiesMap) return [];
    
    const sitesMap = new Map();

    // Ajouter tous les sites de gaPropertiesMap
    Object.keys(gaPropertiesMap).forEach((hostname) => {
      const siteUrl = `https://${hostname}`;

      sitesMap.set(siteUrl, {
        keys: [siteUrl],
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
        hostname,
        toValue: 0
      });
    });

    // Fusionner avec les données de Search Console si disponibles
    if (currentData?.rows) {
      currentData.rows.forEach(siteData => {
        const siteUrl = siteData.keys[0];
        if (sitesMap.has(siteUrl)) {
          const existing = sitesMap.get(siteUrl);
          sitesMap.set(siteUrl, {
            ...siteData,
            hostname: existing.hostname,
            toValue: existing.toValue
          });
        }
      });
    }

    return Array.from(sitesMap.values());
  }, [currentData?.rows, gaPropertiesMap]);

  // Calculer les statistiques globales
  const activeSites = allSitesWithMetrics.filter(site => site.clicks > 0 || site.impressions > 0).length;
  const totalSites = Object.keys(gaPropertiesMap || {}).length;

  // Extraire seulement la date de lastUpdate
  const formatDateOnly = (dateString: string | null) => {
    if (!dateString) return null;
    return dateString.split(' à ')[0];
  };

  if (isLoadingProperties) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête avec statistiques globales et date de mise à jour */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div></div>

          {/* Date de mise à jour */}
          <div className="text-right">
            {isLoadingUpdate ? (
              <div className="flex items-center justify-end gap-2 text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                <span className="text-sm">Chargement...</span>
              </div>
            ) : lastUpdate ? (
              <div className="text-lg font-semibold text-white">
                {formatDateOnly(lastUpdate)}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Aucune donnée
              </div>
            )}
          </div>
        </div>

        {/* Composant pour charger et trier les sites */}
        <SitesGridWithMetrics 
          sites={allSitesWithMetrics}
          isLoading={isLoading}
          error={error}
          totalSites={totalSites}
          onMetricsClick={setSelectedSiteForDetail}
          onPageSpeedClick={setSelectedSiteForPageSpeed}
          isGoogleConnected={isGoogleConnected}
        />


        {/* Site Metrics Detail Popup */}
        {selectedSiteForDetail && (
          <SiteMetricsDetailPopup
            siteUrl={selectedSiteForDetail}
            onClose={() => setSelectedSiteForDetail(null)}
          />
        )}

        {/* PageSpeed Insights Popup */}
        {selectedSiteForPageSpeed && (
          <PageSpeedInsightsPopup
            siteUrl={selectedSiteForPageSpeed}
            onClose={() => setSelectedSiteForPageSpeed(null)}
          />
        )}
      </div>
    </Layout>
  );
};