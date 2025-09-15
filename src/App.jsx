import React from 'react';
import { Helmet } from 'react-helmet';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import { Toaster } from '@/components/ui/toaster';
import UsersPage from '@/pages/UsersPage';
import CompaniesPage from '@/pages/CompaniesPage';
import CreatorsPage from '@/pages/CreatorsPage';
import AuthPage from '@/pages/AuthPage';
import SupportPage from '@/pages/SupportPage';

function App() {
    const location = useLocation();
    const showHeader = location.pathname !== '/iniciar-sesion';

    return (
        <>
            <Helmet>
                <title>Meditation.AI - Tu Compañero de Meditación con IA</title>
                <meta name="description" content="Descubre la meditación personalizada con inteligencia artificial. Meditation.AI te ayuda a encontrar la paz interior con sesiones adaptadas a tus necesidades." />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Quicksand:wght@700&display=swap" rel="stylesheet" />
            </Helmet>
            
            <div className="bg-white text-slate-900">
                {showHeader && <Header />}
                <main>
                    <Routes>
                        <Route path="/" element={<Hero />} />
                        <Route path="/iniciar-sesion" element={<AuthPage />} />
                        <Route path="/usuarios" element={<UsersPage />} />
                        <Route path="/empresas" element={<CompaniesPage />} />
                        <Route path="/creadores" element={<CreatorsPage />} />
                        <Route path="/soporte" element={<SupportPage />} />
                    </Routes>
                </main>
                <Toaster />
            </div>
        </>
    );
}

export default App;