import React from 'react';
import {
  Home,
  Users,
  AudioWaveform,
  Network,
  Cpu,
  Brain,
  BarChart3,
  FlaskConical,
} from 'lucide-react';
import { ActivePage } from '../types/simulation';

interface SidebarProps {
  activePage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onSelectPage }) => {
  const navItems = [
    {
      id: 'overview' as ActivePage,
      label: 'Overview',
      icon: Home,
    },
    {
      id: 'multiple-speakers' as ActivePage,
      label: 'Multiple Speakers',
      icon: Users,
    },
    {
      id: 'audio-scene' as ActivePage,
      label: 'Audio Scene',
      icon: AudioWaveform,
    },
    {
      id: 'separation' as ActivePage,
      label: 'Separation & Processing',
      icon: Network,
    },
    {
      id: 'ci-encoding' as ActivePage,
      label: 'CI Encoding',
      icon: Cpu,
    },
    {
      id: 'neural-response' as ActivePage,
      label: 'Neural Response',
      icon: Brain,
    },
    {
      id: 'evaluation' as ActivePage,
      label: 'Evaluation',
      icon: BarChart3,
    },
    {
      id: 'experiments' as ActivePage,
      label: 'Experiments',
      icon: FlaskConical,
    },
  ];

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-[#E3EAF3] py-4 px-3 flex flex-col justify-between min-h-[calc(100vh-4rem)] select-none">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-[#EBF3FE] text-[#1677FF] font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#1677FF]' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Lab badge at bottom of sidebar */}
      <div className="pt-4 mt-auto border-t border-slate-100 px-2 text-[11px] text-slate-400 space-y-1">
        <div className="font-semibold text-slate-600 text-xs">Acoustics & Neural CI</div>
        <div>Tonotopic simulation: 22-ch</div>
        <div>Model version: v1.4.2</div>
      </div>
    </aside>
  );
};
