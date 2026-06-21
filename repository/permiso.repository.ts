/**
 * Repository: Consultas a tabla permisos y rol_permiso
 * SOLO consultas SQL, sin lógica de negocio
 */

import 'server-only';

import { sql } from '@/lib/db';
import { Permiso } from '@/types/db';

export async function getAllPermisos(): Promise<Permiso[]> {
  try {
    const rows = await sql<Permiso[]>`
      SELECT * FROM permiso
      ORDER BY perm_cod_vac ASC
    `
    return rows;
  } catch (error) {
    console.error('[v0] getAllPermisos - Error:', error);
    throw error;
  }
}

export async function getPermisoByCodigo(codigo: string): Promise<Permiso | null> {
  try {
    const rows = await sql<Permiso[]>`
      SELECT * FROM permiso
      WHERE perm_cod_vac = ${codigo}
      LIMIT 1
    `
    return rows[0] || null;
  } catch (error) {
    return null;
  }
}

export async function getPermisosByRolId(rolId: number): Promise<string[]> {
  try {
    const rows = await sql`
      SELECT p.perm_cod_vac
      FROM rol_permiso rp
      JOIN permiso p ON rp.perm_id_int = p.perm_id_int
      WHERE rp.rol_id = ${rolId}
    `
    return rows.map((r: any) => r.perm_cod_vac).filter(Boolean);
  } catch (error) {
    console.error('[v0] getPermisosByRolId - Error:', error);
    return [];
  }
}

export async function usuarioTienePermiso(
  usuarioId: number,
  permisoCodigo: string
): Promise<boolean> {
  try {
    const rows = await sql`
      SELECT p.perm_cod_vac
      FROM usuarios u
      JOIN rol_permiso rp ON u.rol_id = rp.rol_id
      JOIN permiso p ON rp.perm_id_int = p.perm_id_int
      WHERE u.usr_id_int = ${usuarioId}
      AND p.perm_cod_vac = ${permisoCodigo}
      LIMIT 1
    `
    return rows.length > 0;
  } catch {
    return false;
  }
}

export async function assignPermisoToRol(rolId: number, permisoId: number) {
  try {
    await sql`
      INSERT INTO rol_permiso (rol_id, perm_id_int)
      VALUES (${rolId}, ${permisoId})
    `
  } catch (error) {
    console.error('[v0] assignPermisoToRol - Error:', error);
    throw error;
  }
}
