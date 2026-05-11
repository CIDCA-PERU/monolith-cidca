/**
 * Repository: Consultas a tabla usuarios
 * SOLO consultas SQL, sin lógica de negocio
 */

import 'server-only';

import { supabase } from '@/lib/supabase';
import { Usuario } from '@/types/db';

/**
 * Obtiene un usuario por email
 */
export async function getUsuarioByEmail(email: string): Promise<Usuario | null> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('usr_email_vac', email)
      .single();

    if (error) { 
      return null;
    }

    return data as Usuario;
  } catch (error) { 
    throw error;
  }
}

/**
 * Obtiene un usuario por ID
 */
export async function getUsuarioById(id: number): Promise<Usuario | null> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('usr_id_int', id)
      .single();

    if (error) {
      return null;
    }

    return data as Usuario;
  } catch (error) {
    throw error;
  }
}

/**
 * Obtiene un usuario con su rol y permisos
 */
export async function getUsuarioWithPermissions(id: number) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        role:rol_id (
          rol_id,
          rol_nam_vc,
          rol_permiso (
            permiso:perm_id_int (
              perm_id_int,
              perm_cod_vac,
              perm_desc_vac
            )
          )
        )
      `)
      .eq('usr_id_int', id)
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Crea un nuevo usuario
 */
export async function createUsuario(
  email: string,
  passwordHash: string,
  rolId: number
): Promise<Usuario> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        {
          usr_email_vac: email,
          usr_pass_vac: passwordHash,
          rol_id: rolId,
          usr_est_int: 1,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Usuario;
  } catch (error) {
    throw error;
  }
}

/**
 * Actualiza la contraseña de un usuario
 */
export async function updateUsuarioPassword(id: number, newPasswordHash: string) {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({
        usr_pass_vac: newPasswordHash,
      })
      .eq('usr_id_int', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Obtiene todos los permisos de un usuario
 */
export async function getUsuarioPermissions(userId: number): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        role:rol_id (
          rol_permiso (
            permiso:perm_id_int (
              perm_cod_vac
            )
          )
        )
      `)
      .eq('usr_id_int', userId)
      .single();

    if (error) {
      return [];
    }

    const roleData = Array.isArray(data?.role) ? data?.role?.[0] : data?.role;
    const permisos = roleData?.rol_permiso?.map(
      (rp: any) => rp.permiso?.perm_cod_vac
    ) || [];

    return permisos.filter(Boolean);
  } catch (error) {
    console.error('[v0] getUsuarioPermissions - Error:', error);
    return [];
  }
}

/**
 * Obtiene el rol de un usuario
 */
export async function getUsuarioRol(userId: number): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('role:rol_id(rol_nam_vc)')
      .eq('usr_id_int', userId)
      .single();

    if (error) {
      console.log('[v0] getUsuarioRol - Error:', error.message);
      return null;
    }

    const roleData = Array.isArray(data?.role) ? data?.role?.[0] : data?.role;
    return roleData?.rol_nam_vc || null;
  } catch (error) {
    console.error('[v0] getUsuarioRol - Error:', error);
    return null;
  }
}
