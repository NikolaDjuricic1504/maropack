import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xmlnvxzdytuybguirjgz.supabase.co'
const SUPABASE_KEY = 'sb_publishable_BmJdB06sA3wZyGme45XvxA_h7THqE9f'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
