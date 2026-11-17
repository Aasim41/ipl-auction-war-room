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
  VolumeX
} from 'lucide-react'
import { useCampaignStore } from '../store/useCampaignStore'
import { getFranchise } from '../data/franchises'
import { OnboardingAuthModal } from './OnboardingAuthModal'
import { BCCIRulesModal } from './BCCIRulesModal'
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
    resetCampaign 
  } = useCampaignStore()

  const [mounted, setMounted] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showRulesModal, setShowRulesModal] = useState(false)
  const [showTeamSwitcher, setShowTeamSwitcher] = useState(false)
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

  // The 4 Core Sequential Phases
  const phaseOrder: Record<string, number> = {
    'trade': 1,
    'retain_release': 2,
    'mini_auction': 3,
    'playing_xi': 4,
    'match': 4
  }
  const currentPhaseOrder = phaseOrder[activeCamp?.currentPhase || 'trade'] || 1

  const PHASES = [
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
      isLocked: currentPhaseOrder < 4
    },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 w-full h-12 sm:h-14 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 z-50 shadow-2xl overflow-x-hidden">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-2 sm:px-4 gap-2">
          
          {/* Left: Navigation & Franchise Identity */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {pathname !== '/' && (
              <button
                onClick={() => {
                  gameAudio.playUiTap('light')
                  triggerGameHaptic('light')
                  handleBack()
                }}
                className="px-2 sm:px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-black flex items-center gap-1 border border-white/10 cursor-pointer shadow-sm transition-all shrink-0"
                title="Return to Dashboard"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
            )}

            <Link href="/" className="flex items-center gap-1.5 group shrink-0">
              <TeamLogo teamId={franchise.id} size={30} className="transition-transform group-hover:scale-105" />
              <div className="hidden md:block leading-tight text-left">
                <span className="font-display font-black text-xs sm:text-sm text-white tracking-wide block">
                  AUCTION<span style={{ color: franchise.color || '#e11d48' }}>XI</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono block">
                  {franchise.name}
                </span>
              </div>
            </Link>

            {/* Quick Saves / Switcher Dropdown */}
            {activeCamp && (
              <div className="relative">
                <button
                  onClick={() => setShowTeamSwitcher(!showTeamSwitcher)}
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer border border-white/10"
                  title="Switch franchise campaign save"
                >
                  <span className="max-w-[120px] sm:max-w-[160px] truncate">{franchise.name}</span>
                  <ChevronDown size={11} className="text-gray-400" />
                </button>

                {showTeamSwitcher && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-white/20 rounded-2xl p-2.5 shadow-2xl z-50 text-white backdrop-blur-xl">
                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2 px-1">
                      Active Franchise Saves
                    </div>
                    <div className="space-y-1 max-h-52 overflow-y-auto">
                      {Object.values(campaigns).map((c) => {
                        const f = getFranchise(c.teamId)
                        const isSelected = c.id === activeCamp.id
                        return (
                          <button
                            key={c.id}
                            onClick={() => {
                              switchCampaign(c.id)
                              setShowTeamSwitcher(false)
                            }}
                            className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-xs font-bold cursor-pointer transition-all ${
                              isSelected ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'hover:bg-white/10 text-gray-300'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <TeamLogo teamId={f.id} size={22} />
                              <span className="truncate max-w-[130px]">{f.name}</span>
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 shrink-0">
                              ₹{c.remainingPurse.toFixed(1)}Cr
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    <div className="pt-2 border-t border-white/10 mt-2 flex items-center justify-between">
                      <Link
                        href="/select-team"
                        onClick={() => setShowTeamSwitcher(false)}
                        className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <Plus size={11} /> New Franchise Save
                      </Link>
                      <button
                        onClick={() => {
                          setShowTeamSwitcher(false)
                          setShowResetConfirm(true)
                        }}
                        className="text-[10px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={11} /> Reset Season
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Center: The 4 Championship Phases (Strictly locked past phases) */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-[55vw] sm:max-w-none scrollbar-none py-1 px-1">
            {PHASES.map((phase) => {
              const isActive = pathname === phase.href
              const isLocked = phase.isLocked

              // LOCKED PHASES ARE COMPLETELY UNCLICKABLE — STRICT "NO GOING BACK" RULE
              if (isLocked) {
                return (
                  <div
                    key={phase.id}
                    onClick={() => triggerLockedAlert(phase.label, phase.isConcluded)}
                    title={phase.isConcluded ? "Phase finalized and locked by BCCI regulations. You cannot go back." : "Complete current phase to unlock."}
                    className="px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 shrink-0 bg-slate-900/60 text-gray-500 border border-white/5 cursor-not-allowed opacity-60 hover:opacity-80 transition-opacity"
                  >
                    <Lock size={11} className={phase.isConcluded ? "text-amber-500/70" : "text-gray-500"} />
                    <span className="hidden md:inline">{phase.label}</span>
                    <span className="md:hidden">{phase.shortLabel}</span>
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
                  }}
                  className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-[1.02] border border-amber-400'
                      : 'text-gray-300 hover:text-white bg-slate-900/80 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping shrink-0" />
                  )}
                  <phase.icon size={12} className={isActive ? 'text-slate-950' : 'text-gray-400'} />
                  <span className="hidden md:inline">{phase.label}</span>
                  <span className="md:hidden">{phase.shortLabel}</span>
                </Link>
              )
            })}

            {/* Quick Rules Button */}
            <button
              onClick={() => setShowRulesModal(true)}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer shrink-0 hidden lg:flex items-center gap-1"
            >
              <Shield size={12} className="text-amber-400" />
              <span>Rules</span>
            </button>
          </div>

          {/* Right: Live Gaming HUD Stats (Purse + Squad + Profile) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {activeCamp && (
              <>
                {/* Purse Pill */}
                <div 
                  className="px-2 sm:px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-1 text-xs font-mono font-black text-amber-300"
                  title="Remaining Mini-Auction Purse"
                >
                  <Coins size={13} className="text-amber-400" />
                  <span>₹{remainingPurse.toFixed(1)}Cr</span>
                </div>

                {/* Squad Count Pill */}
                <div 
                  className="px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-1 text-[11px] font-mono font-bold text-gray-300 hidden sm:flex"
                  title="Active squad size (Max 25) & Overseas count (Max 8)"
                >
                  <Users size={12} className="text-sky-400" />
                  <span>{activeCount}/25</span>
                  <span className={`text-[10px] px-1 rounded ${overseasCount > 8 ? 'bg-rose-500/30 text-rose-300' : 'bg-white/5 text-gray-400'}`}>
                    {overseasCount} OS
                  </span>
                </div>
              </>
            )}

            {/* Audio Sound & Haptics Toggle */}
            <button
              onClick={toggleSound}
              className={`px-2 py-1 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer border ${
                isMuted 
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25' 
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
              }`}
              title={isMuted ? 'Game Audio Muted (Click to Unmute)' : 'Game Audio Active (Click to Mute)'}
            >
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} className="animate-pulse" />}
              <span className="hidden md:inline text-[10px] font-mono font-black">{isMuted ? 'MUTED' : 'SFX'}</span>
            </button>

            {/* GM Profile Pill */}
            <button
              onClick={() => {
                gameAudio.playUiTap('light')
                setShowAuthModal(true)
              }}
              className="px-2 sm:px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center gap-1.5 text-xs font-black cursor-pointer transition-all border border-white/15"
              title="Manager Profile & Save Slots"
            >
              <span className="text-sm">{currentUser?.avatar || '👑'}</span>
              <span className="hidden sm:inline text-xs max-w-[80px] truncate">
                {currentUser?.gamerTag || 'GM'}
              </span>
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

      {/* Profile & Auth Modal */}
      <OnboardingAuthModal 
        isOpen={showAuthModal} 
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
