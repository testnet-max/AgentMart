'use client';

import { useState } from 'react';

export type AgentCall = {
  id: string;
  agentName: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  cost: string;
  input: any;
  output?: any;
  summary?: string;
  executionTime?: number;
  timestamp: Date;
};

interface AgentExecutionPanelProps {
  agentCalls: AgentCall[];
}

export function AgentExecutionPanel({ agentCalls }: AgentExecutionPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed'>('all');

  const totalCost = agentCalls
    .filter(call => call.status === 'completed')
    .reduce((sum, call) => sum + parseFloat(call.cost), 0);

  const filteredCalls = agentCalls.filter(call => {
    if (filter === 'all') return true;
    return call.status === filter;
  });

  const getStatusColor = (status: AgentCall['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'executing':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
    }
  };

  const getStatusIcon = (status: AgentCall['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'executing':
        return '⚡';
      case 'completed':
        return '✓';
      case 'failed':
        return '✗';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Agent Executions
          </h2>
          <div className="text-right">
            <div className="text-xs text-gray-600">Total Cost</div>
            <div className="text-lg sm:text-xl font-bold text-gray-900">
              {totalCost.toFixed(3)} MNEE
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({agentCalls.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              filter === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Completed ({agentCalls.filter(c => c.status === 'completed').length})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              filter === 'failed'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Failed ({agentCalls.filter(c => c.status === 'failed').length})
          </button>
        </div>
      </div>

      {/* Agent Calls List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
        {filteredCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-3">🎯</div>
            <p className="text-sm text-gray-600">
              {filter === 'all' 
                ? 'No agent calls yet. Start a conversation!'
                : `No ${filter} agent calls`}
            </p>
          </div>
        ) : (
          filteredCalls.map((call) => (
            <div
              key={call.id}
              className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all"
            >
              {/* Call Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base sm:text-lg font-semibold text-gray-900">
                      {call.agentName}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                      {getStatusIcon(call.status)} {call.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {call.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{call.cost} MNEE</div>
                  {call.executionTime && (
                    <div className="text-xs text-gray-600">{call.executionTime}ms</div>
                  )}
                </div>
              </div>

              {/* Input Preview */}
              <div className="mb-2">
                <div className="text-xs font-semibold text-gray-700 mb-1">Input:</div>
                <div className="text-xs text-gray-600 bg-white rounded p-2 font-mono overflow-x-auto">
                  {JSON.stringify(call.input, null, 2).substring(0, 100)}
                  {JSON.stringify(call.input).length > 100 && '...'}
                </div>
              </div>

              {/* AI Summary (if completed and available) */}
              {call.status === 'completed' && call.summary && (
                <div className="mb-2">
                  <div className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <span>✨</span>
                    <span>AI Summary:</span>
                  </div>
                  <div className="text-sm text-gray-800 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100">
                    {call.summary}
                  </div>
                </div>
              )}

              {/* Output (if completed) */}
              {call.status === 'completed' && call.output && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-semibold text-gray-700">Raw Output:</div>
                    <button
                      onClick={() => setExpandedId(expandedId === call.id ? null : call.id)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      {expandedId === call.id ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                  <div
                    className={`text-xs text-gray-600 bg-white rounded p-2 font-mono overflow-x-auto ${
                      expandedId === call.id ? '' : 'max-h-20 overflow-hidden'
                    }`}
                  >
                    <pre className="whitespace-pre-wrap break-words">
                      {JSON.stringify(call.output, null, 2)}
                    </pre>
                  </div>
                  {expandedId === call.id && (
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(call.output, null, 2))}
                      className="mt-2 text-xs text-gray-600 hover:text-gray-900"
                    >
                      📋 Copy to clipboard
                    </button>
                  )}
                </div>
              )}

              {/* Error Message (if failed) */}
              {call.status === 'failed' && call.output && (
                <div className="bg-red-50 rounded p-2 mt-2">
                  <div className="text-xs font-semibold text-red-700 mb-1">Error:</div>
                  <div className="text-xs text-red-600">{call.output}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

