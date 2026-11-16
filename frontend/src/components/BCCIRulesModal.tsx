'use client'

import React from 'react'
import { Shield, Users, Globe, IndianRupee, ArrowRight, CheckCircle2, Flame, Gavel, ArrowLeftRight, Swords } from 'lucide-react'

interface BCCIRulesModalProps {
  isOpen: boolean
  teamName: string
  teamEmoji: string
  onAccept: () => void
}

export function BCCIRulesModal({ isOpen, teamName, teamEmoji, onAccept }: BCCIRulesModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl animate-fade-in text-white">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.2)] max-h-[92vh] flex flex-col justify-between overflow-y-auto">
        
        {/* Header */}
        <div className="text-center pb-4 border-b border-white/10 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-black tracking-wider uppercase mb-2">
            <Shield size={13} className="text-amber-400" />
            Official BCCI Directives • Road to IPL 2027
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center justify-center gap-2">
            <span>{teamEmoji}</span>
            <span>Welcome, GM of {teamName}</span>
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-lg mx-auto">
            The 2026 season has concluded. You are now in charge of building your championship roster through the official 4-phase cycle.
          </p>
        </div>

        {/* 4 Official BCCI Roster Rules */}
        <div className="py-4 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            Mandatory Roster Constraints
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Rule 1 */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-white/10 text-center">
              <Users size={18} className="mx-auto text-indigo-400 mb-1" />
              <div className="text-base font-black text-white font-mono">18 - 25</div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">Total Squad Size</div>
            </div>

            {/* Rule 2 */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-white/10 text-center">
              <Globe size={18} className="mx-auto text-sky-400 mb-1" />
              <div className="text-base font-black text-white font-mono">Max 8</div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">Overseas Players</div>
            </div>

            {/* Rule 3 */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-white/10 text-center">
              <IndianRupee size={18} className="mx-auto text-emerald-400 mb-1" />
              <div className="text-base font-black text-white font-mono">₹125.0 Cr</div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">Hard Salary Cap</div>
            </div>

            {/* Rule 4 */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-white/10 text-center">
              <Shield size={18} className="mx-auto text-amber-400 mb-1" />
              <div className="text-base font-black text-white font-mono">Min 2 WK</div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">5 Bowl • 5 Bat</div>
            </div>
          </div>

          {/* The 4-Phase Cycle Timeline */}
          <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 pt-2">
            <Flame size={14} />
            Your Campaign Path (Chain of Events)
          </h4>

          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center justify-center shrink-0 font-bold text-xs">
                1
              </div>
              <div className="flex-1">
                <div className="text-xs font-black text-white flex items-center gap-2">
                  <span>Part 1: The Trade Window</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono">TRADING</span>
                </div>
                <div className="text-[11px] text-gray-400">
                  Swap or buy players with the other 9 franchises before the retention deadline.
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0 font-bold text-xs">
                2
              </div>
              <div className="flex-1">
                <div className="text-xs font-black text-white flex items-center gap-2">
                  <span>Part 2: Retain & Release Deadline</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">PURSE REFUND</span>
                </div>
                <div className="text-[11px] text-gray-400">
                  Keep your core stars. Releasing players refunds their salaries directly into your Mini-Auction Purse!
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0 font-bold text-xs">
                3
              </div>
              <div className="flex-1">
                <div className="text-xs font-black text-white flex items-center gap-2">
                  <span>Part 3: Mini-Auction War Room</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">LIVE AI BIDDING</span>
                </div>
                <div className="text-[11px] text-gray-400">
                  Use your remaining purse to outbid 9 rival franchise AI bots for released superstars.
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0 font-bold text-xs">
                4
              </div>
              <div className="flex-1">
                <div className="text-xs font-black text-white flex items-center gap-2">
                  <span>Part 4: Playing XI & Home Match Arena</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">STADIUM BATTLE</span>
                </div>
                <div className="text-[11px] text-gray-400">
                  Pick your 11 + Impact Player. Ground pitch conditions apply automatically in the background for full match simulation!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-white/10 shrink-0">
          <button
            onClick={onAccept}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide uppercase transition-all shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Accept Rules & Enter Trade Window</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  )
}
