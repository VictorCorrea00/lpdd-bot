import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        {/* Logo */}
        <div className="space-y-4">
          <h1 className="text-6xl font-black tracking-tighter">
            <span className="text-emerald-400">SHARK</span>
            <span className="text-zinc-100">BOT</span>
            <span className="text-4xl ml-2">🦈</span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-md mx-auto">
            Tu sistema de gestión de contenido y enlaces. 
            Rápido. Implacable. Personal.
          </p>
        </div>

        {/* Divider */}
        <div className="w-24 h-0.5 bg-emerald-500/30 mx-auto" />

        {/* CTA */}
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 hover:scale-105"
          >
            Entrar al Panel
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          
          <p className="text-zinc-600 text-sm">
            Sistema privado — Solo acceso autorizado
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-600">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Sistema operativo
        </div>
      </div>
    </div>
  )
}
