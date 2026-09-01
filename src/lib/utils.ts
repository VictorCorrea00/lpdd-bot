import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatear fecha para display
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Formatear fecha relativa
export function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Hace unos segundos'
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`
  if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)}d`
  return formatDate(dateString)
}

// Truncar texto
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + '...'
}

// Categorías por defecto
export const DEFAULT_CATEGORIES = ['VIP', 'Free', 'Promo', 'Copy', 'Wise', 'General'] as const
