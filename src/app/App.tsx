import { useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from "motion/react";
import Spline from "@splinetool/react-spline";
import {
  Zap, Bell, ChevronDown, ArrowRight, Terminal,
  GitBranch, Cpu, Network, Lock, Activity, BarChart3, Plus,
  CheckCircle2, Clock, AlertCircle,
} from "lucide-react";

// ─── Replace this URL with your own Spline scene ───────────────────────────
// Create a sphere/orb scene at spline.design → share → copy scene URL
const SPLINE_SCENE = "https://prod.spline.design/vC3CwmLDM46Xmrym/scene.splinecode";
// <script type="module" src="https://unpkg.com/@splinetool/viewer@1.12.98/build/spline-viewer.js"></script>
// <spline-viewer url="https://prod.spline.design/vC3CwmLDM46Xmrym/scene.splinecode"></spline-viewer>

// ─── Data ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = ["Agents", "Pipelines", "Models", "Analytics", "Docs"];

const STAGES = [
  {
    chapter: "01 — DEPLOY",
    h1: "BUILD AGENTS",
    h2: "THAT SHIP.",
    body: "The production runtime for AI agents. Deploy, orchestrate, and observe Claude-powered workflows at any scale — without the infrastructure headache.",
    cta: null,
  },
  {
    chapter: "02 — ORCHESTRATE",
    h1: "CHAIN PIPELINES",
    h2: "YOUR WAY.",
    body: "Compose agents into multi-step workflows with branching logic, retries, and conditional execution paths. Ship to production on day one.",
    cta: null,
  },
  {
    chapter: "03 — OBSERVE",
    h1: "ZERO BLIND",
    h2: "SPOTS.",
    body: "Trace every token, tool call, and decision step. Full replay for debugging failed runs. Comprehensive telemetry across your entire agent fleet.",
    cta: null,
  },
];

const STATS = [
  { label: "API Calls / Day", value: "9.2M", delta: "+14%" },
  { label: "Active Agents", value: "1,204", delta: "+31 today" },
  { label: "Avg Latency", value: "284ms", delta: "−12ms" },
  { label: "Uptime SLA", value: "99.98%", delta: "30d avg" },
];

const AGENTS = [
  { id: "AGT-001", name: "DataHarvest Pro", status: "running", task: "Scraping market sentiment from 14 sources", uptime: "3h 22m", calls: 1847, model: "claude-sonnet-4-6" },
  { id: "AGT-002", name: "CodeReview Alpha", status: "running", task: "Reviewing PR #2291 — auth refactor", uptime: "47m", calls: 312, model: "claude-opus-4-8" },
  { id: "AGT-003", name: "IncidentResponder", status: "idle", task: "Awaiting trigger: p0 alert webhook", uptime: "12h 01m", calls: 0, model: "claude-haiku-4-5" },
  { id: "AGT-004", name: "ContentSynth", status: "error", task: "Rate limit hit on Twitter API v2", uptime: "1h 08m", calls: 2930, model: "claude-sonnet-4-6" },
];

const FEATURES = [
  { icon: Cpu, title: "Multi-Model Routing", body: "Route tasks intelligently across Opus, Sonnet, and Haiku based on cost, latency, and complexity." },
  { icon: Network, title: "Pipeline Orchestration", body: "Chain agents into composable pipelines with branching logic, retries, and conditional execution paths." },
  { icon: Lock, title: "Sandboxed Execution", body: "Every agent runs in an isolated environment with fine-grained permission scopes and audit logs." },
  { icon: Terminal, title: "Tool Registry", body: "Register custom tools once and expose them to any agent. Type-safe schemas, versioned APIs." },
  { icon: Activity, title: "Real-Time Observability", body: "Trace every token, tool call, and decision step. Full replay for debugging failed runs." },
  { icon: GitBranch, title: "Version Control", body: "Snapshot agent configs, prompts, and tool bindings. Roll back any agent to any prior version." },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

const fadeUpInView = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as number[], delay },
});

function StatusDot({ status }: { status: string }) {
  const c: Record<string, string> = { running: "#34d399", idle: "#fbbf24", error: "#f87171" };
  return (
    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: c[status] ?? "#888", boxShadow: status === "running" ? `0 0 6px ${c.running}` : undefined, flexShrink: 0 }} />
  );
}

