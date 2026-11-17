'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Trophy, 
  Shield, 
  Coins, 
  ArrowLeftRight, 
  Users, 
  Gavel, 
  Calendar, 
  Swords, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Zap,
  Target,
  Flame,
  Award
} from 'lucide-react'

interface GamerOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onCompleteToTeamSelect: () => void
}

const ONBOARDING_STEPS = [
  {
    step: 1,
    badge: 'WELCOME, GENERAL MANAGER',
    title: 'You Run The Entire IPL Franchise!',
    desc: 'Take total control of your favourite IPL team. From high-stakes boardroom deals to match-day ball-by-ball tactics, every single decision is in your hands.',
    icon: Trophy,
    color: 'from-amber-500 to-yellow-600',
    highlights: [
      {
        title: '₹125 Crore Salary Cap',
        detail: 'Manage your budget smartly across your 25-man squad.',
        icon: Coins,
        color: 'text-amber-400'
      },
      {
        title: 'Squad Balance Rules',
        detail: 'Squad of 18–25 players with a maximum of 8 overseas stars.',
        icon: Users,
        color: 'text-sky-400'
      },
      {
        title: 'Lift The IPL 2027 Trophy',
        detail: 'Compete in a realistic 74-match season to become champions.',
        icon: Award,
        color: 'text-emerald-400'
      }
    ]
  },
  {
    step: 2,
    badge: 'THE 4-PHASE CHAMPIONSHIP CYCLE',
    title: 'Strictly Forward Only — No Going Back!',
    desc: 'Just like real IPL cricket, once a phase deadline passes, it is permanently locked by BCCI regulations. Think twice before advancing!',
    icon: Swords,
    color: 'from-purple-500 to-indigo-600',
    phases: [
      {
        num: '1',
        name: 'Trade Window',
        desc: 'Swap players directly with rival teams (CSK, MI, KKR, etc.) plus cash adjustments to plug squad holes.',
        icon: ArrowLeftRight,
        color: 'text-sky-400'
      },
      {
        num: '2',
        name: 'Retain & Release',
        desc: 'Retain your core match-winners. Release unneeded players to instantly get their auction money back into your purse!',
        icon: Users,
        color: 'text-emerald-400'
      },
      {
        num: '3',
        name: 'Live Mini-Auction',
        desc: 'Step into the live war room. Battle 9 aggressive AI franchise bots in real-time paddle wars for top stars.',
        icon: Gavel,
        color: 'text-amber-400'
      },
      {
        num: '4',
        name: 'Playing XI & Matches',
        desc: 'Set your batting order (1 to 11), pick pitch specialists, and conquer all 14 league matches + Playoffs!',
        icon: Calendar,
        color: 'text-rose-400'
      }
    ]
  },
  {
    step: 3,
    badge: 'OFFICIAL MATCH RULES MADE SIMPLE',
    title: 'Match-Day Tactical Regulations',
    desc: 'Keep these 3 golden rules in mind when picking your 11 and managing your squad:',
    icon: Shield,
    color: 'from-emerald-500 to-teal-600',
    rules: [
      {
        rule: 'Max 4 Overseas Players in Playing XI',
        tip: 'You can have up to 8 overseas players in your total squad, but only 4 can take the field in any match.',
        badge: 'BCCI Rule 4.1'
      },
      {
        rule: 'Minimum 1 Wicketkeeper & 4 Bowlers',
        tip: 'Your 11 must include at least one specialist gloveman and at least 4 capable bowling options (Bowlers or All-Rounders).',
        badge: 'Balance Check'
      },
      {
        rule: 'Custom Batting Order (1 to 11)',
        tip: 'You can manually re-order your batting lineup with Up/Down arrows, or click "AI Auto-Select" for an optimized stat-backed order.',
        badge: 'Tactical Control'
      }
    ]
  },
  {
    step: 4,
    badge: 'INTERACTIVE BALL-BY-BALL SIMULATOR',
    title: 'You Control Every Single Delivery!',
    desc: 'No random coin flips. You make tactical decisions for your team ball-by-ball with live 2D pitch animations:',
    icon: Flame,
    color: 'from-rose-500 to-amber-600',
    tactics: [
      {
        side: 'When Batting (Striker Intent)',
        options: [
          '🛡️ Defend (Protect wicket, look for 1s)',
          '⚖️ Rotate Strike (Pushed into gaps for singles & doubles)',
          '⚡ Attack (Loft over the infield for 4s & 6s)',
          '💥 Super Six Maximum (Helicopter & Ramp shots! High risk, high reward)'
        ]
      },
      {
        side: 'When Bowling (Delivery Choice)',
        options: [
          '🎯 Pinpoint Yorker (Target base of stumps, death overs)',
          '🌀 Slower Cutter (Deception in the air, mistimed catches)',
          '⚡ Express Bouncer (Short-pitch heat to push batter back)',
          '📐 Tight Good Length (Test the outside edge to keeper/slip)'
        ]
      }
    ]
  }
]

