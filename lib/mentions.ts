import { SupabaseClient } from '@supabase/supabase-js'
import { notify } from './notify'

const MAX_MENTIONS = 10

// Finds @usernames in text. Matches the signup rules: 3 to 20 letters, numbers, underscores.
export function findMentions(text: string): string[] {
  const found = new Set<string>()
  const re = /(^|[^a-zA-Z0-9_@])@([a-zA-Z0-9_]{3,20})(?![a-zA-Z0-9_])/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text || '')) !== null) {
    found.add(m[2].toLowerCase())
    if (found.size >= MAX_MENTIONS) break
  }
  return [...found]
}

// Sends a "mentioned you" notice to each real account tagged in the text
export async function notifyMentions(
  supabase: SupabaseClient,
  opts: { text: string; from: string; postId: string; commentId?: string | null; skip?: (string | null | undefined)[] }
) {
  try {
    const names = findMentions(opts.text)
    if (names.length === 0) return

    const { data: users } = await supabase
      .from('users')
      .select('id, is_banned')
      .in('username', names)

    // Skip people already getting a comment or reply notice for this
    const skip = new Set((opts.skip || []).filter(Boolean))

    for (const u of users || []) {
      if (u.is_banned || skip.has(u.id)) continue
      await notify(supabase, { to: u.id, from: opts.from, type: 'mention', postId: opts.postId, commentId: opts.commentId || null })
    }
  } catch (e) {}
}