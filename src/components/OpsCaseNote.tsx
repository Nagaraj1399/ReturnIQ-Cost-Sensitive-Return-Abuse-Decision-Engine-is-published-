/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Retail Ops Plain-Language Case Note
 * Generates actionable 10-second case notes via Gemini 3 / Groq / Engine Heuristics.
 */

import React, { useState } from 'react';
import { Bot, RefreshCw, CheckCheck, Sparkles, AlertCircle, FileText } from 'lucide-react';
import { CaseAnalysis } from '../types';

interface OpsCaseNoteProps {
  analysis: CaseAnalysis;
  onRegenerate: (provider: 'gemini' | 'groq' | 'auto') => Promise<void>;
  isLoading?: boolean;
}

export const OpsCaseNote: React.FC<OpsCaseNoteProps> = ({
  analysis,
  onRegenerate,
  isLoading = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [provider, setProvider] = useState<'gemini' | 'groq' | 'auto'>('gemini');

  const { explanation, decision, prediction } = analysis;

  const copyNote = () => {
    navigator.clipboard.writeText(
      `[RETURNIQ OPS CASE NOTE - ${decision.recommendedAction.toUpperCase()}]\n${explanation.summary}\nAction: ${explanation.opsActionRecommendation}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProviderChange = async (newProvider: 'gemini' | 'groq' | 'auto') => {
    setProvider(newProvider);
    await onRegenerate(newProvider);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Plain-Language Retail Ops Case Note
            </h3>
            <div className="text-[11px] text-slate-400">
              Actionable 10-second warehouse dispatch note (GenOS Team Adapter)
            </div>
          </div>
        </div>

        {/* Controls: Provider & Copy */}
        <div className="flex items-center gap-2">
          {/* Provider selector tab */}
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => handleProviderChange('gemini')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                provider === 'gemini' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Gemini
            </button>
            <button
              onClick={() => handleProviderChange('groq')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                provider === 'groq' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Groq
            </button>
            <button
              onClick={() => handleProviderChange('auto')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                provider === 'auto' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Fast Rule
            </button>
          </div>

          <button
            onClick={() => onRegenerate(provider)}
            disabled={isLoading}
            title="Regenerate case note"
            className="p-1.5 text-slate-400 hover:text-white bg-slate-950/80 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <button
            onClick={copyNote}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-950/80 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Case Note Content */}
      <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-3">
        {/* Main Note */}
        <div className="text-sm text-slate-100 font-medium leading-relaxed selection:bg-blue-500/30">
          &ldquo;{explanation.summary}&rdquo;
        </div>

        {/* Operational Dispatch Action */}
        <div className="flex items-start gap-2 pt-2 border-t border-slate-800/60 text-xs text-slate-300">
          <span className="font-semibold text-blue-400 shrink-0">Ops Protocol:</span>
          <span>{explanation.opsActionRecommendation}</span>
        </div>

        {/* Metadata Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span>Provider: <strong className="text-slate-300 capitalize">{explanation.provider}</strong></span>
            <span>·</span>
            <span>Decision: <strong className="text-slate-300">{decision.recommendedAction}</strong></span>
          </div>
          <span className="text-slate-500">
            {explanation.modelConfidenceNote}
          </span>
        </div>
      </div>
    </div>
  );
};
