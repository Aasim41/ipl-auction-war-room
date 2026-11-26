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
  CheckCircle2,
  KeyRound,
  Award,
  Dice5,
  Settings,
  HelpCircle
} from 'lucide-react'
import { useCampaignStore, UserProfile } from '../store/useCampaignStore'
import { getFranchise, IPL_FRANCHISES } from '../data/franchises'
import TeamLogo from './TeamLogo'
import { gameAudio, triggerGameHaptic } from '../lib/gameAudioAndHaptics'

const AVATAR_OPTIONS = [
  { emoji: '👑', label: 'Captain' },
  { emoji: '🦁', label: 'Lion' },
  { emoji: '⚡', label: 'Thunder' },
  { emoji: '🏏', label: 'Master' },
  { emoji: '🎯', label: 'Striker' },
  { emoji: '🦅', label: 'Eagle' },
  { emoji: '⚔️', label: 'Gladiator' },
  { emoji: '🏆', label: 'Champion' },
  { emoji: '🐺', label: 'Wolf' },
  { emoji: '🐅', label: 'Tiger' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🧙‍♂️', label: 'Tactician' },
]

const NAME_SUGGESTIONS = [
  'Tactical Maestro',
  'Captain Cool',
  'Sixer King',
  'Boundary Hunter',
  'Auction Shark',
  'Moneyball GM',
  'Championship Mind',
  'Master Strategist',
  'Death Overs Boss',
  'Powerplay Pro'
]

interface OnboardingAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialTab?: 'profile' | 'saves' | 'create' | 'switch'
  forceCreate?: boolean
}

