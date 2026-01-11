import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { agentName, input, output } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Generate a concise summary of the agent execution
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a concise summarizer. Given an AI agent's execution details, create a brief 1-2 sentence summary that explains what was done and the key result. Be specific and actionable. Keep it under 100 characters when possible.`
        },
        {
          role: 'user',
          content: `Agent: ${agentName}\nInput: ${JSON.stringify(input)}\nOutput: ${JSON.stringify(output)}\n\nProvide a brief, effective summary of what this agent accomplished.`
        }
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const summary = response.choices[0].message.content?.trim() || 'Execution completed successfully';

    return NextResponse.json({ summary });

  } catch (error: any) {
    console.error('Summarize API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

