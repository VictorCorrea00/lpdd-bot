import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { sendMessage, answerCallbackQuery, inlineKeyboard, isAdmin } from '@/lib/telegram'
import type { TelegramUpdate } from '@/lib/types'

// Responder SIEMPRE con 200 OK inmediatamente para evitar reintentos de Telegram
export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json()

    // ====== SEGURIDAD ZERO-TRUST ======
    // Si el mensaje NO viene del admin, ignorar silenciosamente
    const chatId = update.message?.chat.id || update.callback_query?.message?.chat.id
    if (!chatId || !isAdmin(chatId)) {
      return new Response('OK', { status: 200 })
    }

    // Procesar en background sin bloquear la respuesta
    // Usamos waitUntil pattern para Vercel
    const processingPromise = processUpdate(update)

    // En Vercel, no podemos usar waitUntil directamente, 
    // así que esperamos el procesamiento pero con timeout
    await Promise.race([
      processingPromise,
      new Promise(resolve => setTimeout(resolve, 9000)) // 9s timeout safety
    ])

  } catch (error) {
    console.error('Error en webhook:', error)
  }

  return new Response('OK', { status: 200 })
}

// Procesar el update del bot
async function processUpdate(update: TelegramUpdate) {
  const supabase = createSupabaseAdmin()

  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query, supabase)
    return
  }

  if (update.message?.text) {
    await handleTextMessage(update.message, supabase)
    return
  }
}

// Manejar mensajes de texto y comandos
async function handleTextMessage(
  message: NonNullable<TelegramUpdate['message']>,
  supabase: ReturnType<typeof createSupabaseAdmin>
) {
  const chatId = message.chat.id
  const text = message.text || ''
  const command = text.split(' ')[0].toLowerCase()

  switch (command) {
    case '/start':
      await handleStart(chatId)
      await logCommand(supabase, '/start', null, 'Menú principal mostrado')
      break

    case '/save_link':
      await handleSaveLink(chatId, text, supabase)
      break

    case '/save_text':
      await handleSaveText(chatId, text, supabase)
      break

    case '/get':
      await handleGet(chatId, text, supabase)
      break

    case '/stats':
      await handleStats(chatId, supabase)
      break

    case '/cats':
      await handleCategories(chatId, supabase)
      break

    case '/help':
      await handleHelp(chatId)
      await logCommand(supabase, '/help', null, 'Ayuda mostrada')
      break

    case '/fav':
      await handleFavorites(chatId, supabase)
      break

    default:
      // Si no es comando, ignorar silenciosamente
      break
  }
}

// /start - Menú principal con Inline Keyboard
async function handleStart(chatId: number) {
  await sendMessage({
    chat_id: chatId,
    text:
      '🦈 *SHARKBOT — Panel de Control*\n' +
      '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      'Tu herramienta de gestión rápida.\n' +
      'Selecciona una opción:',
    parse_mode: 'Markdown',
    reply_markup: inlineKeyboard([
      [
        { text: '📊 Métricas', callback_data: 'cb_stats' },
        { text: '📁 Últimos Enlaces', callback_data: 'cb_recent_links' },
      ],
      [
        { text: '📝 Nuevo Texto', callback_data: 'cb_new_text_help' },
        { text: '⭐ Favoritos', callback_data: 'cb_favorites' },
      ],
      [
        { text: '📂 Categorías', callback_data: 'cb_categories' },
        { text: '❓ Ayuda', callback_data: 'cb_help' },
      ],
    ]),
  })
}

// /save_link [Categoría] [URL] — Guardar enlace
async function handleSaveLink(
  chatId: number,
  text: string,
  supabase: ReturnType<typeof createSupabaseAdmin>
) {
  const parts = text.replace('/save_link', '').trim().split(/\s+/)

  if (parts.length < 2) {
    await sendMessage({
      chat_id: chatId,
      text:
        '⚠️ *Formato incorrecto*\n\n' +
        'Uso: `/save_link [Categoría] [URL]`\n' +
        'Ejemplo: `/save_link VIP https://t.me/micanal`',
      parse_mode: 'Markdown',
    })
    return
  }

  const category = parts[0].toUpperCase()
  const url = parts[1]
  const title = parts.slice(2).join(' ') || null

  const { error } = await supabase.from('content_vault').insert({
    type: 'link',
    category,
    content: url,
    title,
  })

  if (error) {
    await sendMessage({
      chat_id: chatId,
      text: '❌ Error guardando enlace: ' + error.message,
    })
    return
  }

  await sendMessage({
    chat_id: chatId,
    text:
      '✅ *Enlace guardado*\n\n' +
      `📂 Categoría: *${category}*\n` +
      `🔗 URL: ${url}\n` +
      (title ? `📝 Título: ${title}` : ''),
    parse_mode: 'Markdown',
  })

  await logCommand(supabase, '/save_link', `${category} ${url}`, `Enlace guardado en ${category}`)
}

