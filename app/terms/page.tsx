import Link from 'next/link'
import Header from '../../components/Header'

export const metadata = {
  title: 'Terms · Hektiq',
  description: 'The rules for using Hektiq, in plain words.',
}

const sections = [
  {
    t: 'THE SHORT VERSION',
    b: [
      'Be a real person, be decent, and don\'t post anything illegal. If you break the rules, your posts can come down and your account can be banned.',
      'By making an account or posting on Hektiq, you agree to these terms.',
    ],
  },
  {
    t: 'WHO CAN USE HEKTIQ',
    b: [
      'You have to be 13 or older.',
      'One person, one account. Accounts made to fake activity, dodge a ban, or pretend to be someone else will be removed.',
      'You\'re responsible for what happens on your account, so keep your password to yourself.',
    ],
  },
  {
    t: 'WHAT\'S NOT ALLOWED',
    b: [
      'Anything illegal, including helping someone break the law.',
      'Anything that sexualizes minors. This gets reported to the National Center for Missing & Exploited Children, and the account is banned for good.',
      'Sexual or pornographic content. Hektiq isn\'t that kind of place.',
      'Threats, or cheering on violence against anyone.',
      'Harassment, bullying, or attacking people for who they are.',
      'Sharing someone\'s private information, like their address, phone number, or where they work, without their okay.',
      'Gore or shock content posted to upset people.',
      'Spam, scams, or ads posted over and over.',
      'Posting someone else\'s work as your own, or content you don\'t have the right to share.',
    ],
  },
  {
    t: 'YOUR POSTS',
    b: [
      'What you post is still yours.',
      'By posting, you give Hektiq permission to show it on the site and in things like link previews and search results. That permission ends when you delete it, except for copies that already went out, like a link someone shared.',
      'If you delete your account, your posts and comments stay up but show "deleted account" instead of your name. Delete them first if you want them gone.',
    ],
  },
  {
    t: 'REMOVING POSTS AND BANNING ACCOUNTS',
    b: [
      'We can remove any post or comment that breaks these rules, and we can suspend or ban accounts that do. Usually there\'s a warning first. For serious stuff, like anything involving minors or real threats, there isn\'t.',
      'When the law requires it, we report content to the authorities and keep what they need.',
      'If you think we got it wrong, email cody@hektiq.com.',
    ],
  },
  {
    t: 'FOUNDING MEMBER BADGES',
    b: [
      'The first 1,000 people to verify their email get a numbered founding member badge. It\'s a thank-you for being early. It has no cash value, and it can\'t be sold or traded.',
      'Badges can be taken back from accounts that are fake, made to grab a number, or banned for breaking these rules.',
    ],
  },
  {
    t: 'COPYRIGHT',
    b: [
      'If something on Hektiq uses your work without permission, email cody@hektiq.com. Include a link to the post, what work it copies, and a way to reach you. We\'ll look at it and take it down if it\'s yours.',
    ],
  },
  {
    t: 'NO PROMISES',
    b: [
      'Hektiq is built by one person and provided as it is. It might go down, lose something, or change. We do our best, but we can\'t guarantee it.',
      'Posts are people\'s own opinions, not advice. That goes double for money, betting, and anything involving your health or safety. Think for yourself before acting on something you read here.',
      'To the extent the law allows, Hektiq isn\'t responsible for what other people post or for losses from using the site.',
    ],
  },
  {
    t: 'CHANGES',
    b: [
      'If these terms change in a way that matters, we\'ll say so on the site. The date at the top shows the last update. Using Hektiq after a change means you\'re okay with it.',
      'These terms follow the laws of Louisiana.',
    ],
  },
]

export default function Terms() {
  return (
    <main className='hk-dots' style={{minHeight:'100vh', color:'var(--text)'}}>
      <Header />
      <div style={{maxWidth:'720px', margin:'0 auto', padding:'32px 16px 64px'}}>
        <h1 className='font-display' style={{fontSize:'3rem', lineHeight:1, margin:'0 0 6px'}}>TERMS</h1>
        <p style={{color:'var(--faint)', fontSize:'0.9rem', margin:'0 0 28px'}}>Last updated September 26, 2026</p>

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
          Questions? Email <a href='mailto:cody@hektiq.com' style={{color:'var(--c5)', fontWeight:700}}>cody@hektiq.com</a>. See also our{' '}
          <Link href='/privacy' style={{color:'var(--c5)', fontWeight:700}}>privacy page</Link>.
        </p>
      </div>
    </main>
  )
}