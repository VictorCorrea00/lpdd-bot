import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    
    const command = searchParams.get('command');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('telegram_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (command) {
      query = query.eq('command', command);
    }

    const { data, count, error } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ data, total: count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
