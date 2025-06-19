import React from 'react';
import { useSearchConsoleData } from '../hooks/useSearchConsoleData';
import { useMetrics } from '../hooks/useMetrics';
import { useLastMetricUpdate } from '../hooks/useLastMetricUpdate';
import { Layout } from '../components/Layout';
import { useFilters } from '../contexts/FilterContext';
import { useAuth } from '../contexts/AuthContext';
import { getDateRange } from '../utils/dates';
import { Globe, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { formatMetric } from '../utils/metrics';
import { SparklineGSC } from '../components/metrics/SparklineGSC';
import { GA_PROPERTY_IDS } from '../config/analytics.config';

const SiteCard = ({ site }) => {
  const { data: siteMetrics } = useMetrics(site.keys[0]);
  const hostname = new URL(site.keys[0]).hostname;
  const favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

  // Utiliser la métrique TO la plus récemment mise à jour
  const currentTO = siteMetrics?.TO?.value || 0;
  // Utiliser la valeur précédente (de la veille)
  const previousTO = siteMetrics?.TO?.previousValue || 0;
  const trend = previousTO > 0 ? ((currentTO - previousTO) / previousTO) * 100 : 0;
  
  // Utiliser les vraies données historiques pour la sparkline
  const realSparklineData = React.useMemo(() => {
    if (siteMetrics?.TO?.history && siteMetrics.TO.history.length > 0) {
      // Prendre les 7 derniers jours et inverser pour avoir l'ordre chronologique
      return siteMetrics.TO.history
        .slice(0, 7)
        .reverse()
        .map(item => item.value);
    }
    return [];
  }, [siteMetrics?.TO?.history]);

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
        <div className="flex items-center gap-3">
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
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{hostname}</h3>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <div className="text-2xl font-bold text-white mb-1">
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
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                           ${trend >= 0 
                             ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                             : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {trend >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
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
            width: `${Math.min(100, Math.max(10, (currentTO / Math.max(...Object.keys(GA_PROPERTY_IDS).map(() => currentTO))) * 100))}%` 
          }}
        />
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const { dateRange } = useFilters();
  const { isInitialized } = useAuth();
  const { startDate, endDate } = getDateRange(dateRange);
  const { data: lastUpdate, isLoading: isLoadingUpdate } = useLastMetricUpdate();

  const { data: currentData, isLoading, error } = useSearchConsoleData('site');

  // Hook pour récupérer les métriques TO de tous les sites
  const siteMetricsQueries = Object.keys(GA_PROPERTY_IDS).map(hostname => {
    const siteUrl = `https://${hostname}`;
    return useMetrics(siteUrl);
  });

  // Créer une liste complète des sites avec leurs métriques TO
  const allSitesWithMetrics = React.useMemo(() => {
    const sitesMap = new Map();

    // Ajouter tous les sites de GA_PROPERTY_IDS
    Object.keys(GA_PROPERTY_IDS).forEach((hostname, index) => {
      const siteUrl = `https://${hostname}`;
      const metrics = siteMetricsQueries[index]?.data;
      const toValue = metrics?.TO?.value || 0;

      sitesMap.set(siteUrl, {
        keys: [siteUrl],
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
        toValue
      });
    });

    // Fusionner avec les données de Search Console si disponibles
    if (currentData?.rows) {
      currentData.rows.forEach(siteData => {
        const siteUrl = siteData.keys[0];
        if (sitesMap.has(siteUrl)) {
          // Mettre à jour les données existantes
          const existing = sitesMap.get(siteUrl);
          sitesMap.set(siteUrl, {
            ...siteData,
            toValue: existing.toValue
          });
        }
      });
    }

    // Convertir en array et trier par TO décroissant
    return Array.from(sitesMap.values())
      .sort((a, b) => (b.toValue || 0) - (a.toValue || 0));
  }, [currentData?.rows, siteMetricsQueries]);

  // Calculer les statistiques globales
  const totalTO = allSitesWithMetrics.reduce((sum, site) => sum + (site.toValue || 0), 0);
  const activeSites = allSitesWithMetrics.filter(site => (site.toValue || 0) > 0).length;

  // Extraire seulement la date de lastUpdate (format: "17/06/2025 à 07:10" -> "17/06/2025")
  const formatDateOnly = (dateString: string | null) => {
    if (!dateString) return null;
    return dateString.split(' à ')[0]; // Prendre seulement la partie avant " à "
  };

  if (!isInitialized) {
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
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {formatMetric(totalTO)}
              </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 text-sm text-gray-500">
              <span>{activeSites} sites actifs</span>
              <span>{Object.keys(GA_PROPERTY_IDS).length} sites configurés</span>
            </div>
          </div>

          {/* Date de mise à jour - remplace la période sélectionnée */}
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

        {/* Grille des sites - responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
          {isLoading ? (
            [...Array(Object.keys(GA_PROPERTY_IDS).length)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-[120px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-800/30" />
              </div>
            ))
          ) : error ? (
            <div className="col-span-full p-4 sm:p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-center text-sm sm:text-base">{error.message}</p>
            </div>
          ) : (
            allSitesWithMetrics.map((site, index) => (
              <SiteCard 
                key={site.keys[0]} 
                site={site}
              />
            ))
          )}
        </div>

        {/* Légende et informations - responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-500 pt-4 border-t border-gray-800/30">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span>Site actif</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span>Site inactif</span>
            </div>
          </div>
          <div className="text-center sm:text-right">
            Sites triés par Trafic Organique décroissant
          </div>
        </div>
      </div>
    </Layout>
  );
};