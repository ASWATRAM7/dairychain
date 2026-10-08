import { useCallback, useEffect, useState } from "react";
import { BrowserProvider } from "ethers";

/**
 * Wallet connection hook backed by ethers v6 + window.ethereum (EIP-1193).
 * Tracks the connected address, chain id, and native balance, and reacts
 * to account/chain changes fired by the injected provider (e.g. MetaMask).
 *
 * @returns {{
 *   address: string|null,
 *   chainId: number|null,
 *   balance: string|null,
 *   isConnecting: boolean,
 *   error: string|null,
 *   connectWallet: () => Promise<void>,
 *   disconnectWallet: () => void,
 * }}
 */
export function useWallet() {
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const refreshBalance = useCallback(async (provider, account) => {
    try {
      const raw = await provider.getBalance(account);
      setBalance(raw.toString());
    } catch {
      setBalance(null);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("No injected wallet found. Install MetaMask or a compatible wallet.");
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      setAddress(accounts[0]);
      setChainId(Number(network.chainId));
      await refreshBalance(provider, accounts[0]);
    } catch (err) {
      setError(err?.message ?? "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  }, [refreshBalance]);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setBalance(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAddress(accounts[0]);
      }
    };
    const handleChainChanged = (nextChainId) => {
      setChainId(Number(nextChainId));
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [disconnectWallet]);

  return {
    address,
    chainId,
    balance,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
  };
}

export default useWallet;
