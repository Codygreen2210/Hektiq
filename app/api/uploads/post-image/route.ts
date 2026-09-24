import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest, VERIFY_MESSAGE } from '../../../../lib/serverAuth'

const MAX_BYTES = 3 * 1024 * 1024 // 3 MB after shrinking (normally ~300 KB)

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in to add photos.' })
    if (!user.email_verified) return NextResponse.json({ error: VERIFY_MESSAGE })

    const form = await request.formData()
    const file = form.get('file')
    if (!file || typeof file === 'string') return NextResponse.json({ error: 'No photo sent.' })
    if (file.type !== 'image/jpeg') return NextResponse.json({ error: 'That photo type isn\'t supported.' })
    if (file.size > MAX_BYTES) return NextResponse.json({ error: 'That photo is too big.' })

    const path = user.id + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 10) + '.jpg'
    const bytes = new Uint8Array(await file.arrayBuffer())

    const { error } = await supabase.storage
      .from('post-images')
      .upload(path, bytes, { contentType: 'image/jpeg', upsert: false })

    if (error) return NextResponse.json({ error: 'Couldn\'t upload that photo.' })

    const { data } = supabase.storage.from('post-images').getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong uploading.' })
  }
}