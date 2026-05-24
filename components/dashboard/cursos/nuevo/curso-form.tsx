'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createCurso, updateCurso } from '@/actions/curso.actions'
import { uploadCursoImagen, deleteCursoImagen } from '@/actions/admin.actions'
import { getHorariosByCurso, saveHorariosByCurso } from '@/actions/horario.actions'
import { CursoDTO, CreateCursoRequest } from '@/dto/curso.dto'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Upload, ImageIcon, Link2, X, Loader2, Plus, Trash2, Clock } from 'lucide-react'

interface CursoFormProps {
  curso?: CursoDTO
  onSuccess?: () => void
}

type HorarioLocal = {
  hor_cur_id_int?: number   // undefined = fila nueva, número = fila existente en BD
  hor_cur_dia_int: number   // 1=Lunes ... 7=Domingo
  hor_cur_inic_tmp: string
  hor_cur_fin_tmp: string
}

export function CursoForm({ curso, onSuccess }: CursoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  // ── Horarios ─────────────────────────────────────────────────────────────────
  const [horarios, setHorarios] = useState<HorarioLocal[]>([])
  const initialHorariosRef = useRef<HorarioLocal[]>([])
  const [loadingHorarios, setLoadingHorarios] = useState(false)

  // Cargar horarios existentes si es edición
  useEffect(() => {
    if (!curso?.id) return
    setLoadingHorarios(true)
    getHorariosByCurso(curso.id).then((res) => {
      if (res.success && res.data) {
        const mapped = res.data.map((h) => ({
          hor_cur_id_int:  h.hor_cur_id_int,
          hor_cur_dia_int: h.hor_cur_dia_int,
          hor_cur_inic_tmp: h.hor_cur_inic_tmp,
          hor_cur_fin_tmp:  h.hor_cur_fin_tmp,
        }))
        setHorarios(mapped)
        initialHorariosRef.current = mapped
      }
      setLoadingHorarios(false)
    })
  }, [curso?.id])

  const [formData, setFormData] = useState({
    nombre: curso?.nombre || '',
    descripcion: curso?.descripcion || '',
    fecha_inicio: curso?.fecha_inicio?.split('T')[0] || '',
    fecha_fin: curso?.fecha_fin?.split('T')[0] || '',
    zoom_url: curso?.zoom_url || '',
    imagen_url: curso?.imagen_url || '',
  })

  // Track initial values to detect unsaved changes
  const initialFormDataRef = useRef(formData)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    const hasFieldChanges = Object.entries(formData).some(
      ([key, value]) => value !== initialFormDataRef.current[key as keyof typeof formData]
    )
    const hasHorarioChanges = JSON.stringify(horarios) !== JSON.stringify(initialHorariosRef.current)
    setHasUnsavedChanges(hasFieldChanges || hasHorarioChanges)
  }, [formData, horarios])

  // Warn user on browser/tab close or refresh
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsavedChanges])

  // Intercept ALL internal link clicks when there are unsaved changes
  const unsavedRef = useRef(hasUnsavedChanges)
  useEffect(() => { unsavedRef.current = hasUnsavedChanges }, [hasUnsavedChanges])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!unsavedRef.current) return
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return
      // Only intercept internal links (same origin)
      if (anchor.origin !== window.location.origin) return
      // Don't intercept target="_blank"
      if (anchor.target === '_blank') return
      e.preventDefault()
      e.stopPropagation()
      const confirmed = window.confirm('Tienes cambios sin guardar. ¿Estás seguro de salir?')
      if (confirmed) {
        unsavedRef.current = false
        window.location.href = anchor.href
      }
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])



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

  // ── Imagen: estado local (NO se sube al bucket hasta guardar) ─────────────────

  // Archivo pendiente de subir (se sube al presionar Actualizar/Crear)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  // Preview local del archivo seleccionado
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  // Indica que el usuario quiere borrar la imagen actual (se borra al guardar)
  const [pendingDeleteUrl, setPendingDeleteUrl] = useState<string | null>(null)

  // Cleanup del object URL al desmontar o cambiar
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileSelect = (file: File) => {
    if (!file) return
    // Si ya había un preview anterior, liberar
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const url = URL.createObjectURL(file)
    setPendingFile(file)
    setPreviewUrl(url)
    // Marcar como cambio pendiente: el imagen_url cambiará al guardar
    // Poner un valor temporal para que hasUnsavedChanges detecte el cambio
    setFormData((prev) => ({ ...prev, imagen_url: '__pending_upload__' }))
    toast.success('Imagen seleccionada. Presiona Actualizar para aplicar.')
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const clearImage = () => {
    // Si hay una imagen guardada en el server, marcarla para borrar al guardar
    const currentSavedUrl = initialFormDataRef.current.imagen_url
    if (currentSavedUrl && currentSavedUrl !== '__pending_upload__') {
      setPendingDeleteUrl(currentSavedUrl)
    }
    // Limpiar estado local
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPendingFile(null)
    setFormData((prev) => ({ ...prev, imagen_url: '' }))
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info('Imagen marcada para eliminar. Presiona Actualizar para aplicar.')
  };

  const [showModal, setShowModal] = useState(false);

  // La URL a mostrar en el preview: si hay archivo pendiente usar previewUrl, sino imagen_url del form
  const displayImageUrl = previewUrl || (formData.imagen_url !== '__pending_upload__' ? formData.imagen_url : '')
  const hasImage = Boolean(displayImageUrl)

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      let finalImageUrl = formData.imagen_url

      // 1. Si hay imagen pendiente de borrar del bucket, borrarla
      if (pendingDeleteUrl) {
        await deleteCursoImagen(pendingDeleteUrl)
        setPendingDeleteUrl(null)
      }

      // 2. Si la imagen anterior del server cambió (se va a reemplazar), borrar la vieja
      const oldSavedUrl = initialFormDataRef.current.imagen_url
      if (pendingFile && oldSavedUrl && oldSavedUrl !== '__pending_upload__') {
        await deleteCursoImagen(oldSavedUrl)
      }

      // 3. Si hay archivo pendiente de subir, subirlo al bucket
      if (pendingFile) {
        setUploading(true)
        const fd = new FormData()
        fd.append('file', pendingFile)
        fd.append('cursoNombre', formData.nombre || 'CURSO')
        const uploadResult = await uploadCursoImagen(fd)
        setUploading(false)
        if (uploadResult.success && uploadResult.url) {
          finalImageUrl = uploadResult.url
        } else {
          toast.error(uploadResult.error ?? 'Error al subir imagen')
          setLoading(false)
          return
        }
      }

      // Si el usuario marcó eliminar y no subió nueva, finalImageUrl queda ''
      if (finalImageUrl === '__pending_upload__') finalImageUrl = ''

      const normalizedImageUrl = normalizeImageUrl(finalImageUrl)
      const zoomUrlTrimmed = formData.zoom_url.trim()

      const request: CreateCursoRequest = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        fecha_inicio: new Date(formData.fecha_inicio).toISOString(),
        fecha_fin: new Date(formData.fecha_fin).toISOString(),
        // Si normalizedImageUrl está vacío, mandar null para limpiar la referencia en la tabla
        imagen_url: normalizedImageUrl || null,
        // zoom_url: siempre se envía (para create y update explícito)
        zoom_url: zoomUrlTrimmed || null,
      }

      let result
      if (curso) {
        // Para update: no incluir zoom_url si no cambió respecto al valor inicial
        // (evita sobreescribir con null cuando el campo no cargó correctamente)
        const updatePayload: Partial<CreateCursoRequest> = { ...request }
        const initialZoom = (initialFormDataRef.current.zoom_url || '').trim()
        if (zoomUrlTrimmed === initialZoom) {
          delete updatePayload.zoom_url
        }
        result = await updateCurso(curso.id, { ...updatePayload })
      } else {
        result = await createCurso(request)
      }

      if (!result.success) {
        toast.error(result.error || 'Error al guardar curso')
        return
      }

      toast.success(curso ? 'Curso actualizado' : 'Curso creado correctamente')

      // Guardar horarios (siempre, para crear y editar)
      const cursoId = curso ? curso.id : result.data?.id
      if (cursoId) {
        const horRes = await saveHorariosByCurso(cursoId, horarios)
        if (!horRes.success) {
          toast.error('Curso guardado pero error al guardar horarios: ' + horRes.error)
        } else {
          initialHorariosRef.current = [...horarios]
        }
      }
      // Limpiar estado pendiente
      setPendingFile(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setPendingDeleteUrl(null)
      // Actualizar ref de valores iniciales con la imagen final
      const savedFormData = { ...formData, imagen_url: finalImageUrl }
      initialFormDataRef.current = savedFormData
      setFormData(savedFormData)
      setHasUnsavedChanges(false)
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

  return (
    <Card className="w-full p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
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

        {/* ── Enlace de Zoom ───────────────────────────────────────────────── */}
        <div>
          <Label htmlFor="zoom_url" className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 text-blue-500" />
            Enlace de la Reunión
          </Label>
          <Input
            id="zoom_url"
            name="zoom_url"
            type="url"
            value={formData.zoom_url}
            onChange={handleChange}
            placeholder="https://zoom.us/j/..."
            className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          />
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Los alumnos verán este botón en el aula virtual para unirse a la clase.
          </p>
        </div>

        {/* ── Horarios de Clase ────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              Horarios de Clase
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setHorarios((prev) => [
                ...prev,
                { hor_cur_dia_int: 1, hor_cur_inic_tmp: '08:00', hor_cur_fin_tmp: '10:00' },
              ])}
              className="cursor-pointer gap-1.5 text-xs h-7 px-2 border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-500/10"
            >
              <Plus className="h-3.5 w-3.5" />
              Añadir horario
            </Button>
          </div>

          {loadingHorarios ? (
            <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cargando horarios...
            </div>
          ) : horarios.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-5 text-center">
              <Clock className="h-6 w-6 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Sin horarios definidos. Añade uno con el botón de arriba.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {horarios.map((h, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700"
                >
                  {/* Día */}
                  <select
                    value={h.hor_cur_dia_int}
                    onChange={(e) =>
                      setHorarios((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, hor_cur_dia_int: Number(e.target.value) } : item
                        )
                      )
                    }
                    className="flex-1 min-w-0 text-xs h-8 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  >
                    <option value={1}>Lunes</option>
                    <option value={2}>Martes</option>
                    <option value={3}>Miércoles</option>
                    <option value={4}>Jueves</option>
                    <option value={5}>Viernes</option>
                    <option value={6}>Sábado</option>
                    <option value={7}>Domingo</option>
                  </select>

                  {/* Hora inicio */}
                  <span className="text-xs text-slate-400 shrink-0">De</span>
                  <Input
                    type="time"
                    value={h.hor_cur_inic_tmp}
                    onChange={(e) =>
                      setHorarios((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, hor_cur_inic_tmp: e.target.value } : item
                        )
                      )
                    }
                    className="w-28 h-8 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />

                  {/* Hora fin */}
                  <span className="text-xs text-slate-400 shrink-0">a</span>
                  <Input
                    type="time"
                    value={h.hor_cur_fin_tmp}
                    onChange={(e) =>
                      setHorarios((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, hor_cur_fin_tmp: e.target.value } : item
                        )
                      )
                    }
                    className="w-28 h-8 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />

                  {/* Eliminar */}
                  <button
                    type="button"
                    onClick={() => setHorarios((prev) => prev.filter((_, i) => i !== idx))}
                    className="cursor-pointer shrink-0 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    title="Eliminar horario"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Imagen del curso ───────────────────────────────────────────── */}
        <div>
          <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
            Imagen del Curso
          </Label>

          {/* Input de archivo SIEMPRE en el DOM para que fileInputRef funcione */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {/* Zona drag-and-drop (solo si NO hay imagen) */}
          {!hasImage && (
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
          )}

          {/* Preview */}
          {hasImage && (
            <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-semibold flex items-center gap-1">
                <ImageIcon className="h-3 w-3" /> Preview
              </div>
              <img
                src={displayImageUrl}
                alt="Preview del curso"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
                onLoad={(e) => {
                  e.currentTarget.style.display = 'block'
                }}
              />
              <div className="absolute bottom-2 right-2 flex space-x-2">
                <a
                  href={displayImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-black/60 text-white rounded hover:bg-black/80 transition text-xs"
                >
                  Ver
                </a>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer px-2 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 transition text-xs"
                >
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={clearImage}
                  className="cursor-pointer px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs"
                >
                  Eliminar
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="cursor-pointer px-2 py-1 bg-slate-700 text-white rounded hover:bg-slate-800 transition text-xs"
                >
                  Ampliar
                </button>
              </div>
            </div>
          )}
          {showModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="relative max-w-3xl max-h-[90vh]">
                <img
                  src={displayImageUrl}
                  alt="Imagen ampliada"
                  className="max-w-full max-h-[90vh] object-contain rounded"
                />
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cursor-pointer absolute top-2 right-2 text-white bg-black/60 rounded-full p-1 hover:bg-black/80"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          {hasUnsavedChanges && (
            <Button
              type="submit"
              disabled={loading || uploading}
              className=" cursor-pointer bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shadow-sm"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</>
              ) : curso ? 'Actualizar Curso' : 'Crear Curso'}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (hasUnsavedChanges) {
                const confirmLeave = window.confirm('Tienes cambios pendientes. ¿Estás seguro de salir?');
                if (!confirmLeave) return;
              }
              router.back();
            }}
            className="cursor-pointer border-slate-200 dark:border-slate-700"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}
