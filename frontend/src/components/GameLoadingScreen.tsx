'use client'

import React, { useState, useEffect } from 'react'
import { Trophy, Shield, Zap, Sparkles, Activity, Gavel, Play } from 'lucide-react'

interface GameLoadingScreenProps {
  onComplete: () => void
  durationMs?: number
}

const BOOT_LOGS = [
  'Initializing BCCI IPL 2027 Official Tournament Engine...',
  'Loading 250+ Player Auction Contracts & T20 Power Indices...',
  'Calibrating 10 Stadium Pitch Fortresses & Dew Models...',
  'Booting AI Rival War Rooms (CSK, MI, KKR, SRH, RR, DC, PBKS, LSG, GT)...',
  'Synthesizing 74-Match IPL Schedule & Round-by-Round Fixtures...',
  'All Systems Calibrated. Welcome to the War Room, General Manager!'
]

export function GameLoadingScreen({ onComplete, durationMs = 2800 }: GameLoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [logIndex, setLogIndex] = useState(0)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min(100, Math.floor((elapsed / durationMs) * 100))
      setProgress(pct)

      // Calculate which log to show based on progress
      const currentLog = Math.min(
        BOOT_LOGS.length - 1,
        Math.floor((pct / 100) * BOOT_LOGS.length)
      )
      setLogIndex(currentLog)

      if (pct >= 100) {
        clearInterval(interval)
        setIsReady(true)
      }
    }, 40)

    return () => clearInterval(interval)
  }, [durationMs])

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-6 overflow-hidden select-none touch-none">
      {/* Dynamic Animated Background Mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-amber-500/15 via-rose-600/10 to-sky-500/15 blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      {/* Top Gaming Bar */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between text-xs text-gray-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">IPL 2027 ENGINE BOOT</span>
        </div>
        <div className="flex items-center gap-3">
          <span>SECURE BCCI GM TERMINAL</span>
          <span className="text-amber-400 font-bold">v2.5 PRO</span>
        </div>
      </div>

      {/* Center Cinematic Logo & Animation */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg my-auto">
        
        {/* Pulsing Trophy & Gavel Icon Badge */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-rose-600 p-[2px] shadow-[0_0_50px_rgba(245,158,11,0.5)] animate-bounce">
            <div className="w-full h-full bg-slate-950 rounded-3xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent" />
              <Trophy size={48} className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
              <Gavel size={22} className="absolute bottom-2 right-2 text-rose-400 drop-shadow-md" />
            </div>
          </div>
          <div className="absolute -inset-3 rounded-3xl bg-amber-500/20 blur-xl -z-10 animate-pulse" />
        </div>

        {/* Game Title */}
        <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-2xl">
          AUCTION<span className="text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.8)]">XI</span>
        </h1>
        <p className="text-xs sm:text-sm font-bold tracking-widest text-gray-300 uppercase mt-1 mb-6 font-mono">
          Official IPL 2027 Franchise GM & Tactical War Room
        </p>

        {/* Tactical Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-gray-300 flex items-center gap-1.5">
            <Shield size={11} className="text-amber-400" /> ₹125 Cr Salary Cap
          </span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-gray-300 flex items-center gap-1.5">
            <Zap size={11} className="text-sky-400" /> 10 Rival AI War Rooms
          </span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-gray-300 flex items-center gap-1.5">
            <Activity size={11} className="text-emerald-400" /> 74-Match Season
          </span>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-full max-w-md bg-slate-900/90 border border-white/15 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs font-mono font-bold mb-2">
            <span className="text-gray-300 flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-400 animate-spin" />
              <span>{isReady ? 'SYSTEM READY' : 'CALIBRATING WAR ROOM'}</span>
            </span>
            <span className="text-amber-400 font-mono text-sm">{progress}%</span>
          </div>

          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-400 rounded-full transition-all duration-75 relative shadow-[0_0_15px_rgba(245,158,11,0.8)]"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-[transfer-beam_1s_ease-in-out_infinite]" />
            </div>
          </div>

          {/* Current Loading Subtitle */}
          <div className="mt-3 text-[11px] font-mono text-gray-400 min-h-[1.5rem] flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span className="truncate">{BOOT_LOGS[logIndex]}</span>
          </div>
        </div>

        {/* Tap to Enter CTA when 100% */}
        {isReady && (
          <button
            onClick={onComplete}
            className="mt-6 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-display text-base font-black tracking-wider uppercase flex items-center gap-2.5 shadow-[0_0_30px_rgba(245,158,11,0.6)] cursor-pointer hover:scale-105 active:scale-95 transition-all animate-bounce"
          >
            <Play size={18} className="fill-slate-950" />
            <span>ENTER WAR ROOM & LEARN TO PLAY ➔</span>
          </button>
        )}

      </div>

      {/* Bottom Footer Credits */}
      <div className="relative z-10 w-full max-w-4xl text-center text-[10px] text-gray-500 font-mono">
        BCCI IPL 2027 SIMULATION ENGINE • 100% OFFLINE BROWSER & NATIVE GAMEPLAY
      </div>
    </div>
  )
}
