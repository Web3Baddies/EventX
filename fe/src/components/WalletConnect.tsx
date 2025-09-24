'use client';

import { useState, useEffect } from 'react';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [account, setAccount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  const connectWallet = async () => {
    setError('');
    
    // Check if MetaMask is installed
    if (typeof window === 'undefined') {
      setError('Please use a browser with Web3 support');
      return;
    }

    if (!window.ethereum) {
      setError('MetaMask not detected');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setAccount(address);
        onConnect?.(address);
        console.log('Wallet connected:', address);
      } else {
        setError('No accounts found');
      }
    } catch (error: unknown) {
      console.error('Wallet connection error:', error);
      const err = error as { code?: number } | undefined;
      if (err?.code === 4001) {
        setError('Connection rejected by user');
      } else if (err?.code === -32002) {
        setError('Connection request already pending');
      } else {
        setError('Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setError('');
    onConnect?.('');
  };

  useEffect(() => {
    // Set client flag to prevent hydration mismatch
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Check if wallet is already connected and unlocked
    const checkConnection = async () => {
      if (isClient && window.ethereum) {
        try {
          // Force a fresh check by requesting accounts (this will fail if locked)
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          });
          
          if (accounts && accounts.length > 0) {
            // Double-check by trying to get the current network
            // This will throw an error if MetaMask is locked
            try {
              const chainId = await window.ethereum.request({ method: 'eth_chainId' });
              console.log('Wallet connected and unlocked:', accounts[0], 'Chain:', chainId);
              setAccount(accounts[0]);
              onConnect?.(accounts[0]);
            } catch {
              // MetaMask is locked - this is the key check
              console.log('MetaMask is locked or inaccessible');
              setAccount('');
              onConnect?.('');
            }
          } else {
            // No accounts available
            console.log('No accounts found');
            setAccount('');
            onConnect?.('');
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
          setAccount('');
          onConnect?.('');
        }
      }
    };

    // Run check immediately and also set up a periodic check
    checkConnection();
    
    // Check every 3 seconds to detect MetaMask lock/unlock
    const interval = setInterval(checkConnection, 3000);

    // Listen for account changes and connection events
    if (isClient && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('Accounts changed:', accounts);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          onConnect?.(accounts[0]);
        } else {
          setAccount('');
          setError('');
          onConnect?.('');
        }
      };

      const handleConnect = (connectInfo: { chainId: string }) => {
        console.log('MetaMask connected:', connectInfo);
        checkConnection(); // Re-check connection when MetaMask connects
      };

      const handleDisconnect = () => {
        console.log('MetaMask disconnected');
        setAccount('');
        setError('');
        onConnect?.('');
      };

      window.ethereum.on?.('accountsChanged', handleAccountsChanged);
      window.ethereum.on?.('connect', handleConnect);
      window.ethereum.on?.('disconnect', handleDisconnect);

      return () => {
        clearInterval(interval);
        window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener?.('connect', handleConnect);
        window.ethereum?.removeListener?.('disconnect', handleDisconnect);
      };
    }

    return () => clearInterval(interval);
  }, [onConnect, isClient]);

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className="px-6 py-2 btn-brand rounded-lg opacity-50">
        Loading...
      </div>
    );
  }

  if (account) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="px-6 py-2 btn-brand rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && (
        <p className="text-red-500 text-sm mt-1 max-w-48 text-right">
          {error}
        </p>
      )}
    </div>
  );
}
