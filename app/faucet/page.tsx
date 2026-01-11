'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { MockMNEEABI } from '@/lib/contracts';

const MNEE_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export default function FaucetPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { data: balance, refetch } = useReadContract({
    address: MNEE_ADDRESS as `0x${string}`,
    abi: MockMNEEABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading } = useWaitForTransactionReceipt({ 
    hash,
    onSuccess: () => {
      refetch();
    }
  });

  const handleMint = () => {
    writeContract({
      address: MNEE_ADDRESS as `0x${string}`,
      abi: MockMNEEABI,
      functionName: 'faucet',
    });
  };

  const balanceFormatted = balance ? (Number(balance) / 1e18).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">MNEE Faucet</h1>

        {/* Top Grid - Main Faucet & Features */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 mb-3 sm:mb-4">
          
          {/* Main Faucet Card */}
          <div className="md:col-span-7 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg">
            <div className="text-white">
              {/* Header with icon */}
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="text-5xl sm:text-7xl">💰</div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">Get Free MNEE</h2>
                  <p className="text-white/90 text-sm sm:text-lg">
                    Mint test tokens to hire AI agents and explore the platform
                  </p>
                </div>
              </div>

              {!mounted ? (
                <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
                  <span className="text-4xl sm:text-5xl mb-3 sm:mb-4 block">⏳</span>
                  <p className="text-white text-base sm:text-lg font-medium">
                    Loading...
                  </p>
                </div>
              ) : !isConnected ? (
                <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
                  <span className="text-4xl sm:text-5xl mb-3 sm:mb-4 block">🔒</span>
                  <p className="text-white text-base sm:text-lg font-medium">
                    Connect your wallet to mint tokens
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="text-white/80 text-xs sm:text-sm mb-2">Your Balance</div>
                    <div className="text-3xl sm:text-5xl font-bold text-white">{balanceFormatted} MNEE</div>
                  </div>

                  <button
                    onClick={handleMint}
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-300 text-blue-600 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-xl transition-all shadow-xl"
                  >
                    {isLoading ? 'Minting...' : 'Mint 100 MNEE →'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Features Cards Column */}
          <div className="md:col-span-5 space-y-3 sm:space-y-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-lime-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl sm:text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Instant Minting</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Get tokens immediately</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-purple-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl sm:text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">No Limits</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Mint up to 1000 MNEE</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-sky-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl sm:text-2xl">🔄</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Test Network</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Safe testnet environment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid - Token Info & Contract */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Token Info Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <span>🪙</span>
              Token Information
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">Symbol</div>
                <div className="text-base sm:text-lg font-bold text-gray-900">MNEE</div>
              </div>
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">Decimals</div>
                <div className="text-base sm:text-lg font-bold text-gray-900">18</div>
              </div>
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-600 mb-2">Type</div>
                <div className="text-xs sm:text-sm text-gray-900">ERC-20 Test Token</div>
              </div>
            </div>
          </div>

          {/* Contract Address Card */}
          <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg text-white">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Contract Address</h3>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="font-mono text-[10px] sm:text-xs break-all">{MNEE_ADDRESS}</div>
            </div>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
              MNEE is a mock stablecoin for testing. In production, this would be a real stablecoin like USDC or DAI.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

