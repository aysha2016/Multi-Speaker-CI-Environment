import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-8 border-t border-[#E3EAF3] py-4 px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 bg-white">
      <div className="flex items-center gap-2 font-medium">
        <span className="font-bold text-slate-800">CI-AI Research Lab</span>
        <span className="text-slate-400">v1.0</span>
        <span className="text-slate-300">|</span>
        <span>Multi-Speaker Cochlear Implant Research Prototype</span>
      </div>
      <div className="text-[11px] text-slate-400">
        Research simulation only. Not a medical device. Not clinically validated.
      </div>
    </footer>
  );
};
