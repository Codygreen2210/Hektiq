// Throwaway email services. People use these to make accounts
// without a real inbox. Add new ones here as you spot them.
const DISPOSABLE = new Set([
  'byom.de',
  'mailinator.com', 'mailinator.net',
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamailblock.com',
  'sharklasers.com', 'grr.la', 'pokemail.net', 'spam4.me',
  '10minutemail.com', '10minutemail.net', '20minutemail.com',
  'temp-mail.org', 'temp-mail.io', 'tempmail.com', 'tempmail.net', 'tempmailo.com',
  'tempail.com', 'tempr.email', 'tempinbox.com', 'tempmailaddress.com',
  'tmpmail.org', 'tmpmail.net',
  'discard.email', 'discardmail.com', 'dispostable.com',
  'throwawaymail.com', 'trashmail.com', 'trashmail.de', 'trashmail.net',
  'yopmail.com', 'yopmail.fr', 'yopmail.net',
  'getnada.com', 'nada.email',
  'maildrop.cc', 'mailnesia.com', 'mailcatch.com', 'mintemail.com', 'mohmal.com',
  'fakeinbox.com', 'fakemail.net', 'emailfake.com', 'fakemailgenerator.com', 'generator.email',
  'emailondeck.com', 'mytemp.email', 'spambox.us', 'spamgourmet.com', 'spamdecoy.net',
  'mailpoof.com', 'moakt.com', 'burnermail.io', 'inboxkitten.com',
  'mail.tm', 'mail.gw', 'dropmail.me',
  '1secmail.com', '1secmail.net', '1secmail.org',
  'harakirimail.com', 'anonbox.net', 'mailexpire.com', 'incognitomail.org',
  'minuteinbox.com', 'crazymailing.com', 'luxusmail.org', 'bobmail.info',
  'einrot.com', 'wegwerfmail.de', 'wegwerfmail.net', 'muellmail.com',
  'trbvm.com', 'cuvox.de', 'armyspy.com', 'dayrep.com', 'fleckens.hu', 'gustr.com',
  'jourrapide.com', 'rhyta.com', 'superrito.com', 'teleworm.us',
  'chacuo.net', 'linshiyouxiang.net',
])

export function isDisposableEmail(email: string) {
  const domain = (email.split('@')[1] || '').trim().toLowerCase()
  if (!domain) return true
  if (DISPOSABLE.has(domain)) return true
  // Catch subdomains too, like anything.mailinator.com
  for (const d of DISPOSABLE) {
    if (domain.endsWith('.' + d)) return true
  }
  return false
}

// Names nobody should be able to take
const RESERVED = new Set([
  'admin', 'administrator', 'mod', 'mods', 'moderator', 'moderators',
  'hektiq', 'hektiqmind', 'official', 'staff', 'team', 'support', 'help',
  'system', 'root', 'owner', 'founder', 'thefounder', 'builder', 'thebuilder',
  'security', 'abuse', 'noreply', 'no_reply', 'postmaster', 'webmaster',
  'null', 'undefined', 'deleted', 'deleted_account', 'anonymous', 'unknown',
  'api', 'auth', 'login', 'signup', 'settings', 'privacy', 'terms',
])

export function isReservedUsername(name: string) {
  const n = name.toLowerCase().replace(/_+/g, '_')
  if (RESERVED.has(n)) return true
  // Blocks things like hektiq_admin, official_hektiq, admin_1
  return /(^|_)(hektiq|admin|moderator|official)(_|$|\d)/.test(n)
}