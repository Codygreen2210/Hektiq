import { createClient } from '@supabase/supabase-js'

export async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    )
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    return token ? { Authorization: 'Bearer ' + token } : {}
  } catch (e) {
    return {}
  }
}