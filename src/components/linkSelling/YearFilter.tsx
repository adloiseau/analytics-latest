import React from 'react';
import { Calendar } from 'lucide-react';

interface YearFilterProps {
  selectedYear: number;
  onChange: (year: number) => void;
  availableYears: number[];
}

export const YearFilter: React.FC<YearFilterProps> = ({ 
  selectedYear, 
  onChange, 
  availableYears 
}) => {
  return (
    <div className="flex items-center gap-2 bg-[#25262b] rounded-lg p-1.5 border border-gray-800/50">
      <Calendar className="w-4 h-4 text-gray-400 ml-2" />
      <select
        value={selectedYear}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="bg-transparent text-gray-200 text-sm font-medium focus:outline-none 
                 cursor-pointer px-2 py-1 rounded-md hover:bg-[#2d2e33]"
      >
        <option value={0} className="bg-[#25262b]">Toutes les années</option>
        {availableYears.map((year) => (
          <option key={year} value={year} className="bg-[#25262b]">
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};