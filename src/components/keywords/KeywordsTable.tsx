import React, { useState } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchConsoleData } from '../../hooks/useSearchConsoleData';
import { useSelectedItem } from '../../contexts/SelectedItemContext';
import { SparklineChart } from '../metrics/SparklineChart';
import { PositionHistoryPopup } from '../PositionHistoryPopup';

export const KeywordsTable = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'pages' | 'keywords' | 'countries'>('keywords');
  const [sortField, setSortField] = useState<'volume' | 'position'>('volume');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedKeyword, setSelectedKeyword] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { data, isLoading } = useSearchConsoleData(view === 'countries' ? 'country' : view === 'pages' ? 'page' : 'query');
  const { selectedItem, setSelectedItem } = useSelectedItem();

  if (isLoading) {
    return (
      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-[#1a1b1e]/50 rounded-lg w-1/3" />
          <div className="h-[400px] bg-[#1a1b1e]/50 rounded-lg" />
        </div>
      </div>
    );
  }

  const rows = data?.rows || [];
  
  // Sort data
  const sortedRows = [...rows].sort((a, b) => {
    const value = sortField === 'volume' ? 'impressions' : 'position';
    return sortDirection === 'desc' 
      ? b[value] - a[value]
      : a[value] - b[value];
  });

  // Filter data
  const filteredRows = sortedRows.filter(row => {
    const key = row.keys[0].toLowerCase();
    return key.includes(searchQuery.toLowerCase());
  });

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + itemsPerPage);

  const formatKey = (key: string) => {
    if (view === 'pages') {
      try {
        const url = new URL(key);
        return url.pathname;
      } catch {
        return key;
      }
    }
    return key;
  };

  const handleSort = (field: 'volume' | 'position') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Generate trend data for visualization
  const generateTrendData = () => {
    return Array.from({ length: 10 }, (_, i) => {
      const base = 50;
      const amplitude = 30;
      const x = i / 9;
      return base + amplitude * Math.sin(x * Math.PI);
    });
  };

  return (
    <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2.5 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                     text-sm text-gray-200 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('pages')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'pages'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-[#1a1b1e] text-gray-400 hover:text-white hover:bg-[#2d2e33]'
            }`}
          >
            Pages
          </button>
          <button
            onClick={() => setView('keywords')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'keywords'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-[#1a1b1e] text-gray-400 hover:text-white hover:bg-[#2d2e33]'
            }`}
          >
            Keywords
          </button>
          <button
            onClick={() => setView('countries')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'countries'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-[#1a1b1e] text-gray-400 hover:text-white hover:bg-[#2d2e33]'
            }`}
          >
            Pays
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm border-b border-gray-800/50">
              <th className="pb-4 pl-6">{view === 'pages' ? 'Page' : view === 'countries' ? 'Pays' : 'Mot-clé'}</th>
              <th className="pb-4 px-8 text-right cursor-pointer" onClick={() => handleSort('volume')}>
                <div className="flex items-center justify-end gap-2">
                  Volume
                  <ArrowUpDown className={`w-4 h-4 ${sortField === 'volume' ? 'text-blue-400' : ''}`} />
                </div>
              </th>
              <th className="pb-4 px-8 text-right cursor-pointer" onClick={() => handleSort('position')}>
                <div className="flex items-center justify-end gap-2">
                  Position
                  <ArrowUpDown className={`w-4 h-4 ${sortField === 'position' ? 'text-blue-400' : ''}`} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, index) => (
              <tr
                key={index}
                onClick={() => setSelectedKeyword(row)}
                className={`cursor-pointer transition-colors relative group ${
                  selectedItem === row.keys[0] ? 'bg-[#2d2e33]' : 'hover:bg-[#1a1b1e]'
                }`}
              >
                <td className="py-5 pl-6 text-gray-300 relative">
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                    <SparklineChart 
                      data={generateTrendData()} 
                      color="#3b82f6"
                      height={48}
                    />
                  </div>
                  <span className="relative z-10 font-medium">{formatKey(row.keys[0])}</span>
                </td>
                <td className="py-5 px-8 text-right text-gray-300 font-medium">{row.impressions.toLocaleString()}</td>
                <td className="py-5 px-8 text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    row.position <= 10 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {row.position.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 text-sm">
          <div className="text-gray-400">
            Page {currentPage} sur {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-[#1a1b1e] disabled:opacity-50 
                       disabled:cursor-not-allowed text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-[#1a1b1e] disabled:opacity-50 
                       disabled:cursor-not-allowed text-gray-400 hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {selectedKeyword && (
        <PositionHistoryPopup
          item={selectedKeyword}
          dimension={view === 'pages' ? 'page' : 'query'}
          onClose={() => setSelectedKeyword(null)}
        />
      )}
    </div>
  );
};