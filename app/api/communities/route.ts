import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../lib/serverAuth'
import { seededCommunities } from '../../../lib/communities'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )
}

export async function POST(request: Request) {
  try {
    const { name, description, slug } = await request.json()
    const cleanName = (name || '').trim()
    const cleanDesc = (description || '').trim()
    const cleanSlug = (slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40)

    if (cleanName.length < 3 || cleanName.length > 40) return NextResponse.json({ error: 'Name must be 3 to 40 characters.' })
    if (!cleanDesc || cleanDesc.length > 200) return NextResponse.json({ error: 'Add a description under 200 characters.' })
    if (cleanSlug.length < 3) return NextResponse.json({ error: 'Pick a name with a few more letters.' })

    const reserved = ['new', 'create', 'admin', 'api', 'search', 'settings', 'hektiq', ...seededCommunities.map(c => c.slug)]
    if (reserved.includes(cleanSlug)) return NextResponse.json({ error: 'That name is taken. Try another.' })

    const supabase = db()
    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in to start a community.' })

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('communities')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', user.id)
      .gte('created_at', oneDayAgo)

    if ((count || 0) >= 2) return NextResponse.json({ error: 'You can start 2 communities a day. Try again tomorrow.' })

    const { data: existing } = await supabase
      .from('communities')
      .select('id')
      .eq('slug', cleanSlug)
      .maybeSingle()
    if (existing) return NextResponse.json({ error: 'A community with that name already exists.' })

    const { data, error } = await supabase
      .from('communities')
      .insert({
        name: cleanName,
        description: cleanDesc,
        slug: cleanSlug,
        icon_emoji: cleanName.charAt(0).toUpperCase(),
        is_seeded: false,
        created_by: user.id
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Couldn\'t create that. Try again.' })
    return NextResponse.json({ community: data })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong.' })
  }
}

export async function GET() {
  try {
    const supabase = db()
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message })
    return NextResponse.json({ communities: data })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' })
  }
}