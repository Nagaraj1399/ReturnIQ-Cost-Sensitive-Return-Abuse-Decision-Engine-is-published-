/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ SHAP Feature Importance & Multi-Class Probability View
 */

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Layers, BarChart2 } from 'lucide-react';
import { AbuseType, PredictionResult } from '../types';

interface ShapWaterfallProps {
  prediction: PredictionResult;
}

export const ShapWaterfall: React.FC<ShapWaterfallProps> = ({ prediction }) => {
  const { probabilities, predictedClass, confidence, shapFeatures, baseValue } = prediction;

  const classColors: Record<AbuseType, { bar: string; text: string; bg: string }> = {
    Legitimate: { bar: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    'Policy Abuser': { bar: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10' },
    'Fraudulent Return': { bar: 'bg-rose-500', text: 'text-rose-400', bg: 'bg-rose-500/10' },
    Wardrobing: { bar: 'bg-purple-500', text: 'text-purple-400', bg: 'bg-purple-500/10' },
  };

  const maxProb = Math.max(...Object.values(probabilities));

  return (
    <div className="space-y-6 bg-slate-900/90 border border-slate-800 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Model Prediction &amp; SHAP Explanations
          </h3>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Base Abuse Prior: <strong>29.9%</strong></span>
          <span>·</span>
          <span>Prediction: <strong className={classColors[predictedClass].text}>{predictedClass} ({confidence}%)</strong></span>
        </div>
      </div>

      {/* Multi-Class Probability Distribution */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
          <span>Multi-Class Abuse Probability Distribution (Sum = 100%)</span>
          <span className="text-[11px] text-slate-500 font-normal">Trained on 60,000 synthetic Kaggle cases</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {(Object.keys(probabilities) as AbuseType[]).map((cName) => {
            const prob = probabilities[cName];
            const percent = (prob * 100).toFixed(1);
            const isTop = cName === predictedClass;
            const colors = classColors[cName];

            return (
              <div
                key={cName}
                className={`p-3 rounded-lg border transition-all ${
                  isTop
                    ? `${colors.bg} border-slate-700 ring-1 ring-white/10`
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className={`font-semibold ${isTop ? colors.text : 'text-slate-300'}`}>
                    {cName}
                  </span>
                  <span className="font-mono text-sm font-bold text-white tabular-nums">
                    {percent}%
                  </span>
                </div>

                <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                    style={{ width: `${Math.min(100, Math.max(4, Number(percent)))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SHAP Feature Contribution Waterfall */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Local SHAP Value Attributions (Top Case Drivers)</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              +Risk Driver
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              -Protective Driver
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {shapFeatures.map((feat, idx) => {
            const isRisk = feat.direction === 'increases_risk';
            const absWeight = Math.abs(feat.contribution);
            const barWidth = Math.min(100, Math.round((absWeight / 3.8) * 100));

            return (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {isRisk ? (
                      <ArrowUpRight className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-200 truncate">
                      {feat.label}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      [{String(feat.value)}]
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 pl-6">
                    Category: <span className="capitalize text-slate-300">{feat.category.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:w-48 shrink-0">
                  <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isRisk ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.max(8, barWidth)}%` }}
                    />
                  </div>
                  <span
                    className={`font-mono font-bold w-12 text-right tabular-nums ${
                      isRisk ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {isRisk ? `+${feat.contribution.toFixed(2)}` : feat.contribution.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
