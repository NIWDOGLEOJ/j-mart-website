import React from 'react';

export interface JMartLogoProps {
  variant?: 'full' | 'monogram' | 'receipt' | 'badge' | 'image';
  className?: string;
  size?: number | string;
  showSubtitle?: boolean;
  subtitle?: string;
  useTransparent?: boolean;
}

export const JMartLogo: React.FC<JMartLogoProps> = ({
  variant = 'full',
  className = '',
  size,
  showSubtitle = true,
  subtitle = 'SUPERMARKET & RETAIL',
  useTransparent = true,
}) => {
  if (variant === 'image') {
    return (
      <img
        src={useTransparent ? '/logo-transparent.png' : '/logo-mark.png'}
        alt="J MART Logo"
        className={`object-contain select-none ${className}`}
        style={size ? { width: size, height: size } : {}}
      />
    );
  }

  if (variant === 'monogram') {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`select-none ${className}`}
        style={size ? { width: size, height: size } : {}}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="jmMonoBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="jmMonoOrange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>

        {/* Cart Basket Base */}
        <path
          d="M 18 68 L 78 68 L 68 34 L 28 34 Z"
          fill="none"
          stroke="url(#jmMonoOrange)"
          strokeWidth="7"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Stylized 'J' Stem & Swoop */}
        <path
          d="M 58 12 L 58 62 C 58 76 44 80 30 74"
          fill="none"
          stroke="url(#jmMonoBlue)"
          strokeWidth="9"
          strokeLinecap="round"
        />

        {/* Awning Canopy */}
        <path
          d="M 24 20 Q 34 10 44 20 Q 54 10 64 20"
          fill="none"
          stroke="url(#jmMonoOrange)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Trolley Wheels */}
        <circle cx="32" cy="85" r="7.5" fill="url(#jmMonoBlue)" />
        <circle cx="66" cy="85" r="7.5" fill="url(#jmMonoBlue)" />
        <circle cx="32" cy="85" r="3" fill="#FFFFFF" />
        <circle cx="66" cy="85" r="3" fill="#FFFFFF" />
      </svg>
    );
  }

  if (variant === 'receipt') {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        <svg viewBox="0 0 100 100" className="w-10 h-10 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M 18 68 L 78 68 L 68 34 L 28 34 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M 58 12 L 58 62 C 58 76 44 80 30 74"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 24 20 Q 34 10 44 20 Q 54 10 64 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <circle cx="32" cy="85" r="8" fill="currentColor" />
          <circle cx="66" cy="85" r="8" fill="currentColor" />
        </svg>
        <div className="flex flex-col text-left leading-tight">
          <span className="font-black text-xl tracking-tight text-current">J MART</span>
          {showSubtitle && (
            <span className="font-mono text-[9px] font-bold tracking-[0.14em] uppercase opacity-75 mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`relative inline-flex items-center justify-center p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md ${className}`}>
        <JMartLogo variant="monogram" className="w-7 h-7 text-white" />
      </div>
    );
  }

  // Default: 'full'
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center p-1.5 transition-transform duration-200 hover:scale-105 shadow-xs">
        <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M 18 68 L 78 68 L 68 34 L 28 34 Z"
            fill="none"
            stroke="#FDBA74"
            strokeWidth="7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M 58 12 L 58 62 C 58 76 44 80 30 74"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M 24 20 Q 34 10 44 20 Q 54 10 64 20"
            fill="none"
            stroke="#FDBA74"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="32" cy="85" r="7.5" fill="#FFFFFF" />
          <circle cx="66" cy="85" r="7.5" fill="#FFFFFF" />
        </svg>
      </div>

      <div className="overflow-hidden flex flex-col justify-center text-left">
        <div className="flex items-center gap-1 font-black text-base tracking-tight leading-tight text-[var(--ink)]">
          <span className="text-[var(--accent)]">J</span>
          <span>MART</span>
        </div>
        {showSubtitle && (
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)] truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
