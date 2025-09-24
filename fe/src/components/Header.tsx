'use client';

import Link from 'next/link';
import Image from 'next/image';
import WalletConnect from '@/components/WalletConnect';
import { useState, useCallback } from 'react';

export default function Header() {
  const [account, setAccount] = useState<string>('');
  const handleConnect = useCallback((addr: string) => {
    setAccount(addr);
  }, []);
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <Image
                  className="h-24 w-auto"
                  src="/logo.png"
                  alt="EventX"
                  width={96}
                  height={96}
                />
              </Link>
            </div>
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                href="/"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                About
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Events
              </Link>
              {account && (
                <Link
                  href="/organizer"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  Organizer
                </Link>
              )}
              <Link
                href="/my-tickets"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                My Tickets
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <WalletConnect onConnect={handleConnect} />
          </div>
          {/* Mobile menu button (placeholder) */}
          <div className="-mr-2 flex items-center md:hidden">
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
