import React, { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useSite } from '../contexts/SiteContext';

export const SiteSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedSite, setSelectedSite, availableSites, isLoading } = useSite();

  const handleSiteSelect = (siteUrl: string) => {
    setSelectedSite(siteUrl);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center bg-[#25262b] rounded-lg px-4 py-2.5 min-w-[200px] shadow-lg border border-gray-800/50">
        <Globe className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
        <div className="animate-pulse bg-gray-600 h-4 w-32 rounded"></div>
      </div>
    );
  }

  if (availableSites.length === 0) {
    return (
      <div className="flex items-center bg-[#25262b] rounded-lg px-4 py-2.5 min-w-[200px] shadow-lg border border-gray-800/50">
        <Globe className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
        <span className="text-gray-400 text-sm">Aucun site configuré</span>
      </div>
    );
  }

  const hostname = selectedSite ? new URL(selectedSite).hostname : 'Sélectionner un site';

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-[#25262b] rounded-lg px-4 py-2.5 
                   hover:bg-[#2d2e33] transition-colors min-w-[200px] shadow-lg
                   border border-gray-800/50 group w-full"
      >
        <Globe className="w-4 h-4 text-gray-400 group-hover:text-gray-300 mr-3 flex-shrink-0" />
        <span className="text-gray-300 text-sm truncate flex-1 text-left group-hover:text-white">
          {hostname}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0
                              ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && availableSites.length > 0 && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-full bg-[#25262b] rounded-lg 
                        shadow-xl border border-gray-800/50 py-1 z-50 max-h-60 overflow-y-auto">
            {availableSites.map((site) => (
              <button
                key={site}
                onClick={() => handleSiteSelect(site)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 
                           hover:bg-[#2d2e33] transition-colors flex items-center space-x-3
                           group"
              >
                <Globe className="w-4 h-4 text-gray-400 group-hover:text-gray-300 flex-shrink-0" />
                <span className="truncate group-hover:text-white">
                  {new URL(site).hostname}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};