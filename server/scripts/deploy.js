const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  const contractPath = path.join(__dirname, '..', 'contracts', 'DairyChainLedger.sol');
  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: { 'DairyChainLedger.sol': { content: source } },
    settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } } },
  };

  console.log('🔨 Compiling contract...');
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    const errors = output.errors.filter((e) => e.severity === 'error');
    if (errors.length > 0) {
      console.error('❌ Compilation errors:');
      errors.forEach((e) => console.error(e.formattedMessage));
      process.exit(1);
    }
  }

  const contract = output.contracts['DairyChainLedger.sol'].DairyChainLedger;
  const abi = contract.abi;
  const bytecode = contract.evm.bytecode.object;

  // Save ABI
  const abiPath = path.join(__dirname, '..', 'contracts', 'DairyChainLedgerABI.json');
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
  console.log('✅ ABI saved:', abiPath);

  if (
    !process.env.SEPOLIA_RPC_URL ||
    !process.env.DEPLOYER_PRIVATE_KEY ||
    process.env.SEPOLIA_RPC_URL.includes('YOUR_ALCHEMY_KEY') ||
    process.env.DEPLOYER_PRIVATE_KEY.includes('YOUR_METAMASK_PRIVATE_KEY')
  ) {
    console.warn('⚠️ SEPOLIA_RPC_URL or DEPLOYER_PRIVATE_KEY missing or placeholder in .env');
    console.warn('ABI was generated successfully. To deploy on-chain, please set valid credentials in server/.env and re-run: npm run deploy');
    return;
  }

  // Deploy
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

  console.log('🚀 Deploying from:', wallet.address);

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const deployed = await factory.deploy();
  await deployed.waitForDeployment();

  const address = await deployed.getAddress();
  console.log('✅ Contract deployed at:', address);

  // Save address
  const addrPath = path.join(__dirname, '..', 'contracts', 'contractAddress.js');
  fs.writeFileSync(
    addrPath,
    `module.exports = {\n  CONTRACT_ADDRESS: '${address}',\n  DEPLOYED_AT: '${new Date().toISOString()}',\n};\n`
  );
  console.log('✅ Address saved to contractAddress.js');
}

main().catch((err) => {
  console.error('❌ Deploy error:', err);
  process.exit(1);
});
