/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Surrogate Rule Distillation View (/playbook)
 * 
 * Plain-English operational checklist distilled from a shallow decision tree.
 * Allows retail intake teams to run manual, auditable return abuse triage with 94.8% ML fidelity.
 */

import React, { useState } from 'react';
import { SURROGATE_RULES, SURROGATE_MODEL_SUMMARY } from '../lib/surrogateRuleEngine';
import { SurrogateRule, ActionRecommendation } from '../types';
import { BookOpen, CheckCircle2, ShieldAlert, Flag, CheckSquare, Sparkles, AlertCircle, Printer, Copy, Check } from 'lucide-react';

export const PlaybookView: React.FC = () => {
  const [selectedRule, setSelectedRule] = useState<SurrogateRule>(SURROGATE_RULES[0]);
  const [copied, setCopied] = useState(false);

  // Interactive Checklist Simulator State
  const [chkTagsRemoved, setChkTagsRemoved] = useState(false);
  const [chkWearScent, setChkWearScent] = useState(false);
  const [chkEmptyBox, setChkEmptyBox] = useState(false);
  const [chkWindowExhaustion, setChkWindowExhaustion] = useState(false);
  const [chkTenuredVIP, setChkTenuredVIP] = useState(false);
  const [chkNewHighTicket, setChkNewHighTicket] = useState(false);

  // Evaluate interactive checklist
  let manualResult: { action: ActionRecommendation; ruleName: string; rationale: string } = {
    action: 'Approve-Instantly',
    ruleName: 'Default Standard Intake',
    rationale: 'No risk conditions triggered. Process standard carrier refund scan.',
  };

  if (chkTagsRemoved && chkWearScent) {
    manualResult = {
      action: 'Deny-and-Blacklist',
      ruleName: 'Rule 1 (Post-Event Wardrobing)',
      rationale: 'Tags detached with wear scent present. Item cannot be restocked.',
    };
  } else if (chkEmptyBox) {
    manualResult = {
      action: 'Deny-and-Blacklist',
      ruleName: 'Rule 2 (Carrier Empty Box Tampering)',
      rationale: 'Carrier weight discrepancy contradicts missing item allegation.',
    };
  } else if (chkWindowExhaustion) {
    manualResult = {
      action: 'Flag-for-Review',
      ruleName: 'Rule 3 (Policy Window Cycler)',
      rationale: 'High historical return rate (>45%) returned on Day 28-30.',
    };
  } else if (chkNewHighTicket) {
    manualResult = {
      action: 'Flag-for-Review',
      ruleName: 'Rule 5 (New Account High Exposure)',
      rationale: 'First-time buyer order >$400 warrants visual intake inspection.',
    };
  } else if (chkTenuredVIP) {
    manualResult = {
      action: 'Approve-Instantly',
      ruleName: 'Rule 4 (Tenured VIP Loyalty Credit)',
      rationale: 'Long-standing low-return customer. Zero friction approval.',
    };
  }

  const actionColors: Record<ActionRecommendation, { badge: string; text: string }> = {
    'Approve-Instantly': { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', text: 'text-emerald-400' },
    'Flag-for-Review': { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', text: 'text-amber-400' },
    'Deny-and-Blacklist': { badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', text: 'text-rose-400' },
  };

  const handleCopyPlaybook = () => {
    const text = SURROGATE_RULES.map(r => `Rule ${r.ruleNumber}: ${r.conditionText} -> ${r.recommendedAction} (Fidelity: ${r.fidelity}%)`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Title & Framing Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-400 tracking-wide uppercase">
            Model Distillation &amp; Human-Executable Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Surrogate Rule Playbook
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            A shallow decision tree (depth 3) trained directly on full ensemble predictions, extracted into human-readable rules. A retailer without an ML team can run this checklist manually tomorrow with <strong className="text-emerald-300">94.8% model fidelity</strong>.
          </p>
        </div>

        <button
          onClick={handleCopyPlaybook}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors self-start md:self-auto"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Playbook!' : 'Copy Rule Checklist'}</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Model Fidelity Agreement</div>
          <div className="text-2xl font-bold font-mono text-emerald-300 tabular-nums">
            {SURROGATE_MODEL_SUMMARY.overallFidelityAgreement}%
          </div>
          <div className="text-[11px] text-slate-500">
            Agreement with full ML ensemble
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Total Return Coverage</div>
          <div className="text-2xl font-bold font-mono text-blue-400 tabular-nums">
            {SURROGATE_MODEL_SUMMARY.totalDatasetCoverage}%
          </div>
          <div className="text-[11px] text-slate-500">
            Cases resolved by 6 simple rules
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Decision Tree Depth</div>
          <div className="text-2xl font-bold font-mono text-purple-400 tabular-nums">
            Depth {SURROGATE_MODEL_SUMMARY.treeMaxDepth}
          </div>
          <div className="text-[11px] text-slate-500">
            Max 3 logical conditions per branch
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Retail Ops Feasibility</div>
          <div className="text-2xl font-bold font-mono text-amber-300 tabular-nums">
            100%
          </div>
          <div className="text-[11px] text-slate-500">
            Executable on paper / warehouse POS
          </div>
        </div>
      </div>

      {/* Main Grid: Distilled Rules List (7 cols) & Interactive Checklist Tester (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Rules List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-semibold text-slate-400 flex items-center justify-between pb-1">
            <span>Distilled Rulebook (Ordered by Precedence):</span>
            <span className="font-mono text-[11px] text-slate-500">{SURROGATE_RULES.length} Rules Active</span>
          </div>

          {SURROGATE_RULES.map((rule) => {
            const isSelected = selectedRule.id === rule.id;
            const colors = actionColors[rule.recommendedAction];

            return (
              <div
                key={rule.id}
                onClick={() => setSelectedRule(rule)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                  isSelected
                    ? 'bg-slate-900 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center font-mono font-bold text-xs">
                      #{rule.ruleNumber}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {rule.conditionText.split(' THEN ')[0]}
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border whitespace-nowrap ${colors.badge}`}>
                    {rule.recommendedAction}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-xs text-slate-300">
                  <span className="text-amber-400">&rarr; ACTION:</span> <strong className={colors.text}>{rule.recommendedAction}</strong>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                  <span>Fidelity: <strong className="text-emerald-400">{rule.fidelity}%</strong></span>
                  <span>·</span>
                  <span>Dataset Coverage: <strong>{rule.coverage}%</strong> ({rule.supportCases} cases)</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-slate-800/80">
                  {rule.rationale}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right: Interactive Manual Intake Checklist Simulator (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Manual Intake Checklist Simulator</span>
              </h3>
              <p className="text-xs text-slate-400">
                Tick conditions observed during warehouse package intake
              </p>
            </div>
          </div>

          {/* Checkbox Controls */}
          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={chkTagsRemoved}
                onChange={(e) => setChkTagsRemoved(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <div>
                <div className="font-semibold">Security Tags Detached / Tampered</div>
                <div className="text-[10px] text-slate-500">Security ribbon missing, re-glued, or plastic loop snipped</div>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={chkWearScent}
                onChange={(e) => setChkWearScent(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <div>
                <div className="font-semibold">Wear Scent / Perfume / Creasing</div>
                <div className="text-[10px] text-slate-500">Aroma, deodorant powder marks, or body creasing present</div>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={chkEmptyBox}
                onChange={(e) => setChkEmptyBox(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <div>
                <div className="font-semibold">Empty Box Claim / Weight Anomaly</div>
                <div className="text-[10px] text-slate-500">Alleged missing item with carrier scale discrepancy</div>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={chkWindowExhaustion}
                onChange={(e) => setChkWindowExhaustion(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <div>
                <div className="font-semibold">Day 28-30 Return &amp; High Return Rate</div>
                <div className="text-[10px] text-slate-500">Customer return rate &gt;45% on the final day of return policy</div>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={chkNewHighTicket}
                onChange={(e) => setChkNewHighTicket(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <div>
                <div className="font-semibold">New Account (&lt;14d) &amp; Order &gt;$400</div>
                <div className="text-[10px] text-slate-500">First-time high dollar purchase requiring packaging check</div>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={chkTenuredVIP}
                onChange={(e) => setChkTenuredVIP(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <div>
                <div className="font-semibold">Tenured VIP Customer (&gt;1yr, &lt;10% returns)</div>
                <div className="text-[10px] text-slate-500">Loyal repeat shopper with intact merchandise</div>
              </div>
            </label>
          </div>

          {/* Evaluated Decision Result Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 space-y-2">
            <div className="text-[11px] font-mono text-slate-400">
              Evaluated Playbook Policy:
            </div>
            <div className="text-xl font-bold font-mono text-white flex items-center gap-2">
              <span className={actionColors[manualResult.action].text}>
                {manualResult.action}
              </span>
            </div>
            <div className="text-xs text-amber-300 font-semibold">
              Triggered: {manualResult.ruleName}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-slate-800">
              {manualResult.rationale}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
