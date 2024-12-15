import React from 'react';
import { Calendar } from 'lucide-react';

export type DateRange = '24h' | '7d' | '30d' | '90d';

interface DateRangeSelectorProps {
  selectedRange: DateRange;
  onChange: (range: DateRange) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ selectedRange, onChange }) => {
  const ranges: { value: DateRange; label: string }[] = [
    { value: '24h', label: '24 heures' },
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
    { value: '90d', label: '90 jours' },
  ];

  return (
    <div className="flex items-center bg-[#25262b] rounded-md px-3 py-1.5 cursor-pointer relative group">
      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
      <select
        value={selectedRange}
        onChange={(e) => onChange(e.target.value as DateRange)}
        className="bg-transparent text-gray-300 text-sm appearance-none cursor-pointer outline-none"
      >
        {ranges.map((range) => (
          <option key={range.value} value={range.value} className="bg-[#25262b]">
            {range.label}
          </option>
        ))}
      </select>
    </div>
  );
};