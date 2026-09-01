import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'El Token es requerido' }, { status: 400 });
    }

    // 1. Validar el token directamente con la API de Telegram
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const tgData = await tgRes.json();
    
    if (!tgData.ok) {
      return NextResponse.json({ error: 'Token de Telegram inválido o vencido' }, { status: 400 });
    }

    const { first_name, username } = tgData.result;
    
    // 2. Guardar en Supabase
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('bots')
      .insert([{ 
        name: first_name, 
        username: username, 
        token: token,
        status: 'active'
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json({ error: 'Este bot ya está conectado' }, { status: 400 });
      }
      throw error;
    }
    
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
