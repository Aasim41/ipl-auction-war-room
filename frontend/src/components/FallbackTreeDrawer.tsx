'use client';

import React, { useState, useEffect } from 'react';
import { GitBranch, ShieldAlert, ArrowRight, Zap, CheckCircle2, AlertTriangle, ChevronDown } from 'lucide-react';

interface FallbackPlan {
  tier: string;
  player_name: string;
  role: string;
  max_ceiling_price: number;
  target_rationale: string;
  status: string;
}

interface FallbackTree {
  id: string;
  role_category: string;
  franchise: string;
  target_need: string;
  plans: FallbackPlan[];
}

interface FallbackTreeDrawerProps {
  currentHammerPlayer?: string;
  currentBid?: number;
  onNominatePlan: (playerName: string, basePrice: number, role: string) => void;
}

export default function FallbackTreeDrawer({
  currentHammerPlayer,
  currentBid = 0,
  onNominatePlan
}: FallbackTreeDrawerProps) {
  const [trees, setTrees] = useState<FallbackTree[]>([]);
  const [selectedTreeId, setSelectedTreeId] = useState<string>('tree_express_pace');
  const [evaluationAlert, setEvaluationAlert] = useState<any | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/enterprise/fallback-trees')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTrees(data);
          if (data.length > 0) setSelectedTreeId(data[0].id);
        }
      })
      .catch(err => console.error('Failed to load fallback trees:', err));
  }, []);

  // Check ceiling alerts whenever current bid or hammer player changes
  useEffect(() => {
    if (!currentHammerPlayer || !selectedTreeId) return;

    fetch('http://localhost:8000/api/enterprise/fallback-trees/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tree_id: selectedTreeId,
        current_hammer_price: currentBid,
        current_player_name: currentHammerPlayer
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.action === 'PIVOT_TO_PLAN_B' || data.action === 'PIVOT_TO_PLAN_C') {
          setEvaluationAlert(data);
          setIsExpanded(true); // Auto-expand when ceiling is breached
        } else {
          setEvaluationAlert(null);
        }
      })
      .catch(err => console.error(err));
  }, [currentHammerPlayer, currentBid, selectedTreeId]);

  const activeTree = trees.find(t => t.id === selectedTreeId) || trees[0];

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md transition-all">
      {/* Collapsible Accordion Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
            <GitBranch size={13} />
          </div>
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-2">
              Contingency Strategy (Plan A / B / C)
              {evaluationAlert ? (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono font-black animate-pulse">
                  🚨 CEILING BREACH
                </span>
              ) : (
                <span className="text-[10px] text-gray-400 font-normal">
                  {activeTree?.role_category}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          <span className="text-[10px] hidden sm:inline">
            {isExpanded ? 'Collapse' : 'View Contingencies'}
          </span>
          <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3.5 pt-1 border-t border-white/5 space-y-3">
          {/* Tree Selector */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <span className="text-[11px] text-gray-400 font-medium">Select Position Tree:</span>
            <select
              value={selectedTreeId}
              onChange={(e) => setSelectedTreeId(e.target.value)}
              aria-label="Target Contingency Tree"
              className="text-xs font-bold bg-slate-950 border border-white/20 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-emerald-500"
            >
              {trees.map(t => (
                <option key={t.id} value={t.id}>
                  {t.role_category}
                </option>
              ))}
            </select>
          </div>

          {/* Ceiling Breach Live Alert (If Triggered) */}
          {evaluationAlert && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-start gap-2.5">
              <AlertTriangle className="shrink-0 mt-0.5 text-rose-400" size={15} />
              <div className="flex-1 text-xs">
                <span className="font-bold">{evaluationAlert.message}</span>
                {evaluationAlert.recommended_pivot && (
                  <div className="mt-2">
                    <button
                      onClick={() => onNominatePlan(
                        evaluationAlert.recommended_pivot.player_name,
                        2.0,
                        evaluationAlert.recommended_pivot.role
                      )}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-md"
                    >
                      <Zap size={11} /> 1-Click Pivot: Nominate {evaluationAlert.recommended_pivot.player_name}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plans Visual Hierarchy */}
          {activeTree && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {activeTree.plans.map((plan, idx) => {
                const isPlanA = idx === 0;
                const isPlanB = idx === 1;
                const isUnderHammer = currentHammerPlayer && currentHammerPlayer.toLowerCase() === plan.player_name.toLowerCase();
                const isExceeded = isUnderHammer && currentBid > plan.max_ceiling_price;

                return (
                  <div
                    key={plan.tier}
                    className={`p-2.5 rounded-xl border transition-all text-xs ${
                      isExceeded
                        ? 'bg-rose-950/30 border-rose-500/50'
                        : isUnderHammer
                        ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : 'bg-slate-950/50 border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                        isPlanA ? 'bg-amber-500/20 text-amber-300' : (isPlanB ? 'bg-sky-500/20 text-sky-300' : 'bg-emerald-500/20 text-emerald-300')
                      }`}>
                        {plan.tier.split(' ')[0]} {plan.tier.split(' ')[1]}
                      </span>
                      <span className="text-[10px] font-mono text-gray-300">
                        ₹{plan.max_ceiling_price} Cr
                      </span>
                    </div>

                    <div className="font-bold text-white text-xs truncate">
                      {plan.player_name}
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[9px] text-gray-500">
                        {plan.role}
                      </span>
                      <button
                        onClick={() => onNominatePlan(plan.player_name, 2.0, plan.role)}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 hover:bg-emerald-500 hover:text-black text-white transition-colors flex items-center gap-0.5 cursor-pointer"
                      >
                        Nominate <ArrowRight size={9} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
