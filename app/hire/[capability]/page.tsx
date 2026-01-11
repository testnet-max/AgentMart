'use client';

import { use, useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, decodeEventLog } from 'viem';
import { useRouter } from 'next/navigation';
import { MockMNEEABI, JobEscrowABI } from '@/lib/contracts';
import Link from 'next/link';

interface AgentData {
  name: string;
  address: string;
  price: string;
  capability: string;
  icon: string;
  description: string;
  placeholder: string;
  color: string;
}

const MNEE_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const ESCROW_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

// Agent data with addresses from deployment file
const agentData: Record<string, any> = {
  summarize: {
    name: 'Summarizer Agent',
    address: '0x018150bb8222fcD3c560C51923564A69653A802D',
    price: '0.02',
    icon: '📝',
    description: 'Generates concise AI-powered summaries of long text',
    placeholder: 'Paste the text you want to summarize here...',
    color: 'from-sky-400 to-blue-500',
  },
  translate: {
    name: 'Translator Agent',
    address: '0xF5FB3a063a629CfFFA34893a592642497506a592',
    price: '0.03',
    icon: '🌐',
    description: 'Translates text between multiple languages',
    placeholder: 'Enter text to translate (JSON format: {"text": "...", "from": "English", "to": "Spanish"})',
    color: 'from-blue-400 to-indigo-500',
  },
  'reddit-post': {
    name: 'Reddit Agent',
    address: '0x4a306C0d54CBfbD3863834F6E089A599b3252629',
    price: '0.04',
    icon: '🔴',
    description: 'Post to subreddits and read posts - bypasses rate limits',
    placeholder: 'Post to r/cryptocurrency: Check out AgentMart - AI agents on blockchain!',
    color: 'from-purple-400 to-pink-500',
  },
  'twitter-post': {
    name: 'Twitter Agent',
    address: '0x698CC79885933AfE9628c8266999D56f984D4678',
    price: '0.05',
    icon: '🐦',
    description: 'Tweet and read timeline with verified API access',
    placeholder: 'Tweet: AgentMart is now live! Hire AI agents and pay with crypto. #Web3 #AI',
    color: 'from-cyan-400 to-blue-400',
  },
  'token-swap': {
    name: 'Swap Agent',
    address: '0x51e52a025537551C256D3011Ee0761F769c29E38',
    price: '0.1',
    icon: '💱',
    description: 'Execute token swaps on DEX with best rates',
    placeholder: 'Swap 100 USDC for ETH on Uniswap',
    color: 'from-emerald-400 to-green-500',
  },
  'price-feed': {
    name: 'Price Oracle Agent',
    address: '0x3F1123C03D83B65d9F42745dD54F65680B20F110',
    price: '0.01',
    icon: '📊',
    description: 'Real-time cryptocurrency price data from multiple sources',
    placeholder: 'Get current price of BTC, ETH, SOL',
    color: 'from-green-400 to-emerald-500',
  },
  'web-scrape': {
    name: 'Web Scraper Agent',
    address: '0x281c259b1A0dBd9CfF3a7E199F50B227e0B6bB12',
    price: '0.06',
    icon: '🕷️',
    description: 'Extract data from websites - bypasses anti-bot protection',
    placeholder: 'Scrape product prices from https://example.com/products',
    color: 'from-orange-400 to-red-500',
  },
  'weather-data': {
    name: 'Weather Agent',
    address: '0x5428F01Aa8074B20Fa496D585525d6c17460d9D0',
    price: '0.02',
    icon: '☀️',
    description: 'Get weather data for any location worldwide',
    placeholder: 'Get weather for San Francisco, CA',
    color: 'from-yellow-400 to-orange-500',
  },
  'send-email': {
    name: 'Email Agent',
    address: '0x64d58932a22bc079168127C0D60c649C14C5eFA2',
    price: '0.03',
    icon: '📧',
    description: 'Send emails via SMTP on behalf of other agents',
    placeholder: 'Email to user@example.com\nSubject: Order Confirmation\nBody: Your order has been confirmed.',
    color: 'from-pink-400 to-rose-500',
  },
  'multi-notify': {
    name: 'Notification Agent',
    address: '0x422e9f098C07b25fc79658eFbf643d0cEB80aA38',
    price: '0.04',
    icon: '🔔',
    description: 'Multi-channel notifications: Slack, Discord, Telegram',
    placeholder: 'Send alert to #dev-channel: Deployment complete!',
    color: 'from-rose-400 to-pink-500',
  },
};

