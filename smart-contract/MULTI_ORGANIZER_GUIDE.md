# 🎟️ EventX Multi-Organizer System Guide

## Overview
The updated EventX smart contract now supports multiple event organizers, similar to platforms like Luma. Any approved organizer can create and manage their own events.

## Key Changes Made

### 1. **New Data Structures**
```solidity
struct Occassion {
    // ... existing fields ...
    address organizer; // Track who created the event
}

mapping(address => bool) public approvedOrganizers; // Track approved organizers
mapping(address => uint256[]) public organizerEvents; // Track events by organizer
```

### 2. **New Modifiers**
```solidity
modifier onlyApprovedOrganizer() {
    require(approvedOrganizers[msg.sender] || msg.sender == owner, "Caller is not an approved organizer");
    _;
}
```

### 3. **Updated Functions**
- `list()` - Now uses `onlyApprovedOrganizer` instead of `onlyOwner`
- Added organizer tracking in event creation
- Added events for organizer management

### 4. **New Functions**

#### Organizer Management
```solidity
function approveOrganizer(address _organizer) public onlyOwner
function revokeOrganizer(address _organizer) public onlyOwner
function isApprovedOrganizer(address _organizer) public view returns (bool)
```

#### Event Management
```solidity
function getOrganizerEvents(address _organizer) public view returns (uint256[])
function getEventDetails(uint256 _eventId) public view returns (...)
```

## How It Works

### 1. **Organizer Approval Process**
1. Contract owner calls `approveOrganizer(organizerAddress)`
2. Organizer becomes approved and can create events
3. Owner can revoke approval with `revokeOrganizer(organizerAddress)`

### 2. **Event Creation Flow**
1. Approved organizer calls `list()` function
2. Event is created with organizer's address tracked
3. Event ID is added to organizer's event list
4. `EventCreated` event is emitted

### 3. **Event Management**
- Each organizer can only manage their own events
- Events are tracked by organizer address
- Organizers can see all their events via `getOrganizerEvents()`

## Frontend Integration

### 1. **Organizer Registration**
```javascript
// Check if user is approved organizer
const isApproved = await contract.isApprovedOrganizer(userAddress);

// If not approved, show registration form
if (!isApproved) {
    // Show "Request Organizer Access" button
    // This would trigger a request to the contract owner
}
```

### 2. **Event Creation**
```javascript
// Only approved organizers can create events
const createEvent = async (eventData) => {
    const tx = await contract.list(
        eventData.title,
        ethers.utils.parseEther(eventData.price),
        eventData.maxTickets,
        eventData.date,
        eventData.time,
        eventData.location,
        ethers.utils.parseEther(eventData.maxResalePrice)
    );
    await tx.wait();
};
```

### 3. **Event Management Dashboard**
```javascript
// Get organizer's events
const organizerEvents = await contract.getOrganizerEvents(organizerAddress);

// Get event details
const eventDetails = await contract.getEventDetails(eventId);
```

## Deployment Instructions

### 1. **Deploy Updated Contract**
```bash
cd smart-contract
npx hardhat run scripts/deploy-multi-organizer.js --network XDCTestnet
```

### 2. **Approve Organizers**
```javascript
// Approve organizers after deployment
await contract.approveOrganizer("0x...");
```

### 3. **Update Frontend**
- Update contract ABI
- Update contract address
- Add organizer management UI
- Add event creation for approved organizers

## Security Considerations

### 1. **Access Control**
- Only contract owner can approve/revoke organizers
- Organizers can only create events, not modify others' events
- Ticket ownership and resale remain unchanged

### 2. **Event Ownership**
- Each event is tied to its creator
- Organizers can't modify events created by others
- Event data is immutable once created

### 3. **Revenue Sharing**
- All ticket sales go to the contract
- Contract owner can withdraw funds
- Consider implementing revenue sharing for organizers

## Future Enhancements

### 1. **Revenue Sharing**
```solidity
mapping(address => uint256) public organizerRevenue;
function withdrawOrganizerRevenue() public {
    // Allow organizers to withdraw their share
}
```

### 2. **Event Categories**
```solidity
enum EventCategory { CONCERT, CONFERENCE, SPORTS, OTHER }
struct Occasion {
    // ... existing fields ...
    EventCategory category;
}
```

### 3. **Organizer Profiles**
```solidity
struct OrganizerProfile {
    string name;
    string description;
    string website;
    bool verified;
}
```

## Testing

### 1. **Unit Tests**
- Test organizer approval/revocation
- Test event creation by approved organizers
- Test access control for non-approved users

### 2. **Integration Tests**
- Test full event creation flow
- Test ticket minting for organizer events
- Test resale functionality

### 3. **Frontend Tests**
- Test organizer registration flow
- Test event creation UI
- Test event management dashboard

## Migration from Single Owner

If you have an existing deployment:

1. **Deploy new contract** with multi-organizer support
2. **Migrate existing events** (if needed)
3. **Update frontend** to use new contract
4. **Approve initial organizers**
5. **Test thoroughly** before going live

## Conclusion

The multi-organizer system makes EventX more like traditional platforms (Luma, Eventbrite) while maintaining the benefits of blockchain technology. Organizers can now create and manage their own events, making the platform more scalable and user-friendly.

