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
import DashboardPage from '@/pages/FreeAccount/DashboardPage';
import FreeLayout from '@/pages/FreeAccount/FreeLayout';
import PortfolioInputPage from '@/pages/FreeAccount/PortfolioInputPage';

function App() {
    const location = useLocation();
    const showHeader = location.pathname !== '/iniciar-sesion' && location.pathname !== '/dashboard';

    return (
        <>
            <Helmet>
                <title>Portfolio Controller - Controla tu cartera de inversión</title>
                <meta
                    name="description"
                    content="Controla tu cartera de inversión desde un solo lugar con métricas claras, gráficos interactivos y una visión completa de tus activos."
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Quicksand:wght@700&display=swap"
                    rel="stylesheet"
                />
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

                        <Route element={<FreeLayout />}>
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/portfolio-input" element={<PortfolioInputPage />} />
                        </Route>
                    </Routes>
                </main>
                <Toaster />
            </div>
        </>
    );
}

export default App;