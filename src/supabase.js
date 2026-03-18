import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bnivpblwxqxbctqiazqy.supabase.co'
const supabaseKey = 'sb_publishable_uM-t2xOHgyoybXfOccBNrA_xraHMLMT'

export const supabase = createClient(supabaseUrl, supabaseKey)