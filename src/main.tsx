import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SiteProvider } from './contexts/SiteContext';
import { FilterProvider } from './contexts/FilterContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SiteProvider>
          <FilterProvider>
            <App />
          </FilterProvider>
        </SiteProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);