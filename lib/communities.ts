export type SeededCommunity = {
  slug: string
  name: string
  description: string
  accent: string
  letter: string
}

export const seededCommunities: SeededCommunity[] = [
  { slug: 'outdoors', name: 'Outdoors', description: 'Hunting, fishing, camping, hiking', accent: '#06B6D4', letter: 'O' },
  { slug: 'sports', name: 'Sports', description: 'Game threads, hot takes, fantasy', accent: '#8B5CF6', letter: 'S' },
  { slug: 'money-building', name: 'Money & Building', description: 'Finance, side hustles, building from nothing', accent: '#06B6D4', letter: 'M' },
  { slug: 'garage', name: 'Garage', description: 'Cars, trucks, DIY, tools, fixing stuff', accent: '#8B5CF6', letter: 'G' },
  { slug: 'art-makers', name: 'Art & Makers', description: 'Drawing, woodworking, crafts, photography', accent: '#06B6D4', letter: 'A' },
]

export const seededBySlug: Record<string, SeededCommunity> = Object.fromEntries(
  seededCommunities.map(c => [c.slug, c])
)