# EventX Deployment Guide

## 🚀 Complete Deployment Process

### Step 1: Smart Contract Deployment

1. **Set up environment variables:**
```bash
cd smart-contract
cp .env.example .env
```

2. **Edit `.env` file with your credentials:**
```bash
PRIVATE_KEY=your_wallet_private_key_without_0x_prefix
```

3. **Deploy to XDC Testnet:**
```bash
npx hardhat run scripts/deploy.ts --network xdcApothem
```

4. **Copy the deployed contract address** from the output.

### Step 2: Frontend Configuration

1. **Create frontend environment file:**
```bash
cd ../fe
touch .env.local
```

2. **Add required variables to `.env.local`:**
```bash
# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address_here
NEXT_PUBLIC_CHAIN_ID=51

# Google Maps (for location picker)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Network Configuration
NEXT_PUBLIC_RPC_URL=https://erpc.apothem.network
```

### Step 3: Install Dependencies & Start Frontend

```bash
npm install
npm run dev
```

### Step 4: Wallet Setup

1. **Add XDC Testnet to MetaMask:**
   - Network Name: XDC Testnet
   - RPC URL: https://erpc.apothem.network
   - Chain ID: 51
   - Currency Symbol: TXDC

2. **Get testnet TXDC** for transactions

### Step 5: Organizer Approval

As the contract owner, approve organizers:
```bash
# Use Hardhat console or write a script
npx hardhat console --network xdcApothem
> const contract = await ethers.getContractAt("Ticket", "CONTRACT_ADDRESS")
> await contract.approveOrganizer("ORGANIZER_ADDRESS")
```

## 🧪 Testing Checklist

- [ ] Contract deployed successfully
- [ ] Frontend connects to correct network
- [ ] Wallet prompts for organizer fee (0.000001 ETH) when creating events
- [ ] Wallet prompts for ticket price when purchasing tickets
- [ ] Events show correct availability (not "sold out")
- [ ] Real-time seat tracking works
- [ ] Google Maps location picker functions

## 🔧 Troubleshooting

**Wallet not prompting:**
- Check contract address in `.env.local`
- Verify network connection (Chain ID: 51)
- Ensure sufficient balance for gas fees

**"Sold out" showing incorrectly:**
- Fixed in latest code - `tickets` field represents sold tickets, not available

**Organizer features not showing:**
- Must be approved by contract owner first
- Check `isApprovedOrganizer` status

## 📝 Key Changes Made

1. **Smart Contract:**
   - Added `ORGANIZER_FEE` (0.000001 ETH)
   - Modified `list()` function to require fee payment
   - Anti-spam protection implemented

2. **Frontend:**
   - Real blockchain integration (no more mock data)
   - Fixed seat availability calculations
   - Added Google Maps location picker
   - Paid/free event selection
   - Real-time seat tracking with reservations

3. **New Features:**
   - Organizer dashboard with analytics
   - Interactive map for venue selection
   - Blockchain transaction confirmations
   - Error handling for failed transactions
