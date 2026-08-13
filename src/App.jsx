/**
 * JEE Study OS — App.jsx
 */

import { useState, useEffect, useCallback, useRef, useMemo, Fragment } from "react";

// ─── GLOBAL STYLES ─────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --bg-base:      #080C14;
    --bg-surface:   #0D1320;
    --bg-elevated:  #121929;
    --bg-hover:     #19203A;
    --border-sub:   #1C2540;
    --border-main:  #243058;
    --text-primary: #EDF2FF;
    --text-sec:     #8DA0C4;
    --text-muted:   #4C5F85;
    --text-dim:     #2E3D5E;
    --accent-cyan:  #38D9F5;
    --accent-green: #3DFC9A;
    --accent-purple:#C76EFF;
    --accent-orange:#FF9F43;
    --accent-red:   #FF6B6B;
  }

  body { background: var(--bg-base); color: var(--text-primary); font-family: 'JetBrains Mono', monospace; margin: 0; }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border-main); border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--accent-cyan); }
  * { scrollbar-width: thin; scrollbar-color: var(--border-main) transparent; }

  @keyframes dropIn   { from { opacity:0; transform:translateY(-24px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes slideUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes scaleIn  { from { opacity:0; transform:scale(0.92) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes toastIn  { from { opacity:0; transform:translateY(10px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes toastOut { from { opacity:1; transform:translateY(0) scale(1); } to { opacity:0; transform:translateY(6px) scale(0.97); } }
  @keyframes dayGlow  { 0%,100% { box-shadow:0 0 0 0 rgba(61,252,154,0); } 50% { box-shadow:0 0 18px 1px rgba(61,252,154,0.28); } }

  .help-overlay  { animation: fadeIn 0.18s ease forwards; }
  .help-panel    { animation: dropIn 0.22s cubic-bezier(0.34,1.3,0.64,1) forwards; }
  .cal-overlay   { animation: fadeIn 0.2s ease forwards; }
  .cal-panel     { animation: scaleIn 0.25s cubic-bezier(0.34,1.2,0.64,1) forwards; }
  .cmd-dropdown  { animation: slideUp 0.12s ease forwards; }

  .cal-day-cell { transition: background 0.1s, border-color 0.1s, transform 0.1s; cursor: pointer; }
  .cal-day-cell:hover { background: var(--bg-hover) !important; transform: scale(1.04); }
  .cal-day-cell.selected  { border-color: var(--accent-cyan)   !important; background: #38D9F515 !important; }
  .cal-day-cell.is-today  { border-color: var(--accent-orange) !important; }

  .toast-item        { animation: toastIn 0.22s cubic-bezier(0.34,1.3,0.64,1) forwards; }
  .toast-item.leaving { animation: toastOut 0.2s ease forwards; }

  .task-card-in { animation: slideUp 0.2s ease forwards; }
  .note-row-in  { animation: slideUp 0.18s ease forwards; }
  .chapter-row-in { animation: fadeIn 0.15s ease forwards; }

  .day-complete-glow { animation: dayGlow 2.6s ease-in-out infinite; }

  .day-col-drop-active { outline: 2px dashed var(--accent-cyan) !important; outline-offset: -2px; }

  .task-drop-indicator { height:3px; border-radius:99; background:var(--accent-cyan); margin:2px 2px 8px; box-shadow:0 0 8px 1px #38D9F580; animation: fadeIn 0.1s ease forwards; }

  .task-card-draggable { cursor: grab; }
  .task-card-draggable:active { cursor: grabbing; }

  .sidebar-rail-btn { transition: background 0.15s, color 0.15s, transform 0.15s; }
  .sidebar-rail-btn:hover { background: var(--bg-hover) !important; transform: scale(1.08); }

  .resize-handle:hover .resize-handle-grip { background: var(--text-sec) !important; }

  /* ── Hero / setup screen ── */
  @keyframes heroFloat  { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14px,-18px) scale(1.06); } }
  @keyframes heroFloat2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-18px,14px) scale(1.08); } }
  @keyframes heroFloat3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(10px,10px) scale(0.95); } }
  @keyframes heroTitleIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmerSweep { from { transform: translateX(-120%) skewX(-15deg); } to { transform: translateX(220%) skewX(-15deg); } }
  @keyframes gridDrift { from { background-position: 0 0; } to { background-position: 48px 48px; } }

  .hero-blob-a { animation: heroFloat 9s ease-in-out infinite; }
  .hero-blob-b { animation: heroFloat2 11s ease-in-out infinite; }
  .hero-blob-c { animation: heroFloat3 7.5s ease-in-out infinite; }
  .hero-grid   { animation: gridDrift 6s linear infinite; }
  .hero-title  { animation: heroTitleIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
  .hero-sub    { animation: heroTitleIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.08s forwards; opacity:0; }
  .hero-cta    { animation: heroTitleIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.16s forwards; opacity:0; }
  .hero-foot   { animation: heroTitleIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.24s forwards; opacity:0; }

  .hero-btn { position:relative; overflow:hidden; transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease; }
  .hero-btn:hover { transform: translateY(-2px); }
  .hero-btn::after { content:""; position:absolute; top:0; left:0; width:36%; height:100%; background:linear-gradient(120deg, transparent, rgba(255,255,255,0.16), transparent); transform:translateX(-120%) skewX(-15deg); }
  .hero-btn:hover::after { animation: shimmerSweep 0.9s ease; }

  .day-header-hover { transition: filter 0.15s; }
  .day-header-hover:hover { filter: brightness(1.06); }

  .press-scale { transition: transform 0.1s ease, color 0.15s, border-color 0.15s, background 0.15s; }
  .press-scale:active { transform: scale(0.94); }

  @keyframes countBump { 0% { transform:scale(1); } 40% { transform:scale(1.18); } 100% { transform:scale(1); } }
  .count-bump { animation: countBump 0.32s cubic-bezier(0.34,1.56,0.64,1); }

  ::-webkit-scrollbar { width:9px; height:9px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--border-main); border-radius:99px; border:2px solid var(--bg-base); }
  ::-webkit-scrollbar-thumb:hover { background:var(--text-dim); }

  /* ── Mobile / touch safety ── */
  html { -webkit-text-size-adjust: 100%; }
  body { -webkit-tap-highlight-color: transparent; overscroll-behavior-y: none; }
  input, textarea, select { font-size: 16px; } /* prevents iOS Safari auto-zoom on focus */
  @media (min-width: 861px) { input, textarea, select { font-size: inherit; } }
  a, button { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
  .safe-top    { padding-top: env(safe-area-inset-top, 0px); }
  .safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }

  @keyframes sheetIn  { from { transform: translateY(100%); } to { transform: translateY(0); } }
  @keyframes sheetBackdropIn { from { opacity:0; } to { opacity:1; } }
  .action-sheet-backdrop { animation: sheetBackdropIn 0.15s ease forwards; }
  .action-sheet { animation: sheetIn 0.22s cubic-bezier(0.32,0.72,0,1) forwards; }

  .tab-bar-btn { transition: color 0.15s, transform 0.12s; }
  .tab-bar-btn:active { transform: scale(0.92); }

  .app-shell { height: 100vh; }
  @supports (height: 100dvh) { .app-shell { height: 100dvh; } }
`;

function InjectStyles() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);

    // Ensure a correct mobile viewport (no accidental pinch-zoom traps, and
    // safe-area awareness for notched phones) regardless of the host page.
    let meta = document.querySelector('meta[name="viewport"]');
    let createdMeta = false;
    if (!meta) { meta = document.createElement("meta"); meta.name = "viewport"; document.head.appendChild(meta); createdMeta = true; }
    const prevContent = meta.getAttribute("content");
    meta.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover");

    return () => {
      document.head.removeChild(el);
      if (createdMeta) meta.remove();
      else if (prevContent !== null) meta.setAttribute("content", prevContent);
    };
  }, []);
  return null;
}

// ─── TOAST NOTIFICATIONS ───────────────────────────────────────────────────────
// Lightweight, self-contained feedback system used for anything that happens
// off-screen or via keyboard shortcut / drag-drop, so actions always feel
// acknowledged. See <Toaster/> for rendering.

// Brief scale-pulse whenever a numeric value changes — used on header badges
// so completing a task or hitting a streak milestone feels acknowledged.
function useBump(value) {
  const [bump, setBump] = useState(false);
  const prevRef = useRef(value);
  useEffect(() => {
    if (prevRef.current !== value) {
      prevRef.current = value;
      setBump(true);
      const t = setTimeout(() => setBump(false), 320);
      return () => clearTimeout(t);
    }
  }, [value]);
  return bump;
}

// Tracks whether we're on a small / touch-primary viewport, so the layout can
// switch from the 3-pane desktop workspace to a single-pane tabbed app.
// Re-evaluated live on resize/orientation change (not just at mount).
function useIsMobile(breakpoint = 860) {
  const getMatch = () => typeof window !== "undefined" && window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
  const [isMobile, setIsMobile] = useState(getMatch);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener ? mq.addEventListener("change", handler) : mq.addListener(handler);
    window.addEventListener("orientationchange", handler);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", handler) : mq.removeListener(handler);
      window.removeEventListener("orientationchange", handler);
    };
  }, [breakpoint]);
  return isMobile;
}

function useToast() {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, opts = {}) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((t) => [...t, { id, message, icon: opts.icon ?? "✓", leaving: false }]);
    const duration = opts.duration ?? 2600;
    setTimeout(() => setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x))), duration);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration + 220);
  }, []);

  return { toasts, push };
}

function Toaster({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position:"fixed", bottom:18, right:18, display:"flex", flexDirection:"column", gap:8, zIndex:300, pointerEvents:"none", maxWidth:300 }}>
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item${t.leaving ? " leaving" : ""}`} style={{
          display:"flex", alignItems:"center", gap:9,
          background:"var(--bg-elevated)", border:"1px solid var(--border-main)",
          borderRadius:10, padding:"9px 14px", boxShadow:"0 16px 32px rgba(0,0,0,0.45)",
          fontFamily:"'JetBrains Mono', monospace", fontSize:12, color:"var(--text-primary)",
        }}>
          <span style={{ flexShrink:0, fontSize:12 }}>{t.icon}</span>
          <span style={{ lineHeight:1.4 }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── RESIZE HANDLE ─────────────────────────────────────────────────────────────
// Generic vertical drag-to-resize divider. Drag to resize, double-click to
// reset to the default size. Used between the Notepad and Mastery Ledger.

function ResizeHandle({ axis = "y", onResizeDelta, onReset, onResizeStart, onResizeEnd }) {
  const draggingRef = useRef(false);
  const lastPosRef  = useRef(0);
  const [active, setActive] = useState(false);
  const isX = axis === "x";

  useEffect(() => {
    const handleMove = (e) => {
      if (!draggingRef.current) return;
      const pos = isX ? e.clientX : e.clientY;
      const d = pos - lastPosRef.current;
      lastPosRef.current = pos;
      onResizeDelta(d);
    };
    const handleUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setActive(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      onResizeEnd?.();
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [onResizeDelta, onResizeEnd, isX]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    draggingRef.current = true;
    lastPosRef.current = isX ? e.clientX : e.clientY;
    setActive(true);
    document.body.style.cursor = isX ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";
    onResizeStart?.();
  };

  return (
    <div
      className="resize-handle"
      onMouseDown={handleMouseDown}
      onDoubleClick={onReset}
      title="Drag to resize · double-click to reset"
      style={isX ? {
        flexShrink:0, width:9, cursor:"col-resize", position:"relative",
        display:"flex", alignItems:"center", justifyContent:"center",
        background: active ? "#38D9F512" : "transparent",
        borderLeft:"1px solid var(--border-sub)", borderRight:"1px solid var(--border-sub)",
        transition:"background 0.15s",
      } : {
        flexShrink:0, height:9, cursor:"row-resize", position:"relative",
        display:"flex", alignItems:"center", justifyContent:"center",
        background: active ? "#38D9F512" : "transparent",
        borderTop:"1px solid var(--border-sub)", borderBottom:"1px solid var(--border-sub)",
        transition:"background 0.15s",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--bg-hover)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <div className="resize-handle-grip" style={isX
        ? { width:3, height:28, borderRadius:99, background: active ? "var(--accent-cyan)" : "var(--border-main)", transition:"background 0.15s" }
        : { width:28, height:3, borderRadius:99, background: active ? "var(--accent-cyan)" : "var(--border-main)", transition:"background 0.15s" }} />
    </div>
  );
}

// ─── SUBJECT CONFIG ────────────────────────────────────────────────────────────

const S = {
  Physics:     { accent:"#38D9F5", accentBg:"#38D9F512", accentBorder:"#38D9F535", label:"PHY" },
  Chemistry:   { accent:"#3DFC9A", accentBg:"#3DFC9A12", accentBorder:"#3DFC9A35", label:"CHM" },
  Mathematics: { accent:"#C76EFF", accentBg:"#C76EFF12", accentBorder:"#C76EFF35", label:"MTH" },
};

// ─── FULL JEE SYLLABUS ─────────────────────────────────────────────────────────

const JEE_SYLLABUS = {
  Physics: {
    "Class 11": ["Units & Measurements","Kinematics","Laws of Motion","Work Energy & Power","Rotational Mechanics","Gravitation","Fluid Mechanics", "Solids", "Kinetic Theory of Gases", "Thermodynamics","Oscillations","Waves"],
    "Class 12": ["Electrostatics","Capacitance", "Current Electricity","Moving Charges & Magnetism","Magnetism & Matter","Electromagnetic Induction","Alternating Current","Electromagnetic Waves","Ray Optics","Wave Optics","Dual Nature of Radiation","Atoms & Nuclei","Semiconductors"],
  },
  Chemistry: {
    "Class 11": ["Basic Concepts", "Atomic Structure", "Chemical Bonding","Thermodynamics", "Equilibrium", "Redox Reactions", "s-Block Elements","p-Block Elements (11)","General Organic Chemistry","Hydrocarbons"],
    "Class 12": ["Solid State","Solutions","Electrochemistry","Chemical Kinetics","Surface Chemistry","d & f Block Elements","Coordination Compounds","Haloalkanes & Haloarenes","Alcohols Phenols Ethers","Aldehydes Ketones","Carboxylic Acids","Amines","Biomolecules","Polymers","Chemistry in Everyday Life"],
  },
  Mathematics: {
    "Class 11": ["Sets","Trigonometry","Complex Numbers","Quadratic Equations","Sequences & Series","Straight Lines","Circles", "Parabola", "Hyperbola","Permutations & Combinations","Binomial Theorem","Statistics","Probability (11)"],
    "Class 12": ["Relations & Functions","Inverse Trigonometry","Matrices & Determinants", "Limits", "Continuity", "Differentiability", "Methods Of Differentiation", "Applications of Derivatives","Integrals","Applications of Integrals","Differential Equations","Vectors","3D Geometry","Linear Programming","Probability (12)"],
  },
};

// Flat list for matching
const ALL_CHAPTERS = [];
for (const [subject, classes] of Object.entries(JEE_SYLLABUS))
  for (const chapters of Object.values(classes))
    for (const ch of chapters)
      ALL_CHAPTERS.push({ subject, chapter: ch });

// ─── SMART FUZZY ENGINE ────────────────────────────────────────────────────────

function makeTrigrams(str) {
  const s = str.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const set = new Set();
  for (let i = 0; i <= s.length - 3; i++) set.add(s.slice(i, i + 3));
  return set;
}

function trigramSim(a, b) {
  const ta = makeTrigrams(a), tb = makeTrigrams(b);
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const g of ta) if (tb.has(g)) inter++;
  return inter / (ta.size + tb.size - inter);
}

function tokenOverlap(query, target) {
  const qw = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
  const tw = target.toLowerCase();
  if (!qw.length) return 0;
  let hits = 0;
  for (const w of qw) if (tw.includes(w)) hits++;
  return hits / qw.length;
}

function prefixBoost(query, target) {
  const q = query.toLowerCase().replace(/\s+/g, "");
  const t = target.toLowerCase().replace(/\s+/g, "");
  if (t.startsWith(q)) return 0.4;
  if (t.includes(q))   return 0.15;
  return 0;
}

// Acronym: "wep"→"Work Energy & Power", "em"→"Electromagnetic Induction", "rot"→"Rotational Mechanics"
function acronymScore(query, target) {
  const q = query.toLowerCase().replace(/\s/g, "");
  if (q.length < 2) return 0;
  const initials = target.toLowerCase().split(/[\s&()]+/).filter(Boolean).map(w => w[0]).join("");
  if (initials === q) return 0.9;
  if (initials.startsWith(q)) return 0.5;
  // first-letters of multi-word target start-match
  const words = target.toLowerCase().split(/\s+/);
  const wordInitials = words.map(w => w[0]).join("");
  if (wordInitials.startsWith(q)) return 0.4;
  return 0;
}

function chapterScore(query, entry) {
  if (!query) return 0;
  const q = query.toLowerCase().trim();
  const ch = entry.chapter;
  return trigramSim(q, ch) * 0.40
       + tokenOverlap(q, ch) * 0.30
       + prefixBoost(q, ch)
       + acronymScore(q, ch);
}

function rankChapters(query, subjectFilter, topN = 6) {
  if (!query || query.length < 1) return [];
  const pool = subjectFilter ? ALL_CHAPTERS.filter(x => x.subject === subjectFilter) : ALL_CHAPTERS;
  return pool
    .map(entry => ({ ...entry, score: chapterScore(query, entry) }))
    .filter(x => x.score > 0.06)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

function getChapterTheme(text) {
  const match = rankChapters(text, null, 1)[0] ?? null;
  const cfg = match?.subject ? (S[match.subject] ?? S.Physics) : null;
  const isChapterLike = Boolean(match && match.score > 0.32);
  return {
    match,
    cfg,
    isChapterLike,
    badgeColor: isChapterLike ? cfg.accent : "var(--accent-orange)",
    badgeBg: isChapterLike ? cfg.accentBg : "var(--accent-orange)12",
    badgeBorder: isChapterLike ? cfg.accentBorder : "var(--accent-orange)35",
    badgeText: isChapterLike ? cfg.label : "NOTE",
  };
}

// ─── COMMAND PARSER ────────────────────────────────────────────────────────────
//
//  FORMAT:  [subject]  chapter-query  [/ note]  [@day]
//
//  subject  → p | ph | phy | phys | physics
//             c | ch | chem | chemistry
//             m | ma | math | maths | mathematics
//  chapter  → fuzzy-matched words (trigram + token + prefix + acronym)
//  /note    → optional, everything after first "/"
//  @day     → @t @today | @y @yd @yday @yesterday | @tmrw @tmr @tom @tomorrow @next
//
//  Examples:
//    phy waves           → Physics · Waves · today
//    c eq @tmrw          → Chemistry · Equilibrium · tomorrow
//    wep /hc verma ex3   → Physics · Work Energy & Power · note:hc verma ex3
//    rot mech @y         → Physics · Rotational Mechanics · yesterday
//    integ               → Mathematics · Integrals
//    em ind              → Physics · Electromagnetic Induction
//    m mdet              → Mathematics · Matrices & Determinants

const SUBJECT_ALIASES = {
  p:"Physics", ph:"Physics", phy:"Physics", phys:"Physics", physics:"Physics",
  c:"Chemistry", ch:"Chemistry", chem:"Chemistry", chemistry:"Chemistry",
  m:"Mathematics", ma:"Mathematics", math:"Mathematics", maths:"Mathematics", mathematics:"Mathematics",
};

const DAY_ALIASES = {
  t:"today", today:"today",
  y:"yesterday", yd:"yesterday", yday:"yesterday", yesterday:"yesterday", prev:"yesterday",
  tmrw:"tomorrow", tmr:"tomorrow", tom:"tomorrow", tomorrow:"tomorrow", next:"tomorrow",
};

function parseCommand(raw) {
  if (!raw.trim()) return null;
  let rest = raw.trim();

  // 1. Extract @day tokens anywhere in the string
  let targetDay = "today";
  rest = rest.replace(/@(\S+)/g, (full, token) => {
    const d = DAY_ALIASES[token.toLowerCase()];
    if (d) { targetDay = d; return ""; }
    return full;
  }).replace(/\s+/g, " ").trim();

  // 2. Extract /note — everything after the first "/"
  let note = "";
  const slashIdx = rest.indexOf("/");
  if (slashIdx !== -1) {
    note = rest.slice(slashIdx + 1).trim();
    rest = rest.slice(0, slashIdx).trim();
  }

  // 3. Detect subject prefix (first token only)
  let subjectFilter = null;
  const tokens = rest.split(/\s+/);
  if (tokens.length > 0 && SUBJECT_ALIASES[tokens[0].toLowerCase()]) {
    subjectFilter = SUBJECT_ALIASES[tokens[0].toLowerCase()];
    tokens.shift();
    rest = tokens.join(" ");
  }

  // 4. What remains is the chapter query
  const chapterQuery = rest.trim();

  // 5. Score and rank
  const ranked = rankChapters(chapterQuery, subjectFilter);
  const best   = ranked[0] ?? null;

  return {
    raw,
    chapterQuery,
    subjectFilter,
    note,
    targetDay,
    ranked,
    subject:   best?.subject  ?? subjectFilter ?? "Physics",
    chapter:   best?.chapter  ?? (chapterQuery || "General"),
    score:     best?.score    ?? 0,
    confident: (best?.score ?? 0) > 0.20,
  };
}

// ─── DEFAULTS & HELPERS ────────────────────────────────────────────────────────

const DEFAULT_DATA = () => ({
  meta: { version: "1.0.0", lastModified: new Date().toISOString(), streakCount: 0 },
  days: {},
  notes: [],
});

const uid = () => "t_" + Math.random().toString(36).slice(2, 9) + "_" + Date.now();
const noteUid = () => "n_" + Math.random().toString(36).slice(2, 9) + "_" + Date.now();

const normalizeData = (raw) => {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    meta: { ...DEFAULT_DATA().meta, ...(source.meta ?? {}) },
    days: source.days ?? {},
    notes: Array.isArray(source.notes)
      ? source.notes.map((note) => ({
          id: note.id ?? noteUid(),
          text: String(note.text ?? "").trim(),
          note: String(note.note ?? "").trim(),
          done: Boolean(note.done),
          createdAt: note.createdAt ?? new Date().toISOString(),
        })).filter((note) => note.text.length > 0)
      : [],
  };
};

const todayStr = () => {
  const n = new Date();
  return [n.getFullYear(), String(n.getMonth()+1).padStart(2,"0"), String(n.getDate()).padStart(2,"0")].join("-");
};

const shiftDateStr = (iso, step = 0) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m-1, d+step)).toISOString().slice(0, 10);
};

const fmtDateBig = (iso) => new Date(iso+"T00:00:00").toLocaleDateString("en-US", { month:"short", day:"numeric" });
const fmtWeekday = (iso) => new Date(iso+"T00:00:00").toLocaleDateString("en-US", { weekday:"long" });
const fmtYear    = (iso) => iso.slice(0, 4);

// ─── FILE SYSTEM ACCESS ────────────────────────────────────────────────────────

const fsaSupported = () => typeof window !== "undefined" && typeof window.showOpenFilePicker === "function";

async function openFilePicker() {
  const [fh] = await window.showOpenFilePicker({ types:[{ description:"JSON Data File", accept:{"application/json":[".json"]} }] });
  return fh;
}
async function saveFilePicker() {
  return window.showSaveFilePicker({ suggestedName:"jee-study-data.json", types:[{ description:"JSON Data File", accept:{"application/json":[".json"]} }] });
}
async function readFH(fh) {
  const text = await (await fh.getFile()).text();
  try { return normalizeData(JSON.parse(text)); } catch { return null; }
}
async function writeFH(fh, data) {
  const w = await fh.createWritable();
  await w.write(JSON.stringify(data, null, 2));
  await w.close();
}

// ─── SETUP SCREEN ──────────────────────────────────────────────────────────────

function SetupScreen({ onReady }) {
  const [error, setError] = useState("");
  const handleOpen = async () => {
    try { const fh = await openFilePicker(); onReady(fh, (await readFH(fh)) ?? normalizeData(DEFAULT_DATA())); }
    catch (e) { if (e.name !== "AbortError") setError(e.message); }
  };
  const handleCreate = async () => {
    try { const fh = await saveFilePicker(); const fresh = normalizeData(DEFAULT_DATA()); await writeFH(fh, fresh); onReady(fh, fresh); }
    catch (e) { if (e.name !== "AbortError") setError(e.message); }
  };
  return (
    <div style={{ position:"relative", minHeight:"100vh", background:"var(--bg-base)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"2.5rem", fontFamily:"'JetBrains Mono', monospace", padding:"0 1.5rem", overflow:"hidden" }}>

      {/* Ambient background: drifting grid + floating gradient blobs */}
      <div className="hero-grid" style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize:"48px 48px", pointerEvents:"none" }} />
      <div className="hero-blob-a" style={{ position:"absolute", top:"12%", left:"18%", width:340, height:340, borderRadius:"50%", background:"radial-gradient(circle, #38D9F522, transparent 70%)", filter:"blur(10px)", pointerEvents:"none" }} />
      <div className="hero-blob-b" style={{ position:"absolute", bottom:"14%", right:"16%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, #B084FC22, transparent 70%)", filter:"blur(10px)", pointerEvents:"none" }} />
      <div className="hero-blob-c" style={{ position:"absolute", top:"52%", right:"32%", width:220, height:220, borderRadius:"50%", background:"radial-gradient(circle, #3DFC9A1C, transparent 70%)", filter:"blur(10px)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 40%, transparent 0%, var(--bg-base) 78%)", pointerEvents:"none" }} />

      <div className="hero-title" style={{ textAlign:"center", position:"relative", opacity:0 }}>
        <p style={{ fontSize:11, letterSpacing:"0.5em", color:"var(--text-muted)", marginBottom:16, textTransform:"uppercase" }}>JEE Study OS</p>
        <h1 style={{
          fontSize:56, fontWeight:800, fontFamily:"'Space Grotesk', sans-serif", letterSpacing:"-0.03em", lineHeight:1,
          backgroundImage:"linear-gradient(100deg, var(--text-primary) 30%, var(--accent-cyan) 62%, var(--accent-purple) 100%)",
          WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent",
        }}>Command Center</h1>
      </div>

      <p className="hero-sub" style={{ fontSize:14, color:"var(--text-sec)", marginTop:-28, textAlign:"center" }}>Zero-friction. Total control. All local.</p>

      {fsaSupported() ? (
        <div className="hero-cta" style={{ display:"flex", gap:12 }}>
          <button className="hero-btn" onClick={handleOpen} style={{ padding:"12px 24px", fontSize:13, color:"var(--accent-cyan)", border:"1px solid var(--accent-cyan)", background:"var(--accent-cyan)12", borderRadius:10, cursor:"pointer", fontFamily:"'JetBrains Mono', monospace", boxShadow:"0 0 0 0 transparent" }}
            onMouseEnter={e=>e.currentTarget.style.boxShadow="0 8px 28px -8px #38D9F560"} onMouseLeave={e=>e.currentTarget.style.boxShadow="0 0 0 0 transparent"}
          >📂 Open Data File</button>
          <button className="hero-btn" onClick={handleCreate} style={{ padding:"12px 24px", fontSize:13, color:"var(--accent-purple)", border:"1px solid var(--accent-purple)", background:"var(--accent-purple)12", borderRadius:10, cursor:"pointer", fontFamily:"'JetBrains Mono', monospace", boxShadow:"0 0 0 0 transparent" }}
            onMouseEnter={e=>e.currentTarget.style.boxShadow="0 8px 28px -8px #B084FC60"} onMouseLeave={e=>e.currentTarget.style.boxShadow="0 0 0 0 transparent"}
          >✨ Create New File</button>
        </div>
      ) : (
        <div className="hero-cta" style={{ color:"var(--accent-red)", fontSize:13, textAlign:"center", maxWidth:380 }}>⚠ Browser does not support File System Access API.<br/>Use Chrome 86+ or Edge 86+.</div>
      )}
      {error && <p style={{ color:"var(--accent-red)", fontSize:12, position:"relative" }}>{error}</p>}
      <p className="hero-foot" style={{ fontSize:11, color:"var(--text-muted)", maxWidth:280, textAlign:"center", lineHeight:1.7 }}>All data stays on your machine — no accounts, no servers.</p>
    </div>
  );
}

// ─── COMMAND BAR ───────────────────────────────────────────────────────────────

function CommandBar({ activeDate, onAddTask, cmdRef }) {
  const [val,       setVal]       = useState("");
  const [selIdx,    setSelIdx]    = useState(0);   // which suggestion is highlighted
  const [history,   setHistory]   = useState([]);
  const [histIdx,   setHistIdx]   = useState(-1);
  const [toast,     setToast]     = useState(null);
  const [focused,   setFocused]   = useState(false);
  const toastRef                  = useRef(null);
  const parsed = useMemo(() => (val.trim() ? parseCommand(val) : null), [val]);

  // Re-parse on every keystroke — it's pure/sync so instant
  const showToast = (msg, color = "var(--accent-green)") => {
    setToast({ msg, color });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2000);
  };

  const resolveDate = (day) => {
    if (day === "tomorrow")  return shiftDateStr(activeDate, 1);
    if (day === "yesterday") return shiftDateStr(activeDate, -1);
    return activeDate;
  };

  const commit = (p) => {
    if (!p) return;
    onAddTask(resolveDate(p.targetDay), p.subject, p.chapter, p.note);
    showToast(`✓ ${S[p.subject]?.label} · ${p.chapter}${p.targetDay !== "today" ? " · " + p.targetDay : ""}`);
    setHistory(h => [val, ...h.filter(x => x !== val).slice(0, 19)]);
    setHistIdx(-1);
    setVal("");
  };

  // Tab: autocomplete with highlighted suggestion
  const handleTab = (e) => {
    if (!parsed?.ranked?.length) return;
    e.preventDefault();
    const pick = parsed.ranked[selIdx] ?? parsed.ranked[0];
    // Rewrite the input: keep subject prefix + picked chapter name + preserve /note and @day
    const subjectPart = parsed.subjectFilter ? (Object.entries(SUBJECT_ALIASES).find(([,v]) => v === parsed.subjectFilter)?.[0] ?? "") + " " : "";
    const notePart  = parsed.note  ? " /" + parsed.note : "";
    const dayPart   = parsed.targetDay !== "today" ? " @" + parsed.targetDay : "";
    setVal(subjectPart + pick.chapter + notePart + dayPart);
    setSelIdx(0);
  };

  const handleKeyDown = (e) => {
    // History navigation when dropdown is empty
    if (!parsed?.ranked?.length || !focused) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const next = Math.min(histIdx + 1, history.length - 1);
        setHistIdx(next); setVal(history[next] ?? ""); return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = Math.max(histIdx - 1, -1);
        setHistIdx(next); setVal(next === -1 ? "" : history[next]); return;
      }
    }

    // Suggestion navigation when dropdown is open
    if (parsed?.ranked?.length) {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelIdx(i => Math.min(i + 1, parsed.ranked.length - 1)); return; }
      if (e.key === "ArrowUp")   { e.preventDefault(); setSelIdx(i => Math.max(i - 1, 0)); return; }
    }

    if (e.key === "Tab")    { handleTab(e); return; }
    if (e.key === "Escape") { setVal(""); e.currentTarget.blur(); return; }
    if (e.key !== "Enter" || !val.trim()) return;
    e.preventDefault();

    // If dropdown open and user pressed Enter on a non-top suggestion, use that chapter
    if (parsed?.ranked?.length && selIdx > 0) {
      const pick = parsed.ranked[selIdx];
      commit({ ...parsed, subject: pick.subject, chapter: pick.chapter });
    } else {
      commit(parsed);
    }
  };

  const pickSuggestion = (entry) => {
    commit({ ...parsed, subject: entry.subject, chapter: entry.chapter });
  };

  const cfg = parsed ? S[parsed.subject] ?? S.Physics : null;
  const showDropdown = focused && parsed && val.trim().length >= 1 && parsed.ranked.length > 0;

  const dayColor = parsed?.targetDay === "tomorrow"  ? "var(--accent-orange)"
                 : parsed?.targetDay === "yesterday" ? "var(--accent-purple)"
                 : "var(--text-muted)";

  return (
    <div style={{ flex:1, position:"relative" }}>

      {/* ── Input row ── */}
      <div style={{
        display:"flex", alignItems:"center", gap:8,
        background:"var(--bg-elevated)",
        border:`1px solid ${focused && parsed?.confident ? cfg?.accentBorder ?? "var(--border-main)" : focused ? "var(--border-main)" : "var(--border-main)"}`,
        borderRadius:9, padding:"6px 10px",
        transition:"border-color 0.15s, box-shadow 0.15s",
        boxShadow: focused ? "0 0 0 2px " + (cfg?.accent ?? "#38D9F5") + "18" : "none",
      }}>

        {/* Subject pill — shows as soon as subject is typed */}
        {parsed?.subjectFilter ? (
          <span style={{
            fontSize:9, fontWeight:700, letterSpacing:"0.18em",
            color: cfg?.accent, background: cfg?.accentBg,
            border:`1px solid ${cfg?.accentBorder}`,
            borderRadius:5, padding:"2px 6px", flexShrink:0,
          }}>{cfg?.label}</span>
        ) : (
          <span style={{ fontSize:10, color:"var(--text-dim)", flexShrink:0, userSelect:"none" }}>⌘K</span>
        )}

        <input
          ref={cmdRef}
          value={val}
          onChange={e => { setVal(e.target.value); setHistIdx(-1); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="phy waves  |  c eq @tmrw  |  wep /hc verma  |  integ  |  em ind"
          style={{
            flex:1, background:"transparent", border:"none", outline:"none",
            fontSize:13, color:"var(--text-primary)", fontFamily:"'JetBrains Mono', monospace",
            caretColor: cfg?.accent ?? "var(--accent-cyan)",
          }}
        />

        {/* Right-side status badges */}
        {parsed && val && (
          <div style={{ display:"flex", gap:5, alignItems:"center", flexShrink:0 }}>
            {parsed.targetDay !== "today" && (
              <span style={{ fontSize:9, color:dayColor, background:dayColor+"18", border:`1px solid ${dayColor}40`, borderRadius:5, padding:"2px 6px", letterSpacing:"0.1em" }}>
                @{parsed.targetDay}
              </span>
            )}
            {parsed.note && (
              <span style={{ fontSize:9, color:"var(--text-muted)", background:"var(--bg-surface)", border:"1px solid var(--border-sub)", borderRadius:5, padding:"2px 6px", maxWidth:100, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                /{parsed.note}
              </span>
            )}
            {!parsed.ranked.length && parsed.chapterQuery && (
              <span style={{ fontSize:9, color:"var(--accent-orange)", letterSpacing:"0.1em" }}>no match</span>
            )}
            <span style={{ fontSize:9, color:"var(--text-dim)" }}>Tab=complete · Enter</span>
          </div>
        )}
      </div>

      {/* ── Suggestion dropdown ── */}
      {showDropdown && (
        <div className="cmd-dropdown" style={{
          position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:100,
          background:"var(--bg-elevated)", border:`1px solid ${cfg?.accentBorder ?? "var(--border-main)"}`,
          borderRadius:10, overflow:"hidden",
          boxShadow:"0 12px 40px rgba(0,0,0,0.5)",
        }}>
          {/* Chapter suggestions */}
          {parsed.ranked.map((entry, i) => {
            const ec  = S[entry.subject];
            const isHighlighted = i === selIdx;
            const pct = Math.round(entry.score * 100);
            return (
              <div
                key={entry.chapter + entry.subject}
                onMouseDown={() => pickSuggestion(entry)}
                onMouseEnter={() => setSelIdx(i)}
                style={{
                  display:"flex", alignItems:"center", gap:8,
                  padding:"7px 12px",
                  background: isHighlighted ? "var(--bg-hover)" : "transparent",
                  cursor:"pointer",
                  borderBottom: i < parsed.ranked.length - 1 ? "1px solid var(--border-sub)" : "none",
                  transition:"background 0.08s",
                }}
              >
                {/* Subject label */}
                <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.18em", color:ec.accent, background:ec.accentBg, border:`1px solid ${ec.accentBorder}`, borderRadius:5, padding:"2px 6px", flexShrink:0 }}>
                  {ec.label}
                </span>

                {/* Chapter name with bold match */}
                <span style={{ flex:1, fontSize:13, color: isHighlighted ? "var(--text-primary)" : "var(--text-sec)" }}>
                  {entry.chapter}
                </span>

                {/* Score bar */}
                <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                  <div style={{ width:32, height:3, background:"var(--border-sub)", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ width:`${Math.min(pct*1.5, 100)}%`, height:"100%", background:ec.accent, borderRadius:99 }} />
                  </div>
                  {isHighlighted && (
                    <span style={{ fontSize:9, color:"var(--text-muted)" }}>↵ Enter</span>
                  )}
                  {i === 0 && !isHighlighted && (
                    <span style={{ fontSize:9, color:"var(--text-dim)" }}>Tab</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Footer: shows what will be added if Enter is pressed now */}
          <div style={{
            padding:"6px 12px", borderTop:"1px solid var(--border-sub)",
            display:"flex", gap:8, alignItems:"center",
            background:"var(--bg-surface)",
          }}>
            <span style={{ fontSize:9, color:"var(--text-muted)", letterSpacing:"0.15em", flexShrink:0 }}>ADDING</span>
            <span style={{ fontSize:11, color: cfg?.accent ?? "var(--accent-cyan)", flex:1 }}>
              {parsed.ranked[selIdx]?.chapter ?? parsed.chapter}
            </span>
            {parsed.note && <span style={{ fontSize:10, color:"var(--text-muted)" }}>/ {parsed.note}</span>}
            <span style={{ fontSize:10, color:dayColor }}>{parsed.targetDay}</span>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:99,
          textAlign:"center", pointerEvents:"none",
          animation:"slideUp 0.15s ease forwards",
        }}>
          <span style={{
            fontSize:12, color:toast.color,
            background:"var(--bg-elevated)", border:`1px solid ${toast.color}40`,
            borderRadius:8, padding:"5px 14px", display:"inline-block",
            boxShadow:"0 4px 16px rgba(0,0,0,0.4)",
          }}>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

// ─── SYLLABUS SEARCH BAR (unified) ─────────────────────────────────────────────
// Same smart-input language as the Notepad and Command Bar: "phy waves /verma"
// — chapter fuzzy-matched, "/note" carried as optional detail. Enter adds it to
// the active day; dragging a suggestion (or any tree row) drops it straight
// into the Notepad or onto a calendar day, note and all.

function SyllabusSearchBar({ onAddNote, onQueryChange }) {
  const [val,     setVal]     = useState("");
  const [selIdx,  setSelIdx]  = useState(0);
  const [focused, setFocused] = useState(false);
  const [toast,   setToast]   = useState(null);
  const toastRef = useRef(null);
  const parsed = useMemo(() => (val.trim() ? parseCommand(val) : null), [val]);

  useEffect(() => { onQueryChange?.(parsed?.chapterQuery ?? ""); }, [parsed, onQueryChange]);

  const showToast = (msg) => { setToast(msg); clearTimeout(toastRef.current); toastRef.current = setTimeout(() => setToast(null), 1700); };

  // Enter / click here queues the chapter into the Notepad shortlist — it
  // does NOT schedule it onto a day. To put something on a specific day,
  // drag it (from here, or from the Notepad) onto that day's column.
  const commit = (p) => {
    if (!p) return;
    onAddNote(p.chapter, p.note ?? "");
    showToast(`✓ ${p.chapter} → Notepad`);
    setVal(""); setSelIdx(0);
  };

  const handleTab = (e) => {
    if (!parsed?.ranked?.length) return;
    e.preventDefault();
    const pick = parsed.ranked[selIdx] ?? parsed.ranked[0];
    const subjectPart = parsed.subjectFilter ? (Object.entries(SUBJECT_ALIASES).find(([,v]) => v === parsed.subjectFilter)?.[0] ?? "") + " " : "";
    const notePart = parsed.note ? " /" + parsed.note : "";
    setVal(subjectPart + pick.chapter + notePart);
    setSelIdx(0);
  };

  const handleKeyDown = (e) => {
    if (parsed?.ranked?.length) {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelIdx(i => Math.min(i+1, parsed.ranked.length-1)); return; }
      if (e.key === "ArrowUp")   { e.preventDefault(); setSelIdx(i => Math.max(i-1, 0)); return; }
    }
    if (e.key === "Tab")     { handleTab(e); return; }
    if (e.key === "Escape")  { setVal(""); e.currentTarget.blur(); return; }
    if (e.key !== "Enter" || !val.trim()) return;
    e.preventDefault();
    if (parsed?.ranked?.length) commit({ ...parsed, subject: parsed.ranked[selIdx]?.subject ?? parsed.subject, chapter: parsed.ranked[selIdx]?.chapter ?? parsed.chapter });
    else commit(parsed);
  };

  const pickSuggestion = (entry) => commit({ ...parsed, subject: entry.subject, chapter: entry.chapter });

  const cfg = parsed ? (S[parsed.subject] ?? S.Physics) : null;
  const showDropdown = focused && parsed && val.trim().length >= 1 && parsed.ranked.length > 0;

  return (
    <div style={{ position:"relative" }}>
      <div style={{
        display:"flex", alignItems:"center", gap:6, background:"var(--bg-elevated)",
        border:`1px solid ${focused ? (cfg?.accentBorder ?? "var(--accent-cyan)") : "var(--border-main)"}`,
        borderRadius:8, padding:"6px 9px", transition:"border-color 0.15s, box-shadow 0.15s",
        boxShadow: focused ? `0 0 0 2px ${cfg?.accent ?? "#38D9F5"}18` : "none",
      }}>
        <span style={{ fontSize:12, color:"var(--text-muted)", flexShrink:0 }}>🔍</span>
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search syllabus · phy waves /verma"
          style={{ flex:1, minWidth:0, background:"transparent", border:"none", outline:"none", fontSize:12, color:"var(--text-primary)", fontFamily:"'JetBrains Mono', monospace", caretColor:cfg?.accent ?? "var(--accent-cyan)" }}
        />
        {val && <button onClick={() => setVal("")} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:"var(--text-muted)", padding:0, flexShrink:0 }}>✕</button>}
      </div>

      {showDropdown && (
        <div className="cmd-dropdown" style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:100, background:"var(--bg-elevated)", border:`1px solid ${cfg?.accentBorder ?? "var(--border-main)"}`, borderRadius:10, overflow:"hidden", boxShadow:"0 12px 40px rgba(0,0,0,0.5)" }}>
          {parsed.ranked.map((entry, i) => {
            const ec = S[entry.subject];
            const isHighlighted = i === selIdx;
            return (
              <div
                key={entry.chapter + entry.subject}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "copy";
                  e.dataTransfer.setData("application/x-jee-tile", JSON.stringify({ text:entry.chapter, note:parsed.note ?? "", subject:entry.subject }));
                  e.dataTransfer.setData("text/plain", entry.chapter);
                }}
                onClick={() => pickSuggestion(entry)}
                onMouseEnter={() => setSelIdx(i)}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 12px", background:isHighlighted?"var(--bg-hover)":"transparent", cursor:"grab", borderBottom:i<parsed.ranked.length-1?"1px solid var(--border-sub)":"none", transition:"background 0.08s" }}
              >
                <span style={{ fontSize:10, color:"var(--text-dim)", flexShrink:0 }}>⠿</span>
                <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.18em", color:ec.accent, background:ec.accentBg, border:`1px solid ${ec.accentBorder}`, borderRadius:5, padding:"2px 6px", flexShrink:0 }}>{ec.label}</span>
                <span style={{ flex:1, fontSize:12, color:isHighlighted?"var(--text-primary)":"var(--text-sec)" }}>{entry.chapter}</span>
                {isHighlighted && <span style={{ fontSize:9, color:"var(--text-muted)" }}>↵</span>}
              </div>
            );
          })}
          <div style={{ padding:"5px 12px", borderTop:"1px solid var(--border-sub)", display:"flex", gap:6, alignItems:"center", background:"var(--bg-surface)" }}>
            <span style={{ fontSize:8, color:"var(--text-muted)", letterSpacing:"0.12em", flexShrink:0 }}>DRAG TO SCHEDULE · ↵ QUEUES IT</span>
            {parsed.note && <span style={{ fontSize:9, color:"var(--text-muted)" }}>/ {parsed.note}</span>}
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:99, textAlign:"center", pointerEvents:"none", animation:"slideUp 0.15s ease forwards" }}>
          <span style={{ fontSize:11, color:"var(--accent-green)", background:"var(--bg-elevated)", border:"1px solid var(--accent-green)40", borderRadius:8, padding:"4px 12px", display:"inline-block", boxShadow:"0 4px 16px rgba(0,0,0,0.4)" }}>{toast}</span>
        </div>
      )}
    </div>
  );
}

// ─── CHAPTER ROW ───────────────────────────────────────────────────────────────

function ChapterRow({ subject, chapter, activeDate, onAddTask, isMobile = false }) {
  const [hovered, setHovered] = useState(false);
  const [showInput, setShow]  = useState(false);
  const [note, setNote]       = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef              = useRef(null);
  const { accent, accentBg, accentBorder } = S[subject];
  useEffect(() => { if (showInput) inputRef.current?.focus(); }, [showInput]);
  const commit = () => { onAddTask(activeDate, subject, chapter, note.trim()); setNote(""); setShow(false); };
  const showAdd = isMobile || hovered;

  return (
    <div className="chapter-row-in">
      <div
        draggable={!isMobile}
        onDragStart={isMobile ? undefined : (e) => {
          e.dataTransfer.effectAllowed = "copy";
          e.dataTransfer.setData("application/x-jee-tile", JSON.stringify({ text:chapter, note:"", subject }));
          e.dataTransfer.setData("text/plain", chapter);
          setDragging(true);
        }}
        onDragEnd={isMobile ? undefined : () => setDragging(false)}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ display:"flex", alignItems:"center", gap:6, padding:isMobile?"9px 10px 9px 28px":"5px 10px 5px 28px", background:hovered?"var(--bg-hover)":"transparent", opacity:dragging?0.4:1, transition:"background 0.12s, opacity 0.15s", cursor:isMobile?"default":"grab", position:"relative" }}>
        <div style={{ position:"absolute", left:16, top:"50%", width:8, height:1, background:"var(--border-sub)", transform:"translateY(-50%)" }} />
        {!isMobile && <span title="Drag onto a day to schedule" style={{ flexShrink:0, fontSize:11, color:"var(--text-dim)", userSelect:"none" }}>⠿</span>}
        <span style={{ flex:1, fontSize:12, lineHeight:1.5, color:hovered?"var(--text-primary)":"var(--text-sec)", transition:"color 0.12s" }}>{chapter}</span>
        {showAdd && (
          <button onClick={() => setShow(true)} className="press-scale" style={{ color:accent, background:accentBg, border:`1px solid ${accentBorder}`, fontSize:12, padding:isMobile?"3px 10px":"1px 8px", borderRadius:6, cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}>+</button>
        )}
      </div>
      {showInput && (
        <div style={{ padding:"4px 10px 8px 28px" }}>
          <input ref={inputRef} value={note} onChange={e => setNote(e.target.value)}
            onKeyDown={e => { if (e.key==="Enter") commit(); if (e.key==="Escape") { setNote(""); setShow(false); } }}
            placeholder="Optional topic/details"
            style={{ width:"100%", background:"var(--bg-surface)", border:`1px solid ${accentBorder}`, borderRadius:6, fontSize:12, color:"var(--text-primary)", padding:"5px 8px", outline:"none", fontFamily:"'JetBrains Mono', monospace", caretColor:accent }}
          />
          <div style={{ display:"flex", gap:6, marginTop:6 }}>
            <button onClick={commit} className="press-scale" style={{ color:accent, background:accentBg, border:`1px solid ${accentBorder}`, borderRadius:6, padding:"4px 10px", fontSize:11, letterSpacing:"0.12em", cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}>ADD</button>
            <button onClick={() => { setNote(""); setShow(false); }} className="press-scale" style={{ color:"var(--text-sec)", background:"transparent", border:"1px solid var(--border-sub)", borderRadius:6, padding:"4px 10px", fontSize:11, letterSpacing:"0.12em", cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}>CANCEL</button>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomChapterRow({ subject, activeDate, onAddTask }) {
  const [showInput, setShowInput] = useState(false);
  const [chapterName, setChapterName] = useState("");
  const [note, setNote] = useState("");
  const chapterRef = useRef(null);
  const { accent, accentBg, accentBorder } = S[subject];
  useEffect(() => { if (showInput) chapterRef.current?.focus(); }, [showInput]);
  const reset  = () => { setChapterName(""); setNote(""); setShowInput(false); };
  const commit = () => { if (!chapterName.trim()) return; onAddTask(activeDate, subject, chapterName.trim(), note.trim()); reset(); };

  return (
    <div style={{ padding:"8px 10px", borderTop:"1px solid var(--border-sub)" }}>
      {!showInput ? (
        <button onClick={() => setShowInput(true)} style={{ width:"100%", background:accentBg, border:`1px dashed ${accentBorder}`, borderRadius:7, padding:"6px 10px", textAlign:"left", fontSize:11, letterSpacing:"0.15em", color:accent, cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}>
          + CUSTOM CHAPTER
        </button>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <input ref={chapterRef} value={chapterName} onChange={e => setChapterName(e.target.value)}
            onKeyDown={e => { if (e.key==="Enter") commit(); if (e.key==="Escape") reset(); }}
            placeholder="Chapter name"
            style={{ background:"var(--bg-surface)", border:`1px solid ${accentBorder}`, borderRadius:6, fontSize:12, color:"var(--text-primary)", padding:"5px 8px", outline:"none", fontFamily:"'JetBrains Mono', monospace", caretColor:accent }}
          />
          <input value={note} onChange={e => setNote(e.target.value)}
            onKeyDown={e => { if (e.key==="Enter") commit(); if (e.key==="Escape") reset(); }}
            placeholder="Optional details"
            style={{ background:"var(--bg-surface)", border:`1px solid ${accentBorder}`, borderRadius:6, fontSize:12, color:"var(--text-primary)", padding:"5px 8px", outline:"none", fontFamily:"'JetBrains Mono', monospace", caretColor:accent }}
          />
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={commit} style={{ color:accent, background:accentBg, border:`1px solid ${accentBorder}`, borderRadius:6, padding:"4px 10px", fontSize:11, letterSpacing:"0.12em", cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}>ADD</button>
            <button onClick={reset}  style={{ color:"var(--text-sec)", background:"transparent", border:"1px solid var(--border-sub)", borderRadius:6, padding:"4px 10px", fontSize:11, letterSpacing:"0.12em", cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}>CANCEL</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SUBJECT TREE ──────────────────────────────────────────────────────────────

function SubjectTree({ subject, classes, activeDate, onAddTask, searchQ, isMobile = false }) {
  const [open, setOpen]           = useState(true);
  const [classOpen, setClassOpen] = useState({ "Class 11":true, "Class 12":true });
  const { accent, accentBg, accentBorder, label } = S[subject];

  const q = searchQ.toLowerCase().trim();
  const filteredClasses = {};
  for (const [cls, chapters] of Object.entries(classes)) {
    const filtered = q ? chapters.filter(ch => ch.toLowerCase().includes(q)) : chapters;
    if (filtered.length) filteredClasses[cls] = filtered;
  }
  if (q && !Object.keys(filteredClasses).length) return null;
  const effectiveOpen = q ? true : open;

  return (
    <div style={{ borderBottom:"1px solid var(--border-sub)" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"9px 12px", background:"var(--bg-elevated)", borderBottom:"1px solid var(--border-sub)", border:"none", cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}>
        <span style={{ color:accent, background:accentBg, border:`1px solid ${accentBorder}`, fontSize:9, fontWeight:700, letterSpacing:"0.18em", borderRadius:5, padding:"2px 7px", flexShrink:0 }}>{label}</span>
        <span style={{ flex:1, textAlign:"left", fontSize:13, fontWeight:600, color:"var(--text-primary)" }}>{subject}</span>
        <span style={{ fontSize:10, color:"var(--text-muted)" }}>{effectiveOpen?"▾":"▸"}</span>
      </button>

      {effectiveOpen && Object.entries(filteredClasses).map(([cls, chapters]) => {
        const clsOpen = q ? true : (classOpen[cls] !== false);
        return (
          <div key={cls} style={{ position:"relative" }}>
            <div style={{ position:"absolute", left:16, top:26, bottom:8, width:1, background:`${accent}25`, pointerEvents:"none" }} />
            <button onClick={() => setClassOpen(c => ({ ...c, [cls]:!c[cls] }))}
              style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 12px 6px 20px", background:"transparent", border:"none", cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}
              onMouseEnter={e => e.currentTarget.style.background="var(--bg-hover)"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}
            >
              <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ display:"block", width:12, height:1, background:`${accent}40`, flexShrink:0 }} />
                <span style={{ fontSize:10, letterSpacing:"0.22em", color:"var(--text-sec)", fontWeight:600 }}>{cls.toUpperCase()}</span>
                <span style={{ fontSize:9, color:accent, background:accentBg, borderRadius:10, padding:"1px 6px" }}>{chapters.length}</span>
              </span>
              <span style={{ fontSize:9, color:"var(--text-muted)" }}>{clsOpen?"▾":"▸"}</span>
            </button>
            {clsOpen && chapters.map(ch => <ChapterRow key={ch} subject={subject} chapter={ch} activeDate={activeDate} onAddTask={onAddTask} isMobile={isMobile} />)}
          </div>
        );
      })}
      {effectiveOpen && !q && <CustomChapterRow subject={subject} activeDate={activeDate} onAddTask={onAddTask} />}
    </div>
  );
}

// ─── TASK CARD ─────────────────────────────────────────────────────────────────

// ─── MOBILE ACTION SHEET ────────────────────────────────────────────────────────
// Native HTML5 drag-and-drop doesn't fire from touch on phones, so this is the
// touch-equivalent for "move/schedule" actions: tap the ⋮ handle instead of
// dragging, pick an action from a bottom sheet.

function MobileActionSheet({ open, onClose, title, subtitle, actions }) {
  if (!open) return null;
  return (
    <div className="action-sheet-backdrop" onClick={onClose} style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(2,6,12,0.6)" }}>
      <div className="action-sheet safe-bottom" onClick={e => e.stopPropagation()} style={{ position:"absolute", left:0, right:0, bottom:0, background:"var(--bg-surface)", borderTop:"1px solid var(--border-main)", borderRadius:"18px 18px 0 0", boxShadow:"0 -20px 60px rgba(0,0,0,0.6)", padding:"10px 14px 14px", fontFamily:"'JetBrains Mono', monospace" }}>
        <div style={{ width:36, height:4, borderRadius:99, background:"var(--border-main)", margin:"0 auto 12px" }} />
        {title && (
          <div style={{ padding:"0 4px 10px" }}>
            <div style={{ fontSize:14, color:"var(--text-primary)", fontWeight:600 }}>{title}</div>
            {subtitle && <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>{subtitle}</div>}
          </div>
        )}
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {actions.filter(Boolean).map((a, i) => (
            <button key={i} onClick={() => { if (a.disabled) return; a.onSelect(); onClose(); }}
              style={{ display:"flex", alignItems:"center", gap:10, width:"100%", textAlign:"left", padding:"13px 14px", borderRadius:12, border:`1px solid ${a.danger?"#3A2230":"var(--border-sub)"}`, background:a.danger?"#1E0E18":"var(--bg-elevated)", color:a.danger?"#FF8FA3":"var(--text-primary)", fontSize:13, cursor:a.disabled?"default":"pointer", opacity:a.disabled?0.4:1, fontFamily:"'JetBrains Mono', monospace" }}
            >
              {a.icon && <span style={{ fontSize:15, flexShrink:0, width:18, textAlign:"center" }}>{a.icon}</span>}
              <span style={{ flex:1 }}>{a.label}</span>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ width:"100%", marginTop:10, padding:"12px", borderRadius:12, border:"1px solid var(--border-main)", background:"transparent", color:"var(--text-sec)", fontSize:12, letterSpacing:"0.1em", cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}>CANCEL</button>
      </div>
    </div>
  );
}

// ─── TASK CARD ─────────────────────────────────────────────────────────────────

function TaskCard({ task, onToggle, onRemove, onEditNote, draggable = true, dimmed = false, onDragStart, onDragEnd, onDragOver, isMobile = false, onMoveToNotepad, onMoveRelative }) {
  const cfg = S[task.subject] ?? S.Physics;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(task.customNote ?? "");
  const [hovered, setHovered] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { if (editing) { setDraft(task.customNote ?? ""); requestAnimationFrame(() => { inputRef.current?.focus(); inputRef.current?.select(); }); } }, [editing]);

  const commitNote = () => { onEditNote?.(draft.trim()); setEditing(false); };
  const cancelNote = () => setEditing(false);
  const showNoteAffordance = isMobile || hovered;

  const sheetActions = [
    { icon:"✓", label:task.completed ? "Mark as not done" : "Mark as done", onSelect:onToggle },
    { icon:"✎", label:"Edit note", onSelect:() => setEditing(true) },
    { icon:"◀", label:"Move to yesterday", onSelect:() => onMoveRelative?.(-1) },
    { icon:"▶", label:"Move to tomorrow", onSelect:() => onMoveRelative?.(1) },
    { icon:"📝", label:"Move back to notepad", onSelect:onMoveToNotepad },
    { icon:"✕", label:"Delete task", danger:true, onSelect:onRemove },
  ];

  return (
    <div
      className="task-card-in"
      draggable={!isMobile && draggable && !editing}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:task.completed?"var(--bg-surface)":"var(--bg-elevated)",
        border:`1px solid ${task.completed?"var(--border-sub)":cfg.accentBorder}`,
        opacity:dimmed?0.35:task.completed?0.55:1, borderRadius:10, padding:"10px 12px", marginBottom:8,
        transition:"transform 0.15s, box-shadow 0.15s, opacity 0.15s, background 0.2s",
        transform: !isMobile && hovered && !task.completed && !editing ? "translateY(-2px)" : "translateY(0)",
        boxShadow: !isMobile && hovered && !task.completed && !editing ? "0 10px 22px -8px rgba(0,0,0,0.5)" : "none",
        cursor: !isMobile && draggable && !editing ? "grab" : "default",
      }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
        <button onClick={onToggle} className="press-scale" style={{ marginTop:2, width:isMobile?22:18, height:isMobile?22:18, borderRadius:6, flexShrink:0, border:`2px solid ${task.completed?cfg.accent:cfg.accentBorder}`, background:task.completed?cfg.accent+"30":"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.15s" }}>
          {task.completed && <span style={{ color:cfg.accent, fontSize:isMobile?12:10, lineHeight:1 }}>✓</span>}
        </button>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:5 }}>
            <span style={{ color:cfg.accent, background:cfg.accentBg, border:`1px solid ${cfg.accentBorder}`, fontSize:9, fontWeight:700, letterSpacing:"0.18em", borderRadius:5, padding:"2px 6px" }}>{cfg.label}</span>
            {task.isRollover && <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.14em", borderRadius:5, padding:"2px 6px", color:"#FF9F43", background:"#FF9F4315", border:"1px solid #FF9F4340" }}>ROLLOVER</span>}
          </div>
          <p style={{ fontSize:13, lineHeight:1.4, color:task.completed?"var(--text-muted)":"var(--text-primary)", textDecoration:task.completed?"line-through":"none", margin:0 }}>{task.chapter}</p>

          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onMouseDown={e => e.stopPropagation()}
              onKeyDown={e => { if (e.key==="Enter") commitNote(); if (e.key==="Escape") cancelNote(); }}
              onBlur={commitNote}
              placeholder="Optional note"
              style={{ width:"100%", marginTop:4, background:"var(--bg-surface)", border:`1px solid ${cfg.accentBorder}`, borderRadius:6, fontSize:12, color:"var(--text-primary)", padding:"5px 7px", outline:"none", fontFamily:"'JetBrains Mono', monospace", caretColor:cfg.accent }}
            />
          ) : task.customNote ? (
            <p onClick={() => !isMobile && !task.completed && setEditing(true)} title={!isMobile && !task.completed ? "Click to edit note" : undefined}
              style={{ fontSize:12, marginTop:3, lineHeight:1.4, color:task.completed?"var(--text-muted)":"var(--text-sec)", textDecoration:task.completed?"line-through":"none", margin:"3px 0 0", cursor:!isMobile && !task.completed ? "text" : "default" }}>
              {task.customNote}
            </p>
          ) : (!task.completed && showNoteAffordance) ? (
            <p onClick={() => !isMobile && setEditing(true)} style={{ fontSize:11, marginTop:3, lineHeight:1.4, color:"var(--text-dim)", fontStyle:"italic", margin:"3px 0 0", cursor:!isMobile ? "text" : "default" }}>+ add note</p>
          ) : null}
        </div>
        {isMobile ? (
          <button onClick={() => setSheetOpen(true)} className="press-scale" aria-label="Task actions" style={{ marginTop:1, flexShrink:0, width:30, height:26, borderRadius:6, border:"1px solid var(--border-main)", background:"var(--bg-surface)", color:"var(--text-sec)", fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>⋮</button>
        ) : (
          <button onClick={onRemove} style={{ marginTop:1, borderRadius:6, border:"1px solid #3A2230", background:"#1E0E18", padding:"2px 7px", fontSize:10, letterSpacing:"0.12em", color:"#FF8FA3", cursor:"pointer", transition:"all 0.12s", fontFamily:"'JetBrains Mono', monospace" }}
            onMouseEnter={e => { e.currentTarget.style.background="#2E1020"; e.currentTarget.style.color="#FFD5DD"; }}
            onMouseLeave={e => { e.currentTarget.style.background="#1E0E18"; e.currentTarget.style.color="#FF8FA3"; }}
          >DEL</button>
        )}
      </div>
      {isMobile && (
        <MobileActionSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={task.chapter} subtitle="Task actions" actions={sheetActions} />
      )}
    </div>
  );
}

// ─── DAY COLUMN ────────────────────────────────────────────────────────────────

function DayColumn({ date, tasks, isToday, isActive, onClick, onToggle, onRemove, onEditNote, onDropTile, onMoveTask, onTaskToNotepad, isMobile = false }) {
  const done = tasks.filter(t => t.completed).length;
  const pct  = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const isComplete = tasks.length > 0 && pct === 100;
  const today = todayStr();
  const diffDays = Math.round((new Date(date+"T00:00:00") - new Date(today+"T00:00:00")) / 86400000);
  const dayLabel = isToday ? "TODAY" : diffDays===-1 ? "YESTERDAY" : diffDays===1 ? "TOMORROW" : `${diffDays>0?"+":""}${diffDays}d`;

  const [dragOverTile, setDragOverTile] = useState(false); // whole-column highlight for tile drops
  const dragCounterTile = useRef(0);
  const [dragOverIndex, setDragOverIndex] = useState(null); // task reorder insertion point
  const [draggingTaskId, setDraggingTaskId] = useState(null);

  const isTileDrag = (e) => e.dataTransfer.types.includes("application/x-jee-tile");
  const isTaskDrag = (e) => e.dataTransfer.types.includes("application/x-jee-task");

  const handleDragOver = (e) => { if (isTileDrag(e) || isTaskDrag(e)) { e.preventDefault(); e.dataTransfer.dropEffect = isTaskDrag(e) ? "move" : "copy"; } };
  const handleDragEnter = (e) => {
    if (!isTileDrag(e)) return;
    e.preventDefault();
    dragCounterTile.current += 1;
    setDragOverTile(true);
  };
  const handleDragLeave = (e) => {
    if (!isTileDrag(e)) return;
    e.preventDefault();
    dragCounterTile.current = Math.max(0, dragCounterTile.current - 1);
    if (dragCounterTile.current === 0) setDragOverTile(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    if (isTileDrag(e)) {
      dragCounterTile.current = 0;
      setDragOverTile(false);
      const raw = e.dataTransfer.getData("application/x-jee-tile");
      if (raw) { try { onDropTile?.(JSON.parse(raw)); } catch { /* ignore malformed payload */ } }
      return;
    }
    if (isTaskDrag(e)) {
      const raw = e.dataTransfer.getData("application/x-jee-task");
      if (raw) {
        try {
          const { taskId, fromDate } = JSON.parse(raw);
          onMoveTask?.(taskId, fromDate, date, dragOverIndex ?? tasks.length);
        } catch { /* ignore malformed payload */ }
      }
      setDragOverIndex(null);
    }
  };

  return (
    <div
      onClick={onClick}
      onDragOver={isMobile ? undefined : handleDragOver}
      onDragEnter={isMobile ? undefined : handleDragEnter}
      onDragLeave={isMobile ? undefined : handleDragLeave}
      onDrop={isMobile ? undefined : handleDrop}
      className={dragOverTile ? "day-col-drop-active" : undefined}
      style={{ flex:1, display:"flex", flexDirection:"column", borderRight:isMobile?"none":"1px solid var(--border-sub)", cursor:isMobile?"default":"pointer", transition:"background 0.15s", overflow:"hidden", background:dragOverTile?"#38D9F510":isActive?"linear-gradient(180deg,#0D1828 0%,var(--bg-base) 100%)":"var(--bg-base)", boxShadow:isActive && !isMobile?"inset 1px 0 0 #38D9F525,inset -1px 0 0 #38D9F525":"none" }}
    >
      <div className={`day-header-hover${isComplete ? " day-complete-glow" : ""}`} style={{ padding:isMobile?"14px 16px 12px":"16px 16px 12px", flexShrink:0, background:isActive?"#0D1828":isToday?"var(--accent-orange)15":"transparent", borderBottom:`1px solid ${isComplete?"var(--accent-green)60":isActive?"#38D9F530":isToday?"var(--accent-orange)":"var(--border-sub)"}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.25em", color:isActive?"var(--accent-cyan)":isToday?"var(--accent-orange)":"var(--text-muted)", background:isActive?"#38D9F515":isToday?"var(--accent-orange)15":"transparent", borderRadius:5, padding:isActive?"2px 7px":"0" }}>{dayLabel}</span>
          <span style={{ fontSize:10, color:pct===100?"var(--accent-green)":"var(--text-sec)" }}>{done}/{tasks.length}</span>
        </div>
        <div style={{ marginBottom:4 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
            <span style={{ fontSize:isMobile?30:(isActive?36:28), fontWeight:800, letterSpacing:"-0.03em", color:isActive?"var(--text-primary)":"var(--text-sec)", fontFamily:"'Space Grotesk', sans-serif", lineHeight:1, transition:"all 0.2s" }}>{fmtDateBig(date)}</span>
            <span style={{ fontSize:11, color:"var(--text-muted)", fontWeight:500 }}>{fmtYear(date)}</span>
          </div>
          <div style={{ fontSize:12, color:isActive?"var(--text-sec)":"var(--text-muted)", marginTop:2, fontWeight:500 }}>{fmtWeekday(date)}</div>
        </div>
        <div style={{ height:3, background:"var(--border-sub)", borderRadius:99, overflow:"hidden", marginTop:8 }}>
          <div style={{ width:`${pct}%`, height:"100%", background:pct===100?"var(--accent-green)":"var(--accent-cyan)", borderRadius:99, transition:"width 0.3s ease" }} />
        </div>
        {tasks.length > 0 && <div style={{ fontSize:11, color:pct===100?"var(--accent-green)":"var(--text-muted)", marginTop:4 }}>{pct===100?"✓ day complete":`${pct}% complete`}</div>}
      </div>
      <div
        onClick={e => e.stopPropagation()}
        onDragLeave={isMobile ? undefined : (e) => { if (isTaskDrag(e) && !e.currentTarget.contains(e.relatedTarget)) setDragOverIndex(null); }}
        style={{ flex:1, overflowY:"auto", padding:isMobile?"12px 14px":"12px 10px", WebkitOverflowScrolling:"touch" }}
      >
        {tasks.length === 0 ? (
          <p style={{ fontSize:12, color:dragOverTile?"var(--accent-cyan)":"var(--text-dim)", textAlign:"center", marginTop:40, lineHeight:1.7, transition:"color 0.15s" }}>
            {dragOverTile ? <>↓ drop to schedule here</> : isMobile ? <>— no tasks —{isActive && <><br /><span style={{ fontSize:11, color:"var(--text-muted)" }}>add from Syllabus or Notepad tab</span></>}</> : <>— no tasks —{isActive && <><br /><span style={{ fontSize:11, color:"var(--text-muted)" }}>hover a chapter → + · drag a tile in</span></>}</>}
          </p>
        ) : (
          <>
            {tasks.map((t, i) => (
              <Fragment key={t.id}>
                {dragOverIndex === i && <div className="task-drop-indicator" />}
                <TaskCard
                  task={t}
                  isMobile={isMobile}
                  dimmed={draggingTaskId === t.id}
                  onToggle={() => onToggle(t.id)}
                  onRemove={() => onRemove(t.id)}
                  onEditNote={(note) => onEditNote(t.id, note)}
                  onMoveToNotepad={() => onTaskToNotepad?.(t.id, date)}
                  onMoveRelative={(offset) => onMoveTask?.(t.id, date, shiftDateStr(date, offset), Number.MAX_SAFE_INTEGER)}
                  onDragStart={isMobile ? undefined : (e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("application/x-jee-task", JSON.stringify({ taskId:t.id, fromDate:date }));
                    setDraggingTaskId(t.id);
                  }}
                  onDragEnd={isMobile ? undefined : () => { setDraggingTaskId(null); setDragOverIndex(null); }}
                  onDragOver={isMobile ? undefined : (e) => {
                    if (!isTaskDrag(e)) return;
                    e.preventDefault(); e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const before = e.clientY < rect.top + rect.height / 2;
                    setDragOverIndex(before ? i : i + 1);
                  }}
                />
              </Fragment>
            ))}
            {dragOverIndex === tasks.length && <div className="task-drop-indicator" />}
          </>
        )}
      </div>
    </div>
  );
}

// ─── MASTERY LEDGER ────────────────────────────────────────────────────────────

// ─── NOTE ROW ──────────────────────────────────────────────────────────────────

function NoteRow({ note, dragging, onDragStart, onDragEnd, onToggle, onDelete, onEditNote, isMobile = false, onScheduleRelative }) {
  const { badgeColor, badgeBg, badgeBorder, badgeText, isChapterLike } = getChapterTheme(note.text);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(note.note ?? "");
  const [hovered, setHovered] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { if (editing) { setDraft(note.note ?? ""); requestAnimationFrame(() => { inputRef.current?.focus(); inputRef.current?.select(); }); } }, [editing]);

  const commitNote = () => { onEditNote?.(draft.trim()); setEditing(false); };
  const cancelNote = () => setEditing(false);
  const showNoteAffordance = isMobile || hovered;

  const sheetActions = [
    { icon:"📅", label:"Schedule for today", onSelect:() => onScheduleRelative?.(0) },
    { icon:"▶", label:"Schedule for tomorrow", onSelect:() => onScheduleRelative?.(1) },
    { icon:"✎", label:"Edit note", onSelect:() => setEditing(true) },
    { icon:"✓", label:note.done ? "Mark as open" : "Mark as done", onSelect:onToggle },
    { icon:"✕", label:"Delete", danger:true, onSelect:onDelete },
  ];

  return (
    <div
      className="note-row-in"
      draggable={!isMobile && !editing}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={() => { setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
      style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 10px", borderRadius:12, border:`1px solid ${note.done ? "var(--border-sub)" : "var(--border-main)"}`, background:note.done ? "var(--bg-surface)" : "var(--bg-elevated)", opacity:dragging ? 0.35 : (note.done ? 0.72 : 1), transform: !isMobile && hovered && !dragging && !editing ? "translateY(-1px)" : "translateY(0)", transition:"opacity 0.15s, transform 0.15s", cursor: isMobile || editing ? "default" : "grab" }}
    >
      {!isMobile && <span title="Drag onto a day (or notepad) to schedule" style={{ flexShrink:0, cursor:"grab", color:"var(--text-dim)", fontSize:12, lineHeight:1, userSelect:"none", padding:"0 1px" }}>⠿</span>}
      <button
        onClick={onToggle}
        className="press-scale"
        aria-label={note.done ? "Mark note as open" : "Mark note as done"}
        style={{ width:isMobile?22:18, height:isMobile?22:18, borderRadius:6, flexShrink:0, border:`2px solid ${note.done ? "var(--accent-green)" : "var(--border-main)"}`, background:note.done ? "rgba(61, 252, 154, 0.18)" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
      >
        {note.done && <span style={{ color:"var(--accent-green)", fontSize:isMobile?12:10, lineHeight:1 }}>✓</span>}
      </button>

      <div style={{ minWidth:0, flex:1, display:"flex", flexDirection:"column", gap:4 }}>
        <div style={{ display:"flex", gap:6, alignItems:"center", minWidth:0 }}>
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.18em", color:badgeColor, background:badgeBg, border:`1px solid ${badgeBorder}`, borderRadius:5, padding:"2px 6px", flexShrink:0 }}>
            {badgeText}
          </span>
          <span style={{ fontSize:12, lineHeight:1.45, color:note.done ? "var(--text-muted)" : "var(--text-primary)", textDecoration:note.done ? "line-through" : "none", fontFamily:"'JetBrains Mono', monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {note.text}
          </span>
        </div>

        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onMouseDown={e => e.stopPropagation()}
            onKeyDown={e => { if (e.key==="Enter") commitNote(); if (e.key==="Escape") cancelNote(); }}
            onBlur={commitNote}
            placeholder="Optional note"
            style={{ width:"100%", background:"var(--bg-surface)", border:`1px solid ${badgeBorder}`, borderRadius:6, fontSize:11, color:"var(--text-primary)", padding:"4px 7px", outline:"none", fontFamily:"'JetBrains Mono', monospace", caretColor:badgeColor }}
          />
        ) : note.note ? (
          <span onClick={() => !isMobile && !note.done && setEditing(true)} title={!isMobile && !note.done ? "Click to edit note" : undefined}
            style={{ fontSize:11, lineHeight:1.45, color:note.done ? "var(--text-muted)" : "var(--text-sec)", textDecoration:note.done ? "line-through" : "none", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", cursor:!isMobile && !note.done ? "text" : "default" }}>
            {note.note}
          </span>
        ) : (!note.done && showNoteAffordance) ? (
          <span onClick={() => !isMobile && setEditing(true)} style={{ fontSize:10, color:"var(--text-dim)", fontStyle:"italic", cursor:!isMobile?"text":"default" }}>+ add note</span>
        ) : (!isChapterLike && (
          <span style={{ fontSize:10, color:"var(--text-dim)" }}>Free-form reminder</span>
        ))}
      </div>

      {isMobile ? (
        <button onClick={() => setSheetOpen(true)} className="press-scale" aria-label="Note actions" style={{ flexShrink:0, width:30, height:26, borderRadius:6, border:"1px solid var(--border-main)", background:"var(--bg-surface)", color:"var(--text-sec)", fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>⋮</button>
      ) : (
        <button
          onClick={onDelete}
          className="press-scale"
          style={{ flexShrink:0, border:"1px solid #3A2230", background:"#1E0E18", padding:"2px 7px", borderRadius:6, color:"#FF8FA3", fontSize:10, letterSpacing:"0.12em", cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#2E1020"; e.currentTarget.style.color = "#FFD5DD"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#1E0E18"; e.currentTarget.style.color = "#FF8FA3"; }}
        >
          DEL
        </button>
      )}

      {isMobile && (
        <MobileActionSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={note.text} subtitle="Note actions" actions={sheetActions} />
      )}
    </div>
  );
}

// ─── NOTEPAD ───────────────────────────────────────────────────────────────────

function NotepadPanel({ notes, height, resizing, onAddNote, onToggleNote, onDeleteNote, onEditNote, onClearDone, onTaskDrop, isMobile = false, onScheduleRelative }) {
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverTile, setDragOverTile] = useState(false);
  const dragCounterTile = useRef(0);

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.done !== b.done) return Number(a.done) - Number(b.done);
    return String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""));
  });

  const pendingCount = notes.filter((note) => !note.done).length;
  const doneCount = notes.length - pendingCount;

  const isTileDrag = (e) => e.dataTransfer.types.includes("application/x-jee-tile");
  const isTaskDrag = (e) => e.dataTransfer.types.includes("application/x-jee-task");

  const handleDragOver = (e) => { if (isTileDrag(e) || isTaskDrag(e)) { e.preventDefault(); e.dataTransfer.dropEffect = isTaskDrag(e) ? "move" : "copy"; } };
  const handleDragEnter = (e) => { if (!isTileDrag(e) && !isTaskDrag(e)) return; e.preventDefault(); dragCounterTile.current += 1; setDragOverTile(true); };
  const handleDragLeave = (e) => { if (!isTileDrag(e) && !isTaskDrag(e)) return; e.preventDefault(); dragCounterTile.current = Math.max(0, dragCounterTile.current - 1); if (dragCounterTile.current === 0) setDragOverTile(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    dragCounterTile.current = 0;
    setDragOverTile(false);
    if (isTaskDrag(e)) {
      const raw = e.dataTransfer.getData("application/x-jee-task");
      if (raw) { try { const { taskId, fromDate } = JSON.parse(raw); onTaskDrop?.(taskId, fromDate); } catch { /* ignore malformed payload */ } }
      return;
    }
    const raw = e.dataTransfer.getData("application/x-jee-tile");
    if (!raw) return;
    try { const tile = JSON.parse(raw); const text = String(tile?.text ?? "").trim(); if (text) onAddNote(text, tile?.note ?? ""); } catch { /* ignore malformed payload */ }
  };

  return (
    <section
      onDragOver={isMobile ? undefined : handleDragOver}
      onDragEnter={isMobile ? undefined : handleDragEnter}
      onDragLeave={isMobile ? undefined : handleDragLeave}
      onDrop={isMobile ? undefined : handleDrop}
      className={dragOverTile ? "day-col-drop-active" : undefined}
      style={{ height:isMobile?"100%":height, flexShrink:0, display:"flex", flexDirection:"column", borderBottom:isMobile?"none":"1px solid var(--border-sub)", background:dragOverTile?"#38D9F510":"linear-gradient(180deg, rgba(13,19,32,0.98), rgba(8,12,20,0.98))", transition: resizing ? "background 0.15s" : "height 0.22s cubic-bezier(0.34,1.2,0.64,1), background 0.15s", overflow:"hidden" }}>
      <div style={{ padding:isMobile?"14px 16px 12px":"12px 14px 10px", borderBottom:"1px solid var(--border-sub)", flexShrink:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:"0.3em", color:"var(--accent-orange)", userSelect:"none" }}>TODO NOTEPAD</div>
            <div style={{ fontSize:12, color:"var(--text-sec)", marginTop:4 }}>{isMobile ? "Add chapters from the Syllabus tab · tap ⋮ to schedule." : "Drag from the syllabus or a day to queue it here · drag ⠿ back out to schedule."}</div>
          </div>
          <div style={{ display:"flex", gap:6, flexShrink:0 }}>
            <span style={{ fontSize:10, color:"var(--accent-cyan)", background:"#38D9F515", border:"1px solid #38D9F525", borderRadius:999, padding:"2px 8px" }}>{pendingCount} open</span>
            <span style={{ fontSize:10, color:"var(--accent-green)", background:"#3DFC9A15", border:"1px solid #3DFC9A25", borderRadius:999, padding:"2px 8px" }}>{doneCount} done</span>
          </div>
        </div>

        {notes.length > 0 && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginTop:10 }}>
            <span style={{ fontSize:10, color:"var(--text-dim)", letterSpacing:"0.12em" }}>{isMobile ? "TAP TO MARK DONE" : "CHECK A NOTE TO MARK IT DONE"}</span>
            <button
              onClick={onClearDone}
              className="press-scale"
              style={{ border:"1px solid var(--border-main)", background:"transparent", borderRadius:8, padding:"5px 10px", color:"var(--text-sec)", cursor:"pointer", fontSize:10, letterSpacing:"0.12em", fontFamily:"'JetBrains Mono', monospace", transition:"color 0.15s, border-color 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--text-sec)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-sec)"; e.currentTarget.style.borderColor = "var(--border-main)"; }}
            >
              CLEAR DONE
            </button>
          </div>
        )}
      </div>

      <div style={{ flex:1, minHeight:0, overflowY:"auto", padding:isMobile?"10px 14px 16px":"10px 10px 12px", display:"flex", flexDirection:"column", gap:8, WebkitOverflowScrolling:"touch" }}>
        {sortedNotes.length === 0 ? (
          <div style={{ padding:"16px 8px", border:`1px dashed ${dragOverTile?"var(--accent-cyan)":"var(--border-sub)"}`, borderRadius:12, textAlign:"center", color:dragOverTile?"var(--accent-cyan)":"var(--text-dim)", fontSize:12, lineHeight:1.7, transition:"color 0.15s, border-color 0.15s" }}>
            {dragOverTile ? "↓ drop to add as a note" : isMobile ? "Head to the Syllabus tab and tap + on a chapter to queue it here." : "Drag a chapter from the syllabus, or a task off the calendar, in here."}
          </div>
        ) : sortedNotes.map((note) => (
          <NoteRow
            key={note.id}
            note={note}
            dragging={draggingId === note.id}
            isMobile={isMobile}
            onToggle={() => onToggleNote(note.id)}
            onDelete={() => onDeleteNote(note.id)}
            onEditNote={(newNote) => onEditNote(note.id, newNote)}
            onScheduleRelative={(offset) => onScheduleRelative?.(note, offset)}
            onDragStart={isMobile ? undefined : (e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("application/x-jee-tile", JSON.stringify({ text: note.text, note: note.note }));
              e.dataTransfer.setData("text/plain", note.note ? `${note.text} — ${note.note}` : note.text);
              setDraggingId(note.id);
            }}
            onDragEnd={isMobile ? undefined : () => setDraggingId(null)}
          />
        ))}
      </div>
    </section>
  );
}

function highlightMatch(text, query) {
  const str = String(text ?? "");
  if (!query) return str;
  const idx = str.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return str;
  return (
    <>
      {str.slice(0, idx)}
      <mark style={{ background:"#38D9F535", color:"var(--accent-cyan)", borderRadius:3, padding:"0 1px" }}>{str.slice(idx, idx + query.length)}</mark>
      {str.slice(idx + query.length)}
    </>
  );
}

function MasteryLedger({ ledger, search = "" }) {
  const [open, setOpen] = useState({});
  const q = search.trim().toLowerCase();
  const subjects = Object.keys(ledger);

  // NOTE: this useMemo must run on every render, even when `subjects` is
  // empty — hooks can never sit behind a conditional early return, or the
  // hook count changes between renders and React crashes the whole tree.
  const filtered = useMemo(() => {
    if (!q) return ledger;
    const out = {};
    for (const [subject, chapters] of Object.entries(ledger)) {
      const subjectHit = subject.toLowerCase().includes(q);
      const keptChapters = {};
      for (const [ch, entries] of Object.entries(chapters)) {
        const chapterHit = ch.toLowerCase().includes(q);
        const keptEntries = (subjectHit || chapterHit) ? entries : entries.filter(e => (e.note || "").toLowerCase().includes(q));
        if (keptEntries.length) keptChapters[ch] = keptEntries;
      }
      if (Object.keys(keptChapters).length) out[subject] = keptChapters;
    }
    return out;
  }, [ledger, q]);

  if (!subjects.length) return <p style={{ fontSize:12, color:"var(--text-muted)", textAlign:"center", marginTop:60, lineHeight:1.8, padding:"0 16px" }}>Complete tasks to build<br />your mastery log.</p>;

  const filteredSubjects = Object.keys(filtered);

  if (q && !filteredSubjects.length) {
    return <p style={{ fontSize:12, color:"var(--text-muted)", textAlign:"center", marginTop:60, lineHeight:1.8, padding:"0 16px" }}>No matches for “{search.trim()}”.</p>;
  }

  return (
    <div>
      {filteredSubjects.map(subject => {
        const cfg     = S[subject] ?? S.Physics;
        const chapters = filtered[subject];
        const total   = Object.values(chapters).reduce((s,a) => s+a.length, 0);
        const sOpen   = q ? true : open[subject] !== false;
        return (
          <div key={subject} style={{ borderBottom:"1px solid var(--border-sub)" }}>
            <button onClick={() => setOpen(o => ({ ...o, [subject]:!sOpen }))}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:"var(--bg-elevated)", border:"none", cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}
              onMouseEnter={e => e.currentTarget.style.background="var(--bg-hover)"}
              onMouseLeave={e => e.currentTarget.style.background="var(--bg-elevated)"}
            >
              <span style={{ color:cfg.accent, background:cfg.accentBg, border:`1px solid ${cfg.accentBorder}`, fontSize:9, fontWeight:700, letterSpacing:"0.18em", borderRadius:5, padding:"2px 6px" }}>{cfg.label}</span>
              <span style={{ flex:1, textAlign:"left", fontSize:13, color:"var(--text-primary)", fontWeight:500 }}>{highlightMatch(subject, search.trim())}</span>
              <span style={{ fontSize:11, color:"var(--accent-green)", background:"#3DFC9A15", borderRadius:99, padding:"1px 8px" }}>{total}</span>
              <span style={{ fontSize:9, color:"var(--text-muted)", marginLeft:4 }}>{sOpen?"▾":"▸"}</span>
            </button>
            {sOpen && Object.entries(chapters).map(([ch, entries]) => {
              const ck    = `${subject}|${ch}`;
              const cOpen = q ? true : open[ck] !== false;
              return (
                <div key={ch}>
                  <button onClick={() => setOpen(o => ({ ...o, [ck]:!cOpen }))}
                    style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"6px 14px 6px 24px", background:"transparent", border:"none", cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}
                    onMouseEnter={e => e.currentTarget.style.background="var(--bg-hover)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >
                    <span style={{ flex:1, textAlign:"left", fontSize:12, color:"var(--text-sec)" }}>{highlightMatch(ch, search.trim())}</span>
                    <span style={{ fontSize:10, color:"var(--text-muted)" }}>{entries.length}×</span>
                    <span style={{ fontSize:8, color:"var(--text-muted)", marginLeft:4 }}>{cOpen?"▾":"▸"}</span>
                  </button>
                  {cOpen && entries.map((entry, i) => (
                    <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"3px 14px 3px 32px" }}>
                      <span style={{ fontSize:10, color:"var(--text-muted)", flexShrink:0, width:44 }}>{entry.date.slice(5).replace("-","/")}</span>
                      <span style={{ fontSize:11, color:"var(--text-sec)", lineHeight:1.4 }}>{highlightMatch(entry.note || "—", search.trim())}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── HELP PANEL ────────────────────────────────────────────────────────────────

function HelpPanel({ open: isOpen, onClose }) {
  if (!isOpen) return null;

  const sections = [
    {
      title: "COMMAND BAR FORMAT",
      color: "var(--accent-cyan)",
      items: [
        ["[subject] chapter", "Subject prefix is optional — fuzzy matching infers it."],
        ["/ note",            "Anything after '/' becomes a note: wep /hc verma ex3"],
        ["@day suffix",       "@t=today  @y=yesterday  @tmrw=tomorrow"],
        ["Tab",               "Autocomplete the top suggestion instantly."],
        ["↑ / ↓",            "In dropdown: navigate suggestions. When empty: cycle history."],
        ["Enter",             "Add highlighted suggestion. No match? Adds as custom chapter."],
      ],
    },
    {
      title: "COMMAND EXAMPLES",
      color: "var(--accent-green)",
      items: [
        ["phy waves",          "→ Physics · Waves · today"],
        ["c eq @tmrw",         "→ Chemistry · Equilibrium · tomorrow"],
        ["wep /hc verma ex3",  "→ Physics · Work Energy & Power · note: hc verma ex3"],
        ["integ",              "→ Mathematics · Integrals"],
        ["em ind",             "→ Physics · Electromagnetic Induction"],
        ["rot @y /irodov",     "→ Physics · Rotational Mechanics · yesterday · note: irodov"],
      ],
    },
    {
      title: "NAVIGATION SHORTCUTS",
      color: "var(--accent-purple)",
      items: [
        ["⌘K / Ctrl+K",      "Focus command bar from anywhere."],
        ["← →",              "Shift active day left / right."],
        ["T",                 "Jump to today."],
        ["C",                 "Open full calendar view."],
        ["[ ]",              "Jump ±7 days (week skip)."],
        ["Ctrl+\\",           "Collapse / expand the syllabus sidebar."],
        ["Click side column", "Jump active day to that column."],
      ],
    },
    {
      title: "DRAG & DROP",
      color: "var(--accent-cyan)",
      items: [
        ["Drag ⠿ chapter/note",  "From syllabus or notepad → drop on a day to schedule."],
        ["Drag onto notepad",    "Drop a chapter tile there to queue it as a note."],
        ["Drag a task off a day","Drop it back on the notepad to un-schedule it."],
        ["Drag a task card",     "Reorder within a day, or drop on another day to move it."],
        ["Click a note's detail","Edit the optional note inline, in notepad or on a task."],
        ["Enter in syllabus bar","Queues the chapter into the notepad (doesn't schedule it)."],
        ["Drag notepad/ledger",  "handle · resizes both panels; double-click resets."],
        ["Drag sidebar edge",    "Resizes the syllabus panel; double-click resets."],
      ],
    },
    {
      title: "TASK SHORTCUTS",
      color: "var(--accent-orange)",
      items: [
        ["Ctrl+D",       "Mark ALL tasks on active day done."],
        ["Ctrl+U",       "Un-check ALL tasks on active day."],
        ["Ctrl+Shift+D", "Delete all completed on active day."],
        ["Ctrl+Shift+R", "Manual rollover from yesterday."],
        ["Hover → +",    "Quick-add chapter to active day."],
        ["? / Esc",      "Open / close this help panel."],
      ],
    },
  ];

  return (
    <div className="help-overlay" style={{ position:"absolute", inset:0, zIndex:40, background:"rgba(2,6,12,0.7)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", display:"flex", flexDirection:"column", alignItems:"center", padding:"0 16px 24px", overflow:"hidden" }}>
      <div className="help-panel" style={{ width:"100%", maxWidth:900, maxHeight:"100%", marginTop:0, borderRadius:"0 0 20px 20px", border:"1px solid var(--border-main)", borderTop:"none", background:"var(--bg-surface)", boxShadow:"0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px #38D9F510", overflow:"hidden", display:"flex", flexDirection:"column" }}>
        <div style={{ flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px", borderBottom:"1px solid var(--border-sub)", background:"linear-gradient(to right,#38D9F508,transparent)" }}>
          <div>
            <p style={{ fontSize:10, letterSpacing:"0.3em", color:"var(--accent-cyan)", margin:0 }}>JEE//OS · HELP</p>
            <h2 style={{ fontSize:22, color:"var(--text-primary)", fontWeight:700, margin:"4px 0 0", fontFamily:"'Space Grotesk', sans-serif" }}>Shortcuts & Command Guide</h2>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span style={{ fontSize:11, color:"var(--text-muted)" }}>Esc to close</span>
            <button onClick={onClose} style={{ border:"1px solid var(--border-main)", background:"transparent", borderRadius:8, padding:"6px 14px", fontSize:11, letterSpacing:"0.14em", color:"var(--text-sec)", cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}
              onMouseEnter={e => { e.currentTarget.style.color="var(--accent-red)"; e.currentTarget.style.borderColor="var(--accent-red)"; }}
              onMouseLeave={e => { e.currentTarget.style.color="var(--text-sec)"; e.currentTarget.style.borderColor="var(--border-main)"; }}
            >CLOSE ✕</button>
          </div>
        </div>

        <div style={{ flex:1, minHeight:0, overflowY:"auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))", gap:16, padding:24 }}>
            {sections.map(sec => (
              <section key={sec.title} style={{ borderRadius:14, border:"1px solid var(--border-sub)", background:"var(--bg-elevated)", padding:18 }}>
                <h3 style={{ fontSize:10, letterSpacing:"0.22em", color:sec.color, marginBottom:14, marginTop:0 }}>{sec.title}</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {sec.items.map(([key, desc]) => (
                    <div key={key} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                      <span style={{ fontSize:11, color:"var(--text-primary)", background:"var(--bg-surface)", border:"1px solid var(--border-main)", borderRadius:6, padding:"2px 8px", flexShrink:0, whiteSpace:"nowrap", fontFamily:"'JetBrains Mono', monospace" }}>{key}</span>
                      <span style={{ fontSize:12, color:"var(--text-sec)", lineHeight:1.5, paddingTop:2 }}>{desc}</span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div style={{ padding:"12px 24px 20px", borderTop:"1px solid var(--border-sub)", textAlign:"center" }}>
            <span style={{ fontSize:11, color:"var(--text-muted)" }}>
              Press <span style={{ color:"var(--accent-cyan)", fontFamily:"monospace" }}>?</span> to reopen ·
              Format: <span style={{ color:"var(--accent-cyan)" }}>[subject] chapter [/note] [@day]</span> · Tab autocompletes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CALENDAR OVERLAY ──────────────────────────────────────────────────────────

const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS   = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getDaysInMonth(year, month)  { return new Date(Date.UTC(year, month+1, 0)).getUTCDate(); }
function getFirstWeekday(year, month) { return new Date(Date.UTC(year, month, 1)).getUTCDay(); }

function CompletionRing({ pct, size=28, accent="#38D9F5" }) {
  const r = (size-4)/2;
  const circ = 2*Math.PI*r;
  const dash = (pct/100)*circ;
  return (
    <svg width={size} height={size} style={{ position:"absolute", top:2, right:2, pointerEvents:"none" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1C2540" strokeWidth={2} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={pct===100?"#3DFC9A":accent} strokeWidth={2}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition:"stroke-dasharray 0.3s ease" }}
      />
    </svg>
  );
}

function DensityDots({ tasks }) {
  const bySubj = {};
  for (const t of tasks) bySubj[t.subject] = (bySubj[t.subject]||0)+1;
  return (
    <div style={{ display:"flex", gap:2, justifyContent:"center", marginTop:2 }}>
      {Object.entries(bySubj).slice(0,3).map(([subj]) => (
        <div key={subj} style={{ width:4, height:4, borderRadius:"50%", background:S[subj]?.accent??"#38D9F5", opacity:0.8 }} />
      ))}
    </div>
  );
}

function CalendarOverlay({ open, onClose, data, activeDate, setActiveDate, isMobile }) {
  const today = todayStr();
  const [viewYear,  setViewYear]  = useState(() => parseInt(activeDate.split("-")[0]));
  const [viewMonth, setViewMonth] = useState(() => parseInt(activeDate.split("-")[1])-1);
  const [selected,  setSelected]  = useState(activeDate);
  const lastClickRef = useRef(null);
  const lastClickTs  = useRef(0);

  useEffect(() => {
    if (open) {
      setSelected(activeDate);
      setViewYear(parseInt(activeDate.split("-")[0]));
      setViewMonth(parseInt(activeDate.split("-")[1])-1);
    }
  }, [open, activeDate]);

  const daysInMonth  = getDaysInMonth(viewYear, viewMonth);
  const firstWeekday = getFirstWeekday(viewYear, viewMonth);
  const cells = [];
  for (let i=0; i<firstWeekday; i++) cells.push(null);
  for (let d=1; d<=daysInMonth; d++) cells.push(d);

  const makeDateStr = (day) => `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

  const getStats = (ds) => {
    const tasks = data?.days?.[ds]?.tasks ?? [];
    const done  = tasks.filter(t => t.completed).length;
    return { tasks, total:tasks.length, pct:tasks.length?Math.round((done/tasks.length)*100):0 };
  };

  const prevMonth = () => { if (viewMonth===0) { setViewYear(y=>y-1); setViewMonth(11); } else setViewMonth(m=>m-1); };
  const nextMonth = () => { if (viewMonth===11) { setViewYear(y=>y+1); setViewMonth(0); } else setViewMonth(m=>m+1); };
  const goToday   = () => { const t=todayStr(); setViewYear(parseInt(t.split("-")[0])); setViewMonth(parseInt(t.split("-")[1])-1); setSelected(t); };

  const handleCellClick = (day) => {
    const ds  = makeDateStr(day);
    const now = Date.now();
    if (lastClickRef.current===ds && now-lastClickTs.current < 350) {
      lastClickRef.current = null;
      setActiveDate(ds); onClose(); return;
    }
    setSelected(ds);
    lastClickRef.current = ds;
    lastClickTs.current  = now;
  };

  const handleConfirm = () => { setActiveDate(selected); onClose(); };

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (e.key==="Escape") onClose();
      if (e.key==="Enter")  handleConfirm();
      if (e.key==="ArrowLeft")  prevMonth();
      if (e.key==="ArrowRight") nextMonth();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selected]);

  if (!open) return null;

  const monthTasks = cells.filter(Boolean).flatMap(d => data?.days?.[makeDateStr(d)]?.tasks??[]);
  const monthDone  = monthTasks.filter(t=>t.completed).length;

  return (
    <div className="cal-overlay" style={{ position:"absolute", inset:0, zIndex:60, background:"rgba(2,6,12,0.75)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:isMobile?12:24, overflow:"hidden" }} onClick={onClose}>
      <div className="cal-panel" style={{ background:"var(--bg-surface)", border:"1px solid var(--border-main)", borderRadius:20, boxShadow:"0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px #38D9F510", width:"100%", maxWidth:740, maxHeight:"100%", overflow:"hidden", fontFamily:"'JetBrains Mono', monospace", display:"flex", flexDirection:"column" }} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{ flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10, padding:isMobile?"14px 16px 12px":"18px 24px 14px", background:"linear-gradient(to right,#38D9F508,transparent)", borderBottom:"1px solid var(--border-sub)" }}>
          <div>
            <p style={{ margin:0, fontSize:10, letterSpacing:"0.3em", color:"var(--accent-cyan)" }}>CALENDAR</p>
            <h2 style={{ margin:"4px 0 0", fontSize:isMobile?18:22, fontWeight:700, color:"var(--text-primary)", fontFamily:"'Space Grotesk', sans-serif" }}>{MONTHS[viewMonth]} {viewYear}</h2>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            {!isMobile && (
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:11, color:"var(--text-muted)", letterSpacing:"0.1em" }}>THIS MONTH</div>
                <div style={{ fontSize:14, color:"var(--accent-green)", fontWeight:600 }}>{monthDone}/{monthTasks.length} done</div>
              </div>
            )}
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={prevMonth} className="press-scale" style={{ background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:8, color:"var(--text-sec)", fontSize:14, padding:isMobile?"8px 13px":"6px 12px", cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.color="var(--text-primary)"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-sec)"}
              >‹</button>
              <button onClick={goToday} className="press-scale" style={{ background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:8, color:"var(--accent-cyan)", fontSize:11, padding:isMobile?"8px 13px":"6px 12px", cursor:"pointer", letterSpacing:"0.08em", fontFamily:"'JetBrains Mono', monospace" }}>TODAY</button>
              <button onClick={nextMonth} className="press-scale" style={{ background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:8, color:"var(--text-sec)", fontSize:14, padding:isMobile?"8px 13px":"6px 12px", cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.color="var(--text-primary)"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-sec)"}
              >›</button>
            </div>
            <button onClick={onClose} className="press-scale" style={{ background:"transparent", border:"1px solid var(--border-main)", borderRadius:8, color:"var(--text-muted)", fontSize:12, padding:isMobile?"8px 13px":"6px 12px", cursor:"pointer", letterSpacing:"0.1em", fontFamily:"'JetBrains Mono', monospace" }}
              onMouseEnter={e=>{ e.currentTarget.style.color="var(--accent-red)"; e.currentTarget.style.borderColor="var(--accent-red)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.color="var(--text-muted)"; e.currentTarget.style.borderColor="var(--border-main)"; }}
            >ESC ✕</button>
          </div>
        </div>

        <div style={{ flex:1, minHeight:0, overflowY:"auto" }}>
          {/* Weekday headers */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:isMobile?"10px 12px 6px":"10px 20px 6px", borderBottom:"1px solid var(--border-sub)" }}>
            {WEEKDAYS.map(d => <div key={d} style={{ textAlign:"center", fontSize:isMobile?9:10, letterSpacing:"0.2em", color:d==="Sun"||d==="Sat"?"var(--text-dim)":"var(--text-muted)", fontWeight:600 }}>{isMobile ? d.slice(0,1) : d}</div>)}
          </div>

          {/* Day grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:isMobile?4:6, padding:isMobile?"10px 12px 14px":"12px 20px 16px" }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={`e${idx}`} />;
              const ds        = makeDateStr(day);
              const isToday   = ds===today;
              const isSel     = ds===selected;
              const isActive  = ds===activeDate;
              const { tasks, total, pct } = getStats(ds);
              const isWeekend = ((firstWeekday+day-1)%7===0)||((firstWeekday+day-1)%7===6);
              const ringAccent = tasks.length===1 ? S[tasks[0].subject]?.accent??"#38D9F5" : "#38D9F5";
              return (
                <div key={ds}
                  className={`cal-day-cell${isSel?" selected":""}${isToday?" is-today":""}`}
                  onClick={() => handleCellClick(day)}
                  title={`${ds} — double-click to jump`}
                  style={{ position:"relative", borderRadius:10, border:`1px solid ${isSel?"var(--accent-cyan)":isToday?"var(--accent-orange)80":isActive?"#38D9F530":"var(--border-sub)"}`, background:isSel?"#38D9F510":isActive?"#38D9F508":isToday?"#FF9F4308":"var(--bg-elevated)", padding:isMobile?"6px 3px 5px":"8px 6px 6px", minHeight:isMobile?54:68, display:"flex", flexDirection:"column", alignItems:"center", userSelect:"none" }}
                >
                  <span style={{ fontSize:isToday||isSel?(isMobile?13:15):(isMobile?12:13), fontWeight:isToday||isSel?700:400, color:isSel?"var(--accent-cyan)":isToday?"var(--accent-orange)":isActive?"var(--text-primary)":isWeekend?"var(--text-muted)":"var(--text-sec)", lineHeight:1, fontFamily:"'Space Grotesk', sans-serif" }}>{day}</span>
                  {total>0 && <span style={{ marginTop:4, fontSize:isMobile?9:10, color:pct===100?"var(--accent-green)":"var(--text-muted)" }}>{pct===100?"✓":`${total}`}</span>}
                  {tasks.length>0 && !isMobile && <DensityDots tasks={tasks} />}
                  {total>0 && <CompletionRing pct={pct} size={isMobile?18:24} accent={ringAccent} />}
                  {isActive && !isSel && <div style={{ position:"absolute", bottom:4, left:"50%", transform:"translateX(-50%)", width:4, height:4, borderRadius:"50%", background:"var(--accent-cyan)", opacity:0.7 }} />}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10, padding:isMobile?"10px 16px 14px":"10px 24px 14px", borderTop:"1px solid var(--border-sub)" }}>
            {!isMobile && (
              <div style={{ display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
                {[{ color:"var(--accent-orange)", label:"Today" },{ color:"var(--accent-cyan)", label:"Selected" },{ color:"var(--accent-green)", label:"All done" }].map(({ color, label }) => (
                  <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:color }} />
                    <span style={{ fontSize:10, color:"var(--text-muted)", letterSpacing:"0.08em" }}>{label}</span>
                  </div>
                ))}
                <span style={{ fontSize:10, color:"var(--text-dim)", marginLeft:4 }}>· click = select · double-click = jump</span>
              </div>
            )}
            <div style={{ display:"flex", gap:8, width:isMobile?"100%":"auto" }}>
              <button onClick={onClose} className="press-scale" style={{ flex:isMobile?1:"none", background:"transparent", border:"1px solid var(--border-main)", borderRadius:8, color:"var(--text-sec)", fontSize:12, padding:"8px 14px", cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}>CANCEL</button>
              <button onClick={handleConfirm} className="press-scale" style={{ flex:isMobile?2:"none", background:"#38D9F515", border:"1px solid var(--accent-cyan)60", borderRadius:8, color:"var(--accent-cyan)", fontSize:12, padding:"8px 18px", cursor:"pointer", letterSpacing:"0.1em", fontFamily:"'JetBrains Mono', monospace", fontWeight:600 }}
                onMouseEnter={e=>e.currentTarget.style.background="#38D9F525"} onMouseLeave={e=>e.currentTarget.style.background="#38D9F515"}
              >JUMP → {selected ? fmtDateBig(selected) : "—"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MOBILE TAB BAR ────────────────────────────────────────────────────────────

const MOBILE_TABS = [
  { key:"syllabus", label:"Syllabus", icon:"📚" },
  { key:"calendar", label:"Today",    icon:"▦" },
  { key:"notepad",  label:"Notepad",  icon:"✎" },
  { key:"ledger",   label:"Ledger",   icon:"✓" },
];

function MobileTabBar({ active, onChange }) {
  return (
    <nav className="safe-bottom" style={{ flexShrink:0, display:"flex", alignItems:"stretch", background:"var(--bg-surface)", borderTop:"1px solid var(--border-main)", zIndex:10 }}>
      {MOBILE_TABS.map(tab => {
        const isActive = active === tab.key;
        return (
          <button key={tab.key} onClick={() => onChange(tab.key)} className="tab-bar-btn press-scale"
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, padding:"8px 4px 6px", background:"transparent", border:"none", cursor:"pointer", color: isActive ? "var(--accent-cyan)" : "var(--text-muted)", fontFamily:"'JetBrains Mono', monospace" }}
          >
            <span style={{ fontSize:17, lineHeight:1 }}>{tab.icon}</span>
            <span style={{ fontSize:9, letterSpacing:"0.06em" }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── ROOT APP ──────────────────────────────────────────────────────────────────

const NOTEPAD_DEFAULT_HEIGHT = 320;
const NOTEPAD_MIN_HEIGHT     = 160;
const LEDGER_MIN_HEIGHT      = 150;
const SIDEBAR_DEFAULT_WIDTH  = 280;
const SIDEBAR_MIN_WIDTH      = 200;
const SIDEBAR_MAX_WIDTH      = 480;
const SIDEBAR_COLLAPSED_WIDTH = 44;

export default function App() {
  const [fileHandle,   setFileHandle]   = useState(null);
  const [data,         setData]         = useState(null);
  const [activeDate,   setActiveDate]   = useState(todayStr());
  const [showHelp,     setShowHelp]     = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [syllabusQuery, setSyllabusQuery] = useState("");
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [saveStatus,   setSaveStatus]   = useState("idle"); // idle | saving | saved

  // Notepad / Mastery Ledger resizable split
  const [notepadHeight, setNotepadHeight] = useState(() => {
    if (typeof window === "undefined") return NOTEPAD_DEFAULT_HEIGHT;
    const saved = Number(window.localStorage.getItem("jee-os-notepad-height"));
    return Number.isFinite(saved) && saved > 0 ? saved : NOTEPAD_DEFAULT_HEIGHT;
  });
  const [resizingNotepad, setResizingNotepad] = useState(false);
  const asideRef = useRef(null);

  // Syllabus sidebar: resizable width + collapse
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window === "undefined") return SIDEBAR_DEFAULT_WIDTH;
    const saved = Number(window.localStorage.getItem("jee-os-sidebar-width"));
    return Number.isFinite(saved) && saved > 0 ? saved : SIDEBAR_DEFAULT_WIDTH;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("jee-os-sidebar-collapsed") === "1";
  });
  const [resizingSidebar, setResizingSidebar] = useState(false);

  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState("calendar"); // syllabus | calendar | notepad | ledger

  const { toasts, push: pushToast } = useToast();

  const cmdRef    = useRef(null);
  const saveTimer = useRef(null);

  const moveActive = useCallback((step) => setActiveDate(d => shiftDateStr(d, step)), []);

  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);
  const handleDayTouchStart = useCallback((e) => {
    const t = e.touches[0];
    touchStartXRef.current = t.clientX;
    touchStartYRef.current = t.clientY;
  }, []);
  const handleDayTouchEnd = useCallback((e) => {
    if (touchStartXRef.current == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartXRef.current;
    const dy = t.clientY - (touchStartYRef.current ?? t.clientY);
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
    moveActive(dx < 0 ? 1 : -1);
  }, [moveActive]);

  useEffect(() => {
    window.localStorage.setItem("jee-os-notepad-height", String(notepadHeight));
  }, [notepadHeight]);

  useEffect(() => {
    window.localStorage.setItem("jee-os-sidebar-width", String(sidebarWidth));
  }, [sidebarWidth]);

  useEffect(() => {
    window.localStorage.setItem("jee-os-sidebar-collapsed", sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

  const handleNotepadResizeDelta = useCallback((dy) => {
    setNotepadHeight((h) => {
      const asideH = asideRef.current?.clientHeight ?? 800;
      const maxH   = Math.max(NOTEPAD_MIN_HEIGHT, asideH - LEDGER_MIN_HEIGHT - 9);
      return Math.min(Math.max(h + dy, NOTEPAD_MIN_HEIGHT), maxH);
    });
  }, []);
  const resetNotepadHeight = useCallback(() => setNotepadHeight(NOTEPAD_DEFAULT_HEIGHT), []);

  const handleSidebarResizeDelta = useCallback((dx) => {
    setSidebarWidth((w) => Math.min(Math.max(w + dx, SIDEBAR_MIN_WIDTH), SIDEBAR_MAX_WIDTH));
  }, []);
  const resetSidebarWidth = useCallback(() => setSidebarWidth(SIDEBAR_DEFAULT_WIDTH), []);

  const schedSave = useCallback((nextData) => {
    if (!fileHandle) return;
    clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(() => {
      writeFH(fileHandle, { ...nextData, meta:{ ...nextData.meta, lastModified:new Date().toISOString() } })
        .then(() => {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus((s) => (s === "saved" ? "idle" : s)), 1800);
        })
        .catch(() => setSaveStatus("idle"));
    }, 300);
  }, [fileHandle]);

  const patch = useCallback((updater) => {
    setData(prev => { const next = typeof updater==="function"?updater(prev):updater; schedSave(next); return next; });
  }, [schedSave]);

  // Auto-rollover yesterday's pending tasks on first load
  useEffect(() => {
    if (!data) return;
    const today     = todayStr();
    const yesterday = shiftDateStr(today, -1);
    const pending   = (data.days[yesterday]?.tasks??[]).filter(t=>!t.completed);
    if (!pending.length) return;
    patch(prev => {
      const existingIds = new Set((prev.days[today]?.tasks??[]).map(t=>t.id));
      const rollovers   = pending.filter(t=>!existingIds.has(t.id)).map(t=>({ ...t, id:uid(), isRollover:true, completed:false, completedAt:null }));
      if (!rollovers.length) return prev;
      return { ...prev, days:{ ...prev.days, [today]:{ tasks:[...(prev.days[today]?.tasks??[]),...rollovers] } } };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!data]);

  // ── Global keyboard shortcuts ──
  useEffect(() => {
    const handler = (e) => {
      const tag     = document.activeElement?.tagName;
      const inInput = tag==="INPUT"||tag==="TEXTAREA";

      if ((e.ctrlKey||e.metaKey) && e.key==="k") { e.preventDefault(); cmdRef.current?.focus(); cmdRef.current?.select(); return; }

      if ((e.ctrlKey||e.metaKey) && e.key==="\\") { e.preventDefault(); setSidebarCollapsed(c => !c); return; }

      if ((e.ctrlKey||e.metaKey) && !e.shiftKey && e.key==="d") {
        e.preventDefault();
        const pendingCount = (data.days[activeDate]?.tasks??[]).filter(t=>!t.completed).length;
        patch(prev => { const tasks=(prev.days[activeDate]?.tasks??[]).map(t=>({ ...t, completed:true, completedAt:t.completedAt??new Date().toISOString() })); return { ...prev, days:{ ...prev.days, [activeDate]:{ tasks } } }; });
        if (pendingCount) pushToast(`Marked ${pendingCount} task${pendingCount===1?"":"s"} done`, { icon:"✅" });
        return;
      }
      if ((e.ctrlKey||e.metaKey) && e.key==="u") {
        e.preventDefault();
        const doneCount = (data.days[activeDate]?.tasks??[]).filter(t=>t.completed).length;
        patch(prev => { const tasks=(prev.days[activeDate]?.tasks??[]).map(t=>({ ...t, completed:false, completedAt:null })); return { ...prev, days:{ ...prev.days, [activeDate]:{ tasks } } }; });
        if (doneCount) pushToast(`Reset ${doneCount} task${doneCount===1?"":"s"} to open`, { icon:"↺" });
        return;
      }
      if ((e.ctrlKey||e.metaKey) && e.shiftKey && e.key==="D") {
        e.preventDefault();
        const clearCount = (data.days[activeDate]?.tasks??[]).filter(t=>t.completed).length;
        patch(prev => { const tasks=(prev.days[activeDate]?.tasks??[]).filter(t=>!t.completed); return { ...prev, days:{ ...prev.days, [activeDate]:{ tasks } } }; });
        if (clearCount) pushToast(`Cleared ${clearCount} completed task${clearCount===1?"":"s"}`, { icon:"🧹" });
        return;
      }
      if ((e.ctrlKey||e.metaKey) && e.shiftKey && e.key==="R") {
        e.preventDefault();
        const yesterday = shiftDateStr(activeDate,-1);
        const pending = (data.days[yesterday]?.tasks??[]).filter(t=>!t.completed);
        patch(prev => {
          const existingIds = new Set((prev.days[activeDate]?.tasks??[]).map(t=>t.id));
          const rollovers   = pending.filter(t=>!existingIds.has(t.id)).map(t=>({ ...t, id:uid(), isRollover:true, completed:false, completedAt:null }));
          if (!rollovers.length) return prev;
          return { ...prev, days:{ ...prev.days, [activeDate]:{ tasks:[...(prev.days[activeDate]?.tasks??[]),...rollovers] } } };
        });
        if (pending.length) pushToast(`Rolled over ${pending.length} task${pending.length===1?"":"s"} from yesterday`, { icon:"⏪" });
        return;
      }

      if (e.key==="Escape") { setShowHelp(false); setShowCalendar(false); if (inInput) document.activeElement.blur(); return; }
      if (!inInput && e.key==="?") { e.preventDefault(); setShowHelp(true); return; }
      if (!inInput && e.key==="c") { e.preventDefault(); setShowCalendar(true); return; }
      if (!inInput && e.key==="ArrowLeft")  { moveActive(-1); return; }
      if (!inInput && e.key==="ArrowRight") { moveActive(1); return; }
      if (!inInput && e.key==="t") { setActiveDate(todayStr()); return; }
      if (!inInput && e.key==="[") { moveActive(-7); return; }
      if (!inInput && e.key==="]") { moveActive(7); return; }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [moveActive, activeDate, patch, data, pushToast]);

  const addTask = useCallback((date, subject, chapter, customNote) => {
    const task = { id:uid(), subject, chapter, customNote:customNote?.trim()??"", completed:false, completedAt:null, isRollover:false };
    patch(prev => ({ ...prev, days:{ ...prev.days, [date]:{ tasks:[...(prev.days[date]?.tasks??[]),task] } } }));
  }, [patch]);

  const addNote = useCallback((text, customNote = "") => {
    const note = { id:noteUid(), text:text.trim(), note:customNote.trim(), done:false, createdAt:new Date().toISOString() };
    patch(prev => ({ ...prev, notes:[note, ...(prev.notes??[])] }));
  }, [patch]);

  const toggleNote = useCallback((noteId) => {
    patch(prev => ({
      ...prev,
      notes: (prev.notes??[]).map(note => note.id===noteId ? { ...note, done:!note.done } : note),
    }));
  }, [patch]);

  const deleteNote = useCallback((noteId) => {
    patch(prev => ({ ...prev, notes:(prev.notes??[]).filter(note => note.id!==noteId) }));
  }, [patch]);

  const editNoteText = useCallback((noteId, note) => {
    patch(prev => ({ ...prev, notes:(prev.notes??[]).map(n=>n.id===noteId?{ ...n, note }:n) }));
  }, [patch]);

  // Drag a scheduled task off a day and drop it back onto the Notepad —
  // it becomes a note again and is removed from that day's calendar.
  const moveTaskToNotepad = useCallback((taskId, fromDate) => {
    patch(prev => {
      const fromTasks = prev.days[fromDate]?.tasks ?? [];
      const task = fromTasks.find(t => t.id === taskId);
      if (!task) return prev;
      const newNote = { id:noteUid(), text:task.chapter, note:task.customNote ?? "", done:false, createdAt:new Date().toISOString() };
      return {
        ...prev,
        notes: [newNote, ...(prev.notes ?? [])],
        days: { ...prev.days, [fromDate]:{ tasks:fromTasks.filter(t => t.id !== taskId) } },
      };
    });
    pushToast("Moved back to notepad", { icon:"📝" });
  }, [patch, pushToast]);

  const clearDoneNotes = useCallback(() => {
    const count = (data?.notes ?? []).filter(n => n.done).length;
    patch(prev => ({ ...prev, notes:(prev.notes??[]).filter(note => !note.done) }));
    if (count) pushToast(`Cleared ${count} done note${count===1?"":"s"}`, { icon:"🧹" });
  }, [patch, data, pushToast]);

  const removeTask = useCallback((date, taskId) => {
    patch(prev => ({ ...prev, days:{ ...prev.days, [date]:{ tasks:(prev.days[date]?.tasks??[]).filter(t=>t.id!==taskId) } } }));
  }, [patch]);

  const toggleTask = useCallback((date, taskId) => {
    patch(prev => {
      const updated = (prev.days[date]?.tasks??[]).map(t => t.id===taskId?{ ...t, completed:!t.completed, completedAt:!t.completed?new Date().toISOString():null }:t);
      const sorted  = [...updated.filter(t=>!t.completed),...updated.filter(t=>t.completed)];
      return { ...prev, days:{ ...prev.days, [date]:{ tasks:sorted } } };
    });
  }, [patch]);

  const editTaskNote = useCallback((date, taskId, note) => {
    patch(prev => ({ ...prev, days:{ ...prev.days, [date]:{ tasks:(prev.days[date]?.tasks??[]).map(t=>t.id===taskId?{ ...t, customNote:note }:t) } } }));
  }, [patch]);

  // Drag-reorder within a day, or drag a task card across days entirely.
  const moveTask = useCallback((taskId, fromDate, toDate, toIndex) => {
    patch(prev => {
      const fromTasks = prev.days[fromDate]?.tasks ?? [];
      const task = fromTasks.find(t => t.id === taskId);
      if (!task) return prev;
      const fromRemoved = fromTasks.filter(t => t.id !== taskId);
      const toBase = fromDate === toDate ? fromRemoved : (prev.days[toDate]?.tasks ?? []);
      const clamped = Math.max(0, Math.min(toIndex, toBase.length));
      const toTasks = [...toBase.slice(0, clamped), task, ...toBase.slice(clamped)];
      const nextDays = { ...prev.days, [toDate]:{ tasks:toTasks } };
      if (fromDate !== toDate) {
        nextDays[fromDate] = { tasks:fromRemoved };
        pushToast(`Moved "${task.chapter}" → ${fmtDateBig(toDate)}`, { icon:"↪" });
      }
      return { ...prev, days:nextDays };
    });
  }, [patch, pushToast]);

  // Dropping a tile (from the notepad or the syllabus sidebar) onto a day
  // column: syllabus tiles already know their subject; free-form notepad
  // text gets re-matched through the same fuzzy chapter detector so it still
  // lands as a properly themed task.
  const handleTileDrop = useCallback((date, payload) => {
    const text = String(payload?.text ?? "").trim();
    if (!text) return;
    let subject = payload?.subject;
    let chapter = text;
    if (!subject) {
      const theme = getChapterTheme(text);
      subject = theme.isChapterLike ? theme.match.subject : "Physics";
      chapter = theme.isChapterLike ? theme.match.chapter : text;
    }
    addTask(date, subject, chapter, payload?.note ?? "");
    pushToast(`Scheduled "${chapter}" → ${fmtDateBig(date)}`, { icon:"📌" });
  }, [addTask, pushToast]);

  // Mobile equivalent of dragging a notepad tile onto a day: pick a relative
  // day (today / tomorrow) from the note's action sheet instead.
  const scheduleNoteRelative = useCallback((note, offsetDays) => {
    const date = shiftDateStr(todayStr(), offsetDays);
    handleTileDrop(date, { text:note.text, note:note.note });
  }, [handleTileDrop]);

  const handleSwapFile = async () => {
    try {
      const fh = await openFilePicker();
      setFileHandle(fh);
      setData((await readFH(fh)) ?? normalizeData(DEFAULT_DATA()));
      pushToast("Switched data file", { icon:"📂" });
    }
    catch (e) { if (e.name!=="AbortError") console.error(e); }
  };

  const masteryLedger = useMemo(() => {
    if (!data) return {};
    const ledger = {};
    for (const [date, day] of Object.entries(data.days??{})) {
      for (const task of day.tasks??[]) {
        if (!task.completed) continue;
        const s=task.subject??"Physics", c=task.chapter??"General";
        ledger[s]??={}; ledger[s][c]??=[];
        ledger[s][c].push({ date, note:task.customNote });
      }
    }
    return ledger;
  }, [data]);

  const totalDone  = useMemo(() => !data?0:Object.values(data.days??{}).reduce((s,d)=>s+(d.tasks??[]).filter(t=>t.completed).length,0), [data]);
  const totalDoneBump = useBump(totalDone);
  const visibleDays = useMemo(() => [-1,0,1].map(i=>shiftDateStr(activeDate,i)), [activeDate]);

  if (!data) return (<><InjectStyles /><SetupScreen onReady={(fh,d)=>{ setFileHandle(fh); setData(normalizeData(d)); }} /></>);

  const today = todayStr();

  return (
    <>
      <InjectStyles />
      <div className="app-shell" style={{ background:"var(--bg-base)", color:"var(--text-primary)", display:"flex", flexDirection:"column", overflow:"hidden", fontFamily:"'JetBrains Mono', monospace", position:"relative" }}>

        {/* ── HEADER ── */}
        <header className={isMobile ? "safe-top" : undefined} style={{ flexShrink:0, display:"flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", gap: isMobile ? 8 : 12, padding: isMobile ? "8px 10px" : "10px 16px", background:"var(--bg-surface)", borderBottom:"1px solid var(--border-main)", zIndex:10, position:"relative" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:13, fontWeight:800, letterSpacing:"0.3em", color:"var(--accent-cyan)", flexShrink:0, userSelect:"none", fontFamily:"'Space Grotesk', sans-serif" }}>JEE//OS</span>
            {!isMobile && <span style={{ fontSize:10, letterSpacing:"0.14em", color:"var(--text-muted)", background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:6, padding:"2px 6px", flexShrink:0, userSelect:"none" }}>v1.2</span>}

            {!isMobile && <CommandBar activeDate={activeDate} onAddTask={addTask} cmdRef={cmdRef} />}

            <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0, marginLeft: isMobile ? "auto" : 0 }}>
              {saveStatus !== "idle" && (
                <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, letterSpacing:"0.1em", color: saveStatus==="saving" ? "var(--accent-orange)" : "var(--accent-green)", padding:"0 2px", userSelect:"none" }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"currentColor", flexShrink:0, animation: saveStatus==="saving" ? "pulse 1s ease-in-out infinite" : "none" }} />
                  {isMobile ? null : (saveStatus==="saving" ? "SAVING…" : "SAVED")}
                </span>
              )}
              {!isMobile && <span style={{ fontSize:12, color:"var(--text-sec)", background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:7, padding:"4px 10px" }}>🔥 {data.meta?.streakCount??0}d</span>}
              {!isMobile && <span className={totalDoneBump ? "count-bump" : undefined} style={{ display:"inline-block", fontSize:12, color:"var(--text-sec)", background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:7, padding:"4px 10px" }}>✓ {totalDone}</span>}
              {!isMobile && (
                <button className="press-scale" onClick={() => setShowCalendar(true)} title="Full calendar (C)" style={{ color:"var(--text-sec)", background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:7, padding:"4px 10px", fontSize:12, cursor:"pointer", fontFamily:"'JetBrains Mono', monospace", transition:"color 0.12s" }}
                  onMouseEnter={e=>e.currentTarget.style.color="var(--accent-purple)"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-sec)"}
                >▦ CAL</button>
              )}
              <button className="press-scale" onClick={() => setShowHelp(true)} title="Help (?)" style={{ color:"var(--text-sec)", background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:7, padding: isMobile ? "5px 9px" : "4px 10px", fontSize:12, cursor:"pointer", fontFamily:"'JetBrains Mono', monospace", transition:"color 0.12s" }}
                onMouseEnter={e=>e.currentTarget.style.color="var(--accent-cyan)"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-sec)"}
              >{isMobile ? "?" : "? HELP"}</button>
              <button onClick={handleSwapFile} title="Switch data file" style={{ color:"var(--text-sec)", background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:7, padding: isMobile ? "5px 9px" : "4px 10px", fontSize:15, cursor:"pointer", transition:"color 0.12s" }}
                onMouseEnter={e=>e.currentTarget.style.color="var(--text-primary)"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-sec)"}
              >⚙</button>
            </div>
          </div>

          {isMobile && <CommandBar activeDate={activeDate} onAddTask={addTask} cmdRef={cmdRef} />}
        </header>

        {/* ── BODY ── */}
        <div style={{ position:"relative", flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <Toaster toasts={toasts} />
          <HelpPanel    open={showHelp}     onClose={() => setShowHelp(false)} />
          <CalendarOverlay open={showCalendar} onClose={() => setShowCalendar(false)} data={data} activeDate={activeDate} setActiveDate={setActiveDate} isMobile={isMobile} />

          {!isMobile && (
          <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

            {/* Syllabus tree — collapsible + resizable, unified smart search */}
            {sidebarCollapsed ? (
              <aside style={{ width:SIDEBAR_COLLAPSED_WIDTH, flexShrink:0, background:"var(--bg-base)", borderRight:"1px solid var(--border-main)", display:"flex", flexDirection:"column", alignItems:"center", paddingTop:10, gap:10 }}>
                <button className="sidebar-rail-btn" onClick={() => setSidebarCollapsed(false)} title="Expand syllabus (Ctrl+\)" style={{ width:28, height:28, borderRadius:7, border:"1px solid var(--border-main)", background:"var(--bg-elevated)", color:"var(--text-sec)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>»</button>
                <span style={{ writingMode:"vertical-rl", fontSize:10, letterSpacing:"0.3em", color:"var(--text-muted)", userSelect:"none", marginTop:6 }}>SYLLABUS</span>
                <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:8 }}>
                  {Object.keys(JEE_SYLLABUS).map(subject => (
                    <span key={subject} title={subject} style={{ width:8, height:8, borderRadius:"50%", background:S[subject]?.accent ?? "var(--text-muted)" }} />
                  ))}
                </div>
              </aside>
            ) : (
              <aside style={{ width:sidebarWidth, flexShrink:0, background:"var(--bg-base)", borderRight:"1px solid var(--border-main)", display:"flex", overflow:"hidden" }}>
                <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", minWidth:0 }}>
                  <div style={{ flexShrink:0, borderBottom:"1px solid var(--border-sub)" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px 6px", gap:8 }}>
                      <span style={{ fontSize:10, letterSpacing:"0.3em", color:"var(--text-muted)", userSelect:"none" }}>SYLLABUS</span>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:10, color:"var(--accent-cyan)", background:"#38D9F515", border:"1px solid #38D9F525", borderRadius:5, padding:"1px 7px", whiteSpace:"nowrap" }}>→ {fmtDateBig(activeDate)}</span>
                        <button className="sidebar-rail-btn" onClick={() => setSidebarCollapsed(true)} title="Collapse syllabus (Ctrl+\)" style={{ width:22, height:22, borderRadius:6, border:"1px solid var(--border-main)", background:"var(--bg-elevated)", color:"var(--text-sec)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, flexShrink:0 }}>«</button>
                      </div>
                    </div>
                    <div style={{ padding:"0 10px 10px" }}>
                      <SyllabusSearchBar onAddNote={addNote} onQueryChange={setSyllabusQuery} />
                    </div>
                  </div>
                  {Object.entries(JEE_SYLLABUS).map(([subject, classes]) => (
                    <SubjectTree key={subject} subject={subject} classes={classes} activeDate={activeDate} onAddTask={addTask} searchQ={syllabusQuery} />
                  ))}
                </div>
                <ResizeHandle
                  axis="x"
                  onResizeDelta={handleSidebarResizeDelta}
                  onReset={resetSidebarWidth}
                  onResizeStart={() => setResizingSidebar(true)}
                  onResizeEnd={() => setResizingSidebar(false)}
                />
              </aside>
            )}

            {/* Timeline */}
            <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}
              onWheel={e => { if (Math.abs(e.deltaX)>Math.abs(e.deltaY)) moveActive(e.deltaX>0?1:-1); }}
            >
              <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
                {visibleDays.map((date, idx) => (
                  <DayColumn key={date} date={date} tasks={data.days[date]?.tasks??[]}
                    isToday={date===today} isActive={idx===1}
                    onClick={() => { const d=idx-1; if (d!==0) moveActive(d); }}
                    onToggle={tid => toggleTask(date,tid)}
                    onRemove={tid => removeTask(date,tid)}
                    onEditNote={(tid, note) => editTaskNote(date, tid, note)}
                    onDropTile={payload => handleTileDrop(date, payload)}
                    onMoveTask={(taskId, fromDate, toDate, toIndex) => moveTask(taskId, fromDate, toDate, toIndex)}
                  />
                ))}
              </div>
              <nav style={{ flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 0", borderTop:"1px solid var(--border-sub)", background:"var(--bg-base)" }}>
                {[
                  { label:"«7d",  action:()=>moveActive(-7),       title:"Back 7 days [" },
                  { label:"← prev", action:()=>moveActive(-1) },
                  { label:"today",  action:()=>setActiveDate(today), title:"Jump to today (T)", cyan:true },
                  { label:"next →", action:()=>moveActive(1) },
                  { label:"7d»",  action:()=>moveActive(7),        title:"Forward 7 days ]" },
                ].map(({ label, action, title, cyan }) => (
                  <button key={label} onClick={action} title={title} style={{ fontSize:label.length>4?11:12, color:"var(--text-sec)", background:"var(--bg-elevated)", border:"1px solid var(--border-sub)", borderRadius:8, padding:"5px 14px", cursor:"pointer", fontFamily:"'JetBrains Mono', monospace", transition:"color 0.12s" }}
                    onMouseEnter={e=>e.currentTarget.style.color=cyan?"var(--accent-cyan)":"var(--text-primary)"}
                    onMouseLeave={e=>e.currentTarget.style.color="var(--text-sec)"}
                  >{label}</button>
                ))}
                <span style={{ fontSize:10, color:"var(--text-dim)", marginLeft:8, userSelect:"none" }}>
                  ← → · T=today · [ ]=week · C=cal · Ctrl+D=done · ?=help
                </span>
              </nav>
            </main>

            {/* Notepad + Mastery Ledger — resizable vertical split */}
            <aside ref={asideRef} style={{ width:"23%", flexShrink:0, background:"var(--bg-base)", borderLeft:"1px solid var(--border-main)", overflow:"hidden", display:"flex", flexDirection:"column" }}>
              <NotepadPanel
                notes={data.notes ?? []}
                height={notepadHeight}
                resizing={resizingNotepad}
                onAddNote={addNote}
                onToggleNote={toggleNote}
                onDeleteNote={deleteNote}
                onEditNote={editNoteText}
                onClearDone={clearDoneNotes}
                onTaskDrop={moveTaskToNotepad}
              />

              <ResizeHandle
                onResizeDelta={handleNotepadResizeDelta}
                onReset={resetNotepadHeight}
                onResizeStart={() => setResizingNotepad(true)}
                onResizeEnd={() => setResizingNotepad(false)}
              />

              <div style={{ padding:"10px 14px 8px", borderBottom:"1px solid var(--border-sub)", flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ fontSize:10, letterSpacing:"0.3em", color:"var(--text-muted)", userSelect:"none" }}>MASTERY LEDGER</span>
                  <span style={{ fontSize:10, color:"var(--accent-green)", background:"#3DFC9A15", border:"1px solid #3DFC9A25", borderRadius:5, padding:"1px 7px" }}>{totalDone} logged</span>
                </div>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-60%)", fontSize:12, color:"var(--text-muted)", pointerEvents:"none" }}>🔍</span>
                  <input value={ledgerSearch} onChange={e=>setLedgerSearch(e.target.value)} placeholder="Search ledger..."
                    style={{ width:"100%", background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:8, padding:"7px 26px 7px 28px", fontSize:12, color:"var(--text-primary)", outline:"none", fontFamily:"'JetBrains Mono', monospace", caretColor:"var(--accent-cyan)" }}
                    onFocus={e=>e.currentTarget.style.borderColor="var(--accent-cyan)"}
                    onBlur={e=>e.currentTarget.style.borderColor="var(--border-main)"}
                  />
                  {ledgerSearch && <button onClick={()=>setLedgerSearch("")} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-60%)", background:"none", border:"none", cursor:"pointer", fontSize:12, color:"var(--text-muted)", padding:0 }}>✕</button>}
                </div>
              </div>
              <div style={{ flex:1, overflowY:"auto" }}>
                <MasteryLedger ledger={masteryLedger} search={ledgerSearch} />
              </div>
            </aside>
          </div>
          )}

          {/* ── MOBILE SINGLE-PANE BODY ── */}
          {isMobile && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

            {mobileTab === "syllabus" && (
              <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", minWidth:0 }}>
                <div style={{ flexShrink:0, borderBottom:"1px solid var(--border-sub)", position:"sticky", top:0, background:"var(--bg-base)", zIndex:2 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px 6px", gap:8 }}>
                    <span style={{ fontSize:10, letterSpacing:"0.3em", color:"var(--text-muted)", userSelect:"none" }}>SYLLABUS</span>
                    <span style={{ fontSize:10, color:"var(--accent-cyan)", background:"#38D9F515", border:"1px solid #38D9F525", borderRadius:5, padding:"1px 7px", whiteSpace:"nowrap" }}>→ {fmtDateBig(activeDate)}</span>
                  </div>
                  <div style={{ padding:"0 10px 10px" }}>
                    <SyllabusSearchBar onAddNote={addNote} onQueryChange={setSyllabusQuery} />
                  </div>
                </div>
                {Object.entries(JEE_SYLLABUS).map(([subject, classes]) => (
                  <SubjectTree key={subject} subject={subject} classes={classes} activeDate={activeDate} onAddTask={addTask} searchQ={syllabusQuery} isMobile />
                ))}
              </div>
            )}

            {mobileTab === "calendar" && (
              <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
                <div style={{ flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between", gap:6, padding:"8px 10px", borderBottom:"1px solid var(--border-sub)" }}>
                  <button onClick={()=>moveActive(-1)} className="press-scale" style={{ background:"var(--bg-elevated)", border:"1px solid var(--border-sub)", borderRadius:8, color:"var(--text-sec)", fontSize:14, padding:"6px 12px", cursor:"pointer" }}>‹</button>
                  <button onClick={()=>setShowCalendar(true)} className="press-scale" style={{ flex:1, background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:8, color: activeDate===today ? "var(--accent-orange)" : "var(--text-primary)", fontSize:12, fontWeight:600, padding:"7px 10px", cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}>
                    {activeDate===today ? "TODAY · " : ""}{fmtDateBig(activeDate)}
                  </button>
                  <button onClick={()=>moveActive(1)} className="press-scale" style={{ background:"var(--bg-elevated)", border:"1px solid var(--border-sub)", borderRadius:8, color:"var(--text-sec)", fontSize:14, padding:"6px 12px", cursor:"pointer" }}>›</button>
                </div>
                <div style={{ flex:1, overflow:"hidden", display:"flex" }} onTouchStart={handleDayTouchStart} onTouchEnd={handleDayTouchEnd}>
                  <DayColumn date={activeDate} tasks={data.days[activeDate]?.tasks??[]}
                    isToday={activeDate===today} isActive
                    onClick={()=>{}}
                    onToggle={tid => toggleTask(activeDate,tid)}
                    onRemove={tid => removeTask(activeDate,tid)}
                    onEditNote={(tid, note) => editTaskNote(activeDate, tid, note)}
                    onDropTile={payload => handleTileDrop(activeDate, payload)}
                    onMoveTask={(taskId, fromDate, toDate, toIndex) => moveTask(taskId, fromDate, toDate, toIndex)}
                    onTaskToNotepad={moveTaskToNotepad}
                    isMobile
                  />
                </div>
              </div>
            )}

            {mobileTab === "notepad" && (
              <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
                <NotepadPanel
                  notes={data.notes ?? []}
                  height={notepadHeight}
                  resizing={false}
                  onAddNote={addNote}
                  onToggleNote={toggleNote}
                  onDeleteNote={deleteNote}
                  onEditNote={editNoteText}
                  onClearDone={clearDoneNotes}
                  onTaskDrop={moveTaskToNotepad}
                  isMobile
                  onScheduleRelative={scheduleNoteRelative}
                />
              </div>
            )}

            {mobileTab === "ledger" && (
              <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
                <div style={{ padding:"10px 14px 8px", borderBottom:"1px solid var(--border-sub)", flexShrink:0 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:10, letterSpacing:"0.3em", color:"var(--text-muted)", userSelect:"none" }}>MASTERY LEDGER</span>
                    <span style={{ fontSize:10, color:"var(--accent-green)", background:"#3DFC9A15", border:"1px solid #3DFC9A25", borderRadius:5, padding:"1px 7px" }}>{totalDone} logged</span>
                  </div>
                  <div style={{ position:"relative" }}>
                    <span style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-60%)", fontSize:12, color:"var(--text-muted)", pointerEvents:"none" }}>🔍</span>
                    <input value={ledgerSearch} onChange={e=>setLedgerSearch(e.target.value)} placeholder="Search ledger..."
                      style={{ width:"100%", background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:8, padding:"7px 26px 7px 28px", fontSize:16, color:"var(--text-primary)", outline:"none", fontFamily:"'JetBrains Mono', monospace", caretColor:"var(--accent-cyan)" }}
                      onFocus={e=>e.currentTarget.style.borderColor="var(--accent-cyan)"}
                      onBlur={e=>e.currentTarget.style.borderColor="var(--border-main)"}
                    />
                    {ledgerSearch && <button onClick={()=>setLedgerSearch("")} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-60%)", background:"none", border:"none", cursor:"pointer", fontSize:12, color:"var(--text-muted)", padding:0 }}>✕</button>}
                  </div>
                </div>
                <div style={{ flex:1, overflowY:"auto" }}>
                  <MasteryLedger ledger={masteryLedger} search={ledgerSearch} />
                </div>
              </div>
            )}

            <MobileTabBar active={mobileTab} onChange={setMobileTab} />
          </div>
          )}
        </div>
      </div>
    </>
  );
}