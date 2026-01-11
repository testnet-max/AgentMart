import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    // Read deployment info
    const deploymentPath = '/Users/lazydevpro/VSCodeProjects/AgentMart/deployments.json';

    if (!fs.existsSync(deploymentPath)) {
      return NextResponse.json(
        { error: `Deployment file not found at ${deploymentPath}. Please run deployment first.` },
        { status: 404 }
      );
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf-8'));

    // Transform agent data for frontend
    const agents: Record<string, any> = {};

    Object.entries(deploymentInfo.agents).forEach(([key, agent]: [string, any]) => {
      // Map agent keys to capabilities
      const capabilityMap: Record<string, string> = {
        summarizer: 'summarize',
        translator: 'translate',
        reddit: 'reddit-post',
        twitter: 'twitter-post',
        swap: 'token-swap',
        priceOracle: 'price-feed',
        webScraper: 'web-scrape',
        weather: 'weather-data',
        email: 'send-email',
        notification: 'multi-notify',
      };

      const capability = capabilityMap[key];
      if (capability) {
        agents[capability] = {
          name: agent.name,
          address: agent.address,
          price: agent.price,
          capability: capability,
          // Add UI metadata
          icon: getAgentIcon(capability),
          description: getAgentDescription(capability),
          placeholder: getAgentPlaceholder(capability),
          color: getAgentColor(capability),
          category: getAgentCategory(capability),
        };
      }
    });

    return NextResponse.json({ agents, network: deploymentInfo.network });
  } catch (error: any) {
    console.error('Error loading agents:', error);
    return NextResponse.json(
      { error: 'Failed to load agent data' },
      { status: 500 }
    );
  }
}

function getAgentIcon(capability: string): string {
  const icons: Record<string, string> = {
    summarize: '📝',
    translate: '🌐',
    'reddit-post': '🔴',
    'twitter-post': '🐦',
    'token-swap': '💱',
    'price-feed': '📊',
    'web-scrape': '🕷️',
    'weather-data': '☀️',
    'send-email': '📧',
    'multi-notify': '🔔',
  };
  return icons[capability] || '🤖';
}

function getAgentDescription(capability: string): string {
  const descriptions: Record<string, string> = {
    summarize: 'Generates concise AI-powered summaries of long text',
    translate: 'Translates text between multiple languages',
    'reddit-post': 'Post to subreddits and read posts - bypasses rate limits',
    'twitter-post': 'Tweet and read timeline with verified API access',
    'token-swap': 'Execute token swaps on DEX with best rates',
    'price-feed': 'Real-time cryptocurrency price data from multiple sources',
    'web-scrape': 'Extract data from websites - bypasses anti-bot protection',
    'weather-data': 'Get weather data for any location worldwide',
    'send-email': 'Send emails via SMTP on behalf of other agents',
    'multi-notify': 'Multi-channel notifications: Slack, Discord, Telegram',
  };
  return descriptions[capability] || 'AI agent service';
}

function getAgentPlaceholder(capability: string): string {
  const placeholders: Record<string, string> = {
    summarize: 'Paste the text you want to summarize here...',
    translate: 'Enter text to translate (JSON format: {"text": "...", "from": "English", "to": "Spanish"})',
    'reddit-post': 'Post to r/cryptocurrency: Check out AgentMart - AI agents on blockchain!',
    'twitter-post': 'Tweet: AgentMart is now live! Hire AI agents and pay with crypto. #Web3 #AI',
    'token-swap': 'Swap 100 USDC for ETH on Uniswap',
    'price-feed': 'Get current price of BTC, ETH, SOL',
    'web-scrape': 'Scrape product prices from https://example.com/products',
    'weather-data': 'Get weather for San Francisco, CA',
    'send-email': 'Email to user@example.com\nSubject: Order Confirmation\nBody: Your order has been confirmed.',
    'multi-notify': 'Send alert to #dev-channel: Deployment complete!',
  };
  return placeholders[capability] || 'Enter your request here...';
}

function getAgentCategory(capability: string): string {
  const categories: Record<string, string> = {
    summarize: 'AI Services',
    translate: 'AI Services',
    'reddit-post': 'Social Media',
    'twitter-post': 'Social Media',
    'token-swap': 'DeFi',
    'price-feed': 'DeFi',
    'web-scrape': 'Data Services',
    'weather-data': 'Data Services',
    'send-email': 'Communication',
    'multi-notify': 'Communication',
  };
  return categories[capability] || 'AI Services';
}

function getAgentColor(capability: string): string {
  const colors: Record<string, string> = {
    summarize: 'from-sky-400 to-blue-500',
    translate: 'from-blue-400 to-indigo-500',
    'reddit-post': 'from-purple-400 to-pink-500',
    'twitter-post': 'from-cyan-400 to-blue-400',
    'token-swap': 'from-emerald-400 to-green-500',
    'price-feed': 'from-green-400 to-emerald-500',
    'web-scrape': 'from-orange-400 to-red-500',
    'weather-data': 'from-yellow-400 to-orange-500',
    'send-email': 'from-pink-400 to-rose-500',
    'multi-notify': 'from-rose-400 to-pink-500',
  };
  return colors[capability] || 'from-gray-400 to-gray-500';
}
