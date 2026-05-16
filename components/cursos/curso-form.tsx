'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createCurso, updateCurso } from '@/actions/curso.actions'
import { uploadCursoImagen } from '@/actions/admin.actions'
import { CursoDTO, CreateCursoRequest } from '@/dto/curso.dto'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Upload, ImageIcon, Link2, X, Loader2 } from 'lucide-react'

interface CursoFormProps {
  curso?: CursoDTO
  onSuccess?: () => void
}

export function CursoForm({ curso, onSuccess }: CursoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState({
    nombre: curso?.nombre || '',
    descripcion: curso?.descripcion || '',
    fecha_inicio: curso?.fecha_inicio?.split('T')[0] || '',
    fecha_fin: curso?.fecha_fin?.split('T')[0] || '',
    imagen_url: curso?.imagen_url || '',
  })

  const normalizeImageUrl = (url?: string) => {
    if (!url) return ''
    const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
    if (match?.[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`
    }
    return url
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    const nextValue = name === 'imagen_url' ? normalizeImageUrl(value) : value
    if (name === 'imagen_url' && nextValue !== value) {
      toast.info('Se convirtio el link de Drive a un enlace directo de imagen')
    }
    setFormData((prev) => ({ ...prev, [name]: nextValue }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  // ── Upload handler (file → Supabase Storage → URL en campo) ──────────────────

  const handleFileUpload = async (file: File) => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const result = await uploadCursoImagen(fd)
      if (result.success && result.url) {
        setFormData((prev) => ({ ...prev, imagen_url: result.url! }))
        toast.success('Imagen subida correctamente')
      } else {
        toast.error(result.error ?? 'Error al subir imagen')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileUpload(file)
  }

  const clearImage = () => {
    setFormData((prev) => ({ ...prev, imagen_url: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const normalizedImageUrl = normalizeImageUrl(formData.imagen_url)
      const request: CreateCursoRequest = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        fecha_inicio: new Date(formData.fecha_inicio).toISOString(),
        fecha_fin: new Date(formData.fecha_fin).toISOString(),
        imagen_url: normalizedImageUrl || undefined,
      }

      let result
      if (curso) {
        result = await updateCurso(curso.id, { ...request })
      } else {
        result = await createCurso(request)
      }

      if (!result.success) {
        toast.error(result.error || 'Error al guardar curso')
        return
      }

      toast.success(curso ? 'Curso actualizado' : 'Curso creado correctamente')
      onSuccess?.()
      if (!curso) {
        router.push(`/dashboard/cursos/${result.data?.id}`)
      } else {
        router.refresh()
      }
    } catch (error) {
      toast.error('Error al guardar curso')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const hasImage = Boolean(formData.imagen_url)

  return (
    <Card className="p-6 max-w-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
        {curso ? 'Editar Curso' : 'Crear Nuevo Curso'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre */}
        <div>
          <Label htmlFor="nombre" className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
            Nombre del Curso
          </Label>
          <Input
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: Introducción a Python"
            className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            required
          />
          {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
        </div>

        {/* Descripción */}
        <div>
          <Label htmlFor="descripcion" className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
            Descripción
          </Label>
          <Textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Descripción del curso"
            className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 resize-none"
            rows={3}
            required
          />
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fecha_inicio" className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Fecha Inicio
            </Label>
            <Input
              id="fecha_inicio"
              name="fecha_inicio"
              type="date"
              value={formData.fecha_inicio}
              onChange={handleChange}
              className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              required
            />
          </div>
          <div>
            <Label htmlFor="fecha_fin" className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Fecha Fin
            </Label>
            <Input
              id="fecha_fin"
              name="fecha_fin"
              type="date"
              value={formData.fecha_fin}
              onChange={handleChange}
              className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              required
            />
          </div>
        </div>

        {/* ── Imagen del curso ───────────────────────────────────────────── */}
        <div>
          <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
            Imagen del Curso
          </Label>

          {/* Zona drag-and-drop */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-150 mb-3
              flex flex-col items-center justify-center gap-2 py-6
              ${dragOver
                ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/10'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-amber-300 dark:hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-500/5'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileInputChange}
            />
            {uploading ? (
              <>
                <Loader2 className="h-7 w-7 text-amber-500 animate-spin" />
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Subiendo imagen...</p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Arrastra una imagen o <span className="text-amber-600 dark:text-amber-400">haz clic para seleccionar</span>
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    JPG, PNG o WebP — máx 5MB
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Campo de URL manual */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="imagen_url"
                name="imagen_url"
                type="url"
                value={formData.imagen_url}
                onChange={handleChange}
                placeholder="https://example.com/imagen.jpg"
                className="pl-9 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
              />
            </div>
            {hasImage && (
              <button
                type="button"
                onClick={clearImage}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                title="Quitar imagen"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Preview */}
          {hasImage && (
            <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-semibold flex items-center gap-1">
                <ImageIcon className="h-3 w-3" /> Preview
              </div>
              <img
                src={formData.imagen_url}
                alt="Preview del curso"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
                onLoad={(e) => {
                  e.currentTarget.style.display = 'block'
                }}
              />
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={loading || uploading}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shadow-sm"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</>
            ) : curso ? 'Actualizar Curso' : 'Crear Curso'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-slate-200 dark:border-slate-700"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}
