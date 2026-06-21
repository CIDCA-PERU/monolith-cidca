import 'server-only'
import { sql } from '@/lib/db'

export type TipoDocumento = {
  doc_id_int: number
  doc_tipo_vac: string
  doc_desc_vac: string | null
}

const TIPOS_FALLBACK: TipoDocumento[] = [
  { doc_id_int: -1, doc_tipo_vac: 'DNI',                  doc_desc_vac: 'Documento Nacional de Identidad' },
  { doc_id_int: -2, doc_tipo_vac: 'CARNÉ DE EXTRANJERÍA', doc_desc_vac: 'Carné de Extranjería' },
  { doc_id_int: -3, doc_tipo_vac: 'PASAPORTE',             doc_desc_vac: 'Pasaporte' },
  { doc_id_int: -4, doc_tipo_vac: 'RUC',                   doc_desc_vac: 'Registro Único de Contribuyentes' },
]

export async function getTiposDocumento(): Promise<TipoDocumento[]> {
  try {
    const rows = await sql<TipoDocumento[]>`
      SELECT doc_id_int, doc_tipo_vac, doc_desc_vac
      FROM documento
      ORDER BY doc_id_int ASC
    `
    if (!rows.length) return TIPOS_FALLBACK
    return rows
  } catch (error) {
    return TIPOS_FALLBACK
  }
}

export async function existeDocumento(
  docTipo: string,
  docNumero: string
): Promise<boolean> {
  try {
    const rows = await sql`
      SELECT 
        d.det_doc_id_int,
        d.dtdoc_num_vac,
        doc.doc_tipo_vac
      FROM detalle_documento d
      JOIN documento doc ON d.doc_id_int = doc.doc_id_int
      WHERE UPPER(d.dtdoc_num_vac) = ${docNumero.trim().toUpperCase()}
    `

    if (!rows.length) return false

    return rows.some((row: any) => row.doc_tipo_vac?.toUpperCase() === docTipo.toUpperCase())
  } catch (error) {
    return false
  }
}

export async function crearDetalleDocumento(
  estuId: number,
  docIdInt: number,
  docTipo: string,
  docNumero: string
): Promise<void> {
  let docId = docIdInt

  try {
    if (docId < 0) {
      const rows = await sql`
        SELECT doc_id_int FROM documento
        WHERE doc_tipo_vac ILIKE ${docTipo}
        LIMIT 1
      `

      if (rows.length > 0) {
        docId = rows[0].doc_id_int
      } else {
        const insertRows = await sql`
          INSERT INTO documento (doc_tipo_vac, doc_desc_vac)
          VALUES (${docTipo.toUpperCase()}, ${docTipo})
          RETURNING doc_id_int
        `
        if (insertRows.length > 0) {
          docId = insertRows[0].doc_id_int
        } else {
          return
        }
      }
    }

    await sql`
      INSERT INTO detalle_documento (
        dtdoc_num_vac,
        doc_id_int,
        estu_id_int
      ) VALUES (
        ${docNumero.trim().toUpperCase()},
        ${docId},
        ${estuId}
      )
    `
  } catch (error) {
    console.error('[documento.repository] crearDetalleDocumento - Error:', error)
  }
}
