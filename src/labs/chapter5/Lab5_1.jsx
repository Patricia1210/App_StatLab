// ════════════════════════════════════════════════════════
// LAB 5.1 v2 — PARTE 1 DE 4


// ════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  ArrowLeft, Brain, Info, Eye, RotateCcw, CheckCircle, XCircle,
  Zap, TrendingUp, Activity, BookOpen, BarChart2, Coins,
  ChevronRight, ChevronLeft, Layers, Sigma, RefreshCw,
  Award, Heart, AlertCircle, Stethoscope, Calculator, Star, Trophy, Target
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, LineChart, Line, Area, AreaChart, ReferenceLine, Cell
} from "recharts";

// ─────────────────────────────────────────────
// COLORES
// ─────────────────────────────────────────────
const V = "#8b5cf6";
const C = "#06b6d4";
const A = "#f59e0b";
const G = "#10b981";
const R = "#ef4444";
const P = "#ec4899";

// ─────────────────────────────────────────────
// LOGO CAP 5 — tamaño correcto según contexto
// ─────────────────────────────────────────────
const Cap5Logo = ({ size = 44, animate = false }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
    style={animate ? { animation: "logoPulse 3s ease-in-out infinite" } : {}}>
    <defs>
      <linearGradient id="lg5" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7c3aed" /><stop offset="1" stopColor="#4f46e5" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="12" fill="url(#lg5)" />
    <circle cx="24" cy="26" r="12" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
    <path d="M24 26 L24 14 A12 12 0 0 1 36 26 Z" fill="rgba(255,255,255,0.9)" />
    <path d="M24 26 L36 26 A12 12 0 0 1 14.4 32 Z" fill="rgba(255,255,255,0.5)" />
    <path d="M24 26 L14.4 32 A12 12 0 0 1 24 14 Z" fill="rgba(255,255,255,0.3)" />
    <rect x="11" y="10" width="3" height="6" rx="1" fill="rgba(255,255,255,0.8)" />
    <rect x="15" y="8" width="3" height="8" rx="1" fill="rgba(255,255,255,0.6)" />
    <rect x="19" y="11" width="3" height="5" rx="1" fill="rgba(255,255,255,0.4)" />
  </svg>
);

// ─────────────────────────────────────────────
// DATOS BASE
// ─────────────────────────────────────────────
const GRADE_DATA = [
  { x: 4, f: 4, fr: 0.08, Fc: 0.08 },
  { x: 5, f: 10, fr: 0.20, Fc: 0.28 },
  { x: 6, f: 12, fr: 0.24, Fc: 0.52 },
  { x: 7, f: 10, fr: 0.20, Fc: 0.72 },
  { x: 8, f: 9, fr: 0.18, Fc: 0.90 },
  { x: 9, f: 5, fr: 0.10, Fc: 1.00 },
];

// E(X) de la tabla
const EX_GRADES = GRADE_DATA.reduce((acc, r) => acc + r.x * r.fr, 0);

const generateCoinDist = (n) => {
  const binom = (n, k) => {
    let c = 1;
    for (let x = n - k + 1; x <= n; x++) c *= x;
    for (let x = 1; x <= k; x++) c /= x;
    return c;
  };
  return Array.from({ length: n + 1 }, (_, k) => ({
    x: k, prob: binom(n, k) * Math.pow(0.5, n)
  }));
};

const generateCDF = (pmf) => {
  let acc = 0;
  return pmf.map(d => { acc += d.prob; return { ...d, cdf: Math.min(acc, 1) }; });
};

const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

// ─────────────────────────────────────────────
// BLOQUES MATEMÁTICOS REUTILIZABLES
// ─────────────────────────────────────────────
const MathBox = ({ children, color = V, title }) => (
  <div style={{
    padding: "16px 20px", borderRadius: 14,
    background: `${color}10`,
    border: `1.5px solid ${color}35`,
    marginBottom: 14
  }}>
    {title && (
      <p style={{
        color, fontWeight: 900, fontSize: 11,
        textTransform: "uppercase", letterSpacing: "0.1em",
        marginBottom: 10
      }}>{title}</p>
    )}
    {children}
  </div>
);

const Formula = ({ tex, color = "white", size = 18 }) => (
  <p style={{
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: size, color, fontWeight: 700,
    textAlign: "center", padding: "8px 0", letterSpacing: "0.02em"
  }}>{tex}</p>
);

