import React, { useState } from 'react';
import { Calendar, Globe, Layers, X } from 'lucide-react';

interface LinkSellingFiltersProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears: number[];
  selectedSite: string;
  onSiteChange: (site: string) => void;
  availableSites: string[];
  selectedPlatform: string;
  onPlatformChange: (platform: string) => void;
  availablePlatforms: string[];
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

// Périodes simplifiées selon la demande
const PERIOD_OPTIONS = [
  { value: -4, label: 'Mois en cours' },
  { value: -10, label: 'Année en cours' },
  { value: -99, label: 'Plage personnalisée' }
];

export const LinkSellingFilters: React.FC<LinkSellingFiltersProps> = ({
  selectedYear,
  onYearChange,
  availableYears,
  selectedSite,
  onSiteChange,
  availableSites,
  selectedPlatform,
  onPlatformChange,
  availablePlatforms,
  onResetFilters,
  hasActiveFilters
}) => {
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const getPeriodLabel = (value: number) => {
    const option = PERIOD_OPTIONS.find(p => p.value === value);
    return option?.label || value.toString();
  };

  const handlePeriodChange = (value: number) => {
    if (value === -99) {
      setShowCustomRange(true);
    } else {
      setShowCustomRange(false);
      onYearChange(value);
    }
  };

  const handleCustomRangeApply = () => {
    if (customStartDate && customEndDate) {
      // Pour l'instant, on utilise l'année de début comme valeur
      // Dans une implémentation complète, il faudrait modifier l'interface pour supporter les dates personnalisées
      const startYear = new Date(customStartDate).getFullYear();
      onYearChange(startYear);
      setShowCustomRange(false);
    }
  };

  return (
    <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4 border border-gray-800/10">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
        <h3 className="text-base sm:text-lg font-semibold text-white">Filtres</h3>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="ml-auto flex items-center gap-1 px-2 sm:px-3 py-1 text-xs bg-gray-600/50 
                     text-gray-300 rounded-full hover:bg-gray-600 transition-colors"
          >
            <X className="w-3 h-3" />
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Period Filter - Simplifié */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Calendar className="w-4 h-4" />
            Période
          </label>
          <select
            value={showCustomRange ? -99 : selectedYear}
            onChange={(e) => handlePeriodChange(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                     text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {PERIOD_OPTIONS.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>

        {/* Site Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Globe className="w-4 h-4" />
            Site
          </label>
          <select
            value={selectedSite}
            onChange={(e) => onSiteChange(e.target.value)}
            className="w-full px-3 py-2 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                     text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">Tous les sites</option>
            {availableSites.map((site) => (
              <option key={site} value={site}>
                {site}
              </option>
            ))}
          </select>
        </div>

        {/* Platform Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Layers className="w-4 h-4" />
            Plateforme
          </label>
          <select
            value={selectedPlatform}
            onChange={(e) => onPlatformChange(e.target.value)}
            className="w-full px-3 py-2 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                     text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">Toutes les plateformes</option>
            {availablePlatforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Date Range Modal */}
      {showCustomRange && (
        <div className="mt-4 p-4 bg-[#1a1b1e]/50 rounded-lg border border-gray-700/50">
          <h4 className="text-sm font-medium text-white mb-3">Plage personnalisée</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date de début</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#25262b] border border-gray-700/50 rounded-lg 
                         text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date de fin</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#25262b] border border-gray-700/50 rounded-lg 
                         text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowCustomRange(false)}
              className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 
                       transition-colors text-sm"
            >
              Annuler
            </button>
            <button
              onClick={handleCustomRangeApply}
              disabled={!customStartDate || !customEndDate}
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-800/30">
          <div className="text-sm text-gray-400 mb-2">Filtres actifs :</div>
          <div className="flex flex-wrap gap-2">
            {selectedYear !== 0 && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                Période: {getPeriodLabel(selectedYear)}
              </span>
            )}
            {selectedSite && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                Site: {selectedSite}
              </span>
            )}
            {selectedPlatform && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                Plateforme: {selectedPlatform}
              </span>
            )}
            {showCustomRange && customStartDate && customEndDate && (
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                Plage: {customStartDate} - {customEndDate}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};