/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Pareto-Frontier Threshold Optimizer View
 * 
 * Screen for multi-objective optimization: Fraud Catch Rate (TPR) vs. False Flag Rate (FPR).
 * Clickable interactive curve allows setting the operating threshold for the active session
 * and immediately re-renders the projected financial outcome.
 */

import React, { useState } from 'react';
import { PARETO_FRONTIER_POINTS } from '../lib/paretoOptimizer';
import { ParetoPoint, CostMatrix } from '../types';
import { Sliders, TrendingDown, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Check, Sparkles } from 'lucide-react';

interface OptimizerViewProps {
  costMatrix: CostMatrix;
  activeThreshold: number;
  onSelectThreshold: (threshold: number) => void;
}

export const OptimizerView: React.FC<OptimizerViewProps> = ({
  costMatrix,
  activeThreshold,
  onSelectThreshold,
}) => {
  // Find point closest to activeThreshold or default to 0.28 (optimal)
  const [selectedPoint, setSelectedPoint] = useState<ParetoPoint>(() => {
    const matched = PARETO_FRONTIER_POINTS.find(p => Math.abs(p.threshold - activeThreshold) < 0.03);
    return matched || PARETO_FRONTIER_POINTS.find(p => p.isParetoOptimal) || PARETO_FRONTIER_POINTS[7];
  });
  const [appliedNotice, setAppliedNotice] = useState(false);

  // SVG dimensions
  const width = 640;
  const height = 340;
  const paddingLeft = 60;
  const paddingBottom = 45;
  const paddingTop = 25;
  const paddingRight = 35;
  const plotW = width - paddingLeft - paddingRight;
  const plotH = height - paddingTop - paddingBottom;

  // X axis: False Flag Rate [0% to 25%]
  // Y axis: Fraud Catch Rate [70% to 100%]
  const minX = 0;
  const maxX = 25;
  const minY = 70;
  const maxY = 100;

  const getX = (fpr: number) => paddingLeft + ((fpr - minX) / (maxX - minX)) * plotW;
  const getY = (tpr: number) => height - paddingBottom - ((tpr - minY) / (maxY - minY)) * plotH;

  const paretoPoints = PARETO_FRONTIER_POINTS.filter(p => p.isParetoOptimal)
    .sort((a, b) => a.falseFlagRate - b.falseFlagRate);

  const handlePointClick = (point: ParetoPoint) => {
    setSelectedPoint(point);
    onSelectThreshold(point.threshold);
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 2200);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Title & Introduction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-400 tracking-wide uppercase">
            Advanced Operations Research &amp; Decision Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Pareto-Frontier Threshold Optimizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Multi-objective optimization mapping the tradeoff between Fraud Catch Rate (TPR) and False-Flag Rate on Legitimate returns (FPR). Click any point on the frontier to set the engine operating threshold.
          </p>
        </div>

        {/* Active Threshold Indicator */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
          <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Active Operating Cutoff: <strong className="text-amber-300">&tau; = {selectedPoint.threshold.toFixed(2)}</strong></span>
        </div>
      </div>

      {/* Main Grid: Interactive Plot (7 cols) & Operating Point Detail (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: SVG Pareto Frontier Curve (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span className="font-semibold text-slate-100">
                Pareto Frontier Tradeoff Curve (Click Point to Select)
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              X: False Flag Rate % · Y: Fraud Catch %
            </span>
          </div>

          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80 overflow-hidden">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
              {/* Grid Lines */}
              {[70, 75, 80, 85, 90, 95, 100].map((tpr) => (
                <g key={tpr}>
                  <line
                    x1={paddingLeft}
                    y1={getY(tpr)}
                    x2={width - paddingRight}
                    y2={getY(tpr)}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={getY(tpr) + 3}
                    textAnchor="end"
                    className="text-[10px] fill-slate-500 font-mono"
                  >
                    {tpr}%
                  </text>
                </g>
              ))}

              {[0, 5, 10, 15, 20, 25].map((fpr) => (
                <g key={fpr}>
                  <line
                    x1={getX(fpr)}
                    y1={paddingTop}
                    x2={getX(fpr)}
                    y2={height - paddingBottom}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="1"
                  />
                  <text
                    x={getX(fpr)}
                    y={height - paddingBottom + 16}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-500 font-mono"
                  >
                    {fpr}%
                  </text>
                </g>
              ))}

              {/* Axis Titles */}
              <text
                x={width / 2}
                y={height - 8}
                textAnchor="middle"
                className="text-[11px] fill-slate-400 font-sans font-medium"
              >
                False-Flag Rate on Legitimate Shoppers (FPR %) &rarr; (Lower is Better)
              </text>
              <text
                transform={`rotate(-90)`}
                x={-(height / 2)}
                y={18}
                textAnchor="middle"
                className="text-[11px] fill-slate-400 font-sans font-medium"
              >
                Abuse Catch Rate (TPR %) &rarr;
              </text>

              {/* Connecting Frontier Line for Pareto Optimal points */}
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                points={paretoPoints
                  .map((p) => `${getX(p.falseFlagRate)},${getY(p.fraudCatchRate)}`)
                  .join(' ')}
              />

              {/* Non-Pareto Suboptimal points */}
              {PARETO_FRONTIER_POINTS.filter(p => !p.isParetoOptimal).map((p, idx) => (
                <circle
                  key={`sub-${idx}`}
                  cx={getX(p.falseFlagRate)}
                  cy={getY(p.fraudCatchRate)}
                  r={3.5}
                  fill="#475569"
                  opacity={0.5}
                  className="cursor-pointer hover:fill-slate-300"
                  onClick={() => handlePointClick(p)}
                />
              ))}

              {/* Pareto Optimal points */}
              {paretoPoints.map((p, idx) => {
                const isSelected = selectedPoint.threshold === p.threshold;
                const cx = getX(p.falseFlagRate);
                const cy = getY(p.fraudCatchRate);

                return (
                  <g key={`opt-${idx}`} onClick={() => handlePointClick(p)} className="cursor-pointer">
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={11}
                        fill="rgba(245, 158, 11, 0.2)"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        className="animate-pulse"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 6 : 4.5}
                      fill={isSelected ? '#fbbf24' : '#f59e0b'}
                      stroke="#0f172a"
                      strokeWidth="2"
                      className="hover:scale-125 transition-transform"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 font-mono px-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span>Non-Dominated Pareto Frontier</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-600 inline-block" />
                <span>Dominated Points</span>
              </span>
            </div>
            <span className="text-slate-400">
              Gold points guarantee no superior policy exists
            </span>
          </div>
        </div>

        {/* Right: Selected Operating Point Impact Card (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Selected Operating Threshold (&tau; = {selectedPoint.threshold.toFixed(2)})
              </h3>
              <p className="text-xs text-slate-400">
                Financial and operational outcome at this cutoff
              </p>
            </div>
            {selectedPoint.isParetoOptimal && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PARETO OPTIMAL
              </span>
            )}
          </div>

          {/* Outcome Stat Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-emerald-500/30 space-y-1">
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Net Projected Savings</span>
                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-300 tabular-nums">
                ${selectedPoint.netSavings.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">
                Total loss: ${selectedPoint.totalCost.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Abuse Catch Rate</span>
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-xl font-bold font-mono text-purple-300 tabular-nums">
                {selectedPoint.fraudCatchRate}%
              </div>
              <div className="text-[10px] text-slate-500">
                Fraud &amp; wardrobing caught
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>False Flag Rate</span>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-xl font-bold font-mono text-rose-300 tabular-nums">
                {selectedPoint.falseFlagRate}%
              </div>
              <div className="text-[10px] text-slate-500">
                Legit customers frictioned
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400">Manual Review Volume</div>
              <div className="text-xl font-bold font-mono text-blue-400 tabular-nums">
                {selectedPoint.reviewedCount.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">
                {(selectedPoint.reviewedCount / 30).toFixed(1)}% of returns in queue
              </div>
            </div>
          </div>

          {/* Action Distribution Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Operating Action Distribution:</span>
              <span className="font-mono text-[11px] text-slate-300">
                Approve: {selectedPoint.actionDistribution.approve} · Review: {selectedPoint.actionDistribution.flag} · Deny: {selectedPoint.actionDistribution.deny}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${(selectedPoint.actionDistribution.approve / 3000) * 100}%` }}
                title={`Approved: ${selectedPoint.actionDistribution.approve}`}
              />
              <div
                className="bg-amber-500 h-full"
                style={{ width: `${(selectedPoint.actionDistribution.flag / 3000) * 100}%` }}
                title={`Reviewed: ${selectedPoint.actionDistribution.flag}`}
              />
              <div
                className="bg-rose-500 h-full"
                style={{ width: `${(selectedPoint.actionDistribution.deny / 3000) * 100}%` }}
                title={`Denied: ${selectedPoint.actionDistribution.deny}`}
              />
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={() => handlePointClick(selectedPoint)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors"
          >
            {appliedNotice ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4" />}
            <span>{appliedNotice ? 'Operating Threshold Applied for Session!' : `Set Active Threshold to ${selectedPoint.threshold.toFixed(2)}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
