/**
 * Cliente para operaciones server-side
 */

import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Credenciales de Supabase son requeridas (solo para Storage)'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
