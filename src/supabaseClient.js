import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ypefusjmzfiyfmpitglh.supabase.co'
const supabaseKey = 'sb_publishable_szadwMt6-_psznRWnnQo-w_vKLTES82'

export const supabase = createClient(supabaseUrl, supabaseKey)
