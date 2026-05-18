export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { email } = await req.json();
    if (!email) return new Response(JSON.stringify({ active: false }), { status: 200 });

    const authHeader = { "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}` };

    // Search customers by email directly
    const url = `https://api.stripe.com/v1/customers/search?query=email:"${encodeURIComponent(email)}"&limit=5`;
    const custRes = await fetch(url, { headers: authHeader });
    const custData = await custRes.json();

    for (const customer of (custData.data || [])) {
      const subRes = await fetch(
        `https://api.stripe.com/v1/subscriptions?customer=${customer.id}&status=active&limit=5`,
        { headers: authHeader }
      );
      const subData = await subRes.json();
      if (subData.data?.length > 0) {
        return new Response(JSON.stringify({
          active: true,
          plan: "pro",
          periodEnd: subData.data[0].current_period_end,
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
