import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, LineChart, Line,
} from "recharts";

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

const MONO = "'IBM Plex Mono', monospace";
const SANS = "'Space Grotesk', sans-serif";

// ── DATA ──────────────────────────────────────────────────────
const tools = [
  { id:"claude",     name:"Claude API",     cat:"AI Core",  cost:84,  trend:"up",     icon:"◆", overlap:false, daysAgo:2,  active:true,  roi:420, project:"TrendPulseAI" },
  { id:"chatgpt",    name:"ChatGPT Plus",   cat:"AI Core",  cost:20,  trend:"stable", icon:"◉", overlap:true,  daysAgo:14, active:true,  roi:0,   project:"—"           },
  { id:"cursor",     name:"Cursor Pro",     cat:"Dev",      cost:20,  trend:"up",     icon:"▸", overlap:false, daysAgo:1,  active:true,  roi:310, project:"All Projects" },
  { id:"perplexity", name:"Perplexity Pro", cat:"Research", cost:20,  trend:"down",   icon:"◈", overlap:true,  daysAgo:11, active:true,  roi:0,   project:"—"           },
  { id:"midjourney", name:"Midjourney",     cat:"Creative", cost:10,  trend:"stable", icon:"◐", overlap:false, daysAgo:42, active:false, roi:0,   project:"—"           },
  { id:"runway",     name:"Runway ML",      cat:"Creative", cost:15,  trend:"up",     icon:"◑", overlap:false, daysAgo:3,  active:true,  roi:85,  project:"Hektiq Assets"  },
  { id:"elevenlabs", name:"ElevenLabs",     cat:"Audio",    cost:22,  trend:"stable", icon:"◒", overlap:false, daysAgo:7,  active:true,  roi:120, project:"TrendPulseAI" },
];

// Graph node positions
const nodes = {
  claude:     { x:100, y:110, label:"Claude API",     cost:84,  overlap:false },
  chatgpt:    { x:220, y:52,  label:"ChatGPT Plus",   cost:20,  overlap:true  },
  cursor:     { x:370, y:72,  label:"Cursor Pro",     cost:20,  overlap:false },
  perplexity: { x:240, y:172, label:"Perplexity",     cost:20,  overlap:true  },
  midjourney: { x:95,  y:205, label:"Midjourney",     cost:10,  overlap:false, dead:true },
  runway:     { x:310, y:215, label:"Runway ML",      cost:15,  overlap:false },
  elevenlabs: { x:450, y:155, label:"ElevenLabs",     cost:22,  overlap:false },
};

const edges = [
  { from:"claude",     to:"cursor",      type:"workflow" },
  { from:"claude",     to:"chatgpt",     type:"overlap"  },
  { from:"chatgpt",    to:"perplexity",  type:"overlap"  },
  { from:"runway",     to:"midjourney",  type:"workflow" },
  { from:"cursor",     to:"elevenlabs",  type:"workflow" },
  { from:"claude",     to:"elevenlabs",  type:"workflow" },
];

const simScenarios = [
  {
    id:"consolidate",
    label:"Consolidate AI Core",
    description:"Replace ChatGPT Plus + Perplexity Pro with OpenRouter routing via Claude API",
    remove:["chatgpt","perplexity"],
    add:[{ name:"OpenRouter", cost:8 }],
    efficiencyGain: 18,
  },
  {
    id:"pause_dead",
    label:"Pause Dead Weight",
    description:"Pause Midjourney until next active creative project",
    remove:["midjourney"],
    add:[],
    efficiencyGain: 4,
  },
  {
    id:"full_optimize",
    label:"Full Optimization",
    description:"Apply all HEKTIQ recommendations — consolidate overlaps + pause inactive tools",
    remove:["chatgpt","perplexity","midjourney"],
    add:[{ name:"OpenRouter", cost:8 }],
    efficiencyGain: 24,
  },
];

const priceAlerts = [
  { tool:"ElevenLabs",     change:"+20%", detail:"Starter tier raised from $11 to $22/mo last month.", impact:11  },
  { tool:"Perplexity Pro", change:"+$5",  detail:"Pro plan increased $5/mo at last renewal.",           impact:5   },
];

const spendData = [
  { month:"Nov", spend:142, forecast:null },
  { month:"Dec", spend:158, forecast:null },
  { month:"Jan", spend:171, forecast:null },
  { month:"Feb", spend:163, forecast:null },
  { month:"Mar", spend:189, forecast:null },
  { month:"Apr", spend:191, forecast:null },
  { month:"May", spend:191, forecast:191 },
  { month:"Jun", spend:null, forecast:198 },
  { month:"Jul", spend:null, forecast:207 },
  { month:"Aug", spend:null, forecast:219 },
];

const scoreHistory = [
  { month:"Dec", score:54 },
  { month:"Jan", score:58 },
  { month:"Feb", score:61 },
  { month:"Mar", score:64 },
  { month:"Apr", score:68 },
  { month:"May", score:74 },
];

const benchmarks = [
  { label:"Top indie hackers use Claude",     pct:91 },
  { label:"Top indie hackers use Cursor",     pct:84 },
  { label:"Top indie hackers use Vercel",     pct:78 },
  { label:"Top indie hackers use OpenRouter", pct:63 },
];

const healthIssues = [
  { label:"Tool redundancy detected",     severity:"high"   },
  { label:"API cost volatility rising",   severity:"medium" },
  { label:"Workflow fragmentation high",  severity:"medium" },
  { label:"3 underused subscriptions",    severity:"low"    },
];

const recommendations = [
  { id:1, label:"CONSOLIDATE AI CORE",   detail:"Replace ChatGPT Plus + Perplexity with Claude Max + OpenRouter routing.", savings:41, efficiency:"+18%", confidence:94 },
  { id:2, label:"PAUSE DEAD WEIGHT",     detail:"Midjourney last used 42 days ago. Pause until next creative project.",    savings:10, efficiency:"+4%",  confidence:88 },
];

const navItems = [
  { label:"DASHBOARD",  icon:"◈" },
  { label:"STACK",      icon:"▦" },
  { label:"INSIGHTS",   icon:"◎" },
  { label:"BENCHMARKS", icon:"◉" },
  { label:"SETTINGS",   icon:"◌" },
];

