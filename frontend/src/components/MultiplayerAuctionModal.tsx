'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Users, Gavel, X, Zap, MessageSquare, Send, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { IPL_FRANCHISES } from '../data/franchises';

interface MultiplayerAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  myDefaultTeam?: string;
}

export default function MultiplayerAuctionModal({
  isOpen,
  onClose,
  myDefaultTeam = 'RCB'
}: MultiplayerAuctionModalProps) {
  const [roomId, setRoomId] = useState('ipl2026-global');
  const [clientId] = useState(() => `user_${Math.random().toString(36).substring(2, 7)}`);
  const [selectedFranchise, setSelectedFranchise] = useState(myDefaultTeam);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<any | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string, team: string, text: string }>>([]);

  const socketRef = useRef<WebSocket | null>(null);

  // Connect / Disconnect WebSocket
  const connectSocket = () => {
    if (socketRef.current) socketRef.current.close();

    const wsUrl = `ws://localhost:8000/ws/auction/${encodeURIComponent(roomId)}/${encodeURIComponent(clientId)}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      // Claim initial seat
      ws.send(JSON.stringify({ action: 'claim_seat', franchise: selectedFranchise }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.payload) {
          setRoomState(data.payload);
        }
        if (data.type === 'CHAT_MESSAGE') {
          setChatMessages(prev => [...prev.slice(-15), {
            sender: data.client_id,
            team: data.team,
            text: data.message
          }]);
        }
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    socketRef.current = ws;
  };

  useEffect(() => {
    if (isOpen) {
      connectSocket();
    } else {
      if (socketRef.current) socketRef.current.close();
    }
    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [isOpen, roomId]);

  if (!isOpen) return null;

  const handleClaimSeat = (team: string) => {
    setSelectedFranchise(team);
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify({ action: 'claim_seat', franchise: team }));
    }
  };

  const handleBid = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify({ action: 'bid' }));
    }
  };

  const handleHammerFall = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify({ action: 'hammer_fall' }));
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketRef.current || !isConnected) return;
    socketRef.current.send(JSON.stringify({ action: 'chat', message: chatInput.trim() }));
    setChatInput('');
  };

  const p = roomState?.current_player;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-white/20 rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Live Multiplayer Auction Arena
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                  isConnected ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {isConnected ? '● CONNECTED (WEBSOCKET)' : '○ DISCONNECTED'}
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Bid in real-time against other human franchise managers and remaining AI bots.
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

        {/* Room & Seat Configuration */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-400">Room Code:</span>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="bg-slate-950 border border-white/20 rounded-lg px-2.5 py-1 text-white font-mono font-bold text-xs"
            />
            <button
              onClick={connectSocket}
              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer"
            >
              Rejoin
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-400">Your Seat:</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black">
              {selectedFranchise}
            </span>
            <span className="text-gray-500 font-mono">({clientId})</span>
          </div>
        </div>

        {/* Claim Franchise Seat Strip */}
        <div className="mb-4">
          <div className="text-[11px] font-black uppercase text-gray-400 mb-2">Claim Franchise Desk:</div>
          <div className="flex gap-1.5 flex-wrap">
            {Object.entries(IPL_FRANCHISES).map(([key, f]) => {
              const isSelected = selectedFranchise === f.short;
              const isOccupiedByOther = roomState?.seats && Object.values(roomState.seats).includes(f.short) && !isSelected;
              return (
                <button
                  key={key}
                  disabled={isOccupiedByOther}
                  onClick={() => handleClaimSeat(f.short)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black border-white shadow-lg'
                      : isOccupiedByOther
                      ? 'bg-slate-950/40 text-gray-600 border-white/5 opacity-50 cursor-not-allowed'
                      : 'bg-slate-900 text-gray-300 border-white/10 hover:border-white/30'
                  }`}
                >
                  {f.emoji} {f.short}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Hammer Stage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Active Player Card */}
          <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10">
            {p ? (
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold uppercase">
                    {p.role} • {p.nationality}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    Base: ₹{p.base_price} Cr
                  </span>
                </div>

                <div className="text-2xl font-black text-white tracking-wide">
                  {p.name}
                </div>

                {/* Live Current Bid Box */}
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-black text-gray-400">Current Highest Bid</div>
                    <div className="text-3xl font-black text-emerald-400 font-mono mt-0.5">
                      ₹{roomState?.current_bid?.toFixed(2)} Cr
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-black text-gray-400">Holding Bidder</div>
                    <div className="text-xl font-black text-white mt-0.5">
                      {roomState?.current_bidder || 'No Bids Yet'}
                    </div>
                  </div>
                </div>

                {/* Bidding Controls */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleBid}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer transition-all"
                  >
                    <Gavel size={18} /> Place Bid for {selectedFranchise}
                  </button>

                  <button
                    onClick={handleHammerFall}
                    className="px-4 py-3 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 font-bold text-xs cursor-pointer transition-all"
                    title="Declare Sold / Drop Gavel"
                  >
                    Hammer Fall
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400 text-sm">
                Waiting for auctioneer to nominate next player...
              </div>
            )}
          </div>

          {/* Connected Participants & Live Roster */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-white/10">
            <div className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
              <Users size={12} /> Franchise Table Seats
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto text-xs">
              {roomState?.ai_franchises?.map((ai: any) => (
                <div
                  key={ai.abbr}
                  className={`p-2 rounded-xl border flex items-center justify-between ${
                    ai.is_human
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-white'
                      : 'bg-slate-950 border-white/5 text-gray-400'
                  }`}
                >
                  <span className="font-bold flex items-center gap-1.5">
                    {ai.is_human ? '👤' : '🤖'} {ai.abbr}
                  </span>
                  <span className="font-mono text-[11px] text-gray-300">
                    ₹{ai.budget} Cr
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Multiplayer Chat & Event Feed */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-white/10">
          <div className="text-xs font-black uppercase text-gray-400 mb-2 flex items-center gap-1.5">
            <MessageSquare size={12} /> Live Room Feed & Auction Chatter
          </div>
          
          <div className="h-28 overflow-y-auto space-y-1.5 mb-2 font-mono text-[11px] p-2 bg-slate-950 rounded-xl border border-white/5">
            {chatMessages.length === 0 ? (
              <div className="text-gray-500 text-center py-6">No chat messages yet. Say hello to rival managers!</div>
            ) : (
              chatMessages.map((m, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="font-bold text-amber-400 shrink-0">[{m.team}]:</span>
                  <span className="text-gray-200">{m.text}</span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              placeholder={`Chat as ${selectedFranchise}...`}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Send size={12} /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
