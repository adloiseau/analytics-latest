import React from 'react';

interface LegendItemProps {
  color: string;
  label: string;
  value: string | number;
}

export const ChartLegend: React.FC<{ items: LegendItemProps[] }> = ({ items }) => (
  <div className="flex flex-wrap gap-4 justify-center sm:justify-start mb-4">
    {items.map((item, index) => (
      <div key={index} className="flex items-center space-x-2">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: item.color }}
        />
        <span className="text-gray-300 text-sm whitespace-nowrap">
          {item.label}: {item.value}
        </span>
      </div>
    ))}
  </div>
);