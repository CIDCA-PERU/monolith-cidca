'use server';

import { supabase } from '@/lib/supabase';
import { getCurrentUser } from './auth.actions';

function generateVoucherFilename(
  apellido1: string,
  apellido2: string,
  nombre: string,
  cursNomb: string,
  monto: number,
  ext: string
): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');

  const cleanNombre = nombre
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9-]/g, '');
  const cleanApe1 = apellido1.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  const cleanApe2 = (apellido2 || '')
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '');
  const cleanCurso = cursNomb
    .toUpperCase()
    .substring(0, 20)
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9-]/g, '');
  const montoStr = monto.toFixed(0);

  return `${cleanApe1}-${cleanApe2}-${cleanNombre}-${cleanCurso}-${montoStr}-${dd}-${mm}-${yyyy}-${hh}-${mins}-${ss}-${ms}.${ext}`;
}

/**
 * Sube el comprobante de pago a Supabase
 */

interface PagoConCurso {
  pago_id_int: number;
  pago_uuid: string;
  estu_id_int: number;
  cur_id_int: number;
  pago_mont_num: number;
  pago_estad_vac: string;
  pago_url_vac: string | null;
  pago_obs_vac: string | null;
  pago_cre_tmp: string;
  pago_upd_tmp: string;
  curso: Array<{
    cur_id_int: number;
    cur_nomb_vac: string;
  }>;
}

export async function uploadVoucher(
  formData: FormData
) {
  try {
    // 1. Extraemos los datos del FormData
    const file = formData.get('file') as File | null;
    const pagoIdString = formData.get('pagoId') as string | null;

    if (!file || !pagoIdString) {
      return { success: false, error: 'Archivo o ID de pago faltante.' };
    }

    const pagoId = parseInt(pagoIdString, 10);

    // 2. Verificar que el usuario esté autenticado
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'No estás autenticado' };
    }

    // 3. Obtener datos de la orden (resto del código casi idéntico)
    const { data: orden, error: orderError } = await supabase
      .from('pago')
      .select(`
        pago_id_int,
        estu_id_int,
        pago_mont_num,
        pago_estad_vac,
        pago_url_vac,
        curso:cur_id_int ( cur_nomb_vac )
      `)
      .eq('pago_id_int', pagoId)
      .single();

    if (orderError || !orden) {
      return { success: false, error: 'Orden no encontrada' };
    }

    // Verificar que el pago pertenezca al usuario autenticado
    const { data: estudianteUser } = await supabase
      .from('estudiante')
      .select('estu_id_int, usr_id_int')
      .eq('estu_id_int', orden.estu_id_int)
      .single();

    if (!estudianteUser || estudianteUser.usr_id_int !== user.usr_id_int) {
      return {
        success: false,
        error: 'No tienes permiso para subir archivos a este pago',
      };
    }

    // Validar que el estado no sea PAGADO o ACEPTADO (no se pueden cambiar)
    if (orden.pago_estad_vac === 'PAGADO' || orden.pago_estad_vac === 'ACEPTADO') {
      return {
        success: false,
        error: 'Este pago ya ha sido verificado y no se puede modificar',
      };
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'image/jpeg',
      'image/png',
    ];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Solo se permiten imágenes (JPG, JPEG o PNG)',
      };
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: 'El archivo no debe exceder 5MB',
      };
    }

    // Obtener datos del estudiante
    const { data: usuarioDatos, error: usuarioError } = await supabase
      .from('estudiante')
      .select(`
        estu_id_int,
        estu_nomb_vac,
        estu_apell_pat_vac,
        estu_apell_mat_vac
      `)
      .eq('estu_id_int', orden.estu_id_int)
      .single();

    if (usuarioError || !usuarioDatos) {
      return {
        success: false,
        error: 'No se encontraron datos del estudiante',
      };
    }

    // Generar nombre de archivo
    const ext = file.type === 'image/png' ? 'pdf' : 'jpg';
    const cursoNombre = (orden.curso && orden.curso.length > 0) 
      ? orden.curso[0].cur_nomb_vac 
      : 'CURSO';
    
    const filename = generateVoucherFilename(
      usuarioDatos.estu_apell_pat_vac || '',
      usuarioDatos.estu_apell_mat_vac || '',
      usuarioDatos.estu_nomb_vac || '',
      cursoNombre || 'CURSO',
      orden.pago_mont_num,
      ext
    );

    const path = `vouchers/${filename}`;

    // Eliminar archivo anterior si existe
    if (orden.pago_url_vac) {
      try {
        await supabase.storage
          .from('student-private')
          .remove([orden.pago_url_vac]);
      } catch (err) {
        console.error('Error deleting old voucher:', err);
        // No detener el proceso si falla la eliminación
      }
    }

    // Subir a Supabase
    const { data, error } = await supabase.storage
      .from('student-private')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      return {
        success: false,
        error: `Error al subir archivo: ${error.message}`,
      };
    }

    // Generar URL pública permanente
    const { data: urlData } = supabase.storage
      .from('student-private')
      .getPublicUrl(path);

    const publicUrl = urlData?.publicUrl || '';

    // Actualizar registro en BD con el PATH (no la URL, solo el path)
    const { error: updateError } = await supabase
      .from('pago')
      .update({ 
        pago_url_vac: path,
        pago_estad_vac: 'ENVIADO',
        pago_upd_tmp: new Date().toISOString(),
      })
      .eq('pago_id_int', pagoId);

    if (updateError) {
      return {
        success: false,
        error: 'Error al guardar datos del comprobante',
      };
    }

    return {
      success: true,
      message: 'Comprobante enviado exitosamente',
      url: path,
    };
  } catch (error) {
    console.error('Error uploading voucher:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}