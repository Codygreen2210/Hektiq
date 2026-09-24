import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { seededBySlug } from '../../../../../lib/communities'
import { parseVideo } from '../../../../../lib/video'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://hektiq.com'

type Params = Promise<{ slug: string; postId: string }>

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { persistSession: false } }
  )
}

async function loadPost(postId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(postId)) return null
  try {
    const supabase = db()
    const { data: post } = await supabase
      .from('posts')
      .select('id, title, body, community_id, author_id, video_url, image_urls, upvotes, is_deleted, created_at')
      .eq('id', postId)
      .maybeSingle()
    if (!post || post.is_deleted) return null

    let author: string | null = null
    if (post.author_id) {
      const { data: u } = await supabase.from('users').select('username').eq('id', post.author_id).maybeSingle()
      author = u?.username || null
    }

    const { count } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('is_deleted', false)

    return { ...post, author, comment_count: count || 0 }
  } catch (e) {
    return null
  }
}

function cleanText(s: string, max: number) {
  const t = (s || '').replace(/\s+/g, ' ').trim()
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t
}

function previewImage(post: any): string | null {
  if (Array.isArray(post.image_urls) && post.image_urls.length > 0) return post.image_urls[0]
  if (post.video_url) {
    const v = parseVideo(post.video_url)
    if (v?.thumb) return v.thumb
  }
  return null
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, postId } = await params
  const post = await loadPost(postId)
  if (!post) return { title: 'Post not found · Hektiq', robots: { index: false } }

  const community = seededBySlug[post.community_id]?.name || post.community_id
  const title = cleanText(post.title, 70) + ' · ' + community + ' · Hektiq'
  const desc = post.body
    ? cleanText(post.body, 160)
    : 'A post in ' + community + ' on Hektiq. Join the conversation.'
  const url = SITE + '/c/' + post.community_id + '/post/' + post.id
  const image = previewImage(post)

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: cleanText(post.title, 90),
      description: desc,
      url,
      siteName: 'Hektiq',
      type: 'article',
      publishedTime: post.created_at,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: cleanText(post.title, 90),
      description: desc,
      ...(image ? { images: [image] } : {}),
    },
    ...(slug !== post.community_id ? { robots: { index: false } } : {}),
  }
}

export default async function PostLayout({ children, params }: { children: React.ReactNode; params: Params }) {
  const { postId } = await params
  const post = await loadPost(postId)

  // Tells search engines this page is a discussion post
  const jsonLd = post ? {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: cleanText(post.title, 110),
    text: post.body ? cleanText(post.body, 500) : undefined,
    url: SITE + '/c/' + post.community_id + '/post/' + post.id,
    datePublished: post.created_at,
    author: { '@type': 'Person', name: post.author || 'deleted account' },
    interactionStatistic: [
      { '@type': 'InteractionCounter', interactionType: 'https://schema.org/LikeAction', userInteractionCount: post.upvotes || 0 },
      { '@type': 'InteractionCounter', interactionType: 'https://schema.org/CommentAction', userInteractionCount: post.comment_count },
    ],
    ...(previewImage(post) ? { image: previewImage(post) } : {}),
  } : null

  return (
    <>
      {jsonLd && (
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      {children}
    </>
  )
}