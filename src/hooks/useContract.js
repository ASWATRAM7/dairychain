import { useCallback } from "react";
import {
  recentBatches,
  ledgerEntries,
  milk001TemperatureLog,
  batchJourney,
} from "../data/mockData.js";

/**
 * Contract interaction hook. Currently returns mock data so the UI is fully
 * functional without a deployed DairyChain contract. Swap the bodies of
 * these functions for real ethers.Contract calls once CONTRACT_ADDRESS
 * points at a deployed instance (see src/contracts/contractAddress.js and
 * src/contracts/DairyChainABI.json).
 *
 * @returns {{
 *   getBatch: (batchId: string) => Promise<object>,
 *   getTemperatureLogs: (batchId: string) => Promise<object[]>,
 *   getViolations: () => Promise<object[]>,
 *   getRecentBlocks: () => Promise<object[]>,
 *   createBatch: (input: object) => Promise<{txHash: string}>,
 *   logTemperature: (batchId: string, celsius: number) => Promise<{txHash: string}>,
 *   verifyBatch: (batchId: string) => Promise<{verified: boolean}>,
 * }}
 */
export function useContract() {
  // ---- Reads ----------------------------------------------------------

  const getBatch = useCallback(async (batchId) => {
    await simulateLatency();
    const summary = recentBatches.find((b) => b.id === batchId);
    if (batchId === batchJourney.id || !summary) {
      return batchJourney;
    }
    return summary;
  }, []);

  const getTemperatureLogs = useCallback(async (batchId) => {
    await simulateLatency();
    // All batches share the MILK001 mock series for now.
    return milk001TemperatureLog;
  }, []);

  const getViolations = useCallback(async () => {
    await simulateLatency();
    return ledgerEntries.filter((entry) => entry.tempStatus === "critical");
  }, []);

  const getRecentBlocks = useCallback(async () => {
    await simulateLatency();
    return ledgerEntries;
  }, []);

  // ---- Writes -----------------------------------------------------------

  const createBatch = useCallback(async (input) => {
    await simulateLatency();
    return { txHash: mockTxHash() };
  }, []);

  const logTemperature = useCallback(async (batchId, celsius) => {
    await simulateLatency();
    return { txHash: mockTxHash() };
  }, []);

  const verifyBatch = useCallback(async (batchId) => {
    await simulateLatency();
    return { verified: true };
  }, []);

  return {
    getBatch,
    getTemperatureLogs,
    getViolations,
    getRecentBlocks,
    createBatch,
    logTemperature,
    verifyBatch,
  };
}

function simulateLatency(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mockTxHash() {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 40; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export default useContract;
