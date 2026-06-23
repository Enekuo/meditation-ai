import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import LanguageProvider from '@/contexts/LanguageProvider';
import { SettingsProvider } from '@/contexts/SettingsProvider';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
