import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, ChevronDown, LifeBuoy, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '@/lib/i18n';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuArrow,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

const languages = [
    { code: 'ES', name: 'Español' },
    { code: 'EN', name: 'English' },
    { code: 'IT', name: 'Italiano' },
    { code: 'DE', name: 'Deutsch' },
    { code: 'FR', name: 'Français' },
    { code: 'PT', name: 'Português' },
];

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isResourcesMenuOpen, setIsResourcesMenuOpen] = useState(false);
    const { toast } = useToast();
    const { language, setLanguage, t } = useTranslation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleFeatureClick = () => {
        toast({
            title: "🚧 Esta función no está implementada aún",
            description: "¡No te preocupes! Puedes solicitarla en tu próximo prompt 🚀",
        });
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    };
    
    const handleSupportClick = () => {
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    };

    const handleLanguageChange = (code) => {
        setLanguage(code);
    };

    const navItems = [
        { name: 'Por qué PFLR', action: () => handleFeatureClick() },
        { name: t('header.pricing'), action: () => handleFeatureClick() },
    ];

    const resources = [
        {
            name: t('resourcesMenu.support'),
            icon: <LifeBuoy size={16} className="mr-2 text-slate-500" />,
            isLink: true,
            path: '/soporte',
            action: handleSupportClick
        },
        {
            name: t('resourcesMenu.aiChat'),
            icon: <MessageSquare size={16} className="mr-2 text-slate-500" />,
            action: handleFeatureClick
        }
    ];
    
    const ResourcesDropdownContent = ({ inMobileMenu = false }) => (
        <div className={`p-1 ${inMobileMenu ? 'w-full' : 'w-48'}`}>
            {resources.map((item, index) => (
                item.isLink ? (
                    <Link
                        key={index}
                        to={item.path}
                        onClick={() => {
                            item.action();
                            if (isMobileMenuOpen) setIsMobileMenuOpen(false);
                            setIsResourcesMenuOpen(false);
                        }}
                        className="w-full text-left flex items-center p-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                        {item.icon}
                        {item.name}
                    </Link>
                ) : (
                    <button
                        key={index}
                        onClick={() => {
                            item.action();
                            if (isMobileMenuOpen) setIsMobileMenuOpen(false);
                            setIsResourcesMenuOpen(false);
                        }}
                        className="w-full text-left flex items-center p-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                        {item.icon}
                        {item.name}
                    </button>
                )
            ))}
        </div>
    );

    return (
        <header className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-300 ${isScrolled ? 'shadow-sm' : 'border-b border-slate-200/80'}`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                
                <div className="flex items-center">
                    <Link to="/" style={{ fontFamily: "'Quicksand', sans-serif" }} className="text-xl font-bold text-slate-900 tracking-tight mr-8">
                        Portfolio Controller
                    </Link>

                    <nav className="hidden lg:flex items-center gap-1">
                        {navItems.slice(0, 1).map(item => (
                            <button
                                key={item.name}
                                onClick={item.action}
                                className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors h-10 px-3 rounded-md"
                            >
                                {item.name}
                            </button>
                        ))}

                        <DropdownMenu open={isResourcesMenuOpen} onOpenChange={setIsResourcesMenuOpen}>
                            <DropdownMenuTrigger asChild>
                                <button 
                                  onPointerEnter={() => setIsResourcesMenuOpen(true)}
                                  className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors h-10 px-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                                >
                                    {t('header.resources')}
                                    <ChevronDown size={16} className={`transition-transform duration-200 ${isResourcesMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              onPointerLeave={() => setIsResourcesMenuOpen(false)}
                              className="bg-white rounded-xl shadow-lg border border-slate-200 mt-2" 
                              align="start"
                              sideOffset={8}
                            >
                              <DropdownMenuArrow className="fill-white stroke-slate-200" width={16} height={8} />
                              <ResourcesDropdownContent />
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {navItems.slice(1).map(item => (
                            <button
                                key={item.name}
                                onClick={item.action}
                                className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors h-10 px-3 rounded-md"
                            >
                                {item.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="hidden lg:flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <button className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
                                <Globe size={16} />
                                {language}
                                <ChevronDown size={16} className="opacity-70" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-white rounded-lg shadow-lg border border-slate-200 mt-2">
                            {languages.map(lang => (
                                <DropdownMenuItem key={lang.code} onSelect={() => handleLanguageChange(lang.code)} className="px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 cursor-pointer">
                                    {lang.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link to="/iniciar-sesion" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
                        {t('header.signIn')}
                    </Link>

                    <motion.button 
                        onClick={() => handleFeatureClick()}
                        className="h-9 px-4 bg-blue-600 text-white font-semibold text-sm rounded-full flex items-center justify-center shadow-sm hover:bg-blue-700"
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        {t('header.startFree')}
                    </motion.button>
                </div>
                
                <div className="lg:hidden">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-800">
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed inset-0 z-[100] bg-white lg:hidden"
                    >
                        <div className="flex justify-between items-center h-16 px-4 border-b border-slate-200">
                            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={{ fontFamily: "'Quicksand', sans-serif" }} className="text-lg font-bold text-slate-900 tracking-tight">
                                Portfolio Controller
                            </Link>
                            <button onClick={() => setIsMobileMenuOpen(false)}>
                                <X size={24} className="text-slate-800" />
                            </button>
                        </div>

                        <div className="p-4 flex flex-col h-[calc(100%-64px)]">
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={handleFeatureClick}
                                    className="w-full text-left text-base font-medium h-12 px-2 rounded-md hover:bg-slate-100 transition-colors"
                                >
                                    Por qué PFLR
                                </button>

                                <div className="px-2 my-1"><DropdownMenuSeparator /></div>

                                <p className="px-2 text-sm font-semibold text-slate-500 mt-2 mb-1">{t('header.resources')}</p>
                                <div className="px-2">
                                  <ResourcesDropdownContent inMobileMenu={true} />
                                </div>
                                
                                <button
                                    onClick={handleFeatureClick}
                                    className="w-full text-left text-base font-medium h-12 px-2 rounded-md hover:bg-slate-100 transition-colors"
                                >
                                    {t('header.pricing')}
                                </button>
                            </div>

                            <div className="mt-auto flex flex-col gap-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center justify-center gap-2 text-base h-12 w-full font-medium rounded-md hover:bg-slate-100 transition-colors">
                                            <Globe size={18} />
                                            <span>{languages.find(l => l.code === language).name}</span>
                                            <ChevronDown size={16} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="center" className="w-56 bg-white">
                                        {languages.map(lang => (
                                            <DropdownMenuItem key={lang.code} onSelect={() => handleLanguageChange(lang.code)} className="text-base py-2.5 px-4 hover:bg-slate-100 cursor-pointer">
                                                {lang.name}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                
                                <Link to="/iniciar-sesion" onClick={() => setIsMobileMenuOpen(false)} className="h-12 w-full text-base font-medium rounded-md hover:bg-slate-100 transition-colors flex items-center justify-center">
                                    {t('header.signIn')}
                                </Link>

                                <motion.button
                                    onClick={() => handleFeatureClick()}
                                    className="w-full h-11 bg-blue-600 text-white font-bold text-base rounded-full"
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {t('header.startFree')}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header> 
    );
};

export default Header;