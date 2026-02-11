import { createClient } from '@supabase/supabase-js'

// TODO: Replace with your actual Supabase URL and Anon Key from your project settings
const supabaseUrl = 'https://wryzpbuujdaobkmmbgoo.supabase.co'
const supabaseKey = 'sb_publishable_0JWaE4MfYEFB6FKShCPDfQ_725fufxx'

export const supabase = createClient(supabaseUrl, supabaseKey)
