export const agentFunctions = [
  {
    name: "call_summarizer",
    description: "Generate a concise summary of long text using AI. Cost: 0.02 MNEE",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "The text to summarize"
        }
      },
      required: ["text"]
    }
  },
  {
    name: "call_translator",
    description: "Translate text between languages. Cost: 0.03 MNEE",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "The text to translate"
        },
        from: {
          type: "string",
          description: "Source language (e.g., 'English', 'Spanish', 'French')"
        },
        to: {
          type: "string",
          description: "Target language (e.g., 'English', 'Spanish', 'French')"
        }
      },
      required: ["text", "from", "to"]
    }
  },
  {
    name: "call_reddit_agent",
    description: "Post content to a subreddit or read Reddit posts. Cost: 0.04 MNEE",
    parameters: {
      type: "object",
      properties: {
        subreddit: {
          type: "string",
          description: "The subreddit name (without r/ prefix, e.g., 'cryptocurrency')"
        },
        content: {
          type: "string",
          description: "The content to post"
        }
      },
      required: ["subreddit", "content"]
    }
  },
  {
    name: "call_twitter_agent",
    description: "Post a tweet to Twitter. Cost: 0.05 MNEE",
    parameters: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The tweet content (max 280 characters)"
        }
      },
      required: ["content"]
    }
  },
  {
    name: "call_swap_agent",
    description: "Execute a token swap on a decentralized exchange. Cost: 0.1 MNEE (requires user confirmation)",
    parameters: {
      type: "object",
      properties: {
        amount: {
          type: "number",
          description: "Amount of tokens to swap"
        },
        from_token: {
          type: "string",
          description: "Token to swap from (e.g., 'USDC', 'ETH', 'BTC')"
        },
        to_token: {
          type: "string",
          description: "Token to swap to (e.g., 'USDC', 'ETH', 'BTC')"
        }
      },
      required: ["amount", "from_token", "to_token"]
    }
  },
  {
    name: "call_price_oracle",
    description: "Get real-time cryptocurrency prices. Cost: 0.01 MNEE",
    parameters: {
      type: "object",
      properties: {
        tokens: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Array of token symbols (e.g., ['BTC', 'ETH', 'SOL'])"
        }
      },
      required: ["tokens"]
    }
  },
  {
    name: "call_web_scraper",
    description: "Extract data from a website. Cost: 0.06 MNEE",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL to scrape"
        }
      },
      required: ["url"]
    }
  },
  {
    name: "call_weather_agent",
    description: "Get weather data for a specific location. Cost: 0.02 MNEE",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "City and state/country (e.g., 'San Francisco, CA' or 'Tokyo, Japan')"
        }
      },
      required: ["location"]
    }
  },
  {
    name: "call_email_agent",
    description: "Send an email. Cost: 0.03 MNEE",
    parameters: {
      type: "object",
      properties: {
        to: {
          type: "string",
          description: "Recipient email address"
        },
        subject: {
          type: "string",
          description: "Email subject"
        },
        body: {
          type: "string",
          description: "Email body content"
        }
      },
      required: ["to", "subject", "body"]
    }
  },
  {
    name: "call_notification_agent",
    description: "Send multi-channel notifications (Slack, Discord, Telegram). Cost: 0.04 MNEE",
    parameters: {
      type: "object",
      properties: {
        channel: {
          type: "string",
          description: "Channel name (e.g., '#dev-channel', '#alerts')"
        },
        message: {
          type: "string",
          description: "Notification message"
        }
      },
      required: ["channel", "message"]
    }
  }
];

export const agentPrices: Record<string, number> = {
  call_summarizer: 0.02,
  call_translator: 0.03,
  call_reddit_agent: 0.04,
  call_twitter_agent: 0.05,
  call_swap_agent: 0.1,
  call_price_oracle: 0.01,
  call_web_scraper: 0.06,
  call_weather_agent: 0.02,
  call_email_agent: 0.03,
  call_notification_agent: 0.04,
};

export const agentCapabilityMap: Record<string, string> = {
  call_summarizer: "summarize",
  call_translator: "translate",
  call_reddit_agent: "reddit-post",
  call_twitter_agent: "twitter-post",
  call_swap_agent: "token-swap",
  call_price_oracle: "price-feed",
  call_web_scraper: "web-scrape",
  call_weather_agent: "weather-data",
  call_email_agent: "send-email",
  call_notification_agent: "multi-notify",
};

export const AUTO_APPROVE_THRESHOLD = 0.05;

export function shouldAutoApprove(agentPrice: number): boolean {
  return agentPrice < AUTO_APPROVE_THRESHOLD;
}

