import React, { useState, useEffect, useRef } from "react";
import { useClerk, useUser } from "@clerk/clerk-react";
import { createClient } from "@supabase/supabase-js";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LineChart, Line, } from "recharts";

class ErrorBoundary extends React.Component {
 constructor(props) { super(props); this.state = { error: null }; }
 static getDerivedStateFromError(err) { return { error: err.message }; }
 render() {
  if (this.state.error) return (
   <div style={{ padding:40, background:"#070909", color:"#f3f5f7", minHeight:"100vh", fontFamily:"monospace" }}>
    <div style={{ color:"#ff4444", marginBottom:16, fontSize:14 }}>Runtime Error:</div>
    <pre style={{ color:"#ff7a45", fontSize:12, whiteSpace:"pre-wrap" }}>{this.state.error}</pre>
   </div>
  );
  return this.props.children;
 }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
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
const M=MONO,SA=SANS,BO=BORDER;
const tools = [
 { id:"claude",     name:"Claude API",     cat:"AI Core",  cost:84,  trend:"up",     icon:"◆", overlap:false, daysAgo:2,  active:true,  roi:420, project:"TrendPulseAI" },
 { id:"chatgpt",    name:"ChatGPT Plus",   cat:"AI Core",  cost:20,  trend:"stable", icon:"◉", overlap:true,  daysAgo:14, active:true,  roi:0,   project:"—"           },
 { id:"cursor",     name:"Cursor Pro",     cat:"Dev",      cost:20,  trend:"up",     icon:"▸", overlap:false, daysAgo:1,  active:true,  roi:310, project:"All Projects" },
 { id:"perplexity", name:"Perplexity Pro", cat:"Research", cost:20,  trend:"down",   icon:"◈", overlap:true,  daysAgo:11, active:true,  roi:0,   project:"—"           },
 { id:"midjourney", name:"Midjourney",     cat:"Creative", cost:10,  trend:"stable", icon:"◐", overlap:false, daysAgo:42, active:false, roi:0,   project:"—"           },
 { id:"runway",     name:"Runway ML",      cat:"Creative", cost:15,  trend:"up",     icon:"◑", overlap:false, daysAgo:3,  active:true,  roi:85,  project:"Hektiq Assets"  },
 { id:"elevenlabs", name:"ElevenLabs",     cat:"Audio",    cost:22,  trend:"stable", icon:"◒", overlap:false, daysAgo:7,  active:true,  roi:120, project:"TrendPulseAI" },
];
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
function RelationshipGraph({ userTools, dynamicNodes, overlapIds }) {
 const [hovered, setHovered] = useState(null);
 const W = 560, H = 260;
 const activeNodes = dynamicNodes || nodes;
 const WORKFLOW_PAIRS = [
  ["AI Core","Hosting"], ["AI Code","Hosting"], ["Research","Hosting"],
  ["AI Core","Database"], ["Hosting","Database"],
  ["AI Core","Auth"], ["Hosting","Auth"],
  ["Dev","Hosting"], ["Dev","Database"],
  ["Payments","Auth"],
  ["Analytics","Hosting"],
  ["Email","Auth"],
 ];
 const autoEdges = [];
 const toolList = userTools || [];
 toolList.forEach((t, i) => {
  toolList.slice(i+1).forEach(t2 => {
   if (t.cat === t2.cat) {
    autoEdges.push({ from: t.id||t.name, to: t2.id||t2.name, type: (t.overlap||t2.overlap) ? "overlap" : "workflow" });
   }
  });
 });
 toolList.forEach((t, i) => {
  toolList.slice(i+1).forEach(t2 => {
   if (t.cat === t2.cat) return; // already handled above
   const isWorkflowPair = WORKFLOW_PAIRS.some(([a,b]) =>
    (t.cat===a && t2.cat===b) || (t.cat===b && t2.cat===a)
   );
   if (isWorkflowPair) {
    autoEdges.push({ from: t.id||t.name, to: t2.id||t2.name, type: "workflow" });
   }
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
   <div style={{ marginBottom:16 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
     <div>
      <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:M, marginBottom:4 }}>TOOL RELATIONSHIP GRAPH</div>
      <div style={{ fontSize:12, color:TEXT, fontWeight:600, marginBottom:2 }}>See where your tools overlap and where they work together</div>
      <div style={{ fontSize:11, color:"#3a4448" }}>Overlap = tools doing the same job · Workflow = tools that complement each other</div>
     </div>
     <div style={{ display:"flex", flexDirection:"column", gap:6, fontSize:9, fontFamily:M, flexShrink:0, marginLeft:16 }}>
      <span style={{ color:ACID }}>── workflow connection</span>
      <span style={{ color:WARN }}>╌╌ overlap conflict</span>
      <span style={{ color:"#3a4448" }}>◉ inactive / dead weight</span>
     </div>
    </div>
    {activeEdges.filter(e=>e.type==="overlap").length > 0 && (
     <div style={{ background:`${WARN}0d`, border:`1px solid ${WARN}30`, borderRadius:6, padding:"8px 14px", display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ color:WARN, fontSize:13 }}>⚠</span>
      <div>
       <span style={{ fontSize:11, color:WARN, fontWeight:600 }}>
        {activeEdges.filter(e=>e.type==="overlap").length} overlap conflict{activeEdges.filter(e=>e.type==="overlap").length > 1 ? "s" : ""} detected
       </span>
       <span style={{ fontSize:11, color:MUTED }}> — these tools are doing the same job. You may be paying twice.</span>
      </div>
     </div>
    )}
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
    {activeEdges.map((e, i) => {
     const a = activeNodes[e.from], b = activeNodes[e.to];
     if (!a || !b) return null;
     const active = isEdgeActive(e);
     const isOverlap = e.type === "overlap";
     return (
      <line key={i}
       x1={a.x} y1={a.y} x2={b.x} y2={b.y}
       stroke={isOverlap ? WARN : ACID}
       strokeWidth={active ? (isOverlap ? 2.5 : 1) : 0.3}
       strokeDasharray={isOverlap ? "6 3" : "none"}
       opacity={active ? (isOverlap ? 0.9 : 0.3) : 0.06}
       style={{ transition:"all 0.2s" }}
      />
     );
    })}
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
       {n.overlap && (
        <circle cx={n.x} cy={n.y} r={22}
         fill="none" stroke={WARN}
         strokeWidth={isHov ? 1.5 : 0.8}
         opacity={isHov ? 0.6 : 0.3}
         strokeDasharray="3 3"
         filter="url(#overlapGlow)"
        />
       )}
       <circle cx={n.x} cy={n.y} r={isHov ? 20 : 16}
        fill={`${nodeColor}12`}
        stroke={nodeColor}
        strokeWidth={isHov ? 1.5 : 0.8}
        opacity={n.dead ? 0.4 : 1}
        filter={isHov ? "url(#nodeGlow)" : "none"}
        style={{ transition:"all 0.2s" }}
       />
       <circle cx={n.x} cy={n.y} r={5}
        fill={n.dead ? "#2d3539" : nodeColor}
        opacity={n.dead ? 0.5 : 1}
        style={{ transition:"all 0.2s" }}
       />
       <text x={n.x} y={n.y + 30}
        textAnchor="middle"
        fill={dimmed ? "#1d2326" : n.overlap ? WARN : n.dead ? "#3a4448" : MUTED}
        fontSize={9}
        fontFamily={MONO}
        style={{ transition:"fill 0.2s" }}
       >{n.label}</text>
       <text x={n.x} y={n.y + 41}
        textAnchor="middle"
        fill={dimmed ? "#1d2326" : "#272e32"}
        fontSize={8}
        fontFamily={MONO}
       >${n.cost}/mo</text>
       {n.overlap && !dimmed && (
        <text x={n.x} y={n.y - 24}
         textAnchor="middle"
         fill={WARN} fontSize={7} fontFamily={MONO}
         opacity={0.8}
        >OVERLAP</text>
       )}
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
   {userTools?.length > 0 && (
   <div style={{ display:"flex", gap:20, marginTop:8, paddingTop:12, borderTop:`1px solid ${BORDER}` }}>
    {[
     { label:"Workflow connections", value: activeEdges.filter(e=>e.type==="workflow").length.toString(), color:ACID, sub:"tools working together" },
     { label:"Overlap conflicts",    value: activeEdges.filter(e=>e.type==="overlap").length.toString(),  color:WARN, sub: activeEdges.filter(e=>e.type==="overlap").length > 0 ? "same job, double cost" : "none detected" },
     { label:"Inactive nodes",       value: Object.values(activeNodes).filter(n=>n.dead).length.toString(), color:MUTED, sub:"dead weight in stack" },
     { label:"Redundancy cost",      value: userTools?.filter(t=>overlapIds?.has(t.id||t.name)).reduce((s,t)=>s+t.cost,0) > 0 ? `$${userTools.filter(t=>overlapIds?.has(t.id||t.name)).reduce((s,t)=>s+t.cost,0)}/mo` : "None", color:WARN, sub:"wasted every month" },
    ].map(s => (
     <div key={s.label}>
      <div style={{ fontSize:9, color:MUTED, fontFamily:M, marginBottom:2 }}>{s.label}</div>
      <div style={{ fontSize:14, fontWeight:700, color:s.color, fontFamily:M }}>{s.value}</div>
      <div style={{ fontSize:9, color:"#3a4448", marginTop:2 }}>{s.sub}</div>
     </div>
    ))}
   </div>
   )}
  </div>
 );
}
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
     <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:M, marginBottom:4 }}>STACK SIMULATION</div>
     <div style={{ fontSize:11, color:"#3a4448" }}>Test optimizations before committing</div>
    </div>
    {scenario && (
     <button onClick={() => setActive(null)} style={{ background:"transparent", border:`1px solid ${BO}`, color:MUTED, padding:"5px 12px", borderRadius:4, fontSize:9, fontFamily:M, cursor:"pointer", letterSpacing:1, }}>RESET</button>
    )}
   </div>
   <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)", gap:10, marginBottom:16 }}>
    {simScenarios.map(s => {
     const isActive = active === s.id;
     const sc = tools.filter(t => s.remove.includes(t.id)).reduce((sum,t) => sum + t.cost, 0)
          - s.add.reduce((sum,a) => sum + a.cost, 0);
     return (
      <div key={s.id} onClick={() => setActive(isActive ? null : s.id)} style={{ background: isActive ? `${ACID}0c` : PANEL_2, border: `1px solid ${isActive ? ACID + "44" : BORDER}`, borderRadius:8, padding:"14px 14px", cursor:"pointer", transition:"all 0.2s", boxShadow: isActive ? `0 0 16px ${ACID}14` : "none", }}>
       <div style={{ fontSize:10, fontWeight:700, color: isActive ? ACID : TEXT, marginBottom:6 }}>{s.label}</div>
       <div style={{ fontSize:10, color:MUTED, lineHeight:1.5, marginBottom:10 }}>{s.description}</div>
       <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontSize:11, color:GREEN, fontFamily:M, fontWeight:700 }}>save ${sc}/mo</div>
        <div style={{ fontSize:9, color:BLUE, fontFamily:M }}>+{s.efficiencyGain}% eff</div>
       </div>
      </div>
     );
    })}
   </div>
   <div style={{ background: PANEL_2, border: `1px solid ${scenario ? ACID + "30" : BORDER}`, borderRadius:8, padding:"16px 20px", transition:"border-color 0.3s", }}>
    {!scenario ? (
     <div style={{ textAlign:"center", color:"#2a3035", fontSize:11, padding:"8px 0", fontFamily:M }}>
      ↑ select a scenario above to simulate
     </div>
    ) : (
     <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)", gap:20 }}>
      <div>
       <div style={{ fontSize:9, color:MUTED, fontFamily:M, marginBottom:6, letterSpacing:1.5 }}>REMOVING</div>
       {scenario.remove.map(id => {
        const t = tools.find(t => t.id === id);
        return (
         <div key={id} style={{ fontSize:11, color:WARN, fontFamily:M, marginBottom:3, display:"flex", justifyContent:"space-between" }}>
          <span>{t.name}</span><span>-${t.cost}</span>
         </div>
        );
       })}
      </div>
      <div>
       <div style={{ fontSize:9, color:MUTED, fontFamily:M, marginBottom:6, letterSpacing:1.5 }}>ADDING</div>
       {scenario.add.length ? scenario.add.map((a,i) => (
        <div key={i} style={{ fontSize:11, color:GREEN, fontFamily:M, marginBottom:3, display:"flex", justifyContent:"space-between" }}>
         <span>{a.name}</span><span>+${a.cost}</span>
        </div>
       )) : <div style={{ fontSize:11, color:"#2a3035", fontFamily:M }}>nothing</div>}
      </div>
      <div>
       <div style={{ fontSize:9, color:MUTED, fontFamily:M, marginBottom:6, letterSpacing:1.5 }}>NEW MONTHLY</div>
       <div style={{ fontSize:22, fontWeight:800, color:TEXT, fontFamily:M }}>${newMonthly}</div>
       <div style={{ fontSize:10, color:GREEN, fontFamily:M }}>was ${totalSpend}</div>
      </div>
      <div>
       <div style={{ fontSize:9, color:MUTED, fontFamily:M, marginBottom:6, letterSpacing:1.5 }}>ANNUAL SAVINGS</div>
       <div style={{ fontSize:22, fontWeight:800, color:ACID, fontFamily:M }}>${annualSavings}</div>
       <div style={{ fontSize:10, color:MUTED, fontFamily:M }}>+{scenario.efficiencyGain}% efficiency</div>
      </div>
     </div>
    )}
   </div>
  </div>
 );
}
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
   <div onClick={e => e.stopPropagation()} style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:12, width:"100%", maxWidth:540, maxHeight:"85vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:`0 0 60px rgba(0,0,0,0.6)` }}>
    <div style={{ padding:"18px 22px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
     <div>
      <div style={{ fontSize:14, fontWeight:700, color:TEXT }}>{step === 1 ? "Add a Tool" : `Configure ${picked?.name === "Custom" ? "Custom Tool" : picked?.name}`}</div>
      <div style={{ fontSize:10, color:MUTED, fontFamily:M, marginTop:2 }}>STEP {step} OF 2</div>
     </div>
     <div onClick={onClose} style={{ cursor:"pointer", color:MUTED, fontSize:18, lineHeight:1, padding:4 }}>✕</div>
    </div>
    {step === 1 && (
     <>
      <div style={{ padding:"14px 22px 10px", flexShrink:0 }}>
       <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tools..." style={{ width:"100%", background:PANEL_2, border:`1px solid ${BO}`, borderRadius:7, padding:"10px 14px", color:TEXT, fontSize:13, fontFamily:SA, outline:"none" }} />
      </div>
      <div style={{ padding:"0 22px 12px", display:"flex", gap:6, flexWrap:"wrap", flexShrink:0 }}>
       {CATEGORIES.map(c => (
        <div key={c} onClick={() => setCatFilter(c)} style={{ padding:"4px 10px", borderRadius:20, fontSize:10, cursor:"pointer", background: catFilter===c ? `${ACID}15` : PANEL_2, border:`1px solid ${catFilter===c ? ACID+"44" : BORDER}`, color: catFilter===c ? ACID : MUTED, fontFamily:M }}>
         {c}
        </div>
       ))}
      </div>
      <div style={{ overflowY:"auto", flex:1, padding:"0 22px 16px" }}>
       <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:8 }}>
        {filtered.map(tool => (
         <div key={tool.name} onClick={() => { setPicked(tool); setPlan(tool.plans[0]?.label || ""); setStep(2); }}
          onMouseEnter={e => e.currentTarget.style.borderColor = ACID+"44"}
          onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
          style={{ background:PANEL_2, border:`1px solid ${BO}`, borderRadius:8, padding:"12px 14px", cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:ACID, fontSize:14, flexShrink:0 }}>{tool.icon}</span>
          <div>
           <div style={{ fontSize:12, color:TEXT, fontWeight:500 }}>{tool.name}</div>
           <div style={{ fontSize:9, color:MUTED, fontFamily:M, letterSpacing:1 }}>{tool.cat.toUpperCase()}</div>
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
        <div style={{ fontSize:10, color:MUTED, fontFamily:M, letterSpacing:1.5, marginBottom:8 }}>TOOL NAME</div>
        <input autoFocus value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. My Custom Tool" style={{ width:"100%", background:PANEL_2, border:`1px solid ${BO}`, borderRadius:7, padding:"10px 14px", color:TEXT, fontSize:13, fontFamily:SA, outline:"none" }} />
       </div>
      )}
      {picked.plans.length > 0 && (
       <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:10, color:MUTED, fontFamily:M, letterSpacing:1.5, marginBottom:8 }}>PLAN</div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
         {picked.plans.map(p => (
          <div key={p.label} onClick={() => setPlan(p.label)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", borderRadius:7, cursor:"pointer", background: plan===p.label ? `${ACID}10` : PANEL_2, border:`1px solid ${plan===p.label ? ACID+"44" : BORDER}`, transition:"all 0.15s" }}>
           <span style={{ fontSize:12, color: plan===p.label ? ACID : TEXT }}>{p.label}</span>
           <span style={{ fontSize:12, color:MUTED, fontFamily:M }}>${p.cost}/mo</span>
          </div>
         ))}
        </div>
       </div>
      )}
      {picked.name === "Custom" && (
       <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:10, color:MUTED, fontFamily:M, letterSpacing:1.5, marginBottom:8 }}>MONTHLY COST</div>
        <div style={{ display:"flex", alignItems:"center", background:PANEL_2, border:`1px solid ${BO}`, borderRadius:7, padding:"10px 14px" }}>
         <span style={{ color:MUTED, marginRight:6 }}>$</span>
         <input type="number" value={customCost} onChange={e => setCustomCost(e.target.value)} placeholder="0" style={{ background:"transparent", border:"none", color:TEXT, fontSize:13, fontFamily:M, outline:"none", width:"100%" }} />
         <span style={{ color:MUTED, fontSize:11 }}>/mo</span>
        </div>
       </div>
      )}
      <div style={{ marginBottom:16 }}>
       <div style={{ fontSize:10, color:MUTED, fontFamily:M, letterSpacing:1.5, marginBottom:8 }}>BILLING CYCLE</div>
       <div style={{ display:"flex", gap:8 }}>
        {["monthly","annual"].map(b => (
         <div key={b} onClick={() => setBillingCycle(b)} style={{ flex:1, padding:"10px", borderRadius:7, cursor:"pointer", textAlign:"center", background: billingCycle===b ? `${ACID}10` : PANEL_2, border:`1px solid ${billingCycle===b ? ACID+"44" : BORDER}`, fontSize:12, color: billingCycle===b ? ACID : TEXT, textTransform:"capitalize" }}>{b}</div>
        ))}
       </div>
      </div>
      <div style={{ marginBottom:20 }}>
       <div style={{ fontSize:10, color:MUTED, fontFamily:M, letterSpacing:1.5, marginBottom:8 }}>PROJECT (OPTIONAL)</div>
       <input value={project} onChange={e => setProject(e.target.value)} placeholder="e.g. My App, Client Work, Personal" style={{ width:"100%", background:PANEL_2, border:`1px solid ${BO}`, borderRadius:7, padding:"10px 14px", color:TEXT, fontSize:13, fontFamily:SA, outline:"none" }} />
      </div>
      {cost > 0 && (
       <div style={{ background:`${ACID}08`, border:`1px solid ${ACID}25`, borderRadius:8, padding:"12px 16px", marginBottom:20, display:"flex", justifyContent:"space-between" }}>
        <div>
         <div style={{ fontSize:10, color:MUTED, fontFamily:M, marginBottom:4 }}>MONTHLY</div>
         <div style={{ fontSize:20, fontWeight:800, color:ACID, fontFamily:M }}>${cost}</div>
        </div>
        <div style={{ textAlign:"right" }}>
         <div style={{ fontSize:10, color:MUTED, fontFamily:M, marginBottom:4 }}>ANNUAL</div>
         <div style={{ fontSize:20, fontWeight:800, color:WARN, fontFamily:M }}>${cost * 12}</div>
        </div>
       </div>
      )}
      <div style={{ display:"flex", gap:10 }}>
       <button onClick={() => setStep(1)} style={{ flex:1, background:"transparent", border:`1px solid ${BO}`, color:MUTED, padding:"11px", borderRadius:7, fontSize:13, cursor:"pointer", fontFamily:SA }}>← Back</button>
       <button onClick={handleAdd} disabled={!plan && picked.name !== "Custom"} style={{ flex:2, background:ACID, border:"none", color:BG, padding:"11px", borderRadius:7, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:SA, boxShadow:`0 0 16px ${ACID}44`, opacity:(!plan && picked.name !== "Custom") ? 0.4 : 1 }}>
        Add to Stack →
       </button>
      </div>
     </div>
    )}
   </div>
  </div>
 );
}
const SpendTip = ({ active, payload, label }) => {
 if (!active || !payload?.length) return null;
 const v = payload.find(p => p.value != null);
 if (!v) return null;
 return (
  <div style={{ background:PANEL_2, border:`1px solid ${BO}`, padding:"8px 14px", borderRadius:6, fontFamily:M }}>
   <div style={{ color:MUTED, fontSize:10, marginBottom:3 }}>{label}</div>
   <div style={{ color: v.name === "forecast" ? MUTED : ACID, fontSize:13 }}>${v.value}/mo{v.name==="forecast"?" ·proj":""}</div>
  </div>
 );
};
const ScoreTip = ({ active, payload, label }) => {
 if (!active || !payload?.length) return null;
 return (
  <div style={{ background:PANEL_2, border:`1px solid ${BO}`, padding:"8px 14px", borderRadius:6, fontFamily:M }}>
   <div style={{ color:MUTED, fontSize:10, marginBottom:3 }}>{label}</div>
   <div style={{ color:ACID, fontSize:13 }}>{payload[0].value}</div>
  </div>
 );
};
function StackTab({ analyzedTools, overlapIds, overlapDetails, deadTools, totalSpend, overlapCost, healthScore, healthColor, onRemove, onAdd, severityColor }) {
 const [filter, setFilter]     = useState("ALL");
 const [sortBy, setSortBy]     = useState("cost");
 const [sortDir, setSortDir]   = useState("desc");
 const [groupBy, setGroupBy]   = useState(false);
 const [editingCost, setEditingCost] = useState(null);
 const filters = ["ALL", "ACTIVE", "OVERLAP", "INACTIVE"];
 const filtered = analyzedTools.filter(t => {
  if (filter === "ACTIVE")   return !t.overlap && (t.daysAgo||0) <= 20;
  if (filter === "OVERLAP")  return t.overlap;
  if (filter === "INACTIVE") return (t.daysAgo||0) > 20;
  return true;
 });
 const sorted = [...filtered].sort((a, b) => {
  let av, bv;
  if (sortBy === "cost")    { av = a.cost;    bv = b.cost; }
  if (sortBy === "name")    { av = a.name;    bv = b.name; }
  if (sortBy === "roi")     { av = a.roi||0;  bv = b.roi||0; }
  if (sortBy === "daysAgo") { av = a.daysAgo||0; bv = b.daysAgo||0; }
  if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  return sortDir === "asc" ? av - bv : bv - av;
 });
 const toggleSort = (col) => {
  if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
  else { setSortBy(col); setSortDir("desc"); }
 };
 const SortIcon = ({ col }) => {
  if (sortBy !== col) return <span style={{ color:"#2a3035", marginLeft:4 }}>↕</span>;
  return <span style={{ color:ACID, marginLeft:4 }}>{sortDir === "desc" ? "↓" : "↑"}</span>;
 };
 const statusBadge = (t) => {
  const isInactive = (t.daysAgo||0) > 20;
  if (t.overlap)   return { label:"OVERLAP",  color:WARN,  bg:`${WARN}12`  };
  if (isInactive)  return { label:"INACTIVE", color:MUTED, bg:`${MUTED}10` };
  return               { label:"ACTIVE",   color:GREEN, bg:`${GREEN}10` };
 };
 const categories = [...new Set(sorted.map(t => t.cat))];
 const renderRow = (t) => {
  const badge = statusBadge(t);
  return (
   <div key={t.id||t.name} style={{ display:"grid", gridTemplateColumns:isMobile?"1fr auto auto":"2fr 100px 120px 90px 90px 90px 90px 80px", alignItems:"center", padding:"12px 16px", borderBottom:`1px solid ${BORDER}`, background: t.overlap ? `${WARN}04` : "transparent", transition:"background 0.15s", }}
    onMouseEnter={e => e.currentTarget.style.background = t.overlap ? `${WARN}08` : `${ACID}04`}
    onMouseLeave={e => e.currentTarget.style.background = t.overlap ? `${WARN}04` : "transparent"}
   >
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
     <div style={{ width:28, height:28, borderRadius:6, background:PANEL_2, border:`1px solid ${BO}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:t.overlap?WARN:ACID, flexShrink:0 }}>{t.icon||"◆"}</div>
     <div>
      <div style={{ fontSize:12, fontWeight:600, color:TEXT }}>{t.name}</div>
      <div style={{ fontSize:10, color:MUTED }}>{t.project||"—"}</div>
     </div>
    </div>
    <div style={{ fontSize:10, color:MUTED, fontFamily:M }}>{t.cat}</div>
    <div>
     <span style={{ fontSize:9, color:badge.color, background:badge.bg, padding:"3px 8px", borderRadius:3, letterSpacing:1.5, fontFamily:M, fontWeight:700 }}>{badge.label}</span>
    </div>
    <div style={{ fontSize:12, color:t.overlap?WARN:TEXT, fontFamily:M, fontWeight:600 }}>${t.cost}/mo</div>
    <div style={{ fontSize:11, color:MUTED, fontFamily:M }}>${t.cost*12}/yr</div>
    <div style={{ fontSize:12, color: (t.roi||0)>0?GREEN:MUTED, fontFamily:M }}>{(t.roi||0)>0?`$${t.roi}/mo`:"—"}</div>
    <div style={{ fontSize:10, color:(t.daysAgo||0)>14?WARN:MUTED }}>
     {(t.daysAgo||0) === 0 ? "Today" : (t.daysAgo||0) === 1 ? "Yesterday" : `${t.daysAgo}d ago`}
    </div>
    <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
     <button
      onClick={() => onRemove(t.id||t.name)}
      style={{ background:"transparent", border:`1px solid ${BO}`, color:MUTED, padding:"4px 10px", borderRadius:4, fontSize:10, cursor:"pointer", fontFamily:M, transition:"all 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor="#ff4444"; e.currentTarget.style.color="#ff4444"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor=BORDER; e.currentTarget.style.color=MUTED; }}
     >remove</button>
    </div>
   </div>
  );
 };
 return (
  <div>
   <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)", gap:12, marginBottom:20 }}>
    {[
     { label:"TOTAL TOOLS",     value:`${analyzedTools.length}`,      sub:"in your stack",               color:TEXT  },
     { label:"MONTHLY BURN",    value:`$${totalSpend}/mo`,             sub:`$${totalSpend*12}/yr`,         color:WARN  },
     { label:"OVERLAP WASTE",   value: overlapCost>0?`$${overlapCost}/mo`:"None", sub: overlapDetails.length>0?`${overlapDetails.length} conflict${overlapDetails.length>1?"s":""}` : "stack clean", color:overlapCost>0?WARN:GREEN },
     { label:"STACK HEALTH",    value:`${healthScore}%`,               sub:"efficiency score",            color:healthColor },
    ].map(s => (
     <div key={s.label} style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:8, padding:"14px 18px" }}>
      <div style={{ fontSize:9, color:MUTED, letterSpacing:2, marginBottom:6, fontFamily:M }}>{s.label}</div>
      <div style={{ fontSize:20, fontWeight:800, color:s.color, fontFamily:M }}>{s.value}</div>
      <div style={{ fontSize:9, color:MUTED, marginTop:4 }}>{s.sub}</div>
     </div>
    ))}
   </div>
   {overlapDetails.length > 0 && (
    <div style={{ background:`${WARN}0a`, border:`1px solid ${WARN}30`, borderRadius:8, padding:"12px 18px", marginBottom:16 }}>
     <div style={{ fontSize:10, color:WARN, fontFamily:M, letterSpacing:1.5, fontWeight:700, marginBottom:8 }}>⚠ OVERLAP CONFLICTS DETECTED</div>
     <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      {overlapDetails.map((od,i) => (
       <div key={i} style={{ display:"flex", alignItems:"center", gap:12, fontSize:11 }}>
        <span style={{ color:WARN, fontFamily:M, fontWeight:600 }}>{od.label}:</span>
        <span style={{ color:MUTED }}>{od.tools.join(" + ")} are doing the same job</span>
        <span style={{ color:WARN, fontFamily:M, marginLeft:"auto" }}>~${Math.round(od.cost*0.5)}/mo wasted</span>
       </div>
      ))}
     </div>
    </div>
   )}
   <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:0 }}>
    <div style={{ display:"flex", gap:4 }}>
     {filters.map(f => {
      const counts = { ALL: analyzedTools.length, ACTIVE: analyzedTools.filter(t=>!t.overlap&&(t.daysAgo||0)<=20).length, OVERLAP: analyzedTools.filter(t=>t.overlap).length, INACTIVE: analyzedTools.filter(t=>(t.daysAgo||0)>20).length };
      const active = filter === f;
      return (
       <button key={f} onClick={() => setFilter(f)} style={{ background: active ? ACID : "transparent", color: active ? BG : MUTED, border: `1px solid ${active ? ACID : BORDER}`, padding:"5px 12px", borderRadius:4, fontSize:10, letterSpacing:1.5, cursor:"pointer", fontFamily:M, fontWeight: active?700:400, display:"flex", alignItems:"center", gap:6, }}>
        {f}
        <span style={{ fontSize:9, opacity:0.7 }}>{counts[f]}</span>
       </button>
      );
     })}
    </div>
    <button onClick={() => setGroupBy(g=>!g)} style={{ background:"transparent", border:`1px solid ${groupBy?ACID:BORDER}`, color:groupBy?ACID:MUTED, padding:"5px 14px", borderRadius:4, fontSize:10, letterSpacing:1.5, cursor:"pointer", fontFamily:M }}>
     {groupBy ? "GROUPED ✓" : "GROUP BY CATEGORY"}
    </button>
   </div>
   <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:8, overflow:"hidden", marginTop:10 }}>
    <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr auto auto":"2fr 100px 120px 90px 90px 90px 90px 80px", padding:"10px 16px", borderBottom:`1px solid ${BORDER}`, background:PANEL_2 }}>
     {[
      { label:"TOOL",      col:"name"   },
      { label:"CATEGORY",  col:null      },
      { label:"STATUS",    col:null      },
      { label:"MONTHLY",   col:"cost"   },
      { label:"ANNUAL",    col:null      },
      { label:"ROI/MO",    col:"roi"    },
      { label:"LAST USED", col:"daysAgo"},
      { label:"",          col:null      },
     ].map(({label,col}) => (
      <div key={label} onClick={() => col && toggleSort(col)} style={{ fontSize:9, color: sortBy===col?ACID:MUTED, letterSpacing:2, fontFamily:M, cursor:col?"pointer":"default", display:"flex", alignItems:"center", userSelect:"none" }}>
       {label}{col && <SortIcon col={col}/>}
      </div>
     ))}
    </div>
    {sorted.length === 0 ? (
     <div style={{ padding:"40px 24px", textAlign:"center", color:MUTED, fontSize:12 }}>
      No tools match this filter.
      <span onClick={onAdd} style={{ color:ACID, cursor:"pointer", marginLeft:8 }}>+ Add one</span>
     </div>
    ) : groupBy ? (
     categories.map(cat => {
      const catTools = sorted.filter(t => t.cat === cat);
      if (!catTools.length) return null;
      const catSpend = catTools.reduce((s,t) => s+t.cost, 0);
      return (
       <div key={cat}>
        <div style={{ padding:"8px 16px", background:`${ACID}06`, borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
         <span style={{ fontSize:9, color:ACID, letterSpacing:2, fontFamily:M, fontWeight:700 }}>{cat.toUpperCase()}</span>
         <span style={{ fontSize:9, color:MUTED, fontFamily:M }}>${catSpend}/mo · {catTools.length} tool{catTools.length>1?"s":""}</span>
        </div>
        {catTools.map(renderRow)}
       </div>
      );
     })
    ) : sorted.map(renderRow)}
    {sorted.length > 0 && (
     <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr auto auto":"2fr 100px 120px 90px 90px 90px 90px 80px", padding:"12px 16px", borderTop:`1px solid ${BORDER}`, background:PANEL_2 }}>
      <div style={{ fontSize:10, color:MUTED, fontFamily:M, gridColumn:"1/3" }}>{sorted.length} tool{sorted.length!==1?"s":""} shown</div>
      <div/>
      <div style={{ fontSize:12, fontWeight:700, color:WARN, fontFamily:M }}>${sorted.reduce((s,t)=>s+t.cost,0)}/mo</div>
      <div style={{ fontSize:11, color:MUTED, fontFamily:M }}>${sorted.reduce((s,t)=>s+t.cost,0)*12}/yr</div>
      <div style={{ fontSize:12, color:GREEN, fontFamily:M }}>{sorted.reduce((s,t)=>s+(t.roi||0),0)>0?`$${sorted.reduce((s,t)=>s+(t.roi||0),0)}/mo`:"—"}</div>
      <div/>
      <div/>
     </div>
    )}
   </div>
   {analyzedTools.length > 0 && (
    <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"20px", marginTop:14 }}>
     <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:M, marginBottom:4 }}>USAGE HEATMAP</div>
      <div style={{ fontSize:11, color:"#3a4448" }}>Tool activity over the last 12 weeks — darker = more active</div>
     </div>
     <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, paddingLeft:130 }}>
       {["12w ago","10w","8w","6w","4w","2w","Now"].map((l,i) => (
        <div key={i} style={{ fontSize:8, color:MUTED, fontFamily:M, flex:1, textAlign:"center" }}>{l}</div>
       ))}
      </div>
      {analyzedTools.map(tool => {
       const inactive = (tool.daysAgo||0);
       const weeks = Array.from({length:12}, (_,wi) => {
        const weeksAgo = 11 - wi;
        const daysThisWeek = weeksAgo * 7;
        if (inactive > daysThisWeek + 7) return 0;        // fully inactive
        if (inactive > daysThisWeek) return 1;             // going inactive
        if (tool.overlap) return wi > 8 ? 3 : 2;           // overlap tools used moderately
        return Math.random() > 0.25 ? 3 : 2;               // active tools
       });
       const activityColor = (level) => {
        if (level === 0) return "#131a1d";
        if (level === 1) return "#1a2e22";
        if (level === 2) return `${ACID}55`;
        return ACID;
       };
       return (
        <div key={tool.id||tool.name} style={{ display:"flex", alignItems:"center", gap:8 }}>
         <div style={{ width:122, display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
          <span style={{ fontSize:10, color:tool.overlap?WARN:(inactive>20?MUTED:ACID) }}>{tool.icon||"◆"}</span>
          <span style={{ fontSize:10, color:(inactive>20)?MUTED:TEXT, fontFamily:M, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:100 }}>{tool.name}</span>
         </div>
         <div style={{ display:"flex", gap:2, flex:1 }}>
          {weeks.map((level, wi) => (
           <div key={wi} style={{ flex:1, aspectRatio:"1", borderRadius:2, background:activityColor(level), minWidth:8, minHeight:8, transition:"background 0.2s" }}
            title={`${tool.name} · ${11-wi} weeks ago · ${level===0?"no activity":level===1?"low":level===2?"moderate":"active"}`}
           />
          ))}
         </div>
         <div style={{ width:50, textAlign:"right", fontSize:9, color:inactive>20?WARN:MUTED, fontFamily:M, flexShrink:0 }}>
          {inactive > 20 ? `${inactive}d idle` : inactive === 0 ? "today" : `${inactive}d ago`}
         </div>
        </div>
       );
      })}
      <div style={{ display:"flex", alignItems:"center", gap:6, paddingLeft:130, marginTop:4 }}>
       <span style={{ fontSize:9, color:MUTED }}>Less</span>
       {[0,1,2,3].map(l => <div key={l} style={{ width:10, height:10, borderRadius:2, background:["#131a1d","#1a2e22",`${ACID}55`,ACID][l] }}/>)}
       <span style={{ fontSize:9, color:MUTED }}>More</span>
      </div>
     </div>
    </div>
   )}
   {analyzedTools.length > 0 && (() => {
    const toolNames = analyzedTools.map(t => t.name.toLowerCase());
    const hasObservability = toolNames.some(n => ["posthog","mixpanel","amplitude","datadog","sentry","bugsnag"].some(o => n.includes(o)));
    const hasBackup        = toolNames.some(n => ["backblaze","aws","s3","r2","cloudflare"].some(o => n.includes(o)));
    const aiProviders      = analyzedTools.filter(t => ["AI Core","AI Chat","AI Code"].includes(t.cat));
    const singleAIRisk     = aiProviders.length === 1;
    const hostingTools     = analyzedTools.filter(t => t.cat === "Hosting");
    const vendorLock       = hostingTools.length >= 1 && analyzedTools.length >= 4;
    const risks = [
     !hasObservability && analyzedTools.length >= 3 && { severity:"high",   icon:"◎", title:"No observability tooling detected", body:"You have no error tracking or analytics. You're flying blind — issues won't be caught until users complain.", action:"Consider: PostHog, Sentry, or Mixpanel" },
     singleAIRisk && aiProviders.length > 0 && { severity:"medium", icon:"◈", title:"Single AI provider dependency", body:`All AI routing depends on ${aiProviders[0].name}. A pricing change or outage directly impacts your product.`, action:"Consider: OpenRouter as an abstraction layer" },
     !hasBackup && analyzedTools.some(t=>t.cat==="Database") && { severity:"medium", icon:"▦", title:"No backup storage detected", body:"Your database has no detected backup provider. Data loss risk is unmitigated.", action:"Consider: Backblaze B2 or Cloudflare R2" },
     vendorLock && { severity:"low",    icon:"◉", title:"Infrastructure concentration risk", body:`${hostingTools.map(t=>t.name).join(" + ")} hosts critical services. Downtime cascades across your stack.`, action:"Review: failover strategy for critical paths" },
    ].filter(Boolean);
    if (risks.length === 0) return (
     <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"20px", marginTop:14 }}>
      <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:M, marginBottom:12 }}>STACK RISK SCORE</div>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
       <span style={{ color:GREEN, fontSize:20 }}>◆</span>
       <div>
        <div style={{ fontSize:13, fontWeight:600, color:GREEN }}>No critical risks detected</div>
        <div style={{ fontSize:10, color:MUTED, marginTop:2 }}>Your stack looks resilient based on current tooling</div>
       </div>
      </div>
     </div>
    );
    const riskScore = Math.max(0, 100 - risks.filter(r=>r.severity==="high").length*30 - risks.filter(r=>r.severity==="medium").length*15 - risks.filter(r=>r.severity==="low").length*5);
    const riskColor = riskScore >= 75 ? GREEN : riskScore >= 50 ? WARN : "#ff4444";
    return (
     <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"20px", marginTop:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
       <div>
        <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:M, marginBottom:4 }}>STACK RISK SCORE</div>
        <div style={{ fontSize:11, color:"#3a4448" }}>Infrastructure dependencies, single points of failure, and vendor risk</div>
       </div>
       <div style={{ textAlign:"right" }}>
        <div style={{ fontSize:28, fontWeight:800, color:riskColor, fontFamily:M, lineHeight:1 }}>{riskScore}</div>
        <div style={{ fontSize:9, color:MUTED, marginTop:2 }}>{riskScore>=75?"LOW RISK":riskScore>=50?"MODERATE":"HIGH RISK"}</div>
       </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
       {risks.map((r,i) => (
        <div key={i} style={{ background:PANEL_2, border:`1px solid ${r.severity==="high"?`${WARN}30`:r.severity==="medium"?`${BLUE}25`:BORDER}`, borderRadius:8, padding:"14px 16px" }}>
         <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
          <span style={{ color:severityColor(r.severity), fontSize:13 }}>{r.icon}</span>
          <div style={{ fontSize:11, fontWeight:700, color:r.severity==="high"?WARN:r.severity==="medium"?BLUE:MUTED, letterSpacing:0.5 }}>{r.title}</div>
          <span style={{ marginLeft:"auto", fontSize:8, color:severityColor(r.severity), fontFamily:M, letterSpacing:1.5, border:`1px solid ${severityColor(r.severity)}40`, padding:"2px 7px", borderRadius:3 }}>{r.severity.toUpperCase()}</span>
         </div>
         <div style={{ fontSize:10, color:MUTED, lineHeight:1.6, marginBottom:6 }}>{r.body}</div>
         <div style={{ fontSize:9, color:ACID, fontFamily:M }}>→ {r.action}</div>
        </div>
       ))}
      </div>
     </div>
    );
   })()}
  </div>
 );
}
function InsightsTab({ analyzedTools=[], overlapDetails=[], deadTools=[], totalSpend=0, overlapCost=0, healthScore=0 }) {
 const REPLACEMENTS = {
  "AI Chat": {
   single: [
    { replace:["ChatGPT"], with:"Claude API", saving: t => t.cost, reason:"Claude API is cheaper per token for most workloads and avoids Plus subscription costs." },
    { replace:["Perplexity"], with:"Claude API + web_search tool", saving: t => Math.round(t.cost*0.6), reason:"Perplexity's search capability can be replicated via Claude with web search at a fraction of the cost." },
   ],
   multi: [
    { detect:["Claude API","ChatGPT"],    with:"OpenRouter",  saving: costs => Math.round(costs*0.45), reason:"OpenRouter routes between Claude, GPT-4, and Gemini dynamically. One subscription, best model per task, ~45% cheaper." },
    { detect:["Claude API","Anthropic API"], with:"Claude API only", saving: costs => Math.round(costs*0.5), reason:"Claude API and Anthropic API are the same service. You're paying twice for identical access." },
    { detect:["ChatGPT","Perplexity"],    with:"ChatGPT + web browsing", saving: costs => Math.round(costs*0.5), reason:"ChatGPT Plus includes web search. Perplexity is redundant if you're already paying for ChatGPT." },
   ],
  },
  "AI Code": {
   multi: [
    { detect:["Cursor","GitHub Copilot"], with:"Cursor only",  saving: costs => Math.round(costs*0.4), reason:"Cursor includes its own completion engine. Running GitHub Copilot alongside is redundant — same functionality, double the cost." },
    { detect:["Cursor","Replit"],         with:"Cursor only",  saving: costs => Math.round(costs*0.5), reason:"Cursor handles local dev. Replit adds cost without adding workflow value for most solo builders." },
    { detect:["Cursor","Lovable"],        with:"Cursor + v0",  saving: costs => Math.round(costs*0.3), reason:"Lovable and Cursor overlap heavily on AI-assisted code generation. v0 by Vercel is free for UI scaffolding." },
   ],
  },
  "Hosting": {
   multi: [
    { detect:["Vercel","Netlify"],   with:"Vercel only", saving: costs => Math.round(costs*0.5), reason:"Vercel and Netlify are functionally identical for most builders. Consolidate to one." },
    { detect:["Vercel","Railway"],   with:"Vercel + Railway", saving: () => 0, reason:"This is a valid split: Vercel for frontend, Railway for backend services. No redundancy detected." },
   ],
  },
  "Analytics": {
   multi: [
    { detect:["PostHog","Mixpanel"],   with:"PostHog only",  saving: costs => Math.round(costs*0.6), reason:"PostHog covers product analytics, session replay, and feature flags. Mixpanel is redundant for most solo builders." },
    { detect:["PostHog","Amplitude"],  with:"PostHog only",  saving: costs => Math.round(costs*0.6), reason:"PostHog and Amplitude overlap heavily. PostHog's free tier handles most indie hacker needs." },
   ],
  },
  "Automation": {
   multi: [
    { detect:["Zapier","Make"],  with:"Make only",  saving: costs => Math.round(costs*0.5), reason:"Make (formerly Integromat) is ~60% cheaper than Zapier for equivalent automation complexity." },
    { detect:["Zapier","n8n"],   with:"n8n (self-hosted)", saving: costs => Math.round(costs*0.8), reason:"n8n self-hosted on Railway or Fly.io eliminates automation costs entirely for most workflows." },
   ],
  },
 };
 const toolNames  = analyzedTools.map(t => t.name);
 const recs = [];
 overlapDetails.forEach(od => {
  const catRules = REPLACEMENTS[od.label];
  if (!catRules) return;
  (catRules.multi || []).forEach(rule => {
   const matched = rule.detect.filter(d => toolNames.some(n => n.toLowerCase().includes(d.toLowerCase())));
   if (matched.length === rule.detect.length) {
    const matchedTools = analyzedTools.filter(t => rule.detect.some(d => t.name.toLowerCase().includes(d.toLowerCase())));
    const totalCost = matchedTools.reduce((s,t) => s+t.cost, 0);
    const saving = rule.saving(totalCost);
    if (saving > 0) recs.push({
     id: `multi_${rule.detect.join("_")}`,
     type: "consolidate",
     priority: saving >= 50 ? "high" : saving >= 20 ? "medium" : "low",
     title: `Replace ${rule.detect.join(" + ")} with ${rule.with}`,
     saving,
     currentCost: totalCost,
     reason: rule.reason,
     tools: rule.detect,
     replaceWith: rule.with,
     tag: "CONSOLIDATE",
     tagColor: WARN,
    });
   }
  });
 });
 deadTools.forEach(t => {
  recs.push({
   id: `dead_${t.name}`,
   type: "pause",
   priority: "medium",
   title: `Pause ${t.name}`,
   saving: t.cost,
   currentCost: t.cost,
   reason: `${t.name} hasn't been used in ${t.daysAgo||21}+ days. Pausing saves $${t.cost}/mo ($${t.cost*12}/yr) with zero workflow impact.`,
   tools: [t.name],
   replaceWith: null,
   tag: "PAUSE",
   tagColor: MUTED,
  });
 });
 const hasObservability = toolNames.some(n => ["posthog","mixpanel","sentry","datadog","amplitude"].some(o => n.toLowerCase().includes(o)));
 const hasEmail         = toolNames.some(n => ["resend","mailgun","sendgrid","postmark"].some(o => n.toLowerCase().includes(o)));
 const hasAuth          = toolNames.some(n => ["clerk","auth0","supabase","firebase"].some(o => n.toLowerCase().includes(o)));
 const hasAI            = analyzedTools.some(t => ["AI Core","AI Chat","AI Code"].includes(t.cat));
 if (!hasObservability && analyzedTools.length >= 3) recs.push({
  id: "add_observability", type: "add", priority: "high",
  title: "Add observability to your stack",
  saving: 0, currentCost: 0,
  reason: "No error tracking or analytics detected. PostHog free tier handles product analytics + session replay + feature flags for most indie products.",
  tools: [], replaceWith: "PostHog (free tier)",
  tag: "ADD", tagColor: ACID,
 });
 if (!hasEmail && hasAI && analyzedTools.length >= 3) recs.push({
  id: "add_email", type: "add", priority: "low",
  title: "Add a transactional email provider",
  saving: 0, currentCost: 0,
  reason: "No email provider detected. Resend offers 3,000 free emails/mo and is the current default for most indie stacks.",
  tools: [], replaceWith: "Resend (free tier)",
  tag: "ADD", tagColor: ACID,
 });
 const totalROI = analyzedTools.reduce((s,t) => s+(t.roi||0), 0);
 if (totalSpend > 150 && totalROI === 0) recs.push({
  id: "roi_warning", type: "optimize", priority: "high",
  title: "High spend with no attributed revenue",
  saving: Math.round(totalSpend * 0.3),
  currentCost: totalSpend,
  reason: `You're spending $${totalSpend}/mo with $0 revenue attributed. Tag tools to projects or cut the lowest-value tools to bring spend down by ~30%.`,
  tools: [], replaceWith: null,
  tag: "OPTIMIZE", tagColor: WARN,
 });
 const priorityOrder = { high:0, medium:1, low:2 };
 recs.sort((a,b) => priorityOrder[a.priority] - priorityOrder[b.priority] || b.saving - a.saving);
 const totalSavings = recs.reduce((s,r) => s+(r.saving||0), 0);
 return (
  <div>
   <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr 1fr", gap:12, marginBottom:20 }}>
    <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"16px 20px" }}>
     <div style={{ fontSize:9, color:MUTED, letterSpacing:2, fontFamily:M, marginBottom:6 }}>RECOMMENDATIONS</div>
     <div style={{ fontSize:28, fontWeight:800, color:TEXT, fontFamily:M }}>{recs.length}</div>
     <div style={{ fontSize:10, color:MUTED, marginTop:4 }}>{recs.filter(r=>r.priority==="high").length} high priority</div>
    </div>
    <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"16px 20px" }}>
     <div style={{ fontSize:9, color:MUTED, letterSpacing:2, fontFamily:M, marginBottom:6 }}>TOTAL SAVINGS AVAILABLE</div>
     <div style={{ fontSize:28, fontWeight:800, color:totalSavings>0?GREEN:MUTED, fontFamily:M }}>${totalSavings}/mo</div>
     <div style={{ fontSize:10, color:MUTED, marginTop:4 }}>${totalSavings*12}/yr if actioned</div>
    </div>
    <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"16px 20px" }}>
     <div style={{ fontSize:9, color:MUTED, letterSpacing:2, fontFamily:M, marginBottom:6 }}>OPTIMIZED SPEND</div>
     <div style={{ fontSize:28, fontWeight:800, color:ACID, fontFamily:M }}>${Math.max(0, totalSpend - totalSavings)}/mo</div>
     <div style={{ fontSize:10, color:MUTED, marginTop:4 }}>after all actions applied</div>
    </div>
   </div>
   {recs.length === 0 ? (
    <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"48px 24px", textAlign:"center" }}>
     <div style={{ fontSize:28, marginBottom:12 }}>◆</div>
     <div style={{ fontSize:15, fontWeight:700, color:TEXT, marginBottom:8 }}>Your stack is fully optimized</div>
     <div style={{ fontSize:12, color:MUTED }}>No overlaps, no dead weight, no missing critical tooling. Nice work.</div>
    </div>
   ) : (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
     {recs.map(rec => (
      <div key={rec.id} style={{ background:PANEL, border:`1px solid ${rec.priority==="high"?`${WARN}35`:BORDER}`, borderRadius:10, padding:"20px 24px", borderLeft:`3px solid ${rec.priority==="high"?WARN:rec.priority==="medium"?BLUE:BORDER}`, }}>
       <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, flex:1 }}>
         <span style={{ fontSize:9, color:rec.tagColor, background:`${rec.tagColor}12`, border:`1px solid ${rec.tagColor}30`, padding:"3px 9px", borderRadius:3, letterSpacing:2, fontFamily:M, fontWeight:700, flexShrink:0 }}>{rec.tag}</span>
         <div style={{ fontSize:13, fontWeight:700, color:TEXT }}>{rec.title}</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0, marginLeft:16 }}>
         {rec.saving > 0 && (
          <div style={{ background:`${GREEN}10`, border:`1px solid ${GREEN}25`, borderRadius:6, padding:"6px 14px", textAlign:"center" }}>
           <div style={{ fontSize:14, fontWeight:800, color:GREEN, fontFamily:M }}>−${rec.saving}/mo</div>
           <div style={{ fontSize:9, color:GREEN, opacity:0.7 }}>−${rec.saving*12}/yr</div>
          </div>
         )}
         <span style={{ fontSize:9, color:rec.priority==="high"?WARN:rec.priority==="medium"?BLUE:MUTED, fontFamily:M, letterSpacing:1.5, border:`1px solid ${rec.priority==="high"?WARN:rec.priority==="medium"?BLUE:BORDER}40`, padding:"4px 10px", borderRadius:3 }}>{rec.priority.toUpperCase()}</span>
        </div>
       </div>
       <div style={{ fontSize:12, color:MUTED, lineHeight:1.7, marginBottom:12 }}>{rec.reason}</div>
       <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
        {rec.tools.length > 0 && (
         <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {rec.tools.map(t => (
           <span key={t} style={{ fontSize:10, color:MUTED, background:PANEL_2, border:`1px solid ${BO}`, padding:"3px 10px", borderRadius:4, fontFamily:M }}>{t}</span>
          ))}
          {rec.replaceWith && <>
           <span style={{ fontSize:11, color:MUTED }}>→</span>
           <span style={{ fontSize:10, color:ACID, background:`${ACID}10`, border:`1px solid ${ACID}25`, padding:"3px 10px", borderRadius:4, fontFamily:M }}>{rec.replaceWith}</span>
          </>}
         </div>
        )}
        {rec.type === "add" && rec.replaceWith && (
         <span style={{ fontSize:10, color:ACID, background:`${ACID}10`, border:`1px solid ${ACID}25`, padding:"3px 10px", borderRadius:4, fontFamily:M }}>→ {rec.replaceWith}</span>
        )}
        {rec.currentCost > 0 && (
         <span style={{ fontSize:10, color:MUTED, marginLeft:"auto", fontFamily:M }}>current: ${rec.currentCost}/mo</span>
        )}
       </div>
      </div>
     ))}
    </div>
   )}
   <StackAdvisor analyzedTools={analyzedTools} overlapDetails={overlapDetails} deadTools={deadTools} totalSpend={totalSpend} healthScore={healthScore} recs={recs} />
  </div>
 );
}
function StackAdvisor({ analyzedTools=[], overlapDetails=[], deadTools=[], totalSpend=0, healthScore=0, recs=[] }) {
 const [open, setOpen]         = useState(false);
 const [messages, setMessages] = useState([]);
 const [input, setInput]       = useState("");
 const [loading, setLoading]   = useState(false);
 const bottomRef               = useRef(null);
 useEffect(() => {
  if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior:"smooth" });
 }, [messages, loading]);
 const systemPrompt = [
  "You are Hektiq's AI Stack Advisor — a sharp, concise expert on developer tooling, SaaS spend optimization, and AI stack architecture.",
  "",
  "The user's current stack:",
  analyzedTools.length === 0
   ? "No tools added yet."
   : analyzedTools.map(t => `- ${t.name} ($${t.cost}/mo, category: ${t.cat}${t.overlap ? ", OVERLAP DETECTED" : ""}${(t.daysAgo||0)>20 ? `, INACTIVE ${t.daysAgo}d` : ""})`).join("\n"),
  "",
  `Stack summary:`,
  `- Total monthly spend: $${totalSpend}/mo`,
  `- Stack health score: ${healthScore}%`,
  `- Overlap conflicts: ${overlapDetails.length > 0 ? overlapDetails.map(o => `${o.tools.join(" + ")} (${o.label})`).join(", ") : "none"}`,
  `- Inactive tools: ${deadTools.length > 0 ? deadTools.map(t=>t.name).join(", ") : "none"}`,
  `- Active recommendations: ${recs.length > 0 ? recs.map(r => r.title).join("; ") : "none"}`,
  "",
  "Your job:",
  "- Answer questions about their specific stack — why something is flagged, whether to keep or cut a tool, what to replace it with",
  "- Be direct and opinionated. Don't hedge excessively.",
  "- Keep responses concise — 2–4 sentences for simple questions, slightly longer for complex ones",
  "- Use specific numbers and tool names from their stack",
  "- If they ask about a tool not in their stack, answer generally but note it's not in their current setup",
  "- Never recommend adding tools unless they ask — focus on optimizing what they have",
 ].join("\n");
 const SUGGESTED = [
  "Why is my health score this low?",
  "Should I keep both Claude API and ChatGPT?",
  "What's the biggest waste in my stack?",
  "What should I cut first?",
 ];
 const send = async (text) => {
  const userMsg = text || input.trim();
  if (!userMsg) return;
  setInput("");
  setMessages(prev => [...prev, { role:"user", content:userMsg }]);
  setLoading(true);
  try {
   const history = [...messages, { role:"user", content:userMsg }];
   const res = await fetch("/api/advisor", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
     systemPrompt,
     messages: history.map(m => ({ role:m.role, content:m.content })),
    }),
   });
   const data = await res.json();
   if (data.error) throw new Error(data.error);
   setMessages(prev => [...prev, { role:"assistant", content: data.text }]);
  } catch (err) {
   setMessages(prev => [...prev, { role:"assistant", content:`Error: ${err.message || "Unable to reach the advisor. Try again."}` }]);
  }
  setLoading(false);
 };
 return (
  <div style={{ marginTop:20 }}>
   <div
    onClick={() => setOpen(o => !o)}
    style={{ background:PANEL, border:`1px solid ${open?ACID:BORDER}`, borderRadius:open?"10px 10px 0 0":10, padding:"14px 20px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", transition:"border-color 0.2s", boxShadow:open?`0 0 20px ${ACID}18`:"none" }}
   >
    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
     <div style={{ width:32, height:32, borderRadius:8, background:`${ACID}15`, border:`1px solid ${ACID}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>◈</div>
     <div>
      <div style={{ fontSize:12, fontWeight:700, color:TEXT }}>AI Stack Advisor</div>
      <div style={{ fontSize:10, color:MUTED }}>Ask questions about your assessments and recommendations</div>
     </div>
    </div>
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
     <div style={{ display:"flex", alignItems:"center", gap:5 }}>
      <span style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:ACID, animation:"blink 2s infinite" }}/>
      <span style={{ fontSize:9, color:ACID, fontFamily:M, letterSpacing:1.5 }}>ONLINE</span>
     </div>
     <span style={{ color:MUTED, fontSize:16, transition:"transform 0.2s", display:"inline-block", transform:open?"rotate(180deg)":"none" }}>⌃</span>
    </div>
   </div>
   {open && (
    <div style={{ background:PANEL, border:`1px solid ${ACID}`, borderTop:"none", borderRadius:"0 0 10px 10px", display:"flex", flexDirection:"column" }}>
     <div style={{ height:320, overflowY:"auto", padding:"16px 20px", display:"flex", flexDirection:"column", gap:12 }}>
      {messages.length === 0 && (
       <div style={{ textAlign:"center", paddingTop:20 }}>
        <div style={{ fontSize:22, marginBottom:8 }}>◈</div>
        <div style={{ fontSize:12, color:TEXT, fontWeight:600, marginBottom:4 }}>Stack Advisor ready</div>
        <div style={{ fontSize:11, color:MUTED, marginBottom:20 }}>I know your full stack. Ask me anything.</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
         {SUGGESTED.map(s => (
          <button key={s} onClick={() => send(s)} style={{ background:PANEL_2, border:`1px solid ${BO}`, color:MUTED, padding:"7px 14px", borderRadius:20, fontSize:11, cursor:"pointer", fontFamily:SA, transition:"all 0.15s" }}
           onMouseEnter={e => { e.currentTarget.style.borderColor=ACID; e.currentTarget.style.color=ACID; }}
           onMouseLeave={e => { e.currentTarget.style.borderColor=BORDER; e.currentTarget.style.color=MUTED; }}
          >{s}</button>
         ))}
        </div>
       </div>
      )}
      {messages.map((m, i) => (
       <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", gap:8, alignItems:"flex-start" }}>
        {m.role === "assistant" && (
         <div style={{ width:24, height:24, borderRadius:6, background:`${ACID}15`, border:`1px solid ${ACID}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:ACID, flexShrink:0, marginTop:2 }}>◈</div>
        )}
        <div style={{ maxWidth:"75%", padding:"10px 14px", borderRadius: m.role==="user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: m.role==="user" ? `${ACID}15` : PANEL_2, border: `1px solid ${m.role==="user" ? `${ACID}30` : BORDER}`, fontSize:12, color:TEXT, lineHeight:1.65, whiteSpace:"pre-wrap", }}>{m.content}</div>
       </div>
      ))}
      {loading && (
       <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
        <div style={{ width:24, height:24, borderRadius:6, background:`${ACID}15`, border:`1px solid ${ACID}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:ACID, flexShrink:0, marginTop:2 }}>◈</div>
        <div style={{ background:PANEL_2, border:`1px solid ${BO}`, padding:"10px 16px", borderRadius:"12px 12px 12px 2px", display:"flex", gap:5, alignItems:"center" }}>
         {[0,1,2].map(i => <span key={i} style={{ width:5, height:5, borderRadius:"50%", background:ACID, display:"inline-block", animation:`blink 1.2s ${i*0.2}s infinite` }}/>)}
        </div>
       </div>
      )}
      <div ref={bottomRef}/>
     </div>
     <div style={{ padding:"12px 16px", borderTop:`1px solid ${BORDER}`, display:"flex", gap:10 }}>
      <input
       value={input}
       onChange={e => setInput(e.target.value)}
       onKeyDown={e => e.key==="Enter" && !e.shiftKey && send()}
       placeholder="Ask about your stack, a specific rec, or any tool…"
       style={{ flex:1, background:PANEL_2, border:`1px solid ${BO}`, borderRadius:8, padding:"10px 14px", color:TEXT, fontSize:12, fontFamily:SA, outline:"none" }}
       onFocus={e => e.target.style.borderColor=ACID}
       onBlur={e => e.target.style.borderColor=BORDER}
      />
      <button
       onClick={() => send()}
       disabled={!input.trim() || loading}
       style={{ background:input.trim()&&!loading?ACID:"#1a2326", color:input.trim()&&!loading?BG:MUTED, border:"none", borderRadius:8, padding:"10px 18px", fontSize:11, fontWeight:700, cursor:input.trim()&&!loading?"pointer":"default", fontFamily:SA, letterSpacing:1, transition:"all 0.15s", boxShadow:input.trim()&&!loading?`0 0 14px ${ACID}44`:"none" }}
      >SEND</button>
     </div>
    </div>
   )}
  </div>
 );
}
function BenchmarksTab({ analyzedTools, totalSpend, healthScore, overlapDetails, deadTools }) {
 const toolNames = analyzedTools.map(t => t.name.toLowerCase());
 const toolCount = analyzedTools.length;

 // ── PEER DATA (representative indie hacker benchmarks) ────────
 const AVG_SPEND     = 191;
 const AVG_TOOLS     = 6.4;
 const AVG_HEALTH    = 61;
 const AVG_OVERLAPS  = 1.8;
 const TOP_SPEND     = 85;
 const TOP_TOOLS     = 4;
 const TOP_HEALTH    = 88;

 // ── USER RANKINGS ─────────────────────────────────────────────
 const spendPct    = totalSpend === 0 ? 100 : Math.max(1, Math.min(99, Math.round(100 - (totalSpend / (AVG_SPEND * 2)) * 100)));
 const toolPct     = toolCount  === 0 ? 100 : Math.max(1, Math.min(99, Math.round(100 - (toolCount  / (AVG_TOOLS  * 2)) * 100)));
 const healthPct   = Math.max(1, Math.min(99, Math.round((healthScore / 100) * 99)));
 const overlapPct  = overlapDetails.length === 0 ? 95 : Math.max(1, Math.min(99, Math.round(100 - (overlapDetails.length / 4) * 80)));
 const overallRank = Math.round((spendPct + toolPct + healthPct + overlapPct) / 4);

 // ── TOOL ADOPTION DATA ────────────────────────────────────────
 const topTools = [
  { name:"Claude API",     pct:91, cat:"AI Core"  },
  { name:"Cursor",         pct:84, cat:"AI Code"  },
  { name:"Vercel",         pct:78, cat:"Hosting"  },
  { name:"Supabase",       pct:71, cat:"Database" },
  { name:"OpenRouter",     pct:63, cat:"AI Core"  },
  { name:"GitHub Copilot", pct:58, cat:"AI Code"  },
  { name:"PostHog",        pct:54, cat:"Analytics"},
  { name:"Resend",         pct:49, cat:"Email"    },
  { name:"Stripe",         pct:47, cat:"Payments" },
  { name:"ChatGPT",        pct:44, cat:"AI Chat"  },
 ];

 // ── ARCHETYPE MATCH ───────────────────────────────────────────
 const archetypes = [
  { name:"The Lean Operator",   color:GREEN,  traits:["≤4 tools","no overlaps","<$80/mo"],      match: toolCount<=4 && overlapDetails.length===0 && totalSpend<80  },
  { name:"The Solo Hacker",     color:ACID,   traits:["5–7 tools","1–2 overlaps","$80–180/mo"], match: toolCount>=5 && toolCount<=7 && totalSpend<=180              },
  { name:"The Power Builder",   color:BLUE,   traits:["8+ tools","high ROI focus",">$150/mo"],  match: toolCount>=8 && totalSpend>150                               },
  { name:"The Experimenter",    color:WARN,   traits:["high tool churn","overlaps present","varied spend"], match: overlapDetails.length>=2 || deadTools.length>=2   },
 ];
 const matched = archetypes.find(a => a.match) || archetypes[1];

 // ── CATEGORY SPEND COMPARISON ─────────────────────────────────
 const categoryAverages = [
  { cat:"AI Core",   avg:35, label:"AI / LLM APIs"       },
  { cat:"AI Code",   avg:22, label:"AI Coding Tools"      },
  { cat:"Hosting",   avg:28, label:"Hosting & Deployment" },
  { cat:"Database",  avg:24, label:"Database & Auth"      },
  { cat:"Analytics", avg:18, label:"Analytics & Tracking" },
 ];

 const rankColor = (pct) => pct >= 75 ? GREEN : pct >= 50 ? ACID : pct >= 25 ? WARN : "#ff4444";
 const rankLabel = (pct) => pct >= 75 ? "TOP TIER" : pct >= 50 ? "ABOVE AVG" : pct >= 25 ? "AVERAGE" : "BELOW AVG";

 return (
  <div>
   {/* Overall rank hero */}
   <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"28px 32px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
    <div>
     <div style={{ fontSize:9, color:MUTED, letterSpacing:2.5, fontFamily:M, marginBottom:8 }}>OVERALL EFFICIENCY RANK</div>
     <div style={{ fontSize:13, color:"#3a4448", marginBottom:6 }}>vs. indie hackers & solo founders</div>
     <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:16 }}>
      <div style={{ fontSize:56, fontWeight:800, color:rankColor(overallRank), fontFamily:M, lineHeight:1 }}>#{overallRank}</div>
      <div>
       <div style={{ fontSize:13, color:rankColor(overallRank), fontWeight:700 }}>{rankLabel(overallRank)}</div>
       <div style={{ fontSize:11, color:MUTED }}>percentile ranking</div>
      </div>
     </div>
     <button
      onClick={() => {
       const text = `My AI stack just ranked #${overallRank} (${rankLabel(overallRank)}) on @HektiqMedia\n\n$${totalSpend}/mo · ${analyzedTools.length} tools · ${healthScore}% health score\n\nCheck yours free → hektiq.com`;
       if (navigator.share) {
        navigator.share({ title:"My Hektiq Stack Rank", text });
       } else {
        navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard — paste it anywhere!"));
       }
      }}
      style={{ display:"flex", alignItems:"center", gap:8, background:`${ACID}15`, border:`1px solid ${ACID}40`, color:ACID, padding:"9px 18px", borderRadius:6, fontSize:11, cursor:"pointer", fontFamily:M, letterSpacing:1.5, fontWeight:700, transition:"all 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.background=`${ACID}25`; e.currentTarget.style.boxShadow=`0 0 14px ${ACID}33`; }}
      onMouseLeave={e => { e.currentTarget.style.background=`${ACID}15`; e.currentTarget.style.boxShadow="none"; }}
     >
      <span style={{ fontSize:13 }}>↗</span> SHARE MY RANK
     </button>
    </div>
    <div style={{ textAlign:"right" }}>
     <div style={{ fontSize:9, color:MUTED, letterSpacing:2, fontFamily:M, marginBottom:8 }}>YOUR ARCHETYPE</div>
     <div style={{ fontSize:16, fontWeight:800, color:matched.color, fontFamily:"'Syne',sans-serif", marginBottom:6 }}>{matched.name}</div>
     <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      {matched.traits.map(t => (
       <div key={t} style={{ fontSize:10, color:MUTED, background:PANEL_2, border:`1px solid ${BO}`, padding:"2px 10px", borderRadius:3, textAlign:"center" }}>{t}</div>
      ))}
     </div>
    </div>
   </div>

   {/* Rank breakdown grid */}
   <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)", gap:12, marginBottom:14 }}>
    {[
     { label:"SPEND EFFICIENCY",  value:`Top ${100-spendPct}%`,  pct:spendPct,   sub:`$${totalSpend}/mo vs $${AVG_SPEND} avg`      },
     { label:"STACK SIZE",        value:`Top ${100-toolPct}%`,   pct:toolPct,    sub:`${toolCount} tools vs ${AVG_TOOLS} avg`       },
     { label:"HEALTH SCORE",      value:`Top ${100-healthPct}%`, pct:healthPct,  sub:`${healthScore}% vs ${AVG_HEALTH}% avg`        },
     { label:"OVERLAP CONTROL",   value:`Top ${100-overlapPct}%`,pct:overlapPct, sub:`${overlapDetails.length} conflicts vs ${AVG_OVERLAPS} avg` },
    ].map(s => (
     <div key={s.label} style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:8, padding:"16px" }}>
      <div style={{ fontSize:9, color:MUTED, letterSpacing:2, fontFamily:M, marginBottom:8 }}>{s.label}</div>
      <div style={{ fontSize:20, fontWeight:800, color:rankColor(s.pct), fontFamily:M, marginBottom:4 }}>{s.value}</div>
      <div style={{ height:3, background:"#1a2022", borderRadius:2, marginBottom:6 }}>
       <div style={{ width:`${s.pct}%`, height:"100%", background:`linear-gradient(90deg,${rankColor(s.pct)}88,${rankColor(s.pct)})`, borderRadius:2, transition:"width 1s" }}/>
      </div>
      <div style={{ fontSize:10, color:MUTED }}>{s.sub}</div>
     </div>
    ))}
   </div>

   {/* You vs average vs top */}
   <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"20px 24px", marginBottom:14 }}>
    <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:M, marginBottom:16 }}>HOW YOU COMPARE</div>
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
     {[
      { label:"Monthly spend",  yours:totalSpend,   avg:AVG_SPEND,  top:TOP_SPEND,  prefix:"$", suffix:"/mo" },
      { label:"Tools in stack", yours:toolCount,    avg:AVG_TOOLS,  top:TOP_TOOLS,  prefix:"",  suffix:" tools" },
      { label:"Health score",   yours:healthScore,  avg:AVG_HEALTH, top:TOP_HEALTH, prefix:"",  suffix:"%" },
     ].map(row => {
      const max = Math.max(row.yours, row.avg, row.top) * 1.2 || 1;
      return (
       <div key={row.label}>
        <div style={{ fontSize:11, color:MUTED, marginBottom:8 }}>{row.label}</div>
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
         {[
          { label:"You",     value:row.yours, color:ACID  },
          { label:"Average", value:row.avg,   color:MUTED },
          { label:"Top 10%", value:row.top,   color:GREEN },
         ].map(bar => (
          <div key={bar.label} style={{ display:"flex", alignItems:"center", gap:10 }}>
           <div style={{ width:52, fontSize:9, color:bar.color, fontFamily:M, letterSpacing:1 }}>{bar.label}</div>
           <div style={{ flex:1, height:6, background:"#1a2022", borderRadius:3 }}>
            <div style={{ width:`${(bar.value/max)*100}%`, height:"100%", background:bar.color, borderRadius:3, transition:"width 1s", opacity:0.85 }}/>
           </div>
           <div style={{ width:60, fontSize:11, color:bar.color, fontFamily:M, textAlign:"right" }}>{row.prefix}{bar.value}{row.suffix}</div>
          </div>
         ))}
        </div>
       </div>
      );
     })}
    </div>
   </div>

   {/* Tool adoption */}
   <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"20px 24px", marginBottom:14 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
     <div>
      <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:M, marginBottom:4 }}>TOP TOOLS AMONG PROFITABLE BUILDERS</div>
      <div style={{ fontSize:11, color:"#3a4448" }}>Tools highlighted in green are in your current stack</div>
     </div>
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
     {topTools.map(t => {
      const inStack = toolNames.some(n => n.includes(t.name.toLowerCase().split(" ")[0]));
      return (
       <div key={t.name} style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:120, fontSize:11, color:inStack?GREEN:MUTED, fontWeight:inStack?600:400, display:"flex", alignItems:"center", gap:6 }}>
         {inStack && <span style={{ color:GREEN, fontSize:9 }}>✓</span>}
         {t.name}
        </div>
        <div style={{ flex:1, height:4, background:"#1a2022", borderRadius:2 }}>
         <div style={{ width:`${t.pct}%`, height:"100%", background:inStack?`linear-gradient(90deg,${GREEN}88,${GREEN})`:`linear-gradient(90deg,${ACID_S}44,${ACID}55)`, borderRadius:2 }}/>
        </div>
        <div style={{ width:32, fontSize:10, color:inStack?GREEN:ACID, fontFamily:M, textAlign:"right" }}>{t.pct}%</div>
        <div style={{ width:60, fontSize:9, color:MUTED, fontFamily:M }}>{t.cat}</div>
       </div>
      );
     })}
    </div>
   </div>

   {/* All archetypes */}
   <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"20px 24px" }}>
    <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:M, marginBottom:16 }}>BUILDER ARCHETYPES</div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
     {archetypes.map(a => (
      <div key={a.name} style={{ background:PANEL_2, border:`1px solid ${a===matched?a.color+55:BO}`, borderRadius:8, padding:"16px", position:"relative", overflow:"hidden" }}>
       {a===matched && <div style={{ position:"absolute", top:8, right:8, fontSize:8, color:a.color, fontFamily:M, letterSpacing:1.5, background:`${a.color}15`, padding:"2px 8px", borderRadius:3 }}>YOUR MATCH</div>}
       <div style={{ fontSize:13, fontWeight:700, color:a.color, marginBottom:8 }}>{a.name}</div>
       <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {a.traits.map(t => <div key={t} style={{ fontSize:10, color:MUTED }}>· {t}</div>)}
       </div>
      </div>
     ))}
    </div>
   </div>
  </div>
 );
}

