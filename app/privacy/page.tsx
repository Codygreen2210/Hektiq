import Link from 'next/link'
import Header from '../../components/Header'

export const metadata = {
  title: 'Privacy - Hektiq',
  description: 'What Hektiq collects, why, and what we do with it.',
}

const sections = [
  {
    t: 'THE SHORT VERSION',
    b: [
      'We collect what we need to run Hektiq and nothing more.',
      'We don\'t sell your information. We don\'t run ads. We don\'t track you around the internet.',
    ],
  },
  {
    t: 'WHAT WE COLLECT',
    b: [
      'Your account: your username, email address, and password. Passwords are handled by our login provider and are never stored in a form we can read.',
      'What you post: posts, photos, comments, votes, your bio, and your profile photo. Posts, photos, comments, your bio, and your profile photo are public. Your votes are not shown to other people.',
      'Communities you join: we save which communities you joined so we can show you their posts. Member counts are public, but the list of who joined is not.',
      'Suggestions and reports: when you use the suggestion box or report a post, we save what you wrote, your username if you\'re logged in, and your internet address (IP) so we can stop spam and abuse.',
      'Password resets: when you ask for a reset link, we save your internet address (IP) for a short time to stop people from spamming the reset form.',
      'Visits: we count page views to see which parts of Hektiq people use. This doesn\'t use cookies and doesn\'t identify you personally.',
      'Your browser remembers a few things on your device, like whether you picked day or night mode and that you\'re logged in.',
    ],
  },
  {
    t: 'WHAT WE USE IT FOR',
    b: [
      'Running your account and showing your posts and profile.',
      'Sending account emails, like verifying your email address or resetting your password.',
      'Keeping fake accounts and spam out.',
      'Sending occasional update emails, only if you checked the box when you signed up.',
    ],
  },
  {
    t: 'WHO ELSE HANDLES IT',
    b: [
      'A few services help run Hektiq: Supabase stores the database and photos, Vercel hosts the site and counts page views, and Resend sends our emails.',
      'They handle your information only to provide those services to us.',
    ],
  },
  {
    t: 'EMAILS',
    b: [
      'Account emails, like verification and password resets, go to anyone who needs them.',
      'Update emails only go to people who asked for them, and every one has a link to unsubscribe in one click.',
    ],
  },
  {
    t: 'YOUR CHOICES',
    b: [
      'You can edit your bio and photo, and delete your own posts and comments, anytime.',
      'You can delete your account yourself from the bottom of your profile page. You\'ll need your password to confirm.',
      'Deleting your account removes your profile, profile photo, email address, login, update emails, and the communities you joined. Your posts and comments stay up but show "deleted account" instead of your name. If you want those gone too, delete them before you delete your account.',
      'To get a copy of your information, email cody@hektiq.com and I\'ll take care of it.',
    ],
  },
  {
    t: 'AGE',
    b: [
      'Hektiq is for people 13 and older. If you\'re under 13, please don\'t sign up.',
    ],
  },
  {
    t: 'CHANGES',
    b: [
      'If this page changes in a way that matters, we\'ll say so on the site. The date at the top shows the last update.',
    ],
  },
]

export default function Privacy() {
  return (
    <main className='hk-dots' style={{minHeight:'100vh', color:'var(--text)'}}>
      <Header />
      <div style={{maxWidth:'720px', margin:'0 auto', padding:'32px 16px 64px'}}>
        <h1 className='font-display' style={{fontSize:'3rem', lineHeight:1, margin:'0 0 6px'}}>PRIVACY</h1>
        <p style={{color:'var(--faint)', fontSize:'0.9rem', margin:'0 0 28px'}}>Last updated September 24, 2026</p>

        <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
          {sections.map(s => (
            <section key={s.t} className='hk-card' style={{padding:'18px 20px'}}>
              <h2 className='font-display' style={{fontSize:'1.4rem', margin:'0 0 8px'}}>{s.t}</h2>
              {s.b.map((p, i) => (
                <p key={i} style={{fontSize:'0.98rem', lineHeight:1.7, color:'var(--text)', margin: i === s.b.length - 1 ? 0 : '0 0 10px'}}>{p}</p>
              ))}
            </section>
          ))}
        </div>

        <p style={{color:'var(--muted)', fontSize:'0.95rem', lineHeight:1.7, margin:'28px 0 0'}}>
          Questions? Email <a href='mailto:cody@hektiq.com' style={{color:'var(--c5)', fontWeight:700}}>cody@hektiq.com</a>, or use the{' '}
          <Link href='/#suggest' style={{color:'var(--c5)', fontWeight:700}}>suggestion box</Link>.
        </p>
      </div>
    </main>
  )
}