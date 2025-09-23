import { network } from "hardhat";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

async function main() {
  console.log("Deploying Ticket contract to XDC Testnet...");
  
  const { viem } = await network.connect({
    network: "XDCTestnet",
    chainType: "l1",
  });

  const publicClient = await viem.getPublicClient();
  const [deployerClient] = await viem.getWalletClients();
  
  console.log("Deploying contracts with the account:", deployerClient.account.address);
  
  const balance = await publicClient.getBalance({
    address: deployerClient.account.address,
  });
  console.log("Account balance:", balance.toString());

  // Get contract artifacts
  const hre = require("hardhat");
  const ticketArtifact = await hre.artifacts.readArtifact("Ticket");

  // Deploy Ticket contract
  console.log("Deploying Ticket contract...");
  const ticketHash = await deployerClient.deployContract({
    abi: ticketArtifact.abi,
    bytecode: ticketArtifact.bytecode as `0x${string}`,
    account: deployerClient.account,
    args: ["EventX Tickets", "EVTX"], // Constructor arguments: _name, _symbol
  });
  
  const ticketReceipt = await publicClient.waitForTransactionReceipt({
    hash: ticketHash,
  });
  const ticketAddress = ticketReceipt.contractAddress;
  console.log("✅ Ticket contract deployed to:", ticketAddress);

  // Save deployment info
  const deploymentInfo = {
    network: "XDC-testnet",
    chainId: 50312,
    deployer: deployerClient.account.address,
    deploymentTime: new Date().toISOString(),
    contracts: {
      Ticket: {
        address: ticketAddress,
        name: "EventX Tickets", 
        symbol: "EVTX",
        transactionHash: ticketHash
      }
    }
  };

  // Ensure deployments directory exists
  const deploymentsDir = join(process.cwd(), "deployments");
  try {
    mkdirSync(deploymentsDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  const deploymentPath = join(deploymentsDir, "ticket-XDC-testnet.json");
  writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to", deploymentPath);
  
  console.log("\n=== Deployment Summary ===");
  console.log("Network: XDC Testnet");
  console.log("Chain ID: 50312");
  console.log("Deployer:", deployerClient.account.address);
  console.log("Ticket Contract:", ticketAddress);
  console.log("Name: EventX Tickets");
  console.log("Symbol: EVTX");
  console.log("Transaction Hash:", ticketHash);
  
  // Verify the contract (if verification is set up)
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contract on block explorer...");
    // Wait for block explorer to index
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    try {
      await hre.run("verify:verify", {
        address: ticketAddress,
        constructorArguments: ["EventX Tickets", "EVTX"],
      });
      console.log("✅ Contract verified on block explorer");
    } catch (error) {
      console.error("Failed to verify contract:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });