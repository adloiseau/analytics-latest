import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useFakeTrafficDailyDistribution } from '../../hooks/useFakeTraffic';
import { FakeTrafficFilters } from '../../types/fakeTraffic';
import { EmptyChart } from '../metrics/chart/EmptyChart';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DailyDistributionChartProps {
  selectedDate: string;
  filters: FakeTrafficFilters;
}

// Couleurs pour le pie chart
const PIE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

export const DailyDistributionChart: React.FC<DailyDistributionChartProps> = ({
  selectedDate,
  filters
}) => {
  const { data: distribution = [], isLoading } = useFakeTrafficDailyDistribution(selectedDate, filters);

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      </div>
    );
  }

  if (distribution.length === 0) {
    return (
      <div className="h-[300px]">
        <EmptyChart message={`Aucune donnée pour le ${selectedDate ? format(parseISO(selectedDate), 'dd MMMM yyyy', { locale: fr }) : 'jour sélectionné'}`} />
      </div>
    );
  }

  // Prendre les top 8 requêtes et grouper le reste dans "Autres"
  const top8 = distribution.slice(0, 8);
  const others = distribution.slice(8);
  const othersTotal = others.reduce((sum, item) => sum + item.count, 0);
  const othersPercentage = others.reduce((sum, item) => sum + item.percentage, 0);

  const chartData = [...top8];
  if (othersTotal > 0) {
    chartData.push({
      query: 'Autres',
      count: othersTotal,
      percentage: othersPercentage
    });
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="count"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-[#1a1b1e]/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-800/50">
                    <p className="text-white font-medium mb-1">{data.query}</p>
                    <p className="text-gray-300 text-sm">{data.count} requêtes ({data.percentage.toFixed(1)}%)</p>
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
              <span style={{ color: entry.color, fontSize: '12px' }}>
                {value.length > 20 ? `${value.substring(0, 20)}...` : value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};