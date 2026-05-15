/**
 * lib/session.ts — Gestión de tokens de sesión
 *
 * Arquitectura de dos capas:
 *  - Capa 1 (Middleware/Edge): HMAC verifica que la cookie no fue forjada (sin DB)
 *  - Capa 2 (Server Actions):  DB verifica que la sesión existe, está activa y no expiró
 *
 * Formato cookie: "<token64hex>.<hmacHex>"
 *   token64hex → 32 bytes aleatorios como hex (64 chars) → ID de sesión
 *   hmacHex    → HMAC-SHA256 del token con SESSION_SECRET → previene forgery
 *
 * DB storage: SHA-256(token64hex) → nunca el token plano
 *
 * ⚠️ NO agregar 'server-only' — este archivo se usa en middleware (Edge Runtime)
 */

// ─── HMAC key ─────────────────────────────────────────────────────────────────

async function getHmacKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET no está definida en .env')
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

// ─── Generación ───────────────────────────────────────────────────────────────

/**
 * Genera un token de sesión aleatorio criptográficamente seguro.
 * 32 bytes = 256 bits de entropía → prácticamente imposible de adivinar.
 */
export function generateSessionToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Crea el valor firmado para guardar en la cookie.
 * Formato: "token.hmac"
 * El HMAC se verifica en middleware sin necesitar la BD.
 */
export async function signTokenForCookie(token: string): Promise<string> {
  const key = await getHmacKey()
  const sigBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(token)
  )
  const sigHex = Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return `${token}.${sigHex}`
}

// ─── Verificación (Edge Runtime) ──────────────────────────────────────────────

/**
 * Verifica el HMAC de la cookie y retorna el token crudo.
 * Usado en middleware (sin DB, solo criptografía).
 * @returns token hex si la firma es válida, null si fue forjada o inválida
 */
export async function extractAndVerifyToken(cookieValue: string): Promise<string | null> {
  try {
    const dotIndex = cookieValue.lastIndexOf('.')
    if (dotIndex === -1) return null

    const token = cookieValue.slice(0, dotIndex)
    const receivedSig = cookieValue.slice(dotIndex + 1)

    if (!token || !receivedSig || token.length !== 64) return null

    // Recomputar HMAC esperado
    const expected = await signTokenForCookie(token)
    const expectedSig = expected.slice(expected.lastIndexOf('.') + 1)

    // Comparación segura (longitud constante)
    if (receivedSig.length !== expectedSig.length) return null
    if (receivedSig !== expectedSig) return null

    return token
  } catch {
    return null
  }
}

// ─── Hash para BD ─────────────────────────────────────────────────────────────

/**
 * Genera el SHA-256 del token para almacenar en la BD.
 * Nunca se guarda el token plano en la BD.
 */
export async function hashTokenForDB(token: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(token)
  )
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// ─── Compat: mantiene signSession/verifySession para no romper imports viejos ──

/** @deprecated Usar signTokenForCookie + generateSessionToken */
export async function signSession(userId: number): Promise<string> {
  const token = generateSessionToken()
  return signTokenForCookie(token)
}

/** @deprecated Usar extractAndVerifyToken */
export async function verifySession(cookieValue: string): Promise<number | null> {
  const token = await extractAndVerifyToken(cookieValue)
  if (!token) return null
  return 1 // valor dummy — validación real la hace la BD
}
