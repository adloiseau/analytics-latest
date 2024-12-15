import React from 'react';
import { Calendar } from 'lucide-react';
import type { DateRange } from '../types/filters';

interface DateRangeSelectorProps {
  selectedRange: DateRange;
  onChange: (range: DateRange) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ selectedRange, onChange }) => {
  const ranges: { value: DateRange; label: string }[] = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7j' },
    { value: '28d', label: '28j' },
    { value: '3m', label: '3m' },
  ];

  return (
    <div className="flex items-center gap-2 bg-[#25262b] rounded-lg p-1.5 border border-gray-800/50">
      <Calendar className="w-4 h-4 text-gray-400 ml-2" />
      <div className="flex">
        {ranges.map((range) => (
          <button
            key={range.value}
            onClick={() => onChange(range.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              selectedRange === range.value
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-[#2d2e33]'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
};