'use server';

import { sql } from '@/lib/db';
import { supabase } from '@/lib/supabase'; // Solo para Storage, temporal
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
  const montoStr = Number(monto).toFixed(0);

  return `${cleanApe1}-${cleanApe2}-${cleanNombre}-${cleanCurso}-${montoStr}-${dd}-${mm}-${yyyy}-${hh}-${mins}-${ss}-${ms}.${ext}`;
}

export async function uploadVoucher(formData: FormData) {
  try {
    const user = await assertAuthenticated();
    assertEstudiante(user);

    const file = formData.get('file') as File | null;
    const pagoIdString = formData.get('pagoId') as string | null;

    if (!file || !pagoIdString) {
      return { success: false, error: 'Archivo o ID de pago faltante.' };
    }

    const pagoId = parseInt(pagoIdString, 10);

    const ordenes = await sql`
      SELECT p.pago_id_int, p.estu_id_int, p.pago_mont_num, p.pago_estad_vac, p.pago_url_vac,
             c.cur_nomb_vac
      FROM pago p
      LEFT JOIN curso c ON p.cur_id_int = c.cur_id_int
      WHERE p.pago_id_int = ${pagoId}
    `;

    if (ordenes.length === 0) {
      return { success: false, error: 'Orden no encontrada' };
    }
    const orden = ordenes[0];

    const estudiantes = await sql`
      SELECT estu_id_int, usr_id_int, estu_nomb_vac, estu_apell_pat_vac, estu_apell_mat_vac
      FROM estudiante
      WHERE estu_id_int = ${orden.estu_id_int}
    `;

    if (estudiantes.length === 0 || estudiantes[0].usr_id_int !== user.usr_id_int) {
      return { success: false, error: 'No tienes permiso para subir archivos a este pago' };
    }
    const usuarioDatos = estudiantes[0];

    if (orden.pago_estad_vac === 'PAGADO' || orden.pago_estad_vac === 'ACEPTADO') {
      return { success: false, error: 'Este pago ya ha sido verificado y no se puede modificar' };
    }

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Solo se permiten imágenes (JPG o PNG)' };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'El archivo no debe exceder 5MB' };
    }

    const ext = file.type === 'image/png' ? 'png' : 'jpg';
    const cursoNombre = orden.cur_nomb_vac || 'CURSO';

    const filename = generateVoucherFilename(
      usuarioDatos.estu_apell_pat_vac || '',
      usuarioDatos.estu_apell_mat_vac || '',
      usuarioDatos.estu_nomb_vac || '',
      cursoNombre,
      orden.pago_mont_num,
      ext
    );

    const path = `vouchers/${filename}`;

    if (orden.pago_url_vac) {
      try {
        await supabase.storage.from('student-private').remove([orden.pago_url_vac]);
      } catch (err) {
        console.error('Error deleting old voucher:', err);
      }
    }

    const { error } = await supabase.storage
      .from('student-private')
      .upload(path, file, { cacheControl: '3600', upsert: true });

    if (error) {
      return { success: false, error: `Error al subir archivo: ${error.message}` };
    }

    await sql`
      UPDATE pago
      SET pago_url_vac = ${path},
          pago_estad_vac = 'ENVIADO',
          pago_upd_tmp = NOW()
      WHERE pago_id_int = ${pagoId}
    `;

    return { success: true, message: 'Comprobante enviado exitosamente', url: path };
  } catch (error) {
    console.error('Error uploading voucher:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function acceptPago(pagoId: number): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const user = await assertAuthenticated();
    assertAdminOrCoordinador(user);

    const pago = await getOrdenById(pagoId);
    if (!pago) {
      return { success: false, error: 'Orden de pago no encontrada' };
    }

    if (pago.pago_estad_vac !== 'ENVIADO' && pago.pago_estad_vac !== 'PAGADO') {
      return {
        success: false,
        error: `No se puede aceptar un pago en estado ${pago.pago_estad_vac}. Solo ENVIADO o PAGADO.`,
      };
    }

    const pagoActualizado = await acceptPagoOrder(pagoId);
    if (!pagoActualizado) {
      return { success: false, error: 'Error al actualizar el estado del pago' };
    }

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