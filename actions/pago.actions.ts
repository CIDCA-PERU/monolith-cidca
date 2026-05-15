'use server';

import { supabase } from '@/lib/supabase';
import { assertAuthenticated, assertEstudiante, assertAdminOrCoordinador } from '@/lib/auth-guards';
import {
  acceptPagoOrder,
  createEstudianteCursoFromPago,
  getOrdenById,
} from '@/repository/pago.repository';

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

  const cleanNombre = nombre.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');
  const cleanApe1 = apellido1.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  const cleanApe2 = (apellido2 || '').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  const cleanCurso = cursNomb.toUpperCase().substring(0, 20).replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');
  const montoStr = monto.toFixed(0);

  return `${cleanApe1}-${cleanApe2}-${cleanNombre}-${cleanCurso}-${montoStr}-${dd}-${mm}-${yyyy}-${hh}-${mins}-${ss}-${ms}.${ext}`;
}

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
  curso: Array<{ cur_id_int: number; cur_nomb_vac: string }>;
}

/**
 * Sube el comprobante de pago a Supabase.
 * Solo ESTUDIANTE puede subir su propio comprobante.
 */
export async function uploadVoucher(formData: FormData) {
  try {
    // 1. Solo estudiantes suben comprobantes
    const user = await assertAuthenticated();
    assertEstudiante(user);

    // 2. Extraer datos del FormData
    const file = formData.get('file') as File | null;
    const pagoIdString = formData.get('pagoId') as string | null;

    if (!file || !pagoIdString) {
      return { success: false, error: 'Archivo o ID de pago faltante.' };
    }

    const pagoId = parseInt(pagoIdString, 10);

    // 3. Obtener datos de la orden
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

    // 4. Verificar que el pago pertenezca al estudiante autenticado
    const { data: estudianteUser } = await supabase
      .from('estudiante')
      .select('estu_id_int, usr_id_int')
      .eq('estu_id_int', orden.estu_id_int)
      .single();

    if (!estudianteUser || estudianteUser.usr_id_int !== user.usr_id_int) {
      return { success: false, error: 'No tienes permiso para subir archivos a este pago' };
    }

    // 5. Validar estado del pago
    if (orden.pago_estad_vac === 'PAGADO' || orden.pago_estad_vac === 'ACEPTADO') {
      return { success: false, error: 'Este pago ya ha sido verificado y no se puede modificar' };
    }

    // 6. Validar tipo de archivo (MIME)
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Solo se permiten imágenes (JPG o PNG)' };
    }

    // 7. Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'El archivo no debe exceder 5MB' };
    }

    // 8. Obtener datos del estudiante para el nombre de archivo
    const { data: usuarioDatos, error: usuarioError } = await supabase
      .from('estudiante')
      .select('estu_id_int, estu_nomb_vac, estu_apell_pat_vac, estu_apell_mat_vac')
      .eq('estu_id_int', orden.estu_id_int)
      .single();

    if (usuarioError || !usuarioDatos) {
      return { success: false, error: 'No se encontraron datos del estudiante' };
    }

    // 9. Generar nombre de archivo con extensión correcta
    const ext = file.type === 'image/png' ? 'png' : 'jpg';
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

    // 10. Eliminar archivo anterior si existe
    if (orden.pago_url_vac) {
      try {
        await supabase.storage.from('student-private').remove([orden.pago_url_vac]);
      } catch (err) {
        console.error('Error deleting old voucher:', err);
      }
    }

    // 11. Subir a Supabase Storage
    const { error } = await supabase.storage
      .from('student-private')
      .upload(path, file, { cacheControl: '3600', upsert: true });

    if (error) {
      return { success: false, error: `Error al subir archivo: ${error.message}` };
    }

    // 12. Actualizar registro en BD con el path
    const { error: updateError } = await supabase
      .from('pago')
      .update({
        pago_url_vac: path,
        pago_estad_vac: 'ENVIADO',
        pago_upd_tmp: new Date().toISOString(),
      })
      .eq('pago_id_int', pagoId);

    if (updateError) {
      return { success: false, error: 'Error al guardar datos del comprobante' };
    }

    return { success: true, message: 'Comprobante enviado exitosamente', url: path };
  } catch (error) {
    console.error('Error uploading voucher:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Acepta un pago (ENVIADO → ACEPTADO) y matricula al estudiante.
 * Solo ADMIN o COORDINADOR.
 */
export async function acceptPago(pagoId: number): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // 1. Solo admins o coordinadores pueden aceptar pagos
    const user = await assertAuthenticated();
    assertAdminOrCoordinador(user);

    // 2. Obtener datos del pago
    const pago = await getOrdenById(pagoId);
    if (!pago) {
      return { success: false, error: 'Orden de pago no encontrada' };
    }

    // 3. Validar que el pago esté en estado ENVIADO o PAGADO
    if (pago.pago_estad_vac !== 'ENVIADO' && pago.pago_estad_vac !== 'PAGADO') {
      return {
        success: false,
        error: `No se puede aceptar un pago en estado ${pago.pago_estad_vac}. Solo ENVIADO o PAGADO.`,
      };
    }

    // 4. Aceptar el pago
    const pagoActualizado = await acceptPagoOrder(pagoId);
    if (!pagoActualizado) {
      return { success: false, error: 'Error al actualizar el estado del pago' };
    }

    // 5. Crear la relación estudiante_curso
    const estudianteCursoCreado = await createEstudianteCursoFromPago(
      pago.estu_id_int,
      pago.cur_id_int
    );

    if (!estudianteCursoCreado) {
      return {
        success: false,
        error: 'Pago aceptado pero error al matricular al estudiante en el curso',
      };
    }

    return {
      success: true,
      message: `Pago aceptado exitosamente. Estudiante matriculado en el curso.`,
    };
  } catch (error) {
    console.error('Error accepting pago:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}