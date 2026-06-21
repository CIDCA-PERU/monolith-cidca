import { sql } from '@/lib/db';

export async function getOrdenesByUsuario(usuarioId: number) {
  try {
    const rows = await sql`
      SELECT 
        p.pago_id_int,
        p.pago_uuid,
        p.estu_id_int,
        p.cur_id_int,
        p.pago_nro_vac,
        p.pago_mont_num,
        p.pago_estad_vac,
        p.pago_url_vac,
        p.pago_obs_vac,
        p.pago_cre_tmp,
        p.pago_upd_tmp,
        json_build_object(
          'cur_id_int', c.cur_id_int,
          'cur_nomb_vac', c.cur_nomb_vac
        ) as curso
      FROM pago p
      LEFT JOIN curso c ON p.cur_id_int = c.cur_id_int
      WHERE p.estu_id_int = ${usuarioId}
      ORDER BY p.pago_cre_tmp DESC
    `

    return rows;
  } catch (error) {
    console.error('Exception getting ordenes by usuario:', error);
    return [];
  }
}

export async function getOrdenById(pagoId: number) {
  try {
    const rows = await sql`
      SELECT 
        p.pago_id_int,
        p.pago_uuid,
        p.estu_id_int,
        p.cur_id_int,
        p.pago_nro_vac,
        p.pago_mont_num,
        p.pago_estad_vac,
        p.pago_url_vac,
        p.pago_obs_vac,
        p.pago_cre_tmp,
        p.pago_upd_tmp,
        json_build_object(
          'cur_id_int', c.cur_id_int,
          'cur_nomb_vac', c.cur_nomb_vac,
          'cur_desc_vac', c.cur_desc_vac
        ) as curso,
        json_build_object(
          'estu_id_int', e.estu_id_int,
          'estu_nomb_vac', e.estu_nomb_vac,
          'estu_apell_pat_vac', e.estu_apell_pat_vac,
          'estu_apell_mat_vac', e.estu_apell_mat_vac,
          'usr_id_int', e.usr_id_int
        ) as estudiante
      FROM pago p
      LEFT JOIN curso c ON p.cur_id_int = c.cur_id_int
      LEFT JOIN estudiante e ON p.estu_id_int = e.estu_id_int
      WHERE p.pago_id_int = ${pagoId}
      LIMIT 1
    `

    if (!rows.length) return null
    return rows[0];
  } catch (error) {
    console.error('[v0] getOrdenById - Exception:', error);
    return null;
  }
}

export async function updateComprobanteVoucher(
  pagoId: number,
  voucherPath: string
) {
  try {
    await sql`
      UPDATE pago
      SET pago_url_vac = ${voucherPath}
      WHERE pago_id_int = ${pagoId}
    `
    return true;
  } catch (error) {
    console.error('[v0] updateComprobanteVoucher - Exception:', error);
    return false;
  }
}

export async function getEstudianteDatos(estudianteId: number) {
  try {
    const rows = await sql`
      SELECT 
        e.estu_id_int,
        e.estu_nomb_vac,
        e.estu_apell_pat_vac,
        e.estu_apell_mat_vac,
        json_build_object(
          'usr_id_int', u.usr_id_int,
          'usr_nomb_vac', u.usr_nomb_vac
        ) as usuario
      FROM estudiante e
      LEFT JOIN usuarios u ON e.usr_id_int = u.usr_id_int
      WHERE e.estu_id_int = ${estudianteId}
      LIMIT 1
    `
    if (!rows.length) return null
    return rows[0];
  } catch (error) {
    console.error('[v0] getEstudianteDatos - Exception:', error);
    return null;
  }
}

export async function getUsuarioDatos(estudianteId: number) {
  try {
    const rows = await sql`
      SELECT 
        estu_id_int,
        estu_nomb_vac,
        estu_apell_pat_vac,
        estu_apell_mat_vac
      FROM estudiante
      WHERE estu_id_int = ${estudianteId}
      LIMIT 1
    `

    if (!rows.length) return null
    const data = rows[0]

    return {
      id: data.estu_id_int,
      nombre: data.estu_nomb_vac,
      primer_apellido: data.estu_apell_pat_vac,
      segundo_apellido: data.estu_apell_mat_vac,
    };
  } catch (error) {
    console.error('Exception getting usuario datos:', error);
    return null;
  }
}

export async function acceptPagoOrder(pagoId: number) {
  try {
    await sql`
      UPDATE pago
      SET 
        pago_estad_vac = 'ACEPTADO',
        pago_upd_tmp = NOW()
      WHERE pago_id_int = ${pagoId}
    `
    return true;
  } catch (error) {
    console.error('[v0] acceptPagoOrder - Exception:', error);
    return false;
  }
}

export async function createEstudianteCursoFromPago(
  estudianteId: number,
  cursoId: number
) {
  try {
    const existingRows = await sql`
      SELECT est_id_int 
      FROM estudiante_curso 
      WHERE est_id_int = ${estudianteId} 
      AND cur_id_int = ${cursoId}
      LIMIT 1
    `

    if (existingRows.length > 0) {
      await sql`
        UPDATE estudiante_curso
        SET 
          est_cur_estado_bol = true,
          est_cur_upd_tmp = NOW()
        WHERE est_id_int = ${estudianteId}
        AND cur_id_int = ${cursoId}
      `
      return true;
    }

    await sql`
      INSERT INTO estudiante_curso (
        est_id_int,
        cur_id_int,
        est_cur_estado_bol,
        est_cur_cre_tmp,
        est_cur_upd_tmp
      ) VALUES (
        ${estudianteId},
        ${cursoId},
        true,
        NOW(),
        NOW()
      )
    `

    return true;
  } catch (error) {
    console.error('[v0] createEstudianteCursoFromPago - Exception:', error);
    return false;
  }
}
