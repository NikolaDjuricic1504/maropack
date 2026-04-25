import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xmlnvxzdytuybguirjgz.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbG52eHpkeXR1eWJndWlyamd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODA4OTUsImV4cCI6MjA5MjI1Njg5NX0.KnKwY_UXiUj5VwcoYQ-hLdSy4UaQdj_KwbiPdbgXKzg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
