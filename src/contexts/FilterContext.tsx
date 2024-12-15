import React, { createContext, useContext, useState } from 'react';
import type { DateRange } from '../components/DateRangeSelector';

interface FilterContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const FilterContext = createContext<FilterContextType | null>(null);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dateRange, setDateRange] = useState<DateRange>('28d');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <FilterContext.Provider value={{ dateRange, setDateRange, searchQuery, setSearchQuery }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};