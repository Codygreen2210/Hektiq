// Checks an image with OpenAI's free moderation model before we save it.
// Returns { ok: true } to allow, or { ok: false, reason, childSafety } to block.

const GORE_THRESHOLD = 0.85 // high on purpose so hunting and fishing photos get through

type Result = { ok: true } | { ok: false; reason: string; childSafety: boolean }

export async function checkImage(bytes: Uint8Array, mime = 'image/jpeg'): Promise<Result> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return { ok: true } // not set up yet, don't block uploads

  try {
    const b64 = Buffer.from(bytes).toString('base64')
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)

    const res = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({
        model: 'omni-moderation-latest',
        input: [{ type: 'image_url', image_url: { url: 'data:' + mime + ';base64,' + b64 } }],
      }),
      signal: controller.signal,
    }).catch(() => null)
    clearTimeout(timer)

    // If OpenAI is down or slow, let it through. Reports still catch it.
    if (!res || !res.ok) return { ok: true }
    const data = await res.json().catch(() => null)
    const r = data?.results?.[0]
    if (!r) return { ok: true }

    const cats = r.categories || {}
    const scores = r.category_scores || {}

    if (cats['sexual/minors']) {
      return { ok: false, reason: 'That photo can\'t be posted here.', childSafety: true }
    }
    if (cats['sexual']) {
      return { ok: false, reason: 'That photo looks like sexual content, which isn\'t allowed on Hektiq.', childSafety: false }
    }
    if ((scores['violence/graphic'] || 0) >= GORE_THRESHOLD) {
      return { ok: false, reason: 'That photo looks too graphic for Hektiq.', childSafety: false }
    }

    return { ok: true }
  } catch (e) {
    return { ok: true }
  }
}

// Emails Cody when an upload is blocked for child safety
export async function alertChildSafety(username: string, userId: string) {
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY },
      body: JSON.stringify({
        from: 'Hektiq Safety <noreply@hektiq.com>',
        to: 'cody@hektiq.com',
        subject: 'URGENT: upload blocked for child safety',
        html: `
          <div style="font-family: sans-serif; max-width: 520px;">
            <p style="font-size: 15px;"><strong>An upload was blocked because it was flagged as sexual content involving a minor.</strong></p>
            <p style="font-size: 14px;">Account: <strong>${username}</strong> (id ${userId})<br>Time: ${new Date().toISOString()}</p>
            <p style="font-size: 14px;">The image was not saved. Consider banning this account from the admin page. If you believe a child is in danger, contact the NCMEC CyberTipline at report.cybertip.org or call 911.</p>
          </div>
        `,
      }),
    })
  } catch (e) {}
}