function SettingsTab({ analyzedTools, onUpdateTools, onClearStack, adminKey, onSaveAdminKey, spendAlert, onSaveSpendAlert }) {
 const { signOut } = useClerk();
 const { user } = useUser();
 const [editingRoi, setEditingRoi]     = useState(null);
 const [roiVal, setRoiVal]             = useState("");
 const [notifs, setNotifs]             = useState({ overlap:true, inactive:true, spend:true, weekly:true });
 const [cleared, setCleared]           = useState(false);
 const [localAdminKey, setLocalAdminKey] = useState(adminKey || "");
 const [localSpendAlert, setLocalSpendAlert] = useState(spendAlert?.toString() || "");

 const saveRoi = (toolId) => {
  const val = parseInt(roiVal) || 0;
  onUpdateTools(prev => prev.map(t => (t.id||t.name) === toolId ? { ...t, roi:val } : t));
  setEditingRoi(null);
  setRoiVal("");
 };

 const handleClear = () => {
  if (window.confirm("Clear your entire stack? This cannot be undone.")) {
   onClearStack();
   setCleared(true);
   setTimeout(() => setCleared(false), 3000);
  }
 };

 return (
  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

   {/* Account */}
   <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"20px 24px" }}>
    <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:M, marginBottom:16 }}>ACCOUNT</div>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
     <div style={{ display:"flex", alignItems:"center", gap:14 }}>
      <div style={{ width:44, height:44, borderRadius:"50%", background:`${ACID}20`, border:`1px solid ${ACID}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:ACID, fontWeight:700 }}>
       {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || "B"}
      </div>
      <div>
       <div style={{ fontSize:13, fontWeight:600, color:TEXT }}>{user?.firstName ? `${user.firstName} ${user.lastName||""}`.trim() : "Builder"}</div>
       <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>{user?.emailAddresses?.[0]?.emailAddress || "—"}</div>
      </div>
     </div>
     <div style={{ fontSize:9, color:ACID, background:`${ACID}12`, border:`1px solid ${ACID}25`, padding:"4px 12px", borderRadius:3, fontFamily:M, letterSpacing:1.5 }}>EARLY ACCESS</div>
    </div>
    <button
     onClick={() => signOut()}
     style={{ width:"100%", background:"transparent", border:`1px solid #ff444440`, color:"#ff4444", padding:"10px", borderRadius:6, fontSize:12, cursor:"pointer", fontFamily:M, letterSpacing:1.5, transition:"all 0.15s" }}
     onMouseEnter={e => { e.currentTarget.style.background="#ff444415"; e.currentTarget.style.borderColor="#ff4444"; }}
     onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="#ff444440"; }}
    >SIGN OUT</button>
   </div>

   {/* API Usage Tracking */}
   <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"20px 24px" }}>
    <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:M, marginBottom:6 }}>ANTHROPIC API USAGE TRACKING</div>
    <div style={{ fontSize:11, color:"#3a4448", marginBottom:16, lineHeight:1.6 }}>
     Connect your Anthropic Admin API key to track real-time token usage and spending. Generate one at <span style={{ color:ACID }}>console.anthropic.com → API Keys → Admin Keys</span>.
    </div>
    <div style={{ display:"flex", gap:8, marginBottom:12 }}>
     <input
      type="password"
      value={localAdminKey}
      onChange={e => setLocalAdminKey(e.target.value)}
      placeholder="sk-ant-admin..."
      style={{ flex:1, background:PANEL_2, border:`1px solid ${BO}`, borderRadius:6, padding:"10px 14px", color:TEXT, fontSize:12, fontFamily:M, outline:"none" }}
      onFocus={e => e.target.style.borderColor=ACID}
      onBlur={e => e.target.style.borderColor=BO}
     />
     <button
      onClick={() => { onSaveAdminKey(localAdminKey); }}
      disabled={!localAdminKey}
      style={{ background:localAdminKey?ACID:PANEL_2, color:localAdminKey?BG:MUTED, border:`1px solid ${localAdminKey?ACID:BO}`, borderRadius:6, padding:"10px 16px", fontSize:11, fontWeight:700, cursor:localAdminKey?"pointer":"default", fontFamily:M, letterSpacing:1, transition:"all 0.15s" }}
     >CONNECT</button>
    </div>
    <div style={{ marginBottom:16 }}>
     <div style={{ fontSize:10, color:MUTED, marginBottom:8 }}>Monthly spend alert — get warned when projected spend exceeds this amount</div>
     <div style={{ display:"flex", gap:8, alignItems:"center" }}>
      <span style={{ fontSize:12, color:MUTED }}>$</span>
      <input
       type="number"
       value={localSpendAlert}
       onChange={e => setLocalSpendAlert(e.target.value)}
       placeholder="e.g. 50"
       style={{ width:100, background:PANEL_2, border:`1px solid ${BO}`, borderRadius:6, padding:"8px 12px", color:TEXT, fontSize:12, fontFamily:M, outline:"none" }}
       onFocus={e => e.target.style.borderColor=ACID}
       onBlur={e => e.target.style.borderColor=BO}
      />
      <span style={{ fontSize:11, color:MUTED }}>/mo</span>
      <button
       onClick={() => onSaveSpendAlert(localSpendAlert)}
       style={{ background:"transparent", border:`1px solid ${BO}`, color:MUTED, padding:"8px 14px", borderRadius:5, fontSize:10, cursor:"pointer", fontFamily:M, transition:"all 0.15s" }}
       onMouseEnter={e => { e.currentTarget.style.borderColor=ACID; e.currentTarget.style.color=ACID; }}
       onMouseLeave={e => { e.currentTarget.style.borderColor=BO; e.currentTarget.style.color=MUTED; }}
      >SET ALERT</button>
     </div>
    </div>
   </div>

   {/* ROI Attribution */}
   <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"20px 24px" }}>
    <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:M, marginBottom:6 }}>ROI ATTRIBUTION</div>
    <div style={{ fontSize:11, color:"#3a4448", marginBottom:16 }}>Tag each tool with estimated monthly revenue it helps generate. This improves your health score and spend justification.</div>
    {analyzedTools.length === 0 ? (
     <div style={{ fontSize:12, color:MUTED, textAlign:"center", padding:"20px 0" }}>No tools in stack yet.</div>
    ) : (
     <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {analyzedTools.map(t => (
       <div key={t.id||t.name} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:PANEL_2, border:`1px solid ${BO}`, borderRadius:7 }}>
        <div style={{ flex:1 }}>
         <div style={{ fontSize:12, fontWeight:600, color:TEXT }}>{t.name}</div>
         <div style={{ fontSize:10, color:MUTED }}>${t.cost}/mo cost</div>
        </div>
        {editingRoi === (t.id||t.name) ? (
         <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <span style={{ fontSize:11, color:MUTED }}>$</span>
          <input
           value={roiVal}
           onChange={e => setRoiVal(e.target.value.replace(/\D/g,""))}
           onKeyDown={e => e.key==="Enter" && saveRoi(t.id||t.name)}
           placeholder="0"
           autoFocus
           style={{ width:70, background:"#1a2326", border:`1px solid ${ACID}`, borderRadius:4, padding:"5px 8px", color:TEXT, fontSize:12, fontFamily:M, outline:"none" }}
          />
          <span style={{ fontSize:10, color:MUTED }}>/mo</span>
          <button onClick={() => saveRoi(t.id||t.name)} style={{ background:ACID, color:BG, border:"none", borderRadius:4, padding:"5px 10px", fontSize:10, cursor:"pointer", fontWeight:700 }}>✓</button>
          <button onClick={() => setEditingRoi(null)} style={{ background:"transparent", color:MUTED, border:`1px solid ${BO}`, borderRadius:4, padding:"5px 8px", fontSize:10, cursor:"pointer" }}>✕</button>
         </div>
        ) : (
         <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ fontSize:13, fontWeight:700, color:(t.roi||0)>0?GREEN:MUTED, fontFamily:M }}>{(t.roi||0)>0?`$${t.roi}/mo`:"—"}</div>
          <button
           onClick={() => { setEditingRoi(t.id||t.name); setRoiVal(t.roi?.toString()||""); }}
           style={{ background:"transparent", border:`1px solid ${BO}`, color:MUTED, padding:"4px 10px", borderRadius:4, fontSize:10, cursor:"pointer", fontFamily:M, transition:"all 0.15s" }}
           onMouseEnter={e => { e.currentTarget.style.borderColor=ACID; e.currentTarget.style.color=ACID; }}
           onMouseLeave={e => { e.currentTarget.style.borderColor=BO; e.currentTarget.style.color=MUTED; }}
          >TAG ROI</button>
         </div>
        )}
       </div>
      ))}
     </div>
    )}
   </div>

   {/* Notifications */}
   <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"20px 24px" }}>
    <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:M, marginBottom:16 }}>NOTIFICATION PREFERENCES</div>
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
     {[
      { key:"overlap",  label:"Overlap conflict alerts",    sub:"Notify when tools doing the same job are detected"   },
      { key:"inactive", label:"Inactive tool alerts",       sub:"Notify when a tool hasn't been used in 14+ days"     },
      { key:"spend",    label:"Spend spike alerts",         sub:"Notify when monthly spend increases significantly"   },
      { key:"weekly",   label:"Weekly digest email",        sub:"Summary of stack health every Monday"                },
     ].map(n => (
      <div key={n.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
       <div>
        <div style={{ fontSize:12, fontWeight:600, color:TEXT }}>{n.label}</div>
        <div style={{ fontSize:10, color:MUTED, marginTop:2 }}>{n.sub}</div>
       </div>
       <div
        onClick={() => setNotifs(prev => ({ ...prev, [n.key]:!prev[n.key] }))}
        style={{ width:36, height:20, borderRadius:10, cursor:"pointer", background:notifs[n.key]?ACID:"#1d2326", position:"relative", transition:"background 0.2s", flexShrink:0, boxShadow:notifs[n.key]?`0 0 10px ${ACID}44`:"none" }}
       >
        <div style={{ position:"absolute", top:3, left:notifs[n.key]?18:3, width:14, height:14, borderRadius:"50%", background:notifs[n.key]?BG:MUTED, transition:"left 0.2s" }}/>
       </div>
      </div>
     ))}
    </div>
   </div>

   {/* Danger zone */}
   <div style={{ background:PANEL, border:`1px solid #ff444430`, borderRadius:10, padding:"20px 24px" }}>
    <div style={{ fontSize:10, color:"#ff4444", letterSpacing:2.5, fontFamily:M, marginBottom:16 }}>DANGER ZONE</div>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
     <div>
      <div style={{ fontSize:12, fontWeight:600, color:TEXT }}>Clear stack data</div>
      <div style={{ fontSize:10, color:MUTED, marginTop:2 }}>Remove all tools and reset your dashboard</div>
     </div>
     <button
      onClick={handleClear}
      style={{ background:"transparent", border:`1px solid #ff444440`, color:"#ff4444", padding:"8px 16px", borderRadius:5, fontSize:11, cursor:"pointer", fontFamily:M, letterSpacing:1, transition:"all 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.background="#ff444415"; }}
      onMouseLeave={e => { e.currentTarget.style.background="transparent"; }}
     >{cleared ? "✓ CLEARED" : "CLEAR STACK"}</button>
    </div>
   </div>

  </div>
 );
}

function GitHubImportModal({ onClose, onImport }) {
 const [url, setUrl]         = useState("");
 const [loading, setLoading] = useState(false);
 const [result, setResult]   = useState(null);
 const [error, setError]     = useState("");
 const [selected, setSelected] = useState({});

 const handleImport = async () => {
  if (!url.includes("github.com")) { setError("Please enter a valid GitHub repository URL"); return; }
  setLoading(true);
  setError("");
  try {
   const res = await fetch("/api/github-import", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ repoUrl: url }),
   });
   const data = await res.json();
   if (!res.ok) throw new Error(data.error || "Import failed");
   setResult(data);
   // Select all detected tools by default
   const sel = {};
   data.tools.forEach(t => { sel[t.name] = true; });
   setSelected(sel);
  } catch (err) {
   setError(err.message);
  }
  setLoading(false);
 };

 const handleConfirm = () => {
  const toAdd = result.tools.filter(t => selected[t.name]).map(t => ({
   id: Date.now().toString() + Math.random(),
   name: t.name,
   cat: t.cat,
   icon: "◆",
   cost: t.cost,
   plan: "Detected",
   project: "—",
   billingCycle: "monthly",
   trend: "stable",
   overlap: false,
   daysAgo: 0,
   active: true,
   roi: 0,
  }));
  onImport(toAdd);
  onClose();
 };

 return (
  <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
   <div onClick={e => e.stopPropagation()} style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:12, width:"100%", maxWidth:520, maxHeight:"85vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:`0 0 60px rgba(0,0,0,0.6)` }}>

    {/* Header */}
    <div style={{ padding:"18px 22px", borderBottom:`1px solid ${BO}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
     <div>
      <div style={{ fontSize:14, fontWeight:700, color:TEXT }}>Import from GitHub</div>
      <div style={{ fontSize:10, color:MUTED, fontFamily:M, marginTop:2 }}>AUTO-DETECT TOOLS FROM PACKAGE.JSON</div>
     </div>
     <div onClick={onClose} style={{ cursor:"pointer", color:MUTED, fontSize:18, lineHeight:1, padding:4 }}>✕</div>
    </div>

    <div style={{ padding:"20px 22px", overflowY:"auto" }}>
     {!result ? (
      <>
       <div style={{ fontSize:12, color:MUTED, marginBottom:16, lineHeight:1.6 }}>
        Paste a public GitHub repo URL and we'll scan <code style={{ background:PANEL_2, padding:"1px 6px", borderRadius:3, color:ACID, fontSize:11 }}>package.json</code> to auto-detect your tools and add them to your stack.
       </div>
       <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        <input
         value={url}
         onChange={e => setUrl(e.target.value)}
         onKeyDown={e => e.key==="Enter" && handleImport()}
         placeholder="https://github.com/username/repo"
         autoFocus
         style={{ flex:1, background:PANEL_2, border:`1px solid ${loading?ACID:BO}`, borderRadius:7, padding:"10px 14px", color:TEXT, fontSize:13, fontFamily:SA, outline:"none", transition:"border-color 0.2s" }}
        />
        <button
         onClick={handleImport}
         disabled={loading || !url}
         style={{ background:url&&!loading?ACID:PANEL_2, color:url&&!loading?BG:MUTED, border:`1px solid ${url&&!loading?ACID:BO}`, borderRadius:7, padding:"10px 18px", fontSize:12, fontWeight:700, cursor:url&&!loading?"pointer":"default", fontFamily:SA, letterSpacing:1, transition:"all 0.15s", whiteSpace:"nowrap" }}
        >{loading ? "Scanning..." : "Import →"}</button>
       </div>
       {error && <div style={{ fontSize:12, color:WARN, background:`${WARN}10`, border:`1px solid ${WARN}25`, borderRadius:6, padding:"10px 14px" }}>{error}</div>}
       <div style={{ fontSize:11, color:MUTED, marginTop:12 }}>
        Works with public repos only. Scans <code style={{ color:ACID, fontSize:10 }}>dependencies</code> and <code style={{ color:ACID, fontSize:10 }}>devDependencies</code>.
       </div>
      </>
     ) : (
      <>
       <div style={{ background:`${GREEN}10`, border:`1px solid ${GREEN}25`, borderRadius:8, padding:"12px 16px", marginBottom:16, display:"flex", gap:10, alignItems:"center" }}>
        <span style={{ color:GREEN, fontSize:16 }}>◆</span>
        <div>
         <div style={{ fontSize:12, fontWeight:600, color:GREEN }}>Found {result.toolsFound} tool{result.toolsFound!==1?"s":""} in {result.repo}</div>
         <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>Select which ones to add to your stack</div>
        </div>
       </div>
       <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
        {result.tools.map(t => (
         <div key={t.name}
          onClick={() => setSelected(prev => ({ ...prev, [t.name]:!prev[t.name] }))}
          style={{ display:"flex", alignItems:"center", gap:12, background:selected[t.name]?`${ACID}08`:PANEL_2, border:`1px solid ${selected[t.name]?ACID+"44":BO}`, borderRadius:8, padding:"12px 14px", cursor:"pointer", transition:"all 0.15s" }}
         >
          <div style={{ width:18, height:18, borderRadius:"50%", background:selected[t.name]?ACID:PANEL, border:`1px solid ${selected[t.name]?ACID:BO}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:BG, fontWeight:900, flexShrink:0 }}>{selected[t.name]?"✓":""}</div>
          <div style={{ flex:1 }}>
           <div style={{ fontSize:12, fontWeight:600, color:selected[t.name]?TEXT:MUTED }}>{t.name}</div>
           <div style={{ fontSize:10, color:MUTED, marginTop:2 }}>Detected from <code style={{ color:ACID, fontSize:9 }}>{t.detectedFrom}</code> · {t.cat}</div>
          </div>
          <div style={{ fontSize:12, color:t.cost>0?WARN:GREEN, fontFamily:M, fontWeight:700 }}>{t.cost>0?`$${t.cost}/mo`:"Free"}</div>
         </div>
        ))}
       </div>
       <div style={{ display:"flex", gap:10 }}>
        <button onClick={() => { setResult(null); setUrl(""); }} style={{ flex:1, background:"transparent", border:`1px solid ${BO}`, color:MUTED, padding:"11px", borderRadius:7, fontSize:12, cursor:"pointer", fontFamily:SA }}>← Back</button>
        <button
         onClick={handleConfirm}
         disabled={Object.values(selected).filter(Boolean).length === 0}
         style={{ flex:2, background:ACID, color:BG, border:"none", borderRadius:7, padding:"11px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:SA, letterSpacing:1, boxShadow:`0 0 16px ${ACID}44` }}
        >Add {Object.values(selected).filter(Boolean).length} Tool{Object.values(selected).filter(Boolean).length!==1?"s":""} to Stack →</button>
       </div>
      </>
     )}
    </div>
   </div>
  </div>
 );
}

