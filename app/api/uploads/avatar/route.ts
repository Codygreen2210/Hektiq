import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../../lib/serverAuth'
import { checkImage, alertChildSafety } from '../../../../lib/moderate'

const MAX_BYTES = 3 * 1024 * 1024
const PUBLIC_FIELDS = 'id, username, bio, avatar_url, karma, created_at'

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const user = await getUserFromRequest(request, supabase)
    if (!user) return NextResponse.json({ error: 'Log in first.' })

    const form = await request.formData()
    const file = form.get('file')
    if (!file || typeof file === 'string') return NextResponse.json({ error: 'No photo sent.' })
    if (file.type !== 'image/jpeg') return NextResponse.json({ error: 'That photo type isn\'t supported.' })
    if (file.size > MAX_BYTES) return NextResponse.json({ error: 'That photo is too big.' })

    const bytes = new Uint8Array(await file.arrayBuffer())

    // Check it before it's ever saved
    const check = await checkImage(bytes, 'image/jpeg')
    if (!check.ok) {
      if (check.childSafety) await alertChildSafety(user.username, user.id)
      return NextResponse.json({ error: check.reason })
    }

    // Always saved under this person's own id
    const path = user.id + '.jpg'

    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, bytes, { contentType: 'image/jpeg', upsert: true })
    if (upErr) return NextResponse.json({ error: 'Upload failed. Try again.' })

    // Clean up old photos saved with other file types
    await supabase.storage
      .from('avatars')
      .remove([user.id + '.png', user.id + '.jpeg', user.id + '.webp', user.id + '.gif', user.id + '.heic'])
      .catch(() => null)

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    const avatarUrl = urlData.publicUrl + '?t=' + Date.now()

    const { data, error } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select(PUBLIC_FIELDS)
      .single()

    if (error) return NextResponse.json({ error: 'Couldn\'t save your photo. Try again.' })
    return NextResponse.json({ profile: data })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong uploading.' })
  }
}