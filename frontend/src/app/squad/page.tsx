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
import { gameAudio, triggerGameHaptic } from '../../lib/gameAudioAndHaptics'
import { getDetailedPlayerRole } from '../../lib/bowlerClassification'

export default function SquadRetainReleasePage() {
  const router = useRouter()
  const { getActiveCampaign, togglePlayerRetention, advancePhase, resetCampaign } = useCampaignStore()
  const campaign = getActiveCampaign()

  const [roleFilter, setRoleFilter] = useState<'ALL' | 'BAT' | 'BOWL' | 'AR' | 'WK'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const [showConfirmAuction, setShowConfirmAuction] = useState(false)
  const [expandedSquadPlayerId, setExpandedSquadPlayerId] = useState<string | null>(null)

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
      className="min-h-[100dvh] bg-transparent text-white flex flex-col safe-page-top pb-16 w-full max-w-full overflow-x-hidden select-none"
    >
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-3 sm:py-4 flex-1 flex flex-col gap-3.5">
        
        {/* Minimal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-black font-display text-white">
              {franchise.short} Retentions
            </h1>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold">
              {retainedPlayers.length} Retained
            </span>
          </div>

          <button
            onClick={handleProceedToAuction}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm cursor-pointer active:scale-95 transition-all shrink-0"
          >
            <span>To Auction</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Minimal 4 Vitals Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <div className="p-2 rounded-xl bg-slate-900 border border-white/10 flex flex-col justify-between">
            <span className="text-[9px] font-mono text-gray-400 uppercase">Purse</span>
            <div className="text-base font-black text-emerald-400 font-mono">
              ₹{campaign.remainingPurse.toFixed(1)} <span className="text-[10px] text-gray-400">Cr</span>
            </div>
            <span className="text-[9px] text-emerald-300 font-mono">+₹{releasedPurseGain.toFixed(1)} Cr back</span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900 border border-white/10 flex flex-col justify-between">
            <span className="text-[9px] font-mono text-gray-400 uppercase">Squad</span>
            <div className="text-base font-black text-white font-mono">
              {retainedPlayers.length} <span className="text-[10px] text-gray-500">/ 25</span>
            </div>
            <span className="text-[9px] text-amber-400 font-mono">{25 - retainedPlayers.length} open</span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900 border border-white/10 flex flex-col justify-between">
            <span className="text-[9px] font-mono text-gray-400 uppercase">Overseas</span>
            <div className={`text-base font-black font-mono ${overseasCount >= 8 ? 'text-rose-400' : 'text-sky-400'}`}>
              {overseasCount} <span className="text-[10px] text-gray-500">/ 8</span>
            </div>
            <span className="text-[9px] text-gray-400 font-mono">{8 - overseasCount} open</span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900 border border-white/10 flex flex-col justify-between">
            <span className="text-[9px] font-mono text-gray-400 uppercase">Composition</span>
            <div className="text-[11px] font-bold text-white font-mono flex items-center gap-1 flex-wrap">
              <span className={wkCount >= 2 ? 'text-emerald-400' : 'text-amber-400'}>{wkCount} WK</span>
              <span>•</span>
              <span className="text-sky-300">{batCount} BAT</span>
              <span>•</span>
              <span className="text-rose-300">{bowlCount} BOWL</span>
            </div>
            <span className={`text-[9px] font-mono ${wkCount >= 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {wkCount >= 2 ? '✓ Satisfied' : '⚠️ Need 2+ WK'}
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

        {/* Squad Cards Grid */}
        <div 
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
                  className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between overflow-hidden ${
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
                    <div className="flex items-start justify-between mb-0.5">
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1">
                          <span>{player.name}</span>
                          {player.is_overseas && (
                            <span className="text-[8px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                              OS
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <span className="font-bold text-indigo-300">{getDetailedPlayerRole(player)}</span>
                          <span>•</span>
                          <span>₹{player.price} Cr</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border block ${
                          ovr >= 90 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                            : ovr >= 80 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {ovr} OVR
                        </span>
                      </div>
                    </div>

                    {/* Expandable Player Profile Tray */}
                    {isExpanded && (
                      <div className="mt-1.5 pt-1.5 border-t border-white/10 grid grid-cols-2 gap-1 text-[10px] font-mono animate-fadeIn">
                        <div className="p-1 rounded bg-white/5">
                          <span className="text-[8px] text-gray-400 block">Cap Share</span>
                          <span className="text-amber-300 font-bold">~{((Number(player.price) / 125) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="p-1 rounded bg-white/5">
                          <span className="text-[8px] text-gray-400 block">Fit</span>
                          <span className="text-emerald-400 font-bold">✓ 93% Match</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom: Retain / Release Action Button */}
                  <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[9px] font-mono">
                      {isReleased ? (
                        <span className="text-rose-400 font-bold">Auction</span>
                      ) : (
                        <span className="text-emerald-400 font-bold">Retained</span>
                      )}
                    </span>

                    <button
                      onClick={() => {
                        gameAudio.playUiTap('medium')
                        triggerGameHaptic('light')
                        togglePlayerRetention(player.player_id)
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all ${
                        isReleased
                          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {isReleased ? (
                        <>
                          <Check size={10} />
                          <span>Retain</span>
                        </>
                      ) : (
                        <>
                          <X size={10} />
                          <span>Release (+₹{player.price}Cr)</span>
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
            <span>Lock & Start Auction</span>
            <ArrowRight size={13} />
          </button>
        </div>

      </main>




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
