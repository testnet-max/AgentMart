'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { JobEscrowABI } from '@/lib/contracts';

const ESCROW_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

const STATUS_LABELS: Record<number, string> = {
  0: 'Pending',
  1: 'Accepted',
  2: 'Completed',
  3: 'Approved',
  4: 'Rejected',
  5: 'Cancelled',
};

const STATUS_COLORS: Record<number, string> = {
  0: 'bg-yellow-100 text-yellow-800',
  1: 'bg-blue-100 text-blue-800',
  2: 'bg-purple-100 text-purple-800',
  3: 'bg-green-100 text-green-800',
  4: 'bg-red-100 text-red-800',
  5: 'bg-gray-100 text-gray-800',
};

export default function JobsPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: jobIds } = useReadContract({
    address: ESCROW_ADDRESS as `0x${string}`,
    abi: JobEscrowABI,
    functionName: 'getJobsByClient',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { writeContract: approveJob, data: approveTxHash } = useWriteContract();
  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash });

  const handleApprove = (jobId: bigint) => {
    approveJob({
      address: ESCROW_ADDRESS as `0x${string}`,
      abi: JobEscrowABI,
      functionName: 'approveJob',
      args: [jobId],
    });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-[1400px] mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Jobs</h1>
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block">⏳</span>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-[1400px] mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Jobs</h1>
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-3xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Wallet Not Connected
            </h2>
            <p className="text-lg text-gray-800">
              Please connect your wallet to view your jobs
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Jobs</h1>

        {!jobIds || (jobIds as any[]).length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-12 bg-white rounded-3xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                No Jobs Yet
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                You haven&apos;t created any jobs yet. Start by hiring an AI agent!
              </p>
              <a
                href="/"
                className="inline-block bg-gradient-to-br from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg transition-all"
              >
                Browse Agents →
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(jobIds as bigint[])
              .sort((a, b) => Number(b - a)) // Sort descending (newest first)
              .map((jobId) => (
              <JobCard key={jobId.toString()} jobId={jobId} onApprove={handleApprove} refetchTrigger={isApproveSuccess} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function JobCard({ jobId, onApprove, refetchTrigger }: { jobId: bigint; onApprove: (id: bigint) => void; refetchTrigger?: boolean }) {
  const [jobResult, setJobResult] = useState<any>(null);
  const [showFullResult, setShowFullResult] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showApprovalSuccess, setShowApprovalSuccess] = useState(false);

  const { data: job, refetch: refetchJob } = useReadContract({
    address: ESCROW_ADDRESS as `0x${string}`,
    abi: JobEscrowABI,
    functionName: 'getJob',
    args: [jobId],
  });

  // Refetch job data when refetchTrigger changes (after approval)
  useEffect(() => {
    if (refetchTrigger) {
      console.log('🔄 Refetching job data after approval...');
      setIsApproving(false); // Reset loading state
      setShowApprovalSuccess(true); // Show success message
      // Hide success message after 3 seconds
      setTimeout(() => setShowApprovalSuccess(false), 3000);
      // Add a small delay to allow transaction to be mined
      setTimeout(() => {
        refetchJob();
      }, 1000);
    }
  }, [refetchTrigger, refetchJob]);

  // Periodically refetch to catch any status updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetchJob();
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [refetchJob]);

  // Load job result from API when status is completed or approved
  useEffect(() => {
    const loadJobResult = async () => {
      try {
        console.log(`Attempting to load result for job ${jobId}...`);
        const response = await fetch(`/api/job-result/${jobId}`);
        console.log(`Response status: ${response.status}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Job result loaded:', data);
          setJobResult(data);
        } else {
          const error = await response.json();
          console.log('Result not found:', error);
        }
      } catch (error) {
        console.log('Error loading result for job', jobId, error);
      }
    };

    if (job) {
      const statusArray = Array.isArray(job) ? job : [job];
      const status = statusArray[7] || (job as any).status;
      console.log(`Job ${jobId} status:`, Number(status));
      loadJobResult();
    }
  }, [jobId, job]);

  if (!job) return null;

  // Handle both array and object formats
  let amount, taskType, inputDataHash, resultHash, status, statusNum;
  
  try {
    if (Array.isArray(job)) {
      [, , , amount, taskType, inputDataHash, resultHash, status] = job;
    } else {
      // If it's an object, access properties directly
      const jobObj = job as any;
      amount = jobObj.amount || jobObj[3];
      taskType = jobObj.taskType || jobObj[4];
      inputDataHash = jobObj.inputDataHash || jobObj[5];
      resultHash = jobObj.resultHash || jobObj[6];
      status = jobObj.status || jobObj[7];
    }

    if (!amount || !taskType) {
      console.error('Job data structure:', job);
      return null;
    }

    statusNum = Number(status);
  } catch (error) {
    console.error('Error parsing job data:', error, job);
    return null;
  }

  const getStatusColor = (status: number) => {
    switch(status) {
      case 0: return 'from-yellow-400 to-yellow-500'; // Pending
      case 1: return 'from-blue-400 to-blue-500'; // Accepted
      case 2: return 'from-purple-400 to-purple-500'; // Completed
      case 3: return 'from-lime-300 to-lime-400'; // Approved
      case 4: return 'from-red-400 to-red-500'; // Rejected
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg relative hover:shadow-xl transition-all cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm text-gray-500 mb-1">Job #{jobId.toString()}</div>
          <h3 className="text-2xl font-bold text-gray-900 capitalize">{taskType}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${getStatusColor(statusNum)}`}>
            {STATUS_LABELS[statusNum]}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-600 mb-1">Amount</div>
          <div className="text-lg font-bold text-gray-900">{(Number(amount) / 1e18).toFixed(2)} MNEE</div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-600 mb-1">Status</div>
          <div className="text-lg font-bold text-gray-900">{STATUS_LABELS[statusNum]}</div>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3 mb-4 border-t pt-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="text-sm text-gray-600 mb-2">Input Data</div>
            <div className="font-mono text-xs text-gray-700 break-all max-h-32 overflow-y-auto">
              {inputDataHash}
            </div>
          </div>
        
          {resultHash && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-sm text-gray-600 mb-2">Result Hash</div>
              <div className="font-mono text-xs text-gray-700 break-all">
                {resultHash}
              </div>
            </div>
          )}

          {/* Show loading state for completed jobs */}
          {!jobResult && (statusNum === 2 || statusNum === 3) && (
            <div className="bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-200 text-center">
              <div className="text-sm font-semibold text-yellow-800 mb-1">⏳ Processing Result</div>
              <div className="text-xs text-yellow-600">
                Agent is working on this job. Result will appear here when complete.
              </div>
            </div>
          )}

          {/* Show actual result if available */}
          {jobResult && (statusNum === 2 || statusNum === 3) && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-gray-900">✨ AI Result</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullResult(!showFullResult);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showFullResult ? 'Show Less' : 'Show Full Result'}
                </button>
              </div>
              <div className={`text-sm text-gray-800 whitespace-pre-wrap ${showFullResult ? 'max-h-96 overflow-y-auto' : 'max-h-20 overflow-hidden'}`}>
                {jobResult.result}
              </div>
              {jobResult.timestamp && (
                <div className="text-xs text-gray-500 mt-2">
                  Completed: {new Date(jobResult.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {statusNum === 2 && (
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsApproving(true);
                  onApprove(jobId);
                  // Reset loading state after a delay
                  setTimeout(() => setIsApproving(false), 5000);
                }}
                disabled={isApproving}
                className="flex-1 bg-gradient-to-br from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 rounded-2xl font-semibold shadow-lg transition-all disabled:shadow-none disabled:cursor-not-allowed"
              >
                {isApproving ? '⏳ Processing...' : '✓ Approve & Pay'}
              </button>
              <button 
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white py-3 rounded-2xl font-semibold shadow-lg transition-all"
              >
                ✕ Reject
              </button>
            </div>
          )}

          {/* Approval Success Message */}
          {showApprovalSuccess && (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center animate-pulse">
              <div className="text-green-700 font-semibold">✅ Approval Successful!</div>
              <div className="text-xs text-green-600 mt-1">Updating job status...</div>
            </div>
          )}

          {statusNum === 3 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
              <div className="text-green-700 font-semibold">✅ Payment Released</div>
              <div className="text-xs text-green-600 mt-1">This job has been approved and paid</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

