'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { ChatInterface, Message } from '@/components/ChatInterface';
import { AgentExecutionPanel, AgentCall } from '@/components/AgentExecutionPanel';
import { PaymentConfirmModal } from '@/components/PaymentConfirmModal';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { agentPrices, shouldAutoApprove } from '@/lib/agentFunctions';
import { MockMNEEABI } from '@/lib/contracts';

const MNEE_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Agent addresses (for future smart contract integration)
// Currently unused as demo uses simulated execution
const AGENT_ADDRESSES: Record<string, string> = {
  call_summarizer: '0x3E093174015A37c0A20F359f46e9F94A7fEa79Dd',
  call_translator: '0x7c75e2504a6D18e91DAFcDa4E8f0F265283295B4',
  call_reddit_agent: '0x0000000000000000000000000000000000000001',
  call_twitter_agent: '0x0000000000000000000000000000000000000002',
  call_swap_agent: '0x0000000000000000000000000000000000000003',
  call_price_oracle: '0x0000000000000000000000000000000000000004',
  call_web_scraper: '0x0000000000000000000000000000000000000005',
  call_weather_agent: '0x0000000000000000000000000000000000000006',
  call_email_agent: '0x0000000000000000000000000000000000000007',
  call_notification_agent: '0x0000000000000000000000000000000000000008',
};

