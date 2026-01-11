import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { agentFunctions } from '@/lib/agentFunctions';
import { SYSTEM_PROMPT } from '@/lib/systemPrompt';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Add system prompt if not present
    const messagesWithSystem = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.filter((m: any) => m.role !== 'system')
    ];

    // Call OpenAI with function calling (tools format for OpenAI v4+)
    const tools = agentFunctions.map(fn => ({
      type: 'function' as const,
      function: fn,
    }));

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messagesWithSystem,
      tools: tools,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseMessage = response.choices[0].message;

    // Check if the model wants to call a function
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCall = responseMessage.tool_calls[0];
      return NextResponse.json({
        message: responseMessage.content || '',
        functionCall: {
          name: toolCall.function.name,
          arguments: JSON.parse(toolCall.function.arguments),
        },
      });
    }

    // No function call, just return the message
    return NextResponse.json({
      message: responseMessage.content,
      functionCall: null,
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat' },
      { status: 500 }
    );
  }
}

