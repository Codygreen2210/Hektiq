import { SupabaseClient } from '@supabase/supabase-js'

// Counts a community's posts written by real people, leaving out bot accounts like hektiq_videos.
// Used to keep brand-new local corners out of Google until there's real conversation in them.
export async function realPostCount(supabase: SupabaseClient, slug: string): Promise<number> {
  const { data: bots } = await supabase.from('users').select('id').eq('is_bot', true)
  const botIds = (bots || []).map(b => b.id)

  let query = supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('community_id', slug)
    .eq('is_deleted', false)
  if (botIds.length) query = query.not('author_id', 'in', '(' + botIds.join(',') + ')')

  const { count } = await query
  return count || 0
}
