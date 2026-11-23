import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {
  FileText,
  Compass,
  Bell,
  Trees,
  Calculator,
  PlusCircle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export const QuickNavHub: React.FC = () => {
  const { t } = useLanguage();

  const destinations = [
    {
      to: '/pyq',
      label: t('pyq'),
      desc: t('quickNavPyqDesc'),
      icon: FileText,
      accentBg: 'bg-[#987453]/15 dark:bg-[#987453]/25',
      accentText: 'text-[#987453] dark:text-[#FDE68A]',
    },
    {
      to: '/syllabus',
      label: t('syllabus'),
      desc: t('quickNavSyllabusDesc'),
      icon: Compass,
      accentBg: 'bg-[#42684D]/15 dark:bg-[#42684D]/35',
      accentText: 'text-[#19382B] dark:text-[#BBC4A6]',
    },
    {
      to: '/notices',
      label: t('notices'),
      desc: t('quickNavNoticesDesc'),
      icon: Bell,
      accentBg: 'bg-[#FEF3C7] dark:bg-[#78350F]/55',
      accentText: 'text-[#92400E] dark:text-[#FDE68A]',
    },
    {
      to: '/species',
      label: t('species'),
      desc: t('quickNavSpeciesDesc'),
      icon: Trees,
      accentBg: 'bg-[#D1FAE5]/70 dark:bg-[#064E3B]/55',
      accentText: 'text-[#065F46] dark:text-[#A7F3D0]',
    },
    {
      to: '/tools/cgpa',
      label: t('cgpa'),
      desc: t('quickNavCgpaDesc'),
      icon: Calculator,
      accentBg: 'bg-[#EAE7DA] dark:bg-[#142D22]',
      accentText: 'text-[#42684D] dark:text-[#BBC4A6]',
    },
    {
      to: '/contribute',
      label: t('contribute'),
      desc: t('quickNavContributeDesc'),
      icon: PlusCircle,
      accentBg: 'bg-[#19382B] dark:bg-[#42684D]',
      accentText: 'text-[#F3F1E8]',
    },
  ];

  return (
    <section
      aria-label={t('quickNavHeading')}
      className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-xl sm:rounded-lg border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 p-3.5 sm:p-5 space-y-3 shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-editorial text-sm sm:text-base font-semibold text-[#19382B] dark:text-[#F3F1E8]">
            {t('quickNavHeading')}
          </h2>
          <p className="text-[11px] sm:text-xs text-[#42684D] dark:text-[#BBC4A6]">
            {t('quickNavSubheading')}
          </p>
        </div>

        <Link
          to="/manage"
          className="inline-flex items-center gap-1.5 px-3 min-h-[38px] rounded-md text-xs font-semibold bg-[#EAE7DA] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 hover:border-[#42684D] transition-colors active:scale-95"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74]" />
          <span>{t('manage')}</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {destinations.map((dest) => {
          const Icon = dest.icon;
          return (
            <Link
              key={dest.to}
              to={dest.to}
              className="group flex items-center justify-between gap-2 p-2.5 sm:p-3 min-h-[56px] rounded-xl sm:rounded-lg bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 hover:border-[#42684D] dark:hover:border-[#8A9C74] hover:bg-[#EAE7DA]/70 dark:hover:bg-[#19382B] transition-colors active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#42684D]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${dest.accentBg} ${dest.accentText}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] truncate leading-tight">
                    {dest.label}
                  </div>
                  <div className="text-[10px] text-[#42684D] dark:text-[#BBC4A6] truncate mt-0.5 leading-tight">
                    {dest.desc}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#8A9C74] group-hover:text-[#19382B] dark:group-hover:text-[#F3F1E8] shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>
    </section>
  );
};
