import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGAPropertiesMap } from '../hooks/useGAProperties';

interface SiteContextType {
  selectedSite: string | null;
  setSelectedSite: (site: string) => void;
  availableSites: string[];
  isLoading: boolean;
}

const SiteContext = createContext<SiteContextType | null>(null);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedSite, setSelectedSite] = useState<string | null>(() => {
    return localStorage.getItem('selectedSite');
  });

  const { data: gaPropertiesMap, isLoading } = useGAPropertiesMap();

  // Get available sites from database
  const availableSites = React.useMemo(() => {
    if (!gaPropertiesMap) return [];
    return Object.keys(gaPropertiesMap).map(hostname => `https://${hostname}`);
  }, [gaPropertiesMap]);

  // Set default site when properties are loaded and no site is selected
  useEffect(() => {
    if (!isLoading && availableSites.length > 0 && !selectedSite) {
      const defaultSite = availableSites[0];
      localStorage.setItem('selectedSite', defaultSite);
      setSelectedSite(defaultSite);
    }
  }, [availableSites, selectedSite, isLoading]);

  // Validate selected site against available sites
  useEffect(() => {
    if (!isLoading && selectedSite && availableSites.length > 0) {
      const isValidSite = availableSites.some(site => site === selectedSite);
      if (!isValidSite) {
        const defaultSite = availableSites[0];
        localStorage.setItem('selectedSite', defaultSite);
        setSelectedSite(defaultSite);
      }
    }
  }, [selectedSite, availableSites, isLoading]);

  const handleSiteChange = (site: string) => {
    localStorage.setItem('selectedSite', site);
    setSelectedSite(site);
  };

  return (
    <SiteContext.Provider value={{ 
      selectedSite, 
      setSelectedSite: handleSiteChange,
      availableSites,
      isLoading
    }}>
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