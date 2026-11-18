'use client';

import React, { useState } from 'react';
import { Trophy, X, Shield, Award, Sparkles, MapPin } from 'lucide-react';
import { TournamentFixture, MatchScorecard, simulateAIMatch } from '../data/scheduleGenerator';
import { formatPlayerInitial } from '../lib/nameFormatter';
import TeamLogo from './TeamLogo';
import { gameAudio, triggerGameHaptic } from '../lib/gameAudioAndHaptics';

interface MatchScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixture: TournamentFixture | null;
}

export default function MatchScorecardModal({
  isOpen,
  onClose,
  fixture
}: MatchScorecardModalProps) {
  const [selectedInnings, setSelectedInnings] = useState<1 | 2>(1);

  if (!isOpen || !fixture) return null;

  // Resolve scorecard: use saved fixture.scorecard or generate deterministic fallback
  const scorecard: MatchScorecard = fixture.scorecard || (() => {
    const sim = simulateAIMatch(fixture);
    return sim.scorecard;
  })();

  const inn1 = scorecard.inn1;
  const inn2 = scorecard.inn2;
  const activeInn = selectedInnings === 1 ? inn1 : inn2;
  const bowlingInn = selectedInnings === 1 ? inn2 : inn1;

  const result = fixture.result;
  const pomName = result?.pomPlayer ? formatPlayerInitial(result.pomPlayer) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 touch-pan-y animate-fadeIn">
      <div className="bg-slate-950 border border-white/20 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl text-white">
        
        {/* Modal Header: Fixture Title, Teams & Close Button */}
        <div className="p-3 sm:p-4 border-b border-white/10 bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-black uppercase">
                Match #{fixture.matchNo} • {fixture.stage}
              </span>
              <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1 truncate">
                <MapPin size={11} className="text-gray-400 shrink-0" />
                <span className="truncate">{fixture.stadiumName}</span>
              </span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 mt-1.5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <TeamLogo teamId={inn1.teamShort} size={22} />
                <span className="font-black text-sm text-white">{inn1.teamShort}</span>
                <span className="font-mono text-xs text-amber-300 font-bold">
                  {inn1.totalRuns}/{inn1.totalWickets} ({inn1.oversPlayed} ov)
                </span>
              </div>
              <span className="text-gray-500 text-xs font-bold">vs</span>
              <div className="flex items-center gap-1.5">
                <TeamLogo teamId={inn2.teamShort} size={22} />
                <span className="font-black text-sm text-white">{inn2.teamShort}</span>
                <span className="font-mono text-xs text-amber-300 font-bold">
                  {inn2.totalRuns}/{inn2.totalWickets} ({inn2.oversPlayed} ov)
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              gameAudio.playUiTap('light');
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Close Scorecard"
          >
            <X size={16} />
          </button>
        </div>

        {/* Match Result Banner & POTM */}
        <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-amber-950/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-amber-400 shrink-0" />
            <span className="font-bold text-emerald-300">
              {result?.winnerName || fixture.teamAName} won by {result?.margin || 'runs'}
            </span>
            {scorecard.tossSummary && (
              <span className="text-[10px] text-gray-400 hidden sm:inline">
                • {scorecard.tossSummary}
              </span>
            )}
          </div>

          {pomName && (
            <div className="flex items-center gap-1 text-[11px] bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full text-amber-300 font-sans">
              <Award size={12} className="text-amber-400" />
              <span>POTM: <strong className="font-black">{pomName}</strong></span>
              {result?.pomStats && <span className="text-gray-300 text-[10px] hidden sm:inline">({result.pomStats})</span>}
            </div>
          )}
        </div>

        {/* Innings Tabs Switcher */}
        <div className="px-3 sm:px-4 pt-2.5 pb-1 flex items-center gap-2 bg-slate-950 shrink-0 border-b border-white/5">
          <button
            onClick={() => {
              gameAudio.playUiTap('select');
              triggerGameHaptic('light');
              setSelectedInnings(1);
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              selectedInnings === 1
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
            }`}
          >
            <TeamLogo teamId={inn1.teamShort} size={16} />
            <span>1st Innings: {inn1.teamShort} ({inn1.totalRuns}/{inn1.totalWickets})</span>
          </button>

          <button
            onClick={() => {
              gameAudio.playUiTap('select');
              triggerGameHaptic('light');
              setSelectedInnings(2);
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              selectedInnings === 2
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
            }`}
          >
            <TeamLogo teamId={inn2.teamShort} size={16} />
            <span>2nd Innings: {inn2.teamShort} ({inn2.totalRuns}/{inn2.totalWickets})</span>
          </button>
        </div>

        {/* Scrollable Detailed Scorecard Tables */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-3 sm:p-4 space-y-4">
          
          {/* Batting Scorecard Section */}
          <div className="rounded-2xl bg-slate-900 border border-white/10 overflow-hidden shadow-lg">
            <div className="px-3 py-2 bg-slate-950/80 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                🏏 {activeInn.teamName} Batting
              </span>
              <span className="text-[11px] font-mono text-gray-400">
                Total: <strong className="text-white">{activeInn.totalRuns}/{activeInn.totalWickets}</strong> ({activeInn.oversPlayed} ov, RR {(activeInn.totalRuns / Math.max(1, activeInn.oversPlayed)).toFixed(2)})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-[10px] text-gray-400 uppercase bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="py-1.5 px-3">Batter</th>
                    <th className="py-1.5 px-2">Dismissal</th>
                    <th className="py-1.5 px-2 text-right">R</th>
                    <th className="py-1.5 px-2 text-right">B</th>
                    <th className="py-1.5 px-2 text-right">4s</th>
                    <th className="py-1.5 px-2 text-right">6s</th>
                    <th className="py-1.5 px-3 text-right">SR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-200">
                  {activeInn.battingScorecard.map((b, idx) => {
                    const isNotOut = b.dismissal.toLowerCase().includes('not out');
                    return (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-1.5 px-3 font-sans font-bold text-white flex items-center gap-1.5 truncate">
                          <span className="truncate">{formatPlayerInitial(b.name)}</span>
                          {isNotOut && <span className="text-emerald-400 font-mono text-[10px]">*</span>}
                        </td>
                        <td className="py-1.5 px-2 text-[11px] text-gray-400 font-sans max-w-[150px] truncate">
                          {b.dismissal}
                        </td>
                        <td className="py-1.5 px-2 text-right font-black text-white">{b.runs}</td>
                        <td className="py-1.5 px-2 text-right text-gray-400">{b.balls}</td>
                        <td className="py-1.5 px-2 text-right text-gray-300">{b.fours}</td>
                        <td className="py-1.5 px-2 text-right text-amber-300 font-bold">{b.sixes}</td>
                        <td className="py-1.5 px-3 text-right text-gray-400">{b.strikeRate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bowling Figures Section */}
          <div className="rounded-2xl bg-slate-900 border border-white/10 overflow-hidden shadow-lg">
            <div className="px-3 py-2 bg-slate-950/80 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                🎯 {bowlingInn.teamName} Bowling
              </span>
              <span className="text-[11px] font-mono text-gray-400">
                {activeInn.totalWickets} Wickets Taken
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-[10px] text-gray-400 uppercase bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="py-1.5 px-3">Bowler</th>
                    <th className="py-1.5 px-2 text-center">O</th>
                    <th className="py-1.5 px-2 text-center">M</th>
                    <th className="py-1.5 px-2 text-right">R</th>
                    <th className="py-1.5 px-2 text-right">W</th>
                    <th className="py-1.5 px-3 text-right">Econ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-200">
                  {activeInn.bowlingFigures.map((bw, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-1.5 px-3 font-sans font-bold text-white truncate">
                        {formatPlayerInitial(bw.name)}
                      </td>
                      <td className="py-1.5 px-2 text-center text-gray-300">{bw.overs}</td>
                      <td className="py-1.5 px-2 text-center text-gray-400">{bw.maidens}</td>
                      <td className="py-1.5 px-2 text-right text-gray-300">{bw.runs}</td>
                      <td className={`py-1.5 px-2 text-right font-black ${bw.wickets >= 2 ? 'text-emerald-400' : 'text-white'}`}>
                        {bw.wickets}
                      </td>
                      <td className="py-1.5 px-3 text-right text-gray-400">{bw.economy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer: Close Button */}
        <div className="p-3 border-t border-white/10 bg-slate-900/90 flex items-center justify-end shrink-0">
          <button
            onClick={() => {
              gameAudio.playUiTap('light');
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase cursor-pointer transition-all"
          >
            Close Scorecard
          </button>
        </div>

      </div>
    </div>
  );
}
