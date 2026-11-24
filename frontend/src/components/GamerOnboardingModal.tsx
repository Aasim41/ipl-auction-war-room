'use client'

import React, { useState } from 'react'
import { 
  Trophy, 
  Shield, 
  Coins, 
  ArrowLeftRight, 
  Users, 
  Gavel, 
  Calendar, 
  Swords, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Zap,
  Target,
  Flame,
  Award,
  HelpCircle,
  X,
  BookOpen,
  DollarSign,
  Gamepad2,
  Lightbulb
} from 'lucide-react'
import { gameAudio, triggerGameHaptic } from '../lib/gameAudioAndHaptics'

interface GamerOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onCompleteToTeamSelect?: () => void
}

type GuideTab = 'start' | 'phases' | 'rules' | 'matches' | 'tips'

export function GamerOnboardingModal({ isOpen, onClose, onCompleteToTeamSelect }: GamerOnboardingModalProps) {
  const [activeTab, setActiveTab] = useState<GuideTab>('start')

  if (!isOpen) return null

  const handleFinish = () => {
    gameAudio.playTradeDealSuccess()
    triggerGameHaptic('medium')
    if (onCompleteToTeamSelect) {
      onCompleteToTeamSelect()
    } else {
      onClose()
    }
  }

  const handleTabChange = (tab: GuideTab) => {
    gameAudio.playUiTap('light')
    triggerGameHaptic('light')
    setActiveTab(tab)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in select-none">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-slate-950 border border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] text-white my-auto overflow-hidden">
        
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <BookOpen size={16} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black font-display text-white flex items-center gap-2">
                <span>IPL Franchise Manager</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Beginner Guide
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">Everything you need to know to build your team and win the trophy</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer"
            title="Close Guide"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-3 sm:px-6 py-2 border-b border-white/10 bg-slate-950/80 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => handleTabChange('start')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'start'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles size={13} />
            <span>Quick Start</span>
          </button>

          <button
            onClick={() => handleTabChange('phases')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'phases'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ArrowLeftRight size={13} />
            <span>The 4 Stages</span>
          </button>

          <button
            onClick={() => handleTabChange('rules')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'rules'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Coins size={13} />
            <span>Money & Roster</span>
          </button>

          <button
            onClick={() => handleTabChange('matches')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'matches'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gamepad2 size={13} />
            <span>Match Controls</span>
          </button>

          <button
            onClick={() => handleTabChange('tips')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'tips'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lightbulb size={13} />
            <span>Pro Tips</span>
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-gray-300 flex-1 leading-relaxed">
          
          {/* TAB 1: QUICK START */}
          {activeTab === 'start' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                <Trophy size={24} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-black text-white font-display">You Are The Franchise General Manager!</h3>
                  <p className="text-gray-300 text-xs mt-1">
                    You take 100% control of an IPL franchise (CSK, MI, RCB, KKR, etc.). Your mission is simple: 
                    trade players, release deadweight to get money back, win auction bidding wars against 9 rival computer teams, 
                    pick your matchday 11, and lift the 2027 IPL Trophy!
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-mono font-black text-amber-400 uppercase tracking-wider">
                  How The Game Works (Step-by-Step)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div>
                      <strong className="text-white text-xs block">The Trade Window</strong>
                      <span className="text-gray-400 text-[11px] leading-tight block mt-0.5">
                        Swap players directly with other teams. Add cash from your budget to sweeten the deal if their player is higher rated.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div>
                      <strong className="text-white text-xs block">Retain & Release</strong>
                      <span className="text-gray-400 text-[11px] leading-tight block mt-0.5">
                        Keep your best superstars. Releasing any player refunds 100% of their salary directly into your auction budget!
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <div>
                      <strong className="text-white text-xs block">Live Mini-Auction</strong>
                      <span className="text-gray-400 text-[11px] leading-tight block mt-0.5">
                        Live bidding room! Released stars and world-class talent go under the hammer. Tap your paddle to bid against 9 aggressive AI teams.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                      4
                    </div>
                    <div>
                      <strong className="text-white text-xs block">Matchday Arena</strong>
                      <span className="text-gray-400 text-[11px] leading-tight block mt-0.5">
                        Pick your starting 11, set the batting order, and play all 14 tournament matches with ball-by-ball tactical controls!
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-2.5 text-xs">
                <span className="text-amber-400 text-base shrink-0">💡</span>
                <span className="text-gray-300">
                  <strong className="text-white">New to cricket?</strong> No problem! Every screen has automated helpers. You can click <strong>AI Auto-Select</strong> on the Playing XI screen to automatically pick the perfect team for today&apos;s pitch!
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: THE 4 STAGES */}
          {activeTab === 'phases' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase font-display tracking-wide">
                  The Official 4-Phase Championship Cycle
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  The game moves strictly forward in real-time order. Once a stage deadline passes, it is finalized.
                </p>
              </div>

              <div className="space-y-3">
                {/* Phase 1 */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-sky-500/20 text-sky-400 text-xs font-mono font-black flex items-center justify-center">1</span>
                      <strong className="text-sm font-black text-white">Stage 1: Trade Window</strong>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      Swap Deals
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">
                    Before auction day, teams can trade players directly. If your team is missing a top spinner or fast bowler, select a rival team, pick the player you want, choose someone from your squad to give in exchange, and hit Propose!
                  </p>
                  <div className="p-2 rounded-lg bg-slate-950 border border-white/5 text-[11px] text-gray-400">
                    <strong className="text-sky-300">Important:</strong> Franchise icons (like Dhoni, Rohit, Kohli) are protected by their team boards and cannot be traded.
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-mono font-black flex items-center justify-center">2</span>
                      <strong className="text-sm font-black text-white">Stage 2: Retain & Release Deadline</strong>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      Purse Refund
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">
                    Review your entire 25-man squad. Keep your proven match-winners. If you have underperforming players on big salaries, click <strong>Release</strong>.
                  </p>
                  <div className="p-2 rounded-lg bg-slate-950 border border-white/5 text-[11px] text-gray-400">
                    <strong className="text-emerald-300">Purse Bonus:</strong> When you release a player, their entire price (e.g. ₹12.0 Cr) is immediately added back to your bank to spend at the auction!
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 text-xs font-mono font-black flex items-center justify-center">3</span>
                      <strong className="text-sm font-black text-white">Stage 3: Live Mini-Auction</strong>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Bidding War
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">
                    Players are presented one by one. Tap the <strong>Bid</strong> button to raise your paddle. 9 AI franchise bots will bid aggressively based on their budget and team needs.
                  </p>
                  <div className="p-2 rounded-lg bg-slate-950 border border-white/5 text-[11px] text-gray-400">
                    <strong className="text-amber-300">Strategy:</strong> Don&apos;t blow all your money on one superstar! You must finish the auction with at least 18 total players in your squad.
                  </div>
                </div>

                {/* Phase 4 */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-400 text-xs font-mono font-black flex items-center justify-center">4</span>
                      <strong className="text-sm font-black text-white">Stage 4: Matchday & Tournament</strong>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      14 Matches + Finals
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">
                    Select your 11 players + 1 Impact Player substitute. Choose who bats at #1, #2, etc. Play matches ball-by-ball with interactive choices or simulate innings to qualify for the playoffs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MONEY & ROSTER RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase font-display tracking-wide">
                  Money & Team Rules Explained Simply
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  These 4 simple rules keep the competition fair and balanced:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 font-mono font-black text-xs uppercase">
                    <Coins size={14} />
                    <span>1. Your Budget (Purse)</span>
                  </div>
                  <div className="text-lg font-black text-white font-mono">₹125.0 Crore Cap</div>
                  <p className="text-xs text-gray-400">
                    This is your total salary budget. The sum of all player contracts in your squad cannot exceed ₹125 Cr. Money left over can be spent at the auction.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-sky-400 font-mono font-black text-xs uppercase">
                    <Users size={14} />
                    <span>2. Squad Size</span>
                  </div>
                  <div className="text-lg font-black text-white font-mono">18 to 25 Players</div>
                  <p className="text-xs text-gray-400">
                    Your franchise must have at least 18 players and no more than 25 players when entering the tournament.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-rose-400 font-mono font-black text-xs uppercase">
                    <Shield size={14} />
                    <span>3. Overseas (Foreign) Limit</span>
                  </div>
                  <div className="text-lg font-black text-white font-mono">Max 4 in Playing 11</div>
                  <p className="text-xs text-gray-400">
                    You can have up to 8 international stars in your 25-man squad, but BCCI regulations strictly state that only <strong>4 overseas players</strong> can take the field in any single match.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono font-black text-xs uppercase">
                    <CheckCircle2 size={14} />
                    <span>4. Matchday Roles</span>
                  </div>
                  <div className="text-lg font-black text-white font-mono">1 WK • 4 Bowlers Min</div>
                  <p className="text-xs text-gray-400">
                    Every Playing 11 must include at least 1 specialist Wicketkeeper (wearing gloves) and at least 4 capable bowling options (Bowlers or All-Rounders) to bowl the 20 overs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MATCH CONTROLS */}
          {activeTab === 'matches' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase font-display tracking-wide">
                  How Matches Work & How to Control Them
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  A T20 match has 20 overs per team (120 balls). You make the tactical decisions for your players on every ball:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Batting Controls */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono font-black text-xs uppercase pb-1 border-b border-white/5">
                    <span>🏏 When You Are Batting</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="p-2 rounded-xl bg-slate-950 border border-white/5">
                      <strong className="text-sky-300 block">🛡️ Defend</strong>
                      <span className="text-gray-400 text-[11px]">Play safe. Lowest risk of getting out, scores 0 to 1 run. Best when you just lost a quick wicket.</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-white/5">
                      <strong className="text-emerald-300 block">⚖️ Rotate Strike</strong>
                      <span className="text-gray-400 text-[11px]">Nudge into gaps for easy 1s and 2s. Keeps the run rate moving without taking crazy risks.</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-white/5">
                      <strong className="text-amber-300 block">⚡ Attack</strong>
                      <span className="text-gray-400 text-[11px]">Loft the ball over fielders for 4s and 6s. Moderate risk of getting caught.</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-white/5">
                      <strong className="text-rose-400 block">💥 Super Six</strong>
                      <span className="text-gray-400 text-[11px]">Maximum power swing! High risk of dismissal, but crushes huge sixes. Use in death overs or big chases.</span>
                    </div>
                  </div>
                </div>

                {/* Bowling Controls */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-mono font-black text-xs uppercase pb-1 border-b border-white/5">
                    <span>🎯 When You Are Bowling</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="p-2 rounded-xl bg-slate-950 border border-white/5">
                      <strong className="text-amber-300 block">🎯 Pinpoint Yorker</strong>
                      <span className="text-gray-400 text-[11px]">Aimed right at the batsman&apos;s shoes. Very hard to hit boundaries; best for death overs (overs 17–20).</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-white/5">
                      <strong className="text-sky-300 block">📐 Good Length</strong>
                      <span className="text-gray-400 text-[11px]">Standard disciplined delivery outside off-stump. Forces false defensive shots and outside edges to keeper.</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-white/5">
                      <strong className="text-purple-300 block">🌀 Slower Ball / Cutter</strong>
                      <span className="text-gray-400 text-[11px]">Deceives the batsman with a drop in speed. Great for generating mistimed catches to long-on or mid-wicket.</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-white/5">
                      <strong className="text-rose-300 block">⚡ Express Bouncer</strong>
                      <span className="text-gray-400 text-[11px]">Fast short-pitched delivery aimed at the chest. Pushes batters on the back foot.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact Player Explainer */}
              <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                  ⚡
                </div>
                <div>
                  <strong className="text-white text-xs block">The Impact Player Rule</strong>
                  <p className="text-gray-400 text-[11px] mt-0.5 leading-normal">
                    During a match, you can tap the <strong>Impact Player</strong> button to substitute any player out for an extra batsman or bowler from your bench! For example, after your top bowler bowls his 4 overs, swap him out for a fresh power-hitter to bat in the second innings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRO TIPS */}
          {activeTab === 'tips' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase font-display tracking-wide">
                  5 Golden Tips for Beginners
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Follow these expert strategies to outsmart the rival computer teams and dominate the league:
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-start gap-2.5">
                  <span className="text-amber-400 font-mono font-black text-sm shrink-0">#1</span>
                  <div>
                    <strong className="text-white text-xs block">Don&apos;t blow your entire purse on one player</strong>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      In the auction, save at least ₹15–20 Crore for the middle rounds. Superstars often slip through at bargain base prices when other teams run out of money!
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-start gap-2.5">
                  <span className="text-amber-400 font-mono font-black text-sm shrink-0">#2</span>
                  <div>
                    <strong className="text-white text-xs block">Match your team to the stadium pitch</strong>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      Look at the stadium card before each match. At Chennai (Chepauk) or Lucknow, slow turning pitches favor spinners. At Mumbai (Wankhede) or Bengaluru, short boundaries favor express fast bowlers and power-hitters!
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-start gap-2.5">
                  <span className="text-amber-400 font-mono font-black text-sm shrink-0">#3</span>
                  <div>
                    <strong className="text-white text-xs block">Save your best bowler for the death overs</strong>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      Close matches are almost always won or lost in overs 18, 19, and 20. Don&apos;t bowl out your best fast bowler early; keep at least 2 of his overs for the final death overs!
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-start gap-2.5">
                  <span className="text-amber-400 font-mono font-black text-sm shrink-0">#4</span>
                  <div>
                    <strong className="text-white text-xs block">Use AI Auto-Select whenever you&apos;re unsure</strong>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      On the Playing XI screen, clicking <strong>AI Auto-Select</strong> runs an algorithm that analyzes the venue, pitch conditions, player form, and BCCI rules to pick the best possible 11 and batting order for you.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-start gap-2.5">
                  <span className="text-amber-400 font-mono font-black text-sm shrink-0">#5</span>
                  <div>
                    <strong className="text-white text-xs block">Release expensive deadweight for instant cash</strong>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      Have a player on your roster who costs ₹10 Cr but rarely performs? Release him in the Retain/Release window to get that entire ₹10 Cr added straight to your auction purse!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Actions Bar */}
        <div className="px-4 sm:px-6 py-3 border-t border-white/10 bg-slate-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <HelpCircle size={13} className="text-amber-400" />
            <span className="hidden sm:inline">You can reopen this guide anytime from the top bar</span>
          </div>

          <button
            onClick={handleFinish}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
          >
            <span>Understood, Let&apos;s Play!</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  )
}
