'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Users, 
  Shield, 
  Gavel, 
  ArrowLeftRight, 
  Target, 
  ArrowLeft,
  Activity,
  Lock,
  Calendar,
  RotateCcw,
  Plus,
  Coins,
  ChevronDown,
  AlertCircle,
  Volume2,
  VolumeX,
  Zap
} from 'lucide-react'
import { useCampaignStore } from '../store/useCampaignStore'
import { getFranchise } from '../data/franchises'
import { OnboardingAuthModal } from './OnboardingAuthModal'
import { BCCIRulesModal } from './BCCIRulesModal'
import GameModeSelectionModal from './GameModeSelectionModal'
import { gameAudio, triggerGameHaptic } from '../lib/gameAudioAndHaptics'
import TeamLogo from './TeamLogo'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { 
    currentUser, 
    campaigns, 
    getActiveCampaign, 
    switchCampaign, 
    resetCampaign,
    advancePhase 
  } = useCampaignStore()

  const [mounted, setMounted] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showGameModeModal, setShowGameModeModal] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'saves' | 'create' | 'switch'>('saves')
  const [showRulesModal, setShowRulesModal] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [lockedToast, setLockedToast] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsMuted(gameAudio.isMuted())

    const handleSoundChange = (e: any) => {
      if (e?.detail) {
        setIsMuted(e.detail.isMuted)
      }
    }
    window.addEventListener('auctionxi_sound_change', handleSoundChange)
    return () => window.removeEventListener('auctionxi_sound_change', handleSoundChange)
  }, [])

  const toggleSound = () => {
    gameAudio.unlockAudio()
    const nextMuted = gameAudio.toggleMute()
    setIsMuted(nextMuted)
    triggerGameHaptic('light')
    if (!nextMuted) {
      gameAudio.playUiTap('select')
    }
  }

  if (pathname === '/select-team') return null

  const activeCamp = mounted ? getActiveCampaign() : null
  const franchise = activeCamp ? getFranchise(activeCamp.teamId) : getFranchise('rcb')
  const lockedPhases = activeCamp?.lockedPhases || []

  // Compute active roster vitals
  const activeCount = activeCamp ? activeCamp.squad.filter(p => !p.is_released).length : 0
  const overseasCount = activeCamp ? activeCamp.squad.filter(p => !p.is_released && p.is_overseas).length : 0
  const remainingPurse = activeCamp ? activeCamp.remainingPurse : 125.0

  // ─── STRICT BACK NAVIGATION: NEVER GO BACK TO LOCKED/PAST PHASES ───
  const handleBack = () => {
    // If inside any tournament phase, back takes you to Home Dashboard, preserving all progress
    // It NEVER steps back into closed trade windows or past auctions!
    if (pathname === '/trade' || pathname === '/squad' || pathname === '/auction' || pathname === '/playing-xi') {
      router.push('/')
    } else if (pathname === '/win-prob' || pathname === '/stats' || pathname === '/hub') {
      // Sub-tools return to your active campaign phase
      const targetUrl = activeCamp?.currentPhase === 'playing_xi' || activeCamp?.currentPhase === 'match'
        ? '/playing-xi'
        : activeCamp?.currentPhase === 'mini_auction'
        ? '/auction'
        : activeCamp?.currentPhase === 'retain_release'
        ? '/squad'
        : '/trade'
      router.push(targetUrl)
    } else {
      router.push('/')
    }
  }

  const triggerLockedAlert = (phaseName: string, isPast: boolean) => {
    gameAudio.playTradeReject()
    triggerGameHaptic('trade_reject')
    if (isPast) {
      setLockedToast(`🔒 ${phaseName} is permanently finalized for Season 2027. BCCI rules forbid returning to concluded phases.`)
    } else {
      setLockedToast(`🔒 Complete your current phase before unlocking ${phaseName}.`)
    }
    setTimeout(() => setLockedToast(null), 3500)
  }

  // Adaptive Sequential Phases based on Mode
  const isScratchMode = activeCamp?.mode === 'scratch_inception'

  const officialPhaseOrder: Record<string, number> = {
    'trade': 1,
    'retain_release': 2,
    'mini_auction': 3,
    'playing_xi': 4,
    'match': 4
  }

  const scratchPhaseOrder: Record<string, number> = {
    'draft': 1,
    'mini_auction': 2,
    'playing_xi': 3,
    'match': 3
  }

  const currentPhaseOrder = isScratchMode
    ? (scratchPhaseOrder[activeCamp?.currentPhase || 'draft'] || 1)
    : (officialPhaseOrder[activeCamp?.currentPhase || 'trade'] || 1)

  const activeSquadCount = activeCamp?.squad?.filter((p: any) => !p.is_released).length || 0

  const OFFICIAL_PHASES = [
    { 
      id: 'trade', 
      label: currentPhaseOrder > 1 ? '1. Trade (Closed)' : '1. Trade Window', 
      shortLabel: '1. Trade',
      href: '/trade', 
      icon: ArrowLeftRight,
      isConcluded: currentPhaseOrder > 1 || lockedPhases.includes('trade'),
      isLocked: currentPhaseOrder !== 1
    },
    { 
      id: 'retain_release', 
      label: currentPhaseOrder > 2 ? '2. Retain (Finalized)' : '2. Retain & Release', 
      shortLabel: '2. Retain',
      href: '/squad', 
      icon: Users,
      isConcluded: currentPhaseOrder > 2 || lockedPhases.includes('retain_release'),
      isLocked: currentPhaseOrder !== 2
    },
    { 
      id: 'mini_auction', 
      label: currentPhaseOrder > 3 ? '3. Auction (Finalized)' : '3. Mini-Auction', 
      shortLabel: '3. Auction',
      href: '/auction', 
      icon: Gavel,
      isConcluded: currentPhaseOrder > 3 || lockedPhases.includes('mini_auction'),
      isLocked: currentPhaseOrder !== 3
    },
    { 
      id: 'playing_xi', 
      label: '4. Playing XI & Schedule', 
      shortLabel: '4. Play',
      href: '/playing-xi', 
      icon: Calendar,
      isConcluded: false,
      isLocked: currentPhaseOrder < 4 && activeSquadCount < 18
    },
  ]

  const SCRATCH_PHASES = [
    {
      id: 'draft',
      label: currentPhaseOrder > 1 ? '1. Draft (Concluded)' : '1. Foundation Draft',
      shortLabel: '1. Draft',
      href: '/draft',
      icon: Zap,
      isConcluded: currentPhaseOrder > 1 || lockedPhases.includes('draft'),
      isLocked: currentPhaseOrder !== 1
    },
    {
      id: 'mini_auction',
      label: currentPhaseOrder > 2 ? '2. Auction (Concluded)' : '2. Mega Auction',
      shortLabel: '2. Auction',
      href: '/auction',
      icon: Gavel,
      isConcluded: currentPhaseOrder > 2 || lockedPhases.includes('mini_auction'),
      isLocked: currentPhaseOrder < 2
    },
    {
      id: 'playing_xi',
      label: '3. Playing XI & Schedule',
      shortLabel: '3. Play',
      href: '/playing-xi',
      icon: Calendar,
      isConcluded: false,
      isLocked: currentPhaseOrder < 3 && activeSquadCount < 18
    }
  ]

  const PHASES = isScratchMode ? SCRATCH_PHASES : OFFICIAL_PHASES

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 shadow-2xl flex flex-col select-none overflow-x-hidden">
        {/* Mobile Phone Status Bar Buffer with Top Frame & Border */}
        <div className="sm:hidden w-full h-[max(env(safe-area-inset-top,0px),38px)] bg-slate-950/90 border-b border-white/10 flex items-center justify-between px-3 text-[10px] font-mono text-emerald-400/80 pointer-events-none select-none shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-widest text-[9px] uppercase text-emerald-400">AUCTIONXI LIVE</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-bold text-amber-400">
              {isScratchMode ? '⚡ SCRATCH' : '🏆 OFFICIAL'}
            </span>
          </div>
        </div>

        {/* Interactive Navbar Controls Row */}
        <div className="w-full h-14 flex items-center justify-between px-2.5 sm:px-4 gap-1.5 sm:gap-2">
          
          {/* Left: Navigation & Franchise Identity */}
          <div className="flex items-center gap-1.5 shrink-0">
            {pathname !== '/' ? (
              <button
                onClick={() => {
                  gameAudio.playUiTap('light')
                  triggerGameHaptic('light')
                  handleBack()
                }}
                className="w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center sm:gap-1 text-xs font-bold border border-white/10 cursor-pointer shadow-sm transition-all shrink-0"
                title="Return to Dashboard"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Back</span>
              </button>
            ) : null}

            {/* Franchise Identity Pill - Opens Franchise Saves in GM Modal */}
            <button
              type="button"
              onClick={() => {
                gameAudio.playUiTap('light')
                triggerGameHaptic('light')
                setAuthModalTab('saves')
                setShowAuthModal(true)
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-white transition-all cursor-pointer border border-white/10 group shrink-0"
              title="Click to view all Franchise Saves & Careers"
            >
              <TeamLogo teamId={franchise.id} size={22} className="transition-transform group-hover:scale-105 shrink-0" />
              <span className="font-black text-xs text-white hidden md:inline truncate max-w-[130px]">
                {franchise.name}
              </span>
              <span className="font-mono font-black text-[11px] text-amber-400 sm:hidden">
                {franchise.short}
              </span>
              <ChevronDown size={11} className="text-gray-400 group-hover:text-white transition-colors shrink-0" />
            </button>
          </div>

          {/* Center: Minimal 4-Phase Stepper */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none px-1">
            {PHASES.map((phase, idx) => {
              const isActive = pathname === phase.href
              const isLocked = phase.isLocked

              if (isLocked) {
                return (
                  <div
                    key={phase.id}
                    onClick={() => triggerLockedAlert(phase.label, phase.isConcluded)}
                    title={phase.isConcluded ? "Concluded and locked by BCCI regulations" : "Complete current phase to unlock"}
                    className="px-2 py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-1 shrink-0 bg-slate-900/40 text-gray-500 border border-white/5 cursor-not-allowed opacity-50"
                  >
                    <Lock size={10} className={phase.isConcluded ? "text-amber-500/60" : "text-gray-500"} />
                    <span className="hidden sm:inline">{phase.shortLabel}</span>
                    <span className="sm:hidden font-mono">{idx + 1}</span>
                  </div>
                )
              }

              return (
                <Link
                  key={phase.id}
                  href={phase.href}
                  onClick={() => {
                    gameAudio.playUiTap('light')
                    triggerGameHaptic('light')
                    if (phase.id === 'playing_xi' && currentPhaseOrder < 4) {
                      advancePhase('playing_xi')
                    }
                  }}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                      : 'text-gray-300 hover:text-white bg-slate-900/80 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <phase.icon size={11} className={isActive ? 'text-slate-950' : 'text-gray-400'} />
                  <span className="hidden sm:inline">{phase.shortLabel}</span>
                  <span className="sm:hidden font-mono">{idx + 1}</span>
                </Link>
              )
            })}
          </div>

          {/* Right: Live Gaming HUD Stats (Purse + Mode + Profile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mode Switcher Pill */}
            <button
              type="button"
              onClick={() => {
                gameAudio.playUiTap('light')
                triggerGameHaptic('light')
                setShowGameModeModal(true)
              }}
              className="px-2 py-1 rounded-xl bg-gradient-to-r from-amber-500/15 via-sky-500/15 to-purple-500/15 border border-white/10 hover:border-amber-400/40 active:scale-95 text-white flex items-center gap-1 text-[10px] font-mono font-bold cursor-pointer transition-all shrink-0"
              title="Click to Switch Game Mode (Official Squads vs Build From Scratch)"
            >
              <Zap size={11} className={isScratchMode ? "text-sky-400" : "text-amber-400"} />
              <span className="hidden sm:inline">{isScratchMode ? 'Scratch' : 'Official'}</span>
            </button>

            {activeCamp && (
              <div 
                className="px-2 sm:px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-mono font-black text-amber-300"
                title="Remaining Mini-Auction Purse"
              >
                <Coins size={12} className="text-amber-400 shrink-0" />
                <span className="hidden sm:inline">₹{remainingPurse.toFixed(1)}Cr</span>
                <span className="sm:hidden">₹{Math.round(remainingPurse)}Cr</span>
              </div>
            )}

            {/* GM Profile Pill */}
            <button
              type="button"
              onClick={() => {
                gameAudio.playUiTap('light')
                triggerGameHaptic('light')
                setAuthModalTab('switch')
                setShowAuthModal(true)
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center text-xs font-black cursor-pointer transition-all border border-white/15 shrink-0"
              title="Manager Profile & Onboarding"
            >
              <span className="text-sm">{currentUser?.avatar || '👑'}</span>
            </button>
          </div>

        </div>
      </nav>

      {/* Lock Notification Toast Alert */}
      {lockedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-shake-reject">
          <div className="px-5 py-2.5 rounded-2xl bg-slate-950 border border-amber-500/50 shadow-2xl flex items-center gap-2 text-xs font-black text-amber-300 backdrop-blur-xl">
            <Lock size={14} className="text-amber-400" />
            <span>{lockedToast}</span>
          </div>
        </div>
      )}

      {/* Game Mode Selector Modal */}
      <GameModeSelectionModal
        isOpen={showGameModeModal}
        onClose={() => setShowGameModeModal(false)}
      />

      {/* Profile & Auth Modal */}
      <OnboardingAuthModal 
        isOpen={showAuthModal} 
        initialTab={authModalTab}
        onClose={() => setShowAuthModal(false)} 
      />

      {/* BCCI Official Rules Modal */}
      <BCCIRulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />

      {/* Reset Season Confirmation Modal */}
      {showResetConfirm && activeCamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-950 border border-rose-500/30 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-3">
              <RotateCcw size={24} />
            </div>
            <h3 className="text-base font-black text-white mb-1">
              Reset {franchise.name} Season?
            </h3>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              This will restart the IPL 2027 cycle for this franchise back to the Trade Window with the original 2026 squad and full purse.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetCampaign(activeCamp.id)
                  setShowResetConfirm(false)
                  router.push('/trade')
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white cursor-pointer shadow-lg shadow-rose-600/30"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
