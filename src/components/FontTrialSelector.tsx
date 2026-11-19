import React, { useState, useRef, useEffect } from 'react';
import { Type, Check, X } from 'lucide-react';
import {
  FONT_PRESETS,
  FontPresetId,
  DEFAULT_FONT_PRESET_ID,
  getStoredFontPresetId,
  applyFontPreset,
} from '../utils/fontPresets';

interface FontTrialSelectorProps {
  fullWidth?: boolean;
  popoverAlign?: 'left' | 'right';
}

export const FontTrialSelector: React.FC<FontTrialSelectorProps> = ({
  fullWidth = false,
  popoverAlign = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<FontPresetId>(() => getStoredFontPresetId());
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFontSync = (e: Event) => {
      const id = (e as CustomEvent<FontPresetId>).detail;
      if (id) setActiveId(id);
    };
    window.addEventListener('sust_fes_font_changed', handleFontSync);
    return () => window.removeEventListener('sust_fes_font_changed', handleFontSync);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  const currentPreset = FONT_PRESETS.find((p) => p.id === activeId) || FONT_PRESETS[0];

  const handleSelect = (id: FontPresetId) => {
    applyFontPreset(id, true);
    setActiveId(id);
  };

  return (
    <div className={`relative ${fullWidth ? 'block w-full' : 'inline-block'}`} ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`${
          fullWidth ? 'w-full justify-between px-3 py-2 min-h-[40px]' : 'px-2.5 py-1.5'
        } inline-flex items-center gap-1.5 rounded-md border border-[#BBC4A6] dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] hover:border-[#42684D] dark:hover:border-[#BBC4A6]/50 transition-colors cursor-pointer text-xs font-medium`}
        title="Select editorial typography weighting"
        aria-expanded={isOpen}
      >
        <span className="inline-flex items-center gap-1.5 min-w-0">
          <Type className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74] shrink-0" />
          <span className="truncate">Typography: {currentPreset.name}</span>
        </span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Typography Pairing Selector"
          className={`fixed sm:absolute bottom-4 left-4 right-4 sm:bottom-full ${
            popoverAlign === 'left' ? 'sm:left-0 sm:right-auto' : 'sm:left-auto sm:right-0'
          } sm:mb-2 sm:w-72 z-50 bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6] dark:border-[#BBC4A6]/25 rounded-lg shadow-lg p-3.5 space-y-2.5 text-left`}
        >
          <div className="flex items-center justify-between border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 pb-2">
            <div>
              <div className="text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74]" />
                <span>Editorial Typography</span>
              </div>
              <p className="text-[11px] text-[#42684D] dark:text-[#BBC4A6]">
                Fraunces, Manrope, Cormorant Italic &amp; Noto Bengali
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] rounded-md cursor-pointer"
              aria-label="Close typography selector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            {FONT_PRESETS.map((preset) => {
              const selected = preset.id === activeId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelect(preset.id)}
                  className={`w-full text-left p-2.5 rounded-md border transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                    selected
                      ? 'bg-[#EAE7DA] dark:bg-[#11261D] border-[#42684D] dark:border-[#8A9C74]'
                      : 'bg-[#F3F1E8]/60 dark:bg-[#142D22] border-[#BBC4A6]/60 dark:border-[#BBC4A6]/15 hover:border-[#42684D]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-1.5">
                      <span>{preset.name}</span>
                      {preset.id === DEFAULT_FONT_PRESET_ID && (
                        <span className="text-[10px] font-medium text-[#987453] dark:text-[#BBC4A6]">
                          · Default
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#42684D] dark:text-[#BBC4A6] mt-0.5">
                      {preset.headingLabel} + {preset.bodyLabel}
                    </div>
                    <div className="text-[10px] text-[#42684D]/80 dark:text-[#8A9C74] mt-0.5 leading-snug">
                      {preset.tagline}
                    </div>
                  </div>
                  {selected && (
                    <span className="w-5 h-5 rounded-md bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
