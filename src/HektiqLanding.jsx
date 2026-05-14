import { useState, useEffect, useRef } from "react";

const BG      = "#070909";
const PANEL   = "#101314";
const PANEL_2 = "#15191b";
const BORDER  = "#1d2326";
const ACID    = "#d7ff3f";
const ACID_S  = "#a8c92f";
const TEXT    = "#f3f5f7";
const MUTED   = "#7b848c";
const WARN    = "#ff7a45";
const GREEN   = "#4ade80";
const BLUE    = "#60a5fa";
const PURPLE  = "#b388ff";

const MONO    = "'IBM Plex Mono', monospace";
const DISPLAY = "'Syne', sans-serif";
const BODY    = "'DM Sans', sans-serif";

// ── HOOKS ──────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(typeof window !== "undefined" && window.innerWidth < 600);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 600);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return mobile;
}

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.15 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return inView;
}

function useCounter(target, duration = 1400, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let s = null;
    const step = ts => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, start]);
  return val;
}

// ── TICKER (hero burn counter) ─────────────────────────────────
// $191/mo ÷ (30.44 days × 24hr × 3600sec) = $0.00007265/sec exactly
const BURN_PER_SEC = 191 / (30.44 * 24 * 3600);

function BurnTicker() {
  const [amount, setAmount] = useState(0);
  useEffect(() => {
    const perTick = BURN_PER_SEC / 10;
    const interval = setInterval(() => setAmount(a => a + perTick), 100);
    return () => clearInterval(interval);
  }, []);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "clamp(36px, 10vw, 72px)", fontWeight: 800, color: WARN, fontFamily: MONO, letterSpacing: "-0.03em", lineHeight: 1, textShadow: `0 0 40px ${WARN}33` }}>
        ${amount.toFixed(6)}
      </div>
      <div style={{ fontSize: "clamp(11px, 2vw, 13px)", color: MUTED, fontFamily: MONO, marginTop: 10 }}>
        burned since you opened this page
      </div>
      <div style={{ fontSize: "clamp(9px, 1.5vw, 10px)", color: "#3a4448", fontFamily: MONO, marginTop: 6, letterSpacing: 0.5 }}>
        Based on avg AI builder spend · <span style={{ color: MUTED }}>$191/mo</span> · <span style={{ color: MUTED }}>$0.0000726/sec</span> · <span style={{ color: MUTED }}>$2,292/yr</span>
      </div>
    </div>
  );
}

// ── MINI DASHBOARD PREVIEW ─────────────────────────────────────
function DashboardPreview() {
  return (
    <div style={{
      background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 12,
      padding: "20px 22px", position: "relative", overflow: "hidden",
      boxShadow: `0 0 80px ${ACID}0a, 0 40px 80px rgba(0,0,0,0.6)`,
    }}>
      {/* Scan line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${ACID}66,transparent)`, animation: "scanline 4s ease-in-out infinite" }} />

      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 9, color: MUTED, letterSpacing: 3, fontFamily: MONO, marginBottom: 3 }}>STACK HEALTH</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 38, fontWeight: 800, color: ACID, fontFamily: MONO, textShadow: `0 0 20px ${ACID}44` }}>74%</span>
            <span style={{ fontSize: 11, color: GREEN, fontFamily: MONO }}>▲ +6</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { l: "MONTHLY BURN", v: "$191", c: WARN },
            { l: "SAVINGS AVAIL", v: "$51/mo", c: ACID },
            { l: "ACTIVE TOOLS", v: "7", c: TEXT },
            { l: "OVERLAP WASTE", v: "$40/mo", c: WARN },
          ].map(s => (
            <div key={s.l} style={{ background: PANEL_2, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 12px" }}>
              <div style={{ fontSize: 7, color: MUTED, fontFamily: MONO, letterSpacing: 1.5, marginBottom: 3 }}>{s.l}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: s.c, fontFamily: MONO }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Health bar */}
      <div style={{ height: 3, background: "#1a2022", borderRadius: 2, marginBottom: 16, overflow: "hidden" }}>
        <div style={{ width: "74%", height: "100%", background: `linear-gradient(90deg,${ACID_S},${ACID})`, boxShadow: `0 0 8px ${ACID}66` }} />
      </div>

      {/* Tools */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {[
          { name: "Claude API",     cost: "$84", overlap: false, dead: false, roi: "$420" },
          { name: "ChatGPT Plus",   cost: "$20", overlap: true,  dead: false, roi: "—"    },
          { name: "Cursor Pro",     cost: "$20", overlap: false, dead: false, roi: "$310" },
          { name: "Perplexity Pro", cost: "$20", overlap: true,  dead: false, roi: "—"    },
          { name: "Midjourney",     cost: "$10", overlap: false, dead: true,  roi: "—"    },
        ].map(t => (
          <div key={t.name} style={{
            display: "flex", alignItems: "center", padding: "7px 10px", borderRadius: 5,
            background: t.overlap ? `${WARN}08` : t.dead ? `${MUTED}05` : "transparent",
            borderLeft: t.overlap ? `2px solid ${WARN}` : t.dead ? `2px solid ${MUTED}33` : "2px solid transparent",
            opacity: t.dead ? 0.6 : 1,
          }}>
            <div style={{ flex: 1, fontSize: 11, color: t.dead ? MUTED : TEXT, fontWeight: 500 }}>{t.name}</div>
            <div style={{ fontSize: 10, color: t.roi !== "—" ? GREEN : MUTED, fontFamily: MONO, marginRight: 16 }}>{t.roi}</div>
            <div style={{ fontSize: 11, color: TEXT, fontFamily: MONO }}>{t.cost}</div>
            {t.overlap && <div style={{ marginLeft: 8, fontSize: 7, color: WARN, fontFamily: MONO, letterSpacing: 1 }}>OVERLAP</div>}
            {t.dead && <div style={{ marginLeft: 8, fontSize: 7, color: MUTED, fontFamily: MONO, letterSpacing: 1 }}>INACTIVE</div>}
          </div>
        ))}
      </div>

      {/* Rec pill */}
      <div style={{ marginTop: 14, background: `${ACID}0a`, border: `1px solid ${ACID}25`, borderRadius: 6, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9, color: ACID, fontFamily: MONO, letterSpacing: 1, marginBottom: 3 }}>✦ HEKTIQ RECOMMENDATION</div>
          <div style={{ fontSize: 11, color: MUTED }}>Replace ChatGPT Plus + Perplexity with OpenRouter routing</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: GREEN, fontFamily: MONO, flexShrink: 0, marginLeft: 16 }}>save $41/mo</div>
      </div>
    </div>
  );
}

