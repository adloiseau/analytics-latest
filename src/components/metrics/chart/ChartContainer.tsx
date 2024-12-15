import React from 'react';

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ title, children }) => (
  <div className="bg-[#25262b] rounded-lg p-4 sm:p-6 h-full">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    <div className="h-[300px] sm:h-[400px] w-full">
      {children}
    </div>
  </div>
);