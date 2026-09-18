import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

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