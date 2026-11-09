/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Footer with Mandatory Synthetic Dataset Honesty Disclosure
 */

import React from 'react';
import { AlertCircle, Scale, ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 px-6 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Mandatory Synthetic Dataset Statement */}
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200/90 leading-relaxed">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-amber-300">Mandatory Data Honesty Disclosure:</span>{' '}
            <span>
              Built on a labeled-synthetic dataset (Kaggle &ldquo;E-Commerce Return Abuse Detection Dataset&rdquo;, 60,000 records). Class balance is cross-checked against publicly reported retail return-fraud/abuse industry figures (e.g. NRF&apos;s annual return-fraud loss reporting) for plausibility — it is not validated against real transactions. Never treat these predictions as live production data without an active retail merchant calibration pilot.
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-slate-500">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-300">ReturnIQ</span>
            <span>·</span>
            <span>DataNova 2026 Global Data-thon</span>
            <span>·</span>
            <span className="text-slate-400">Team: <strong className="text-slate-300">GenOS Team</strong></span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Track: Cybersecurity &amp; Fraud Detection</span>
            <span>·</span>
            <span>Operations Research &amp; Decision Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
