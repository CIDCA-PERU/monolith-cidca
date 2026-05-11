export interface ModuloDTO {
  id: string
  curso_id: string
  numero: number
  titulo: string
  descripcion: string
  estado: 'borrador' | 'publicado' | 'archivado'
  fecha_inicio: string
  fecha_fin: string
  orden: number
  created_at: string
}

export interface ApartadoDTO {
  id: string
  modulo_id: string
  numero: number
  titulo: string
  contenido: string
  tipo: 'leccion' | 'video' | 'archivo' | 'quiz'
  orden: number
  duracion_estimada: number // en minutos
  url_recurso?: string
  created_at: string
}

export interface CreateModuloRequest {
  titulo: string
  descripcion: string
  fecha_inicio: string
  fecha_fin: string
}

export interface CreateApartadoRequest {
  titulo: string
  contenido: string
  tipo: 'leccion' | 'video' | 'archivo' | 'quiz'
  duracion_estimada: number
  url_recurso?: string
}

export interface UpdateModuloRequest {
  titulo?: string
  descripcion?: string
  estado?: 'borrador' | 'publicado' | 'archivado'
  fecha_inicio?: string
  fecha_fin?: string
}

export interface UpdateApartadoRequest {
  titulo?: string
  contenido?: string
  tipo?: 'leccion' | 'video' | 'archivo' | 'quiz'
  duracion_estimada?: number
  url_recurso?: string
}
