'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Send, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { SoporteDropzone } from './soporte-dropzone'
import { crearTicketSoporte } from '@/actions/soporte.actions'
import { toast } from 'sonner'

const MAX_DESC = 5000
const MAX_TITULO = 255

export function SoporteForm() {
  const router = useRouter()
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const descLeft = MAX_DESC - descripcion.length
  const isValid = titulo.trim().length >= 3 && descripcion.trim().length >= 10

  const handleSubmit = () => {
    if (!isValid) {
      if (titulo.trim().length < 3) toast.error('El título debe tener al menos 3 caracteres')
      else toast.error('Describe el problema con al menos 10 caracteres')
      return
    }
    setShowConfirmDialog(true)
  }

  const handleConfirm = async () => {
    setShowConfirmDialog(false)
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('titulo', titulo)
      formData.append('descripcion', descripcion)
      if (selectedFile) formData.append('file', selectedFile)

      const result = await crearTicketSoporte(formData) as {
        success: boolean
        message?: string
        error?: string
      }

      if (result.success) {
        toast.success(result.message || 'Ticket enviado exitosamente')
        setSubmitted(true)
        setTitulo('')
        setDescripcion('')
        setSelectedFile(null)
        router.refresh()
      } else {
        toast.error(result.error || 'Error al enviar el ticket')
      }
    } catch {
      toast.error('Ocurrió un error de conexión. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Estado de éxito ──────────────────────────────
  if (submitted) {
    return (
      <Card className="p-6 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="p-4 bg-green-100 dark:bg-green-900/40 rounded-full">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-green-800 dark:text-green-300">
              Solicitud enviada correctamente
            </h3>
            <p className="text-sm text-green-600 dark:text-green-500 mt-1">
              Nuestro equipo revisará tu caso y se pondrá en contacto contigo.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSubmitted(false)}
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            Enviar otra solicitud
          </Button>
        </div>
      </Card>
    )
  }

  // ── Formulario ───────────────────────────────────
  return (
    <>
      <Card className="p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            Nueva solicitud de soporte
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Describe tu problema y nuestro equipo te contactará.
          </p>
        </div>

        {/* Título */}
        <div className="space-y-1.5">
          <label
            htmlFor="soporte-titulo"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Asunto <span className="text-red-500">*</span>
          </label>
          <input
            id="soporte-titulo"
            type="text"
            maxLength={MAX_TITULO}
            disabled={isSubmitting}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: No puedo acceder al módulo 2 del curso…"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-slate-400">
            {titulo.length}/{MAX_TITULO} caracteres
          </p>
        </div>

        {/* Descripción */}
        <div className="space-y-1.5">
          <label
            htmlFor="soporte-desc"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Descripción del problema <span className="text-red-500">*</span>
          </label>
          <textarea
            id="soporte-desc"
            rows={5}
            maxLength={MAX_DESC}
            disabled={isSubmitting}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Explica con detalle qué ocurrió, en qué sección del aula y qué intentaste hacer…"
            className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Mínimo 10 caracteres</p>
            <p className={`text-xs ${descLeft < 200 ? 'text-amber-500 font-medium' : 'text-slate-400'}`}>
              {descLeft.toLocaleString()} restantes
            </p>
          </div>
        </div>

        {/* Dropzone imagen (opcional) */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Captura de pantalla{' '}
            <span className="text-xs font-normal text-slate-400">(opcional)</span>
          </label>
          <SoporteDropzone
            onFileSelected={setSelectedFile}
            onFileRemoved={() => setSelectedFile(null)}
            selectedFile={selectedFile}
            isDisabled={isSubmitting}
          />
        </div>

        {/* Aviso */}
        <div className="flex items-start gap-2.5 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40">
          <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
            Al enviar esta solicitud, nuestro equipo podrá contactarte a través del correo registrado en tu cuenta.
          </p>
        </div>

        {/* Botón */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !isValid}
          className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando…</>
          ) : (
            <><Send className="h-4 w-4 mr-2" /> Enviar solicitud</>
          )}
        </Button>
      </Card>

      {/* Confirm dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <AlertDialogTitle>¿Confirmar envío?</AlertDialogTitle>
                <AlertDialogDescription className="mt-2">
                  Se registrará tu solicitud de soporte con el asunto:{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    "{titulo}"
                  </span>
                  . Nuestro equipo se pondrá en contacto contigo a la brevedad.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirmar envío
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
