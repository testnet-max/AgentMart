'use client';

import { useState, useRef, useEffect } from 'react';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  functionCall?: {
    name: string;
    arguments: any;
  };
};

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInterface({ messages, onSendMessage, isLoading }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const examplePrompts = [
    "What's the weather in Tokyo?",
    "Get me the current BTC price",
    "Summarize: AI is transforming healthcare...",
    "Post to Reddit about Web3",
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
          AI Assistant
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Ask me anything - I can orchestrate agents for you
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Welcome to AgentMart AI
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md">
              I can help you by calling specialized agents. Try one of these:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt)}
                  className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs sm:text-sm text-gray-700 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-sky-400 to-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm sm:text-base whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                  {message.functionCall && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <div className="text-xs opacity-80">
                        🤖 Calling: {message.functionCall.name.replace('call_', '').replace(/_/g, ' ')}
                      </div>
                    </div>
                  )}
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-200 p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-br from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all disabled:cursor-not-allowed text-sm"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