export function GamerOnboardingModal({ isOpen, onClose, onCompleteToTeamSelect }: GamerOnboardingModalProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const stepData = ONBOARDING_STEPS[currentStep]
  const isLast = currentStep === ONBOARDING_STEPS.length - 1

  const handleNext = () => {
    if (isLast) {
      onCompleteToTeamSelect()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto">
      
      {/* Dynamic Glow backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl bg-slate-950 border border-white/20 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col justify-between my-auto text-white">
        
        {/* Top Header: Step Badge & Skip */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-mono font-black text-amber-400 uppercase tracking-widest">
              {stepData.badge} • STEP {stepData.step} OF 4
            </span>
          </div>

          <button
            onClick={onCompleteToTeamSelect}
            className="text-xs font-bold text-gray-400 hover:text-white hover:underline cursor-pointer transition-colors"
          >
            Skip to Team Selection ➔
          </button>
        </div>

        {/* Step Indicator Progress Dots */}
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          {ONBOARDING_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep 
                  ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]' 
                  : idx < currentStep 
                  ? 'bg-emerald-500' 
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Main Step Content */}
        <div className="min-h-[290px] flex flex-col justify-center">
          
          {/* Step 1: Who You Are */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-black text-white">
                  {stepData.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-relaxed">
                  {stepData.desc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {stepData.highlights?.map((h, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-900 border border-white/10 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h.icon size={18} className={h.color} />
                      <strong className="text-xs font-black text-white">{h.title}</strong>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-normal">{h.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: The 4 Phases */}
          {currentStep === 1 && (
            <div className="space-y-3">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                  {stepData.title}
                </h3>
                <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                  {stepData.desc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {stepData.phases?.map((p, i) => (
                  <div key={i} className="p-2.5 rounded-2xl bg-slate-900 border border-white/10 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 font-display font-black text-sm text-amber-400">
                      {p.num}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p.icon size={13} className={p.color} />
                        <strong className="text-xs font-black text-white">{p.name}</strong>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-snug mt-0.5">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Essential Rules */}
          {currentStep === 2 && (
            <div className="space-y-3">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                  {stepData.title}
                </h3>
                <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                  {stepData.desc}
                </p>
              </div>

              <div className="space-y-2">
                {stepData.rules?.map((r, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-900 border border-white/10 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 size={13} />
                      </div>
                      <div>
                        <strong className="text-xs font-black text-white block">{r.rule}</strong>
                        <span className="text-[11px] text-gray-400 leading-normal">{r.tip}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono text-gray-400 shrink-0">
                      {r.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Ball-by-Ball Simulator Control */}
          {currentStep === 3 && (
            <div className="space-y-3">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                  {stepData.title}
                </h3>
                <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                  {stepData.desc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {stepData.tactics?.map((t, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-900 border border-white/10">
                    <strong className="text-xs font-black text-amber-300 block mb-1.5">{t.side}</strong>
                    <ul className="space-y-1 text-[11px] text-gray-300">
                      {t.options.map((opt, oi) => (
                        <li key={oi} className="flex items-center gap-1.5">
                          <span>{opt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Bottom Actions: Back and Next / Finish */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 mt-2">
          {currentStep > 0 ? (
            <button
              onClick={handlePrev}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <ArrowLeft size={14} />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            <span>{isLast ? 'SELECT YOUR FRANCHISE & PLAY ➔' : 'NEXT STEP ➔'}</span>
          </button>
        </div>

      </div>
    </div>
  )
}
