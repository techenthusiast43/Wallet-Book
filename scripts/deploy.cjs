const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log(`\n========================================`);
  console.log(`Deploying WalletBook to network: ${network.name}`);
  console.log(`========================================\n`);

  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer account configured. Check PRIVATE_KEY in your .env file.");
  }

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer address: ${deployer.address}`);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} BOT/native\n`);

  const WalletBookFactory = await ethers.getContractFactory("WalletBook");
  console.log("Broadcasting deployment transaction...");
  const walletBook = await WalletBookFactory.deploy();

  await walletBook.waitForDeployment();
  const contractAddress = await walletBook.getAddress();

  console.log(`\n✅ WalletBook deployed successfully!`);
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🔗 BOT Chain Explorer: https://scan.bohr.life/address/${contractAddress}`);

  // Automatically export contract address and ABI to frontend
  const frontendContractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "WalletBook.sol",
    "WalletBook.json"
  );

  let abi = [];
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    abi = artifact.abi;
  }

  const deploymentData = {
    address: contractAddress,
    network: network.name,
    chainId: network.config.chainId || 968,
    deployedAt: new Date().toISOString(),
    abi: abi,
  };

  fs.writeFileSync(
    path.join(frontendContractsDir, "WalletBook.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  console.log(`\n📁 Deployed address and ABI exported to frontend/src/contracts/WalletBook.json`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

