import { HelpCircle, Users, Sparkles, Plus, DollarSign, TrendingUp } from "lucide-react";

export default function DashboardHome() {
  return (
    <div className="flex flex-col min-h-full pb-8">
      {/* Header */}
      <header className="flex justify-between items-center p-4 pt-6">
        <div className="flex items-center gap-2">
          {/* Logo Sharkbot */}
          <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
            <svg className="w-5 h-5 text-[#00a8ff]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-wider text-white">
            SHARK<span className="text-[#00a8ff]">BOT</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-900/50 rounded-full px-4 py-2 border border-zinc-800">
          <HelpCircle className="w-5 h-5 text-zinc-400" />
          <Users className="w-5 h-5 text-zinc-400" />
          <Sparkles className="w-5 h-5 text-zinc-400" />
        </div>
      </header>



      {/* Time Filters */}
      <div className="px-4 mb-6">
        <div className="flex bg-zinc-900/40 rounded-xl p-1 border border-zinc-800/50">
          {['Hoje', 'Ontem', '7d', '30d', 'Total'].map((filter, i) => (
            <button 
              key={filter}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                i === 0 ? 'bg-[#0f0f0f] text-white shadow-sm border border-zinc-800' : 'text-zinc-500'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Sales Card */}
      <div className="px-4 space-y-4">
        <div className="bg-[#0f0f0f] border border-zinc-800/60 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-zinc-300 font-medium text-sm">Vendas Aprovadas</span>
          </div>
          
          <div className="mb-4">
            <h2 className="text-4xl font-bold text-white">R$ 0,00</h2>
          </div>
          
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#00a8ff] w-0"></div>
          </div>
          <div className="flex justify-end mt-2">
            <span className="text-[10px] text-zinc-500 font-mono">0% Aprov.</span>
          </div>
        </div>

        {/* Conversion Card */}
        <div className="bg-[#0f0f0f] border border-zinc-800/60 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-zinc-300 font-medium text-sm">Taxa de Conversão</span>
          </div>
        </div>
      </div>
    </div>
  );
}
