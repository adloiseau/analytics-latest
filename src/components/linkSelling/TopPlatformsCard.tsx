import React from 'react';
import { TrendingUp, Award, DollarSign, BarChart3 } from 'lucide-react';
import { formatMetric } from '../../utils/metrics';

interface TopPlatformsCardProps {
  topPlatforms: Array<{
    plateforme: string;
    montant: number;
    count: number;
    percentage: number;
    averagePrice: number;
  }>;
}

export const TopPlatformsCard: React.FC<TopPlatformsCardProps> = ({ topPlatforms }) => {
  if (!topPlatforms || topPlatforms.length === 0) {
    return (
      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-6 border border-gray-800/10">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
          Top Plateformes
        </h2>
        <div className="text-gray-400 text-center py-8">
          Aucune donnée de plateforme disponible
        </div>
      </div>
    );
  }

  const top5 = topPlatforms.slice(0, 5);

  return (
    <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-6 border border-gray-800/10">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-yellow-500" />
        <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Top Plateformes
        </h2>
      </div>
      
      <div className="space-y-3">
        {top5.map((platform, index) => (
          <div 
            key={platform.plateforme}
            className="flex items-center justify-between p-3 rounded-lg bg-[#1a1b1e]/50 
                     hover:bg-[#1a1b1e]/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                             ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                               index === 1 ? 'bg-gray-400/20 text-gray-300' :
                               index === 2 ? 'bg-orange-500/20 text-orange-400' :
                               'bg-blue-500/20 text-blue-400'}`}>
                {index + 1}
              </div>
              <div>
                <div className="text-white font-medium">{platform.plateforme}</div>
                <div className="text-gray-400 text-xs flex items-center gap-2">
                  <span>{platform.count} ventes</span>
                  <span>•</span>
                  <span>Moy: {platform.averagePrice.toFixed(2)}€</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-white font-semibold">{platform.montant.toFixed(2)}€</span>
              </div>
              <div className="text-gray-400 text-xs">{platform.percentage.toFixed(1)}% du total</div>
            </div>
          </div>
        ))}
      </div>
      
      {topPlatforms.length > 5 && (
        <div className="mt-4 text-center text-gray-400 text-sm">
          +{topPlatforms.length - 5} autres plateformes
        </div>
      )}
    </div>
  );
};