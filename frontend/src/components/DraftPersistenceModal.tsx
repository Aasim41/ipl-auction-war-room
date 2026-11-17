'use client';

import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Award, X, CheckCircle2, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { Player } from '../lib/usePlayerData';
import { FranchiseData } from '../data/franchises';

interface DraftPersistenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  franchise: FranchiseData;
  currentSquad: Player[];
  onLoadDraft: (squad: Player[]) => void;
}

export default function DraftPersistenceModal({
  isOpen,
  onClose,
  franchise,
  currentSquad,
  onLoadDraft
}: DraftPersistenceModalProps) {
  const [draftTitle, setDraftTitle] = useState(`${franchise.short} 2026 Strategy Alpha`);
  const [savedDrafts, setSavedDrafts] = useState<any[]>([]);
  const [benchmarkResult, setBenchmarkResult] = useState<any | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [loadingBenchmark, setLoadingBenchmark] = useState(false);

  const fetchDrafts = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/enterprise/drafts');
      const data = await res.json();
      if (data.drafts) setSavedDrafts(data.drafts);
    } catch (e) {
      console.error('Failed to load drafts:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDrafts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCurrentDraft = async () => {
    const draftId = `draft_${Date.now()}`;
    const totalSpent = currentSquad.reduce((acc, p) => acc + (p.predicted_price || p.base_price || 0), 0);

    try {
      const res = await fetch('http://localhost:8000/api/enterprise/drafts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft_id: draftId,
          title: draftTitle,
          franchise_short: franchise.short,
          squad: currentSquad,
          purse_spent: totalSpent
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSaveSuccessMsg(`Draft "${draftTitle}" saved successfully!`);
        fetchDrafts();
        setTimeout(() => setSaveSuccessMsg(null), 3500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBenchmarkAccuracy = async () => {
    setLoadingBenchmark(true);
    try {
      const res = await fetch('http://localhost:8000/api/enterprise/drafts/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          squad: currentSquad
        })
      });
      const data = await res.json();
      setBenchmarkResult(data);
    } catch (e) {
      console.error('Benchmark failed:', e);
    } finally {
      setLoadingBenchmark(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-white/20 rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Award size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Persistent Drafts & Real-World Accuracy Tracker
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                  2026 BENCHMARK
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Save custom draft iterations and compare player acquisition costs against consensus market value.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Save Draft Strip */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 mb-5">
          <div className="text-xs font-black uppercase text-gray-400 mb-2 flex items-center gap-1.5">
            <Save size={12} /> Save Current War Room Roster ({currentSquad.length} Players)
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Draft Strategy Title..."
              className="flex-1 bg-slate-950 border border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleSaveCurrentDraft}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs cursor-pointer transition-colors shadow-lg"
            >
              Save Draft
            </button>
          </div>
          {saveSuccessMsg && (
            <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-bold">
              <CheckCircle2 size={13} /> {saveSuccessMsg}
            </div>
          )}
        </div>

        {/* Benchmark 2026 Accuracy Action Button */}
        <div className="mb-5 flex justify-end">
          <button
            onClick={handleBenchmarkAccuracy}
            disabled={loadingBenchmark || currentSquad.length === 0}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all disabled:opacity-50"
          >
            <Sparkles size={14} /> Calculate 2026 Auction Accuracy & Value Steal Score
          </button>
        </div>

        {/* Benchmark Result Report */}
        {benchmarkResult && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950/40 border border-purple-500/30 mb-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-400">Analyst Grade</span>
                <div className="text-xl font-black text-white">{benchmarkResult.accuracy_grade}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-gray-400">Accuracy Score</span>
                <div className="text-3xl font-black text-emerald-400 font-mono">
                  {benchmarkResult.accuracy_score}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-gray-400 text-[10px] uppercase font-bold">Actual Spend</span>
                <div className="text-base font-black text-white font-mono mt-0.5">₹{benchmarkResult.total_spent_cr} Cr</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-gray-400 text-[10px] uppercase font-bold">Market Consensus</span>
                <div className="text-base font-black text-sky-400 font-mono mt-0.5">₹{benchmarkResult.benchmark_valuation_cr} Cr</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-gray-400 text-[10px] uppercase font-bold">Budget Efficiency</span>
                <div className="text-base font-black text-amber-400 font-mono mt-0.5">{benchmarkResult.budget_efficiency_pct}%</div>
              </div>
            </div>

            {/* Steals Acquired */}
            {benchmarkResult.steals_acquired?.length > 0 && (
              <div>
                <div className="text-[11px] font-black uppercase text-emerald-400 mb-1.5 flex items-center gap-1">
                  <TrendingUp size={12} /> Top Value Steals (Surplus Value vs Market)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {benchmarkResult.steals_acquired.map((s: any) => (
                    <div key={s.name} className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex justify-between items-center">
                      <span className="font-bold text-white">{s.name}</span>
                      <span className="text-emerald-400 font-mono font-bold">+₹{s.surplus} Cr Surplus</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Saved Drafts List */}
        <div>
          <div className="text-xs font-black uppercase text-gray-400 mb-3 flex items-center gap-1.5">
            <FolderOpen size={12} /> Saved Strategy Archives ({savedDrafts.length})
          </div>

          {savedDrafts.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500 bg-slate-900/50 rounded-2xl border border-white/5">
              No saved drafts yet. Save your current squad configuration above!
            </div>
          ) : (
            <div className="space-y-2">
              {savedDrafts.map((d: any) => (
                <div
                  key={d.draft_id}
                  className="p-3 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between gap-3 text-xs hover:border-white/20 transition-all"
                >
                  <div>
                    <div className="font-bold text-white text-sm">{d.title}</div>
                    <div className="text-gray-400 text-[11px] mt-0.5">
                      Franchise: <strong className="text-amber-400">{d.franchise}</strong> • Squad: {d.squad_count} players • Spend: ₹{d.purse_spent} Cr
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onLoadDraft(d.squad);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-black text-white font-bold cursor-pointer transition-colors"
                  >
                    Load Roster
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
