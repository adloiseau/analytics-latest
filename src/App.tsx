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
import { Details } from './pages/Details';
import { Top } from './pages/Top';
import { Keywords } from './pages/Keywords';
import { TrafficBySource } from './pages/TrafficBySource';
import { ExpiredDomains } from './pages/ExpiredDomains';
import { LinkSelling } from './pages/LinkSelling';
import { AuthCallback } from './pages/AuthCallback';

function App() {
  return (
    <FirebaseAuthProvider>
      <AuthProvider>
        <FilterProvider>
          <SiteProvider>
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
                  path="/details"
                  element={
                    <PrivateRoute>
                      <Details />
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
                <Route
                  path="/expired-domains"
                  element={
                    <PrivateRoute>
                      <ExpiredDomains />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/link-selling"
                  element={
                    <PrivateRoute>
                      <LinkSelling />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </SelectedItemProvider>
          </SiteProvider>
        </FilterProvider>
      </AuthProvider>
    </FirebaseAuthProvider>
  );
}

export default App;