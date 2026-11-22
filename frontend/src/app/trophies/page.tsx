'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Sparkles, 
  ArrowLeft, 
  Shield, 
  Calendar
} from 'lucide-react';
import { useCampaignStore } from '../../store/useCampaignStore';
import { getFranchise } from '../../data/franchises';
import TeamLogo from '../../components/TeamLogo';
import { gameAudio, triggerGameHaptic } from '../../lib/gameAudioAndHaptics';

export default function TrophyCabinetPage() {
  const router = useRouter();
  const { getActiveCampaign } = useCampaignStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCamp = mounted ? getActiveCampaign() : null;
  const franchiseId = activeCamp?.teamId || 'csk';
  const currentFranchise = getFranchise(franchiseId);

  const schedule = activeCamp?.schedule || [];
  const finalMatch = schedule.find(m => m.stage === 'Final' || m.matchNo === 74);

  // Collect ONLY actually earned/won trophies
  const earnedTrophies: Array<{
    id: string;
    title: string;
    type: 'champion' | 'runner_up';
    season: string;
    subtitle: string;
    description: string;
  }> = [];

  // Check persistent user trophies
  if (activeCamp?.userTrophies && activeCamp.userTrophies.length > 0) {
    activeCamp.userTrophies.forEach((t) => {
      earnedTrophies.push({
        id: t.id,
        title: t.title,
        type: t.type === 'runner_up' ? 'runner_up' : 'champion',
        season: t.seasonLabel || `Season ${t.seasonYear}`,
        subtitle: t.subtitle,
        description: t.captainOrHighlight || 'IPL Championship Honor'
      });
    });
  }

  // Check if current final match completed with user franchise winning
  if (finalMatch && finalMatch.status === 'COMPLETED') {
    if (finalMatch.result?.winnerTeamId === franchiseId) {
      if (!earnedTrophies.some(t => t.id === `season_2027_champ_${franchiseId}`)) {
        earnedTrophies.unshift({
          id: `season_2027_champ_${franchiseId}`,
          title: 'IPL 2027 Champions Trophy',
          type: 'champion',
          season: 'IPL Season 2027',
          subtitle: `Crowned Champions • Defeated ${finalMatch.result?.winnerTeamId === finalMatch.teamAId ? finalMatch.teamBShort : finalMatch.teamAShort} in Grand Final`,
          description: `Official BCCI 2027 Championship Trophy Awarded to ${currentFranchise.name}`
        });
      }
    } else if (finalMatch.teamAId === franchiseId || finalMatch.teamBId === franchiseId) {
      if (!earnedTrophies.some(t => t.id === `season_2027_runner_${franchiseId}`)) {
        earnedTrophies.push({
          id: `season_2027_runner_${franchiseId}`,
          title: 'IPL 2027 Runners-Up Shield',
          type: 'runner_up',
          season: 'IPL Season 2027',
          subtitle: `Grand Finalists • Silverware Awarded`,
          description: `Official BCCI 2027 Runner-Up Honors`
        });
      }
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-400 font-mono text-sm">
        <Sparkles className="animate-spin mr-2" size={18} />
        Loading Trophies...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col select-none safe-page-top pb-16 px-3 sm:px-6 max-w-4xl mx-auto w-full overflow-x-hidden min-w-0">
      
      {/* ─── CLEAN HEADER (Back Button + Franchise Name) ─── */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/95 border border-white/15 shadow-xl gap-2 shrink-0 mb-4">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              gameAudio.playUiTap('select');
              triggerGameHaptic('light');
              router.push('/playing-xi');
            }}
            className="p-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center gap-1.5 text-xs font-bold border border-white/15 cursor-pointer transition-all shadow-sm"
            title="Return to Playing 11"
          >
            <ArrowLeft size={15} className="text-amber-400" />
            <span className="hidden sm:inline">Back to Playing 11</span>
          </button>

          <div className="flex items-center gap-2">
            <TeamLogo teamId={currentFranchise.id} size={24} className="shrink-0" />
            <h1 className="text-sm sm:text-base font-black font-display text-white">
              {currentFranchise.name} Trophy Cabinet
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm">
            🏆 {earnedTrophies.filter(t => t.type === 'champion').length} Trophies
          </span>
        </div>
      </div>

      {/* ─── ONLY TROPHIES DISPLAY ─── */}
      {earnedTrophies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full animate-fadeIn">
          {earnedTrophies.map((trophy) => {
            const isChamp = trophy.type === 'champion';

            return (
              <div
                key={trophy.id}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between gap-3 shadow-xl ${
                  isChamp
                    ? 'bg-gradient-to-br from-amber-500/20 via-slate-900 to-yellow-600/15 border-amber-400/50 ring-1 ring-amber-400/30'
                    : 'bg-gradient-to-br from-slate-400/20 via-slate-900 to-slate-700/15 border-slate-400/40'
                }`}
              >
                {/* Glow background accent */}
                <div 
                  className={`absolute -right-8 -bottom-8 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-40 ${
                    isChamp ? 'bg-amber-400' : 'bg-slate-300'
                  }`} 
                />

                <div className="flex items-start justify-between gap-2 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                      isChamp 
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 ring-2 ring-amber-300' 
                        : 'bg-gradient-to-br from-slate-300 to-slate-500 text-slate-950 ring-2 ring-slate-200'
                    }`}>
                      {isChamp ? <Trophy size={24} className="fill-slate-950" /> : <Shield size={24} />}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-amber-300 uppercase font-black tracking-wider block">
                        {trophy.season}
                      </span>
                      <h3 className="text-base sm:text-lg font-black font-display text-white mt-0.5">
                        {trophy.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 relative z-10 pt-2 border-t border-white/10">
                  <p className="text-xs text-gray-200 font-medium">
                    {trophy.subtitle}
                  </p>
                  <p className="text-[10px] font-mono text-gray-400">
                    {trophy.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Trophy Cabinet State */
        <div className="flex flex-col items-center justify-center p-8 sm:p-14 rounded-3xl bg-slate-900/80 border border-white/10 text-center space-y-3 mt-4 animate-fadeIn shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Trophy size={32} className="opacity-60" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white font-display">Trophy Cabinet Empty</h3>
            <p className="text-xs text-gray-400 max-w-sm font-mono mt-1">
              No trophies won yet. Compete in the IPL 2027 campaign and conquer the Grand Final to lift the Championship Trophy and showcase it here!
            </p>
          </div>
          <button
            onClick={() => {
              gameAudio.playUiTap('select');
              triggerGameHaptic('light');
              router.push('/playing-xi');
            }}
            className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center gap-2"
          >
            <Calendar size={13} />
            <span>Play Tournament Matches ➔</span>
          </button>
        </div>
      )}

    </div>
  );
}
