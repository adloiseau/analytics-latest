import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Top } from './pages/Top';
import { Keywords } from './pages/Keywords';
import { TrafficBySource } from './pages/TrafficBySource';
import { AuthCallback } from './pages/AuthCallback';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/top" element={<Top />} />
      <Route path="/keywords" element={<Keywords />} />
      <Route path="/traffic-sources" element={<TrafficBySource />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  );
}

export default App;