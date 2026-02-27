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
// FUNCIONES MATEMÁTICAS
// ──────────────────────────────────────────
const factorial = n => { if (n <= 1) return 1; let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
const comb = (n, k) => { if (k < 0 || k > n) return 0; if (k === 0 || k === n) return 1; let r = 1; for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1); return Math.round(r); };

const binomPMF = (n, p, k) => comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
const poissonPMF = (lambda, k) => (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(Math.min(k, 20));
const hyperPMF = (N, K, n, k) => (comb(K, k) * comb(N - K, n - k)) / comb(N, n);
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
      ejemplos: ["Alturas, pesos, temperaturas", "Errores de medición", "Calificaciones de examen nacional"],
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
// CALCULADORA INTERACTIVA — 4 distribuciones
// ══════════════════════════════════════════
const TabCalculadora = () => {
  const [dist, setDist] = useState("binom");
  const [highlightK, setHighlightK] = useState(null);
  const [showCDF, setShowCDF] = useState(false);
  const [queryK, setQueryK] = useState("");
  const [queryResult, setQueryResult] = useState(null);
  const [queryType, setQueryType] = useState("eq"); // eq | le | ge | range

  // Parámetros
  const [bn, setBn] = useState(10); const [bp, setBp] = useState(0.3);
  const [pl, setPl] = useState(4);
  const [hN, setHN] = useState(50); const [hK, setHK] = useState(10); const [hn, setHn] = useState(8);
  const [nmu, setNmu] = useState(70); const [nsigma, setNsigma] = useState(10);
  const [normalRange, setNormalRange] = useState([60, 80]);

  const distData = useMemo(() => {
    if (dist === "binom") return buildBinom(bn, bp);
    if (dist === "poisson") return buildPoisson(pl);
    if (dist === "hyper") return buildHyper(hN, hK, hn);
    return buildNormal(nmu, nsigma);
  }, [dist, bn, bp, pl, hN, hK, hn, nmu, nsigma]);

  const color = dist === "binom" ? T.binom : dist === "poisson" ? T.poisson : dist === "hyper" ? T.hyper : T.normal;
  const isDiscrete = dist !== "normal";

  const stats = useMemo(() => {
    if (dist === "binom") return { EX: (bn * bp).toFixed(3), Var: (bn * bp * (1 - bp)).toFixed(3), sigma: Math.sqrt(bn * bp * (1 - bp)).toFixed(3) };
    if (dist === "poisson") return { EX: pl.toFixed(2), Var: pl.toFixed(2), sigma: Math.sqrt(pl).toFixed(3) };
    if (dist === "hyper") {
      const ex = (hn * hK / hN).toFixed(3);
      const v = hn * (hK / hN) * (1 - hK / hN) * (hN - hn) / (hN - 1);
      return { EX: ex, Var: v.toFixed(3), sigma: Math.sqrt(v).toFixed(3) };
    }
    return { EX: nmu.toFixed(2), Var: (nsigma ** 2).toFixed(2), sigma: nsigma.toFixed(2) };
  }, [dist, bn, bp, pl, hN, hK, hn, nmu, nsigma]);

  const computeQuery = () => {
    const k = parseFloat(queryK);
    if (isNaN(k)) return;
    let prob = 0;
    if (isDiscrete) {
      if (queryType === "eq") prob = distData.find(d => d.k === Math.round(k))?.prob || 0;
      else if (queryType === "le") prob = distData.find(d => d.k === Math.round(k))?.cdf || 0;
      else if (queryType === "ge") {
        const cdfPrev = Math.round(k) > 0 ? (distData.find(d => d.k === Math.round(k) - 1)?.cdf || 0) : 0;
        prob = 1 - cdfPrev;
      }
    } else {
      if (queryType === "le") prob = normalCDF(nmu, nsigma, k);
      else if (queryType === "ge") prob = 1 - normalCDF(nmu, nsigma, k);
      else if (queryType === "eq") { prob = normalPDF(nmu, nsigma, k); }
    }
    setQueryResult({ k, prob, type: queryType });
  };

  const DIST_TABS = [
    { id: "binom", label: "Binomial", emoji: "🎯", color: T.binom },
    { id: "poisson", label: "Poisson", emoji: "⚡", color: T.poisson },
    { id: "hyper", label: "Hipergeo.", emoji: "🎲", color: T.hyper },
    { id: "normal", label: "Normal", emoji: "🔔", color: T.normal },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Selector distribución */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {DIST_TABS.map(d => (
          <button key={d.id} onClick={() => { setDist(d.id); setHighlightK(null); setQueryResult(null); }}
            style={{
              flex: 1, minWidth: 130, padding: "12px 18px", borderRadius: 14, border: "none", cursor: "pointer",
              fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              background: dist === d.id ? `linear-gradient(135deg,${d.color},${d.color}bb)` : `${d.color}10`,
              color: dist === d.id ? "white" : d.color,
              boxShadow: dist === d.id ? `0 4px 18px ${d.color}40` : "none",
              outline: dist !== d.id ? `1px solid ${d.color}30` : "none",
              transition: "all 0.2s"
            }}>
            <span style={{ fontSize: 18 }}>{d.emoji}</span>{d.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 18 }}>

        {/* Panel de parámetros */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Panel color={color} style={{ padding: 22 }}>
            <h4 style={{ color: T.white, fontWeight: 900, fontSize: 15, marginBottom: 16 }}>
              ⚙️ Parámetros
            </h4>

            {dist === "binom" && <>
              {[
                { label: "n — Número de ensayos", val: bn, set: setBn, min: 1, max: 30, step: 1, color: T.binom },
                { label: "p — Probabilidad de éxito", val: bp, set: setBp, min: 0.01, max: 0.99, step: 0.01, color: T.pink, fmt: v => v.toFixed(2) },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: T.muted, fontSize: 12, fontWeight: 700 }}>{s.label}</span>
                    <span style={{ color: T.white, fontWeight: 900, fontSize: 14, fontFamily: "Georgia,serif" }}>{s.fmt ? s.fmt(s.val) : s.val}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                    onChange={e => { s.set(+e.target.value); setHighlightK(null); setQueryResult(null); }}
                    style={{ width: "100%", accentColor: s.color, cursor: "pointer" }} />
                </div>
              ))}
            </>}

            {dist === "poisson" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: T.muted, fontSize: 12, fontWeight: 700 }}>λ — Tasa de eventos</span>
                  <span style={{ color: T.white, fontWeight: 900, fontSize: 16, fontFamily: "Georgia,serif" }}>{pl}</span>
                </div>
                <input type="range" min={0.5} max={20} step={0.5} value={pl}
                  onChange={e => { setPl(+e.target.value); setHighlightK(null); setQueryResult(null); }}
                  style={{ width: "100%", accentColor: T.poisson, cursor: "pointer" }} />
              </div>
            )}

            {dist === "hyper" && <>
              {[
                { label: "N — Tamaño total de la población", val: hN, set: setHN, min: 10, max: 200, step: 5, color: T.hyper },
                { label: "K — Éxitos en la población", val: hK, set: setHK, min: 1, max: hN - 1, step: 1, color: T.pink },
                { label: "n — Tamaño de la muestra", val: hn, set: setHn, min: 1, max: Math.min(hN, 20), step: 1, color: T.green },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: T.muted, fontSize: 12, fontWeight: 700 }}>{s.label}</span>
                    <span style={{ color: T.white, fontWeight: 900, fontSize: 14, fontFamily: "Georgia,serif" }}>{s.val}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                    onChange={e => { s.set(+e.target.value); setHighlightK(null); setQueryResult(null); }}
                    style={{ width: "100%", accentColor: s.color, cursor: "pointer" }} />
                </div>
              ))}
            </>}

            {dist === "normal" && <>
              {[
                { label: "μ — Media", val: nmu, set: setNmu, min: 0, max: 200, step: 1, color: T.normal },
                { label: "σ — Desviación estándar", val: nsigma, set: setNsigma, min: 1, max: 50, step: 1, color: T.pink },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: T.muted, fontSize: 12, fontWeight: 700 }}>{s.label}</span>
                    <span style={{ color: T.white, fontWeight: 900, fontSize: 14, fontFamily: "Georgia,serif" }}>{s.val}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                    onChange={e => { s.set(+e.target.value); setHighlightK(null); setQueryResult(null); }}
                    style={{ width: "100%", accentColor: s.color, cursor: "pointer" }} />
                </div>
              ))}
            </>}

            {/* Métricas */}
            <div style={{ borderTop: `1px solid ${color}20`, paddingTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <StatChip label="E(X)" value={stats.EX} color={T.pink} />
              <StatChip label="Var(X)" value={stats.Var} color={T.yellow} />
              <StatChip label="σ(X)" value={stats.sigma} color={T.green} />
            </div>
          </Panel>

          {/* Calculadora de probabilidades */}
          <Panel color={color} style={{ padding: 20 }}>
            <h4 style={{ color: T.white, fontWeight: 900, fontSize: 14, marginBottom: 14 }}>🔢 Calcular P(X ?)</h4>
            <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }}>
              {[
                { id: "eq", label: "= k", tip: "Exactamente" },
                { id: "le", label: "≤ k", tip: "A lo más" },
                { id: "ge", label: "≥ k", tip: "Al menos" },
              ].map(qt => (
                <button key={qt.id} onClick={() => setQueryType(qt.id)} style={{
                  flex: 1, padding: "7px 10px", borderRadius: 9, border: "none", cursor: "pointer",
                  background: queryType === qt.id ? color : `${color}12`,
                  color: queryType === qt.id ? "white" : color,
                  fontWeight: 800, fontSize: 12, outline: queryType !== qt.id ? `1px solid ${color}30` : "none",
                  transition: "all 0.15s"
                }}>{qt.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="number"
                value={queryK}
                onChange={e => setQueryK(e.target.value)}
                placeholder={isDiscrete ? "k entero" : "valor x"}
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${color}30`,
                  color: T.white, fontSize: 14, fontWeight: 700, outline: "none"
                }} />
              <button onClick={computeQuery} style={{
                padding: "10px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg,${color},${color}bb)`,
                color: "white", fontWeight: 800, fontSize: 13,
                boxShadow: `0 4px 12px ${color}35`
              }}>=</button>
            </div>
            {queryResult && (
              <div style={{ marginTop: 12, padding: "14px 16px", borderRadius: 12, background: `${color}12`, border: `1.5px solid ${color}40` }}>
                <p style={{ color: T.muted, fontSize: 11, marginBottom: 4 }}>
                  P(X {queryResult.type === "eq" ? "=" : queryResult.type === "le" ? "≤" : "≥"} {queryResult.k})
                </p>
                <p style={{ color, fontWeight: 900, fontSize: 24, fontFamily: "Georgia,serif" }}>
                  {(queryResult.prob * 100).toFixed(4)}%
                </p>
                <p style={{ color: T.muted, fontSize: 11, marginTop: 4 }}>= {queryResult.prob.toFixed(6)}</p>
              </div>
            )}
          </Panel>
        </div>

        {/* Gráfico principal */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Panel color={color} style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <h3 style={{ color: T.white, fontWeight: 900, fontSize: 16 }}>
                {showCDF ? "CDF — F(x) = P(X ≤ x)" : "PMF/PDF — f(x) = P(X = x)"}
              </h3>
              <div style={{ display: "flex", gap: 7 }}>
                {[["PMF", false], ["CDF", true]].map(([label, val]) => (
                  <button key={label} onClick={() => setShowCDF(val)} style={{
                    padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer",
                    fontWeight: 800, fontSize: 12,
                    background: showCDF === val ? `linear-gradient(135deg,${color},${color}bb)` : `${color}10`,
                    color: showCDF === val ? "white" : color,
                    outline: showCDF !== val ? `1px solid ${color}30` : "none",
                    transition: "all 0.2s"
                  }}>{label}</button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              {isDiscrete ? (
                <BarChart data={distData} margin={{ top: 15, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="k" tick={{ fill: T.muted, fontSize: 11 }}
                    label={{ value: "k", position: "insideBottom", offset: -15, fill: T.muted, fontWeight: 700, fontSize: 13 }} />
                  <YAxis tick={{ fill: T.muted, fontSize: 10 }} tickFormatter={v => (v * 100).toFixed(1) + "%"}
                    label={{ value: showCDF ? "F(k)" : "P(X=k)", angle: -90, position: "insideLeft", fill: T.muted, fontSize: 12, offset: 10 }} />
                  {!showCDF && <ReferenceLine x={Math.round(parseFloat(stats.EX))} stroke={T.pink} strokeDasharray="5 3"
                    label={{ value: `μ=${stats.EX}`, fill: T.pink, fontSize: 11, position: "top" }} />}
                  <Tooltip content={<CustomTooltip color={color} discrete={true} />} />
                  <Bar dataKey={showCDF ? "cdf" : "prob"} radius={[5, 5, 0, 0]}
                    name={showCDF ? "F(k)" : "P(X=k)"}
                    onClick={d => setHighlightK(highlightK === d.k ? null : d.k)}>
                    {distData.map((entry, i) => (
                      <Cell key={i}
                        fill={highlightK === entry.k ? T.yellow : color}
                        opacity={highlightK !== null && highlightK !== entry.k ? 0.2 : 0.9} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <AreaChart data={distData} margin={{ top: 15, right: 20, left: 0, bottom: 40 }}>
                  <defs>
                    <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="x" tick={{ fill: T.muted, fontSize: 10 }}
                    tickFormatter={v => v.toFixed(0)}
                    label={{ value: "x", position: "insideBottom", offset: -15, fill: T.muted, fontWeight: 700, fontSize: 13 }} />
                  <YAxis tick={{ fill: T.muted, fontSize: 10 }}
                    label={{ value: showCDF ? "F(x)" : "f(x)", angle: -90, position: "insideLeft", fill: T.muted, fontSize: 12 }} />
                  <ReferenceLine x={nmu} stroke={T.pink} strokeDasharray="5 3"
                    label={{ value: `μ=${nmu}`, fill: T.pink, fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip color={color} discrete={false} />} />
                  <Area type="monotone" dataKey={showCDF ? "cdf" : "pdf"}
                    stroke={color} strokeWidth={2.5}
                    fill={showCDF ? "none" : "url(#normalGrad)"}
                    name={showCDF ? "F(x)" : "f(x)"} dot={false} />
                </AreaChart>
              )}
            </ResponsiveContainer>

            {/* Info al hacer click */}
            {highlightK !== null && isDiscrete && (() => {
              const d = distData.find(x => x.k === highlightK);
              return d ? (
                <div style={{ marginTop: 12, padding: "13px 16px", borderRadius: 12, background: `${T.yellow}12`, border: `1.5px solid ${T.yellow}35`, display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <div>
                    <p style={{ color: T.muted, fontSize: 11 }}>P(X = {highlightK})</p>
                    <p style={{ color: T.yellow, fontWeight: 900, fontSize: 20, fontFamily: "Georgia,serif" }}>{(d.prob * 100).toFixed(4)}%</p>
                  </div>
                  <div>
                    <p style={{ color: T.muted, fontSize: 11 }}>F({highlightK}) = P(X ≤ {highlightK})</p>
                    <p style={{ color: T.poisson, fontWeight: 900, fontSize: 20, fontFamily: "Georgia,serif" }}>{(d.cdf * 100).toFixed(4)}%</p>
                  </div>
                  <div>
                    <p style={{ color: T.muted, fontSize: 11 }}>P(X ≥ {highlightK})</p>
                    <p style={{ color: T.normal, fontWeight: 900, fontSize: 20, fontFamily: "Georgia,serif" }}>{((1 - (distData.find(x => x.k === highlightK - 1)?.cdf || 0)) * 100).toFixed(4)}%</p>
                  </div>
                </div>
              ) : null;
            })()}
          </Panel>

          {/* Regla 68-95-99.7 para Normal */}
          {dist === "normal" && (
            <Panel color={T.normal} style={{ padding: 20 }}>
              <h4 style={{ color: T.white, fontWeight: 900, fontSize: 14, marginBottom: 14 }}>📏 Regla 68-95-99.7 (Empírica)</h4>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { label: "±1σ", pct: "68.27%", range: `[${(nmu - nsigma).toFixed(1)}, ${(nmu + nsigma).toFixed(1)}]`, color: T.normal },
                  { label: "±2σ", pct: "95.45%", range: `[${(nmu - 2 * nsigma).toFixed(1)}, ${(nmu + 2 * nsigma).toFixed(1)}]`, color: T.yellow },
                  { label: "±3σ", pct: "99.73%", range: `[${(nmu - 3 * nsigma).toFixed(1)}, ${(nmu + 3 * nsigma).toFixed(1)}]`, color: T.pink },
                ].map(r => (
                  <div key={r.label} style={{ flex: 1, padding: "12px", borderRadius: 12, background: `${r.color}10`, border: `1px solid ${r.color}25`, textAlign: "center" }}>
                    <p style={{ color: r.color, fontWeight: 900, fontSize: 14 }}>{r.label}</p>
                    <p style={{ color: T.white, fontWeight: 900, fontSize: 18 }}>{r.pct}</p>
                    <p style={{ color: T.muted, fontSize: 10, fontFamily: "monospace" }}>{r.range}</p>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Tabla de valores */}
          {isDiscrete && distData.length <= 25 && (
            <Panel color={color} style={{ padding: 20 }}>
              <h4 style={{ color: T.white, fontWeight: 900, fontSize: 14, marginBottom: 12 }}>📋 Tabla de Distribución</h4>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 3px" }}>
                  <thead>
                    <tr>
                      {["k", "P(X=k)", "F(k)=P(X≤k)", "k·P(X=k)"].map((h, i) => (
                        <th key={i} style={{ padding: "6px 12px", color: T.muted, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "center" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {distData.map(d => (
                      <tr key={d.k} onClick={() => setHighlightK(highlightK === d.k ? null : d.k)} style={{ cursor: "pointer" }}>
                        {[d.k, (d.prob * 100).toFixed(3) + "%", (d.cdf * 100).toFixed(3) + "%", (d.k * d.prob).toFixed(5)].map((val, i) => (
                          <td key={i} style={{
                            padding: "8px 12px", textAlign: "center",
                            background: highlightK === d.k ? `${color}18` : "rgba(255,255,255,0.02)",
                            color: i === 0 ? color : i === 1 ? T.white : i === 2 ? T.poisson : T.pink,
                            fontWeight: i === 0 ? 900 : 600, fontSize: 12,
                            borderRadius: i === 0 ? "7px 0 0 7px" : i === 3 ? "0 7px 7px 0" : 0,
                          }}>{val}</td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} style={{ padding: "8px 12px", textAlign: "right", color: T.muted, fontSize: 11, fontWeight: 700, background: `${T.pink}08`, borderRadius: "7px 0 0 7px" }}>E(X) =</td>
                      <td style={{ padding: "8px 12px", textAlign: "center", color: T.pink, fontWeight: 900, fontSize: 15, background: `${T.pink}08`, borderRadius: "0 7px 7px 0" }}>{stats.EX}</td>
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

// ══════════════════════════════════════════
// CASOS APLICADOS — ESCENARIOS REALES
// ══════════════════════════════════════════
const CASOS = [
  {
    id: "fabrica",
    dist: "binom",
    color: T.binom,
    emoji: "🏭",
    titulo: "Control de Calidad — Fábrica de Bombillas",
    contexto: "Una fábrica produce bombillas con tasa de defectos p = 5%. Se inspeccionan n = 20 bombillas al azar. Sea X = número de bombillas defectuosas.",
    modelo: "X ~ Binomial(n=20, p=0.05)",
    params: { n: 20, p: 0.05 },
    preguntas: [
      { text: "¿Cuál es P(X = 0)? — Ninguna defectuosa", opts: ["0.3585", "0.3774", "0.2641", "0.1887"], correct: 0, exp: "P(X=0) = (0.95)²⁰ = 0.3585 = 35.85%. Más de 1/3 de las veces el lote sale perfecto." },
      { text: "¿Cuál es P(X = 1)? — Exactamente 1 defectuosa", opts: ["0.3585", "0.3774", "0.1887", "0.0596"], correct: 1, exp: "P(X=1) = C(20,1)·0.05¹·0.95¹⁹ = 20×0.05×0.3774 = 0.3774 = 37.74%." },
      { text: "¿Cuál es P(X ≥ 2)? — Al menos 2 defectuosas", opts: ["0.2641", "0.3585", "0.7359", "0.1887"], correct: 0, exp: "P(X≥2) = 1 - P(X=0) - P(X=1) = 1 - 0.3585 - 0.3774 = 0.2641 = 26.41%." },
    ]
  },
  {
    id: "banco",
    dist: "poisson",
    color: T.poisson,
    emoji: "🏦",
    titulo: "Flujo de Clientes — Sucursal Bancaria",
    contexto: "En una sucursal bancaria llegan en promedio λ = 6 clientes por hora. Las llegadas son independientes. Sea X = clientes en la próxima hora.",
    modelo: "X ~ Poisson(λ=6)",
    params: { lambda: 6 },
    preguntas: [
      { text: "¿Cuál es P(X = 4)? — Exactamente 4 clientes", opts: ["0.1339", "0.1606", "0.2240", "0.0892"], correct: 0, exp: "P(X=4) = e⁻⁶·6⁴/4! = 0.0025×1296/24 = 0.1339 = 13.39%." },
      { text: "¿Cuál es P(X ≤ 2)? — A lo más 2 clientes", opts: ["0.1912", "0.0620", "0.0446", "0.2384"], correct: 1, exp: "P(X≤2) = P(0)+P(1)+P(2) = 0.0025+0.0149+0.0446 = 0.0620 = 6.20%." },
      { text: "¿Cuál es P(X ≥ 8)? — Más de 7 clientes (saturación)", opts: ["0.1528", "0.2560", "0.3840", "0.0892"], correct: 1, exp: "P(X≥8) = 1 - F(7) = 1 - 0.7440 = 0.2560 = 25.60%. Alta chance de saturación." },
    ]
  },
  {
    id: "auditoria",
    dist: "hyper",
    color: T.hyper,
    emoji: "📦",
    titulo: "Auditoría de Inventario — Control de Lote",
    contexto: "Un lote de N=200 bombillas contiene K=10 defectuosas. Se inspeccionan n=15 sin reemplazo. Sea X = defectuosas en la muestra.",
    modelo: "X ~ Hipergeométrica(N=200, K=10, n=15)",
    params: { N: 200, K: 10, n: 15 },
    preguntas: [
      { text: "¿Cuál es P(X = 2)? — Exactamente 2 defectuosas", opts: ["0.1365", "0.3835", "0.4500", "0.0238"], correct: 0, exp: "P(X=2) = C(10,2)·C(190,13)/C(200,15) ≈ 0.1365 = 13.65%." },
      { text: "¿Cuál es P(X = 0)? — Ninguna defectuosa", opts: ["0.1365", "0.3835", "0.4500", "0.9701"], correct: 2, exp: "P(X=0) = C(10,0)·C(190,15)/C(200,15) ≈ 0.4500 = 45.00%." },
      { text: "¿Cuál es P(X ≤ 2)?", opts: ["0.9701", "0.8335", "0.5865", "0.1365"], correct: 0, exp: "P(X≤2) = P(0)+P(1)+P(2) ≈ 0.4500+0.3835+0.1365 = 0.9701 = 97.01%." },
    ]
  },
  {
    id: "embotelladora",
    dist: "normal",
    color: T.normal,
    emoji: "🍶",
    titulo: "Máquina Embotelladora — Control de Volumen",
    contexto: "Una máquina llena botellas con μ = 500 ml y σ = 4 ml. El volumen sigue distribución Normal. Probabilidades de llenado.",
    modelo: "X ~ Normal(μ=500, σ=4)",
    params: { mu: 500, sigma: 4 },
    preguntas: [
      { text: "¿Cuál es P(X < 495)? — Menos de 495 ml (quejas)", opts: ["0.1056", "0.2266", "0.0228", "0.3085"], correct: 0, exp: "z = (495-500)/4 = -1.25 → P(X<495) = 0.1056 = 10.56%." },
      { text: "¿Cuál es P(X > 508)? — Más de 508 ml (desperdicio)", opts: ["0.1056", "0.0228", "0.2266", "0.0062"], correct: 1, exp: "z = (508-500)/4 = 2 → P(X>508) = 1-Φ(2) = 0.0228 = 2.28%." },
      { text: "¿Cuál es P(498 < X < 502)? — Rango ideal", opts: ["0.1915", "0.3829", "0.6827", "0.2417"], correct: 1, exp: "P(498<X<502): zₗ=(498-500)/4=-0.5, zᵤ=(502-500)/4=0.5. P = Φ(0.5)-Φ(-0.5) = 0.3829 = 38.29%." },
    ]
  },
];

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
  { dist: "poisson", q: "En Poisson, si λ=4, ¿cuál es σ (desviación estándar)?", opts: ["4", "2", "16", "√4 = 2"], correct: 3, exp: "σ = √Var(X) = √λ = √4 = 2. La desviación estándar es la raíz cuadrada de λ." },
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
// TABS
// ══════════════════════════════════════════
const TABS = [
  { id: "intro", label: "Introducción", icon: <BookOpen style={{ width: 14, height: 14 }} /> },
  { id: "calc", label: "Calculadora", icon: <Calculator style={{ width: 14, height: 14 }} /> },
  { id: "casos", label: "Casos Reales", icon: <FlaskConical style={{ width: 14, height: 14 }} /> },
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
        {activeTab === "casos" && <TabCasos onComplete={handleCasoComplete} />}
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