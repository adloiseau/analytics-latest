import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchConsoleSites } from '../hooks/useSearchConsoleSites';

interface SiteContextType {
  selectedSite: string | null;
  setSelectedSite: (site: string) => void;
}

const SiteContext = createContext<SiteContextType | null>(null);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sites, loading } = useSearchConsoleSites();
  const [selectedSite, setSelectedSite] = useState<string | null>(() => {
    return localStorage.getItem('selectedSite');
  });

  // Set default site when sites are loaded and no site is selected
  useEffect(() => {
    if (!loading && sites.length > 0 && !selectedSite) {
      const defaultSite = sites[0].siteUrl;
      localStorage.setItem('selectedSite', defaultSite);
      setSelectedSite(defaultSite);
    }
  }, [loading, sites, selectedSite]);

  const handleSiteChange = (site: string) => {
    localStorage.setItem('selectedSite', site);
    setSelectedSite(site);
  };

  return (
    <SiteContext.Provider value={{ selectedSite, setSelectedSite: handleSiteChange }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
};