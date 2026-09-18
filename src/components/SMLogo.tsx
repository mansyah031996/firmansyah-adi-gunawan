import React, { useState } from 'react';

interface SMLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical';
}

export const SMLogo: React.FC<SMLogoProps> = ({
  className = '',
  showText = false,
  size = 'md',
}) => {
  const [imgSrcIndex, setImgSrcIndex] = useState(0);

  // Source fallback priority:
  // 0: /logo.png (Local downloaded copy of user's Drive file)
  // 1: Direct Google Drive CDN link from user's Drive ID
  // 2: Fallback SVG Emblem
  const sources = [
    '/logo.png',
    'https://lh3.googleusercontent.com/d/1xRRCdQGZoKNpMgCyVFIS4V4MgXfopRZc',
    'https://drive.google.com/uc?export=view&id=1xRRCdQGZoKNpMgCyVFIS4V4MgXfopRZc',
  ];

  const handleImgError = () => {
    setImgSrcIndex((prev) => prev + 1);
  };

  const dimensions = {
    sm: { height: 'h-8 sm:h-9', maxW: 'max-w-[110px]', text: 'text-[11px]' },
    md: { height: 'h-10 sm:h-12', maxW: 'max-w-[150px]', text: 'text-xs' },
    lg: { height: 'h-14 sm:h-16', maxW: 'max-w-[200px]', text: 'text-sm' },
  };

  const dim = dimensions[size];
  const isSvgFallback = imgSrcIndex >= sources.length;

  return (
    <div className={`inline-flex items-center gap-2.5 bg-black/40 border border-[#c5a059]/40 hover:border-[#c5a059]/70 rounded-xl px-2.5 py-1.5 shadow-lg shadow-black/40 backdrop-blur-md transition-all ${className}`}>
      <div className={`${dim.height} bg-black/50 rounded-lg px-2 py-1 border border-[#c5a059]/30 flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner`}>
        {!isSvgFallback ? (
          <img
            src={sources[imgSrcIndex]}
            alt="Stanley Marthin Logo"
            onError={handleImgError}
            className={`${dim.height} ${dim.maxW} w-auto object-contain filter drop-shadow-md`}
            referrerPolicy="no-referrer"
          />
        ) : (
          /* High-precision SVG Emblem Fallback */
          <div className="flex items-center gap-1.5 px-1">
            <svg className="w-5 h-5 text-[#c5a059]" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 3L35 10V22C35 30 20 37 20 37C20 37 5 30 5 22V10L20 3Z" stroke="#c5a059" strokeWidth="2" fill="url(#goldGrad)" />
              <path d="M12 16H18C20 16 21 17 21 18.5C21 20 19.5 20.5 18 20.5H15M15 20.5H21C22.5 20.5 24 21.5 24 23C24 24.5 22.5 25.5 20 25.5H13" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M26 16L29 25.5L32 16" stroke="#c5a059" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="goldGrad" x1="5" y1="3" x2="35" y2="37" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2a2415" />
                  <stop offset="1" stopColor="#0d0b06" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-[10px] font-modern font-bold text-[#c5a059] tracking-wider">SM</span>
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-modern font-black uppercase text-white tracking-[0.15em] ${dim.text} leading-tight`}>
            STANLEY MARTHIN
          </span>
          <span className="text-[9px] text-[#c5a059] tracking-widest font-mono uppercase font-bold mt-0.5">
            GARAGE
          </span>
        </div>
      )}
    </div>
  );
};



