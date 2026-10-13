import React from 'react';
import { Map, BarChart3, GitCompare, Table2, FileText, Download } from 'lucide-react';

export type DashboardTab = 'map' | 'analytics' | 'compare' | 'table';

interface HeaderProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onOpenReport: () => void;
  selectedBlockName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenReport,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
            PT
          </div>
          <div className="leading-tight">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap block">
              Pithoragarh Blocks
            </span>
            <span className="text-[11px] text-slate-400 tracking-wider uppercase font-medium">
              Census & GIS Dashboard · Uttarakhand
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single-line, clean text/tab buttons) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onTabChange('map')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'map'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Interactive Map</span>
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics & Charts</span>
          </button>

          <button
            onClick={() => onTabChange('compare')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'compare'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>Block Comparison</span>
          </button>

          <button
            onClick={() => onTabChange('table')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'table'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Table2 className="w-4 h-4" />
            <span>Census Ledger</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action (1 primary action button) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>District Briefing</span>
          </button>
        </div>
      </div>
    </header>
  );
};
