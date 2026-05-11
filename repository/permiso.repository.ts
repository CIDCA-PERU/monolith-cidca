/**
 * Repository: Consultas a tabla permisos y rol_permiso
 * SOLO consultas SQL, sin lógica de negocio
 */

import 'server-only';

import { supabase } from '@/lib/supabase';
import { Permiso } from '@/types/db';

/**
 * Obtiene todos los permisos
 */
export async function getAllPermisos(): Promise<Permiso[]> {
  try {
    const { data, error } = await supabase
      .from('permiso')
      .select('*')
      .order('perm_cod_vac', { ascending: true });

    if (error) {
      console.error('[v0] getAllPermisos - Error:', error);
      throw error;
    }

    return (data || []) as Permiso[];
  } catch (error) {
    console.error('[v0] getAllPermisos - Error:', error);
    throw error;
  }
}

/**
 * Obtiene un permiso por código
 */
export async function getPermisoByCodigo(codigo: string): Promise<Permiso | null> {
  try {
    const { data, error } = await supabase
      .from('permiso')
      .select('*')
      .eq('perm_cod_vac', codigo)
      .single();

    if (error) {
      console.log('[v0] getPermisoByCodigo - No encontrado:', codigo);
      return null;
    }

    return data as Permiso;
  } catch (error) {
    console.error('[v0] getPermisoByCodigo - Error:', error);
    return null;
  }
}

/**
 * Obtiene todos los permisos de un rol
 */
export async function getPermisosByRolId(rolId: number): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('rol_permiso')
      .select('permiso:perm_id_int(perm_cod_vac)')
      .eq('rol_id', rolId);

    if (error) {
      console.error('[v0] getPermisosByRolId - Error:', error);
      return [];
    }

    const permisos = (data || [])
      .map((rp: any) => rp.permiso?.perm_cod_vac)
      .filter(Boolean);

    return permisos;
  } catch (error) {
    console.error('[v0] getPermisosByRolId - Error:', error);
    return [];
  }
}

/**
 * Verifica si un usuario tiene un permiso específico
 */
export async function usuarioTienePermiso(
  usuarioId: number,
  permisoCodigo: string
): Promise<boolean> {
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
      .eq('usr_id_int', usuarioId)
      .single();

    if (error) {
      console.log('[v0] usuarioTienePermiso - Error:', error.message);
      return false;
    }

    const permisos = data?.role?.rol_permiso?.map(
      (rp: any) => rp.permiso?.perm_cod_vac
    ) || [];

    return permisos.includes(permisoCodigo);
  } catch (error) {
    console.error('[v0] usuarioTienePermiso - Error:', error);
    return false;
  }
}

/**
 * Asigna un permiso a un rol
 */
export async function assignPermisoToRol(rolId: number, permisoId: number) {
  try {
    const { error } = await supabase
      .from('rol_permiso')
      .insert([
        {
          rol_id: rolId,
          perm_id_int: permisoId,
        },
      ]);

    if (error) {
      console.error('[v0] assignPermisoToRol - Error:', error);
      throw error;
    }
  } catch (error) {
    console.error('[v0] assignPermisoToRol - Error:', error);
    throw error;
  }
}