export default function DemoPage() {
  const { address, isConnected } = useAccount();
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentCalls, setAgentCalls] = useState<AgentCall[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [stats, setStats] = useState<{
    total_calls: number;
    completed_calls: number;
    failed_calls: number;
    total_spent: number;
  } | null>(null);
  const [pendingFunction, setPendingFunction] = useState<{
    name: string;
    arguments: any;
  } | null>(null);

  // Get MNEE balance
  const { data: balance } = useReadContract({
    address: MNEE_ADDRESS as `0x${string}`,
    abi: MockMNEEABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const balanceFormatted = balance ? formatEther(balance as bigint) : '0';

  // Fix hydration mismatch by only rendering wallet UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load agent history from database when wallet connects
  useEffect(() => {
    if (address && !historyLoaded && mounted) {
      loadHistory();
    }
  }, [address, historyLoaded, mounted]);

  const loadHistory = async () => {
    if (!address) return;

    try {
      const response = await fetch(`/api/history?wallet=${address}&limit=50`);
      const data = await response.json();

      if (data.history && data.history.length > 0) {
        // Convert database records to AgentCall format
        const loadedCalls: AgentCall[] = data.history.map((record: any) => ({
          id: record.id,
          agentName: record.agentName,
          status: record.status,
          cost: record.cost,
          input: record.input,
          output: record.output,
          summary: record.summary,
          executionTime: record.executionTime,
          timestamp: new Date(record.timestamp),
        }));

        setAgentCalls(loadedCalls);
      }

      // Load stats
      if (data.stats) {
        setStats(data.stats);
      }

      setHistoryLoaded(true);
    } catch (error) {
      console.error('Failed to load history:', error);
      setHistoryLoaded(true);
    }
  };

  const saveToHistory = async (action: 'create' | 'update', data: any) => {
    if (!address) return;

    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          data: {
            ...data,
            walletAddress: address,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to save to history:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call OpenAI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Check if AI wants to call a function
      if (data.functionCall) {
        const { name, arguments: args } = data.functionCall;
        const price = agentPrices[name];

        // Check if auto-approve
        if (shouldAutoApprove(price)) {
          // Auto-execute
          await executeAgentCall(name, args, data.message || 'Executing agent...');
        } else {
          // Show confirmation modal
          setPendingFunction({ name, arguments: args });
          
          // Add AI message explaining what it wants to do
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.message || `I'd like to call ${name.replace('call_', '').replace(/_/g, ' ')} for you. This will cost ${price} MNEE. Please approve.`,
            timestamp: new Date(),
            functionCall: { name, arguments: args },
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      } else {
        // Just a regular message
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeAgentCall = async (functionName: string, args: any, aiMessage?: string) => {
    const agentName = functionName.replace('call_', '').replace(/_/g, ' ');
    const cost = agentPrices[functionName].toString();
    const capability = functionName.replace('call_', '');
    
    // Create agent call record
    const agentCall: AgentCall = {
      id: Date.now().toString(),
      agentName,
      status: 'executing',
      cost,
      input: args,
      timestamp: new Date(),
    };

    setAgentCalls(prev => [...prev, agentCall]);

    // Save to database (create)
    await saveToHistory('create', {
      id: agentCall.id,
      agentName,
      capability,
      status: 'executing',
      cost,
      input: args,
    });

    // If there's an AI message, add it
    if (aiMessage) {
      const msg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: aiMessage,
        timestamp: new Date(),
        functionCall: { name: functionName, arguments: args },
      };
      setMessages(prev => [...prev, msg]);
    }

    try {
      // Simulate agent execution (in production, this would call smart contract)
      const startTime = Date.now();
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
      
      // Generate mock result based on agent type
      let result: any;
      
      if (functionName === 'call_weather_agent') {
        result = {
          location: args.location,
          temperature: 72,
          condition: "Sunny",
          humidity: "45%"
        };
      } else if (functionName === 'call_price_oracle') {
        result = {
          prices: args.tokens.map((token: string) => ({
            symbol: token,
            price_usd: (Math.random() * 50000 + 1000).toFixed(2),
            change_24h: (Math.random() * 10 - 5).toFixed(2) + "%"
          }))
        };
      } else if (functionName === 'call_swap_agent') {
        result = {
          from_token: args.from_token,
          to_token: args.to_token,
          input_amount: args.amount,
          output_amount: (args.amount * 0.00045).toFixed(6),
          transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`
        };
      } else {
        result = {
          success: true,
          message: `${agentName} executed successfully`,
          data: args
        };
      }

      const executionTime = Date.now() - startTime;

      // Update agent call with result
      setAgentCalls(prev => prev.map(call =>
        call.id === agentCall.id
          ? { ...call, status: 'completed', output: result, executionTime }
          : call
      ));

      // Generate AI summary
      let summary: string | undefined;
      try {
        const summaryResponse = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentName,
            input: args,
            output: result,
          }),
        });

        const summaryData = await summaryResponse.json();
        if (summaryData.summary) {
          summary = summaryData.summary;
          // Update agent call with summary
          setAgentCalls(prev => prev.map(call =>
            call.id === agentCall.id
              ? { ...call, summary: summaryData.summary }
              : call
          ));
        }
      } catch (summaryError) {
        console.error('Failed to generate summary:', summaryError);
        // Continue without summary
      }

      // Save to database (update with result)
      await saveToHistory('update', {
        id: agentCall.id,
        status: 'completed',
        output: result,
        summary,
        executionTime,
      });

      // Refresh stats
      if (address) {
        const statsResponse = await fetch(`/api/history?wallet=${address}&limit=1`);
        const statsData = await statsResponse.json();
        if (statsData.stats) {
          setStats(statsData.stats);
        }
      }

      // Add AI response with result
      const resultMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `✅ ${agentName} completed! ${JSON.stringify(result, null, 2).substring(0, 200)}...`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, resultMessage]);

    } catch (error: any) {
      // Update agent call with error
      setAgentCalls(prev => prev.map(call =>
        call.id === agentCall.id
          ? { ...call, status: 'failed', output: error.message }
          : call
      ));

      // Save error to database
      await saveToHistory('update', {
        id: agentCall.id,
        status: 'failed',
        output: error.message,
      });

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `❌ ${agentName} failed: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleApprovePayment = async () => {
    if (!pendingFunction) return;
    
    await executeAgentCall(pendingFunction.name, pendingFunction.arguments);
    setPendingFunction(null);
  };

  const handleRejectPayment = () => {
    const rejectionMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Understood. I won\'t execute that agent call.',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, rejectionMessage]);
    setPendingFunction(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            AI Agent Demo
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mb-4">
            Chat with AI that can orchestrate specialized agents to accomplish tasks.
          </p>
          
          {!mounted ? (
            <div className="bg-gray-100 rounded-2xl p-4 text-center animate-pulse">
              <span className="text-2xl mb-2 block">⏳</span>
              <p className="text-gray-600 font-medium">
                Loading...
              </p>
            </div>
          ) : !isConnected ? (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 text-center">
              <span className="text-2xl mb-2 block">⚠️</span>
              <p className="text-yellow-800 font-medium">
                Please connect your wallet to use the AI demo
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Balance Card */}
              <div className="md:col-span-5 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-4 text-white">
                <div>
                  <div className="text-xs sm:text-sm opacity-90">Your MNEE Balance</div>
                  <div className="text-2xl sm:text-3xl font-bold mb-2">{parseFloat(balanceFormatted).toFixed(2)} MNEE</div>
                  <a href="/faucet" className="inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all">
                    Get More →
                  </a>
                </div>
              </div>

              {/* Stats Card */}
              {stats && (
                <div className="md:col-span-7 bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-100">
                  <div className="text-xs text-gray-600 mb-2">📊 Your Activity</div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_calls || 0}</div>
                      <div className="text-xs text-gray-600">Total Calls</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.completed_calls || 0}</div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.failed_calls || 0}</div>
                      <div className="text-xs text-gray-600">Failed</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-purple-600">{(stats.total_spent || 0).toFixed(2)}</div>
                      <div className="text-xs text-gray-600">MNEE Spent</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Split View Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6" style={{ minHeight: '600px' }}>
          {/* Chat Panel - 60% width on desktop */}
          <div className="lg:col-span-7 h-[600px]">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>

          {/* Execution Panel - 40% width on desktop */}
          <div className="lg:col-span-5 h-[600px]">
            <AgentExecutionPanel agentCalls={agentCalls} />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-3">💡 How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold text-gray-900 mb-1">🤖 Natural Language</div>
              <div className="text-gray-600">Just chat naturally. AI understands your intent and calls the right agents.</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1">💰 Smart Payments</div>
              <div className="text-gray-600">Cheap calls (&lt;0.05 MNEE) auto-execute. Expensive ones need approval.</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1">⛓️ Multi-Agent Flows</div>
              <div className="text-gray-600">AI can chain multiple agents for complex tasks automatically.</div>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Confirmation Modal */}
      {pendingFunction && (
        <PaymentConfirmModal
          isOpen={true}
          agentName={pendingFunction.name.replace('call_', '').replace(/_/g, ' ')}
          cost={agentPrices[pendingFunction.name].toString()}
          balance={balanceFormatted}
          input={pendingFunction.arguments}
          onApprove={handleApprovePayment}
          onReject={handleRejectPayment}
          isProcessing={false}
        />
      )}
    </div>
  );
}

