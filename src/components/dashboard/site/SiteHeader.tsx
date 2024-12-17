import React from 'react';
import { Globe, Plus } from 'lucide-react';

interface SiteHeaderProps {
  hostname: string;
  favicon: string;
  position: number;
  ctr: number;
  onShowMetrics: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  hostname,
  favicon,
  position,
  ctr,
  onShowMetrics
}) => (
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <img 
        src={favicon} 
        alt={hostname} 
        className="w-5 h-5 rounded-sm flex-shrink-0"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = Globe;
        }}
      />
      <h3 className="text-sm font-medium text-white truncate">{hostname}</h3>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onShowMetrics();
        }}
        className="p-1 rounded-lg hover:bg-[#1a1b1e] text-gray-400 hover:text-white 
                 transition-colors"
        title="Voir plus de métriques"
      >
        <Plus size={16} />
      </button>
    </div>
    <div className="flex items-center gap-3 flex-shrink-0">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400">Pos</span>
        <span className="px-1.5 py-0.5 bg-[#1a1b1e] rounded text-sm font-medium text-white">
          {position.toFixed(1)}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400">CTR</span>
        <span className={`px-1.5 py-0.5 rounded text-sm font-medium ${
          ctr > 0.05 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {(ctr * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  </div>
);