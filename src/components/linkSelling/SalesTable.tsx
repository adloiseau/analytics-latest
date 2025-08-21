import React, { useState } from 'react';
import { Search, Edit2, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LinkSelling } from '../../types/linkSelling';
import { useLinkSelling, useDeleteSale } from '../../hooks/useLinkSelling';
import { LinkSellingFilters } from '../../services/supabase/linkSelling';
import { SaleModal } from './SaleModal';

interface SalesTableProps {
  filters: LinkSellingFilters;
}

// Helper function to check if a platform is considered "direct"
const isDirectSale = (platform: string): boolean => {
  const normalizedPlatform = platform.toLowerCase().trim();
  return normalizedPlatform === 'direct' || 
         normalizedPlatform === 'vente directe' || 
         normalizedPlatform === 'direct sale' ||
         normalizedPlatform === 'directe' ||
         normalizedPlatform.includes('direct');
};

export const SalesTable: React.FC<SalesTableProps> = ({ filters }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<LinkSelling | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

  const { data: sales = [], isLoading } = useLinkSelling(filters);
  const deleteSale = useDeleteSale();

  // Filter sales by search query
  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.plateforme.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredSales.slice(startIndex, startIndex + itemsPerPage);

  const handleEdit = (sale: LinkSelling) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) {
      await deleteSale.mutateAsync(id);
    }
  };

  const handleAddNew = () => {
    setSelectedSale(null);
    setIsModalOpen(true);
  };

  // Reset pagination when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  if (isLoading) {
    return (
      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-6 border border-gray-800/10">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-[#1a1b1e]/50 rounded-lg w-1/3" />
          <div className="h-[400px] bg-[#1a1b1e]/50 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-6 border border-gray-800/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Historique des ventes
            <span className="text-sm text-gray-400 font-normal ml-2">
              ({filteredSales.length} résultat{filteredSales.length > 1 ? 's' : ''})
            </span>
          </h2>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg 
                     hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter une vente
          </button>
        </div>

        {/* Search Filter */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par site ou plateforme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                       text-sm text-gray-200 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-800/50">
                <th className="pb-4">Date</th>
                <th className="pb-4">Site</th>
                <th className="pb-4">Plateforme</th>
                <th className="pb-4 text-right">Montant</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSales.length > 0 ? (
                paginatedSales.map((sale) => {
                  const isDirect = isDirectSale(sale.plateforme);
                  
                  return (
                    <tr 
                      key={sale.id}
                      className="border-b border-gray-800/20 hover:bg-[#1a1b1e]/50 transition-colors"
                    >
                      <td className="py-3 text-gray-300">
                        {format(parseISO(sale.date), 'dd/MM/yyyy', { locale: fr })}
                      </td>
                      <td className="py-3 text-gray-300">{sale.site}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isDirect
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {sale.plateforme}
                          {isDirect && ' ✓'}
                        </span>
                      </td>
                      <td className="py-3 text-right text-gray-300 font-medium">
                        {Number(sale.montant).toFixed(2)}€
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(sale)}
                            className="p-1 rounded-lg hover:bg-[#2d2e33] text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sale.id)}
                            className="p-1 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    {searchQuery ? 'Aucun résultat trouvé pour votre recherche' : 'Aucune vente trouvée'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 text-sm">
            <div className="text-gray-400">
              Page {currentPage} sur {totalPages} ({filteredSales.length} résultats)
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

      {/* Modal */}
      <SaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sale={selectedSale}
      />
    </>
  );
};