/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ - Chat-With-Your-Fraud-Data View (/ask)
 * 
 * Natural language query interface against the 12,000-case held-out test dataset.
 * Server parses queries into safe filters and returns empirical rows with zero hallucination.
 */

import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Sparkles,
  AlertCircle,
  Database,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  CheckCircle2,
  Table,
  Filter,
  Info,
  DollarSign,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { QueryResponse } from '../server/dataQueryEngine';

const SUGGESTED_QUERIES = [
  'Show me wardrobing cases in Apparel with order value over $200',
  'Empty box claims in Electronics flagged for ops review',
  'High device risk returns that were denied and blacklisted',
  'Legitimate returns in the West region approved instantly',
  'Proxy mismatch cases with tags removed',
  'What is the weather in Tokyo? (Out-of-domain refusal test)',
];

export const AskDataView: React.FC = () => {
  const [queryInput, setQueryInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setQueryInput(queryText);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data: QueryResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Ask error:', err);
      setErrorMsg(err.message || 'Failed to query fraud dataset');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(queryInput);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Title & Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-400 tracking-wide uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Advanced Feature 6 · Natural-Language Data Interface</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Chat-With-Your-Fraud-Data
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Query the 12,000-case held-out test dataframe in natural language. Queries are parsed server-side into structured filters and executed directly against actual cases — <strong>zero hallucination, guaranteed</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span>Active Dataset: 12,000 Test Cases</span>
        </div>
      </div>

      {/* Query Search Form Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ask anything: e.g. 'Show me wardrobing cases in Apparel over $200'..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !queryInput.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors disabled:opacity-50 shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Translating &amp; Filtering...</span>
              </>
            ) : (
              <>
                <span>Run Query</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Suggested Queries Chips */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Suggested Operational Queries:
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSearch(sq)}
                className="text-left text-xs px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-slate-300 transition-all flex items-center gap-1.5"
              >
                <ChevronRight className="w-3 h-3 text-emerald-400" />
                <span>{sq}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Query Result Rendering */}
      {result && (
        <div className="space-y-6">
          {/* Out-of-Domain Refusal Banner (When canAnswer is false) */}
          {!result.canAnswer ? (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Query Refusal — Zero-Hallucination Safe Mode Triggered</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-300">
                {result.explanation}
              </p>
              <div className="text-[11px] text-amber-400/80 pt-1 border-t border-amber-500/20">
                <strong>Why this happened:</strong> To prevent generative fabrication, the LLM is constrained to map queries strictly to existing dataset columns (abuse type, category, order value, warehouse tags, etc.). Unrelated or unverifiable questions are declined deterministically.
              </div>
            </div>
          ) : (
            <>
              {/* Successful Query Results */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                {/* Active Filter Criteria Pill Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-200">Compiled Structured Filters:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                    {result.parsedFilters && Object.entries(result.parsedFilters).map(([k, v]) => (
                      <span key={k} className="px-2.5 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                        {k}: <strong>{String(v)}</strong>
                      </span>
                    ))}
                    {(!result.parsedFilters || Object.keys(result.parsedFilters).length === 0) && (
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        All Records (No Restrictions)
                      </span>
                    )}
                  </div>
                </div>

                {/* Summary Metric Strip */}
                {result.summaryMetrics && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="text-xs text-slate-400">Matching Cases</div>
                      <div className="text-2xl font-bold font-mono text-white tabular-nums">
                        {result.summaryMetrics.matchCount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {((result.summaryMetrics.matchCount / 12000) * 100).toFixed(1)}% of held-out test set
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="text-xs text-slate-400">Total Exposure</div>
                      <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                        ${result.summaryMetrics.totalExposureDollars.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Avg: ${result.summaryMetrics.avgOrderValue} per return
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="text-xs text-slate-400">Primary Abuse Type</div>
                      <div className="text-base font-bold text-purple-400 truncate">
                        {Object.entries(result.summaryMetrics.abuseBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {Object.entries(result.summaryMetrics.abuseBreakdown)
                          .filter(([_, count]) => count > 0)
                          .map(([type, count]) => `${type}: ${count}`)
                          .join(', ')}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="text-xs text-slate-400">Policy Decisions</div>
                      <div className="text-xs font-mono space-y-0.5 pt-1">
                        <div className="text-emerald-400">Approve: {result.summaryMetrics.actionBreakdown['Approve-Instantly']}</div>
                        <div className="text-blue-400">Review: {result.summaryMetrics.actionBreakdown['Flag-for-Review']}</div>
                        <div className="text-rose-400">Deny: {result.summaryMetrics.actionBreakdown['Deny-and-Blacklist']}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Real Records Table */}
              {result.sampleRecords && result.sampleRecords.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-blue-400" />
                      <h3 className="text-sm font-semibold text-slate-100">
                        Sample Matched Return Cases (Showing Top {result.sampleRecords.length})
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      Real test dataframe rows
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-300">
                      <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/80 border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3 font-mono">Case ID</th>
                          <th className="py-2.5 px-3">Customer</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3 font-mono text-right">Order Value</th>
                          <th className="py-2.5 px-3">Ground Truth</th>
                          <th className="py-2.5 px-3">Engine Decision</th>
                          <th className="py-2.5 px-3">Observed Risk Signals</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {result.sampleRecords.map((r) => {
                          const isDenied = r.recommendedAction === 'Deny-and-Blacklist';
                          const isFlagged = r.recommendedAction === 'Flag-for-Review';

                          return (
                            <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-2.5 px-3 text-slate-400">{r.id}</td>
                              <td className="py-2.5 px-3 font-sans text-slate-200">{r.customerName}</td>
                              <td className="py-2.5 px-3 font-sans text-slate-300">{r.itemCategory}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-white">${r.orderValue}</td>
                              <td className="py-2.5 px-3 font-sans">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  r.actualAbuseType === 'Legitimate'
                                    ? 'bg-emerald-500/10 text-emerald-300'
                                    : 'bg-purple-500/10 text-purple-300'
                                }`}>
                                  {r.actualAbuseType}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-sans">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  isDenied
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : isFlagged
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : 'bg-emerald-500/20 text-emerald-300'
                                }`}>
                                  {r.recommendedAction.replace('-Instantly', '').replace('-and-Blacklist', '')}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-sans text-[11px] text-slate-400">
                                {r.riskSignals.join(', ')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Mandatory Honesty Statement */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Info className="w-4 h-4 text-blue-400" />
          <span>Zero-Hallucination Data Architecture Guarantee</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          The natural language query layer does not generate return records or answers from memory. Large language models (Gemini / Groq) are restricted strictly to producing structured JSON filter expressions which are subsequently executed against the actual 12,000 held-out test dataframe. If a user query asks for unmeasured attributes or external facts, the engine issues a clean, structured refusal.
        </p>
      </div>
    </div>
  );
};
