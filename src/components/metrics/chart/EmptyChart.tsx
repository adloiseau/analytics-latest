import React from 'react';

interface EmptyChartProps {
  message?: string;
}

export const EmptyChart: React.FC<EmptyChartProps> = ({ 
  message = "Aucune donnée disponible pour la période sélectionnée" 
}) => (
  <div className="h-full flex items-center justify-center text-gray-400 text-sm sm:text-base">
    {message}
  </div>
);