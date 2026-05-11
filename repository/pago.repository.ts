import { supabase } from '@/lib/supabase/server';

/**
 * Obtiene todas las órdenes de pago del usuario/estudiante
 */
export async function getOrdenesByUsuario(usuarioId: number) {
  try {
    const { data, error } = await supabase
      .from('pago')
      .select(`
        pago_id_int,
        pago_uuid,
        estu_id_int,
        cur_id_int,
        pago_nro_vac,
        pago_mont_num,
        pago_estad_vac,
        pago_url_vac,
        pago_obs_vac,
        pago_cre_tmp,
        pago_upd_tmp,
        curso:cur_id_int (
          cur_id_int,
          cur_nomb_vac
        )
      `)
      .eq('estu_id_int', estudianteId)
      .order('pago_cre_tmp', { ascending: false });

    if (error) {
      console.error('Error getting ordenes by usuario:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception getting ordenes by usuario:', error);
    return [];
  }
}

/**
 * Obtiene una orden de pago específica
 */
export async function getOrdenById(pagoId: number) {
  try {
    const { data, error } = await supabase
      .from('pago')
      .select(`
        pago_id_int,
        pago_uuid,
        estu_id_int,
        cur_id_int,
        pago_nro_vac,
        pago_mont_num,
        pago_estad_vac,
        pago_url_vac,
        pago_obs_vac,
        pago_cre_tmp,
        pago_upd_tmp,
        curso:cur_id_int (
          cur_id_int,
          cur_nomb_vac,
          cur_desc_vac
        ),
        estudiante:estu_id_int (
          estu_id_int,
          estu_nomb_vac,
          estu_apell_pat_vac,
          estu_apell_mat_vac,
          usr_id_int
        )
      `)
      .eq('pago_id_int', pagoId)
      .single();

    if (error) {
      console.error('[v0] getOrdenById - Error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[v0] getOrdenById - Exception:', error);
    return null;
  }
}

/**
 * Actualiza el URL del comprobante de pago
 */
export async function updateComprobanteVoucher(
  pagoId: number,
  voucherPath: string
) {
  try {
    const { error } = await supabase
      .from('pago')
      .update({ pago_url_vac: voucherPath })
      .eq('pago_id_int', pagoId);

    if (error) {
      console.error('[v0] updateComprobanteVoucher - Error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[v0] updateComprobanteVoucher - Exception:', error);
    return false;
  }
}

/**
 * Obtiene datos del estudiante para el renombrado
 */
export async function getEstudianteDatos(estudianteId: number) {
  try {
    const { data, error } = await supabase
      .from('estudiante')
      .select(`
        estu_id_int,
        estu_nomb_vac,
        estu_apell_pat_vac,
        estu_apell_mat_vac,
        usuario:usr_id_int (
          usr_id_int,
          usr_nomb_vac
        )
      `)
      .eq('estu_id_int', estudianteId)
      .single();

    if (error) {
      console.error('[v0] getEstudianteDatos - Error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[v0] getEstudianteDatos - Exception:', error);
    return null;
  }
}

/**
 * Obtiene datos del usuario/estudiante para generar nombres de archivo
 */
export async function getUsuarioDatos(estudianteId: number) {
  try {
    const { data, error } = await supabase
      .from('estudiante')
      .select(`
        estu_id_int,
        estu_nomb_vac,
        estu_apell_pat_vac,
        estu_apell_mat_vac
      `)
      .eq('estu_id_int', estudianteId)
      .single();

    if (error) {
      console.error('Error getting usuario datos:', error);
      return null;
    }

    return {
      id: data?.estu_id_int,
      nombre: data?.estu_nomb_vac,
      primer_apellido: data?.estu_apell_pat_vac,
      segundo_apellido: data?.estu_apell_mat_vac,
    };
  } catch (error) {
    console.error('Exception getting usuario datos:', error);
    return null;
  }
}

