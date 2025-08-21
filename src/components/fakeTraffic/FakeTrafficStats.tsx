import React from 'react';
import { Activity, Search, Globe, Calendar } from 'lucide-react';
import { FakeTrafficStats as StatsType } from '../../types/fakeTraffic';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FakeTrafficStatsProps {
  stats?: StatsType;
  isLoading: boolean;
}

export const FakeTrafficStats: React.FC<FakeTrafficStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-[#25262b]/90 rounded-lg p-4 border border-gray-800/10">
            <div className="h-16 bg-[#1a1b1e]/50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const formatDateRange = () => {
    if (!stats.dateRange.start || !stats.dateRange.end) return 'Aucune donnée';
    
    try {
      const start = format(parseISO(stats.dateRange.start), 'dd MMM', { locale: fr });
      const end = format(parseISO(stats.dateRange.end), 'dd MMM yyyy', { locale: fr });
      return `${start} - ${end}`;
    } catch {
      return `${stats.dateRange.start} - ${stats.dateRange.end}`;
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4 border border-gray-800/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">{stats.totalLogs.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Total Requêtes</div>
          </div>
        </div>
      </div>

      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4 border border-gray-800/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Search className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">{stats.uniqueQueries.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Requêtes uniques</div>
          </div>
        </div>
      </div>

      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4 border border-gray-800/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Globe className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">{stats.uniqueDomains.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Domaines uniques</div>
          </div>
        </div>
      </div>

      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4 border border-gray-800/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <Calendar className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">{formatDateRange()}</div>
            <div className="text-xs text-gray-400">Période</div>
          </div>
        </div>
      </div>
    </div>
  );
};