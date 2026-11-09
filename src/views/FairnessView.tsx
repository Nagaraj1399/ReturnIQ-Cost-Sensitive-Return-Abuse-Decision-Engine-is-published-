/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Demographic Fairness & Bias Audit View
 * Screen 3 from mission brief: Group-wise FPR/FNR error breakdown,
 * interactive disparity charts, honest plain-language finding, and mitigation plan.
 */

import React, { useState } from 'react';
import { FAIRNESS_REPORT } from '../data/fairnessResults';
import { DemographicGroupMetric } from '../types';
import { Scale, AlertCircle, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

export const FairnessView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'age' | 'region' | 'accountTenure'>('age');

  const { overallFPR, overallFNR, categories, plainLanguageFinding, recommendedMitigations, syntheticNotice } = FAIRNESS_REPORT;

  const currentMetrics: DemographicGroupMetric[] = categories[selectedCategory];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Title & Introduction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-400 tracking-wide uppercase">
            DataNova 2026 Fairness &amp; Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Demographic Disparity &amp; Error-Rate Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Group-wise False Positive Rate (wrongly flagging legitimate shoppers) and False Negative Rate (missing real abuse) broken out across demographic-adjacent features in the dataset.
          </p>
        </div>

        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Scale className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Overall FPR Benchmark: <strong className="text-white font-mono">{overallFPR}%</strong> · FNR: <strong className="text-white font-mono">{overallFNR}%</strong></span>
        </div>
      </div>

      {/* Honest Plain-Language Finding Hero */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <h2 className="text-sm font-bold text-slate-100">
            Plain-Language Audit Finding (Unvarnished Truth)
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          {plainLanguageFinding}
        </p>
      </div>

      {/* Category Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-lg w-fit">
          <button
            onClick={() => setSelectedCategory('age')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              selectedCategory === 'age'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Customer Age Bracket
          </button>
          <button
            onClick={() => setSelectedCategory('accountTenure')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              selectedCategory === 'accountTenure'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Account Tenure
          </button>
          <button
            onClick={() => setSelectedCategory('region')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              selectedCategory === 'region'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Geographic Region
          </button>
        </div>

        {/* Group-wise Visualizer & Table Grid */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Disparity Breakdown: {selectedCategory === 'age' ? 'Age Bracket' : selectedCategory === 'accountTenure' ? 'Account Tenure' : 'Geographic Region'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluation across 12,000 cases. Disparity is flagged if group FPR deviates by &gt;25% from the overall population benchmark ({overallFPR}%).
              </p>
            </div>
          </div>

          {/* Visual Bar Comparison Strip */}
          <div className="space-y-3">
            {currentMetrics.map((m) => {
              const maxFpr = 16;
              const barWidth = Math.min(100, Math.round((m.falsePositiveRate / maxFpr) * 100));
              const isElevated = m.disparityVsBenchmark > 1.25;

              return (
                <div key={m.subgroup} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{m.subgroup}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        ({m.sampleCount.toLocaleString()} returns · Avg Item: ${m.avgItemValue})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span className={`font-bold ${isElevated ? 'text-amber-400' : 'text-slate-300'}`}>
                        FPR: {m.falsePositiveRate}%
                      </span>
                      <span className="text-slate-400">
                        FNR: {m.falseNegativeRate}%
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isElevated ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {m.disparityVsBenchmark}x baseline
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden relative">
                    {/* Benchmark marker line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-blue-400 z-10"
                      style={{ left: `${Math.round((overallFPR / maxFpr) * 100)}%` }}
                      title={`Benchmark FPR: ${overallFPR}%`}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isElevated ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Data Table */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-xs text-left text-slate-300 font-mono">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-sans">Subgroup</th>
                  <th className="py-2.5 px-3">Total Evaluated</th>
                  <th className="py-2.5 px-3">Legit Shoppers</th>
                  <th className="py-2.5 px-3 text-amber-400">False Positive Rate</th>
                  <th className="py-2.5 px-3 text-purple-400">False Negative Rate</th>
                  <th className="py-2.5 px-3">Disparity vs Overall</th>
                  <th className="py-2.5 px-3 font-sans">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentMetrics.map((m) => (
                  <tr key={m.subgroup}>
                    <td className="py-2 px-3 font-sans font-medium text-slate-200">{m.subgroup}</td>
                    <td className="py-2 px-3">{m.sampleCount.toLocaleString()}</td>
                    <td className="py-2 px-3">{m.legitCount.toLocaleString()}</td>
                    <td className="py-2 px-3 font-bold text-amber-300">{m.falsePositiveRate}%</td>
                    <td className="py-2 px-3 text-purple-300">{m.falseNegativeRate}%</td>
                    <td className="py-2 px-3">{m.disparityVsBenchmark}x</td>
                    <td className="py-2 px-3 font-sans">
                      {m.isFlaggedDisparity ? (
                        <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" /> Disparity Flagged
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Within Parity Band
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recommended Mitigations for Real Pilot */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Recommended Disparity Mitigations for Real Retail Pilot
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {recommendedMitigations.map((item, i) => {
            const [headline, ...rest] = item.split(': ');
            return (
              <div key={i} className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  <span>{headline}</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {rest.join(': ')}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
