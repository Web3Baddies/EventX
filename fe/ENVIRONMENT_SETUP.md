# Environment Setup for EventX

## Required Environment Variables

Create a `.env.local` file in the root of the `fe` directory with the following variables:

```bash
# Google Maps API Key (required for location picker)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Smart Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address_here
NEXT_PUBLIC_CHAIN_ID=11155111  # Sepolia testnet (or your preferred network)

# Optional: RPC URL for custom network
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
```

## Setup Instructions

### 1. Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Smart Contract Deployment
1. Deploy the Ticket.sol contract to your preferred network
2. Copy the deployed contract address
3. Update the `NEXT_PUBLIC_CONTRACT_ADDRESS` variable

### 3. Network Configuration
- Default is set to Sepolia testnet (Chain ID: 11155111)
- Update `NEXT_PUBLIC_CHAIN_ID` for different networks:
  - Ethereum Mainnet: 1
  - Polygon: 137
  - BSC: 56
  - etc.

## New Features Added

### 1. Organizer Fee (Anti-Spam)
- Organizers pay 0.000001 ETH to create events
- Prevents spam event creation
- Implemented in smart contract and UI

### 2. Real-Time Seat Tracking
- Live seat availability updates
- Temporary seat reservations (5-minute timeout)
- Visual seat status indicators:
  - Green: Available
  - Yellow: Reserved (temporary)
  - Red: Sold

### 3. Blockchain Integration
- Real contract interactions for event creation
- Blockchain-based ticket minting
- Organizer status verification
- Transaction confirmations

### 4. Paid/Free Event Selection
- Organizers can choose between free and paid events
- Dynamic pricing UI based on event type
- Automatic price validation

### 5. Google Maps Integration
- Interactive location picker
- Address autocomplete
- Drag-and-drop marker positioning
- Reverse geocoding for coordinates

## Usage

1. Install dependencies: `npm install`
2. Create `.env.local` with required variables
3. Run development server: `npm run dev`
4. Connect MetaMask wallet
5. Ensure you're on the correct network
6. For organizers: Get approved by contract owner first

## Contract Functions Used

- `list()`: Create new events (with organizer fee)
- `mint()`: Purchase tickets
- `approvedOrganizers()`: Check organizer status
- `occasions()`: Get event details

## Security Notes

- API keys should never be committed to version control
- Contract addresses should be verified before use
- Always test on testnets before mainnet deployment
