import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import { SiteProvider } from './contexts/SiteContext';
import { FilterProvider } from './contexts/FilterContext';
import { SelectedItemProvider } from './contexts/SelectedItemContext';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SiteProvider>
            <FilterProvider>
              <SelectedItemProvider>
                <App />
              </SelectedItemProvider>
            </FilterProvider>
          </SiteProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);