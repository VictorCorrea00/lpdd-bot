-- ==============================================================================
-- Sharkbot System - Migración Inicial de Base de Datos
-- Archivo: 001_initial_schema.sql
-- Descripción: Creación de tablas, disparadores, índices, políticas RLS y datos iniciales.
-- ==============================================================================

-- Habilitar extensión pgcrypto para generación de UUIDs si no está activa
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. FUNCIONES Y DISPARADORES UTILITARIOS
-- ==============================================================================

-- Función para actualizar automáticamente el campo 'updated_at' en cada modificación
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. TABLAS PRINCIPALES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Tabla: content_vault
-- Descripción: Almacena enlaces y textos organizados por categoría (VIP, Free, Promo, Copy, etc.)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('link', 'text')),
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    title TEXT,
    click_count INTEGER NOT NULL DEFAULT 0,
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disparador para actualizar 'updated_at' en content_vault
DROP TRIGGER IF EXISTS trigger_content_vault_updated_at ON content_vault;
CREATE TRIGGER trigger_content_vault_updated_at
BEFORE UPDATE ON content_vault
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- Tabla: telegram_logs
-- Descripción: Registro de auditoría y actividad de interacciones del bot de Telegram
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS telegram_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    command TEXT NOT NULL,
    payload TEXT,
    response_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Tabla: broadcast_messages
-- Descripción: Registro de mensajes enviados desde el panel de control
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS broadcast_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. ÍNDICES DE RENDIMIENTO
-- ==============================================================================

-- Índices en content_vault para optimizar búsquedas y filtrados rápidos
CREATE INDEX IF NOT EXISTS idx_content_vault_category ON content_vault (category);
CREATE INDEX IF NOT EXISTS idx_content_vault_type ON content_vault (type);
CREATE INDEX IF NOT EXISTS idx_content_vault_created_at ON content_vault (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_vault_is_favorite ON content_vault (is_favorite);

-- Índices para logs y difusiones ordenados cronológicamente
CREATE INDEX IF NOT EXISTS idx_telegram_logs_created_at ON telegram_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telegram_logs_command ON telegram_logs (command);
CREATE INDEX IF NOT EXISTS idx_broadcast_messages_created_at ON broadcast_messages (created_at DESC);

-- ==============================================================================
-- 4. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE content_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para content_vault
DROP POLICY IF EXISTS "Permitir acceso total a usuarios autenticados en content_vault" ON content_vault;
CREATE POLICY "Permitir acceso total a usuarios autenticados en content_vault"
    ON content_vault
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Políticas para telegram_logs
DROP POLICY IF EXISTS "Permitir acceso total a usuarios autenticados en telegram_logs" ON telegram_logs;
CREATE POLICY "Permitir acceso total a usuarios autenticados en telegram_logs"
    ON telegram_logs
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Políticas para broadcast_messages
DROP POLICY IF EXISTS "Permitir acceso total a usuarios autenticados en broadcast_messages" ON broadcast_messages;
CREATE POLICY "Permitir acceso total a usuarios autenticados en broadcast_messages"
    ON broadcast_messages
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- 5. POLÍTICAS PARA SERVICE ROLE (para que las API routes funcionen)
-- ==============================================================================

-- Las API routes usan el service_role key que bypasea RLS automáticamente.
-- No se necesitan políticas adicionales para el service role.

-- ==============================================================================
-- 6. DATOS DE PRUEBA INICIALES (SEED DATA)
-- ==============================================================================

INSERT INTO content_vault (type, category, title, content, click_count, is_favorite)
VALUES
    (
        'link',
        'VIP',
        'Canal VIP - Acceso Exclusivo',
        'https://t.me/+SharkbotVipAccessLink',
        0,
        true
    ),
    (
        'link',
        'Free',
        'Canal Público de Preview',
        'https://t.me/sharkbot_preview_gratis',
        0,
        false
    ),
    (
        'link',
        'Wise',
        'Link de Pago Wise',
        'https://wise.com/pay/me/tuusuario',
        0,
        true
    ),
    (
        'text',
        'Promo',
        'Copy Promocional - Oferta Flash',
        E'🔥 ¡OFERTA FLASH POR TIEMPO LIMITADO! 🔥\n\nObtén acceso total a nuestro Canal VIP con un 50% de descuento.\n✅ Contenido exclusivo diario\n✅ Atención personalizada\n✅ Acceso inmediato\n\n👉 Escribe /start para comenzar.',
        0,
        true
    ),
    (
        'text',
        'Copy',
        'Mensaje de Bienvenida VIP',
        E'👑 ¡Bienvenido al Club VIP! 👑\n\nGracias por unirte. Aquí recibirás contenido exclusivo todos los días.\n\n📌 Reglas del canal:\n1. No compartir el enlace\n2. Respetar a todos los miembros\n3. Disfrutar del contenido 🔥',
        0,
        false
    );
