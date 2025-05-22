import React, { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useSite } from '../contexts/SiteContext';
import { GA_PROPERTY_IDS } from '../config/analytics.config';

export const SiteSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedSite, setSelectedSite } = useSite();

  // Convert GA_PROPERTY_IDS to array of site objects
  const sites = Object.entries(GA_PROPERTY_IDS).map(([hostname, propertyId]) => ({
    siteUrl: `https://${hostname}`,
    propertyId
  }));

  const handleSiteSelect = (siteUrl: string) => {
    setSelectedSite(siteUrl);
    setIsOpen(false);
  };

  const selectedSiteData = sites.find(site => site.siteUrl === selectedSite);
  const hostname = selectedSiteData ? new URL(selectedSiteData.siteUrl).hostname : 'Sélectionner un site';

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