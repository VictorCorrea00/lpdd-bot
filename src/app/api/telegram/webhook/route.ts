import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Telegram envía varios tipos de updates, nos enfocamos en mensajes de texto
    if (!body.message || !body.message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = body.message.chat.id;
    const text = body.message.text.trim();
    const token = process.env.TELEGRAM_BOT_TOKEN!; // En el futuro lo sacaremos de la tabla bots dinámicamente

    const supabase = createSupabaseAdmin();

    // 1. Registrar la interacción en los Logs para el Dashboard
    await supabase.from('telegram_logs').insert([{
      command: text,
      payload: `Chat ID: ${chatId}`,
      response_summary: 'Buscando flujos...'
    }]);

    // 2. MOTOR DE FLUJOS: Buscar si el texto coincide con un trigger_keyword
    const { data: flows } = await supabase
      .from('flows')
      .select('*')
      .ilike('trigger_keyword', text)
      .eq('is_active', true)
      .limit(1);

    const flow = flows?.[0];

    // Si encontramos un flujo, lo ejecutamos
    if (flow) {
      // Aquí iría el procesador de nodos JSON complejos.
      // Por ahora, disparamos una respuesta dinámica de simulación de éxito:
      const responseText = `⚙️ *Flujo Activado:* [${flow.name}]\n\n🚀 ¡Perfecto! El bot detectó la palabra clave \`${text}\` y disparó este embudo.\n\n💳 _En el próximo paso conectaremos aquí tus Gateways (PIX/Wise) y secuencias de fotos/botones._`;
      
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: responseText,
          parse_mode: 'Markdown'
        })
      });

      return NextResponse.json({ ok: true });
    }

    // 3. Comandos Nativos de Fallback (Si no coincide con ningún flujo)
    if (text === '/start') {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: "🦈 *Bienvenido a Sharkbot*\n\nEste bot está automatizado. Ingresa una palabra clave para iniciar un flujo de ventas.",
          parse_mode: 'Markdown'
        })
      });
    }

    return NextResponse.json({ ok: true });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    // Telegram SIEMPRE necesita un 200 OK, sino reintenta infinitamente
    return NextResponse.json({ ok: true });
  }
}
