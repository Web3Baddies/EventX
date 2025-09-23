// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract Ticket is ERC721 {
    address public owner;
    uint256 public totalOccassions;
    uint256 public totalSupply;
    uint256 public constant ORGANIZER_FEE = 1000000000000; // 0.000001 ETH in wei
    uint256 public constant FEE_BPS = 250; // 2.5% protocol fee for paid events
    uint256 public constant GRACE_PERIOD = 48 hours; // organizer has 48h after event to mark occurred

    struct Occassion {
        uint256 id;
        string title;
        uint256 price;
        uint256 tickets;
        uint256 maxTickets;
        string date;
        string time;
        string location;
        uint256 maxResalePrice;
        address organizer; // Track who created the event
        uint256 eventTimestamp; // unix timestamp of event start
        uint256 escrowBalance; // accumulated primary sale proceeds awaiting release
        bool canceled; // organizer canceled
        bool occurred; // organizer confirmed occurred
        bool payoutReleased; // escrow released to organizer
    }

    /**
     * @notice Mark a ticket as checked-in on-chain
     * @param tokenId The ticket token ID being checked in
     * @dev Only approved organizers (or owner) can perform check-in
     */
    function checkIn(uint256 tokenId) external onlyApprovedOrganizer {
        _requireOwned(tokenId);
        require(!checkedIn[tokenId], "Already checked in");
        TicketInfo storage ticket = ticketDetails[tokenId];
        Occassion storage occasion = occasions[ticket.occasionId];
        require(!occasion.canceled, "Event canceled");
        // Optional timing rule: allow check-in from 24h before start to any time after
        // if (occasion.eventTimestamp > 0) {
        //     require(block.timestamp + 24 hours >= occasion.eventTimestamp, "Too early to check in");
        // }
        checkedIn[tokenId] = true;
        emit TicketCheckedIn(tokenId, ownerOf(tokenId), ticket.occasionId, block.timestamp);
    }

    /// @notice Query whether a ticket has been checked in
    function isCheckedIn(uint256 tokenId) external view returns (bool) {
        return checkedIn[tokenId];
    }

    struct TicketInfo {
        uint256 occasionId;
        uint256 seatNumber;
        bool isForSale;
        uint256 resalePrice;
        address originalOwner; 
    }

    mapping(uint256 => Occassion) occasions;
    mapping(uint256 => mapping(address => bool)) public hasBought;
    mapping(uint256 => mapping(uint256 => address)) public seatTaken;
    mapping(uint256 => uint256[]) seatsTaken;
    mapping(uint256 => TicketInfo) public ticketDetails;
    mapping(address => bool) public approvedOrganizers; // Track approved organizers
    mapping(address => uint256[]) public organizerEvents; // Track events by organizer
    mapping(uint256 => bool) public checkedIn; // tokenId => checked-in status

    event TicketListedForSale(uint256 tokenId, uint256 price);
    event TicketSold(uint256 tokenId, address from, address to, uint256 price);
    event TicketUnlisted(uint256 tokenId);
    event EventCreated(uint256 eventId, address organizer, string title);
    event EventCanceled(uint256 eventId);
    event EventOccurred(uint256 eventId);
    event OrganizerWithdraw(uint256 eventId, uint256 amount);
    event AttendeeRefund(uint256 tokenId, address to, uint256 amount);
    event OrganizerApproved(address organizer);
    event OrganizerRevoked(address organizer);
    event TicketCheckedIn(uint256 indexed tokenId, address indexed attendee, uint256 indexed eventId, uint256 timestamp);
    
        /**
 * @notice Restricts function access to only the contract owner
 * @dev Throws if called by any account other than the owner
 */
    modifier onlyOwner {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    /**
     * @notice Restricts function access to only the ticket owner
     * @dev Throws if called by any account other than the ticket owner
     */
    modifier onlyTicketOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Caller is not the ticket owner");
        _;
    }

    /**
     * @notice Restricts function access to approved organizers
     * @dev Throws if called by any account that is not an approved organizer
     */
    modifier onlyApprovedOrganizer() {
        require(approvedOrganizers[msg.sender] || msg.sender == owner, "Caller is not an approved organizer");
        _;
    }

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        owner = msg.sender;
        approvedOrganizers[msg.sender] = true; // Owner is automatically an approved organizer
    }
    /// @notice Creates a new event occasion with specified details
