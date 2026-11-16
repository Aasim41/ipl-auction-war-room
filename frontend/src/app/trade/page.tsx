'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftRight, Check, X, Shield, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react'
import { useCampaignStore, CampaignPlayer } from '../../store/useCampaignStore'
import { CampaignPhaseStepper } from '../../components/CampaignPhaseStepper'
import { getFranchise, IPL_FRANCHISES } from '../../data/franchises'

export default function TradeWindowPage() {
  const router = useRouter()
  const { getActiveCampaign, executeTrade, advancePhase } = useCampaignStore()
  const campaign = getActiveCampaign()

  const [selectedRivalId, setSelectedRivalId] = useState<string>('csk')
  const [playerOut, setPlayerOut] = useState<CampaignPlayer | null>(null)
  const [playerIn, setPlayerIn] = useState<CampaignPlayer | null>(null)
  const [cashOffer, setCashOffer] = useState<number>(0) // in Crores
  const [tradeMessage, setTradeMessage] = useState<string | null>(null)
  const [searchMy, setSearchMy] = useState('')
  const [searchRival, setSearchRival] = useState('')

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-center">
        <div className="p-8 rounded-3xl bg-slate-900 border border-white/10 max-w-md">
          <AlertCircle size={36} className="mx-auto text-amber-400 mb-3" />
          <h3 className="text-lg font-black font-display mb-2">No Active Campaign Found</h3>
          <p className="text-xs text-gray-400 mb-4">Please choose your franchise to start the 2027 IPL cycle.</p>
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

  const myFranchise = getFranchise(campaign.teamId)
  const rivalFranchise = getFranchise(selectedRivalId)

  // Rival players (using franchise.squad2026 as starting base)
  const rivalSquad: CampaignPlayer[] = rivalFranchise.squad2026.map((p, idx) => ({
    ...p,
    player_id: p.player_id || `${selectedRivalId}_${idx + 1}`,
    currentPrice: p.price,
    is_retained: true,
    is_released: false
  }))

  // Filter squads
  const filteredMySquad = campaign.squad.filter(p => 
    !p.is_released && p.name.toLowerCase().includes(searchMy.toLowerCase())
  )

  const filteredRivalSquad = rivalSquad.filter(p =>
    p.name.toLowerCase().includes(searchRival.toLowerCase())
  )

  // AI Trade Evaluation logic (100% offline)
  const evaluateTrade = () => {
    if (!playerOut || !playerIn) {
      return { acceptable: false, reason: 'Select one player from each team to evaluate trade.' }
    }

    const powerOut = Number(playerOut.Power_Index) || 80
    const powerIn = Number(playerIn.Power_Index) || 80
    const priceOut = Number(playerOut.currentPrice || playerOut.price) || 5
    const priceIn = Number(playerIn.currentPrice || playerIn.price) || 5

    // Effective offer value: Power + cash compensation
    const netValueDiff = (powerOut - powerIn) + (cashOffer * 1.5)

    // Overseas balance check
    if (playerIn.is_overseas && !playerOut.is_overseas) {
      const currentOverseas = campaign.squad.filter(p => !p.is_released && p.is_overseas).length
      if (currentOverseas >= 8) {
        return { acceptable: false, reason: 'Cannot acquire overseas player: Your 8-man overseas quota is full!' }
      }
    }

    if (netValueDiff >= -4) {
      return { 
        acceptable: true, 
        reason: `${rivalFranchise.short} AI Board Approves: Fair value exchange for ${playerIn.name}.` 
      }
    } else {
      const deficit = Math.abs(Math.round(netValueDiff / 1.5 * 10) / 10)
      return { 
        acceptable: false, 
        reason: `${rivalFranchise.short} demands higher value: Add +₹${deficit} Cr cash or a higher-rated player.` 
      }
    }
  }

  const evaluation = evaluateTrade()

  const handleExecuteTrade = () => {
    if (!playerOut || !playerIn || !evaluation.acceptable) return

    const success = executeTrade(playerOut.player_id, playerIn, selectedRivalId, -cashOffer)
    if (success) {
      setTradeMessage(`✅ Deal Sealed! ${playerIn.name} joined ${myFranchise.short}. ${playerOut.name} moved to ${rivalFranchise.short}.`)
      setPlayerOut(null)
      setPlayerIn(null)
      setCashOffer(0)
      setTimeout(() => setTradeMessage(null), 5000)
    } else {
      setTradeMessage(`❌ Trade Failed: Check purse limits or roster constraints.`)
    }
  }

  const handleFinishTradeWindow = () => {
    advancePhase('retain_release')
    router.push('/squad')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between pt-14">
      <CampaignPhaseStepper />

      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 flex-1 flex flex-col justify-between">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-3 border-b border-white/10 gap-2 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-black uppercase">
                PART 1 OF 4: TRADING WINDOW
              </span>
              <span className="text-[11px] text-gray-400">All 10 Franchises Open for Bidding</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-white mt-0.5">
              IPL 2027 Official Player Trading Desk
            </h1>
          </div>

          <button
            onClick={handleFinishTradeWindow}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer hover:scale-[1.02] transition-all shrink-0"
          >
            <span>Proceed to Part 2: Retain & Release</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {tradeMessage && (
          <div className="p-3 mb-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold text-center animate-fade-in shrink-0">
            {tradeMessage}
          </div>
        )}

        {/* 3-Column Trade Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-[500px]">
          
          {/* Column 1 (Left): Your Squad */}
          <div className="lg:col-span-5 p-4 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{myFranchise.emoji}</span>
                  <div>
                    <h3 className="text-xs font-black uppercase text-white">{myFranchise.name}</h3>
                    <span className="text-[10px] text-gray-400">Your Tradeable Squad ({filteredMySquad.length})</span>
                  </div>
                </div>
                {playerOut && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                    OFFERING: {playerOut.name}
                  </span>
                )}
              </div>

              <input
                type="text"
                placeholder="Search your player..."
                value={searchMy}
                onChange={(e) => setSearchMy(e.target.value)}
                className="w-full mb-2 bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[380px] pr-1">
              {filteredMySquad.map((p) => {
                const isSelected = playerOut?.player_id === p.player_id
                return (
                  <div
                    key={p.player_id}
                    onClick={() => setPlayerOut(isSelected ? null : p)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {p.is_overseas && <span className="text-[9px] px-1 rounded bg-sky-500/20 text-sky-300">OS</span>}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {p.role} • Salary: ₹{p.price} Cr
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-amber-300 font-mono">OVR {p.Power_Index}</div>
                      <span className="text-[9px] text-gray-500">{isSelected ? '✓ SELECTED' : 'Tap to Offer'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Column 2 (Middle): Trade Negotiation & Cash */}
          <div className="lg:col-span-2 p-4 rounded-3xl bg-slate-950 border border-white/10 flex flex-col justify-between items-center text-center shadow-2xl">
            <div className="w-full">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-2 font-bold">
                <ArrowLeftRight size={20} />
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Deal Room</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Player Swap + Cash</p>
            </div>

            {/* Cash offer adjustment */}
            <div className="w-full py-3 border-y border-white/10 my-2">
              <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                Your Cash Transfer
              </span>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCashOffer(Math.max(-5, cashOffer - 0.5))}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-black text-xs cursor-pointer"
                >
                  -
                </button>
                <span className="text-sm font-black font-mono text-emerald-400">
                  {cashOffer >= 0 ? `+₹${cashOffer.toFixed(1)} Cr` : `-₹${Math.abs(cashOffer).toFixed(1)} Cr`}
                </span>
                <button
                  onClick={() => setCashOffer(Math.min(campaign.remainingPurse, cashOffer + 0.5))}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-black text-xs cursor-pointer"
                >
                  +
                </button>
              </div>
              <span className="text-[9px] text-gray-500 block mt-1">Adjust to balance deal</span>
            </div>

            {/* Evaluation Status */}
            <div className="w-full mb-2">
              <div className={`p-2.5 rounded-xl border text-[11px] font-bold ${
                evaluation.acceptable
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                {evaluation.acceptable ? '🟢 DEAL VIABLE' : '🔴 UNBALANCED'}
                <div className="text-[10px] font-normal text-gray-300 mt-1">
                  {evaluation.reason}
                </div>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecuteTrade}
              disabled={!evaluation.acceptable}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer transition-all"
            >
              Confirm Trade
            </button>
          </div>

          {/* Column 3 (Right): Rival Team Squad */}
          <div className="lg:col-span-5 p-4 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{rivalFranchise.emoji}</span>
                  <div>
                    {/* Rival Team Selector Dropdown */}
                    <select
                      value={selectedRivalId}
                      onChange={(e) => {
                        setSelectedRivalId(e.target.value)
                        setPlayerIn(null)
                      }}
                      className="bg-slate-950 border border-white/15 text-xs font-black uppercase text-white rounded-lg px-2 py-0.5 focus:outline-none"
                    >
                      {Object.keys(IPL_FRANCHISES)
                        .filter(tid => tid !== campaign.teamId)
                        .map(tid => (
                          <option key={tid} value={tid}>
                            {IPL_FRANCHISES[tid].name}
                          </option>
                        ))}
                    </select>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Available for Trade ({filteredRivalSquad.length})</span>
                  </div>
                </div>
                {playerIn && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    REQUESTING: {playerIn.name}
                  </span>
                )}
              </div>

              <input
                type="text"
                placeholder="Search rival player..."
                value={searchRival}
                onChange={(e) => setSearchRival(e.target.value)}
                className="w-full mb-2 bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[380px] pr-1">
              {filteredRivalSquad.map((p) => {
                const isSelected = playerIn?.player_id === p.player_id
                return (
                  <div
                    key={p.player_id}
                    onClick={() => setPlayerIn(isSelected ? null : p)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {p.is_overseas && <span className="text-[9px] px-1 rounded bg-sky-500/20 text-sky-300">OS</span>}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {p.role} • Salary: ₹{p.price} Cr
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-amber-300 font-mono">OVR {p.Power_Index}</div>
                      <span className="text-[9px] text-gray-500">{isSelected ? '✓ SELECTED' : 'Tap to Request'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

      </main>
    </div>
  )
}
