import React from 'react';
import { X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PlatformPerformancePopupProps {
  platformPerformance: Array<{
    platform: string;
    revenue: number;
    sales: number;
    averagePrice: number;
    percentage: number;
  }>;
  filters: any;
  onClose: () => void;
}

export const PlatformPerformancePopup: React.FC<PlatformPerformancePopupProps> = ({
  platformPerformance,
  filters,
  onClose
}) => {
  const totalRevenue = platformPerformance.reduce((sum, platform) => sum + platform.revenue, 0);
  const totalSales = platformPerformance.reduce((sum, platform) => sum + platform.sales, 0);
  const globalAveragePrice = totalSales > 0 ? totalRevenue / totalSales : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#25262b] rounded-lg p-6 w-[90vw] max-w-6xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[#1a1b1e] text-gray-400 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-2">Répartition par Plateforme</h2>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Distribution */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Répartition du Chiffre d'Affaires</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="platform"
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
                        return (
                          <div className="bg-[#1a1b1e]/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-800/50">
                            <p className="text-white font-medium mb-2">{label}</p>
                            <p className="text-blue-400">Revenus: {payload[0].value}€</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales Volume Distribution */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Répartition du Volume de Ventes</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="platform"
                    stroke="#666"
                    tick={{ fill: '#666', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#666"
                    tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#1a1b1e]/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-800/50">
                            <p className="text-white font-medium mb-2">{label}</p>
                            <p className="text-green-400">Ventes: {payload[0].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 text-center bg-[#1a1b1e]/50 rounded-lg p-4">
          <div>
            <div className="text-2xl font-bold text-white">{platformPerformance.length}</div>
            <div className="text-sm text-gray-400">Total Éléments</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{totalRevenue.toFixed(2)}€</div>
            <div className="text-sm text-gray-400">CA Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{totalSales}</div>
            <div className="text-sm text-gray-400">Ventes Totales</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{globalAveragePrice.toFixed(2)}€</div>
            <div className="text-sm text-gray-400">Prix Moyen</div>
          </div>
        </div>
      </div>
    </div>
  );
};