const { ethers } = require("hardhat");

async function main() {
  // Your deployed contract address
  const contractAddress = "0x053fba277b51522fafd2fe82b29a6de2c097ddc3";
  
  // Get the contract
  const Ticket = await ethers.getContractFactory("Ticket");
  const contract = Ticket.attach(contractAddress);
  
  // Get the signer (your wallet)
  const [signer] = await ethers.getSigners();
  console.log("Contract owner:", signer.address);
  
  // Approve yourself as an organizer
  console.log("Approving organizer...");
  const tx = await contract.approveOrganizer(signer.address);
  await tx.wait();
  
  console.log("✅ You are now approved as an organizer!");
  console.log("Transaction hash:", tx.hash);
  
  // Verify the approval
  const isApproved = await contract.approvedOrganizers(signer.address);
  console.log("Approval status:", isApproved);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
