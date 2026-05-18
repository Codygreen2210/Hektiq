export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { email } = await req.json();
    const authHeader = { "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}` };

    // Get all subscriptions
    const subRes = await fetch(
      `https://api.stripe.com/v1/subscriptions?limit=10`,
      { headers: authHeader }
    );
    const subData = await subRes.json();

    // Get customers by email
    const custRes = await fetch(
      `https://api.stripe.com/v1/customers/search?query=email:'${email}'&limit=5`,
      { headers: authHeader }
    );
    const custData = await custRes.json();

    return new Response(JSON.stringify({
      subscriptions: subData.data?.map(s => ({
        id: s.id,
        status: s.status,
        metadata: s.metadata,
        customer: s.customer,
      })),
      customers: custData.data?.map(c => ({
        id: c.id,
        email: c.email,
      })),
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
