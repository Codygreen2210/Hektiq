import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const TOTAL = 1000

// Recount at most every 30 seconds
export const revalidate = 30

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } }
    )

    const { count } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('founder_number', 1)
      .lte('founder_number', TOTAL)

    const claimed = count || 0
    return NextResponse.json({ total: TOTAL, claimed, left: Math.max(0, TOTAL - claimed) })
  } catch (e) {
    return NextResponse.json({ error: 'Couldn\'t load the count.' })
  }
}