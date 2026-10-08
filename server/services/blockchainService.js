const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ABI_PATH = path.join(__dirname, '..', 'contracts', 'DairyChainLedgerABI.json');

let provider = null;
let wallet = null;
let contract = null;
let ready = false;

function init() {
  try {
    if (!process.env.SEPOLIA_RPC_URL || process.env.SEPOLIA_RPC_URL.includes('YOUR_ALCHEMY_KEY')) {
      console.warn('⚠️  Blockchain disabled: no valid SEPOLIA_RPC_URL in .env');
      return;
    }
    if (!process.env.DEPLOYER_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY.includes('YOUR_METAMASK_PRIVATE_KEY')) {
      console.warn('⚠️  Blockchain disabled: no valid DEPLOYER_PRIVATE_KEY in .env');
      return;
    }
    if (!process.env.CONTRACT_ADDRESS) {
      console.warn('⚠️  Blockchain disabled: no CONTRACT_ADDRESS in .env');
      return;
    }
    if (!fs.existsSync(ABI_PATH)) {
      console.warn('⚠️  Blockchain disabled: ABI file not found');
      return;
    }

    provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    const abi = JSON.parse(fs.readFileSync(ABI_PATH, 'utf8'));
    contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);
    ready = true;
    console.log('✅ Blockchain service ready:', process.env.CONTRACT_ADDRESS);
  } catch (err) {
    console.error('❌ Blockchain init failed:', err.message);
    ready = false;
  }
}

function isReady() {
  return ready;
}

/**
 * Anchors a data hash on-chain.
 * @param {string} dataHash - 0x-prefixed 32-byte hash
 * @param {string} deviceId
 * @param {number} temperature
 * @param {number} humidity
 * @returns {Promise<{ txHash: string, blockNumber: number, index: number, gasUsed?: string }>}
 */
async function anchorLog(dataHash, deviceId, temperature, humidity) {
  if (!ready) throw new Error('Blockchain service not ready');

  const tempInt = Math.round((temperature || 0) * 100);
  const humidityInt = Math.round((humidity || 0) * 100);

  const tx = await contract.anchorLog(dataHash, deviceId, tempInt, humidityInt);
  const receipt = await tx.wait();

  // Parse event to get the index
  let index = null;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed && parsed.name === 'LogAnchored') {
        index = Number(parsed.args.index);
        break;
      }
    } catch (e) {
      // ignore
    }
  }

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    index,
    gasUsed: receipt.gasUsed ? receipt.gasUsed.toString() : null,
  };
}

async function getTotalLogs() {
  if (!ready) return 0;
  const total = await contract.getTotalLogs();
  return Number(total);
}

async function getLogByHash(dataHash) {
  if (!ready) return null;
  try {
    const log = await contract.getLogByHash(dataHash);
    return {
      dataHash: log.dataHash,
      deviceId: log.deviceId,
      temperature: Number(log.temperature) / 100,
      humidity: Number(log.humidity) / 100,
      timestamp: Number(log.timestamp),
      anchorer: log.anchorer,
    };
  } catch (err) {
    return null;
  }
}

async function verifyHash(dataHash) {
  if (!ready) return false;
  try {
    return await contract.verifyHash(dataHash);
  } catch (err) {
    return false;
  }
}

module.exports = {
  init,
  isReady,
  anchorLog,
  getTotalLogs,
  getLogByHash,
  verifyHash,
};
