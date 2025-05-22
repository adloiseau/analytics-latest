import React from 'react';
import { Layout } from '../components/Layout';
import { SiteSelector } from '../components/SiteSelector';
import { KeywordsTable } from '../components/keywords/KeywordsTable';
import { KeywordsChart } from '../components/keywords/KeywordsChart';
import { SelectedItemProvider } from '../contexts/SelectedItemContext';

export const Keywords: React.FC = () => {
  return (
    <Layout>
      <SelectedItemProvider>
        <div className="space-y-4">
          <div className="w-full max-w-[300px]">
            <SiteSelector />
          </div>
          <KeywordsChart />
          <KeywordsTable />
        </div>
      </SelectedItemProvider>
    </Layout>
  );
};