/// @param _title Name of the event
/// @param _price Cost per ticket in wei
/// @param _maxTickets Maximum number of tickets available
/// @param _date Date of the event
/// @param _time Time of the event
/// @param _location Location where event will be held
/// @dev Only callable by contract owner
   function list(
    string memory _title,
    uint256 _price,
    uint256 _maxTickets,
    string memory _date,
    string memory _time,
    string memory _location,
    uint256 _maxResalePrice,
    uint256 _eventTimestamp
   ) public payable {
    require(msg.value >= ORGANIZER_FEE, "Insufficient fee to create event");
    totalOccassions++;
    occasions[totalOccassions] = Occassion({
        id: totalOccassions,
        title: _title,
        price: _price,
        tickets: _maxTickets, // available tickets
        maxTickets: _maxTickets,
        date: _date,
        time: _time,
        location: _location,
        maxResalePrice: _maxResalePrice,
        organizer: msg.sender,
        eventTimestamp: _eventTimestamp,
        escrowBalance: 0,
        canceled: false,
        occurred: false,
        payoutReleased: false
    });
    
    // Track this event for the organizer
    organizerEvents[msg.sender].push(totalOccassions);
    
    emit EventCreated(totalOccassions, msg.sender, _title);
}
/// @notice Mints a new ticket NFT for a specific occasion and seat
/// @param _id The ID of the occasion to mint a ticket for
/// @param _seat The seat number to assign to the ticket
/// @dev Requires sufficient ETH payment, valid occasion ID, and available seat
/// @dev Updates occasion tickets count, seat assignments and total supply
 function mint(uint256 _id, uint256 _seat) public payable {
    // Checking that id is not 0 or less than total occassions...
    require(_id != 0, "Occasion ID must be greater than 0");
    require(_id <= totalOccassions, "Occasion ID exceeds total occasions");

    // Require that ETH sent is greater than cost...
    require(msg.value >= occasions[_id].price, "Insufficient ETH sent for the occasion");
    require(!occasions[_id].canceled, "Event canceled");

    // Require that the seat is not taken, and the seats exists...
    require(_seat < occasions[_id].maxTickets, "Seat number exceeds max tickets");
    require(seatTaken[_id][_seat] == address(0), "Seat is already taken");

    // Ensure there are tickets available
    require(occasions[_id].tickets > 0, "Sold out");

    occasions[_id].tickets -= 1; // Updating available ticket count
    hasBought[_id][msg.sender] = true; // Update buying status
    seatTaken[_id][_seat] = msg.sender; // Assigning seat
    seatsTaken[_id].push(_seat); // Update seats currently taken
    totalSupply++;

    // Create ticket details
    ticketDetails[totalSupply] = TicketInfo({
        occasionId: _id,
        seatNumber: _seat,
        isForSale: false,
        resalePrice: 0,
        originalOwner: msg.sender
    });

    _safeMint(msg.sender, totalSupply);

    // Protocol fee and escrow (2.5% on paid events; 0% on free events)
    uint256 price = occasions[_id].price;
    uint256 fee = price == 0 ? 0 : (msg.value * FEE_BPS) / 10000;
    uint256 toEscrow = msg.value - fee;

    if (fee > 0) {
        (bool okFee, ) = owner.call{value: fee}("");
        require(okFee, "Protocol fee transfer failed");
    }
    occasions[_id].escrowBalance += toEscrow;
 }

 function listTicketForSale(uint256 tokenId, uint256 price) public onlyTicketOwner(tokenId) {
    TicketInfo storage ticket = ticketDetails[tokenId];
    Occassion storage occasion = occasions[ticket.occasionId];

    require(!ticket.isForSale, "Ticket already listed for sale");
    require(price <= occasion.maxResalePrice, "Price exceeds maximum allowed");

    ticket.isForSale = true;
    ticket.resalePrice = price;

    emit TicketListedForSale(tokenId, price);
}

