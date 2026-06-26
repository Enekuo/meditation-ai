import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function AuthPage() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError('No se pudo iniciar sesión. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <Helmet>
        <title>Iniciar sesión — Portfolio Controller</title>
        <meta name="description" content="Accede a tu cuenta de Portfolio Controller o continúa como invitado." />
      </Helmet>

      <div className="min-h-screen w-full flex">
        {/* ── Lado izquierdo: formulario ── */}
        <div className="flex-1 flex flex-col min-h-screen bg-white">
          {/* Header */}
          <div className="px-8 pt-8 pb-0">
            <Link
              to="/"
              className="inline-flex items-center gap-2"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              <img
                src="/logo-icon.png"
                alt="Portfolio Controller logo"
                className="w-10 h-10 object-contain"
              />
              <span className="text-[17px] font-bold text-slate-900 tracking-tight">
                Portfolio Controller
              </span>
            </Link>
          </div>

          {/* Contenido central */}
          <div className="flex-1 flex items-center justify-center px-8 py-12">
            <div className="w-full max-w-[360px]">
              <h1 className="text-[28px] font-bold text-slate-900 leading-tight mb-1">
                Bienvenido de nuevo
              </h1>
              <p className="text-[14px] text-slate-500 mb-8">
                Toma el control de tu cartera, en cualquier divisa.
              </p>

              {/* Botón Google */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={isLoading}
                className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-[14px] font-semibold text-slate-800 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <GoogleIcon />
                {isLoading ? 'Conectando…' : 'Continuar con Google'}
              </button>

              {error && (
                <p className="mt-3 text-[13px] text-red-500 text-center">{error}</p>
              )}

              {/* Separador */}
              <div className="relative flex items-center my-6">
                <div className="flex-1 border-t border-slate-200" />
                <span className="mx-4 text-[13px] text-slate-400 font-medium">o</span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              {/* Continuar como invitado */}
              <button
                type="button"
                onClick={handleGuest}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              >
                Continuar como invitado
              </button>

              <p className="mt-3 text-center text-[12px] text-slate-400">
                Los datos de invitado se guardan solo en este dispositivo.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 pb-6 flex items-center justify-center gap-4">
            <Link
              to="#"
              className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              Términos de uso
            </Link>
            <span className="text-slate-200">·</span>
            <Link
              to="#"
              className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              Política de privacidad
            </Link>
          </div>
        </div>

        {/* ── Lado derecho: imagen + título ── */}
        <div
          className="hidden lg:flex w-[50%] shrink-0 flex-col items-center justify-center gap-8 px-10 py-12 relative overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse 110% 90% at 50% 55%, #112550 0%, #0a1535 38%, #060c1a 100%)',
          }}
        >
          <h2
            className="text-white text-center leading-tight font-bold relative z-10"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(1.5rem, 2.4vw, 2.25rem)',
              letterSpacing: '-0.02em',
              maxWidth: '480px',
              textShadow: '0 2px 32px rgba(30,80,200,0.3)',
            }}
          >
            Control total sobre tu<br />cartera de inversión
          </h2>

          {/* Contenedor imagen con glow detrás */}
          <div className="relative z-10 w-full max-w-[600px] flex items-center justify-center">
            {/* Glow blob detrás del mockup */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 80% 65% at 50% 52%, rgba(56,109,255,0.18) 0%, rgba(100,50,200,0.06) 60%, transparent 100%)',
                filter: 'blur(36px)',
              }}
            />
            <img
              src="/login-cover.png"
              alt="Dashboard de Portfolio Controller"
              className="w-full object-contain relative"
              style={{ filter: 'drop-shadow(0 8px 48px rgba(56,109,255,0.25)) drop-shadow(0 2px 12px rgba(0,0,0,0.7))' }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
