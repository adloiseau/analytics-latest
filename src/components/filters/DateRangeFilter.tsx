import React from 'react';
import { DateRange } from '../../types/filters';

interface DateRangeFilterProps {
  selectedRange: DateRange;
  onChange: (range: DateRange) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ selectedRange, onChange }) => {
  const ranges: { value: DateRange; label: string }[] = [
    { value: '24h', label: '24 heures' },
    { value: '7d', label: '7 jours' },
    { value: '28d', label: '28 jours' },
    { value: '3m', label: '3 mois' },
  ];

  return (
    <div className="flex items-center space-x-2">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
            selectedRange === range.value
              ? 'bg-blue-500 text-white'
              : 'bg-[#25262b] text-gray-300 hover:bg-[#2d2e33]'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};