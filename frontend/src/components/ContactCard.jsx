import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { botChainTestnet } from '../config/web3';

export function ContactCard({ contact, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contact.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .trim()
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5 hover:border-slate-700 hover:bg-slate-900/70 transition-all group flex flex-col justify-between">
      <div>
        {/* Header with Avatar and Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center font-bold text-teal-400 text-sm flex-shrink-0">
              {getInitials(contact.name)}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white truncate text-base group-hover:text-teal-300 transition-colors">
                {contact.name}
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                ID #{contact.id.toString()}
              </span>
            </div>
          </div>

          {/* Quick Edit & Delete */}
          <div className="flex items-center gap-1 opacity-90 sm:opacity-75 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(contact)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-colors"
              title="Edit Contact"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(contact)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete Contact"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Address Pill */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5 flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" />
            <span
              className="text-xs font-mono text-slate-300 truncate"
              title={contact.walletAddress}
            >
              {truncateAddress(contact.walletAddress)}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Copy Address"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium hidden xs:inline">Copied</span>
                </>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {/* View on BOT Scan Explorer */}
            <a
              href={`${botChainTestnet.blockExplorers.default.url}/address/${contact.walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors"
              title="View on BOT Chain Explorer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

