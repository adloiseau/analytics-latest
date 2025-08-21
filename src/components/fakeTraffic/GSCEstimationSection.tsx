import React from 'react';
import { useFakeTrafficQueryData } from '../../hooks/useFakeTraffic';
import { FakeTrafficFilters } from '../../types/fakeTraffic';
import { Calculator, Eye } from 'lucide-react';

interface GSCEstimationSectionProps {
  filters: FakeTrafficFilters;
}

// Configuration pour estimation mensuelle
const HITS_TO_IMPRESSIONS_RATIO = 0.7; // 1 hit = 0.7 impression

export const GSCEstimationSection: React.FC<GSCEstimationSectionProps> = ({ filters }) => {
  const { data: queryData = [], isLoading } = useFakeTrafficQueryData(filters);

  // Calculer l'estimation mensuelle basée sur les 7 derniers jours
  const monthlyEstimation = React.useMemo(() => {
    if (!queryData || queryData.length === 0) return [];

    // Prendre les 7 derniers jours de données
    const last7Days = queryData.slice(-7);
    
    // Calculer le total des requêtes sur 7 jours
    let totalRequests = 0;
    
    last7Days.forEach(day => {
      Object.keys(day).forEach(key => {
        if (key !== 'date') {
          totalRequests += day[key] as number;
        }
      });
    });

    // Calculer la moyenne quotidienne
    const dailyAverage = last7Days.length > 0 ? totalRequests / last7Days.length : 0;
    
    // Estimer pour 30 jours
    const monthlyRequests = Math.round(dailyAverage * 30);
    const monthlyImpressions = Math.round(monthlyRequests * HITS_TO_IMPRESSIONS_RATIO);
    
    return {
      dailyAverage,
      monthlyRequests,
      monthlyImpressions,
      daysAnalyzed: last7Days.length
    };
  }, [queryData]);

  if (isLoading) {
    return (
      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-6 border border-gray-800/10">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#1a1b1e]/50 rounded w-1/3" />
          <div className="h-[120px] bg-[#1a1b1e]/50 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-6 border border-gray-800/10">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-orange-400" />
        <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Estimation mensuelle GSC
        </h2>
      </div>

      {/* Estimation simple */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1b1e]/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {monthlyEstimation.dailyAverage?.toFixed(0) || 0}
          </div>
          <div className="text-sm text-gray-400">Requêtes/jour (moy.)</div>
          <div className="text-xs text-gray-500 mt-1">
            Sur {monthlyEstimation.daysAnalyzed} jours
          </div>
        </div>
        
        <div className="bg-[#1a1b1e]/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-400 mb-1">
            {monthlyEstimation.monthlyRequests?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-gray-400">Requêtes/mois (est.)</div>
          <div className="text-xs text-gray-500 mt-1">
            Projection 30 jours
          </div>
        </div>
        
        <div className="bg-[#1a1b1e]/50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-400 mb-1">
            {monthlyEstimation.monthlyImpressions?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-gray-400">Impressions GSC (est.)</div>
          <div className="text-xs text-gray-500 mt-1">
            Ratio {HITS_TO_IMPRESSIONS_RATIO}x
          </div>
        </div>
      </div>
      
      {/* Info */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-blue-400 text-xs">
          📊 Estimation basée sur la moyenne des {monthlyEstimation.daysAnalyzed} derniers jours avec un ratio de {HITS_TO_IMPRESSIONS_RATIO} impression par requête.
        </p>
      </div>
    </div>
  );
};