// /save_text [Categoría] [Texto] — Guardar texto/copy
async function handleSaveText(
  chatId: number,
  text: string,
  supabase: ReturnType<typeof createSupabaseAdmin>
) {
  const afterCmd = text.replace('/save_text', '').trim()
  const spaceIdx = afterCmd.indexOf(' ')

  if (spaceIdx === -1) {
    await sendMessage({
      chat_id: chatId,
      text:
        '⚠️ *Formato incorrecto*\n\n' +
        'Uso: `/save_text [Categoría] [Tu texto]`\n' +
        'Ejemplo: `/save_text Promo 🔥 Oferta Flash - 50% OFF hoy`',
      parse_mode: 'Markdown',
    })
    return
  }

  const category = afterCmd.slice(0, spaceIdx).toUpperCase()
  const content = afterCmd.slice(spaceIdx + 1)

  const { error } = await supabase.from('content_vault').insert({
    type: 'text',
    category,
    content,
  })

  if (error) {
    await sendMessage({
      chat_id: chatId,
      text: '❌ Error guardando texto: ' + error.message,
    })
    return
  }

  await sendMessage({
    chat_id: chatId,
    text:
      '✅ *Texto guardado*\n\n' +
      `📂 Categoría: *${category}*\n` +
      `📝 Preview: _${content.slice(0, 80)}${content.length > 80 ? '...' : ''}_`,
    parse_mode: 'Markdown',
  })

  await logCommand(supabase, '/save_text', `${category}`, `Texto guardado en ${category}`)
}

// /get [Categoría] — Obtener contenido por categoría
async function handleGet(
  chatId: number,
  text: string,
  supabase: ReturnType<typeof createSupabaseAdmin>
) {
  const category = text.replace('/get', '').trim().toUpperCase()

  if (!category) {
    await sendMessage({
      chat_id: chatId,
      text:
        '⚠️ *Indica una categoría*\n\n' +
        'Uso: `/get [Categoría]`\n' +
        'Ejemplo: `/get VIP`\n\n' +
        'Usa `/cats` para ver todas las categorías.',
      parse_mode: 'Markdown',
    })
    return
  }

  const { data, error } = await supabase
    .from('content_vault')
    .select('*')
    .ilike('category', category)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error || !data || data.length === 0) {
    await sendMessage({
      chat_id: chatId,
      text: `📂 No hay contenido en la categoría *${category}*`,
      parse_mode: 'Markdown',
    })
    return
  }

  // Incrementar click_count para analytics
  for (const item of data) {
    await supabase
      .from('content_vault')
      .update({ click_count: (item.click_count || 0) + 1 })
      .eq('id', item.id)
  }

  let response = `📂 *${category}* — ${data.length} resultado(s)\n━━━━━━━━━━━━━━━━━━━━━━\n\n`

  for (const item of data) {
    const icon = item.type === 'link' ? '🔗' : '📝'
    const title = item.title ? `*${item.title}*\n` : ''
    response += `${icon} ${title}${item.content}\n\n`
  }

  await sendMessage({
    chat_id: chatId,
    text: response,
    parse_mode: 'Markdown',
  })

  await logCommand(supabase, '/get', category, `${data.length} items de ${category}`)
}

// /stats — Estadísticas del día
async function handleStats(
  chatId: number,
  supabase: ReturnType<typeof createSupabaseAdmin>
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  const { count: totalLinks } = await supabase
    .from('content_vault')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'link')

  const { count: totalTexts } = await supabase
    .from('content_vault')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'text')

  const { count: todayLogs } = await supabase
    .from('telegram_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayISO)

  const { data: topItems } = await supabase
    .from('content_vault')
    .select('title, content, type, click_count')
    .order('click_count', { ascending: false })
    .limit(3)

  let statsText =
    '📊 *SHARKBOT — ESTADÍSTICAS*\n' +
    '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    `🔗 *Total de enlaces:* ${totalLinks || 0}\n` +
    `📝 *Textos guardados:* ${totalTexts || 0}\n` +
    `📡 *Comandos hoy:* ${todayLogs || 0}\n` +
    `🟢 *Estado del sistema:* Operativo\n`

  if (topItems && topItems.length > 0) {
    statsText += '\n🏆 *Top contenido (más usado):*\n'
    for (const item of topItems) {
      const icon = item.type === 'link' ? '🔗' : '📝'
      const label = item.title || item.content.slice(0, 30)
      statsText += `${icon} ${label} — ${item.click_count} usos\n`
    }
  }

  await sendMessage({
    chat_id: chatId,
    text: statsText,
    parse_mode: 'Markdown',
  })

  await logCommand(supabase, '/stats', null, 'Estadísticas consultadas')
}

