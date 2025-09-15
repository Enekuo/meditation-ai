import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

const Hero = () => {
  const { t } = useTranslation();

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
  };
  const item = {
    hidden: { y: 14, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 16 } }
  };

  return (
    <section className="bg-white">
      <div className="relative w-full overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(225,239,255,0.22),rgba(255,255,255,0))]">
        <div className="mx-auto max-w-6xl px-5 md:px-8 py-12 md:py-16">
          <motion.div
            className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12 min-h-[62vh]"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            <div className="text-left">
              <motion.h1
                className="text-slate-900 tracking-tight font-extrabold leading-[1.06] text-4xl md:text-5xl lg:text-[44px] max-w-xl"
                variants={item}
              >
                {t('hero.title')}
              </motion.h1>

              <motion.p
                className="mt-4 text-slate-600 text-base md:text-lg leading-relaxed max-w-md"
                variants={item}
              >
                {t('hero.subtitle')}: {t('hero.description')}
              </motion.p>

              <motion.div
                className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
                variants={item}
              >
                <Button
                  size="lg"
                  className="relative inline-flex h-11 md:h-12 items-center rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm md:text-base pl-10 pr-6 md:pr-7 shadow-lg shadow-blue-500/15 hover:shadow-xl transition-all"
                >
                  <span className="absolute left-3 text-red-500 text-lg">🔥</span>
                  <span className="flex-grow text-center">{t('hero.button')}</span>
                </Button>
              </motion.div>

              <motion.div
                className="flex items-center gap-5 mt-3"
                variants={item}
              >
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-[18px] w-[18px] text-yellow-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-600">4.5/5.0</span> · {t('hero.compliance')}
                </p>
              </motion.div>
            </div>

            <motion.div className="relative" variants={item}>
              <div className="relative mx-auto lg:mx-0 max-w-[480px] rounded-2xl bg-white p-2.5 md:p-3.5 shadow-xl ring-1 ring-slate-200/60 aspect-[16/10] overflow-hidden">
                <img className="h-full w-full object-cover rounded-xl" alt="Ilustración abstracta de IA y meditación con formas 3D y ondas de sonido" src="https://horizons-cdn.hostinger.com/b165068b-ef99-4afb-83a7-dadb10c1561e/ab4b8131a7a409d215bee50933bcba89.png" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;