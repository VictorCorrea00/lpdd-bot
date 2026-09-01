// Helpers para interactuar con la API de Telegram usando fetch nativo
// Sin librerías pesadas - optimizado para Edge Functions de Vercel

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

interface SendMessageOptions {
  chat_id: number | string
  text: string
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML'
  reply_markup?: object
}

interface AnswerCallbackOptions {
  callback_query_id: string
  text?: string
  show_alert?: boolean
}

// Enviar mensaje de texto
export async function sendMessage(options: SendMessageOptions): Promise<void> {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  })
}

// Responder a callback query (quitar el "loading" del botón)
export async function answerCallbackQuery(options: AnswerCallbackOptions): Promise<void> {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  })
}

// Editar mensaje existente
export async function editMessageText(options: {
  chat_id: number | string
  message_id: number
  text: string
  parse_mode?: string
  reply_markup?: object
}): Promise<void> {
  await fetch(`${TELEGRAM_API}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  })
}

// Crear teclado en línea (Inline Keyboard)
export function inlineKeyboard(buttons: { text: string; callback_data?: string; url?: string }[][]) {
  return {
    inline_keyboard: buttons,
  }
}

// Validar que el mensaje viene del admin
export function isAdmin(chatId: number): boolean {
  return String(chatId) === process.env.ADMIN_CHAT_ID
}
