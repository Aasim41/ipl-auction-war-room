'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, Clock } from 'lucide-react';

interface NOCRiskBadgeProps {
  name: string;
  nationality?: string;
  isOverseas?: boolean;
  availabilityPct?: number;
  playoffAvailable?: boolean;
  injuryFragility?: 'Low' | 'Medium' | 'High';
  board?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export default function NOCRiskBadge({
  name,
  nationality = 'Indian',
  isOverseas = false,
  availabilityPct = 100,
  playoffAvailable = true,
  injuryFragility = 'Low',
  board = 'BCCI',
  showDetails = false,
  compact = true
}: NOCRiskBadgeProps) {
  const isHighRisk = injuryFragility === 'High' || availabilityPct < 75;
  const isPlayoffRisk = !playoffAvailable;
  const isMonitored = injuryFragility === 'Medium';
  const isFullSeason = availabilityPct >= 90 && injuryFragility === 'Low';

  // If player is standard domestic cleared and not in detail mode, don't spam the card
  if (!isOverseas && isFullSeason && !showDetails) {
    return null;
  }

  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
  let badgeText = isOverseas ? `${board} Cleared` : 'BCCI Cleared';
  let Icon = ShieldCheck;

  if (isHighRisk) {
    badgeColor = 'bg-rose-500/15 text-rose-300 border-rose-500/35';
    badgeText = `${board} Risk`;
    Icon = AlertCircle;
  } else if (isPlayoffRisk) {
    badgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/35';
    badgeText = 'Misses Playoffs';
    Icon = Clock;
  } else if (isMonitored) {
    badgeColor = 'bg-orange-500/15 text-orange-300 border-orange-500/35';
    badgeText = 'Workload Monitored';
    Icon = AlertTriangle;
  }

  return (
    <span 
      className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${badgeColor} transition-all`}
      title={`${name}: ${board} Clearance (${availabilityPct}% availability). ${injuryFragility} injury risk.`}
    >
      <Icon size={9} />
      <span>{badgeText}</span>
      {showDetails && (
        <span className="opacity-75 font-mono">({availabilityPct}%)</span>
      )}
    </span>
  );
}
