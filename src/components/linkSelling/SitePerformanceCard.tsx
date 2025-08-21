import React, { useState } from 'react';
import { Globe, BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import { SitePerformancePopup } from './SitePerformancePopup';

interface SitePerformanceCardProps {
  sitePerformance: Array<{
    site: string;
    revenue: number;
    sales: number;
    averagePrice: number;
    percentage: number;
  }>;
  filters: any;
}

export const SitePerformanceCard: React.FC<SitePerformanceCardProps> = ({ 
  sitePerformance, 
  filters 
}) => {
  const [showPopup, setShowPopup] = useState(false);

  if (!sitePerformance || sitePerformance.length === 0) {
    return (
      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-800/10 h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            <h2 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Performance par site
            </h2>
            <span className="text-xs sm:text-sm text-gray-400">(0 sites)</span>
          </div>
          <button
            onClick={() => setShowPopup(true)}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500/20 text-blue-400 rounded-lg 
                     hover:bg-blue-500/30 transition-colors text-xs sm:text-sm"
          >
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Graphiques</span>
          </button>
        </div>
        <div className="text-gray-400 text-center py-8">
          Aucune donnée de site disponible
        </div>
      </div>
    );
  }

  const totalSites = sitePerformance.length;
  const totalRevenue = sitePerformance.reduce((sum, site) => sum + site.revenue, 0);
  const totalSales = sitePerformance.reduce((sum, site) => sum + site.sales, 0);
  const globalAveragePrice = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Show top 3 sites
  const top3Sites = sitePerformance.slice(0, 3);

  return (
    <>
      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-800/10 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            <h2 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Performance par site
            </h2>
            <span className="text-xs sm:text-sm text-gray-400">(Top 3)</span>
          </div>
          <button
            onClick={() => setShowPopup(true)}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500/20 text-blue-400 rounded-lg 
                     hover:bg-blue-500/30 transition-colors text-xs sm:text-sm"
          >
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Graphiques</span>
          </button>
        </div>

        {/* Top 3 Sites */}
        <div className="space-y-2 sm:space-y-3 flex-1">
          {top3Sites.map((site, index) => (
            <div 
              key={site.site}
              className={`p-2 sm:p-3 rounded-lg transition-colors ${
                index === 0 
                  ? 'bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/20'
                  : 'bg-[#1a1b1e]/50 hover:bg-[#1a1b1e]/70'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                  index === 1 ? 'bg-gray-400/20 text-gray-300' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {index + 1}
                </div>
                <span className="text-white font-medium text-xs sm:text-sm truncate flex-1">{site.site}</span>
                <span className="text-xs text-gray-400">{site.percentage.toFixed(1)}%</span>
              </div>
              <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-green-400">{site.revenue.toFixed(0)}€</div>
                  <div className="text-xs text-gray-400">CA</div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-blue-400">{site.sales}</div>
                  <div className="text-xs text-gray-400">Ventes</div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-purple-400">{site.averagePrice.toFixed(0)}€</div>
                  <div className="text-xs text-gray-400">Moy.</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global Stats - En bas */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-800/30">
          <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center">
            <div>
              <div className="text-sm sm:text-lg font-bold text-white">{totalSites}</div>
              <div className="text-xs text-gray-400">Sites</div>
            </div>
            <div>
              <div className="text-sm sm:text-lg font-bold text-green-400">{totalRevenue.toFixed(0)}€</div>
              <div className="text-xs text-gray-400">CA</div>
            </div>
            <div>
              <div className="text-sm sm:text-lg font-bold text-blue-400">{totalSales}</div>
              <div className="text-xs text-gray-400">Ventes</div>
            </div>
            <div>
              <div className="text-sm sm:text-lg font-bold text-purple-400">{globalAveragePrice.toFixed(0)}€</div>
              <div className="text-xs text-gray-400">Moy.</div>
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <SitePerformancePopup
          sitePerformance={sitePerformance}
          filters={filters}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
};