import React from 'react';
import { Search, Globe, Calendar, X, Filter, Tag } from 'lucide-react';
import { FakeTrafficFilters } from '../../types/fakeTraffic';
import { useFakeTrafficQueries, useFakeTrafficDomains, useFakeTrafficTypes } from '../../hooks/useFakeTraffic';
import { format, subDays } from 'date-fns';

interface FakeTrafficFiltersProps {
  filters: FakeTrafficFilters;
  onFiltersChange: (filters: FakeTrafficFilters) => void;
  onResetFilters: () => void;
}

export const FakeTrafficFiltersComponent: React.FC<FakeTrafficFiltersProps> = ({
  filters,
  onFiltersChange,
  onResetFilters
}) => {
  const { data: availableQueries = [] } = useFakeTrafficQueries();
  const { data: availableDomains = [] } = useFakeTrafficDomains();
  const { data: availableTypes = [] } = useFakeTrafficTypes();

  const hasActiveFilters = filters.query || filters.domain || filters.type || filters.startDate || filters.endDate;

  const handleQueryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, query: e.target.value });
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, domain: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, type: e.target.value });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  // Set default date range (last 30 days)
  const defaultEndDate = format(new Date(), 'yyyy-MM-dd');
  const defaultStartDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');

  return (
    <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4 border border-gray-800/10">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Filtres</h3>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="ml-auto flex items-center gap-1 px-3 py-1 text-xs bg-gray-600/50 
                     text-gray-300 rounded-full hover:bg-gray-600 transition-colors"
          >
            <X className="w-3 h-3" />
            Réinitialiser
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Query Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Search className="w-4 h-4" />
            Requête
          </label>
          <select
            value={filters.query || ''}
            onChange={handleQueryChange}
            className="w-full px-3 py-2 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                     text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50
                     appearance-none cursor-pointer"
          >
            <option value="">Toutes les requêtes</option>
            {availableQueries.map((query, index) => (
              <option key={index} value={query}>
                {query}
              </option>
            ))}
          </select>
        </div>

        {/* Domain Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Globe className="w-4 h-4" />
            Domaine
          </label>
          <select
            value={filters.domain || ''}
            onChange={handleDomainChange}
            className="w-full px-3 py-2 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                     text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50
                     appearance-none cursor-pointer"
          >
            <option value="">Tous les domaines</option>
            {availableDomains.map((domain, index) => (
              <option key={index} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Tag className="w-4 h-4" />
            Type
          </label>
          <select
            value={filters.type || ''}
            onChange={handleTypeChange}
            className="w-full px-3 py-2 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                     text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50
                     appearance-none cursor-pointer"
          >
            <option value="">Tous les types</option>
            {availableTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Calendar className="w-4 h-4" />
            Date de début
          </label>
          <input
            type="date"
            value={filters.startDate || defaultStartDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="w-full px-3 py-2 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                     text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Calendar className="w-4 h-4" />
            Date de fin
          </label>
          <input
            type="date"
            value={filters.endDate || defaultEndDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="w-full px-3 py-2 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                     text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-800/30">
          <div className="text-sm text-gray-400 mb-2">Filtres actifs :</div>
          <div className="flex flex-wrap gap-2">
            {filters.query && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                Requête: {filters.query}
              </span>
            )}
            {filters.domain && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                Domaine: {filters.domain}
              </span>
            )}
            {filters.type && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                Type: {filters.type}
              </span>
            )}
            {filters.startDate && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                Début: {filters.startDate}
              </span>
            )}
            {filters.endDate && (
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                Fin: {filters.endDate}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};