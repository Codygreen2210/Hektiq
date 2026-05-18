export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { userId, email } = await req.json();
    if (!userId && !email) return new Response(JSON.stringify({ active: false }), { status: 200 });

    const authHeader = { "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}` };

    // Method 1: Search subscriptions directly by metadata user_id
    const subRes = await fetch(
      `https://api.stripe.com/v1/subscriptions?limit=10&status=active`,
      { headers: authHeader }
    );
    const subData = await subRes.json();

    for (const sub of subData.data || []) {
      const metaUserId = sub.metadata?.user_id;
      if (metaUserId === userId) {
        return new Response(JSON.stringify({
          active: true,
          plan: "pro",
          periodEnd: sub.current_period_end,
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
    }

    // Method 2: Search by customer email
    if (email) {
      const custRes = await fetch(
        `https://api.stripe.com/v1/customers/search?query=email:'${email}'&limit=5`,
        { headers: authHeader }
      );
      const custData = await custRes.json();

      for (const customer of custData.data || []) {
        const custSubRes = await fetch(
          `https://api.stripe.com/v1/subscriptions?customer=${customer.id}&status=active&limit=5`,
          { headers: authHeader }
        );
        const custSubData = await custSubRes.json();
        if (custSubData.data?.length > 0) {
          return new Response(JSON.stringify({
            active: true,
            plan: "pro",
            periodEnd: custSubData.data[0].current_period_end,
          }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
      }
    }

    // Method 3: Check checkout sessions by client_reference_id
    const sessionRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions?client_reference_id=${userId}&limit=10`,
      { headers: authHeader }
    );
    const sessionData = await sessionRes.json();

    for (const session of sessionData.data || []) {
      if (session.subscription && session.payment_status === "paid") {
        const checkSubRes = await fetch(
          `https://api.stripe.com/v1/subscriptions/${session.subscription}`,
          { headers: authHeader }
        );
        const checkSub = await checkSubRes.json();
        if (checkSub.status === "active" || checkSub.status === "trialing") {
          return new Response(JSON.stringify({
            active: true,
            plan: "pro",
            periodEnd: checkSub.current_period_end,
          }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
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