export default function HirePage({ params }: { params: Promise<{ capability: string }> }) {
  const resolvedParams = use(params);
  const capability = resolvedParams.capability;
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [step, setStep] = useState<'input' | 'approve' | 'create' | 'processing' | 'complete'>('input');
  const [jobId, setJobId] = useState<bigint | null>(null);
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [agents, setAgents] = useState<Record<string, AgentData>>({});
  const [loading, setLoading] = useState(true);

  const { writeContract: approveToken, data: approveHash } = useWriteContract();
  const { writeContract: createJob, data: createHash } = useWriteContract();

  const { isLoading: isApproving, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isCreating, isSuccess: isCreateSuccess, data: createReceipt } = useWaitForTransactionReceipt({ hash: createHash });

  // Read job status if we have a jobId
  const { data: jobData } = useReadContract({
    address: ESCROW_ADDRESS as `0x${string}`,
    abi: JobEscrowABI,
    functionName: 'getJob',
    args: jobId !== null ? [jobId] : undefined,
    query: {
      enabled: jobId !== null,
      refetchInterval: 2000, // Poll every 2 seconds
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch agent data dynamically
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const response = await fetch('/api/agents');
        if (response.ok) {
          const data = await response.json();
          setAgents(data.agents);
          setAgent(data.agents[capability] || null);
        }
      } catch (error) {
        console.error('Error fetching agent data:', error);
        // Fallback to hardcoded data if API fails
        setAgent(agentData[capability] || null);
      }
      setLoading(false);
    };

    fetchAgentData();
  }, [capability]);

  // Move to 'create' step after approval succeeds
  useEffect(() => {
    if (isApproveSuccess) {
      setStep('create');
    }
  }, [isApproveSuccess]);

  // Get latest job IDs to find the newly created one
  const { data: userJobIds, refetch: refetchJobIds } = useReadContract({
    address: ESCROW_ADDRESS as `0x${string}`,
    abi: JobEscrowABI,
    functionName: 'getJobsByClient',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isCreateSuccess,
    },
  });

  // When transaction succeeds, immediately move to processing and fetch job ID
  useEffect(() => {
    if (isCreateSuccess && !jobId) {
      console.log('📝 Transaction confirmed, extracting job ID...');
      setStep('processing'); // Show processing state immediately
      
      // Try to extract from event logs first
      if (createReceipt?.logs) {
        for (const log of createReceipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: JobEscrowABI,
              data: log.data,
              topics: log.topics,
            });
            
            if (decoded.eventName === 'JobCreated' && decoded.args && 'jobId' in decoded.args && decoded.args.jobId) {
              const extractedJobId = decoded.args.jobId as bigint;
              console.log('✅ Job ID extracted from event:', extractedJobId.toString());
              setJobId(extractedJobId);
              return;
            }
          } catch (e) {
            // Not the JobCreated event, continue
            continue;
          }
        }
      }
      
      // Fallback: Fetch latest job IDs after a short delay
      console.log('⚠️ Event not found, fetching latest jobs...');
      setTimeout(() => {
        refetchJobIds();
      }, 500);
    }
  }, [isCreateSuccess, createReceipt, jobId, refetchJobIds]);

  // When userJobIds updates, set the latest as jobId
  useEffect(() => {
    if (userJobIds && Array.isArray(userJobIds) && userJobIds.length > 0 && !jobId) {
      const latestJobId = userJobIds[userJobIds.length - 1];
      console.log('✅ Job ID found from latest jobs:', latestJobId.toString());
      setJobId(latestJobId);
    }
  }, [userJobIds, jobId]);

  // Monitor job status
  useEffect(() => {
    if (jobData) {
      let status: number;
      
      // Handle both array and object formats
      if (Array.isArray(jobData)) {
        status = Number(jobData[7]); // status is at index 7
      } else {
        // Handle object format with named properties
        const job = jobData as any;
        status = Number(job.status ?? job[7] ?? 0);
      }
      
      const statusLabels = ['Pending', 'Accepted', 'Completed', 'Approved', 'Rejected', 'Cancelled'];
      console.log(`📊 Job ${jobId} status updated:`, status, statusLabels[status] || 'Unknown');
      
      if (status === 0) {
        setStep('processing'); // Pending - waiting for agent
      } else if (status === 1) {
        setStep('processing'); // Accepted - agent is working
      } else if (status === 2) {
        console.log('✅ Job completed! Moving to complete step...');
        setStep('complete'); // Completed - ready for approval
      } else if (status === 3) {
        setStep('complete'); // Already approved
      }
    }
  }, [jobData, jobId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agent data...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Agent Not Found</h1>
          <p className="text-gray-600 mb-6">The agent "{capability}" is not available or not deployed yet.</p>
          <Link href="/" className="inline-block bg-gradient-to-br from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg transition-all">
            Browse Available Agents →
          </Link>
        </div>
      </div>
    );
  }

  const handleApprove = async () => {
    if (!isConnected) {
      alert('Please connect your wallet');
      return;
    }

    try {
      setStep('approve'); // Set to approve state while processing
      approveToken({
        address: MNEE_ADDRESS as `0x${string}`,
        abi: MockMNEEABI,
        functionName: 'approve',
        args: [ESCROW_ADDRESS, parseEther(agent.price)],
      });
    } catch (error) {
      console.error('Approval error:', error);
      setStep('input');
    }
  };

  const handleCreateJob = async () => {
    if (!inputText.trim()) {
      alert('Please enter input text');
      return;
    }

    try {
      createJob({
        address: ESCROW_ADDRESS as `0x${string}`,
        abi: JobEscrowABI,
        functionName: 'createJob',
        args: [agent.address, parseEther(agent.price), capability, inputText],
      });
    } catch (error) {
      console.error('Job creation error:', error);
    }
  };

  const handleViewJob = () => {
    router.push('/jobs');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
          <Link href="/" className="hover:text-gray-900">Overview</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Hire Agent</span>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 mb-3 sm:mb-4">
          
          {/* Agent Info Card */}
          <div className={`md:col-span-5 bg-gradient-to-br ${agent.color} rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg`}>
            <div className="text-white">
              <div className="text-5xl sm:text-7xl mb-3 sm:mb-4">{agent.icon}</div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">{agent.name}</h1>
              <p className="text-white/90 text-base sm:text-lg mb-4 sm:mb-6">{agent.description}</p>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/90 text-xs sm:text-sm">Price per Job</span>
                  <span className="text-2xl sm:text-3xl font-bold text-white">{agent.price} MNEE</span>
                </div>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Instant execution via smart contract</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Payment locked in escrow</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Review before releasing funds</span>
                </div>
              </div>
            </div>
          </div>

          {/* Input Form Card */}
          <div className="md:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Create New Job</h2>
            
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                Task Input
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={agent.placeholder}
                rows={8}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all resize-none"
              />
            </div>

            {!mounted ? (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                <span className="text-3xl sm:text-4xl mb-2 sm:mb-3 block">⏳</span>
                <p className="text-gray-600 font-medium text-sm sm:text-base">
                  Loading...
                </p>
              </div>
            ) : !isConnected ? (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                <span className="text-3xl sm:text-4xl mb-2 sm:mb-3 block">⚠️</span>
                <p className="text-yellow-800 font-medium text-sm sm:text-base">
                  Please connect your wallet to hire this agent
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {step === 'input' || step === 'approve' ? (
                  <button
                    onClick={handleApprove}
                    disabled={!inputText.trim() || isApproving}
                    className="w-full bg-gradient-to-br from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold transition-all shadow-lg disabled:shadow-none"
                  >
                    {isApproving ? 'Approving MNEE...' : '1. Approve MNEE Spending →'}
                  </button>
                ) : step === 'create' ? (
                  <button
                    onClick={handleCreateJob}
                    disabled={isCreating}
                    className="w-full bg-gradient-to-br from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold transition-all shadow-lg disabled:shadow-none"
                  >
                    {isCreating ? 'Creating Job...' : '2. Create Job & Deposit →'}
                  </button>
                ) : step === 'processing' ? (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                    <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 animate-pulse">⏳</div>
                    <p className="text-purple-800 font-semibold text-sm sm:text-base mb-1">
                      Agent is Processing Your Task
                    </p>
                    <p className="text-purple-600 text-xs sm:text-sm mb-2">
                      {jobId ? `Job ID: ${jobId.toString()}` : 'Fetching job ID...'}
                    </p>
                    {jobData && Array.isArray(jobData) && (
                      <p className="text-purple-500 text-xs mt-1">
                        Status: {['Pending', 'Accepted', 'Completed', 'Approved', 'Rejected', 'Cancelled'][Number(jobData[7])] || 'Unknown'}
                      </p>
                    )}
                  </div>
                ) : step === 'complete' ? (
                  <div className="bg-lime-50 border-2 border-lime-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                    <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">✅</div>
                    <p className="text-lime-800 font-semibold text-sm sm:text-base mb-1">
                      Task Complete!
                    </p>
                    <p className="text-lime-600 text-xs sm:text-sm">
                      Review the result and approve payment
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
          {/* Process Steps Card */}
          <div className="md:col-span-6 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
              {step === 'complete' ? '✅ Job Complete!' : 'Job Progress'}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {/* Step 1: Approve Token */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step === 'input' ? 'bg-sky-100' : 'bg-sky-500'
                }`}>
                  {step === 'input' ? (
                    <span className="text-sky-600 font-bold text-sm sm:text-base">1</span>
                  ) : (
                    <span className="text-white text-sm sm:text-base">✓</span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Approve Token</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {step === 'input' ? 'Allow the contract to spend MNEE' : 'Token approval confirmed'}
                  </p>
                </div>
              </div>

              {/* Step 2: Create Job */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step === 'input' || step === 'approve' ? 'bg-gray-100' : 
                  step === 'create' ? 'bg-blue-100' : 'bg-blue-500'
                }`}>
                  {step === 'input' || step === 'approve' ? (
                    <span className="text-gray-400 font-bold text-sm sm:text-base">2</span>
                  ) : step === 'create' ? (
                    <span className="text-blue-600 font-bold text-sm sm:text-base">2</span>
                  ) : (
                    <span className="text-white text-sm sm:text-base">✓</span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Create Job</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {step === 'processing' || step === 'complete' ? 'MNEE deposited into escrow' : 'Deposit MNEE into escrow'}
                  </p>
                </div>
              </div>

              {/* Step 3: Agent Processes */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step === 'processing' ? 'bg-purple-100 animate-pulse' : 
                  step === 'complete' ? 'bg-purple-500' : 'bg-gray-100'
                }`}>
                  {step === 'processing' ? (
                    <span className="text-purple-600 font-bold text-sm sm:text-base">⏳</span>
                  ) : step === 'complete' ? (
                    <span className="text-white text-sm sm:text-base">✓</span>
                  ) : (
                    <span className="text-gray-400 font-bold text-sm sm:text-base">3</span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Agent Processes</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {step === 'processing' ? (
                      <span className="text-purple-600 font-semibold">AI is executing your task...</span>
                    ) : step === 'complete' ? (
                      'Task completed successfully'
                    ) : (
                      'AI executes your task automatically'
                    )}
                  </p>
                </div>
              </div>

              {/* Step 4: Review & Pay */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step === 'complete' ? 'bg-lime-100' : 'bg-gray-100'
                }`}>
                  <span className={`font-bold text-sm sm:text-base ${
                    step === 'complete' ? 'text-lime-600' : 'text-gray-400'
                  }`}>4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Review & Pay</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {step === 'complete' ? 'Ready for approval' : 'Approve to release payment'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            {step === 'complete' && jobId && (
              <div className="mt-6">
                <button
                  onClick={handleViewJob}
                  className="w-full bg-gradient-to-br from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 text-white py-3 rounded-xl font-semibold transition-all shadow-lg"
                >
                  View Job & Approve Payment →
                </button>
              </div>
            )}
          </div>

          {/* Agent Stats Grid */}
          <div className="md:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-sky-400 to-sky-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg text-white">
              <div className="text-xs sm:text-sm mb-2 text-white/80">Agent Address</div>
              <div className="text-xs sm:text-sm font-mono break-all">{agent.address.slice(0, 10)}...{agent.address.slice(-8)}</div>
            </div>

            <div className="bg-gradient-to-br from-lime-300 to-lime-400 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
              <div className="text-xs sm:text-sm text-gray-700 mb-2">Status</div>
              <div className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Active
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


