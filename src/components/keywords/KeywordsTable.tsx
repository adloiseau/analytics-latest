import React, { useState } from 'react';
import { Search, ArrowUp, ArrowDown } from 'lucide-react';
import { useSearchConsoleData } from '../../hooks/useSearchConsoleData';
import { formatMetric } from '../../utils/metrics';
import { SparklineChart } from '../metrics/SparklineChart';
import { FR, GB, ES, DE, IT } from 'country-flag-icons/react/3x2';
import { PositionHistoryPopup } from '../PositionHistoryPopup';

type SortField = 'position' | 'volume';
type SortDirection = 'asc' | 'desc';

const countryFlags: Record<string, React.ComponentType<any>> = {
  FR,
  GB,
  ES,
  DE,
  IT
};

export const KeywordsTable = () => {
  const { data, isLoading } = useSearchConsoleData('query');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('volume');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedKeyword, setSelectedKeyword] = useState<any>(null);
  const itemsPerPage = 20;

  if (isLoading) {
    return (
      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-[#1a1b1e]/50 rounded-lg w-full" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#1a1b1e]/50 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const keywords = data?.rows || [];

  // Filter keywords based on search query
  const filteredKeywords = keywords.filter(kw => 
    kw.keys[0].toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort keywords
  const sortedKeywords = [...filteredKeywords].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'position':
        return (a.position - b.position) * direction;
      case 'volume':
        return (a.impressions - b.impressions) * direction;
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedKeywords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedKeywords = sortedKeywords.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-3 h-3" /> : 
      <ArrowDown className="w-3 h-3" />;
  };

  const generateSparklineData = () => {
    return Array.from({ length: 10 }, () => Math.random() * 10);
  };

  const formatPage = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      return url;
    }
  };

  return (
    <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4 border border-gray-800/10">
      {/* Search Bar */}
      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Rechercher un mot-clé..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 bg-[#1a1b1e]/50 border border-gray-700/50 rounded-lg 
                   text-sm text-gray-200 placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm">
              <th className="pb-4">Mot-clé</th>
              <th className="pb-4">Page</th>
              <th 
                className="pb-4 cursor-pointer hover:text-white"
                onClick={() => handleSort('position')}
              >
                <div className="flex items-center gap-1">
                  Position
                  {renderSortIcon('position')}
                </div>
              </th>
              <th 
                className="pb-4 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('volume')}
              >
                <div className="flex items-center justify-end gap-1">
                  Volume
                  {renderSortIcon('volume')}
                </div>
              </th>
              <th className="pb-4 text-right">Pays</th>
            </tr>
          </thead>
          <tbody>
            {paginatedKeywords.map((keyword, index) => {
              const sparklineData = generateSparklineData();
              const country = 'FR'; // This would come from your data
              const FlagComponent = countryFlags[country];

              return (
                <tr 
                  key={index} 
                  className="border-t border-gray-800/50 relative hover:bg-[#1a1b1e]/30 cursor-pointer transition-colors"
                  onClick={() => setSelectedKeyword(keyword)}
                >
                  <td className="py-4 text-gray-300">
                    <div className="relative z-10">{keyword.keys[0]}</div>
                    <div className="absolute inset-0 opacity-10 group-hover:opacity-20">
                      <SparklineChart 
                        data={sparklineData}
                        color={keyword.position < 10 ? '#10b981' : '#ef4444'}
                        height={40}
                      />
                    </div>
                  </td>
                  <td className="py-4 text-gray-300">{formatPage(keyword.keys[0])}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-300">{keyword.position.toFixed(1)}</span>
                      {keyword.position < 10 ? (
                        <ArrowUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 text-right text-gray-300">
                    {formatMetric(keyword.impressions)}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end">
                      {FlagComponent && (
                        <div className="w-6 rounded overflow-hidden">
                          <FlagComponent />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
          <span>
            Page {currentPage} sur {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-[#1a1b1e]/50 hover:bg-[#1a1b1e] 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-[#1a1b1e]/50 hover:bg-[#1a1b1e]
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Position History Popup */}
      {selectedKeyword && (
        <PositionHistoryPopup
          item={selectedKeyword}
          dimension="query"
          onClose={() => setSelectedKeyword(null)}
        />
      )}
    </div>
  );
};