import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  ArrowLeft, Brain, Info, BookOpen, BarChart2, Zap, ChevronRight, ChevronLeft,
  Activity, Calculator, CheckCircle, XCircle, Award, RefreshCw, RotateCcw,
  Sigma, Target, TrendingUp, Layers, Eye, FlaskConical, Atom, GitBranch,
  AlertCircle, Star, Trophy, Play, Pause, SkipForward
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, Cell, LineChart, Line, Area, AreaChart,
  ComposedChart, Scatter
} from "recharts";

// ──────────────────────────────────────────
// PALETA Y TEMA
// ──────────────────────────────────────────
const T = {
  bg: "#050508",
  surface: "#0c0c14",
  panel: "#111120",
  border: "rgba(255,255,255,0.07)",
  // Distribuciones
  binom: "#6366f1",    // índigo
  poisson: "#06b6d4",  // cyan
  hyper: "#f59e0b",    // amber
  normal: "#10b981",   // emerald
  // UI
  accent: "#8b5cf6",
  green: "#10b981",
  red: "#ef4444",
  yellow: "#f59e0b",
  pink: "#ec4899",
  white: "#f1f5f9",
  muted: "#64748b",
  faint: "#1e2035",
};

// ──────────────────────────────────────────
// LOGOS (idéntico a 5.1 para capítulo)
// ──────────────────────────────────────────
const Cap5Logo = ({ size = 44, animate = false }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
    style={animate ? { animation: "logoPulse 3s ease-in-out infinite" } : {}}>
    <defs>
      <linearGradient id="lg5b" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7c3aed" /><stop offset="1" stopColor="#4f46e5" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="12" fill="url(#lg5b)" />
    <circle cx="24" cy="26" r="12" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
    <path d="M24 26 L24 14 A12 12 0 0 1 36 26 Z" fill="rgba(255,255,255,0.9)" />
    <path d="M24 26 L36 26 A12 12 0 0 1 14.4 32 Z" fill="rgba(255,255,255,0.5)" />
    <path d="M24 26 L14.4 32 A12 12 0 0 1 24 14 Z" fill="rgba(255,255,255,0.3)" />
    <rect x="11" y="10" width="3" height="6" rx="1" fill="rgba(255,255,255,0.8)" />
    <rect x="15" y="8" width="3" height="8" rx="1" fill="rgba(255,255,255,0.6)" />
    <rect x="19" y="11" width="3" height="5" rx="1" fill="rgba(255,255,255,0.4)" />
  </svg>
);

// Logo sección 5.2 — 4 campanas/distribuciones (mismo tamaño proporcional que 4.2)
const Lab52Logo = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="lg52a" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" /><stop offset="0.5" stopColor="#06b6d4" /><stop offset="1" stopColor="#10b981" />
      </linearGradient>
      <linearGradient id="lg52b" x1="0" y1="48" x2="48" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f59e0b" /><stop offset="1" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="12" fill="#0c0c1e" />
    {/* 4 barras representando distribuciones */}
    <rect x="5" y="30" width="7" height="12" rx="2" fill="url(#lg52a)" opacity="0.9" />
    <rect x="14" y="22" width="7" height="20" rx="2" fill="url(#lg52a)" opacity="0.8" />
    <rect x="23" y="16" width="7" height="26" rx="2" fill="url(#lg52b)" opacity="0.9" />
    <rect x="32" y="24" width="7" height="18" rx="2" fill="url(#lg52a)" opacity="0.7" />
    {/* Curva normal encima */}
    <path d="M4 30 Q12 8 24 12 Q36 8 44 30" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity="0.6" strokeLinecap="round" />
    {/* Línea base */}
    <line x1="4" y1="42" x2="44" y2="42" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
  </svg>
);

// ──────────────────────────────────────────
// FUNCIONES MATEMÁTICAS (numéricamente estables)
// ──────────────────────────────────────────
// Log-factorial para evitar overflow en k > 20
const logFactorial = n => { if (n <= 1) return 0; let s = 0; for (let i = 2; i <= n; i++) s += Math.log(i); return s; };
const factorial = n => Math.exp(logFactorial(n));

// Combinaciones en log-espacio — sin Math.round, sin overflow
const logComb = (n, k) => { if (k < 0 || k > n) return -Infinity; return logFactorial(n) - logFactorial(k) - logFactorial(n - k); };
const comb = (n, k) => k < 0 || k > n ? 0 : Math.exp(logComb(n, k));

