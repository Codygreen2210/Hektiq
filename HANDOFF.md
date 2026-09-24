HEKTIQ HANDOFF — resume build

WHO I AM
Cody Green, 31, Louisiana. Blue-collar day job. Solo builder of Hektiq (hektiq.com), a community platform. Build journal on Substack (substack.com/@hektiqmind) and X (@HektiqMind).

HOW TO WORK WITH ME
- Give FULL files, one file at a time. I paste with Ctrl+A, delete, paste, Ctrl+S. Wait for me to say "done" before the next file.
- Always give the terminal command to open the file first, e.g. code app/c/\[slug\]/page.tsx
- Keep answers short and plain. No "ship/shipping" language. Plain, humble, blue-collar voice.
- Don't mention AI anywhere on the site (I build with AI help and say so openly in my journal; I don't want to look two-faced). Focus messaging on real people, fake accounts, and spam.
- Ask before assuming. Be honest about limits and costs.

STACK AND SETUP
- Next.js 16 (App Router, Turbopack), TypeScript, Supabase (database, auth, storage), Vercel (hosting), Resend (email), Phosphor icons (@phosphor-icons/react), Vercel Analytics.
- Code lives in GitHub Codespaces at /workspaces/hektiq (NOT /workspaces/Hektiq.com — common mistake; always cd /workspaces/hektiq first).
- GitHub repo: Codygreen2210/Hektiq. Vercel project serving hektiq.com: hektiq-3g65. Pushing to main auto-deploys.
- hektiq.com only updates after: git add . && git commit -m "..." && git push, then Vercel says Ready.
- Env vars (in .env.local and Vercel): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (Supabase publishable key), SUPABASE_SERVICE_ROLE_KEY (Supabase secret key), NEXT_PUBLIC_SITE_URL=https://hektiq.com, RESEND_API_KEY, CRON_SECRET.
- Supabase project URL: https://amqvqhtsqyzwjcdphxjs.supabase.co
- Resend: hektiq.com domain verified. Emails send from noreply@hektiq.com via Resend's API directly (Supabase SMTP never worked; don't use it). Suggestions and reports email cody@hektiq.com.

DATABASE (Supabase)
- users: id (matches auth user id), email, username, password_hash (placeholder), karma, is_admin, email_verified, bio, avatar_url, created_at, updated_at. RLS on; public read policy exists.
- posts: id, title, body, community_id (TEXT = community slug), author_id, upvotes (score recomputed from post_votes), video_url (canonical link or null), is_deleted (soft delete), created_at.
- comments: id, body, post_id, author_id, is_deleted, created_at.
- communities: id, name, description, slug, icon_emoji, is_seeded, created_by, created_at. (Only member-made communities live here; the 5 main ones are in code.)
- post_votes: (post_id, user_id) primary key, value 1 or -1. One vote per person enforced by the database.
- post_reports: post_id, community_id, reason, details, reporter_username, ip, status, created_at.
- suggestions: type, message, email, username, ip, status, created_at.
- email_verifications: token (64 hex), user_id, expires_at (24h), created_at.
- update_subscribers: email (PK), user_id, subscribed, unsubscribe_token (48 hex), source, created_at, updated_at.
- Storage bucket: avatars (public).
- Admin: my account codyalangreen2210@gmail.com has is_admin = true.
- Old unused tables: post_reactions, comment_reactions, reports, newsletter_subscribers, financial_events, community_members (not wired up yet).
- To fully delete a test account: DELETE FROM users WHERE email='...'; then also delete it in Supabase > Authentication > Users. Must do both.

FIVE MAIN COMMUNITIES (lib/communities.ts, with search keywords)
outdoors (Outdoors), sports (Sports), money-building (Money & Building), garage (Garage), art-makers (Art & Makers).
Color map used across pages: outdoors=c4 green, sports=c5 blue, money-building=c3 yellow, garage=c1 red, art-makers=c2 orange. Member communities default to c2.

DESIGN SYSTEM
- Retro 70s by day, Miami Vice neon by night. Same logo, stripes, and layout in both; only the lighting changes.
- app/theme.css holds all colors as CSS variables for [data-theme='day'] and [data-theme='night']: --bg, --surface, --surface-2, --border, --border-soft, --ink, --text, --muted, --faint, --c1..--c5, --on-c1..--on-c5, --sun1, --sun2, --dot, --btn-bg, --btn-fg, --shadow-hard, --glow.
- Shared classes in theme.css: font-display (Bebas Neue), hk-dots (halftone background), hk-card (sticker card), hk-btn, hk-btn-ghost, hk-input, hk-stripe, hk-neon-text, hk-pop.
- Day palette: cream #FBF1DC, ink #2A1F16, red #E4502F, orange #F08A24, yellow #F2C230, green #2FA36B, blue #2B84D6. Night: bg #0E0719, pink #FF3D9A, orange #FF7A3D, yellow #FFE14D, mint #27F5B0, cyan #2DD4FF, purple #7A2BFF.
- Fonts via next/font in app/layout.tsx: Bebas Neue (--font-bebas, headlines), Inter (body), Sora (legacy).
- Theme picked before page draws via inline script in layout.tsx (localStorage key hektiq_theme, falls back to phone setting). ThemeToggle fires window events hektiq-theme-start and hektiq-theme; going to day waits 350ms so neon can flicker off.
- Homepage hero (components/HeroScene.tsx): striped retro sun; day has 2 perched brown pelicans (stretch + gulp every 15s) and a pelican silhouette gliding across the sun; night has 2 neon flamingos that flicker on, dip heads, flap wings every 15s. Stripes paint in left-to-right going night, right-to-left going day. Animations pause off-screen and respect reduce-motion.
- Community pages: color banner in community color; HOT/NEW/TOP tabs with pixel-art icons (components/PixelIcons.tsx: flame, sparkle, trophy); at night the selected tab is a double neon tube glowing in the community's color with scanlines and a slow pulse.
- Tagline: "Your corner of the internet, run by the people in it." Hero headline: "BUILT BY THE COMMUNITY." Footer: "Hektiq 2026. Built by the community."
- Flamingos, pelicans, and logo are hand-coded placeholders; plan is to hire a designer later (draw head and wing as separate pieces so animations carry over).

