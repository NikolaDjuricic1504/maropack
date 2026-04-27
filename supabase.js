// supabase.js - Konfiguracija za Supabase bazu
import { createClient } from '@supabase/supabase-js';

// ========================================
// ZAMENI OVE 2 VREDNOSTI:
// ========================================
// 1. Otvori: https://database.supabase.com
// 2. Uloguj se
// 3. Klikni: Settings (zupčanik dole levo) → API
// 4. Kopiraj "Project URL" i stavi ga u liniju 14
// 5. Kopiraj "anon / public key" i stavi ga u liniju 15

const supabaseUrl = 'https://xmlnvxzdytuybguirjgz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbG52eHpkeXR1eWJndWlyamd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODA4OTUsImV4cCI6MjA5MjI1Njg5NX0.KnKwY_UXiUj5VwcoYQ-hLdSy4UaQdj_KwbiPdbgXKzg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ========================================
// PRIMER KAKO TREBA DA IZGLEDA:
// ========================================
// const supabaseUrl = 'https://abcdefghijk.supabase.co';
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUwMDAwMDAsImV4cCI6MTk2MDU3NjAwMH0.EXAMPLE_SIGNATURE';

// ========================================
// NAPOMENA:
// ========================================
// - Project URL počinje sa "https://" i završava sa ".supabase.co"
// - anon key je DUGA vrednost koja počinje sa "eyJ"
// - NE DELJI anon key javno - to je tvoj API ključ!
// ========================================