// Poisson estable via log-espacio (funciona para cualquier k, cualquier λ)
const poissonPMF = (lambda, k) => lambda <= 0 ? (k === 0 ? 1 : 0) : Math.exp(-lambda + k * Math.log(lambda) - logFactorial(k));
const binomPMF = (n, p, k) => {
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  return Math.exp(logComb(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
};
// Hipergeométrica en log-espacio — sin redondeo intermedio
const hyperPMF = (N, K, n, k) => {
  const logP = logComb(K, k) + logComb(N - K, n - k) - logComb(N, n);
  return isFinite(logP) ? Math.exp(logP) : 0;
};
const normalPDF = (mu, sigma, x) => (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
const erf = (x) => {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return x >= 0 ? y : -y;
};
const normalCDF = (mu, sigma, x) => 0.5 * (1 + erf((x - mu) / (sigma * Math.sqrt(2))));

const buildBinom = (n, p) => {
  let acc = 0;
  return Array.from({ length: n + 1 }, (_, k) => {
    const prob = binomPMF(n, p, k);
    acc += prob;
    return { k, prob: +prob.toFixed(6), cdf: +Math.min(acc, 1).toFixed(6) };
  });
};
const buildPoisson = (lambda) => {
  const maxK = Math.max(20, Math.ceil(lambda + 4 * Math.sqrt(lambda)));
  let acc = 0;
  return Array.from({ length: maxK + 1 }, (_, k) => {
    const prob = poissonPMF(lambda, k);
    acc += prob;
    return { k, prob: +prob.toFixed(6), cdf: +Math.min(acc, 1).toFixed(6) };
  });
};
const buildHyper = (N, K, n) => {
  const kMin = Math.max(0, n + K - N), kMax = Math.min(n, K);
  let acc = 0;
  return Array.from({ length: kMax - kMin + 1 }, (_, i) => {
    const k = kMin + i;
    const prob = hyperPMF(N, K, n, k);
    acc += prob;
    return { k, prob: +prob.toFixed(6), cdf: +Math.min(acc, 1).toFixed(6) };
  });
};
const buildNormal = (mu, sigma) => {
  const pts = 200;
  const lo = mu - 4 * sigma, hi = mu + 4 * sigma;
  return Array.from({ length: pts }, (_, i) => {
    const x = lo + (i / (pts - 1)) * (hi - lo);
    return { x: +x.toFixed(3), pdf: +normalPDF(mu, sigma, x).toFixed(6), cdf: +normalCDF(mu, sigma, x).toFixed(6) };
  });
};

// ──────────────────────────────────────────
// COMPONENTES UI COMPARTIDOS
// ──────────────────────────────────────────
const Panel = ({ children, color = T.binom, style = {} }) => (
  <div style={{
    background: T.panel, border: `1px solid ${color}28`,
    borderRadius: 18, padding: 24, ...style
  }}>{children}</div>
);

const Chip = ({ children, color }) => (
  <span style={{
    display: "inline-block", padding: "3px 12px", borderRadius: 20,
    background: `${color}18`, color, fontSize: 11, fontWeight: 800,
    textTransform: "uppercase", letterSpacing: "0.08em", border: `1px solid ${color}30`
  }}>{children}</span>
);

const FormulaBox = ({ formula, color, sub }) => (
  <div style={{
    padding: "14px 20px", borderRadius: 14, textAlign: "center",
    background: `${color}10`, border: `1.5px solid ${color}35`, margin: "12px 0"
  }}>
    <p style={{ fontFamily: "Georgia,'Times New Roman',serif", fontSize: 20, color, fontWeight: 700, letterSpacing: "0.03em" }}>{formula}</p>
    {sub && <p style={{ color: T.muted, fontSize: 12, marginTop: 6 }}>{sub}</p>}
  </div>
);

const StatChip = ({ label, value, color, sub }) => (
  <div style={{
    padding: "10px 16px", borderRadius: 12, textAlign: "center", minWidth: 85,
    background: `${color}10`, border: `1px solid ${color}28`
  }}>
    <p style={{ color: T.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
    <p style={{ color, fontWeight: 900, fontSize: 20, fontFamily: "Georgia,serif", margin: "4px 0" }}>{value}</p>
    {sub && <p style={{ color: T.muted, fontSize: 10 }}>{sub}</p>}
  </div>
);

// ──────────────────────────────────────────
// TOOLTIP PERSONALIZADO
// ──────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, color, discrete = true }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0a0a14", border: `1px solid ${color}40`, borderRadius: 12,
      padding: "10px 14px", boxShadow: `0 8px 32px rgba(0,0,0,0.6)`
    }}>
      <p style={{ color: T.white, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
        {discrete ? `k = ${label}` : `x = ${label}`}
      </p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || color, fontSize: 12 }}>
          {p.name}: <strong>{typeof p.value === "number" ? (p.value * 100).toFixed(3) + "%" : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ══════════════════════════════════════════
// INTRO: ÁRBOL DECISIÓN VISUAL + TEORÍA
// ══════════════════════════════════════════
const TabIntro = () => {
  const [activeCard, setActiveCard] = useState(null);
  const [step, setStep] = useState(0);

  const DISTS = [
    {
      id: "binom", name: "Binomial", color: T.binom, emoji: "🎯",
      formula: "P(X=k) = C(n,k) · pᵏ · (1-p)ⁿ⁻ᵏ",
      when: "¿Cuántos éxitos en n ensayos independientes?",
      params: ["n = número de ensayos", "p = probabilidad de éxito"],
      EX: "E(X) = n·p", Var: "Var(X) = n·p·(1-p)",
      ejemplos: ["Piezas defectuosas en un lote", "Clics en campaña publicitaria", "Preguntas acertadas en examen"],
      requisitos: ["n fija y conocida", "Resultado binario (éxito/fracaso)", "p constante en cada ensayo", "Ensayos independientes"],
      tag: "DISCRETA"
    },
    {
      id: "poisson", name: "Poisson", color: T.poisson, emoji: "⚡",
      formula: "P(X=k) = (e⁻λ · λᵏ) / k!",
      when: "¿Cuántos eventos raros en un intervalo fijo?",
      params: ["λ = tasa promedio de ocurrencias"],
      EX: "E(X) = λ", Var: "Var(X) = λ",
      ejemplos: ["Clientes por hora en banco", "Llamadas por minuto", "Fallos por kilómetro de cable"],
      requisitos: ["Eventos independientes", "Tasa λ constante", "No pueden ocurrir simultáneamente", "n→∞, p→0, λ=np constante"],
      tag: "DISCRETA"
    },
    {
      id: "hyper", name: "Hipergeométrica", color: T.hyper, emoji: "🎲",
      formula: "P(X=k) = C(K,k)·C(N-K,n-k) / C(N,n)",
      when: "¿Cuántos éxitos al muestrear SIN reemplazo?",
      params: ["N = tamaño población", "K = éxitos en población", "n = tamaño muestra"],
      EX: "E(X) = n·K/N", Var: "Var(X) = n·(K/N)·(1-K/N)·(N-n)/(N-1)",
      ejemplos: ["Control calidad en lotes finitos", "Auditoría de inventario", "Selección de comités"],
      requisitos: ["Población finita N", "Muestreo SIN reemplazo", "p cambia en cada extracción", "Dos categorías: éxito/fracaso"],
      tag: "DISCRETA"
    },
    {
      id: "normal", name: "Normal", color: T.normal, emoji: "🔔",
      formula: "f(x) = (1/σ√2π) · e^(-½·((x-μ)/σ)²)",
      when: "Variables continuas con distribución simétrica",
      params: ["μ = media", "σ = desviación estándar"],
      EX: "E(X) = μ", Var: "Var(X) = σ²",
      ejemplos: ["Alturas, pesos, temperaturas", "Errores de medición", "Calificaciones de exámenes"],
      requisitos: ["Variable continua", "Distribución simétrica tipo campana", "Media = mediana = moda", "Aprox. Binomial con n grande"],
      tag: "CONTINUA"
    },
  ];

  const TREE_STEPS = [
    { q: "¿Es tu variable discreta (contar) o continua (medir)?", opts: ["Discreta — cuento enteros", "Continua — mido valores reales"], branch: [1, 3] },
    { q: "¿El muestreo es CON o SIN reemplazo (población finita)?", opts: ["Con reemplazo / población infinita", "Sin reemplazo — población finita"], branch: [2, "hyper"] },
    { q: "¿n es fija y conocida, o la tasa λ es lo que conoces?", opts: ["n fija → cuento éxitos en n ensayos", "λ conocida → eventos raros en intervalo"], branch: ["binom", "poisson"] },
    { q: "¿Los datos siguen una campana simétrica?", opts: ["Sí, distribución en campana", "No → revisar otras distribuciones"], branch: ["normal", null] },
  ];

  const [treePath, setTreePath] = useState([0]);
  const [treeAnswers, setTreeAnswers] = useState({});
  const [treeResult, setTreeResult] = useState(null);

  const currentStep = treePath[treePath.length - 1];
  const node = typeof currentStep === "number" ? TREE_STEPS[currentStep] : null;

  const handleTreeOpt = (optIdx) => {
    const next = node.branch[optIdx];
    if (typeof next === "string") {
      setTreeResult(next);
    } else if (next !== null) {
      setTreePath(p => [...p, next]);
    }
  };

  const resetTree = () => { setTreePath([0]); setTreeAnswers({}); setTreeResult(null); };

  const resultDist = treeResult ? DISTS.find(d => d.id === treeResult) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* HERO */}
      <div style={{
        background: `linear-gradient(135deg, ${T.binom}12 0%, transparent 70%)`,
        border: `1px solid ${T.binom}20`, borderRadius: 24, padding: 32, position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 75% 50%, ${T.binom}05 0%, transparent 55%)`, pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <Chip color={T.accent}>Capítulo 5 — Sección 2</Chip>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: T.white, margin: "14px 0 10px", lineHeight: 1.3 }}>
            Distribuciones de Probabilidad Discretas y Continua
          </h2>
          <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.8, maxWidth: 680 }}>
            Cada fenómeno aleatorio del mundo real tiene un modelo matemático que lo describe. Este laboratorio te da las 4 herramientas fundamentales — y el criterio para elegir cuál usar.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
            {DISTS.map(d => (
              <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
                <span style={{ fontSize: 13 }}>{d.emoji}</span>
                <span style={{ color: "#94a3b8", fontWeight: 700, fontSize: 12 }}>{d.name}</span>
                <span style={{ color: T.muted, fontSize: 10, opacity: 0.7 }}>{d.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ÁRBOL DE DECISIÓN INTERACTIVO */}
      <Panel color={T.accent} style={{ padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${T.accent},#4f46e5)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <GitBranch style={{ color: "white", width: 18, height: 18 }} />
          </div>
          <div>
            <h3 style={{ color: T.white, fontWeight: 900, fontSize: 17 }}>¿Qué distribución debo usar?</h3>
            <p style={{ color: T.muted, fontSize: 12 }}>Árbol de decisión interactivo — responde las preguntas</p>
          </div>
          <button onClick={resetTree} style={{ marginLeft: "auto", padding: "7px 14px", borderRadius: 10, border: `1px solid rgba(255,255,255,0.08)`, background: "transparent", color: T.muted, cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
            <RotateCcw style={{ width: 12, height: 12 }} />Reset
          </button>
        </div>

        {/* Ruta recorrida */}
        {treePath.length > 1 && (
          <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
            {treePath.map((step, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight style={{ color: T.muted, width: 12, height: 12 }} />}
                <span style={{ padding: "3px 10px", borderRadius: 20, background: `${T.accent}15`, color: T.accent, fontSize: 11, fontWeight: 700 }}>
                  Paso {i + 1}
                </span>
              </React.Fragment>
            ))}
            {treeResult && <><ChevronRight style={{ color: T.muted, width: 12, height: 12 }} /><span style={{ padding: "3px 10px", borderRadius: 20, background: `${resultDist?.color}20`, color: resultDist?.color, fontSize: 11, fontWeight: 800 }}>→ {resultDist?.name}</span></>}
          </div>
        )}

        {!treeResult && node && (
          <div>
            <div style={{ padding: "16px 20px", borderRadius: 14, background: `${T.accent}08`, border: `1px solid ${T.accent}20`, marginBottom: 16 }}>
              <p style={{ color: T.white, fontWeight: 700, fontSize: 15 }}>❓ {node.q}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {node.opts.map((opt, i) => (
                <button key={i} onClick={() => handleTreeOpt(i)} style={{
                  padding: "14px 18px", borderRadius: 13, border: `1.5px solid rgba(255,255,255,0.08)`,
                  background: "rgba(255,255,255,0.03)", color: T.white, cursor: "pointer",
                  fontWeight: 700, fontSize: 13, textAlign: "left",
                  transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: 10
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${T.accent}60`; e.currentTarget.style.background = `${T.accent}10`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
                  <span style={{ width: 24, height: 24, borderRadius: 7, background: `${T.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: T.accent, flexShrink: 0 }}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {treeResult && resultDist && (
          <div style={{ padding: "20px", borderRadius: 16, background: `${resultDist.color}12`, border: `2px solid ${resultDist.color}45` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 28 }}>{resultDist.emoji}</span>
              <div>
                <p style={{ color: resultDist.color, fontWeight: 900, fontSize: 20 }}>→ Distribución {resultDist.name}</p>
                <p style={{ color: T.muted, fontSize: 13 }}>{resultDist.when}</p>
              </div>
            </div>
            <FormulaBox formula={resultDist.formula} color={resultDist.color} />
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <StatChip label="E(X)" value={resultDist.EX.split("=")[1].trim()} color={resultDist.color} />
              <div style={{ flex: 1, padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p style={{ color: T.muted, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>EJEMPLOS</p>
                {resultDist.ejemplos.map((e, i) => <p key={i} style={{ color: "#cbd5e1", fontSize: 12, lineHeight: 1.8 }}>• {e}</p>)}
              </div>
            </div>
          </div>
        )}
      </Panel>

      {/* 4 TARJETAS DE DISTRIBUCIONES */}
      <div>
        <h3 style={{ color: T.white, fontWeight: 900, fontSize: 19, marginBottom: 18 }}>
          📚 Las 4 Distribuciones — Referencia Completa
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {DISTS.map(d => {
            const isOpen = activeCard === d.id;
            return (
              <div key={d.id}
                onClick={() => setActiveCard(isOpen ? null : d.id)}
                style={{
                  background: T.panel, border: `1.5px solid ${isOpen ? d.color + "60" : d.color + "22"}`,
                  borderRadius: 18, padding: 22, cursor: "pointer",
                  transition: "all 0.25s", boxShadow: isOpen ? `0 0 24px ${d.color}20` : "none"
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${d.color}20`, border: `1px solid ${d.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{d.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <p style={{ color: T.white, fontWeight: 900, fontSize: 16 }}>{d.name}</p>
                      <Chip color={d.color}>{d.tag}</Chip>
                    </div>
                    <p style={{ color: T.muted, fontSize: 12 }}>{d.when}</p>
                  </div>
                  <ChevronRight style={{ color: T.muted, width: 16, height: 16, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
                </div>

                <div style={{ padding: "10px 14px", borderRadius: 11, background: `${d.color}08`, border: `1px solid ${d.color}20`, marginBottom: 12 }}>
                  <p style={{ fontFamily: "Georgia,serif", fontSize: 13, color: d.color, fontWeight: 700, textAlign: "center" }}>{d.formula}</p>
                </div>

                {isOpen && (
                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <p style={{ color: T.muted, fontSize: 10, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>Parámetros</p>
                        {d.params.map((p, i) => <p key={i} style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.8 }}>• {p}</p>)}
                      </div>
                      <div style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <p style={{ color: T.muted, fontSize: 10, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>Momentos</p>
                        <p style={{ color: T.pink, fontSize: 12, fontFamily: "Georgia,serif" }}>{d.EX}</p>
                        <p style={{ color: T.yellow, fontSize: 12, fontFamily: "Georgia,serif", marginTop: 4 }}>{d.Var}</p>
                      </div>
                    </div>
                    <div style={{ padding: "10px 12px", borderRadius: 10, background: `${d.color}08`, border: `1px solid ${d.color}20` }}>
                      <p style={{ color: T.muted, fontSize: 10, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>Requisitos para usar esta distribución</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                        {d.requisitos.map((r, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                            <CheckCircle style={{ color: d.color, width: 12, height: 12, flexShrink: 0, marginTop: 2 }} />
                            <p style={{ color: "#94a3b8", fontSize: 11, lineHeight: 1.5 }}>{r}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p style={{ color: T.muted, fontSize: 10, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>Aplicaciones reales</p>
                      {d.ejemplos.map((e, i) => <p key={i} style={{ color: "#cbd5e1", fontSize: 12, lineHeight: 1.8 }}>⟶ {e}</p>)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TABLA COMPARATIVA */}
      <Panel color={T.green}>
        <h3 style={{ color: T.white, fontWeight: 900, fontSize: 17, marginBottom: 18 }}>⚖️ Tabla Comparativa — Cuándo usar cada una</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 5px" }}>
            <thead>
              <tr>
                {["Característica", "Binomial", "Poisson", "Hipergeométrica", "Normal"].map((h, i) => (
                  <th key={i} style={{ padding: "8px 14px", textAlign: i === 0 ? "left" : "center", color: i === 0 ? T.muted : [T.binom, T.poisson, T.hyper, T.normal][i - 1], fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Tipo de variable", "Discreta", "Discreta", "Discreta", "Continua"],
                ["Parámetros", "n, p", "λ", "N, K, n", "μ, σ"],
                ["Reemplazo", "Con reemplazo", "No aplica", "Sin reemplazo", "No aplica"],
                ["E(X)", "n·p", "λ", "n·K/N", "μ"],
                ["Var(X)", "n·p·q", "λ", "n·K/N·(1-K/N)·factor", "σ²"],
                ["σ(X)", "√(n·p·q)", "√λ", "√(Var(X))", "σ"],
                ["Casos de uso", "Exámenes, defectos", "Colas, llamadas", "Auditoría, lotes", "Alturas, errores"],
              ].map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{
                      padding: "10px 14px",
                      background: ci === 0 ? "rgba(255,255,255,0.02)" : `${[T.binom, T.poisson, T.hyper, T.normal][ci - 1]}08`,
                      borderRadius: ci === 0 ? "8px 0 0 8px" : ci === 4 ? "0 8px 8px 0" : 0,
                      color: ci === 0 ? T.muted : "#cbd5e1",
                      fontSize: ci === 0 ? 12 : 13,
                      fontWeight: ci === 0 ? 700 : 600,
                      textAlign: ci === 0 ? "left" : "center",
                      border: `1px solid ${ci === 0 ? "rgba(255,255,255,0.04)" : `${[T.binom, T.poisson, T.hyper, T.normal][ci - 1]}15`}`,
                    }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};

// ══════════════════════════════════════════
// CASOS APLICADOS — ESCENARIOS REALES
// ══════════════════════════════════════════
const CASOS = [
  {
    id: "fabrica", dist: "binom", color: T.binom, emoji: "🏭",
    titulo: "Control de Calidad — Fábrica de Bombillas",
    contexto: "Una fábrica produce bombillas con tasa de defectos p = 5%. Se inspeccionan n = 20 bombillas al azar. Sea X = número de bombillas defectuosas.",
    modelo: "X ~ Binomial(n=20, p=0.05)",
    params: { n: 20, p: 0.05 },
    preguntas: [
      { text: "¿Cuál es P(X = 0)? — Ninguna defectuosa", opts: ["0.3585", "0.3774", "0.2641", "0.1887"], correct: 0, exp: "P(X=0) = (0.95)²⁰ = 0.3585 = 35.85%. Más de 1/3 de las veces el lote sale perfecto." },
      { text: "¿Cuál es P(X = 1)? — Exactamente 1 defectuosa", opts: ["0.3585", "0.3774", "0.1887", "0.0596"], correct: 1, exp: "P(X=1) = C(20,1)·0.05¹·0.95¹⁹ = 20×0.05×0.3585 = 0.3774 = 37.74%." },
      { text: "¿Cuál es P(X ≥ 2)? — Al menos 2 defectuosas", opts: ["0.2641", "0.3585", "0.7359", "0.1887"], correct: 0, exp: "P(X≥2) = 1 - P(X=0) - P(X=1) = 1 - 0.3585 - 0.3774 = 0.2641 = 26.41%." },
      { text: "¿Cuál es P(X ≤ 2)? — A lo más 2 defectuosas", opts: ["0.9245", "0.7359", "0.6415", "0.5236"], correct: 0, exp: "P(X≤2) = P(0)+P(1)+P(2) = 0.3585+0.3774+0.1887 = 0.9245 = 92.45%. El 92% de los lotes tiene 2 o menos defectos." },
      { text: "¿Cuál es P(1 ≤ X ≤ 3)? — Entre 1 y 3 defectuosas", opts: ["0.5922", "0.7359", "0.4337", "0.6415"], correct: 0, exp: "P(1≤X≤3) = P(1)+P(2)+P(3) = 0.3774+0.1887+0.0596 = 0.5922 = 59.22%. El rango más frecuente de defectos." },
    ]
  },
  {
    id: "banco", dist: "poisson", color: T.poisson, emoji: "🏦",
    titulo: "Flujo de Clientes — Sucursal Bancaria",
    contexto: "En una sucursal bancaria llegan en promedio λ = 6 clientes por hora. Las llegadas son independientes. Sea X = clientes en la próxima hora.",
    modelo: "X ~ Poisson(λ=6)",
    params: { lambda: 6 },
    preguntas: [
      { text: "¿Cuál es P(X = 4)? — Exactamente 4 clientes", opts: ["0.1339", "0.1606", "0.2240", "0.0892"], correct: 0, exp: "P(X=4) = e⁻⁶·6⁴/4! = 0.0025×1296/24 = 0.1339 = 13.39%." },
      { text: "¿Cuál es P(X ≤ 2)? — A lo más 2 clientes", opts: ["0.1912", "0.0620", "0.0446", "0.2384"], correct: 1, exp: "P(X≤2) = P(0)+P(1)+P(2) = 0.0025+0.0149+0.0446 = 0.0620 = 6.20%." },
      { text: "¿Cuál es P(X ≥ 8)? — Saturación (más de 7 clientes)", opts: ["0.1528", "0.2560", "0.3840", "0.0892"], correct: 1, exp: "P(X≥8) = 1 - F(7) = 1 - 0.7440 = 0.2560 = 25.60%. Alta chance de saturación." },
      { text: "¿Cuál es P(X ≤ 6)? — A lo más 6 clientes (carga normal)", opts: ["0.6063", "0.7440", "0.5543", "0.8270"], correct: 0, exp: "P(X≤6) = F(6) = 0.6063 = 60.63%. Solo el 60% de las horas tienen carga normal o menor." },
      { text: "¿Cuál es P(4 ≤ X ≤ 8)? — Rango de trabajo normal", opts: ["0.5765", "0.6879", "0.4312", "0.7440"], correct: 0, exp: "P(4≤X≤8) = F(8)-F(3) = 0.8472-0.1512 = 0.5765 = 57.65%. La mayoría de las horas caen en este rango operativo." },
    ]
  },
  {
    id: "auditoria", dist: "hyper", color: T.hyper, emoji: "📦",
    titulo: "Auditoría de Inventario — Control de Lote",
    contexto: "Un lote de N=200 bombillas contiene K=10 defectuosas. Se inspeccionan n=15 sin reemplazo. Sea X = defectuosas en la muestra.",
    modelo: "X ~ Hipergeométrica(N=200, K=10, n=15)",
    params: { N: 200, K: 10, n: 15 },
    preguntas: [
      { text: "¿Cuál es P(X = 0)? — Ninguna defectuosa en muestra", opts: ["0.1365", "0.3835", "0.4500", "0.9701"], correct: 2, exp: "P(X=0) = C(10,0)·C(190,15)/C(200,15) ≈ 0.4500 = 45.00%. Casi la mitad de las veces la muestra parece perfecta." },
      { text: "¿Cuál es P(X = 2)? — Exactamente 2 defectuosas", opts: ["0.1365", "0.3835", "0.4500", "0.0238"], correct: 0, exp: "P(X=2) = C(10,2)·C(190,13)/C(200,15) ≈ 0.1365 = 13.65%." },
      { text: "¿Cuál es P(X ≤ 2)? — Muestra con pocas defectuosas", opts: ["0.9701", "0.8335", "0.5865", "0.1365"], correct: 0, exp: "P(X≤2) = P(0)+P(1)+P(2) ≈ 0.4500+0.3835+0.1365 = 0.9701 = 97.01%." },
      { text: "¿Cuál es P(X ≥ 3)? — Al menos 3 defectuosas (alerta)", opts: ["0.0299", "0.0620", "0.1365", "0.0446"], correct: 0, exp: "P(X≥3) = 1 - P(X≤2) = 1 - 0.9701 = 0.0299 = 2.99%. Solo el 3% activa la alerta de calidad." },
      { text: "¿Cuál es P(1 ≤ X ≤ 3)? — Rango de detección típica", opts: ["0.5299", "0.6200", "0.4500", "0.7440"], correct: 0, exp: "P(1≤X≤3) = P(X≤3)-P(X=0) ≈ 0.9940-0.4500 = 0.5299 = 52.99%. Más de la mitad de las inspecciones detectan 1-3 defectos." },
    ]
  },
  {
    id: "embotelladora", dist: "normal", color: T.normal, emoji: "🍶",
    titulo: "Máquina Embotelladora — Control de Volumen",
    contexto: "Una máquina llena botellas con μ = 500 ml y σ = 4 ml. El volumen sigue distribución Normal. Probabilidades de llenado.",
    modelo: "X ~ Normal(μ=500, σ=4)",
    params: { mu: 500, sigma: 4 },
    preguntas: [
      { text: "¿Cuál es P(X < 495)? — Menos de 495 ml (quejas de clientes)", opts: ["0.1056", "0.2266", "0.0228", "0.3085"], correct: 0, exp: "z = (495-500)/4 = -1.25 → P(X<495) = 0.1056 = 10.56%." },
      { text: "¿Cuál es P(X > 508)? — Más de 508 ml (desperdicio)", opts: ["0.1056", "0.0228", "0.2266", "0.0062"], correct: 1, exp: "z = (508-500)/4 = 2 → P(X>508) = 1-Φ(2) = 0.0228 = 2.28%." },
      { text: "¿Cuál es P(X ≤ 500)? — A lo más la media exacta", opts: ["0.5000", "0.6827", "0.3173", "0.2500"], correct: 0, exp: "P(X≤μ) = 0.5000 = 50%. En la Normal simétrica, exactamente la mitad queda bajo la media." },
      { text: "¿Cuál es P(X ≥ 496)? — Al menos 496 ml (especificación mínima)", opts: ["0.8413", "0.6827", "0.9772", "0.7257"], correct: 0, exp: "z = (496-500)/4 = -1 → P(X≥496) = 1-Φ(-1) = Φ(1) = 0.8413 = 84.13%." },
      { text: "¿Cuál es P(498 < X < 502)? — Rango ideal ±2ml", opts: ["0.1915", "0.3829", "0.6827", "0.2417"], correct: 1, exp: "P(498<X<502): zₗ=(498-500)/4=-0.5, zᵤ=(502-500)/4=0.5. P = Φ(0.5)-Φ(-0.5) = 0.3829 = 38.29%." },
    ]
  },
];

// ══════════════════════════════════════════
// CALCULADORA INTERACTIVA — 4 distribuciones + Casos integrados
// ══════════════════════════════════════════
const TabCalculadora = () => {
  const [dist, setDist] = useState("binom");
  const [highlightK, setHighlightK] = useState(null);
  const [showCDF, setShowCDF] = useState(false);
  const [queryA, setQueryA] = useState(""); // valor a (o único)
  const [queryB, setQueryB] = useState(""); // valor b (solo para intervalo)
  const [queryResult, setQueryResult] = useState(null);
  const [queryType, setQueryType] = useState("eq"); // eq | le | ge | range
  const [activeMode, setActiveMode] = useState("libre"); // "libre" | "caso"
  const [casoIdx, setCasoIdx] = useState(0);
  const [casoAnswers, setCasoAnswers] = useState({});
  const [casoCompleted, setCasoCompleted] = useState({});

  // Parámetros libres
  const [bn, setBn] = useState(10); const [bp, setBp] = useState(0.3);
  const [pl, setPl] = useState(4);
  const [hN, setHN] = useState(50); const [hK, setHK] = useState(10); const [hn, setHn] = useState(8);
  const [nmu, setNmu] = useState(70); const [nsigma, setNsigma] = useState(10);

  // Cuando cambia a modo caso, sincronizar parámetros
  const caso = CASOS[casoIdx];
  const casoAnsw = casoAnswers[casoIdx] || {};

  const getParamsForMode = () => {
    if (activeMode === "caso") {
      const c = CASOS[casoIdx];
      if (c.dist === "binom") return { dist: "binom", bn: c.params.n, bp: c.params.p, pl, hN, hK, hn, nmu, nsigma };
      if (c.dist === "poisson") return { dist: "poisson", bn, bp, pl: c.params.lambda, hN, hK, hn, nmu, nsigma };
      if (c.dist === "hyper") return { dist: "hyper", bn, bp, pl, hN: c.params.N, hK: c.params.K, hn: c.params.n, nmu, nsigma };
      if (c.dist === "normal") return { dist: "normal", bn, bp, pl, hN, hK, hn, nmu: c.params.mu, nsigma: c.params.sigma };
    }
    return { dist, bn, bp, pl, hN, hK, hn, nmu, nsigma };
  };
  const p = getParamsForMode();
  const activeDist = activeMode === "caso" ? CASOS[casoIdx].dist : dist;

  const distData = useMemo(() => {
    if (activeDist === "binom") return buildBinom(p.bn, p.bp);
    if (activeDist === "poisson") return buildPoisson(p.pl);
    if (activeDist === "hyper") return buildHyper(p.hN, p.hK, p.hn);
    return buildNormal(p.nmu, p.nsigma);
  }, [activeDist, p.bn, p.bp, p.pl, p.hN, p.hK, p.hn, p.nmu, p.nsigma]);

  const color = activeDist === "binom" ? T.binom : activeDist === "poisson" ? T.poisson : activeDist === "hyper" ? T.hyper : T.normal;
  const isDiscrete = activeDist !== "normal";

  const stats = useMemo(() => {
    if (activeDist === "binom") return { EX: (p.bn * p.bp).toFixed(3), Var: (p.bn * p.bp * (1 - p.bp)).toFixed(3), sigma: Math.sqrt(p.bn * p.bp * (1 - p.bp)).toFixed(3) };
    if (activeDist === "poisson") return { EX: p.pl.toFixed(2), Var: p.pl.toFixed(2), sigma: Math.sqrt(p.pl).toFixed(3) };
    if (activeDist === "hyper") {
      const ex = (p.hn * p.hK / p.hN).toFixed(3);
      const v = p.hn * (p.hK / p.hN) * (1 - p.hK / p.hN) * (p.hN - p.hn) / (p.hN - 1);
      return { EX: ex, Var: v.toFixed(3), sigma: Math.sqrt(v).toFixed(3) };
    }
    return { EX: p.nmu.toFixed(2), Var: (p.nsigma ** 2).toFixed(2), sigma: p.nsigma.toFixed(2) };
  }, [activeDist, p.bn, p.bp, p.pl, p.hN, p.hK, p.hn, p.nmu, p.nsigma]);

  // Cálculo de probabilidad con área sombreada
  const computeProb = (type, a, b) => {
    const ka = parseFloat(a), kb = parseFloat(b);
    if (isNaN(ka)) return null;
    if (isDiscrete) {
      if (type === "eq") { const d = distData.find(x => x.k === Math.round(ka)); return { prob: d?.prob || 0, shadeMin: Math.round(ka), shadeMax: Math.round(ka) }; }
      if (type === "le") { const d = distData.find(x => x.k === Math.round(ka)); return { prob: d?.cdf || 0, shadeMin: 0, shadeMax: Math.round(ka) }; }
      if (type === "ge") { const cdfPrev = Math.round(ka) > 0 ? (distData.find(x => x.k === Math.round(ka) - 1)?.cdf || 0) : 0; return { prob: 1 - cdfPrev, shadeMin: Math.round(ka), shadeMax: 999 }; }
      if (type === "range" && !isNaN(kb)) {
        const dA = distData.find(x => x.k === Math.round(ka)); const dB = distData.find(x => x.k === Math.round(kb));
        const pA = Math.round(ka) > 0 ? (distData.find(x => x.k === Math.round(ka) - 1)?.cdf || 0) : 0;
        const pB = dB?.cdf || 0;
        return { prob: pB - pA, shadeMin: Math.round(ka), shadeMax: Math.round(kb) };
      }
    } else {
      if (type === "le") return { prob: normalCDF(p.nmu, p.nsigma, ka), shadeMin: -Infinity, shadeMax: ka };
      if (type === "ge") return { prob: 1 - normalCDF(p.nmu, p.nsigma, ka), shadeMin: ka, shadeMax: Infinity };
      if (type === "range" && !isNaN(kb)) return { prob: normalCDF(p.nmu, p.nsigma, kb) - normalCDF(p.nmu, p.nsigma, ka), shadeMin: ka, shadeMax: kb };
      if (type === "eq") return { prob: normalPDF(p.nmu, p.nsigma, ka), shadeMin: ka - p.nsigma * 0.1, shadeMax: ka + p.nsigma * 0.1 };
    }
    return null;
  };

  const computeQuery = () => {
    const r = computeProb(queryType, queryA, queryB);
    if (r) setQueryResult({ a: parseFloat(queryA), b: parseFloat(queryB), type: queryType, ...r });
  };

  // Datos de gráfica con área sombreada
  const shadeRange = queryResult ? { min: queryResult.shadeMin, max: queryResult.shadeMax } : null;

  const chartDataWithShade = useMemo(() => {
    if (!shadeRange) return distData;
    if (!isDiscrete) {
      return distData.map(d => ({
        ...d,
        shade: d.x >= shadeRange.min && d.x <= shadeRange.max ? d.pdf : null,
      }));
    }
    return distData;
  }, [distData, shadeRange, isDiscrete]);

  // Caso: answer handler
  const handleCasoAnswer = (qi, oi) => {
    if (casoAnsw[qi] !== undefined) return;
    const newA = { ...casoAnswers, [casoIdx]: { ...casoAnsw, [qi]: oi } };
    setCasoAnswers(newA);
    if (Object.keys({ ...casoAnsw, [qi]: oi }).length === CASOS[casoIdx].preguntas.length) {
      setCasoCompleted(c => ({ ...c, [casoIdx]: true }));
    }
  };

  const DIST_TABS = [
    { id: "binom", label: "Binomial", emoji: "🎯", color: T.binom },
    { id: "poisson", label: "Poisson", emoji: "⚡", color: T.poisson },
    { id: "hyper", label: "Hipergeo.", emoji: "🎲", color: T.hyper },
    { id: "normal", label: "Normal", emoji: "🔔", color: T.normal },
  ];

  const QUERY_TYPES = [
    { id: "eq", label: "= k", tip: "Exactamente k" },
    { id: "le", label: "≤ k", tip: "A lo más k" },
    { id: "ge", label: "≥ k", tip: "Al menos k" },
    { id: "range", label: "a ≤ X ≤ b", tip: "Intervalo" },
  ];

  const queryLabel = () => {
    if (!queryResult) return "";
    const { type, a, b } = queryResult;
    if (type === "eq") return `P(X = ${a})`;
    if (type === "le") return `P(X ≤ ${a})`;
    if (type === "ge") return `P(X ≥ ${a})`;
    if (type === "range") return `P(${a} ≤ X ≤ ${b})`;
    return "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Modo selector */}
      <div style={{ display: "flex", gap: 8 }}>
        {[["libre", "🎛️ Exploración libre"], ["caso", "🏭 Casos aplicados"]].map(([id, lbl]) => (
          <button key={id} onClick={() => setActiveMode(id)} style={{
            flex: 1, padding: "12px 20px", borderRadius: 13, border: "none", cursor: "pointer",
            fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: activeMode === id ? `linear-gradient(135deg,${T.accent},#4f46e5)` : "rgba(255,255,255,0.04)",
            color: activeMode === id ? "white" : T.muted,
            boxShadow: activeMode === id ? `0 4px 18px ${T.accent}35` : "none",
            outline: activeMode !== id ? `1px solid rgba(255,255,255,0.08)` : "none",
            transition: "all 0.2s"
          }}>{lbl}</button>
        ))}
      </div>

      {/* Selector distribución (solo en modo libre) */}
      {activeMode === "libre" && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {DIST_TABS.map(d => (
            <button key={d.id} onClick={() => { setDist(d.id); setHighlightK(null); setQueryResult(null); }}
              style={{
                flex: 1, minWidth: 130, padding: "11px 16px", borderRadius: 13, border: "none", cursor: "pointer",
                fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                background: dist === d.id ? `linear-gradient(135deg,${d.color},${d.color}bb)` : `${d.color}10`,
                color: dist === d.id ? "white" : d.color,
                boxShadow: dist === d.id ? `0 4px 18px ${d.color}40` : "none",
                outline: dist !== d.id ? `1px solid ${d.color}30` : "none", transition: "all 0.2s"
              }}>
              <span style={{ fontSize: 18 }}>{d.emoji}</span>{d.label}
            </button>
          ))}
        </div>
      )}

      {/* Selector de caso (solo en modo caso) */}
      {activeMode === "caso" && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CASOS.map((c, i) => (
            <button key={c.id} onClick={() => { setCasoIdx(i); setQueryResult(null); }}
              style={{
                flex: 1, minWidth: 140, padding: "11px 14px", borderRadius: 13, border: "none", cursor: "pointer",
                fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                background: casoIdx === i ? `linear-gradient(135deg,${c.color},${c.color}bb)` : `${c.color}10`,
                color: casoIdx === i ? "white" : c.color,
                boxShadow: casoIdx === i ? `0 4px 14px ${c.color}40` : "none",
                outline: casoIdx !== i ? `1px solid ${c.color}30` : "none", transition: "all 0.2s",
                position: "relative"
              }}>
              <span>{c.emoji}</span>{c.titulo.split("—")[0].trim()}
              {casoCompleted[i] && <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: T.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "white", fontWeight: 900, border: `2px solid ${T.bg}` }}>✓</span>}
            </button>
          ))}
        </div>
      )}

      {/* Layout principal: parámetros + gráfica + preguntas */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 18, alignItems: "start" }}>

        {/* Panel izquierdo: parámetros + calculadora */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Contexto del caso */}
          {activeMode === "caso" && (
            <div style={{ padding: "16px 18px", borderRadius: 16, background: `${color}08`, border: `1.5px solid ${color}30` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{caso.emoji}</span>
                <div>
                  <p style={{ color: color, fontWeight: 900, fontSize: 13 }}>{caso.titulo.split("—")[0].trim()}</p>
                  <p style={{ color: T.muted, fontSize: 11, fontFamily: "monospace" }}>{caso.modelo}</p>
                </div>
              </div>
              <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.7 }}>{caso.contexto}</p>
            </div>
          )}

          <Panel color={color} style={{ padding: 20 }}>
            <h4 style={{ color: T.white, fontWeight: 900, fontSize: 14, marginBottom: 14 }}>
              {activeMode === "caso" ? "⚙️ Parámetros del modelo" : "⚙️ Parámetros"}
            </h4>

            {activeMode === "libre" ? (<>
              {activeDist === "binom" && [
                { label: "n — Número de ensayos", val: bn, set: setBn, min: 1, max: 30, step: 1, col: T.binom },
                { label: "p — Probabilidad de éxito", val: bp, set: setBp, min: 0.01, max: 0.99, step: 0.01, col: T.pink, fmt: v => v.toFixed(2) },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ color: T.muted, fontSize: 12, fontWeight: 700 }}>{s.label}</span>
                    <span style={{ color: T.white, fontWeight: 900, fontSize: 14, fontFamily: "Georgia,serif" }}>{s.fmt ? s.fmt(s.val) : s.val}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                    onChange={e => { s.set(+e.target.value); setHighlightK(null); setQueryResult(null); }}
                    style={{ width: "100%", accentColor: s.col, cursor: "pointer" }} />
                </div>
              ))}
              {activeDist === "poisson" && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ color: T.muted, fontSize: 12, fontWeight: 700 }}>λ — Tasa de eventos</span>
                    <span style={{ color: T.white, fontWeight: 900, fontSize: 14, fontFamily: "Georgia,serif" }}>{pl}</span>
                  </div>
                  <input type="range" min={0.5} max={20} step={0.5} value={pl}
                    onChange={e => { setPl(+e.target.value); setHighlightK(null); setQueryResult(null); }}
                    style={{ width: "100%", accentColor: T.poisson, cursor: "pointer" }} />
                </div>
              )}
              {activeDist === "hyper" && [
                { label: "N — Población total", val: hN, set: setHN, min: 10, max: 200, step: 5, col: T.hyper },
                { label: "K — Éxitos en población", val: hK, set: setHK, min: 1, max: hN - 1, step: 1, col: T.pink },
                { label: "n — Tamaño muestra", val: hn, set: setHn, min: 1, max: Math.min(hN, 20), step: 1, col: T.green },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ color: T.muted, fontSize: 12, fontWeight: 700 }}>{s.label}</span>
                    <span style={{ color: T.white, fontWeight: 900, fontSize: 14, fontFamily: "Georgia,serif" }}>{s.val}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                    onChange={e => { s.set(+e.target.value); setHighlightK(null); setQueryResult(null); }}
                    style={{ width: "100%", accentColor: s.col, cursor: "pointer" }} />
                </div>
              ))}
              {activeDist === "normal" && [
                { label: "μ — Media", val: nmu, set: setNmu, min: 0, max: 200, step: 1, col: T.normal },
                { label: "σ — Desv. estándar", val: nsigma, set: setNsigma, min: 1, max: 50, step: 1, col: T.pink },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ color: T.muted, fontSize: 12, fontWeight: 700 }}>{s.label}</span>
                    <span style={{ color: T.white, fontWeight: 900, fontSize: 14, fontFamily: "Georgia,serif" }}>{s.val}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                    onChange={e => { s.set(+e.target.value); setHighlightK(null); setQueryResult(null); }}
                    style={{ width: "100%", accentColor: s.col, cursor: "pointer" }} />
                </div>
              ))}
            </>) : (
              /* Modo caso: mostrar parámetros fijos */
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(0,0,0,0.2)", border: `1px solid ${color}25` }}>
                {activeDist === "binom" && <p style={{ color: color, fontFamily: "monospace", fontSize: 13 }}>n = {caso.params.n},  p = {caso.params.p}</p>}
                {activeDist === "poisson" && <p style={{ color: color, fontFamily: "monospace", fontSize: 13 }}>λ = {caso.params.lambda}</p>}
                {activeDist === "hyper" && <p style={{ color: color, fontFamily: "monospace", fontSize: 12 }}>N={caso.params.N}, K={caso.params.K}, n={caso.params.n}</p>}
                {activeDist === "normal" && <p style={{ color: color, fontFamily: "monospace", fontSize: 13 }}>μ = {caso.params.mu},  σ = {caso.params.sigma}</p>}
              </div>
            )}

            {/* Métricas */}
            <div style={{ borderTop: `1px solid ${color}20`, paddingTop: 12, marginTop: 4, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <StatChip label="E(X)" value={stats.EX} color={T.pink} />
              <StatChip label="Var(X)" value={stats.Var} color={T.yellow} />
              <StatChip label="σ(X)" value={stats.sigma} color={T.green} />
            </div>
          </Panel>

          {/* Calculadora de probabilidades */}
          <Panel color={color} style={{ padding: 18 }}>
            <h4 style={{ color: T.white, fontWeight: 900, fontSize: 13, marginBottom: 12 }}>🔢 Calcular P(X)</h4>

            {/* Tipo de query — 4 botones en grid 2x2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 12 }}>
              {QUERY_TYPES.filter(qt => isDiscrete || qt.id !== "eq").map(qt => (
                <button key={qt.id} onClick={() => { setQueryType(qt.id); setQueryResult(null); }} style={{
                  padding: "8px 8px", borderRadius: 9, border: "none", cursor: "pointer",
                  background: queryType === qt.id ? color : `${color}12`,
                  color: queryType === qt.id ? "white" : color,
                  fontWeight: 800, fontSize: 12, outline: queryType !== qt.id ? `1px solid ${color}30` : "none",
                  transition: "all 0.15s"
                }}>{qt.label}</button>
              ))}
            </div>

            {/* Inputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ display: "flex", gap: 7 }}>
                <input type="number" value={queryA} onChange={e => setQueryA(e.target.value)}
                  placeholder={queryType === "range" ? "a (mínimo)" : isDiscrete ? "k entero" : "valor x"}
                  style={{ flex: 1, padding: "9px 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: `1px solid ${color}30`, color: T.white, fontSize: 13, fontWeight: 700, outline: "none" }} />
                <button onClick={computeQuery} style={{
                  padding: "9px 14px", borderRadius: 9, border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg,${color},${color}bb)`, color: "white", fontWeight: 800, fontSize: 13,
                  boxShadow: `0 4px 12px ${color}30`
                }}>P=</button>
              </div>
              {queryType === "range" && (
                <input type="number" value={queryB} onChange={e => setQueryB(e.target.value)}
                  placeholder="b (máximo)"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: `1px solid ${color}30`, color: T.white, fontSize: 13, fontWeight: 700, outline: "none", boxSizing: "border-box" }} />
              )}
            </div>

            {queryResult && (
              <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 11, background: `${color}12`, border: `1.5px solid ${color}40` }}>
                <p style={{ color: T.muted, fontSize: 11, marginBottom: 3 }}>{queryLabel()}</p>
                <p style={{ color, fontWeight: 900, fontSize: 22, fontFamily: "Georgia,serif" }}>{(queryResult.prob * 100).toFixed(4)}%</p>
                <p style={{ color: T.muted, fontSize: 10, marginTop: 2 }}>= {queryResult.prob.toFixed(6)}</p>
              </div>
            )}
          </Panel>

          {/* Regla 68-95-99.7 para Normal */}
          {activeDist === "normal" && (
            <Panel color={T.normal} style={{ padding: 16 }}>
              <h4 style={{ color: T.white, fontWeight: 900, fontSize: 13, marginBottom: 12 }}>📏 Regla 68-95-99.7</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "±1σ", pct: "68.27%", range: `[${(p.nmu - p.nsigma).toFixed(1)}, ${(p.nmu + p.nsigma).toFixed(1)}]`, color: T.normal },
                  { label: "±2σ", pct: "95.45%", range: `[${(p.nmu - 2 * p.nsigma).toFixed(1)}, ${(p.nmu + 2 * p.nsigma).toFixed(1)}]`, color: T.yellow },
                  { label: "±3σ", pct: "99.73%", range: `[${(p.nmu - 3 * p.nsigma).toFixed(1)}, ${(p.nmu + 3 * p.nsigma).toFixed(1)}]`, color: T.pink },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: `${r.color}10`, border: `1px solid ${r.color}25` }}>
                    <span style={{ color: r.color, fontWeight: 900, fontSize: 13, minWidth: 28 }}>{r.label}</span>
                    <span style={{ color: T.white, fontWeight: 900, fontSize: 15 }}>{r.pct}</span>
                    <span style={{ color: T.muted, fontSize: 10, fontFamily: "monospace", marginLeft: "auto" }}>{r.range}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>

        {/* Panel derecho: gráfica + tabla/preguntas */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Panel color={color} style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h3 style={{ color: T.white, fontWeight: 900, fontSize: 15 }}>
                  {showCDF ? "CDF — F(x) = P(X ≤ x)" : "PMF/PDF — f(x) = P(X = x)"}
                </h3>
                {queryResult && (
                  <p style={{ color, fontSize: 12, fontWeight: 700, marginTop: 3 }}>
                    Área sombreada: {queryLabel()} = <strong>{(queryResult.prob * 100).toFixed(3)}%</strong>
                  </p>
                )}
              </div>
              {activeMode === "libre" && (
                <div style={{ display: "flex", gap: 7 }}>
                  {[["PMF", false], ["CDF", true]].map(([label, val]) => (
                    <button key={label} onClick={() => setShowCDF(val)} style={{
                      padding: "7px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                      fontWeight: 800, fontSize: 12,
                      background: showCDF === val ? `linear-gradient(135deg,${color},${color}bb)` : `${color}10`,
                      color: showCDF === val ? "white" : color,
                      outline: showCDF !== val ? `1px solid ${color}30` : "none", transition: "all 0.2s"
                    }}>{label}</button>
                  ))}
                </div>
              )}
            </div>

            <ResponsiveContainer width="100%" height={300}>
              {isDiscrete ? (
                <BarChart data={distData} margin={{ top: 15, right: 20, left: 0, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="k" tick={{ fill: T.muted, fontSize: 11 }}
                    label={{ value: "k", position: "insideBottom", offset: -12, fill: T.muted, fontWeight: 700, fontSize: 13 }} />
                  <YAxis tick={{ fill: T.muted, fontSize: 10 }} tickFormatter={v => (v * 100).toFixed(1) + "%"}
                    label={{ value: showCDF ? "F(k)" : "P(X=k)", angle: -90, position: "insideLeft", fill: T.muted, fontSize: 11, offset: 10 }} />
                  {!showCDF && <ReferenceLine x={Math.round(parseFloat(stats.EX))} stroke={T.pink} strokeDasharray="5 3"
                    label={{ value: `μ`, fill: T.pink, fontSize: 11, position: "top" }} />}
                  <Tooltip content={<CustomTooltip color={color} discrete={true} />} />
                  <Bar dataKey={showCDF ? "cdf" : "prob"} radius={[4, 4, 0, 0]}
                    name={showCDF ? "F(k)" : "P(X=k)"}
                    onClick={d => setHighlightK(highlightK === d.k ? null : d.k)}>
                    {distData.map((entry, i) => {
                      const inShade = shadeRange && entry.k >= shadeRange.min && entry.k <= shadeRange.max;
                      return (
                        <Cell key={i}
                          fill={inShade ? T.yellow : highlightK === entry.k ? T.yellow : color}
                          opacity={shadeRange ? (inShade ? 1 : 0.2) : (highlightK !== null && highlightK !== entry.k ? 0.2 : 0.85)} />
                      );
                    })}
                  </Bar>
                </BarChart>
              ) : (
                <AreaChart data={chartDataWithShade} margin={{ top: 15, right: 20, left: 0, bottom: 35 }}>
                  <defs>
                    <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="shadeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={T.yellow} stopOpacity={0.7} />
                      <stop offset="100%" stopColor={T.yellow} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="x" tick={{ fill: T.muted, fontSize: 10 }} tickFormatter={v => v.toFixed(0)}
                    label={{ value: "x", position: "insideBottom", offset: -12, fill: T.muted, fontWeight: 700, fontSize: 13 }} />
                  <YAxis tick={{ fill: T.muted, fontSize: 10 }}
                    label={{ value: "f(x)", angle: -90, position: "insideLeft", fill: T.muted, fontSize: 11 }} />
                  <ReferenceLine x={p.nmu} stroke={T.pink} strokeDasharray="5 3"
                    label={{ value: `μ=${p.nmu}`, fill: T.pink, fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip color={color} discrete={false} />} />
                  <Area type="monotone" dataKey="pdf" stroke={color} strokeWidth={2.5} fill="url(#normalGrad)" name="f(x)" dot={false} />
                  {shadeRange && <Area type="monotone" dataKey="shade" stroke="none" fill="url(#shadeGrad)" dot={false} name="Área" />}
                </AreaChart>
              )}
            </ResponsiveContainer>

            {/* Info al hacer click (modo libre, discreto) */}
            {highlightK !== null && isDiscrete && activeMode === "libre" && (() => {
              const d = distData.find(x => x.k === highlightK);
              return d ? (
                <div style={{ marginTop: 10, padding: "11px 14px", borderRadius: 11, background: `${T.yellow}12`, border: `1.5px solid ${T.yellow}35`, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div><p style={{ color: T.muted, fontSize: 11 }}>P(X = {highlightK})</p><p style={{ color: T.yellow, fontWeight: 900, fontSize: 18, fontFamily: "Georgia,serif" }}>{(d.prob * 100).toFixed(4)}%</p></div>
                  <div><p style={{ color: T.muted, fontSize: 11 }}>F({highlightK}) = P(X ≤ {highlightK})</p><p style={{ color: T.poisson, fontWeight: 900, fontSize: 18, fontFamily: "Georgia,serif" }}>{(d.cdf * 100).toFixed(4)}%</p></div>
                  <div><p style={{ color: T.muted, fontSize: 11 }}>P(X ≥ {highlightK})</p><p style={{ color: T.normal, fontWeight: 900, fontSize: 18, fontFamily: "Georgia,serif" }}>{((1 - (distData.find(x => x.k === highlightK - 1)?.cdf || 0)) * 100).toFixed(4)}%</p></div>
                </div>
              ) : null;
            })()}
          </Panel>

          {/* PREGUNTAS DEL CASO (modo caso) */}
          {activeMode === "caso" && (
            <Panel color={color} style={{ padding: 24 }}>
              <h4 style={{ color: T.white, fontWeight: 900, fontSize: 15, marginBottom: 18 }}>🧠 Preguntas de Aplicación — {caso.titulo.split("—")[0].trim()}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {caso.preguntas.map((q, qi) => {
                  const ans = casoAnsw[qi];
                  const show = ans !== undefined;
                  return (
                    <div key={qi} style={{
                      padding: "16px 18px", borderRadius: 13,
                      background: show ? (ans === q.correct ? `${T.green}08` : `${T.red}08`) : "rgba(255,255,255,0.02)",
                      border: `1px solid ${show ? (ans === q.correct ? T.green : T.red) + "30" : "rgba(255,255,255,0.07)"}`,
                      transition: "all 0.2s"
                    }}>
                      <p style={{ color: T.white, fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
                        <span style={{ color: color, fontWeight: 900 }}>Q{qi + 1}.</span> {q.text}
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: show ? 12 : 0 }}>
                        {q.opts.map((o, oi) => {
                          const isSel = ans === oi, isOk = oi === q.correct;
                          return (
                            <button key={oi} onClick={() => handleCasoAnswer(qi, oi)} style={{
                              padding: "9px 12px", borderRadius: 9, border: "none",
                              cursor: show ? "default" : "pointer", fontWeight: 700, fontSize: 12, textAlign: "left",
                              background: show ? (isOk ? `${T.green}20` : isSel ? `${T.red}20` : "rgba(255,255,255,0.03)") : "rgba(255,255,255,0.04)",
                              color: show ? (isOk ? T.green : isSel ? T.red : T.muted) : "#94a3b8",
                              outline: show ? (isOk ? `1.5px solid ${T.green}` : isSel ? `1.5px solid ${T.red}` : `1px solid rgba(255,255,255,0.06)`) : `1px solid rgba(255,255,255,0.06)`,
                              display: "flex", alignItems: "center", gap: 7, transition: "all 0.15s"
                            }}
                              onMouseEnter={e => { if (!show) { e.currentTarget.style.background = `${color}15`; e.currentTarget.style.outline = `1.5px solid ${color}40`; } }}
                              onMouseLeave={e => { if (!show) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.outline = `1px solid rgba(255,255,255,0.06)`; } }}>
                              <span style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, background: show && isOk ? T.green : show && isSel ? T.red : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "white" }}>
                                {show && isOk ? "✓" : show && isSel ? "✗" : String.fromCharCode(65 + oi)}
                              </span>
                              {o}
                            </button>
                          );
                        })}
                      </div>
                      {show && (
                        <div style={{ padding: "10px 14px", borderRadius: 10, background: ans === q.correct ? `${T.green}12` : `${T.red}10`, border: `1px solid ${ans === q.correct ? T.green : T.red}25` }}>
                          <p style={{ color: ans === q.correct ? "#a3e3c6" : "#fca5a5", fontSize: 12, lineHeight: 1.6 }}>
                            <strong style={{ color: ans === q.correct ? T.green : T.red }}>{ans === q.correct ? "✅ " : "❌ "}</strong>{q.exp}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {Object.keys(casoAnsw).length === caso.preguntas.length && (
                <div style={{ marginTop: 16, padding: "14px 18px", borderRadius: 12, background: `${color}12`, border: `1.5px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Award style={{ color, width: 20, height: 20 }} />
                    <p style={{ color: T.white, fontWeight: 900, fontSize: 14 }}>
                      {caso.preguntas.filter((q, i) => casoAnsw[i] === q.correct).length}/{caso.preguntas.length} correctas
                    </p>
                  </div>
                  {casoIdx < CASOS.length - 1 && (
                    <button onClick={() => { setCasoIdx(casoIdx + 1); setQueryResult(null); }} style={{
                      padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer",
                      background: `linear-gradient(135deg,${CASOS[casoIdx + 1].color},${CASOS[casoIdx + 1].color}bb)`,
                      color: "white", fontWeight: 800, fontSize: 13
                    }}>Caso {casoIdx + 2} {CASOS[casoIdx + 1].emoji} →</button>
                  )}
                </div>
              )}
            </Panel>
          )}

          {/* Tabla de distribución (modo libre, discreto) */}
          {activeMode === "libre" && isDiscrete && distData.length <= 25 && (
            <Panel color={color} style={{ padding: 20 }}>
              <h4 style={{ color: T.white, fontWeight: 900, fontSize: 14, marginBottom: 12 }}>📋 Tabla de Distribución</h4>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 3px" }}>
                  <thead>
                    <tr>{["k", "P(X=k)", "F(k)=P(X≤k)", "k·P(X=k)"].map((h, i) => (
                      <th key={i} style={{ padding: "6px 10px", color: T.muted, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "center" }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {distData.map(d => (
                      <tr key={d.k} onClick={() => setHighlightK(highlightK === d.k ? null : d.k)} style={{ cursor: "pointer" }}>
                        {[d.k, (d.prob * 100).toFixed(3) + "%", (d.cdf * 100).toFixed(3) + "%", (d.k * d.prob).toFixed(5)].map((val, i) => (
                          <td key={i} style={{
                            padding: "7px 10px", textAlign: "center",
                            background: highlightK === d.k ? `${color}18` : shadeRange && d.k >= shadeRange.min && d.k <= shadeRange.max ? `${T.yellow}10` : "rgba(255,255,255,0.02)",
                            color: i === 0 ? color : i === 1 ? T.white : i === 2 ? T.poisson : T.pink,
                            fontWeight: i === 0 ? 900 : 600, fontSize: 12,
                            borderRadius: i === 0 ? "7px 0 0 7px" : i === 3 ? "0 7px 7px 0" : 0,
                          }}>{val}</td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} style={{ padding: "7px 10px", textAlign: "right", color: T.muted, fontSize: 11, fontWeight: 700, background: `${T.pink}08`, borderRadius: "7px 0 0 7px" }}>E(X) =</td>
                      <td style={{ padding: "7px 10px", textAlign: "center", color: T.pink, fontWeight: 900, fontSize: 14, background: `${T.pink}08`, borderRadius: "0 7px 7px 0" }}>{stats.EX}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
};

const TabCasos = ({ onComplete }) => {
  const [casoIdx, setCasoIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState({});

  const caso = CASOS[casoIdx];
  const casAnswers = answers[casoIdx] || {};
  const allAnswered = Object.keys(casAnswers).length === caso.preguntas.length;
  const correctCount = caso.preguntas.filter((q, i) => casAnswers[i] === q.correct).length;

  const handleAnswer = (qi, oi) => {
    if (casAnswers[qi] !== undefined) return;
    const newA = { ...answers, [casoIdx]: { ...casAnswers, [qi]: oi } };
    setAnswers(newA);
    if (Object.keys({ ...casAnswers, [qi]: oi }).length === caso.preguntas.length) {
      const newCompleted = { ...completed, [casoIdx]: true };
      setCompleted(newCompleted);
      if (onComplete) onComplete(Object.keys(newCompleted).length);
    }
  };

  // Mini gráfico para cada caso
  const miniData = useMemo(() => {
    if (caso.dist === "binom") return buildBinom(caso.params.n, caso.params.p);
    if (caso.dist === "poisson") return buildPoisson(caso.params.lambda);
    if (caso.dist === "hyper") return buildHyper(caso.params.N, caso.params.K, caso.params.n);
    return buildNormal(caso.params.mu, caso.params.sigma);
  }, [casoIdx]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Selector de casos */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {CASOS.map((c, i) => (
          <button key={c.id} onClick={() => setCasoIdx(i)} style={{
            flex: 1, minWidth: 150, padding: "11px 16px", borderRadius: 14, border: "none", cursor: "pointer",
            fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            background: casoIdx === i ? `linear-gradient(135deg,${c.color},${c.color}bb)` : `${c.color}10`,
            color: casoIdx === i ? "white" : c.color,
            boxShadow: casoIdx === i ? `0 4px 14px ${c.color}40` : "none",
            outline: casoIdx !== i ? `1px solid ${c.color}30` : "none",
            transition: "all 0.2s", position: "relative"
          }}>
            <span style={{ fontSize: 16 }}>{c.emoji}</span>
            <span>{c.titulo.split("—")[0].trim()}</span>
            {completed[i] && (
              <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: T.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "white", fontWeight: 900, border: `2px solid ${T.bg}` }}>✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Caso activo */}
      <div style={{ background: T.panel, border: `1.5px solid ${caso.color}30`, borderRadius: 22, padding: 28 }}>

        {/* Header */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 22 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `${caso.color}18`, border: `1px solid ${caso.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{caso.emoji}</div>
          <div>
            <Chip color={caso.color}>{caso.dist.toUpperCase()}</Chip>
            <h3 style={{ color: T.white, fontWeight: 900, fontSize: 19, margin: "8px 0 4px" }}>{caso.titulo}</h3>
            <p style={{ color: T.muted, fontSize: 13 }}>{caso.modelo}</p>
          </div>
        </div>

        {/* Contexto + mini gráfico */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18, marginBottom: 22 }}>
          <div>
            <div style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 14 }}>
              <p style={{ color: "#e2e8f0", fontSize: 14, lineHeight: 1.8 }}>{caso.contexto}</p>
            </div>
            <FormulaBox formula={caso.modelo} color={caso.color} />
          </div>
          <div style={{ padding: "14px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ color: T.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Distribución</p>
            <ResponsiveContainer width="100%" height={140}>
              {caso.dist !== "normal" ? (
                <BarChart data={miniData.slice(0, 15)} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <Bar dataKey="prob" fill={caso.color} radius={[3, 3, 0, 0]} opacity={0.85} />
                  <XAxis dataKey="k" tick={{ fill: T.muted, fontSize: 9 }} />
                </BarChart>
              ) : (
                <AreaChart data={miniData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <defs>
                    <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={caso.color} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={caso.color} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="pdf" stroke={caso.color} strokeWidth={2} fill="url(#mg)" dot={false} />
                  <XAxis dataKey="x" tick={{ fill: T.muted, fontSize: 9 }} tickFormatter={v => v.toFixed(0)} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Preguntas */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 20 }}>
          <h4 style={{ color: T.white, fontWeight: 900, fontSize: 15, marginBottom: 16 }}>🧠 Preguntas de Aplicación</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {caso.preguntas.map((q, qi) => {
              const ans = casAnswers[qi];
              const show = ans !== undefined;
              return (
                <div key={qi} style={{
                  padding: "18px 20px", borderRadius: 14,
                  background: show ? (ans === q.correct ? `${T.green}08` : `${T.red}08`) : "rgba(255,255,255,0.02)",
                  border: `1px solid ${show ? (ans === q.correct ? `${T.green}25` : `${T.red}25`) : "rgba(255,255,255,0.07)"}`,
                  transition: "all 0.2s"
                }}>
                  <p style={{ color: T.white, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
                    <span style={{ color: caso.color, fontWeight: 900 }}>Q{qi + 1}.</span> {q.text}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: show ? 14 : 0 }}>
                    {q.opts.map((o, oi) => {
                      const isSel = ans === oi, isOk = oi === q.correct;
                      return (
                        <button key={oi} onClick={() => handleAnswer(qi, oi)} style={{
                          padding: "10px 14px", borderRadius: 10, border: "none",
                          cursor: show ? "default" : "pointer",
                          fontWeight: 700, fontSize: 13, textAlign: "left",
                          background: show ? (isOk ? `${T.green}20` : isSel ? `${T.red}20` : "rgba(255,255,255,0.03)") : "rgba(255,255,255,0.04)",
                          color: show ? (isOk ? T.green : isSel ? T.red : T.muted) : "#94a3b8",
                          outline: show ? (isOk ? `1.5px solid ${T.green}` : isSel ? `1.5px solid ${T.red}` : `1px solid rgba(255,255,255,0.06)`) : `1px solid rgba(255,255,255,0.06)`,
                          display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s"
                        }}
                          onMouseEnter={e => { if (!show) { e.currentTarget.style.background = `${caso.color}15`; e.currentTarget.style.outline = `1.5px solid ${caso.color}40`; } }}
                          onMouseLeave={e => { if (!show) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.outline = `1px solid rgba(255,255,255,0.06)`; } }}>
                          <span style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: show && isOk ? T.green : show && isSel ? T.red : "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "white" }}>
                            {show && isOk ? "✓" : show && isSel ? "✗" : String.fromCharCode(65 + oi)}
                          </span>
                          {o}
                        </button>
                      );
                    })}
                  </div>
                  {show && (
                    <div style={{ padding: "12px 16px", borderRadius: 11, background: ans === q.correct ? `${T.green}12` : `${T.red}10`, border: `1px solid ${ans === q.correct ? T.green : T.red}25` }}>
                      <p style={{ color: ans === q.correct ? "#a3e3c6" : "#fca5a5", fontSize: 13, lineHeight: 1.6 }}>
                        <strong style={{ color: ans === q.correct ? T.green : T.red }}>{ans === q.correct ? "✅ Correcto. " : "❌ Incorrecto. "}</strong>
                        {q.exp}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {allAnswered && (
            <div style={{ marginTop: 20, padding: "16px 20px", borderRadius: 14, background: `linear-gradient(135deg,${caso.color}15,${T.pink}08)`, border: `1.5px solid ${caso.color}40`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Award style={{ color: caso.color, width: 22, height: 22 }} />
                <div>
                  <p style={{ color: T.white, fontWeight: 900, fontSize: 15 }}>Caso {casoIdx + 1}: {correctCount}/{caso.preguntas.length} correctas</p>
                  <p style={{ color: T.muted, fontSize: 12 }}>{correctCount === caso.preguntas.length ? "¡Perfecto dominio! 🎉" : "Revisa las explicaciones marcadas."}</p>
                </div>
              </div>
              {casoIdx < CASOS.length - 1 && (
                <button onClick={() => setCasoIdx(casoIdx + 1)} style={{ padding: "10px 22px", borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${CASOS[casoIdx + 1].color},${CASOS[casoIdx + 1].color}bb)`, color: "white", fontWeight: 800, fontSize: 13 }}>
                  Caso {casoIdx + 2} {CASOS[casoIdx + 1].emoji} →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════
// QUIZ TEÓRICO COMPLETO
// ══════════════════════════════════════════
const QUIZ_QUESTIONS = [
  { dist: "binom", q: "¿Cuál es E(X) de una distribución Binomial B(n=15, p=0.4)?", opts: ["4.0", "5.5", "6.0", "7.5"], correct: 2, exp: "E(X) = n·p = 15 × 0.4 = 6.0." },
  { dist: "poisson", q: "¿Cuál es la varianza de una distribución Poisson con λ=9?", opts: ["3", "6", "9", "81"], correct: 2, exp: "En Poisson, Var(X) = λ = 9. Esta es una propiedad única: media = varianza." },
  { dist: "hyper", q: "En una Hipergeométrica con N=100, K=20, n=10, ¿cuánto vale E(X)?", opts: ["0.2", "1.0", "2.0", "4.0"], correct: 2, exp: "E(X) = n·K/N = 10×20/100 = 200/100 = 2.0." },
  { dist: "normal", q: "En una N(μ=50, σ=10), ¿qué porcentaje de datos está entre 40 y 60?", opts: ["50%", "68%", "95%", "99.7%"], correct: 1, exp: "El intervalo [40,60] = [μ-σ, μ+σ], que contiene el 68.27% de los datos (regla 68-95-99.7)." },
  { dist: "binom", q: "¿Cuál NO es requisito de la distribución Binomial?", opts: ["n fija", "Muestreo sin reemplazo", "p constante", "Ensayos independientes"], correct: 1, exp: "El muestreo SIN reemplazo es requisito de la Hipergeométrica, no de la Binomial." },
  { dist: "poisson", q: "¿Qué parámetro caracteriza completamente a la distribución Poisson?", opts: ["n y p", "λ (lambda)", "μ y σ", "N, K y n"], correct: 1, exp: "La Poisson solo tiene un parámetro: λ (lambda), que es la tasa promedio de eventos." },
  { dist: "hyper", q: "¿En qué se diferencia la Hipergeométrica de la Binomial?", opts: ["Tiene más parámetros", "El muestreo es sin reemplazo", "Solo aplica a variables continuas", "No tiene valor esperado"], correct: 1, exp: "La diferencia clave es el muestreo SIN reemplazo, lo que hace que p cambie en cada extracción." },
  { dist: "normal", q: "¿Cuál es la relación entre la Binomial B(n,p) y la Normal cuando n es grande?", opts: ["No hay relación", "Son idénticas", "La Binomial se aproxima a N(np, npq)", "La Normal se vuelve discreta"], correct: 2, exp: "Por el Teorema Central del Límite, B(n,p) → N(μ=np, σ²=npq) cuando n→∞." },
  { dist: "binom", q: "¿Cuánto vale Var(X) para X ~ B(n=20, p=0.5)?", opts: ["5", "10", "20", "4"], correct: 0, exp: "Var(X) = n·p·(1-p) = 20×0.5×0.5 = 5." },
  { dist: "poisson", q: "En Poisson, si λ=4, ¿cuál es σ (desviación estándar)?", opts: ["4", "2", "16", "1"], correct: 1, exp: "σ = √Var(X) = √λ = √4 = 2. La desviación estándar es la raíz cuadrada de λ." },
];

const TabQuiz = ({ onComplete }) => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const q = QUIZ_QUESTIONS[current];
  const distColor = q.dist === "binom" ? T.binom : q.dist === "poisson" ? T.poisson : q.dist === "hyper" ? T.hyper : T.normal;
  const answered = answers[current] !== undefined;

  const handleAnswer = (i) => {
    if (answered) return;
    setAnswers(a => ({ ...a, [current]: i }));
  };

  const handleSubmit = () => {
    let s = 0;
    QUIZ_QUESTIONS.forEach((q, i) => { if (answers[i] === q.correct) s++; });
    setScore(s);
    setSubmitted(true);
    setShowScore(true);
  };

  const handleReset = () => {
    setAnswers({}); setSubmitted(false); setScore(0); setShowScore(false); setCurrent(0);
  };

  const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
  const allAnswered = Object.keys(answers).length === QUIZ_QUESTIONS.length;

  if (showScore) {
    const rc = pct >= 90 ? T.green : pct >= 70 ? T.yellow : pct >= 50 ? T.poisson : T.red;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ background: `linear-gradient(135deg,${rc}18,${rc}05)`, border: `2px solid ${rc}40`, borderRadius: 24, padding: 36, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{pct >= 90 ? "🏆" : pct >= 70 ? "⭐" : pct >= 50 ? "👍" : "💪"}</div>
          <h2 style={{ color: T.white, fontWeight: 900, fontSize: 24, marginBottom: 8 }}>¡Quiz Completado!</h2>
          <p style={{ fontFamily: "Georgia,serif", fontSize: 32, fontWeight: 900, color: rc }}>{pct}% — {score}/{QUIZ_QUESTIONS.length}</p>
          <p style={{ color: T.muted, fontSize: 14, marginTop: 10 }}>
            {pct >= 90 ? "¡Dominio excepcional de las 4 distribuciones!" : pct >= 70 ? "Buen conocimiento. Repasa los conceptos marcados." : "Sigue practicando con la calculadora y los casos."}
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
            <button onClick={handleReset} style={{ padding: "12px 22px", borderRadius: 12, border: `1px solid ${T.accent}40`, background: `${T.accent}12`, color: "#a78bfa", fontWeight: 800, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <RotateCcw style={{ width: 14, height: 14 }} />Intentar de Nuevo
            </button>
            <button onClick={() => onComplete && onComplete(score, QUIZ_QUESTIONS.length)} style={{ padding: "12px 22px", borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${T.green},#059669)`, color: "white", fontWeight: 800, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 8, boxShadow: `0 4px 14px ${T.green}40` }}>
              Ver Cierre del Lab 🎓<ChevronRight style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>
        <Panel color={T.accent}>
          <h3 style={{ color: T.white, fontWeight: 900, fontSize: 16, marginBottom: 16 }}>Revisión de Respuestas</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {QUIZ_QUESTIONS.map((q, i) => {
              const correct = answers[i] === q.correct;
              const qColor = q.dist === "binom" ? T.binom : q.dist === "poisson" ? T.poisson : q.dist === "hyper" ? T.hyper : T.normal;
              return (
                <div key={i} style={{ padding: "12px 16px", borderRadius: 12, background: correct ? `${T.green}08` : `${T.red}08`, border: `1px solid ${correct ? T.green : T.red}25`, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: correct ? T.green : T.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "white", fontWeight: 900, flexShrink: 0 }}>{correct ? "✓" : "✗"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <Chip color={qColor}>{q.dist}</Chip>
                      <p style={{ color: "#e2e8f0", fontSize: 13 }}>{q.q}</p>
                    </div>
                    {!correct && <p style={{ color: "#fca5a5", fontSize: 12, lineHeight: 1.6 }}>→ {q.exp}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Progreso */}
      <div style={{ background: T.panel, border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 16, padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <p style={{ color: T.muted, fontSize: 12, fontWeight: 700 }}>Pregunta {current + 1} de {QUIZ_QUESTIONS.length}</p>
          <p style={{ color: T.accent, fontWeight: 800, fontSize: 12 }}>{Object.keys(answers).length} respondidas</p>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {QUIZ_QUESTIONS.map((q, i) => {
            const qColor = q.dist === "binom" ? T.binom : q.dist === "poisson" ? T.poisson : q.dist === "hyper" ? T.hyper : T.normal;
            const ans = answers[i];
            return (
              <button key={i} onClick={() => setCurrent(i)} style={{
                flex: 1, height: 8, borderRadius: 4, border: "none", cursor: "pointer",
                background: i === current ? qColor : ans !== undefined ? (ans === q.correct ? T.green : T.red) : "rgba(255,255,255,0.08)",
                transition: "all 0.2s"
              }} />
            );
          })}
        </div>
      </div>

      {/* Pregunta */}
      <div style={{ background: T.panel, border: `1.5px solid ${distColor}30`, borderRadius: 20, padding: 28 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18 }}>
          <Chip color={distColor}>{q.dist.toUpperCase()}</Chip>
          <p style={{ color: T.muted, fontSize: 12 }}>Pregunta {current + 1}</p>
        </div>
        <p style={{ color: T.white, fontWeight: 700, fontSize: 16, marginBottom: 20, lineHeight: 1.6 }}>{q.q}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: answered ? 16 : 0 }}>
          {q.opts.map((o, i) => {
            const isSel = answers[current] === i, isOk = i === q.correct, show = answered;
            return (
              <button key={i} onClick={() => handleAnswer(i)} style={{
                padding: "13px 16px", borderRadius: 12, border: "none",
                cursor: show ? "default" : "pointer",
                fontWeight: 700, fontSize: 13, textAlign: "left",
                background: show ? (isOk ? `${T.green}20` : isSel ? `${T.red}20` : "rgba(255,255,255,0.03)") : "rgba(255,255,255,0.04)",
                color: show ? (isOk ? T.green : isSel ? T.red : T.muted) : "#94a3b8",
                outline: show ? (isOk ? `1.5px solid ${T.green}` : isSel ? `1.5px solid ${T.red}` : `1px solid rgba(255,255,255,0.06)`) : `1px solid rgba(255,255,255,0.06)`,
                display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s"
              }}
                onMouseEnter={e => { if (!show) { e.currentTarget.style.background = `${distColor}15`; e.currentTarget.style.outline = `1.5px solid ${distColor}40`; } }}
                onMouseLeave={e => { if (!show) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.outline = `1px solid rgba(255,255,255,0.06)`; } }}>
                <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, background: show && isOk ? T.green : show && isSel ? T.red : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "white" }}>
                  {show && isOk ? "✓" : show && isSel ? "✗" : String.fromCharCode(65 + i)}
                </span>
                {o}
              </button>
            );
          })}
        </div>
        {answered && (
          <div style={{ padding: "13px 16px", borderRadius: 12, background: answers[current] === q.correct ? `${T.green}12` : `${T.red}10`, border: `1px solid ${answers[current] === q.correct ? T.green : T.red}25` }}>
            <p style={{ color: answers[current] === q.correct ? "#a3e3c6" : "#fca5a5", fontSize: 13, lineHeight: 1.6 }}>
              <strong style={{ color: answers[current] === q.correct ? T.green : T.red }}>{answers[current] === q.correct ? "✅ Correcto. " : "❌ Incorrecto. "}</strong>
              {q.exp}
            </p>
          </div>
        )}
      </div>

      {/* Navegación */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} style={{
          padding: "10px 22px", borderRadius: 12, border: `1px solid ${current === 0 ? "rgba(255,255,255,0.05)" : T.accent + "40"}`,
          background: current === 0 ? "transparent" : `${T.accent}12`,
          color: current === 0 ? "#2a2a3a" : T.accent, fontWeight: 800, fontSize: 13, cursor: current === 0 ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", gap: 7
        }}>
          <ChevronLeft style={{ width: 16, height: 16 }} />Anterior
        </button>

        <div style={{ display: "flex", gap: 4 }}>
          {QUIZ_QUESTIONS.map((_, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i === current ? T.accent : i < current ? T.green : "rgba(255,255,255,0.1)", transition: "all 0.2s" }} />)}
        </div>

        {current < QUIZ_QUESTIONS.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} style={{
            padding: "10px 22px", borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg,${distColor},${distColor}bb)`,
            color: "white", fontWeight: 800, fontSize: 13,
            boxShadow: `0 4px 12px ${distColor}35`, display: "flex", alignItems: "center", gap: 7
          }}>
            Siguiente<ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        ) : allAnswered ? (
          <button onClick={handleSubmit} style={{
            padding: "10px 22px", borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg,${T.green},#059669)`,
            color: "white", fontWeight: 800, fontSize: 13,
            boxShadow: `0 4px 12px ${T.green}40`, display: "flex", alignItems: "center", gap: 7
          }}>
            Ver Resultados 🏆<ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        ) : (
          <div style={{ padding: "10px 22px", borderRadius: 12, border: `1px solid rgba(255,255,255,0.07)`, color: T.muted, fontSize: 13 }}>
            Responde todas las preguntas
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════
// RESUMEN FINAL — CIERRE COGNITIVO LAB 5.2
// ══════════════════════════════════════════
const ResumenFinal52 = ({ quizScore, quizTotal, casosScore, onReset }) => {
  const [showConceptos, setShowConceptos] = useState(true);

  const total = quizTotal + 4; // 4 casos completados máx
  const score = quizScore + casosScore;
  const pct = total > 0 ? Math.round((score / total) * 100) : Math.round((quizScore / quizTotal) * 100);
  const rc = pct >= 90 ? T.green : pct >= 70 ? T.yellow : pct >= 50 ? T.poisson : T.red;
  const em = pct >= 90 ? "🏆" : pct >= 70 ? "⭐" : pct >= 50 ? "👍" : "💪";

  const CONCEPTOS = [
    {
      emoji: "🎯", titulo: "Distribución Binomial",
      formula: "P(X=k) = C(n,k)·pᵏ·(1-p)ⁿ⁻ᵏ",
      momentos: "E(X)=n·p  |  Var=n·p·q",
      cuando: "n fija, ensayos independientes, p constante",
      color: T.binom, tag: "DISCRETA"
    },
    {
      emoji: "⚡", titulo: "Distribución Poisson",
      formula: "P(X=k) = e⁻λ · λᵏ / k!",
      momentos: "E(X)=λ  |  Var=λ",
      cuando: "Eventos raros en intervalo, λ conocida",
      color: T.poisson, tag: "DISCRETA"
    },
    {
      emoji: "🎲", titulo: "Hipergeométrica",
      formula: "P(X=k) = C(K,k)·C(N-K,n-k) / C(N,n)",
      momentos: "E(X)=n·K/N  |  Var=n·K/N·(1-K/N)·factor",
      cuando: "Muestreo SIN reemplazo, población finita N",
      color: T.hyper, tag: "DISCRETA"
    },
    {
      emoji: "🔔", titulo: "Distribución Normal",
      formula: "f(x) = (1/σ√2π)·e^(-½·((x-μ)/σ)²)",
      momentos: "E(X)=μ  |  Var=σ²",
      cuando: "Variable continua, distribución en campana",
      color: T.normal, tag: "CONTINUA"
    },
  ];

  const CRITERIOS = [
    { pregunta: "¿Variable discreta o continua?", discreta: "→ Binomial / Poisson / Hipergeométrica", continua: "→ Normal" },
    { pregunta: "¿Muestreo con o sin reemplazo?", discreta: "Con reemplazo → Binomial", continua: "Sin reemplazo → Hipergeométrica" },
    { pregunta: "¿n fija o λ conocida?", discreta: "n fija → Binomial", continua: "λ conocida → Poisson" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* HERO PUNTUACIÓN */}
      <div style={{
        background: `linear-gradient(135deg,${rc}18,${rc}05)`,
        border: `2px solid ${rc}40`, borderRadius: 24, padding: 36, textAlign: "center",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle,${rc}06 1px,transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{em}</div>
          <h2 style={{ color: T.white, fontWeight: 900, fontSize: 24, marginBottom: 6 }}>¡Laboratorio 5.2 Completado!</h2>
          <p style={{ fontFamily: "Georgia,'Times New Roman',serif", fontSize: 28, fontWeight: 900, color: rc, marginBottom: 10 }}>
            {pct}%
          </p>
          <p style={{ color: T.muted, fontSize: 14, maxWidth: 460, margin: "0 auto 22px", lineHeight: 1.7 }}>
            {pct >= 90 ? "Dominio excepcional de las 4 distribuciones. Estás listo/a para aplicarlas en contextos reales." :
              pct >= 70 ? "Buen desempeño. Repasa las distribuciones donde fallaste antes de continuar." :
                pct >= 50 ? "Progreso aceptable. Vuelve a la calculadora y practica los casos." :
                  "Sigue practicando. Revisa la introducción y el árbol de decisión."}
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { label: "Quiz", val: `${quizScore}/${quizTotal}`, icon: "🧠", color: T.accent },
              { label: "Casos", val: `${casosScore}/4`, icon: "🏭", color: T.binom },
              { label: "Precisión", val: `${pct}%`, icon: "🎯", color: rc },
            ].map((m, i) => (
              <div key={i} style={{ padding: "8px 16px", borderRadius: 20, background: `${m.color}15`, border: `1px solid ${m.color}35`, display: "flex", alignItems: "center", gap: 7 }}>
                <span>{m.icon}</span>
                <span style={{ color: T.muted, fontSize: 12 }}>{m.label}:</span>
                <span style={{ color: T.white, fontWeight: 900, fontSize: 13 }}>{m.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONCEPTOS DOMINADOS */}
      <div style={{ background: T.panel, border: `1.5px solid ${T.binom}25`, borderRadius: 20, overflow: "hidden" }}>
        <button onClick={() => setShowConceptos(s => !s)} style={{
          width: "100%", padding: "18px 24px", background: "transparent", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${T.binom},#4f46e5)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <CheckCircle style={{ color: "white", width: 18, height: 18 }} />
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ color: T.white, fontWeight: 900, fontSize: 16 }}>✅ Distribuciones Dominadas</p>
              <p style={{ color: T.muted, fontSize: 12 }}>Las 4 herramientas del estadístico profesional</p>
            </div>
          </div>
          <ChevronRight style={{ color: T.binom, width: 18, height: 18, transform: showConceptos ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
        </button>

        {showConceptos && (
          <div style={{ padding: "0 24px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {CONCEPTOS.map((c, i) => (
              <div key={i} style={{ padding: "16px 18px", borderRadius: 14, background: `${c.color}08`, border: `1.5px solid ${c.color}30` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>{c.emoji}</span>
                  <div>
                    <p style={{ color: T.white, fontWeight: 900, fontSize: 14 }}>{c.titulo}</p>
                    <span style={{ padding: "2px 8px", borderRadius: 20, background: `${c.color}20`, color: c.color, fontSize: 10, fontWeight: 800 }}>{c.tag}</span>
                  </div>
                </div>
                <div style={{ padding: "8px 12px", borderRadius: 10, background: `${c.color}10`, border: `1px solid ${c.color}20`, marginBottom: 8 }}>
                  <p style={{ fontFamily: "Georgia,serif", fontSize: 11, color: c.color, fontWeight: 700, textAlign: "center" }}>{c.formula}</p>
                </div>
                <p style={{ color: T.yellow, fontSize: 11, fontFamily: "monospace", fontWeight: 700, marginBottom: 6 }}>{c.momentos}</p>
                <p style={{ color: T.muted, fontSize: 11, lineHeight: 1.6 }}><span style={{ color: "#94a3b8" }}>Usar cuando:</span> {c.cuando}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ÁRBOL DE DECISIÓN RESUMEN */}
      <div style={{ background: T.panel, border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 18, padding: 24 }}>
        <h3 style={{ color: T.white, fontWeight: 900, fontSize: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <GitBranch style={{ color: T.accent, width: 18, height: 18 }} />
          Árbol de Decisión — Referencia Rápida
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CRITERIOS.map((c, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, alignItems: "center" }}>
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 700 }}>❓ {c.pregunta}</p>
              </div>
              <div style={{ padding: "10px 14px", borderRadius: 10, background: `${T.binom}08`, border: `1px solid ${T.binom}20` }}>
                <p style={{ color: T.binom, fontSize: 12, fontWeight: 700 }}>{c.discreta}</p>
              </div>
              <div style={{ padding: "10px 14px", borderRadius: 10, background: `${T.normal}08`, border: `1px solid ${T.normal}20` }}>
                <p style={{ color: T.normal, fontSize: 12, fontWeight: 700 }}>{c.continua}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PUENTE AL PRÓXIMO LAB */}
      <div style={{
        background: `linear-gradient(135deg,${T.binom}12,${T.poisson}08)`,
        border: `1.5px solid ${T.binom}30`, borderRadius: 20, padding: 26,
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 130, height: 130, borderRadius: "50%", background: `${T.binom}06`, pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${T.binom},${T.poisson})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ChevronRight style={{ color: "white", width: 18, height: 18 }} />
            </div>
            <div>
              <p style={{ color: T.binom, fontWeight: 900, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>Próximo Paso</p>
              <p style={{ color: T.white, fontWeight: 900, fontSize: 16 }}>Lo que viene después de este laboratorio</p>
            </div>
          </div>
          <div style={{ padding: "14px 18px", borderRadius: 14, background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 16 }}>
            <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.9, fontStyle: "italic" }}>
              "Ahora que dominas cómo modelar variables aleatorias con distribuciones teóricas,
              el siguiente paso es <strong style={{ color: T.white, fontStyle: "normal" }}>contrastar modelos con datos reales</strong> —
              ¿se ajustan los datos observados a la distribución esperada?
              Para eso usaremos <strong style={{ color: T.binom, fontStyle: "normal" }}>pruebas de bondad de ajuste</strong> y
              técnicas de <strong style={{ color: T.poisson, fontStyle: "normal" }}>inferencia estadística</strong>."
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[
              { name: "Prueba Chi-Cuadrado", note: "¿Se ajustan los datos al modelo?", color: T.binom, icon: "χ²", ready: true },
              { name: "Intervalos de Confianza", note: "Estimar parámetros con incertidumbre.", color: T.poisson, icon: "±", ready: false },
              { name: "Pruebas de Hipótesis", note: "Tomar decisiones con datos.", color: T.normal, icon: "H₀", ready: false },
            ].map((d, i) => (
              <div key={i} style={{ padding: "12px 14px", borderRadius: 12, background: `${d.color}08`, border: `1px solid ${d.color}${d.ready ? "45" : "20"}`, boxShadow: d.ready ? `0 0 14px ${d.color}15` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: `${d.color}20`, display: "flex", alignItems: "center", justifyContent: "center", color: d.color, fontWeight: 900, fontSize: 13, fontFamily: "Georgia,serif" }}>{d.icon}</span>
                  <p style={{ color: T.white, fontWeight: 900, fontSize: 12 }}>{d.name}</p>
                </div>
                <p style={{ color: T.muted, fontSize: 11 }}>{d.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button onClick={onReset} style={{
          padding: "11px 28px", borderRadius: 13, border: `1px solid ${T.binom}35`,
          background: `${T.binom}12`, color: "#a5b4fc", fontWeight: 800, fontSize: 14,
          cursor: "pointer", display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s"
        }}>
          <RotateCcw style={{ width: 14, height: 14 }} />Reiniciar laboratorio
        </button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════
// TAB VALIDACIÓN — ANÁLISIS EMPÍRICO VS TEÓRICO
// ══════════════════════════════════════════

// ── Estadísticos descriptivos ──
const calcStats = (data) => {
  const n = data.length;
  if (n === 0) return null;
  const mean = data.reduce((a, b) => a + b, 0) / n;
  const sorted = [...data].sort((a, b) => a - b);
  const variance = data.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  const skewness = std > 0 ? data.reduce((a, b) => a + ((b - mean) / std) ** 3, 0) / n : 0;
  const kurtosis = std > 0 ? data.reduce((a, b) => a + ((b - mean) / std) ** 4, 0) / n - 3 : 0;
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
  const min = sorted[0], max = sorted[n - 1];
  return { n, mean, median, variance, std, skewness, kurtosis, min, max };
};

// ── MLE automático por distribución ──
const estimateParams = (data, distId) => {
  const s = calcStats(data);
  if (!s) return null;
  if (distId === "binom") {
    const n = Math.round(s.max);
    const p = Math.min(0.99, Math.max(0.01, s.mean / Math.max(n, 1)));
    return { n, p };
  }
  if (distId === "poisson") {
    return { lambda: Math.max(0.1, s.mean) };
  }
  if (distId === "hyper") {
    const N = 100, K = Math.round(N * (s.mean / (s.n > 0 ? Math.round(s.mean + 2 * s.std) : 10)));
    const n = Math.round(s.mean + 2 * s.std);
    return { N: Math.max(N, n + K), K: Math.max(1, K), n: Math.max(1, Math.min(n, 30)) };
  }
  if (distId === "normal") {
    return { mu: s.mean, sigma: Math.max(0.01, s.std) };
  }
  return null;
};

// ── Error cuadrático medio entre freq obs vs teórica ──
const calcMSE = (empFreqs, theoryFreqs) => {
  const n = Math.min(empFreqs.length, theoryFreqs.length);
  if (n === 0) return 0;
  const mse = empFreqs.slice(0, n).reduce((acc, ef, i) => acc + (ef - (theoryFreqs[i] || 0)) ** 2, 0) / n;
  return mse;
};

// ── Diagnóstico en lenguaje natural ──
const generateDiagnostico = (distId, stats, params, mse, empFreqs, theoryFreqs) => {
  if (!stats || !params) return "";
  const distName = { binom: "Binomial", poisson: "Poisson", hyper: "Hipergeométrica", normal: "Normal" }[distId];
  const mseNorm = Math.min(mse * 1000, 100);
  const ajuste = mseNorm < 1 ? "excelente" : mseNorm < 5 ? "adecuado" : mseNorm < 15 ? "moderado" : "deficiente";
  const paramsStr = distId === "binom" ? `B(n=${params.n}, p=${params.p.toFixed(3)})`
    : distId === "poisson" ? `Poisson(λ=${params.lambda.toFixed(2)})`
      : distId === "hyper" ? `H(N=${params.N}, K=${params.K}, n=${params.n})`
        : `N(μ=${params.mu.toFixed(2)}, σ=${params.sigma.toFixed(2)})`;

  let texto = `El modelo ${distName} ${paramsStr} presenta un ajuste ${ajuste} a los datos observados (ECM=${mse.toFixed(5)}). `;

  // Sesgo
  if (Math.abs(stats.skewness) < 0.3) texto += `La distribución observada es aproximadamente simétrica (asimetría=${stats.skewness.toFixed(2)}), consistente con el modelo teórico. `;
  else if (stats.skewness > 0.3) texto += `Se observa asimetría positiva (cola derecha, asimetría=${stats.skewness.toFixed(2)}), ${distId === "normal" ? "lo que sugiere que la Normal podría no ser el modelo más adecuado — considera Poisson o Binomial con p pequeño" : "lo cual es consistente con distribuciones discretas con p < 0.5"}. `;
  else texto += `Se observa asimetría negativa (cola izquierda, asimetría=${stats.skewness.toFixed(2)}), ${distId === "normal" ? "lo que podría indicar censura o datos transformados" : "posiblemente por p > 0.5 o efecto techo"}. `;

  // Dispersión
  if (distId === "poisson") {
    const ratio = stats.variance / stats.mean;
    if (ratio > 1.3) texto += `⚠️ La varianza (${stats.variance.toFixed(2)}) supera notablemente a la media (${stats.mean.toFixed(2)}), indicando sobredispersión — el modelo Poisson asume igualdad; considera una distribución Binomial Negativa si esto persiste. `;
    else if (ratio < 0.7) texto += `⚠️ La varianza (${stats.variance.toFixed(2)}) es menor que la media (${stats.mean.toFixed(2)}), indicando subdispersión — el modelo Poisson podría sobreestimar la variabilidad real. `;
    else texto += `✅ La relación media/varianza (${ratio.toFixed(2)}) es cercana a 1, validando el supuesto fundamental de Poisson. `;
  }
  if (distId === "normal") {
    if (Math.abs(stats.kurtosis) < 0.5) texto += `La curtosis excess (${stats.kurtosis.toFixed(2)}) indica colas similares a la Normal estándar. `;
    else if (stats.kurtosis > 0.5) texto += `⚠️ Curtosis positiva (${stats.kurtosis.toFixed(2)}) indica colas más pesadas de lo esperado en Normal — los eventos extremos son más frecuentes. `;
    else texto += `La curtosis negativa (${stats.kurtosis.toFixed(2)}) sugiere colas más ligeras, distribución más concentrada en el centro. `;
  }

  // Ajuste en colas vs centro
  const n = Math.min(empFreqs.length, theoryFreqs.length);
  if (n > 4) {
    const centerErr = Math.abs((empFreqs[Math.floor(n / 2)] || 0) - (theoryFreqs[Math.floor(n / 2)] || 0));
    const tailErr = Math.max(Math.abs((empFreqs[0] || 0) - (theoryFreqs[0] || 0)), Math.abs((empFreqs[n - 1] || 0) - (theoryFreqs[n - 1] || 0)));
    if (tailErr > centerErr * 2) texto += `El modelo captura bien el centro de la distribución pero subestima los valores extremos — zona de mayor discrepancia empírica. `;
    else if (centerErr > tailErr * 2) texto += `El ajuste en las colas es bueno, pero hay discrepancia en la moda central. `;
    else texto += `El ajuste es homogéneo entre el centro y las colas de la distribución. `;
  }

  return texto.trim();
};

// ── Datasets de ejemplo ──
const DATASETS_EJEMPLO = [
  {
    id: "defectos", name: "Defectos por lote", dist: "binom", emoji: "🏭",
    desc: "Número de piezas defectuosas en lotes de 20 unidades (n=50 lotes)",
    data: [0, 1, 0, 2, 1, 0, 1, 3, 1, 0, 2, 1, 0, 0, 1, 2, 0, 1, 1, 0, 2, 0, 1, 0, 1, 3, 0, 1, 2, 1, 0, 0, 1, 0, 2, 1, 1, 0, 0, 1, 2, 0, 1, 0, 1, 0, 2, 1, 1, 0]
  },
  {
    id: "clientes", name: "Clientes por hora", dist: "poisson", emoji: "🏦",
    desc: "Número de clientes que llegan a ventanilla bancaria por hora (n=60 horas)",
    data: [4, 7, 5, 6, 8, 3, 5, 6, 9, 4, 7, 5, 6, 4, 8, 5, 6, 7, 3, 5, 6, 8, 4, 5, 7, 6, 5, 4, 6, 8, 5, 7, 4, 6, 5, 3, 7, 6, 5, 4, 8, 6, 5, 7, 4, 6, 5, 6, 7, 4, 5, 6, 8, 5, 6, 4, 7, 5, 6, 5]
  },
  {
    id: "alturas", name: "Alturas estudiantes (cm)", dist: "normal", emoji: "📏",
    desc: "Alturas de 40 estudiantes universitarios en centímetros",
    data: [165, 172, 168, 175, 170, 163, 178, 171, 169, 174, 166, 173, 170, 168, 176, 172, 167, 175, 169, 171, 164, 173, 168, 170, 177, 165, 172, 169, 174, 171, 168, 176, 170, 165, 173, 169, 172, 175, 167, 170]
  },
  {
    id: "auditoria", name: "Piezas defectuosas (lote)", dist: "hyper", emoji: "🔍",
    desc: "Defectuosas encontradas en muestra de 15 de lote con 10 defectuosas en 200",
    data: [0, 1, 0, 0, 2, 0, 1, 0, 0, 1, 2, 0, 0, 1, 0, 0, 1, 0, 2, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 1, 0, 0, 0]
  },
];

const TabValidacion = () => {
  const [distId, setDistId] = useState("poisson");
  const [inputMode, setInputMode] = useState("ejemplo"); // "ejemplo" | "manual" | "csv"
  const [selectedEjemplo, setSelectedEjemplo] = useState(0);
  const [manualInput, setManualInput] = useState("");
  const [data, setData] = useState(DATASETS_EJEMPLO[1].data);
  const [parseError, setParseError] = useState("");
  const [showDiagnostico, setShowDiagnostico] = useState(true);
  const fileRef = useRef(null);

  // Sincronizar dist al cambiar ejemplo
  const handleEjemplo = (idx) => {
    setSelectedEjemplo(idx);
    const ej = DATASETS_EJEMPLO[idx];
    setDistId(ej.dist);
    setData(ej.data);
    setParseError("");
  };

  // Parse manual
  const handleManualParse = () => {
    const nums = manualInput.split(/[\s,;]+/).map(Number).filter(v => !isNaN(v) && isFinite(v));
    if (nums.length < 5) { setParseError("Ingresa al menos 5 valores numéricos separados por comas."); return; }
    setData(nums); setParseError("");
  };

  // Parse CSV
  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const nums = text.split(/[\n,;\t\r]+/).map(s => parseFloat(s.trim())).filter(v => !isNaN(v) && isFinite(v));
      if (nums.length < 5) { setParseError("No se encontraron suficientes datos numéricos en el archivo."); return; }
      setData(nums); setParseError("");
    };
    reader.readAsText(file);
  };

  const stats = useMemo(() => calcStats(data), [data]);
  const params = useMemo(() => estimateParams(data, distId), [data, distId]);

  // Frecuencias empíricas
  const empFreqMap = useMemo(() => {
    const map = {};
    data.forEach(v => { const k = distId === "normal" ? v : Math.round(v); map[k] = (map[k] || 0) + 1; });
    return map;
  }, [data, distId]);

  // Distribución teórica con params estimados
  const theoryData = useMemo(() => {
    if (!params) return [];
    if (distId === "binom") return buildBinom(params.n, params.p);
    if (distId === "poisson") return buildPoisson(params.lambda);
    if (distId === "hyper") return buildHyper(params.N, params.K, params.n);
    if (distId === "normal") return buildNormal(params.mu, params.sigma);
    return [];
  }, [distId, params]);

  // Datos del gráfico de comparación
  const chartData = useMemo(() => {
    if (!stats || theoryData.length === 0) return [];
    const n = data.length;

    if (distId === "normal") {
      // Histograma empírico bins
      const bins = 12;
      const min = stats.min, max = stats.max, range = max - min || 1;
      const binWidth = range / bins;
      const binCounts = Array(bins).fill(0);
      data.forEach(v => {
        const bi = Math.min(bins - 1, Math.floor((v - min) / binWidth));
        binCounts[bi]++;
      });
      return Array.from({ length: bins }, (_, i) => {
        const x = +(min + (i + 0.5) * binWidth).toFixed(2);
        const empDensity = binCounts[i] / (n * binWidth);
        const thPdf = normalPDF(params.mu, params.sigma, x);
        return { x, empirica: +empDensity.toFixed(5), teorica: +thPdf.toFixed(5), label: x.toString() };
      });
    } else {
      const keys = new Set([...Object.keys(empFreqMap).map(Number), ...theoryData.map(d => d.k)]);
      return [...keys].sort((a, b) => a - b).map(k => ({
        k, label: String(k),
        empirica: +((empFreqMap[k] || 0) / n).toFixed(5),
        teorica: +(theoryData.find(d => d.k === k)?.prob || 0).toFixed(5),
      }));
    }
  }, [distId, data, empFreqMap, theoryData, stats, params]);

  const mse = useMemo(() => {
    if (chartData.length === 0) return 0;
    return calcMSE(chartData.map(d => d.empirica), chartData.map(d => d.teorica));
  }, [chartData]);

  const diagnostico = useMemo(() => {
    if (!stats || !params) return "";
    return generateDiagnostico(distId, stats, params, mse, chartData.map(d => d.empirica), chartData.map(d => d.teorica));
  }, [distId, stats, params, mse, chartData]);

  const distColor = distId === "binom" ? T.binom : distId === "poisson" ? T.poisson : distId === "hyper" ? T.hyper : T.normal;
  const DIST_LABELS = { binom: "Binomial", poisson: "Poisson", hyper: "Hipergeométrica", normal: "Normal" };
  const mseNorm = Math.min(mse * 1000, 100);
  const ajusteColor = mseNorm < 1 ? T.green : mseNorm < 5 ? T.yellow : mseNorm < 15 ? T.hyper : T.red;
  const ajusteLabel = mseNorm < 1 ? "Excelente" : mseNorm < 5 ? "Adecuado" : mseNorm < 15 ? "Moderado" : "Deficiente";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg,${distColor}12,transparent 70%)`, border: `1px solid ${distColor}25`, borderRadius: 18, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${distColor},${distColor}99)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Activity style={{ color: "white", width: 18, height: 18 }} />
          </div>
          <div>
            <h2 style={{ color: T.white, fontWeight: 900, fontSize: 17 }}>Validación Empírica de Modelos</h2>
            <p style={{ color: T.muted, fontSize: 12 }}>Carga datos reales, estima parámetros automáticamente y contrasta el modelo con la evidencia.</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 18, alignItems: "start" }}>

        {/* PANEL IZQUIERDO — entrada de datos + selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Selector de distribución */}
          <div style={{ background: T.panel, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 18 }}>
            <p style={{ color: T.muted, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Distribución a ajustar</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
              {[
                { id: "binom", label: "Binomial", emoji: "🎯", color: T.binom },
                { id: "poisson", label: "Poisson", emoji: "⚡", color: T.poisson },
                { id: "hyper", label: "Hipergeom.", emoji: "🎲", color: T.hyper },
                { id: "normal", label: "Normal", emoji: "🔔", color: T.normal },
              ].map(d => (
                <button key={d.id} onClick={() => setDistId(d.id)} style={{
                  padding: "9px 10px", borderRadius: 11, border: "none", cursor: "pointer",
                  background: distId === d.id ? `linear-gradient(135deg,${d.color},${d.color}bb)` : `${d.color}10`,
                  color: distId === d.id ? "white" : d.color,
                  fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  outline: distId !== d.id ? `1px solid ${d.color}25` : "none", transition: "all 0.2s"
                }}>
                  <span>{d.emoji}</span>{d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Modo de entrada */}
          <div style={{ background: T.panel, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 18 }}>
            <p style={{ color: T.muted, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Fuente de datos</p>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {[["ejemplo", "📦 Ejemplo"], ["manual", "✏️ Manual"], ["csv", "📄 CSV"]].map(([m, l]) => (
                <button key={m} onClick={() => setInputMode(m)} style={{
                  flex: 1, padding: "7px 4px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 800,
                  background: inputMode === m ? `${distColor}25` : "rgba(255,255,255,0.04)",
                  color: inputMode === m ? distColor : T.muted,
                  outline: inputMode === m ? `1px solid ${distColor}40` : "none", transition: "all 0.2s"
                }}>{l}</button>
              ))}
            </div>

            {inputMode === "ejemplo" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {DATASETS_EJEMPLO.map((ej, i) => (
                  <button key={ej.id} onClick={() => handleEjemplo(i)} style={{
                    padding: "10px 12px", borderRadius: 11, border: "none", cursor: "pointer", textAlign: "left",
                    background: selectedEjemplo === i ? `${distColor}15` : "rgba(255,255,255,0.03)",
                    outline: selectedEjemplo === i ? `1.5px solid ${distColor}40` : "1px solid rgba(255,255,255,0.06)",
                    transition: "all 0.2s"
                  }}>
                    <p style={{ color: T.white, fontWeight: 800, fontSize: 12, marginBottom: 3 }}>{ej.emoji} {ej.name}</p>
                    <p style={{ color: T.muted, fontSize: 10, lineHeight: 1.5 }}>{ej.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {inputMode === "manual" && (
              <div>
                <textarea
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  placeholder="Pega tus datos separados por comas o espacios&#10;Ej: 3, 5, 2, 7, 4, 6, 5, 3..."
                  style={{
                    width: "100%", minHeight: 100, background: "rgba(0,0,0,0.3)", border: `1px solid ${distColor}30`,
                    borderRadius: 10, color: T.white, fontSize: 12, padding: "10px 12px", resize: "vertical",
                    fontFamily: "monospace", outline: "none", boxSizing: "border-box"
                  }}
                />
                {parseError && <p style={{ color: T.red, fontSize: 11, marginTop: 5 }}>⚠️ {parseError}</p>}
                <button onClick={handleManualParse} style={{
                  marginTop: 8, width: "100%", padding: "9px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg,${distColor},${distColor}aa)`, color: "white", fontWeight: 800, fontSize: 13
                }}>Analizar datos</button>
              </div>
            )}

            {inputMode === "csv" && (
              <div>
                <div onClick={() => fileRef.current?.click()} style={{
                  border: `2px dashed ${distColor}35`, borderRadius: 12, padding: "22px 16px", textAlign: "center",
                  cursor: "pointer", background: `${distColor}05`, transition: "all 0.2s"
                }}>
                  <p style={{ fontSize: 24, marginBottom: 6 }}>📄</p>
                  <p style={{ color: T.white, fontWeight: 700, fontSize: 13 }}>Click para subir CSV</p>
                  <p style={{ color: T.muted, fontSize: 11, marginTop: 4 }}>Una columna numérica, sin encabezado</p>
                </div>
                <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={handleCSV} />
                {parseError && <p style={{ color: T.red, fontSize: 11, marginTop: 6 }}>⚠️ {parseError}</p>}
              </div>
            )}
          </div>

          {/* Resumen de datos cargados */}
          {stats && (
            <div style={{ background: T.panel, border: `1px solid ${distColor}20`, borderRadius: 16, padding: 16 }}>
              <p style={{ color: T.muted, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Datos cargados</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {[
                  { label: "n", val: stats.n, color: distColor },
                  { label: "Media", val: stats.mean.toFixed(3), color: distColor },
                  { label: "Mediana", val: stats.median.toFixed(2), color: T.muted },
                  { label: "Std", val: stats.std.toFixed(3), color: T.muted },
                  { label: "Asimetría", val: stats.skewness.toFixed(3), color: Math.abs(stats.skewness) > 0.5 ? T.yellow : T.green },
                  { label: "Curtosis exc.", val: stats.kurtosis.toFixed(3), color: Math.abs(stats.kurtosis) > 1 ? T.yellow : T.green },
                ].map((m, i) => (
                  <div key={i} style={{ padding: "7px 10px", borderRadius: 9, background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p style={{ color: T.muted, fontSize: 9, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>{m.label}</p>
                    <p style={{ color: m.color, fontWeight: 900, fontSize: 14, fontFamily: "Georgia,serif" }}>{m.val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parámetros estimados (MLE) */}
          {params && (
            <div style={{ background: `${distColor}08`, border: `1.5px solid ${distColor}30`, borderRadius: 16, padding: 16 }}>
              <p style={{ color: distColor, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Parámetros estimados (MLE)</p>
              {distId === "binom" && <p style={{ color: T.white, fontFamily: "monospace", fontSize: 13 }}>n = {params.n}, p = {params.p.toFixed(4)}</p>}
              {distId === "poisson" && <p style={{ color: T.white, fontFamily: "monospace", fontSize: 13 }}>λ = {params.lambda.toFixed(4)}</p>}
              {distId === "hyper" && <p style={{ color: T.white, fontFamily: "monospace", fontSize: 12 }}>N={params.N}, K={params.K}, n={params.n}</p>}
              {distId === "normal" && <p style={{ color: T.white, fontFamily: "monospace", fontSize: 13 }}>μ = {params.mu.toFixed(4)}, σ = {params.sigma.toFixed(4)}</p>}
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ width: `${Math.max(5, 100 - mseNorm * 5)}%`, height: "100%", borderRadius: 3, background: ajusteColor, transition: "width 0.4s" }} />
                </div>
                <span style={{ color: ajusteColor, fontWeight: 900, fontSize: 12, minWidth: 70 }}>Ajuste: {ajusteLabel}</span>
              </div>
            </div>
          )}
        </div>

        {/* PANEL DERECHO — gráfica + diagnóstico */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Gráfico comparativo */}
          <div style={{ background: T.panel, border: `1px solid ${distColor}20`, borderRadius: 18, padding: "20px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h3 style={{ color: T.white, fontWeight: 900, fontSize: 15 }}>Empírico vs Teórico — {DIST_LABELS[distId]}</h3>
                <p style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>
                  {distId === "normal" ? "Densidad observada vs f(x) teórica" : "Frecuencias relativas observadas vs P(X=k) teórica"}
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: distColor }} />
                  <span style={{ color: T.muted, fontSize: 11 }}>Observado</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 3, background: "#f97316", borderRadius: 1 }} />
                  <span style={{ color: T.muted, fontSize: 11 }}>Teórico</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: T.muted, fontSize: 11 }} />
                <YAxis tick={{ fill: T.muted, fontSize: 11 }} tickFormatter={v => (v * 100).toFixed(1) + '%'} />
                <Tooltip content={<CustomTooltip color={distColor} discrete={distId !== "normal"} />} />
                <Bar dataKey="empirica" name="Observado" fill={distColor} fillOpacity={0.75} radius={[3, 3, 0, 0]} />
                <Line dataKey="teorica" name="Teórico" stroke="#f97316" strokeWidth={2.5} dot={false} type="monotone" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Métricas de ajuste */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { label: "Error Cuadrático Medio", val: mse.toFixed(6), sub: "ECM (obs−teo)²", color: ajusteColor, icon: <Target style={{ width: 14, height: 14 }} /> },
              { label: "Calidad del ajuste", val: ajusteLabel, sub: `ECM×1000 = ${mseNorm.toFixed(2)}`, color: ajusteColor, icon: <CheckCircle style={{ width: 14, height: 14 }} /> },
              { label: "Asimetría observada", val: stats?.skewness.toFixed(3) ?? "—", sub: Math.abs(stats?.skewness ?? 0) < 0.3 ? "Simétrica ✅" : stats?.skewness > 0 ? "Cola derecha ⚠️" : "Cola izquierda ⚠️", color: Math.abs(stats?.skewness ?? 0) < 0.3 ? T.green : T.yellow, icon: <TrendingUp style={{ width: 14, height: 14 }} /> },
            ].map((m, i) => (
              <div key={i} style={{ padding: "14px 16px", borderRadius: 14, background: T.panel, border: `1px solid ${m.color}25` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: m.color }}>{m.icon}<span style={{ fontSize: 11, fontWeight: 700, color: T.muted }}>{m.label}</span></div>
                <p style={{ color: m.color, fontWeight: 900, fontSize: 18, fontFamily: "Georgia,serif" }}>{m.val}</p>
                <p style={{ color: T.muted, fontSize: 10, marginTop: 3 }}>{m.sub}</p>
              </div>
            ))}
          </div>

          {/* Diagnóstico automático en lenguaje natural */}
          <div style={{ background: `${distColor}06`, border: `1.5px solid ${distColor}25`, borderRadius: 18, overflow: "hidden" }}>
            <button onClick={() => setShowDiagnostico(s => !s)} style={{
              width: "100%", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg,${distColor},${distColor}99)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Brain style={{ color: "white", width: 15, height: 15 }} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <p style={{ color: T.white, fontWeight: 900, fontSize: 14 }}>🔍 Diagnóstico Automático</p>
                  <p style={{ color: T.muted, fontSize: 11 }}>Interpretación del ajuste en lenguaje natural</p>
                </div>
              </div>
              <ChevronRight style={{ color: distColor, width: 16, height: 16, transform: showDiagnostico ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
            </button>
            {showDiagnostico && diagnostico && (
              <div style={{ padding: "0 20px 20px" }}>
                <div style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 2, fontStyle: "italic" }}>
                    "{diagnostico}"
                  </p>
                </div>
                <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 11, background: `${T.yellow}08`, border: `1px solid ${T.yellow}20` }}>
                  <p style={{ color: T.yellow, fontSize: 11, fontWeight: 700 }}>
                    📌 Nota pedagógica: Este diagnóstico es descriptivo — valida visualmente el ajuste del modelo.
                    En el próximo laboratorio aprenderás a cuantificar este ajuste formalmente usando <strong>pruebas de bondad de ajuste</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tabla empírico vs teórico (discreta) */}
          {distId !== "normal" && chartData.length <= 20 && (
            <div style={{ background: T.panel, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 18, overflowX: "auto" }}>
              <h3 style={{ color: T.white, fontWeight: 900, fontSize: 14, marginBottom: 14 }}>Tabla Comparativa — Frecuencias Relativas</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    {["k", "Frec. Obs.", "P(X=k) Teo.", "Diferencia", ""].map((h, i) => (
                      <th key={i} style={{ color: T.muted, fontWeight: 700, padding: "6px 10px", textAlign: i === 0 ? "center" : "right", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((d, i) => {
                    const diff = d.empirica - d.teorica;
                    const absDiff = Math.abs(diff);
                    const diffColor = absDiff < 0.01 ? T.green : absDiff < 0.03 ? T.yellow : T.red;
                    const barW = Math.min(60, absDiff * 1500);
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ color: distColor, fontWeight: 900, padding: "6px 10px", textAlign: "center", fontFamily: "monospace" }}>{d.label}</td>
                        <td style={{ color: T.white, padding: "6px 10px", textAlign: "right", fontFamily: "monospace" }}>{(d.empirica * 100).toFixed(2)}%</td>
                        <td style={{ color: "#94a3b8", padding: "6px 10px", textAlign: "right", fontFamily: "monospace" }}>{(d.teorica * 100).toFixed(2)}%</td>
                        <td style={{ color: diffColor, padding: "6px 10px", textAlign: "right", fontFamily: "monospace" }}>{diff >= 0 ? "+" : ""}{(diff * 100).toFixed(2)}%</td>
                        <td style={{ padding: "6px 8px", width: 70 }}>
                          <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                            <div style={{ width: `${barW}%`, height: "100%", borderRadius: 3, background: diffColor }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════
// TABS
// ══════════════════════════════════════════
const TABS = [
  { id: "intro", label: "Introducción", icon: <BookOpen style={{ width: 14, height: 14 }} /> },
  { id: "calc", label: "Calculadora", icon: <Calculator style={{ width: 14, height: 14 }} /> },
  { id: "validacion", label: "Validación", icon: <Activity style={{ width: 14, height: 14 }} /> },
  { id: "quiz", label: "Quiz", icon: <Brain style={{ width: 14, height: 14 }} /> },
];

// ══════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════
const Lab5_2 = ({ goHome, setView }) => {
  const [activeTab, setActiveTab] = useState("intro");
  const [showResumen, setShowResumen] = useState(false);
  const [globalQuizScore, setGlobalQuizScore] = useState(0);
  const [globalQuizTotal, setGlobalQuizTotal] = useState(10);
  const [globalCasosScore, setGlobalCasosScore] = useState(0);

  const handleQuizComplete = (score, total) => {
    setGlobalQuizScore(score);
    setGlobalQuizTotal(total);
    setShowResumen(true);
    setActiveTab("quiz");
  };

  const handleCasoComplete = (casosCompletados) => {
    setGlobalCasosScore(casosCompletados);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.white, fontFamily: "system-ui,-apple-system,sans-serif" }}>

      {/* Fondos decorativos */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 600, height: 600, background: `radial-gradient(circle,${T.binom}07,transparent 65%)` }} />
        <div style={{ position: "absolute", top: "40%", left: "-8%", width: 500, height: 500, background: `radial-gradient(circle,${T.poisson}06,transparent 65%)` }} />
        <div style={{ position: "absolute", bottom: "-15%", right: "20%", width: 500, height: 500, background: `radial-gradient(circle,${T.normal}05,transparent 65%)` }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle,rgba(139,92,246,0.03) 1px,transparent 1px)`, backgroundSize: "38px 38px" }} />
      </div>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(5,5,8,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(99,102,241,0.18)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => { if (goHome) goHome(); else if (setView) setView("home"); }}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: T.muted, cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#a78bfa"; e.currentTarget.style.borderColor = `${T.binom}40`; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
            <ArrowLeft style={{ width: 14, height: 14 }} />Volver al Índice
          </button>

          {/* Logo capítulo (igual a 5.1) */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Cap5Logo size={42} animate={true} />
            <div>
              <span style={{ display: "block", fontSize: 11, fontWeight: 800, color: T.binom, textTransform: "uppercase", letterSpacing: "0.1em" }}>Capítulo 5</span>
              <span style={{ display: "block", fontWeight: 900, color: T.white, fontSize: 14 }}>Distribuciones de Probabilidad</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: `${T.binom}12`, border: `1px solid ${T.binom}25` }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.binom, animation: "blink 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: "#a5b4fc", letterSpacing: "0.1em", textTransform: "uppercase" }}>Lab 5.2</span>
          </div>
        </div>
      </nav>

      {/* CONTENIDO */}
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 24px 80px", position: "relative" }}>

        {/* HERO */}
        <div style={{
          background: `linear-gradient(135deg,${T.binom}10,transparent 60%)`,
          border: `1px solid ${T.binom}22`, borderLeft: `4px solid ${T.binom}`, borderRadius: 20,
          padding: "24px 28px", marginBottom: 28, position: "relative", overflow: "hidden"
        }}>
          {/* Marca de agua — grande y visible como en 4.1 */}
          <div style={{ position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)", opacity: 0.12, pointerEvents: "none" }}>
            <Lab52Logo size={180} />
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
              {/* Ícono grande — mismo estilo que 4.1: fondo de color, logo que lo llena */}
              <div style={{ width: 64, height: 64, borderRadius: 16, flexShrink: 0, background: `linear-gradient(135deg,${T.binom}40,${T.binom}20)`, border: `1.5px solid ${T.binom}50`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Lab52Logo size={50} />
              </div>
              <span style={{ padding: "3px 14px", borderRadius: 20, background: `${T.binom}15`, border: `1px solid ${T.binom}25`, color: "#a5b4fc", fontWeight: 900, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>Sección 5.2</span>
            </div>
            <h1 style={{ color: T.white, fontWeight: 900, fontSize: 24, marginBottom: 8 }}>5.2 Distribuciones de Probabilidad</h1>
            <p style={{ color: T.muted, fontSize: 14, maxWidth: 700, lineHeight: 1.65 }}>
              Domina las 4 distribuciones fundamentales — <strong style={{ color: T.binom }}>Binomial</strong>, <strong style={{ color: T.poisson }}>Poisson</strong>, <strong style={{ color: T.hyper }}>Hipergeométrica</strong> y <strong style={{ color: T.normal }}>Normal</strong> — con calculadora interactiva, árbol de decisión, casos reales y quiz.
            </p>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 14, flexWrap: "wrap" }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "10px 22px", borderRadius: 13, border: "none", cursor: "pointer",
              fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", gap: 7,
              background: activeTab === tab.id ? `linear-gradient(135deg,${T.binom},#4f46e5)` : "rgba(255,255,255,0.04)",
              color: activeTab === tab.id ? "white" : T.muted,
              boxShadow: activeTab === tab.id ? `0 4px 14px ${T.binom}35` : "none",
              transition: "all 0.2s"
            }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* CONTENIDO POR TAB */}
        {activeTab === "intro" && <TabIntro />}
        {activeTab === "calc" && <TabCalculadora />}
        {activeTab === "validacion" && <TabValidacion />}
        {activeTab === "quiz" && !showResumen && <TabQuiz onComplete={handleQuizComplete} />}
        {activeTab === "quiz" && showResumen && (
          <ResumenFinal52
            quizScore={globalQuizScore}
            quizTotal={globalQuizTotal}
            casosScore={globalCasosScore}
            onReset={() => {
              setShowResumen(false);
              setGlobalQuizScore(0);
              setGlobalCasosScore(0);
              setActiveTab("intro");
            }}
          />
        )}

        <div style={{ height: 60 }} />
      </div>

      <style>{`
        @keyframes logoPulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.78;transform:scale(1.04);} }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.25;} }
        * { box-sizing:border-box; margin:0; padding:0; }
        input[type=range] { height:5px; }
        button:not(:disabled):hover { filter:brightness(1.08); }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:rgba(255,255,255,0.03); }
        ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.3); border-radius:3px; }
      `}</style>
    </div>
  );
};

export default Lab5_2;