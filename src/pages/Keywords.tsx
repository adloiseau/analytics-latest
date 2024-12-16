import React from 'react';
import { Layout } from '../components/Layout';
import { SiteSelector } from '../components/SiteSelector';
import { KeywordsTable } from '../components/keywords/KeywordsTable';

export const Keywords = () => {
  return (
    <Layout>
      <div className="space-y-4">
        <div className="w-full max-w-xs">
          <SiteSelector />
        </div>
        <KeywordsTable />
      </div>
    </Layout>
  );
};