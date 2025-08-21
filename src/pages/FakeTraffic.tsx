import React from 'react';
import { FakeTrafficFiltersComponent } from '../components/fakeTraffic/FakeTrafficFilters';
import { QueryTrafficChart } from '../components/fakeTraffic/QueryTrafficChart';
import { GSCEstimationSection } from '../components/fakeTraffic/GSCEstimationSection';
import { TopReferersSection } from '../components/fakeTraffic/TopReferersSection';
import { FakeTrafficStats } from '../components/fakeTraffic/FakeTrafficStats';
import { useFakeTrafficStats } from '../hooks/useFakeTraffic';
import { FakeTrafficFilters as FakeTrafficFiltersType } from '../types/fakeTraffic';

export const FakeTraffic: React.FC = () => {
  const [filters, setFilters] = React.useState<FakeTrafficFiltersType>({
    query: '',
    domain: '',
    startDate: '',
    endDate: ''
  });

  const handleResetFilters = () => {
    setFilters({
      query: '',
      domain: '',
      startDate: '',
      endDate: ''
    });
  };

  const { data: stats, isLoading, error } = useFakeTrafficStats(filters);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Fake Traffic Analytics
        </h1>
      </div>

      <FakeTrafficFiltersComponent 
        filters={filters} 
        onFiltersChange={setFilters}
        onResetFilters={handleResetFilters}
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">Erreur lors du chargement des données: {error.message}</p>
        </div>
      )}

      <FakeTrafficStats stats={stats} isLoading={isLoading} />

      <QueryTrafficChart filters={filters} onDateSelect={() => {}} />

      <GSCEstimationSection filters={filters} />

      <TopReferersSection filters={filters} />
    </div>
  );
};