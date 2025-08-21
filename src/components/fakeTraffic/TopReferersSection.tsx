import React from 'react';
import { useFakeTrafficLogs } from '../../hooks/useFakeTraffic';
import { FakeTrafficFilters } from '../../types/fakeTraffic';
import { ExternalLink, TrendingUp } from 'lucide-react';

interface TopReferersSection {
  filters: FakeTrafficFilters;
}

export const TopReferersSection: React.FC<TopReferersSection> = ({ filters }) => {
  const { data, isLoading } = useFakeTrafficLogs(filters, 1, 1000); // Récupérer plus de données pour l'analyse
  const logs = data?.data || [];

  // Analyser les referers
  const referersData = React.useMemo(() => {
    if (logs.length === 0) return [];

    // Grouper par domaine
    const domainStats = logs.reduce((acc, log) => {
      try {
        const domain = new URL(log.post_url).hostname;
        if (!acc[domain]) {
          acc[domain] = {
            domain,
            totalRequests: 0,
            uniqueQueries: new Set(),
            queries: []
          };
        }
        acc[domain].totalRequests += 1;
        acc[domain].uniqueQueries.add(log.query);
        acc[domain].queries.push(log.query);
        return acc;
      } catch {
        return acc;
      }
    }, {} as Record<string, {
      domain: string;
      totalRequests: number;
      uniqueQueries: Set<string>;
      queries: string[];
    }>);

    // Convertir en array et trier
    return Object.values(domainStats)
      .map(stats => ({
        domain: stats.domain,
        totalRequests: stats.totalRequests,
        uniqueQueries: stats.uniqueQueries.size,
        topQuery: stats.queries.reduce((acc, query) => {
          acc[query] = (acc[query] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        percentage: (stats.totalRequests / logs.length) * 100
      }))
      .map(item => ({
        ...item,
        mostUsedQuery: Object.entries(item.topQuery)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || ''
      }))
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, 10);
  }, [logs]);

  if (isLoading) {
    return (
      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-6 border border-gray-800/10">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#1a1b1e]/50 rounded w-1/3" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#1a1b1e]/50 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (referersData.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-6 border border-gray-800/10">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Top Referers
        </h2>
      </div>

      <div className="space-y-3">
        {referersData.map((referer, index) => (
          <div 
            key={referer.domain}
            className="bg-[#1a1b1e]/50 rounded-lg p-4 hover:bg-[#1a1b1e]/70 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                  index === 1 ? 'bg-gray-400/20 text-gray-300' :
                  index === 2 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {index + 1}
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  <span className="text-white font-medium">{referer.domain}</span>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                {referer.percentage.toFixed(1)}%
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-blue-400 font-semibold">{referer.totalRequests}</div>
                <div className="text-gray-400">Requêtes</div>
              </div>
              <div>
                <div className="text-green-400 font-semibold">{referer.uniqueQueries}</div>
                <div className="text-gray-400">Queries uniques</div>
              </div>
              <div className="min-w-0">
                <div className="text-purple-400 font-semibold truncate" title={referer.mostUsedQuery}>
                  {referer.mostUsedQuery}
                </div>
                <div className="text-gray-400">Query principale</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};