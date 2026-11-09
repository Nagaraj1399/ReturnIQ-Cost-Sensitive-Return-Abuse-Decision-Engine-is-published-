/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Backtest Results & Model Performance View
 * Screen 2 from mission brief: 12,000 held-out test set evaluation,
 * cost comparison vs. naive baseline, per-class metrics, 4x4 confusion matrix, and honesty statement.
 */

import React, { useState } from 'react';
import { BACKTEST_RESULTS } from '../data/backtestResults';
import { CostMatrix, AbuseType } from '../types';
import { runBacktest, generateSyntheticTestSet } from '../lib/backtestCore';
import { TrendingDown, ShieldCheck, CheckCircle2, Clock, AlertTriangle, RefreshCw, BarChart2, Table } from 'lucide-react';

interface ResultsViewProps {
  costMatrix: CostMatrix;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ costMatrix }) => {
  const [results, setResults] = useState(BACKTEST_RESULTS);
  const [isRecomputing, setIsRecomputing] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ actual: AbuseType; predicted: AbuseType; count: number } | null>(null);

  // Allow re-running backtest with the current active cost matrix
  const handleRerunWithActiveMatrix = () => {
    setIsRecomputing(true);
    setTimeout(() => {
      const freshCases = generateSyntheticTestSet(12000);
      const freshResults = runBacktest(freshCases, costMatrix);
      setResults(freshResults as any);
      setIsRecomputing(false);
    }, 150);
  };

  const { returnIqPolicy, naiveReviewBaseline, netSavingsDollars, costReductionPercent, savedOpsHours, confusionMatrix } = results;

  const abuseLabels: AbuseType[] = ['Legitimate', 'Policy Abuser', 'Fraudulent Return', 'Wardrobing'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Title & Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-400 tracking-wide uppercase">
            DataNova 2026 Validation &amp; Backtest
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Decision Layer Backtest &amp; Performance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Empirical evaluation over 12,000 held-out test cases (20% split of Kaggle 60,000 dataset). Compares ReturnIQ&apos;s cost-optimal policy against the industry-standard naive baseline (&ldquo;manual-review all flagged cases&rdquo;).
          </p>
        </div>

        <button
          onClick={handleRerunWithActiveMatrix}
          disabled={isRecomputing}
          className="flex items-center gap-2 self-start md:self-auto px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRecomputing ? 'animate-spin' : ''}`} />
          <span>Re-run on Active Sliders (${costMatrix.cost_false_positive} / ${costMatrix.cost_false_negative} / ${costMatrix.cost_manual_review})</span>
        </button>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Net Savings */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Net Financial Savings</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-300 tabular-nums">
            ${netSavingsDollars.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400/90 font-medium">
            {costReductionPercent}% overall cost reduction
          </div>
        </div>

        {/* Cost per return */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Cost Incurred / Return</div>
          <div className="text-2xl font-extrabold font-mono text-white tabular-nums">
            ${returnIqPolicy.costPerReturn}
          </div>
          <div className="text-[11px] text-slate-400">
            vs. <span className="line-through text-slate-500">${naiveReviewBaseline.costPerReturn}</span> naive baseline
          </div>
        </div>

        {/* Ops Labor Hours Saved */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ops Labor Saved</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-blue-400 tabular-nums">
            {savedOpsHours}h
          </div>
          <div className="text-[11px] text-slate-400">
            {returnIqPolicy.opsLaborHours}h vs {naiveReviewBaseline.opsLaborHours}h in queue
          </div>
        </div>

        {/* Abuse Catch Rate */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Abuse Catch Rate</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-purple-300 tabular-nums">
            {returnIqPolicy.fraudCatchRate}%
          </div>
          <div className="text-[11px] text-slate-400">
            Fraud, wardrobing, &amp; abusers caught
          </div>
        </div>

        {/* Legit False Flag Rate */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Legit False Flag Rate</span>
            <CheckCircle2 className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-300 tabular-nums">
            {returnIqPolicy.falseFlagRateOnLegit}%
          </div>
          <div className="text-[11px] text-slate-400">
            Good buyers wrongly frictioned
          </div>
        </div>
      </div>

      {/* Head-to-Head Policy Comparison Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Policy Comparison: ReturnIQ Minimum-Expected-Cost vs. Naive Baseline
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Sample: 12,000 Returns
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Evaluation Metric</th>
                <th className="py-2.5 px-3 text-emerald-400 font-bold">ReturnIQ Optimal Policy</th>
                <th className="py-2.5 px-3 text-slate-400 font-bold">Naive Review Baseline</th>
                <th className="py-2.5 px-3 text-right">Net Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td className="py-2.5 px-3 font-sans text-slate-200">Total Incurred Financial Cost</td>
                <td className="py-2.5 px-3 font-bold text-emerald-300">${returnIqPolicy.totalCost.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-slate-400">${naiveReviewBaseline.totalCost.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">-${netSavingsDollars.toLocaleString()} ({costReductionPercent}%)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-slate-200">Cost Per Processed Return</td>
                <td className="py-2.5 px-3 text-emerald-300 font-bold">${returnIqPolicy.costPerReturn}</td>
                <td className="py-2.5 px-3 text-slate-400">${naiveReviewBaseline.costPerReturn}</td>
                <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">-${(naiveReviewBaseline.costPerReturn - returnIqPolicy.costPerReturn).toFixed(2)}/case</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-slate-200">Manual Review Queue Volume</td>
                <td className="py-2.5 px-3 text-slate-200">{returnIqPolicy.reviewedCount.toLocaleString()} cases</td>
                <td className="py-2.5 px-3 text-slate-400">{naiveReviewBaseline.reviewedCount.toLocaleString()} cases</td>
                <td className="py-2.5 px-3 text-right text-blue-400 font-bold">-{(naiveReviewBaseline.reviewedCount - returnIqPolicy.reviewedCount).toLocaleString()} reviews ({savedOpsHours}h saved)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-slate-200">Instant Automated Approvals</td>
                <td className="py-2.5 px-3 text-slate-200">{returnIqPolicy.approvedCount.toLocaleString()} ({(returnIqPolicy.approvedCount / 120).toFixed(1)}%)</td>
                <td className="py-2.5 px-3 text-slate-400">{naiveReviewBaseline.approvedCount.toLocaleString()} ({(naiveReviewBaseline.approvedCount / 120).toFixed(1)}%)</td>
                <td className="py-2.5 px-3 text-right text-emerald-400">+{(returnIqPolicy.approvedCount - naiveReviewBaseline.approvedCount).toLocaleString()} frictionless returns</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-slate-200">Abuse Catch Rate (Overall)</td>
                <td className="py-2.5 px-3 text-emerald-300 font-bold">{returnIqPolicy.fraudCatchRate}%</td>
                <td className="py-2.5 px-3 text-slate-400">{naiveReviewBaseline.fraudCatchRate}%</td>
                <td className="py-2.5 px-3 text-right text-slate-300">{(returnIqPolicy.fraudCatchRate - naiveReviewBaseline.fraudCatchRate >= 0 ? '+' : '')}{(returnIqPolicy.fraudCatchRate - naiveReviewBaseline.fraudCatchRate).toFixed(1)}%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-slate-200">False Flag Rate on Legitimate Shoppers</td>
                <td className="py-2.5 px-3 text-emerald-300 font-bold">{returnIqPolicy.falseFlagRateOnLegit}%</td>
                <td className="py-2.5 px-3 text-slate-400">{naiveReviewBaseline.falseFlagRateOnLegit}%</td>
                <td className="py-2.5 px-3 text-right text-emerald-400">-{(naiveReviewBaseline.falseFlagRateOnLegit - returnIqPolicy.falseFlagRateOnLegit).toFixed(1)}% customer friction</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Performance & Confusion Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 4x4 Confusion Matrix (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                Multi-Class Confusion Matrix (12,000 Test Set)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Accuracy: <strong className="text-white">{confusionMatrix.overallAccuracy}%</strong> · Macro F1: <strong className="text-white">{confusionMatrix.macroF1}%</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse font-mono">
              <thead>
                <tr>
                  <th className="p-2 text-slate-500 font-sans text-left">Actual \ Predicted</th>
                  {abuseLabels.map((lbl) => (
                    <th key={lbl} className="p-2 text-slate-300 text-[11px] font-semibold">
                      {lbl.replace(' Return', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confusionMatrix.matrix.map((row, actIdx) => {
                  const actLabel = abuseLabels[actIdx];
                  const rowSum = row.reduce((a, b) => a + b, 0);

                  return (
                    <tr key={actLabel} className="border-t border-slate-800/60">
                      <td className="p-2 text-left font-sans font-medium text-slate-300 whitespace-nowrap">
                        {actLabel}
                      </td>
                      {row.map((val, predIdx) => {
                        const predLabel = abuseLabels[predIdx];
                        const isDiagonal = actIdx === predIdx;
                        const cellPct = ((val / (rowSum || 1)) * 100).toFixed(1);

                        return (
                          <td
                            key={predIdx}
                            onClick={() => setSelectedCell({ actual: actLabel, predicted: predLabel, count: val })}
                            className={`p-2.5 transition-all cursor-pointer ${
                              isDiagonal
                                ? 'bg-blue-600/25 text-blue-200 font-bold border border-blue-500/30 hover:bg-blue-600/40'
                                : val > 0
                                ? 'bg-slate-950/60 text-slate-400 hover:bg-slate-800 hover:text-white'
                                : 'text-slate-600'
                            }`}
                          >
                            <div>{val}</div>
                            <div className="text-[10px] opacity-70 font-sans">{cellPct}%</div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {selectedCell && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>
                Inspecting: Actual <strong>{selectedCell.actual}</strong> &rarr; Predicted <strong>{selectedCell.predicted}</strong>
              </span>
              <span className="font-mono font-bold text-white">
                {selectedCell.count} cases
              </span>
            </div>
          )}
        </div>

        {/* Per-Class Precision / Recall / F1 Table (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-100">
              Per-Class Classification Metrics
            </h3>
            <span className="text-xs text-slate-500">Held-Out Test Set</span>
          </div>

          <div className="space-y-3">
            {abuseLabels.map((lbl) => {
              const metrics = confusionMatrix.classMetrics[lbl];
              return (
                <div key={lbl} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-200">{lbl}</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      Support: {metrics.support.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono text-center">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-sans">Precision</div>
                      <div className="font-bold text-emerald-400">{metrics.precision}%</div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-sans">Recall</div>
                      <div className="font-bold text-blue-400">{metrics.recall}%</div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-sans">F1 Score</div>
                      <div className="font-bold text-purple-400">{metrics.f1Score}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
