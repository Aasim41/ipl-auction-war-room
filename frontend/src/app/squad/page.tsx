'use client'

import React, { useState, useMemo } from 'react'
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

export default function SquadRetainReleasePage() {
  const router = useRouter()
  const { getActiveCampaign, togglePlayerRetention, advancePhase, resetCampaign } = useCampaignStore()
  const campaign = getActiveCampaign()

  const [roleFilter, setRoleFilter] = useState<'ALL' | 'BAT' | 'BOWL' | 'AR' | 'WK'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [showMatchupModal, setShowMatchupModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showSimulator, setShowSimulator] = useState(false)

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

  // Filtering squad
  const filteredSquad = useMemo(() => {
    return campaign.squad.filter((p) => {
      const matchesRole = roleFilter === 'ALL' || p.role === roleFilter
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesRole && matchesSearch
    })
  }, [campaign.squad, roleFilter, searchQuery])

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
    advancePhase('mini_auction')
    router.push('/auction')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between pt-12 sm:pt-14 w-full max-w-full overflow-x-hidden touch-pan-y">
      <CampaignPhaseStepper />

      <main className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-2 sm:py-3 flex-1 flex flex-col justify-between overflow-x-hidden">
        
        {/* Banner with Back Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 mb-2 border-b border-white/10 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/trade')}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer transition-all border border-white/10"
              title="Back to Trade Window"
            >
              <ArrowLeft size={14} className="text-amber-400" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-black uppercase">
                  PART 2: RETAIN & RELEASE DEADLINE
                </span>
                <span className="text-[10px] text-gray-400">Lock Core Stars • Reclaim Salary to Purse</span>
              </div>
              <h1 className="text-lg sm:text-xl font-black font-display text-white">
                {franchise.name} Roster Retention Desk
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowMatchupModal(true)}
              className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
              title="Open Hawkeye Matchup radar"
            >
              <Target size={13} />
              <span>Hawkeye</span>
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <Share2 size={12} />
              <span>Export</span>
            </button>
            <button
              onClick={handleProceedToAuction}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer hover:scale-[1.02] transition-all shrink-0"
            >
              <span>Proceed to Auction</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* 4 Summary Vitals Cards (Compact for Landscape!) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2.5 shrink-0">
          
          {/* Card 1: Available Mini-Auction Purse */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 text-[9px] font-black uppercase">
              <span>Auction Purse Balance</span>
              <IndianRupee size={12} className="text-emerald-400" />
            </div>
            <div className="text-lg sm:text-2xl font-black text-emerald-400 font-mono tracking-tight mt-0.5">
              ₹{campaign.remainingPurse.toFixed(2)} <span className="text-[10px] text-gray-400">Cr</span>
            </div>
            <div className="text-[9px] text-gray-400 pt-0.5 border-t border-white/5 flex justify-between">
              <span>From Releases:</span>
              <strong className="text-emerald-300">+₹{releasedPurseGain.toFixed(2)} Cr</strong>
            </div>
          </div>

          {/* Card 2: Retained Slots */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 text-[9px] font-black uppercase">
              <span>Retained Roster</span>
              <Users size={12} className="text-indigo-400" />
            </div>
            <div className="text-lg sm:text-2xl font-black text-white font-mono tracking-tight mt-0.5">
              {retainedPlayers.length} <span className="text-[10px] text-gray-500">/ 25 Max</span>
            </div>
            <div className="text-[9px] text-gray-400 pt-0.5 border-t border-white/5 flex justify-between">
              <span>Open Slots:</span>
              <strong className="text-amber-400">{25 - retainedPlayers.length} open</strong>
            </div>
          </div>

          {/* Card 3: Overseas Quota */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 text-[9px] font-black uppercase">
              <span>Overseas Quota</span>
              <Globe size={12} className="text-sky-400" />
            </div>
            <div className={`text-lg sm:text-2xl font-black font-mono tracking-tight mt-0.5 ${overseasCount >= 8 ? 'text-rose-400' : 'text-sky-400'}`}>
              {overseasCount} <span className="text-[10px] text-gray-500">/ 8 Max</span>
            </div>
            <div className="text-[9px] text-gray-400 pt-0.5 border-t border-white/5 flex justify-between">
              <span>Available:</span>
              <strong className={overseasCount >= 8 ? 'text-rose-400' : 'text-emerald-400'}>
                {8 - overseasCount} slots
              </strong>
            </div>
          </div>

          {/* Card 4: Composition Health */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 text-[9px] font-black uppercase">
              <span>Role Balance</span>
              <Shield size={12} className="text-amber-400" />
            </div>
            <div className="text-xs font-black text-white font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className={wkCount >= 2 ? 'text-emerald-400' : 'text-amber-400'}>{wkCount} WK</span>
              <span>•</span>
              <span className="text-blue-400">{batCount} BAT</span>
              <span>•</span>
              <span className="text-red-400">{bowlCount} BOWL</span>
              <span>•</span>
              <span className="text-purple-400">{arCount} AR</span>
            </div>
            <div className="text-[9px] text-gray-400 pt-0.5 border-t border-white/5 flex justify-between">
              <span>BCCI Rule:</span>
              <span className={wkCount >= 2 ? 'text-emerald-400' : 'text-amber-400'}>
                {wkCount >= 2 ? '✓ 2 WK Satisfied' : '⚠️ Need 2+ WK'}
              </span>
            </div>
          </div>

        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-2 shrink-0">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/10 w-full sm:w-auto overflow-x-auto">
            {(['ALL', 'BAT', 'BOWL', 'AR', 'WK'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black cursor-pointer transition-all ${
                  roleFilter === r
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : r}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Search squad player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-8 pr-3 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Squad Cards Grid (Retain / Release Toggles) */}
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredSquad.map((player) => {
              const isReleased = player.is_released
              const ovr = Number(player.Power_Index) || 80
              const formBadge = ovr >= 90 ? '🔥 ON FIRE' : ovr >= 80 ? '⚡ IN FORM' : '❄️ COLD'

              return (
                <div
                  key={player.player_id}
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                    isReleased
                      ? 'bg-rose-950/20 border-rose-500/40 opacity-75'
                      : 'bg-slate-900/90 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Top: Name, Role, Rating */}
                  <div>
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                          <span>{player.name}</span>
                          {player.is_overseas && (
                            <span className="text-[8px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                              OS
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <span className="font-bold text-indigo-300">{player.role}</span>
                          <span>•</span>
                          <span>Salary: <strong className="text-white">₹{player.price} Cr</strong></span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm sm:text-base font-black text-amber-300 font-mono">
                          {ovr} <span className="text-[9px] text-gray-500 font-normal">OVR</span>
                        </div>
                        <span className={`text-[8px] font-bold block ${
                          ovr >= 90 ? 'text-amber-400' : ovr >= 80 ? 'text-emerald-400' : 'text-blue-400'
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
                      onClick={() => togglePlayerRetention(player.player_id)}
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
        defaultBatter={retainedPlayers[0]?.name || 'Virat Kohli'}
        defaultBowler="Jasprit Bumrah"
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
        mySquad={campaign.squad.map(p => ({
          ...p,
          is_overseas: !!p.is_overseas,
          base_price: p.price,
          predicted_price: p.price
        }))}
      />
    </div>
  )
}
