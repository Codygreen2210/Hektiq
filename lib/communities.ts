export type SeededCommunity = {
  slug: string
  name: string
  description: string
  accent: string
  letter: string
  color: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'   // matches --c1 to --c9 in theme.css
  keywords: string[]
  seoTitle: string          // what shows as the page title in Google, matched to what people search
  seoDescription: string    // the short blurb under the title in Google
  local?: string            // set for local corners, like 'Louisiana'. Local corners stay off the homepage grid
  parent?: string           // the main community a local corner belongs under, like 'outdoors'
}

export const seededCommunities: SeededCommunity[] = [
  {
    slug: 'outdoors', name: 'Outdoors', description: 'Hunting, fishing, camping, hiking', accent: '#06B6D4', letter: 'O', color: '4',
    keywords: ['hunting', 'hunt', 'deer', 'duck', 'turkey', 'fishing', 'fish', 'bass', 'boat', 'kayak', 'camping', 'camp', 'tent', 'hiking', 'hike', 'trail', 'woods', 'outdoor', 'nature', 'archery', 'bow', 'rifle', 'lake', 'river', 'survival', 'backpacking'],
    seoTitle: 'Outdoors Forum: Hunting, Fishing & Camping',
    seoDescription: 'Talk hunting, fishing, camping and hiking with real people. Share your catch, your hunt and your trips. No ads, one account one vote. Free to join.'
  },
  {
    slug: 'sports', name: 'Sports', description: 'Game threads, hot takes, fantasy', accent: '#8B5CF6', letter: 'S', color: '5',
    keywords: ['football', 'nfl', 'college', 'lsu', 'saints', 'basketball', 'nba', 'baseball', 'mlb', 'soccer', 'hockey', 'nhl', 'fantasy', 'draft', 'game', 'team', 'playoffs', 'golf', 'boxing', 'ufc', 'mma', 'wrestling', 'tennis', 'score', 'betting'],
    seoTitle: 'Sports Forum: Game Threads, Fantasy & Hot Takes',
    seoDescription: 'Game threads, fantasy talk and hot takes with real fans. Football, basketball, baseball and more. No ads, one account one vote. Free to join.'
  },
  {
    slug: 'money-building', name: 'Money & Building', description: 'Finance, side hustles, building from nothing', accent: '#06B6D4', letter: 'M', color: '3',
    keywords: ['money', 'finance', 'budget', 'saving', 'savings', 'debt', 'credit', 'invest', 'investing', 'stocks', 'crypto', 'retirement', 'income', 'side hustle', 'hustle', 'business', 'startup', 'career', 'job', 'salary', 'raise', 'taxes', 'house', 'mortgage', 'rent'],
    seoTitle: 'Money & Side Hustle Forum: Saving, Investing & Building',
    seoDescription: 'Talk money, side hustles, saving and building something from nothing with real people. No ads, one account one vote. Free to join.'
  },
  {
    slug: 'garage', name: 'Garage', description: 'Cars, trucks, DIY, tools, fixing stuff', accent: '#8B5CF6', letter: 'G', color: '1',
    keywords: ['car', 'cars', 'truck', 'trucks', 'engine', 'motor', 'oil', 'tires', 'brakes', 'mechanic', 'repair', 'fix', 'diy', 'tools', 'tool', 'welding', 'weld', 'build', 'project', 'restoration', 'motorcycle', 'bike', 'jeep', 'diesel', 'garage', 'home improvement'],
    seoTitle: 'Garage Forum: Cars, Trucks, DIY & Repairs',
    seoDescription: 'Cars, trucks, builds, repairs and DIY projects. Ask questions and show off your work with real people. No ads, one account one vote. Free to join.'
  },
  {
    slug: 'art-makers', name: 'Art & Makers', description: 'Drawing, woodworking, crafts, photography', accent: '#06B6D4', letter: 'A', color: '2',
    keywords: ['art', 'drawing', 'draw', 'painting', 'paint', 'sketch', 'woodworking', 'wood', 'carpentry', 'crafts', 'craft', 'photography', 'photo', 'camera', 'sculpture', 'pottery', 'sewing', 'knitting', 'design', 'maker', 'handmade', 'tattoo', 'leather', 'blacksmith', 'forge'],
    seoTitle: 'Art & Makers Forum: Woodworking, Crafts & Photography',
    seoDescription: 'Drawing, woodworking, crafts and photography. Share what you make and learn from real people. No ads, one account one vote. Free to join.'
  },
  {
    slug: 'gaming', name: 'Gaming', description: 'Console, PC, mobile, and what you\'re playing now', accent: '#8B5CF6', letter: 'G', color: '6',
    keywords: ['gaming', 'game', 'games', 'video game', 'xbox', 'playstation', 'ps5', 'nintendo', 'switch', 'pc', 'steam', 'console', 'controller', 'fps', 'call of duty', 'cod', 'fortnite', 'minecraft', 'madden', 'college football 26', 'gta', 'rpg', 'multiplayer', 'streamer', 'twitch'],
    seoTitle: 'Gaming Forum: Console, PC & Looking for Group',
    seoDescription: 'Console, PC and mobile gaming. Find people to play with and talk about what you\'re playing now. No ads, one account one vote. Free to join.'
  },
  {
    slug: 'food', name: 'Food & BBQ', description: 'Cooking, smoking, grilling, crawfish boils', accent: '#06B6D4', letter: 'F', color: '7',
    keywords: ['food', 'cook', 'cooking', 'recipe', 'bbq', 'barbecue', 'smoker', 'smoke', 'brisket', 'ribs', 'grill', 'grilling', 'crawfish', 'boil', 'gumbo', 'jambalaya', 'cajun', 'creole', 'fry', 'fried', 'seafood', 'steak', 'kitchen', 'cast iron', 'restaurant'],
    seoTitle: 'Food & BBQ Forum: Smoking, Grilling & Crawfish Boils',
    seoDescription: 'Smoking, grilling, cooking and crawfish boils. Swap recipes and tips with real people. No ads, one account one vote. Free to join.'
  },
  {
    slug: 'music', name: 'Music', description: 'New music, playing, gear, and local shows', accent: '#8B5CF6', letter: 'M', color: '8',
    keywords: ['music', 'song', 'songs', 'album', 'band', 'concert', 'show', 'live', 'guitar', 'bass guitar', 'drums', 'piano', 'singing', 'country', 'rock', 'hip hop', 'rap', 'zydeco', 'blues', 'jazz', 'gear', 'amp', 'pedal', 'playlist', 'spotify'],
    seoTitle: 'Music Forum: New Music, Gear & Local Shows',
    seoDescription: 'New music, playing, gear and local shows. Talk music with real people. No ads, one account one vote. Free to join.'
  },
  {
    slug: 'tech', name: 'Tech', description: 'Phones, gadgets, PC builds, smart tools', accent: '#06B6D4', letter: 'T', color: '9',
    keywords: ['tech', 'technology', 'phone', 'iphone', 'android', 'samsung', 'laptop', 'computer', 'pc build', 'gpu', 'cpu', 'gadget', 'gadgets', 'app', 'apps', 'smart home', 'tv', 'headphones', 'camera', 'drone', 'ai', 'software', 'internet', 'wifi', 'battery'],
    seoTitle: 'Tech Forum: Phones, Gadgets & PC Builds',
    seoDescription: 'Phones, gadgets, PC builds and smart tools. Ask questions and get straight answers from real people. No ads, one account one vote. Free to join.'
  },
  {
    slug: 'louisiana-hunting-fishing', name: 'Louisiana Hunting & Fishing', description: 'Deer, duck, redfish, bass and everything in between, across Louisiana', accent: '#06B6D4', letter: 'L', color: '4',
    local: 'Louisiana', parent: 'outdoors',
    keywords: ['louisiana', 'la', 'cajun', 'bayou', 'marsh', 'swamp', 'atchafalaya', 'wma', 'redfish', 'speckled trout', 'specks', 'flounder', 'bass', 'crappie', 'sac-a-lait', 'catfish', 'duck', 'teal', 'deer', 'hog', 'squirrel', 'turkey', 'dove', 'lake', 'hunting', 'fishing'],
    seoTitle: 'Louisiana Hunting & Fishing Forum',
    seoDescription: 'Louisiana hunting and fishing talk with real people. Deer, duck, redfish, bass, reports and tips from across the state. No ads, one account one vote. Free to join.'
  },
]

export const seededBySlug: Record<string, SeededCommunity> = Object.fromEntries(
  seededCommunities.map(c => [c.slug, c])
)

// Main communities show on the homepage grid. Local corners (like Louisiana) show on the Communities page
// and on their parent community's page, so the homepage doesn't fill up with states.
export const mainCommunities = seededCommunities.filter(c => !c.local)
export const localCommunities = seededCommunities.filter(c => !!c.local)

// Local corners stay out of Google until they have this many posts from real people
export const LOCAL_INDEX_MIN_POSTS = 3

// Color number for each community, like 'garage' -> '1'. Pages use it as var(--c1).
// Member-made communities aren't listed, so pages fall back to their default.
export const COLOR: Record<string, string> = Object.fromEntries(
  seededCommunities.map(c => [c.slug, c.color])
)

// Same thing, but already written as a CSS color, like 'garage' -> 'var(--c1)'
export const COLORS: Record<string, string> = Object.fromEntries(
  seededCommunities.map(c => [c.slug, 'var(--c' + c.color + ')'])
)