import React from 'react';

export const SUST_LOGO_URL =
  '/assets/aistudio/shahjalal-university-of-science-and-technology-logo-png_seeklogo-344200_2ed07cf2.png';

interface SustLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<SustLogoProps['size']>, string> = {
  xs: 'w-6 h-6 rounded-md p-0.5',
  sm: 'w-7 h-7 rounded-lg p-0.5',
  md: 'w-9 h-9 rounded-lg p-0.5',
  lg: 'w-12 h-12 rounded-xl p-1',
  xl: 'w-16 h-16 rounded-2xl p-1.5',
};

export const SustLogo: React.FC<SustLogoProps> = ({ size = 'md', className = '' }) => {
  return (
    <div
      className={`bg-white border border-stone-200 dark:border-stone-700 flex items-center justify-center shadow-xs overflow-hidden shrink-0 ${SIZE_CLASSES[size]} ${className}`}
    >
      <img
        src={SUST_LOGO_URL}
        alt="Shahjalal University of Science and Technology (SUST) Official Logo"
        className="w-full h-full object-contain"
        decoding="async"
      />
    </div>
  );
};
