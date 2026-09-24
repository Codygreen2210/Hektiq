import type { MetadataRoute } from 'next'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://hektiq.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/unsubscribe',
          '/create-community',
          '/search',
          '/c/*/new-post',
        ],
      },
    ],
    sitemap: SITE + '/sitemap.xml',
  }
}