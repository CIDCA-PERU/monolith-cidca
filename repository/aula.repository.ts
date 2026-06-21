import 'server-only'

import { sql } from '@/lib/db'

export type AulaCurso = {
  cur_id_int: number
  cur_uuid?: string | null
  cur_nomb_vac: string
  cur_desc_vac: string | null
  cur_url_vac?: string | null
  cur_zoom_url_vac?: string | null
  cur_est_int: number
  cur_fec_inic_tmp: string | null
  cur_fec_fin_tmp: string | null
  cur_precio_num?: number | null
}

export type AulaModulo = {
  mod_id_int: number
  mod_uuid?: string | null
  mod_nomb_vac: string | null
  mod_desc_vac: string | null
  mod_est_int: number
  cur_id_int: number
}

export type AulaApartado = {
  apar_id_int: number
  apar_nomb_vac: string | null
  apar_desc_vac: string | null
  apar_est_int: number
  mod_id_int: number
}

export type AulaItemApartado = {
  item_apar_id_int: number
  item_apar_tipo_vac: string | null
  item_apar_titulo_vac: string | null
  item_apar_url_vac: string | null
  item_apar_ordn_inte: number | null
  apar_id_int: number
}

export type AulaComentario = {
  com_cur_id_int: number
  com_cur_text_vac: string | null
  com_cur_cre_tmp: string | null
  usr_id_int: number | null
  apar_id_int: number | null
  autor_nombre: string | null
}

export type AulaPago = {
  pago_id_int: number
  pago_uuid?: string | null
  pago_nro_vac: string | null
  pago_url_vac: string | null
  pago_estad_vac: string | null
  pago_obs_vac: string | null
  pago_mont_num?: number | null
  pago_cre_tmp?: string | null
  cur_id_int: number | null
  curso?: Pick<AulaCurso, 'cur_id_int' | 'cur_nomb_vac' | 'cur_precio_num' | 'cur_desc_vac' | 'cur_fec_inic_tmp' | 'cur_fec_fin_tmp'> | null
}

export type AulaCertificado = {
  cert_id_int: number
  cert_uuid?: string | null
  cert_cod_vac: string | null
  cert_fec_emi_tmp: string | null
  cert_url_vac: string | null
  cur_id_int: number | null
  curso?: Pick<AulaCurso, 'cur_id_int' | 'cur_nomb_vac'> | null
}

export type TipoDocumento = {
  doc_id_int: number
  doc_tipo_vac: string | null
  doc_desc_vac: string | null
}

export async function getEstudianteByUserId(userId: number) {
  const rows = await sql`
    SELECT 
      e.estu_id_int,
      e.estu_nomb_vac,
      e.estu_apell_pat_vac,
      e.estu_apell_mat_vac,
      e.estu_gen_vac,
      e.usr_id_int,
      (
        SELECT COALESCE(json_agg(json_build_object('dtdoc_num_vac', d.dtdoc_num_vac, 'doc_id_int', d.doc_id_int)), '[]'::json)
        FROM detalle_documento d WHERE d.estu_id_int = e.estu_id_int
      ) as detalle_documento,
      (
        SELECT COALESCE(json_agg(json_build_object('tel_cod_pai_int', t.tel_cod_pai_int, 'tel_num_int', t.tel_num_int)), '[]'::json)
        FROM telefono t WHERE t.estu_id_int = e.estu_id_int
      ) as telefono
    FROM estudiante e
    WHERE e.usr_id_int = ${userId}
    LIMIT 1
  `

  if (!rows.length) return null
  return rows[0]
}

export async function getCursosByEstudiante(estuId: number): Promise<AulaCurso[]> {
  const rows = await sql`
    SELECT 
      c.cur_id_int,
      c.cur_uuid,
      c.cur_nomb_vac,
      c.cur_desc_vac,
      c.cur_url_vac,
      c.cur_zoom_url_vac,
      c.cur_est_int,
      c.cur_fec_inic_tmp,
      c.cur_fec_fin_tmp
    FROM estudiante_curso ec
    JOIN curso c ON ec.cur_id_int = c.cur_id_int
    WHERE ec.est_id_int = ${estuId}
    AND ec.est_cur_estado_bol = true
    AND c.cur_est_int = 1
  `
  return rows as unknown as AulaCurso[]
}

export async function getCursoById(curId: number): Promise<AulaCurso | null> {
  const rows = await sql`
    SELECT 
      cur_id_int, cur_uuid, cur_nomb_vac, cur_desc_vac, cur_url_vac, 
      cur_zoom_url_vac, cur_est_int, cur_fec_inic_tmp, cur_fec_fin_tmp
    FROM curso
    WHERE cur_id_int = ${curId}
    LIMIT 1
  `

  if (!rows.length || rows[0].cur_est_int === 0) return null
  return rows[0] as AulaCurso
}

