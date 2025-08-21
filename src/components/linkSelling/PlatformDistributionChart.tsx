import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { EmptyChart } from '../metrics/chart/EmptyChart';

interface PlatformDistributionChartProps {
  directSalesPercentage: number;
  platformSalesPercentage: number;
}

export const PlatformDistributionChart: React.FC<PlatformDistributionChartProps> = ({
  directSalesPercentage,
  platformSalesPercentage
}) => {
  const data = [
    { name: 'Ventes directes', value: directSalesPercentage, color: '#10b981' },
    { name: 'Plateformes', value: platformSalesPercentage, color: '#3b82f6' }
  ];

  if (directSalesPercentage === 0 && platformSalesPercentage === 0) {
    return (
      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-800/10 h-full flex flex-col">
        <h2 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
          Répartition des ventes
        </h2>
        <div className="flex-1 flex items-center justify-center">
          <EmptyChart message="Aucune donnée de vente disponible" />
        </div>
      </div>
    );
  }

  const totalRevenue = directSalesPercentage + platformSalesPercentage;

  return (
    <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-800/10 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Répartition des ventes
        </h2>
      </div>
      
      {/* Chart Container - Flex-1 pour prendre l'espace disponible */}
      <div className="flex-1 flex items-center justify-center">
        <div className="h-[200px] sm:h-[250px] w-full max-w-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    return (
                      <div className="bg-[#1a1b1e]/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-800/50">
                        <p className="text-white text-sm font-medium">
                          {data.name}: {data.value?.toFixed(1)}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color, fontSize: '12px' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats en bas - Même structure que les autres blocs */}
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-800/30">
        <div className="grid grid-cols-2 gap-1 sm:gap-2 text-center">
          <div>
            <div className="text-sm sm:text-lg font-bold text-green-400">{directSalesPercentage.toFixed(1)}%</div>
            <div className="text-xs text-gray-400">Direct</div>
          </div>
          <div>
            <div className="text-sm sm:text-lg font-bold text-blue-400">{platformSalesPercentage.toFixed(1)}%</div>
            <div className="text-xs text-gray-400">Plateformes</div>
          </div>
        </div>
      </div>
    </div>
  );
};