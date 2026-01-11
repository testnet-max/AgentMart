import { NextRequest, NextResponse } from 'next/server';
import { dbOperations, AgentHistoryRecord } from '@/lib/db';

// GET /api/history?wallet=0x... - Get agent history for a wallet
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const history = dbOperations.getAgentHistory(wallet, limit, offset);
    const count = dbOperations.getAgentHistoryCount(wallet);
    const stats = dbOperations.getAgentHistoryStats(wallet);

    // Parse JSON strings back to objects
    const parsedHistory = history.map(record => ({
      id: record.id,
      agentName: record.agent_name,
      capability: record.capability,
      status: record.status,
      cost: record.cost,
      input: JSON.parse(record.input_data),
      output: record.output_data ? JSON.parse(record.output_data) : null,
      summary: record.summary,
      executionTime: record.execution_time,
      timestamp: new Date(record.created_at * 1000),
    }));

    return NextResponse.json({
      history: parsedHistory,
      count,
      stats,
    });

  } catch (error: any) {
    console.error('Get history error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get history' },
      { status: 500 }
    );
  }
}

// POST /api/history - Create or update agent history
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, data } = body;

    if (action === 'create') {
      const { id, walletAddress, agentName, capability, status, cost, input, output, summary, executionTime } = data;

      if (!id || !walletAddress || !agentName || !status || !cost || !input) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      dbOperations.createAgentHistory({
        id,
        walletAddress,
        agentName,
        capability: capability || agentName.toLowerCase().replace(/\s+/g, '-'),
        status,
        cost,
        inputData: input,
        outputData: output,
        summary,
        executionTime,
      });

      return NextResponse.json({ success: true, id });

    } else if (action === 'update') {
      const { id, status, output, summary, executionTime } = data;

      if (!id) {
        return NextResponse.json(
          { error: 'ID required for update' },
          { status: 400 }
        );
      }

      dbOperations.updateAgentHistory(id, {
        status,
        outputData: output,
        summary,
        executionTime,
      });

      return NextResponse.json({ success: true, id });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "create" or "update"' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Post history error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save history' },
      { status: 500 }
    );
  }
}

