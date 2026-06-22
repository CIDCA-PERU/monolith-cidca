/**
 * Cliente de Postgres (postgres.js) genérico para Server Actions y Repositories.
 * Este módulo reemplaza cualquier atadura a Supabase o vendors externos.
 */
import 'server-only';
import postgres from 'postgres';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL no está definida en las variables de entorno.');
}

// Inicializar el cliente de Postgres
// Solo una instancia global en desarrollo para evitar agotar el connection pool
const globalForPostgres = globalThis as unknown as { sql: postgres.Sql | undefined };

// Desactivar camel transform ya que el proyecto ya usaba nombres de columna directos como usr_nomb_vac
export const sql =
  globalForPostgres.sql ??
  postgres(dbUrl, {
    max: 1, // 1 conexión por instancia serverless
    idle_timeout: 5,
    connect_timeout: 10,
    prepare: false, // OBLIGATORIO para usar Connection Pooling en modo "Transaction"
  });

export const db = sql;

if (process.env.NODE_ENV !== 'production') {
  globalForPostgres.sql = db;
}
