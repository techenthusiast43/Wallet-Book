import React from 'react';
import { Users, Radio, Wallet, ExternalLink } from 'lucide-react';
import { botChainTestnet } from '../config/web3';

export function StatsCard({ totalContacts, connectedAddress, isConnected }) {
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {/* Total Contacts */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700/80 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">Total Saved Contacts</span>
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-bold tracking-tight text-white">
          {isConnected ? totalContacts : '—'}
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          {isConnected ? 'Privately stored on BOT Chain' : 'Connect wallet to view'}
        </p>
      </div>

      {/* Network Card */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700/80 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">Network & Chain ID</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Radio className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>BOT Chain</span>
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ID: {botChainTestnet.id}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <a
            href={botChainTestnet.blockExplorers.default.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
          >
            <span>Explorer: scan.bohr.life</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Connected Account */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700/80 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">Active Wallet</span>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-mono font-bold tracking-tight text-white">
          {isConnected ? formatAddress(connectedAddress) : 'Not Connected'}
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          {isConnected ? 'Contacts are encrypted to this wallet' : 'MetaMask or EVM compatible'}
        </p>
      </div>
    </div>
  );
}

