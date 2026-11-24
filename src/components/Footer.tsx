import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SustLogo } from './SustLogo';
import { FontTrialSelector } from './FontTrialSelector';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-16 border-t border-[#42684D]/50 bg-[#19382B] text-[#BBC4A6] text-xs pt-10 pb-24 lg:pb-10 transition-colors">
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
          <div className="flex items-center justify-center gap-2 sm:gap-4 text-[#BBC4A6] flex-wrap">
            <Link to="/" className="min-h-[38px] px-2 inline-flex items-center hover:text-[#F3F1E8] transition-colors">
              {t('catalog')}
            </Link>
            <Link to="/pyq" className="min-h-[38px] px-2 inline-flex items-center hover:text-[#F3F1E8] transition-colors">
              {t('pyq')}
            </Link>
            <Link to="/notices" className="min-h-[38px] px-2 inline-flex items-center hover:text-[#F3F1E8] transition-colors">
              {t('notices')}
            </Link>
            <Link to="/species" className="min-h-[38px] px-2 inline-flex items-center hover:text-[#F3F1E8] transition-colors">
              {t('species')}
            </Link>
            <Link to="/tools/coverpage" className="min-h-[38px] px-2 inline-flex items-center hover:text-[#F3F1E8] transition-colors">
              {t('coverpage')}
            </Link>
            <Link to="/tools/batch-fund" className="min-h-[38px] px-2 inline-flex items-center hover:text-[#F3F1E8] transition-colors">
              {t('batchFund')}
            </Link>
            <Link to="/contribute" className="min-h-[38px] px-2 inline-flex items-center hover:text-[#F3F1E8] transition-colors">
              {t('contribute')}
            </Link>
            <Link
              to="/manage"
              className="min-h-[38px] px-2 text-[#F3F1E8] font-medium hover:text-[#BBC4A6] transition-colors inline-flex items-center gap-1"
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
