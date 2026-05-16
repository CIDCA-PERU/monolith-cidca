/** @type {import('next').NextConfig} */

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : 'yamlwxwosvabqjklttea.supabase.co'

const securityHeaders = [
  // Evita que la app sea embebida en un <iframe> (clickjacking)
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Evita que el navegador "adivine" el tipo MIME de un archivo (MIME sniffing)
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Controla qué información de referencia se envía al navegar
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Fuerza HTTPS por 2 años en producción (ignorado en HTTP local)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Restringe acceso a APIs del navegador que no se usan
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  // Prefetch de DNS controlado
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // Content Security Policy — define exactamente desde dónde se pueden cargar recursos
  // 'unsafe-inline' en style-src es necesario para Tailwind / Radix UI en dev
  // Ajustar según necesidad en producción
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Scripts: origen propio + Next.js inline + Vercel Live (preview feedback widget)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
      // Estilos: origen propio + inline (requerido por Tailwind / shadcn)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fuentes: Google Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Imágenes: origen propio + Supabase Storage + Unsplash + data/blob URIs
      // + thumbnails de YouTube para previews
      `img-src 'self' data: blob: https://${supabaseHostname} https://*.supabase.co https://images.unsplash.com https://i.ytimg.com https://drive.google.com https://lh3.googleusercontent.com`,
      // API/Fetch: origen propio + Supabase (REST + Realtime)
      `connect-src 'self' https://${supabaseHostname} wss://${supabaseHostname} https://*.supabase.co`,
      // Frames: permitir embeds de YouTube
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
      // Objetos embebidos (Flash, etc.): nadie
      "object-src 'none'",
      // Base URL: solo origen propio
      "base-uri 'self'",
      // Formularios: solo origen propio
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        // Aplica los headers a todas las rutas
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
