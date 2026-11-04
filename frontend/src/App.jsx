import React, { useState, useMemo } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Search, Plus, BookOpen, Lock, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { CONTRACT_ADDRESS, CONTRACT_ABI, botChainTestnet } from './config/web3';
import { Header } from './components/Header';
import { StatsCard } from './components/StatsCard';
import { ContactCard } from './components/ContactCard';
import { ContactModal } from './components/ContactModal';
import { DeleteModal } from './components/DeleteModal';
import { TransactionBanner } from './components/TransactionBanner';

export function App() {
  const { address, isConnected } = useAccount();

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [modalState, setModalState] = useState({ isOpen: false, data: null });
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, contact: null });

  // Transaction Feedback state
  const [transactionState, setTransactionState] = useState(null);
  const [currentTxHash, setCurrentTxHash] = useState(null);

  // Read contacts from WalletBook contract
  const {
    data: rawContacts,
    isLoading: isReadingContacts,
    refetch: refetchContacts,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getMyContacts',
    account: address,
    query: {
      enabled: isConnected && Boolean(address),
    },
  });

  // Contract write hook
  const { writeContractAsync, isPending: isWritingContract } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isWaitingTx } = useWaitForTransactionReceipt({
    hash: currentTxHash,
    query: {
      enabled: Boolean(currentTxHash),
    },
    onSuccess: (receipt) => {
      setTransactionState((prev) => ({
        ...prev,
        status: 'success',
        title: 'Transaction Confirmed!',
        message: 'Your address book has been updated on BOT Chain.',
      }));
      refetchContacts();
      setCurrentTxHash(null);
    },
    onError: (err) => {
      setTransactionState({
        status: 'error',
        title: 'Transaction Failed',
        error: err.shortMessage || err.message,
      });
      setCurrentTxHash(null);
    },
  });

  const isActionLoading = isWritingContract || isWaitingTx;

  // Format contacts
  const contacts = useMemo(() => {
    if (!rawContacts || !Array.isArray(rawContacts)) return [];
    return rawContacts.map((c) => ({
      id: c.id,
      name: c.name,
      walletAddress: c.walletAddress,
    }));
  }, [rawContacts]);

  // Filtered contacts based on search query
  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts;
    const query = searchTerm.toLowerCase().trim();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.walletAddress.toLowerCase().includes(query)
    );
  }, [contacts, searchTerm]);

  // Add or Edit Contact
  const handleSaveContact = async (formData) => {
    try {
      const isEdit = Boolean(formData.id);
      setTransactionState({
        status: 'pending',
        title: isEdit ? 'Updating Contact...' : 'Adding Contact...',
        message: 'Please sign the transaction in your wallet.',
      });

      let txHash;
      if (isEdit) {
        txHash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'updateContact',
          args: [formData.id, formData.name, formData.walletAddress],
        });
      } else {
        txHash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'addContact',
          args: [formData.name, formData.walletAddress],
        });
      }

      setCurrentTxHash(txHash);
      setTransactionState({
        status: 'pending',
        title: isEdit ? 'Updating on BOT Chain' : 'Saving on BOT Chain',
        message: 'Transaction broadcasted. Waiting for block confirmation...',
        hash: txHash,
      });

      setModalState({ isOpen: false, data: null });
    } catch (err) {
      console.error('Save contact error:', err);
      setTransactionState({
        status: 'error',
        title: 'Transaction Rejected or Failed',
        error: err.shortMessage || err.message,
      });
    }
  };

  // Delete Contact
  const handleDeleteContact = async (contactId) => {
    try {
      setTransactionState({
        status: 'pending',
        title: 'Deleting Contact...',
        message: 'Please sign the transaction to remove the contact.',
      });

      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'deleteContact',
        args: [contactId],
      });

      setCurrentTxHash(txHash);
      setTransactionState({
        status: 'pending',
        title: 'Removing from BOT Chain',
        message: 'Transaction broadcasted. Waiting for block confirmation...',
        hash: txHash,
      });

      setDeleteModalState({ isOpen: false, contact: null });
    } catch (err) {
      console.error('Delete contact error:', err);
      setTransactionState({
        status: 'error',
        title: 'Delete Failed',
        error: err.shortMessage || err.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro Banner */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-teal-950/40 border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 blur-3xl pointer-events-none rounded-full" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Decentralized & Gas-Efficient Contact Book</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Manage Your Web3 Contacts on <span className="text-teal-400">BOT Chain</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2 leading-relaxed">
              Store names, checksummed addresses, and multisigs securely on-chain.
              Every contact list is private to your connected wallet.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <StatsCard
          totalContacts={contacts.length}
          connectedAddress={address}
          isConnected={isConnected}
        />

        {/* Action & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by contact name or address (0x...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!isConnected}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {isConnected && (
              <button
                onClick={() => refetchContacts()}
                title="Refresh contacts from chain"
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isReadingContacts ? 'animate-spin' : ''}`} />
              </button>
            )}

            <button
              onClick={() => setModalState({ isOpen: true, data: null })}
              disabled={!isConnected}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {!isConnected ? (
          /* Disconnected State */
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400 mb-4">
              <Lock className="w-7 h-7 text-teal-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Wallet Not Connected</h3>
            <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
              Connect your MetaMask or EVM wallet to view and manage your private contact list on BOT Chain.
            </p>
            <appkit-button />
          </div>
        ) : isReadingContacts && contacts.length === 0 ? (
          /* Loading State */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 rounded-2xl border border-slate-800 bg-slate-900/40 animate-pulse p-5"
              />
            ))}
          </div>
        ) : contacts.length === 0 ? (
          /* Empty Address Book */
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Contacts Saved Yet</h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              Your BOT Chain address book is currently empty. Start by adding your first wallet address!
            </p>
            <button
              onClick={() => setModalState({ isOpen: true, data: null })}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Contact</span>
            </button>
          </div>
        ) : filteredContacts.length === 0 ? (
          /* No search results */
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-10 text-center">
            <p className="text-sm text-slate-400 mb-2">
              No contacts found matching "<span className="text-white font-medium">{searchTerm}</span>"
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-teal-400 hover:underline cursor-pointer"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          /* Contact Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id.toString()}
                contact={contact}
                onEdit={(c) => setModalState({ isOpen: true, data: c })}
                onDelete={(c) => setDeleteModalState({ isOpen: true, contact: c })}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-500" />
            <span>WalletBook &bull; Decentralized address book on BOT Chain (Chain ID: {botChainTestnet.id})</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://scan.bohr.life"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-teal-400 transition-colors"
            >
              BOT Explorer
            </a>
            <a
              href="https://rpc.bohr.life"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-teal-400 transition-colors"
            >
              RPC Endpoint
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ContactModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, data: null })}
        onSubmit={handleSaveContact}
        initialData={modalState.data}
        isLoading={isActionLoading}
      />

      <DeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, contact: null })}
        onConfirm={handleDeleteContact}
        contact={deleteModalState.contact}
        isLoading={isActionLoading}
      />

      {/* Live Transaction Toast Banner */}
      <TransactionBanner
        transaction={transactionState}
        onDismiss={() => setTransactionState(null)}
      />
    </div>
  );
}
export default App;

