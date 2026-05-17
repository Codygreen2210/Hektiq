export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { userId } = await req.json();
    if (!userId) return new Response(JSON.stringify({ active: false }), { status: 200 });

    // Search for checkout sessions with this user ID
    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions?client_reference_id=${userId}&limit=10`,
      {
        headers: {
          "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Failed to verify subscription");

    // Check if any session has an active subscription
    for (const session of data.data || []) {
      if (session.subscription && session.payment_status === "paid") {
        // Verify the subscription is still active
        const subRes = await fetch(
          `https://api.stripe.com/v1/subscriptions/${session.subscription}`,
          {
            headers: {
              "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            },
          }
        );
        const sub = await subRes.json();
        if (sub.status === "active" || sub.status === "trialing") {
          return new Response(JSON.stringify({
            active: true,
            plan: "pro",
            periodEnd: sub.current_period_end,
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    }

    return new Response(JSON.stringify({ active: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    // On error, default to allowing access to avoid locking out users
    return new Response(JSON.stringify({ active: false, error: err.message }), { status: 200 });
  }
}
