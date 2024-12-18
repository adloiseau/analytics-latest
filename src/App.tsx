import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext';
import { AuthProvider } from './contexts/AuthContext';
import { SiteProvider } from './contexts/SiteContext';
import { FilterProvider } from './contexts/FilterContext';
import { SelectedItemProvider } from './contexts/SelectedItemContext';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { LoginForm } from './components/auth/LoginForm';
import { Dashboard } from './pages/Dashboard';
import { Top } from './pages/Top';
import { Keywords } from './pages/Keywords';
import { TrafficBySource } from './pages/TrafficBySource';
import { AuthCallback } from './pages/AuthCallback';

function App() {
  return (
    <FirebaseAuthProvider>
      <AuthProvider>
        <SiteProvider>
          <FilterProvider>
            <SelectedItemProvider>
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/top"
                  element={
                    <PrivateRoute>
                      <Top />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/keywords"
                  element={
                    <PrivateRoute>
                      <Keywords />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/traffic-sources"
                  element={
                    <PrivateRoute>
                      <TrafficBySource />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </SelectedItemProvider>
          </FilterProvider>
        </SiteProvider>
      </AuthProvider>
    </FirebaseAuthProvider>
  );
}

export default App;