import React, { createContext, useContext, useState } from 'react';

interface TrafficSourceContextType {
  selectedSource: string | null;
  setSelectedSource: (source: string | null) => void;
}

const TrafficSourceContext = createContext<TrafficSourceContextType | null>(null);

export const TrafficSourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  return (
    <TrafficSourceContext.Provider value={{ selectedSource, setSelectedSource }}>
      {children}
    </TrafficSourceContext.Provider>
  );
};

export const useTrafficSource = () => {
  const context = useContext(TrafficSourceContext);
  if (!context) {
    throw new Error('useTrafficSource must be used within a TrafficSourceProvider');
  }
  return context;
};