import React, { useState, useEffect } from 'react';
import { isAddress } from 'viem';
import { X, UserPlus, Edit3, Loader2, AlertCircle } from 'lucide-react';

export function ContactModal({ isOpen, onClose, onSubmit, initialData = null, isLoading }) {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setAddress(initialData.walletAddress || '');
    } else {
      setName('');
      setAddress('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    const trimmedName = name.trim();

    if (!trimmedName) {
      errs.name = 'Contact name is required.';
    } else if (trimmedName.length > 64) {
      errs.name = 'Name must not exceed 64 characters.';
    }

    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      errs.address = 'Wallet address is required.';
    } else if (!isAddress(trimmedAddress)) {
      errs.address = 'Please enter a valid EVM wallet address (0x...).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      id: initialData?.id,
      name: name.trim(),
      walletAddress: address.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
            {isEdit ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {isEdit ? 'Edit Contact' : 'Add New Contact'}
            </h2>
            <p className="text-xs text-slate-400">
              {isEdit
                ? 'Update contact nickname or wallet address'
                : 'Save a verified address to your BOT Chain address book'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Contact Name / Label
            </label>
            <input
              type="text"
              placeholder="e.g. Alice / Treasury Vault / DAO Multisig"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
              disabled={isLoading}
              maxLength={64}
              className={`w-full rounded-xl border bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                errors.name
                  ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                  : 'border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Wallet Address Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              EVM Wallet Address
            </label>
            <input
              type="text"
              placeholder="0x1234...abcd"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address) setErrors((prev) => ({ ...prev, address: null }));
              }}
              disabled={isLoading}
              className={`w-full font-mono rounded-xl border bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                errors.address
                  ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                  : 'border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
              }`}
            />
            {errors.address && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.address}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-xs font-semibold text-white shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirming on Chain...</span>
                </>
              ) : (
                <span>{isEdit ? 'Update Contact' : 'Save Contact'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

