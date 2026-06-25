//modified
import React from 'react';
import { useFlow } from '../context/FlowContext';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useFlow();
  const isBangla = language === 'bn';

  return (
    <button
      onClick={() => setLanguage(isBangla ? 'en' : 'bn')}
      className="relative w-20 h-9 bg-slate-800 border border-slate-700 rounded-full p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500/40 cursor-pointer select-none"
    >
      {/* Sliding Overlay Circle - perfectly centered and absolute positioned */}
      <div
        className={`absolute top-1 bottom-1 w-8 h-7 bg-slate-950 border border-slate-900 rounded-full transition-all duration-300 shadow-md flex items-center justify-center ${
          isBangla ? 'left-1' : 'left-[42px]'
        }`}
      />

      {/* Text Labels Layer - stacked on top to ensure perfect centering */}
      <div className="absolute inset-0 flex justify-between items-center px-3 font-semibold text-xs tracking-wider pointer-events-none">
        <span className={`transition-colors duration-300 z-10 ${isBangla ? 'text-slate-100' : 'text-slate-500'}`}>
          বাং
        </span>
        <span className={`transition-colors duration-300 z-10 ${!isBangla ? 'text-slate-100' : 'text-slate-500'}`}>
          EN
        </span>
      </div>
    </button>
  );
};