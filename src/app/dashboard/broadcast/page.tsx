"use client";

import { useState, useEffect } from "react";
import { Send, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function BroadcastPage() {
  const [message, setMessage] = useState("");
  const [parseMode, setParseMode] = useState("HTML");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/broadcast');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, parse_mode: parseMode })
      });
      
      if (res.ok) {
        setMessage("");
        fetchHistory();
        alert("Mensaje enviado con éxito");
      } else {
        alert("Error al enviar mensaje");
      }
    } catch (error) {
      console.error("Error sending broadcast:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Transmisión Cifrada</h1>
        <p className="text-zinc-400 text-sm">Envía mensajes directamente a tu Telegram personal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-500" />
              Consola de Envío
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Soporta formato nativo de Telegram.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-zinc-300">Formato (Parse Mode)</label>
              <Select value={parseMode} onValueChange={setParseMode}>
                <SelectTrigger className="w-[180px] bg-zinc-950 border-zinc-800 text-zinc-100">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                  <SelectItem value="HTML">HTML</SelectItem>
                  <SelectItem value="MarkdownV2">MarkdownV2</SelectItem>
                  <SelectItem value="None">Texto Plano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe el mensaje a enviar..."
              className="min-h-[200px] bg-zinc-950 border-zinc-800 text-zinc-100 font-mono resize-none focus-visible:ring-emerald-500"
            />
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSend} 
                disabled={loading || !message.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {loading ? 'Transmitiendo...' : 'Enviar a mi Telegram'}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Previsualización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 min-h-[250px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
              {message ? (
                <div 
                  className="text-sm text-zinc-300 whitespace-pre-wrap break-words mt-2"
                  style={{ fontFamily: parseMode === 'HTML' ? 'sans-serif' : 'monospace' }}
                >
                  {message}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-600 text-sm mt-8">
                  El mensaje aparecerá aquí...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Historial de Transmisiones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-lg border border-zinc-800/50 bg-zinc-950/50">
                  <div className="flex flex-col gap-1 mb-2 md:mb-0">
                    <span className="text-sm text-zinc-300 font-mono truncate max-w-2xl">
                      {item.message}
                    </span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500 bg-transparent">
                        {item.parse_mode || 'N/A'}
                      </Badge>
                      {item.status === 'success' ? (
                        <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-500 bg-emerald-500/10">Enviado</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs border-red-500/30 text-red-500 bg-red-500/10">Error</Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-zinc-500 text-sm">
                No hay historial de transmisiones
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
