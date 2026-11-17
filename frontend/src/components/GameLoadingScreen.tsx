'use client'

import React, { useState, useEffect } from 'react'
import { Trophy, Shield, Zap, Sparkles, Activity, Gavel, Play, FastForward } from 'lucide-react'
import { gameAudio, triggerGameHaptic } from '../lib/gameAudioAndHaptics'

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

export function GameLoadingScreen({ onComplete, durationMs = 2400 }: GameLoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [logIndex, setLogIndex] = useState(0)
  const [isReady, setIsReady] = useState(false)

  const handleEnterWarRoom = () => {
    gameAudio.unlockAudio()
    gameAudio.playTradeDealSuccess()
    triggerGameHaptic('medium')
    onComplete()
  }

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min(100, Math.floor((elapsed / durationMs) * 100))
      setProgress(pct)

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

    // Auto-advance safety fallback
    const autoAdvance = setTimeout(() => {
      setIsReady(true)
    }, durationMs + 800)

    return () => {
      clearInterval(interval)
      clearTimeout(autoAdvance)
    }
  }, [durationMs])

  return (
    <div 
      onClick={() => {
        gameAudio.unlockAudio()
        if (isReady) {
          handleEnterWarRoom()
        }
      }}
      className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-3 sm:p-5 overflow-y-auto select-none touch-pan-y"
    >
      {/* Dynamic Animated Background Mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-amber-500/15 via-rose-600/10 to-sky-500/15 blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      {/* Top Gaming Bar with ALWAYS-VISIBLE Skip/Enter CTA */}
      <div className="relative z-20 w-full max-w-5xl flex items-center justify-between text-xs text-gray-400 font-mono py-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] sm:text-[11px]">
            IPL 2027 ENGINE BOOT
          </span>
        </div>

        {/* Prominent Skip / Enter button always reachable on mobile landscape */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleEnterWarRoom()
          }}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] cursor-pointer active:scale-95 transition-all border border-amber-300"
          title="Skip or Enter War Room Immediately"
        >
          <span>{isReady ? 'Enter War Room' : 'Skip & Enter'}</span>
          <FastForward size={13} className="fill-slate-950" />
        </button>
      </div>

      {/* Center Cinematic Logo & Animation (Compact for Mobile Landscape) */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg my-auto py-2">
        
        {/* Pulsing Trophy & Gavel Icon Badge */}
        <div className="relative mb-2 sm:mb-4">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-rose-600 p-[2px] shadow-[0_0_35px_rgba(245,158,11,0.4)]">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent" />
              <Trophy size={28} className="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] sm:w-10 sm:h-10" />
              <Gavel size={14} className="absolute bottom-1.5 right-1.5 text-rose-400 drop-shadow-md sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="absolute -inset-2 rounded-2xl bg-amber-500/20 blur-lg -z-10 animate-pulse" />
        </div>

        {/* Game Title */}
        <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-2xl leading-none">
          AUCTION<span className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]">XI</span>
        </h1>
        <p className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-300 uppercase mt-1 mb-2 sm:mb-4 font-mono">
          Official IPL 2027 Franchise GM & Tactical War Room
        </p>

        {/* Tactical Badges - Compact single flex row */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3 sm:mb-5">
          <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] sm:text-[10px] font-mono text-gray-300 flex items-center gap-1">
            <Shield size={10} className="text-amber-400" /> ₹125 Cr Cap
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] sm:text-[10px] font-mono text-gray-300 flex items-center gap-1">
            <Zap size={10} className="text-sky-400" /> 10 AI War Rooms
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] sm:text-[10px] font-mono text-gray-300 flex items-center gap-1">
            <Activity size={10} className="text-emerald-400" /> 74-Match Season
          </span>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-full max-w-sm sm:max-w-md bg-slate-900/90 border border-white/15 rounded-2xl p-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1.5">
            <span className="text-gray-300 flex items-center gap-1.5">
              <Sparkles size={11} className="text-amber-400 animate-spin" />
              <span>{isReady ? 'SYSTEM CALIBRATED' : 'CALIBRATING WAR ROOM'}</span>
            </span>
            <span className="text-amber-400 font-mono text-xs">{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-400 rounded-full transition-all duration-75 relative shadow-[0_0_12px_rgba(245,158,11,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Current Loading Subtitle */}
          <div className="mt-2 text-[10px] font-mono text-gray-400 min-h-[1.2rem] flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span className="truncate">{BOOT_LOGS[logIndex]}</span>
          </div>
        </div>

        {/* Enter CTA button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleEnterWarRoom()
          }}
          className={`mt-3 sm:mt-4 px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl font-display text-xs sm:text-sm font-black tracking-wider uppercase flex items-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.6)] cursor-pointer hover:scale-105 active:scale-95 transition-all ${
            isReady 
              ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 animate-bounce' 
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
          }`}
        >
          <Play size={15} className={isReady ? 'fill-slate-950' : 'fill-white'} />
          <span>{isReady ? 'ENTER WAR ROOM NOW ➔' : 'START SIMULATION ➔'}</span>
        </button>

      </div>

      {/* Bottom Footer Credits */}
      <div className="relative z-10 w-full max-w-4xl text-center text-[9px] sm:text-[10px] text-gray-500 font-mono py-1">
        BCCI IPL 2027 SIMULATION ENGINE • OFFLINE GM WAR ROOM • TAP ANYWHERE TO START
      </div>
    </div>
  )
}