function StatusChip({ status }: { status: string }) {
  const c: Record<string, string> = { running: "#34d399", idle: "#fbbf24", error: "#f87171" };
  const icons: Record<string, React.ReactNode> = { running: <CheckCircle2 size={11} />, idle: <Clock size={11} />, error: <AlertCircle size={11} /> };
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 4, color: c[status], fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>
      {icons[status]}{status}
    </span>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────

export default function App() {
  const [activeNav, setActiveNav] = useState("Agents");
  const [splineApp, setSplineApp] = useState<any>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end end"] });

  // ── Scroll-driven text stages ──────────────────────────────────────────
  // 4 stages across 0→1 scroll progress. Each ~25% wide with soft crossfades.
  const s1 = useTransform(scrollYProgress, [0, 0.04, 0.20, 0.27], [0, 1, 1, 0]);
  const s2 = useTransform(scrollYProgress, [0.26, 0.31, 0.45, 0.52], [0, 1, 1, 0]);
  const s3 = useTransform(scrollYProgress, [0.51, 0.56, 0.69, 0.76], [0, 1, 1, 0]);
  const s4 = useTransform(scrollYProgress, [0.75, 0.84], [0, 1]);

  // Parallax drift within each stage
  const s1y = useTransform(scrollYProgress, [0, 0.27], [0, -28]);
  const s2y = useTransform(scrollYProgress, [0.26, 0.52], [28, -28]);
  const s3y = useTransform(scrollYProgress, [0.51, 0.76], [28, -28]);
  const s4y = useTransform(scrollYProgress, [0.75, 1.0], [40, 0]);

  // ── Progress chapter dots ──────────────────────────────────────────────
  const d1 = useTransform(scrollYProgress, [0.04, 0.20, 0.27, 0.31], [1, 1, 0.25, 0.25]);
  const d2 = useTransform(scrollYProgress, [0.26, 0.31, 0.45, 0.52], [0.25, 1, 1, 0.25]);
  const d3 = useTransform(scrollYProgress, [0.51, 0.56, 0.69, 0.76], [0.25, 1, 1, 0.25]);
  const d4 = useTransform(scrollYProgress, [0.75, 0.84], [0.25, 1]);

  // ── Chapter label ──────────────────────────────────────────────────────
  const chapterLabel = useTransform(
    scrollYProgress,
    [0, 0.27, 0.52, 0.76, 1],
    ["01 — DEPLOY", "02 — ORCHESTRATE", "03 — OBSERVE", "04 — METRICS", "04 — METRICS"]
  );

  // ── Spline sphere tilt (CSS rotateY on canvas wrapper) ─────────────────
  // Gentle tilt that "turns" to a new face with each chapter
  const rawTilt = useTransform(
    scrollYProgress,
    [0, 0.25, 0.50, 0.75, 1],
    [0, 18, -12, 22, 8]
  );
  const sphereTilt = useSpring(rawTilt, { stiffness: 28, damping: 14 });
  const sphereScale = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.9, 1, 1, 1.04]);

  // ── Try to spin Spline's 3D object directly via its runtime API ─────────
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!splineApp) return;
    try {
      // Common object names in Spline orb/sphere scenes
      const obj =
        splineApp.findObjectByName("Sphere") ??
        splineApp.findObjectByName("sphere") ??
        splineApp.findObjectByName("Orb") ??
        splineApp.findObjectByName("Ball") ??
        splineApp.findObjectByName("Globe");
      if (obj) {
        obj.rotation.y = v * Math.PI * 4; // 2 full rotations
        obj.rotation.x = Math.sin(v * Math.PI * 2) * 0.3;
      }
    } catch {
      // Scene doesn't have a matching object — CSS tilt handles it
    }
  });

  const onSplineLoad = useCallback((spline: any) => {
    setSplineApp(spline);
  }, []);

  // ── Scroll hint ────────────────────────────────────────────────────────
  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  return (
    <div className="bg-background text-foreground" style={{ fontFamily: "'DM Sans',sans-serif" }}>

      {/* ─── Fixed Nav ─────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", backdropFilter: "blur(24px)", background: "rgba(12,12,15,0.75)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <motion.div whileHover={{ scale: 1.12, rotate: 15 }} transition={{ type: "spring", stiffness: 400, damping: 12 }} style={{ width: 32, height: 32, borderRadius: 8, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Zap size={16} color="#0c0c0f" />
          </motion.div>
          <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: "0.07em", color: "#edeae2" }}>AGENT FOUNDRY</span>
        </div>

        {/* Capsule nav */}
        <nav style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 3, background: "rgba(17,17,21,0.9)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 9999, padding: "5px 7px", backdropFilter: "blur(16px)" }}>
          {NAV_ITEMS.map((item) => (
            <motion.button key={item} onClick={() => setActiveNav(item)} whileHover={activeNav !== item ? { color: "#edeae2", background: "rgba(255,255,255,0.06)" } : {}} whileTap={{ scale: 0.94 }}
              style={{ padding: "5px 17px", borderRadius: 9999, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", transition: "all 0.18s", background: activeNav === item ? "#f97316" : "transparent", color: activeNav === item ? "#0c0c0f" : "#7a7a88", fontFamily: "'DM Sans',sans-serif" }}>
              {item}
            </motion.button>
          ))}
        </nav>

        {/* User */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, justifyContent: "flex-end" }}>
          <motion.button whileHover={{ scale: 1.08, borderColor: "rgba(249,115,22,.45)" }} whileTap={{ scale: 0.94 }} style={{ position: "relative", width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,.07)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Bell size={14} color="#7a7a88" />
            <span style={{ position: "absolute", top: 7, right: 7, width: 6, height: 6, borderRadius: "50%", background: "#f97316", boxShadow: "0 0 6px rgba(249,115,22,.9)" }} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.03, borderColor: "rgba(249,115,22,.35)" }} whileTap={{ scale: 0.96 }} style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 14px 4px 4px", borderRadius: 9999, border: "1px solid rgba(255,255,255,.07)", background: "transparent", cursor: "pointer" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#e11d48)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>AJ</div>
            <span style={{ fontSize: 13, color: "#7a7a88" }}>Alex J.</span>
            <ChevronDown size={11} color="#7a7a88" />
          </motion.button>
        </div>
      </motion.header>

      {/* ══════════════════════════════════════════════════════════════════
          PINNED HERO — 500vh scroll container
      ══════════════════════════════════════════════════════════════════ */}
      <div ref={heroRef} style={{ height: "500vh" }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>

          {/* ── Spline 3D sphere — full screen background ─────────────────── */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <div style={{ width: "100%", height: "100%", perspective: "1400px" }}>
              <motion.div style={{ rotateY: sphereTilt, scale: sphereScale, width: "100%", height: "100%", transformOrigin: "center center" }}>
                <Spline
                  scene={SPLINE_SCENE}
                  onLoad={onSplineLoad}
                  style={{ width: "100%", height: "100%" }}
                />
              </motion.div>
            </div>
          </div>

          {/* ── Dark gradient overlays (make text readable) ──────────────── */}
          {/* Top: nav fade */}
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to bottom, rgba(12,12,15,0.85) 0%, rgba(12,12,15,0.3) 18%, transparent 35%)", pointerEvents: "none" }} />
          {/* Bottom: text area darkening */}
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to top, rgba(12,12,15,0.98) 0%, rgba(12,12,15,0.75) 30%, rgba(12,12,15,0.2) 55%, transparent 70%)", pointerEvents: "none" }} />
          {/* Side vignettes */}
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "radial-gradient(ellipse at 50% 42%, transparent 38%, rgba(12,12,15,0.5) 72%)", pointerEvents: "none" }} />

          {/* ── Chapter label (top-left, below nav) ─────────────────────── */}
          <div style={{ position: "absolute", top: 88, left: 32, zIndex: 10 }}>
            <motion.span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.14em", color: "rgba(249,115,22,0.65)" }}>
              {chapterLabel}
            </motion.span>
          </div>

          {/* ── Stage progress dots (right edge) ────────────────────────── */}
          <div style={{ position: "absolute", right: 28, top: "50%", transform: "translateY(-50%)", zIndex: 10, display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
            {[d1, d2, d3, d4].map((dot, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <motion.div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316", opacity: dot, boxShadow: "0 0 8px rgba(249,115,22,0.7)" }} />
                {i < 3 && <div style={{ width: 1, height: 16, background: "rgba(249,115,22,0.15)" }} />}
              </div>
            ))}
          </div>

          {/* ── Text stages container ────────────────────────────────────── */}
          {/* All stages stack here; each fades in/out independently */}
          <div style={{ position: "absolute", bottom: "18%", left: 0, right: 0, zIndex: 5, padding: "0 40px" }}>
            <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", height: 260 }}>

              {/* Stage 1, 2, 3 — headline + body */}
              {STAGES.map((stage, i) => {
                const opacity = [s1, s2, s3][i];
                const y = [s1y, s2y, s3y][i];
                return (
                  <motion.div key={i} style={{ opacity, y, position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, width: "fit-content" }}
                    >
                      <span style={{ width: 20, height: 1, background: "#f97316", display: "inline-block" }} />
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.14em", color: "#f97316", textTransform: "uppercase" }}>{stage.chapter}</span>
                    </motion.div>

                    <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: "clamp(52px, 8vw, 88px)", lineHeight: 0.92, letterSpacing: "-0.01em", margin: "0 0 20px" }}>
                      <span style={{ color: "#edeae2", display: "block" }}>{stage.h1}</span>
                      <span style={{ color: "#f97316", display: "block" }}>{stage.h2}</span>
                    </h1>

                    <p style={{ fontSize: 16, color: "rgba(237,234,226,0.6)", maxWidth: 520, lineHeight: 1.7, margin: 0 }}>
                      {stage.body}
                    </p>
                  </motion.div>
                );
              })}

              {/* Stage 4 — stats + CTAs */}
              <motion.div style={{ opacity: s4, y: s4y, position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, width: "fit-content" }}>
                  <span style={{ width: 20, height: 1, background: "#f97316", display: "inline-block" }} />
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.14em", color: "#f97316" }}>04 — METRICS</span>
                </div>

                {/* Stats row */}
                <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
                  {STATS.map((stat) => (
                    <motion.div key={stat.label}
                      whileHover={{ scale: 1.04, borderColor: "rgba(249,115,22,0.45)" }}
                      style={{ background: "rgba(13,13,17,0.85)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 20px", backdropFilter: "blur(12px)", flex: "1 1 130px", minWidth: 130 }}>
                      <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 28, fontWeight: 700, color: "#edeae2", lineHeight: 1.05 }}>{stat.value}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: "#7a7a88", fontFamily: "'JetBrains Mono',monospace" }}>{stat.label}</span>
                        <span style={{ fontSize: 10, color: "#34d399", fontFamily: "'JetBrains Mono',monospace" }}>{stat.delta}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* CTAs */}
                <div style={{ display: "flex", gap: 14 }}>
                  <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 36px rgba(249,115,22,0.5)" }} whileTap={{ scale: 0.96 }}
                    style={{ display: "flex", alignItems: "center", gap: 7, background: "#f97316", color: "#0c0c0f", border: "none", padding: "12px 28px", borderRadius: 9999, fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "box-shadow 0.2s", fontFamily: "'DM Sans',sans-serif" }}>
                    Start Building <ArrowRight size={14} />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.04, borderColor: "rgba(255,255,255,0.22)", color: "#edeae2" }} whileTap={{ scale: 0.96 }}
                    style={{ display: "flex", alignItems: "center", gap: 7, background: "transparent", color: "#7a7a88", border: "1px solid rgba(255,255,255,0.1)", padding: "12px 26px", borderRadius: 9999, fontWeight: 500, fontSize: 14, cursor: "pointer", transition: "border-color 0.18s, color 0.18s", fontFamily: "'DM Sans',sans-serif" }}>
                    <Terminal size={13} /> View Docs
                  </motion.button>
                </div>
              </motion.div>

            </div>
          </div>

          {/* ── Scroll hint ──────────────────────────────────────────────── */}
          <motion.div style={{ opacity: hintOpacity, position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, pointerEvents: "none", zIndex: 10 }}>
            <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: 20, height: 32, borderRadius: 10, border: "1px solid rgba(249,115,22,0.35)", display: "flex", justifyContent: "center", paddingTop: 6 }}>
              <motion.div animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }} transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: 3, height: 6, borderRadius: 2, background: "#f97316" }} />
            </motion.div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.18em", color: "rgba(249,115,22,0.5)" }}>SCROLL</span>
          </motion.div>

        </div>
      </div>
      {/* ══════════════════════ end pinned hero ══════════════════════════ */}

      {/* ─── Active Agents ─────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px 96px", maxWidth: 1060, margin: "0 auto" }}>
        <motion.div {...fadeUpInView(0)} style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: "0.04em", color: "#edeae2", marginBottom: 6 }}>ACTIVE AGENTS</h2>
            <p style={{ fontSize: 13, color: "#7a7a88" }}>4 agents deployed — 2 running, 1 idle, 1 faulted</p>
          </div>
          <motion.button whileHover={{ scale: 1.05, background: "rgba(249,115,22,.1)", borderColor: "rgba(249,115,22,.5)" }} whileTap={{ scale: 0.96 }}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#f97316", border: "1px solid rgba(249,115,22,.3)", padding: "8px 18px", borderRadius: 9999, background: "transparent", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            <Plus size={13} /> New Agent
          </motion.button>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(460px,1fr))", gap: 16 }}>
          {AGENTS.map((agent, i) => (
            <motion.div key={agent.id} {...fadeUpInView(i * 0.09)}
              whileHover={{ y: -5, borderColor: "rgba(249,115,22,.38)", boxShadow: "0 16px 48px rgba(0,0,0,.55), 0 0 0 1px rgba(249,115,22,.14)" }}
              style={{ background: "#131317", border: "1px solid rgba(255,255,255,.07)", borderRadius: 20, padding: 22, cursor: "pointer", transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <StatusDot status={agent.status} />
                  <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "0.03em", color: "#edeae2" }}>{agent.name}</span>
                </div>
                <StatusChip status={agent.status} />
              </div>
              <p style={{ fontSize: 13, color: "#7a7a88", marginBottom: 16, lineHeight: 1.55 }}>{agent.task}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.06)" }}>
                <div style={{ display: "flex", gap: 24 }}>
                  {[{ l: "uptime", v: agent.uptime }, { l: "tool calls", v: agent.calls.toLocaleString() }].map(({ l, v }) => (
                    <div key={l}>
                      <div style={{ fontSize: 10, color: "#7a7a88", fontFamily: "'JetBrains Mono',monospace", marginBottom: 2 }}>{l}</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#edeae2" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: 10, color: "#7a7a88", background: "rgba(255,255,255,.05)", padding: "4px 10px", borderRadius: 9999, fontFamily: "'JetBrains Mono',monospace" }}>{agent.model}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 24px 96px", maxWidth: 1060, margin: "0 auto" }}>
        <motion.div {...fadeUpInView(0)} style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: "0.04em", color: "#edeae2", marginBottom: 8 }}>BUILT FOR PRODUCTION</h2>
          <p style={{ fontSize: 13, color: "#7a7a88", maxWidth: 460, lineHeight: 1.65 }}>Everything you need to move from prototype to 24/7 deployment — without stitching together five different services.</p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} {...fadeUpInView(i * 0.07)}
              whileHover={{ y: -7, borderColor: "rgba(249,115,22,.3)", boxShadow: "0 18px 50px rgba(0,0,0,.5), 0 0 0 1px rgba(249,115,22,.1)" }}
              style={{ background: "#131317", border: "1px solid rgba(255,255,255,.07)", borderRadius: 20, padding: 24, cursor: "default", transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s" }}>
              <motion.div whileHover={{ scale: 1.12, background: "rgba(249,115,22,.22)" }} transition={{ duration: 0.2 }}
                style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(249,115,22,.1)", border: "1px solid rgba(249,115,22,.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <f.icon size={18} color="#f97316" />
              </motion.div>
              <h3 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "0.03em", color: "#edeae2", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#7a7a88", lineHeight: 1.65 }}>{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA Band ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 24px 96px", maxWidth: 1060, margin: "0 auto" }}>
        <motion.div {...fadeUpInView(0)} style={{ position: "relative", borderRadius: 28, border: "1px solid rgba(249,115,22,.2)", background: "linear-gradient(135deg,rgba(249,115,22,.09) 0%,#131317 60%)", padding: "72px 40px", textAlign: "center", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%,rgba(249,115,22,.09) 0%,transparent 60%)", pointerEvents: "none" }} />
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }} style={{ marginBottom: 20, display: "inline-flex" }}>
            <BarChart3 size={28} color="#f97316" />
          </motion.div>
          <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: "clamp(26px,4vw,42px)", letterSpacing: "0.02em", color: "#edeae2", marginBottom: 14, position: "relative" }}>READY TO FORGE YOUR FIRST AGENT?</h2>
          <p style={{ color: "#7a7a88", fontSize: 14, maxWidth: 420, margin: "0 auto 32px", lineHeight: 1.65, position: "relative" }}>Start free with up to 3 agents. No credit card required. First production pipeline in under 10 minutes.</p>
          <motion.button whileHover={{ scale: 1.06, boxShadow: "0 0 44px rgba(249,115,22,.5)" }} whileTap={{ scale: 0.96 }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f97316", color: "#0c0c0f", border: "none", padding: "14px 36px", borderRadius: 9999, fontWeight: 700, fontSize: 14, cursor: "pointer", position: "relative", fontFamily: "'DM Sans',sans-serif" }}>
            Get Started Free <ArrowRight size={15} />
          </motion.button>
        </motion.div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────────── */}
      <motion.footer {...fadeUpInView(0)} style={{ borderTop: "1px solid rgba(255,255,255,.05)", padding: "26px 24px", maxWidth: 1060, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={11} color="#0c0c0f" />
          </div>
          <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.07em", color: "#7a7a88" }}>AGENT FOUNDRY</span>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 11, color: "#7a7a88", fontFamily: "'JetBrains Mono',monospace" }}>
          {["Privacy", "Terms", "Status", "© 2026 Agent Foundry Inc."].map((t) => (
            <motion.span key={t} whileHover={{ color: "#edeae2" }} style={{ cursor: "pointer", transition: "color 0.15s" }}>{t}</motion.span>
          ))}
        </div>
      </motion.footer>

    </div>
  );
}
