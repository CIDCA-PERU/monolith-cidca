/**
 * Cliente de Supabase para operaciones server-side
 * Importar SOLO en /src/repository
 */

import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Credenciales son requeridas'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