export function OnboardingAuthModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialTab = 'profile',
  forceCreate = false 
}: OnboardingAuthModalProps) {
  const router = useRouter()
  const { 
    profiles, 
    currentUserId, 
    currentUser, 
    registerProfile, 
    loginProfile, 
    switchProfile,
    updateUserProfile,
    deleteProfile,
    campaigns,
    activeCampaignId,
    switchCampaign,
    resetCampaign
  } = useCampaignStore()

  const [mode, setMode] = useState<'profile' | 'saves' | 'create' | 'switch'>(forceCreate ? 'create' : initialTab)
  
  // Registration form state
  const [gamerTag, setGamerTag] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('👑')
  const [favTeam, setFavTeam] = useState('rcb')
  const [pin, setPin] = useState('')
  
  // Edit profile state
  const [editGamerTag, setEditGamerTag] = useState('')
  const [editAvatar, setEditAvatar] = useState('👑')
  const [editFavTeam, setEditFavTeam] = useState('rcb')
  const [editRoleTitle, setEditRoleTitle] = useState('Franchise General Manager')
  const [editPin, setEditPin] = useState('')
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('')

  // PIN prompt modal state for switching
  const [pinPromptUser, setPinPromptUser] = useState<UserProfile | null>(null)
  const [pinPromptValue, setPinPromptValue] = useState('')

  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (isOpen) {
      setMode(forceCreate ? 'create' : initialTab)
      setErrorMsg('')
      setProfileSuccessMsg('')
      setPinPromptUser(null)
      setPinPromptValue('')
      
      // Initialize edit fields with current user data
      if (currentUser) {
        setEditGamerTag(currentUser.gamerTag || '')
        setEditAvatar(currentUser.avatar || '👑')
        setEditFavTeam(currentUser.favTeam || 'rcb')
        setEditRoleTitle(currentUser.roleTitle || 'Franchise General Manager')
        setEditPin(currentUser.pin || '')
      }
    }
  }, [isOpen, initialTab, forceCreate, currentUser])

  if (!isOpen) return null

  const profileList = Object.values(profiles)
  // Strictly filter campaigns to the ACTIVE user!
  const myCampaigns = Object.values(campaigns).filter(c => c.userId === currentUserId)

  // Suggest random unique name
  const handleSuggestName = () => {
    gameAudio.playUiTap('light')
    triggerGameHaptic('light')
    const available = NAME_SUGGESTIONS.filter(
      name => !profileList.some(p => p.gamerTag.toLowerCase() === name.toLowerCase())
    )
    const pool = available.length > 0 ? available : NAME_SUGGESTIONS
    const chosen = pool[Math.floor(Math.random() * pool.length)]
    const uniqueCandidate = profileList.some(p => p.gamerTag.toLowerCase() === chosen.toLowerCase())
      ? `${chosen} ${Math.floor(Math.random() * 90 + 10)}`
      : chosen
    setGamerTag(uniqueCandidate)
  }

  // Handle New Profile Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    const result = registerProfile(gamerTag, selectedAvatar, pin, favTeam)
    if (!result.success) {
      setErrorMsg(result.error || 'Failed to create profile.')
      gameAudio.playTradeReject()
      triggerGameHaptic('heavy')
      return
    }

    gameAudio.playTradeDealSuccess()
    triggerGameHaptic('heavy')
    setGamerTag('')
    setPin('')
    if (onSuccess) onSuccess()
    onClose()
  }

  // Handle Profile Update
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setProfileSuccessMsg('')

    const result = updateUserProfile({
      gamerTag: editGamerTag,
      avatar: editAvatar,
      favTeam: editFavTeam,
      roleTitle: editRoleTitle,
      pin: editPin
    })

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to update profile.')
      gameAudio.playTradeReject()
      triggerGameHaptic('medium')
      return
    }

    gameAudio.playUiTap('select')
    triggerGameHaptic('light')
    setProfileSuccessMsg('Profile updated successfully!')
    setTimeout(() => setProfileSuccessMsg(''), 3000)
  }

  // Handle Profile Switch
  const handleSelectProfile = (p: UserProfile) => {
    setErrorMsg('')
    if (p.id === currentUserId) return

    // If profile has PIN, prompt for it
    if (p.pin && p.pin.trim() !== '') {
      setPinPromptUser(p)
      setPinPromptValue('')
      return
    }

    // Direct switch
    const res = switchProfile(p.id)
    if (res.success) {
      gameAudio.playTradeDealSuccess()
      triggerGameHaptic('medium')
      if (onSuccess) onSuccess()
      onClose()
    } else {
      setErrorMsg(res.error || 'Failed to switch profile.')
    }
  }

  // Confirm PIN prompt for profile switch
  const handleConfirmPinSwitch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pinPromptUser) return

    const res = switchProfile(pinPromptUser.id, pinPromptValue)
    if (res.success) {
      gameAudio.playTradeDealSuccess()
      triggerGameHaptic('heavy')
      setPinPromptUser(null)
      if (onSuccess) onSuccess()
      onClose()
    } else {
      setErrorMsg(res.error || 'Incorrect PIN.')
      gameAudio.playTradeReject()
      triggerGameHaptic('heavy')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-x-hidden animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-white/20 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto flex flex-col justify-between">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-lg">
                <span>{currentUser?.avatar || '👑'}</span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 font-display">
                  <span>GM ACCOUNT & PROFILE</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-amber-300 border border-white/10 font-bold">
                    {currentUser?.gamerTag || 'Franchise GM'}
                  </span>
                </h3>
                <p className="text-[11px] text-gray-400">
                  Every manager has a unique account, separate saves, and independent career records.
                </p>
              </div>
            </div>

            {!forceCreate && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex gap-1.5 p-1 bg-slate-900 rounded-xl border border-white/10 mb-4 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => { setMode('profile'); setErrorMsg(''); setProfileSuccessMsg('') }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                mode === 'profile'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <User size={13} />
              <span>My Profile</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('saves'); setErrorMsg(''); setProfileSuccessMsg('') }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                mode === 'saves'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Trophy size={13} />
              <span>My Saves ({myCampaigns.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('switch'); setErrorMsg(''); setProfileSuccessMsg('') }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                mode === 'switch'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users size={13} />
              <span>Switch Account ({profileList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('create'); setErrorMsg(''); setProfileSuccessMsg('') }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                mode === 'create'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Plus size={13} />
              <span>+ New Profile</span>
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-2.5 mb-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}

          {profileSuccessMsg && (
            <div className="p-2.5 mb-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
              {profileSuccessMsg}
            </div>
          )}

          {/* TAB 1: MY PROFILE (VIEW & EDIT) */}
          {mode === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              
              {/* Account Identity Card */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-white/15 flex items-center justify-center text-3xl shadow-inner shrink-0">
                    {editAvatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">{currentUser?.gamerTag}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        {currentUser?.roleTitle || 'Franchise GM'}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                      Account ID: <span className="text-gray-300 font-bold">#{currentUser?.id?.replace('usr_', '').substring(0, 8)}</span> • Joined {new Date(currentUser?.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Career Quick Stats */}
                <div className="hidden sm:flex items-center gap-3 pr-2 font-mono text-center">
                  <div className="p-2 rounded-xl bg-slate-950 border border-white/5 min-w-[65px]">
                    <span className="text-[9px] text-gray-400 uppercase block">Titles</span>
                    <span className="text-xs font-black text-amber-400">🏆 {currentUser?.careerStats?.titlesWon || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-white/5 min-w-[65px]">
                    <span className="text-[9px] text-gray-400 uppercase block">Matches</span>
                    <span className="text-xs font-black text-sky-400">{currentUser?.careerStats?.matchesPlayed || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-white/5 min-w-[65px]">
                    <span className="text-[9px] text-gray-400 uppercase block">Wins</span>
                    <span className="text-xs font-black text-emerald-400">{currentUser?.careerStats?.matchesWon || 0}</span>
                  </div>
                </div>
              </div>

              {/* Edit Gamer Tag */}
              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase tracking-wider flex items-center justify-between">
                  <span>Manager / Gamer Tag (Unique Name)</span>
                  <span className="text-[10px] text-amber-400 font-normal">Must be unique on this device</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={editGamerTag}
                    onChange={(e) => setEditGamerTag(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Role Title */}
              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase tracking-wider">
                  Manager Role Title:
                </label>
                <input
                  type="text"
                  value={editRoleTitle}
                  onChange={(e) => setEditRoleTitle(e.target.value)}
                  placeholder="e.g. Head of Cricket Operations, Chief Executive"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1.5 uppercase tracking-wider">
                  Choose Avatar Badge:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((av) => {
                    const isSelected = editAvatar === av.emoji
                    return (
                      <button
                        key={av.emoji}
                        type="button"
                        onClick={() => setEditAvatar(av.emoji)}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 shadow-sm scale-105'
                            : 'bg-slate-900 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xl">{av.emoji}</span>
                        <span className="text-[9px] text-gray-400 mt-0.5 truncate max-w-full font-bold">
                          {av.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Favorite Franchise */}
              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1.5 uppercase tracking-wider">
                  Favorite IPL Franchise:
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                  {Object.keys(IPL_FRANCHISES).map((tId) => {
                    const f = IPL_FRANCHISES[tId]
                    const isSelected = editFavTeam === tId
                    return (
                      <button
                        key={tId}
                        type="button"
                        onClick={() => setEditFavTeam(tId)}
                        className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all shrink-0 text-xs font-bold ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-black border-amber-400 scale-105'
                            : 'bg-slate-900 border-white/10 text-gray-300 hover:text-white'
                        }`}
                      >
                        <TeamLogo teamId={tId} size={15} />
                        <span>{f.short}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Optional Security PIN */}
              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase tracking-wider">
                  Security PIN (Optional):
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Leave empty for unpinned quick login"
                    value={editPin}
                    onChange={(e) => setEditPin(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Lock this account with a PIN so others using this device cannot tamper with your franchise saves.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-[0.99]"
              >
                <Check size={14} />
                <span>Save Profile Changes</span>
              </button>
            </form>
          )}

          {/* TAB 2: FRANCHISE SAVES (SCOPED STRICTLY TO CURRENT USER) */}
          {mode === 'saves' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 text-xs text-gray-400">
                <span>Active Saves for <strong className="text-white">{currentUser?.gamerTag}</strong>:</span>
                <span className="font-mono text-amber-400 font-bold">{myCampaigns.length} Save Slots</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {myCampaigns.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 space-y-2">
                    <p className="text-xs">You have no active franchise saves under this account.</p>
                    <Link
                      href="/select-team"
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-md cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Start Your First Campaign</span>
                    </Link>
                  </div>
                ) : (
                  myCampaigns.map((c) => {
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
                            ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-md'
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
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus size={13} className="text-amber-400" />
                  <span>Start New Franchise Campaign</span>
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-gray-300 hover:text-white font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SWITCH GM ACCOUNT (MULTI-USER SUPPORT) */}
          {mode === 'switch' && (
            <div className="space-y-3">
              <div className="text-xs text-gray-400 pb-1">
                Accounts registered on this device. Select an account to load its saves and profile:
              </div>

              {pinPromptUser ? (
                <form onSubmit={handleConfirmPinSwitch} className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2.5">
                    <KeyRound size={20} className="text-amber-400" />
                    <div>
                      <strong className="text-xs text-white block">Enter Security PIN for {pinPromptUser.gamerTag}</strong>
                      <span className="text-[10px] text-gray-400">This account is protected with a security passcode.</span>
                    </div>
                  </div>

                  <input
                    type="password"
                    autoFocus
                    maxLength={6}
                    placeholder="Enter PIN"
                    value={pinPromptValue}
                    onChange={(e) => setPinPromptValue(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-center font-mono text-sm tracking-widest text-white focus:outline-none focus:border-amber-400"
                  />

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setPinPromptUser(null)}
                      className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer shadow-md"
                    >
                      Unlock & Login
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {profileList.map((p) => {
                    const isCurrent = p.id === currentUserId
                    const userCamps = Object.values(campaigns).filter((c) => c.userId === p.id)

                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                          isCurrent
                            ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm'
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
                              <span>{userCamps.length} Saves</span>
                              <span>•</span>
                              <span>🏆 {p.careerStats?.titlesWon || 0} Titles</span>
                              <span>•</span>
                              <span>#{p.id.replace('usr_', '').substring(0, 6)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {!isCurrent ? (
                            <button
                              onClick={() => handleSelectProfile(p)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black cursor-pointer shadow-sm"
                            >
                              Login
                            </button>
                          ) : (
                            <span className="text-[11px] font-mono text-emerald-400 font-bold px-2 py-1">
                              Current
                            </span>
                          )}
                          {profileList.length > 1 && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete profile "${p.gamerTag}" and all its saved franchise campaigns?`)) {
                                  deleteProfile(p.id)
                                }
                              }}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-500 hover:text-rose-300 text-xs cursor-pointer transition-colors"
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
          )}

          {/* TAB 4: CREATE NEW UNIQUE GM PROFILE */}
          {mode === 'create' && (
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Gamer Tag Input with Suggest Button */}
              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase tracking-wider flex items-center justify-between">
                  <span>Manager / Gamer Tag (Unique Name):</span>
                  <button
                    type="button"
                    onClick={handleSuggestName}
                    className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-normal"
                  >
                    <Dice5 size={12} />
                    <span>Suggest Name</span>
                  </button>
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
                  Choose Avatar Badge:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((av) => {
                    const isSelected = selectedAvatar === av.emoji
                    return (
                      <button
                        key={av.emoji}
                        type="button"
                        onClick={() => setSelectedAvatar(av.emoji)}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 shadow-sm scale-105'
                            : 'bg-slate-900 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xl">{av.emoji}</span>
                        <span className="text-[9px] text-gray-400 mt-0.5 truncate max-w-full font-bold">
                          {av.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Favorite Franchise */}
              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1.5 uppercase tracking-wider">
                  Preferred IPL Franchise:
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                  {Object.keys(IPL_FRANCHISES).map((tId) => {
                    const f = IPL_FRANCHISES[tId]
                    const isSelected = favTeam === tId
                    return (
                      <button
                        key={tId}
                        type="button"
                        onClick={() => setFavTeam(tId)}
                        className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all shrink-0 text-xs font-bold ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-black border-amber-400 scale-105'
                            : 'bg-slate-900 border-white/10 text-gray-300 hover:text-white'
                        }`}
                      >
                        <TeamLogo teamId={tId} size={15} />
                        <span>{f.short}</span>
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
                    placeholder="Leave empty for instant login"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  A PIN keeps your franchise saves private when sharing this mobile device.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-[0.99]"
              >
                <Sparkles size={14} />
                <span>Create Unique Account & Enter War Room</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}
