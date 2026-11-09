/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Live Decision Simulator Screen
 * Screen 1 from mission brief: paste or select a return case, score live with
 * multi-class probabilities, SHAP waterfall, real-time cost-matrix sliders, and LLM ops notes.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ReturnCase, CostMatrix, CaseAnalysis } from '../types';
import { CASE_ARCHETYPES } from '../data/caseArchetypes';
import { DEFAULT_COST_MATRIX, computeOptimalDecision } from '../lib/decisionEngine';
import { predictReturnAbuse } from '../lib/modelInference';
import { generateHeuristicExplanation } from '../server/explanationService';
import { DecisionHero } from '../components/DecisionHero';
import { CostSliders } from '../components/CostSliders';
import { ShapWaterfall } from '../components/ShapWaterfall';
import { OpsCaseNote } from '../components/OpsCaseNote';
import { CaseInspector } from '../components/CaseInspector';
import { Sparkles, SlidersHorizontal, ShieldAlert, Cpu } from 'lucide-react';

interface SimulatorViewProps {
  costMatrix: CostMatrix;
  onCostMatrixChange: (updated: CostMatrix) => void;
  activeCase: ReturnCase;
  onSelectCase: (c: ReturnCase) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  costMatrix,
  onCostMatrixChange,
  activeCase,
  onSelectCase,
}) => {
  const [isExplaining, setIsExplaining] = useState(false);
  const [caseNoteText, setCaseNoteText] = useState<string | null>(null);
  const [providerUsed, setProviderUsed] = useState<'gemini' | 'groq' | 'ensemble-rule'>('gemini');

  // Compute live prediction & pure decision immediately in client for 0-latency slider dragging
  const prediction = useMemo(() => {
    return predictReturnAbuse(activeCase);
  }, [activeCase]);

  const decision = useMemo(() => {
    return computeOptimalDecision(prediction.probabilities, costMatrix, activeCase.orderValue);
  }, [prediction, costMatrix, activeCase.orderValue]);

  // Construct current analysis object
  const analysis: CaseAnalysis = useMemo(() => {
    const baseHeuristic = generateHeuristicExplanation({
      caseData: activeCase,
      prediction,
      decision,
    });

    if (caseNoteText) {
      return {
        caseData: activeCase,
        prediction,
        decision,
        explanation: {
          ...baseHeuristic,
          summary: caseNoteText,
          provider: providerUsed,
        },
      };
    }

    return {
      caseData: activeCase,
      prediction,
      decision,
      explanation: baseHeuristic,
    };
  }, [activeCase, prediction, decision, caseNoteText, providerUsed]);

  // Fetch AI explanation on case change or action change
  const fetchAiExplanation = async (providerPref: 'gemini' | 'groq' | 'auto' = 'gemini') => {
    setIsExplaining(true);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseData: activeCase,
          prediction,
          decision,
          providerPreference: providerPref,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCaseNoteText(data.summary);
        setProviderUsed(data.provider);
      }
    } catch (e) {
      console.warn('Backend explain endpoint unreachable, using pure local engine', e);
    } finally {
      setIsExplaining(false);
    }
  };

  // Reset custom note when case changes to trigger fresh context
  useEffect(() => {
    setCaseNoteText(null);
  }, [activeCase.id]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-400 tracking-wide uppercase">
            DataNova 2026 Live Demo Centerpiece
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cost-Sensitive Return Decision Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Score real return cases across multi-class risk categories, balance customer churn friction vs. merchandise loss using editable cost sliders, and inspect plain-English ops case notes.
          </p>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 self-start md:self-auto px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>Engine Active: Zero-Latency Decision Optimization</span>
        </div>
      </div>

      {/* Case Archetype Selector & Inspector */}
      <CaseInspector
        currentCase={activeCase}
        onSelectPreset={onSelectCase}
        onUpdateCase={onSelectCase}
      />

      {/* Top Split: Decision Hero (Left) & Cost Matrix Sliders (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Decision Hero Card (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <DecisionHero
            decision={decision}
            predictedClass={prediction.predictedClass}
            confidence={prediction.confidence}
            orderValue={activeCase.orderValue}
          />

          {/* Plain-Language Retail Ops Case Note */}
          <OpsCaseNote
            analysis={analysis}
            onRegenerate={fetchAiExplanation}
            isLoading={isExplaining}
          />
        </div>

        {/* Right: Cost Matrix Sliders (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <CostSliders
            costMatrix={costMatrix}
            onChange={onCostMatrixChange}
          />

          {/* Interactive Hint Card */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              <span>Interactive Demo Moment:</span>
            </div>
            <p className="leading-relaxed">
              Drag the sliders above to witness how the identical return flips between <span className="text-emerald-400 font-semibold">Approve-Instantly</span>, <span className="text-amber-400 font-semibold">Flag-for-Review</span>, and <span className="text-rose-400 font-semibold">Deny-and-Blacklist</span> based purely on retailer economics rather than arbitrary probability cutoffs.
            </p>
          </div>
        </div>
      </div>

      {/* Full-Width SHAP Waterfall & Multi-Class Distribution */}
      <ShapWaterfall prediction={prediction} />
    </div>
  );
};
