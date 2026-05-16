export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { adminKey } = await req.json();
    if (!adminKey) return new Response(JSON.stringify({ error: "No API key provided" }), { status: 400 });
    if (!adminKey.startsWith("sk-ant-admin")) {
      return new Response(JSON.stringify({ error: "This requires an Admin API key (starts with sk-ant-admin). Generate one at console.anthropic.com → API Keys." }), { status: 400 });
    }

    // Get last 30 days
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    const startStr = start.toISOString().split(".")[0] + "Z";
    const endStr = now.toISOString().split(".")[0] + "Z";

    // Fetch usage by day grouped by model
    const usageRes = await fetch(
      `https://api.anthropic.com/v1/organizations/usage_report/messages?starting_at=${startStr}&ending_at=${endStr}&bucket_width=1d&group_by[]=model`,
      {
        headers: {
          "x-api-key": adminKey,
          "anthropic-version": "2023-06-01",
        },
      }
    );

    // Fetch cost report
    const costRes = await fetch(
      `https://api.anthropic.com/v1/organizations/cost_report?starting_at=${startStr}&ending_at=${endStr}&bucket_width=1d`,
      {
        headers: {
          "x-api-key": adminKey,
          "anthropic-version": "2023-06-01",
        },
      }
    );

    if (!usageRes.ok) {
      const err = await usageRes.json();
      return new Response(JSON.stringify({ error: err.error?.message || "Failed to fetch usage data. Check your Admin API key." }), { status: usageRes.status });
    }

    const usageData = await usageRes.json();
    const costData = costRes.ok ? await costRes.json() : null;

    // Process daily costs
    const dailyCosts = {};
    if (costData?.data) {
      costData.data.forEach(entry => {
        const date = entry.timestamp?.split("T")[0] || entry.start_time?.split("T")[0];
        if (date) {
          dailyCosts[date] = (dailyCosts[date] || 0) + (parseFloat(entry.total_cost || 0));
        }
      });
    }

    // Process usage data — calculate cost from tokens if cost endpoint failed
    const PRICES = {
      "claude-opus-4-6":    { input: 5.00,  output: 25.00 },
      "claude-opus-4-7":    { input: 5.00,  output: 25.00 },
      "claude-sonnet-4-5":  { input: 3.00,  output: 15.00 },
      "claude-sonnet-4-6":  { input: 3.00,  output: 15.00 },
      "claude-haiku-4-5":   { input: 1.00,  output: 5.00  },
      "claude-haiku-3-5":   { input: 0.80,  output: 4.00  },
    };

    const dailyUsage = {};
    const modelBreakdown = {};

    if (usageData?.data) {
      usageData.data.forEach(entry => {
        const date = entry.timestamp?.split("T")[0] || entry.start_time?.split("T")[0];
        if (!date) return;

        const model = entry.model || "unknown";
        const inputTokens = entry.input_tokens || 0;
        const outputTokens = entry.output_tokens || 0;

        // Calculate cost from tokens
        const prices = PRICES[model] || { input: 3.00, output: 15.00 };
        const cost = (inputTokens / 1_000_000 * prices.input) + (outputTokens / 1_000_000 * prices.output);

        if (!dailyUsage[date]) dailyUsage[date] = { inputTokens: 0, outputTokens: 0, cost: 0 };
        dailyUsage[date].inputTokens += inputTokens;
        dailyUsage[date].outputTokens += outputTokens;
        dailyUsage[date].cost += dailyCosts[date] || cost;

        if (!modelBreakdown[model]) modelBreakdown[model] = { inputTokens: 0, outputTokens: 0, cost: 0 };
        modelBreakdown[model].inputTokens += inputTokens;
        modelBreakdown[model].outputTokens += outputTokens;
        modelBreakdown[model].cost += cost;
      });
    }

    // Build 30-day timeline
    const timeline = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const usage = dailyUsage[dateStr] || { inputTokens: 0, outputTokens: 0, cost: 0 };
      timeline.push({
        date: dateStr,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        cost: Math.round(usage.cost * 100) / 100,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
      });
    }

    // Calculate totals
    const totalCost = timeline.reduce((s, d) => s + d.cost, 0);
    const totalInputTokens = timeline.reduce((s, d) => s + d.inputTokens, 0);
    const totalOutputTokens = timeline.reduce((s, d) => s + d.outputTokens, 0);

    // Project this month
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const thisMonthCost = timeline.filter(d => d.date >= thisMonthStart).reduce((s, d) => s + d.cost, 0);
    const projectedMonthly = dayOfMonth > 0 ? (thisMonthCost / dayOfMonth) * daysInMonth : 0;

    // 7-day average daily spend
    const last7 = timeline.slice(-7);
    const avgDailySpend = last7.reduce((s, d) => s + d.cost, 0) / 7;

    return new Response(JSON.stringify({
      success: true,
      timeline,
      totalCost: Math.round(totalCost * 100) / 100,
      totalInputTokens,
      totalOutputTokens,
      thisMonthCost: Math.round(thisMonthCost * 100) / 100,
      projectedMonthly: Math.round(projectedMonthly * 100) / 100,
      avgDailySpend: Math.round(avgDailySpend * 100) / 100,
      modelBreakdown: Object.entries(modelBreakdown).map(([model, data]) => ({
        model,
        cost: Math.round(data.cost * 100) / 100,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
      })).sort((a, b) => b.cost - a.cost),
      daysInPeriod: 30,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
