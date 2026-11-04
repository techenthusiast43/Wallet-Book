import React from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { BookMarked, AlertTriangle, ShieldCheck } from 'lucide-react';
import { botChainTestnet } from '../config/web3';

export function Header() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== botChainTestnet.id;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <BookMarked className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">WalletBook</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                BOT Chain
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Decentralized EVM Address Book
            </p>
          </div>
        </div>

        {/* Network & Connect Button */}
        <div className="flex items-center gap-3">
          {isConnected && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>BOT Chain Testnet ({botChainTestnet.id})</span>
            </div>
          )}

          {/* Reown AppKit Web Component Button */}
          <appkit-button balance="show" />
        </div>
      </div>

      {/* Wrong Network Warning Banner */}
      {isWrongNetwork && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            You are connected to an unsupported network. Please switch to <strong>BOT Chain Testnet (ID: 968)</strong> to interact.
          </span>
          <button
            onClick={() => switchChain({ chainId: botChainTestnet.id })}
            className="ml-2 underline font-semibold hover:text-amber-200 transition-colors cursor-pointer"
          >
            Switch Network
          </button>
        </div>
      )}
    </header>
  );
}

