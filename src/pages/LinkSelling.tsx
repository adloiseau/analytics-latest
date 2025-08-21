import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { PlatformDistributionChart } from '../components/linkSelling/PlatformDistributionChart';
import { MonthlyRevenueChart } from '../components/linkSelling/MonthlyRevenueChart';
import { SitePerformanceCard } from '../components/linkSelling/SitePerformanceCard';
import { PlatformPerformanceCard } from '../components/linkSelling/PlatformPerformanceCard';
import { SalesTable } from '../components/linkSelling/SalesTable';
import { LinkSellingFilters } from '../components/linkSelling/LinkSellingFilters';
import { 
  useLinkSellingStats, 
  useAvailableSites, 
  useAvailablePlatforms,
  useSitePerformance,
  usePlatformPerformance
} from '../hooks/useLinkSelling';
import { linkSellingService, LinkSellingFilters as FilterType } from '../services/supabase/linkSelling';
import { useQuery } from 'react-query';
import { DollarSign, TrendingUp, Users, Calendar, ShoppingCart, Target } from 'lucide-react';

export const LinkSelling: React.FC = () => {
  // Définir "mois en cours" par défaut (-4)
  const [selectedYear, setSelectedYear] = useState(-4);
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  
  // Fetch available data for filters
  const { data: availableYears = [] } = useQuery(
    'linkSellingYears',
    () => linkSellingService.getAvailableYears(),
    {
      staleTime: 10 * 60 * 1000
    }
  );

  const { data: availableSites = [] } = useAvailableSites();
  const { data: availablePlatforms = [] } = useAvailablePlatforms();

  // Build filters object
  const filters: FilterType = {
    ...(selectedYear !== 0 && { year: selectedYear }),
    ...(selectedSite && { site: selectedSite }),
    ...(selectedPlatform && { platform: selectedPlatform })
  };

  // Tous ces hooks utilisent maintenant les mêmes filtres
  const { data: stats, isLoading, error } = useLinkSellingStats(filters);
  const { data: sitePerformance = [] } = useSitePerformance(filters);
  const { data: platformPerformance = [] } = usePlatformPerformance(filters);

  // Check if any filters are active
  const hasActiveFilters = (selectedYear !== -4 && selectedYear !== 0) || selectedSite || selectedPlatform;

  const handleResetFilters = () => {
    setSelectedYear(-4);
    setSelectedSite('');
    setSelectedPlatform('');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#25262b] rounded-lg w-1/3" />
            <div className="h-32 bg-[#25262b] rounded-lg" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-[#25262b] rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="h-[300px] bg-[#25262b] rounded-lg" />
              <div className="h-[300px] bg-[#25262b] rounded-lg" />
              <div className="h-[300px] bg-[#25262b] rounded-lg" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">Erreur lors du chargement des données de vente</p>
        </div>
      </Layout>
    );
  }

  const {
    totalAmount = 0,
    directSalesPercentage = 0,
    platformSalesPercentage = 0,
    monthlyData = [],
    totalSales = 0,
    averagePricePerSite = 0,
    uniqueSites = 0,
    averagePricePerSale = 0
  } = stats || {};

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Link Selling</h1>
        </div>

        {/* Enhanced Filters */}
        <LinkSellingFilters
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          availableYears={availableYears}
          selectedSite={selectedSite}
          onSiteChange={setSelectedSite}
          availableSites={availableSites}
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
          availablePlatforms={availablePlatforms}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Info sur les filtres appliqués */}
        {hasActiveFilters && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              📊 <strong>Filtres appliqués :</strong> Les métriques, performances par site/plateforme et répartition 
              des ventes sont filtrées selon la période sélectionnée. Seul le graphique "Revenus mensuels" 
              affiche l'historique complet.
            </p>
          </div>
        )}

        {/* Enhanced Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-gray-800/10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-lg sm:text-xl font-bold text-white truncate">{totalAmount.toFixed(0)}€</div>
                <div className="text-xs text-gray-400">CA total</div>
              </div>
            </div>
          </div>

          <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-gray-800/10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-lg sm:text-xl font-bold text-white">{totalSales}</div>
                <div className="text-xs text-gray-400">Ventes</div>
              </div>
            </div>
          </div>

          <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-gray-800/10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-lg sm:text-xl font-bold text-white truncate">{averagePricePerSale.toFixed(0)}€</div>
                <div className="text-xs text-gray-400">Prix moy.</div>
              </div>
            </div>
          </div>

          <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-gray-800/10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-orange-500/20 rounded-lg">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-lg sm:text-xl font-bold text-white">{uniqueSites}</div>
                <div className="text-xs text-gray-400">Sites</div>
              </div>
            </div>
          </div>

          <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-gray-800/10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-cyan-500/20 rounded-lg">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-lg sm:text-xl font-bold text-white truncate">{averagePricePerSite.toFixed(0)}€</div>
                <div className="text-xs text-gray-400">Moy/site</div>
              </div>
            </div>
          </div>

          <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-gray-800/10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-emerald-500/20 rounded-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-lg sm:text-xl font-bold text-white">{directSalesPercentage.toFixed(1)}%</div>
                <div className="text-xs text-gray-400">Direct</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Stack all components vertically */}
        <div className="block lg:hidden space-y-6">
          <SitePerformanceCard sitePerformance={sitePerformance} filters={filters} />
          <PlatformPerformanceCard platformPerformance={platformPerformance} filters={filters} />
          <PlatformDistributionChart
            directSalesPercentage={directSalesPercentage}
            platformSalesPercentage={platformSalesPercentage}
          />
        </div>

        {/* Desktop: Nouvelle mise en page avec plus d'espace pour les performances */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <SitePerformanceCard sitePerformance={sitePerformance} filters={filters} />
          </div>
          
          <div className="lg:col-span-4">
            <PlatformPerformanceCard platformPerformance={platformPerformance} filters={filters} />
          </div>
          
          <div className="lg:col-span-4">
            <PlatformDistributionChart
              directSalesPercentage={directSalesPercentage}
              platformSalesPercentage={platformSalesPercentage}
            />
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <MonthlyRevenueChart monthlyData={monthlyData} />

        {/* Sales Table */}
        <SalesTable filters={filters} />
      </div>
    </Layout>
  );
};