// Remove ticket from sale
function unlistTicket(uint256 tokenId) public onlyTicketOwner(tokenId) {
    TicketInfo storage ticket = ticketDetails[tokenId];
    require(ticket.isForSale, "Ticket not listed for sale");

    ticket.isForSale = false;
    ticket.resalePrice = 0;

    emit TicketUnlisted(tokenId); 
}

// Purchase a resale ticket
    function buyResaleTicket(uint256 tokenId) public payable {
        TicketInfo storage ticket = ticketDetails[tokenId];
        require(ticket.isForSale, "Ticket not for sale");
        require(msg.value >= ticket.resalePrice, "Insufficient payment");
        
        address seller = ownerOf(tokenId);
        require(msg.sender != seller, "Cannot buy your own ticket");

        // Update ticket details
        ticket.isForSale = false;
        uint256 resalePrice = ticket.resalePrice;
        ticket.resalePrice = 0;

        // Transfer ownership
        _transfer(seller, msg.sender, tokenId);

        // Update seat tracking
        seatTaken[ticket.occasionId][ticket.seatNumber] = msg.sender;
        hasBought[ticket.occasionId][msg.sender] = true;

        // Transfer payment to seller
        (bool success, ) = payable(seller).call{value: resalePrice}("");
        require(success, "Transfer to seller failed");

        emit TicketSold(tokenId, seller, msg.sender, resalePrice);
    }

    // Getting ticket details
    function getTicketDetails(uint256 tokenId) public view returns (
        uint256 occasionId,
        uint256 seatNumber,
        bool isForSale,
        uint256 resalePrice,
        address originalOwner
    ) {
        TicketInfo storage ticket = ticketDetails[tokenId];
        return (
            ticket.occasionId,
            ticket.seatNumber,
            ticket.isForSale,
            ticket.resalePrice,
            ticket.originalOwner
        );
    }

    // Checking if the ticket is for sale
    function isTicketForSale(uint256 tokenId) public view returns (bool, uint256) {
        TicketInfo memory ticket = ticketDetails[tokenId];
        return (ticket.isForSale, ticket.resalePrice);
    }
