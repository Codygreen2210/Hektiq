import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { seededCommunities } from '../../../lib/communities'

function distance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
    }
  }
  return dp[a.length][b.length]
}

function isClose(word: string, target: string) {
  if (word === target) return true
  if (word.length < 4 || target.length < 4) return false
  const allowed = word.length >= 7 ? 2 : 1
  return distance(word, target) <= allowed
}

function scoreSeeded(q: string) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  const results: { slug: string; name: string; description: string; score: number }[] = []

  for (const c of seededCommunities) {
    const terms = [c.name.toLowerCase(), c.slug, ...c.description.toLowerCase().split(/[\s,&]+/), ...c.keywords]
    let score = 0
    for (const w of words) {
      if (terms.some(t => t === w)) score += 3
      else if (terms.some(t => t.startsWith(w) && w.length >= 3)) score += 2
      else if (terms.some(t => isClose(w, t))) score += 1
    }
    if (score > 0) results.push({ slug: c.slug, name: c.name, description: c.description, score })
  }

  return results.sort((a, b) => b.score - a.score)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()

    if (q.length < 2) {
      return NextResponse.json({ posts: [], communities: [] })
    }

    const safe = q.replace(/[%,()]/g, ' ')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .or(`title.ilike.%${safe}%,body.ilike.%${safe}%`)
      .eq('is_deleted', false)
      .limit(10)

    const { data: dbCommunities } = await supabase
      .from('communities')
      .select('slug, name, description')
      .or(`name.ilike.%${safe}%,description.ilike.%${safe}%`)
      .limit(5)

    const seededSlugs = new Set(seededCommunities.map(c => c.slug))
    const seededMatches = scoreSeeded(q).map(({ slug, name, description }) => ({ slug, name, description }))
    const memberMatches = (dbCommunities || []).filter((c: any) => !seededSlugs.has(c.slug))

    return NextResponse.json({
      posts: posts || [],
      communities: [...seededMatches, ...memberMatches]
    })
  } catch (e) {
    return NextResponse.json({ posts: [], communities: [] })
  }
}