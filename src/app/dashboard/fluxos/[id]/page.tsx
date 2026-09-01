"use client";

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  BackgroundVariant,
  Connection,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Save, Play, MessageSquare, CreditCard, Clock, Settings, Copy } from 'lucide-react';

const initialNodes = [
  { 
    id: '1', 
    position: { x: 250, y: 50 }, 
    data: { label: '🔥 Gatilho: /start' }, 
    type: 'input',
    style: { background: '#0a0a0a', color: '#fff', border: '1px solid #00a8ff', borderRadius: '12px', padding: '15px', fontWeight: 'bold' }
  },
  { 
    id: '2', 
    position: { x: 250, y: 180 }, 
    data: { label: '💬 Copy de Ventas' },
    style: { background: '#0a0a0a', color: '#fff', border: '1px solid #333', borderRadius: '12px', padding: '15px' }
  },
  { 
    id: '3', 
    position: { x: 250, y: 310 }, 
    data: { label: '💳 Checkout (Wise)' },
    style: { background: '#00a8ff', color: '#000', border: 'none', borderRadius: '12px', padding: '15px', fontWeight: 'bold' }
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#00a8ff', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#00a8ff', strokeWidth: 2 } },
];

export default function FlowBuilderPage({ params }: { params: { id: string } }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Connection | Edge) => {
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#00a8ff', strokeWidth: 2 } }, eds));
  }, [setEdges]);

  return (
    <div className="flex flex-col h-screen w-full bg-[#050505] text-zinc-100 absolute top-0 left-0 z-50">
      
      {/* Builder Top Bar */}
      <header className="h-16 bg-[#0a0a0a] border-b border-zinc-900 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/fluxos" className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-4 h-4 text-zinc-400" />
          </Link>
          <div>
            <h1 className="font-bold text-white">Embudo VIP Automático</h1>
            <p className="text-xs text-zinc-500">ID: {params.id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Play className="w-4 h-4 text-emerald-500" />
            Testar
          </button>
          <button className="flex items-center gap-2 bg-[#00a8ff] hover:bg-blue-400 text-black px-4 py-2 rounded-xl text-sm font-bold transition-colors">
            <Save className="w-4 h-4" />
            Salvar Fluxo
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <div className="flex-1 flex">
        
        {/* Left Sidebar (Tools) */}
        <aside className="w-64 bg-[#0a0a0a] border-r border-zinc-900 p-4 flex flex-col gap-3">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Adicionar Nodos</p>
          
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-xl p-3 flex items-center gap-3 cursor-grab hover:border-zinc-700 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-[#00a8ff]" />
            </div>
            <span className="text-sm font-medium">Mensaje</span>
          </div>

          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-xl p-3 flex items-center gap-3 cursor-grab hover:border-zinc-700 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-sm font-medium">Esperar (Delay)</span>
          </div>

          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-xl p-3 flex items-center gap-3 cursor-grab hover:border-zinc-700 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-sm font-medium">Checkout / Pago</span>
          </div>
          
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-xl p-3 flex items-center gap-3 cursor-grab hover:border-zinc-700 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-orange-500" />
            </div>
            <span className="text-sm font-medium">Condición Lógica</span>
          </div>
        </aside>

        {/* Drag and Drop Canvas */}
        <main className="flex-1 relative bg-[#050505]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            className="dark"
            colorMode="dark"
          >
            <Background color="#333" gap={16} variant={BackgroundVariant.Dots} />
            <Controls style={{ backgroundColor: '#0a0a0a', border: '1px solid #333', fill: '#fff' }} />
          </ReactFlow>
        </main>

      </div>
    </div>
  );
}
