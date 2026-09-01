// Tipos centrales del sistema Sharkbot

export interface ContentVaultItem {
  id: string
  type: 'link' | 'text'
  category: string
  content: string
  title: string | null
  click_count: number
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface TelegramLog {
  id: string
  command: string
  payload: string | null
  response_summary: string | null
  created_at: string
}

export interface BroadcastMessage {
  id: string
  message: string
  status: string
  created_at: string
}

export interface DashboardStats {
  totalLinks: number
  totalTexts: number
  totalLogs: number
  totalBroadcasts: number
  lastActivity: string | null
  topCategories: { category: string; count: number }[]
}

// Tipos para el Telegram Webhook
export interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  callback_query?: TelegramCallbackQuery
}

export interface TelegramMessage {
  message_id: number
  from: TelegramUser
  chat: TelegramChat
  date: number
  text?: string
}

export interface TelegramCallbackQuery {
  id: string
  from: TelegramUser
  message?: TelegramMessage
  data?: string
}

export interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  username?: string
}

export interface TelegramChat {
  id: number
  type: string
}
