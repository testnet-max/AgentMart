'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { MockMNEEABI, JobEscrowABI } from '@/lib/contracts';

const MNEE_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const ESCROW_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

export type AgentExecutionStatus = 'idle' | 'approving' | 'creating' | 'executing' | 'completed' | 'failed';

export function useAgentExecution() {
  const [status, setStatus] = useState<AgentExecutionStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const { writeContract: approveToken, data: approveHash } = useWriteContract();
  const { writeContract: createJob, data: createHash } = useWriteContract();

  const { isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isCreating } = useWaitForTransactionReceipt({ hash: createHash });

  const executeAgent = async (
    agentAddress: string,
    capability: string,
    price: string,
    input: string
  ): Promise<boolean> => {
    try {
      setError(null);
      
      // Step 1: Approve MNEE spending
      setStatus('approving');
      await approveToken({
        address: MNEE_ADDRESS as `0x${string}`,
        abi: MockMNEEABI,
        functionName: 'approve',
        args: [ESCROW_ADDRESS, parseEther(price)],
      });

      // Wait for approval
      while (isApproving) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Step 2: Create job
      setStatus('creating');
      await createJob({
        address: ESCROW_ADDRESS as `0x${string}`,
        abi: JobEscrowABI,
        functionName: 'createJob',
        args: [agentAddress, parseEther(price), capability, input],
      });

      // Wait for job creation
      while (isCreating) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setStatus('executing');
      
      // For demo purposes, we'll simulate the agent execution
      // In production, you would poll the smart contract or listen to events
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setStatus('completed');
      return true;

    } catch (err: any) {
      console.error('Agent execution error:', err);
      setError(err.message || 'Failed to execute agent');
      setStatus('failed');
      return false;
    }
  };

  const reset = () => {
    setStatus('idle');
    setError(null);
  };

  return {
    executeAgent,
    status,
    error,
    isProcessing: status === 'approving' || status === 'creating' || status === 'executing',
    reset,
  };
}

