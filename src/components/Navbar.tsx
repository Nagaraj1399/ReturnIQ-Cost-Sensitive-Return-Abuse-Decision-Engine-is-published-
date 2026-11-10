/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Top Navigation Bar
 * Follows strict 3-zone contract: [Brand] — [Nav links] — [1 Primary Action]
 */

import React from 'react';
import { ShieldCheck, RefreshCw, Sparkles } from 'lucide-react';

export type AppTab = 
  | 'simulator' 
  | 'results' 
  | 'optimizer' 
  | 'fraud-rings' 
  | 'playbook' 
  | 'ask' 
  | 'fairness' 
  | 'writeup';

interface NavbarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onResetDefaults?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onResetDefaults }) => {
  const navItems: Array<{ id: AppTab; label: string; badge?: string }> = [
    { id: 'simulator', label: 'Simulator' },
    { id: 'results', label: 'Backtest' },
    { id: 'optimizer', label: 'Optimizer', badge: 'Pareto' },
    { id: 'fraud-rings', label: 'Fraud Rings' },
    { id: 'playbook', label: 'Playbook' },
    { id: 'ask', label: 'Ask Data', badge: 'AI' },
    { id: 'fairness', label: 'Fairness' },
    { id: 'writeup', label: 'Writeup' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark */}
        <div 
          onClick={() => onSelectTab('simulator')}
          className="flex items-center gap-2 cursor-pointer shrink-0 group"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:bg-blue-500 transition-colors">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            ReturnIQ
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs font-medium">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                    item.badge === 'AI' 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          {onResetDefaults && currentTab === 'simulator' ? (
            <button
              onClick={onResetDefaults}
              title="Reset cost matrix to default parameters"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset Matrix</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectTab('simulator')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <span>Simulate</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
