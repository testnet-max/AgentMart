import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    
    // Path to agent results (go up from frontend to root)
    const resultsPath = path.join(process.cwd(), '..', 'agent-results', `job-${jobId}.json`);
    
    // Check if file exists
    if (!fs.existsSync(resultsPath)) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      );
    }

    // Read and parse the result file
    const resultData = fs.readFileSync(resultsPath, 'utf-8');
    const result = JSON.parse(resultData);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error reading job result:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to read result' },
      { status: 500 }
    );
  }
}

