/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Cost Matrix Slider Controls
 * Real-time reactive tuning of the loss matrix.
 */

import React from 'react';
import { Sliders, DollarSign, HelpCircle, AlertTriangle, Users, Clock } from 'lucide-react';
import { CostMatrix } from '../types';

interface CostSlidersProps {
  costMatrix: CostMatrix;
  onChange: (updated: CostMatrix) => void;
  className?: string;
}

export const CostSliders: React.FC<CostSlidersProps> = ({ costMatrix, onChange, className = '' }) => {
  const updateField = (field: keyof CostMatrix, value: number) => {
    onChange({
      ...costMatrix,
      [field]: value,
    });
  };

  const applyPreset = (preset: { fp: number; fn: number; mr: number }) => {
    onChange({
      cost_false_positive: preset.fp,
      cost_false_negative: preset.fn,
      cost_manual_review: preset.mr,
    });
  };

  return (
    <div className={`bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Decision Cost Matrix ($ Parameters)
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Real-time expected cost optimization weights
        </span>
      </div>

      {/* Preset Strategy Buttons */}
      <div className="space-y-1.5">
        <div className="text-xs font-medium text-slate-400">Quick Policy Scenarios:</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <button
            onClick={() => applyPreset({ fp: 45, fn: 125, mr: 18 })}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all text-left ${
              costMatrix.cost_false_positive === 45 && costMatrix.cost_false_negative === 125 && costMatrix.cost_manual_review === 18
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="font-semibold">Standard Retail</div>
            <div className="text-[10px] text-slate-500">$45 / $125 / $18</div>
          </button>

          <button
            onClick={() => applyPreset({ fp: 110, fn: 80, mr: 14 })}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all text-left ${
              costMatrix.cost_false_positive === 110 && costMatrix.cost_false_negative === 80 && costMatrix.cost_manual_review === 14
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="font-semibold">Holiday VIP Campaign</div>
            <div className="text-[10px] text-slate-500">High Churn Penalty</div>
          </button>

          <button
            onClick={() => applyPreset({ fp: 35, fn: 140, mr: 48 })}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all text-left ${
              costMatrix.cost_false_positive === 35 && costMatrix.cost_false_negative === 140 && costMatrix.cost_manual_review === 48
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="font-semibold">Labor Shortage</div>
            <div className="text-[10px] text-slate-500">Disincentivize Review</div>
          </button>

          <button
            onClick={() => applyPreset({ fp: 50, fn: 320, mr: 20 })}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all text-left ${
              costMatrix.cost_false_positive === 50 && costMatrix.cost_false_negative === 320 && costMatrix.cost_manual_review === 20
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="font-semibold">Luxury Ticket / Fine Goods</div>
            <div className="text-[10px] text-slate-500">Extreme Fraud Loss</div>
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-4 pt-1">
        {/* Slider 1: False Positive Cost */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Users className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-medium">Cost of False Positive ($)</span>
              <span className="text-slate-500" title="Cost of wrongly declining or delaying a legitimate shopper (customer churn, LTV erosion, support ticket)">
                <HelpCircle className="w-3 h-3 cursor-help inline" />
              </span>
            </div>
            <span className="font-mono text-sm font-semibold text-rose-400 tabular-nums">
              ${costMatrix.cost_false_positive}
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="150"
            step="1"
            value={costMatrix.cost_false_positive}
            onChange={(e) => updateField('cost_false_positive', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Low Churn Penalty ($10)</span>
            <span>Default ($45)</span>
            <span>Severe Churn Risk ($150)</span>
          </div>
        </div>

        {/* Slider 2: False Negative Cost */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium">Cost of False Negative ($)</span>
              <span className="text-slate-500" title="Direct cost of missing fraud or wardrobing (unresellable garment, chargeback penalty, write-off)">
                <HelpCircle className="w-3 h-3 cursor-help inline" />
              </span>
            </div>
            <span className="font-mono text-sm font-semibold text-amber-400 tabular-nums">
              ${costMatrix.cost_false_negative}
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="350"
            step="5"
            value={costMatrix.cost_false_negative}
            onChange={(e) => updateField('cost_false_negative', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Low Item Loss ($30)</span>
            <span>Default ($125)</span>
            <span>Luxury Risk ($350)</span>
          </div>
        </div>

        {/* Slider 3: Manual Review Cost */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-medium">Cost of Manual Ops Review ($)</span>
              <span className="text-slate-500" title="Fully loaded labor cost per return package inspected at warehouse intake (~10-15 mins analyst time)">
                <HelpCircle className="w-3 h-3 cursor-help inline" />
              </span>
            </div>
            <span className="font-mono text-sm font-semibold text-blue-400 tabular-nums">
              ${costMatrix.cost_manual_review}
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            step="1"
            value={costMatrix.cost_manual_review}
            onChange={(e) => updateField('cost_manual_review', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Automated Station ($5)</span>
            <span>Default ($18)</span>
            <span>High Labor Friction ($60)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
