/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Decision Hero Card
 * Visualizes minimum-expected-cost recommendation with clear financial breakdown.
 */

import React from 'react';
import { CheckCircle2, AlertOctagon, Flag, TrendingDown, Info, ArrowRight } from 'lucide-react';
import { ActionRecommendation, ExpectedCostResult } from '../types';

interface DecisionHeroProps {
  decision: ExpectedCostResult;
  predictedClass: string;
  confidence: number;
  orderValue: number;
}

export const DecisionHero: React.FC<DecisionHeroProps> = ({
  decision,
  predictedClass,
  confidence,
  orderValue,
}) => {
  const { recommendedAction, actionCosts, minCost, savingsVsWorst, sensitivityDeltas } = decision;

  const actionConfig = {
    'Approve-Instantly': {
      title: 'Approve-Instantly',
      badgeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
      heroBg: 'from-emerald-950/40 to-slate-900 border-emerald-500/30',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      tagline: 'Lowest expected cost policy. Release refund immediately without manual warehouse intake overhead.',
    },
    'Flag-for-Review': {
      title: 'Flag-for-Review',
      badgeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
      heroBg: 'from-amber-950/40 to-slate-900 border-amber-500/30',
      icon: Flag,
      iconColor: 'text-amber-400',
      tagline: 'Optimal risk-mitigation policy. Human inspection labor ($) is cheaper than expected merchandise loss or churn.',
    },
    'Deny-and-Blacklist': {
      title: 'Deny-and-Blacklist',
      badgeBg: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
      heroBg: 'from-rose-950/40 to-slate-900 border-rose-500/30',
      icon: AlertOctagon,
      iconColor: 'text-rose-400',
      tagline: 'Severe abuse prevention policy. Abuse probability justifies outright denial despite customer churn friction.',
    },
  }[recommendedAction];

  const Icon = actionConfig.icon;

  const actions: ActionRecommendation[] = ['Approve-Instantly', 'Flag-for-Review', 'Deny-and-Blacklist'];

  return (
    <div className={`rounded-xl border bg-gradient-to-b ${actionConfig.heroBg} p-6 space-y-6 transition-all duration-300 shadow-xl`}>
      {/* Top row: Recommendation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wider">
              RETURNIQ ENGINE RECOMMENDATION
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Order: ${orderValue.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-3">
            <Icon className={`w-8 h-8 ${actionConfig.iconColor} shrink-0 animate-in fade-in zoom-in-95 duration-200`} />
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {actionConfig.title}
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {actionConfig.tagline}
          </p>
        </div>

        {/* Expected Cost Highlight Box */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 sm:text-right shrink-0">
          <div className="text-[11px] font-medium text-slate-400">Optimal Expected Loss</div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            ${minCost.toFixed(2)}
          </div>
          <div className="flex items-center gap-1 sm:justify-end text-[11px] text-emerald-400 font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Saves ${savingsVsWorst.toFixed(2)} vs worst action</span>
          </div>
        </div>
      </div>

      {/* Comparison Grid Across 3 Actions */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400">
          Expected Dollar Cost Comparison (E[Cost|Action]):
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {actions.map((act) => {
            const isSelected = act === recommendedAction;
            const costData = actionCosts[act];
            return (
              <div
                key={act}
                className={`p-3.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-blue-500/80 shadow-md ring-1 ring-blue-500/30'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className={isSelected ? 'text-blue-300' : 'text-slate-400'}>
                    {act}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                      MIN COST
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 my-1">
                  <span className="text-xl font-bold font-mono tabular-nums text-white">
                    ${costData.totalCost.toFixed(2)}
                  </span>
                  {!isSelected && (
                    <span className="text-xs font-mono text-rose-400">
                      (+${(costData.totalCost - minCost).toFixed(2)})
                    </span>
                  )}
                </div>

                {/* Sub-cost composition */}
                <div className="text-[11px] space-y-0.5 text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Abuse Risk:</span>
                    <span>${costData.riskCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ops Review Labor:</span>
                    <span>${costData.reviewCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer Friction:</span>
                    <span>${costData.frictionCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Sensitivity Callout */}
      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-slate-200">Decision Sensitivity:</span>{' '}
          <span>{sensitivityDeltas.explanation}</span>
        </div>
      </div>
    </div>
  );
};
