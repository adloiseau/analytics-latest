import React, { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useSearchConsoleSites } from '../hooks/useSearchConsoleSites';
import { useSite } from '../contexts/SiteContext';

export const SiteSelector: React.FC = () => {
  const { data: sites = [], isLoading: loading, error } = useSearchConsoleSites();
  const [isOpen, setIsOpen] = useState(false);
  const { selectedSite, setSelectedSite } = useSite();

  const handleSiteSelect = (siteUrl: string) => {
    setSelectedSite(siteUrl);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center bg-[#25262b] rounded-lg px-4 py-2.5 shadow-lg border border-gray-800/50">
        <div className="animate-pulse flex items-center space-x-3">
          <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
          <div className="h-4 bg-gray-600 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center bg-[#25262b] rounded-lg px-4 py-2.5 text-red-400 text-sm shadow-lg border border-gray-800/50">
        <span>Erreur de chargement</span>
      </div>
    );
  }

  const selectedSiteData = sites.find(site => site.siteUrl === selectedSite);
  const hostname = selectedSiteData ? new URL(selectedSiteData.siteUrl).hostname : 'Sélectionner un site';

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-[#25262b] rounded-lg px-4 py-2.5 
                   hover:bg-[#2d2e33] transition-colors min-w-[200px] shadow-lg
                   border border-gray-800/50 group w-full lg:w-auto"
      >
        <Globe className="w-4 h-4 text-gray-400 group-hover:text-gray-300 mr-3 flex-shrink-0" />
        <span className="text-gray-300 text-sm truncate flex-1 text-left group-hover:text-white">
          {hostname}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0
                              ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && sites.length > 0 && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-full bg-[#25262b] rounded-lg 
                        shadow-xl border border-gray-800/50 py-1 z-50">
            {sites.map((site) => (
              <button
                key={site.siteUrl}
                onClick={() => handleSiteSelect(site.siteUrl)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 
                           hover:bg-[#2d2e33] transition-colors flex items-center space-x-3
                           group"
              >
                <Globe className="w-4 h-4 text-gray-400 group-hover:text-gray-300 flex-shrink-0" />
                <span className="truncate group-hover:text-white">
                  {new URL(site.siteUrl).hostname}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};