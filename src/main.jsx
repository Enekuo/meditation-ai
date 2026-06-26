import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import { AuthProvider } from '@/contexts/AuthProvider';
import { PortfolioDataProvider } from '@/contexts/PortfolioDataProvider';
import { SettingsProvider } from '@/contexts/SettingsProvider';
import LanguageProvider from '@/contexts/LanguageProvider';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PortfolioDataProvider>
          <SettingsProvider>
            <LanguageProvider>
              <App />
            </LanguageProvider>
          </SettingsProvider>
        </PortfolioDataProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
