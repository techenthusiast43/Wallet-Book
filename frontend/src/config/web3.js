import { defineChain } from 'viem';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { http } from 'wagmi';
import walletBookDeployment from '../contracts/WalletBook.json';

// 1. Define custom BOT Chain Testnet
export const botChainTestnet = defineChain({
  id: 968,
  name: 'BOT Chain Testnet',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bohr.life'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BOT Scan',
      url: 'https://scan.bohr.life',
    },
  },
  testnet: true,
});

// 2. Reown AppKit Project ID (free from https://cloud.reown.com)
// Provided with fallback for instant local/dev usage
export const projectId =
  import.meta.env.VITE_REOWN_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694';

export const networks = [botChainTestnet];

// 3. Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  transports: {
    [botChainTestnet.id]: http('https://rpc.bohr.life'),
  },
});

export const config = wagmiAdapter.wagmiConfig;

// 4. Initialize Reown AppKit Modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  defaultNetwork: botChainTestnet,
  projectId,
  metadata: {
    name: 'WalletBook',
    description: 'Decentralized Address Book on BOT Chain',
    url: 'https://scan.bohr.life',
    icons: ['https://scan.bohr.life/favicon.ico'],
  },
  features: {
    analytics: false,
    email: false,
    socials: [],
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#0d9488',
    '--w3m-color-mix': '#0f172a',
    '--w3m-color-mix-strength': 40,
    '--w3m-border-radius-master': '12px',
  },
});

// Contract configuration
export const CONTRACT_ADDRESS =
  import.meta.env.VITE_WALLET_BOOK_ADDRESS || walletBookDeployment.address;
export const CONTRACT_ABI = walletBookDeployment.abi;