/// @notice Allows the owner to withdraw all ETH from the contract
/// @dev Uses low-level call to transfer ETH balance to owner
/// @custom:security Non-reentrant by default since state changes happen before transfer
 function withdraw() public onlyOwner {
    (bool success,) = owner.call{value: address(this).balance}("");
    require(success);
 }

    /**
     * @notice Approve an organizer to create events
     * @param _organizer Address of the organizer to approve
     * @dev Only callable by contract owner
     */
    function approveOrganizer(address _organizer) public onlyOwner {
        require(_organizer != address(0), "Invalid organizer address");
        approvedOrganizers[_organizer] = true;
        emit OrganizerApproved(_organizer);
    }

    /**
     * @notice Revoke organizer approval
     * @param _organizer Address of the organizer to revoke
     * @dev Only callable by contract owner
     */
    function revokeOrganizer(address _organizer) public onlyOwner {
        require(_organizer != address(0), "Invalid organizer address");
        approvedOrganizers[_organizer] = false;
        emit OrganizerRevoked(_organizer);
    }

    /**
     * @notice Get events created by a specific organizer
     * @param _organizer Address of the organizer
     * @return Array of event IDs created by the organizer
     */
    function getOrganizerEvents(address _organizer) public view returns (uint256[] memory) {
        return organizerEvents[_organizer];
    }

    /*
     * @notice Get event details including organizer
     * @param _eventId ID of the event
     * @return Event details including organizer address
     */
    function getEventDetails(uint256 _eventId) public view returns (
        uint256 id,
        string memory title,
        uint256 price,
        uint256 tickets,
        uint256 maxTickets,
        string memory date,
        string memory time,
        string memory location,
        uint256 maxResalePrice,
        address organizer,
        uint256 eventTimestamp,
        bool canceled,
        bool occurred,
        uint256 escrowBalance
    ) {
        require(_eventId > 0 && _eventId <= totalOccassions, "Invalid event ID");
        return (
            occasions[_eventId].id,
            occasions[_eventId].title,
            occasions[_eventId].price,
            occasions[_eventId].tickets,
            occasions[_eventId].maxTickets,
            occasions[_eventId].date,
            occasions[_eventId].time,
            occasions[_eventId].location,
            occasions[_eventId].maxResalePrice,
            occasions[_eventId].organizer,
            occasions[_eventId].eventTimestamp,
            occasions[_eventId].canceled,
            occasions[_eventId].occurred,
            occasions[_eventId].escrowBalance
        );
    }

    /**
     * @notice Check if an address is an approved organizer
     * @param _organizer Address to check
     * @return True if approved organizer, false otherwise
     */
    function isApprovedOrganizer(address _organizer) public view returns (bool) {
        return approvedOrganizers[_organizer] || _organizer == owner;
    }

    // -----------------
    // tokenURI with on-chain SVG image
    // -----------------
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        TicketInfo storage t = ticketDetails[tokenId];
        Occassion storage o = occasions[t.occasionId];

        string memory name = string(abi.encodePacked("EventX Ticket #", Strings.toString(tokenId)));
        string memory desc = string(abi.encodePacked(
            "Event: ", o.title, " | Date: ", o.date, " ", o.time, " | Location: ", o.location,
            " | Seat: ", Strings.toString(t.seatNumber + 1)
        ));

        // Generative palette selection (anime/neon vibes), deterministic by seed
        bytes32 seed = keccak256(abi.encodePacked(tokenId, o.title, o.date, o.location));
        uint256 s = uint256(seed);
        uint8 idx = uint8(s % 6);
        string memory c1; // primary
        string memory c2; // secondary
        string memory c3; // accent
        string memory bg; // background gradient end
        if (idx == 0) { c1 = "#ff2d95"; c2 = "#7b2cff"; c3 = "#00e5ff"; bg = "#0a0f1f"; }
        else if (idx == 1) { c1 = "#ff8a00"; c2 = "#ff2d55"; c3 = "#00f0ff"; bg = "#0b1224"; }
        else if (idx == 2) { c1 = "#00ffa3"; c2 = "#00d1ff"; c3 = "#ff3df0"; bg = "#0a1020"; }
        else if (idx == 3) { c1 = "#ffd166"; c2 = "#8338ec"; c3 = "#3a86ff"; bg = "#0a0a1a"; }
        else if (idx == 4) { c1 = "#ff6b6b"; c2 = "#f94cff"; c3 = "#5ef1ff"; bg = "#0c0f1e"; }
        else { c1 = "#22d3ee"; c2 = "#a78bfa"; c3 = "#fb7185"; bg = "#0b1022"; }

        // Derive ring parameters
        uint256 r1 = 90 + (s % 40);            // 90-129
        uint256 r2 = 60 + ((s >> 32) % 40);    // 60-99
        uint256 r3 = 30 + ((s >> 64) % 24);    // 30-53
        uint256 d1 = 300 + ((s >> 96) % 200);  // dasharray
        uint256 d2 = 180 + ((s >> 128) % 160);
        uint256 rot = (s >> 160) % 360;

        // All ASCII-only SVG with mask, blur filter glows, radial gradients, and concentric arcs
        string memory svg = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">',
            '<defs>',
              '<radialGradient id="bg" cx="50%" cy="50%" r="70%">',
                '<stop offset="0%" stop-color="', c2, '" stop-opacity="0.15"/>',
                '<stop offset="100%" stop-color="', bg, '" stop-opacity="1"/>',
              '</radialGradient>',
              '<radialGradient id="ring" cx="50%" cy="50%" r="60%">',
                '<stop offset="0%" stop-color="', c1, '"/>',
                '<stop offset="100%" stop-color="', c2, '"/>',
              '</radialGradient>',
              '<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">',
                '<feGaussianBlur stdDeviation="6" result="b"/>',
                '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>',
              '</filter>',
              '<mask id="circleMask">',
                '<rect width="100%" height="100%" fill="white"/>',
                '<circle cx="320" cy="320" r="250" fill="black"/>',
              '</mask>',
            '</defs>',
            '<rect width="100%" height="100%" fill="url(#bg)"/>',
            '<g transform="translate(320,320) rotate(', Strings.toString(rot), ')">',
              // outer glow ring
              '<circle r="', Strings.toString(r1 + 8), '" fill="none" stroke="', c3, '" stroke-opacity="0.35" stroke-width="18" filter="url(#glow)"/>',
              // main ring with gradient
              '<circle r="', Strings.toString(r1), '" fill="none" stroke="url(#ring)" stroke-width="10" stroke-dasharray="', Strings.toString(d1), ' 40"/>',
              // mid ring
              '<circle r="', Strings.toString(r2), '" fill="none" stroke="', c3, '" stroke-opacity="0.8" stroke-width="6" stroke-dasharray="', Strings.toString(d2), ' 24"/>',
              // inner ring
              '<circle r="', Strings.toString(r3), '" fill="none" stroke="', c1, '" stroke-opacity="0.9" stroke-width="4"/>',
              // accent arcs
              '<g stroke-linecap="round" stroke="', c2, '" stroke-opacity="0.9" stroke-width="5">',
                '<path d="M 0 0"/>',
              '</g>',
            '</g>',
            // ticket info card clipped within circle
            '<g mask="url(#circleMask)">',
              '<rect x="80" y="400" width="480" height="148" rx="16" fill="#0f172a" opacity="0.85"/>',
              '<text x="104" y="440" font-family="Segoe UI,Roboto,Arial" font-size="22" font-weight="700" fill="#e2e8f0">', o.title, '</text>',
              '<text x="104" y="468" font-family="Segoe UI,Roboto,Arial" font-size="14" fill="#94a3b8">Date: ', o.date, ' ', o.time, '</text>',
              '<text x="104" y="490" font-family="Segoe UI,Roboto,Arial" font-size="14" fill="#94a3b8">Location: ', o.location, '</text>',
              '<text x="104" y="520" font-family="Segoe UI,Roboto,Arial" font-size="16" font-weight="600" fill="', c1, '">Seat #', Strings.toString(t.seatNumber + 1), '</text>',
            '</g>',
            '<text x="320" y="616" text-anchor="middle" font-family="Segoe UI,Roboto,Arial" font-size="12" fill="#94a3b8">EventX - On-chain Generative Ticket - #', Strings.toString(tokenId), '</text>',
            '</svg>'
        ));

        string memory image = string(abi.encodePacked("data:image/svg+xml;utf8,", svg));

        bytes memory json = abi.encodePacked(
            '{',
                '"name":"', name, '",',
                '"description":"', desc, '",',
                '"image":"', image, '",',
                '"attributes":[',
                    '{"trait_type":"Event ID","value":"', Strings.toString(o.id), '"},',
                    '{"trait_type":"Seat","value":"', Strings.toString(t.seatNumber + 1), '"}',
                ']',
            '}'
        );

        string memory encoded = Base64.encode(json);
        return string(abi.encodePacked("data:application/json;base64,", encoded));
    }
}
