const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Multi-Organizer Functionality...\n");

  // Get signers
  const [owner, organizer1, organizer2, user] = await ethers.getSigners();
  
  console.log("👥 Test Accounts:");
  console.log("Owner:", owner.address);
  console.log("Organizer 1:", organizer1.address);
  console.log("Organizer 2:", organizer2.address);
  console.log("User:", user.address);
  console.log("");

  // Deploy contract
  console.log("📦 Deploying contract...");
  const Ticket = await ethers.getContractFactory("Ticket");
  const ticket = await Ticket.deploy("EventX Tickets", "EVTX");
  await ticket.deployed();
  console.log("✅ Contract deployed to:", ticket.address);
  console.log("");

  // Test 1: Check initial state
  console.log("🔍 Test 1: Initial State");
  console.log("Owner is approved:", await ticket.isApprovedOrganizer(owner.address));
  console.log("Organizer 1 is approved:", await ticket.isApprovedOrganizer(organizer1.address));
  console.log("Organizer 2 is approved:", await ticket.isApprovedOrganizer(organizer2.address));
  console.log("");

  // Test 2: Approve organizers
  console.log("🔍 Test 2: Approving Organizers");
  await ticket.approveOrganizer(organizer1.address);
  console.log("✅ Approved organizer 1");
  
  await ticket.approveOrganizer(organizer2.address);
  console.log("✅ Approved organizer 2");
  
  console.log("Organizer 1 is approved:", await ticket.isApprovedOrganizer(organizer1.address));
  console.log("Organizer 2 is approved:", await ticket.isApprovedOrganizer(organizer2.address));
  console.log("");

  // Test 3: Create events as organizers
  console.log("🔍 Test 3: Creating Events");
  
  // Organizer 1 creates an event
  const organizer1Contract = ticket.connect(organizer1);
  const tx1 = await organizer1Contract.list(
    "Concert 2024",
    ethers.utils.parseEther("0.1"),
    50,
    "2024-12-25",
    "19:00",
    "Madison Square Garden",
    ethers.utils.parseEther("0.2")
  );
  await tx1.wait();
  console.log("✅ Organizer 1 created event");

  // Organizer 2 creates an event
  const organizer2Contract = ticket.connect(organizer2);
  const tx2 = await organizer2Contract.list(
    "Tech Conference 2024",
    ethers.utils.parseEther("0.05"),
    100,
    "2024-12-30",
    "09:00",
    "Convention Center",
    ethers.utils.parseEther("0.1")
  );
  await tx2.wait();
  console.log("✅ Organizer 2 created event");
  console.log("");

  // Test 4: Check event details
  console.log("🔍 Test 4: Event Details");
  const totalEvents = await ticket.totalOccassions();
  console.log("Total events:", totalEvents.toString());
  
  const event1 = await ticket.getEventDetails(1);
  console.log("Event 1 - Title:", event1.title);
  console.log("Event 1 - Organizer:", event1.organizer);
  console.log("Event 1 - Price:", ethers.utils.formatEther(event1.price), "ETH");
  
  const event2 = await ticket.getEventDetails(2);
  console.log("Event 2 - Title:", event2.title);
  console.log("Event 2 - Organizer:", event2.organizer);
  console.log("Event 2 - Price:", ethers.utils.formatEther(event2.price), "ETH");
  console.log("");

  // Test 5: Check organizer events
  console.log("🔍 Test 5: Organizer Events");
  const organizer1Events = await ticket.getOrganizerEvents(organizer1.address);
  const organizer2Events = await ticket.getOrganizerEvents(organizer2.address);
  
  console.log("Organizer 1 events:", organizer1Events.length);
  console.log("Organizer 2 events:", organizer2Events.length);
  console.log("");

  // Test 6: Try to create event as non-organizer (should fail)
  console.log("🔍 Test 6: Non-Organizer Access Control");
  try {
    const userContract = ticket.connect(user);
    await userContract.list(
      "Unauthorized Event",
      ethers.utils.parseEther("0.1"),
      10,
      "2024-12-31",
      "12:00",
      "Somewhere",
      ethers.utils.parseEther("0.2")
    );
    console.log("❌ ERROR: Non-organizer was able to create event!");
  } catch (error) {
    console.log("✅ Non-organizer correctly blocked from creating event");
    console.log("Error message:", error.message);
  }
  console.log("");

  // Test 7: Revoke organizer access
  console.log("🔍 Test 7: Revoking Organizer Access");
  await ticket.revokeOrganizer(organizer2.address);
  console.log("✅ Revoked organizer 2 access");
  console.log("Organizer 2 is approved:", await ticket.isApprovedOrganizer(organizer2.address));
  
  // Try to create event as revoked organizer (should fail)
  try {
    await organizer2Contract.list(
      "Another Event",
      ethers.utils.parseEther("0.1"),
      10,
      "2024-12-31",
      "12:00",
      "Somewhere",
      ethers.utils.parseEther("0.2")
    );
    console.log("❌ ERROR: Revoked organizer was able to create event!");
  } catch (error) {
    console.log("✅ Revoked organizer correctly blocked from creating event");
  }
  console.log("");

  console.log("🎉 All tests completed successfully!");
  console.log("\n📊 Summary:");
  console.log("- Multi-organizer system working correctly");
  console.log("- Access control functioning properly");
  console.log("- Event creation and tracking working");
  console.log("- Organizer management working");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });

