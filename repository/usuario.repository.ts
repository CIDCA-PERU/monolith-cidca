/**
 * Repository: Consultas a tabla usuarios
 * SOLO consultas SQL, sin lógica de negocio
 */

import 'server-only';
import { sql } from '@/lib/db';
import { Usuario } from '@/types/db';

/**
 * Obtiene un usuario por email
 */
export async function getUsuarioByEmail(email: string): Promise<Usuario | null> {
  try {
    const rows = await sql<Usuario[]>`
      SELECT * FROM usuarios
      WHERE usr_email_vac = ${email}
      LIMIT 1
    `;
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

/**
 * Obtiene un usuario por ID
 */
export async function getUsuarioById(id: number): Promise<Usuario | null> {
  try {
    const rows = await sql<Usuario[]>`
      SELECT * FROM usuarios
      WHERE usr_id_int = ${id}
      LIMIT 1
    `;
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

/**
 * Obtiene un usuario con su rol y permisos
 */
export async function getUsuarioWithPermissions(id: number) {
  try {
    const rows = await sql`
      SELECT 
        u.*,
        r.rol_id, r.rol_nam_vc,
        json_agg(
          json_build_object(
            'perm_id_int', p.perm_id_int,
            'perm_cod_vac', p.perm_cod_vac,
            'perm_desc_vac', p.perm_desc_vac
          )
        ) FILTER (WHERE p.perm_id_int IS NOT NULL) as permisos
      FROM usuarios u
      LEFT JOIN role r ON u.rol_id = r.rol_id
      LEFT JOIN rol_permiso rp ON r.rol_id = rp.rol_id
      LEFT JOIN permiso p ON rp.perm_id_int = p.perm_id_int
      WHERE u.usr_id_int = ${id}
      GROUP BY u.usr_id_int, r.rol_id
    `;
    
    if (!rows.length) return null;
    
    const user = rows[0];
    
    // Mapear al formato que esperaba el frontend
    return {
      ...user,
      role: {
        rol_id: user.rol_id,
        rol_nam_vc: user.rol_nam_vc,
        rol_permiso: user.permisos?.map((p: any) => ({
          permiso: p
        })) || []
      }
    };
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
  rolId: number = 4, // 4 = ESTUDIANTE por defecto
  origen: string = 'WEB'
): Promise<Usuario> {
  try {
    const rows = await sql<Usuario[]>`
      INSERT INTO usuarios (
        usr_email_vac,
        usr_pass_vac,
        rol_id,
        usr_est_int,
        usr_origen_vac
      ) VALUES (
        ${email},
        ${passwordHash},
        ${rolId},
        1,
        ${origen}
      )
      RETURNING *
    `;
    
    return rows[0];
  } catch (error) {
    throw error;
  }
}

/**
 * Actualiza la contraseña de un usuario,
 * guardando la anterior en usr_ant_pass_vac.
 */
export async function updateUsuarioPassword(
  id: number,
  newPasswordHash: string,
  oldPasswordHash?: string
) {
  try {
    if (oldPasswordHash) {
      await sql`
        UPDATE usuarios SET 
          usr_pass_vac = ${newPasswordHash},
          usr_ant_pass_vac = ${oldPasswordHash},
          usr_upd_tmp = NOW()
        WHERE usr_id_int = ${id}
      `;
    } else {
      await sql`
        UPDATE usuarios SET 
          usr_pass_vac = ${newPasswordHash},
          usr_upd_tmp = NOW()
        WHERE usr_id_int = ${id}
      `;
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
    const rows = await sql`
      SELECT p.perm_cod_vac
      FROM usuarios u
      JOIN rol_permiso rp ON u.rol_id = rp.rol_id
      JOIN permiso p ON rp.perm_id_int = p.perm_id_int
      WHERE u.usr_id_int = ${userId}
    `;
    
    return rows.map((r: any) => r.perm_cod_vac);
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
    const rows = await sql`
      SELECT r.rol_nam_vc
      FROM usuarios u
      JOIN role r ON u.rol_id = r.rol_id
      WHERE u.usr_id_int = ${userId}
      LIMIT 1
    `;
    
    return rows[0]?.rol_nam_vc || null;
  } catch (error) {
    return null;
  }
}
