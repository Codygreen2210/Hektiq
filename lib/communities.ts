export type SeededCommunity = {
  slug: string
  name: string
  description: string
  accent: string
  letter: string
  color: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'   // matches --c1 to --c9 in theme.css
  keywords: string[]
}

export const seededCommunities: SeededCommunity[] = [
  {
    slug: 'outdoors', name: 'Outdoors', description: 'Hunting, fishing, camping, hiking', accent: '#06B6D4', letter: 'O', color: '4',
    keywords: ['hunting', 'hunt', 'deer', 'duck', 'turkey', 'fishing', 'fish', 'bass', 'boat', 'kayak', 'camping', 'camp', 'tent', 'hiking', 'hike', 'trail', 'woods', 'outdoor', 'nature', 'archery', 'bow', 'rifle', 'lake', 'river', 'survival', 'backpacking']
  },
  {
    slug: 'sports', name: 'Sports', description: 'Game threads, hot takes, fantasy', accent: '#8B5CF6', letter: 'S', color: '5',
    keywords: ['football', 'nfl', 'college', 'lsu', 'saints', 'basketball', 'nba', 'baseball', 'mlb', 'soccer', 'hockey', 'nhl', 'fantasy', 'draft', 'game', 'team', 'playoffs', 'golf', 'boxing', 'ufc', 'mma', 'wrestling', 'tennis', 'score', 'betting']
  },
  {
    slug: 'money-building', name: 'Money & Building', description: 'Finance, side hustles, building from nothing', accent: '#06B6D4', letter: 'M', color: '3',
    keywords: ['money', 'finance', 'budget', 'saving', 'savings', 'debt', 'credit', 'invest', 'investing', 'stocks', 'crypto', 'retirement', 'income', 'side hustle', 'hustle', 'business', 'startup', 'career', 'job', 'salary', 'raise', 'taxes', 'house', 'mortgage', 'rent']
  },
  {
    slug: 'garage', name: 'Garage', description: 'Cars, trucks, DIY, tools, fixing stuff', accent: '#8B5CF6', letter: 'G', color: '1',
    keywords: ['car', 'cars', 'truck', 'trucks', 'engine', 'motor', 'oil', 'tires', 'brakes', 'mechanic', 'repair', 'fix', 'diy', 'tools', 'tool', 'welding', 'weld', 'build', 'project', 'restoration', 'motorcycle', 'bike', 'jeep', 'diesel', 'garage', 'home improvement']
  },
  {
    slug: 'art-makers', name: 'Art & Makers', description: 'Drawing, woodworking, crafts, photography', accent: '#06B6D4', letter: 'A', color: '2',
    keywords: ['art', 'drawing', 'draw', 'painting', 'paint', 'sketch', 'woodworking', 'wood', 'carpentry', 'crafts', 'craft', 'photography', 'photo', 'camera', 'sculpture', 'pottery', 'sewing', 'knitting', 'design', 'maker', 'handmade', 'tattoo', 'leather', 'blacksmith', 'forge']
  },
  {
    slug: 'gaming', name: 'Gaming', description: 'Console, PC, mobile, and what you\'re playing now', accent: '#8B5CF6', letter: 'G', color: '6',
    keywords: ['gaming', 'game', 'games', 'video game', 'xbox', 'playstation', 'ps5', 'nintendo', 'switch', 'pc', 'steam', 'console', 'controller', 'fps', 'call of duty', 'cod', 'fortnite', 'minecraft', 'madden', 'college football 26', 'gta', 'rpg', 'multiplayer', 'streamer', 'twitch']
  },
  {
    slug: 'food', name: 'Food & BBQ', description: 'Cooking, smoking, grilling, crawfish boils', accent: '#06B6D4', letter: 'F', color: '7',
    keywords: ['food', 'cook', 'cooking', 'recipe', 'bbq', 'barbecue', 'smoker', 'smoke', 'brisket', 'ribs', 'grill', 'grilling', 'crawfish', 'boil', 'gumbo', 'jambalaya', 'cajun', 'creole', 'fry', 'fried', 'seafood', 'steak', 'kitchen', 'cast iron', 'restaurant']
  },
  {
    slug: 'music', name: 'Music', description: 'New music, playing, gear, and local shows', accent: '#8B5CF6', letter: 'M', color: '8',
    keywords: ['music', 'song', 'songs', 'album', 'band', 'concert', 'show', 'live', 'guitar', 'bass guitar', 'drums', 'piano', 'singing', 'country', 'rock', 'hip hop', 'rap', 'zydeco', 'blues', 'jazz', 'gear', 'amp', 'pedal', 'playlist', 'spotify']
  },
  {
    slug: 'tech', name: 'Tech', description: 'Phones, gadgets, PC builds, smart tools', accent: '#06B6D4', letter: 'T', color: '9',
    keywords: ['tech', 'technology', 'phone', 'iphone', 'android', 'samsung', 'laptop', 'computer', 'pc build', 'gpu', 'cpu', 'gadget', 'gadgets', 'app', 'apps', 'smart home', 'tv', 'headphones', 'camera', 'drone', 'ai', 'software', 'internet', 'wifi', 'battery']
  },
]

export const seededBySlug: Record<string, SeededCommunity> = Object.fromEntries(
  seededCommunities.map(c => [c.slug, c])
)

// Color number for each community, like 'garage' -> '1'. Pages use it as var(--c1).
// Member-made communities aren't listed, so pages fall back to their default.
export const COLOR: Record<string, string> = Object.fromEntries(
  seededCommunities.map(c => [c.slug, c.color])
)

// Same thing, but already written as a CSS color, like 'garage' -> 'var(--c1)'
export const COLORS: Record<string, string> = Object.fromEntries(
  seededCommunities.map(c => [c.slug, 'var(--c' + c.color + ')'])
)