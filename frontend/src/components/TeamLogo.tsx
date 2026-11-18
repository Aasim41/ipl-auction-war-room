'use client';

import React, { useState } from 'react';

interface TeamLogoProps {
  teamId: string;
  size?: number;
  className?: string;
  showShadow?: boolean;
}

const CANONICAL_TEAM_IDS: Record<string, { id: string; name: string; color: string }> = {
  csk: { id: 'csk', name: 'Chennai Super Kings', color: '#fbbf24' },
  chennai: { id: 'csk', name: 'Chennai Super Kings', color: '#fbbf24' },
  'chennai super kings': { id: 'csk', name: 'Chennai Super Kings', color: '#fbbf24' },
  
  mi: { id: 'mi', name: 'Mumbai Indians', color: '#2563eb' },
  mumbai: { id: 'mi', name: 'Mumbai Indians', color: '#2563eb' },
  'mumbai indians': { id: 'mi', name: 'Mumbai Indians', color: '#2563eb' },
  
  rcb: { id: 'rcb', name: 'Royal Challengers Bengaluru', color: '#dc2626' },
  bangalore: { id: 'rcb', name: 'Royal Challengers Bengaluru', color: '#dc2626' },
  bengaluru: { id: 'rcb', name: 'Royal Challengers Bengaluru', color: '#dc2626' },
  'royal challengers bangalore': { id: 'rcb', name: 'Royal Challengers Bengaluru', color: '#dc2626' },
  'royal challengers bengaluru': { id: 'rcb', name: 'Royal Challengers Bengaluru', color: '#dc2626' },
  
  kkr: { id: 'kkr', name: 'Kolkata Knight Riders', color: '#7c3aed' },
  kolkata: { id: 'kkr', name: 'Kolkata Knight Riders', color: '#7c3aed' },
  'kolkata knight riders': { id: 'kkr', name: 'Kolkata Knight Riders', color: '#7c3aed' },
  
  srh: { id: 'srh', name: 'Sunrisers Hyderabad', color: '#ea580c' },
  hyderabad: { id: 'srh', name: 'Sunrisers Hyderabad', color: '#ea580c' },
  'sunrisers hyderabad': { id: 'srh', name: 'Sunrisers Hyderabad', color: '#ea580c' },
  
  rr: { id: 'rr', name: 'Rajasthan Royals', color: '#db2777' },
  rajasthan: { id: 'rr', name: 'Rajasthan Royals', color: '#db2777' },
  'rajasthan royals': { id: 'rr', name: 'Rajasthan Royals', color: '#db2777' },
  
  dc: { id: 'dc', name: 'Delhi Capitals', color: '#0284c7' },
  delhi: { id: 'dc', name: 'Delhi Capitals', color: '#0284c7' },
  'delhi capitals': { id: 'dc', name: 'Delhi Capitals', color: '#0284c7' },
  
  pbks: { id: 'pbks', name: 'Punjab Kings', color: '#b91c1c' },
  punjab: { id: 'pbks', name: 'Punjab Kings', color: '#b91c1c' },
  'punjab kings': { id: 'pbks', name: 'Punjab Kings', color: '#b91c1c' },
  
  lsg: { id: 'lsg', name: 'Lucknow Super Giants', color: '#0891b2' },
  lucknow: { id: 'lsg', name: 'Lucknow Super Giants', color: '#0891b2' },
  'lucknow super giants': { id: 'lsg', name: 'Lucknow Super Giants', color: '#0891b2' },
  
  gt: { id: 'gt', name: 'Gujarat Titans', color: '#0d9488' },
  gujarat: { id: 'gt', name: 'Gujarat Titans', color: '#0d9488' },
  'gujarat titans': { id: 'gt', name: 'Gujarat Titans', color: '#0d9488' }
};

export default function TeamLogo({
  teamId = 'mi',
  size = 28,
  className = '',
  showShadow = true
}: TeamLogoProps) {
  const [imgError, setImgError] = useState(false);
  const tid = (teamId || 'mi').toLowerCase().trim();
  const teamMeta = CANONICAL_TEAM_IDS[tid] || { id: tid, name: tid.toUpperCase(), color: '#f59e0b' };
  const canonicalId = teamMeta.id;

  if (!imgError) {
    return (
      <img
        src={`/teams/${canonicalId}.png`}
        alt={`${teamMeta.name} Logo`}
        width={size}
        height={size}
        loading="eager"
        onError={() => setImgError(true)}
        className={`object-contain inline-block shrink-0 select-none ${
          showShadow ? 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]' : ''
        } ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          maxWidth: `${size}px`,
          maxHeight: `${size}px`
        }}
      />
    );
  }

  // Fallback badge if image fails
  return (
    <div
      className={`rounded-full flex items-center justify-center font-black font-mono shrink-0 select-none border border-white/20 text-white ${
        showShadow ? 'shadow-md' : ''
      } ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        backgroundColor: teamMeta.color,
        fontSize: `${Math.max(8, Math.floor(size * 0.38))}px`
      }}
      title={teamMeta.name}
    >
      {canonicalId.toUpperCase().slice(0, 3)}
    </div>
  );
}