// ── FEATURE CARD ───────────────────────────────────────────────
function FeatureCard({ icon, title, body, accent, delay = 0 }) {
  const ref = useRef();
  const inView = useInView(ref);
  return (
    <div ref={ref} style={{
      background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 10,
      padding: "22px 22px", position: "relative", overflow: "hidden",
      opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.5s ${delay}ms, transform 0.5s ${delay}ms`,
    }}>
      <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: `${accent}06`, filter: "blur(20px)" }} />
      <div style={{ fontSize: 22, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 8, fontFamily: DISPLAY }}>{title}</div>
      <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.65 }}>{body}</div>
    </div>
  );
}

// ── ARCHETYPE CARD ─────────────────────────────────────────────
function ArchetypeCard({ name, emoji, color, traits }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `${color}0c` : PANEL_2,
        border: `1px solid ${hovered ? color + "44" : BORDER}`,
        borderRadius: 10, padding: "18px 18px", cursor: "pointer",
        transition: "all 0.2s", transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? `0 8px 30px ${color}15` : "none",
      }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: hovered ? color : TEXT, marginBottom: 10, fontFamily: DISPLAY }}>{name}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {traits.map(t => (
          <div key={t} style={{ fontSize: 10, color: MUTED, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: color, fontSize: 8 }}>▸</span>{t}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STACK CALCULATOR ──────────────────────────────────────────
const TOOL_PLANS = [
  { name: "Claude API", icon: "◆", category: "agent", plans: [
    { label: "Free",     cost: 0   },
    { label: "Pro",      cost: 20  },
    { label: "Max",      cost: 100 },
    { label: "Team",     cost: 30  },
  ]},
  { name: "ChatGPT", icon: "◉", category: "agent", plans: [
    { label: "Free",       cost: 0  },
    { label: "Plus",       cost: 20 },
    { label: "Team",       cost: 30 },
    { label: "Enterprise", cost: 60 },
  ]},
  { name: "Cursor", icon: "▸", category: "agent", plans: [
    { label: "Hobby",    cost: 0  },
    { label: "Pro",      cost: 20 },
    { label: "Business", cost: 40 },
  ]},
  { name: "Perplexity", icon: "◈", category: "agent", plans: [
    { label: "Free", cost: 0  },
    { label: "Pro",  cost: 20 },
  ]},
  { name: "Midjourney", icon: "◐", category: "agent", plans: [
    { label: "Basic",    cost: 10  },
    { label: "Standard", cost: 30  },
    { label: "Pro",      cost: 60  },
    { label: "Mega",     cost: 120 },
  ]},
  { name: "Runway ML", icon: "◑", category: "agent", plans: [
    { label: "Standard",  cost: 15 },
    { label: "Pro",       cost: 35 },
    { label: "Unlimited", cost: 95 },
  ]},
  { name: "ElevenLabs", icon: "◒", category: "agent", plans: [
    { label: "Free",    cost: 0  },
    { label: "Starter", cost: 5  },
    { label: "Creator", cost: 22 },
    { label: "Pro",     cost: 99 },
  ]},
  { name: "GitHub Copilot", icon: "◓", category: "agent", plans: [
    { label: "Individual", cost: 10 },
    { label: "Business",   cost: 19 },
    { label: "Enterprise", cost: 39 },
  ]},
  { name: "GitHub", icon: "◎", category: "tools", plans: [
    { label: "Free", cost: 0 },
    { label: "Team", cost: 4 },
    { label: "Enterprise", cost: 21 },
  ]},
  { name: "Notion AI", icon: "▣", category: "tools", plans: [
    { label: "Free",     cost: 0  },
    { label: "Plus",     cost: 10 },
    { label: "Business", cost: 15 },
  ]},
  { name: "Zapier", icon: "⚡", category: "tools", plans: [
    { label: "Free",         cost: 0  },
    { label: "Starter",      cost: 20 },
    { label: "Professional", cost: 49 },
    { label: "Team",         cost: 69 },
  ]},
  { name: "Vercel", icon: "▲", category: "tools", plans: [
    { label: "Hobby", cost: 0  },
    { label: "Pro",   cost: 20 },
  ]},
  { name: "Supabase", icon: "◫", category: "tools", plans: [
    { label: "Free",  cost: 0  },
    { label: "Pro",   cost: 25 },
    { label: "Team",  cost: 599},
  ]},
  { name: "Replit", icon: "◧", category: "agent", plans: [
    { label: "Free",  cost: 0  },
    { label: "Core",  cost: 15 },
    { label: "Teams", cost: 20 },
  ]},
  { name: "Lovable", icon: "◈", category: "agent", plans: [
    { label: "Free",    cost: 0   },
    { label: "Starter", cost: 25  },
    { label: "Launch",  cost: 50  },
    { label: "Scale",   cost: 100 },
  ]},
  { name: "Bolt", icon: "◉", category: "agent", plans: [
    { label: "Free", cost: 0  },
    { label: "Pro",  cost: 20 },
  ]},
  // ── Infrastructure (Pieter Levels stack) ──
  { name: "Cloudflare", icon: "☁", category: "tools", plans: [
    { label: "Free",       cost: 0   },
    { label: "Pro",        cost: 20  },
    { label: "Business",   cost: 200 },
  ]},
  { name: "Hetzner", icon: "◈", category: "tools", plans: [
    { label: "CX22 (~2GB)", cost: 4  },
    { label: "CX32 (~4GB)", cost: 9  },
    { label: "CX42 (~8GB)", cost: 18 },
    { label: "CX52 (~16GB)",cost: 36 },
    { label: "Custom ~$50", cost: 50 },
  ]},
  { name: "Backblaze", icon: "◉", category: "tools", plans: [
    { label: "B2 ~$7",  cost: 7  },
    { label: "B2 ~$15", cost: 15 },
    { label: "B2 ~$30", cost: 30 },
  ]},
  { name: "Xero", icon: "▦", category: "tools", plans: [
    { label: "Starter",  cost: 15 },
    { label: "Standard", cost: 42 },
    { label: "Premium",  cost: 78 },
  ]},
  // ── Marc Lou stack ──
  { name: "MongoDB Atlas", icon: "◉", category: "tools", plans: [
    { label: "Free M0",   cost: 0  },
    { label: "Flex",      cost: 10 },
    { label: "Dedicated", cost: 57 },
  ]},
  { name: "Resend", icon: "◎", category: "tools", plans: [
    { label: "Free",  cost: 0  },
    { label: "Pro",   cost: 20 },
    { label: "Scale", cost: 90 },
  ]},
  { name: "Mailgun", icon: "◈", category: "tools", plans: [
    { label: "Free (trial)", cost: 0 },
    { label: "Foundation",   cost: 4 },
    { label: "Growth",       cost: 35},
  ]},
  { name: "Stripe", icon: "◆", category: "tools", plans: [
    { label: "Pay-as-go (2.9%+30¢)", cost: 0  },
    { label: "Custom",                cost: 0  },
  ]},
  { name: "Lemon Squeezy", icon: "◑", category: "tools", plans: [
    { label: "Pay-as-go (5%+50¢)", cost: 0 },
  ]},
  { name: "Tailwind CSS", icon: "▸", category: "tools", plans: [
    { label: "Free (open source)", cost: 0 },
    { label: "Tailwind UI",        cost: 25 },
  ]},
  // ── Other popular tools ──
  { name: "Linear", icon: "◈", category: "tools", plans: [
    { label: "Free",     cost: 0  },
    { label: "Business", cost: 8  },
  ]},
  { name: "Figma", icon: "◐", category: "tools", plans: [
    { label: "Free",         cost: 0  },
    { label: "Professional", cost: 15 },
    { label: "Organization", cost: 45 },
  ]},
  { name: "Loom", icon: "◒", category: "tools", plans: [
    { label: "Free",     cost: 0  },
    { label: "Business", cost: 15 },
  ]},
  { name: "Slack", icon: "◉", category: "tools", plans: [
    { label: "Free",    cost: 0  },
    { label: "Pro",     cost: 8  },
    { label: "Business",cost: 15 },
  ]},
  { name: "Intercom", icon: "◎", category: "tools", plans: [
    { label: "Essential", cost: 39  },
    { label: "Advanced",  cost: 99  },
    { label: "Expert",    cost: 139 },
  ]},
  { name: "PostHog", icon: "◓", category: "tools", plans: [
    { label: "Free",  cost: 0  },
    { label: "Scale", cost: 20 },
  ]},
  { name: "Sentry", icon: "▣", category: "tools", plans: [
    { label: "Free",     cost: 0  },
    { label: "Team",     cost: 26 },
    { label: "Business", cost: 80 },
  ]},
  { name: "PlanetScale", icon: "◫", category: "tools", plans: [
    { label: "Hobby",  cost: 0  },
    { label: "Scaler", cost: 39 },
  ]},
  { name: "Railway", icon: "◧", category: "tools", plans: [
    { label: "Free",   cost: 0  },
    { label: "Hobby",  cost: 5  },
    { label: "Pro",    cost: 20 },
  ]},
  { name: "Fly.io", icon: "◑", category: "tools", plans: [
    { label: "Pay-as-go ~$5",  cost: 5  },
    { label: "Pay-as-go ~$20", cost: 20 },
    { label: "Pay-as-go ~$50", cost: 50 },
  ]},
  { name: "AWS", icon: "◆", category: "tools", plans: [
    { label: "~$10/mo",  cost: 10  },
    { label: "~$50/mo",  cost: 50  },
    { label: "~$100/mo", cost: 100 },
    { label: "~$500/mo", cost: 500 },
  ]},
  { name: "OpenAI API", icon: "◉", category: "agent", plans: [
    { label: "Pay-as-go ~$10",  cost: 10  },
    { label: "Pay-as-go ~$50",  cost: 50  },
    { label: "Pay-as-go ~$100", cost: 100 },
  ]},
  { name: "Anthropic API", icon: "◆", category: "agent", plans: [
    { label: "Pay-as-go ~$20",  cost: 20  },
    { label: "Pay-as-go ~$50",  cost: 50  },
    { label: "Pay-as-go ~$100", cost: 100 },
  ]},
  { name: "Other (unlisted)", icon: "＋", category: "agent", plans: [
    { label: "Custom", cost: 0 },
  ]},
];

const AI_AGENTS   = TOOL_PLANS.filter(t => t.category === "agent");
const INFRA_TOOLS = TOOL_PLANS.filter(t => t.category === "tools");

function StackCalculator({ mobile }) {
  const [tab, setTab]                 = useState("agent");
  const [selected, setSelected]       = useState({});
  const [planChoice, setPlanChoice]   = useState({});
  const [customCosts, setCustomCosts] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [calcEmail, setCalcEmail]     = useState("");
  const [calcSubmitted, setCalcSubmitted] = useState(false);
  const [calcLoading, setCalcLoading] = useState(false);

  const toggleTool = (name) => {
    setSelected(s => ({ ...s, [name]: !s[name] }));
    setShowResults(false);
    // Default to first paid plan
    if (!selected[name]) {
      const tool = TOOL_PLANS.find(t => t.name === name);
      const defaultPlan = tool?.plans.find(p => p.cost > 0) || tool?.plans[0];
      if (defaultPlan) setPlanChoice(p => ({ ...p, [name]: defaultPlan.label }));
    }
  };

  const getCost = (tool) => {
    if (tool.name === "Other (unlisted)") return Number(customCosts[tool.name]) || 0;
    const chosenLabel = planChoice[tool.name];
    const plan = tool.plans.find(p => p.label === chosenLabel) || tool.plans.find(p => p.cost > 0) || tool.plans[0];
    return plan?.cost || 0;
  };

  const activeTools = TOOL_PLANS.filter(t => selected[t.name]);
  const totalMonthly = activeTools.reduce((s, t) => s + getCost(t), 0);
  const totalAnnual  = totalMonthly * 12;

  const aiChatTools  = ["Claude API","ChatGPT","Perplexity","Anthropic API","OpenAI API"].filter(n => selected[n]);
  const devTools     = ["Cursor","GitHub Copilot","Replit"].filter(n => selected[n]);
  const noCodeTools  = ["Lovable","Bolt","Replit"].filter(n => selected[n]);
  const emailTools   = ["Resend","Mailgun"].filter(n => selected[n]);
  const dbTools      = ["Supabase","MongoDB Atlas","PlanetScale"].filter(n => selected[n]);
  const hostTools    = ["Vercel","Railway","Fly.io","Hetzner","AWS"].filter(n => selected[n]);
  const overlapGroups= [aiChatTools, devTools, noCodeTools, emailTools, dbTools, hostTools].filter(g => g.length > 1);
  const overlapCount = overlapGroups.reduce((s, g) => s + g.length - 1, 0);
  const overlapCost  = overlapCount * 18;
  const healthScore  = Math.max(20, Math.min(99, 95 - (activeTools.length * 4) - (overlapCount * 12)));
  const scoreColor   = healthScore >= 75 ? GREEN : healthScore >= 50 ? WARN : "#ff4444";

  const handleCalcSubmit = async () => {
    if (!calcEmail.includes("@")) return;
    setCalcLoading(true);
    try {
      await fetch("https://formspree.io/f/mdabbjvn", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: calcEmail, monthly: totalMonthly, tools: activeTools.map(t => `${t.name} (${planChoice[t.name] || ""})`).join(", ") }),
      });
    } catch (e) {}
    setCalcLoading(false);
    setCalcSubmitted(true);
  };

  return (
    <section id="calculator" style={{ padding: mobile ? "40px 20px" : "0 48px 100px", borderTop: `1px solid ${BORDER}` }}>
      <div style={{ maxWidth: 720, margin: mobile ? "0 auto" : "60px auto 0" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: ACID, letterSpacing: 3, fontFamily: MONO, marginBottom: 14 }}>FREE TOOL</div>
          <h2 style={{ fontSize: mobile ? 24 : 34, fontWeight: 800, letterSpacing: -1, fontFamily: DISPLAY, marginBottom: 12 }}>
            What's your AI stack costing you?
          </h2>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>
            Select your tools and plan. We'll calculate your monthly burn, overlap waste, and stack health score instantly.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 20, background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
          {[
            { key: "agent", label: "AI Agents", count: AI_AGENTS.length },
            { key: "tools", label: "Infrastructure & Tools", count: INFRA_TOOLS.length },
          ].map(t => (
            <div key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: "12px 16px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: tab === t.key ? `${ACID}12` : "transparent",
              borderBottom: tab === t.key ? `2px solid ${ACID}` : "2px solid transparent",
              transition: "all 0.15s",
              fontSize: 12, fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? ACID : MUTED,
              lineHeight: 1,
            }}>
              <span>{tab === t.key ? (t.key === "agent" ? "🤖" : "🔧") : (t.key === "agent" ? "🤖" : "🔧")}</span>
              <span>{t.label}</span>
              <span style={{ fontSize: 10, color: tab === t.key ? ACID_S : "#2d3539", fontFamily: MONO }}>({t.count})</span>
            </div>
          ))}
        </div>

        {/* Tool grid with plan dropdowns */}
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
          {(tab === "agent" ? AI_AGENTS : INFRA_TOOLS).map(tool => {
            const active = selected[tool.name];
            const chosenLabel = planChoice[tool.name] || (tool.plans.find(p => p.cost > 0) || tool.plans[0])?.label;
            const chosenPlan  = tool.plans.find(p => p.label === chosenLabel) || tool.plans[0];
            const isOther     = tool.name === "Other (unlisted)";

            return (
              <div key={tool.name} style={{
                background: active ? `${ACID}0e` : PANEL,
                border: `1px solid ${active ? ACID + "44" : BORDER}`,
                borderRadius: 8, padding: "10px 12px",
                transition: "all 0.15s",
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                {/* Tool name row */}
                <div
                  onClick={() => toggleTool(tool.name)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: active ? ACID : MUTED, fontSize: 11 }}>{tool.icon}</span>
                    <span style={{ fontSize: 12, color: active ? ACID : TEXT, fontWeight: active ? 600 : 400 }}>{tool.name}</span>
                  </div>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: active ? ACID : "#1d2326", border: `1px solid ${active ? ACID : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                    {active && <span style={{ fontSize: 9, color: BG, fontWeight: 900 }}>✓</span>}
                  </div>
                </div>

                {/* Plan dropdown — only when active */}
                {active && (
                  isOther ? (
                    <div style={{ display: "flex", alignItems: "center", background: PANEL_2, border: `1px solid ${BORDER}`, borderRadius: 5, padding: "5px 8px" }}>
                      <span style={{ color: MUTED, fontSize: 11, marginRight: 3 }}>$</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={customCosts[tool.name] || ""}
                        onChange={e => { setCustomCosts(c => ({ ...c, [tool.name]: e.target.value })); setShowResults(false); }}
                        style={{ width: "100%", background: "transparent", border: "none", color: TEXT, fontSize: 12, fontFamily: MONO, outline: "none" }}
                      />
                      <span style={{ color: MUTED, fontSize: 10 }}>/mo</span>
                    </div>
                  ) : (
                    <div style={{ position: "relative" }}>
                      <select
                        value={chosenLabel}
                        onChange={e => { setPlanChoice(p => ({ ...p, [tool.name]: e.target.value })); setShowResults(false); }}
                        onClick={e => e.stopPropagation()}
                        style={{
                          width: "100%", background: PANEL_2, border: `1px solid ${BORDER}`,
                          borderRadius: 5, padding: "5px 8px", color: TEXT,
                          fontSize: 11, fontFamily: MONO, outline: "none", cursor: "pointer",
                          appearance: "none", WebkitAppearance: "none",
                        }}
                      >
                        {tool.plans.map(p => (
                          <option key={p.label} value={p.label} style={{ background: PANEL_2 }}>
                            {p.label} — ${p.cost}/mo
                          </option>
                        ))}
                      </select>
                      <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: MUTED, fontSize: 9, pointerEvents: "none" }}>▾</span>
                    </div>
                  )
                )}

                {/* Cost preview when active */}
                {active && !isOther && (
                  <div style={{ fontSize: 10, color: MUTED, fontFamily: MONO }}>
                    ${getCost(tool)}/mo · ${getCost(tool) * 12}/yr
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Calculate button */}
        {activeTools.length > 0 && !showResults && (
          <button onClick={() => setShowResults(true)} style={{
            width: "100%", background: ACID, color: BG, border: "none",
            padding: "14px", borderRadius: 8, fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: BODY, marginBottom: 16,
            boxShadow: `0 0 20px ${ACID}44`,
          }}>
            Calculate My Stack →
          </button>
        )}

        {/* Results */}
        {showResults && activeTools.length > 0 && (
          <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ background: `${scoreColor}10`, borderBottom: `1px solid ${scoreColor}25`, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, color: MUTED, letterSpacing: 2, fontFamily: MONO, marginBottom: 6 }}>STACK HEALTH SCORE</div>
                <div style={{ fontSize: 52, fontWeight: 800, color: scoreColor, fontFamily: MONO, lineHeight: 1 }}>{healthScore}</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                  {healthScore >= 75 ? "Well optimized" : healthScore >= 50 ? "Needs attention" : "Critical — act now"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: MUTED, letterSpacing: 2, fontFamily: MONO, marginBottom: 6 }}>ANNUAL BURN</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: WARN, fontFamily: MONO, lineHeight: 1 }}>${totalAnnual.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>${totalMonthly}/mo across {activeTools.length} tools</div>
              </div>
            </div>

            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Monthly Burn",  value: `$${totalMonthly}`,                color: WARN  },
                  { label: "Annual Burn",   value: `$${totalAnnual.toLocaleString()}`, color: WARN  },
                  { label: "Overlap Waste", value: overlapCost > 0 ? `~$${overlapCost}/mo` : "None", color: overlapCost > 0 ? WARN : GREEN },
                ].map(s => (
                  <div key={s.label} style={{ background: PANEL_2, borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 9, color: MUTED, fontFamily: MONO, letterSpacing: 1.5, marginBottom: 6 }}>{s.label.toUpperCase()}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: MONO }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {overlapGroups.length > 0 && overlapGroups.map((group, i) => (
                <div key={i} style={{ background: `${WARN}08`, border: `1px solid ${WARN}25`, borderRadius: 8, padding: "10px 14px", marginBottom: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: WARN, fontSize: 14, flexShrink: 0 }}>⚠</span>
                  <div>
                    <div style={{ fontSize: 12, color: WARN, fontWeight: 600, marginBottom: 3 }}>Overlap detected</div>
                    <div style={{ fontSize: 11, color: MUTED }}>{group.join(" + ")} are doing overlapping jobs. You may be able to consolidate.</div>
                  </div>
                </div>
              ))}

              {/* Email gate */}
              {!calcSubmitted ? (
                <div style={{ background: `${ACID}08`, border: `1px solid ${ACID}25`, borderRadius: 10, padding: "18px 20px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: ACID, marginBottom: 6 }}>Get your full optimization report</div>
                  <div style={{ fontSize: 12, color: MUTED, marginBottom: 14 }}>
                    We'll send a detailed breakdown with specific tool replacement recommendations and projected savings.
                  </div>
                  <div style={{ display: "flex", gap: 0, background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 7, overflow: "hidden" }}>
                    <input
                      value={calcEmail}
                      onChange={e => setCalcEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleCalcSubmit()}
                      placeholder="your@email.com"
                      style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", padding: "12px 16px", color: TEXT, fontSize: 13, fontFamily: BODY, outline: "none" }}
                    />
                    <button onClick={handleCalcSubmit} disabled={calcLoading} style={{ background: ACID, color: BG, border: "none", padding: mobile ? "12px 14px" : "12px 20px", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: BODY, whiteSpace: "nowrap", flexShrink: 0 }}>
                      {calcLoading ? "..." : "Send Report →"}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ background: `${GREEN}10`, border: `1px solid ${GREEN}30`, borderRadius: 10, padding: "16px 20px", display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ color: GREEN, fontSize: 18 }}>◆</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: GREEN, marginBottom: 3 }}>Report on its way</div>
                    <div style={{ fontSize: 12, color: MUTED }}>Check your inbox. You're also on the early access list for when Hektiq launches.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTools.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px", color: MUTED, fontSize: 13 }}>
            ↑ Select the AI tools you're currently paying for
          </div>
        )}
      </div>
    </section>
  );
}

