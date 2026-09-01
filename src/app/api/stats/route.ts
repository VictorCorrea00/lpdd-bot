import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseAdmin();

    const vaultPromise = supabase
      .from('content_vault')
      .select('type, category');

    const logsPromise = supabase
      .from('telegram_logs')
      .select('*', { count: 'exact' });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayLogsPromise = supabase
      .from('telegram_logs')
      .select('id', { count: 'exact' })
      .gte('created_at', startOfToday.toISOString());

    const broadcastPromise = supabase
      .from('broadcast_messages')
      .select('id', { count: 'exact' });

    const recentLogsPromise = supabase
      .from('telegram_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    const [
      vaultRes,
      logsRes,
      todayLogsRes,
      broadcastRes,
      recentLogsRes
    ] = await Promise.all([
      vaultPromise,
      logsPromise,
      todayLogsPromise,
      broadcastPromise,
      recentLogsPromise
    ]);

    if (vaultRes.error) throw vaultRes.error;
    if (logsRes.error) throw logsRes.error;
    if (todayLogsRes.error) throw todayLogsRes.error;
    if (broadcastRes.error) throw broadcastRes.error;
    if (recentLogsRes.error) throw recentLogsRes.error;

    const vaultData = vaultRes.data || [];
    let totalLinks = 0;
    let totalTexts = 0;
    const categoryCounts: Record<string, number> = {};

    vaultData.forEach((item: any) => {
      if (item.type === 'link') totalLinks++;
      if (item.type === 'text') totalTexts++;

      if (item.category) {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      }
    });

    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    let lastActivity = null;
    if (recentLogsRes.data && recentLogsRes.data.length > 0) {
      lastActivity = recentLogsRes.data[0].created_at;
    }

    return NextResponse.json({
      totalLinks,
      totalTexts,
      totalLogs: logsRes.count || 0,
      todayLogs: todayLogsRes.count || 0,
      totalBroadcasts: broadcastRes.count || 0,
      lastActivity,
      topCategories,
      recentLogs: recentLogsRes.data || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
