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
import { getTeamTheme } from '../../data/teamThemes'

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

  const myTheme = getTeamTheme(franchise.id)

  return (
    <div 
      className="min-h-[100dvh] bg-transparent text-white flex flex-col safe-page-top pb-16 w-full max-w-full overflow-x-hidden select-none"
    >
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-3 sm:py-4 flex-1 flex flex-col gap-3.5">
        
        {/* Minimal Header */}
        <div 
          style={{
            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
            borderColor: `${myTheme.primary}70`,
            boxShadow: `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 14px ${myTheme.primary}20`,
          }}
          className="p-3 rounded-2xl border flex items-center justify-between gap-2 shrink-0 shadow-xl"
        >
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-black font-display text-white tracking-wide">
              {franchise.short} Retentions
            </h1>
            <span 
              style={{
                backgroundColor: `${myTheme.primary}30`,
                borderColor: `${myTheme.primary}70`,
                color: '#ffffff',
              }}
              className="px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-black shadow-sm"
            >
              {retainedPlayers.length} Retained
            </span>
          </div>

          <button
            onClick={handleProceedToAuction}
            style={{
              backgroundColor: myTheme.pillBg,
              color: myTheme.pillText,
              boxShadow: `0 0 16px ${myTheme.primary}80`,
            }}
            className="px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95 transition-all shrink-0 hover:brightness-110"
          >
            <span>To Auction</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Minimal 4 Vitals Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div 
            style={{
              background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
              borderColor: `${myTheme.primary}60`,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
            }}
            className="p-3 rounded-2xl border flex flex-col justify-between shadow-lg"
          >
            <span className="text-[10px] font-mono text-gray-300 uppercase font-black tracking-wider">Purse</span>
            <div className="text-lg font-black text-emerald-400 font-mono my-0.5">
              ₹{campaign.remainingPurse.toFixed(1)} <span className="text-xs text-gray-300 font-bold">Cr</span>
            </div>
            <span className="text-[10px] text-emerald-300 font-mono font-bold">+₹{releasedPurseGain.toFixed(1)} Cr back</span>
          </div>

          <div 
            style={{
              background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
              borderColor: `${myTheme.primary}60`,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
            }}
            className="p-3 rounded-2xl border flex flex-col justify-between shadow-lg"
          >
            <span className="text-[10px] font-mono text-gray-300 uppercase font-black tracking-wider">Squad</span>
            <div className="text-lg font-black text-white font-mono my-0.5">
              {retainedPlayers.length} <span className="text-xs text-gray-400 font-bold">/ 25</span>
            </div>
            <span 
              style={{ color: myTheme.accent }}
              className="text-[10px] font-mono font-bold"
            >
              {25 - retainedPlayers.length} open
            </span>
          </div>

          <div 
            style={{
              background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
              borderColor: `${myTheme.primary}60`,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
            }}
            className="p-3 rounded-2xl border flex flex-col justify-between shadow-lg"
          >
            <span className="text-[10px] font-mono text-gray-300 uppercase font-black tracking-wider">Overseas</span>
            <div className={`text-lg font-black font-mono my-0.5 ${overseasCount >= 8 ? 'text-rose-400' : 'text-sky-300'}`}>
              {overseasCount} <span className="text-xs text-gray-400 font-bold">/ 8</span>
            </div>
            <span className="text-[10px] text-gray-300 font-mono font-bold">{8 - overseasCount} open</span>
          </div>

          <div 
            style={{
              background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
              borderColor: `${myTheme.primary}60`,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
            }}
            className="p-3 rounded-2xl border flex flex-col justify-between shadow-lg"
          >
            <span className="text-[10px] font-mono text-gray-300 uppercase font-black tracking-wider">Composition</span>
            <div className="text-[11px] font-bold text-white font-mono flex items-center gap-1 flex-wrap my-0.5">
              <span className={wkCount >= 2 ? 'text-emerald-400 font-black' : 'text-amber-300 font-black'}>{wkCount} WK</span>
              <span className="text-gray-500">•</span>
              <span className="text-sky-300 font-black">{batCount} BAT</span>
              <span className="text-gray-500">•</span>
              <span className="text-rose-300 font-black">{bowlCount} BOWL</span>
            </div>
            <span className={`text-[10px] font-mono font-bold ${wkCount >= 2 ? 'text-emerald-400' : 'text-amber-300'}`}>
              {wkCount >= 2 ? '✓ Satisfied' : '⚠️ Need 2+ WK'}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div 
            style={{
              background: '#0f172a',
              borderColor: 'rgba(255, 255, 255, 0.15)',
            }}
            className="flex items-center gap-1.5 p-1.5 rounded-2xl border w-full sm:w-auto overflow-x-auto shadow-lg"
          >
            {(['ALL', 'BAT', 'BOWL', 'AR', 'WK'] as const).map((r) => {
              const isSelected = roleFilter === r;
              return (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  style={isSelected ? {
                    backgroundColor: myTheme.pillBg,
                    color: myTheme.pillText,
                    borderColor: myTheme.primary,
                    boxShadow: `0 0 14px ${myTheme.primary}80`,
                  } : {
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all border shadow-sm ${
                    isSelected ? 'scale-[1.02]' : 'hover:bg-slate-700/80 hover:text-white'
                  }`}
                >
                  {r === 'ALL' ? 'All Roles' : r}
                </button>
              )
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Search squad player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: '#0f172a',
                borderColor: `${myTheme.primary}60`,
              }}
              className="w-full border rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-white shadow-lg transition-all"
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

              return (
                <div
                  key={player.player_id}
                  style={isReleased ? {
                    background: 'linear-gradient(145deg, #080d1a 0%, #171f33 100%)',
                    borderColor: 'rgba(244, 63, 94, 0.7)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6)',
                  } : {
                    background: 'linear-gradient(145deg, #0b1329 0%, #1e293b 100%)',
                    borderColor: `${myTheme.primary}80`,
                    boxShadow: `0 6px 20px rgba(0, 0, 0, 0.6), 0 0 16px ${myTheme.primary}25`,
                  }}
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xl ${
                    isReleased ? 'opacity-75 ring-1 ring-rose-500/30' : 'hover:scale-[1.01]'
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
                        <div 
                          className="font-black text-xs sm:text-sm flex items-center gap-1.5 drop-shadow-sm text-white"
                        >
                          <span>{player.name}</span>
                          {player.is_overseas && (
                            <span 
                              className="text-[9px] px-1.5 py-0.5 rounded font-black bg-sky-500/25 text-sky-300 border border-sky-400/50 shadow-sm"
                            >
                              OS
                            </span>
                          )}
                          {player.is_captain && (
                            <span 
                              className="text-[9px] px-1.5 py-0.5 rounded font-black bg-amber-500/25 text-amber-300 border border-amber-400/50 shadow-sm"
                            >
                              CAPTAIN
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono flex items-center gap-1.5 mt-1">
                          <span 
                            className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-100 border border-white/20 shadow-sm"
                          >
                            {getDetailedPlayerRole(player)}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span 
                            className="font-black text-emerald-400 font-mono text-xs"
                          >
                            ₹{player.price} Cr
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span 
                          style={{
                            backgroundColor: 'rgba(251, 191, 36, 0.15)',
                            color: '#fbbf24',
                            borderColor: 'rgba(251, 191, 36, 0.4)',
                          }}
                          className="text-[10px] font-black px-2 py-0.5 rounded border block shadow-sm font-mono"
                        >
                          {ovr} OVR
                        </span>
                      </div>
                    </div>

                    {/* Expandable Player Profile Tray */}
                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-white/20 grid grid-cols-2 gap-1.5 text-[10px] font-mono animate-fadeIn">
                        <div className="p-1.5 rounded-xl bg-slate-950/80 border border-white/15">
                          <span className="text-[9px] text-gray-300 block uppercase font-bold">Cap Share</span>
                          <span className="text-white font-black text-xs">~{((Number(player.price) / 125) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-slate-950/80 border border-white/15">
                          <span className="text-[9px] text-gray-300 block uppercase font-bold">Fit</span>
                          <span className="text-emerald-400 font-black text-xs">✓ 93% Match</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom: Retain / Release Action Button */}
                  <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-between">
                    <span className="text-[10px] font-mono">
                      {isReleased ? (
                        <span 
                          style={{
                            backgroundColor: 'rgba(244, 63, 94, 0.25)',
                            color: '#fda4af',
                            border: '1px solid rgba(244, 63, 94, 0.6)'
                          }} 
                          className="px-2.5 py-1 rounded-lg text-[10px] font-black shadow-sm"
                        >
                          Auction Pool
                        </span>
                      ) : (
                        <span 
                          style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.25)',
                            color: '#6ee7b7',
                            border: '1px solid rgba(16, 185, 129, 0.6)'
                          }} 
                          className="px-2.5 py-1 rounded-lg text-[10px] font-black shadow-sm"
                        >
                          ✓ Retained
                        </span>
                      )}
                    </span>

                    <button
                      onClick={() => {
                        gameAudio.playUiTap('medium')
                        triggerGameHaptic('light')
                        togglePlayerRetention(player.player_id)
                      }}
                      style={isReleased ? {
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        border: '1px solid #10b981',
                        boxShadow: '0 0 14px rgba(16, 185, 129, 0.5)',
                      } : {
                        backgroundColor: '#1e293b',
                        color: '#fda4af',
                        border: '1px solid rgba(244, 63, 94, 0.6)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-md hover:scale-105 active:scale-95"
                    >
                      {isReleased ? (
                        <>
                          <Check size={12} className="stroke-[3]" />
                          <span>Retain</span>
                        </>
                      ) : (
                        <>
                          <X size={12} className="stroke-[3]" />
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
        <div 
          style={{
            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
            borderColor: `${myTheme.primary}80`,
            boxShadow: `0 8px 24px rgba(0, 0, 0, 0.7), 0 0 16px ${myTheme.primary}25`,
          }}
          className="mt-3 p-3 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 shadow-2xl"
        >
          <div className="text-xs text-gray-200 text-center sm:text-left">
            <span>Retained <strong className="text-white font-black">{retainedPlayers.length}</strong> players ({25 - retainedPlayers.length} open auction slots).</span>
            <span className="block text-[11px] text-gray-300 font-mono mt-0.5">
              Mini-Auction Purse: <strong className="text-emerald-400 font-black">₹{campaign.remainingPurse.toFixed(2)} Cr</strong>
            </span>
          </div>

          <button
            onClick={handleProceedToAuction}
            style={{
              backgroundColor: myTheme.pillBg,
              color: myTheme.pillText,
              boxShadow: `0 0 20px ${myTheme.primary}80`,
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg text-white"
          >
            <span>Lock & Start Auction</span>
            <ArrowRight size={14} />
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
