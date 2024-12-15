import React, { createContext, useContext, useState } from 'react';

interface SiteContextType {
  selectedSite: string | null;
  setSelectedSite: (site: string) => void;
}

const SiteContext = createContext<SiteContextType | null>(null);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedSite, setSelectedSite] = useState<string | null>(() => {
    return localStorage.getItem('selectedSite');
  });

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