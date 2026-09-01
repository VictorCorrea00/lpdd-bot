"use client";

import { useState, useEffect } from "react";
import { HelpCircle, Users, Sparkles, Upload, Plus, Link as LinkIcon, Zap, Box, Brain, Loader2, GitBranch } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function FluxosPage() {
  const [flows, setFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFlow, setNewFlow] = useState({ name: "", trigger: "" });
  const [saving, setSaving] = useState(false);

  const fetchFlows = async () => {
    try {
      const res = await fetch('/api/flows');
      if (res.ok) {
        const data = await res.json();
        setFlows(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlows();
  }, []);

  const handleCreate = async () => {
    if (!newFlow.name) return;
    setSaving(true);
    try {
      const res = await fetch('/api/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFlow.name, trigger_keyword: newFlow.trigger })
      });
      if (res.ok) {
        setNewFlow({ name: "", trigger: "" });
        setIsDialogOpen(false);
        fetchFlows();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
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
      <div className="px-4 mt-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Meus Fluxos</h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-0.5 h-4 bg-zinc-800"></div>
          <p className="text-zinc-500 text-sm">Gerencie seus fluxos de automação e chatbots</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 flex gap-3 mb-8">
        <button className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#0f0f0f] border border-zinc-800 rounded-xl text-zinc-400">
          <Upload className="w-5 h-5" />
        </button>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex-1 flex items-center justify-center gap-2 bg-[#0f0f0f] border border-zinc-800 text-white rounded-xl font-medium text-sm hover:bg-zinc-900 transition-colors">
              <Plus className="w-4 h-4" />
              Criar Fluxo ({flows.length}/50)
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 sm:max-w-md p-6">
            <DialogHeader>
              <DialogTitle className="text-xl">Novo Fluxo de Automação</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Nome do Fluxo</label>
                <Input 
                  placeholder="Ex: Funil de Vendas VIP"
                  value={newFlow.name}
                  onChange={(e) => setNewFlow({ ...newFlow, name: e.target.value })}
                  className="bg-[#0f0f0f] border-zinc-800 h-12 text-white placeholder:text-zinc-700 focus-visible:ring-[#00a8ff]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Palavra-chave Gatilho (Opcional)</label>
                <Input 
                  placeholder="Ex: comprar, /promo"
                  value={newFlow.trigger}
                  onChange={(e) => setNewFlow({ ...newFlow, trigger: e.target.value })}
                  className="bg-[#0f0f0f] border-zinc-800 h-12 text-white font-mono placeholder:text-zinc-700 focus-visible:ring-[#00a8ff]"
                />
              </div>
            </div>
            <button 
              onClick={handleCreate}
              disabled={saving || !newFlow.name}
              className="w-full flex items-center justify-center gap-2 bg-[#00a8ff] hover:bg-blue-400 disabled:opacity-50 transition-colors text-black font-bold py-3 rounded-xl"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Fluxo'}
            </button>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center mt-10">
          <Loader2 className="w-8 h-8 text-[#00a8ff] animate-spin" />
        </div>
      ) : flows.length > 0 ? (
        <div className="px-4 space-y-4">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Seus Fluxos Ativos</p>
          {flows.map((flow) => (
            <div key={flow.id} className="bg-[#0f0f0f] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-[#00a8ff]" />
                </div>
                <div>
                  <h3 className="text-white font-bold">{flow.name}</h3>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    Gatilho: {flow.trigger_keyword ? <span className="text-[#00a8ff] font-mono">{flow.trigger_keyword}</span> : 'Nenhum'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`flex h-2 w-2 rounded-full ${flow.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Flow Categories (Empty State Defaults) */
        <div className="px-4 space-y-3">
          {/* Vinculados */}
          <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-center h-24">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mt-1">
                <LinkIcon className="w-5 h-5 text-[#00a8ff]" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold tracking-wider mb-1">VINCULADOS</p>
                <h2 className="text-2xl font-bold text-white">0</h2>
              </div>
            </div>
          </div>

          {/* Básicos */}
          <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-center h-24">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mt-1">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold tracking-wider mb-1">BÁSICOS</p>
                <h2 className="text-2xl font-bold text-white">0</h2>
              </div>
            </div>
          </div>

          {/* Fluxos NBN */}
          <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-center h-24">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mt-1">
                <Box className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold tracking-wider mb-1">FLUXOS NBN</p>
                <h2 className="text-2xl font-bold text-white">0</h2>
              </div>
            </div>
          </div>

          {/* Modo IA */}
          <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-center h-24 opacity-50">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mt-1">
                <Brain className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold tracking-wider mb-1">MODO IA</p>
                <h2 className="text-2xl font-bold text-white">0</h2>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
