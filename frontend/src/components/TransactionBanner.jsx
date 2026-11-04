import React from 'react';
import { ExternalLink, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { botChainTestnet } from '../config/web3';

export function TransactionBanner({ transaction, onDismiss }) {
  if (!transaction) return null;

  const { status, title, message, hash, error } = transaction;

  const explorerTxUrl = hash ? `${botChainTestnet.blockExplorers.default.url}/tx/${hash}` : null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 animate-slideUp">
      <div
        className={`rounded-2xl border p-4 shadow-2xl backdrop-blur-md relative ${
          status === 'pending'
            ? 'bg-slate-900/95 border-teal-500/40 text-slate-200'
            : status === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
            : 'bg-red-950/90 border-red-500/40 text-red-200'
        }`}
      >
        <button
          onClick={onDismiss}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {status === 'pending' && <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />}
            {status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {status === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
          </div>

          <div className="min-w-0 pr-4">
            <h4 className="font-semibold text-sm text-white">{title}</h4>
            {message && <p className="text-xs text-slate-300 mt-0.5">{message}</p>}
            {error && (
              <p className="text-xs text-red-300/90 mt-1 font-mono break-words line-clamp-2">
                {error}
              </p>
            )}

            {/* Transaction Hash on BOT Explorer */}
            {explorerTxUrl && (
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-2">
                <a
                  href={explorerTxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-teal-300 hover:text-teal-200 underline underline-offset-2 transition-colors"
                >
                  <span>View on BOT Scan ({hash.slice(0, 8)}...{hash.slice(-6)})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

