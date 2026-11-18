'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  User, 
  Shield, 
  Lock, 
  Check, 
  X, 
  Sparkles, 
  ArrowRight, 
  Trash2, 
  Trophy,
  Users,
  Plus,
  RotateCcw,
  Coins,
  CheckCircle2
} from 'lucide-react'
import { useCampaignStore, UserProfile } from '../store/useCampaignStore'
import { getFranchise } from '../data/franchises'
import TeamLogo from './TeamLogo'
import { gameAudio, triggerGameHaptic } from '../lib/gameAudioAndHaptics'

const AVATAR_OPTIONS = [
  { emoji: '👑', label: 'Royal Captain' },
  { emoji: '🦁', label: 'Fierce Lion' },
  { emoji: '⚡', label: 'Thunderbolt' },
  { emoji: '🏏', label: 'Master Batter' },
  { emoji: '🎯', label: 'Target Striker' },
  { emoji: '🦅', label: 'Apex Eagle' },
  { emoji: '⚔️', label: 'Gladiator' },
  { emoji: '🏆', label: 'Champion' },
]

interface OnboardingAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialTab?: 'saves' | 'create' | 'switch'
}

export function OnboardingAuthModal({ isOpen, onClose, onSuccess, initialTab = 'saves' }: OnboardingAuthModalProps) {
  const router = useRouter()
  const { 
    profiles, 
    currentUserId, 
    currentUser, 
    registerProfile, 
    loginProfile, 
    switchProfile,
    deleteProfile,
    campaigns,
    activeCampaignId,
    switchCampaign,
    resetCampaign
  } = useCampaignStore()

  const [mode, setMode] = useState<'saves' | 'create' | 'switch'>(initialTab)
  const [gamerTag, setGamerTag] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('👑')
  const [pin, setPin] = useState('')
  const [pinInput, setPinInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [confirmResetId, setConfirmResetId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setMode(initialTab)
      setErrorMsg('')
    }
  }, [isOpen, initialTab])

  if (!isOpen) return null

  const profileList = Object.values(profiles)
  const activeCampaign = activeCampaignId ? campaigns[activeCampaignId] : null
  const allCampaigns = Object.values(campaigns)

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!gamerTag.trim()) {
      setErrorMsg('Please enter a Gamer Tag')
      return
    }

    // Check if name already taken
    const exists = profileList.some(p => p.gamerTag.toLowerCase() === gamerTag.trim().toLowerCase())
    if (exists) {
      setErrorMsg('This Gamer Tag already exists on this device. Switch to it or choose another name.')
      return
    }

    registerProfile(gamerTag, selectedAvatar, pin)
    setGamerTag('')
    setPin('')
    if (onSuccess) onSuccess()
    onClose()
  }

  const handleSelectProfile = (p: UserProfile) => {
    setErrorMsg('')
    if (p.pin) {
      const entered = prompt(`Enter 4-digit PIN for ${p.gamerTag}:`)
      if (!entered || entered.trim() !== p.pin) {
        alert('Incorrect PIN!')
        return
      }
    }
    switchProfile(p.id)
    if (onSuccess) onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-x-hidden">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-white/20 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5 font-display">
                FRANCHISE GM AUTH & ONBOARDING
              </h3>
              <p className="text-[11px] text-gray-400">
                Manage your IPL manager identities and career save slots.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1.5 p-1 bg-slate-900 rounded-xl border border-white/10 mb-4 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => { setMode('saves'); setErrorMsg('') }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
              mode === 'saves'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Trophy size={13} />
            <span>Franchise Saves ({allCampaigns.length})</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('create'); setErrorMsg('') }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
              mode === 'create'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Plus size={13} />
            <span>New GM Profile</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('switch'); setErrorMsg('') }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
              mode === 'switch'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users size={13} />
            <span>Switch GM ({profileList.length})</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 mb-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {mode === 'saves' ? (
          <div className="space-y-3">
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {allCampaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-xs">No active franchise saves yet.</p>
                </div>
              ) : (
                allCampaigns.map((c) => {
                  const f = getFranchise(c.teamId)
                  const isCurrent = c.id === activeCampaignId
                  const phaseLabels: Record<string, string> = {
                    trade: '1. Trade Window',
                    retain_release: '2. Retentions',
                    mini_auction: '3. Auction Arena',
                    playing_xi: '4. Playing XI & Schedule',
                    match: 'Matchday Live'
                  }

                  return (
                    <div
                      key={c.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-lg shadow-amber-500/10'
                          : 'bg-slate-900/90 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div 
                        onClick={() => {
                          if (!isCurrent) {
                            switchCampaign(c.id)
                            gameAudio.playUiTap('select')
                            triggerGameHaptic('medium')
                            onClose()
                          }
                        }}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      >
                        <TeamLogo teamId={f.id} size={36} className="shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-black text-white flex items-center gap-2">
                            <span className="truncate">{f.name}</span>
                            {isCurrent && (
                              <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black shrink-0">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5 font-mono">
                            <span className="text-emerald-400 font-bold">₹{c.remainingPurse.toFixed(1)}Cr Purse</span>
                            <span>•</span>
                            <span className="text-sky-300">{phaseLabels[c.currentPhase] || c.currentPhase}</span>
                            <span>•</span>
                            <span>{c.squad.filter(p => !p.is_released).length} Players</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {!isCurrent ? (
                          <button
                            type="button"
                            onClick={() => {
                              switchCampaign(c.id)
                              gameAudio.playUiTap('select')
                              triggerGameHaptic('medium')
                              onClose()
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black cursor-pointer shadow-md"
                          >
                            Resume Save
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Reset ${f.name} season back to Trade Window?`)) {
                                resetCampaign(c.id)
                                onClose()
                                router.push('/trade')
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all border border-white/5"
                            title="Reset this season"
                          >
                            <RotateCcw size={11} /> Reset
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <Link
                href="/select-team"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Plus size={13} className="text-amber-400" />
                <span>Start New Franchise Campaign</span>
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-gray-300 hover:text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        ) : mode === 'create' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Gamer Tag */}
            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase tracking-wider">
                Manager / Gamer Tag:
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aasim The Tactician"
                  value={gamerTag}
                  onChange={(e) => setGamerTag(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1.5 uppercase tracking-wider">
                Choose GM Avatar Badge:
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {AVATAR_OPTIONS.map((av) => {
                  const isSelected = selectedAvatar === av.emoji
                  return (
                    <button
                      key={av.emoji}
                      type="button"
                      onClick={() => setSelectedAvatar(av.emoji)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)] scale-105'
                          : 'bg-slate-900 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="text-xl sm:text-2xl">{av.emoji}</span>
                      <span className="text-[9px] text-gray-400 mt-1 truncate max-w-full font-bold">
                        {av.label.split(' ')[0]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Optional PIN */}
            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase tracking-wider">
                Security PIN (Optional):
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Leave empty for instant guest login"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                A PIN keeps your franchise saves private when sharing this mobile device.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all hover:scale-[1.01]"
            >
              <Sparkles size={14} />
              <span>Confirm & Enter IPL War Room</span>
            </button>
          </form>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {profileList.map((p) => {
              const isCurrent = p.id === currentUserId
              const userCamps = Object.values(campaigns).filter((c) => c.userId === p.id)

              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    isCurrent
                      ? 'bg-amber-500/20 border-amber-500/50 text-white'
                      : 'bg-slate-900/90 border-white/10 hover:bg-slate-900'
                  }`}
                >
                  <div 
                    onClick={() => handleSelectProfile(p)}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/15 flex items-center justify-center text-2xl shadow-inner shrink-0">
                      {p.avatar || '👑'}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>{p.gamerTag}</span>
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black">
                            ACTIVE
                          </span>
                        )}
                        {p.pin && (
                          <span title="PIN protected">
                            <Lock size={11} className="text-amber-400" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5 font-mono">
                        <span>{userCamps.length} Franchise Saves</span>
                        <span>•</span>
                        <span>Joined: {new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isCurrent && (
                      <button
                        onClick={() => handleSelectProfile(p)}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black cursor-pointer shadow-sm"
                      >
                        Login
                      </button>
                    )}
                    {profileList.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete profile "${p.gamerTag}" and all its saved seasons?`)) {
                            deleteProfile(p.id)
                          }
                        }}
                        className="p-1 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-500 hover:text-rose-300 text-xs cursor-pointer transition-colors"
                        title="Delete this profile"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