function PaywallScreen({ onUpgrade, loading }) {
 return (
  <div style={{ minHeight:"100vh", background:BG, display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:SA }}>
   <div style={{ maxWidth:480, width:"100%", textAlign:"center" }}>
    <div style={{ fontSize:10, color:ACID, letterSpacing:3, fontFamily:M, marginBottom:16 }}>HEKTIQ PRO</div>
    <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:36, fontWeight:800, letterSpacing:-1, marginBottom:16, color:TEXT }}>Your AI stack is costing you more than you think.</h1>
    <p style={{ fontSize:14, color:MUTED, lineHeight:1.7, marginBottom:32 }}>Get the full dashboard — overlap detection, AI advisor, benchmarks, usage tracking, and GitHub auto-import. Everything you need to optimize your stack.</p>

    <div style={{ background:PANEL, border:`1px solid ${ACID}40`, borderRadius:12, padding:"28px 32px", marginBottom:24, boxShadow:`0 0 40px ${ACID}15` }}>
     <div style={{ fontSize:11, color:MUTED, letterSpacing:2, fontFamily:M, marginBottom:8 }}>PRO PLAN</div>
     <div style={{ display:"flex", alignItems:"baseline", justifyContent:"center", gap:4, marginBottom:20 }}>
      <span style={{ fontSize:48, fontWeight:800, color:ACID, fontFamily:M }}>$19</span>
      <span style={{ fontSize:14, color:MUTED }}>/month</span>
     </div>
     <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24, textAlign:"left" }}>
      {[
       "Full AI stack dashboard",
       "Overlap & waste detection",
       "AI Stack Advisor",
       "Real-time API usage tracking",
       "GitHub auto-import",
       "Benchmarks vs other builders",
       "Stack health score",
       "Cancel anytime",
      ].map(f => (
       <div key={f} style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, color:TEXT }}>
        <span style={{ color:ACID, fontSize:11 }}>◆</span>{f}
       </div>
      ))}
     </div>
     <button
      onClick={onUpgrade}
      disabled={loading}
      style={{ width:"100%", background:loading?"#1a2326":ACID, color:loading?MUTED:BG, border:"none", borderRadius:8, padding:"14px", fontSize:14, fontWeight:800, cursor:loading?"default":"pointer", fontFamily:"'Syne',sans-serif", letterSpacing:0.5, boxShadow:loading?"none":`0 0 24px ${ACID}44`, transition:"all 0.2s" }}
     >{loading ? "Loading..." : "Start Pro — $19/mo →"}</button>
    </div>
    <p style={{ fontSize:11, color:MUTED }}>Secure checkout via Stripe · Cancel anytime · No contracts</p>
   </div>
  </div>
 );
}

