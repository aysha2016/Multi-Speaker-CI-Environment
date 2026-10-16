import React from 'react';
import { Save, Download, Settings, Github } from 'lucide-react';
import { GitHubUser } from '../types/simulation';

interface HeaderProps {
  onOpenStatus: () => void;
  onOpenSave: () => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  onOpenAI: () => void;
  onOpenGitHub: () => void;
  gitHubUser: GitHubUser | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenStatus,
  onOpenSave,
  onOpenExport,
  onOpenSettings,
  onOpenAI,
  onOpenGitHub,
  gitHubUser,
}) => {
  return (
    <header className="h-16 px-6 bg-white border-b border-[#E3EAF3] flex items-center justify-between sticky top-0 z-40 shadow-xs">
      {/* Brand Zone */}
      <div className="flex items-center gap-3">
        {/* Cochlea / Neural Audio Icon */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xs">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12" />
            <path d="M12 6a6 6 0 0 1 6 6c0 3.314-2.686 6-6 6s-6-2.686-6-6" />
            <path d="M12 10a2 2 0 0 1 2 2" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </div>
        <div>
          <h1 className="text-[17px] font-bold text-[#0F172A] tracking-tight leading-none">
            CI-AI Research Lab
          </h1>
          <p className="text-[11px] font-medium text-slate-500 tracking-normal mt-0.5">
            Multi-Speaker Environment Prototype
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Status Badge */}
        <button
          onClick={onOpenStatus}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100/70 transition-all cursor-pointer group text-left"
          title="Click to view Simulation & Model Specifications"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase">
            RESEARCH PROTOTYPE
          </span>
        </button>

        {/* GitHub Account Button */}
        {gitHubUser ? (
          <button
            onClick={onOpenGitHub}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all cursor-pointer shadow-2xs"
            title={`Connected as @${gitHubUser.login}. Click to open account details.`}
          >
            <img
              src={gitHubUser.avatar_url || 'https://github.com/identicons/user.png'}
              alt={gitHubUser.login}
              className="w-5 h-5 rounded-full object-cover border border-slate-300"
            />
            <span className="max-w-[110px] truncate text-slate-900 font-medium">
              @{gitHubUser.login}
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenGitHub}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors cursor-pointer"
            title="Open or login your GitHub account"
          >
            <Github className="w-3.5 h-3.5 text-slate-700" />
            <span>GitHub</span>
          </button>
        )}

        {/* Save button */}
        <button
          onClick={onOpenSave}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors cursor-pointer"
        >
          <Save className="w-3.5 h-3.5 text-slate-500" />
          <span>Save</span>
        </button>

        {/* Export button */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export</span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          <span>Settings</span>
        </button>

        {/* AI Assistant Avatar Button */}
        <button
          onClick={onOpenAI}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer ml-1 relative"
          title="Open AI Research Assistant"
        >
          <span>AI</span>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-400 border-2 border-white rounded-full" />
        </button>
      </div>
    </header>
  );
};
