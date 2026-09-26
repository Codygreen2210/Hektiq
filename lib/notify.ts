import { SupabaseClient } from '@supabase/supabase-js'

type Kind = 'upvote' | 'comment' | 'reply' | 'mention'

// Creates one notification. Never notifies you about your own actions.
// Never throws: a failed notice should never break a vote or comment.
// Upvotes: the database only allows one notice per person per post,
// so a repeat upvote is rejected there and quietly ignored here.
export async function notify(
  supabase: SupabaseClient,
  opts: { to: string | null | undefined; from: string; type: Kind; postId: string; commentId?: string | null }
) {
  try {
    if (!opts.to || opts.to === opts.from) return

    await supabase.from('notifications').insert({
      user_id: opts.to,
      actor_id: opts.from,
      type: opts.type,
      post_id: opts.postId,
      comment_id: opts.commentId || null,
    })
  } catch (e) {}
}