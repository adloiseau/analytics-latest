import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useSearchConsoleSites } from '../hooks/useSearchConsoleSites';
import type { Site } from '../hooks/useSearchConsoleSites';

interface SiteSelectorProps {
  onSiteChange?: (site: Site) => void;
}

export const SiteSelector: React.FC<SiteSelectorProps> = ({ onSiteChange }) => {
  const { sites, loading, error } = useSearchConsoleSites();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const handleSiteSelect = (site: Site) => {
    setSelectedSite(site);
    setIsOpen(false);
    onSiteChange?.(site);
  };

  if (loading) {
    return (
      <div className="flex items-center bg-[#25262b] rounded-md px-3 py-1.5">
        <span className="text-gray-300 text-sm">Chargement des sites...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center bg-[#25262b] rounded-md px-3 py-1.5">
        <span className="text-red-400 text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-[#25262b] rounded-md px-3 py-1.5 hover:bg-[#2d2e33] transition-colors"
      >
        <span className="text-gray-300 text-sm mr-2">
          {selectedSite ? new URL(selectedSite.siteUrl).hostname : 'Tous les sites'}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-[#25262b] rounded-md shadow-lg py-1 z-50">
          {sites.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">Aucun site trouvé</div>
          ) : (
            sites.map((site) => (
              <button
                key={site.siteUrl}
                onClick={() => handleSiteSelect(site)}
                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#2d2e33] transition-colors"
              >
                {new URL(site.siteUrl).hostname}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};