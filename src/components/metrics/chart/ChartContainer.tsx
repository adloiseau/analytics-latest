import React from 'react';

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ title, children }) => (
  <div className="bg-[#25262b] rounded-lg p-4 sm:p-6 h-full backdrop-blur-sm border border-gray-800/10">
    <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
      {title}
    </h2>
    {children}
  </div>
);