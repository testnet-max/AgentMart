'use client';

import Link from 'next/link';

interface AgentCardProps {
  name: string;
  address: string;
  capability: string;
  price: string;
  description: string;
  icon: string;
}

export function AgentCard({ name, address, capability, price, description, icon }: AgentCardProps) {
  const getCardColor = () => {
    if (capability === 'summarize') return 'from-sky-400 to-blue-500';
    if (capability === 'translate') return 'from-purple-400 to-pink-500';
    return 'from-cyan-400 to-teal-500';
  };

  return (
    <Link
      href={`/hire/${capability}`}
      className={`block bg-gradient-to-br ${getCardColor()} rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg hover:scale-[1.02] transition-all group relative overflow-hidden`}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="text-5xl sm:text-6xl">{icon}</div>
          <div className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white">
            ACTIVE
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          {name}
        </h3>
        <p className="text-white/90 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">{description}</p>

        <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs sm:text-sm">Price per Job</span>
            <span className="text-white font-bold text-lg sm:text-2xl">{price} MNEE</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-white/70 text-[10px] sm:text-xs font-mono truncate pr-2 sm:pr-4">
            {address.slice(0, 10)}...{address.slice(-8)}
          </div>
          <div className="w-8 sm:w-10 h-8 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all flex-shrink-0">
            <span className="text-white text-lg sm:text-xl">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

