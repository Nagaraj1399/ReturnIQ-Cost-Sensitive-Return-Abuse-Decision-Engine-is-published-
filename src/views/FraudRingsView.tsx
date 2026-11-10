/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Fraud-Ring Network Graph View
 * 
 * Interactive force-directed network graph visualizing organized return syndicates
 * and community clusters detected across linked synthetic accounts.
 */

import React, { useState } from 'react';
import { FRAUD_RINGS_DATA } from '../lib/fraudRingEngine';
import { FraudRing, FraudRingNode, FraudRingLink, AbuseType } from '../types';
import { Network, ShieldAlert, AlertCircle, Users, DollarSign, ArrowRight, ExternalLink, Filter } from 'lucide-react';

export const FraudRingsView: React.FC = () => {
  const [selectedRingId, setSelectedRingId] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<FraudRingNode | null>(FRAUD_RINGS_DATA[0].nodes[0]);

  const allRings = FRAUD_RINGS_DATA;
  const filteredRings = selectedRingId === 'all'
    ? allRings
    : allRings.filter((r) => r.id === selectedRingId);

  const allNodes = filteredRings.flatMap((r) => r.nodes);
  const allLinks = filteredRings.flatMap((r) => r.links);

  const abuseColors: Record<AbuseType, { fill: string; border: string; text: string }> = {
    Wardrobing: { fill: '#a855f7', border: '#7e22ce', text: 'text-purple-400' },
    'Fraudulent Return': { fill: '#f43f5e', border: '#be123c', text: 'text-rose-400' },
    'Policy Abuser': { fill: '#3b82f6', border: '#1d4ed8', text: 'text-blue-400' },
    Legitimate: { fill: '#10b981', border: '#047857', text: 'text-emerald-400' },
  };

  const ringHulls: Record<string, { cx: number; cy: number; r: number; color: string; label: string }> = {
    'ring-luxury-wardrobe': { cx: 215, cy: 150, r: 85, color: 'rgba(168, 85, 247, 0.08)', label: 'Luxury Wardrobe Syndicate' },
    'ring-empty-box-fraud': { cx: 510, cy: 150, r: 80, color: 'rgba(244, 63, 94, 0.08)', label: 'Electronics Scheme' },
    'ring-bracket-policy': { cx: 345, cy: 280, r: 65, color: 'rgba(59, 130, 246, 0.08)', label: 'Policy Bracket Cell' },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Title & Mandatory Disclosure Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-400 tracking-wide uppercase">
            Graph Intelligence &amp; Syndicate Interception
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Fraud-Ring Network Graph
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Community detection isolating coordinated multi-account return fraud. Identifies shared shipping freight drops, proxy device collisions, and coordinated return timing across accounts.
          </p>
        </div>

        {/* Ring Filter Pill Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium self-start md:self-auto">
          <button
            onClick={() => setSelectedRingId('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              selectedRingId === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Clusters ({allRings.length})
          </button>
          {allRings.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRingId(r.id)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedRingId === r.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r.name.split(' ')[0]} Ring
            </button>
          ))}
        </div>
      </div>

      {/* Mandatory Capability & Synthetic Linkage Disclosure Banner */}
      <div className="flex items-start gap-3 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs leading-relaxed">
        <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <strong className="text-amber-300">Mandatory Linkage Disclosure:</strong>{' '}
          The base public Kaggle dataset contains no native account-linkage fields. This module demonstrates ring-detection capability by synthetically assigning shared drop addresses, proxy collisions, and payment hashes to a small designated subset of cases — illustrative of real enterprise linkage data (device tokens, card hashes, physical freight hubs) not present in the public benchmark.
        </div>
      </div>

      {/* Main Grid: SVG Graph Viewport (8 cols) & Case Inspector Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: SVG Network Graph Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-slate-100">
                Network Topology Viewport (Click Node to Inspect Case)
              </span>
            </div>
            <span className="text-slate-400 font-mono text-[11px]">
              {allNodes.length} Nodes · {allLinks.length} Edges
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-xl border border-slate-800/80 p-2 overflow-hidden relative">
            <svg viewBox="0 0 680 380" className="w-full h-auto select-none">
              {/* Background Ring Hulls / Community Bubbles */}
              {Object.entries(ringHulls).map(([ringKey, hull]) => {
                if (selectedRingId !== 'all' && selectedRingId !== ringKey) return null;
                return (
                  <g key={ringKey}>
                    <circle
                      cx={hull.cx}
                      cy={hull.cy}
                      r={hull.r}
                      fill={hull.color}
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={hull.cx}
                      y={hull.cy - hull.r - 8}
                      textAnchor="middle"
                      className="text-[10px] fill-slate-400 font-sans font-semibold tracking-wide"
                    >
                      {hull.label}
                    </text>
                  </g>
                );
              })}

              {/* Edge Links */}
              {allLinks.map((link, idx) => {
                const sNode = allNodes.find((n) => n.id === link.source);
                const tNode = allNodes.find((n) => n.id === link.target);
                if (!sNode || !tNode) return null;

                const isConnectedToSelected = selectedNode && (selectedNode.id === sNode.id || selectedNode.id === tNode.id);

                return (
                  <line
                    key={idx}
                    x1={sNode.x}
                    y1={sNode.y}
                    x2={tNode.x}
                    y2={tNode.y}
                    stroke={isConnectedToSelected ? '#60a5fa' : 'rgba(255,255,255,0.18)'}
                    strokeWidth={isConnectedToSelected ? 2.5 : 1.2}
                    strokeDasharray={link.linkType === 'device_ip_collision' ? '3 3' : undefined}
                  />
                );
              })}

              {/* Graph Nodes */}
              {allNodes.map((node) => {
                const colors = abuseColors[node.abuseType];
                const isSelected = selectedNode?.id === node.id;

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedNode(node)}
                  >
                    {/* Pulsing halo if selected */}
                    {isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={18}
                        fill="rgba(59, 130, 246, 0.25)"
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                        className="animate-pulse"
                      />
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 10 : 8}
                      fill={colors.fill}
                      stroke="#0f172a"
                      strokeWidth="2"
                      className="hover:scale-125 transition-transform"
                    />
                    <text
                      x={node.x}
                      y={node.y + 19}
                      textAnchor="middle"
                      className="text-[9px] fill-slate-300 font-mono font-medium pointer-events-none"
                    >
                      {node.caseId}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Node Legend Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 font-mono pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-purple-300">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                <span>Wardrobing</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span>Fraud Scheme</span>
              </span>
              <span className="flex items-center gap-1.5 text-blue-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span>Policy Abuse</span>
              </span>
            </div>
            <span className="text-slate-500">
              Dashed line = Device collision · Solid = Shared Address / Card
            </span>
          </div>
        </div>

        {/* Right: Selected Node Detail & Action Drawer (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Case &amp; Ring Detail
              </h3>
              <p className="text-xs text-slate-400">
                Account linkage forensics
              </p>
            </div>
            {selectedNode && (
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 ${abuseColors[selectedNode.abuseType].text}`}>
                {selectedNode.abuseType}
              </span>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              {/* Account Identifier Card */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Case ID:</span>
                  <span className="font-mono font-bold text-white text-sm">{selectedNode.caseId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Customer Alias:</span>
                  <span className="font-medium text-slate-200">{selectedNode.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Order Exposure:</span>
                  <span className="font-mono font-bold text-emerald-400">${selectedNode.orderValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Category:</span>
                  <span className="text-slate-300">{selectedNode.itemCategory}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Node Risk Score:</span>
                  <span className="font-mono font-bold text-rose-400">{selectedNode.riskScore}/100</span>
                </div>
              </div>

              {/* Ring Syndicate Context */}
              <div className="p-3.5 rounded-lg bg-purple-500/10 border border-purple-500/20 space-y-1.5">
                <div className="text-[11px] font-semibold text-purple-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>Syndicate: {selectedNode.ringName}</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  <strong>Linkage Reason:</strong> {selectedNode.linkReason}
                </div>
              </div>

              {/* Bulk Syndicate Mitigation */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-semibold text-slate-300">
                  Ring-Level Mitigation Protocol:
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Bulk intercept any future return authorizations originating from linked drops or payment hashes associated with this syndicate.
                </p>
                <button
                  onClick={() => alert(`Simulated ring interception rule created for ${selectedNode.ringName}. All 16 linked account tokens placed on mandatory physical warehouse tag inspection.`)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Enforce Ring Blacklist</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              Click any node in the graph to inspect case details and syndicate linkages.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
