'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, UserPlus, CreditCard } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { registrarEstudiante } from '@/actions/registro.actions'
import type { TipoDocumento } from '@/repository/documento.repository'

// ── Indicador de fortaleza de contraseña ─────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Al menos 6 caracteres', ok: password.length >= 6 },
    { label: 'Contiene número',        ok: /\d/.test(password) },
    { label: 'Letra mayúscula',        ok: /[A-Z]/.test(password) },
    { label: 'Carácter especial',      ok: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.ok).length
  const colors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
  const labels = ['Muy débil', 'Débil', 'Regular', 'Fuerte']

  if (!password) return null
  return (
    <div className="space-y-2 mt-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score - 1] : 'bg-white/10'}`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-medium ${score < 2 ? 'text-red-400' : score < 4 ? 'text-yellow-400' : 'text-green-400'}`}>
        {labels[score - 1] ?? 'Muy débil'}
      </p>
    </div>
  )
}

// ── Formulario de registro ────────────────────────────────────────────────────

export function RegisterForm({ tiposDocumento = [] }: { tiposDocumento?: TipoDocumento[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [selectedDocId, setSelectedDocId] = useState<string>(
    tiposDocumento[0] ? String(tiposDocumento[0].doc_id_int) : '-1'
  )
  const [selectedDocTipo, setSelectedDocTipo] = useState<string>(
    tiposDocumento[0]?.doc_tipo_vac ?? ''
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    // Inyectamos los campos del documento que vienen del estado
    fd.set('docId',   selectedDocId)
    fd.set('docTipo', selectedDocTipo)

    startTransition(async () => {
      const result = await registrarEstudiante(fd) as { success: boolean; message?: string; error?: string }
      if (result.success) {
        router.push('/login?registered=1')
      } else {
        setError(result.error ?? 'Error al registrarse')
      }
    })
  }

  return (
    <Card className="w-full max-w-md border-white/10 bg-black/50 backdrop-blur-md shadow-xl">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex justify-center mb-2">
          <div className="p-3 rounded-full bg-accent/20 border border-accent/30">
            <UserPlus className="h-6 w-6 text-accent" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center text-white">
          Crear cuenta
        </CardTitle>
        <CardDescription className="text-center text-white/60">
          Únete al aula virtual CIDCA
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre y apellidos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="reg-nombre" className="text-xs font-medium text-white/80">
                Nombre <span className="text-accent">*</span>
              </label>
              <Input
                id="reg-nombre"
                name="nombre"
                placeholder="Juan"
                disabled={isPending}
                required
                className="bg-black/30 border-white/20 text-white placeholder:text-white/30 h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="reg-apellidoPat" className="text-xs font-medium text-white/80">
                Apellido pat. <span className="text-accent">*</span>
              </label>
              <Input
                id="reg-apellidoPat"
                name="apellidoPat"
                placeholder="García"
                disabled={isPending}
                required
                className="bg-black/30 border-white/20 text-white placeholder:text-white/30 h-9 text-sm"
              />
            </div>
          </div>

          {/* Tipo y número de documento */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80">
              Documento de identidad <span className="text-accent">*</span>
            </label>
            <div className="flex gap-2">
              {/* Selector de tipo */}
              <div className="relative w-44 flex-shrink-0">
                <CreditCard className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
                <select
                  id="reg-docTipo"
                  value={selectedDocId}
                  onChange={e => {
                    const opt = tiposDocumento.find(t => String(t.doc_id_int) === e.target.value)
                    setSelectedDocId(e.target.value)
                    setSelectedDocTipo(opt?.doc_tipo_vac ?? e.target.value)
                  }}
                  disabled={isPending}
                  className="w-full h-9 rounded-md bg-black/30 border border-white/20 text-white text-sm pl-8 pr-2 appearance-none focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {tiposDocumento.map(t => (
                    <option
                      key={t.doc_id_int}
                      value={String(t.doc_id_int)}
                      className="bg-zinc-900 text-white"
                    >
                      {t.doc_tipo_vac}
                    </option>
                  ))}
                </select>
              </div>
              {/* Número */}
              <Input
                id="reg-docNumero"
                name="docNumero"
                placeholder={selectedDocTipo === 'DNI' ? '12345678' : selectedDocTipo === 'RUC' ? '20123456789' : 'Número'}
                disabled={isPending}
                required
                maxLength={selectedDocTipo === 'DNI' ? 8 : selectedDocTipo === 'RUC' ? 11 : 20}
                className="flex-1 bg-black/30 border-white/20 text-white placeholder:text-white/30 h-9 text-sm uppercase"
              />
            </div>
            {selectedDocTipo === 'DNI' && (
              <p className="text-[11px] text-white/30">El DNI debe tener 8 dígitos</p>
            )}
          </div>

          {/* Apellido materno */}

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="text-xs font-medium text-white/80">
              Email <span className="text-accent">*</span>
            </label>
            <Input
              id="reg-email"
              name="email"
              type="email"
              placeholder="ejemplo@correo.com"
              disabled={isPending}
              required
              className="bg-black/30 border-white/20 text-white placeholder:text-white/30 h-9 text-sm"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <label htmlFor="reg-password" className="text-xs font-medium text-white/80">
              Contraseña <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <Input
                id="reg-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                disabled={isPending}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-black/30 border-white/20 text-white placeholder:text-white/30 h-9 text-sm pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          {/* Confirmar contraseña */}
          <div className="space-y-1.5">
            <label htmlFor="reg-confirm" className="text-xs font-medium text-white/80">
              Confirmar contraseña <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <Input
                id="reg-confirm"
                name="confirm"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                disabled={isPending}
                required
                className="bg-black/30 border-white/20 text-white placeholder:text-white/30 h-9 text-sm pr-9"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(p => !p)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
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
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando cuenta…</>
            ) : (
              <><UserPlus className="mr-2 h-4 w-4" /> Crear cuenta</>
            )}
          </Button>
        </form>

        <div className="mt-5 text-center text-sm text-white/50">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-accent hover:underline font-medium">
            Inicia sesión
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
