import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Layout } from '../components/Layout';
import { DomainFilters } from '../components/filters/DomainFilters';
import { domainsService } from '../services/supabase/domains';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatMetric } from '../utils/metrics';
import { ArrowUpDown } from 'lucide-react';

type SortField = 'as_metric' | 'to_metric' | 'bl_metric' | 'rd_metric' | 'kd_metric' | 'tf_root_metric' | 'cf_root_metric';
type SortDirection = 'asc' | 'desc';

export const ExpiredDomains = () => {
  const [hoveredDomain, setHoveredDomain] = useState<number | null>(null);
  const [domainSearch, setDomainSearch] = useState('');
  const [tfRange, setTfRange] = useState({ min: '', max: '' });
  const [cfRange, setCfRange] = useState({ min: '', max: '' });
  const [ttfSearch, setTtfSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('tf_root_metric');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const { data: domains, isLoading, error } = useQuery(
    'expiredDomains',
    () => domainsService.getExpiredDomains(),
    {
      refetchInterval: 5 * 60 * 1000,
    }
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedDomains = React.useMemo(() => {
    if (!domains) return [];

    let filtered = domains.filter(domain => {
      if (domainSearch && !domain.domain_url.toLowerCase().includes(domainSearch.toLowerCase())) {
        return false;
      }
      if (tfRange.min && domain.tf_root_metric < parseInt(tfRange.min)) {
        return false;
      }
      if (tfRange.max && domain.tf_root_metric > parseInt(tfRange.max)) {
        return false;
      }
      if (cfRange.min && domain.cf_root_metric < parseInt(cfRange.min)) {
        return false;
      }
      if (cfRange.max && domain.cf_root_metric > parseInt(cfRange.max)) {
        return false;
      }
      if (ttfSearch && !domain.ttf_root_metric.toString().toLowerCase().includes(ttfSearch.toLowerCase())) {
        return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      return (a[sortField] - b[sortField]) * multiplier;
    });
  }, [domains, domainSearch, tfRange, cfRange, ttfSearch, sortField, sortDirection]);

  const SortableHeader: React.FC<{ field: SortField; label: string }> = ({ field, label }) => (
    <th 
      className="pb-4 px-8 text-right cursor-pointer hover:text-white transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center justify-end gap-2">
        {label}
        <ArrowUpDown className={`w-4 h-4 ${sortField === field ? 'text-blue-400' : ''}`} />
      </div>
    </th>
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-[#25262b] rounded-lg" />
          ))}
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">Erreur lors du chargement des domaines expirés</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Domaines Expirés</h1>
        
        <DomainFilters
          domainSearch={domainSearch}
          setDomainSearch={setDomainSearch}
          tfRange={tfRange}
          setTfRange={setTfRange}
          cfRange={cfRange}
          setCfRange={setCfRange}
          ttfSearch={ttfSearch}
          setTtfSearch={setTtfSearch}
        />
        
        <div className="bg-[#25262b]/90 backdrop-blur-sm rounded-lg p-6 border border-gray-800/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-800/50">
                  <th className="pb-4 pr-8">Domaine</th>
                  <SortableHeader field="as_metric" label="AS" />
                  <SortableHeader field="to_metric" label="TO" />
                  <SortableHeader field="bl_metric" label="BL" />
                  <SortableHeader field="rd_metric" label="RD" />
                  <SortableHeader field="kd_metric" label="KD" />
                  <SortableHeader field="tf_root_metric" label="TF" />
                  <SortableHeader field="cf_root_metric" label="CF" />
                  <th className="pb-4 pl-8">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedDomains.map((domain) => (
                  <tr 
                    key={domain.id} 
                    className="border-b border-gray-800/20 hover:bg-[#1a1b1e]/50 transition-colors relative"
                    onMouseEnter={() => setHoveredDomain(domain.id)}
                    onMouseLeave={() => setHoveredDomain(null)}
                  >
                    <td className="py-4 pr-8 text-gray-300">{domain.domain_url}</td>
                    <td className="py-4 px-8 text-right text-gray-300">{domain.as_metric}</td>
                    <td className="py-4 px-8 text-right text-gray-300">{formatMetric(domain.to_metric)}</td>
                    <td className="py-4 px-8 text-right text-gray-300">{formatMetric(domain.bl_metric)}</td>
                    <td className="py-4 px-8 text-right text-gray-300">{formatMetric(domain.rd_metric)}</td>
                    <td className="py-4 px-8 text-right text-gray-300">{formatMetric(domain.kd_metric)}</td>
                    <td className="py-4 px-8 text-right text-gray-300">
                      {domain.tf_root_metric} ({domain.tf_subdomain_metric})
                    </td>
                    <td className="py-4 px-8 text-right text-gray-300">
                      {domain.cf_root_metric} ({domain.cf_subdomain_metric})
                    </td>
                    <td className="py-4 pl-8 text-gray-300">
                      {format(parseISO(domain.created_at), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    
                    {hoveredDomain === domain.id && (
                      <div className="absolute right-0 -top-12 bg-[#1a1b1e] text-gray-300 px-4 py-2 rounded-lg shadow-xl border border-gray-700/50 z-10 whitespace-nowrap">
                        Topical Trust Flow: {domain.ttf_root_metric} ({domain.ttf_subdomain_metric})
                      </div>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};