// ════════════════════════════════════════════════════════
// TAB INTRODUCCIÓN — VERSION ACADÉMICA COMPLETA
// ════════════════════════════════════════════════════════
const TabIntro = () => {
  const [highlightGrade, setHighlightGrade] = useState(null);
  const [tableView, setTableView] = useState("freq");
  const [showEX, setShowEX] = useState(false);
  const [showCDF_table, setShowCDF_table] = useState(false);

  // E(X) animado paso a paso
  const exSteps = GRADE_DATA.map(r => ({
    x: r.x, px: r.fr,
    contrib: r.x * r.fr,
    label: `${r.x} × ${r.fr.toFixed(2)}`
  }));
  const totalEX = exSteps.reduce((a, s) => a + s.contrib, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── HERO ── */}
      <div style={{
        background: `linear-gradient(135deg, ${V}18, ${C}10)`,
        border: `1px solid ${V}30`, borderRadius: 20, padding: 28,
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle,${V}08 1px,transparent 1px)`, backgroundSize: "32px 32px", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-block", padding: "4px 16px", borderRadius: 20, background: `linear-gradient(135deg,${V},${C})`, fontSize: 12, fontWeight: 900, color: "white", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
            ¿Qué es una Distribución de Probabilidad?
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "white", marginBottom: 10, lineHeight: 1.2 }}>
            Del Caos a la Predicción:<br />
            <span style={{ background: `linear-gradient(90deg,${V},${C})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              El Poder de la Probabilidad
            </span>
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, maxWidth: 680 }}>
            Una distribución de probabilidad asigna a cada posible resultado su probabilidad. Es el puente entre los{" "}
            <strong style={{ color: "white" }}>datos observados</strong> y las{" "}
            <strong style={{ color: V }}>predicciones futuras</strong>.
          </p>
        </div>
      </div>

      {/* ── PROPÓSITO: ¿Para qué me sirve esto? ── */}
      <div style={{
        background: "#111118", border: `1.5px solid ${A}30`,
        borderRadius: 20, padding: 26
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11, background: `linear-gradient(135deg,${A},#d97706)`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <Target style={{ color: "white", width: 20, height: 20 }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 900, color: "white", fontSize: 18 }}>¿Para qué me sirve esto?</h3>
            <p style={{ color: "#64748b", fontSize: 12 }}>Objetivos de aprendizaje de este laboratorio</p>
          </div>
        </div>

        {/* Pregunta motivadora */}
        <div style={{
          padding: "16px 20px", borderRadius: 14, marginBottom: 20,
          background: `linear-gradient(135deg,${V}12,${C}08)`,
          border: `1px solid ${V}25`
        }}>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, fontStyle: "italic" }}>
            Imagina que eres analista de datos y necesitas predecir cuántos productos
            fallará una máquina mañana, o cuántos clientes harán clic en un anuncio.
            ¿Cómo conviertes la incertidumbre en números útiles?
          </p>
          <p style={{ color: V, fontWeight: 800, fontSize: 14, marginTop: 10 }}>
            → La respuesta está en las distribuciones de probabilidad.
          </p>
        </div>

        {/* 3 objetivos concretos */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            {
              num: "01", icon: "🎲",
              titulo: "Identificar experimentos aleatorios",
              desc: "Distinguir cuándo un proceso depende del azar y construir su espacio muestral.",
              color: V
            },
            {
              num: "02", icon: "📊",
              titulo: "Leer una distribución de probabilidad",
              desc: "Interpretar PMF y CDF. Calcular el valor esperado E(X) de cualquier variable discreta.",
              color: C
            },
            {
              num: "03", icon: "🌐",
              titulo: "Aplicar la Binomial a casos reales",
              desc: "Usar B(n,p) para modelar éxitos en manufactura, marketing y finanzas.",
              color: A
            },
          ].map((o, i) => (
            <div key={i} style={{
              padding: "16px", borderRadius: 14,
              background: `${o.color}08`, border: `1.5px solid ${o.color}25`
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{
                  padding: "2px 8px", borderRadius: 20,
                  background: `${o.color}25`, color: o.color,
                  fontWeight: 900, fontSize: 10, fontFamily: "monospace"
                }}>{o.num}</span>
                <span style={{ fontSize: 18 }}>{o.icon}</span>
              </div>
              <p style={{ color: "white", fontWeight: 900, fontSize: 13, marginBottom: 6 }}>{o.titulo}</p>
              <p style={{ color: "#64748b", fontSize: 12, lineHeight: 1.6 }}>{o.desc}</p>
            </div>
          ))}
        </div>

        {/* Lo que NO cubre este lab */}
        <div style={{
          padding: "12px 16px", borderRadius: 12,
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "flex-start", gap: 10
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>🗺️</span>
          <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.7 }}>
            <strong style={{ color: "#94a3b8" }}>Dónde estamos:</strong> Este lab cubre los
            <strong style={{ color: "white" }}> fundamentos teóricos</strong> — el "lenguaje" de la probabilidad.
            En el <strong style={{ color: V }}>Lab 5.2</strong> usarás estos conceptos para dominar
            distribuciones discretas formales: Binomial, Poisson e Hipergeométrica.
          </p>
        </div>
      </div>

      {/* ── BLOQUE 1: VARIABLE ALEATORIA — DEFINICIÓN FORMAL ── */}
      <div style={{ background: "#111118", border: `1px solid ${V}25`, borderRadius: 20, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: `linear-gradient(135deg,${V},#4f46e5)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Sigma style={{ color: "white", width: 20, height: 20 }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 900, color: "white", fontSize: 18 }}>Variable Aleatoria Discreta</h3>
            <p style={{ color: "#64748b", fontSize: 12 }}>Definición formal — nivel universitario</p>
          </div>
        </div>

        <MathBox color={V} title="Definición matemática">
          <p style={{ color: "#e2e8f0", fontSize: 13, lineHeight: 1.8, marginBottom: 10 }}>
            Una <strong style={{ color: V }}>variable aleatoria discreta X</strong> es una función que asigna
            un <strong style={{ color: "white" }}>número real</strong> a cada resultado del espacio muestral S:
          </p>
          <Formula tex="X : S → ℝ" color={V} size={20} />
          <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7, marginTop: 10 }}>
            El conjunto de valores posibles de X se llama <strong style={{ color: "white" }}>dominio</strong> o
            <strong style={{ color: "white" }}> soporte</strong> de la distribución. Para que sea discreta,
            el dominio debe ser <strong style={{ color: V }}>finito o infinito numerable</strong>.
          </p>
        </MathBox>

        {/* Ejemplo concreto */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ color: "#64748b", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Ejemplo: 1 Moneda
            </p>
            <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 2, color: "#94a3b8" }}>
              <span style={{ color: "#475569" }}>// Espacio muestral:</span><br />
              S = &#123;Cruz, Cara&#125;<br />
              <span style={{ color: "#475569" }}>// Variable aleatoria X:</span><br />
              X(Cruz) = <span style={{ color: A }}>0</span><br />
              X(Cara) = <span style={{ color: A }}>1</span><br />
              <span style={{ color: "#475569" }}>// Dominio:</span><br />
              <span style={{ color: G }}>D(X) = &#123;0, 1&#125;</span>
            </div>
          </div>
          <div style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ color: "#64748b", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Ejemplo: Calificación alumno
            </p>
            <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 2, color: "#94a3b8" }}>
              <span style={{ color: "#475569" }}>// Variable aleatoria X:</span><br />
              X = calificación obtenida<br />
              <span style={{ color: "#475569" }}>// Dominio:</span><br />
              <span style={{ color: G }}>D(X) = &#123;4, 5, 6, 7, 8, 9&#125;</span><br />
              <span style={{ color: "#475569" }}>// Tipo:</span><br />
              <span style={{ color: C }}>Discreta (enteros)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BLOQUE 2: PMF — DEFINICIÓN FORMAL ── */}
      <div style={{ background: "#111118", border: `1px solid ${C}25`, borderRadius: 20, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: `linear-gradient(135deg,${C},#0891b2)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BarChart2 style={{ color: "white", width: 20, height: 20 }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 900, color: "white", fontSize: 18 }}>Función de Masa de Probabilidad (PMF)</h3>
            <p style={{ color: "#64748b", fontSize: 12 }}>Probability Mass Function — Definición formal</p>
          </div>
        </div>

        <MathBox color={C} title="Definición">
          <p style={{ color: "#e2e8f0", fontSize: 13, lineHeight: 1.8, marginBottom: 8 }}>
            La <strong style={{ color: C }}>PMF</strong> de una variable aleatoria discreta X es la función
            que asigna a cada valor <em>x</em> su probabilidad:
          </p>
          <Formula tex="f(x) = P(X = x),   x ∈ D(X)" color={C} size={17} />
        </MathBox>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <MathBox color={G} title="Condición 1 — No negatividad">
            <Formula tex="f(x) = P(X = x) ≥ 0" color={G} size={15} />
            <p style={{ color: "#94a3b8", fontSize: 12, textAlign: "center" }}>Toda probabilidad es ≥ 0</p>
          </MathBox>
          <MathBox color={A} title="Condición 2 — Normalización">
            <Formula tex="Σ P(X = x) = 1" color={A} size={15} />
            <p style={{ color: "#94a3b8", fontSize: 12, textAlign: "center" }}>La suma de todas las probabilidades es 1</p>
          </MathBox>
        </div>

        <div style={{ padding: "12px 16px", borderRadius: 12, background: `${V}08`, border: `1px solid ${V}20` }}>
          <p style={{ color: "#a78bfa", fontSize: 13, fontWeight: 600 }}>
            💡 <strong>Verificación:</strong> Para ser válida una distribución,{" "}
            <strong>TODA</strong> función de masa debe satisfacer ambas condiciones simultáneamente.
            Si alguna probabilidad es negativa, o si la suma ≠ 1, <strong style={{ color: R }}>no es una distribución válida</strong>.
          </p>
        </div>
      </div>

      {/* ── BLOQUE 3: CDF — DEFINICIÓN FORMAL ── */}
      <div style={{ background: "#111118", border: `1px solid ${A}25`, borderRadius: 20, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: `linear-gradient(135deg,${A},#d97706)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TrendingUp style={{ color: "white", width: 20, height: 20 }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 900, color: "white", fontSize: 18 }}>Función de Distribución Acumulada (CDF)</h3>
            <p style={{ color: "#64748b", fontSize: 12 }}>Cumulative Distribution Function — Definición formal</p>
          </div>
        </div>

        <MathBox color={A} title="Definición">
          <p style={{ color: "#e2e8f0", fontSize: 13, lineHeight: 1.8, marginBottom: 8 }}>
            La <strong style={{ color: A }}>CDF</strong> da la probabilidad de que X tome un valor
            <strong style={{ color: "white" }}> menor o igual</strong> a un valor dado <em>x</em>:
          </p>
          <Formula tex="F(x) = P(X ≤ x) = Σ P(X = k)" color={A} size={16} />
          <p style={{ color: "#64748b", fontSize: 12, textAlign: "center", marginTop: 4 }}>donde la suma es sobre todos los k ≤ x en D(X)</p>
        </MathBox>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            { prop: "No decreciente", formula: "F(x₁) ≤ F(x₂) si x₁ < x₂", color: C },
            { prop: "Límite inferior", formula: "F(-∞) = 0", color: V },
            { prop: "Límite superior", formula: "F(+∞) = 1", color: G },
          ].map((p, i) => (
            <div key={i} style={{ padding: "14px", borderRadius: 12, background: `${p.color}10`, border: `1px solid ${p.color}25`, textAlign: "center" }}>
              <p style={{ color: p.color, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{p.prop}</p>
              <p style={{ fontFamily: "Georgia,serif", fontSize: 15, color: "white", fontWeight: 700 }}>{p.formula}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── BLOQUE 4: TABLA — DISTRIBUCIÓN EMPÍRICA ── */}
      <div style={{ background: "#111118", border: `1px solid ${V}20`, borderRadius: 22, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
          <div>
            <h3 style={{ fontWeight: 900, color: "white", fontSize: 18 }}>📊 Tabla de 50 Alumnos</h3>
            <p style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>Haz clic en una fila para explorar la CDF</p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["freq", "FREC."], ["pmf", "P(X=X)"], ["cdf", "F(X)"], ["ex", "X·P"]].map(([v, label]) => (
              <button key={v} onClick={() => setTableView(v)} style={{
                padding: "7px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em",
                background: tableView === v ? V : `${V}12`,
                color: tableView === v ? "white" : V,
                transition: "all 0.2s",
                boxShadow: tableView === v ? `0 3px 10px ${V}40` : "none"
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* ⭐ FRASE CLAVE: distribución empírica */}
        <div style={{
          padding: "12px 18px", borderRadius: 12, marginBottom: 20,
          background: `linear-gradient(135deg,${G}15,${C}10)`,
          border: `1.5px solid ${G}40`,
          display: "flex", alignItems: "flex-start", gap: 10
        }}>
          <CheckCircle style={{ color: G, width: 18, height: 18, flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ color: G, fontWeight: 900, fontSize: 14, marginBottom: 4 }}>
              Esta tabla ya ES una distribución de probabilidad empírica
            </p>
            <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>
              Cuando usamos la <strong style={{ color: "white" }}>frecuencia relativa (fr)</strong> como estimación de
              P(X = x), estamos construyendo una distribución empírica.
              Verificación: <strong style={{ color: G }}>Σ fr = {GRADE_DATA.reduce((a, r) => a + r.fr, 0).toFixed(2)} = 1 ✅</strong>
              {" "}— cumple la condición de normalización.
            </p>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 5px" }}>
            <thead>
              <tr>
                <th style={{ padding: "8px 14px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em" }}>X</th>
                <th style={{ padding: "8px 14px", textAlign: "center", color: "#64748b", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em" }}>F</th>
                {/* Col 3 cambia según tableView */}
                <th style={{ padding: "8px 14px", textAlign: "center", color: tableView === "freq" ? C : tableView === "pmf" ? V : A, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", transition: "color 0.2s" }}>
                  {tableView === "freq" ? "FR = P(X=X)" : tableView === "pmf" ? "FR = P(X=X)" : "FR = P(X=X)"}
                </th>
                <th style={{ padding: "8px 14px", textAlign: "center", color: tableView === "cdf" ? A : "#64748b", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", transition: "color 0.2s" }}>
                  F(X) = P(X≤X)
                </th>
                <th style={{ padding: "8px 14px", textAlign: "center", color: tableView === "ex" ? P : "#64748b", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", transition: "color 0.2s" }}>
                  X · P(X=X)
                </th>
              </tr>
            </thead>
            <tbody>
              {GRADE_DATA.map(row => {
                const isHL = highlightGrade === row.x, isCum = highlightGrade !== null && row.x <= highlightGrade;
                const contrib = row.x * row.fr;
                const bg = isHL ? `${V}20` : isCum ? `${V}08` : "rgba(255,255,255,0.02)";
                return (
                  <tr key={row.x} onClick={() => setHighlightGrade(highlightGrade === row.x ? null : row.x)} style={{ cursor: "pointer" }}>
                    {/* X */}
                    <td style={{ padding: "10px 14px", background: bg, borderLeft: `3px solid ${isHL ? V : isCum ? `${V}60` : "transparent"}`, borderRadius: "8px 0 0 8px", fontWeight: 900, color: isHL ? V : "white", fontSize: 15 }}>{row.x}</td>
                    {/* f — siempre visible */}
                    <td style={{ padding: "10px 14px", textAlign: "center", background: bg, color: "#e2e8f0", fontWeight: 700 }}>{row.f}</td>
                    {/* fr — siempre visible, se resalta en modo freq/pmf */}
                    <td style={{
                      padding: "10px 14px", textAlign: "center", background: bg,
                      color: tableView === "freq" || tableView === "pmf" ? C : "#64748b",
                      fontWeight: tableView === "freq" || tableView === "pmf" ? 900 : 600,
                      fontSize: tableView === "freq" || tableView === "pmf" ? 15 : 13,
                      transition: "all 0.2s"
                    }}>{row.fr.toFixed(2)}</td>
                    {/* F(x) CDF — se resalta en modo cdf */}
                    <td style={{
                      padding: "10px 14px", textAlign: "center", background: bg,
                      color: tableView === "cdf" ? (isHL ? A : "#e2e8f0") : "#64748b",
                      fontWeight: tableView === "cdf" ? (isHL ? 900 : 700) : 500,
                      fontSize: tableView === "cdf" && isHL ? 16 : 13,
                      transition: "all 0.2s"
                    }}>
                      {row.Fc.toFixed(2)}{tableView === "cdf" && isHL && <span style={{ marginLeft: 6, fontSize: 11, color: A }}>← F({row.x})</span>}
                    </td>
                    {/* x·P(X=x) — se resalta en modo ex */}
                    <td style={{
                      padding: "10px 14px", textAlign: "center", background: bg, borderRadius: "0 8px 8px 0",
                      color: tableView === "ex" ? P : "#64748b",
                      fontWeight: tableView === "ex" ? 800 : 500,
                      fontFamily: "monospace",
                      fontSize: tableView === "ex" ? 14 : 12,
                      transition: "all 0.2s"
                    }}>{contrib.toFixed(3)}</td>
                  </tr>
                );
              })}
              {/* Fila de totales */}
              <tr>
                <td style={{ padding: "10px 14px", background: `${V}08`, borderLeft: `3px solid ${V}40`, borderRadius: "8px 0 0 8px", color: "#64748b", fontWeight: 900, fontSize: 12 }}>TOTAL</td>
                <td style={{ padding: "10px 14px", textAlign: "center", background: `${V}08`, color: "white", fontWeight: 900 }}>50</td>
                <td style={{ padding: "10px 14px", textAlign: "center", background: `${V}08`, color: G, fontWeight: 900 }}>1.00 ✅</td>
                <td style={{ padding: "10px 14px", textAlign: "center", background: `${V}08`, color: "#64748b", fontSize: 11 }}>—</td>
                <td style={{ padding: "10px 14px", textAlign: "center", background: `${V}08`, borderRadius: "0 8px 8px 0", color: P, fontWeight: 900 }}>{totalEX.toFixed(3)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {highlightGrade && (
          <div style={{ marginTop: 14, padding: "14px 18px", background: `linear-gradient(135deg,${A}15,${V}15)`, border: `1px solid ${A}40`, borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <Zap style={{ color: A, width: 18, height: 18, flexShrink: 0 }} />
            <p style={{ color: "#e2e8f0", fontSize: 14, margin: 0 }}>
              <strong style={{ color: A }}>F({highlightGrade}) = P(X ≤ {highlightGrade}) = {GRADE_DATA.find(r => r.x === highlightGrade)?.Fc.toFixed(2)}</strong>
              {" "}— El <strong style={{ color: "white" }}>{(GRADE_DATA.find(r => r.x === highlightGrade)?.Fc * 100).toFixed(0)}%</strong> de los alumnos obtuvo <strong style={{ color: V }}>{highlightGrade} o menos</strong>.
            </p>
          </div>
        )}

        {/* VALOR ESPERADO calculado desde la tabla */}
        <div style={{ marginTop: 18, padding: "16px 20px", borderRadius: 14, background: `${P}10`, border: `1.5px solid ${P}30` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ color: P, fontWeight: 900, fontSize: 15 }}>📐 Valor Esperado E(X) de esta distribución</p>
            <button onClick={() => setShowEX(s => !s)} style={{ padding: "6px 14px", borderRadius: 10, border: `1px solid ${P}40`, background: `${P}15`, color: P, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
              {showEX ? "Ocultar pasos" : "Ver cálculo paso a paso"}
            </button>
          </div>
          <Formula tex={`E(X) = Σ x · P(X=x) = ${totalEX.toFixed(3)}`} color={P} size={18} />
          <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", marginTop: 6 }}>
            La calificación promedio esperada de un alumno elegido al azar es <strong style={{ color: P }}>{totalEX.toFixed(2)}</strong>.
          </p>
          {showEX && (
            <div style={{ marginTop: 14, overflowX: "auto" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {exSteps.map((s, i) => (
                  <div key={i} style={{ padding: "8px 14px", borderRadius: 10, background: `${P}15`, border: `1px solid ${P}25`, textAlign: "center", minWidth: 90 }}>
                    <p style={{ color: "#64748b", fontSize: 10, fontWeight: 700 }}>x = {s.x}</p>
                    <p style={{ color: P, fontSize: 13, fontFamily: "monospace", fontWeight: 700 }}>{s.label}</p>
                    <p style={{ color: "white", fontSize: 13, fontWeight: 900 }}>= {s.contrib.toFixed(3)}</p>
                  </div>
                ))}
                <div style={{ padding: "8px 14px", borderRadius: 10, background: `${G}20`, border: `1.5px solid ${G}40`, textAlign: "center", minWidth: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div>
                    <p style={{ color: "#64748b", fontSize: 10, fontWeight: 700 }}>E(X) =</p>
                    <p style={{ color: G, fontSize: 18, fontWeight: 900 }}>{totalEX.toFixed(3)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BLOQUE 5: MONEDA → BINOMIAL EXPLÍCITO ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div style={{ background: "#111118", border: `1px solid ${C}25`, borderRadius: 20, padding: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Coins style={{ color: C, width: 22, height: 22 }} />
            <h3 style={{ fontWeight: 900, color: "white", fontSize: 17 }}>Variable Binaria: la Moneda</h3>
          </div>
          <div style={{ marginBottom: 14, padding: "8px 12px", borderRadius: 10, background: `${C}10`, border: `1px solid ${C}25` }}>
            <p style={{ color: C, fontSize: 12, fontWeight: 700 }}>Distribución de Bernoulli — caso especial</p>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 2.2, color: "#94a3b8", marginBottom: 16 }}>
            <span style={{ color: "#475569" }}>// Variable aleatoria X:</span><br />
            X(Cruz) = <span style={{ color: A }}>0</span> &nbsp;<span style={{ color: "#475569" }}>(fracaso)</span><br />
            X(Cara) = <span style={{ color: A }}>1</span> &nbsp;<span style={{ color: "#475569" }}>(éxito)</span><br />
            <span style={{ color: "#475569" }}>// PMF:</span><br />
            P(X=0) = <span style={{ color: G }}>0.5</span><br />
            P(X=1) = <span style={{ color: G }}>0.5</span><br />
            <span style={{ color: "#475569" }}>// E(X):</span><br />
            <span style={{ color: P }}>E(X) = 0×0.5 + 1×0.5 = 0.5</span>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
            <p style={{ color: "#64748b", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Aplicaciones reales:</p>
            {["Compra / No compra (Marketing)", "Defectuoso / No defectuoso (Manufactura)", "Fraude / Legítimo (Finanzas)"].map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: C, flexShrink: 0 }} />
                <span style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 600 }}>{a}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2 monedas → Binomial B(2, 0.5) */}
        <div style={{ background: "#111118", border: `1px solid ${V}25`, borderRadius: 20, padding: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Activity style={{ color: V, width: 22, height: 22 }} />
            <h3 style={{ fontWeight: 900, color: "white", fontSize: 17 }}>2 Monedas → Distribución Binomial</h3>
          </div>

          {/* ⭐ FRASE CLAVE: Binomial */}
          <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 11, background: `linear-gradient(135deg,${V}15,${C}10)`, border: `1.5px solid ${V}40` }}>
            <p style={{ color: "white", fontWeight: 900, fontSize: 13, marginBottom: 4 }}>
              🎯 Esto ya es una <strong style={{ color: V }}>Distribución Binomial B(n=2, p=0.5)</strong>
            </p>
            <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>
              X = número de caras en 2 lanzamientos. Es el caso más simple de la distribución que estudiaremos en el Lab 5.2.
            </p>
          </div>

          {[{ result: "(Cara, Cara)", x: 2, calc: "C(2,2)·0.5²=0.25" }, { result: "(Cara, Cruz)", x: 1, calc: "↗" }, { result: "(Cruz, Cara)", x: 1, calc: "C(2,1)·0.5²=0.50" }, { result: "(Cruz, Cruz)", x: 0, calc: "C(2,0)·0.5²=0.25" }].map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 13px", borderRadius: 10, marginBottom: 7, background: r.x === 1 ? `${V}12` : "rgba(255,255,255,0.03)", border: `1px solid ${r.x === 1 ? `${V}30` : "rgba(255,255,255,0.06)"}` }}>
              <span style={{ color: "#94a3b8", fontSize: 13, fontFamily: "monospace" }}>{r.result}</span>
              <span style={{ color: V, fontWeight: 700, fontSize: 13 }}>X={r.x}</span>
              <span style={{ color: "#475569", fontSize: 11, fontFamily: "monospace" }}>{r.calc}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: "10px 14px", background: `${G}12`, border: `1px solid ${G}30`, borderRadius: 10 }}>
            <p style={{ color: G, fontSize: 13, fontWeight: 700 }}>E(X) = n·p = 2 × 0.5 = <strong>1.0</strong> cara esperada ✅</p>
          </div>
        </div>
      </div>

      {/* ── BLOQUE 6: RESUMEN 3 AXIOMAS + FORMALIDAD ── */}
      <div style={{ background: `linear-gradient(135deg,${G}08,${V}08)`, border: `1px solid ${G}25`, borderRadius: 20, padding: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <BookOpen style={{ color: G, width: 22, height: 22 }} />
          <h4 style={{ fontWeight: 900, color: "white", fontSize: 18 }}>Marco Formal: Todo junto</h4>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {[
            { label: "VARIABLE ALEATORIA", body: "X : S → ℝ\nAsigna números a eventos.\nD(X) = soporte.", color: V },
            { label: "PMF — f(x)", body: "f(x) = P(X=x) ≥ 0\nΣ P(X=x) = 1\nDominio explícito.", color: C },
            { label: "CDF — F(x)", body: "F(x) = P(X ≤ x)\nNo decreciente.\nF(+∞) = 1.", color: A },
            { label: "VALOR ESPERADO", body: "E(X) = Σ x·P(X=x)\nCentro de gravedad\nde la distribución.", color: P },
            { label: "DATOS → EMPIRICA", body: "fr = f/n → P(X=x)\nΣ fr = 1 ✅\nCon n→∞ converge.", color: G },
            { label: "DISTRIBUCIÓN BINOMIAL", body: "X ~ B(n, p)\nP(X=k) = C(n,k)·pᵏ·(1-p)ⁿ⁻ᵏ\nE(X) = n·p", color: R },
          ].map((item, i) => (
            <div key={i} style={{ padding: "16px 18px", background: `${item.color}10`, border: `1px solid ${item.color}25`, borderRadius: 14 }}>
              <p style={{ color: item.color, fontWeight: 900, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{item.label}</p>
              {item.body.split("\n").map((line, j) => (
                <p key={j} style={{ color: j === 0 ? "white" : "#94a3b8", fontSize: j === 0 ? 13 : 12, fontFamily: j === 0 ? "Georgia,serif" : "inherit", fontWeight: j === 0 ? 700 : 400, lineHeight: 1.7 }}>{line}</p>
              ))}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

const TabExplorer = () => {
  const [numCoins, setNumCoins] = useState(2);
  const [showCDF, setShowCDF] = useState(false);
  const [highlightX, setHighlightX] = useState(null);
  const [showFormula, setShowFormula] = useState(false);

  const pmfData = useMemo(() => generateCoinDist(numCoins), [numCoins]);
  const cdfData = useMemo(() => generateCDF(pmfData), [pmfData]);

  // Cálculo de E(X) y Varianza para n monedas
  const EX = numCoins * 0.5;
  const VarX = numCoins * 0.5 * 0.5;
  const sdX = Math.sqrt(VarX);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${V}12,${C}08)`, border: `1px solid ${V}25`, borderRadius: 20, padding: 26, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 54, height: 54, borderRadius: 15, background: `linear-gradient(135deg,${V},${C})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <BarChart2 style={{ color: "white", width: 26, height: 26 }} />
        </div>
        <div>
          <h2 style={{ fontWeight: 900, color: "white", fontSize: 20, marginBottom: 4 }}>Visualizador de Distribuciones</h2>
          <p style={{ color: "#64748b", fontSize: 13 }}>
            Cada configuración es una <strong style={{ color: "white" }}>B(n, 0.5)</strong>. Con n grande la PMF converge a la campana normal.
          </p>
        </div>
      </div>

      {/* Controles */}
      <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: 22, display: "flex", flexWrap: "wrap", gap: 22, alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <label style={{ color: "#64748b", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 10 }}>
            n = Número de Monedas:&nbsp;<span style={{ color: V, fontSize: 18 }}>{numCoins}</span>
            &nbsp;<span style={{ color: "#475569", fontSize: 11 }}>→ X ~ B({numCoins}, 0.5)</span>
          </label>
          <input type="range" min={1} max={20} value={numCoins}
            onChange={e => { setNumCoins(+e.target.value); setHighlightX(null); }}
            style={{ width: "100%", accentColor: V, cursor: "pointer" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ color: "#475569", fontSize: 11 }}>n = 1</span>
            <span style={{ color: "#475569", fontSize: 11 }}>n = 20</span>
          </div>
        </div>

        {/* Métricas en vivo */}
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: "E(X)", val: `${EX.toFixed(2)}`, color: P, tip: "n·p" },
            { label: "Var(X)", val: `${VarX.toFixed(2)}`, color: A, tip: "n·p·(1-p)" },
            { label: "σ(X)", val: `${sdX.toFixed(3)}`, color: C, tip: "√Var(X)" },
          ].map(m => (
            <div key={m.label} style={{ padding: "10px 16px", borderRadius: 12, background: `${m.color}12`, border: `1px solid ${m.color}30`, textAlign: "center", minWidth: 80 }}>
              <p style={{ color: "#64748b", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{m.label}</p>
              <p style={{ color: m.color, fontWeight: 900, fontSize: 18, fontFamily: "Georgia,serif" }}>{m.val}</p>
              <p style={{ color: "#475569", fontSize: 10, fontFamily: "monospace" }}>{m.tip}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {[["PMF", false], ["CDF", true]].map(([label, val]) => (
            <button key={label} onClick={() => setShowCDF(val)} style={{
              padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13,
              background: showCDF === val ? (val ? `linear-gradient(135deg,${C},#0891b2)` : `linear-gradient(135deg,${V},#4f46e5)`) : (val ? `${C}10` : `${V}10`),
              color: showCDF === val ? "white" : (val ? C : V),
              boxShadow: showCDF === val ? `0 4px 14px ${val ? C : V}40` : "none", transition: "all 0.2s"
            }}>{label}</button>
          ))}
          <button onClick={() => { setNumCoins(2); setShowCDF(false); setHighlightX(null); }} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <RefreshCw style={{ width: 13, height: 13 }} /><span style={{ fontSize: 12, fontWeight: 700 }}>Reset</span>
          </button>
        </div>
      </div>

      {/* Fórmula Binomial desplegable */}
      <div style={{ background: "#111118", border: `1px solid ${V}20`, borderRadius: 16, padding: "16px 22px" }}>
        <button onClick={() => setShowFormula(s => !s)} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: `${V}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Calculator style={{ color: V, width: 14, height: 14 }} />
          </div>
          <span style={{ color: V, fontWeight: 800, fontSize: 14 }}>Fórmula Binomial B(n={numCoins}, p=0.5)</span>
          <span style={{ color: "#475569", fontSize: 12, marginLeft: "auto" }}>{showFormula ? "▲ Ocultar" : "▼ Ver fórmula"}</span>
        </button>
        {showFormula && (
          <div style={{ marginTop: 16, padding: "16px 20px", borderRadius: 12, background: `${V}08`, border: `1px solid ${V}20` }}>
            <p style={{ fontFamily: "Georgia,serif", fontSize: 18, color: "white", fontWeight: 700, textAlign: "center", marginBottom: 12 }}>
              P(X = k) = C({numCoins}, k) · (0.5)ᵏ · (0.5)^({numCoins}−k)
            </p>
            <p style={{ fontFamily: "Georgia,serif", fontSize: 16, color: C, textAlign: "center", marginBottom: 16 }}>
              = C({numCoins}, k) · (0.5)^{numCoins}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {pmfData.slice(0, Math.min(pmfData.length, 8)).map((d, i) => (
                <div key={i} style={{ padding: "8px 14px", borderRadius: 10, background: `${V}15`, border: `1px solid ${V}25`, textAlign: "center", minWidth: 80 }}>
                  <p style={{ color: "#64748b", fontSize: 10, fontWeight: 700 }}>k = {d.x}</p>
                  <p style={{ color: V, fontSize: 13, fontWeight: 900 }}>{(d.prob * 100).toFixed(2)}%</p>
                </div>
              ))}
              {pmfData.length > 8 && <div style={{ padding: "8px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center" }}><span style={{ color: "#475569", fontSize: 12 }}>+{pmfData.length - 8} más...</span></div>}
            </div>
          </div>
        )}
      </div>

      {/* Gráfico principal */}
      <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 26 }}>
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ color: "white", fontWeight: 900, fontSize: 16 }}>
            {showCDF ? "CDF — F(x) = P(X ≤ x)" : "PMF — f(x) = P(X = x)"}
            &nbsp;<span style={{ color: "#64748b", fontWeight: 600 }}>X ~ B({numCoins}, 0.5)</span>
          </h3>
          <p style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>
            {showCDF
              ? "La función acumulada es no decreciente y llega a F(n) = 1"
              : "Haz clic en una barra para ver la probabilidad exacta"}
          </p>
        </div>
        <ResponsiveContainer width="100%" height={310}>
          {showCDF ? (
            <AreaChart data={cdfData.map(d => ({ ...d, value: d.cdf }))} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
              <defs>
                <linearGradient id="cdfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="x" tick={{ fill: "#64748b", fontSize: 11 }} label={{ value: "X (número de caras)", position: "insideBottom", offset: -10, fill: "#94a3b8", fontWeight: 700, fontSize: 12 }} />
              <YAxis domain={[0, 1]} tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={v => (v * 100).toFixed(0) + "%"}
                label={{ value: "F(x)", angle: -90, position: "insideLeft", fill: "#94a3b8", fontWeight: 700, fontSize: 12 }} />
              <ReferenceLine y={1} stroke={G} strokeDasharray="4 4" label={{ value: "F(∞)=1", fill: G, fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: `1px solid ${C}30`, borderRadius: 10 }}
                labelStyle={{ color: "white", fontWeight: 700 }}
                formatter={v => [(v * 100).toFixed(2) + "%", "F(x) = P(X ≤ x)"]} />
              <Area type="monotone" dataKey="value" stroke={C} strokeWidth={2.5} fill="url(#cdfGrad)"
                dot={{ fill: C, r: 4 }} activeDot={{ r: 7, fill: C }} />
            </AreaChart>
          ) : (
            <BarChart data={pmfData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={V} /><stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="x" tick={{ fill: "#64748b", fontSize: 11 }} label={{ value: "X (número de caras)", position: "insideBottom", offset: -10, fill: "#94a3b8", fontWeight: 700, fontSize: 12 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }}
                label={{ value: "P(X=x)", angle: -90, position: "insideLeft", fill: "#94a3b8", fontWeight: 700, fontSize: 12 }} />
              <ReferenceLine x={EX} stroke={P} strokeDasharray="6 3"
                label={{ value: `E(X)=${EX}`, fill: P, fontSize: 11, position: "top" }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: `1px solid ${V}30`, borderRadius: 10 }}
                labelStyle={{ color: "white", fontWeight: 700 }}
                formatter={v => [(v * 100).toFixed(3) + "%", "P(X = x)"]} />
              <Bar dataKey="prob" radius={[6, 6, 0, 0]}
                onClick={d => setHighlightX(highlightX === d.x ? null : d.x)}>
                {pmfData.map((entry, i) => (
                  <Cell key={i}
                    fill={highlightX === entry.x ? A : Math.round(entry.x) === Math.round(EX) ? P : "url(#barGrad)"}
                    opacity={highlightX !== null && highlightX !== entry.x ? 0.25 : 1} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>

        {/* Panel info al hacer clic */}
        {highlightX !== null && !showCDF && (
          <div style={{ marginTop: 14, padding: "14px 18px", background: `linear-gradient(135deg,${A}15,${V}15)`, border: `1px solid ${A}35`, borderRadius: 12, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Zap style={{ color: A, width: 17, height: 17, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ color: "white", fontWeight: 900, fontSize: 14, marginBottom: 4 }}>
                P(X = {highlightX}) = {(pmfData[highlightX]?.prob * 100).toFixed(3)}%
              </p>
              <p style={{ color: "#94a3b8", fontSize: 13 }}>
                Con {numCoins} moneda{numCoins > 1 ? "s" : ""}, la probabilidad de obtener exactamente{" "}
                <strong style={{ color: V }}>{highlightX} cara{highlightX !== 1 ? "s" : ""}</strong> es{" "}
                <strong style={{ color: A }}>C({numCoins},{highlightX}) · (0.5)^{numCoins} = {(pmfData[highlightX]?.prob).toFixed(6)}</strong>
              </p>
            </div>
            {/* CDF acumulado para ese x */}
            <div style={{ padding: "10px 16px", borderRadius: 11, background: `${C}15`, border: `1px solid ${C}30`, textAlign: "center" }}>
              <p style={{ color: "#64748b", fontSize: 10, fontWeight: 700 }}>F({highlightX}) =</p>
              <p style={{ color: C, fontWeight: 900, fontSize: 18 }}>
                {(cdfData[highlightX]?.cdf * 100).toFixed(1)}%
              </p>
              <p style={{ color: "#475569", fontSize: 10 }}>P(X ≤ {highlightX})</p>
            </div>
          </div>
        )}
      </div>

      {/* Grilla de evolución */}
      <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 26 }}>
        <h3 style={{ fontWeight: 900, color: "white", fontSize: 17, marginBottom: 6 }}>🔬 Evolución: B(n, 0.5) hacia la Normal</h3>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 18 }}>
          A medida que n crece, <strong style={{ color: "white" }}>B(n, 0.5) → N(μ, σ²)</strong> por el Teorema Central del Límite. Haz clic para explorar.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {[2, 4, 8, 16, 32, 64].map(n => {
            const d = generateCoinDist(n);
            const ex = n * 0.5;
            return (
              <div key={n}
                style={{ background: numCoins === n ? `${V}12` : "rgba(255,255,255,0.02)", border: `1px solid ${numCoins === n ? `${V}50` : "rgba(255,255,255,0.06)"}`, borderRadius: 14, padding: "14px 10px", cursor: "pointer", transition: "all 0.2s" }}
                onClick={() => setNumCoins(n)}
                onMouseEnter={e => { if (numCoins !== n) { e.currentTarget.style.borderColor = `${V}40`; } }}
                onMouseLeave={e => { if (numCoins !== n) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; } }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <p style={{ color: numCoins === n ? V : "#64748b", fontSize: 11, fontWeight: 800 }}>n = {n}</p>
                  <p style={{ color: "#475569", fontSize: 10, fontFamily: "monospace" }}>E={ex}</p>
                </div>
                <ResponsiveContainer width="100%" height={76}>
                  <BarChart data={d} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                    <Bar dataKey="prob" fill={numCoins === n ? V : `${V}60`} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p style={{ color: "#475569", fontSize: 10, textAlign: "center", marginTop: 4, fontFamily: "monospace" }}>σ = {(Math.sqrt(n * 0.25)).toFixed(2)}</p>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 16, padding: "14px 18px", background: `${V}08`, border: `1px solid ${V}20`, borderRadius: 12 }}>
          <p style={{ color: "#a78bfa", fontSize: 13, margin: 0, fontWeight: 600, lineHeight: 1.7 }}>
            💡 <strong>Teorema Central del Límite:</strong> Con n → ∞, la distribución binomial converge a la Normal.
            La línea rosa en la PMF muestra E(X) = n·p — el centro de gravedad de la distribución.
            Con n = 64: E(X) = 32, σ = {(Math.sqrt(64 * 0.25)).toFixed(2)} ≈ 4.
          </p>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
// PRÁCTICA — SECCIÓN 1: EXPERIMENTO ALEATORIO
// ════════════════════════════════════════════════════════
const PracticaExperimento = ({ onScore }) => {
  const [coinResult, setCoinResult] = useState(null);
  const [diceResult, setDiceResult] = useState(null);
  const [coinHistory, setCoinHistory] = useState([]);
  const [diceHistory, setDiceHistory] = useState([]);
  const [coinFlipping, setCoinFlipping] = useState(false);
  const [diceRolling, setDiceRolling] = useState(false);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const QUESTIONS = [
    { text: "Al lanzar una moneda, ¿cuántos elementos tiene S?", opts: ["1", "2", "3", "4"], correct: 1, exp: "S = {Cara, Cruz} → |S| = 2. Cada elemento es un resultado posible." },
    { text: "¿Cuál es el dominio D(X) si X = cara en 1 lanzamiento?", opts: ["D(X) = {0}", "D(X) = {1}", "D(X) = {0,1}", "D(X) = {0,1,2}"], correct: 2, exp: "X asigna 0 (Cruz) o 1 (Cara), por lo tanto D(X) = {0, 1}." },
    { text: "¿Cuál NO es un experimento aleatorio?", opts: ["Lanzar moneda", "Calcular 5×5", "Sacar carta", "Lanzar dado"], correct: 1, exp: "5×5=25 siempre. Un experimento aleatorio tiene resultado incierto." },
    { text: "¿Qué axioma expresa que P(S) = 1?", opts: ["Axioma de Bayes", "Axioma de certeza total", "Axioma de independencia", "Axioma de complemento"], correct: 1, exp: "El Axioma 2 de Kolmogorov: la probabilidad de que ocurra algún evento del espacio muestral es 1." },
    { text: "Si X ~ Bernoulli(0.5), ¿cuánto vale E(X)?", opts: ["0", "0.25", "0.5", "1"], correct: 2, exp: "E(X) = Σ x·P(X=x) = 0×0.5 + 1×0.5 = 0.5" },
  ];

  const newQ = useCallback(() => {
    setQuestion(QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]);
    setSelected(null); setAnswered(false);
  }, []);

  useEffect(() => { newQ(); }, []);

  const handleAnswer = (i) => {
    if (answered) return;
    setSelected(i); setAnswered(true);
    const correct = i === question.correct;
    const newScore = score + (correct ? 1 : 0);
    const newTotal = totalAnswered + 1;
    setScore(newScore); setTotalAnswered(newTotal);
    if (onScore) onScore({ section: 1, score: newScore, total: newTotal });
  };

  const flipCoin = () => {
    if (coinFlipping) return; setCoinFlipping(true);
    setTimeout(() => {
      const r = Math.random() < 0.5 ? "Cara" : "Cruz";
      setCoinResult(r); setCoinHistory(h => [r, ...h].slice(0, 10)); setCoinFlipping(false);
    }, 550);
  };

  const rollDice = () => {
    if (diceRolling) return; setDiceRolling(true);
    let count = 0;
    const iv = setInterval(() => {
      setDiceResult(Math.ceil(Math.random() * 6));
      if (++count > 8) {
        clearInterval(iv);
        const final = Math.ceil(Math.random() * 6);
        setDiceResult(final); setDiceHistory(h => [final, ...h].slice(0, 10)); setDiceRolling(false);
      }
    }, 70);
  };

  const diceCounts = [1, 2, 3, 4, 5, 6].map(n => ({ n, count: diceHistory.filter(x => x === n).length }));
  const coinC = { Cara: coinHistory.filter(x => x === "Cara").length, Cruz: coinHistory.filter(x => x === "Cruz").length };
  const pEmpCara = coinHistory.length > 0 ? (coinC.Cara / coinHistory.length) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Banner sección */}
      <div style={{ background: `${V}10`, border: `1px solid ${V}30`, borderRadius: 16, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h4 style={{ color: "white", fontWeight: 900, fontSize: 16, marginBottom: 4 }}>🎲 Experimento Aleatorio</h4>
          <p style={{ color: "#64748b", fontSize: 13 }}>Simula y observa. Luego responde las preguntas formales.</p>
        </div>
        {totalAnswered > 0 && (
          <div style={{ padding: "8px 18px", borderRadius: 20, background: `${score === totalAnswered ? G : A}15`, border: `1px solid ${score === totalAnswered ? G : A}30` }}>
            <span style={{ color: score === totalAnswered ? G : A, fontWeight: 900, fontSize: 14 }}>{score}/{totalAnswered} correctas</span>
          </div>
        )}
      </div>

      {/* Simuladores */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* MONEDA */}
        <div style={{ background: "#111118", border: `1px solid ${V}20`, borderRadius: 18, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>🪙</span>
            <div>
              <h5 style={{ color: "white", fontWeight: 900, fontSize: 14 }}>Simulador de Moneda</h5>
              <p style={{ color: "#64748b", fontSize: 11 }}>X ~ Bernoulli(0.5) &nbsp;·&nbsp; D(X) = &#123;0,1&#125;</p>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div onClick={flipCoin} style={{
              width: 90, height: 90, borderRadius: "50%",
              background: coinResult ? (coinResult === "Cara" ? `linear-gradient(135deg,${A},#d97706)` : `linear-gradient(135deg,#94a3b8,#64748b)`) : "linear-gradient(135deg,#334155,#1e293b)",
              border: `4px solid ${coinResult ? (coinResult === "Cara" ? A : "#94a3b8") : "#334155"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 38, transition: "all 0.3s",
              transform: coinFlipping ? "rotateY(90deg)" : "rotateY(0deg)",
              boxShadow: coinResult ? `0 8px 28px ${coinResult === "Cara" ? A : "#94a3b8"}40` : "none", userSelect: "none"
            }}>
              {coinFlipping ? "🌀" : coinResult ? (coinResult === "Cara" ? "👑" : "🦅") : "🪙"}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            {coinResult && <p style={{ color: coinResult === "Cara" ? A : "#94a3b8", fontWeight: 900, fontSize: 18, marginBottom: 10 }}>{coinResult} (X={coinResult === "Cara" ? 1 : 0})</p>}
            <button onClick={flipCoin} disabled={coinFlipping} style={{ padding: "9px 24px", borderRadius: 10, border: "none", cursor: "pointer", background: coinFlipping ? "#1e293b" : `linear-gradient(135deg,${V},#4f46e5)`, color: "white", fontWeight: 800, fontSize: 13, boxShadow: !coinFlipping ? `0 4px 14px ${V}40` : "none", transition: "all 0.2s" }}>
              {coinFlipping ? "Lanzando..." : "Lanzar"}
            </button>
          </div>
          {coinHistory.length > 0 && (
            <div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                {coinHistory.map((r, i) => <span key={i} style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: r === "Cara" ? `${A}20` : "rgba(148,163,184,0.1)", color: r === "Cara" ? A : "#94a3b8" }}>{r[0]}</span>)}
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                {["Cara", "Cruz"].map(r => (
                  <div key={r} style={{ flex: 1, padding: "8px", borderRadius: 10, background: `${r === "Cara" ? A : C}10`, border: `1px solid ${r === "Cara" ? A : C}20`, textAlign: "center" }}>
                    <p style={{ color: "#64748b", fontSize: 10, fontWeight: 700 }}>{r} (X={r === "Cara" ? 1 : 0})</p>
                    <p style={{ color: r === "Cara" ? A : C, fontWeight: 900, fontSize: 16 }}>{coinC[r]}</p>
                    <p style={{ color: "#475569", fontSize: 10 }}>{coinHistory.length > 0 ? ((coinC[r] / coinHistory.length) * 100).toFixed(1) : 0}%</p>
                  </div>
                ))}
              </div>
              {/* P empírica vs teórica */}
              <div style={{ padding: "8px 12px", borderRadius: 10, background: `${G}08`, border: `1px solid ${G}20` }}>
                <p style={{ color: "#94a3b8", fontSize: 12 }}>
                  P̂(Cara) = <strong style={{ color: G }}>{(pEmpCara * 100).toFixed(1)}%</strong>
                  &nbsp;·&nbsp; P teórica = <strong style={{ color: C }}>50.0%</strong>
                  &nbsp;·&nbsp; Δ = <strong style={{ color: Math.abs(pEmpCara - 0.5) < 0.05 ? G : A }}>{(Math.abs(pEmpCara - 0.5) * 100).toFixed(1)}%</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* DADO */}
        <div style={{ background: "#111118", border: `1px solid ${C}20`, borderRadius: 18, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>🎲</span>
            <div>
              <h5 style={{ color: "white", fontWeight: 900, fontSize: 14 }}>Simulador de Dado</h5>
              <p style={{ color: "#64748b", fontSize: 11 }}>D(X) = &#123;1,2,3,4,5,6&#125; &nbsp;·&nbsp; E(X) = 3.5</p>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div onClick={rollDice} style={{ width: 90, height: 90, borderRadius: 18, background: `linear-gradient(135deg,${C}30,${C}15)`, border: `4px solid ${C}50`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 52, transition: "all 0.15s", boxShadow: diceResult ? `0 8px 28px ${C}40` : "none", userSelect: "none" }}>
              {diceResult ? faces[diceResult - 1] : "🎲"}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            {diceResult && <p style={{ color: C, fontWeight: 900, fontSize: 18, marginBottom: 10 }}>X = {diceResult}</p>}
            <button onClick={rollDice} disabled={diceRolling} style={{ padding: "9px 24px", borderRadius: 10, border: "none", cursor: "pointer", background: diceRolling ? "#1e293b" : `linear-gradient(135deg,${C},#0891b2)`, color: "white", fontWeight: 800, fontSize: 13, boxShadow: !diceRolling ? `0 4px 14px ${C}40` : "none", transition: "all 0.2s" }}>
              {diceRolling ? "Tirando..." : "Tirar"}
            </button>
          </div>
          {diceHistory.length > 0 && (
            <div>
              <p style={{ color: "#475569", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>
                Frecuencias ({diceHistory.length} tiradas) &nbsp;·&nbsp;
                <span style={{ color: P }}>Ē(X) = {(diceHistory.reduce((a, x) => a + x, 0) / diceHistory.length).toFixed(2)}</span>
                <span style={{ color: "#334155" }}> (teórica: 3.5)</span>
              </p>
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={diceCounts} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <ReferenceLine y={diceHistory.length / 6} stroke={P} strokeDasharray="4 2" />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {diceCounts.map((d, i) => <Cell key={i} fill={d.count === Math.max(...diceCounts.map(x => x.count)) ? C : `${C}50`} />)}
                  </Bar>
                  <XAxis dataKey="n" tick={{ fill: "#475569", fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Pregunta formal */}
      {question && (
        <div style={{ background: "#111118", border: `1px solid ${A}25`, borderRadius: 18, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <Brain style={{ color: A, width: 18, height: 18 }} /><h5 style={{ color: A, fontWeight: 900, fontSize: 14 }}>Pregunta de Formalización</h5>
          </div>
          <p style={{ color: "white", fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{question.text}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
            {question.opts.map((o, i) => {
              const isSel = selected === i, isOk = i === question.correct, show = answered;
              return (
                <button key={i} onClick={() => handleAnswer(i)} style={{
                  padding: "11px 14px", borderRadius: 10, border: "none", cursor: answered ? "default" : "pointer", fontWeight: 700, fontSize: 13, textAlign: "left",
                  background: show ? (isOk ? `${G}20` : isSel ? `${R}20` : "rgba(255,255,255,0.03)") : (isSel ? `${A}20` : "rgba(255,255,255,0.04)"),
                  color: show ? (isOk ? G : isSel ? R : "#64748b") : (isSel ? A : "#94a3b8"),
                  outline: show ? (isOk ? `1.5px solid ${G}` : isSel ? `1.5px solid ${R}` : `1px solid rgba(255,255,255,0.06)`) : (isSel ? `1.5px solid ${A}` : `1px solid rgba(255,255,255,0.06)`),
                  display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s"
                }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: show && isOk ? G : show && isSel ? R : isSel ? A : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "white" }}>{String.fromCharCode(65 + i)}</span>
                  {o}
                </button>
              );
            })}
          </div>
          {answered && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ flex: 1, padding: "12px 16px", borderRadius: 12, background: selected === question.correct ? `${G}15` : `${R}10`, border: `1px solid ${selected === question.correct ? G : R}30` }}>
                <p style={{ color: "#e2e8f0", fontSize: 13 }}>
                  <strong style={{ color: selected === question.correct ? G : R }}>{selected === question.correct ? "✅ Correcto! " : "❌ Incorrecto. "}</strong>
                  {question.exp}
                </p>
              </div>
              <button onClick={newQ} style={{ padding: "12px 18px", borderRadius: 10, border: `1px solid ${V}40`, background: `${V}15`, color: "#a78bfa", fontWeight: 800, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>Nueva →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════
// PRÁCTICA — SECCIÓN 2: ESPACIO MUESTRAL
// ════════════════════════════════════════════════════════
const EJERCICIOS_SM = [
  {
    enunciado: "Lanzar 2 monedas (C = Cara, X = Cruz)",
    respuestaCanonica: ["CC", "CX", "XC", "XX"],
    alternativas: [["CC", "CX", "XC", "XX"], ["CC", "XC", "CX", "XX"], ["CX", "CC", "XX", "XC"]],
    hint: "Hay 4 combinaciones: CC, CX, XC, XX. El orden de las monedas importa.",
    nota: "2² = 4 resultados",
    formal: "D(X) = {0, 1, 2} caras"
  },
  {
    enunciado: "Lanzar 1 dado de 4 caras",
    respuestaCanonica: ["1", "2", "3", "4"],
    alternativas: [["1", "2", "3", "4"], ["1", "3", "2", "4"]],
    hint: "Un dado de 4 caras: resultados 1, 2, 3, 4.",
    nota: "4 resultados",
    formal: "D(X) = {1, 2, 3, 4}"
  },
  {
    enunciado: "Lanzar una moneda y un dado",
    respuestaCanonica: ["C1", "C2", "C3", "C4", "C5", "C6", "X1", "X2", "X3", "X4", "X5", "X6"],
    alternativas: [["C1", "C2", "C3", "C4", "C5", "C6", "X1", "X2", "X3", "X4", "X5", "X6"]],
    hint: "2 resultados de moneda × 6 del dado = 12 combinaciones.",
    nota: "2 × 6 = 12",
    formal: "|S| = 12 elementos"
  },
  {
    enunciado: "Elegir un color (Rojo, Verde, Azul)",
    respuestaCanonica: ["Rojo", "Verde", "Azul"],
    alternativas: [["Rojo", "Verde", "Azul"], ["Verde", "Rojo", "Azul"]],
    hint: "3 colores → 3 resultados posibles.",
    nota: "3 opciones",
    formal: "D(X) = {Rojo, Verde, Azul}"
  },
];

const PracticaEspacio = ({ onScore }) => {
  const [ejIdx, setEjIdx] = useState(0);
  const [input, setInput] = useState("");
  const [tokens, setTokens] = useState([]);
  const [estado, setEstado] = useState("idle");
  const [showHint, setShowHint] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [completedEjs, setCompletedEjs] = useState(new Set());

  const ej = EJERCICIOS_SM[ejIdx];

  const addToken = t => { const c = t.trim().toUpperCase().replace(/[{}]/g, ""); if (!c) return; setTokens(p => [...p, c]); setInput(""); };
  const removeToken = i => setTokens(p => p.filter((_, j) => j !== i));
  const verificar = () => {
    setIntentos(p => p + 1);
    const sorted = [...tokens].sort().join(",");
    const valid = ej.alternativas.some(alt => [...alt].sort().join(",") === sorted);
    setEstado(valid ? "correcto" : "incorrecto");
    if (valid && !completedEjs.has(ejIdx)) {
      const newCompleted = new Set(completedEjs).add(ejIdx);
      setCompletedEjs(newCompleted);
      const newCorrect = totalCorrect + 1;
      setTotalCorrect(newCorrect);
      if (onScore) onScore({ section: 2, score: newCorrect, total: EJERCICIOS_SM.length });
    }
  };
  const reset = (ni = ejIdx) => { setEjIdx(ni); setTokens([]); setInput(""); setEstado("idle"); setShowHint(false); setIntentos(0); };
  const handleKey = e => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") { e.preventDefault(); if (input.trim()) addToken(input); }
    else if (e.key === "Backspace" && !input && tokens.length > 0) removeToken(tokens.length - 1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Banner */}
      <div style={{ background: `${C}10`, border: `1px solid ${C}30`, borderRadius: 16, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h4 style={{ color: "white", fontWeight: 900, fontSize: 16, marginBottom: 4 }}>🧩 Construye el Espacio Muestral</h4>
          <p style={{ color: "#64748b", fontSize: 13 }}>Escribe cada resultado y presiona Enter. Clic en un token para eliminarlo.</p>
        </div>
        <div style={{ padding: "8px 18px", borderRadius: 20, background: `${totalCorrect === EJERCICIOS_SM.length ? G : C}15`, border: `1px solid ${totalCorrect === EJERCICIOS_SM.length ? G : C}30` }}>
          <span style={{ color: totalCorrect === EJERCICIOS_SM.length ? G : C, fontWeight: 900, fontSize: 14 }}>{totalCorrect}/{EJERCICIOS_SM.length} ejercicios</span>
        </div>
      </div>

      {/* Selector */}
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
        {EJERCICIOS_SM.map((e, i) => (
          <button key={i} onClick={() => reset(i)} style={{
            padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer",
            background: ejIdx === i ? `linear-gradient(135deg,${C},#0891b2)` : completedEjs.has(i) ? `${G}20` : `${C}10`,
            color: ejIdx === i ? "white" : completedEjs.has(i) ? G : C,
            fontWeight: 700, fontSize: 12, transition: "all 0.2s",
            outline: ejIdx !== i ? `1px solid ${completedEjs.has(i) ? G : C}30` : "none"
          }}>
            {completedEjs.has(i) ? "✓ " : ""}Ej. {i + 1}
          </button>
        ))}
      </div>

      {/* Ejercicio */}
      <div style={{ background: "#111118", border: `1px solid ${C}20`, borderRadius: 18, padding: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ padding: "3px 12px", borderRadius: 20, background: `${C}15`, color: C, fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>{ej.nota}</span>
              <span style={{ padding: "3px 12px", borderRadius: 20, background: `${V}12`, color: "#a78bfa", fontWeight: 700, fontSize: 11, fontFamily: "monospace" }}>{ej.formal}</span>
            </div>
            <h5 style={{ color: "white", fontWeight: 900, fontSize: 16 }}>✏️ {ej.enunciado}</h5>
          </div>
          <button onClick={() => reset(ejIdx)} style={{ padding: "6px 12px", borderRadius: 10, border: `1px solid rgba(255,255,255,0.08)`, background: "transparent", color: "#64748b", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
            <RotateCcw style={{ width: 12, height: 12, display: "inline", marginRight: 3 }} />Reset
          </button>
        </div>

        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 14 }}>
          Construye S escribiendo cada elemento y presionando{" "}
          <kbd style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, padding: "1px 5px", fontSize: 11 }}>Enter</kbd>
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center", padding: "12px 14px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: `1.5px solid ${estado === "correcto" ? G : estado === "incorrecto" ? R : `${C}30`}`, minHeight: 52, marginBottom: 14, cursor: "text", transition: "border-color 0.3s" }}
          onClick={() => document.getElementById("sm-inp2")?.focus()}>
          <span style={{ color: "#a78bfa", fontWeight: 900, fontFamily: "monospace", fontSize: 15 }}>S = &#123;</span>
          {tokens.map((t, i) => (
            <span key={i} onClick={e => { e.stopPropagation(); removeToken(i); }}
              style={{ padding: "3px 11px", borderRadius: 7, background: `${C}20`, color: C, fontFamily: "monospace", fontWeight: 800, fontSize: 13, cursor: "pointer", border: `1px solid ${C}40`, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = `${R}20`; e.currentTarget.style.color = R; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${C}20`; e.currentTarget.style.color = C; }}
            >{t}</span>
          ))}
          {tokens.length > 0 && <span style={{ color: "#a78bfa", fontFamily: "monospace", fontSize: 15, opacity: 0.5 }}>,</span>}
          <input id="sm-inp2" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder={tokens.length === 0 ? "Escribe aquí..." : ""}
            style={{ background: "transparent", border: "none", outline: "none", color: "white", fontFamily: "monospace", fontSize: 13, fontWeight: 700, minWidth: 110, flex: 1 }} />
          <span style={{ color: "#a78bfa", fontFamily: "monospace", fontSize: 15 }}>&#125;</span>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <button onClick={verificar} disabled={tokens.length === 0} style={{ padding: "10px 26px", borderRadius: 11, border: "none", cursor: tokens.length === 0 ? "not-allowed" : "pointer", background: tokens.length === 0 ? "#1e293b" : `linear-gradient(135deg,${V},#4f46e5)`, color: tokens.length === 0 ? "#475569" : "white", fontWeight: 800, fontSize: 13, boxShadow: tokens.length > 0 ? `0 4px 14px ${V}35` : "none", transition: "all 0.2s" }}>Verificar ✓</button>
          <button onClick={() => setShowHint(h => !h)} style={{ padding: "10px 18px", borderRadius: 11, border: `1px solid ${A}30`, background: `${A}10`, color: A, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            {showHint ? "Ocultar pista" : "💡 Pista"}
          </button>
        </div>

        {showHint && <div style={{ marginBottom: 12, padding: "11px 14px", borderRadius: 11, background: `${A}10`, border: `1px solid ${A}30` }}><p style={{ color: "#fde68a", fontSize: 13 }}>💡 {ej.hint}</p></div>}

        {estado !== "idle" && (
          <div style={{ padding: "14px 18px", borderRadius: 13, background: estado === "correcto" ? `${G}12` : `${R}10`, border: `1.5px solid ${estado === "correcto" ? G : R}40`, display: "flex", alignItems: "flex-start", gap: 10 }}>
            {estado === "correcto" ? <CheckCircle style={{ color: G, width: 20, height: 20, flexShrink: 0 }} /> : <XCircle style={{ color: R, width: 20, height: 20, flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>
              <p style={{ color: estado === "correcto" ? G : R, fontWeight: 900, marginBottom: 6 }}>
                {estado === "correcto" ? "¡Correcto! Excelente construcción." : `Incorrecto (intento ${intentos}).`}
              </p>
              {estado === "correcto" && (
                <p style={{ color: "#94a3b8", fontSize: 13 }}>
                  S = &#123;{ej.respuestaCanonica.join(", ")}&#125; — |S| = {ej.respuestaCanonica.length} elementos.
                </p>
              )}
              {estado === "incorrecto" && (() => {
                const correctSet = new Set(ej.respuestaCanonica.map(x => x.toUpperCase()));
                const userSet = new Set(tokens);
                const faltantes = ej.respuestaCanonica.filter(x => !userSet.has(x.toUpperCase()));
                const sobran = tokens.filter(t => !correctSet.has(t.toUpperCase()));
                const duplicados = tokens.filter((t, i) => tokens.indexOf(t) !== i);
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {sobran.length > 0 && (
                      <div style={{ padding: "8px 12px", borderRadius: 9, background: `${R}10`, border: `1px solid ${R}25` }}>
                        <p style={{ color: R, fontWeight: 800, fontSize: 12, marginBottom: 3 }}>
                          ⚠️ Elementos incorrectos o que no pertenecen a S:
                        </p>
                        <p style={{ color: "#94a3b8", fontSize: 12 }}>
                          <strong style={{ color: "white", fontFamily: "monospace" }}>{sobran.join(", ")}</strong>
                          {" "}— Estos resultados no son posibles en este experimento.
                          Verifica que estés usando la notación correcta ({ej.nota}).
                        </p>
                      </div>
                    )}
                    {faltantes.length > 0 && intentos >= 1 && (
                      <div style={{ padding: "8px 12px", borderRadius: 9, background: `${A}10`, border: `1px solid ${A}25` }}>
                        <p style={{ color: A, fontWeight: 800, fontSize: 12, marginBottom: 3 }}>
                          💡 Te faltan {faltantes.length} elemento{faltantes.length > 1 ? "s" : ""}:
                        </p>
                        <p style={{ color: "#94a3b8", fontSize: 12 }}>
                          El espacio muestral debe incluir{" "}
                          <strong style={{ color: "white", fontFamily: "monospace" }}>{faltantes.join(", ")}</strong>.
                          Recuerda: S debe contener <strong style={{ color: "white" }}>todos</strong> los resultados posibles.
                        </p>
                      </div>
                    )}
                    {duplicados.length > 0 && (
                      <div style={{ padding: "8px 12px", borderRadius: 9, background: `${C}10`, border: `1px solid ${C}25` }}>
                        <p style={{ color: C, fontWeight: 800, fontSize: 12, marginBottom: 3 }}>
                          🔁 Elementos duplicados detectados:
                        </p>
                        <p style={{ color: "#94a3b8", fontSize: 12 }}>
                          <strong style={{ color: "white", fontFamily: "monospace" }}>{duplicados.join(", ")}</strong>
                          {" "}— Un espacio muestral es un <strong style={{ color: "white" }}>conjunto</strong>:
                          cada resultado aparece exactamente una vez.
                        </p>
                      </div>
                    )}
                    {sobran.length === 0 && faltantes.length === 0 && duplicados.length === 0 && (
                      <p style={{ color: "#94a3b8", fontSize: 12 }}>
                        Los elementos son correctos pero el orden o formato no coincide. Revisa la notación del enunciado.
                      </p>
                    )}
                    {intentos >= 2 && (
                      <p style={{ color: "#475569", fontSize: 12, marginTop: 2 }}>
                        Respuesta completa: S = &#123;{ej.respuestaCanonica.join(", ")}&#125;
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
            {estado === "correcto" && ejIdx < EJERCICIOS_SM.length - 1 && (
              <button onClick={() => reset(ejIdx + 1)} style={{ padding: "7px 14px", borderRadius: 9, border: "none", cursor: "pointer", background: G, color: "white", fontWeight: 800, fontSize: 12 }}>Siguiente →</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
const PracticaAxiomas = ({ onScore }) => {
  const [pA, setPA] = useState(0.35);
  const [pB, setPB] = useState(0.25);
  const [pC, setPC] = useState(0.40);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [showEXSlider, setShowEXSlider] = useState(false);
  const [sliderScore, setSliderScore] = useState(null);

  const sum = pA + pB + pC;
  const sumOk = Math.abs(sum - 1) < 0.001;

  // E(X) de la distribución del slider
  // Dominio ficticio: X ∈ {1, 2, 3}
  const EX_slider = 1 * pA + 2 * pB + 3 * pC;

  const preguntas = [
    {
      val: "P(A) = 0.5", valid: true,
      feedbackOk: "0 ≤ 0.5 ≤ 1 → Cumple el Axioma 1. ✅ Representa un evento con 50% de probabilidad.",
      feedbackFail: "0.5 está entre 0 y 1. Esto SÍ es una probabilidad válida según el Axioma 1."
    },
    {
      val: "P(A) = 0.8", valid: true,
      feedbackOk: "0 ≤ 0.8 ≤ 1 → Cumple el Axioma 1. ✅ Evento muy probable pero no certero.",
      feedbackFail: "0.8 está entre 0 y 1. Esto SÍ es válido. Un 80% de probabilidad es perfectamente posible."
    },
    {
      val: "P(A) = 1.0", valid: true,
      feedbackOk: "P(A) = 1 significa certeza total: el evento siempre ocurre. ✅ Es el límite superior permitido.",
      feedbackFail: "P(A) = 1 SÍ es válido. Representa un evento cierto, como P(S) = 1 por el Axioma 2."
    },
    {
      val: "P(A) = 0.0", valid: true,
      feedbackOk: "P(A) = 0 es un evento imposible. ✅ Es el límite inferior permitido por el Axioma 1.",
      feedbackFail: "P(A) = 0 SÍ es válido. Representa un evento imposible, como sacar 7 en un dado de 6 caras."
    },
    {
      val: "P(A) = 1.2", valid: false,
      feedbackOk: "❌ Correcto que es inválida. 1.2 > 1 viola el Axioma 1. Una probabilidad mayor que 1 significaría 'más que certeza total', lo cual es imposible por definición.",
      feedbackFail: "⚠️ P(A) = 1.2 VIOLA el Axioma 1. Ninguna probabilidad puede superar 1.0. Significaría '120% de certeza', algo matemáticamente imposible."
    },
    {
      val: "P(A) = −0.1", valid: false,
      feedbackOk: "❌ Correcto. Valor negativo viola el Axioma 1 (No-Negatividad). Una probabilidad negativa no tiene interpretación física posible.",
      feedbackFail: "⚠️ P(A) = −0.1 VIOLA el Axioma 1. Las probabilidades no pueden ser negativas. ¿Qué significaría un −10% de probabilidad? No existe tal concepto."
    },
    {
      val: "P(A) = 0.25", valid: true,
      feedbackOk: "0 ≤ 0.25 ≤ 1 → Cumple el Axioma 1. ✅ Equivale a 25%, como sacar un 1 en un dado.",
      feedbackFail: "0.25 está entre 0 y 1. Esto SÍ es válido. Equivale a una probabilidad del 25%."
    },
    {
      val: "P(A) = 2", valid: false,
      feedbackOk: "❌ Correcto. P(A) = 2 viola el Axioma 1. Valor mayor que 1 es imposible.",
      feedbackFail: "⚠️ P(A) = 2 VIOLA el Axioma 1. Significaría '200% de probabilidad'. El máximo absoluto es P(A) = 1 (certeza total)."
    },
  ];

  const totalCorrect = preguntas.filter((pq, i) => answers[i] === pq.valid).length;
  const allAnswered = Object.keys(answers).length === preguntas.length;

  const handleCheck = () => {
    setChecked(true);
    setSliderScore(sumOk ? 1 : 0);
    if (onScore) onScore({ section: 3, score: totalCorrect + (sumOk ? 1 : 0), total: preguntas.length + 1 });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Banner */}
      <div style={{
        background: `${G}10`, border: `1px solid ${G}30`, borderRadius: 16, padding: 20,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12
      }}>
        <div>
          <h4 style={{ color: "white", fontWeight: 900, fontSize: 16, marginBottom: 4 }}>⚖️ Axiomas de Probabilidad</h4>
          <p style={{ color: "#64748b", fontSize: 13 }}>Formaliza las reglas. Clasifica y construye distribuciones válidas.</p>
        </div>
        {checked && (
          <div style={{
            padding: "8px 18px", borderRadius: 20,
            background: `${totalCorrect + sliderScore === preguntas.length + 1 ? G : A}15`,
            border: `1px solid ${totalCorrect + sliderScore === preguntas.length + 1 ? G : A}30`
          }}>
            <span style={{ color: totalCorrect + sliderScore === preguntas.length + 1 ? G : A, fontWeight: 900, fontSize: 14 }}>
              {totalCorrect + sliderScore}/{preguntas.length + 1} correctas
            </span>
          </div>
        )}
      </div>

      {/* ── AXIOMAS FORMALES ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

        {/* Tarjetas de axiomas */}
        <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: 22 }}>
          <h5 style={{ color: "white", fontWeight: 900, fontSize: 15, marginBottom: 16 }}>
            Los Axiomas de Kolmogorov
          </h5>
          {[
            {
              num: "1", title: "No-Negatividad", formula: "P(A) ≥ 0, ∀A ⊆ S",
              detail: "Ningún evento puede tener probabilidad negativa.", color: V
            },
            {
              num: "2", title: "Normalización", formula: "P(S) = 1",
              detail: "La probabilidad del espacio muestral completo es 1.", color: C
            },
            {
              num: "3", title: "Aditividad", formula: "P(A∪B) = P(A)+P(B) si A∩B=∅",
              detail: "Para eventos mutuamente excluyentes, las prob. se suman.", color: A
            },
          ].map(ax => (
            <div key={ax.num} style={{
              padding: "14px 16px", borderRadius: 13,
              background: `${ax.color}10`, border: `1px solid ${ax.color}25`, marginBottom: 12
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{
                  width: 26, height: 26, borderRadius: 7, background: ax.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 900, fontSize: 13
                }}>{ax.num}</span>
                <span style={{ color: "white", fontWeight: 900, fontSize: 13 }}>{ax.title}</span>
              </div>
              <p style={{
                fontFamily: "Georgia,serif", fontSize: 16, color: ax.color,
                fontWeight: 700, textAlign: "center", padding: "6px 0"
              }}>{ax.formula}</p>
              <p style={{ color: "#64748b", fontSize: 12, textAlign: "center" }}>{ax.detail}</p>
            </div>
          ))}
        </div>

        {/* Slider interactivo con E(X) */}
        <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: 22 }}>
          <h5 style={{ color: "white", fontWeight: 900, fontSize: 15, marginBottom: 4 }}>
            🎚️ Construye una Distribución Válida
          </h5>
          <p style={{ color: "#64748b", fontSize: 12, marginBottom: 18 }}>
            X ∈ &#123;1, 2, 3&#125; &nbsp;·&nbsp; Ajusta para que Σ P(X=x) = 1
          </p>

          {[
            { label: "P(X=1)", val: pA, set: setPA, color: V },
            { label: "P(X=2)", val: pB, set: setPB, color: C },
            { label: "P(X=3)", val: pC, set: setPC, color: A },
          ].map(sl => (
            <div key={sl.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ color: sl.color, fontWeight: 800, fontSize: 13, fontFamily: "monospace" }}>{sl.label}</span>
                <span style={{ color: "white", fontWeight: 900, fontSize: 14, fontFamily: "monospace" }}>{sl.val.toFixed(2)}</span>
              </div>
              <div style={{ position: "relative", height: 7, borderRadius: 4, background: "rgba(255,255,255,0.06)" }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, height: "100%",
                  width: `${sl.val * 100}%`, borderRadius: 4,
                  background: `linear-gradient(90deg,${sl.color},${sl.color}80)`, transition: "width 0.1s"
                }} />
              </div>
              <input type="range" min={0} max={1} step={0.01} value={sl.val}
                onChange={e => sl.set(+e.target.value)}
                style={{ width: "100%", accentColor: sl.color, marginTop: 3, cursor: "pointer" }} />
            </div>
          ))}

          {/* Suma + estado */}
          <div style={{
            padding: "13px 16px", borderRadius: 13,
            background: sumOk ? `${G}12` : `${R}10`,
            border: `1.5px solid ${sumOk ? G : R}40`,
            display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12
          }}>
            <div>
              <p style={{ color: "#64748b", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Σ P(X=x)</p>
              <p style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 900, color: sumOk ? G : R }}>
                {sum.toFixed(2)}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              {sumOk
                ? <><CheckCircle style={{ color: G, width: 24, height: 24 }} /><p style={{ color: G, fontSize: 11, fontWeight: 700 }}>Válida ✅</p></>
                : <><XCircle style={{ color: R, width: 24, height: 24 }} /><p style={{ color: R, fontSize: 11, fontWeight: 700 }}>Inválida ❌</p></>
              }
            </div>
          </div>

          {/* E(X) en vivo */}
          <div style={{ padding: "12px 16px", borderRadius: 12, background: `${P}10`, border: `1px solid ${P}25` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ color: P, fontWeight: 800, fontSize: 13, fontFamily: "Georgia,serif" }}>
                E(X) = 1·P(X=1) + 2·P(X=2) + 3·P(X=3)
              </p>
            </div>
            <p style={{
              color: "white", fontWeight: 900, fontSize: 20, fontFamily: "Georgia,serif",
              textAlign: "center", marginTop: 8
            }}>
              = {(1 * pA).toFixed(2)} + {(2 * pB).toFixed(2)} + {(3 * pC).toFixed(2)}{" "}
              = <span style={{ color: P }}>{EX_slider.toFixed(3)}</span>
            </p>
            {sumOk && (
              <p style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", marginTop: 4 }}>
                Con esta distribución, el valor esperado es <strong style={{ color: P }}>{EX_slider.toFixed(3)}</strong>
              </p>
            )}
          </div>

          {/* Barra visual */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", height: 22, borderRadius: 7, overflow: "hidden", gap: 2 }}>
              {[{ v: pA, c: V, l: "X=1" }, { v: pB, c: C, l: "X=2" }, { v: pC, c: A, l: "X=3" }].map((x, i) => (
                <div key={i} style={{
                  flex: x.v, background: x.c,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 900, color: "white", transition: "flex 0.1s",
                  overflow: "hidden"
                }}>
                  {x.v > 0.1 ? `${(x.v * 100).toFixed(0)}%` : ""}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── EJERCICIO: ¿Es válida? ── */}
      <div style={{ background: "#111118", border: `1px solid ${A}20`, borderRadius: 18, padding: 22 }}>
        <h5 style={{ color: A, fontWeight: 900, fontSize: 15, marginBottom: 6 }}>
          🧪 ¿Cumple el Axioma 1? — Clasifica cada probabilidad
        </h5>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 18 }}>
          Recuerda: <strong style={{ color: "white" }}>0 ≤ P(A) ≤ 1</strong> para toda probabilidad válida.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
          {preguntas.map((pq, i) => {
            const ans = answers[i];
            return (
              <div key={i} style={{
                padding: "13px 15px", borderRadius: 13,
                background: checked
                  ? (ans === pq.valid ? `${G}10` : ans !== undefined ? `${R}10` : "rgba(255,255,255,0.02)")
                  : "rgba(255,255,255,0.02)",
                border: `1px solid ${checked
                  ? (ans === pq.valid ? `${G}30` : ans !== undefined ? `${R}30` : "rgba(255,255,255,0.06)")
                  : "rgba(255,255,255,0.06)"}`,
                transition: "all 0.2s"
              }}>
                <p style={{
                  fontFamily: "monospace", fontWeight: 900, fontSize: 15,
                  color: "white", marginBottom: 9
                }}>{pq.val}</p>
                <div style={{ display: "flex", gap: 7 }}>
                  {[{ label: "✅ Válida", v: true }, { label: "❌ Inválida", v: false }].map(opt => (
                    <button key={String(opt.v)}
                      onClick={() => !checked && setAnswers(a => ({ ...a, [i]: opt.v }))}
                      style={{
                        flex: 1, padding: "6px", borderRadius: 8, border: "none",
                        cursor: checked ? "default" : "pointer", fontWeight: 800, fontSize: 12,
                        transition: "all 0.15s",
                        background: ans === opt.v
                          ? (checked ? (opt.v === pq.valid ? G : R) : (opt.v ? G : R))
                          : (opt.v ? `${G}10` : `${R}10`),
                        color: ans === opt.v ? "white" : (opt.v ? G : R),
                        outline: ans !== opt.v ? (opt.v ? `1px solid ${G}30` : `1px solid ${R}30`) : "none"
                      }}>{opt.label}</button>
                  ))}
                </div>
                {checked && (() => {
                  const acerto = ans === pq.valid;
                  const msg = acerto ? pq.feedbackOk : pq.feedbackFail;
                  return (
                    <div style={{
                      marginTop: 8, padding: "8px 12px", borderRadius: 9,
                      background: acerto ? `${G}10` : `${R}10`,
                      border: `1px solid ${acerto ? G : R}25`
                    }}>
                      <p style={{ color: acerto ? "#a3e3c6" : "#fca5a5", fontSize: 12, lineHeight: 1.6 }}>
                        {msg}
                      </p>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {!checked && allAnswered && sumOk && (
            <button onClick={handleCheck} style={{
              padding: "11px 32px", borderRadius: 11, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg,${A},#d97706)`,
              color: "white", fontWeight: 900, fontSize: 14, boxShadow: `0 4px 14px ${A}40`
            }}>Verificar todo</button>
          )}
          {!checked && allAnswered && !sumOk && (
            <div style={{
              padding: "11px 20px", borderRadius: 11,
              background: `${R}10`, border: `1px solid ${R}30`,
              display: "flex", alignItems: "center", gap: 8
            }}>
              <AlertCircle style={{ color: R, width: 18, height: 18 }} />
              <p style={{ color: R, fontSize: 13, fontWeight: 700 }}>
                Primero ajusta los sliders para que Σ = 1.00
              </p>
            </div>
          )}
          {checked && (
            <div style={{
              padding: "12px 22px", borderRadius: 11,
              background: `${G}12`, border: `1px solid ${G}30`,
              display: "flex", alignItems: "center", gap: 10
            }}>
              <Award style={{ color: G, width: 20, height: 20 }} />
              <p style={{ color: G, fontWeight: 800, fontSize: 14 }}>
                {totalCorrect + sliderScore}/{preguntas.length + 1} correctas
                {totalCorrect + sliderScore === preguntas.length + 1 && " — ¡Perfecto! 🎉"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
// PRÁCTICA — SECCIÓN 4: PROBABILIDAD EMPÍRICA
// ════════════════════════════════════════════════════════

const PracticaEmpirica = ({ onScore }) => {
  const [modo, setModo] = useState("moneda");
  const [lanzamientos, setLanzamientos] = useState([]);
  const [corriendo, setCorriendo] = useState(false);
  const [velocidad, setVelocidad] = useState(50);
  const [totalTarget, setTotalTarget] = useState(100);
  const intervalRef = useRef(null);
  const [reportado, setReportado] = useState(false);

  const teorica = modo === "moneda"
    ? { Cara: 0.5, Cruz: 0.5 }
    : Object.fromEntries([1, 2, 3, 4, 5, 6].map(n => [String(n), 1 / 6]));

  const iniciar = () => {
    setCorriendo(true); setLanzamientos([]); setReportado(false);
    let count = 0;
    intervalRef.current = setInterval(() => {
      const r = modo === "moneda"
        ? (Math.random() < 0.5 ? "Cara" : "Cruz")
        : String(Math.ceil(Math.random() * 6));
      setLanzamientos(p => [...p, r]);
      if (++count >= totalTarget) {
        clearInterval(intervalRef.current);
        setCorriendo(false);
      }
    }, Math.max(10, 1000 / velocidad));
  };

  const detener = () => { clearInterval(intervalRef.current); setCorriendo(false); };
  const reiniciar = () => { clearInterval(intervalRef.current); setCorriendo(false); setLanzamientos([]); setReportado(false); };
  useEffect(() => () => clearInterval(intervalRef.current), []);

  // Reportar score cuando termina simulación
  useEffect(() => {
    if (!corriendo && lanzamientos.length >= totalTarget && !reportado) {
      const freq = {};
      lanzamientos.forEach(r => { freq[r] = (freq[r] || 0) + 1; });
      const keys = modo === "moneda" ? ["Cara", "Cruz"] : ["1", "2", "3", "4", "5", "6"];
      const maxDiff = Math.max(...keys.map(k => Math.abs((freq[k] || 0) / lanzamientos.length - teorica[k])));
      const score = maxDiff < 0.05 ? 3 : maxDiff < 0.10 ? 2 : 1;
      if (onScore) onScore({ section: 4, score, total: 3 });
      setReportado(true);
    }
  }, [corriendo, lanzamientos.length]);

  const freq = {};
  lanzamientos.forEach(r => { freq[r] = (freq[r] || 0) + 1; });
  const keys = modo === "moneda" ? ["Cara", "Cruz"] : ["1", "2", "3", "4", "5", "6"];
  const barData = keys.map(k => ({
    name: k,
    empirica: lanzamientos.length > 0 ? (freq[k] || 0) / lanzamientos.length : 0,
    teorica: teorica[k]
  }));

  // E(X) empírico
  const EX_emp = modo === "moneda"
    ? (lanzamientos.filter(x => x === "Cara").length / Math.max(1, lanzamientos.length))
    : lanzamientos.reduce((a, x) => a + Number(x), 0) / Math.max(1, lanzamientos.length);
  const EX_teo = modo === "moneda" ? 0.5 : 3.5;

  const convStep = Math.max(1, Math.floor(lanzamientos.length / 80));
  const convData = lanzamientos
    .map((_, i) => {
      const sub = lanzamientos.slice(0, i + 1);
      const tgt = modo === "moneda" ? "Cara" : "1";
      return { n: i + 1, empirica: sub.filter(x => x === tgt).length / sub.length, teorica: teorica[tgt] };
    })
    .filter((_, i) => i % convStep === 0 || i === lanzamientos.length - 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Banner */}
      <div style={{
        background: `${A}10`, border: `1px solid ${A}30`, borderRadius: 16, padding: 20,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12
      }}>
        <div>
          <h4 style={{ color: "white", fontWeight: 900, fontSize: 16, marginBottom: 4 }}>📊 Probabilidad Empírica</h4>
          <p style={{ color: "#64748b", fontSize: 13 }}>
            <strong style={{ color: "white" }}>P̂(A) = f/n</strong> &nbsp;·&nbsp;
            Con n → ∞ converge a P(A). <strong style={{ color: G }}>Ley de Grandes Números.</strong>
          </p>
        </div>
      </div>

      {/* Controles */}
      <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: 22 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-end" }}>
          <div>
            <label style={{ color: "#64748b", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Experimento</label>
            <div style={{ display: "flex", gap: 7 }}>
              {[{ id: "moneda", label: "🪙 Moneda" }, { id: "dado", label: "🎲 Dado" }].map(m => (
                <button key={m.id} onClick={() => { setModo(m.id); reiniciar(); }} style={{
                  padding: "9px 16px", borderRadius: 11, border: "none", cursor: "pointer",
                  fontWeight: 800, fontSize: 13,
                  background: modo === m.id ? `linear-gradient(135deg,${A},#d97706)` : `${A}10`,
                  color: modo === m.id ? "white" : A,
                  outline: modo !== m.id ? `1px solid ${A}30` : "none",
                  boxShadow: modo === m.id ? `0 4px 12px ${A}35` : "none",
                  transition: "all 0.2s"
                }}>{m.label}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ color: "#64748b", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
              n = <span style={{ color: A }}>{totalTarget}</span> simulaciones
            </label>
            <input type="range" min={10} max={500} step={10} value={totalTarget}
              onChange={e => setTotalTarget(+e.target.value)}
              style={{ width: "100%", accentColor: A, cursor: "pointer" }} />
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ color: "#64748b", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
              Velocidad: <span style={{ color: G }}>{velocidad === 100 ? "Máx" : velocidad + "x"}</span>
            </label>
            <input type="range" min={5} max={100} step={5} value={velocidad}
              onChange={e => setVelocidad(+e.target.value)}
              style={{ width: "100%", accentColor: G, cursor: "pointer" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={corriendo ? detener : iniciar} style={{
              padding: "10px 22px", borderRadius: 11, border: "none", cursor: "pointer",
              background: corriendo
                ? `linear-gradient(135deg,${R},#dc2626)`
                : `linear-gradient(135deg,${G},#059669)`,
              color: "white", fontWeight: 800, fontSize: 13,
              boxShadow: `0 4px 14px ${corriendo ? R : G}40`, transition: "all 0.2s"
            }}>{corriendo ? "⏸ Detener" : "▶ Simular"}</button>
            <button onClick={reiniciar} style={{ padding: "10px 12px", borderRadius: 11, border: `1px solid rgba(255,255,255,0.07)`, background: "transparent", color: "#64748b", cursor: "pointer" }}>
              <RotateCcw style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
        {lanzamientos.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
            <div style={{ padding: "7px 14px", borderRadius: 20, background: `${G}15`, border: `1px solid ${G}30` }}>
              <span style={{ color: "#64748b", fontSize: 11 }}>n = </span>
              <span style={{ color: G, fontWeight: 900, fontSize: 13 }}>{lanzamientos.length}</span>
            </div>
            <div style={{ padding: "7px 14px", borderRadius: 20, background: `${P}12`, border: `1px solid ${P}25` }}>
              <span style={{ color: "#64748b", fontSize: 11 }}>Ē(X) = </span>
              <span style={{ color: P, fontWeight: 900, fontSize: 13 }}>{EX_emp.toFixed(3)}</span>
              <span style={{ color: "#475569", fontSize: 11 }}> (teórica: {EX_teo})</span>
            </div>
            {corriendo && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: G, animation: "blink 1s infinite" }} />
                <span style={{ color: G, fontSize: 12, fontWeight: 700 }}>Simulando...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {lanzamientos.length > 0 && (
        <>
          {/* Gráfico barras comparativo */}
          <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: 22 }}>
            <h5 style={{ color: "white", fontWeight: 900, fontSize: 15, marginBottom: 4 }}>
              P̂(X=x) Empírica vs. P(X=x) Teórica
            </h5>
            <p style={{ color: "#64748b", fontSize: 12, marginBottom: 16 }}>
              <span style={{ color: A }}>■</span> P̂ Empírica &nbsp;
              <span style={{ color: `${V}90` }}>■</span> P Teórica &nbsp;·&nbsp;
              Verde = diferencia ≤ 5% &nbsp; Amarillo = ≤ 10% &nbsp; Rojo = &gt; 10%
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis domain={[0, modo === "moneda" ? 0.8 : 0.35]} tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={v => (v * 100).toFixed(0) + "%"} />
                <Tooltip contentStyle={{ background: "#0f172a", border: `1px solid ${A}30`, borderRadius: 10 }}
                  formatter={(v, n) => [(v * 100).toFixed(2) + "%", n === "empirica" ? "P̂ Empírica" : "P Teórica"]} />
                <Bar dataKey="empirica" fill={A} radius={[5, 5, 0, 0]} name="empirica" />
                <Bar dataKey="teorica" fill={`${V}70`} radius={[5, 5, 0, 0]} name="teorica" />
              </BarChart>
            </ResponsiveContainer>

            {/* Tabla de diferencias */}
            <div style={{ marginTop: 14, display: "flex", gap: 7, flexWrap: "wrap" }}>
              {barData.map(d => {
                const diff = Math.abs(d.empirica - d.teorica);
                const col = diff < 0.05 ? G : diff < 0.10 ? A : R;
                return (
                  <div key={d.name} style={{
                    padding: "9px 12px", borderRadius: 11,
                    flex: 1, minWidth: 70,
                    background: `${col}10`, border: `1px solid ${col}30`, textAlign: "center"
                  }}>
                    <p style={{ color: "white", fontWeight: 900, fontSize: 14, fontFamily: "monospace" }}>{d.name}</p>
                    <p style={{ color: A, fontWeight: 700, fontSize: 13 }}>{(d.empirica * 100).toFixed(1)}%</p>
                    <p style={{ color: "#475569", fontSize: 10 }}>P: {(d.teorica * 100).toFixed(1)}%</p>
                    <p style={{ color: col, fontSize: 11, fontWeight: 700 }}>Δ {(diff * 100).toFixed(1)}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Convergencia */}
          {convData.length > 3 && (
            <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: 22 }}>
              <h5 style={{ color: "white", fontWeight: 900, fontSize: 15, marginBottom: 4 }}>
                📈 Convergencia — Ley de los Grandes Números
              </h5>
              <p style={{ color: "#64748b", fontSize: 12, marginBottom: 14 }}>
                P̂({modo === "moneda" ? "Cara" : "1"}) → P = <strong style={{ color: G }}>{(teorica[modo === "moneda" ? "Cara" : "1"] * 100).toFixed(1)}%</strong>
                &nbsp;·&nbsp; n actual = {lanzamientos.length}
              </p>
              <ResponsiveContainer width="100%" height={175}>
                <LineChart data={convData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="n" tick={{ fill: "#64748b", fontSize: 10 }}
                    label={{ value: "n (repeticiones)", position: "insideBottom", offset: -5, fill: "#475569", fontSize: 11 }} />
                  <YAxis domain={[0, 1]} tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={v => (v * 100).toFixed(0) + "%"} />
                  <ReferenceLine y={teorica[modo === "moneda" ? "Cara" : "1"]} stroke={G} strokeDasharray="6 3"
                    label={{ value: "P teórica", fill: G, fontSize: 11 }} />
                  <Line type="monotone" dataKey="empirica" stroke={A} strokeWidth={2} dot={false} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: `1px solid ${A}30`, borderRadius: 10 }}
                    formatter={v => [(v * 100).toFixed(2) + "%"]} labelFormatter={n => `n = ${n}`} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{
                marginTop: 12, padding: "11px 14px", borderRadius: 11,
                background: `${G}08`, border: `1px solid ${G}20`
              }}>
                <p style={{ color: "#a3e3c6", fontSize: 13 }}>
                  💡 <strong>Ley de los Grandes Números (Bernoulli, 1713):</strong> Si el experimento se repite
                  n veces de forma independiente, la frecuencia relativa P̂(A) = f/n converge en probabilidad
                  a P(A) cuando n → ∞. Esto justifica usar datos para estimar probabilidades.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {lanzamientos.length === 0 && (
        <div style={{
          padding: 44, textAlign: "center", background: "#111118",
          border: "1px solid rgba(255,255,255,0.05)", borderRadius: 18
        }}>
          <BarChart2 style={{ width: 44, height: 44, color: "#334155", margin: "0 auto 14px" }} />
          <p style={{ color: "#475569", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Pulsa ▶ Simular para empezar</p>
          <p style={{ color: "#334155", fontSize: 13 }}>
            Observa cómo P̂(A) converge a P(A) con más repeticiones
          </p>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════
// PRÁCTICA — SECCIÓN 5: EJEMPLO CLÍNICO INTERACTIVO
// ════════════════════════════════════════════════════════
const PracticaClinica = ({ onScore }) => {
  const [casoIdx, setCasoIdx] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [verificado, setVerificado] = useState(false);
  const [scoreLocal, setScoreLocal] = useState(0);

  const CASOS = [
    {
      titulo: "Caso 1 — Control de Calidad Industrial",
      contexto: "Una línea de ensamblaje produce piezas con una tasa de defectos del 15%. Un inspector revisa 4 piezas al azar al inicio del turno. Sea X = número de piezas defectuosas.",
      variable: "X ~ B(n=4, p=0.15)",
      distribucion: [
        { k: 0, prob: 0.5220, formula: "C(4,0)·0.15⁰·0.85⁴", label: "0 defectos" },
        { k: 1, prob: 0.3685, formula: "C(4,1)·0.15¹·0.85³", label: "1 defecto" },
        { k: 2, prob: 0.0975, formula: "C(4,2)·0.15²·0.85²", label: "2 defectos" },
        { k: 3, prob: 0.0115, formula: "C(4,3)·0.15³·0.85¹", label: "3 defectos" },
        { k: 4, prob: 0.0005, formula: "C(4,4)·0.15⁴·0.85⁰", label: "4 defectos" },
      ],
      EX: 0.6, EX_formula: "E(X) = n·p = 4 × 0.15 = 0.60",
      preguntas: [
        {
          text: "¿Cuál es P(X = 1)? (exactamente 1 pieza defectuosa)",
          opts: ["0.5220", "0.0975", "0.3685", "0.0115"], correct: 2,
          exp: "P(X=1) = C(4,1)·0.15¹·0.85³ = 4 × 0.15 × 0.6141 = 0.3685 = 36.85%",
          feedbacks: [
            "0.5220 es P(X=0) — la probabilidad de que NINGUNA pieza falle. Para X=1 necesitas aplicar C(4,1)·0.15¹·0.85³.",
            "0.0975 es P(X=2) — dos piezas defectuosas. Para exactamente 1, usa C(4,1)·0.15¹·0.85³ = 0.3685.",
            null,
            "0.0115 es P(X=3). Para X=1 la fórmula es C(4,1)·p¹·(1-p)³ = 4×0.15×0.614 = 0.3685."
          ]
        },
        {
          text: "¿Cuántas piezas defectuosas se esperan en promedio por cada 4 inspeccionadas?",
          opts: ["0.15", "0.45", "0.60", "0.85"], correct: 2,
          exp: "E(X) = n·p = 4 × 0.15 = 0.60 piezas defectuosas esperadas.",
          feedbacks: [
            "0.15 es la probabilidad p de cada pieza, no el valor esperado del lote. E(X) = n·p = 4×0.15 = 0.60.",
            "0.45 no corresponde a ningún cálculo válido aquí. Recuerda: E(X) = n·p = 4 × 0.15.",
            null,
            "0.85 = 1-p es la probabilidad de NO defecto. El valor esperado se calcula multiplicando n·p, no n·(1-p)."
          ]
        },
        {
          text: "¿Cuál es P(X = 0)? (ninguna pieza defectuosa)",
          opts: ["0.3685", "0.5220", "0.4780", "0.0975"], correct: 1,
          exp: "P(X=0) = 0.85⁴ = 0.5220 = 52.2%. Más de la mitad de las veces no habrá defectos.",
          feedbacks: [
            "0.3685 es P(X=1). Para X=0, ninguna pieza falla: P(X=0) = (1-p)ⁿ = 0.85⁴ = 0.5220.",
            null,
            "0.4780 = 1 - 0.5220. Ese sería P(X≥1), no P(X=0). Para cero defectos: P(X=0) = 0.85⁴.",
            "0.0975 es P(X=2). Para X=0 todos deben ser NO defectuosos: P = (0.85)⁴ = 0.5220."
          ]
        },
      ],
      color: A, icon: "🏭", badge: "Manufactura / Ingeniería"
    },
    {
      titulo: "Caso 2 — Campañas de Marketing Digital",
      contexto: "Históricamente el 40% de los usuarios que reciben un email de oferta hacen clic en el enlace. Se envía la campaña a 5 usuarios seleccionados. Sea X = número que hace clic.",
      variable: "X ~ B(n=5, p=0.40)",
      distribucion: [
        { k: 0, prob: 0.0778, formula: "C(5,0)·0.4⁰·0.6⁵", label: "0 clics" },
        { k: 1, prob: 0.2592, formula: "C(5,1)·0.4¹·0.6⁴", label: "1 clic" },
        { k: 2, prob: 0.3456, formula: "C(5,2)·0.4²·0.6³", label: "2 clics" },
        { k: 3, prob: 0.2304, formula: "C(5,3)·0.4³·0.6²", label: "3 clics" },
        { k: 4, prob: 0.0768, formula: "C(5,4)·0.4⁴·0.6¹", label: "4 clics" },
        { k: 5, prob: 0.0102, formula: "C(5,5)·0.4⁵·0.6⁰", label: "5 clics" },
      ],
      EX: 2.0, EX_formula: "E(X) = n·p = 5 × 0.40 = 2.00",
      preguntas: [
        {
          text: "¿Cuál es P(X = 2)? (exactamente 2 usuarios hacen clic)",
          opts: ["0.2592", "0.2304", "0.3456", "0.0778"], correct: 2,
          exp: "P(X=2) = C(5,2)·0.4²·0.6³ = 10 × 0.16 × 0.216 = 0.3456 = 34.56%",
          feedbacks: [
            "0.2592 es P(X=1). Para X=2 necesitas C(5,2)·0.4²·0.6³ = 10×0.16×0.216 = 0.3456.",
            "0.2304 es P(X=3). Atención: C(5,2) = 10, no C(5,3) = 10 también, pero las potencias cambian: 0.4²·0.6³ ≠ 0.4³·0.6².",
            null,
            "0.0778 es P(X=0). Para X=2: C(5,2)·p²·(1-p)³ = 10 × 0.16 × 0.216 = 0.3456."
          ]
        },
        {
          text: "¿Cuántos clics se esperan en promedio por cada envío de 5 emails?",
          opts: ["1.0", "1.5", "2.0", "2.5"], correct: 2,
          exp: "E(X) = n·p = 5 × 0.40 = 2.00 clics esperados por campaña.",
          feedbacks: [
            "1.0 no corresponde a n·p. La fórmula del valor esperado es E(X) = n×p = 5×0.40 = 2.0.",
            "1.5 tampoco es correcto. No se divide p entre n. E(X) = n·p = 5 × 0.40 = 2.0.",
            null,
            "2.5 = 5×0.5, como si p fuera 50%. Pero p = 0.40 en este caso. E(X) = 5×0.40 = 2.0."
          ]
        },
        {
          text: "¿Cuál es P(X ≥ 3)? (al menos 3 hacen clic)",
          opts: ["0.2304", "0.3174", "0.0870", "0.2592"], correct: 1,
          exp: "P(X≥3) = P(3)+P(4)+P(5) = 0.2304+0.0768+0.0102 = 0.3174 = 31.74%",
          feedbacks: [
            "0.2304 es solo P(X=3). Para X≥3 debes sumar P(3)+P(4)+P(5) = 0.2304+0.0768+0.0102 = 0.3174.",
            null,
            "0.0870 = P(4)+P(5) = 0.0768+0.0102. Te faltó sumar P(X=3) = 0.2304. P(X≥3) incluye X=3,4,5.",
            "0.2592 es P(X=1). Para 'al menos 3' debes sumar todos los casos donde X=3, X=4 y X=5."
          ]
        },
      ],
      color: V, icon: "📱", badge: "Marketing / Negocios"
    },
    {
      titulo: "Caso 3 — Detección de Fraude Financiero",
      contexto: "Un sistema automático detecta correctamente el 70% de las transacciones fraudulentas. Se analizan 3 transacciones sospechosas. Sea X = número de fraudes correctamente detectados.",
      variable: "X ~ B(n=3, p=0.70)",
      distribucion: [
        { k: 0, prob: 0.027, formula: "C(3,0)·0.7⁰·0.3³", label: "0 detectados" },
        { k: 1, prob: 0.189, formula: "C(3,1)·0.7¹·0.3²", label: "1 detectado" },
        { k: 2, prob: 0.441, formula: "C(3,2)·0.7²·0.3¹", label: "2 detectados" },
        { k: 3, prob: 0.343, formula: "C(3,3)·0.7³·0.3⁰", label: "3 detectados" },
      ],
      EX: 2.1, EX_formula: "E(X) = n·p = 3 × 0.70 = 2.10",
      preguntas: [
        {
          text: "¿Cuál es P(X = 3)? (los 3 fraudes son detectados)",
          opts: ["0.027", "0.189", "0.441", "0.343"], correct: 3,
          exp: "P(X=3) = 0.7³ = 0.343 = 34.3%. El sistema detecta los 3 en más de 1 de cada 3 casos.",
          feedbacks: [
            "0.027 es P(X=0) — que ninguno sea detectado = 0.3³. Para los 3 detectados usa p³ = 0.7³ = 0.343.",
            "0.189 es P(X=1). Para X=3 (todos detectados): C(3,3)·0.7³·0.3⁰ = 1×0.343×1 = 0.343.",
            "0.441 es P(X=2). Para que los 3 sean detectados, todos deben tener éxito: P = 0.7³ = 0.343.",
            null
          ]
        },
        {
          text: "¿Cuántos fraudes se espera detectar en promedio de cada 3?",
          opts: ["1.5", "1.8", "2.1", "2.4"], correct: 2,
          exp: "E(X) = n·p = 3 × 0.70 = 2.10 detecciones esperadas por lote de 3.",
          feedbacks: [
            "1.5 = 3×0.5, como si p fuera 50%. Pero la tasa de detección es p = 0.70. E(X) = 3×0.70 = 2.1.",
            "1.8 no corresponde a ningún cálculo con n=3, p=0.70. E(X) = n·p = 3×0.70 = 2.1.",
            null,
            "2.4 = 3×0.8. Estás usando un p distinto. La tasa real es p = 0.70, entonces E(X) = 3×0.70 = 2.1."
          ]
        },
        {
          text: "¿Cuál es P(X ≤ 1)? (se detecta 0 o solo 1 fraude)",
          opts: ["0.027", "0.189", "0.216", "0.343"], correct: 2,
          exp: "P(X≤1) = P(X=0)+P(X=1) = 0.027+0.189 = 0.216 = 21.6%. Riesgo de baja detección.",
          feedbacks: [
            "0.027 es solo P(X=0). Para X≤1 necesitas sumar P(X=0) + P(X=1) = 0.027 + 0.189 = 0.216.",
            "0.189 es solo P(X=1). El evento X≤1 incluye tanto X=0 como X=1: 0.027 + 0.189 = 0.216.",
            null,
            "0.343 es P(X=3). Para 'a lo más 1 detección' suma los casos X=0 y X=1: 0.027+0.189 = 0.216."
          ]
        },
      ],
      color: C, icon: "💳", badge: "Finanzas / Banca"
    },
  ];

  const caso = CASOS[casoIdx];
  const preguntas = caso.preguntas;
  const respuestasCaso = respuestas[casoIdx] || {};
  const allAnswered = Object.keys(respuestasCaso).length === preguntas.length;
  const correctCount = preguntas.filter((q, i) => respuestasCaso[i] === q.correct).length;

  const handleAnswer = (qi, oi) => {
    if (respuestasCaso[qi] !== undefined) return;
    const newR = { ...respuestas, [casoIdx]: { ...respuestasCaso, [qi]: oi } };
    setRespuestas(newR);
    if (Object.keys({ ...respuestasCaso, [qi]: oi }).length === preguntas.length) {
      const correct = preguntas.filter((q, i) => ({ ...respuestasCaso, [qi]: oi }[i] === q.correct)).length;
      if (onScore) onScore({ section: 5, score: correct, total: preguntas.length, caso: casoIdx });
    }
  };

  const sumCheck = caso.distribucion.reduce((a, d) => a + d.prob, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Banner */}
      <div style={{
        background: `${P}10`, border: `1px solid ${P}30`, borderRadius: 16, padding: 20,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Activity style={{ color: P, width: 24, height: 24 }} />
          <div>
            <h4 style={{ color: "white", fontWeight: 900, fontSize: 16, marginBottom: 4 }}>
              🌐 Aplicaciones — Distribución Binomial
            </h4>
            <p style={{ color: "#64748b", fontSize: 13 }}>
              3 casos reales en áreas distintas. La misma fórmula, contextos completamente diferentes.
            </p>
          </div>
        </div>
      </div>

      {/* Selector de casos */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {CASOS.map((c, i) => (
          <button key={i} onClick={() => setCasoIdx(i)} style={{
            padding: "9px 18px", borderRadius: 20, border: "none", cursor: "pointer",
            fontWeight: 800, fontSize: 12,
            background: casoIdx === i ? `linear-gradient(135deg,${c.color},${c.color}cc)` : `${c.color}12`,
            color: casoIdx === i ? "white" : c.color,
            boxShadow: casoIdx === i ? `0 4px 14px ${c.color}40` : "none",
            outline: casoIdx !== i ? `1px solid ${c.color}30` : "none",
            transition: "all 0.2s",
            display: "flex", alignItems: "center", gap: 7
          }}>
            <span>{c.icon}</span>
            <span>Caso {i + 1}</span>
            {respuestas[i] && Object.keys(respuestas[i]).length === CASOS[i].preguntas.length && (
              <span style={{ fontFamily: "monospace", fontSize: 11 }}>
                ✓ {CASOS[i].preguntas.filter((q, j) => respuestas[i][j] === q.correct).length}/{CASOS[i].preguntas.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Caso activo */}
      <div style={{ background: "#111118", border: `1px solid ${caso.color}25`, borderRadius: 20, padding: 28 }}>

        {/* Header del caso */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 13, background: `${caso.color}20`,
            border: `1px solid ${caso.color}35`, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 24, flexShrink: 0
          }}>{caso.icon}</div>
          <div>
            <span style={{
              display: "inline-block", padding: "3px 12px", borderRadius: 20,
              background: `${caso.color}15`, color: caso.color, fontWeight: 800, fontSize: 11,
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8
            }}>{caso.badge}</span>
            <h4 style={{ color: "white", fontWeight: 900, fontSize: 17 }}>{caso.titulo}</h4>
          </div>
        </div>

        {/* Contexto */}
        <div style={{
          padding: "16px 18px", borderRadius: 14, background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)", marginBottom: 20
        }}>
          <p style={{ color: "#e2e8f0", fontSize: 14, lineHeight: 1.8 }}>{caso.contexto}</p>
          <p style={{
            color: caso.color, fontWeight: 900, fontSize: 14, marginTop: 10,
            fontFamily: "Georgia,serif"
          }}>{caso.variable}</p>
        </div>

        {/* Distribución */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h5 style={{ color: "white", fontWeight: 900, fontSize: 15 }}>Distribución de Probabilidad</h5>
            <span style={{ color: "#64748b", fontSize: 12, fontFamily: "monospace" }}>
              Σ P(X=k) = {sumCheck.toFixed(4)} ≈ 1 ✅
            </span>
          </div>

          {/* Gráfico */}
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={caso.distribucion.map(d => ({ name: `X=${d.k}`, prob: d.prob, label: d.label }))}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={v => (v * 100).toFixed(0) + "%"} />
              <ReferenceLine x={`X=${Math.round(caso.EX)}`} stroke={P} strokeDasharray="5 3"
                label={{ value: `E(X)=${caso.EX}`, fill: P, fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: `1px solid ${caso.color}30`, borderRadius: 10 }}
                formatter={(v, n, p) => [(v * 100).toFixed(2) + "%", "P(X=k)"]}
                labelFormatter={l => l} />
              <Bar dataKey="prob" fill={caso.color} radius={[6, 6, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>

          {/* Tabla de distribución */}
          <div style={{ overflowX: "auto", marginTop: 12 }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px" }}>
              <thead>
                <tr>{["k", "P(X=k)", "Fórmula", "F(k)=P(X≤k)", "k·P(X=k)"].map((h, i) => (
                  <th key={i} style={{
                    padding: "6px 12px", textAlign: "center",
                    color: "#64748b", fontSize: 11, fontWeight: 800,
                    textTransform: "uppercase", letterSpacing: "0.07em"
                  }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {caso.distribucion.reduce((acc, d, i) => {
                  const cumulative = acc.cumSum + d.prob;
                  acc.rows.push(
                    <tr key={i}>
                      <td style={{ padding: "8px 12px", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "8px 0 0 8px", color: caso.color, fontWeight: 900, fontSize: 14 }}>{d.k}</td>
                      <td style={{ padding: "8px 12px", textAlign: "center", background: "rgba(255,255,255,0.02)", color: "white", fontWeight: 700 }}>{d.prob.toFixed(4)}</td>
                      <td style={{ padding: "8px 12px", textAlign: "center", background: "rgba(255,255,255,0.02)", color: "#64748b", fontSize: 11, fontFamily: "monospace" }}>{d.formula}</td>
                      <td style={{ padding: "8px 12px", textAlign: "center", background: "rgba(255,255,255,0.02)", color: C, fontWeight: 700 }}>{cumulative.toFixed(4)}</td>
                      <td style={{ padding: "8px 12px", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "0 8px 8px 0", color: P, fontFamily: "monospace", fontWeight: 700 }}>{(d.k * d.prob).toFixed(4)}</td>
                    </tr>
                  );
                  acc.cumSum = cumulative;
                  return acc;
                }, { rows: [], cumSum: 0 }).rows}
                {/* Fila E(X) */}
                <tr>
                  <td colSpan={4} style={{ padding: "8px 12px", background: `${P}08`, borderRadius: "8px 0 0 8px", color: "#64748b", fontSize: 12, fontWeight: 700, textAlign: "right" }}>E(X) = Σ k·P(X=k) =</td>
                  <td style={{ padding: "8px 12px", background: `${P}08`, borderRadius: "0 8px 8px 0", color: P, fontWeight: 900, fontSize: 16, textAlign: "center", fontFamily: "Georgia,serif" }}>{caso.EX}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* E(X) destacado */}
          <div style={{
            marginTop: 14, padding: "12px 18px", borderRadius: 12,
            background: `${P}12`, border: `1.5px solid ${P}30`,
            display: "flex", alignItems: "center", gap: 12
          }}>
            <Calculator style={{ color: P, width: 18, height: 18, flexShrink: 0 }} />
            <p style={{ color: "#e2e8f0", fontSize: 14 }}>
              <strong style={{ color: P }}>{caso.EX_formula}</strong>
              &nbsp;— En promedio se esperan <strong style={{ color: "white" }}>{caso.EX} pacientes</strong> por grupo.
            </p>
          </div>
        </div>

        {/* Preguntas de aplicación */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 20 }}>
          <h5 style={{ color: "white", fontWeight: 900, fontSize: 15, marginBottom: 16 }}>
            🧠 Preguntas de Aplicación
          </h5>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {preguntas.map((q, qi) => {
              const ans = respuestasCaso[qi];
              const show = ans !== undefined;
              return (
                <div key={qi} style={{
                  padding: "18px 20px", borderRadius: 14,
                  background: show ? (ans === q.correct ? `${G}08` : `${R}08`) : "rgba(255,255,255,0.02)",
                  border: `1px solid ${show ? (ans === q.correct ? `${G}25` : `${R}25`) : "rgba(255,255,255,0.07)"}`,
                  transition: "all 0.2s"
                }}>
                  <p style={{ color: "white", fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
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
                          background: show ? (isOk ? `${G}20` : isSel ? `${R}20` : "rgba(255,255,255,0.03)") : (isSel ? `${caso.color}20` : "rgba(255,255,255,0.04)"),
                          color: show ? (isOk ? G : isSel ? R : "#64748b") : (isSel ? caso.color : "#94a3b8"),
                          outline: show ? (isOk ? `1.5px solid ${G}` : isSel ? `1.5px solid ${R}` : `1px solid rgba(255,255,255,0.06)`) : (isSel ? `1.5px solid ${caso.color}` : `1px solid rgba(255,255,255,0.06)`),
                          display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s"
                        }}>
                          <span style={{
                            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                            background: show && isOk ? G : show && isSel ? R : isSel ? caso.color : "rgba(255,255,255,0.06)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 900, color: "white"
                          }}>
                            {String.fromCharCode(65 + oi)}
                          </span>
                          {o}
                        </button>
                      );
                    })}
                  </div>
                  {show && (
                    <div style={{
                      padding: "12px 16px", borderRadius: 11,
                      background: ans === q.correct ? `${G}12` : `${R}10`,
                      border: `1px solid ${ans === q.correct ? G : R}25`
                    }}>
                      {ans === q.correct ? (
                        <p style={{ color: "#a3e3c6", fontSize: 13, lineHeight: 1.6 }}>
                          <strong style={{ color: G }}>✅ Correcto. </strong>{q.exp}
                        </p>
                      ) : (
                        <div>
                          <p style={{ color: "#fca5a5", fontWeight: 800, fontSize: 12, marginBottom: 5 }}>
                            ❌ Incorrecto — elegiste la opción {String.fromCharCode(65 + ans)}
                          </p>
                          {q.feedbacks && q.feedbacks[ans] && (
                            <p style={{ color: "#fca5a5", fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
                              ⚠️ {q.feedbacks[ans]}
                            </p>
                          )}
                          <p style={{
                            color: "#94a3b8", fontSize: 12, lineHeight: 1.6,
                            paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.07)"
                          }}>
                            <strong style={{ color: G }}>Respuesta correcta: </strong>{q.exp}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Resultado del caso */}
          {allAnswered && (
            <div style={{
              marginTop: 20, padding: "16px 20px", borderRadius: 14,
              background: `linear-gradient(135deg,${caso.color}15,${P}10)`,
              border: `1.5px solid ${caso.color}40`,
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Award style={{ color: caso.color, width: 22, height: 22 }} />
                <div>
                  <p style={{ color: "white", fontWeight: 900, fontSize: 15 }}>
                    Caso {casoIdx + 1}: {correctCount}/{preguntas.length} correctas
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: 12 }}>
                    {correctCount === preguntas.length
                      ? "¡Excelente dominio clínico! 🎉"
                      : correctCount >= preguntas.length * 0.6
                        ? "Buen trabajo. Repasa los cálculos incorrectos."
                        : "Revisa la distribución binomial y sus fórmulas."}
                  </p>
                </div>
              </div>
              {casoIdx < CASOS.length - 1 && (
                <button onClick={() => setCasoIdx(casoIdx + 1)} style={{
                  padding: "10px 22px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg,${CASOS[casoIdx + 1].color},${CASOS[casoIdx + 1].color}cc)`,
                  color: "white", fontWeight: 800, fontSize: 13,
                  boxShadow: `0 4px 14px ${CASOS[casoIdx + 1].color}40`
                }}>
                  Caso {casoIdx + 2}: {CASOS[casoIdx + 1].icon} →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
// SISTEMA DE PUNTUACIÓN GLOBAL
// ════════════════════════════════════════════════════════
const useScoreSystem = () => {
  const [scores, setScores] = useState({});
  const updateScore = useCallback((data) => {
    setScores(prev => ({ ...prev, [data.section]: data }));
  }, []);
  const totalScore = Object.values(scores).reduce((a, s) => a + (s.score || 0), 0);
  const totalPossible = Object.values(scores).reduce((a, s) => a + (s.total || 0), 0);
  const pct = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
  const sectionsCompleted = Object.keys(scores).length;
  return { scores, updateScore, totalScore, totalPossible, pct, sectionsCompleted };
};

// ────────────────────────────────────────────────────────
// BARRA DE PUNTUACIÓN FIJA
// ────────────────────────────────────────────────────────
const ScoreBar = ({ scores, totalScore, totalPossible, pct, sectionsCompleted }) => {
  const SMETA = [
    { id: 1, label: "Experimento", color: V, emoji: "🎲" },
    { id: 2, label: "Espacio", color: C, emoji: "🧩" },
    { id: 3, label: "Axiomas", color: G, emoji: "⚖️" },
    { id: 4, label: "Empírica", color: A, emoji: "📊" },
    { id: 5, label: "Aplicaciones", color: P, emoji: "🌐" },
  ];
  const rc = pct >= 90 ? G : pct >= 70 ? A : pct >= 50 ? C : R;
  return (
    <div style={{
      background: "#0d0d14", border: `1px solid ${V}20`, borderRadius: 18, padding: "13px 18px",
      marginBottom: 18, position: "sticky", top: 66, zIndex: 10, backdropFilter: "blur(12px)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13, flexWrap: "wrap" }}>
        {/* Círculo */}
        <div style={{
          width: 46, height: 46, borderRadius: "50%",
          background: `conic-gradient(${rc} ${pct * 3.6}deg,rgba(255,255,255,0.05) 0deg)`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: "#0d0d14",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ color: rc, fontWeight: 900, fontSize: 12 }}>{pct}%</span>
          </div>
        </div>
        <div style={{ marginRight: 6 }}>
          <p style={{ color: "white", fontWeight: 900, fontSize: 13 }}>{totalScore}/{totalPossible} pts</p>
          <p style={{ color: rc, fontWeight: 800, fontSize: 11 }}>
            {pct >= 90 ? "Excelente" : pct >= 70 ? "Bueno" : pct >= 50 ? "Regular" : "Iniciando"}
          </p>
        </div>
        {/* Chips */}
        <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
          {SMETA.map(s => {
            const sc = scores[s.id], done = !!sc;
            const sp = done ? Math.round((sc.score / sc.total) * 100) : null;
            return (
              <div key={s.id} style={{
                padding: "4px 10px", borderRadius: 20,
                background: done ? `${s.color}15` : "rgba(255,255,255,0.03)",
                border: `1px solid ${done ? s.color + "30" : "rgba(255,255,255,0.06)"}`,
                display: "flex", alignItems: "center", gap: 5, transition: "all 0.3s"
              }}>
                <span style={{ fontSize: 11 }}>{s.emoji}</span>
                <span style={{ color: done ? s.color : "#475569", fontWeight: 700, fontSize: 11 }}>{s.label}</span>
                {done && <span style={{
                  color: "white", fontWeight: 900, fontSize: 10,
                  padding: "1px 6px", borderRadius: 20,
                  background: sp >= 70 ? `${G}35` : sp >= 50 ? `${A}35` : `${R}35`
                }}>{sp}%</span>}
              </div>
            );
          })}
        </div>
        {/* Puntos */}
        <div style={{ display: "flex", gap: 4 }}>
          {SMETA.map((_, i) => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: "50%",
              background: i < sectionsCompleted ? SMETA[i].color : "rgba(255,255,255,0.08)",
              transition: "all 0.3s"
            }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────
// RESUMEN FINAL — CIERRE COGNITIVO
// ────────────────────────────────────────────────────────
const ResumenFinal = ({ scores, totalScore, totalPossible, pct, onReset }) => {
  const [showConclusion, setShowConclusion] = useState(true);
  const rc = pct >= 90 ? G : pct >= 70 ? A : pct >= 50 ? C : R;
  const em = pct >= 90 ? "🏆" : pct >= 70 ? "⭐" : pct >= 50 ? "👍" : "💪";
  const msg = pct >= 90 ? "¡Dominio completo! Estás listo/a para el Lab 5.2."
    : pct >= 70 ? "Buen desempeño. Repasa los conceptos marcados."
      : pct >= 50 ? "Progreso aceptable. Revisa la teoría antes de continuar."
        : "Continúa practicando. Vuelve a la introducción.";

  const CONCEPTOS = [
    { emoji: "🎲", titulo: "Experimento Aleatorio", def: "Proceso con resultado incierto. Base de la probabilidad.", formula: "X : S → ℝ", color: V, seccion: 1, peso: "base" },
    { emoji: "🧩", titulo: "Espacio Muestral S", def: "Todos los resultados posibles del experimento.", formula: "S = {e₁, e₂, ..., eₙ}", color: C, seccion: 2, peso: "base" },
    { emoji: "⚖️", titulo: "Axiomas de Kolmogorov", def: "P(A)≥0 · P(S)=1 · Aditividad. Garantizan coherencia.", formula: "P(A)≥0 · P(S)=1", color: G, seccion: 3, peso: "base" },
    { emoji: "📊", titulo: "PMF — P(X=x)", def: "Asigna probabilidad a cada valor. Σf(x)=1.", formula: "Σ P(X=x) = 1", color: V, seccion: null, peso: "clave" },
    { emoji: "📈", titulo: "CDF — F(x)=P(X≤x)", def: "Función acumulada. Responde: ¿qué % tiene X o menos?", formula: "F(x) = P(X ≤ x)", color: C, seccion: null, peso: "clave" },
    { emoji: "🔢", titulo: "Valor Esperado E(X)", def: "Promedio ponderado. El centro de la distribución.", formula: "E(X) = Σ x · P(X=x)", color: P, seccion: null, peso: "clave" },
    { emoji: "📉", titulo: "Probabilidad Empírica", def: "Frecuencia observada. Converge a la teórica con n→∞.", formula: "P̂(A) = f/n → P(A)", color: A, seccion: 4, peso: "base" },
    { emoji: "🌐", titulo: "Distribución Binomial", def: "Modelo para contar éxitos en n ensayos independientes.", formula: "P(X=k)=C(n,k)·pᵏ·(1-p)ⁿ⁻ᵏ", color: R, seccion: 5, peso: "clave" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── HERO DE PUNTUACIÓN ── */}
      <div style={{
        background: `linear-gradient(135deg,${rc}20,${rc}06)`, border: `2px solid ${rc}45`,
        borderRadius: 24, padding: 34, textAlign: "center", position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle,${rc}08 1px,transparent 1px)`,
          backgroundSize: "28px 28px", pointerEvents: "none"
        }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>{em}</div>
          <h2 style={{ color: "white", fontWeight: 900, fontSize: 24, marginBottom: 6 }}>
            ¡Laboratorio 5.1 Completado!
          </h2>
          <p style={{ fontFamily: "Georgia,serif", fontSize: 26, fontWeight: 900, color: rc, marginBottom: 8 }}>
            {pct}% — {totalScore}/{totalPossible} pts
          </p>
          <p style={{ color: "#94a3b8", fontSize: 14, maxWidth: 460, margin: "0 auto 18px", lineHeight: 1.7 }}>
            {msg}
          </p>
          <div style={{ display: "flex", gap: 9, justifyContent: "center", flexWrap: "wrap" }}>
            {[{ label: "Secciones", val: "5/5", icon: "🏆", color: A },
            { label: "Puntos", val: `${totalScore}`, icon: "⭐", color: V },
            { label: "Precisión", val: `${pct}%`, icon: "🎯", color: rc }
            ].map((m, i) => (
              <div key={i} style={{
                padding: "8px 16px", borderRadius: 20,
                background: `${m.color}15`, border: `1px solid ${m.color}35`,
                display: "flex", alignItems: "center", gap: 7
              }}>
                <span>{m.icon}</span>
                <span style={{ color: "#64748b", fontSize: 12 }}>{m.label}:</span>
                <span style={{ color: "white", fontWeight: 900, fontSize: 13 }}>{m.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CIERRE CONCEPTUAL ── */}
      <div style={{ background: "#111118", border: `1.5px solid ${V}30`, borderRadius: 20, overflow: "hidden" }}>
        <button
          onClick={() => setShowConclusion(s => !s)}
          style={{
            width: "100%", padding: "18px 24px", background: "transparent", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${V},${C})`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <Brain style={{ color: "white", width: 18, height: 18 }} />
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ color: "white", fontWeight: 900, fontSize: 16 }}>🧠 Conclusión del Laboratorio</p>
              <p style={{ color: "#64748b", fontSize: 12 }}>Los 3 conceptos que debes dominar antes de seguir</p>
            </div>
          </div>
          <ChevronRight style={{
            color: V, width: 18, height: 18,
            transform: showConclusion ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s"
          }} />
        </button>

        {showConclusion && (
          <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Concepto 1 */}
            <div style={{
              padding: "18px 20px", borderRadius: 14,
              background: `${V}10`, border: `1.5px solid ${V}30`
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{
                  padding: "3px 10px", borderRadius: 20, background: `${V}25`,
                  color: V, fontWeight: 900, fontSize: 11
                }}>01</span>
                <p style={{ color: "white", fontWeight: 900, fontSize: 15 }}>
                  ¿Qué es una variable aleatoria?
                </p>
              </div>
              <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.8, marginBottom: 10 }}>
                Una <strong style={{ color: "white" }}>variable aleatoria X</strong> es una función que convierte
                resultados cualitativos en <strong style={{ color: V }}>números</strong>.
                Cuando lanzas una moneda obtienes "Cara" o "Cruz" — valores no numéricos.
                X transforma eso en 0 y 1 para poder hacer matemáticas.
                Sin esta transformación, no hay distribución posible.
              </p>
              <div style={{
                padding: "8px 14px", borderRadius: 10, background: `${V}15`,
                border: `1px solid ${V}25`, fontFamily: "monospace", fontSize: 13, color: V, textAlign: "center"
              }}>
                X : S → ℝ &nbsp;&nbsp;→&nbsp;&nbsp; X(Cruz)=0, X(Cara)=1
              </div>
            </div>

            {/* Concepto 2 */}
            <div style={{
              padding: "18px 20px", borderRadius: 14,
              background: `${C}10`, border: `1.5px solid ${C}30`
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{
                  padding: "3px 10px", borderRadius: 20, background: `${C}25`,
                  color: C, fontWeight: 900, fontSize: 11
                }}>02</span>
                <p style={{ color: "white", fontWeight: 900, fontSize: 15 }}>
                  ¿Qué diferencia hay entre probabilidad teórica y empírica?
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                <div style={{
                  padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)"
                }}>
                  <p style={{ color: V, fontWeight: 900, fontSize: 12, marginBottom: 6 }}>📐 Teórica</p>
                  <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.7 }}>
                    Se calcula con lógica o modelos matemáticos.
                    <strong style={{ color: "white" }}> P(Cara) = 1/2 = 0.5</strong> porque la moneda
                    tiene 2 caras iguales. No necesitas lanzar ninguna moneda.
                  </p>
                </div>
                <div style={{
                  padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)"
                }}>
                  <p style={{ color: A, fontWeight: 900, fontSize: 12, marginBottom: 6 }}>📊 Empírica</p>
                  <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.7 }}>
                    Se mide observando resultados reales.
                    <strong style={{ color: "white" }}> P̂(Cara) = 53/100 = 0.53</strong> después
                    de 100 lanzamientos. Con más datos, converge a 0.5.
                  </p>
                </div>
              </div>
              <p style={{
                color: "#64748b", fontSize: 12, lineHeight: 1.7,
                padding: "8px 14px", borderRadius: 10, background: `${G}08`, border: `1px solid ${G}20`
              }}>
                💡 <strong style={{ color: G }}>Ley de Grandes Números:</strong> cuanto mayor es n,
                más se acerca P̂ a P. Por eso los seguros, casinos y modelos predictivos
                funcionan — tienen millones de observaciones.
              </p>
            </div>

            {/* Concepto 3 */}
            <div style={{
              padding: "18px 20px", borderRadius: 14,
              background: `${A}10`, border: `1.5px solid ${A}30`
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{
                  padding: "3px 10px", borderRadius: 20, background: `${A}25`,
                  color: A, fontWeight: 900, fontSize: 11
                }}>03</span>
                <p style={{ color: "white", fontWeight: 900, fontSize: 15 }}>
                  ¿Qué es una distribución de probabilidad?
                </p>
              </div>
              <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.8, marginBottom: 10 }}>
                Una <strong style={{ color: "white" }}>distribución</strong> no es un número — es un
                <strong style={{ color: A }}> mapa completo</strong> de todos los valores posibles de X
                y su probabilidad asociada. La PMF te dice{" "}
                <em style={{ color: "white" }}>"¿qué tan probable es X=k?"</em>, la CDF te dice{" "}
                <em style={{ color: "white" }}>"¿qué % tiene X≤k?"</em> y E(X) resume todo en un
                solo número: el valor central esperado.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "PMF", desc: "P(X=k)", color: V },
                  { label: "CDF", desc: "P(X≤k)", color: C },
                  { label: "E(X)", desc: "Σ k·P(k)", color: P },
                ].map((t, i) => (
                  <div key={i} style={{
                    flex: 1, minWidth: 80, padding: "8px 12px", borderRadius: 10,
                    background: `${t.color}15`, border: `1px solid ${t.color}30`, textAlign: "center"
                  }}>
                    <p style={{ color: t.color, fontWeight: 900, fontSize: 13 }}>{t.label}</p>
                    <p style={{ color: "#64748b", fontSize: 11, fontFamily: "monospace" }}>{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── PUENTE AL LAB 5.2 ── */}
      <div style={{
        background: `linear-gradient(135deg,${V}15,${C}10,${G}08)`,
        border: `2px solid ${V}35`, borderRadius: 20, padding: 26,
        position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: -20, right: -20, width: 140, height: 140,
          borderRadius: "50%", background: `${V}08`, pointerEvents: "none"
        }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg,${V},${C})`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <ChevronRight style={{ color: "white", width: 18, height: 18 }} />
            </div>
            <div>
              <p style={{
                color: V, fontWeight: 900, fontSize: 13, textTransform: "uppercase",
                letterSpacing: "0.1em"
              }}>Próximo paso</p>
              <p style={{ color: "white", fontWeight: 900, fontSize: 17 }}>Laboratorio 5.2 — Distribuciones Discretas Formales</p>
            </div>
          </div>

          <div style={{
            padding: "14px 18px", borderRadius: 14,
            background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: 16
          }}>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.9, fontStyle: "italic" }}>
              "Ahora que entiendes cómo se comportan las probabilidades individuales
              —qué es X, qué es P(X=k), qué significa E(X)— necesitas modelos que describan
              cómo se distribuyen <strong style={{ color: "white", fontStyle: "normal" }}>múltiples
                eventos del mismo tipo</strong>. ¿Cuántas piezas fallarán en una hora?
              ¿Cuántos clientes llegarán esta tarde? Para eso existen las distribuciones formales."
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
            {[
              { name: "Binomial B(n,p)", note: "Ya tienes la base de este lab. La formalizamos.", color: V, icon: "🎯", ready: true },
              { name: "Poisson λ", note: "Eventos raros en tiempo o espacio continuo.", color: C, icon: "⚡", ready: false },
              { name: "Hipergeométrica", note: "Muestreo sin reemplazo. Control de calidad.", color: A, icon: "🎲", ready: false },
              { name: "Uniforme Discreta", note: "Todos los valores tienen la misma probabilidad.", color: G, icon: "📏", ready: false },
            ].map((d, i) => (
              <div key={i} style={{
                padding: "12px 14px", borderRadius: 12,
                background: `${d.color}10`, border: `1px solid ${d.color}${d.ready ? "50" : "25"}`,
                display: "flex", alignItems: "flex-start", gap: 10,
                boxShadow: d.ready ? `0 0 14px ${d.color}20` : "none"
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{d.icon}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                    <p style={{ color: "white", fontWeight: 900, fontSize: 13 }}>{d.name}</p>
                    {d.ready && (
                      <span style={{
                        padding: "1px 7px", borderRadius: 20,
                        background: `${G}25`, color: G, fontSize: 10, fontWeight: 800
                      }}>
                        ✓ Base lista
                      </span>
                    )}
                  </div>
                  <p style={{ color: "#64748b", fontSize: 12 }}>{d.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONCEPTOS PRACTICADOS ── */}
      <div style={{ background: "#111118", border: `1px solid ${G}25`, borderRadius: 20, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 18 }}>
          <CheckCircle style={{ color: G, width: 21, height: 21 }} />
          <h3 style={{ color: "white", fontWeight: 900, fontSize: 18 }}>✅ Conceptos dominados</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {CONCEPTOS.map((c, i) => {
            const sc = c.seccion ? scores[c.seccion] : null;
            const sp = sc ? Math.round((sc.score / sc.total) * 100) : null;
            const esClave = c.peso === "clave";
            return (
              <div key={i} style={{
                padding: "12px 13px", borderRadius: 13,
                background: `${c.color}10`,
                border: `${esClave ? "2px" : "1px"} solid ${c.color}${esClave ? "50" : "30"}`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                  <span style={{ fontSize: 16 }}>{c.emoji}</span>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                    <CheckCircle style={{ color: G, width: 12, height: 12 }} />
                    {esClave && (
                      <span style={{
                        padding: "1px 5px", borderRadius: 20,
                        background: `${c.color}25`, color: c.color,
                        fontSize: 9, fontWeight: 900
                      }}>CLAVE</span>
                    )}
                  </div>
                </div>
                <p style={{ color: "white", fontWeight: 900, fontSize: 11, marginBottom: 3 }}>{c.titulo}</p>
                <p style={{ color: "#64748b", fontSize: 10, lineHeight: 1.5, marginBottom: 6 }}>{c.def}</p>
                <div style={{
                  padding: "3px 6px", borderRadius: 6, background: `${c.color}15`,
                  border: `1px solid ${c.color}20`
                }}>
                  <p style={{
                    fontFamily: "monospace", fontSize: 9, color: c.color,
                    fontWeight: 700, textAlign: "center"
                  }}>{c.formula}</p>
                </div>
                {sp !== null && (
                  <div style={{
                    marginTop: 5, padding: "2px 6px", borderRadius: 20,
                    background: sp >= 70 ? `${G}20` : sp >= 50 ? `${A}20` : `${R}20`, display: "inline-block"
                  }}>
                    <span style={{ color: sp >= 70 ? G : sp >= 50 ? A : R, fontSize: 9, fontWeight: 700 }}>
                      Práctica: {sp}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button onClick={onReset} style={{
          padding: "11px 28px", borderRadius: 13,
          border: `1px solid ${V}40`, background: `${V}15`, color: "#a78bfa",
          fontWeight: 800, fontSize: 14, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s"
        }}>
          <RotateCcw style={{ width: 14, height: 14 }} />Reiniciar práctica
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
// TAB PRÁCTICA — orquesta las 5 secciones
// ════════════════════════════════════════════════════════
const SECCIONES_META = [
  { id: 1, label: "Experimento Aleatorio", emoji: "🎲", color: V, desc: "Simuladores + preguntas formales" },
  { id: 2, label: "Espacio Muestral", emoji: "🧩", color: C, desc: "Construye S para 4 experimentos" },
  { id: 3, label: "Axiomas", emoji: "⚖️", color: G, desc: "Kolmogorov + distribución válida + E(X)" },
  { id: 4, label: "Prob. Empírica", emoji: "📊", color: A, desc: "Simulación + Ley de Grandes Números" },
  { id: 5, label: "Aplicaciones", emoji: "🌐", color: P, desc: "3 casos reales en áreas distintas" },
];

const TabPractica = ({ scores, onScore }) => {
  const [seccion, setSeccion] = useState(1);
  const [showResumen, setShowResumen] = useState(false);

  const totalScore = Object.values(scores).reduce((a, s) => a + (s.score || 0), 0);
  const totalPossible = Object.values(scores).reduce((a, s) => a + (s.total || 0), 0);
  const pct = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
  const sectionsCompleted = Object.keys(scores).length;
  const allDone = sectionsCompleted >= 5;

  // Avanzar automáticamente al completar si la sección siguiente no está visitada
  const goNext = () => {
    if (seccion < 5) setSeccion(s => s + 1);
    else setShowResumen(true);
  };
  const goPrev = () => { if (seccion > 1) setSeccion(s => s - 1); };

  if (showResumen) {
    return (
      <ResumenFinal
        scores={scores}
        totalScore={totalScore}
        totalPossible={totalPossible}
        pct={pct}
        onReset={() => { setShowResumen(false); setSeccion(1); }}
      />
    );
  }

  const meta = SECCIONES_META[seccion - 1];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* BARRA FIJA DE PUNTUACIÓN */}
      <ScoreBar
        scores={scores}
        totalScore={totalScore}
        totalPossible={totalPossible}
        pct={pct}
        sectionsCompleted={sectionsCompleted}
      />

      {/* NAVEGACIÓN DE SECCIONES — emojis compactos + barra de progreso */}
      <div style={{
        background: "#111118", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, padding: "12px 16px", marginBottom: 20
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          {/* Botones emoji compactos */}
          <div style={{ display: "flex", gap: 5, flex: 1 }}>
            {SECCIONES_META.map(s => {
              const done = !!scores[s.id];
              const active = s.id === seccion;
              return (
                <button key={s.id} onClick={() => setSeccion(s.id)}
                  title={s.label}
                  style={{
                    width: 40, height: 40, borderRadius: 11, border: "none", cursor: "pointer",
                    fontSize: 18, transition: "all 0.2s", flexShrink: 0,
                    background: active
                      ? `linear-gradient(135deg,${s.color},${s.color}cc)`
                      : done ? `${s.color}15` : "rgba(255,255,255,0.04)",
                    boxShadow: active ? `0 3px 10px ${s.color}45` : "none",
                    outline: !active ? `1px solid ${done ? s.color + "35" : "rgba(255,255,255,0.06)"}` : "none",
                    position: "relative"
                  }}>
                  {s.emoji}
                  {done && !active && (
                    <span style={{
                      position: "absolute", top: -3, right: -3,
                      width: 14, height: 14, borderRadius: "50%",
                      background: G, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 8, color: "white", fontWeight: 900,
                      border: "1.5px solid #111118"
                    }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>
          {/* Nombre de sección activa */}
          <div style={{ textAlign: "right" }}>
            <p style={{ color: meta.color, fontWeight: 800, fontSize: 13 }}>{meta.label}</p>
            <p style={{ color: "#475569", fontSize: 11 }}>{seccion} / 5</p>
          </div>
        </div>

        {/* Barra de progreso lineal */}
        <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 2,
            background: `linear-gradient(90deg,${meta.color},${meta.color}70)`,
            width: `${(seccion / 5) * 100}%`, transition: "width 0.4s ease"
          }} />
        </div>
      </div>

      {/* CONTENIDO DE LA SECCIÓN ACTIVA */}
      <div>
        {seccion === 1 && <PracticaExperimento onScore={onScore} />}
        {seccion === 2 && <PracticaEspacio onScore={onScore} />}
        {seccion === 3 && <PracticaAxiomas onScore={onScore} />}
        {seccion === 4 && <PracticaEmpirica onScore={onScore} />}
        {seccion === 5 && <PracticaClinica onScore={onScore} />}
      </div>

      {/* NAVEGACIÓN ANTERIOR / SIGUIENTE */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.07)"
      }}>
        <button onClick={goPrev} disabled={seccion === 1} style={{
          padding: "11px 22px", borderRadius: 12,
          border: `1px solid ${seccion === 1 ? "rgba(255,255,255,0.06)" : V + "40"}`,
          background: seccion === 1 ? "rgba(255,255,255,0.02)" : `${V}12`,
          color: seccion === 1 ? "#334155" : "#a78bfa",
          fontWeight: 800, fontSize: 13, cursor: seccion === 1 ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
        }}>
          <ChevronLeft style={{ width: 16, height: 16 }} />Anterior
        </button>

        <div style={{ display: "flex", gap: 5 }}>
          {SECCIONES_META.map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: i + 1 === seccion ? meta.color : i + 1 < seccion ? G : "rgba(255,255,255,0.1)",
              transition: "all 0.3s"
            }} />
          ))}
        </div>

        {seccion < 5 ? (
          <button onClick={goNext} style={{
            padding: "11px 22px", borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg,${SECCIONES_META[seccion]?.color || V},${SECCIONES_META[seccion]?.color || V}cc)`,
            color: "white", fontWeight: 800, fontSize: 13,
            boxShadow: `0 4px 14px ${SECCIONES_META[seccion]?.color || V}40`,
            display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
          }}>
            Siguiente&nbsp;{SECCIONES_META[seccion]?.emoji}
            <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        ) : (
          <button onClick={() => setShowResumen(true)} style={{
            padding: "11px 22px", borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg,${G},#059669)`,
            color: "white", fontWeight: 800, fontSize: 13,
            boxShadow: `0 4px 14px ${G}40`,
            display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
          }}>
            Ver Resumen Final 🏆
            <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL — Lab51
// Sin navbar propio — se integra en el LabRenderer de la app
// ════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════
// TABS DEFINITION — usada por Lab5_1 principal
// ════════════════════════════════════════════════════════
const TABS_DEF = [
  { id: "intro", label: "Introducción", icon: <BookOpen style={{ width: 14, height: 14 }} /> },
  { id: "explorer", label: "Explorador Visual", icon: <Eye style={{ width: 14, height: 14 }} /> },
  { id: "practica", label: "Práctica", icon: <Brain style={{ width: 14, height: 14 }} /> },
];

// ════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL — Lab5_1
// Mantiene la estructura original: goHome/setView, nav,
// hero "Sección 5.1", tabs y contenido mejorado v2.
// ════════════════════════════════════════════════════════
const Lab5_1 = ({ goHome, setView }) => {
  const [activeTab, setActiveTab] = useState("intro");
  const { scores, updateScore, totalScore, totalPossible, pct } = useScoreSystem();

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e2e8f0", fontFamily: "system-ui,sans-serif" }}>

      {/* Fondos decorativos */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-15%", right: "-10%", width: 700, height: 700, background: "radial-gradient(circle,rgba(139,92,246,0.06),transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: 600, height: 600, background: "radial-gradient(circle,rgba(6,182,212,0.05),transparent 65%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(139,92,246,0.035) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      {/* NAV — idéntico al original */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,15,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Botón volver */}
          <button
            onClick={() => { if (goHome) goHome(); else if (setView) setView("home"); }}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b", cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#a78bfa"; e.currentTarget.style.borderColor = `${V}40`; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
            <ArrowLeft style={{ width: 14, height: 14 }} />Volver al Índice
          </button>

          {/* Logo + título capítulo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Cap5Logo size={42} animate={true} />
            <div>
              <span style={{ display: "block", fontSize: 11, fontWeight: 800, color: V, textTransform: "uppercase", letterSpacing: "0.1em" }}>Capítulo 5</span>
              <span style={{ display: "block", fontWeight: 900, color: "white", fontSize: 14 }}>Distribuciones de Probabilidad Discretas</span>
            </div>
          </div>

          {/* Badge Lab 5.1 */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: `${V}12`, border: `1px solid ${V}25` }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: V, animation: "blink 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: "#a78bfa", letterSpacing: "0.1em", textTransform: "uppercase" }}>Lab 5.1</span>
          </div>

        </div>
      </nav>

      {/* CONTENIDO */}
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "34px 24px 80px", position: "relative" }}>

        {/* HERO — idéntico al original */}
        <div style={{ background: `linear-gradient(135deg,${V}12,${C}08,transparent)`, border: `1px solid ${V}20`, borderLeft: `4px solid ${V}`, borderRadius: 20, padding: "24px 28px", marginBottom: 28, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: 28, top: "50%", transform: "translateY(-50%)", opacity: 0.04, pointerEvents: "none" }}>
            <Cap5Logo size={110} />
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, background: `linear-gradient(135deg,${V}30,#4f46e530)`, border: `1px solid ${V}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Cap5Logo size={30} />
              </div>
              <span style={{ padding: "3px 14px", borderRadius: 20, background: `${V}15`, border: `1px solid ${V}25`, color: "#a78bfa", fontWeight: 900, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>Sección 5.1</span>
            </div>
            <h1 style={{ color: "white", fontWeight: 900, fontSize: 24, marginBottom: 8 }}>Fundamentos de Probabilidad</h1>
            <p style={{ color: "#64748b", fontSize: 14, maxWidth: 660, lineHeight: 1.65 }}>
              Explora los conceptos básicos: experimentos aleatorios, espacios muestrales, axiomas y probabilidad empírica con simulaciones interactivas en tiempo real.
            </p>
          </div>
        </div>

        {/* TABS — idénticos al original */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 14 }}>
          {TABS_DEF.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "10px 22px", borderRadius: 13, border: "none", cursor: "pointer",
              fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", gap: 7,
              background: activeTab === tab.id ? `linear-gradient(135deg,${V},#4f46e5)` : "rgba(255,255,255,0.04)",
              color: activeTab === tab.id ? "white" : "#64748b",
              boxShadow: activeTab === tab.id ? `0 4px 14px ${V}35` : "none",
              transition: "all 0.2s",
              position: "relative"
            }}>
              {tab.icon}{tab.label}
              {/* Badge de puntuación en tab Práctica */}
              {tab.id === "practica" && totalPossible > 0 && (
                <span style={{
                  padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 900,
                  background: pct >= 70 ? `${G}30` : `${A}30`,
                  color: pct >= 70 ? G : A
                }}>{pct}%</span>
              )}
            </button>
          ))}
        </div>

        {/* CONTENIDO SEGÚN TAB */}
        {activeTab === "intro" && <TabIntro />}
        {activeTab === "explorer" && <TabExplorer />}
        {activeTab === "practica" && (
          <TabPractica scores={scores} onScore={updateScore} />
        )}

        <div style={{ height: 60 }} />
      </div>

      <style>{`
        @keyframes logoPulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.75;transform:scale(1.05);} }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.25;} }
        * { box-sizing:border-box; margin:0; padding:0; }
        input[type=range] { height:5px; }
        button:not(:disabled):hover { filter:brightness(1.07); }
      `}</style>
    </div>
  );
};

export default Lab5_1;