export async function getCursoByUuid(curUuid: string): Promise<AulaCurso | null> {
  if (!curUuid) return null

  const rows = await sql`
    SELECT 
      cur_id_int, cur_uuid, cur_nomb_vac, cur_desc_vac, cur_url_vac, 
      cur_zoom_url_vac, cur_est_int, cur_fec_inic_tmp, cur_fec_fin_tmp
    FROM curso
    WHERE cur_uuid = ${curUuid}
    LIMIT 1
  `

  if (!rows.length || rows[0].cur_est_int === 0) return null
  return rows[0] as AulaCurso
}

export async function getModulosByCurso(curId: number): Promise<AulaModulo[]> {
  const rows = await sql<AulaModulo[]>`
    SELECT mod_id_int, mod_uuid, mod_nomb_vac, mod_desc_vac, mod_est_int, cur_id_int
    FROM modulo
    WHERE cur_id_int = ${curId}
    AND mod_est_int = 1
    ORDER BY mod_id_int ASC
  `
  return rows
}

export async function getModuloById(modId: number): Promise<AulaModulo | null> {
  const rows = await sql<AulaModulo[]>`
    SELECT mod_id_int, mod_uuid, mod_nomb_vac, mod_desc_vac, mod_est_int, cur_id_int
    FROM modulo
    WHERE mod_id_int = ${modId}
    LIMIT 1
  `
  return rows[0] || null
}

export async function getModuloByUuid(modUuid: string): Promise<AulaModulo | null> {
  if (!modUuid) return null

  const rows = await sql<AulaModulo[]>`
    SELECT mod_id_int, mod_uuid, mod_nomb_vac, mod_desc_vac, mod_est_int, cur_id_int
    FROM modulo
    WHERE mod_uuid = ${modUuid}
    LIMIT 1
  `
  return rows[0] || null
}

export async function getApartadosByModulo(modId: number): Promise<AulaApartado[]> {
  const rows = await sql<AulaApartado[]>`
    SELECT apar_id_int, apar_nomb_vac, apar_desc_vac, apar_est_int, mod_id_int
    FROM apartado
    WHERE mod_id_int = ${modId}
    AND apar_est_int = 1
    ORDER BY apar_ordn_int ASC, apar_id_int ASC
  `
  return rows
}

export async function getApartadosByModuloIds(
  moduloIds: number[]
): Promise<AulaApartado[]> {
  if (moduloIds.length === 0) return []

  const rows = await sql<AulaApartado[]>`
    SELECT apar_id_int, apar_nomb_vac, apar_desc_vac, apar_est_int, mod_id_int
    FROM apartado
    WHERE mod_id_int IN ${sql(moduloIds)}
    AND apar_est_int = 1
    ORDER BY apar_ordn_int ASC, apar_id_int ASC
  `
  return rows
}

export async function getItemsByApartados(
  apartadosIds: number[]
): Promise<AulaItemApartado[]> {
  if (apartadosIds.length === 0) return []

  const rows = await sql<AulaItemApartado[]>`
    SELECT item_apar_id_int, item_apar_tipo_vac, item_apar_titulo_vac, item_apar_url_vac, item_apar_ordn_inte, apar_id_int
    FROM item_apartado
    WHERE apar_id_int IN ${sql(apartadosIds)}
    AND item_apar_est_int = 1
    ORDER BY item_apar_ordn_inte ASC
  `
  return rows
}

export async function getComentariosByApartados(
  apartadosIds: number[]
): Promise<AulaComentario[]> {
  if (apartadosIds.length === 0) return []

  const rows = await sql`
    SELECT 
      c.com_cur_id_int, 
      c.com_cur_text_vac, 
      c.com_cur_cre_tmp, 
      c.apar_id_int,
      c.usr_id_int, 
      u.usr_nomb_vac,
      e.estu_nomb_vac,
      e.estu_apell_pat_vac
    FROM comentarios_curso c
    JOIN usuarios u ON c.usr_id_int = u.usr_id_int
    LEFT JOIN estudiante e ON u.usr_id_int = e.usr_id_int
    WHERE c.apar_id_int IN ${sql(apartadosIds)}
    ORDER BY c.com_cur_cre_tmp DESC
  `

  return rows.map((row: any) => {
    let autor = "Usuario CIDCA"
    
    if (row.estu_nomb_vac) {
      autor = `${row.estu_nomb_vac} ${row.estu_apell_pat_vac || ''}`.trim()
    } else if (row.usr_nomb_vac) {
      autor = row.usr_nomb_vac
    }

    return {
      com_cur_id_int: row.com_cur_id_int,
      com_cur_text_vac: row.com_cur_text_vac,
      com_cur_cre_tmp: row.com_cur_cre_tmp,
      apar_id_int: row.apar_id_int,
      usr_id_int: row.usr_id_int,
      autor_nombre: autor
    }
  })
}

