'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Mail, Loader2, ArrowLeft, CheckCircle2, KeyRound, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { solicitarRecuperacion, cambiarPasswordConToken } from '@/actions/registro.actions'

function SolicitarStep() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await solicitarRecuperacion(fd) as { success: boolean; message?: string; error?: string }
      if (result.success) setSent(true)
      else setError(result.error ?? 'Error al procesar la solicitud')
    })
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="p-4 rounded-full bg-green-500/20 border border-green-500/30">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>
        <div>
          <p className="text-white font-semibold">Revisa tu correo</p>
          <p className="text-sm text-white/60 mt-1 max-w-xs">
            Si ese email está registrado, recibirás un enlace para restablecer tu contraseña. Revisa también tu carpeta de spam.
          </p>
        </div>
        <Link href="/login">
          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 mt-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al login
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="recovery-email" className="text-xs font-medium text-white/80">
          Email registrado
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            id="recovery-email"
            name="email"
            type="email"
            placeholder="ejemplo@correo.com"
            disabled={isPending}
            required
            className="bg-black/30 border-white/20 text-white placeholder:text-white/30 h-9 text-sm pl-9"
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="py-2 px-3">
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-10 bg-accent text-black hover:bg-accent/90 font-semibold"
      >
        {isPending ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando…</>
        ) : (
          'Enviar instrucciones'
        )}
      </Button>

      {/* Único enlace de volver — solo visible antes de enviar */}
      <div className="text-center pt-1">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al login
        </Link>
      </div>
    </form>
  )
}

function NuevaPasswordStep({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    fd.append('token', token)
    startTransition(async () => {
      const result = await cambiarPasswordConToken(fd) as { success: boolean; message?: string; error?: string }
      if (result.success) setDone(true)
      else setError(result.error ?? 'Error al cambiar la contraseña')
    })
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="p-4 rounded-full bg-green-500/20 border border-green-500/30">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>
        <div>
          <p className="text-white font-semibold">¡Contraseña actualizada!</p>
          <p className="text-sm text-white/60 mt-1">Ya puedes iniciar sesión con tu nueva contraseña.</p>
        </div>
        <Link href="/login">
          <Button className="bg-accent text-black hover:bg-accent/90 mt-2">
            Ir al login
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="new-password" className="text-xs font-medium text-white/80">
          Nueva contraseña
        </label>
        <div className="relative">
          <Input
            id="new-password"
            name="password"
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            disabled={isPending}
            required
            className="bg-black/30 border-white/20 text-white placeholder:text-white/30 h-9 text-sm pr-9"
          />
          <button type="button" onClick={() => setShowPass(p => !p)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm-password" className="text-xs font-medium text-white/80">
          Confirmar contraseña
        </label>
        <div className="relative">
          <Input
            id="confirm-password"
            name="confirm"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            disabled={isPending}
            required
            className="bg-black/30 border-white/20 text-white placeholder:text-white/30 h-9 text-sm pr-9"
          />
          <button type="button" onClick={() => setShowConfirm(p => !p)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="py-2 px-3">
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isPending}
        className="w-full h-10 bg-accent text-black hover:bg-accent/90 font-semibold">
        {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando…</> : 'Cambiar contraseña'}
      </Button>
    </form>
  )
}

export function ForgotPasswordForm({ token }: { token?: string }) {
  return (
    <Card className="w-full max-w-md border-white/10 bg-black/50 backdrop-blur-md shadow-xl">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex justify-center mb-2">
          <div className="p-3 rounded-full bg-accent/20 border border-accent/30">
            <KeyRound className="h-6 w-6 text-accent" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center text-white">
          {token ? 'Nueva contraseña' : '¿Olvidaste tu contraseña?'}
        </CardTitle>
        <CardDescription className="text-center text-white/60">
          {token
            ? 'Ingresa tu nueva contraseña para recuperar el acceso.'
            : 'Te enviaremos un enlace para restablecer tu contraseña.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {token ? (
          <NuevaPasswordStep token={token} />
        ) : (
          <SolicitarStep />
        )}
      </CardContent>
    </Card>
  )
}
