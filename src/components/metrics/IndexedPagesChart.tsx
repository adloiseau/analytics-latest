import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface IndexedPagesChartProps {
  totalPages: number;
  indexedPages: number;
}

export const IndexedPagesChart: React.FC<IndexedPagesChartProps> = ({ totalPages, indexedPages }) => {
  const data = [
    { name: 'Pages indexées', value: indexedPages },
    { name: 'Pages non indexées', value: totalPages - indexedPages }
  ];

  const COLORS = ['#3b82f6', '#1f2937'];

  return (
    <div className="h-[30px] w-[30px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={8}
            outerRadius={15}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#1a1b1e]/95 backdrop-blur-sm p-2 rounded-lg border border-gray-800/50">
                    <p className="text-xs text-gray-300">
                      {payload[0].name}: {payload[0].value}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};