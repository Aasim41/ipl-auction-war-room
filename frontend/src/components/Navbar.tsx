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
  Coins,
  ChevronDown,
  AlertCircle,
  Play,
  Trophy,
  HelpCircle
} from 'lucide-react'
import { useCampaignStore } from '../store/useCampaignStore'
import { getFranchise } from '../data/franchises'
import { OnboardingAuthModal } from './OnboardingAuthModal'
import { BCCIRulesModal } from './BCCIRulesModal'
import { GamerOnboardingModal } from './GamerOnboardingModal'
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
  const [authModalTab, setAuthModalTab] = useState<'saves' | 'create' | 'switch'>('saves')
  const [showRulesModal, setShowRulesModal] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [lockedToast, setLockedToast] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

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
    if (pathname === '/trophies' || pathname === '/stats' || pathname === '/win-prob' || pathname === '/hub') {
      router.push('/playing-xi')
      return
    }
    if (pathname === '/playing-xi') {
      // Already on main tournament dashboard
      return
    }
    if (pathname === '/auction') {
      router.push('/squad')
      return
    }
    if (pathname === '/squad') {
      router.push('/trade')
      return
    }
    if (pathname === '/trade') {
      router.push('/select-team')
      return
    }
    router.push('/playing-xi')
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
      label: '1. Trade', 
      shortLabel: '1. Trade',
      href: '/trade', 
      icon: ArrowLeftRight,
      isConcluded: currentPhaseOrder > 1 || lockedPhases.includes('trade'),
      isLocked: currentPhaseOrder !== 1
    },
    { 
      id: 'retain_release', 
      label: '2. Retain', 
      shortLabel: '2. Retain',
      href: '/squad', 
      icon: Users,
      isConcluded: currentPhaseOrder > 2 || lockedPhases.includes('retain_release'),
      isLocked: currentPhaseOrder !== 2
    },
    { 
      id: 'mini_auction', 
      label: '3. Auction', 
      shortLabel: '3. Auction',
      href: '/auction', 
      icon: Gavel,
      isConcluded: currentPhaseOrder > 3 || lockedPhases.includes('mini_auction'),
      isLocked: currentPhaseOrder !== 3
    },
    { 
      id: 'playing_xi', 
      label: '4. Play', 
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
      label: '1. Draft',
      shortLabel: '1. Draft',
      href: '/draft',
      icon: Users,
      isConcluded: currentPhaseOrder > 1 || lockedPhases.includes('draft'),
      isLocked: currentPhaseOrder !== 1
    },
    {
      id: 'mini_auction',
      label: '2. Auction',
      shortLabel: '2. Auction',
      href: '/auction',
      icon: Gavel,
      isConcluded: currentPhaseOrder > 2 || lockedPhases.includes('mini_auction'),
      isLocked: currentPhaseOrder < 2
    },
    {
      id: 'playing_xi',
      label: '3. Play',
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
      <nav className="app-safe-navbar fixed top-0 left-0 right-0 w-full z-50 bg-slate-950/95 backdrop-blur-xl border-t border-t-white/10 border-b border-white/10 shadow-2xl flex flex-col select-none overflow-x-hidden">
        {/* Interactive Navbar Controls Row */}
        <div className="w-full h-12 sm:h-13 flex items-center justify-between px-1.5 sm:px-4 gap-1 sm:gap-2">
          
          {/* Left: Navigation & Franchise Identity */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {pathname !== '/' && pathname !== '/playing-xi' ? (
              <button
                onClick={() => {
                  gameAudio.playUiTap('light')
                  triggerGameHaptic('light')
                  handleBack()
                }}
                className="p-1 sm:px-2 sm:py-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center gap-1 text-[11px] font-bold border border-white/10 cursor-pointer shadow-sm transition-all shrink-0"
                title="Return to Dashboard"
              >
                <ArrowLeft size={13} className="text-amber-400" />
                <span className="hidden md:inline">Back</span>
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
              className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-white transition-all cursor-pointer border border-white/10 group shrink-0"
              title="Click to view all Franchise Saves & Careers"
            >
              <TeamLogo teamId={franchise.id} size={18} className="transition-transform group-hover:scale-105 shrink-0" />
              <span className="font-mono font-black text-xs text-amber-400">
                {franchise.short}
              </span>
              <ChevronDown size={11} className="text-gray-400 group-hover:text-white transition-colors shrink-0" />
            </button>
          </div>

          {/* Center: Minimal Sequential Phase Stepper (Always 100% Fully Visible) */}
          <div className="flex items-center justify-center gap-0.5 sm:gap-1.5 shrink-0">
            {PHASES.map((phase) => {
              const isActive = pathname === phase.href
              const isLocked = phase.isLocked

              if (isLocked) {
                return (
                  <div
                    key={phase.id}
                    onClick={() => triggerLockedAlert(phase.label, phase.isConcluded)}
                    title={phase.isConcluded ? "Concluded and locked by BCCI regulations" : "Complete current phase to unlock"}
                    className="px-1 sm:px-2 py-0.5 rounded-md text-[8.5px] sm:text-[10px] font-bold flex items-center gap-0.5 sm:gap-1 shrink-0 bg-slate-900/40 text-gray-500 border border-white/5 cursor-not-allowed opacity-50"
                  >
                    <Lock size={8} className={phase.isConcluded ? "text-amber-500/60" : "text-gray-500"} />
                    <span>{phase.shortLabel}</span>
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
                  className={`px-1 sm:px-2 py-0.5 rounded-md text-[8.5px] sm:text-[10px] font-black flex items-center gap-0.5 sm:gap-1 transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                      : 'text-gray-300 hover:text-white bg-slate-900/80 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <phase.icon size={10} className={isActive ? 'text-slate-950' : 'text-gray-400'} />
                  <span>{phase.shortLabel}</span>
                </Link>
              )
            })}
          </div>

          {/* Right: Resume Match (if active & not on playing-xi) + Purse (not on playing-xi) + GM Profile */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {pathname !== '/playing-xi' && activeCamp?.activeMatchSimulation && !activeCamp.activeMatchSimulation.matchDone && (
              <Link
                href="/playing-xi"
                onClick={() => {
                  gameAudio.playUiTap('select');
                  triggerGameHaptic('light');
                }}
                className="px-1.5 sm:px-2 py-0.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:to-emerald-600/30 border border-emerald-400/50 text-emerald-300 font-mono font-bold text-[9.5px] sm:text-xs flex items-center gap-1 animate-pulse transition-all shrink-0 cursor-pointer shadow-sm"
                title="Resume Match in Progress"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <Play size={10} className="fill-emerald-400 text-emerald-400" />
                <span className="hidden sm:inline">Resume</span>
              </Link>
            )}

            {/* Purse visible on Trade, Squad, Auction - strictly hidden on Playing 11 */}
            {activeCamp && pathname !== '/playing-xi' && (
              <div 
                className="px-1.5 sm:px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center gap-0.5 sm:gap-1 text-[9.5px] sm:text-xs font-mono font-black text-amber-300 shrink-0"
                title="Remaining Purse"
              >
                <Coins size={10} className="text-amber-400 shrink-0" />
                <span>₹{remainingPurse.toFixed(1)}Cr</span>
              </div>
            )}

            {/* Universal Game Guide Button */}
            <button
              type="button"
              onClick={() => {
                gameAudio.playUiTap('light')
                triggerGameHaptic('light')
                setShowGuideModal(true)
              }}
              className="px-1.5 sm:px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-amber-300 hover:text-amber-200 flex items-center gap-1 text-[9.5px] sm:text-xs font-bold border border-white/10 transition-all cursor-pointer shrink-0"
              title="Game Guide & Simple Rules"
            >
              <HelpCircle size={11} className="text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            {/* GM Profile Pill */}
            <button
              type="button"
              onClick={() => {
                gameAudio.playUiTap('light')
                triggerGameHaptic('light')
                setAuthModalTab('switch')
                setShowAuthModal(true)
              }}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center text-xs font-black cursor-pointer transition-all border border-white/15 shrink-0"
              title="Manager Profile & Careers"
            >
              <span className="text-xs">{currentUser?.avatar || '👑'}</span>
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

      {/* Universal Plain-Language Game Guide Modal */}
      <GamerOnboardingModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* Onboarding & Career Management Modal */}
      <OnboardingAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialTab={authModalTab}
      />

      {/* BCCI Official Regulations & Handbook Modal */}
      <BCCIRulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />
    </>
  )
}
