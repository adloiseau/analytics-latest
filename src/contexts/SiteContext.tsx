import React, { createContext, useContext, useState, useEffect } from 'react';
import { GA_PROPERTY_IDS } from '../config/analytics.config';

interface SiteContextType {
  selectedSite: string | null;
  setSelectedSite: (site: string) => void;
}

const SiteContext = createContext<SiteContextType | null>(null);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedSite, setSelectedSite] = useState<string | null>(() => {
    const stored = localStorage.getItem('selectedSite');
    if (stored && Object.keys(GA_PROPERTY_IDS).some(hostname => stored.includes(hostname))) {
      return stored;
    }
    return null;
  });

  // Set default site when no site is selected
  useEffect(() => {
    if (!selectedSite) {
      const firstHostname = Object.keys(GA_PROPERTY_IDS)[0];
      if (firstHostname) {
        const defaultSite = `https://${firstHostname}`;
        localStorage.setItem('selectedSite', defaultSite);
        setSelectedSite(defaultSite);
      }
    }
  }, [selectedSite]);

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