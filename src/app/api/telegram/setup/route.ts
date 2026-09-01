import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!token) {
      return NextResponse.json({ error: 'Falta TELEGRAM_BOT_TOKEN' }, { status: 500 });
    }
    if (!appUrl) {
      return NextResponse.json({ error: 'Falta NEXT_PUBLIC_APP_URL' }, { status: 500 });
    }

    const webhookUrl = `${appUrl}/api/telegram/webhook`;
    const TELEGRAM_API = `https://api.telegram.org/bot${token}`;

    const tgResponse = await fetch(`${TELEGRAM_API}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
    const tgData = await tgResponse.json();

    return NextResponse.json(tgData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
