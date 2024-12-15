import React from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '../../utils/hooks';

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ 
  value, 
  onChange, 
  placeholder = "Rechercher une page ou requête..." 
}) => {
  const debouncedOnChange = useDebounce(onChange, 300);

  return (
    <div className="relative flex-1 lg:w-80">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => debouncedOnChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-[#25262b]/50 border border-gray-700/50 rounded-lg 
                 text-sm text-gray-200 placeholder-gray-400
                 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent
                 transition-all duration-200"
      />
      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
    </div>
  );
};