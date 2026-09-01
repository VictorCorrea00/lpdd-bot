import { createSupabaseAdmin } from "@/lib/supabase";
import { TerminalSquare, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const revalidate = 0;

export default async function LogsPage() {
  const supabase = createSupabaseAdmin();
  
  const { data: logs, error } = await supabase
    .from("telegram_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const getCommandColor = (command: string) => {
    switch (command) {
      case '/start': return "border-emerald-500/30 text-emerald-400 bg-emerald-500/10";
      case '/help': return "border-cyan-500/30 text-cyan-400 bg-cyan-500/10";
      case '/save': return "border-amber-500/30 text-amber-400 bg-amber-500/10";
      case '/search': return "border-purple-500/30 text-purple-400 bg-purple-500/10";
      default: return "border-zinc-700 text-zinc-300 bg-zinc-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <TerminalSquare className="w-6 h-6 text-amber-500" />
          Registros del Sistema
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Historial de interacciones con el bot de Telegram.</p>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="text-red-500 font-medium">Error al cargar logs</h3>
            <p className="text-red-400/80 text-sm mt-1">{error.message}</p>
          </div>
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900">
          <Table>
            <TableHeader className="bg-zinc-950">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400 w-32">Comando</TableHead>
                <TableHead className="text-zinc-400">Payload</TableHead>
                <TableHead className="text-zinc-400">Respuesta</TableHead>
                <TableHead className="text-zinc-400 text-right w-48">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!logs || logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                    No hay registros disponibles.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
                    <TableCell>
                      <Badge variant="outline" className={`font-mono ${getCommandColor(log.command)}`}>
                        {log.command || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-zinc-300 font-mono text-sm">
                      {log.payload || '-'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-zinc-400 text-sm">
                      {log.response_summary || '-'}
                    </TableCell>
                    <TableCell className="text-right text-zinc-500 text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
