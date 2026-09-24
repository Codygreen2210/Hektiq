import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest, VERIFY_MESSAGE } from '../../../../../lib/serverAuth'
import { seededBySlug } from '../../../../../lib/communities'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )
}

async function communityExists(supabase: any, slug: string) {
  if (seededBySlug[slug]) return true
  const { data } = await supabase.from('communities').select('slug').eq('slug', slug).maybeSingle()
  return !!data
}

async function memberCount(supabase: any, slug: string) {
  const { count } = await supabase
    .from('community_follows')
    .select('user_id', { count: 'exact', head: true })
    .eq('community_slug', slug)
  return count || 0
}

// GET: am I a member, and how many members
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const supabase = db()
    const user = await getUserFromRequest(request, supabase)

    let joined = false
    if (user) {
      const { data } = await supabase
        .from('community_follows')
        .select('user_id')
        .eq('user_id', user.id)
        .eq('community_slug', slug)
        .maybeSingle()
      joined = !!data
    }

    return NextResponse.json({ joined, members: await memberCount(supabase, slug) })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}

// POST: join or leave (toggle)
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const supabase = db()

    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in to join.' })
    if (!user.email_verified) return NextResponse.json({ error: VERIFY_MESSAGE })

    if (!(await communityExists(supabase, slug))) {
      return NextResponse.json({ error: 'That community doesn\'t exist.' })
    }

    const { data: existing } = await supabase
      .from('community_follows')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('community_slug', slug)
      .maybeSingle()

    let joined: boolean
    if (existing) {
      await supabase.from('community_follows').delete().eq('user_id', user.id).eq('community_slug', slug)
      joined = false
    } else {
      const { error } = await supabase.from('community_follows').insert({ user_id: user.id, community_slug: slug })
      if (error && error.code !== '23505') return NextResponse.json({ error: 'Couldn\'t join. Try again.' })
      joined = true
    }

    return NextResponse.json({ joined, members: await memberCount(supabase, slug) })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}