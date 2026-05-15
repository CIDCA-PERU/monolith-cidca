import 'server-only'
import { supabase } from '@/lib/supabase'

export type TipoDocumento = {
  doc_id_int: number
  doc_tipo_vac: string
  doc_desc_vac: string | null
}

// Tipos predeterminados si la tabla está vacía
const TIPOS_FALLBACK: TipoDocumento[] = [
  { doc_id_int: -1, doc_tipo_vac: 'DNI',                  doc_desc_vac: 'Documento Nacional de Identidad' },
  { doc_id_int: -2, doc_tipo_vac: 'CARNÉ DE EXTRANJERÍA', doc_desc_vac: 'Carné de Extranjería' },
  { doc_id_int: -3, doc_tipo_vac: 'PASAPORTE',             doc_desc_vac: 'Pasaporte' },
  { doc_id_int: -4, doc_tipo_vac: 'RUC',                   doc_desc_vac: 'Registro Único de Contribuyentes' },
]

/**
 * Obtiene todos los tipos de documento del catálogo.
 */
export async function getTiposDocumento(): Promise<TipoDocumento[]> {
  const { data, error } = await supabase
    .from('documento')
    .select('doc_id_int, doc_tipo_vac, doc_desc_vac')
    .order('doc_id_int')

  if (error || !data || data.length === 0) {
    return TIPOS_FALLBACK
  }

  return data as TipoDocumento[]
}

/**
 * Verifica si ya existe una combinación (tipo + número) en detalle_documento.
 * La unicidad es por: doc_tipo_vac + dtdoc_num_vac (case-insensitive en número).
 * Devuelve true si la combinación YA existe (bloqueante).
 */
export async function existeDocumento(
  docTipo: string,
  docNumero: string
): Promise<boolean> {
  // Buscamos detalle_documentos cuyo número coincida
  const { data, error } = await supabase
    .from('detalle_documento')
    .select(`
      det_doc_id_int,
      dtdoc_num_vac,
      documento:doc_id_int (
        doc_tipo_vac
      )
    `)
    .eq('dtdoc_num_vac', docNumero.trim().toUpperCase())

  if (error || !data || data.length === 0) return false

  // Filtra si además el tipo coincide
  return data.some((row: any) => {
    const tipo = Array.isArray(row.documento)
      ? row.documento[0]?.doc_tipo_vac
      : row.documento?.doc_tipo_vac
    return tipo?.toUpperCase() === docTipo.toUpperCase()
  })
}

/**
 * Crea el registro en detalle_documento para un estudiante.
 * Si el doc_id_int es negativo (fallback), busca o crea el tipo en documento primero.
 */
export async function crearDetalleDocumento(
  estuId: number,
  docIdInt: number,
  docTipo: string,
  docNumero: string
): Promise<void> {
  let docId = docIdInt

  // Si viene del fallback (id negativo), buscar o crear el tipo en documento
  if (docId < 0) {
    const { data: existente } = await supabase
      .from('documento')
      .select('doc_id_int')
      .ilike('doc_tipo_vac', docTipo)
      .single()

    if (existente) {
      docId = existente.doc_id_int
    } else {
      const { data: nuevo, error } = await supabase
        .from('documento')
        .insert({ doc_tipo_vac: docTipo.toUpperCase(), doc_desc_vac: docTipo })
        .select('doc_id_int')
        .single()

      if (error || !nuevo) {
        console.error('[documento.repository] No se pudo crear el tipo de documento:', error)
        return
      }
      docId = nuevo.doc_id_int
    }
  }

  const { error } = await supabase
    .from('detalle_documento')
    .insert({
      dtdoc_num_vac: docNumero.trim().toUpperCase(),
      doc_id_int: docId,
      estu_id_int: estuId,
    })

  if (error) {
    console.error('[documento.repository] crearDetalleDocumento - Error:', error)
  }
}
