export type SeededCommunity = {
  slug: string
  name: string
  description: string
  accent: string
  letter: string
  keywords: string[]
}

export const seededCommunities: SeededCommunity[] = [
  {
    slug: 'outdoors', name: 'Outdoors', description: 'Hunting, fishing, camping, hiking', accent: '#06B6D4', letter: 'O',
    keywords: ['hunting', 'hunt', 'deer', 'duck', 'turkey', 'fishing', 'fish', 'bass', 'boat', 'kayak', 'camping', 'camp', 'tent', 'hiking', 'hike', 'trail', 'woods', 'outdoor', 'nature', 'archery', 'bow', 'rifle', 'lake', 'river', 'survival', 'backpacking']
  },
  {
    slug: 'sports', name: 'Sports', description: 'Game threads, hot takes, fantasy', accent: '#8B5CF6', letter: 'S',
    keywords: ['football', 'nfl', 'college', 'lsu', 'saints', 'basketball', 'nba', 'baseball', 'mlb', 'soccer', 'hockey', 'nhl', 'fantasy', 'draft', 'game', 'team', 'playoffs', 'golf', 'boxing', 'ufc', 'mma', 'wrestling', 'tennis', 'score', 'betting']
  },
  {
    slug: 'money-building', name: 'Money & Building', description: 'Finance, side hustles, building from nothing', accent: '#06B6D4', letter: 'M',
    keywords: ['money', 'finance', 'budget', 'saving', 'savings', 'debt', 'credit', 'invest', 'investing', 'stocks', 'crypto', 'retirement', 'income', 'side hustle', 'hustle', 'business', 'startup', 'career', 'job', 'salary', 'raise', 'taxes', 'house', 'mortgage', 'rent']
  },
  {
    slug: 'garage', name: 'Garage', description: 'Cars, trucks, DIY, tools, fixing stuff', accent: '#8B5CF6', letter: 'G',
    keywords: ['car', 'cars', 'truck', 'trucks', 'engine', 'motor', 'oil', 'tires', 'brakes', 'mechanic', 'repair', 'fix', 'diy', 'tools', 'tool', 'welding', 'weld', 'build', 'project', 'restoration', 'motorcycle', 'bike', 'jeep', 'diesel', 'garage', 'home improvement']
  },
  {
    slug: 'art-makers', name: 'Art & Makers', description: 'Drawing, woodworking, crafts, photography', accent: '#06B6D4', letter: 'A',
    keywords: ['art', 'drawing', 'draw', 'painting', 'paint', 'sketch', 'woodworking', 'wood', 'carpentry', 'crafts', 'craft', 'photography', 'photo', 'camera', 'sculpture', 'pottery', 'sewing', 'knitting', 'design', 'maker', 'handmade', 'music', 'guitar', 'tattoo', 'leather']
  },
]

export const seededBySlug: Record<string, SeededCommunity> = Object.fromEntries(
  seededCommunities.map(c => [c.slug, c])
)