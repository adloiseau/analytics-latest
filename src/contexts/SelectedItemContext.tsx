import React, { createContext, useContext, useState } from 'react';

interface SelectedItemContextType {
  selectedItem: string | null;
  setSelectedItem: (item: string | null) => void;
}

const SelectedItemContext = createContext<SelectedItemContextType | null>(null);

export const SelectedItemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  return (
    <SelectedItemContext.Provider value={{ selectedItem, setSelectedItem }}>
      {children}
    </SelectedItemContext.Provider>
  );
};

export const useSelectedItem = () => {
  const context = useContext(SelectedItemContext);
  if (!context) {
    throw new Error('useSelectedItem must be used within a SelectedItemProvider');
  }
  return context;
};