export { ErrorBoundary };
export default function HektiqDashboard() {
 const { user } = useUser();
 const [activeNav, setActiveNav]   = useState("DASHBOARD");
 const [hoveredTool, setHoveredTool] = useState(null);
 const [digestOn, setDigestOn]     = useState(true);
 const [showAddTool, setShowAddTool] = useState(false);
 const [showGithubImport, setShowGithubImport] = useState(false);
 const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
 const [adminKey, setAdminKey]     = useState(() => localStorage.getItem("hektiq_admin_key") || "");
 const [apiUsage, setApiUsage]     = useState(null);
 const [apiUsageLoading, setApiUsageLoading] = useState(false);
 const [apiUsageError, setApiUsageError]   = useState("");
 const [spendAlert, setSpendAlert] = useState(() => parseInt(localStorage.getItem("hektiq_spend_alert")) || 0);
 const [isPro, setIsPro]           = useState(false);
 const [subLoading, setSubLoading] = useState(true);
 const [upgradeLoading, setUpgradeLoading] = useState(false);
 // Check subscription on load
 useEffect(() => {
  if (!user) { setSubLoading(false); return; }
  const checkSub = async () => {
   setSubLoading(true);
   try {
    const res = await fetch("/api/verify-subscription", {
     method:"POST",
     headers:{ "Content-Type":"application/json" },
     body: JSON.stringify({ email: user.emailAddresses?.[0]?.emailAddress }),
    });
    const data = await res.json();
    setIsPro(data.active);
   } catch { setIsPro(false); }
   setSubLoading(false);
  };
  checkSub();
 }, [user]);

 const handleUpgrade = async () => {
  if (!user) return;
  setUpgradeLoading(true);
  try {
   const res = await fetch("/api/create-checkout", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ userId: user.id, email: user.emailAddresses?.[0]?.emailAddress }),
   });
   const data = await res.json();
   if (data.url) window.location.href = data.url;
   else throw new Error(data.error);
  } catch (err) {
   alert("Something went wrong. Please try again.");
  }
  setUpgradeLoading(false);
 };

 const [toolsLoading, setToolsLoading] = useState(true);
 const [userTools, setUserTools] = useState([]);

 // Load tools from Supabase on mount
 useEffect(() => {
  if (!user) return;
  const loadTools = async () => {
   setToolsLoading(true);
   try {
    if (!supabase) { setUserTools(tools); setToolsLoading(false); return; }
    const { data, error } = await supabase
     .from("user_tools")
     .select("tools")
     .eq("user_id", user.id)
     .single();
    if (data?.tools) {
     setUserTools(data.tools);
    } else {
     setUserTools(tools);
    }
   } catch {}
   setToolsLoading(false);
  };
  loadTools();
 }, [user]);

 // Save tools to Supabase whenever they change
 useEffect(() => {
  if (!user || toolsLoading) return;
  const saveTools = async () => {
   if (!supabase) return;
   await supabase
    .from("user_tools")
    .upsert({ user_id: user.id, tools: userTools, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  };
  const timer = setTimeout(saveTools, 500);
  return () => clearTimeout(timer);
 }, [userTools, user, toolsLoading]);

 // Show loading/paywall AFTER all hooks
 if (subLoading) return (
  <div style={{ minHeight:"100vh", background:BG, display:"flex", alignItems:"center", justifyContent:"center" }}>
   <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
    <div style={{ width:8, height:8, borderRadius:"50%", background:ACID, animation:"blink 1s infinite" }}/>
    <div style={{ fontSize:11, color:MUTED, fontFamily:M, letterSpacing:2 }}>LOADING...</div>
   </div>
  </div>
 );

 if (!isPro) return <PaywallScreen onUpgrade={handleUpgrade} loading={upgradeLoading} />;
 const fetchApiUsage = async (key) => {
  const k = key || adminKey;
  if (!k) return;
  setApiUsageLoading(true);
  setApiUsageError("");
  try {
   const res = await fetch("/api/anthropic-usage", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ adminKey: k }),
   });
   const data = await res.json();
   if (!res.ok) throw new Error(data.error || "Failed to fetch usage");
   setApiUsage(data);
   localStorage.setItem("hektiq_admin_key", k);
  } catch(err) {
   setApiUsageError(err.message);
  }
  setApiUsageLoading(false);
 };

 const handleAddTool    = (newTool) => setUserTools(prev => {
  const exists = prev.some(t => t.name.toLowerCase() === newTool.name.toLowerCase());
  if (exists) { alert(`"${newTool.name}" is already in your stack.`); return prev; }
  return [...prev, newTool];
 });
 const handleRemoveTool = (id)      => setUserTools(prev => prev.filter(t => (t.id||t.name) !== id));
 const handleClearStack = ()        => setUserTools([]);
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
 const roiPenalty = analyzedTools.length === 0 || totalSpend === 0 ? 0
  : Math.round((1 - Math.min(totalROI / totalSpend, 1)) * 15);
 const healthScore = analyzedTools.length === 0 ? 0 : Math.max(10, Math.min(99,
  100
  - (overlapDetails.length * 15)
  - (deadTools.length * 8)
  - (analyzedTools.length > 5 ? (analyzedTools.length - 5) * 4 : 0)
  - roiPenalty
 ));
 const healthColor = analyzedTools.length === 0 ? MUTED : healthScore >= 75 ? ACID : healthScore >= 50 ? WARN : "#ff4444";
 const dynamicIssues = [
  overlapDetails.length > 0 && { label:`${overlapDetails.length} overlap group${overlapDetails.length>1?"s":""} detected`, severity:"high"   },
  deadTools.length > 0      && { label:`${deadTools.length} underused subscription${deadTools.length>1?"s":""}`,             severity:"medium" },
  analyzedTools.length > 6  && { label:`Stack complexity: ${analyzedTools.length} tools`,                                    severity:"medium" },
  totalSpend > 200           && { label:"Spend above average ($200/mo)",                                                      severity:"low"    },
 ].filter(Boolean);
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
 const dynamicRecs = analyzedTools.length === 0 ? [] : [
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
 const smartNotifications = [
  ...overlapDetails.map((od,i) => ({
   id:`notif_overlap_${i}`, severity:"high", icon:"⚠",
   title:`${od.label} overlap detected`,
   body:`${od.tools.join(" + ")} are doing the same job — you may be wasting ~$${Math.round(od.cost*0.5)}/mo`,
  })),
  ...deadTools.map((t,i) => ({
   id:`notif_dead_${i}`, severity:"medium", icon:"◉",
   title:`${t.name} has been inactive`,
   body:`No activity detected in ${t.daysAgo||21}+ days — consider pausing to save $${t.cost}/mo`,
  })),
  analyzedTools.length > 7 && {
   id:"notif_bloat", severity:"medium", icon:"▦",
   title:"Stack complexity warning",
   body:`${analyzedTools.length} tools detected. Most efficient builders run 4–5. Consider cutting dead weight.`,
  },
  totalROI === 0 && analyzedTools.length > 0 && {
   id:"notif_roi", severity:"low", icon:"◈",
   title:"No revenue attributed yet",
   body:"Tag tools to projects to unlock ROI tracking and improve your health score.",
  },
 ].filter(Boolean);
 const visibleNotifications = smartNotifications.filter(n => !dismissedAlerts.has(n.id));
 const forecastThisMonth = Math.round(totalSpend * 1.04);
 const forecastTrend     = totalSpend > 0 ? Math.round(((forecastThisMonth - totalSpend) / totalSpend) * 100) : 0;
 const forecastAnnual    = Math.round(totalSpend * 12 * 1.08);
 const stackTimeline = analyzedTools.length === 0 ? [] : [
  ...analyzedTools.slice().sort((a,b) => (a.daysAgo||0)-(b.daysAgo||0)).slice(0,3).map(t => ({
   type:"add", icon:"◆", color:ACID,
   label:`Added ${t.name}`,
   sub:`$${t.cost}/mo · ${t.cat}`,
   when: (t.daysAgo||0) === 0 ? "Today" : `${t.daysAgo}d ago`,
  })),
  healthScore >= 75 && { type:"score", icon:"▲", color:GREEN, label:`Stack health reached ${healthScore}%`, sub:"Efficiency milestone", when:"Now" },
  overlapDetails.length > 0 && { type:"warn", icon:"⚠", color:WARN, label:`${overlapDetails.length} overlap conflict${overlapDetails.length>1?"s":""} detected`, sub:`~$${Math.round(overlapCost*0.5)}/mo wasted`, when:"Active" },
  deadTools.length > 0 && { type:"warn", icon:"◉", color:MUTED, label:`${deadTools.length} tool${deadTools.length>1?"s":""} gone inactive`, sub:deadTools.map(t=>t.name).join(", "), when:`${Math.min(...deadTools.map(t=>t.daysAgo||21))}d+ ago` },
 ].filter(Boolean).slice(0,5);
 return (
  <div style={{ background:BG, minHeight:"100vh", color:TEXT, fontFamily:SA, display:"flex", fontSize:13 }}>
   {/* Sidebar - hidden on mobile */}
   <div style={{ width:220, background:PANEL, borderRight:`1px solid ${BORDER}`, display:"flex", flexDirection:"column", padding:"28px 0", flexShrink:0, boxShadow:"4px 0 24px rgba(0,0,0,0.5)", position:"sticky", top:0, height:"100vh", overflowY:"auto" }} className="hektiq-sidebar">
    <div style={{ padding:"0 24px 36px" }}>
     <div style={{ fontSize:20, fontWeight:800, letterSpacing:6, color:ACID, fontFamily:SA, textShadow:`0 0 20px ${ACID}55` }}>Hektiq</div>
     <div style={{ fontSize:9, color:MUTED, letterSpacing:3, marginTop:3 }}>AI STACK OPERATING SYSTEM</div>
    </div>
    <div style={{ flex:1 }}>
     {navItems.map(({label,icon}) => {
      const active = activeNav===label;
      return (
       <div key={label} onClick={()=>setActiveNav(label)} style={{ padding:"11px 24px", cursor:"pointer", display:"flex", alignItems:"center", gap:10, color: active?ACID:MUTED, borderLeft: active?`2px solid ${ACID}`:"2px solid transparent", background: active?`${ACID}08`:"transparent", letterSpacing:1.5, fontSize:10, fontWeight: active?600:400, transition:"all 0.15s", }}>
        <span style={{ fontSize:11, color: active?ACID:"#2d3539" }}>{icon}</span>
        {label}
       </div>
      );
     })}
    </div>
    <div style={{ padding:"0 24px 16px" }}>
     <div style={{ background:PANEL_2, border:`1px solid ${BO}`, borderRadius:8, padding:"12px 14px" }}>
      <div style={{ fontSize:9, color:MUTED, letterSpacing:2, marginBottom:6 }}>CONNECTED TOOLS</div>
      <div style={{ fontSize:22, fontWeight:800, color:TEXT, fontFamily:M }}>{userTools.length}</div>
      <div style={{ fontSize:9, color:MUTED, marginTop:2 }}>{overlapTools.length > 0 ? `${overlapTools.length} overlapping` : "Stack looks clean"}</div>
     </div>
    </div>
    <div style={{ padding:"16px 24px 0", borderTop:`1px solid ${BORDER}` }}>
     <div style={{ fontSize:10, color:MUTED, letterSpacing:1 }}>BUILDER</div>
     <div style={{ fontSize:13, color:TEXT, marginTop:4, fontWeight:600 }}>Builder</div>
     <div style={{ marginTop:8, display:"inline-flex", alignItems:"center", gap:5, background:`${ACID}12`, border:`1px solid ${ACID}30`, color:ACID, fontSize:9, padding:"3px 10px", letterSpacing:2, borderRadius:3, fontWeight:600 }}>
      <span style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:ACID, boxShadow:`0 0 6px ${ACID}` }}/>PRO
     </div>
    </div>
   </div>
   <div style={{ flex:1, padding:"28px 28px", overflowY:"auto", overflowX:"hidden", minWidth:0 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
     <div>
      <div style={{ fontSize:11, color:MUTED, letterSpacing:3, marginBottom:5, fontFamily:M }}>
       {activeNav === "STACK" ? "TOOL MANAGEMENT · STACK CONTROL" : activeNav === "INSIGHTS" ? "AI INTELLIGENCE · RECOMMENDATION ENGINE" : activeNav === "BENCHMARKS" ? "COMMUNITY DATA · EFFICIENCY RANKINGS" : activeNav === "SETTINGS" ? "ACCOUNT · PREFERENCES" : `${new Date().toLocaleString("en-US",{month:"long",year:"numeric"}).toUpperCase()} · BUILDER CONTROL CENTER`}
      </div>
      <div style={{ fontSize:22, fontWeight:700, color:TEXT, letterSpacing:-0.5 }}>
       {activeNav === "STACK" ? "Your Stack" : activeNav === "INSIGHTS" ? "Insights" : activeNav === "BENCHMARKS" ? "Benchmarks" : activeNav === "SETTINGS" ? "Settings" : "AI Stack Dashboard"}
      </div>
     </div>
     <div style={{ display:"flex", gap:10 }}>
      <button onClick={() => setShowGithubImport(true)} style={{ background:"transparent", color:MUTED, border:`1px solid ${BO}`, padding:"8px 16px", fontFamily:SA, fontSize:11, letterSpacing:1.5, cursor:"pointer", borderRadius:5 }}>IMPORT TOOL</button>
      <button onClick={()=>setShowAddTool(true)} style={{ background:ACID, color:BG, border:"none", padding:"8px 18px", fontFamily:SA, fontWeight:700, fontSize:11, letterSpacing:1.5, cursor:"pointer", borderRadius:5, boxShadow:`0 0 16px ${ACID}44` }}>+ ADD TOOL</button>
     </div>
    </div>
    {activeNav === "STACK" && <StackTab analyzedTools={analyzedTools} overlapIds={overlapIds} overlapDetails={overlapDetails} deadTools={deadTools} totalSpend={totalSpend} overlapCost={overlapCost} healthScore={healthScore} healthColor={healthColor} onRemove={handleRemoveTool} onAdd={()=>setShowAddTool(true)} severityColor={severityColor} />}
    {activeNav === "INSIGHTS" && <InsightsTab analyzedTools={analyzedTools} overlapDetails={overlapDetails} deadTools={deadTools} totalSpend={totalSpend} overlapCost={overlapCost} healthScore={healthScore} />}
    {activeNav === "BENCHMARKS" && <BenchmarksTab analyzedTools={analyzedTools} totalSpend={totalSpend} healthScore={healthScore} overlapDetails={overlapDetails} deadTools={deadTools} />}
    {activeNav === "SETTINGS" && <SettingsTab analyzedTools={analyzedTools} onUpdateTools={setUserTools} onClearStack={handleClearStack} adminKey={adminKey} onSaveAdminKey={(k) => { setAdminKey(k); fetchApiUsage(k); }} spendAlert={spendAlert} onSaveSpendAlert={(v) => { const n=parseInt(v)||0; setSpendAlert(n); localStorage.setItem("hektiq_spend_alert", n); }} />}
    {activeNav !== "STACK" && activeNav !== "INSIGHTS" && activeNav !== "BENCHMARKS" && <>
    <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 270px", gap:14, marginBottom:14 }}>
     <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"22px 26px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${ACID}88,transparent)`, animation:"scanline 3s ease-in-out infinite" }}/>
      <div style={{ position:"absolute", top:-60, right:-60, width:200, height:200, borderRadius:"50%", background:`${ACID}04`, filter:"blur(40px)", pointerEvents:"none" }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
       <div>
        <div style={{ fontSize:10, color:MUTED, letterSpacing:3, marginBottom:8, fontFamily:M }}>STACK HEALTH</div>
        <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
         <div style={{ fontSize:52, fontWeight:800, color:healthColor, lineHeight:1, fontFamily:M, textShadow:`0 0 30px ${healthColor}44` }}>
          <Counter target={healthScore} suffix="%"/>
         </div>
         <div style={{ fontSize:12, color:GREEN, fontFamily:M }}>▲ live</div>
        </div>
       </div>
       {analyzedTools.length > 0 && dynamicIssues.length > 0 && (
       <div style={{ background:`${WARN}15`, border:`1px solid ${WARN}40`, color:WARN, fontSize:9, padding:"5px 12px", borderRadius:3, letterSpacing:2, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:WARN, boxShadow:`0 0 8px ${WARN}`, animation:"blink 1.5s infinite" }}/>
        {dynamicIssues.length} ISSUES DETECTED
       </div>
       )}
      </div>
      <div style={{ marginBottom:18 }}>
       <div style={{ height:4, background:"#1a2022", borderRadius:2, overflow:"hidden" }}>
        <div style={{ width:`${healthScore}%`, height:"100%", background:`linear-gradient(90deg,${ACID_S},${healthColor})`, borderRadius:2, boxShadow:`0 0 10px ${healthColor}66`, transition:"width 0.8s ease" }}/>
       </div>
       <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:9, color:"#2a3035", fontFamily:M }}>
        <span>0</span><span>CRITICAL</span><span>WARNING</span><span>OPTIMAL</span><span>100</span>
       </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:8 }}>
       {analyzedTools.length === 0 ? (
        <div style={{ gridColumn:"1/-1", background:PANEL_2, border:`1px solid ${BO}`, borderRadius:6, padding:"12px", textAlign:"center" }}>
         <div style={{ fontSize:11, color:MUTED }}>Add tools to see health analysis</div>
        </div>
       ) : dynamicIssues.length === 0 ? (
        <div style={{ gridColumn:"1/-1", background:`${GREEN}08`, border:`1px solid ${GREEN}25`, borderRadius:6, padding:"10px 12px", display:"flex", alignItems:"center", gap:8 }}>
         <div style={{ width:6, height:6, borderRadius:"50%", background:GREEN, flexShrink:0 }}/>
         <div style={{ fontSize:11, color:"#8a9299" }}>No issues detected — stack is clean</div>
        </div>
       ) : dynamicIssues.map((issue,i) => (
        <div key={i} style={{ background:PANEL_2, border:`1px solid ${severityColor(issue.severity)}22`, borderRadius:6, padding:"9px 12px", display:"flex", alignItems:"center", gap:8 }}>
         <div style={{ width:6, height:6, borderRadius:"50%", background:severityColor(issue.severity), flexShrink:0, boxShadow:`0 0 6px ${severityColor(issue.severity)}` }}/>
         <div style={{ fontSize:11, color:"#8a9299" }}>{issue.label}</div>
        </div>
       ))}
      </div>
     </div>
     <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"22px 20px", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column" }}>
      <div style={{ position:"absolute", top:-40, right:-40, width:140, height:140, borderRadius:"50%", background:`${PURPLE}06`, filter:"blur(30px)" }}/>
      <div style={{ fontSize:10, color:MUTED, letterSpacing:3, marginBottom:14, fontFamily:M }}>BUILDER ARCHETYPE</div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center" }}>
       <div style={{ fontSize:11, color:MUTED, letterSpacing:2, marginBottom:5 }}>YOU MATCH</div>
       <div style={{ fontSize:19, fontWeight:800, color:TEXT, marginBottom:4, lineHeight:1.2 }}>"The Solo Hacker"</div>
       <div style={{ fontSize:10, color:PURPLE, letterSpacing:1, marginBottom:14 }}>TOP 32% OF BUILDERS</div>
       <div style={{ display:"flex", flexDirection:"column", gap:5, width:"100%", marginBottom:14 }}>
        {["High experimentation rate","Over-subscribed","Fast shipping velocity","Medium automation maturity"].map((t,i) => (
         <div key={i} style={{ background:PANEL_2, border:`1px solid ${BO}`, borderRadius:4, padding:"5px 10px", fontSize:10, color:"#8a9299", textAlign:"left", display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ color:PURPLE, fontSize:8 }}>▸</span>{t}
         </div>
        ))}
       </div>
       <button
        onClick={() => {
         const text = `My Hektiq Stack Score: ${healthScore}% — I'm "The Solo Hacker" 🔥\n\nStack: ${analyzedTools.length} tools · $${totalSpend}/mo burn\n\nCheck yours at hektiq.com`;
         if (navigator.share) {
          navigator.share({ title: "My Hektiq Stack", text });
         } else {
          navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
         }
        }}
        style={{ background:`${PURPLE}15`, border:`1px solid ${PURPLE}40`, color:PURPLE, padding:"7px 18px", borderRadius:4, fontSize:10, letterSpacing:1.5, cursor:"pointer", fontFamily:SA, fontWeight:600, width:"100%" }}>
        SHARE ARCHETYPE ↗
       </button>
      </div>
     </div>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(5,1fr)", gap:12, marginBottom:14 }}>
     {[
      { label:"MONTHLY BURN",      value:totalSpend,           prefix:"$", suffix:"",    sub: totalSpend === 0 ? "no tools added" : `$${totalSpend * 12}/yr projected`,  color:WARN  },
      { label:"ANNUAL FORECAST",   value:yearForecast,         prefix:"$", suffix:"",    sub: analyzedTools.length === 0 ? "add tools to forecast" : "↑ trending upward", color:WARN  },
      { label:"ACTIVE TOOLS",      value:analyzedTools.length, prefix:"",  suffix:"",    sub: analyzedTools.length === 0 ? "none added yet" : analyzedTools.length > 6 ? `${analyzedTools.length - 6} over optimal` : "within optimal range", color:TEXT },
      { label:"REVENUE ATTRIBUTED",value:totalROI,             prefix:"$", suffix:"/mo", sub: totalROI === 0 ? "tag tools to projects" : "from tagged tools",             color:GREEN },
      { label:"POTENTIAL SAVINGS", value:dynamicRecs.reduce((s,r)=>s+(r.savings||0),0), prefix:"$", suffix:"/mo", sub: dynamicRecs.length > 0 ? `${dynamicRecs.length} recommendation${dynamicRecs.length>1?"s":""}` : "stack looks clean", color:ACID },
     ].map(({label,value,prefix,suffix,sub,color}) => (
      <div key={label} style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"16px 18px", position:"relative", overflow:"hidden" }}>
       <div style={{ position:"absolute", bottom:-20, right:-20, width:70, height:70, borderRadius:"50%", background:`${color}06`, filter:"blur(20px)" }}/>
       <div style={{ fontSize:9, color:MUTED, letterSpacing:2, marginBottom:8, fontFamily:M }}>{label}</div>
       <div style={{ fontSize:24, fontWeight:800, color, lineHeight:1, fontFamily:M }}><Counter target={value} prefix={prefix} suffix={suffix}/></div>
       <div style={{ fontSize:9, color:MUTED, marginTop:7 }}>{sub}</div>
      </div>
     ))}
    </div>
    {analyzedTools.length > 0 && (
     <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr 1fr", gap:12, marginBottom:14 }}>
      <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"16px 20px", display:"flex", alignItems:"center", gap:16 }}>
       <div style={{ width:40, height:40, borderRadius:8, background:`${WARN}12`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <span style={{ color:WARN, fontSize:18 }}>◎</span>
       </div>
       <div>
        <div style={{ fontSize:9, color:MUTED, letterSpacing:2, fontFamily:M, marginBottom:4 }}>THIS MONTH FORECAST</div>
        <div style={{ fontSize:20, fontWeight:800, color:WARN, fontFamily:M }}>${forecastThisMonth}</div>
        <div style={{ fontSize:10, color:MUTED, marginTop:3 }}>+{forecastTrend}% vs last month · on current trajectory</div>
       </div>
      </div>
      <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"16px 20px", display:"flex", alignItems:"center", gap:16 }}>
       <div style={{ width:40, height:40, borderRadius:8, background:`${BLUE}12`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <span style={{ color:BLUE, fontSize:18 }}>◈</span>
       </div>
       <div>
        <div style={{ fontSize:9, color:MUTED, letterSpacing:2, fontFamily:M, marginBottom:4 }}>12-MONTH PROJECTION</div>
        <div style={{ fontSize:20, fontWeight:800, color:BLUE, fontFamily:M }}>${forecastAnnual}</div>
        <div style={{ fontSize:10, color:MUTED, marginTop:3 }}>at current growth rate (+8% trend)</div>
       </div>
      </div>
      <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"16px 20px", display:"flex", alignItems:"center", gap:16 }}>
       <div style={{ width:40, height:40, borderRadius:8, background:`${GREEN}12`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <span style={{ color:GREEN, fontSize:18 }}>▼</span>
       </div>
       <div>
        <div style={{ fontSize:9, color:MUTED, letterSpacing:2, fontFamily:M, marginBottom:4 }}>POTENTIAL SAVINGS</div>
        <div style={{ fontSize:20, fontWeight:800, color:GREEN, fontFamily:M }}>${dynamicRecs.reduce((s,r)=>s+(r.savings||0),0)}/mo</div>
        <div style={{ fontSize:10, color:MUTED, marginTop:3 }}>{dynamicRecs.length > 0 ? `${dynamicRecs.length} action${dynamicRecs.length>1?"s":""} available` : "stack fully optimized"}</div>
       </div>
      </div>
     </div>
    )}
    {visibleNotifications.length > 0 && (
     <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
       <div style={{ fontSize:9, color:MUTED, letterSpacing:2.5, fontFamily:M }}>SMART ALERTS · {visibleNotifications.length} active</div>
       <button onClick={() => setDismissedAlerts(new Set(smartNotifications.map(n=>n.id)))} style={{ background:"transparent", border:"none", color:MUTED, fontSize:9, cursor:"pointer", fontFamily:M, letterSpacing:1 }}>DISMISS ALL</button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
       {visibleNotifications.map(n => (
        <div key={n.id} style={{ background:PANEL, border:`1px solid ${n.severity==="high"?`${WARN}40`:n.severity==="medium"?`${BLUE}30`:BORDER}`, borderRadius:8, padding:"10px 14px", display:"flex", alignItems:"center", gap:12 }}>
         <span style={{ color:severityColor(n.severity), fontSize:14, flexShrink:0 }}>{n.icon}</span>
         <div style={{ flex:1 }}>
          <div style={{ fontSize:11, fontWeight:600, color:TEXT, marginBottom:2 }}>{n.title}</div>
          <div style={{ fontSize:10, color:MUTED }}>{n.body}</div>
         </div>
         <button onClick={() => setDismissedAlerts(prev => new Set([...prev, n.id]))} style={{ background:"transparent", border:"none", color:MUTED, fontSize:14, cursor:"pointer", flexShrink:0, lineHeight:1, padding:"2px 6px" }} onMouseEnter={e=>e.currentTarget.style.color=TEXT} onMouseLeave={e=>e.currentTarget.style.color=MUTED}>✕</button>
        </div>
       ))}
      </div>
     </div>
    )}
    {analyzedTools.length > 0 && (() => {
     const relevantAlerts = priceAlerts.filter(a =>
      analyzedTools.some(t => t.name.toLowerCase().includes(a.tool.toLowerCase()) || a.tool.toLowerCase().includes(t.name.toLowerCase()))
     );
     if (relevantAlerts.length === 0) return null;
     return (
      <div style={{ marginBottom:14 }}>
       <div style={{ display:"flex", gap:12 }}>
        {relevantAlerts.map((a,i) => (
         <div key={i} style={{ flex:1, background:`${WARN}08`, border:`1px solid ${WARN}30`, borderRadius:8, padding:"12px 16px", display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:36, height:36, borderRadius:8, background:`${WARN}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
           <span style={{ color:WARN, fontSize:14 }}>↑</span>
          </div>
          <div style={{ flex:1 }}>
           <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:3 }}>
            <span style={{ fontSize:11, fontWeight:700, color:WARN, letterSpacing:1, fontFamily:M }}>PRICE INCREASE</span>
            <span style={{ background:`${WARN}22`, color:WARN, fontSize:9, padding:"2px 7px", borderRadius:3, fontFamily:M, fontWeight:700 }}>{a.change}</span>
            <span style={{ fontSize:10, color:TEXT }}>{a.tool}</span>
           </div>
           <div style={{ fontSize:10, color:MUTED }}>{a.detail}</div>
          </div>
          <div style={{ textAlign:"right", flexShrink:0 }}>
           <div style={{ fontSize:13, fontWeight:700, color:WARN, fontFamily:M }}>+${a.impact}/mo</div>
           <div style={{ fontSize:9, color:MUTED, fontFamily:M }}>+${a.impact*12}/yr</div>
          </div>
         </div>
        ))}
       </div>
      </div>
     );
    })()}
    <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 255px", gap:14, marginBottom:14 }}>
     <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"18px 20px 12px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
       <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:M }}>SPEND TRAJECTORY</div>
       <div style={{ display:"flex", gap:16, fontSize:9, fontFamily:M }}>
        <span style={{ color:ACID }}>▬ actual</span>
        <span style={{ color:MUTED }}>╌ forecast</span>
       </div>
      </div>
      {analyzedTools.length === 0 ? (
       <div style={{ height:140, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:12, color:MUTED }}>Add tools to see spend trajectory</div>
       </div>
      ) : (
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
        <XAxis dataKey="month" tick={{ fill:MUTED, fontSize:9, fontFamily:M }} axisLine={false} tickLine={false}/>
        <YAxis tick={{ fill:MUTED, fontSize:9, fontFamily:M }} axisLine={false} tickLine={false}/>
        <Tooltip content={<SpendTip/>}/>
        <Area type="monotone" dataKey="spend" stroke={ACID} strokeWidth={2} fill="url(#aGrad)" dot={{ fill:ACID, r:3 }} connectNulls={false}/>
        <Area type="monotone" dataKey="forecast" stroke={MUTED} strokeWidth={1.5} strokeDasharray="4 3" fill="url(#fGrad)" dot={false} connectNulls={false}/>
       </AreaChart>
      </ResponsiveContainer>
      )}
     </div>
     <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"18px 20px 12px" }}>
      <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, marginBottom:4, fontFamily:M }}>STACK SCORE HISTORY</div>
      <div style={{ fontSize:9, color: analyzedTools.length === 0 ? MUTED : GREEN, fontFamily:M, marginBottom:12 }}>
       {analyzedTools.length === 0 ? "Add tools to track score over time" : `Current score: ${healthScore}%`}
      </div>
      {analyzedTools.length === 0 ? (
       <div style={{ height:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:11, color:MUTED }}>No history yet</div>
       </div>
      ) : (
      <ResponsiveContainer width="100%" height={100}>
       <LineChart data={scoreHistory} margin={{ top:4, right:0, bottom:0, left:-24 }}>
        <CartesianGrid stroke={BORDER} vertical={false}/>
        <XAxis dataKey="month" tick={{ fill:MUTED, fontSize:9, fontFamily:M }} axisLine={false} tickLine={false}/>
        <YAxis domain={[40,100]} tick={{ fill:MUTED, fontSize:9, fontFamily:M }} axisLine={false} tickLine={false}/>
        <Tooltip content={<ScoreTip/>}/>
        <Line type="monotone" dataKey="score" stroke={ACID} strokeWidth={2} dot={{ fill:ACID, r:3 }}/>
       </LineChart>
      </ResponsiveContainer>
      )}
      <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${BORDER}` }}>
       {[
        { label:"First tool added",     done: analyzedTools.length >= 1  },
        { label:"Score above 70",        done: healthScore >= 70           },
        { label:"Zero redundancy",       done: overlapDetails.length === 0 && analyzedTools.length > 0 },
        { label:"Top 10% builder",       done: healthScore >= 90           },
       ].map(m => (
        <div key={m.label} style={{ display:"flex", alignItems:"center", gap:6, fontSize:9, color: m.done?ACID:MUTED, marginBottom:4 }}>
         <span>{m.done?"◆":"◇"}</span>{m.label}
        </div>
       ))}
      </div>
     </div>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 330px", gap:14, marginBottom:14 }}>
     <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"20px", display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
       <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:M }}>YOUR STACK</div>
       <div style={{ display:"flex", gap:10, fontSize:9, fontFamily:M }}>
        {overlapTools.length > 0 && <span style={{ color:WARN }}>⚠ {overlapTools.length} overlapping</span>}
        {deadTools.length > 0 && <><span style={{ color:"#2d3539" }}>|</span><span style={{ color:MUTED }}>{deadTools.length} dead weight</span></>}
       </div>
      </div>
      <div style={{ display:"flex", padding:"0 10px 7px", borderBottom:`1px solid ${BORDER}`, marginBottom:4, flexShrink:0 }}>
       <div style={{ width:26 }}/>
       <div style={{ flex:1, fontSize:8, color:"#252d30", letterSpacing:1.5, fontFamily:M }}>TOOL · PROJECT</div>
       {!isMobile && <div style={{ width:55, textAlign:"right", fontSize:8, color:"#252d30", letterSpacing:1.5, fontFamily:M }}>ROI/MO</div>}
       <div style={{ width:50, textAlign:"right", fontSize:8, color:"#252d30", letterSpacing:1.5, fontFamily:M }}>COST</div>
       {!isMobile && <div style={{ width:65, textAlign:"right", fontSize:8, color:"#252d30", letterSpacing:1.5, fontFamily:M }}>ANNUAL</div>}
       <div style={{ width:24 }}/>
      </div>
      <div style={{ overflowY:"auto", maxHeight:280, display:"flex", flexDirection:"column", gap:2 }}>
       {analyzedTools.map((tool,i) => {
        const isDead = (tool.daysAgo||0) > 20;
        const roiColor = tool.roi > 100 ? GREEN : tool.roi > 0 ? BLUE : MUTED;
        return (
         <div key={tool.id || tool.name}
          onMouseEnter={() => setHoveredTool(i)}
          onMouseLeave={() => setHoveredTool(null)}
          style={{ display:"flex", alignItems:"center", padding:"9px 10px", borderRadius:7, background: tool.overlap?`${WARN}08`:isDead?`${MUTED}04`:hoveredTool===i?PANEL_2:"transparent", transition:"all 0.15s", borderLeft: tool.overlap?`2px solid ${WARN}`:isDead?`2px solid ${MUTED}33`:"2px solid transparent", opacity: isDead?0.65:1, }}>
          <div style={{ width:26, fontSize:12, color: isDead?MUTED:ACID }}>{tool.icon}</div>
          <div style={{ flex:1 }}>
           <div style={{ fontSize:12, color: isDead?MUTED:TEXT, fontWeight:500 }}>{tool.name}</div>
           <div style={{ fontSize:9, color:"#2d3539", fontFamily:M }}>{tool.project}</div>
          </div>
          {!isMobile && <div style={{ width:55, textAlign:"right" }}>
           <div style={{ fontSize:11, color:roiColor, fontFamily:M, fontWeight:700 }}>
            {tool.roi > 0 ? `$${tool.roi}` : "—"}
           </div>
           {tool.roi > 0 && <div style={{ fontSize:8, color:roiColor, opacity:0.6, fontFamily:M }}>revenue</div>}
          </div>}
          <div style={{ width:50, textAlign:"right" }}>
           <div style={{ fontSize:12, color:TEXT, fontFamily:M }}>${tool.cost}</div>
           <div style={{ fontSize:9, color: tool.trend==="up"?WARN:tool.trend==="down"?GREEN:"#2d3539" }}>
            {tool.trend==="up"?"▲":tool.trend==="down"?"▼":"—"}
           </div>
          </div>
          {!isMobile && <div style={{ width:65, textAlign:"right" }}>
           <div style={{ fontSize:11, color:MUTED, fontFamily:M }}>${tool.cost*12}</div>
           {isDead && <div style={{ fontSize:8, color:WARN, fontFamily:M }}>dead wt</div>}
          </div>}
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
       <span style={{ color:MUTED, fontFamily:M }}>TOTAL</span>
       <span style={{ fontFamily:M }}>
        <span style={{ color:TEXT, fontWeight:700 }}>${totalSpend}/mo</span>
        <span style={{ color:MUTED }}> · </span>
        <span style={{ color:WARN, fontWeight:700 }}>${totalSpend*12}/yr</span>
        <span style={{ color:MUTED }}> · </span>
        <span style={{ color:GREEN, fontWeight:700 }}>+${totalROI}/mo attributed</span>
       </span>
      </div>
     </div>
     <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"20px", display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:2 }}>
       <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:M }}>HEKTIQ RECOMMENDATIONS</div>
       <div style={{ display:"flex", alignItems:"center", gap:5 }}>
        <span style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:ACID, animation:"blink 2s infinite" }}/>
        <span style={{ fontSize:8, color:MUTED, fontFamily:M }}>AI ACTIVE</span>
       </div>
      </div>
      {analyzedTools.length === 0 ? (
       <div style={{ background:PANEL_2, border:`1px solid ${BO}`, borderRadius:8, padding:"16px 14px", textAlign:"center" }}>
        <div style={{ fontSize:11, color:MUTED }}>Add tools to your stack to get recommendations</div>
       </div>
      ) : dynamicRecs.length === 0 ? (
       <div style={{ background:`${GREEN}08`, border:`1px solid ${GREEN}25`, borderRadius:8, padding:"12px 14px", display:"flex", gap:10, alignItems:"center" }}>
        <span style={{ color:GREEN, fontSize:14 }}>◆</span>
        <div style={{ fontSize:11, color:MUTED }}>Stack looks clean — no overlaps or dead weight detected.</div>
       </div>
      ) : dynamicRecs.map(rec => (
       <div key={rec.id} style={{ background:PANEL_2, border:`1px solid ${BO}`, borderRadius:8, padding:"12px 14px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
         <div style={{ fontSize:10, fontWeight:700, color:ACID, letterSpacing:1, fontFamily:M }}>✦ {rec.label}</div>
         <div style={{ fontSize:8, color:MUTED, fontFamily:M }}>{rec.confidence}% conf</div>
        </div>
        <div style={{ fontSize:11, color:MUTED, lineHeight:1.55, marginBottom:8 }}>{rec.detail}</div>
        <div style={{ display:"flex", gap:8 }}>
         <div style={{ background:`${GREEN}10`, border:`1px solid ${GREEN}22`, borderRadius:4, padding:"4px 10px", fontSize:10, color:GREEN, fontFamily:M, fontWeight:700 }}>save ${rec.savings}/mo</div>
         <div style={{ background:`${BLUE}10`, border:`1px solid ${BLUE}22`, borderRadius:4, padding:"4px 10px", fontSize:10, color:BLUE, fontFamily:M, fontWeight:700 }}>{rec.efficiency} eff</div>
        </div>
       </div>
      ))}
      <div style={{ paddingTop:10, borderTop:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
       <div>
        <div style={{ fontSize:10, color:MUTED, letterSpacing:1.5, fontFamily:M }}>WEEKLY DIGEST</div>
        <div style={{ fontSize:9, color:"#252d30", marginTop:2 }}>Every Monday · Email</div>
       </div>
       <div onClick={()=>setDigestOn(d=>!d)} style={{ width:36, height:20, borderRadius:10, cursor:"pointer", background:digestOn?ACID:"#1d2326", position:"relative", transition:"background 0.2s", flexShrink:0, boxShadow:digestOn?`0 0 10px ${ACID}44`:"none" }}>
        <div style={{ position:"absolute", top:3, left:digestOn?18:3, width:14, height:14, borderRadius:"50%", background:digestOn?BG:MUTED, transition:"left 0.2s" }}/>
       </div>
      </div>
     </div>
    </div>
    {stackTimeline.length > 0 && (
     <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"20px", marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
       <div>
        <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:M, marginBottom:4 }}>STACK HEALTH TIMELINE</div>
        <div style={{ fontSize:11, color:"#3a4448" }}>Track how your stack evolves over time</div>
       </div>
       <div style={{ fontSize:9, color:ACID, fontFamily:M, letterSpacing:1.5 }}>LIVE</div>
      </div>
      <div style={{ position:"relative" }}>
       <div style={{ position:"absolute", left:15, top:8, bottom:8, width:1, background:`${BORDER}`, zIndex:0 }}/>
       <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
        {stackTimeline.map((event, i) => (
         <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:16, paddingBottom:16, position:"relative", zIndex:1 }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:PANEL_2, border:`1px solid ${event.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:event.color, flexShrink:0, zIndex:2 }}>{event.icon}</div>
          <div style={{ flex:1, paddingTop:5 }}>
           <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:2 }}>
            <div style={{ fontSize:12, fontWeight:600, color:TEXT }}>{event.label}</div>
            <div style={{ fontSize:9, color:MUTED, fontFamily:M }}>{event.when}</div>
           </div>
           <div style={{ fontSize:10, color:MUTED }}>{event.sub}</div>
          </div>
         </div>
        ))}
       </div>
      </div>
     </div>
    )}
        {/* ── API USAGE TRACKER ── */}
        {adminKey && (
         <div style={{ marginBottom:14 }}>
          {apiUsageLoading && (
           <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"20px 24px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:ACID, animation:"blink 1s infinite" }}/>
            <span style={{ fontSize:12, color:MUTED }}>Fetching API usage data...</span>
           </div>
          )}
          {apiUsageError && (
           <div style={{ background:`${WARN}08`, border:`1px solid ${WARN}30`, borderRadius:10, padding:"16px 20px", display:"flex", gap:10, alignItems:"center" }}>
            <span style={{ color:WARN }}>⚠</span>
            <span style={{ fontSize:12, color:WARN }}>{apiUsageError}</span>
            <button onClick={() => fetchApiUsage()} style={{ marginLeft:"auto", background:"transparent", border:`1px solid ${WARN}40`, color:WARN, padding:"4px 12px", borderRadius:4, fontSize:10, cursor:"pointer", fontFamily:M }}>RETRY</button>
           </div>
          )}
          {apiUsage && !apiUsageLoading && (
           <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"20px 24px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
             <div>
              <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:M, marginBottom:4 }}>ANTHROPIC API USAGE · LAST 30 DAYS</div>
              <div style={{ fontSize:11, color:"#3a4448" }}>Real-time spend from your Admin API key</div>
             </div>
             <button onClick={() => fetchApiUsage()} style={{ background:"transparent", border:`1px solid ${BO}`, color:MUTED, padding:"5px 12px", borderRadius:4, fontSize:9, cursor:"pointer", fontFamily:M, letterSpacing:1 }}>↻ REFRESH</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)", gap:10, marginBottom:16 }}>
             {[
              { label:"THIS MONTH",   value:`$${apiUsage.thisMonthCost}`,    sub:"actual spend",          color:WARN },
              { label:"PROJECTED",    value:`$${apiUsage.projectedMonthly}`, sub:"end of month estimate", color:apiUsage.projectedMonthly>(spendAlert||999)?"#ff4444":ACID },
              { label:"DAILY AVG",    value:`$${apiUsage.avgDailySpend}`,    sub:"last 7 days",           color:TEXT },
              { label:"30-DAY TOTAL", value:`$${apiUsage.totalCost}`,        sub:`${(apiUsage.totalInputTokens/1000).toFixed(0)}K input tokens`, color:MUTED },
             ].map(s => (
              <div key={s.label} style={{ background:PANEL_2, border:`1px solid ${BO}`, borderRadius:7, padding:"12px 14px" }}>
               <div style={{ fontSize:9, color:MUTED, fontFamily:M, letterSpacing:1.5, marginBottom:6 }}>{s.label}</div>
               <div style={{ fontSize:18, fontWeight:800, color:s.color, fontFamily:M }}>{s.value}</div>
               <div style={{ fontSize:9, color:MUTED, marginTop:3 }}>{s.sub}</div>
              </div>
             ))}
            </div>
            {spendAlert > 0 && apiUsage.projectedMonthly > spendAlert && (
             <div style={{ background:"rgba(255,68,68,0.08)", border:"1px solid rgba(255,68,68,0.3)", borderRadius:8, padding:"10px 16px", marginBottom:12, display:"flex", gap:10, alignItems:"center" }}>
              <span style={{ color:"#ff4444", fontSize:14 }}>🚨</span>
              <div>
               <div style={{ fontSize:12, fontWeight:700, color:"#ff4444" }}>Spend alert — on pace to exceed ${spendAlert}/mo</div>
               <div style={{ fontSize:11, color:MUTED }}>Projected ${apiUsage.projectedMonthly} vs your ${spendAlert} limit.</div>
              </div>
             </div>
            )}
            <div style={{ marginBottom:12 }}>
             <div style={{ fontSize:9, color:MUTED, letterSpacing:2, fontFamily:M, marginBottom:10 }}>DAILY SPEND — LAST 30 DAYS</div>
             <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:60 }}>
              {apiUsage.timeline.map((day, i) => {
               const maxCost = Math.max(...apiUsage.timeline.map(d => d.cost), 0.01);
               const height = Math.max(2, (day.cost / maxCost) * 60);
               const isToday = i === apiUsage.timeline.length - 1;
               return (
                <div key={day.date} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }} title={`${day.label}: $${day.cost}`}>
                 <div style={{ width:"100%", height:`${height}px`, background:isToday?ACID:day.cost>0?`${ACID}55`:"#1a2022", borderRadius:"2px 2px 0 0", minHeight:2 }}/>
                </div>
               );
              })}
             </div>
             <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
              <span style={{ fontSize:9, color:MUTED, fontFamily:M }}>{apiUsage.timeline[0]?.label}</span>
              <span style={{ fontSize:9, color:ACID, fontFamily:M }}>Today</span>
             </div>
            </div>
            {apiUsage.modelBreakdown.length > 0 && (
             <div>
              <div style={{ fontSize:9, color:MUTED, letterSpacing:2, fontFamily:M, marginBottom:8 }}>SPEND BY MODEL</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
               {apiUsage.modelBreakdown.slice(0,4).map(m => {
                const pct = apiUsage.totalCost > 0 ? (m.cost / apiUsage.totalCost) * 100 : 0;
                return (
                 <div key={m.model} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:130, fontSize:10, color:MUTED, fontFamily:M, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.model}</div>
                  <div style={{ flex:1, height:4, background:"#1a2022", borderRadius:2 }}>
                   <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg,${ACID}66,${ACID})`, borderRadius:2 }}/>
                  </div>
                  <div style={{ width:48, textAlign:"right", fontSize:10, color:ACID, fontFamily:M }}>${m.cost}</div>
                 </div>
                );
               })}
              </div>
             </div>
            )}
           </div>
          )}
         </div>
        )}

    <div style={{ marginBottom:14 }}>
     <RelationshipGraph userTools={analyzedTools} dynamicNodes={dynamicNodes} overlapIds={overlapIds}/>
    </div>
    <div style={{ marginBottom:14 }}>
     {analyzedTools.length > 0 && <StackSimulation totalSpend={totalSpend} analyzedTools={analyzedTools}/>}
    </div>
    <div style={{ background:PANEL, border:`1px solid ${BO}`, borderRadius:10, padding:"20px 24px" }}>
     <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
      <div style={{ fontSize:10, color:MUTED, letterSpacing:2.5, fontFamily:M }}>COMMUNITY BENCHMARKS</div>
      <div style={{ fontSize:10, color:MUTED }}>vs. <span style={{ color:TEXT }}>indie hackers</span></div>
     </div>
     <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)", gap:12, marginBottom:16 }}>
      {[
       { label:"You spend more than",         value:"66% of similar builders", color:WARN  },
       { label:"Your tool count is",           value:"Above average",            color:WARN  },
       { label:"Stack efficiency rank",        value:"Top 42%",                 color:BLUE  },
       { label:"Profitable builders use",      value:"4 tools or fewer",         color:GREEN },
      ].map(b => (
       <div key={b.label} style={{ background:PANEL_2, border:`1px solid ${BO}`, borderRadius:7, padding:"12px 14px" }}>
        <div style={{ fontSize:10, color:MUTED, marginBottom:4 }}>{b.label}</div>
        <div style={{ fontSize:14, fontWeight:700, color:b.color }}>{b.value}</div>
       </div>
      ))}
     </div>
     <div style={{ fontSize:9, color:MUTED, letterSpacing:2, marginBottom:10, fontFamily:M }}>TOP TOOLS AMONG PROFITABLE INDIE HACKERS</div>
     <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
      {benchmarks.map(b => (
       <div key={b.label} style={{ display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ flex:1, fontSize:11, color:MUTED }}>{b.label}</div>
        <div style={{ width:220 }}>
         <div style={{ height:3, background:"#1a2022", borderRadius:2 }}>
          <div style={{ width:`${b.pct}%`, height:"100%", background:`linear-gradient(90deg,${ACID_S},${ACID})`, borderRadius:2 }}/>
         </div>
        </div>
        <div style={{ width:32, textAlign:"right", fontSize:10, color:ACID, fontFamily:M }}>{b.pct}%</div>
       </div>
      ))}
     </div>
    </div>
    </>}
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
     .hektiq-sidebar { display: none !important; }
     .hektiq-main { padding: 12px !important; padding-bottom: 80px !important; }
     .hektiq-bottom-nav { display: flex !important; }
     .hektiq-grid { grid-template-columns: 1fr !important; }
     .hektiq-grid-2 { grid-template-columns: 1fr 1fr !important; }
    }
   `}</style>

   {/* Mobile bottom nav */}
   <div className="hektiq-bottom-nav" style={{ display:"none", position:"fixed", bottom:0, left:0, right:0, background:PANEL, borderTop:`1px solid ${BORDER}`, zIndex:100, padding:"8px 0" }}>
    {navItems.map(({label,icon}) => {
     const active = activeNav===label;
     return (
      <div key={label} onClick={()=>setActiveNav(label)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"6px 4px", cursor:"pointer", color:active?ACID:MUTED }}>
       <span style={{ fontSize:14 }}>{icon}</span>
       <span style={{ fontSize:7, letterSpacing:1, fontFamily:M }}>{label}</span>
      </div>
     );
    })}
   </div>

   {showAddTool && <AddToolModal onClose={() => setShowAddTool(false)} onAdd={handleAddTool} />}
   {showGithubImport && <GitHubImportModal onClose={() => setShowGithubImport(false)} onImport={(tools) => tools.forEach(t => handleAddTool(t))} />}
  </div>
 );
}