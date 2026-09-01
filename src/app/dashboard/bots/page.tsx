"use client";

import { useState, useEffect } from "react";
import { HelpCircle, Users, Sparkles, Bot, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function BotsPage() {
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [token, setToken] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  const fetchBots = async () => {
    try {
      const res = await fetch('/api/bots');
      if (res.ok) {
        const data = await res.json();
        setBots(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const handleConnect = async () => {
    if (!token.trim()) return;
    setConnecting(true);
    setError("");

    try {
      const res = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setToken("");
        setIsDialogOpen(false);
        fetchBots(); // Refresh list
      } else {
        setError(data.error || "Erro ao conectar bot");
      }
    } catch (e) {
      setError("Erro de rede");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-8">
      {/* Header */}
      <header className="flex justify-between items-center p-4 pt-6">
        <div className="flex items-center gap-2">
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

      {/* Title section */}
      <div className="px-4 mt-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Meus Robôs</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-0.5 h-4 bg-zinc-800"></div>
            <p className="text-zinc-500 text-sm">Gerencie seus bots do Telegram</p>
          </div>
        </div>
        
        {bots.length > 0 && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="w-10 h-10 flex items-center justify-center bg-[#0f0f0f] border border-zinc-800 rounded-full text-[#00a8ff]">
                <Plus className="w-5 h-5" />
              </button>
            </DialogTrigger>
            <ConnectBotDialog 
              token={token} 
              setToken={setToken} 
              connecting={connecting} 
              handleConnect={handleConnect} 
              error={error} 
            />
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center mt-20">
          <Loader2 className="w-8 h-8 text-[#00a8ff] animate-spin" />
        </div>
      ) : bots.length === 0 ? (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center mt-20 px-6 text-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-[#0a0a0a] border border-zinc-800/80 rounded-3xl flex items-center justify-center shadow-lg relative z-10">
              <Bot className="w-10 h-10 text-zinc-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#00a8ff] rounded-full border-2 border-[#050505] z-20"></div>
          </div>

          <h2 className="text-xl font-bold text-white mb-3">Nenhum bot conectado</h2>
          <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
            Conecte seu bot do Telegram para começar a automatizar suas vendas com pagamentos PIX.
          </p>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="w-full flex items-center justify-center gap-2 bg-[#0f0f0f] border border-zinc-800 hover:bg-zinc-900 transition-colors text-white py-4 rounded-2xl font-medium">
                <Plus className="w-5 h-5" />
                Conectar Primeiro Bot
              </button>
            </DialogTrigger>
            <ConnectBotDialog 
              token={token} 
              setToken={setToken} 
              connecting={connecting} 
              handleConnect={handleConnect} 
              error={error} 
            />
          </Dialog>

          <p className="text-zinc-600 text-xs mt-6">
            0/50 bots utilizados
          </p>
        </div>
      ) : (
        /* Bot List */
        <div className="px-4 mt-8 space-y-4">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Robôs Ativos</p>
          {bots.map((bot) => (
            <div key={bot.id} className="bg-[#0f0f0f] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-[#00a8ff]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{bot.name}</h3>
                  <p className="text-zinc-500 text-sm">@{bot.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs text-zinc-400">Online</span>
              </div>
            </div>
          ))}
          <p className="text-zinc-600 text-xs text-center mt-6">
            {bots.length}/50 bots utilizados
          </p>
        </div>
      )}
    </div>
  );
}

// Reusable Dialog Content component
function ConnectBotDialog({ token, setToken, connecting, handleConnect, error }: any) {
  return (
    <DialogContent className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 sm:max-w-md p-6">
      <DialogHeader>
        <DialogTitle className="text-xl">Conectar novo Robô</DialogTitle>
      </DialogHeader>
      <div className="py-4 space-y-4">
        <p className="text-sm text-zinc-400">
          Abra o <strong>@BotFather</strong> no Telegram, crie um novo bot com <code className="text-[#00a8ff] bg-blue-500/10 px-1 py-0.5 rounded">/newbot</code> e cole o Token de Acesso HTTP abaixo:
        </p>
        <div className="space-y-2">
          <Input 
            placeholder="Ex: 1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="bg-[#0f0f0f] border-zinc-800 h-12 text-white font-mono placeholder:text-zinc-700 focus-visible:ring-[#00a8ff]"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
      </div>
      <button 
        onClick={handleConnect}
        disabled={connecting || !token}
        className="w-full flex items-center justify-center gap-2 bg-[#00a8ff] hover:bg-blue-400 disabled:opacity-50 disabled:hover:bg-[#00a8ff] transition-colors text-black font-bold py-3 rounded-xl"
      >
        {connecting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Verificar e Conectar
          </>
        )}
      </button>
    </DialogContent>
  );
}
