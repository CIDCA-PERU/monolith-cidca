'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCurso, updateCurso } from '@/actions/curso.actions'
import { CursoDTO, CreateCursoRequest } from '@/dto/curso.dto'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface CursoFormProps {
  curso?: CursoDTO
  onSuccess?: () => void
}

export function CursoForm({ curso, onSuccess }: CursoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    nombre: curso?.nombre || '',
    descripcion: curso?.descripcion || '',
    fecha_inicio: curso?.fecha_inicio?.split('T')[0] || '',
    fecha_fin: curso?.fecha_fin?.split('T')[0] || '',
    imagen_url: curso?.imagen_url || '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleImageUrlChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, imagen_url: value }))
    setErrors((prev) => ({ ...prev, imagen_url: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const request: CreateCursoRequest = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        fecha_inicio: new Date(formData.fecha_inicio).toISOString(),
        fecha_fin: new Date(formData.fecha_fin).toISOString(),
        imagen_url: formData.imagen_url || undefined,
      }

      let result

      if (curso) {
        result = await updateCurso(curso.id, {
          ...request,
        })
      } else {
        result = await createCurso(request)
      }

      if (!result.success) {
        toast.error(result.error || 'Error al guardar curso')
        return
      }

      toast.success(
        curso ? 'Curso actualizado correctamente' : 'Curso creado correctamente'
      )
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
    <Card className="p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        {curso ? 'Editar Curso' : 'Crear Nuevo Curso'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="nombre" className="text-foreground mb-2 block">
            Nombre del Curso
          </Label>
          <Input
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: Introducción a Python"
            className="bg-input border-border"
            required
          />
          {errors.nombre && (
            <p className="text-destructive text-sm mt-1">{errors.nombre}</p>
          )}
        </div>

        <div>
          <Label htmlFor="descripcion" className="text-foreground mb-2 block">
            Descripción
          </Label>
          <Textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Descripción del curso"
            className="bg-input border-border"
            rows={4}
            required
          />
          {errors.descripcion && (
            <p className="text-destructive text-sm mt-1">
              {errors.descripcion}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fecha_inicio" className="text-foreground mb-2 block">
              Fecha de Inicio
            </Label>
            <Input
              id="fecha_inicio"
              name="fecha_inicio"
              type="date"
              value={formData.fecha_inicio}
              onChange={handleChange}
              className="bg-input border-border"
              required
            />
          </div>
          <div>
            <Label htmlFor="fecha_fin" className="text-foreground mb-2 block">
              Fecha de Fin
            </Label>
            <Input
              id="fecha_fin"
              name="fecha_fin"
              type="date"
              value={formData.fecha_fin}
              onChange={handleChange}
              className="bg-input border-border"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="imagen_url" className="text-foreground mb-2 block">
            URL de Imagen del Curso
          </Label>
          <Input
            id="imagen_url"
            name="imagen_url"
            type="url"
            value={formData.imagen_url}
            onChange={handleImageUrlChange}
            placeholder="https://example.com/imagen.jpg"
            className="bg-input border-border"
          />
          {errors.imagen_url && (
            <p className="text-destructive text-sm mt-1">{errors.imagen_url}</p>
          )}
          
          {formData.imagen_url && (
            <div className="mt-4">
              <p className="text-sm font-medium text-foreground mb-2">Preview:</p>
              <img
                src={formData.imagen_url}
                alt="Preview del curso"
                className="w-full h-48 object-cover rounded-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="bg-accent text-primary hover:bg-accent/90"
          >
            {loading
              ? 'Guardando...'
              : curso
              ? 'Actualizar Curso'
              : 'Crear Curso'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}
