/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Case Inspector & Parameter Editor
 */

import React, { useState } from 'react';
import { Package, User, Clock, AlertTriangle, Shield, Check, Edit3, RotateCcw } from 'lucide-react';
import { ReturnCase } from '../types';
import { CASE_ARCHETYPES } from '../data/caseArchetypes';

interface CaseInspectorProps {
  currentCase: ReturnCase;
  onSelectPreset: (caseData: ReturnCase) => void;
  onUpdateCase: (updatedCase: ReturnCase) => void;
}

export const CaseInspector: React.FC<CaseInspectorProps> = ({
  currentCase,
  onSelectPreset,
  onUpdateCase,
}) => {
  const [isCustomizing, setIsCustomizing] = useState(false);

  const handleFieldChange = (field: keyof ReturnCase, value: any) => {
    onUpdateCase({
      ...currentCase,
      [field]: value,
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
      {/* Archetype Selector Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Select Return Case Archetype:
            </h3>
          </div>
          <button
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-950/80 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
            <span>{isCustomizing ? 'Hide Customizer' : 'Customize Return Case'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-1">
          {CASE_ARCHETYPES.map((arch) => {
            const isSelected = currentCase.id === arch.caseData.id;
            return (
              <button
                key={arch.id}
                onClick={() => {
                  onSelectPreset(arch.caseData);
                  setIsCustomizing(false);
                }}
                className={`p-3 rounded-lg border text-left transition-all relative ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-mono text-slate-400">
                    {arch.caseData.id}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                    arch.badge === 'Decision Pivot' ? 'bg-amber-500/20 text-amber-300' :
                    arch.badge === 'Legitimate' ? 'bg-emerald-500/20 text-emerald-300' :
                    arch.badge === 'Wardrobing' ? 'bg-purple-500/20 text-purple-300' :
                    arch.badge === 'Policy Abuser' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-rose-500/20 text-rose-300'
                  }`}>
                    {arch.badge}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-100 truncate mb-1">
                  {arch.name}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                  {arch.summary}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Case Overview Badge Banner */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div>
          <div className="text-[11px] text-slate-500">Order Value</div>
          <div className="font-mono font-bold text-white tabular-nums">${currentCase.orderValue.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500">Item Category</div>
          <div className="font-semibold text-slate-200 truncate">{currentCase.itemCategory}</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500">Delivery to Return</div>
          <div className="font-mono font-bold text-white tabular-nums">{currentCase.daysBetweenDeliveryAndReturn} days</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500">Prior Return Rate</div>
          <div className="font-mono font-bold text-white tabular-nums">{(currentCase.returnRatePrior * 100).toFixed(0)}%</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500">Account Age</div>
          <div className="font-mono font-bold text-white tabular-nums">{currentCase.accountTenureDays} days</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500">Tag &amp; Wear Status</div>
          <div className={`font-semibold ${currentCase.wardrobingFlagTags || currentCase.wardrobingSmellOrWear ? 'text-rose-400' : 'text-emerald-400'}`}>
            {currentCase.wardrobingFlagTags ? 'Tags Detached' : currentCase.wardrobingSmellOrWear ? 'Wear Scent' : 'Pristine'}
          </div>
        </div>
      </div>

      {/* Interactive Case Customizer (Expandable) */}
      {isCustomizing && (
        <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-semibold text-blue-400">
              Interactive Return Case Feature Editor (Live ML Input)
            </span>
            <span className="text-slate-500 text-[11px]">
              Tweak features to simulate any customer profile
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Order Value */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Order Value ($):</label>
              <input
                type="number"
                min="10"
                max="2500"
                value={currentCase.orderValue}
                onChange={(e) => handleFieldChange('orderValue', Math.max(10, Number(e.target.value)))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            {/* Days between delivery and return */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Days Between Delivery &amp; Return:</label>
              <input
                type="number"
                min="1"
                max="35"
                value={currentCase.daysBetweenDeliveryAndReturn}
                onChange={(e) => handleFieldChange('daysBetweenDeliveryAndReturn', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            {/* Prior return rate */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Prior Return Rate (0.00 to 1.00):</label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={currentCase.returnRatePrior}
                onChange={(e) => handleFieldChange('returnRatePrior', Math.max(0, Math.min(1, Number(e.target.value))))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            {/* Account Tenure */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Account Tenure (Days):</label>
              <input
                type="number"
                min="1"
                max="2500"
                value={currentCase.accountTenureDays}
                onChange={(e) => handleFieldChange('accountTenureDays', Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            {/* Serial Returner Index */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Serial Returner Index (0-100):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={currentCase.serialReturnerIndex}
                onChange={(e) => handleFieldChange('serialReturnerIndex', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            {/* Packaging Condition */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Packaging Condition:</label>
              <select
                value={currentCase.packagingCondition}
                onChange={(e) => handleFieldChange('packagingCondition', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
              >
                <option value="Original Sealed">Original Sealed</option>
                <option value="Opened Intact">Opened Intact</option>
                <option value="Tags Removed">Tags Removed</option>
                <option value="Damaged / Repackaged">Damaged / Repackaged</option>
              </select>
            </div>
          </div>

          {/* Toggle Flags Strip */}
          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={currentCase.wardrobingFlagTags}
                onChange={(e) => handleFieldChange('wardrobingFlagTags', e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <span>Tags Detached / Tampered</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={currentCase.wardrobingSmellOrWear}
                onChange={(e) => handleFieldChange('wardrobingSmellOrWear', e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <span>Perfume / Wear Scent</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={currentCase.emptyBoxClaim}
                onChange={(e) => handleFieldChange('emptyBoxClaim', e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <span>Empty Box / Weight Mismatch</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={currentCase.ipProxyMismatch}
                onChange={(e) => handleFieldChange('ipProxyMismatch', e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <span>Proxy / Device Anomaly</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
