# WalletBook 📒

**WalletBook** is a lightweight, decentralized Web3 address book dApp deployed on the **BOT Chain** network. It allows users to privately save, edit, search, and manage wallet addresses with custom contact names directly on-chain.

---

## 🌐 BOT Chain Network Parameters

| Parameter | Value |
| :--- | :--- |
| **Network Name** | BOT Chain Testnet |
| **Chain ID** | `968` |
| **RPC Endpoint** | `https://rpc.bohr.life` |
| **Native Token** | `BOT` (18 Decimals) |
| **Total Supply** | 150 Million |
| **Block Explorer** | [https://scan.bohr.life](https://scan.bohr.life) |

---

## ✨ Core Features

1. **MetaMask & EVM Wallet Connection**:
   - Integrated with **Reown AppKit** (formerly Web3Modal) and **Wagmi v2 / Viem**.
   - Automatic BOT Chain Testnet detection and network switching prompt.
2. **On-Chain Contact Management**:
   - **Add Contact**: Save addresses with custom names (1-64 characters).
   - **Update Contact**: Edit existing contact names and addresses.
   - **Delete Contact**: Remove entries with $O(1)$ swap-and-pop gas efficiency.
   - **Privacy Isolation**: Contacts are strictly private to the caller's wallet address at the smart contract level.
3. **User Experience**:
   - **One-Click Address Copy**: Instant clipboard copy with visual feedback.
   - **Live Search**: Instant real-time filter by contact name or hexadecimal address.
   - **Transaction Status & Hashes**: Real-time pending, success, and error toasts with direct links to [BOT Scan](https://scan.bohr.life) for transaction hashes.
   - **Responsive & Modern**: Clean dark-mode dashboard tailored for desktop and mobile.

---

## 🏗 Project Structure

```
wallet-book/
├── contracts/
│   └── WalletBook.sol          # Solidity smart contract
├── test/
│   └── WalletBook.test.cjs      # Hardhat unit tests
├── scripts/
│   └── deploy.cjs              # Deployment script exporting ABI & address
├── hardhat.config.cjs          # Hardhat configuration (EVM target: Paris)
├── frontend/
│   ├── src/
│   │   ├── config/
│   │   │   └── web3.js         # Viem chain & Reown AppKit setup
│   │   ├── contracts/
│   │   │   └── WalletBook.json # Deployed address and ABI
│   │   ├── components/
│   │   │   ├── Header.jsx      # Top navigation & AppKit button
│   │   │   ├── StatsCard.jsx   # Contact counters & network info
│   │   │   ├── ContactCard.jsx # Contact item card with copy & actions
│   │   │   ├── ContactModal.jsx# Add / Edit contact modal
│   │   │   ├── DeleteModal.jsx # Delete confirmation modal
│   │   │   └── TransactionBanner.jsx # Real-time TX hash banner
│   │   ├── App.jsx             # Main dashboard
│   │   └── main.jsx            # React root with Wagmi & React Query
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── README.md
└── package.json
```

---

## ⚡ Smart Contract Specification (`WalletBook.sol`)

The contract provides four primary external methods:

* `addContact(string calldata name, address walletAddress) external returns (uint256 contactId)`
* `updateContact(uint256 contactId, string calldata name, address walletAddress) external`
* `deleteContact(uint256 contactId) external`
* `getMyContacts() external view returns (Contact[] memory)`
* `getMyContactCount() external view returns (uint256)`

### Key Design Highlights:
* **Caller Privacy**: `_userContacts` mapping is `private`. The `getMyContacts()` view function queries strictly `_userContacts[msg.sender]`.
* **$O(1)$ Gas Efficiency**: Deletions use the swap-and-pop technique, avoiding expensive storage compaction loops.
* **Input Validation**: Prevents empty names, names exceeding 64 bytes, and `address(0)`.
* **Audit Events**: Emits `ContactAdded`, `ContactUpdated`, and `ContactDeleted` with indexed user and contact IDs.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or later recommended; v24 tested)
- **MetaMask** or any EVM-compatible browser extension

---

### 2. Smart Contract Testing & Deployment

#### Install Contract Dependencies:
```bash
npm install
```

#### Run Unit Tests:
```bash
npm test
```
All 12 unit tests verify contact addition, update, swap-and-pop deletion, access isolation, and boundary conditions.

#### Configure Environment for Deployment:
Create a `.env` file in the root directory:
```env
BOT_CHAIN_RPC=https://rpc.bohr.life
PRIVATE_KEY=your_private_key_here
```
> ⚠️ **Security**: Never share or commit your private key or seed phrase.

#### Deploy to BOT Chain:
```bash
npm run deploy:bot
```
The script will:
1. Deploy `WalletBook` to BOT Chain (`chainId: 968`).
2. Log the contract address and explorer link.
3. Automatically export the ABI and deployment address to `frontend/src/contracts/WalletBook.json`.

---

### 3. Frontend Setup

#### Navigate to the frontend directory:
```bash
cd frontend
```

#### Install Frontend Dependencies:
```bash
npm install
```

#### Configure Environment:
Copy `.env.example` to `.env`:
```env
VITE_REOWN_PROJECT_ID=your_reown_project_id
VITE_WALLET_BOOK_ADDRESS=0xYourDeployedContractAddress
```
*(A default fallback Reown project ID is included for instant local testing).*

#### Run Development Server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Manual Testing Checklist

1. **Connect Wallet**: Click **Connect Wallet** in the top-right corner.
2. **Network Detection**:
   - If connected to Ethereum or Sepolia, the top alert bar prompts you to switch to **BOT Chain Testnet (ID: 968)**.
3. **Add Contact**:
   - Click **Add Contact**.
   - Enter name (e.g., `Dev Treasury`) and a valid EVM address.
   - Confirm the transaction in your wallet.
   - Watch the transaction toast update from **Pending** to **Confirmed**, showing the live [BOT Scan](https://scan.bohr.life) transaction link.
4. **Search**:
   - Type in the search box to filter contacts by name or address.
5. **Copy Address**:
   - Click the copy button on any contact card to copy their checksummed address.
6. **Edit / Delete**:
   - Update contact details or remove them. The list will update automatically upon block confirmation.

