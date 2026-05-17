export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { userId, email } = await req.json();
    if (!userId) return new Response(JSON.stringify({ error: "No user ID provided" }), { status: 400 });

    const origin = req.headers.get("origin") || "https://hektiq.com";

    const params = new URLSearchParams({
      "mode": "subscription",
      "line_items[0][price]": process.env.STRIPE_PRICE_ID,
      "line_items[0][quantity]": "1",
      "success_url": `${origin}/dashboard?upgraded=true`,
      "cancel_url": `${origin}/dashboard`,
      "client_reference_id": userId,
      "metadata[user_id]": userId,
    });

    if (email) params.append("customer_email", email);

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await res.json();
    if (!res.ok) throw new Error(session.error?.message || "Failed to create checkout session");

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
