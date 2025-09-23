'use client';

import { useState, useEffect } from 'react';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [account, setAccount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');

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
    // Check if wallet is already connected
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          });
          
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
            onConnect?.(accounts[0]);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          onConnect?.(accounts[0]);
        } else {
          setAccount('');
          setError('');
          onConnect?.('');
        }
      };

      window.ethereum.on?.('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
      };
    }
  }, [onConnect]);

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