// ── ANIMATED COUNTER ──────────────────────────────────────────
function Counter({ target, prefix="", suffix="", duration=1000 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <>{prefix}{val.toLocaleString()}{suffix}</>;
}

// ── TOOL RELATIONSHIP GRAPH ────────────────────────────────────
function RelationshipGraph({ userTools, dynamicNodes }) {
  const [hovered, setHovered] = useState(null);
  const W = 560, H = 260;
  const activeNodes = dynamicNodes || nodes;

  // Auto-generate edges based on tool categories
  const autoEdges = [];
  const toolList = userTools || [];
  toolList.forEach((t, i) => {
    toolList.slice(i+1).forEach(t2 => {
      if (t.cat === t2.cat) autoEdges.push({ from:t.id, to:t2.id, type: t.overlap||t2.overlap ? "overlap" : "workflow" });
    });
  });
  const activeEdges = autoEdges.length > 0 ? autoEdges : edges;

  const isEdgeActive = (e) => {
    if (!hovered) return true;
    return e.from === hovered || e.to === hovered;
  };
  const isNodeDimmed = (id) => {
    if (!hovered) return false;
    if (id === hovered) return false;
    return !activeEdges.some(e => (e.from === id || e.to === id) && (e.from === hovered || e.to === hovered));
  };

  return (
    <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:MONO, marginBottom:4 }}>TOOL RELATIONSHIP GRAPH</div>
          <div style={{ fontSize:11, color:"#3a4448" }}>Hover a node to highlight its connections</div>
        </div>
        <div style={{ display:"flex", gap:16, fontSize:9, fontFamily:MONO }}>
          <span style={{ color:ACID }}>── workflow</span>
          <span style={{ color:WARN }}>╌ overlap</span>
          <span style={{ color:"#3a4448" }}>◉ dead weight</span>
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }}>
        <defs>
          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="overlapGlow">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={ACID} opacity="0.4"/>
          </marker>
        </defs>

        {/* Edges */}
        {activeEdges.map((e, i) => {
          const a = activeNodes[e.from], b = activeNodes[e.to];
          if (!a || !b) return null;
          const active = isEdgeActive(e);
          const isOverlap = e.type === "overlap";
          return (
            <line key={i}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={isOverlap ? WARN : ACID}
              strokeWidth={active ? (isOverlap ? 1.5 : 1) : 0.3}
              strokeDasharray={isOverlap ? "5 4" : "none"}
              opacity={active ? (isOverlap ? 0.7 : 0.3) : 0.06}
              style={{ transition:"all 0.2s" }}
            />
          );
        })}

        {/* Nodes */}
        {Object.entries(activeNodes).map(([id, n]) => {
          const isHov = hovered === id;
          const dimmed = isNodeDimmed(id);
          const nodeColor = n.overlap ? WARN : n.dead ? MUTED : ACID;
          return (
            <g key={id}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor:"pointer", transition:"opacity 0.2s", opacity: dimmed ? 0.2 : 1 }}
            >
              {/* Glow ring for overlap */}
              {n.overlap && (
                <circle cx={n.x} cy={n.y} r={22}
                  fill="none" stroke={WARN}
                  strokeWidth={isHov ? 1.5 : 0.8}
                  opacity={isHov ? 0.6 : 0.3}
                  strokeDasharray="3 3"
                  filter="url(#overlapGlow)"
                />
              )}
              {/* Outer ring */}
              <circle cx={n.x} cy={n.y} r={isHov ? 20 : 16}
                fill={`${nodeColor}12`}
                stroke={nodeColor}
                strokeWidth={isHov ? 1.5 : 0.8}
                opacity={n.dead ? 0.4 : 1}
                filter={isHov ? "url(#nodeGlow)" : "none"}
                style={{ transition:"all 0.2s" }}
              />
              {/* Inner dot */}
              <circle cx={n.x} cy={n.y} r={5}
                fill={n.dead ? "#2d3539" : nodeColor}
                opacity={n.dead ? 0.5 : 1}
                style={{ transition:"all 0.2s" }}
              />
              {/* Label */}
              <text x={n.x} y={n.y + 30}
                textAnchor="middle"
                fill={dimmed ? "#1d2326" : n.overlap ? WARN : n.dead ? "#3a4448" : MUTED}
                fontSize={9}
                fontFamily={MONO}
                style={{ transition:"fill 0.2s" }}
              >{n.label}</text>
              {/* Cost */}
              <text x={n.x} y={n.y + 41}
                textAnchor="middle"
                fill={dimmed ? "#1d2326" : "#272e32"}
                fontSize={8}
                fontFamily={MONO}
              >${n.cost}/mo</text>

              {/* Overlap badge */}
              {n.overlap && !dimmed && (
                <text x={n.x} y={n.y - 24}
                  textAnchor="middle"
                  fill={WARN} fontSize={7} fontFamily={MONO}
                  opacity={0.8}
                >OVERLAP</text>
              )}
              {/* Dead badge */}
              {n.dead && !dimmed && (
                <text x={n.x} y={n.y - 24}
                  textAnchor="middle"
                  fill={MUTED} fontSize={7} fontFamily={MONO}
                  opacity={0.6}
                >INACTIVE</text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend stat */}
      <div style={{ display:"flex", gap:20, marginTop:8, paddingTop:12, borderTop:`1px solid ${BORDER}` }}>
        {[
          { label:"Workflow connections", value:"5", color:ACID  },
          { label:"Overlap conflicts",    value:"2", color:WARN  },
          { label:"Inactive nodes",       value:"1", color:MUTED },
          { label:"Redundancy cost",      value:"$40/mo", color:WARN },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize:9, color:MUTED, fontFamily:MONO, marginBottom:3 }}>{s.label}</div>
            <div style={{ fontSize:13, fontWeight:700, color:s.color, fontFamily:MONO }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STACK SIMULATION ──────────────────────────────────────────
function StackSimulation({ totalSpend }) {
  const [active, setActive] = useState(null);
  const scenario = simScenarios.find(s => s.id === active) || null;

  const removedCost = scenario
    ? tools.filter(t => scenario.remove.includes(t.id)).reduce((s, t) => s + t.cost, 0)
    : 0;
  const addedCost = scenario ? scenario.add.reduce((s, a) => s + a.cost, 0) : 0;
  const newMonthly = totalSpend - removedCost + addedCost;
  const savings = totalSpend - newMonthly;
  const annualSavings = savings * 12;

  return (
    <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:MONO, marginBottom:4 }}>STACK SIMULATION</div>
          <div style={{ fontSize:11, color:"#3a4448" }}>Test optimizations before committing</div>
        </div>
        {scenario && (
          <button onClick={() => setActive(null)} style={{
            background:"transparent", border:`1px solid ${BORDER}`, color:MUTED,
            padding:"5px 12px", borderRadius:4, fontSize:9, fontFamily:MONO,
            cursor:"pointer", letterSpacing:1,
          }}>RESET</button>
        )}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
        {simScenarios.map(s => {
          const isActive = active === s.id;
          const sc = tools.filter(t => s.remove.includes(t.id)).reduce((sum,t) => sum + t.cost, 0)
                   - s.add.reduce((sum,a) => sum + a.cost, 0);
          return (
            <div key={s.id} onClick={() => setActive(isActive ? null : s.id)} style={{
              background: isActive ? `${ACID}0c` : PANEL_2,
              border: `1px solid ${isActive ? ACID + "44" : BORDER}`,
              borderRadius:8, padding:"14px 14px", cursor:"pointer",
              transition:"all 0.2s",
              boxShadow: isActive ? `0 0 16px ${ACID}14` : "none",
            }}>
              <div style={{ fontSize:10, fontWeight:700, color: isActive ? ACID : TEXT, marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:10, color:MUTED, lineHeight:1.5, marginBottom:10 }}>{s.description}</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:11, color:GREEN, fontFamily:MONO, fontWeight:700 }}>save ${sc}/mo</div>
                <div style={{ fontSize:9, color:BLUE, fontFamily:MONO }}>+{s.efficiencyGain}% eff</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Result panel */}
      <div style={{
        background: PANEL_2, border: `1px solid ${scenario ? ACID + "30" : BORDER}`,
        borderRadius:8, padding:"16px 20px",
        transition:"border-color 0.3s",
      }}>
        {!scenario ? (
          <div style={{ textAlign:"center", color:"#2a3035", fontSize:11, padding:"8px 0", fontFamily:MONO }}>
            ↑ select a scenario above to simulate
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20 }}>
            <div>
              <div style={{ fontSize:9, color:MUTED, fontFamily:MONO, marginBottom:6, letterSpacing:1.5 }}>REMOVING</div>
              {scenario.remove.map(id => {
                const t = tools.find(t => t.id === id);
                return (
                  <div key={id} style={{ fontSize:11, color:WARN, fontFamily:MONO, marginBottom:3, display:"flex", justifyContent:"space-between" }}>
                    <span>{t.name}</span><span>-${t.cost}</span>
                  </div>
                );
              })}
            </div>
            <div>
              <div style={{ fontSize:9, color:MUTED, fontFamily:MONO, marginBottom:6, letterSpacing:1.5 }}>ADDING</div>
              {scenario.add.length ? scenario.add.map((a,i) => (
                <div key={i} style={{ fontSize:11, color:GREEN, fontFamily:MONO, marginBottom:3, display:"flex", justifyContent:"space-between" }}>
                  <span>{a.name}</span><span>+${a.cost}</span>
                </div>
              )) : <div style={{ fontSize:11, color:"#2a3035", fontFamily:MONO }}>nothing</div>}
            </div>
            <div>
              <div style={{ fontSize:9, color:MUTED, fontFamily:MONO, marginBottom:6, letterSpacing:1.5 }}>NEW MONTHLY</div>
              <div style={{ fontSize:22, fontWeight:800, color:TEXT, fontFamily:MONO }}>${newMonthly}</div>
              <div style={{ fontSize:10, color:GREEN, fontFamily:MONO }}>was ${totalSpend}</div>
            </div>
            <div>
              <div style={{ fontSize:9, color:MUTED, fontFamily:MONO, marginBottom:6, letterSpacing:1.5 }}>ANNUAL SAVINGS</div>
              <div style={{ fontSize:22, fontWeight:800, color:ACID, fontFamily:MONO }}>${annualSavings}</div>
              <div style={{ fontSize:10, color:MUTED, fontFamily:MONO }}>+{scenario.efficiencyGain}% efficiency</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ADD TOOL MODAL ────────────────────────────────────────────
const TOOL_OPTIONS = [
  { name: "Claude API",      cat: "AI Core",      icon: "◆", plans: [{ label:"Pro $20",cost:20},{ label:"Max $100",cost:100},{ label:"Team $30",cost:30}] },
  { name: "ChatGPT",         cat: "AI Core",      icon: "◉", plans: [{ label:"Plus $20",cost:20},{ label:"Team $30",cost:30},{ label:"Enterprise $60",cost:60}] },
  { name: "Cursor",          cat: "Dev",          icon: "▸", plans: [{ label:"Pro $20",cost:20},{ label:"Business $40",cost:40}] },
  { name: "Perplexity",      cat: "Research",     icon: "◈", plans: [{ label:"Pro $20",cost:20}] },
  { name: "GitHub Copilot",  cat: "Dev",          icon: "◓", plans: [{ label:"Individual $10",cost:10},{ label:"Business $19",cost:19}] },
  { name: "Midjourney",      cat: "Creative",     icon: "◐", plans: [{ label:"Basic $10",cost:10},{ label:"Standard $30",cost:30},{ label:"Pro $60",cost:60}] },
  { name: "Runway ML",       cat: "Creative",     icon: "◑", plans: [{ label:"Standard $15",cost:15},{ label:"Pro $35",cost:35}] },
  { name: "ElevenLabs",      cat: "Audio",        icon: "◒", plans: [{ label:"Creator $22",cost:22},{ label:"Pro $99",cost:99}] },
  { name: "Lovable",         cat: "Dev",          icon: "◈", plans: [{ label:"Starter $25",cost:25},{ label:"Launch $50",cost:50}] },
  { name: "Bolt",            cat: "Dev",          icon: "◉", plans: [{ label:"Pro $20",cost:20}] },
  { name: "Vercel",          cat: "Infra",        icon: "▲", plans: [{ label:"Pro $20",cost:20}] },
  { name: "Supabase",        cat: "Infra",        icon: "◫", plans: [{ label:"Pro $25",cost:25}] },
  { name: "Cloudflare",      cat: "Infra",        icon: "☁", plans: [{ label:"Pro $20",cost:20},{ label:"Business $200",cost:200}] },
  { name: "GitHub",          cat: "Dev",          icon: "◎", plans: [{ label:"Team $4",cost:4}] },
  { name: "Notion AI",       cat: "Productivity", icon: "▣", plans: [{ label:"Plus $10",cost:10},{ label:"Business $15",cost:15}] },
  { name: "Linear",          cat: "Productivity", icon: "◈", plans: [{ label:"Business $8",cost:8}] },
  { name: "Figma",           cat: "Design",       icon: "◐", plans: [{ label:"Professional $15",cost:15},{ label:"Org $45",cost:45}] },
  { name: "OpenAI API",      cat: "AI Core",      icon: "◉", plans: [{ label:"~$20/mo",cost:20},{ label:"~$50/mo",cost:50},{ label:"~$100/mo",cost:100}] },
  { name: "Anthropic API",   cat: "AI Core",      icon: "◆", plans: [{ label:"~$20/mo",cost:20},{ label:"~$50/mo",cost:50},{ label:"~$100/mo",cost:100}] },
  { name: "Hetzner",         cat: "Infra",        icon: "◈", plans: [{ label:"~$4/mo",cost:4},{ label:"~$18/mo",cost:18},{ label:"~$50/mo",cost:50}] },
  { name: "AWS",             cat: "Infra",        icon: "◆", plans: [{ label:"~$10/mo",cost:10},{ label:"~$50/mo",cost:50},{ label:"~$100/mo",cost:100}] },
  { name: "Custom",          cat: "Other",        icon: "＋", plans: [] },
];

const CATEGORIES = ["All", "AI Core", "Dev", "Creative", "Infra", "Design", "Productivity", "Audio", "Research", "Other"];

function AddToolModal({ onClose, onAdd }) {
  const [step, setStep]             = useState(1);
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("All");
  const [picked, setPicked]         = useState(null);
  const [plan, setPlan]             = useState("");
  const [customName, setCustomName] = useState("");
  const [customCost, setCustomCost] = useState("");
  const [project, setProject]       = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");

  const filtered = TOOL_OPTIONS.filter(t => {
    const matchCat    = catFilter === "All" || t.cat === catFilter;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const selectedPlan = picked?.plans.find(p => p.label === plan);
  const cost = picked?.name === "Custom" ? Number(customCost) || 0 : selectedPlan?.cost || 0;

  const handleAdd = () => {
    const toolName = picked?.name === "Custom" ? customName : picked?.name;
    if (!toolName) return;
    onAdd({
      id: Date.now().toString(),
      name: toolName,
      cat: picked?.cat || "Other",
      icon: picked?.icon || "◆",
      cost,
      plan: picked?.name === "Custom" ? "Custom" : plan,
      project: project || "—",
      billingCycle,
      trend: "stable",
      overlap: false,
      daysAgo: 0,
      active: true,
      roi: 0,
    });
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:12, width:"100%", maxWidth:540, maxHeight:"85vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:`0 0 60px rgba(0,0,0,0.6)` }}>

        {/* Header */}
        <div style={{ padding:"18px 22px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:TEXT }}>{step === 1 ? "Add a Tool" : `Configure ${picked?.name === "Custom" ? "Custom Tool" : picked?.name}`}</div>
            <div style={{ fontSize:10, color:MUTED, fontFamily:MONO, marginTop:2 }}>STEP {step} OF 2</div>
          </div>
          <div onClick={onClose} style={{ cursor:"pointer", color:MUTED, fontSize:18, lineHeight:1, padding:4 }}>✕</div>
        </div>

        {step === 1 && (
          <>
            <div style={{ padding:"14px 22px 10px", flexShrink:0 }}>
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tools..." style={{ width:"100%", background:PANEL_2, border:`1px solid ${BORDER}`, borderRadius:7, padding:"10px 14px", color:TEXT, fontSize:13, fontFamily:SANS, outline:"none" }} />
            </div>
            <div style={{ padding:"0 22px 12px", display:"flex", gap:6, flexWrap:"wrap", flexShrink:0 }}>
              {CATEGORIES.map(c => (
                <div key={c} onClick={() => setCatFilter(c)} style={{ padding:"4px 10px", borderRadius:20, fontSize:10, cursor:"pointer", background: catFilter===c ? `${ACID}15` : PANEL_2, border:`1px solid ${catFilter===c ? ACID+"44" : BORDER}`, color: catFilter===c ? ACID : MUTED, fontFamily:MONO }}>
                  {c}
                </div>
              ))}
            </div>
            <div style={{ overflowY:"auto", flex:1, padding:"0 22px 16px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {filtered.map(tool => (
                  <div key={tool.name} onClick={() => { setPicked(tool); setPlan(tool.plans[0]?.label || ""); setStep(2); }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = ACID+"44"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
                    style={{ background:PANEL_2, border:`1px solid ${BORDER}`, borderRadius:8, padding:"12px 14px", cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ color:ACID, fontSize:14, flexShrink:0 }}>{tool.icon}</span>
                    <div>
                      <div style={{ fontSize:12, color:TEXT, fontWeight:500 }}>{tool.name}</div>
                      <div style={{ fontSize:9, color:MUTED, fontFamily:MONO, letterSpacing:1 }}>{tool.cat.toUpperCase()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 2 && picked && (
          <div style={{ overflowY:"auto", flex:1, padding:"20px 22px" }}>
            {picked.name === "Custom" && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:10, color:MUTED, fontFamily:MONO, letterSpacing:1.5, marginBottom:8 }}>TOOL NAME</div>
                <input autoFocus value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. My Custom Tool" style={{ width:"100%", background:PANEL_2, border:`1px solid ${BORDER}`, borderRadius:7, padding:"10px 14px", color:TEXT, fontSize:13, fontFamily:SANS, outline:"none" }} />
              </div>
            )}
            {picked.plans.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:10, color:MUTED, fontFamily:MONO, letterSpacing:1.5, marginBottom:8 }}>PLAN</div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {picked.plans.map(p => (
                    <div key={p.label} onClick={() => setPlan(p.label)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", borderRadius:7, cursor:"pointer", background: plan===p.label ? `${ACID}10` : PANEL_2, border:`1px solid ${plan===p.label ? ACID+"44" : BORDER}`, transition:"all 0.15s" }}>
                      <span style={{ fontSize:12, color: plan===p.label ? ACID : TEXT }}>{p.label}</span>
                      <span style={{ fontSize:12, color:MUTED, fontFamily:MONO }}>${p.cost}/mo</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {picked.name === "Custom" && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:10, color:MUTED, fontFamily:MONO, letterSpacing:1.5, marginBottom:8 }}>MONTHLY COST</div>
                <div style={{ display:"flex", alignItems:"center", background:PANEL_2, border:`1px solid ${BORDER}`, borderRadius:7, padding:"10px 14px" }}>
                  <span style={{ color:MUTED, marginRight:6 }}>$</span>
                  <input type="number" value={customCost} onChange={e => setCustomCost(e.target.value)} placeholder="0" style={{ background:"transparent", border:"none", color:TEXT, fontSize:13, fontFamily:MONO, outline:"none", width:"100%" }} />
                  <span style={{ color:MUTED, fontSize:11 }}>/mo</span>
                </div>
              </div>
            )}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:10, color:MUTED, fontFamily:MONO, letterSpacing:1.5, marginBottom:8 }}>BILLING CYCLE</div>
              <div style={{ display:"flex", gap:8 }}>
                {["monthly","annual"].map(b => (
                  <div key={b} onClick={() => setBillingCycle(b)} style={{ flex:1, padding:"10px", borderRadius:7, cursor:"pointer", textAlign:"center", background: billingCycle===b ? `${ACID}10` : PANEL_2, border:`1px solid ${billingCycle===b ? ACID+"44" : BORDER}`, fontSize:12, color: billingCycle===b ? ACID : TEXT, textTransform:"capitalize" }}>{b}</div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:10, color:MUTED, fontFamily:MONO, letterSpacing:1.5, marginBottom:8 }}>PROJECT (OPTIONAL)</div>
              <input value={project} onChange={e => setProject(e.target.value)} placeholder="e.g. My App, Client Work, Personal" style={{ width:"100%", background:PANEL_2, border:`1px solid ${BORDER}`, borderRadius:7, padding:"10px 14px", color:TEXT, fontSize:13, fontFamily:SANS, outline:"none" }} />
            </div>
            {cost > 0 && (
              <div style={{ background:`${ACID}08`, border:`1px solid ${ACID}25`, borderRadius:8, padding:"12px 16px", marginBottom:20, display:"flex", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:10, color:MUTED, fontFamily:MONO, marginBottom:4 }}>MONTHLY</div>
                  <div style={{ fontSize:20, fontWeight:800, color:ACID, fontFamily:MONO }}>${cost}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:10, color:MUTED, fontFamily:MONO, marginBottom:4 }}>ANNUAL</div>
                  <div style={{ fontSize:20, fontWeight:800, color:WARN, fontFamily:MONO }}>${cost * 12}</div>
                </div>
              </div>
            )}
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setStep(1)} style={{ flex:1, background:"transparent", border:`1px solid ${BORDER}`, color:MUTED, padding:"11px", borderRadius:7, fontSize:13, cursor:"pointer", fontFamily:SANS }}>← Back</button>
              <button onClick={handleAdd} disabled={!plan && picked.name !== "Custom"} style={{ flex:2, background:ACID, border:"none", color:BG, padding:"11px", borderRadius:7, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:SANS, boxShadow:`0 0 16px ${ACID}44`, opacity:(!plan && picked.name !== "Custom") ? 0.4 : 1 }}>
                Add to Stack →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── TOOLTIPS ─────────────────────────────────────────────────
const SpendTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const v = payload.find(p => p.value != null);
  if (!v) return null;
  return (
    <div style={{ background:PANEL_2, border:`1px solid ${BORDER}`, padding:"8px 14px", borderRadius:6, fontFamily:MONO }}>
      <div style={{ color:MUTED, fontSize:10, marginBottom:3 }}>{label}</div>
      <div style={{ color: v.name === "forecast" ? MUTED : ACID, fontSize:13 }}>${v.value}/mo{v.name==="forecast"?" ·proj":""}</div>
    </div>
  );
};

const ScoreTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:PANEL_2, border:`1px solid ${BORDER}`, padding:"8px 14px", borderRadius:6, fontFamily:MONO }}>
      <div style={{ color:MUTED, fontSize:10, marginBottom:3 }}>{label}</div>
      <div style={{ color:ACID, fontSize:13 }}>{payload[0].value}</div>
    </div>
  );
};

// ── MAIN ──────────────────────────────────────────────────────
export default function HektiqDashboard() {
  const [activeNav, setActiveNav]   = useState("DASHBOARD");
  const [hoveredTool, setHoveredTool] = useState(null);
  const [digestOn, setDigestOn]     = useState(true);
  const [showAddTool, setShowAddTool] = useState(false);

  // ── PERSIST TO LOCALSTORAGE ───────────────────────────────────
  const [userTools, setUserTools] = useState(() => {
    try {
      const saved = localStorage.getItem("hektiq_tools");
      return saved ? JSON.parse(saved) : tools;
    } catch { return tools; }
  });

  useEffect(() => {
    try { localStorage.setItem("hektiq_tools", JSON.stringify(userTools)); }
    catch {}
  }, [userTools]);

  const handleAddTool    = (newTool) => setUserTools(prev => [...prev, newTool]);
  const handleRemoveTool = (id)      => setUserTools(prev => prev.filter(t => (t.id||t.name) !== id));

  // ── LIVE OVERLAP ANALYSIS ─────────────────────────────────────
  const OVERLAP_GROUPS = [
    { label:"AI Chat",        members:["Claude API","ChatGPT","Perplexity","Anthropic API","OpenAI API"] },
    { label:"AI Code",        members:["Cursor","GitHub Copilot","Replit","Bolt","Lovable","Codeium"] },
    { label:"AI Image",       members:["Midjourney","Runway ML","DALL-E","Stable Diffusion","Adobe Firefly"] },
    { label:"AI Video",       members:["Runway ML","Synthesia","HeyGen","Pika"] },
    { label:"AI Audio",       members:["ElevenLabs","Murf","Descript"] },
    { label:"Hosting",        members:["Vercel","Netlify","Railway","Fly.io","Render","Heroku"] },
    { label:"Database",       members:["Supabase","PlanetScale","MongoDB Atlas","Neon","Firebase"] },
    { label:"Email",          members:["Resend","Mailgun","SendGrid","Postmark"] },
    { label:"Analytics",      members:["PostHog","Mixpanel","Amplitude","Segment"] },
    { label:"Error tracking", members:["Sentry","Bugsnag","Datadog","Rollbar"] },
    { label:"CDN/DNS",        members:["Cloudflare","Fastly"] },
    { label:"Storage",        members:["Backblaze","AWS","Cloudflare R2"] },
    { label:"Payments",       members:["Stripe","Lemon Squeezy","Paddle","Gumroad"] },
    { label:"Design",         members:["Figma","Sketch","Adobe XD","Framer"] },
    { label:"Automation",     members:["Zapier","Make","n8n","Pipedream"] },
  ];

  const overlapIds = new Set();
  const overlapDetails = [];
  OVERLAP_GROUPS.forEach(group => {
    const hits = userTools.filter(t =>
      group.members.some(m => t.name.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(t.name.toLowerCase()))
    );
    if (hits.length > 1) {
      hits.forEach(t => overlapIds.add(t.id || t.name));
      overlapDetails.push({ label: group.label, tools: hits.map(t=>t.name), cost: hits.reduce((s,t)=>s+t.cost,0) });
    }
  });

  // Annotate each tool with live overlap flag
  const analyzedTools = userTools.map(t => ({
    ...t,
    overlap: overlapIds.has(t.id || t.name),
  }));

  const totalSpend   = analyzedTools.reduce((s,t) => s+t.cost, 0);
  const overlapTools = analyzedTools.filter(t => t.overlap);
  const overlapCost  = overlapTools.reduce((s,t) => s+t.cost, 0);
  const deadTools    = analyzedTools.filter(t => (t.daysAgo||0) > 20);
  const yearForecast = Math.round(totalSpend * 12 * 1.08);
  const totalROI     = analyzedTools.reduce((s,t) => s+(t.roi||0), 0);

  // ── HEALTH SCORE ─────────────────────────────────────────────
  const healthScore = Math.max(10, Math.min(99,
    95
    - (analyzedTools.length > 5 ? (analyzedTools.length - 5) * 4 : 0)
    - (overlapDetails.length * 15)
    - (deadTools.length * 8)
    - (totalSpend > 200 ? 5 : 0)
  ));
  const healthColor = healthScore >= 75 ? ACID : healthScore >= 50 ? WARN : "#ff4444";

  // ── HEALTH ISSUES ─────────────────────────────────────────────
  const dynamicIssues = [
    overlapDetails.length > 0 && { label:`${overlapDetails.length} overlap group${overlapDetails.length>1?"s":""} detected`, severity:"high"   },
    deadTools.length > 0      && { label:`${deadTools.length} underused subscription${deadTools.length>1?"s":""}`,             severity:"medium" },
    analyzedTools.length > 6  && { label:`Stack complexity: ${analyzedTools.length} tools`,                                    severity:"medium" },
    totalSpend > 200           && { label:"Spend above average ($200/mo)",                                                      severity:"low"    },
  ].filter(Boolean);

  // ── SPEND CHART ───────────────────────────────────────────────
  const dynamicSpendData = [
    { month:"Nov", spend:Math.round(totalSpend*0.74), forecast:null },
    { month:"Dec", spend:Math.round(totalSpend*0.83), forecast:null },
    { month:"Jan", spend:Math.round(totalSpend*0.90), forecast:null },
    { month:"Feb", spend:Math.round(totalSpend*0.85), forecast:null },
    { month:"Mar", spend:Math.round(totalSpend*0.99), forecast:null },
    { month:"Apr", spend:Math.round(totalSpend*1.00), forecast:null },
    { month:"May", spend:totalSpend, forecast:totalSpend },
    { month:"Jun", spend:null, forecast:Math.round(totalSpend*1.04) },
    { month:"Jul", spend:null, forecast:Math.round(totalSpend*1.08) },
    { month:"Aug", spend:null, forecast:Math.round(totalSpend*1.12) },
  ];

  // ── RECOMMENDATIONS ───────────────────────────────────────────
  const dynamicRecs = [
    ...overlapDetails.map((od,i) => ({
      id:`overlap_${i}`,
      label:`${od.label.toUpperCase()} OVERLAP`,
      detail:`${od.tools.join(" + ")} are doing the same job. Consolidate to one tool to save ~$${Math.round(od.cost*0.5)}/mo.`,
      savings: Math.round(od.cost*0.5), efficiency:"+12%", confidence:91,
    })),
    deadTools.length > 0 && {
      id:"dead", label:"PAUSE DEAD WEIGHT",
      detail:`${deadTools.map(t=>t.name).join(", ")} ${deadTools.length>1?"haven't":"hasn't"} been used recently. Pause to save $${deadTools.reduce((s,t)=>s+t.cost,0)}/mo.`,
      savings:deadTools.reduce((s,t)=>s+t.cost,0), efficiency:"+4%", confidence:88,
    },
    analyzedTools.length > 7 && {
      id:"size", label:"REDUCE STACK SIZE",
      detail:`You're running ${analyzedTools.length} tools. Most profitable builders use 4-5. Consider what you can cut.`,
      savings:null, efficiency:null, confidence:76,
    },
  ].filter(Boolean);

  // ── RELATIONSHIP GRAPH NODES ──────────────────────────────────
  const nodePositions = [
    {x:100,y:110},{x:220,y:52},{x:370,y:72},{x:240,y:172},
    {x:95,y:205},{x:310,y:215},{x:450,y:155},{x:160,y:280},
    {x:380,y:290},{x:480,y:60},{x:50,y:60},
  ];
  const dynamicNodes = {};
  analyzedTools.forEach((t,i) => {
    const pos = nodePositions[i] || { x:100+(i%4)*120, y:60+Math.floor(i/4)*100 };
    dynamicNodes[t.id||t.name] = { x:pos.x, y:pos.y, label:t.name, cost:t.cost, overlap:t.overlap, dead:!t.active||(t.daysAgo||0)>20 };
  });

  const severityColor = s => s==="high"?WARN:s==="medium"?BLUE:MUTED;

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT, fontFamily:SANS, display:"flex", fontSize:13 }}>

      {/* ── SIDEBAR ── */}
      <div style={{ width:220, background:PANEL, borderRight:`1px solid ${BORDER}`, display:"flex", flexDirection:"column", padding:"28px 0", flexShrink:0, boxShadow:"4px 0 24px rgba(0,0,0,0.5)" }}>
        <div style={{ padding:"0 24px 36px" }}>
          <div style={{ fontSize:20, fontWeight:800, letterSpacing:6, color:ACID, fontFamily:SANS, textShadow:`0 0 20px ${ACID}55` }}>Hektiq</div>
          <div style={{ fontSize:9, color:MUTED, letterSpacing:3, marginTop:3 }}>AI STACK OPERATING SYSTEM</div>
        </div>
        <div style={{ flex:1 }}>
          {navItems.map(({label,icon}) => {
            const active = activeNav===label;
            return (
              <div key={label} onClick={()=>setActiveNav(label)} style={{
                padding:"11px 24px", cursor:"pointer", display:"flex", alignItems:"center", gap:10,
                color: active?ACID:MUTED,
                borderLeft: active?`2px solid ${ACID}`:"2px solid transparent",
                background: active?`${ACID}08`:"transparent",
                letterSpacing:1.5, fontSize:10, fontWeight: active?600:400,
                transition:"all 0.15s",
              }}>
                <span style={{ fontSize:11, color: active?ACID:"#2d3539" }}>{icon}</span>
                {label}
              </div>
            );
          })}
        </div>
        <div style={{ padding:"0 24px 16px" }}>
          <div style={{ background:PANEL_2, border:`1px solid ${BORDER}`, borderRadius:8, padding:"12px 14px" }}>
            <div style={{ fontSize:9, color:MUTED, letterSpacing:2, marginBottom:6 }}>CONNECTED TOOLS</div>
            <div style={{ fontSize:22, fontWeight:800, color:TEXT, fontFamily:MONO }}>{userTools.length}</div>
            <div style={{ fontSize:9, color:MUTED, marginTop:2 }}>{overlapTools.length > 0 ? `${overlapTools.length} overlapping` : "Stack looks clean"}</div>
          </div>
        </div>
        <div style={{ padding:"16px 24px 0", borderTop:`1px solid ${BORDER}` }}>
          <div style={{ fontSize:10, color:MUTED, letterSpacing:1 }}>BUILDER</div>
          <div style={{ fontSize:13, color:TEXT, marginTop:4, fontWeight:600 }}>cody.eth</div>
          <div style={{ marginTop:8, display:"inline-flex", alignItems:"center", gap:5, background:`${ACID}12`, border:`1px solid ${ACID}30`, color:ACID, fontSize:9, padding:"3px 10px", letterSpacing:2, borderRadius:3, fontWeight:600 }}>
            <span style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:ACID, boxShadow:`0 0 6px ${ACID}` }}/>PRO
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex:1, padding:"28px 28px", overflowY:"auto" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <div>
            <div style={{ fontSize:11, color:MUTED, letterSpacing:3, marginBottom:5, fontFamily:MONO }}>MAY 2026 · BUILDER CONTROL CENTER</div>
            <div style={{ fontSize:22, fontWeight:700, color:TEXT, letterSpacing:-0.5 }}>AI Stack Dashboard</div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button style={{ background:"transparent", color:MUTED, border:`1px solid ${BORDER}`, padding:"8px 16px", fontFamily:SANS, fontSize:11, letterSpacing:1.5, cursor:"pointer", borderRadius:5 }}>IMPORT TOOL</button>
            <button onClick={()=>setShowAddTool(true)} style={{ background:ACID, color:BG, border:"none", padding:"8px 18px", fontFamily:SANS, fontWeight:700, fontSize:11, letterSpacing:1.5, cursor:"pointer", borderRadius:5, boxShadow:`0 0 16px ${ACID}44` }}>+ ADD TOOL</button>
          </div>
        </div>

        {/* ── HERO: Stack Health + Archetype ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 270px", gap:14, marginBottom:14 }}>

          {/* Stack Health */}
          <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"22px 26px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${ACID}88,transparent)`, animation:"scanline 3s ease-in-out infinite" }}/>
            <div style={{ position:"absolute", top:-60, right:-60, width:200, height:200, borderRadius:"50%", background:`${ACID}04`, filter:"blur(40px)", pointerEvents:"none" }}/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
              <div>
                <div style={{ fontSize:10, color:MUTED, letterSpacing:3, marginBottom:8, fontFamily:MONO }}>STACK HEALTH</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
                  <div style={{ fontSize:52, fontWeight:800, color:healthColor, lineHeight:1, fontFamily:MONO, textShadow:`0 0 30px ${healthColor}44` }}>
                    <Counter target={healthScore} suffix="%"/>
                  </div>
                  <div style={{ fontSize:12, color:GREEN, fontFamily:MONO }}>▲ live</div>
                </div>
              </div>
              <div style={{ background:`${WARN}15`, border:`1px solid ${WARN}40`, color:WARN, fontSize:9, padding:"5px 12px", borderRadius:3, letterSpacing:2, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:WARN, boxShadow:`0 0 8px ${WARN}`, animation:"blink 1.5s infinite" }}/>
                {dynamicIssues.length} ISSUES DETECTED
              </div>
            </div>
            <div style={{ marginBottom:18 }}>
              <div style={{ height:4, background:"#1a2022", borderRadius:2, overflow:"hidden" }}>
                <div style={{ width:`${healthScore}%`, height:"100%", background:`linear-gradient(90deg,${ACID_S},${healthColor})`, borderRadius:2, boxShadow:`0 0 10px ${healthColor}66`, transition:"width 0.8s ease" }}/>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:9, color:"#2a3035", fontFamily:MONO }}>
                <span>0</span><span>CRITICAL</span><span>WARNING</span><span>OPTIMAL</span><span>100</span>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {(dynamicIssues.length > 0 ? dynamicIssues : [{ label:"No issues detected", severity:"low" }]).map((issue,i) => (
                <div key={i} style={{ background:PANEL_2, border:`1px solid ${severityColor(issue.severity)}22`, borderRadius:6, padding:"9px 12px", display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:severityColor(issue.severity), flexShrink:0, boxShadow:`0 0 6px ${severityColor(issue.severity)}` }}/>
                  <div style={{ fontSize:11, color:"#8a9299" }}>{issue.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Builder Archetype */}
          <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"22px 20px", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column" }}>
            <div style={{ position:"absolute", top:-40, right:-40, width:140, height:140, borderRadius:"50%", background:`${PURPLE}06`, filter:"blur(30px)" }}/>
            <div style={{ fontSize:10, color:MUTED, letterSpacing:3, marginBottom:14, fontFamily:MONO }}>BUILDER ARCHETYPE</div>
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center" }}>
              <div style={{ fontSize:11, color:MUTED, letterSpacing:2, marginBottom:5 }}>YOU MATCH</div>
              <div style={{ fontSize:19, fontWeight:800, color:TEXT, marginBottom:4, lineHeight:1.2 }}>"The Solo Hacker"</div>
              <div style={{ fontSize:10, color:PURPLE, letterSpacing:1, marginBottom:14 }}>TOP 32% OF BUILDERS</div>
              <div style={{ display:"flex", flexDirection:"column", gap:5, width:"100%", marginBottom:14 }}>
                {["High experimentation rate","Over-subscribed","Fast shipping velocity","Medium automation maturity"].map((t,i) => (
                  <div key={i} style={{ background:PANEL_2, border:`1px solid ${BORDER}`, borderRadius:4, padding:"5px 10px", fontSize:10, color:"#8a9299", textAlign:"left", display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ color:PURPLE, fontSize:8 }}>▸</span>{t}
                  </div>
                ))}
              </div>
              <button style={{ background:`${PURPLE}15`, border:`1px solid ${PURPLE}40`, color:PURPLE, padding:"7px 18px", borderRadius:4, fontSize:10, letterSpacing:1.5, cursor:"pointer", fontFamily:SANS, fontWeight:600, width:"100%" }}>
                SHARE ARCHETYPE ↗
              </button>
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:14 }}>
          {[
            { label:"MONTHLY BURN",      value:totalSpend,   prefix:"$", suffix:"",    sub:"+$12 vs last month",       color:WARN  },
            { label:"ANNUAL FORECAST",   value:yearForecast, prefix:"$", suffix:"",    sub:"↑ trending upward",         color:WARN  },
            { label:"ACTIVE TOOLS",      value:userTools.length, prefix:"",  suffix:"",    sub:"3 over optimal",            color:TEXT  },
            { label:"REVENUE ATTRIBUTED",value:totalROI,     prefix:"$", suffix:"/mo", sub:"from tagged tools",         color:GREEN },
            { label:"POTENTIAL SAVINGS", value:51,           prefix:"$", suffix:"/mo", sub:"via recommendations",       color:ACID  },
          ].map(({label,value,prefix,suffix,sub,color}) => (
            <div key={label} style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"16px 18px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", bottom:-20, right:-20, width:70, height:70, borderRadius:"50%", background:`${color}06`, filter:"blur(20px)" }}/>
              <div style={{ fontSize:9, color:MUTED, letterSpacing:2, marginBottom:8, fontFamily:MONO }}>{label}</div>
              <div style={{ fontSize:24, fontWeight:800, color, lineHeight:1, fontFamily:MONO }}><Counter target={value} prefix={prefix} suffix={suffix}/></div>
              <div style={{ fontSize:9, color:MUTED, marginTop:7 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* ── PRICE ALERTS ── */}
        <div style={{ marginBottom:14 }}>
          <div style={{ display:"flex", gap:12 }}>
            {priceAlerts.map((a,i) => (
              <div key={i} style={{ flex:1, background:`${WARN}08`, border:`1px solid ${WARN}30`, borderRadius:8, padding:"12px 16px", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:36, height:36, borderRadius:8, background:`${WARN}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ color:WARN, fontSize:14 }}>↑</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:3 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:WARN, letterSpacing:1, fontFamily:MONO }}>PRICE INCREASE</span>
                    <span style={{ background:`${WARN}22`, color:WARN, fontSize:9, padding:"2px 7px", borderRadius:3, fontFamily:MONO, fontWeight:700 }}>{a.change}</span>
                    <span style={{ fontSize:10, color:TEXT }}>{a.tool}</span>
                  </div>
                  <div style={{ fontSize:10, color:MUTED }}>{a.detail}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:WARN, fontFamily:MONO }}>+${a.impact}/mo</div>
                  <div style={{ fontSize:9, color:MUTED, fontFamily:MONO }}>+${a.impact*12}/yr</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CHARTS ROW ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 255px", gap:14, marginBottom:14 }}>
          <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"18px 20px 12px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:MONO }}>SPEND TRAJECTORY</div>
              <div style={{ display:"flex", gap:16, fontSize:9, fontFamily:MONO }}>
                <span style={{ color:ACID }}>▬ actual</span>
                <span style={{ color:MUTED }}>╌ forecast</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={dynamicSpendData} margin={{ top:4, right:0, bottom:0, left:-18 }}>
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACID} stopOpacity={0.18}/>
                    <stop offset="100%" stopColor={ACID} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="fGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={MUTED} stopOpacity={0.08}/>
                    <stop offset="100%" stopColor={MUTED} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={BORDER} vertical={false}/>
                <XAxis dataKey="month" tick={{ fill:MUTED, fontSize:9, fontFamily:MONO }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:MUTED, fontSize:9, fontFamily:MONO }} axisLine={false} tickLine={false}/>
                <Tooltip content={<SpendTip/>}/>
                <Area type="monotone" dataKey="spend" stroke={ACID} strokeWidth={2} fill="url(#aGrad)" dot={{ fill:ACID, r:3 }} connectNulls={false}/>
                <Area type="monotone" dataKey="forecast" stroke={MUTED} strokeWidth={1.5} strokeDasharray="4 3" fill="url(#fGrad)" dot={false} connectNulls={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"18px 20px 12px" }}>
            <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, marginBottom:4, fontFamily:MONO }}>STACK SCORE HISTORY</div>
            <div style={{ fontSize:9, color:GREEN, fontFamily:MONO, marginBottom:12 }}>▲ +20 pts over 6 months</div>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={scoreHistory} margin={{ top:4, right:0, bottom:0, left:-24 }}>
                <CartesianGrid stroke={BORDER} vertical={false}/>
                <XAxis dataKey="month" tick={{ fill:MUTED, fontSize:9, fontFamily:MONO }} axisLine={false} tickLine={false}/>
                <YAxis domain={[40,100]} tick={{ fill:MUTED, fontSize:9, fontFamily:MONO }} axisLine={false} tickLine={false}/>
                <Tooltip content={<ScoreTip/>}/>
                <Line type="monotone" dataKey="score" stroke={ACID} strokeWidth={2} dot={{ fill:ACID, r:3 }}/>
              </LineChart>
            </ResponsiveContainer>
            <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${BORDER}` }}>
              {[
                { label:"First optimization", done:true  },
                { label:"Score above 70",      done:true  },
                { label:"Zero redundancy",     done:false },
                { label:"Top 10% builder",     done:false },
              ].map(m => (
                <div key={m.label} style={{ display:"flex", alignItems:"center", gap:6, fontSize:9, color: m.done?ACID:MUTED, marginBottom:4 }}>
                  <span>{m.done?"◆":"◇"}</span>{m.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TOOL STACK + RECOMMENDATIONS ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 330px", gap:14, marginBottom:14 }}>

          {/* Tool Stack with ROI */}
          <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"20px", display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:MONO }}>YOUR STACK</div>
              <div style={{ display:"flex", gap:10, fontSize:9, fontFamily:MONO }}>
                {overlapTools.length > 0 && <span style={{ color:WARN }}>⚠ {overlapTools.length} overlapping</span>}
                {deadTools.length > 0 && <><span style={{ color:"#2d3539" }}>|</span><span style={{ color:MUTED }}>{deadTools.length} dead weight</span></>}
              </div>
            </div>

            {/* Column headers */}
            <div style={{ display:"flex", padding:"0 10px 7px", borderBottom:`1px solid ${BORDER}`, marginBottom:4, flexShrink:0 }}>
              <div style={{ width:26 }}/>
              <div style={{ flex:1, fontSize:8, color:"#252d30", letterSpacing:1.5, fontFamily:MONO }}>TOOL · PROJECT</div>
              <div style={{ width:55, textAlign:"right", fontSize:8, color:"#252d30", letterSpacing:1.5, fontFamily:MONO }}>ROI/MO</div>
              <div style={{ width:50, textAlign:"right", fontSize:8, color:"#252d30", letterSpacing:1.5, fontFamily:MONO }}>COST</div>
              <div style={{ width:65, textAlign:"right", fontSize:8, color:"#252d30", letterSpacing:1.5, fontFamily:MONO }}>ANNUAL</div>
              <div style={{ width:24 }}/>
            </div>

            {/* Scrollable tool list */}
            <div style={{ overflowY:"auto", maxHeight:280, display:"flex", flexDirection:"column", gap:2 }}>
              {analyzedTools.map((tool,i) => {
                const isDead = (tool.daysAgo||0) > 20;
                const roiColor = tool.roi > 100 ? GREEN : tool.roi > 0 ? BLUE : MUTED;
                return (
                  <div key={tool.id || tool.name}
                    onMouseEnter={() => setHoveredTool(i)}
                    onMouseLeave={() => setHoveredTool(null)}
                    style={{
                      display:"flex", alignItems:"center", padding:"9px 10px", borderRadius:7,
                      background: tool.overlap?`${WARN}08`:isDead?`${MUTED}04`:hoveredTool===i?PANEL_2:"transparent",
                      transition:"all 0.15s",
                      borderLeft: tool.overlap?`2px solid ${WARN}`:isDead?`2px solid ${MUTED}33`:"2px solid transparent",
                      opacity: isDead?0.65:1,
                    }}>
                    <div style={{ width:26, fontSize:12, color: isDead?MUTED:ACID }}>{tool.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, color: isDead?MUTED:TEXT, fontWeight:500 }}>{tool.name}</div>
                      <div style={{ fontSize:9, color:"#2d3539", fontFamily:MONO }}>{tool.project}</div>
                    </div>
                    <div style={{ width:55, textAlign:"right" }}>
                      <div style={{ fontSize:11, color:roiColor, fontFamily:MONO, fontWeight:700 }}>
                        {tool.roi > 0 ? `$${tool.roi}` : "—"}
                      </div>
                      {tool.roi > 0 && <div style={{ fontSize:8, color:roiColor, opacity:0.6, fontFamily:MONO }}>revenue</div>}
                    </div>
                    <div style={{ width:50, textAlign:"right" }}>
                      <div style={{ fontSize:12, color:TEXT, fontFamily:MONO }}>${tool.cost}</div>
                      <div style={{ fontSize:9, color: tool.trend==="up"?WARN:tool.trend==="down"?GREEN:"#2d3539" }}>
                        {tool.trend==="up"?"▲":tool.trend==="down"?"▼":"—"}
                      </div>
                    </div>
                    <div style={{ width:65, textAlign:"right" }}>
                      <div style={{ fontSize:11, color:MUTED, fontFamily:MONO }}>${tool.cost*12}</div>
                      {isDead && <div style={{ fontSize:8, color:WARN, fontFamily:MONO }}>dead wt</div>}
                    </div>
                    {/* Remove button */}
                    <div
                      onClick={() => handleRemoveTool(tool.id || tool.name)}
                      style={{ width:24, textAlign:"right", color:"#2d3539", fontSize:13, cursor:"pointer", transition:"color 0.15s", paddingLeft:6 }}
                      onMouseEnter={e => e.currentTarget.style.color = WARN}
                      onMouseLeave={e => e.currentTarget.style.color = "#2d3539"}
                    >✕</div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", fontSize:11, flexShrink:0 }}>
              <span style={{ color:MUTED, fontFamily:MONO }}>TOTAL</span>
              <span style={{ fontFamily:MONO }}>
                <span style={{ color:TEXT, fontWeight:700 }}>${totalSpend}/mo</span>
                <span style={{ color:MUTED }}> · </span>
                <span style={{ color:WARN, fontWeight:700 }}>${totalSpend*12}/yr</span>
                <span style={{ color:MUTED }}> · </span>
                <span style={{ color:GREEN, fontWeight:700 }}>+${totalROI}/mo attributed</span>
              </span>
            </div>
          </div>

          {/* Recommendations */}
          <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"20px", display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:2 }}>
              <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:MONO }}>HEKTIQ RECOMMENDATIONS</div>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:ACID, animation:"blink 2s infinite" }}/>
                <span style={{ fontSize:8, color:MUTED, fontFamily:MONO }}>AI ACTIVE</span>
              </div>
            </div>
            {(dynamicRecs.length > 0 ? dynamicRecs : [{ id:0, label:"STACK LOOKS GOOD", detail:"No major issues detected. Keep monitoring for price changes and new overlaps.", savings:null, efficiency:null, confidence:100 }]).map(rec => (
              <div key={rec.id} style={{ background:PANEL_2, border:`1px solid ${BORDER}`, borderRadius:8, padding:"12px 14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:ACID, letterSpacing:1, fontFamily:MONO }}>✦ {rec.label}</div>
                  <div style={{ fontSize:8, color:MUTED, fontFamily:MONO }}>{rec.confidence}% conf</div>
                </div>
                <div style={{ fontSize:11, color:MUTED, lineHeight:1.55, marginBottom:8 }}>{rec.detail}</div>
                <div style={{ display:"flex", gap:8 }}>
                  <div style={{ background:`${GREEN}10`, border:`1px solid ${GREEN}22`, borderRadius:4, padding:"4px 10px", fontSize:10, color:GREEN, fontFamily:MONO, fontWeight:700 }}>save ${rec.savings}/mo</div>
                  <div style={{ background:`${BLUE}10`, border:`1px solid ${BLUE}22`, borderRadius:4, padding:"4px 10px", fontSize:10, color:BLUE, fontFamily:MONO, fontWeight:700 }}>{rec.efficiency} eff</div>
                </div>
              </div>
            ))}

            <div style={{ paddingTop:10, borderTop:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:10, color:MUTED, letterSpacing:1.5, fontFamily:MONO }}>WEEKLY DIGEST</div>
                <div style={{ fontSize:9, color:"#252d30", marginTop:2 }}>Every Monday · Email</div>
              </div>
              <div onClick={()=>setDigestOn(d=>!d)} style={{ width:36, height:20, borderRadius:10, cursor:"pointer", background:digestOn?ACID:"#1d2326", position:"relative", transition:"background 0.2s", flexShrink:0, boxShadow:digestOn?`0 0 10px ${ACID}44`:"none" }}>
                <div style={{ position:"absolute", top:3, left:digestOn?18:3, width:14, height:14, borderRadius:"50%", background:digestOn?BG:MUTED, transition:"left 0.2s" }}/>
              </div>
            </div>
          </div>
        </div>

        {/* ── TOOL RELATIONSHIP GRAPH ── */}
        <div style={{ marginBottom:14 }}>
          <RelationshipGraph userTools={userTools} dynamicNodes={dynamicNodes}/>
        </div>

        {/* ── STACK SIMULATION ── */}
        <div style={{ marginBottom:14 }}>
          <StackSimulation totalSpend={totalSpend}/>
        </div>

        {/* ── COMMUNITY BENCHMARKS ── */}
        <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"20px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:MONO }}>COMMUNITY BENCHMARKS</div>
            <div style={{ fontSize:10, color:MUTED }}>vs. <span style={{ color:TEXT }}>indie hackers</span></div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 }}>
            {[
              { label:"You spend more than",         value:"66% of similar builders", color:WARN  },
              { label:"Your tool count is",           value:"Above average",            color:WARN  },
              { label:"Stack efficiency rank",        value:"Top 42%",                 color:BLUE  },
              { label:"Profitable builders use",      value:"4 tools or fewer",         color:GREEN },
            ].map(b => (
              <div key={b.label} style={{ background:PANEL_2, border:`1px solid ${BORDER}`, borderRadius:7, padding:"12px 14px" }}>
                <div style={{ fontSize:10, color:MUTED, marginBottom:4 }}>{b.label}</div>
                <div style={{ fontSize:14, fontWeight:700, color:b.color }}>{b.value}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:9, color:MUTED, letterSpacing:2, marginBottom:10, fontFamily:MONO }}>TOP TOOLS AMONG PROFITABLE INDIE HACKERS</div>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            {benchmarks.map(b => (
              <div key={b.label} style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ flex:1, fontSize:11, color:MUTED }}>{b.label}</div>
                <div style={{ width:220 }}>
                  <div style={{ height:3, background:"#1a2022", borderRadius:2 }}>
                    <div style={{ width:`${b.pct}%`, height:"100%", background:`linear-gradient(90deg,${ACID_S},${ACID})`, borderRadius:2 }}/>
                  </div>
                </div>
                <div style={{ width:32, textAlign:"right", fontSize:10, color:ACID, fontFamily:MONO }}>{b.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${BG}; }
        ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 2px; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes scanline { 0%{opacity:0;transform:scaleX(0.3)} 50%{opacity:1;transform:scaleX(1)} 100%{opacity:0;transform:scaleX(0.3)} }
        @media (max-width: 768px) {
          .hektiq-main { padding: 16px !important; }
        }
      `}</style>

      {/* ── ADD TOOL MODAL ── */}
      {showAddTool && <AddToolModal onClose={() => setShowAddTool(false)} onAdd={handleAddTool} />}

    </div>
  );
}



