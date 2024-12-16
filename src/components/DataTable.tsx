import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatMetric } from '../utils/metrics';
import { PositionHistoryPopup } from './PositionHistoryPopup';

interface DataTableProps {
  data: any[];
  dimension: 'page' | 'query';
}

export const DataTable: React.FC<DataTableProps> = ({ data = [], dimension }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const itemsPerPage = 10;

  const formatKey = (key: string) => {
    if (dimension === 'page') {
      try {
        const url = new URL(key);
        return url.pathname || '/';
      } catch {
        return key;
      }
    }
    return key;
  };

  // Filter data based on search query
  const filteredData = data.filter(item => {
    const key = formatKey(item.keys[0]).toLowerCase();
    return key.includes(searchQuery.toLowerCase());
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-4 mt-4 border border-gray-800/10">
        {/* Search Bar */}
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder={`Rechercher ${dimension === 'page' ? 'une page' : 'une requête'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
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
                <th className="pb-3">{dimension === 'page' ? 'Page' : 'Requête'}</th>
                <th className="pb-3 text-right">Clics</th>
                <th className="pb-3 text-right">Impressions</th>
                <th className="pb-3 text-right">CTR</th>
                <th className="pb-3 text-right">Position</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr 
                  key={index} 
                  className="border-t border-gray-800/50 hover:bg-[#1a1b1e]/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedItem(item)}
                >
                  <td className="py-3 text-gray-300">
                    {formatKey(item.keys[0])}
                  </td>
                  <td className="py-3 text-right text-gray-300">
                    {formatMetric(item.clicks)}
                  </td>
                  <td className="py-3 text-right text-gray-300">
                    {formatMetric(item.impressions)}
                  </td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-1 rounded text-sm ${
                      item.ctr > 0.05 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(item.ctr * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-gray-300">
                      {item.position.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="text-gray-400">
              Page {currentPage} sur {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-lg hover:bg-[#1a1b1e] disabled:opacity-50 
                         disabled:cursor-not-allowed text-gray-400 hover:text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-lg hover:bg-[#1a1b1e] disabled:opacity-50 
                         disabled:cursor-not-allowed text-gray-400 hover:text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Position History Popup */}
      {selectedItem && (
        <PositionHistoryPopup
          item={selectedItem}
          dimension={dimension}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
};