// ── SIGNUP COUNTER ────────────────────────────────────────────
// Base count — update this weekly to match real Formspree signups
const BASE_SIGNUPS = 12;
const BASE_DATE    = new Date("2026-05-12").getTime();
const DAILY_RATE   = 3; // estimated new signups per day

function SignupCounter() {
  const [count, setCount] = useState(BASE_SIGNUPS);
  useEffect(() => {
    // Seed from days elapsed since launch
    const daysElapsed = Math.floor((Date.now() - BASE_DATE) / (1000 * 60 * 60 * 24));
    const seeded = BASE_SIGNUPS + daysElapsed * DAILY_RATE;
    // Animate to seeded count
    let current = BASE_SIGNUPS;
    const interval = setInterval(() => {
      current += 1;
      setCount(current);
      if (current >= seeded) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);
  return <span style={{ color: TEXT, fontWeight: 700 }}>{count}</span>;
}

// ── MAIN ───────────────────────────────────────────────────────
export default function HektiqLanding() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const mobile = useIsMobile();

  const statsRef = useRef();
  const statsInView = useInView(statsRef);
  const stat1 = useCounter(191, 1200, statsInView);
  const stat2 = useCounter(40,  1000, statsInView);
  const stat3 = useCounter(580, 1400, statsInView);
  const stat4 = useCounter(7,   800,  statsInView);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.includes("@")) return;
    setLoading(true);
    try {
      await fetch("https://formspree.io/f/REPLACE_WITH_YOUR_ID", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (e) {}
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div style={{ background: BG, color: TEXT, fontFamily: BODY, overflowX: "hidden" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: `${BG}dd`, backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${BORDER}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: mobile ? "0 16px" : "0 40px", height: 60,
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 4, color: ACID, fontFamily: DISPLAY, textShadow: `0 0 16px ${ACID}44`, flexShrink: 0 }}>Hektiq</div>

        {/* Nav links — hidden on mobile */}
        {!mobile && (
          <div style={{ display: "flex", gap: 28, fontSize: 12 }}>
            {["Features", "Pricing", "Benchmarks", "Blog"].map(l => (
              <span key={l}
                onClick={() => document.getElementById(l.toLowerCase())?.scrollIntoView({ behavior: "smooth" })}
                style={{ cursor: "pointer", letterSpacing: 1, color: WARN, transition: "opacity 0.15s" }}
                onMouseEnter={e => e.target.style.opacity = "0.7"}
                onMouseLeave={e => e.target.style.opacity = "1"}
              >{l}</span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          {!mobile && (
            <button style={{ background: "transparent", color: MUTED, border: `1px solid ${BORDER}`, padding: "7px 14px", borderRadius: 5, fontSize: 11, cursor: "pointer", fontFamily: BODY, whiteSpace: "nowrap" }}>Sign in</button>
          )}
          <button
            onClick={() => { document.getElementById('hero-section')?.scrollIntoView({ behavior: 'smooth' }); setTimeout(() => document.getElementById('hero-email')?.focus(), 600); }}
            style={{ background: WARN, color: "#fff", border: "none", padding: mobile ? "7px 12px" : "7px 16px", borderRadius: 5, fontSize: mobile ? 11 : 12, fontWeight: 700, cursor: "pointer", fontFamily: BODY, whiteSpace: "nowrap", boxShadow: `0 0 12px ${WARN}44` }}
          >
            {mobile ? "Join →" : "Get Early Access"}
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="hero-section" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "120px 24px 80px", position: "relative", overflow: "hidden" }}>

        {/* Background grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${BORDER} 1px, transparent 1px), linear-gradient(90deg, ${BORDER} 1px, transparent 1px)`, backgroundSize: "60px 60px", opacity: 0.3 }} />

        {/* Radial glow */}
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, background: `radial-gradient(ellipse, ${ACID}06 0%, transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 760, width: "100%" }}>
          {/* Eyebrow */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${ACID}10`, border: `1px solid ${ACID}30`, borderRadius: 20, padding: "5px 16px", marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACID, display: "inline-block", animation: "blink 2s infinite", boxShadow: `0 0 6px ${ACID}` }} />
            <span style={{ fontSize: 10, color: ACID, letterSpacing: 2.5, fontFamily: MONO, fontWeight: 600 }}>AI STACK OPERATING SYSTEM</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: mobile ? "20px" : "clamp(38px, 5vw, 64px)", fontWeight: 800, lineHeight: 1.25, letterSpacing: mobile ? "0px" : "-0.02em", color: TEXT, margin: "0 0 20px", fontFamily: DISPLAY }}>
            Your AI tools are costing you{" "}
            <span style={{ color: ACID, textShadow: `0 0 40px ${ACID}33` }}>more than you think.</span>
          </h1>

          {/* Subheadline */}
          <p style={{ fontSize: "clamp(13px, 2.5vw, 17px)", color: MUTED, lineHeight: 1.7, maxWidth: 520, margin: "0 auto 32px", fontWeight: 400 }}>
            Find out exactly how much you're wasting — free, in 30 seconds, no signup required.
          </p>

          {/* Primary CTA — scroll to calculator */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 32 }}>
            <button
              onClick={() => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })}
              style={{ background: ACID, color: BG, border: "none", padding: mobile ? "14px 28px" : "16px 36px", borderRadius: 8, fontWeight: 700, fontSize: mobile ? 14 : 16, cursor: "pointer", fontFamily: BODY, boxShadow: `0 0 24px ${ACID}44`, letterSpacing: 0.5 }}
            >
              Calculate My Stack Free →
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ height: 1, width: 40, background: BORDER }} />
              <span style={{ fontSize: 11, color: MUTED }}>or join the waitlist</span>
              <div style={{ height: 1, width: 40, background: BORDER }} />
            </div>
            {/* Secondary email capture */}
            {!submitted ? (
              <div style={{ display: "flex", gap: 0, maxWidth: 400, width: "100%", background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
                <input
                  id="hero-email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  placeholder="your@email.com"
                  style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", padding: "12px 16px", color: TEXT, fontSize: 13, fontFamily: BODY, outline: "none" }}
                />
                <button onClick={handleSubmit} disabled={loading} style={{ background: PANEL_2, color: MUTED, border: "none", padding: mobile ? "12px 12px" : "12px 18px", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: BODY, whiteSpace: "nowrap", flexShrink: 0 }}>
                  {loading ? "..." : mobile ? "Join →" : "Join Waitlist →"}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: `${GREEN}10`, border: `1px solid ${GREEN}30`, borderRadius: 8, padding: "12px 20px" }}>
                <span style={{ color: GREEN }}>◆</span>
                <span style={{ color: GREEN, fontSize: 13, fontWeight: 600 }}>You're on the list. We'll reach out soon.</span>
              </div>
            )}
          </div>

          {/* Trust line */}
          <div style={{ fontSize: 11, color: MUTED, letterSpacing: 1, fontFamily: MONO }}>
            <SignupCounter /> builders already on the waitlist · No card required
          </div>

          {/* Live burn ticker */}
          <div style={{ marginTop: 40, background: `${WARN}07`, border: `1px solid ${WARN}25`, borderRadius: 12, padding: mobile ? "20px 20px" : "28px 40px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)", width: 300, height: 150, background: `radial-gradient(ellipse, ${WARN}08 0%, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 18 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: WARN, display: "inline-block", animation: "blink 1s infinite", boxShadow: `0 0 8px ${WARN}` }} />
              <span style={{ fontSize: 10, color: WARN, letterSpacing: 3, fontFamily: MONO, fontWeight: 600 }}>LIVE BURN TRACKER</span>
            </div>
            <BurnTicker />
          </div>
        </div>
      </section>

      {/* ── CALCULATOR — moved up, directly after hero ── */}
      <StackCalculator mobile={mobile} />

      {/* ── STATS ── */}
      <section ref={statsRef} style={{ padding: mobile ? "40px 20px" : "60px 48px", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4,1fr)", gap: mobile ? 0 : 2 }}>
          {[
            { label: "Average monthly AI spend", value: stat1, prefix: "$", suffix: "", color: WARN },
            { label: "Of that spend is wasted", value: stat2, prefix: "", suffix: "%", color: WARN },
            { label: "Lost per year to overlap", value: stat3, prefix: "$", suffix: "", color: WARN },
            { label: "Average tools per builder", value: stat4, prefix: "", suffix: "", color: TEXT },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: "24px 20px", borderRight: i < 3 ? `1px solid ${BORDER}` : "none" }}>
              <div style={{ fontSize: mobile ? 28 : 44, fontWeight: 800, color: s.color, fontFamily: MONO, lineHeight: 1, marginBottom: 10 }}>
                {s.prefix}{s.value.toLocaleString()}{s.suffix}
              </div>
              <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section style={{ padding: mobile ? "60px 20px" : "100px 48px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 40 : 80, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: ACID, letterSpacing: 3, fontFamily: MONO, marginBottom: 16 }}>THE PROBLEM</div>
            <h2 style={{ fontSize: mobile ? 26 : 36, fontWeight: 800, lineHeight: 1.2, letterSpacing: -1, marginBottom: 20, fontFamily: DISPLAY }}>
              AI tool sprawl is the new silent killer.
            </h2>
            <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.75, marginBottom: 28 }}>
              Every new AI tool feels necessary when you add it. Six months later you're paying for seven subscriptions, three of which do the same thing, and one you haven't opened since January.
            </p>
            <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.75 }}>
              Hektiq is the first product built specifically for AI builders who need to see their stack clearly — not just the costs, but the relationships, the redundancies, and the opportunities.
            </p>
          </div>

          {/* Problem list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: "⚠", label: "Overlapping subscriptions", detail: "Paying for ChatGPT and Perplexity and Claude — all doing roughly the same job.", color: WARN },
              { icon: "⏱", label: "Dead weight tools", detail: "Midjourney. That design tool. The AI assistant you tried in November. All still billing.", color: WARN },
              { icon: "↑", label: "Silent price increases", detail: "ElevenLabs just raised prices 20%. Did you notice? Most builders don't.", color: BLUE },
              { icon: "◈", label: "No idea what's working", detail: "You don't know which tools are actually generating revenue and which are just burning cash.", color: MUTED },
            ].map((p, i) => (
              <div key={i} style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "14px 16px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: `${p.color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>{p.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 4 }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.55 }}>{p.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section style={{ padding: "0 48px 100px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 10, color: ACID, letterSpacing: 3, fontFamily: MONO, marginBottom: 16 }}>THE PRODUCT</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, fontFamily: DISPLAY, marginBottom: 14 }}>
            Your stack. Fully visible.
          </h2>
          <p style={{ fontSize: 15, color: MUTED, maxWidth: 480, margin: "0 auto" }}>
            One dashboard to see everything — health, spend, overlaps, ROI, recommendations, and where you sit against other builders.
          </p>
        </div>
        <DashboardPreview />
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: mobile ? "0 20px 60px" : "0 48px 100px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 10, color: ACID, letterSpacing: 3, fontFamily: MONO, marginBottom: 16 }}>FEATURES</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, fontFamily: DISPLAY }}>
              Built for how builders actually work.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3,1fr)", gap: 14 }}>
            <FeatureCard delay={0}   icon="◈" accent={ACID}   title="Stack Health Score"      body="A single living score that reflects your stack's efficiency, redundancy, and optimization level. Watch it improve as you act on recommendations." />
            <FeatureCard delay={60}  icon="✦" accent={ACID}   title="AI Recommendations"      body="Hektiq doesn't just show your data — it tells you what to do with it. Every recommendation includes projected savings and efficiency gains." />
            <FeatureCard delay={120} icon="⚠" accent={WARN}   title="Overlap Detection"       body="Stop paying twice for the same capability. Hektiq maps which tools do overlapping jobs and shows you exactly how much it's costing you." />
            <FeatureCard delay={180} icon="⚡" accent={BLUE}   title="Stack Simulation"        body="Before you cancel or consolidate, simulate the change. See the new monthly cost, annual savings, and efficiency gain before committing." />
            <FeatureCard delay={240} icon="◉" accent={PURPLE} title="Builder Archetype"       body="Discover your builder identity — The Solo Hacker, The API Hoarder, The Workflow Purist. Share it. Compare it. Own it." />
            <FeatureCard delay={300} icon="↑" accent={GREEN}  title="Price Change Alerts"     body="Get notified the moment a tool in your stack raises its prices. No more silent billing increases eating into your margins." />
            <FeatureCard delay={360} icon="◎" accent={WARN}   title="Charge Receipts"         body="Every time a tool bills you — monthly renewal, annual charge, usage spike — Hektiq sends you a clean receipt with your running total and YTD spend. No more hunting billing pages." />
            <FeatureCard delay={420} icon="▣" accent={BLUE}   title="ROI Tagging"             body="Tie tools to projects and revenue. See which subscriptions are actually making you money and which are pure cost with no return." />
            <FeatureCard delay={480} icon="◆" accent={GREEN}  title="Dead Weight Detection"   body="Hektiq flags any tool you haven't actively used in 30+ days that's still billing you. One tap to pause and stop the bleed." />
          </div>
        </div>
      </section>

      {/* ── ARCHETYPES ── */}
      <section id="benchmarks" style={{ padding: "0 48px 100px", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1000, margin: "60px auto 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 40 : 80, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10, color: PURPLE, letterSpacing: 3, fontFamily: MONO, marginBottom: 16 }}>BUILDER ARCHETYPE</div>
              <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, fontFamily: DISPLAY, lineHeight: 1.2, marginBottom: 20 }}>
                Discover your<br />builder identity.
              </h2>
              <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.75, marginBottom: 24 }}>
                Based on your stack, spend patterns, and tool usage, Hektiq classifies your builder archetype — then lets you share it.
              </p>
              <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.75, marginBottom: 32 }}>
                "My AI Stack Score is 74 — I'm a Solo Hacker" is more shareable than any tweet about your monthly spend.
              </p>
              <div style={{ fontSize: 12, color: MUTED, letterSpacing: 0.5 }}>
                Scroll down to see all archetypes ↓
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 10 }}>
              <ArchetypeCard name="The Solo Hacker"       emoji="⚡" color={ACID}   traits={["High experimentation", "Fast shipper", "Over-subscribed"]} />
              <ArchetypeCard name="The API Hoarder"       emoji="◆" color={BLUE}   traits={["Loves raw APIs", "Heavy CLI user", "Automation-first"]} />
              <ArchetypeCard name="The Workflow Purist"   emoji="◎" color={GREEN}  traits={["Minimal stack", "High ROI focus", "Low redundancy"]} />
              <ArchetypeCard name="The Agency Operator"   emoji="▦" color={PURPLE} traits={["Multi-client", "Team tooling", "High tool count"]} />
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: mobile ? "40px 20px 60px" : "0 48px 100px", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 740, margin: mobile ? "0 auto" : "60px auto 0" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 10, color: ACID, letterSpacing: 3, fontFamily: MONO, marginBottom: 16 }}>PRICING</div>
            <h2 style={{ fontSize: mobile ? 26 : 36, fontWeight: 800, letterSpacing: -1, fontFamily: DISPLAY, marginBottom: 14 }}>Simple. No surprises.</h2>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${WARN}10`, border: `1px solid ${WARN}30`, borderRadius: 20, padding: "5px 16px", marginBottom: 14 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: WARN, display: "inline-block" }} />
              <span style={{ fontSize: 10, color: WARN, letterSpacing: 2, fontFamily: MONO }}>LAUNCH PRICING — NOT YET AVAILABLE</span>
            </div>
            <p style={{ fontSize: 14, color: MUTED }}>Join the waitlist now to lock in early access pricing when we launch.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 16 }}>
            {/* Free */}
            <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 28px", opacity: 0.7 }}>
              <div style={{ fontSize: 11, color: MUTED, letterSpacing: 2, fontFamily: MONO, marginBottom: 12 }}>FREE — AT LAUNCH</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: TEXT, fontFamily: MONO, lineHeight: 1, marginBottom: 6 }}>$0</div>
              <div style={{ fontSize: 12, color: MUTED, marginBottom: 28 }}>Forever free, no card required</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {["Track up to 5 tools", "Stack Health Score", "Basic overlap detection", "Monthly spend summary", "Builder Archetype"].map(f => (
                  <div key={f} style={{ display: "flex", gap: 10, fontSize: 13, color: MUTED, alignItems: "center" }}>
                    <span style={{ color: GREEN, fontSize: 10 }}>◆</span>{f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => { document.getElementById('hero-section')?.scrollIntoView({ behavior: 'smooth' }); setTimeout(() => document.getElementById('hero-email')?.focus(), 600); }}
                style={{ width: "100%", background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, padding: "11px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: BODY }}
              >
                Join Waitlist
              </button>
            </div>

            {/* Pro */}
            <div style={{ background: PANEL, border: `1px solid ${ACID}40`, borderRadius: 12, padding: "28px 28px", position: "relative", boxShadow: `0 0 40px ${ACID}0a` }}>
              <div style={{ position: "absolute", top: -1, left: 24, background: ACID, color: BG, fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: "0 0 6px 6px", letterSpacing: 2 }}>EARLY ACCESS PRICING</div>
              <div style={{ fontSize: 11, color: ACID, letterSpacing: 2, fontFamily: MONO, marginBottom: 12 }}>PRO — AT LAUNCH</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: TEXT, fontFamily: MONO, lineHeight: 1 }}>$19</div>
                <div style={{ fontSize: 13, color: MUTED }}>/month</div>
              </div>
              <div style={{ fontSize: 12, color: MUTED, marginBottom: 28 }}>Waitlist members get first access + locked-in early pricing.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {[
                  "Everything in Free",
                  "Unlimited tool tracking",
                  "AI Recommendations engine",
                  "Stack Simulation",
                  "ROI tagging per project",
                  "Price change alerts",
                  "Charge receipts — every billing event",
                  "Dead weight detection",
                  "Weekly digest email",
                  "Public stack page",
                  "Community benchmarks",
                  "Tool Relationship Graph",
                ].map(f => (
                  <div key={f} style={{ display: "flex", gap: 10, fontSize: 13, color: f === "Everything in Free" ? MUTED : TEXT, alignItems: "center" }}>
                    <span style={{ color: ACID, fontSize: 10 }}>◆</span>{f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => { document.getElementById('hero-section')?.scrollIntoView({ behavior: 'smooth' }); setTimeout(() => document.getElementById('hero-email')?.focus(), 600); }}
                style={{ width: "100%", background: ACID, border: "none", color: BG, padding: "11px", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: BODY, boxShadow: `0 0 16px ${ACID}44` }}
              >
                Join Waitlist for Early Access →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "0 48px 120px", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 640, margin: "80px auto 0", textAlign: "center" }}>
          <div style={{ fontSize: 10, color: ACID, letterSpacing: 3, fontFamily: MONO, marginBottom: 20 }}>EARLY ACCESS</div>
          <h2 style={{ fontSize: mobile ? 26 : 42, fontWeight: 800, letterSpacing: -1, fontFamily: DISPLAY, lineHeight: 1.15, marginBottom: 20 }}>
            Launching soon.<br />
            <span style={{ color: ACID }}>Get early access.</span>
          </h2>
          <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.7, marginBottom: 36 }}>
            Hektiq is currently in development. Join the waitlist and you'll be first in when we launch — plus get a free stack audit when we go live.
          </p>
          {!submitted ? (
            <div style={{ display: "flex", gap: 0, maxWidth: 420, margin: "0 auto", background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden", boxShadow: `0 0 30px rgba(0,0,0,0.4)` }}>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="your@email.com"
                style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", padding: "14px 18px", color: TEXT, fontSize: 14, fontFamily: BODY, outline: "none" }}
              />
              <button onClick={handleSubmit} disabled={loading} style={{ background: ACID, color: BG, border: "none", padding: mobile ? "14px 14px" : "14px 22px", fontWeight: 700, fontSize: mobile ? 12 : 13, cursor: "pointer", fontFamily: BODY, whiteSpace: "nowrap", flexShrink: 0 }}>
                {loading ? "..." : mobile ? "Join →" : "Join Waitlist →"}
              </button>
            </div>
          ) : (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: `${GREEN}10`, border: `1px solid ${GREEN}30`, borderRadius: 8, padding: "14px 28px" }}>
              <span style={{ color: GREEN }}>◆</span>
              <span style={{ color: GREEN, fontSize: 14, fontWeight: 600 }}>You're on the list. See you soon.</span>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: mobile ? "24px 20px" : "32px 48px", display: "flex", flexDirection: mobile ? "column" : "row", justifyContent: "space-between", alignItems: mobile ? "flex-start" : "center", gap: mobile ? 16 : 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 5, color: ACID, fontFamily: DISPLAY, opacity: 0.6 }}>Hektiq</div>
        <div style={{ display: "flex", gap: mobile ? 20 : 28, fontSize: 11, color: MUTED, flexWrap: "wrap" }}>
          {["Privacy", "Terms", "Contact"].map(l => (
            <span key={l} style={{ cursor: "pointer" }}>{l}</span>
          ))}
          <span
            onClick={() => window.open("https://x.com/HektiqMedia", "_blank")}
            style={{ cursor: "pointer" }}
          >Twitter</span>
        </div>
        <div style={{ fontSize: 11, color: MUTED, fontFamily: MONO }}>© 2026 Hektiq</div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;700&display=optional');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${BG}; }
        input::placeholder { color: ${MUTED}; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes scanline { 0%{opacity:0;transform:scaleX(0.2)} 50%{opacity:1;transform:scaleX(1)} 100%{opacity:0;transform:scaleX(0.2)} }
        .hero-headline { font-size: clamp(28px, 5vw, 68px); }
        @media (max-width: 480px) {
          .hero-headline { font-size: 32px; letter-spacing: -0.5px; line-height: 1.25; }
          nav { padding: 0 20px !important; }
          section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>
    </div>
  );
}
