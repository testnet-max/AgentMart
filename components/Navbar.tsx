'use client';

import Link from 'next/link';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';

export function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch by only rendering wallet UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link href="/" className="text-lg sm:text-xl font-bold text-gray-900">
              AgentMart
            </Link>
            <div className="hidden md:flex space-x-1">
              <Link
                href="/"
                className="text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium"
              >
                Overview
              </Link>
              <Link
                href="/problem"
                className="text-gray-500 hover:text-gray-900 px-4 py-2 text-sm"
              >
                Problem
              </Link>
              <Link
                href="/about"
                className="text-gray-500 hover:text-gray-900 px-4 py-2 text-sm"
              >
                About
              </Link>
              <Link
                href="/demo"
                className="text-gray-500 hover:text-gray-900 px-4 py-2 text-sm"
              >
                AI Demo
              </Link>
              <Link 
                href="/jobs" 
                className="text-gray-500 hover:text-gray-900 px-4 py-2 text-sm"
              >
                My Jobs
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search - hidden on mobile */}
            <div className="relative hidden lg:block">
              <input 
                type="text"
                placeholder="Search"
                className="w-48 px-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            
            {!mounted ? (
              // Show placeholder during SSR to prevent hydration mismatch
              <>
                <button className="hidden sm:flex w-10 h-10 bg-gray-100 rounded-lg items-center justify-center">
                  <span>📧</span>
                </button>
                <button className="hidden sm:flex w-10 h-10 bg-gray-100 rounded-lg items-center justify-center">
                  <span>🔔</span>
                </button>
                <div className="px-3 sm:px-6 py-2 bg-gray-200 rounded-lg text-xs sm:text-sm font-semibold">
                  <span className="hidden sm:inline">Loading...</span>
                  <span className="sm:hidden">...</span>
                </div>
              </>
            ) : isConnected ? (
              <>
                {/* Icons - hidden on small mobile */}
                <button className="hidden sm:flex w-10 h-10 bg-gray-100 rounded-lg items-center justify-center hover:bg-gray-200">
                  <span>📧</span>
                </button>
                <button className="hidden sm:flex w-10 h-10 bg-gray-100 rounded-lg items-center justify-center hover:bg-gray-200">
                  <span>🔔</span>
                </button>
                <div className="flex items-center gap-2 sm:gap-3 sm:pl-4 sm:border-l border-gray-200">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-gray-900">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </div>
                    <div className="text-xs text-gray-500">Connected</div>
                  </div>
                  <button 
                    onClick={() => disconnect()}
                    className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center hover:shadow-lg transition-all"
                    title={`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                  >
                    <span className="text-white text-lg">👤</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <button className="hidden sm:flex w-10 h-10 bg-gray-100 rounded-lg items-center justify-center">
                  <span>📧</span>
                </button>
                <button className="hidden sm:flex w-10 h-10 bg-gray-100 rounded-lg items-center justify-center">
                  <span>🔔</span>
                </button>
                <button
                  onClick={() => connect({ connector: connectors[0] })}
                  className="px-3 sm:px-6 py-2 bg-gradient-to-br from-sky-400 to-blue-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:shadow-lg transition-all"
                >
                  <span className="hidden sm:inline">Connect Wallet</span>
                  <span className="sm:hidden">Connect</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