export async function getPagosByEstudiante(estuId: number): Promise<AulaPago[]> {
  const rows = await sql`
    SELECT 
      p.pago_id_int,
      p.pago_uuid,
      p.pago_nro_vac,
      p.pago_url_vac,
      p.pago_estad_vac,
      p.pago_obs_vac,
      p.pago_mont_num,
      p.cur_id_int,
      json_build_object(
        'cur_id_int', c.cur_id_int,
        'cur_nomb_vac', c.cur_nomb_vac,
        'cur_precio_num', c.cur_precio_num,
        'cur_desc_vac', c.cur_desc_vac,
        'cur_fec_inic_tmp', c.cur_fec_inic_tmp,
        'cur_fec_fin_tmp', c.cur_fec_fin_tmp
      ) as curso
    FROM pago p
    LEFT JOIN curso c ON p.cur_id_int = c.cur_id_int
    WHERE p.estu_id_int = ${estuId}
    ORDER BY p.pago_cre_tmp DESC
  `

  return rows as unknown as AulaPago[]
}

export async function getPagoById(pagoId: number): Promise<AulaPago | null> {
  const rows = await sql`
    SELECT 
      p.pago_id_int,
      p.pago_uuid,
      p.pago_nro_vac,
      p.pago_url_vac,
      p.pago_estad_vac,
      p.pago_obs_vac,
      p.pago_mont_num,
      p.cur_id_int,
      json_build_object(
        'cur_id_int', c.cur_id_int,
        'cur_nomb_vac', c.cur_nomb_vac,
        'cur_precio_num', c.cur_precio_num,
        'cur_desc_vac', c.cur_desc_vac,
        'cur_fec_inic_tmp', c.cur_fec_inic_tmp,
        'cur_fec_fin_tmp', c.cur_fec_fin_tmp
      ) as curso
    FROM pago p
    LEFT JOIN curso c ON p.cur_id_int = c.cur_id_int
    WHERE p.pago_id_int = ${pagoId}
    LIMIT 1
  `

  if (!rows.length) return null
  return rows[0] as AulaPago
}

export async function getPagoByUuid(pagoUuid: string): Promise<AulaPago | null> {
  if (!pagoUuid) return null

  const rows = await sql`
    SELECT 
      p.pago_id_int,
      p.pago_uuid,
      p.pago_nro_vac,
      p.pago_url_vac,
      p.pago_estad_vac,
      p.pago_obs_vac,
      p.pago_mont_num,
      p.cur_id_int,
      json_build_object(
        'cur_id_int', c.cur_id_int,
        'cur_nomb_vac', c.cur_nomb_vac,
        'cur_precio_num', c.cur_precio_num,
        'cur_desc_vac', c.cur_desc_vac,
        'cur_fec_inic_tmp', c.cur_fec_inic_tmp,
        'cur_fec_fin_tmp', c.cur_fec_fin_tmp
      ) as curso
    FROM pago p
    LEFT JOIN curso c ON p.cur_id_int = c.cur_id_int
    WHERE p.pago_uuid = ${pagoUuid}
    LIMIT 1
  `

  if (!rows.length) return null
  return rows[0] as AulaPago
}

export async function getCertificadosByEstudiante(
  estuId: number
): Promise<AulaCertificado[]> {
  const rows = await sql`
    SELECT 
      c.cert_id_int,
      c.cert_uuid,
      c.cert_cod_vac,
      c.cert_fec_emi_tmp,
      c.cert_url_vac,
      c.cur_id_int,
      json_build_object(
        'cur_id_int', cu.cur_id_int,
        'cur_nomb_vac', cu.cur_nomb_vac
      ) as curso
    FROM certificado c
    LEFT JOIN curso cu ON c.cur_id_int = cu.cur_id_int
    WHERE c.estu_id_int = ${estuId}
    ORDER BY c.cert_fec_emi_tmp DESC
  `
  return rows as unknown as AulaCertificado[]
}

export async function getTiposDocumento(): Promise<TipoDocumento[]> {
  const rows = await sql<TipoDocumento[]>`
    SELECT doc_id_int, doc_tipo_vac, doc_desc_vac
    FROM documento
    ORDER BY doc_tipo_vac ASC
  `
  return rows
}