KEY FILES
- app/layout.tsx (fonts, theme script, Vercel Analytics), app/theme.css, app/globals.css
- components/Header.tsx (logo mark, search, theme toggle, avatar, logout, yellow email-verify banner with Resend button; re-checks verified status on tab focus, fetches with cache no-store)
- components/ThemeToggle.tsx, HeroScene.tsx, Icons.tsx (Phosphor duotone wrappers + CommunityIcon by slug), PixelIcons.tsx, ReportButton.tsx, VideoEmbed.tsx (click-to-play; nothing third-party loads until tapped), VideoPreview.tsx (card thumbnail/badge)
- lib/communities.ts, lib/authToken.ts (client: getAuthHeader sends Supabase access token), lib/serverAuth.ts (getUserFromRequest returns id, username, avatar_url, email_verified; attachAuthors; VERIFY_MESSAGE), lib/verifyEmail.ts (sendVerificationEmail, baseUrlFrom), lib/video.ts (parseVideo, embedUrl, providerName, isShortTiktokLink, VIDEO_SITES)
- Pages: app/page.tsx (homepage), app/communities, app/c/[slug] (community), app/c/[slug]/new-post, app/c/[slug]/post/[postId], app/search, app/profile/[username], app/auth/login, app/auth/signup, app/auth/verify, app/create-community, app/unsubscribe, app/privacy
- APIs: /api/auth/signup, /api/auth/verify, /api/auth/resend-verification, /api/posts (GET by community, POST), /api/posts/latest, /api/posts/my-votes, /api/posts/[postId] (GET, DELETE), /api/posts/[postId]/vote, /api/posts/[postId]/report, /api/comments (GET, POST), /api/comments/[commentId] (DELETE), /api/communities (GET, POST), /api/communities/[slug], /api/profile/[username] (never returns email), /api/profile/update, /api/search (keywords + typo matching), /api/suggestions, /api/unsubscribe, /api/trending

HOW AUTH WORKS
- Signup: API creates Supabase auth user + users row (email_verified false), deletes the auth user if the profile insert fails, optionally adds to update_subscribers if the checkbox is ticked, sends verification email. Then the page logs in automatically.
- Login stores hektiq_username and hektiq_user_id in localStorage; refuses accounts missing a profile.
- Posting, commenting, voting, and creating communities require a logged-in AND email-verified account, checked on the server. Browsing is open.
- Verify link: marks verified, then logs the person in on whatever device opened it (magic-link token) and sends them home.
- Owners and admins can soft-delete posts and comments. Reports and suggestions are rate-limited by IP and emailed to me.
- Usernames: 3 to 20 characters, lowercase letters, numbers, underscores. Members can create 2 communities per day; reserved names blocked.

DONE AND WORKING
Homepage with suggestion box, 5 communities with icons, member-created communities, community pages, posts, comments, one-per-person voting, delete, report, search with keywords/typos, profiles with bio and photo upload, day/night themes on every page, mobile header, email verification across devices, update opt-in, unsubscribe page, privacy page, Vercel Analytics, video links (YouTube, TikTok, Vimeo, Instagram, Twitch clips; X/Twitter left out on purpose). YouTube confirmed working.

IN PROGRESS: TRENDING PAGE (5 steps)
Plan: /trending with two tabs. "Posts" = best non-video posts. "Videos" = full-screen TikTok-style swipe feed (scroll-snap, one video per screen, only the on-screen video loads; YouTube autoplays muted, TikTok/Instagram need a tap).
- Step 1: app/api/trending/route.ts — WRITTEN (confirm it saved). ?type=posts or ?type=videos. Last 14 days, score = (upvotes + comments*2 + 1) / (hours + 2)^1.5, top 50, with authors and comment counts.
- Step 2: add an autoplay option to lib/video.ts embedUrl and VideoEmbed (YouTube: autoplay=1&mute=1).
- Step 3: components/VideoFeed.tsx swipe feed with title, community chip, votes, comments button over the video.
- Step 4: app/trending/page.tsx with Posts and Videos tabs, themed like the rest.
- Step 5: Trending link in the header and the community page bottom nav (give just the lines to add, not the whole header).

TO-DO AFTER TRENDING
1. Floating one-tap post button (like X) that opens a composer with a community picker
2. Photos in posts (Supabase Storage; photo posts appear under the Posts tab)
3. Shared footer component with the privacy link
4. Forgot-password reset (use the same Resend setup)
5. Continue with Google (on hold; I stopped at the Google Cloud setup step; Google users need a pick-a-username screen and count as verified)
6. Join button that actually saves (community_members) and a Following tab
7. Seed real posts in every community before sharing widely
8. Phone sign-in: on hold until fake accounts become a real problem (costs money per text)
9. ActivityPub/federation: decided not now (conflicts with the no-fake-accounts promise)
10. Account delete button (right now the privacy page says to email me)

KNOWN GOTCHAS
- Pasting long files sometimes cuts off the end or lands in the wrong file; if a build error mentions a file, check it wasn't half-pasted.
- Check a file saved with grep, e.g. grep -c something path/to/file
- Old posts made before authors existed show "unknown."
- If the dev server acts stale: Ctrl+C, then npm run dev.

START HERE: Confirm app/api/trending/route.ts exists, then give me Step 2 of the trending page.