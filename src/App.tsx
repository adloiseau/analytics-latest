import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Dashboard } from './pages/Dashboard';
import { TopPages } from './pages/TopPages';
import { TopQueries } from './pages/TopQueries';
import { TrafficBySource } from './pages/TrafficBySource';
import { Keywords } from './pages/Keywords';
import { AuthCallback } from './pages/AuthCallback';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/top-pages" element={<TopPages />} />
        <Route path="/top-queries" element={<TopQueries />} />
        <Route path="/traffic-sources" element={<TrafficBySource />} />
        <Route path="/keywords" element={<Keywords />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;