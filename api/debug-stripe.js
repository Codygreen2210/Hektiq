export const config = { runtime: "edge" };

export default async function handler(req) {
  try {
    const authHeader = { "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}` };

    // Get all subscriptions
    const subRes = await fetch(
      `https://api.stripe.com/v1/subscriptions?limit=10`,
      { headers: authHeader }
    );
    const subData = await subRes.json();

    // Get all customers
    const custRes = await fetch(
      `https://api.stripe.com/v1/customers?limit=10`,
      { headers: authHeader }
    );
    const custData = await custRes.json();

    return new Response(JSON.stringify({
      subscriptions: subData.data?.map(s => ({
        id: s.id,
        status: s.status,
        metadata: s.metadata,
        customer: s.customer,
        client_reference_id: s.client_reference_id,
      })),
      customers: custData.data?.map(c => ({
        id: c.id,
        email: c.email,
        metadata: c.metadata,
      })),
      keyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 12),
    }, null, 2), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
