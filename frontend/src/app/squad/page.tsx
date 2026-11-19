'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  IndianRupee, 
  Globe, 
  Shield, 
  Flame, 
  Check, 
  X, 
  ArrowRight, 
  Target, 
  Share2, 
  RotateCcw,
  Swords,
  Search,
  Filter,
  ArrowLeft
} from 'lucide-react'
import { useCampaignStore, CampaignPlayer } from '../../store/useCampaignStore'
import { CampaignPhaseStepper } from '../../components/CampaignPhaseStepper'
import { getFranchise } from '../../data/franchises'
import TacticalMatchupModal from '../../components/TacticalMatchupModal'
import SquadExportModal from '../../components/SquadExportModal'
import BallByBallMatchSimulator from '../../components/BallByBallMatchSimulator'
import { gameAudio, triggerGameHaptic } from '../../lib/gameAudioAndHaptics'

export default function SquadRetainReleasePage() {
  const router = useRouter()
  const { getActiveCampaign, togglePlayerRetention, advancePhase, resetCampaign } = useCampaignStore()
  const campaign = getActiveCampaign()

  const [roleFilter, setRoleFilter] = useState<'ALL' | 'BAT' | 'BOWL' | 'AR' | 'WK'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [showMatchupModal, setShowMatchupModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showConfirmAuction, setShowConfirmAuction] = useState(false)
  const [showSimulator, setShowSimulator] = useState(false)
  const [expandedSquadPlayerId, setExpandedSquadPlayerId] = useState<string | null>(null)

  const squadTouchStartX = React.useRef<number | null>(null)
  const squadTouchStartY = React.useRef<number | null>(null)

  const handleSquadTouchStart = (e: React.TouchEvent) => {
    squadTouchStartX.current = e.touches[0].clientX
    squadTouchStartY.current = e.touches[0].clientY
  }

  const handleSquadTouchEnd = (e: React.TouchEvent) => {
    if (squadTouchStartX.current === null || squadTouchStartY.current === null) return
    const deltaX = e.changedTouches[0].clientX - squadTouchStartX.current
    const deltaY = e.changedTouches[0].clientY - squadTouchStartY.current
    squadTouchStartX.current = null
    squadTouchStartY.current = null

    const roles: Array<'ALL' | 'BAT' | 'AR' | 'WK' | 'BOWL'> = ['ALL', 'BAT', 'AR', 'WK', 'BOWL']
    const curIdx = roles.indexOf(roleFilter)

    if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > Math.abs(deltaY) * 0.75) {
      if (deltaX < 0 && curIdx < roles.length - 1) {
        setRoleFilter(roles[curIdx + 1])
        gameAudio.playUiTap('select')
        triggerGameHaptic('light')
      } else if (deltaX > 0 && curIdx > 0) {
        setRoleFilter(roles[curIdx - 1])
        gameAudio.playUiTap('select')
        triggerGameHaptic('light')
      }
    }
  }

  // Synchronize with GlobalSwipeManager custom event
  useEffect(() => {
    const handleAppSwipe = (e: any) => {
      const direction = e.detail?.direction
      const roles: Array<'ALL' | 'BAT' | 'AR' | 'WK' | 'BOWL'> = ['ALL', 'BAT', 'AR', 'WK', 'BOWL']
      const curIdx = roles.indexOf(roleFilter)
      if (direction === 'left' && curIdx < roles.length - 1) {
        e.preventDefault()
        setRoleFilter(roles[curIdx + 1])
        gameAudio.playUiTap('select')
        triggerGameHaptic('light')
      } else if (direction === 'right' && curIdx > 0) {
        e.preventDefault()
        setRoleFilter(roles[curIdx - 1])
        gameAudio.playUiTap('select')
        triggerGameHaptic('light')
      }
    }
    window.addEventListener('app:swipe', handleAppSwipe)
    return () => window.removeEventListener('app:swipe', handleAppSwipe)
  }, [roleFilter])
  const isRetainLocked = campaign?.lockedPhases?.includes('retain_release')

  const squadList = campaign?.squad || []

  // Filtering squad - Top Level Hook (Rules of Hooks Compliance)
  const filteredSquad = useMemo(() => {
    return squadList.filter((p) => {
      const matchesRole = roleFilter === 'ALL' || p.role === roleFilter
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesRole && matchesSearch
    })
  }, [squadList, roleFilter, searchQuery])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Strict cycle lockdown: redirect if Retain & Release is concluded
  useEffect(() => {
    if (mounted && campaign && campaign.lockedPhases?.includes('retain_release')) {
      const target = campaign.currentPhase === 'playing_xi' || campaign.currentPhase === 'match'
        ? '/playing-xi'
        : '/auction'
      router.replace(target)
    }
  }, [mounted, campaign, router])

  if (!mounted) {
    return <div className="min-h-screen bg-slate-950" />
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white text-center overflow-x-hidden">
        <div className="p-8 rounded-3xl bg-slate-900 border border-white/10 max-w-md">
          <Shield size={36} className="mx-auto text-amber-400 mb-3" />
          <h3 className="text-lg font-black font-display mb-2">No Active Franchise Campaign</h3>
          <p className="text-xs text-gray-400 mb-4">Select your team to start your IPL 2027 campaign.</p>
          <button
            onClick={() => router.push('/select-team')}
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase cursor-pointer"
          >
            Select Franchise
          </button>
        </div>
      </div>
    )
  }

  const franchise = getFranchise(campaign.teamId)

  // Squad Metrics
  const retainedPlayers = campaign.squad.filter((p) => !p.is_released)
  const releasedPlayers = campaign.squad.filter((p) => p.is_released)
  const overseasCount = retainedPlayers.filter((p) => p.is_overseas).length
  const wkCount = retainedPlayers.filter((p) => p.role === 'WK').length
  const batCount = retainedPlayers.filter((p) => p.role === 'BAT').length
  const bowlCount = retainedPlayers.filter((p) => p.role === 'BOWL').length
  const arCount = retainedPlayers.filter((p) => p.role === 'AR').length

  const releasedPurseGain = releasedPlayers.reduce((sum, p) => sum + (p.price || 0), 0)

  // Proceed to Mini-Auction
  const handleProceedToAuction = () => {
    if (isRetainLocked) {
      router.push('/auction')
    } else {
      setShowConfirmAuction(true)
    }
  }

  return (
    <div 
      onTouchStart={handleSquadTouchStart}
      onTouchEnd={handleSquadTouchEnd}
      onTouchCancel={() => {
        squadTouchStartX.current = null
        squadTouchStartY.current = null
      }}
      className="min-h-[100dvh] bg-transparent text-white flex flex-col safe-page-top pb-16 w-full max-w-full overflow-x-hidden touch-manipulation select-none"
    >
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-3 sm:py-4 flex-1 flex flex-col gap-3.5">
        
        {/* Minimal Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-white/10 gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-black uppercase">
                  ROSTER RETENTIONS
                </span>
                <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">Lock Core Stars • Reclaim Purse</span>
              </div>
              <h1 className="text-base sm:text-lg font-black font-display text-white">
                {franchise.name} Retention Desk
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowMatchupModal(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Target size={13} />
              <span>Hawkeye</span>
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Share2 size={13} />
              <span>Export</span>
            </button>
            <button
              onClick={handleProceedToAuction}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shrink-0"
            >
              <span>Proceed to Auction</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Minimal 4 Vitals Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Auction Purse</span>
            <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono mt-0.5">
              ₹{campaign.remainingPurse.toFixed(1)} <span className="text-xs text-gray-400">Cr</span>
            </div>
            <span className="text-[10px] text-emerald-300 font-mono mt-0.5">+₹{releasedPurseGain.toFixed(1)} Cr refunds</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Retained Squad</span>
            <div className="text-lg sm:text-xl font-black text-white font-mono mt-0.5">
              {retainedPlayers.length} <span className="text-xs text-gray-500">/ 25</span>
            </div>
            <span className="text-[10px] text-amber-400 font-mono mt-0.5">{25 - retainedPlayers.length} slots open</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Overseas Quota</span>
            <div className={`text-lg sm:text-xl font-black font-mono mt-0.5 ${overseasCount >= 8 ? 'text-rose-400' : 'text-sky-400'}`}>
              {overseasCount} <span className="text-xs text-gray-500">/ 8</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono mt-0.5">{8 - overseasCount} slots open</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Composition</span>
            <div className="text-xs font-bold text-white font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className={wkCount >= 2 ? 'text-emerald-400' : 'text-amber-400'}>{wkCount} WK</span>
              <span>•</span>
              <span className="text-sky-300">{batCount} BAT</span>
              <span>•</span>
              <span className="text-rose-300">{bowlCount} BOWL</span>
            </div>
            <span className={`text-[10px] font-mono mt-0.5 ${wkCount >= 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {wkCount >= 2 ? '✓ 2+ WK Satisfied' : '⚠️ Need 2+ WK'}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-white/10 w-full sm:w-auto overflow-x-auto">
            {(['ALL', 'BAT', 'BOWL', 'AR', 'WK'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  roleFilter === r
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : r}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Search squad player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Mobile Role Swipe Indicator */}
        <div className="flex sm:hidden items-center justify-between px-3 py-1 bg-slate-900/80 rounded-xl border border-white/10 text-[9px] font-mono text-gray-400">
          <span>👈 Swipe</span>
          <span className="text-amber-400 font-bold uppercase">Role: {roleFilter === 'ALL' ? 'All Roles' : roleFilter}</span>
          <span>Swipe 👉</span>
        </div>

        {/* Squad Cards Grid (Clean Page-Level Scrolling with Touch Swipe) */}
        <div 
          onTouchStart={handleSquadTouchStart}
          onTouchEnd={handleSquadTouchEnd}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 select-none"
        >
            {filteredSquad.map((player) => {
              const isReleased = player.is_released
              const isExpanded = expandedSquadPlayerId === player.player_id
              const ovr = Number(player.Power_Index) || 80
              const formBadge = ovr >= 90 ? '🔥 ON FIRE' : ovr >= 80 ? '⚡ IN FORM' : '❄️ COLD'

              return (
                <div
                  key={player.player_id}
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                    isReleased
                      ? 'bg-rose-950/20 border-rose-500/40 opacity-75'
                      : 'bg-slate-900/90 border-white/10 hover:border-amber-400/40'
                  }`}
                >
                  {/* Top: Name, Role, Rating */}
                  <div 
                    onClick={() => {
                      setExpandedSquadPlayerId(isExpanded ? null : player.player_id);
                      gameAudio.playUiTap('light');
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                          <span>{player.name}</span>
                          {player.is_overseas && (
                            <span className="text-[8px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                              OS ✈
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <span className="font-bold text-indigo-300">{player.role}</span>
                          <span>•</span>
                          <span>Salary: <strong className="text-white">₹{player.price} Cr</strong></span>
                          <span className="text-amber-400 text-[8px] font-bold">{isExpanded ? '▲ Less' : '▼ More'}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border block ${
                          ovr >= 90 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                            : ovr >= 80 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {formBadge}
                        </span>
                      </div>
                    </div>

                    {player.statsSummary && (
                      <p className="text-[9px] text-gray-400 line-clamp-1 mt-1 bg-white/5 px-1.5 py-0.5 rounded-lg">
                        {player.statsSummary}
                      </p>
                    )}

                    {/* Expandable Player Profile Tray */}
                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-2 gap-1.5 text-xs font-mono animate-fadeIn">
                        <div className="p-1 rounded-lg bg-white/5 border border-white/5">
                          <span className="text-[8px] text-gray-400 block">Cap Share</span>
                          <span className="text-amber-300 font-bold text-[10px]">~{((Number(player.price) / 125) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="p-1 rounded-lg bg-white/5 border border-white/5">
                          <span className="text-[8px] text-gray-400 block">Fortress Fit</span>
                          <span className="text-emerald-400 font-bold text-[10px]">✓ 93% Match</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom: Retain / Release Action Button */}
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[9px] text-gray-400">
                      {isReleased ? (
                        <span className="text-rose-400 font-bold">Entering Mini-Auction</span>
                      ) : (
                        <span className="text-emerald-400 font-bold">Locked in Squad</span>
                      )}
                    </span>

                    <button
                      onClick={() => {
                        gameAudio.playUiTap('medium')
                        triggerGameHaptic('light')
                        togglePlayerRetention(player.player_id)
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 cursor-pointer transition-all ${
                        isReleased
                          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {isReleased ? (
                        <>
                          <Check size={11} />
                          <span>Undo (Retain)</span>
                        </>
                      ) : (
                        <>
                          <X size={11} />
                          <span>Release (+₹{player.price} Cr)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-2 p-2 rounded-xl bg-slate-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-gray-300 text-center sm:text-left">
            <span>Retained <strong className="text-white">{retainedPlayers.length}</strong> players ({25 - retainedPlayers.length} open auction slots).</span>
            <span className="block text-[10px] text-gray-400 font-mono">
              Mini-Auction Purse: <strong className="text-emerald-400">₹{campaign.remainingPurse.toFixed(2)} Cr</strong>.
            </span>
          </div>

          <button
            onClick={handleProceedToAuction}
            className="w-full sm:w-auto px-5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer hover:scale-[1.02] transition-all"
          >
            <span>Lock Retentions & Enter Mini-Auction</span>
            <ArrowRight size={13} />
          </button>
        </div>

      </main>

      {/* Hawkeye Tactical Matchup Radar Modal */}
      <TacticalMatchupModal
        isOpen={showMatchupModal}
        onClose={() => setShowMatchupModal(false)}
        defaultBatter={retainedPlayers.find((p) => p.role === 'BAT' || p.role === 'WK')?.name || 'Rohit Sharma'}
        defaultBowler={retainedPlayers.find((p) => p.role === 'BOWL')?.name || 'Jasprit Bumrah'}
        onProceedToMatch={() => {
          setShowMatchupModal(false)
          setShowSimulator(true)
        }}
      />

      {/* Squad Export Card Modal */}
      {showExportModal && (
        <SquadExportModal
          franchise={franchise}
          squad={retainedPlayers}
          stadiumName={franchise.stadiumName}
          stadiumCity={franchise.stadiumCity}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Ball by Ball Match Simulator Modal */}
      <BallByBallMatchSimulator
        isOpen={showSimulator}
        onClose={() => setShowSimulator(false)}
        myFranchise={franchise}
        mySquad={campaign.squad}
        rivalFranchise={getFranchise(campaign.teamId === 'csk' ? 'rcb' : 'csk')}
        venueName={franchise.stadiumName}
      />
      {/* Confirmation Modal to Lock Retentions & Enter Auction */}
      {showConfirmAuction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-950 border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
              <Shield size={22} />
            </div>
            <h3 className="text-base font-black text-white mb-1.5">
              Submit Official Retentions to BCCI?
            </h3>
            <p className="text-xs text-gray-300 mb-5 leading-relaxed">
              Once submitted, all released players enter the Mini-Auction pool and your retained list is locked permanently for this cycle. There is no going back.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowConfirmAuction(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 cursor-pointer"
              >
                Review List
              </button>
              <button
                onClick={() => {
                  setShowConfirmAuction(false)
                  gameAudio.playPhaseLock()
                  triggerGameHaptic('lock')
                  advancePhase('mini_auction')
                  router.push('/auction')
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-slate-950 cursor-pointer shadow-lg shadow-amber-500/30"
              >
                Confirm & Lock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
