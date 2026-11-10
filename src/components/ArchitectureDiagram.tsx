/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ System Architecture & Operational Decision Flow Diagrams
 * 
 * Interactive, high-contrast SVG + Tailwind visual component
 * illustrating the multi-tiered architecture and end-to-end decision lifecycle.
 */

import React, { useState } from 'react';
import { Layers, GitBranch, ArrowRight, Shield, Cpu, Database, Sparkles, FileText, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'flow'>('architecture');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Tab Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              ReturnIQ Technical Blueprint &amp; Decision Flow
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Decoupled multi-tier pipeline transforming raw e-commerce return telemetry into cost-optimal operations.
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'architecture'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>System Architecture</span>
          </button>
          <button
            onClick={() => setActiveTab('flow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'flow'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Operational Decision Flow</span>
          </button>
        </div>
      </div>

      {/* View 1: System Architecture Diagram */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Tier 1: Ingestion */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold">Tier 1</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-300">Ingestion</span>
              </div>
              <h3 className="text-xs font-bold text-white">Merchant &amp; Logistics Events</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Asynchronous event stream capturing customer return declarations, depot scans, and telemetry.
              </p>
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-300">
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800/80">Shopify / ERP Webhook</div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800/80">Carrier Weight &amp; Scan</div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800/80">Depot Intake Camera</div>
              </div>
            </div>

            {/* Tier 2: Calibrated ML & SHAP */}
            <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">Tier 2</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-300">Inference</span>
              </div>
              <h3 className="text-xs font-bold text-white">Calibrated ML &amp; SHAP</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Multi-class probability estimation with Platt/isotonic scaling and local feature attribution.
              </p>
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-300">
                <div className="p-1.5 rounded bg-slate-900 border border-purple-500/20 text-purple-300">GBDT 4-Class Probabilities</div>
                <div className="p-1.5 rounded bg-slate-900 border border-purple-500/20 text-purple-300">Conformal Interval (95% CI)</div>
                <div className="p-1.5 rounded bg-slate-900 border border-purple-500/20 text-purple-300">TreeSHAP Attribution Vector</div>
              </div>
            </div>

            {/* Tier 3: Pure Decision Layer */}
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">Tier 3</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300">Decision</span>
              </div>
              <h3 className="text-xs font-bold text-white">Expected-Loss Optimizer</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Pure deterministic optimizer evaluating expected loss across all actions under user cost matrices.
              </p>
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-300">
                <div className="p-1.5 rounded bg-slate-900 border border-emerald-500/20 text-emerald-300">C_FP, C_FN, C_Review Loss</div>
                <div className="p-1.5 rounded bg-slate-900 border border-emerald-500/20 text-emerald-300">E[Cost(a)] Minimization</div>
                <div className="p-1.5 rounded bg-slate-900 border border-emerald-500/20 text-emerald-300">Pareto Boundary Enforcer</div>
              </div>
            </div>

            {/* Tier 4: Execution & Ops Notes */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold">Tier 4</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-300">Action</span>
              </div>
              <h3 className="text-xs font-bold text-white">Action &amp; Explanation</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Dispatches operational command and synthesizes 10-second intake notes via Gemini 3.8 Flash.
              </p>
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-300">
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800/80">Instant Refund API</div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800/80">Ops Intake Triage Queue</div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800/80">Gemini / Groq Case Notes</div>
              </div>
            </div>
          </div>

          {/* Data Flow Architecture Canvas */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span>ReturnIQ Decoupled Architecture Topology</span>
              <span className="font-mono text-[10px] text-slate-500">Latency: &lt; 35ms p95</span>
            </div>
            <div className="font-mono text-[11px] text-slate-400 p-3 rounded-lg bg-slate-950 border border-slate-800/80 overflow-x-auto whitespace-pre leading-relaxed">
{`+---------------------------------------------------------------------------------------------------+
|                                       RETURNIQ ENGINE BLUEPRINT                                    |
+---------------------------------------------------------------------------------------------------+
|  [E-Commerce Telemetry]                                                                           |
|   |--> Webhook Payload: {order_id, user_id, order_value, return_reason, days_since_delivery}      |
|   |--> Physical Depot:  {packaging_condition, security_tags, perfume_scent, empty_box_claimed}   |
|   |--> Device Context:  {ip_proxy_mismatch, serial_returner_idx, past_return_rate}                |
|                                                                                                   |
|                                       | (Normalized 35 Features)                                  |
|                                       v                                                           |
|  [Multi-Class Calibrated Model] ---> [TreeSHAP Attribution]                                       |
|   | P(Legitimate): 70.1%              | Detached Tags:      +0.38                                 |
|   | P(Wardrobing): 18.4%              | Perfume/Wear Scent: +0.28                                 |
|   | P(Fraudulent):  8.2%              | Return Rate > 45%:  +0.18                                 |
|   | P(PolicyAbuse): 3.3%              | Conformal Band: 87.0% ± 3.8% (95% CI)                     |
|                                                                                                   |
|                                       | Calibrated Risk Vector + SHAP                             |
|                                       v                                                           |
|  [Pure Cost-Sensitive Decision Engine]                                                            |
|   | Inputs: Risk Probabilities + Cost Matrix (C_FP, C_FN, C_Review)                               |
|   | Math:   E[Cost(a)] = Sum_k P(Class_k) * Cost(a, Class_k)                                      |
|   | Actions Evaluated:                                                                            |
|   |   1. E[Cost(Approve)] = $142.50 (High fraud exposure loss)                                    |
|   |   2. E[Cost(Flag)]    = $ 19.80 (Optimal min expected loss) --> RECOMMENDED                    |
|   |   3. E[Cost(Deny)]    = $ 38.20 (Customer friction risk)                                      |
|                                                                                                   |
|                                       | Recommended Action                                        |
|                                       v                                                           |
|  [Action Dispatcher] <----------------+----------------> [Explanation Layer]                     |
|   |                                                       |                                       |
|   +--> [Approve-Instantly]  --> Release Carrier Refund    +--> Gemini 3.8 Flash Case Note:        |
|   +--> [Flag-for-Review]    --> Station 4 Depot Queue          "Flagged because security tags are |
|   +--> [Deny-and-Blacklist] --> Policy Violation Notice         detached and perfume scent was    |
|                                                                 detected. Route to Station 4."    |
+---------------------------------------------------------------------------------------------------+`}
            </div>
          </div>
        </div>
      )}

      {/* View 2: Operational Decision Flow Diagram */}
      {activeTab === 'flow' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
            {/* Step 1 */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-mono text-xs font-bold flex items-center justify-center">1</div>
              <h4 className="text-xs font-bold text-white">Return Request</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Customer triggers return portal. System ingests order tenure and item category.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="w-6 h-6 rounded-full bg-purple-600/20 text-purple-400 font-mono text-xs font-bold flex items-center justify-center">2</div>
              <h4 className="text-xs font-bold text-white">Feature Extraction</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Computes return velocity, delivery delta, proxy mismatch, and depot inspection flags.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/30 space-y-2">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-bold flex items-center justify-center">3</div>
              <h4 className="text-xs font-bold text-white">Calibrated Model</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                GBDT outputs calibrated probabilities with conformal 95% uncertainty interval.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center">4</div>
              <h4 className="text-xs font-bold text-white">Expected-Loss</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Multiplies probability vector against active cost matrix (C_FP, C_FN, C_Review).
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-500/30 space-y-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 font-mono text-xs font-bold flex items-center justify-center">5</div>
              <h4 className="text-xs font-bold text-white">Action Decision</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Selects argmin E[Cost] action: Instant Approve, Flag for Review, or Deny.
              </p>
            </div>

            {/* Step 6 */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="w-6 h-6 rounded-full bg-emerald-600/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">6</div>
              <h4 className="text-xs font-bold text-white">Ops Note &amp; Label</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Gemini generates 2-sentence warehouse note. Automated routing label issued.
              </p>
            </div>
          </div>

          {/* Tri-Action Routing Visual Map */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Tri-Action Decision Routing Matrix
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Approve */}
              <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Approve-Instantly</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Trigger:</strong> Abuse probability &lt; 5% with verified customer tenure.
                </p>
                <p className="text-[11px] text-emerald-400">
                  <strong>Outcome:</strong> Automated carrier scan refund. Zero warehouse review labor.
                </p>
              </div>

              {/* Review */}
              <div className="p-3.5 rounded-lg bg-blue-950/40 border border-blue-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-blue-300">
                  <AlertTriangle className="w-4 h-4 text-blue-400" />
                  <span>Flag-for-Review</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Trigger:</strong> Ambiguous risk or high-ticket item where review cost &lt; fraud risk.
                </p>
                <p className="text-[11px] text-blue-400">
                  <strong>Outcome:</strong> Routes package to physical Station 4 with Gemini inspection note.
                </p>
              </div>

              {/* Deny */}
              <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-300">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Deny-and-Blacklist</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Trigger:</strong> High-confidence abuse indicators (detached tags, empty box claim).
                </p>
                <p className="text-[11px] text-rose-400">
                  <strong>Outcome:</strong> Return label denied, policy violation issued, fraud ring linkage logged.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
