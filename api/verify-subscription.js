export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { email } = await req.json();
    if (!email) return new Response(JSON.stringify({ active: false }), { status: 200 });

    const authHeader = { "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}` };

    // Get all active subscriptions and match by customer email
    const subRes = await fetch(
      `https://api.stripe.com/v1/subscriptions?limit=100&status=active`,
      { headers: authHeader }
    );
    const subData = await subRes.json();

    for (const sub of subData.data || []) {
      const custRes = await fetch(
        `https://api.stripe.com/v1/customers/${sub.customer}`,
        { headers: authHeader }
      );
      const cust = await custRes.json();
      if (cust.email && cust.email.toLowerCase() === email.toLowerCase()) {
        return new Response(JSON.stringify({
          active: true,
          plan: "pro",
          periodEnd: sub.current_period_end,
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ active: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ active: false, error: err.message }), { status: 200 });
  }
}
