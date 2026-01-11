'use client';

interface PaymentConfirmModalProps {
  isOpen: boolean;
  agentName: string;
  cost: string;
  balance: string;
  input: any;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}

export function PaymentConfirmModal({
  isOpen,
  agentName,
  cost,
  balance,
  input,
  onApprove,
  onReject,
  isProcessing,
}: PaymentConfirmModalProps) {
  if (!isOpen) return null;

  const balanceNum = parseFloat(balance);
  const costNum = parseFloat(cost);
  const hasEnoughBalance = balanceNum >= costNum;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-400 to-red-500 p-6 text-white">
          <div className="text-4xl mb-2">⚠️</div>
          <h2 className="text-2xl font-bold mb-1">Confirm Agent Call</h2>
          <p className="text-white/90 text-sm">This requires payment approval</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Agent Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-1">Agent</div>
            <div className="text-lg font-bold text-gray-900">{agentName}</div>
          </div>

          {/* Cost Info */}
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Cost</span>
              <span className="text-2xl font-bold text-gray-900">{cost} MNEE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Your Balance</span>
              <span className={`text-sm font-semibold ${hasEnoughBalance ? 'text-green-600' : 'text-red-600'}`}>
                {balance} MNEE
              </span>
            </div>
            {!hasEnoughBalance && (
              <div className="mt-2 text-xs text-red-600 bg-red-50 rounded p-2">
                ⚠️ Insufficient balance. Please visit the faucet to get more MNEE tokens.
              </div>
            )}
          </div>

          {/* Input Preview */}
          <div>
            <div className="text-sm text-gray-600 mb-2">Task Details:</div>
            <div className="bg-gray-50 rounded-xl p-3 max-h-32 overflow-y-auto">
              <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap break-words">
                {JSON.stringify(input, null, 2)}
              </pre>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <div className="text-xs text-yellow-800">
              <strong>Note:</strong> This will create a smart contract transaction. MNEE tokens will be held in escrow until you approve the results.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onReject}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-900 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onApprove}
            disabled={isProcessing || !hasEnoughBalance}
            className="flex-1 px-6 py-3 bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Approve & Pay'}
          </button>
        </div>
      </div>
    </div>
  );
}

