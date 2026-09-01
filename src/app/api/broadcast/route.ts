import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('broadcast_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, parse_mode } = body;

    if (!message) {
      return NextResponse.json({ error: 'El mensaje es requerido' }, { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.ADMIN_CHAT_ID;

    if (!token || !adminChatId) {
      return NextResponse.json({ error: 'Falta configuración de Telegram' }, { status: 500 });
    }

    const TELEGRAM_API = `https://api.telegram.org/bot${token}`;

    const tgResponse = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminChatId,
        text: message,
        parse_mode: parse_mode || 'Markdown',
      }),
    });

    const tgData = await tgResponse.json();

    if (!tgResponse.ok || !tgData.ok) {
      throw new Error(tgData.description || 'Fallo al enviar mensaje a Telegram');
    }

    const supabase = createSupabaseAdmin();
    
    // Guardar en la base de datos
    const { data: broadcastData, error: dbError } = await supabase
      .from('broadcast_messages')
      .insert([{ message, status: 'sent' }])
      .select()
      .single();

    if (dbError) {
      console.error('Error guardando en BD:', dbError);
    }

    return NextResponse.json({ success: true, data: broadcastData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
