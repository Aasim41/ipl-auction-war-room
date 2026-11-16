'use client';

import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Calendar, Globe, Settings, Play, Pause, ChevronRight, CheckCircle2, Zap, Bell } from 'lucide-react';
import { triggerInstantSampleNotification, scheduleRandomDailyNotifications } from '../lib/notificationService';

interface AutoSyncIndicatorProps {
  onOpenScheduleModal?: () => void;
  onDataSynced?: () => void;
}

export default function AutoSyncIndicator({ onOpenScheduleModal, onDataSynced }: AutoSyncIndicatorProps) {
  const [status, setStatus] = useState<any>(null);
  const [countdown, setCountdown] = useState<number>(20);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [activeInterval, setActiveInterval] = useState<number>(20);
  const [isAutoEnabled, setIsAutoEnabled] = useState<boolean>(true);
  const [tickerIndex, setTickerIndex] = useState<number>(0);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Poll status from backend
  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/pipeline/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        setActiveInterval(data.sync_interval_seconds || 20);
        setIsAutoEnabled(data.auto_sync_enabled ?? true);
      }
    } catch (e) {
      // Backend might be loading
    }
  };

  useEffect(() => {
    fetchStatus();
    const intervalId = setInterval(fetchStatus, 8000);
    return () => clearInterval(intervalId);
  }, []);

  // Countdown timer for next automated sync tick
  useEffect(() => {
    if (!isAutoEnabled) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchStatus();
          if (onDataSynced) onDataSynced();
          return activeInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeInterval, isAutoEnabled, onDataSynced]);

  // Rotate news ticker events every 5s
  useEffect(() => {
    if (!status?.recent_events?.length) return;
    const ticker = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % status.recent_events.length);
    }, 5000);
    return () => clearInterval(ticker);
  }, [status]);

  // Schedule random notifications on initial mount
  useEffect(() => {
    scheduleRandomDailyNotifications();
  }, []);

  const handleTestNotification = async () => {
    const res = await triggerInstantSampleNotification();
    setSyncFeedback(`Triggered Alert: ${res.title}`);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // Manual Trigger
  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await fetch('http://localhost:8000/api/pipeline/sync-form', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCountdown(activeInterval);
        setSyncFeedback(`Recalibrated ${data.players_updated} players!`);
        fetchStatus();
        if (onDataSynced) onDataSynced();
        setTimeout(() => setSyncFeedback(null), 4000);
      }
    } catch (e) {
      setSyncFeedback('Sync failed: backend offline.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle Auto Sync or change interval
  const handleConfigChange = async (enabled: boolean, interval: number) => {
    try {
      const res = await fetch('http://localhost:8000/api/pipeline/toggle-auto-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, interval_seconds: interval }),
      });
      if (res.ok) {
        setIsAutoEnabled(enabled);
        setActiveInterval(interval);
        setCountdown(interval);
        fetchStatus();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const currentEvent = status?.recent_events?.[tickerIndex] || {
    headline: 'Continuous International Ingestion Active',
    detail: 'Tracking 6 international bilateral series and domestic matchday forms.',
    tag: 'LIVE FEED 🟢'
  };

  return (
    <div className="relative mb-4">
      <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-slate-100">
        
        {/* Left: Live Pulse & Ticker */}
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          {/* Animated Status Pulse */}
          <div className="flex items-center gap-2 shrink-0 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1.5 rounded-xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAutoEnabled ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isAutoEnabled ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 font-mono">
              {isAutoEnabled ? `AUTO-SYNC (${countdown}s)` : 'PAUSED'}
            </span>
          </div>

          {/* Dynamic Matchday / Tour Bulletin Ticker */}
          <div className="flex items-center gap-2 min-w-0 text-xs overflow-hidden">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-white/10 text-amber-300 border border-white/10 shrink-0 font-mono">
              {currentEvent.tag}
            </span>
            <span className="font-bold text-white truncate shrink-0">
              {currentEvent.headline}:
            </span>
            <span className="text-gray-300 text-xs truncate">
              {currentEvent.detail}
            </span>
          </div>
        </div>

        {/* Right: Quick Controls & Modals */}
        <div className="flex items-center gap-2 shrink-0 justify-end flex-wrap">
          {syncFeedback && (
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 animate-fade-in">
              <CheckCircle2 size={13} /> {syncFeedback}
            </span>
          )}

          {/* International Schedule Modal Button */}
          {onOpenScheduleModal && (
            <button
              onClick={onOpenScheduleModal}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-[1.02]"
              title="View full 2026 International Tours & Player Conflict Calendar"
            >
              <Calendar size={13} className="text-indigo-400" />
              <span>International Schedule</span>
            </button>
          )}

          {/* Instant Manual Recalibrate Button */}
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
            title="Immediately trigger match performance ingestion and Power Index updates"
          >
            <RefreshCw size={13} className={`text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Recalibrating...' : 'Sync Now'}</span>
          </button>

          {/* Test Notification Trigger */}
          <button
            onClick={handleTestNotification}
            className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-500/40 transition-colors cursor-pointer"
            title="Trigger Instant Sample IPL Notification (Capacitor / Browser Alert)"
          >
            <Bell size={13} className="text-amber-400" />
          </button>

          {/* Sync Settings Dropdown Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Configure Autonomous Sync Frequency"
          >
            <Settings size={14} />
          </button>
        </div>

      </div>

      {/* Sync Frequency Popover Panel */}
      {showSettings && (
        <div className="absolute right-0 top-full mt-2 z-40 w-72 bg-slate-950 border border-white/20 rounded-2xl p-4 shadow-2xl animate-fade-in text-xs text-slate-200">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <span className="font-black text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5">
              <Zap size={13} className="text-amber-400" /> Pipeline Settings
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              {status?.ticks_completed || 0} updates logged
            </span>
          </div>

          <div className="space-y-3">
            {/* Auto-Sync Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Continuous Auto-Sync</span>
              <button
                onClick={() => handleConfigChange(!isAutoEnabled, activeInterval)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                  isAutoEnabled 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {isAutoEnabled ? <Play size={10} /> : <Pause size={10} />}
                {isAutoEnabled ? 'ENABLED' : 'PAUSED'}
              </button>
            </div>

            {/* Sync Speed / Interval */}
            <div>
              <span className="text-gray-400 text-[10px] block mb-1.5 font-bold uppercase">Update Frequency:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Fast (10s)', val: 10 },
                  { label: 'Normal (20s)', val: 20 },
                  { label: 'Eco (60s)', val: 60 }
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => handleConfigChange(true, item.val)}
                    className={`py-1.5 px-2 rounded-lg font-mono text-[10px] font-bold border transition-all cursor-pointer text-center ${
                      activeInterval === item.val
                        ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400 shadow-sm'
                        : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 text-[10px] text-gray-400">
              Automatically ingests international matchday scores, injury recoveries, and ECB/CA/CSA availability adjustments into SQLite in real time.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
