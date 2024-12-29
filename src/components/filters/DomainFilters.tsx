import React from 'react';
import { Search } from 'lucide-react';

interface DomainFiltersProps {
  domainSearch: string;
  setDomainSearch: (value: string) => void;
  tfRange: { min: string; max: string };
  setTfRange: (value: { min: string; max: string }) => void;
  cfRange: { min: string; max: string };
  setCfRange: (value: { min: string; max: string }) => void;
  ttfSearch: string;
  setTtfSearch: (value: string) => void;
}

export const DomainFilters: React.FC<DomainFiltersProps> = ({
  domainSearch,
  setDomainSearch,
  tfRange,
  setTfRange,
  cfRange,
  setCfRange,
  ttfSearch,
  setTtfSearch
}) => {
  return (
    <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4 border border-gray-800/10 space-y-4">
      {/* Domain Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher un domaine..."
          value={domainSearch}
          onChange={(e) => setDomainSearch(e.target.value)}
          className="w-full px-4 py-2 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                   text-sm text-gray-200 placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TF Range */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Trust Flow (TF)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={tfRange.min}
              onChange={(e) => setTfRange({ ...tfRange, min: e.target.value })}
              className="w-full px-3 py-1.5 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                       text-sm text-gray-200 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={tfRange.max}
              onChange={(e) => setTfRange({ ...tfRange, max: e.target.value })}
              className="w-full px-3 py-1.5 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                       text-sm text-gray-200 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* CF Range */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Citation Flow (CF)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={cfRange.min}
              onChange={(e) => setCfRange({ ...cfRange, min: e.target.value })}
              className="w-full px-3 py-1.5 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                       text-sm text-gray-200 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={cfRange.max}
              onChange={(e) => setCfRange({ ...cfRange, max: e.target.value })}
              className="w-full px-3 py-1.5 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                       text-sm text-gray-200 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* TTF Search */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Topical Trust Flow (TTF)</label>
          <input
            type="text"
            placeholder="Ex: santé, finance..."
            value={ttfSearch}
            onChange={(e) => setTtfSearch(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                     text-sm text-gray-200 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>
    </div>
  );
};