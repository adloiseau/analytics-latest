import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer } from '../metrics/chart/ChartContainer';
import { EmptyChart } from '../metrics/chart/EmptyChart';
import { formatMetric } from '../../utils/metrics';

interface MonthlyRevenueChartProps {
  monthlyData: Array<{
    month: string;
    directSales: number;
    platformSales: number;
    total: number;
  }>;
}

export const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({ monthlyData }) => {
  if (!monthlyData || monthlyData.length === 0) {
    return (
      <ChartContainer title="Revenus mensuels (historique complet)">
        <EmptyChart message="Aucune donnée mensuelle disponible" />
      </ChartContainer>
    );
  }

  // Les données sont déjà triées chronologiquement dans le service
  console.log('📊 Monthly chart data received:', monthlyData.length, 'months');
  console.log('📅 First month:', monthlyData[0]?.month);
  console.log('📅 Last month:', monthlyData[monthlyData.length - 1]?.month);

  return (
    <ChartContainer title="Revenus mensuels (historique complet)">
      <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-blue-400 text-sm">
          📊 <strong>Note :</strong> Ce graphique affiche l'historique complet des revenus mensuels empilés 
          (ventes directes + plateformes), indépendamment des filtres de période appliqués aux autres blocs.
        </p>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="month"
              stroke="#666"
              tick={{ fill: '#666', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#666"
              tick={{ fill: '#666', fontSize: 12 }}
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const directSales = payload.find(p => p.dataKey === 'directSales')?.value || 0;
                  const platformSales = payload.find(p => p.dataKey === 'platformSales')?.value || 0;
                  const total = Number(directSales) + Number(platformSales);
                  
                  return (
                    <div className="bg-[#1a1b1e]/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-800/50">
                      <p className="text-gray-400 text-xs mb-2">{label}</p>
                      {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-white text-sm">
                          <span style={{ color: entry.color }}>●</span> {entry.name}: {entry.value}€
                        </p>
                      ))}
                      <p className="text-white text-sm font-medium border-t border-gray-700 pt-1 mt-1">
                        <strong>Total cumulé: {total}€</strong>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            {/* Barres empilées - stackId identique pour empiler les valeurs */}
            <Bar 
              dataKey="directSales" 
              name="Ventes directes" 
              fill="#10b981" 
              radius={[0, 0, 0, 0]}
              stackId="revenue"
            />
            <Bar 
              dataKey="platformSales" 
              name="Plateformes" 
              fill="#3b82f6" 
              radius={[2, 2, 0, 0]}
              stackId="revenue"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};