import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Clock, Globe, Search } from 'lucide-react';
import { useFakeTrafficLogs } from '../../hooks/useFakeTraffic';
import { FakeTrafficFilters } from '../../types/fakeTraffic';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FakeTrafficTableProps {
  filters: FakeTrafficFilters;
}

export const FakeTrafficTable: React.FC<FakeTrafficTableProps> = ({ filters }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data, isLoading } = useFakeTrafficLogs(filters, currentPage, itemsPerPage);
  const logs = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  const formatTime = (timeStr: string) => {
    try {
      // Assuming time format is HH:mm:ss
      return timeStr;
    } catch {
      return timeStr;
    }
  };

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const truncateUserAgent = (ua: string) => {
    if (ua.length > 50) {
      return `${ua.substring(0, 50)}...`;
    }
    return ua;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse h-12 bg-[#1a1b1e]/50 rounded-lg" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        Aucun log trouvé pour les filtres sélectionnés
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="text-sm text-gray-400">
        {total.toLocaleString()} requêtes • Page {currentPage} sur {totalPages}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="space-y-2">
          {logs.map((log) => (
            <div 
              key={log.id}
              className="bg-[#1a1b1e]/50 rounded-lg p-3 hover:bg-[#1a1b1e]/70 transition-colors"
            >
              {/* Header Row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {formatTime(log.time)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Globe className="w-3 h-3" />
                    {log.ip}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {format(parseISO(log.log_date), 'dd/MM/yyyy', { locale: fr })}
                </div>
              </div>

              {/* Query Row */}
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-white font-medium text-sm">{log.query}</span>
                </div>
              </div>

              {/* URL Row */}
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-green-400 text-sm font-medium">
                      {extractDomain(log.post_url)}
                    </div>
                    <div className="text-gray-400 text-xs truncate">
                      {log.post_url}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Agent Row */}
              <div className="text-xs text-gray-500 bg-[#25262b]/50 rounded p-2">
                <span className="font-medium">UA:</span> {truncateUserAgent(log.useragent)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, total)} sur {total}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-[#1a1b1e] disabled:opacity-50 
                       disabled:cursor-not-allowed text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="text-sm text-gray-300 px-3">
              {currentPage} / {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-[#1a1b1e] disabled:opacity-50 
                       disabled:cursor-not-allowed text-gray-400 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};