import { createSupabaseAdmin } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, FileText, TerminalSquare, Activity, Zap } from "lucide-react";

export const revalidate = 0; // Dynamic server component

export default async function DashboardPage() {
  const supabase = createSupabaseAdmin();
  
  // Fetch links count
  const { count: linkCount } = await supabase
    .from("content_vault")
    .select("*", { count: "exact", head: true })
    .eq("type", "link");

  // Fetch texts count
  const { count: textCount } = await supabase
    .from("content_vault")
    .select("*", { count: "exact", head: true })
    .eq("type", "text");

  // Fetch today's commands
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: commandsCount } = await supabase
    .from("telegram_logs")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  // Fetch recent activity
  const { data: recentActivity } = await supabase
    .from("telegram_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch categories stats
  const { data: vaultItems } = await supabase
    .from("content_vault")
    .select("category");
    
  const categoriesMap = (vaultItems || []).reduce((acc, item) => {
    const cat = item.category || "General";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoriesMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          <Zap className="w-8 h-8 text-emerald-500" />
          Terminal Principal
        </h1>
        <p className="text-zinc-400 mt-2">Visión general del sistema Sharkbot.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total de Enlaces</CardTitle>
            <Link2 className="w-4 h-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{linkCount || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Textos Guardados</CardTitle>
            <FileText className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{textCount || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Comandos Hoy</CardTitle>
            <TerminalSquare className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{commandsCount || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Estado del Sistema</CardTitle>
            <Activity className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              <Badge variant="outline" className="border-emerald-500 text-emerald-500 bg-emerald-500/10">
                Operativo
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-100">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((log) => (
                  <div key={log.id} className="flex items-center justify-between border-b border-zinc-800/50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                          {log.command || "N/A"}
                        </Badge>
                        <span className="text-sm text-zinc-400 truncate max-w-[200px]">
                          {log.payload || "Sin payload"}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-zinc-500 text-center py-4">No hay actividad reciente</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-100">Categorías Principales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.length > 0 ? (
                topCategories.map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-300">{category}</span>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                      {count} items
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-sm text-zinc-500 text-center py-4">Sin datos de categorías</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
