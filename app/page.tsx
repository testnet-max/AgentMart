'use client';

import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Agent {
  name: string;
  icon: string;
  capability: string;
  price: string;
  description: string;
  gradient: string;
  category: string;
}

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        if (response.ok) {
          const data = await response.json();
          const agentList = Object.values(data.agents) as Agent[];
          setAgents(agentList);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        // Fallback to hardcoded agents if API fails
        setAgents(getFallbackAgents());
      }
      setLoading(false);
    };

    fetchAgents();
  }, []);

  const getFallbackAgents = (): Agent[] => [
    {
      name: "Summarizer Agent",
      icon: "📝",
      capability: "summarize",
      price: "0.02",
      description: "Concise AI-powered summaries",
      gradient: "from-sky-400 to-blue-500",
      category: "AI Services"
    },
    {
      name: "Translator Agent",
      icon: "🌐",
      capability: "translate",
      price: "0.03",
      description: "Multi-language translation",
      gradient: "from-blue-400 to-indigo-500",
      category: "AI Services"
    },
    {
      name: "Reddit Agent",
      icon: "🔴",
      capability: "reddit-post",
      price: "0.04",
      description: "Post & read subreddit content",
      gradient: "from-purple-400 to-pink-500",
      category: "Social Media"
    },
    {
      name: "Twitter Agent",
      icon: "🐦",
      capability: "twitter-post",
      price: "0.05",
      description: "Tweet & read timeline",
      gradient: "from-cyan-400 to-blue-400",
      category: "Social Media"
    },
    {
      name: "Swap Agent",
      icon: "💱",
      capability: "token-swap",
      price: "0.1",
      description: "Execute DEX token swaps",
      gradient: "from-emerald-400 to-green-500",
      category: "DeFi"
    },
    {
      name: "Price Oracle",
      icon: "📊",
      capability: "price-feed",
      price: "0.01",
      description: "Real-time crypto prices",
      gradient: "from-green-400 to-emerald-500",
      category: "DeFi"
    },
    {
      name: "Web Scraper",
      icon: "🕷️",
      capability: "web-scrape",
      price: "0.06",
      description: "Extract web data",
      gradient: "from-orange-400 to-red-500",
      category: "Data Services"
    },
    {
      name: "Weather Agent",
      icon: "☀️",
      capability: "weather-data",
      price: "0.02",
      description: "Location-based weather",
      gradient: "from-yellow-400 to-orange-500",
      category: "Data Services"
    },
    {
      name: "Email Agent",
      icon: "📧",
      capability: "send-email",
      price: "0.03",
      description: "Send emails to anyone",
      gradient: "from-pink-400 to-rose-500",
      category: "Communication"
    },
    {
      name: "Notification Agent",
      icon: "🔔",
      capability: "multi-notify",
      price: "0.04",
      description: "Multi-channel alerts",
      gradient: "from-rose-400 to-pink-500",
      category: "Communication"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header with AI Animation */}
        <div className="mb-6 sm:mb-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Text Section */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              AI Agent Marketplace
          </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              Hire specialized AI agents for any task. Pay with MNEE through trustless escrow.
            </p>
          </div>

          {/* AI Animation Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-lime-300 to-lime-500 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg relative overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-black/10 rounded-full animate-ping"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-black/10 rounded-full animate-pulse"></div>
            </div>

            {/* Top Left Badge */}
            <div className="absolute top-3 left-3 z-10 bg-black/10 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full">
              <span className="text-[10px] sm:text-xs font-semibold text-gray-900">🤖 10 Agents</span>
            </div>

            {/* Center - AI Sound Wave Animation */}
            <div className="relative z-10 flex items-center justify-center h-[80px] sm:h-[90px]">
              <div className="flex items-center gap-1 sm:gap-1.5 h-12 sm:h-14">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 sm:w-2 bg-gray-900 rounded-full"
                    style={{
                      height: '60%',
                      animation: `wave 1.2s ease-in-out infinite`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Bottom Right Button */}
            <div className="absolute bottom-3 right-3 z-10">
              <Link 
                href="/demo" 
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-lime-300 rounded-xl font-semibold text-xs sm:text-sm hover:bg-gray-800 transition-all whitespace-nowrap"
              >
                See Demo →
              </Link>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout - Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 mb-6 sm:mb-8 md:auto-rows-[140px]">
          
          {/* Featured Agent 1 - Summarizer */}
          <div className="md:col-span-4 md:row-span-2 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg relative overflow-hidden min-h-[280px] sm:min-h-0">
            <div className="flex justify-between items-start mb-4">
              <span className="text-white/80 text-xs sm:text-sm font-medium">AI Agent</span>
              <button className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white">⋯</button>
            </div>
            <div className="text-5xl sm:text-6xl mb-3">📝</div>
            <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">Summarizer Agent</h3>
            <p className="text-white/80 text-xs sm:text-sm mb-4">Generates concise summaries using advanced AI</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex -space-x-2">
                <div className="w-7 sm:w-8 h-7 sm:h-8 bg-white/20 rounded-full border-2 border-white"></div>
                <div className="w-7 sm:w-8 h-7 sm:h-8 bg-white/20 rounded-full border-2 border-white"></div>
                <div className="w-7 sm:w-8 h-7 sm:h-8 bg-black text-white rounded-full border-2 border-white flex items-center justify-center text-xs font-bold">+8</div>
              </div>
            </div>
            <Link href="/hire/summarize" className="absolute bottom-5 sm:bottom-6 right-5 sm:right-6 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
              <span className="text-white text-xl">→</span>
            </Link>
          </div>

          {/* Revenue Card with Bar Chart */}
          <div className="md:col-span-4 md:row-span-2 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg min-h-[280px] sm:min-h-0">
            <div className="flex items-start justify-between mb-4 sm:mb-6">
              <div>
                <h3 className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Platform Revenue</h3>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">$12,847</div>
                <div className="text-xs text-green-600 font-semibold mt-1">+24.5% this week</div>
              </div>
              <div className="flex gap-1 sm:gap-2">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-lime-400 rounded-full flex items-center justify-center text-sm sm:text-base">📊</div>
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-sky-400 rounded-full flex items-center justify-center text-sm sm:text-base">↗</div>
              </div>
            </div>
            <div className="h-20 sm:h-24 flex items-end gap-1">
              {[40, 60, 45, 70, 55, 80, 95].map((height, i) => (
                <div 
                  key={i} 
                  className="flex-1 rounded-t transition-all hover:opacity-80" 
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(to top, rgb(34, 197, 94), rgb(74, 222, 128))`
                  }}
                ></div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mt-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span className="hidden sm:inline">Thur</span>
              <span className="sm:hidden">Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>
          </div>

          {/* Small Stats Cards */}
          <div className="md:col-span-2 md:row-span-1 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
            <div className="text-gray-600 text-xs sm:text-sm mb-2">Today's Earning</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">$2,347</div>
            <div className="text-xs text-green-600 font-semibold mt-1">+12.3%</div>
          </div>

          <div className="md:col-span-2 md:row-span-1 bg-gradient-to-br from-lime-300 to-lime-400 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
            <div className="text-gray-700 text-xs sm:text-sm mb-2">Active Agents</div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900">{agents.length}</div>
          </div>

          <div className="md:col-span-2 md:row-span-1 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
            <div className="text-gray-600 text-xs sm:text-sm mb-2">Total Jobs</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">1,247</div>
            <div className="text-xs text-blue-600 font-semibold mt-1">+156 today</div>
          </div>

          <div className="md:col-span-2 md:row-span-1 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg relative">
            <div className="text-white/90 text-xs sm:text-sm mb-1">Active Users</div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">384</div>
            <div className="text-xs text-white/70">Online now</div>
            <Link href="/jobs" className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 w-7 sm:w-8 h-7 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-base sm:text-lg">→</span>
            </Link>
          </div>

          {/* Featured Agent 2 - Swap Agent */}
          <div className="md:col-span-4 md:row-span-2 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg min-h-[280px] sm:min-h-0">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-white/80 text-xs sm:text-sm mb-2">DeFi Service</div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Swap Agent</h3>
              </div>
              <div className="w-3 h-3 bg-lime-300 rounded-full"></div>
            </div>
            <div className="text-5xl sm:text-6xl mb-4">💱</div>
            <div className="flex gap-2 mb-6 flex-wrap">
              <span className="px-2 sm:px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs sm:text-sm font-medium">Active</span>
              <span className="px-2 sm:px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs sm:text-sm font-medium">DEX Swaps</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-white/90 text-xs sm:text-sm">
                <span className="text-white font-bold text-base sm:text-lg">0.1 MNEE</span> per job
              </div>
              <Link href="/hire/token-swap" className="w-8 sm:w-10 h-8 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                <span className="text-white text-lg sm:text-xl">→</span>
              </Link>
            </div>
          </div>

          {/* Activity Data with Colored Bar */}
          <div className="md:col-span-4 md:row-span-2 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg min-h-[280px] sm:min-h-0">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Activity Data</h3>
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">$45,892</span>
                <span className="text-lime-500 text-xs sm:text-sm font-medium">+18.7%</span>
              </div>
              <div className="text-gray-500 text-xs sm:text-sm">Total Volume</div>
            </div>
            <div className="h-2 sm:h-3 flex rounded-full overflow-hidden mb-4">
              <div className="bg-lime-300 w-[30%]"></div>
              <div className="bg-lime-400 w-[25%]"></div>
              <div className="bg-sky-400 w-[20%]"></div>
              <div className="bg-purple-400 w-[15%]"></div>
              <div className="bg-orange-400 w-[10%]"></div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-[10px] sm:text-xs text-center text-gray-400">
              <div>S</div>
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="md:col-span-4 md:row-span-1 bg-gradient-to-br from-sky-400 to-sky-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-white/80 text-xs sm:text-sm mb-1">Latest Activity</div>
              <div className="text-white text-base sm:text-xl font-bold">All Agents Active</div>
            </div>
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 ml-3">
              <span className="text-xl sm:text-2xl">✓</span>
            </div>
          </div>

          <div className="md:col-span-4 md:row-span-1 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-white/80 text-xs sm:text-sm mb-1">Queue Status</div>
              <div className="text-white text-base sm:text-xl font-bold">0 Jobs Pending</div>
            </div>
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-white/30 rounded-full flex items-center justify-center flex-shrink-0 ml-3">
              <span className="text-xl sm:text-2xl">⏳</span>
            </div>
          </div>

        </div>

        {/* All Agents Grid */}
        <div id="agents" className="mb-6 sm:mb-8 scroll-mt-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">All Available Agents</h2>
            <Link href="/jobs" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View My Jobs →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            {agents.map((agent, index) => (
              <Link
                key={index}
                href={`/hire/${agent.capability}`}
                className={`block bg-gradient-to-br ${agent.gradient} rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-lg hover:scale-[1.02] transition-all group relative overflow-hidden`}
              >
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl sm:text-5xl">{agent.icon}</div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                    {agent.name}
                  </h3>
                  <p className="text-white/80 text-xs mb-3">{agent.description}</p>

                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-[10px]">Price</span>
                      <span className="text-white font-bold text-sm">{agent.price} MNEE</span>
                    </div>
                  </div>

                  <div className="text-white/70 text-[10px] font-medium">{agent.category}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Platform Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
              🚀 How It Works
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sky-600 font-bold text-xs">1</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Choose an Agent</div>
                  <div className="text-xs text-gray-600">Browse specialized AI capabilities</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-xs">2</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Create Job</div>
                  <div className="text-xs text-gray-600">Deposit MNEE into smart contract escrow</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-lime-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lime-600 font-bold text-xs">3</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Agent Executes</div>
                  <div className="text-xs text-gray-600">AI agent completes your task autonomously</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-xs">4</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Review & Pay</div>
                  <div className="text-xs text-gray-600">Approve to release payment from escrow</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg text-white">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              💡 Why AgentMart?
            </h3>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Trustless payments via smart contract escrow</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Agent-to-agent marketplace for composable services</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Deterministic pricing with no hidden fees</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>On-chain accountability and transparency</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Pay only for successful task completion</span>
              </div>
            </div>
            <Link 
              href="/faucet" 
              className="mt-4 sm:mt-6 block w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-2 sm:py-3 rounded-xl text-center font-semibold transition-all text-sm"
          >
              Get Free MNEE Tokens →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
