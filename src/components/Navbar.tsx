/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Top Navigation Bar
 * Follows strict 3-zone contract: [Brand] — [Nav links] — [1 Primary Action]
 */

import React from 'react';
import { ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentTab: 'simulator' | 'results' | 'fairness' | 'writeup';
  onSelectTab: (tab: 'simulator' | 'results' | 'fairness' | 'writeup') => void;
  onResetDefaults?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onResetDefaults }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single line, no clutter) */}
        <div 
          onClick={() => onSelectTab('simulator')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:bg-blue-500 transition-colors">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            ReturnIQ
          </span>
        </div>

        {/* Zone 2: Navigation Links (4 single-line clean text links) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => onSelectTab('simulator')}
            className={`whitespace-nowrap transition-colors ${
              currentTab === 'simulator'
                ? 'text-blue-400 font-semibold border-b-2 border-blue-500 pb-0.5'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Decision Simulator
          </button>
          <button
            onClick={() => onSelectTab('results')}
            className={`whitespace-nowrap transition-colors ${
              currentTab === 'results'
                ? 'text-blue-400 font-semibold border-b-2 border-blue-500 pb-0.5'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Backtest & Model Performance
          </button>
          <button
            onClick={() => onSelectTab('fairness')}
            className={`whitespace-nowrap transition-colors ${
              currentTab === 'fairness'
                ? 'text-blue-400 font-semibold border-b-2 border-blue-500 pb-0.5'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Fairness Audit
          </button>
          <button
            onClick={() => onSelectTab('writeup')}
            className={`whitespace-nowrap transition-colors ${
              currentTab === 'writeup'
                ? 'text-blue-400 font-semibold border-b-2 border-blue-500 pb-0.5'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Submission Writeup
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {onResetDefaults && currentTab === 'simulator' ? (
            <button
              onClick={onResetDefaults}
              title="Reset cost matrix to default parameters"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Matrix</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectTab('simulator')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-600/30 transition-colors whitespace-nowrap"
            >
              <span>Simulate Case</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
