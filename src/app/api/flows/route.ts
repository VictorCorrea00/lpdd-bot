import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('flows')
      .select('*, bots(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, trigger_keyword, bot_id } = await req.json();
    
    if (!name) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('flows')
      .insert([{ 
        name, 
        trigger_keyword, 
        bot_id: bot_id || null,
        nodes: [] // Empezamos con un embudo vacío
      }])
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
