import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFakeTrafficQueryData } from '../../hooks/useFakeTraffic';
import { FakeTrafficFilters } from '../../types/fakeTraffic';
import { EmptyChart } from '../metrics/chart/EmptyChart';
import { Plus, X } from 'lucide-react';

interface QueryTrafficChartProps {
  filters: FakeTrafficFilters;
  onDateSelect: (date: string) => void;
}

// Couleurs prédéfinies pour les différentes requêtes
const QUERY_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

export const QueryTrafficChart: React.FC<QueryTrafficChartProps> = ({ filters, onDateSelect }) => {
  const [selectedQueries, setSelectedQueries] = useState<string[]>([]);
  const [queryInput, setQueryInput] = useState('');
  
  const { data: queryData = [], isLoading } = useFakeTrafficQueryData(filters);

  console.log('🔍 QueryTrafficChart render:', {
    queryDataLength: queryData.length,
    selectedQueriesLength: selectedQueries.length,
    isLoading
  });

  // Extraire toutes les requêtes disponibles - SIMPLE
  const allQueries = React.useMemo(() => {
    console.log('📊 Calculating allQueries from queryData:', queryData.length);
    const queries = new Set<string>();
    queryData.forEach(day => {
      Object.keys(day).forEach(key => {
        if (key !== 'date') {
          queries.add(key);
        }
      });
    });
    const result = Array.from(queries).sort();
    console.log('✅ AllQueries calculated:', result.length);
    return result;
  }, [queryData]);

  // Calculer les top 5 requêtes - SIMPLE
  const top5Queries = React.useMemo(() => {
    if (allQueries.length === 0 || queryData.length === 0) return [];
    
    console.log('🏆 Calculating top5 queries');
    const queryTotals = allQueries.map(query => {
      const total = queryData.reduce((sum, day) => sum + (day[query] || 0), 0);
      return { query, total };
    }).sort((a, b) => b.total - a.total);
    
    const result = queryTotals.slice(0, 5).map(item => item.query);
    console.log('✅ Top5 calculated:', result);
    return result;
  }, [allQueries, queryData]);

  // Ajouter une requête à la sélection
  const addQuery = (query: string) => {
    console.log('➕ Adding query:', query);
    if (!selectedQueries.includes(query)) {
      setSelectedQueries([...selectedQueries, query]);
    }
    setQueryInput('');
  };

  // Supprimer une requête de la sélection
  const removeQuery = (query: string) => {
    console.log('➖ Removing query:', query);
    setSelectedQueries(selectedQueries.filter(q => q !== query));
  };

  // Réinitialiser à la vue globale
  const resetToGlobalView = () => {
    console.log('🌍 Reset to global view');
    setSelectedQueries([]);
    setQueryInput('');
  };

  // Utiliser les top 5 par défaut
  const useTop5 = () => {
    console.log('🔝 Using top 5 queries');
    setSelectedQueries([...top5Queries]);
  };

  // Initialiser avec le top 5 par défaut
  React.useEffect(() => {
    if (top5Queries.length > 0 && selectedQueries.length === 0) {
      setSelectedQueries([...top5Queries]);
    }
  }, [top5Queries]);

  // Filtrer les requêtes selon l'input
  const filteredQueries = allQueries.filter(query =>
    query.toLowerCase().includes(queryInput.toLowerCase()) &&
    !selectedQueries.includes(query)
  );

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (queryData.length === 0) {
    return <EmptyChart message="Aucune donnée de trafic disponible pour la période sélectionnée" />;
  }

  // Préparer les données pour l'affichage - SIMPLE
  const displayData = queryData.map(day => {
    if (selectedQueries.length === 0) {
      // Vue globale : agrégation de toutes les requêtes par jour
      const total = Object.keys(day).reduce((sum, key) => {
        if (key !== 'date') {
          return sum + (day[key] || 0);
        }
        return sum;
      }, 0);
      
      return {
        ...day,
        'Total Global': total
      };
    }
    
    // Vue filtrée : seulement les requêtes sélectionnées
    return day;
  });

  const linesToDisplay = selectedQueries.length > 0 ? selectedQueries : ['Total Global'];

  console.log('📈 Rendering chart with lines:', linesToDisplay);

  return (
    <div className="space-y-4">
      {/* Query Selector */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Bouton Vue Globale */}
        <button
          onClick={resetToGlobalView}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedQueries.length === 0
              ? 'bg-blue-500 text-white'
              : 'bg-[#1a1b1e] text-gray-400 hover:text-white hover:bg-[#25262b]'
          }`}
        >
          Vue Globale
        </button>

        {/* Bouton Top 5 */}
        <button
          onClick={useTop5}
          className="px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-[#1a1b1e] text-gray-400 hover:text-white hover:bg-[#25262b]"
        >
          Top 5
        </button>
        
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Tapez pour rechercher une requête..."
              className="w-full px-3 py-2 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                       text-gray-200 placeholder-gray-400 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            
            {queryInput && filteredQueries.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1b1e] border border-gray-700/50 rounded-lg 
                            shadow-xl z-20 max-h-48 overflow-y-auto">
                {filteredQueries.slice(0, 10).map((query, index) => (
                  <button
                    key={index}
                    onClick={() => addQuery(query)}
                    className="w-full text-left px-3 py-2 text-gray-200 hover:bg-[#25262b] 
                             transition-colors text-sm truncate flex items-center justify-between"
                  >
                    <span className="truncate">{query}</span>
                    <Plus className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Queries */}
        <div className="flex flex-wrap gap-2">
          {selectedQueries.map((query, index) => (
            <div
              key={query}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs border"
              style={{
                backgroundColor: `${QUERY_COLORS[index % QUERY_COLORS.length]}20`,
                borderColor: `${QUERY_COLORS[index % QUERY_COLORS.length]}50`,
                color: QUERY_COLORS[index % QUERY_COLORS.length]
              }}
            >
              <span className="max-w-[100px] truncate">{query}</span>
              <button
                onClick={() => removeQuery(query)}
                className="hover:bg-black/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={displayData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            onClick={(data) => {
              if (data?.activeLabel) {
                onDateSelect(data.activeLabel);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="date"
              stroke="#666"
              tick={{ fill: '#666', fontSize: 12 }}
              tickFormatter={(date) => format(parseISO(date), 'dd MMM', { locale: fr })}
            />
            <YAxis 
              stroke="#666"
              tick={{ fill: '#666', fontSize: 12 }}
              label={{ 
                value: 'Nombre de requêtes', 
                angle: -90, 
                position: 'insideLeft',
                fill: '#666'
              }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#1a1b1e]/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-800/50">
                      <p className="text-gray-400 text-xs mb-2">
                        {format(parseISO(label), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                      {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-gray-300">{entry.name}:</span>
                          <span className="text-white font-medium">{entry.value} requêtes</span>
                        </div>
                      ))}
                      <p className="text-xs text-gray-500 mt-1">Cliquez pour voir la répartition</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            
            {linesToDisplay.map((query, index) => (
              <Line
                key={query}
                type="monotone"
                dataKey={query}
                name={query}
                stroke={QUERY_COLORS[index % QUERY_COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};