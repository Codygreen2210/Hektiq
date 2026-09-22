import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../../lib/serverAuth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = (searchParams.get('ids') || '').split(',').filter(Boolean).slice(0, 100)
    if (ids.length === 0) return NextResponse.json({ votes: {} })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ votes: {} })

    const { data } = await supabase
      .from('post_votes')
      .select('post_id, value')
      .eq('user_id', user.id)
      .in('post_id', ids)

    const votes: Record<string, 'up' | 'down'> = {}
    for (const v of data || []) votes[v.post_id] = v.value === 1 ? 'up' : 'down'

    return NextResponse.json({ votes })
  } catch (e) {
    return NextResponse.json({ votes: {} })
  }
}