// /cats — Listar categorías
async function handleCategories(
  chatId: number,
  supabase: ReturnType<typeof createSupabaseAdmin>
) {
  const { data } = await supabase
    .from('content_vault')
    .select('category')

  if (!data || data.length === 0) {
    await sendMessage({
      chat_id: chatId,
      text: '📂 No hay categorías todavía. Usa `/save_link` o `/save_text` para empezar.',
      parse_mode: 'Markdown',
    })
    return
  }

  // Agrupar y contar
  const catCounts: Record<string, number> = {}
  for (const row of data) {
    catCounts[row.category] = (catCounts[row.category] || 0) + 1
  }

  let text = '📂 *CATEGORÍAS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n'
  for (const [cat, count] of Object.entries(catCounts).sort((a, b) => b[1] - a[1])) {
    text += `• *${cat}* — ${count} item(s)\n`
  }
  text += '\nUsa `/get [Categoría]` para ver el contenido.'

  await sendMessage({
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
  })

  await logCommand(supabase, '/cats', null, 'Categorías listadas')
}

// /fav — Ver favoritos
async function handleFavorites(
  chatId: number,
  supabase: ReturnType<typeof createSupabaseAdmin>
) {
  const { data } = await supabase
    .from('content_vault')
    .select('*')
    .eq('is_favorite', true)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!data || data.length === 0) {
    await sendMessage({
      chat_id: chatId,
      text: '⭐ No tienes favoritos todavía.',
    })
    return
  }

  let text = '⭐ *FAVORITOS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n'
  for (const item of data) {
    const icon = item.type === 'link' ? '🔗' : '📝'
    const title = item.title ? `*${item.title}*\n` : ''
    text += `${icon} [${item.category}] ${title}${item.content}\n\n`
  }

  await sendMessage({
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
  })

  await logCommand(supabase, '/fav', null, 'Favoritos consultados')
}

// /help — Ayuda
async function handleHelp(chatId: number) {
  await sendMessage({
    chat_id: chatId,
    text:
      '🦈 *SHARKBOT — COMANDOS*\n' +
      '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      '📌 *Guardar contenido:*\n' +
      '`/save_link [Cat] [URL]` — Guardar enlace\n' +
      '`/save_text [Cat] [Texto]` — Guardar copy/texto\n\n' +
      '🔍 *Recuperar contenido:*\n' +
      '`/get [Cat]` — Obtener por categoría\n' +
      '`/fav` — Ver favoritos\n' +
      '`/cats` — Listar categorías\n\n' +
      '📊 *Sistema:*\n' +
      '`/stats` — Estadísticas del día\n' +
      '`/start` — Menú principal\n\n' +
      '_Categorías sugeridas: VIP, Free, Promo, Copy, Wise_',
    parse_mode: 'Markdown',
  })
}

// Manejar botones (Callback Queries)
async function handleCallbackQuery(
  callbackQuery: NonNullable<TelegramUpdate['callback_query']>,
  supabase: ReturnType<typeof createSupabaseAdmin>
) {
  const chatId = callbackQuery.message?.chat.id
  if (!chatId) return

  await answerCallbackQuery({ callback_query_id: callbackQuery.id })

  switch (callbackQuery.data) {
    case 'cb_stats':
      await handleStats(chatId, supabase)
      break
    case 'cb_recent_links':
      await handleGet(chatId, '/get VIP', supabase)
      break
    case 'cb_new_text_help':
      await sendMessage({
        chat_id: chatId,
        text:
          '📝 *Para guardar un texto nuevo:*\n\n' +
          'Escribe:\n`/save_text [Categoría] [Tu texto aquí]`\n\n' +
          'Ejemplo:\n`/save_text Promo 🔥 Oferta Flash! 50% en VIP`',
        parse_mode: 'Markdown',
      })
      break
    case 'cb_favorites':
      await handleFavorites(chatId, supabase)
      break
    case 'cb_categories':
      await handleCategories(chatId, supabase)
      break
    case 'cb_help':
      await handleHelp(chatId)
      break
  }
}

// Registrar comando en logs
async function logCommand(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  command: string,
  payload: string | null,
  responseSummary: string
) {
  await supabase.from('telegram_logs').insert({
    command,
    payload,
    response_summary: responseSummary,
  })
}

// GET handler para verificar que el endpoint está activo
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    bot: 'Sharkbot',
    message: 'Webhook activo 🦈',
  })
}
