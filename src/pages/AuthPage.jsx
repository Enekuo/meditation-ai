import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Key, Eye, EyeOff, Globe, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const languages = [{
  code: 'ES',
  name: 'Español'
}, {
  code: 'EN',
  name: 'English'
}, {
  code: 'IT',
  name: 'Italiano'
}, {
  code: 'DE',
  name: 'Deutsch'
}, {
  code: 'FR',
  name: 'Français'
}, {
  code: 'PT',
  name: 'Português'
}];

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const {
    toast
  } = useToast();
  const {
    t,
    language,
    setLanguage
  } = useTranslation();

  const handleFeatureClick = () => {
    toast({
      title: "🚧 Función no implementada",
      description: "Esta funcionalidad estará disponible pronto. ¡Gracias por tu paciencia!"
    });
  };

  const validateForm = () => {
    let isValid = true;
    if (!email) {
      setEmailError(t('authPage.emailRequiredError'));
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t('authPage.emailInvalidError'));
      isValid = false;
    } else {
      setEmailError('');
    }
    if (!password) {
      setPasswordError(t('authPage.passwordRequiredError'));
      isValid = false;
    } else {
      setPasswordError('');
    }
    return isValid;
  };

  const handleSignIn = e => {
    e.preventDefault();
    if (validateForm()) {
      handleFeatureClick();
    }
  };

  const socialButtons = [{
    provider: 'Google',
    icon: 'https://www.svgrepo.com/show/355037/google.svg',
    textKey: 'authPage.continueWithGoogle'
  }, {
    provider: 'Microsoft',
    icon: 'https://www.svgrepo.com/show/355038/microsoft.svg',
    textKey: 'authPage.continueWithMicrosoft'
  }, {
    provider: 'Apple',
    icon: 'https://www.svgrepo.com/show/355030/apple.svg',
    textKey: 'authPage.continueWithApple'
  }];

  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07
      }
    }
  };

  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return <>
      <Helmet>
        <title>{t('authPage.pageTitle')} - Meditation.AI</title>
        <meta name="description" content={t('authPage.pageDescription')} />
      </Helmet>
      <div className="min-h-screen w-full bg-white font-sans">
        <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 sm:px-12 z-20">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
                <Link to="/" className="inline-block">
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight" style={{
              fontFamily: "'Quicksand', sans-serif"
            }}>Meditation.AI</h1>
                </Link>
            </div>
            <div className="flex-1 flex justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button variant="ghost" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80">
                            <Globe size={16} />
                            {language}
                            <ChevronDown size={16} className="opacity-70" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-white rounded-xl shadow-lg border border-slate-200 mt-2">
                        {languages.map(lang => <DropdownMenuItem key={lang.code} onSelect={() => setLanguage(lang.code)} className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer focus:bg-slate-100">
                                {lang.name}
                            </DropdownMenuItem>)}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

        <div className="w-full lg:grid lg:grid-cols-2 min-h-screen">
          <div className="flex items-center justify-center p-6 sm:p-12 bg-white relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white to-[#F6FAFF] -z-0"></div>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-sm z-10 mt-16 lg:mt-0">
              <motion.div variants={itemVariants} className="space-y-4">
                {socialButtons.map(btn => <Button key={btn.provider} variant="outline" className="w-full h-12 bg-white border-slate-200/90 hover:bg-slate-50 text-slate-800 font-medium rounded-[12px] shadow-sm hover:shadow-md transition-shadow duration-200" onClick={handleFeatureClick}>
                    <img src={btn.icon} alt={`${btn.provider} logo`} className="h-5 w-5 mr-3" />
                    {t(btn.textKey)}
                  </Button>)}
                <Button variant="outline" className="w-full h-12 bg-white border-slate-200/90 hover:bg-slate-50 text-slate-800 font-medium rounded-[12px] shadow-sm hover:shadow-md transition-shadow duration-200" onClick={handleFeatureClick}>
                  <Key size={18} className="text-slate-500 mr-3" />
                  {t('authPage.continueWithSSO')}
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className="relative flex items-center py-6">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-sm font-medium">{t('authPage.or')}</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </motion.div>
              
              <motion.form variants={containerVariants} onSubmit={handleSignIn} className="space-y-4">
                <motion.div variants={itemVariants}>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input type="email" placeholder={t('authPage.emailPlaceholder')} className={`pl-12 h-12 text-base rounded-[12px] ${emailError ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-300'}`} value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  {emailError && <p className="text-red-600 text-sm mt-1 px-1">{emailError}</p>}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input type={showPassword ? 'text' : 'password'} placeholder={t('authPage.passwordPlaceholder')} className={`pl-12 pr-12 h-12 text-base rounded-[12px] ${passwordError ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-300'}`} value={password} onChange={e => setPassword(e.target.value)} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </Button>
                  </div>
                  {passwordError && <p className="text-red-600 text-sm mt-1 px-1">{passwordError}</p>}
                </motion.div>

                <motion.div variants={itemVariants} className="flex justify-end pt-1">
                  <Link to="#" onClick={handleFeatureClick} className="text-sm font-medium text-blue-600 hover:underline">
                    {t('authPage.forgotPassword')}
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="pt-2">
                  <Button type="submit" className="w-full h-12 text-base font-semibold bg-[#1F4ED4] hover:bg-[#1a42b1] text-white rounded-[12px] shadow-sm transition-colors">
                    {t('authPage.signInButton')}
                  </Button>
                </motion.div>
              </motion.form>

              <motion.p variants={itemVariants} className="mt-8 text-center text-xs text-slate-500 max-w-xs mx-auto">
                {t('authPage.legalText.prefix')}{' '}
                <Link to="#" onClick={handleFeatureClick} className="underline hover:text-slate-700">{t('authPage.legalText.terms')}</Link>{' '}
                {t('authPage.legalText.and')}{' '}
                <Link to="#" onClick={handleFeatureClick} className="underline hover:text-slate-700">{t('authPage.legalText.privacy')}</Link>.
              </motion.p>
            </motion.div>
          </div>
          <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-[#F6FAFF] to-blue-100 p-10 relative overflow-hidden">
            <motion.div initial={{
            scale: 0.95,
            opacity: 0
          }} animate={{
            scale: 1,
            opacity: 1
          }} transition={{
            duration: 0.8,
            delay: 0.2,
            ease: "easeOut"
          }} className="w-full max-w-xs max-h-[300px] flex items-center justify-center">
               <img className="w-full h-full object-cover rounded-3xl shadow-2xl shadow-blue-500/10" alt="Monje meditando frente a un paisaje sereno con templos y cascadas al atardecer" src="https://horizons-cdn.hostinger.com/b165068b-ef99-4afb-83a7-dadb10c1561e/budista-hHjjE.jpg" />
            </motion.div>
          </div>
        </div>
      </div>
    </>;
};
export default AuthPage;