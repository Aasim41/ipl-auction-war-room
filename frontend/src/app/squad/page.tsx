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
        <div className="flex items-center justify-between pb-2 border-b border-white/10 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-black font-display text-white">
              {franchise.short} Retentions
            </h1>
            <span 
              style={{
                backgroundColor: `${myTheme.primary}30`,
                borderColor: `${myTheme.primary}60`,
                color: myTheme.contrastText === '#000000' ? '#fbbf24' : '#ffffff',
              }}
              className="px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold shadow-sm"
            >
              {retainedPlayers.length} Retained
            </span>
          </div>

          <button
            onClick={handleProceedToAuction}
            style={{
              backgroundColor: myTheme.pillBg,
              color: myTheme.pillText,
              boxShadow: `0 0 15px ${myTheme.primary}60`,
            }}
            className="px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm cursor-pointer active:scale-95 transition-all shrink-0 hover:brightness-110"
          >
            <span>To Auction</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Minimal 4 Vitals Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <div 
            style={{
              background: myTheme.cardBg,
              borderColor: myTheme.cardBorder,
              boxShadow: myTheme.cardGlow,
            }}
            className="p-2.5 rounded-2xl border flex flex-col justify-between shadow-md"
          >
            <span className="text-[9px] font-mono text-gray-300 uppercase font-bold">Purse</span>
            <div className="text-base font-black text-emerald-400 font-mono">
              ₹{campaign.remainingPurse.toFixed(1)} <span className="text-[10px] text-gray-300">Cr</span>
            </div>
            <span className="text-[9px] text-emerald-300 font-mono font-bold">+₹{releasedPurseGain.toFixed(1)} Cr back</span>
          </div>

          <div 
            style={{
              background: myTheme.cardBg,
              borderColor: myTheme.cardBorder,
              boxShadow: myTheme.cardGlow,
            }}
            className="p-2.5 rounded-2xl border flex flex-col justify-between shadow-md"
          >
            <span className="text-[9px] font-mono text-gray-300 uppercase font-bold">Squad</span>
            <div className="text-base font-black text-white font-mono">
              {retainedPlayers.length} <span className="text-[10px] text-gray-400">/ 25</span>
            </div>
            <span 
              style={{ color: myTheme.accent }}
              className="text-[9px] font-mono font-bold"
            >
              {25 - retainedPlayers.length} open
            </span>
          </div>

          <div 
            style={{
              background: myTheme.cardBg,
              borderColor: myTheme.cardBorder,
              boxShadow: myTheme.cardGlow,
            }}
            className="p-2.5 rounded-2xl border flex flex-col justify-between shadow-md"
          >
            <span className="text-[9px] font-mono text-gray-300 uppercase font-bold">Overseas</span>
            <div className={`text-base font-black font-mono ${overseasCount >= 8 ? 'text-rose-400' : 'text-sky-300'}`}>
              {overseasCount} <span className="text-[10px] text-gray-400">/ 8</span>
            </div>
            <span className="text-[9px] text-gray-300 font-mono">{8 - overseasCount} open</span>
          </div>

          <div 
            style={{
              background: myTheme.cardBg,
              borderColor: myTheme.cardBorder,
              boxShadow: myTheme.cardGlow,
            }}
            className="p-2.5 rounded-2xl border flex flex-col justify-between shadow-md"
          >
            <span className="text-[9px] font-mono text-gray-300 uppercase font-bold">Composition</span>
            <div className="text-[11px] font-bold text-white font-mono flex items-center gap-1 flex-wrap">
              <span className={wkCount >= 2 ? 'text-emerald-400' : 'text-amber-300'}>{wkCount} WK</span>
              <span>•</span>
              <span className="text-sky-300">{batCount} BAT</span>
              <span>•</span>
              <span className="text-rose-300">{bowlCount} BOWL</span>
            </div>
            <span className={`text-[9px] font-mono font-bold ${wkCount >= 2 ? 'text-emerald-400' : 'text-amber-300'}`}>
              {wkCount >= 2 ? '✓ Satisfied' : '⚠️ Need 2+ WK'}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div 
            style={{
              background: `${myTheme.bgDeep}ee`,
              borderColor: `${myTheme.primary}45`,
            }}
            className="flex items-center gap-1.5 p-1 rounded-2xl border w-full sm:w-auto overflow-x-auto shadow-md"
          >
            {(['ALL', 'BAT', 'BOWL', 'AR', 'WK'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={roleFilter === r ? {
                  backgroundColor: myTheme.pillBg,
                  color: myTheme.pillText,
                  boxShadow: `0 0 12px ${myTheme.primary}70`,
                } : {
                  color: '#ffffff',
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  roleFilter === r ? 'font-black scale-[1.02]' : 'hover:bg-white/10'
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
              style={{
                background: `${myTheme.bgDeep}ee`,
                borderColor: `${myTheme.primary}45`,
              }}
              className="w-full border rounded-2xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-white shadow-md transition-all"
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
                    background: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(244, 63, 94, 0.5)',
                  } : {
                    background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
                    borderColor: `${myTheme.primary}70`,
                    boxShadow: `0 4px 20px ${myTheme.primary}25`,
                  }}
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                    isReleased ? 'opacity-65' : 'hover:scale-[1.01]'
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
                              className="text-[8px] px-1.5 py-0.2 rounded border font-extrabold bg-sky-500/20 text-sky-300 border-sky-400/40"
                            >
                              OS
                            </span>
                          )}
                          {player.is_captain && (
                            <span 
                              className="text-[8px] px-1.5 py-0.2 rounded border font-extrabold bg-amber-500/20 text-amber-300 border-amber-400/40"
                            >
                              CAPTAIN
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono flex items-center gap-1.5 mt-0.5">
                          <span 
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/10 text-gray-200 border border-white/10"
                          >
                            {getDetailedPlayerRole(player)}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span 
                            className="font-black text-emerald-400"
                          >
                            ₹{player.price} Cr
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span 
                          style={{
                            backgroundColor: `${myTheme.primary}20`,
                            color: myTheme.primary,
                            borderColor: `${myTheme.primary}50`,
                          }}
                          className="text-[9px] font-black px-2 py-0.5 rounded border block shadow-sm"
                        >
                          {ovr} OVR
                        </span>
                      </div>
                    </div>

                    {/* Expandable Player Profile Tray */}
                    {isExpanded && (
                      <div className="mt-1.5 pt-1.5 border-t border-white/20 grid grid-cols-2 gap-1 text-[10px] font-mono animate-fadeIn">
                        <div className="p-1 rounded bg-black/40 border border-white/10">
                          <span className="text-[8px] text-gray-300 block">Cap Share</span>
                          <span className="text-white font-black">~{((Number(player.price) / 125) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="p-1 rounded bg-black/40 border border-white/10">
                          <span className="text-[8px] text-gray-300 block">Fit</span>
                          <span className="text-white font-black">✓ 93% Match</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom: Retain / Release Action Button */}
                  <div className="mt-1.5 pt-1.5 border-t border-white/20 flex items-center justify-between">
                    <span className="text-[9px] font-mono">
                      {isReleased ? (
                        <span className="text-rose-400 font-black">Auction Pool</span>
                      ) : (
                        <span 
                          style={{
                            backgroundColor: myTheme.bgDeep,
                            color: myTheme.contrastText,
                            border: `1px solid ${myTheme.cardBorder}`
                          }} 
                          className="px-2 py-0.5 rounded text-[9px] font-black shadow-sm"
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
                        backgroundColor: myTheme.pillBg,
                        color: myTheme.pillText,
                        borderColor: myTheme.cardBorder,
                      } : {
                        backgroundColor: 'rgba(0, 0, 0, 0.55)',
                        color: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all border shadow-md hover:scale-105 active:scale-95"
                    >
                      {isReleased ? (
                        <>
                          <Check size={11} />
                          <span>Retain</span>
                        </>
                      ) : (
                        <>
                          <X size={11} />
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
            background: myTheme.cardBg,
            borderColor: myTheme.cardBorder,
            boxShadow: myTheme.cardGlow,
          }}
          className="mt-2 p-2.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 shadow-lg"
        >
          <div className="text-[11px] text-gray-200 text-center sm:text-left">
            <span>Retained <strong className="text-white font-black">{retainedPlayers.length}</strong> players ({25 - retainedPlayers.length} open auction slots).</span>
            <span className="block text-[10px] text-gray-300 font-mono">
              Mini-Auction Purse: <strong className="text-white font-black">₹{campaign.remainingPurse.toFixed(2)} Cr</strong>
            </span>
          </div>

          <button
            onClick={handleProceedToAuction}
            style={{
              backgroundColor: myTheme.pillBg,
              color: myTheme.pillText,
              boxShadow: `0 0 20px ${myTheme.primary}80`,
            }}
            className="w-full sm:w-auto px-6 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
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
