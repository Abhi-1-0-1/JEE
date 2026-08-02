/**
 * JEE Study OS — App.jsx
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

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

  .help-overlay  { animation: fadeIn 0.18s ease forwards; }
  .help-panel    { animation: dropIn 0.22s cubic-bezier(0.34,1.3,0.64,1) forwards; }
  .cal-overlay   { animation: fadeIn 0.2s ease forwards; }
  .cal-panel     { animation: scaleIn 0.25s cubic-bezier(0.34,1.2,0.64,1) forwards; }
  .cmd-dropdown  { animation: slideUp 0.12s ease forwards; }

  .cal-day-cell { transition: background 0.1s, border-color 0.1s, transform 0.1s; cursor: pointer; }
  .cal-day-cell:hover { background: var(--bg-hover) !important; transform: scale(1.04); }
  .cal-day-cell.selected  { border-color: var(--accent-cyan)   !important; background: #38D9F515 !important; }
  .cal-day-cell.is-today  { border-color: var(--accent-orange) !important; }
`;

function InjectStyles() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  return null;
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
    "Class 11": ["Units & Measurements","Kinematics","Laws of Motion","Work Energy & Power","Rotational Mechanics","Gravitation","Fluid Mechanics", "Solids", "Kinetic Theory Of Gases", "Thermodynamics","Kinetic Theory of Gases","Oscillations","Waves"],
    "Class 12": ["Electrostatics","Capacitance", "Current Electricity","Moving Charges & Magnetism","Magnetism & Matter","Electromagnetic Induction","Alternating Current","Electromagnetic Waves","Ray Optics","Wave Optics","Dual Nature of Radiation","Atoms & Nuclei","Semiconductors"],
  },
  Chemistry: {
    "Class 11": ["Basic Concepts","Atomic Structure","Chemical Bonding","States of Matter","Thermodynamics","Equilibrium","Redox Reactions","Hydrogen","s-Block Elements","p-Block Elements (11)","General Organic Chemistry","Hydrocarbons"],
    "Class 12": ["Solid State","Solutions","Electrochemistry","Chemical Kinetics","Surface Chemistry","d & f Block Elements","Coordination Compounds","Haloalkanes & Haloarenes","Alcohols Phenols Ethers","Aldehydes Ketones","Carboxylic Acids","Amines","Biomolecules","Polymers","Chemistry in Everyday Life"],
  },
  Mathematics: {
    "Class 11": ["Sets Relations Functions","Trigonometry","Complex Numbers","Quadratic Equations","Sequences & Series","Straight Lines","Conic Sections","3D Geometry Intro","Permutations & Combinations","Binomial Theorem","Statistics","Probability (11)"],
    "Class 12": ["Relations & Functions (12)","Inverse Trigonometry","Matrices & Determinants", "Limits", "Continuity", "Differentiability", "Applications of Derivatives","Integrals","Applications of Integrals","Differential Equations","Vectors","3D Geometry","Linear Programming","Probability (12)"],
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
    <div style={{ minHeight:"100vh", background:"var(--bg-base)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"2.5rem", fontFamily:"'JetBrains Mono', monospace", padding:"0 1.5rem" }}>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontSize:11, letterSpacing:"0.5em", color:"var(--text-muted)", marginBottom:16, textTransform:"uppercase" }}>JEE Study OS</p>
        <h1 style={{ fontSize:52, fontWeight:800, color:"var(--text-primary)", fontFamily:"'Space Grotesk', sans-serif", letterSpacing:"-0.03em", lineHeight:1 }}>Command Center</h1>
        <p style={{ fontSize:14, color:"var(--text-sec)", marginTop:12 }}>Zero-friction. Total control. All local.</p>
      </div>
      {fsaSupported() ? (
        <div style={{ display:"flex", gap:12 }}>
          <button onClick={handleOpen} style={{ padding:"12px 24px", fontSize:13, color:"var(--accent-cyan)", border:"1px solid var(--accent-cyan)", background:"var(--accent-cyan)12", borderRadius:10, cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}>📂 Open Data File</button>
          <button onClick={handleCreate} style={{ padding:"12px 24px", fontSize:13, color:"var(--accent-purple)", border:"1px solid var(--accent-purple)", background:"var(--accent-purple)12", borderRadius:10, cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}>✨ Create New File</button>
        </div>
      ) : (
        <div style={{ color:"var(--accent-red)", fontSize:13, textAlign:"center", maxWidth:380 }}>⚠ Browser does not support File System Access API.<br/>Use Chrome 86+ or Edge 86+.</div>
      )}
      {error && <p style={{ color:"var(--accent-red)", fontSize:12 }}>{error}</p>}
      <p style={{ fontSize:11, color:"var(--text-muted)", maxWidth:280, textAlign:"center", lineHeight:1.7 }}>All data stays on your machine — no accounts, no servers.</p>
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

// ─── CHAPTER ROW ───────────────────────────────────────────────────────────────

function ChapterRow({ subject, chapter, activeDate, onAddTask }) {
  const [hovered, setHovered] = useState(false);
  const [showInput, setShow]  = useState(false);
  const [note, setNote]       = useState("");
  const inputRef              = useRef(null);
  const { accent, accentBg, accentBorder } = S[subject];
  useEffect(() => { if (showInput) inputRef.current?.focus(); }, [showInput]);
  const commit = () => { onAddTask(activeDate, subject, chapter, note.trim()); setNote(""); setShow(false); };

  return (
    <div>
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 10px 5px 28px", background:hovered?"var(--bg-hover)":"transparent", transition:"background 0.12s", cursor:"default", position:"relative" }}>
        <div style={{ position:"absolute", left:16, top:"50%", width:8, height:1, background:"var(--border-sub)", transform:"translateY(-50%)" }} />
        <span style={{ flex:1, fontSize:12, lineHeight:1.5, color:hovered?"var(--text-primary)":"var(--text-sec)", transition:"color 0.12s" }}>{chapter}</span>
        {hovered && (
          <button onClick={() => setShow(true)} style={{ color:accent, background:accentBg, border:`1px solid ${accentBorder}`, fontSize:12, padding:"1px 8px", borderRadius:6, cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}>+</button>
        )}
      </div>
      {showInput && (
        <div style={{ padding:"4px 10px 8px 28px" }}>
          <input ref={inputRef} value={note} onChange={e => setNote(e.target.value)}
            onKeyDown={e => { if (e.key==="Enter") commit(); if (e.key==="Escape") { setNote(""); setShow(false); } }}
            placeholder="Optional topic/details"
            style={{ width:"100%", background:"var(--bg-surface)", border:`1px solid ${accentBorder}`, borderRadius:6, fontSize:12, color:"var(--text-primary)", padding:"5px 8px", outline:"none", fontFamily:"'JetBrains Mono', monospace", caretColor:accent }}
          />
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

function SubjectTree({ subject, classes, activeDate, onAddTask, searchQ }) {
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
            {clsOpen && chapters.map(ch => <ChapterRow key={ch} subject={subject} chapter={ch} activeDate={activeDate} onAddTask={onAddTask} />)}
          </div>
        );
      })}
      {effectiveOpen && !q && <CustomChapterRow subject={subject} activeDate={activeDate} onAddTask={onAddTask} />}
    </div>
  );
}

// ─── TASK CARD ─────────────────────────────────────────────────────────────────

function TaskCard({ task, onToggle, onRemove }) {
  const cfg = S[task.subject] ?? S.Physics;
  return (
    <div style={{ background:task.completed?"var(--bg-surface)":"var(--bg-elevated)", border:`1px solid ${task.completed?"var(--border-sub)":cfg.accentBorder}`, opacity:task.completed?0.55:1, borderRadius:10, padding:"10px 12px", marginBottom:8, transition:"all 0.2s" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
        <button onClick={onToggle} style={{ marginTop:2, width:18, height:18, borderRadius:5, flexShrink:0, border:`2px solid ${task.completed?cfg.accent:cfg.accentBorder}`, background:task.completed?cfg.accent+"30":"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.15s" }}>
          {task.completed && <span style={{ color:cfg.accent, fontSize:10, lineHeight:1 }}>✓</span>}
        </button>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:5 }}>
            <span style={{ color:cfg.accent, background:cfg.accentBg, border:`1px solid ${cfg.accentBorder}`, fontSize:9, fontWeight:700, letterSpacing:"0.18em", borderRadius:5, padding:"2px 6px" }}>{cfg.label}</span>
            {task.isRollover && <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.14em", borderRadius:5, padding:"2px 6px", color:"#FF9F43", background:"#FF9F4315", border:"1px solid #FF9F4340" }}>ROLLOVER</span>}
          </div>
          <p style={{ fontSize:13, lineHeight:1.4, color:task.completed?"var(--text-muted)":"var(--text-primary)", textDecoration:task.completed?"line-through":"none", margin:0 }}>{task.chapter}</p>
          {task.customNote && <p style={{ fontSize:12, marginTop:3, lineHeight:1.4, color:task.completed?"var(--text-muted)":"var(--text-sec)", textDecoration:task.completed?"line-through":"none", margin:"3px 0 0" }}>{task.customNote}</p>}
        </div>
        <button onClick={onRemove} style={{ marginTop:1, borderRadius:6, border:"1px solid #3A2230", background:"#1E0E18", padding:"2px 7px", fontSize:10, letterSpacing:"0.12em", color:"#FF8FA3", cursor:"pointer", transition:"all 0.12s", fontFamily:"'JetBrains Mono', monospace" }}
          onMouseEnter={e => { e.currentTarget.style.background="#2E1020"; e.currentTarget.style.color="#FFD5DD"; }}
          onMouseLeave={e => { e.currentTarget.style.background="#1E0E18"; e.currentTarget.style.color="#FF8FA3"; }}
        >DEL</button>
      </div>
    </div>
  );
}

// ─── DAY COLUMN ────────────────────────────────────────────────────────────────

function DayColumn({ date, tasks, isToday, isActive, onClick, onToggle, onRemove }) {
  const done = tasks.filter(t => t.completed).length;
  const pct  = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const today = todayStr();
  const diffDays = Math.round((new Date(date+"T00:00:00") - new Date(today+"T00:00:00")) / 86400000);
  const dayLabel = isToday ? "TODAY" : diffDays===-1 ? "YESTERDAY" : diffDays===1 ? "TOMORROW" : `${diffDays>0?"+":""}${diffDays}d`;

  return (
    <div onClick={onClick} style={{ flex:1, display:"flex", flexDirection:"column", borderRight:"1px solid var(--border-sub)", cursor:"pointer", transition:"background 0.15s", overflow:"hidden", background:isActive?"linear-gradient(180deg,#0D1828 0%,var(--bg-base) 100%)":"var(--bg-base)", boxShadow:isActive?"inset 1px 0 0 #38D9F525,inset -1px 0 0 #38D9F525":"none" }}>
      <div style={{ padding:"16px 16px 12px", flexShrink:0, background:isActive?"#0D1828":isToday?"var(--accent-orange)15":"transparent", borderBottom:`1px solid ${isActive?"#38D9F530":isToday?"var(--accent-orange)":"var(--border-sub)"}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.25em", color:isActive?"var(--accent-cyan)":isToday?"var(--accent-orange)":"var(--text-muted)", background:isActive?"#38D9F515":isToday?"var(--accent-orange)15":"transparent", borderRadius:5, padding:isActive?"2px 7px":"0" }}>{dayLabel}</span>
          <span style={{ fontSize:10, color:pct===100?"var(--accent-green)":"var(--text-sec)" }}>{done}/{tasks.length}</span>
        </div>
        <div style={{ marginBottom:4 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
            <span style={{ fontSize:isActive?36:28, fontWeight:800, letterSpacing:"-0.03em", color:isActive?"var(--text-primary)":"var(--text-sec)", fontFamily:"'Space Grotesk', sans-serif", lineHeight:1, transition:"all 0.2s" }}>{fmtDateBig(date)}</span>
            <span style={{ fontSize:11, color:"var(--text-muted)", fontWeight:500 }}>{fmtYear(date)}</span>
          </div>
          <div style={{ fontSize:12, color:isActive?"var(--text-sec)":"var(--text-muted)", marginTop:2, fontWeight:500 }}>{fmtWeekday(date)}</div>
        </div>
        <div style={{ height:3, background:"var(--border-sub)", borderRadius:99, overflow:"hidden", marginTop:8 }}>
          <div style={{ width:`${pct}%`, height:"100%", background:pct===100?"var(--accent-green)":"var(--accent-cyan)", borderRadius:99, transition:"width 0.3s ease" }} />
        </div>
        {tasks.length > 0 && <div style={{ fontSize:11, color:pct===100?"var(--accent-green)":"var(--text-muted)", marginTop:4 }}>{pct}% complete</div>}
      </div>
      <div onClick={e => e.stopPropagation()} style={{ flex:1, overflowY:"auto", padding:"12px 10px" }}>
        {tasks.length === 0 ? (
          <p style={{ fontSize:12, color:"var(--text-dim)", textAlign:"center", marginTop:40, lineHeight:1.7 }}>
            — no tasks —{isActive && <><br /><span style={{ fontSize:11, color:"var(--text-muted)" }}>hover a chapter → +</span></>}
          </p>
        ) : tasks.map(t => <TaskCard key={t.id} task={t} onToggle={() => onToggle(t.id)} onRemove={() => onRemove(t.id)} />)}
      </div>
    </div>
  );
}

// ─── MASTERY LEDGER ────────────────────────────────────────────────────────────

function NotepadPanel({ notes, onAddNote, onToggleNote, onDeleteNote, onClearDone }) {
  const [draft, setDraft] = useState("");
  const [selIdx, setSelIdx] = useState(0);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const suggestions = useMemo(() => {
    const q = draft.trim();
    if (!q) return [];
    return rankChapters(q, null, 5).map((entry) => ({
      ...entry,
      cfg: S[entry.subject] ?? S.Physics,
    }));
  }, [draft]);

  const activeSuggestion = suggestions[selIdx] ?? suggestions[0] ?? null;
  const primaryAccent = activeSuggestion?.cfg?.accent ?? "var(--accent-orange)";
  const hasMatches = suggestions.length > 0;

  const commit = (text) => {
    const value = text.trim();
    if (!value) return;
    onAddNote(value);
    setDraft("");
    setSelIdx(0);
    inputRef.current?.focus();
  };

  const applySuggestion = (entry) => {
    if (!entry) return;
    setDraft(entry.chapter);
    setSelIdx(0);
    inputRef.current?.focus();
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.done !== b.done) return Number(a.done) - Number(b.done);
    return String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""));
  });

  const pendingCount = notes.filter((note) => !note.done).length;
  const doneCount = notes.length - pendingCount;

  return (
    <section style={{ borderBottom:"1px solid var(--border-sub)", background:"linear-gradient(180deg, rgba(13,19,32,0.98), rgba(8,12,20,0.98))" }}>
      <div style={{ padding:"12px 14px 10px", borderBottom:"1px solid var(--border-sub)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, marginBottom:10 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:"0.3em", color:"var(--accent-orange)", userSelect:"none" }}>TODO NOTEPAD</div>
            <div style={{ fontSize:12, color:"var(--text-sec)", marginTop:4 }}>Jot chapters down, keep free notes as-is.</div>
          </div>
          <div style={{ display:"flex", gap:6, flexShrink:0 }}>
            <span style={{ fontSize:10, color:"var(--accent-cyan)", background:"#38D9F515", border:"1px solid #38D9F525", borderRadius:999, padding:"2px 8px" }}>{pendingCount} open</span>
            <span style={{ fontSize:10, color:"var(--accent-green)", background:"#3DFC9A15", border:"1px solid #3DFC9A25", borderRadius:999, padding:"2px 8px" }}>{doneCount} done</span>
          </div>
        </div>

        <div style={{
          display:"flex",
          alignItems:"center",
          gap:8,
          background:"var(--bg-elevated)",
          border:`1px solid ${focused && hasMatches ? activeSuggestion?.cfg?.accentBorder ?? "var(--border-main)" : "var(--border-main)"}`,
          borderRadius:10,
          padding:"8px 10px",
          boxShadow: focused ? `0 0 0 2px ${primaryAccent}18` : "none",
        }}>
          <span style={{
            fontSize:9,
            fontWeight:700,
            letterSpacing:"0.18em",
            color: hasMatches ? primaryAccent : "var(--accent-orange)",
            background: hasMatches ? (activeSuggestion?.cfg?.accentBg ?? "var(--accent-orange)12") : "var(--accent-orange)12",
            border:`1px solid ${hasMatches ? (activeSuggestion?.cfg?.accentBorder ?? "var(--accent-orange)35") : "var(--accent-orange)35"}`,
            borderRadius:5,
            padding:"2px 6px",
            flexShrink:0,
          }}>
            {hasMatches ? (activeSuggestion?.cfg?.label ?? "NOTE") : "NOTE"}
          </span>

          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => { setDraft(e.target.value); setSelIdx(0); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 120)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" && suggestions.length) {
                e.preventDefault();
                setSelIdx((i) => Math.min(i + 1, suggestions.length - 1));
                return;
              }
              if (e.key === "ArrowUp" && suggestions.length) {
                e.preventDefault();
                setSelIdx((i) => Math.max(i - 1, 0));
                return;
              }
              if (e.key === "Tab" && suggestions.length) {
                e.preventDefault();
                applySuggestion(activeSuggestion);
                return;
              }
              if (e.key === "Escape") {
                setDraft("");
                setSelIdx(0);
                return;
              }
              if (e.key === "Enter") {
                e.preventDefault();
                commit(suggestions.length ? (activeSuggestion?.chapter ?? draft) : draft);
              }
            }}
            placeholder="Type chapters or quick reminders..."
            style={{ flex:1, minWidth:0, background:"transparent", border:"none", outline:"none", color:"var(--text-primary)", fontSize:12, fontFamily:"'JetBrains Mono', monospace", caretColor: hasMatches ? primaryAccent : "var(--accent-orange)" }}
          />

          {draft && !hasMatches && (
            <span style={{ fontSize:9, color:"var(--accent-orange)", background:"var(--accent-orange)12", border:"1px solid var(--accent-orange)30", borderRadius:5, padding:"2px 6px", letterSpacing:"0.12em", flexShrink:0 }}>
              FREE NOTE
            </span>
          )}
        </div>

        {focused && draft && (
          <div style={{ marginTop:6, border:"1px solid var(--border-sub)", borderRadius:12, overflow:"hidden", background:"var(--bg-elevated)", boxShadow:"0 16px 32px rgba(0,0,0,0.35)" }}>
            {hasMatches ? (
              suggestions.map((entry, index) => {
                const isActive = index === selIdx;
                return (
                  <div
                    key={`${entry.subject}|${entry.chapter}`}
                    onMouseDown={() => applySuggestion(entry)}
                    onMouseEnter={() => setSelIdx(index)}
                    style={{
                      display:"flex",
                      alignItems:"center",
                      gap:8,
                      padding:"7px 12px",
                      cursor:"pointer",
                      background:isActive ? "var(--bg-hover)" : "transparent",
                      borderBottom:index < suggestions.length - 1 ? "1px solid var(--border-sub)" : "none",
                    }}
                  >
                    <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.18em", color:entry.cfg.accent, background:entry.cfg.accentBg, border:`1px solid ${entry.cfg.accentBorder}`, borderRadius:5, padding:"2px 6px", flexShrink:0 }}>
                      {entry.cfg.label}
                    </span>
                    <span style={{ flex:1, minWidth:0, fontSize:13, color:isActive ? "var(--text-primary)" : "var(--text-sec)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {entry.chapter}
                    </span>
                    <span style={{ fontSize:9, color:"var(--text-muted)", flexShrink:0 }}>
                      Tab
                    </span>
                  </div>
                );
              })
            ) : (
              <div style={{ padding:"10px 12px", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.18em", color:"var(--accent-orange)", background:"var(--accent-orange)12", border:"1px solid var(--accent-orange)30", borderRadius:5, padding:"2px 6px", flexShrink:0 }}>
                  FREE NOTE
                </span>
                <span style={{ fontSize:12, color:"var(--text-sec)" }}>No chapter match, keep your text exactly as typed.</span>
              </div>
            )}
            <div style={{ padding:"8px 12px", borderTop:"1px solid var(--border-sub)", background:"var(--bg-surface)", display:"flex", justifyContent:"space-between", gap:8 }}>
              <span style={{ fontSize:9, color:"var(--text-muted)", letterSpacing:"0.14em" }}>
                Tab = autocomplete · Enter = save note
              </span>
              <span style={{ fontSize:10, color: hasMatches ? primaryAccent : "var(--accent-orange)" }}>
                {hasMatches ? `MATCH ${activeSuggestion?.chapter ?? ""}` : "FREE TEXT"}
              </span>
            </div>
          </div>
        )}

        {notes.length > 0 && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginTop:10 }}>
            <span style={{ fontSize:10, color:"var(--text-dim)", letterSpacing:"0.12em" }}>CHECK A NOTE TO MARK IT DONE</span>
            <button
              onClick={onClearDone}
              style={{ border:"1px solid var(--border-main)", background:"transparent", borderRadius:8, padding:"5px 10px", color:"var(--text-sec)", cursor:"pointer", fontSize:10, letterSpacing:"0.12em", fontFamily:"'JetBrains Mono', monospace" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--text-sec)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-sec)"; e.currentTarget.style.borderColor = "var(--border-main)"; }}
            >
              CLEAR DONE
            </button>
          </div>
        )}
      </div>

      <div style={{ maxHeight:220, overflowY:"auto", padding:"10px 10px 12px", display:"flex", flexDirection:"column", gap:8 }}>
        {sortedNotes.length === 0 ? (
          <div style={{ padding:"16px 8px", border:"1px dashed var(--border-sub)", borderRadius:12, textAlign:"center", color:"var(--text-dim)", fontSize:12, lineHeight:1.7 }}>
            Drop chapter names or reminders here as a running revision queue.
          </div>
        ) : sortedNotes.map((note) => {
          const { isChapterLike, badgeColor, badgeBg, badgeBorder, badgeText } = getChapterTheme(note.text);
          return (
            <div
              key={note.id}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:12, border:`1px solid ${note.done ? "var(--border-sub)" : "var(--border-main)"}`, background:note.done ? "var(--bg-surface)" : "var(--bg-elevated)", opacity:note.done ? 0.72 : 1 }}
            >
              <button
                onClick={() => onToggleNote(note.id)}
                aria-label={note.done ? "Mark note as open" : "Mark note as done"}
                style={{ width:18, height:18, borderRadius:5, flexShrink:0, border:`2px solid ${note.done ? "var(--accent-green)" : "var(--border-main)"}`, background:note.done ? "rgba(61, 252, 154, 0.18)" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
              >
                {note.done && <span style={{ color:"var(--accent-green)", fontSize:10, lineHeight:1 }}>✓</span>}
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
                {!isChapterLike && (
                  <span style={{ fontSize:10, color:"var(--text-dim)" }}>
                    Free-form reminder
                  </span>
                )}
              </div>

              <button
                onClick={() => onDeleteNote(note.id)}
                style={{ flexShrink:0, border:"1px solid #3A2230", background:"#1E0E18", padding:"2px 7px", borderRadius:6, color:"#FF8FA3", fontSize:10, letterSpacing:"0.12em", cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#2E1020"; e.currentTarget.style.color = "#FFD5DD"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#1E0E18"; e.currentTarget.style.color = "#FF8FA3"; }}
              >
                DEL
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MasteryLedger({ ledger }) {
  const [open, setOpen] = useState({});
  const subjects = Object.keys(ledger);
  if (!subjects.length) return <p style={{ fontSize:12, color:"var(--text-muted)", textAlign:"center", marginTop:60, lineHeight:1.8, padding:"0 16px" }}>Complete tasks to build<br />your mastery log.</p>;

  return (
    <div>
      {subjects.map(subject => {
        const cfg     = S[subject] ?? S.Physics;
        const chapters = ledger[subject];
        const total   = Object.values(chapters).reduce((s,a) => s+a.length, 0);
        const sOpen   = open[subject] !== false;
        return (
          <div key={subject} style={{ borderBottom:"1px solid var(--border-sub)" }}>
            <button onClick={() => setOpen(o => ({ ...o, [subject]:!sOpen }))}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:"var(--bg-elevated)", border:"none", cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}
              onMouseEnter={e => e.currentTarget.style.background="var(--bg-hover)"}
              onMouseLeave={e => e.currentTarget.style.background="var(--bg-elevated)"}
            >
              <span style={{ color:cfg.accent, background:cfg.accentBg, border:`1px solid ${cfg.accentBorder}`, fontSize:9, fontWeight:700, letterSpacing:"0.18em", borderRadius:5, padding:"2px 6px" }}>{cfg.label}</span>
              <span style={{ flex:1, textAlign:"left", fontSize:13, color:"var(--text-primary)", fontWeight:500 }}>{subject}</span>
              <span style={{ fontSize:11, color:"var(--accent-green)", background:"#3DFC9A15", borderRadius:99, padding:"1px 8px" }}>{total}</span>
              <span style={{ fontSize:9, color:"var(--text-muted)", marginLeft:4 }}>{sOpen?"▾":"▸"}</span>
            </button>
            {sOpen && Object.entries(chapters).map(([ch, entries]) => {
              const ck    = `${subject}|${ch}`;
              const cOpen = open[ck] !== false;
              return (
                <div key={ch}>
                  <button onClick={() => setOpen(o => ({ ...o, [ck]:!cOpen }))}
                    style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"6px 14px 6px 24px", background:"transparent", border:"none", cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}
                    onMouseEnter={e => e.currentTarget.style.background="var(--bg-hover)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >
                    <span style={{ flex:1, textAlign:"left", fontSize:12, color:"var(--text-sec)" }}>{ch}</span>
                    <span style={{ fontSize:10, color:"var(--text-muted)" }}>{entries.length}×</span>
                    <span style={{ fontSize:8, color:"var(--text-muted)", marginLeft:4 }}>{cOpen?"▾":"▸"}</span>
                  </button>
                  {cOpen && entries.map((entry, i) => (
                    <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"3px 14px 3px 32px" }}>
                      <span style={{ fontSize:10, color:"var(--text-muted)", flexShrink:0, width:44 }}>{entry.date.slice(5).replace("-","/")}</span>
                      <span style={{ fontSize:11, color:"var(--text-sec)", lineHeight:1.4 }}>{entry.note || "—"}</span>
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
        ["Click side column", "Jump active day to that column."],
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
    <div className="help-overlay" style={{ position:"absolute", inset:0, zIndex:40, background:"rgba(2,6,12,0.7)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", overflowY:"auto", display:"flex", flexDirection:"column", alignItems:"center", padding:"0 16px 24px" }}>
      <div className="help-panel" style={{ width:"100%", maxWidth:900, marginTop:0, borderRadius:"0 0 20px 20px", border:"1px solid var(--border-main)", borderTop:"none", background:"var(--bg-surface)", boxShadow:"0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px #38D9F510", overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px", borderBottom:"1px solid var(--border-sub)", background:"linear-gradient(to right,#38D9F508,transparent)" }}>
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

function CalendarOverlay({ open, onClose, data, activeDate, setActiveDate }) {
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
    <div className="cal-overlay" style={{ position:"absolute", inset:0, zIndex:60, background:"rgba(2,6,12,0.75)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={onClose}>
      <div className="cal-panel" style={{ background:"var(--bg-surface)", border:"1px solid var(--border-main)", borderRadius:20, boxShadow:"0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px #38D9F510", width:"100%", maxWidth:740, overflow:"hidden", fontFamily:"'JetBrains Mono', monospace" }} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px 14px", background:"linear-gradient(to right,#38D9F508,transparent)", borderBottom:"1px solid var(--border-sub)" }}>
          <div>
            <p style={{ margin:0, fontSize:10, letterSpacing:"0.3em", color:"var(--accent-cyan)" }}>CALENDAR</p>
            <h2 style={{ margin:"4px 0 0", fontSize:22, fontWeight:700, color:"var(--text-primary)", fontFamily:"'Space Grotesk', sans-serif" }}>{MONTHS[viewMonth]} {viewYear}</h2>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, color:"var(--text-muted)", letterSpacing:"0.1em" }}>THIS MONTH</div>
              <div style={{ fontSize:14, color:"var(--accent-green)", fontWeight:600 }}>{monthDone}/{monthTasks.length} done</div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={prevMonth} style={{ background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:8, color:"var(--text-sec)", fontSize:14, padding:"6px 12px", cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.color="var(--text-primary)"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-sec)"}
              >‹</button>
              <button onClick={goToday} style={{ background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:8, color:"var(--accent-cyan)", fontSize:11, padding:"6px 12px", cursor:"pointer", letterSpacing:"0.08em", fontFamily:"'JetBrains Mono', monospace" }}>TODAY</button>
              <button onClick={nextMonth} style={{ background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:8, color:"var(--text-sec)", fontSize:14, padding:"6px 12px", cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.color="var(--text-primary)"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-sec)"}
              >›</button>
            </div>
            <button onClick={onClose} style={{ background:"transparent", border:"1px solid var(--border-main)", borderRadius:8, color:"var(--text-muted)", fontSize:12, padding:"6px 12px", cursor:"pointer", letterSpacing:"0.1em", fontFamily:"'JetBrains Mono', monospace" }}
              onMouseEnter={e=>{ e.currentTarget.style.color="var(--accent-red)"; e.currentTarget.style.borderColor="var(--accent-red)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.color="var(--text-muted)"; e.currentTarget.style.borderColor="var(--border-main)"; }}
            >ESC ✕</button>
          </div>
        </div>

        {/* Weekday headers */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:"10px 20px 6px", borderBottom:"1px solid var(--border-sub)" }}>
          {WEEKDAYS.map(d => <div key={d} style={{ textAlign:"center", fontSize:10, letterSpacing:"0.2em", color:d==="Sun"||d==="Sat"?"var(--text-dim)":"var(--text-muted)", fontWeight:600 }}>{d}</div>)}
        </div>

        {/* Day grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6, padding:"12px 20px 16px" }}>
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
                style={{ position:"relative", borderRadius:10, border:`1px solid ${isSel?"var(--accent-cyan)":isToday?"var(--accent-orange)80":isActive?"#38D9F530":"var(--border-sub)"}`, background:isSel?"#38D9F510":isActive?"#38D9F508":isToday?"#FF9F4308":"var(--bg-elevated)", padding:"8px 6px 6px", minHeight:68, display:"flex", flexDirection:"column", alignItems:"center", userSelect:"none" }}
              >
                <span style={{ fontSize:isToday||isSel?15:13, fontWeight:isToday||isSel?700:400, color:isSel?"var(--accent-cyan)":isToday?"var(--accent-orange)":isActive?"var(--text-primary)":isWeekend?"var(--text-muted)":"var(--text-sec)", lineHeight:1, fontFamily:"'Space Grotesk', sans-serif" }}>{day}</span>
                {total>0 && <span style={{ marginTop:4, fontSize:10, color:pct===100?"var(--accent-green)":"var(--text-muted)" }}>{pct===100?"✓":`${total}`}</span>}
                {tasks.length>0 && <DensityDots tasks={tasks} />}
                {total>0 && <CompletionRing pct={pct} size={24} accent={ringAccent} />}
                {isActive && !isSel && <div style={{ position:"absolute", bottom:4, left:"50%", transform:"translateX(-50%)", width:4, height:4, borderRadius:"50%", background:"var(--accent-cyan)", opacity:0.7 }} />}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 24px 14px", borderTop:"1px solid var(--border-sub)" }}>
          <div style={{ display:"flex", gap:16, alignItems:"center" }}>
            {[{ color:"var(--accent-orange)", label:"Today" },{ color:"var(--accent-cyan)", label:"Selected" },{ color:"var(--accent-green)", label:"All done" }].map(({ color, label }) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:color }} />
                <span style={{ fontSize:10, color:"var(--text-muted)", letterSpacing:"0.08em" }}>{label}</span>
              </div>
            ))}
            <span style={{ fontSize:10, color:"var(--text-dim)", marginLeft:4 }}>· click = select · double-click = jump</span>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onClose} style={{ background:"transparent", border:"1px solid var(--border-main)", borderRadius:8, color:"var(--text-sec)", fontSize:12, padding:"6px 14px", cursor:"pointer", fontFamily:"'JetBrains Mono', monospace" }}>CANCEL</button>
            <button onClick={handleConfirm} style={{ background:"#38D9F515", border:"1px solid var(--accent-cyan)60", borderRadius:8, color:"var(--accent-cyan)", fontSize:12, padding:"6px 18px", cursor:"pointer", letterSpacing:"0.1em", fontFamily:"'JetBrains Mono', monospace", fontWeight:600 }}
              onMouseEnter={e=>e.currentTarget.style.background="#38D9F525"} onMouseLeave={e=>e.currentTarget.style.background="#38D9F515"}
            >JUMP → {selected ? fmtDateBig(selected) : "—"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ──────────────────────────────────────────────────────────────────

export default function App() {
  const [fileHandle,   setFileHandle]   = useState(null);
  const [data,         setData]         = useState(null);
  const [activeDate,   setActiveDate]   = useState(todayStr());
  const [showHelp,     setShowHelp]     = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchQ,      setSearchQ]      = useState("");

  const cmdRef    = useRef(null);
  const saveTimer = useRef(null);

  const moveActive = useCallback((step) => setActiveDate(d => shiftDateStr(d, step)), []);

  const schedSave = useCallback((nextData) => {
    if (!fileHandle) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      writeFH(fileHandle, { ...nextData, meta:{ ...nextData.meta, lastModified:new Date().toISOString() } }).catch(()=>{});
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

      if ((e.ctrlKey||e.metaKey) && !e.shiftKey && e.key==="d") {
        e.preventDefault();
        patch(prev => { const tasks=(prev.days[activeDate]?.tasks??[]).map(t=>({ ...t, completed:true, completedAt:t.completedAt??new Date().toISOString() })); return { ...prev, days:{ ...prev.days, [activeDate]:{ tasks } } }; });
        return;
      }
      if ((e.ctrlKey||e.metaKey) && e.key==="u") {
        e.preventDefault();
        patch(prev => { const tasks=(prev.days[activeDate]?.tasks??[]).map(t=>({ ...t, completed:false, completedAt:null })); return { ...prev, days:{ ...prev.days, [activeDate]:{ tasks } } }; });
        return;
      }
      if ((e.ctrlKey||e.metaKey) && e.shiftKey && e.key==="D") {
        e.preventDefault();
        patch(prev => { const tasks=(prev.days[activeDate]?.tasks??[]).filter(t=>!t.completed); return { ...prev, days:{ ...prev.days, [activeDate]:{ tasks } } }; });
        return;
      }
      if ((e.ctrlKey||e.metaKey) && e.shiftKey && e.key==="R") {
        e.preventDefault();
        const yesterday = shiftDateStr(activeDate,-1);
        patch(prev => {
          const pending = (prev.days[yesterday]?.tasks??[]).filter(t=>!t.completed);
          const existingIds = new Set((prev.days[activeDate]?.tasks??[]).map(t=>t.id));
          const rollovers   = pending.filter(t=>!existingIds.has(t.id)).map(t=>({ ...t, id:uid(), isRollover:true, completed:false, completedAt:null }));
          if (!rollovers.length) return prev;
          return { ...prev, days:{ ...prev.days, [activeDate]:{ tasks:[...(prev.days[activeDate]?.tasks??[]),...rollovers] } } };
        });
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
  }, [moveActive, activeDate, patch]);

  const addTask = useCallback((date, subject, chapter, customNote) => {
    const task = { id:uid(), subject, chapter, customNote:customNote?.trim()??"", completed:false, completedAt:null, isRollover:false };
    patch(prev => ({ ...prev, days:{ ...prev.days, [date]:{ tasks:[...(prev.days[date]?.tasks??[]),task] } } }));
  }, [patch]);

  const addNote = useCallback((text) => {
    const note = { id:noteUid(), text:text.trim(), done:false, createdAt:new Date().toISOString() };
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

  const clearDoneNotes = useCallback(() => {
    patch(prev => ({ ...prev, notes:(prev.notes??[]).filter(note => !note.done) }));
  }, [patch]);

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

  const handleSwapFile = async () => {
    try { const fh=await openFilePicker(); setFileHandle(fh); setData((await readFH(fh))??normalizeData(DEFAULT_DATA())); }
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
  const visibleDays = useMemo(() => [-1,0,1].map(i=>shiftDateStr(activeDate,i)), [activeDate]);

  if (!data) return (<><InjectStyles /><SetupScreen onReady={(fh,d)=>{ setFileHandle(fh); setData(normalizeData(d)); }} /></>);

  const today = todayStr();

  return (
    <>
      <InjectStyles />
      <div style={{ height:"100vh", background:"var(--bg-base)", color:"var(--text-primary)", display:"flex", flexDirection:"column", overflow:"hidden", fontFamily:"'JetBrains Mono', monospace", position:"relative" }}>

        {/* ── HEADER ── */}
        <header style={{ flexShrink:0, display:"flex", alignItems:"center", gap:12, padding:"10px 16px", background:"var(--bg-surface)", borderBottom:"1px solid var(--border-main)", zIndex:10, position:"relative" }}>
          <span style={{ fontSize:13, fontWeight:800, letterSpacing:"0.3em", color:"var(--accent-cyan)", flexShrink:0, userSelect:"none", fontFamily:"'Space Grotesk', sans-serif" }}>JEE//OS</span>

          <CommandBar activeDate={activeDate} onAddTask={addTask} cmdRef={cmdRef} />

          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
            {[{ label:`🔥 ${data.meta?.streakCount??0}d` },{ label:`✓ ${totalDone}` }].map((b,i) => (
              <span key={i} style={{ fontSize:12, color:"var(--text-sec)", background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:7, padding:"4px 10px" }}>{b.label}</span>
            ))}
            <button onClick={() => setShowCalendar(true)} title="Full calendar (C)" style={{ color:"var(--text-sec)", background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:7, padding:"4px 10px", fontSize:12, cursor:"pointer", fontFamily:"'JetBrains Mono', monospace", transition:"color 0.12s" }}
              onMouseEnter={e=>e.currentTarget.style.color="var(--accent-purple)"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-sec)"}
            >▦ CAL</button>
            <button onClick={() => setShowHelp(true)} title="Help (?)" style={{ color:"var(--text-sec)", background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:7, padding:"4px 10px", fontSize:12, cursor:"pointer", fontFamily:"'JetBrains Mono', monospace", transition:"color 0.12s" }}
              onMouseEnter={e=>e.currentTarget.style.color="var(--accent-cyan)"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-sec)"}
            >? HELP</button>
            <button onClick={handleSwapFile} title="Switch data file" style={{ color:"var(--text-sec)", background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:7, padding:"4px 10px", fontSize:15, cursor:"pointer", transition:"color 0.12s" }}
              onMouseEnter={e=>e.currentTarget.style.color="var(--text-primary)"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-sec)"}
            >⚙</button>
          </div>
        </header>

        {/* ── BODY ── */}
        <div style={{ position:"relative", flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <HelpPanel    open={showHelp}     onClose={() => setShowHelp(false)} />
          <CalendarOverlay open={showCalendar} onClose={() => setShowCalendar(false)} data={data} activeDate={activeDate} setActiveDate={setActiveDate} />

          <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

            {/* Syllabus tree */}
            <aside style={{ width:"22%", flexShrink:0, background:"var(--bg-base)", borderRight:"1px solid var(--border-main)", overflowY:"auto", display:"flex", flexDirection:"column" }}>
              <div style={{ flexShrink:0, borderBottom:"1px solid var(--border-sub)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px 6px" }}>
                  <span style={{ fontSize:10, letterSpacing:"0.3em", color:"var(--text-muted)", userSelect:"none" }}>SYLLABUS</span>
                  <span style={{ fontSize:10, color:"var(--accent-cyan)", background:"#38D9F515", border:"1px solid #38D9F525", borderRadius:5, padding:"1px 7px" }}>→ {fmtDateBig(activeDate)}</span>
                </div>
                <div style={{ padding:"0 10px 10px", position:"relative" }}>
                  <span style={{ position:"absolute", left:18, top:"50%", transform:"translateY(-60%)", fontSize:12, color:"var(--text-muted)", pointerEvents:"none" }}>🔍</span>
                  <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search chapters..."
                    style={{ width:"100%", background:"var(--bg-elevated)", border:"1px solid var(--border-main)", borderRadius:8, padding:"7px 10px 7px 28px", fontSize:12, color:"var(--text-primary)", outline:"none", fontFamily:"'JetBrains Mono', monospace", caretColor:"var(--accent-cyan)" }}
                    onFocus={e=>e.currentTarget.style.borderColor="var(--accent-cyan)"}
                    onBlur={e=>e.currentTarget.style.borderColor="var(--border-main)"}
                  />
                  {searchQ && <button onClick={()=>setSearchQ("")} style={{ position:"absolute", right:16, top:"50%", transform:"translateY(-60%)", background:"none", border:"none", cursor:"pointer", fontSize:12, color:"var(--text-muted)", padding:0 }}>✕</button>}
                </div>
              </div>
              {Object.entries(JEE_SYLLABUS).map(([subject, classes]) => (
                <SubjectTree key={subject} subject={subject} classes={classes} activeDate={activeDate} onAddTask={addTask} searchQ={searchQ} />
              ))}
            </aside>

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

            {/* Mastery Ledger */}
            <aside style={{ width:"23%", flexShrink:0, background:"var(--bg-base)", borderLeft:"1px solid var(--border-main)", overflow:"hidden", display:"flex", flexDirection:"column" }}>
              <NotepadPanel
                notes={data.notes ?? []}
                onAddNote={addNote}
                onToggleNote={toggleNote}
                onDeleteNote={deleteNote}
                onClearDone={clearDoneNotes}
              />
              <div style={{ padding:"10px 14px", fontSize:10, letterSpacing:"0.3em", color:"var(--text-muted)", borderBottom:"1px solid var(--border-sub)", flexShrink:0, userSelect:"none" }}>MASTERY LEDGER</div>
              <div style={{ flex:1, overflowY:"auto" }}>
                <MasteryLedger ledger={masteryLedger} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
