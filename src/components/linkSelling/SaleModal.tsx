import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { LinkSelling } from '../../types/linkSelling';
import { useAddSale, useUpdateSale, useAvailableSites, useAvailablePlatforms } from '../../hooks/useLinkSelling';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale?: LinkSelling | null;
}

export const SaleModal: React.FC<SaleModalProps> = ({ isOpen, onClose, sale }) => {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    montant: '',
    site: '',
    plateforme: ''
  });

  const [showSiteDropdown, setShowSiteDropdown] = useState(false);
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [siteSearch, setSiteSearch] = useState('');
  const [platformSearch, setPlatformSearch] = useState('');

  const addSale = useAddSale();
  const updateSale = useUpdateSale();
  const { data: availableSites = [] } = useAvailableSites();
  const { data: availablePlatforms = [] } = useAvailablePlatforms();

  useEffect(() => {
    if (sale) {
      setFormData({
        date: sale.date,
        montant: sale.montant.toString(),
        site: sale.site,
        plateforme: sale.plateforme
      });
      setSiteSearch(sale.site);
      setPlatformSearch(sale.plateforme);
    } else {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        montant: '',
        site: '',
        plateforme: ''
      });
      setSiteSearch('');
      setPlatformSearch('');
    }
  }, [sale, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const saleData = {
      date: formData.date,
      montant: parseFloat(formData.montant),
      site: formData.site,
      plateforme: formData.plateforme
    };

    try {
      if (sale) {
        await updateSale.mutateAsync({ id: sale.id, updates: saleData });
      } else {
        await addSale.mutateAsync(saleData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving sale:', error);
    }
  };

  const handleSiteSelect = (selectedSite: string) => {
    setFormData({ ...formData, site: selectedSite });
    setSiteSearch(selectedSite);
    setShowSiteDropdown(false);
  };

  const handlePlatformSelect = (selectedPlatform: string) => {
    setFormData({ ...formData, plateforme: selectedPlatform });
    setPlatformSearch(selectedPlatform);
    setShowPlatformDropdown(false);
  };

  const filteredSites = availableSites.filter(site =>
    site.toLowerCase().includes(siteSearch.toLowerCase())
  );

  const filteredPlatforms = availablePlatforms.filter(platform =>
    platform.toLowerCase().includes(platformSearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#25262b] rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[#1a1b1e] text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-white mb-6">
          {sale ? 'Modifier la vente' : 'Ajouter une vente'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                       text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
            />
          </div>

          {/* Site Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Site
            </label>
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={siteSearch}
                  onChange={(e) => {
                    setSiteSearch(e.target.value);
                    setFormData({ ...formData, site: e.target.value });
                    setShowSiteDropdown(true);
                  }}
                  onFocus={() => setShowSiteDropdown(true)}
                  placeholder="Tapez ou sélectionnez un site"
                  className="w-full px-3 py-2 pr-8 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                           text-gray-200 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSiteDropdown(!showSiteDropdown)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSiteDropdown ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showSiteDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowSiteDropdown(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                                shadow-xl z-20 max-h-48 overflow-y-auto">
                    {filteredSites.length > 0 ? (
                      filteredSites.map((site, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSiteSelect(site)}
                          className="w-full text-left px-3 py-2 text-gray-200 hover:bg-[#25262b] 
                                   transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          {site}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-400 text-sm">
                        {siteSearch ? 'Nouveau site (sera créé)' : 'Aucun site disponible'}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Platform Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Plateforme
            </label>
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={platformSearch}
                  onChange={(e) => {
                    setPlatformSearch(e.target.value);
                    setFormData({ ...formData, plateforme: e.target.value });
                    setShowPlatformDropdown(true);
                  }}
                  onFocus={() => setShowPlatformDropdown(true)}
                  placeholder="Tapez ou sélectionnez une plateforme"
                  className="w-full px-3 py-2 pr-8 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                           text-gray-200 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showPlatformDropdown ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showPlatformDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowPlatformDropdown(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                                shadow-xl z-20 max-h-48 overflow-y-auto">
                    {/* Plateformes prédéfinies en premier */}
                    {!platformSearch && (
                      <>
                        <button
                          type="button"
                          onClick={() => handlePlatformSelect('direct')}
                          className="w-full text-left px-3 py-2 text-green-400 hover:bg-[#25262b] 
                                   transition-colors font-medium border-b border-gray-700/30"
                        >
                          direct ✓ (Vente directe)
                        </button>
                        <div className="px-3 py-1 text-xs text-gray-500 bg-[#25262b]/50">
                          Plateformes existantes:
                        </div>
                      </>
                    )}
                    
                    {filteredPlatforms.length > 0 ? (
                      filteredPlatforms.map((platform, index) => {
                        const isDirect = platform.toLowerCase().includes('direct');
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handlePlatformSelect(platform)}
                            className={`w-full text-left px-3 py-2 hover:bg-[#25262b] transition-colors
                                       ${isDirect ? 'text-green-400 font-medium' : 'text-gray-200'}`}
                          >
                            {platform}
                            {isDirect && ' ✓'}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-gray-400 text-sm">
                        {platformSearch ? 'Nouvelle plateforme (sera créée)' : 'Aucune plateforme disponible'}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Montant (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.montant}
              onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
              placeholder="25.50"
              className="w-full px-3 py-2 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                       text-gray-200 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg 
                       hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={addSale.isLoading || updateSale.isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg 
                       hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {addSale.isLoading || updateSale.isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>

        {/* Info Helper */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-400 text-xs">
            💡 <strong>Astuce :</strong> Vous pouvez taper pour rechercher ou créer de nouveaux sites/plateformes. 
            Les éléments existants apparaîtront dans la liste déroulante.
          </p>
        </div>
      </div>
    </div>
  );
};