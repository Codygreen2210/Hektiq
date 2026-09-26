import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../../lib/serverAuth'
import { seededBySlug } from '../../../../lib/communities'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = db()

    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) return NextResponse.json({ error: error.message })
    return NextResponse.json({ community: data })

  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}

// Admin only. Needs the community's exact name typed as confirmation.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = db()

    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in first.' })

    const { data: me } = await supabase.from('users').select('is_admin').eq('id', user.id).maybeSingle()
    if (!me?.is_admin) return NextResponse.json({ error: 'Only admins can delete communities.' })

    if (seededBySlug[slug]) return NextResponse.json({ error: 'The main communities can\'t be deleted.' })

    const { data: community } = await supabase.from('communities').select('slug, name').eq('slug', slug).maybeSingle()
    if (!community) return NextResponse.json({ error: 'That community doesn\'t exist.' })

    let confirm = ''
    try {
      const body = await request.json()
      confirm = String(body?.confirm || '').trim()
    } catch (e) {}
    if (confirm !== community.name) {
      return NextResponse.json({ error: 'Type the community name exactly to confirm.' })
    }

    // Hide its posts (not erased), clear members, remove the community
    await supabase.from('posts').update({ is_deleted: true }).eq('community_id', slug)
    await supabase.from('community_follows').delete().eq('community_slug', slug)
    const { error } = await supabase.from('communities').delete().eq('slug', slug)
    if (error) return NextResponse.json({ error: 'Couldn\'t delete it. Try again.' })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}