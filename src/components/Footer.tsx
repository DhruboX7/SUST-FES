import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SustLogo } from './SustLogo';
import { FontTrialSelector } from './FontTrialSelector';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-16 border-t border-[#42684D]/50 bg-[#19382B] text-[#BBC4A6] text-xs py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-[#42684D]/40">
          {/* Brand & Department */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <SustLogo size="sm" className="border-[#BBC4A6]/40" />
            <div>
              <div className="font-editorial text-sm font-semibold text-[#F3F1E8]">
                {t('deptTitle')}
              </div>
              <div className="text-[11px] text-[#BBC4A6] mt-0.5">
                {t('uniTitle')} · {t('sustSylhet')}
              </div>
            </div>
          </div>

          {/* Editorial Motto */}
          <div className="text-center md:text-right">
            <div className="font-scientific text-base text-[#F3F1E8] tracking-wide">
              {t('editorialMotto')}
            </div>
            <div className="text-[11px] text-[#8A9C74] mt-0.5">
              {t('academicArchiveFooter')}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Navigation & Admin Links */}
          <div className="flex items-center justify-center gap-4 sm:gap-5 text-[#BBC4A6] flex-wrap">
            <Link to="/" className="hover:text-[#F3F1E8] transition-colors">
              {t('catalog')}
            </Link>
            <Link to="/pyq" className="hover:text-[#F3F1E8] transition-colors">
              {t('pyq')}
            </Link>
            <Link to="/syllabus" className="hover:text-[#F3F1E8] transition-colors">
              {t('syllabus')}
            </Link>
            <Link to="/species" className="hover:text-[#F3F1E8] transition-colors">
              {t('species')}
            </Link>
            <Link to="/gallery" className="hover:text-[#F3F1E8] transition-colors">
              {t('gallery')}
            </Link>
            <Link
              to="/manage"
              className="text-[#F3F1E8] font-medium hover:text-[#BBC4A6] transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#987453]" />
              <span>{t('adminEntry')}</span>
            </Link>
          </div>

          {/* Font Trial */}
          <div className="flex items-center gap-3 justify-center">
            <FontTrialSelector />
          </div>
        </div>
      </div>
    </footer>
  );
};
