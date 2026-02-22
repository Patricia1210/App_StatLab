import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  ArrowLeft, Activity, Info, Database, Brain,
  BarChart3, Download, Upload, Settings, Eye,
  CheckCircle, XCircle, Award, Zap, RefreshCw,
  TrendingUp, AlertTriangle, Table, BarChart2,
  Layers, FlaskConical, GitCompare, Medal,
  Percent, Palette, Target, BookOpen
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ErrorBar, Cell, LabelList
} from "recharts";
import Papa from "papaparse";

// ─────────────────────────────────────────────────────────
// DATASETS
// ─────────────────────────────────────────────────────────
const PRESET_DATASETS = {
  penguins: {
    label: "Pingüinos Palmer", file: "/DATASETS/penguins.csv",
    description: "344 pingüinos · 3 especies",
    catCol: "species", numCol: "flipper_length_mm",
    catLabel: "Especie", numLabel: "Longitud de Aleta (mm)",
    altCombos: [
      { cat: "species", num: "body_mass_g", catLabel: "Especie", numLabel: "Masa Corporal (g)" },
      { cat: "species", num: "bill_length_mm", catLabel: "Especie", numLabel: "Longitud del Pico (mm)" },
      { cat: "island", num: "body_mass_g", catLabel: "Isla", numLabel: "Masa Corporal (g)" },
      { cat: "sex", num: "body_mass_g", catLabel: "Sexo", numLabel: "Masa Corporal (g)" },
    ]
  },
  titanic: {
    label: "Titanic", file: "/DATASETS/titanic.csv",
    description: "891 pasajeros · supervivencia",
    catCol: "class", numCol: "age",
    catLabel: "Clase", numLabel: "Edad (años)",
    altCombos: [
      { cat: "sex", num: "age", catLabel: "Género", numLabel: "Edad (años)" },
      { cat: "class", num: "fare", catLabel: "Clase", numLabel: "Tarifa (£)" },
      { cat: "alive", num: "age", catLabel: "Sobrevivió", numLabel: "Edad (años)" },
      { cat: "embark_town", num: "fare", catLabel: "Puerto", numLabel: "Tarifa (£)" },
    ]
  },
  tips: {
    label: "Propinas (Tips)", file: "/DATASETS/tips.csv",
    description: "244 cuentas · restaurante",
    catCol: "day", numCol: "tip",
    catLabel: "Día", numLabel: "Propina (USD)",
    altCombos: [
      { cat: "sex", num: "tip", catLabel: "Género", numLabel: "Propina (USD)" },
      { cat: "smoker", num: "total_bill", catLabel: "Fumador", numLabel: "Cuenta Total (USD)" },
      { cat: "time", num: "tip", catLabel: "Horario", numLabel: "Propina (USD)" },
    ]
  },
  mpg: {
    label: "Automóviles (MPG)", file: "/DATASETS/mpg.csv",
    description: "398 vehículos · rendimiento",
    catCol: "origin", numCol: "horsepower",
    catLabel: "Origen", numLabel: "Potencia (HP)",
    altCombos: [
      { cat: "origin", num: "mpg", catLabel: "Origen", numLabel: "Rendimiento (mpg)" },
      { cat: "cylinders", num: "horsepower", catLabel: "Cilindros", numLabel: "Potencia (HP)" },
      { cat: "cylinders", num: "mpg", catLabel: "Cilindros", numLabel: "Rendimiento (mpg)" },
    ]
  },
  iris: {
    label: "Iris (Flores)", file: "/DATASETS/iris.csv",
    description: "150 flores · 3 variedades",
    catCol: "variety", numCol: "petal.length",
    catLabel: "Variedad", numLabel: "Longitud del Pétalo (cm)",
    altCombos: [
      { cat: "variety", num: "sepal.length", catLabel: "Variedad", numLabel: "Longitud del Sépalo (cm)" },
      { cat: "variety", num: "petal.width", catLabel: "Variedad", numLabel: "Ancho del Pétalo (cm)" },
      { cat: "variety", num: "sepal.width", catLabel: "Variedad", numLabel: "Ancho del Sépalo (cm)" },
    ]
  }
};

// ─────────────────────────────────────────────────────────
// PALETAS
// ─────────────────────────────────────────────────────────
const PALETTES = {
  violet: { name: "Violeta", colors: ["#a855f7", "#c084fc", "#7c3aed", "#d946ef", "#9333ea", "#e879f9", "#6d28d9", "#f0abfc"] },
  ocean: { name: "Océano", colors: ["#06b6d4", "#0891b2", "#22d3ee", "#0e7490", "#67e8f9", "#155e75", "#a5f3fc", "#164e63"] },
  sunset: { name: "Atardecer", colors: ["#f97316", "#ef4444", "#fb923c", "#dc2626", "#fdba74", "#b91c1c", "#fed7aa", "#991b1b"] },
  forest: { name: "Bosque", colors: ["#10b981", "#059669", "#34d399", "#047857", "#6ee7b7", "#065f46", "#a7f3d0", "#064e3b"] },
  cosmic: { name: "Cósmico", colors: ["#6366f1", "#ec4899", "#8b5cf6", "#f43f5e", "#a78bfa", "#fb7185", "#c4b5fd", "#fda4af"] },
};

// ─────────────────────────────────────────────────────────
// QUIZ
// ─────────────────────────────────────────────────────────
const QUIZ = [
  {
    id: 1,
    q: "¿Cuál es el objetivo principal del análisis de una variable categórica junto a una variable numérica?",
    opts: ["Calcular correlación de Pearson", "Entender cómo se comporta la variable numérica dentro de cada grupo categórico", "Crear una tabla de contingencia", "Determinar una regresión lineal"],
    correct: 1, exp: "El objetivo es detectar diferencias en los valores numéricos según la categoría de cada observación, como paso exploratorio previo."
  },
  {
    id: 2,
    q: "En un boxplot, ¿qué representa la línea central dentro de la caja?",
    opts: ["La media aritmética", "El valor máximo", "La mediana (percentil 50)", "La desviación estándar"],
    correct: 2, exp: "La línea central es la mediana: divide exactamente los datos en dos mitades iguales y es robusta ante valores atípicos."
  },
  {
    id: 3,
    q: "¿Qué indica la altura de la caja en un boxplot (IQR)?",
    opts: ["El rango completo de los datos", "El 50% central de los datos (Q1 a Q3)", "La desviación estándar ×2", "El promedio ± varianza"],
    correct: 1, exp: "El IQR = Q3 – Q1 contiene el 50% central de los datos. Una caja alta indica mayor variabilidad en el centro de la distribución."
  },
  {
    id: 4,
    q: "¿Para qué sirve el Coeficiente de Variación (CV)?",
    opts: ["Calcula la correlación entre grupos", "Mide la dispersión relativa respecto a la media, permitiendo comparar grupos con distintas escalas", "Determina la mediana de cada grupo", "Identifica el rango intercuartílico"],
    correct: 1, exp: "CV = (s/x̄)×100 expresa la variabilidad como % de la media. Permite comparar dispersión entre grupos aunque tengan diferentes unidades o magnitudes."
  },
  {
    id: 5,
    q: "¿Qué son los 'outliers' en un boxplot?",
    opts: ["Valores dentro del rango normal", "La media de cada grupo", "Puntos atípicos fuera del rango Q1 − 1.5×IQR o Q3 + 1.5×IQR", "Los extremos de los bigotes"],
    correct: 2, exp: "Los outliers se grafican como puntos fuera de los bigotes. Pueden representar errores de medición, casos especiales o datos que merecen atención particular."
  },
  {
    id: 6,
    q: "¿Para qué sirven las barras de error en un gráfico de barras con medias?",
    opts: ["Indican el mínimo y máximo de cada grupo", "Muestran la incertidumbre alrededor de la media estimada (IC 95%)", "Comparan la mediana entre grupos", "Señalan valores atípicos"],
    correct: 1, exp: "Las barras de error (IC 95%) indican qué tan precisa es la estimación de la media. Barras más cortas = estimación más precisa."
  },
  {
    id: 7,
    q: "¿Por qué es útil el análisis descriptivo por grupos ANTES de aplicar pruebas estadísticas?",
    opts: ["Porque reemplaza completamente las pruebas formales", "Porque permite entender patrones, detectar anomalías y formular hipótesis de forma preliminar", "Porque es más preciso que cualquier prueba estadística", "Porque solo funciona con datos categóricos"],
    correct: 1, exp: "El análisis exploratorio es el primer paso: permite conocer los datos, detectar outliers, visualizar diferencias y generar hipótesis antes de métodos inferenciales."
  },
  {
    id: 8,
    q: "Si el CV de un grupo es 45%, ¿cómo se interpreta?",
    opts: ["Baja variabilidad — grupo homogéneo", "Variabilidad moderada — dispersión aceptable", "Alta variabilidad — grupo muy heterogéneo", "No es posible interpretar el CV sin más información"],
    correct: 2, exp: "CV > 30% se considera alta variabilidad: los datos del grupo están muy dispersos alrededor de la media, lo que indica heterogeneidad interna."
  },
];

// ─────────────────────────────────────────────────────────
// ESTADÍSTICOS POR GRUPO
// ─────────────────────────────────────────────────────────
const computeGroupStats = (data, catCol, numCol) => {
  if (!data?.length) return [];
  const groups = {};
  data.forEach(row => {
    const cat = String(row[catCol] ?? "").trim();
    const val = parseFloat(row[numCol]);
    if (cat && cat !== "nan" && cat !== "undefined" && !isNaN(val))
      (groups[cat] = groups[cat] || []).push(val);
  });
  return Object.entries(groups).map(([cat, vals]) => {
    const n = vals.length;
    const sorted = [...vals].sort((a, b) => a - b);
    const mean = vals.reduce((s, v) => s + v, 0) / n;
    const variance = n > 1 ? vals.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1) : 0;
    const std = Math.sqrt(variance);
    const cv = mean !== 0 ? (std / mean) * 100 : 0;
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;
    const lf = q1 - 1.5 * iqr, uf = q3 + 1.5 * iqr;
    const ci95 = n > 1 ? 1.96 * (std / Math.sqrt(n)) : 0;
    const outliers = vals.filter(v => v < lf || v > uf);
    return { cat, n, mean, median, std, cv, min: sorted[0], max: sorted[n - 1], q1, q3, iqr, ci95, outliers, sorted };
  }).sort((a, b) => a.cat.localeCompare(b.cat));
};

// ─────────────────────────────────────────────────────────
// BOXPLOT SVG (mantiene estética original)
// ─────────────────────────────────────────────────────────
const BoxplotChart = ({ groupStats, numLabel, catLabel, colors }) => {
  if (!groupStats?.length) return null;
  const allVals = groupStats.flatMap(g => g.sorted);
  const gMin = Math.min(...allVals), gMax = Math.max(...allVals);
  const pad = (gMax - gMin) * 0.08;
  const yMin = gMin - pad, yMax = gMax + pad;
  const W = 600, H = 360, mL = 65, mR = 25, mT = 32, mB = 55;
  const pW = W - mL - mR, pH = H - mT - mB;
  const toY = v => mT + pH - ((v - yMin) / (yMax - yMin)) * pH;
  const nG = groupStats.length;
  const gW = pW / nG;
  const bW = Math.min(gW * 0.42, 52);
  const ticks = Array.from({ length: 7 }, (_, i) => yMin + (i / 6) * (yMax - yMin));

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {ticks.map((t, i) => (
        <line key={i} x1={mL} y1={toY(t)} x2={W - mR} y2={toY(t)}
          stroke="rgba(148,163,184,0.1)" strokeDasharray="4 3" />
      ))}
      <line x1={mL} y1={mT} x2={mL} y2={mT + pH} stroke="rgba(148,163,184,0.25)" />
      {ticks.map((t, i) => (
        <text key={i} x={mL - 8} y={toY(t) + 4} textAnchor="end" fontSize={10} fill="#94a3b8">
          {t.toFixed(1)}
        </text>
      ))}
      <text transform={`translate(14,${mT + pH / 2}) rotate(-90)`}
        textAnchor="middle" fontSize={11} fill="#a78bfa" fontWeight="700">{numLabel}</text>

      {groupStats.map((g, i) => {
        const cx = mL + (i + 0.5) * gW, bx = cx - bW / 2;
        const color = colors[i % colors.length];
        const yQ1 = toY(g.q1), yQ3 = toY(g.q3), yMed = toY(g.median), yMean = toY(g.mean);
        const yWL = toY(Math.max(g.min, g.q1 - 1.5 * g.iqr));
        const yWU = toY(Math.min(g.max, g.q3 + 1.5 * g.iqr));
        return (
          <g key={g.cat}>
            <line x1={cx} y1={yWL} x2={cx} y2={yQ1} stroke={color} strokeWidth={1.5} strokeDasharray="3 2" opacity={.75} />
            <line x1={cx} y1={yQ3} x2={cx} y2={yWU} stroke={color} strokeWidth={1.5} strokeDasharray="3 2" opacity={.75} />
            <line x1={cx - bW * .3} y1={yWL} x2={cx + bW * .3} y2={yWL} stroke={color} strokeWidth={2} />
            <line x1={cx - bW * .3} y1={yWU} x2={cx + bW * .3} y2={yWU} stroke={color} strokeWidth={2} />
            <rect x={bx} y={yQ3} width={bW} height={Math.abs(yQ1 - yQ3)}
              fill={color} fillOpacity={.18} stroke={color} strokeWidth={2} rx={4} />
            <line x1={bx} y1={yMed} x2={bx + bW} y2={yMed} stroke={color} strokeWidth={3} />
            <circle cx={cx} cy={yMean} r={4.5} fill={color} stroke="white" strokeWidth={1.5} />
            {g.outliers.slice(0, 8).map((ov, oi) => (
              <circle key={oi} cx={cx + (oi % 2 === 0 ? -9 : 9)} cy={toY(ov)} r={3.5}
                fill="none" stroke={color} strokeWidth={1.5} opacity={.75} />
            ))}
            <text x={cx} y={H - 8} textAnchor="middle" fontSize={11} fill="#cbd5e1" fontWeight="600">
              {g.cat.length > 11 ? g.cat.slice(0, 10) + "…" : g.cat}
            </text>
          </g>
        );
      })}
      <circle cx={mL + 6} cy={mT - 12} r={4} fill="#a78bfa" stroke="white" strokeWidth={1.5} />
      <text x={mL + 14} y={mT - 8} fontSize={9} fill="#64748b">Media</text>
      <line x1={mL + 50} y1={mT - 12} x2={mL + 64} y2={mT - 12} stroke="#a78bfa" strokeWidth={2.5} />
      <text x={mL + 68} y={mT - 8} fontSize={9} fill="#64748b">Mediana</text>
      <circle cx={mL + 120} cy={mT - 12} r={3} fill="none" stroke="#a78bfa" strokeWidth={1.5} />
      <text x={mL + 128} y={mT - 8} fontSize={9} fill="#64748b">Outlier</text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────
export default function Lab4_3({ goHome, setView }) {
  const [activeTab, setActiveTab] = useState("intro");
  const [selectedDS, setSelectedDS] = useState("");
  const [rawData, setRawData] = useState([]);
  const [catCol, setCatCol] = useState("");
  const [numCol, setNumCol] = useState("");
  const [catLabel, setCatLabel] = useState("Categoría");
  const [numLabel, setNumLabel] = useState("Valor");
  const [dsLabel, setDsLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [availCols, setAvailCols] = useState({ cat: [], num: [] });
  const [activeViz, setActiveViz] = useState("table");
  const [chartTitle, setChartTitle] = useState("Análisis por Categoría");
  const [palette, setPalette] = useState("violet");
  const [showValues, setShowValues] = useState(true);
  const [sortBy, setSortBy] = useState("name");
  const [showConfig, setShowConfig] = useState(false);
  const [pAnswers, setPAnswers] = useState({});
  const [pResults, setPResults] = useState({});
  const [pScore, setPScore] = useState(0);


  const colors = PALETTES[palette].colors;

  const groupStats = useMemo(() => {
    const stats = computeGroupStats(rawData, catCol, numCol);
    if (sortBy === "mean_desc") return [...stats].sort((a, b) => b.mean - a.mean);
    if (sortBy === "mean_asc") return [...stats].sort((a, b) => a.mean - b.mean);
    return stats;
  }, [rawData, catCol, numCol, sortBy]);

  const detectColumns = useCallback((data) => {
    if (!data?.length) return;
    const keys = Object.keys(data[0]);
    const numCols = keys.filter(k => {
      const s = data.slice(0, 20).map(r => parseFloat(r[k]));
      return s.filter(v => !isNaN(v)).length >= 10;
    });
    setAvailCols({ cat: keys.filter(k => !numCols.includes(k)), num: numCols });
  }, []);

  const loadDataset = useCallback(async (key) => {
    const ds = PRESET_DATASETS[key];
    setLoading(true); setError("");
    try {
      const res = await fetch(ds.file);
      if (!res.ok) throw new Error(`No se pudo cargar: ${ds.file}`);
      Papa.parse(await res.text(), {
        header: true, skipEmptyLines: true, dynamicTyping: true,
        complete: r => {
          setRawData(r.data); setCatCol(ds.catCol); setNumCol(ds.numCol);
          setCatLabel(ds.catLabel); setNumLabel(ds.numLabel);
          setDsLabel(ds.label); setSelectedDS(key); setUploadedFile(null);
          detectColumns(r.data);
          setChartTitle(`${ds.numLabel} por ${ds.catLabel}`);
          setLoading(false);
        },
        error: () => { setError("Error al parsear CSV."); setLoading(false); }
      });
    } catch (e) { setError(e.message); setLoading(false); }
  }, [detectColumns]);

  const handleUpload = e => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadedFile(file); setSelectedDS(""); setLoading(true);
    Papa.parse(file, {
      header: true, skipEmptyLines: true, dynamicTyping: true,
      complete: r => {
        setRawData(r.data); setDsLabel(file.name.replace(/\.csv$/i, ""));
        detectColumns(r.data);
        const keys = Object.keys(r.data[0] || {});
        const numKs = keys.filter(k => r.data.slice(0, 20).map(row => parseFloat(row[k])).filter(v => !isNaN(v)).length >= 10);
        const catKs = keys.filter(k => !numKs.includes(k));
        if (catKs.length) { setCatCol(catKs[0]); setCatLabel(catKs[0]); }
        if (numKs.length) { setNumCol(numKs[0]); setNumLabel(numKs[0]); }
        setLoading(false);
      }
    });
    e.target.value = "";
  };

  const handleCombo = c => {
    setCatCol(c.cat); setNumCol(c.num);
    setCatLabel(c.catLabel); setNumLabel(c.numLabel);
    setChartTitle(`${c.numLabel} por ${c.catLabel}`);
  };

  const downloadTable = () => {
    if (!groupStats.length) return;
    const hdr = ["Grupo", "n", "Media", "Mediana", "Desv.Est.", "CV(%)", "Mín", "Máx", "Outliers"];
    const rows = groupStats.map(g => [
      g.cat, g.n, g.mean.toFixed(3), g.median.toFixed(3),
      g.std.toFixed(3), g.cv.toFixed(1), g.min.toFixed(3), g.max.toFixed(3), g.outliers.length
    ]);
    const csv = [hdr, ...rows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `resumen_${dsLabel}_${catCol}_vs_${numCol}.csv`;
    a.click();
  };

  const downloadPNG = (elementId, name) => {
    // Cambiar a la pestaña correcta si es necesario
    if (elementId === "boxplot-chart") setActiveViz("boxplot");
    else if (elementId === "bars-chart") setActiveViz("bars");

    // Esperar a que React renderice la pestaña antes de capturar
    setTimeout(() => {
      const container = document.getElementById(elementId);
      if (!container) {
        alert("El gráfico no está disponible. Asegúrate de estar viendo ese gráfico.");
        return;
      }
      const svg = container.querySelector("svg");
      if (!svg) {
        alert("No se encontró el SVG. Intenta hacer clic en la pestaña del gráfico primero.");
        return;
      }

      const bbox = svg.getBoundingClientRect();
      const w = Math.max(bbox.width, 100) || 620;
      const h = Math.max(bbox.height, 100) || 380;

      // Clonar SVG y forzar atributos necesarios
      const clone = svg.cloneNode(true);
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("width", w);
      clone.setAttribute("height", h);

      // Copiar fill/stroke de elementos hijos (Recharts los pone como atributos inline, no CSS)
      const srcEls = svg.querySelectorAll("[fill],[stroke]");
      const clnEls = clone.querySelectorAll("[fill],[stroke]");
      srcEls.forEach((el, i) => {
        if (!clnEls[i]) return;
        if (el.getAttribute("fill")) clnEls[i].setAttribute("fill", el.getAttribute("fill"));
        if (el.getAttribute("stroke")) clnEls[i].setAttribute("stroke", el.getAttribute("stroke"));
        if (el.getAttribute("fill-opacity")) clnEls[i].setAttribute("fill-opacity", el.getAttribute("fill-opacity"));
      });

      const svgStr = new XMLSerializer().serializeToString(clone);
      const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const scale = 2;
        const canvas = document.createElement("canvas");
        canvas.width = w * scale;
        canvas.height = h * scale;
        const ctx = canvas.getContext("2d");
        ctx.scale(scale, scale);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png", 1.0);
        a.download = `${name}_${dsLabel}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        alert("No se pudo exportar el gráfico. Intenta hacer clic en la pestaña primero y luego descargar.");
      };

      img.src = url;
    }, 150);
  };

  // ── quiz ──
  const answerQ = (id, idx) => setPAnswers(p => ({ ...p, [id]: idx }));
  const checkQuiz = () => {
    const res = {}; let ok = 0;
    QUIZ.forEach(q => { const c = pAnswers[q.id] === q.correct; res[q.id] = { correct: c }; if (c) ok++; });
    setPResults(res); setPScore(ok);
  };
  const resetQuiz = () => { setPAnswers({}); setPResults({}); setPScore(0); };

  // ════════════════════════════════════════════════════════
  // INTRO
  // ════════════════════════════════════════════════════════
  const renderIntro = () => (
    <div className="space-y-8">

      {/* ── Hero asimétrico ── */}
      <div className="relative overflow-hidden rounded-3xl border border-violet-500/20
                      bg-gradient-to-br from-slate-900 via-violet-950/25 to-slate-900 p-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-[90px]" />
          <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-fuchsia-500/10 rounded-full blur-[70px]" />
          <svg className="absolute right-0 top-0 opacity-[0.07] w-72 h-72" viewBox="0 0 200 200">
            <polygon points="100,10 190,190 10,190" fill="none" stroke="#a855f7" strokeWidth="1" />
            <polygon points="100,40 160,170 40,170" fill="none" stroke="#a855f7" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="#a855f7" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="50" fill="none" stroke="#a855f7" strokeWidth="0.3" />
          </svg>
        </div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-500/20 border
                            border-violet-500/30 rounded-full text-xs font-black text-violet-400
                            uppercase tracking-widest mb-6">
              <FlaskConical className="w-3.5 h-3.5" /> Análisis Exploratorio
            </div>
            <h2 className="text-3xl font-black text-white mb-4 leading-tight">
              Comparando grupos<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                antes de inferir
              </span>
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm mb-6">
              Este laboratorio desarrolla herramientas para <strong className="text-white">comparar
                grupos de forma descriptiva</strong> — antes de aplicar métodos estadísticos formales.
              El análisis exploratorio es el <strong className="text-violet-300">primer paso esencial</strong> para
              entender, visualizar y comunicar diferencias entre categorías.
            </p>
            <div className="p-4 bg-violet-500/10 border border-violet-500/25 rounded-2xl text-sm text-slate-300">
              <span className="text-violet-300 font-black">💡 En este lab: </span>
              Resumen estadístico · Boxplots · Barras con medias · Coeficiente de variación · Ranking de grupos
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "🔍", t: "Análisis exploratorio", d: "Conoce tus datos antes de cualquier prueba formal" },
              { icon: "📋", t: "Estudios previos", d: "Paso obligatorio en toda investigación aplicada" },
              { icon: "💡", t: "Toma de decisiones", d: "Identifica patrones y diferencias de forma inicial" },
              { icon: "🚀", t: "Paso previo a inferencia", d: "Prepara hipótesis para métodos estadísticos avanzados" },
            ].map((item, i) => (
              <div key={i} className="bg-slate-900/60 border border-violet-500/15 rounded-2xl p-4
                                      hover:border-violet-500/40 transition-all hover:-translate-y-0.5 cursor-default">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-xs font-black text-white mb-1">{item.t}</p>
                <p className="text-[10px] text-slate-400 leading-snug">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tres herramientas ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            num: "01", Icon: Table, color: "violet",
            title: "Resumen Estadístico",
            desc: "Media, mediana, desv. estándar, coeficiente de variación, mín, máx y outliers agrupados por categoría.",
            items: ["x̄  Media aritmética", "Md  Mediana", "s   Desv. Estándar", "CV  Coef. Variación"]
          },
          {
            num: "02", Icon: BarChart2, color: "purple",
            title: "Boxplot por Grupo",
            desc: "Visualiza la distribución completa: mediana, IQR, rango típico y valores atípicos simultáneamente.",
            items: ["Q1–Q3  Caja (IQR)", "—  Mediana", "●  Media", "○  Outliers"]
          },
          {
            num: "03", Icon: BarChart3, color: "fuchsia",
            title: "Barras con Medias",
            desc: "Compara promedios entre grupos con barras de error que representan el IC 95% de cada media.",
            items: ["x̄  Altura de barra", "IC 95%  Barras de error", "Ranking por media", "Diferencia descriptiva"]
          },
        ].map((t, i) => (
          <div key={i} className={`relative bg-slate-900/60 border border-${t.color}-500/20
                                   border-l-4 border-l-${t.color}-500 rounded-2xl p-6
                                   hover:bg-slate-900/80 transition-all`}>
            <div className="absolute top-4 right-4 text-5xl font-black text-white/[0.04] select-none">{t.num}</div>
            <t.Icon className={`w-7 h-7 text-${t.color}-400 mb-4`} />
            <h3 className="font-black text-white mb-2">{t.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">{t.desc}</p>
            <div className="space-y-1.5">
              {t.items.map((m, j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full bg-${t.color}-500 shrink-0`} />
                  <span className="text-xs text-slate-300 font-mono">{m}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Anatomía del Boxplot ── */}
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-8">
        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-400" /> Anatomía del Boxplot
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-slate-950/50 rounded-2xl p-6">
            <svg viewBox="0 0 280 210" className="w-full max-w-xs mx-auto">
              {[40, 80, 120, 160].map(y => (
                <line key={y} x1="40" y1={y} x2="240" y2={y} stroke="rgba(148,163,184,0.08)" strokeDasharray="3 2" />
              ))}
              {/* Eje Y */}
              <line x1="50" y1="25" x2="50" y2="190" stroke="rgba(148,163,184,0.2)" />
              {/* Bigote inferior */}
              <line x1="140" y1="162" x2="140" y2="132" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="118" y1="162" x2="162" y2="162" stroke="#a855f7" strokeWidth="2" />
              {/* Caja IQR */}
              <rect x="100" y="82" width="80" height="50" fill="#a855f7" fillOpacity=".18" stroke="#a855f7" strokeWidth="2" rx="4" />
              {/* Mediana */}
              <line x1="100" y1="110" x2="180" y2="110" stroke="#a855f7" strokeWidth="3" />
              {/* Media */}
              <circle cx="140" cy="101" r="5" fill="#a855f7" stroke="white" strokeWidth="1.5" />
              {/* Bigote superior */}
              <line x1="140" y1="82" x2="140" y2="52" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="118" y1="52" x2="162" y2="52" stroke="#a855f7" strokeWidth="2" />
              {/* Outlier */}
              <circle cx="140" cy="30" r="5" fill="none" stroke="#f97316" strokeWidth="2" />
              {/* Labels derecha */}
              <text x="188" y="33" fontSize="9" fill="#f97316" fontWeight="700">Outlier</text>
              <text x="188" y="55" fontSize="9" fill="#94a3b8">Bigote (máx típico)</text>
              <text x="188" y="85" fontSize="9" fill="#94a3b8">Q3 (75%)</text>
              <text x="188" y="113" fontSize="9" fill="#a855f7" fontWeight="700">Mediana</text>
              <text x="188" y="134" fontSize="9" fill="#94a3b8">Q1 (25%)</text>
              <text x="188" y="165" fontSize="9" fill="#94a3b8">Bigote (mín típico)</text>
              {/* IQR brace */}
              <text x="56" y="98" fontSize="9" fill="#c084fc">IQR</text>
              <text x="56" y="108" fontSize="9" fill="#c084fc">(caja)</text>
              {/* Media label */}
              <text x="188" y="104" fontSize="9" fill="#c084fc">● Media</text>
            </svg>
          </div>
          <div className="space-y-3">
            {[
              { part: "Outliers ○", desc: "Valores atípicos: más allá de Q1−1.5×IQR o Q3+1.5×IQR. Merecen revisión especial.", c: "text-orange-400" },
              { part: "Bigotes", desc: "Rango de datos 'típicos'. Su longitud indica la dispersión general del grupo.", c: "text-slate-200" },
              { part: "Caja (IQR)", desc: "Contiene el 50% central de los datos. Caja alta = mayor variabilidad en el centro.", c: "text-violet-300" },
              { part: "Línea central", desc: "Mediana: divide los datos en dos mitades. Más robusta que la media ante outliers.", c: "text-purple-300" },
              { part: "Punto ● media", desc: "Promedio aritmético. Si se aleja de la mediana hay asimetría o influencia de valores extremos.", c: "text-fuchsia-300" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-xl">
                <span className={`text-xs font-black w-28 shrink-0 mt-0.5 ${item.c}`}>{item.part}</span>
                <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Coeficiente de Variación ── */}
      <div className="bg-gradient-to-br from-fuchsia-500/10 to-violet-500/10 border border-fuchsia-500/20 rounded-3xl p-8">
        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
          <Percent className="w-6 h-6 text-fuchsia-400" /> Coeficiente de Variación (CV)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="bg-slate-900/60 border border-fuchsia-500/20 rounded-2xl p-6 text-center mb-4">
              <p className="text-3xl font-black text-white tracking-wide mb-4">CV = (s / x̄) × 100</p>
              <div className="flex justify-center gap-8">
                {[{ sym: "s", label: "Desv. Est.", c: "text-fuchsia-400" }, { sym: "x̄", label: "Media", c: "text-violet-400" }, { sym: "%", label: "Resultado", c: "text-purple-400" }].map((m, i) => (
                  <div key={i}><p className={`text-2xl font-black ${m.c}`}>{m.sym}</p><p className="text-[10px] text-slate-400 mt-1">{m.label}</p></div>
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              El CV expresa la variabilidad <strong className="text-white">como porcentaje de la media</strong>.
              Permite comparar dispersión entre grupos con diferentes escalas o unidades.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { range: "CV < 15%", label: "Baja variabilidad", desc: "Grupo muy homogéneo", bg: "bg-green-500/20", t: "text-green-400", b: "border-green-500/30" },
              { range: "15% – 30%", label: "Variabilidad moderada", desc: "Dispersión aceptable", bg: "bg-amber-500/20", t: "text-amber-400", b: "border-amber-500/30" },
              { range: "CV > 30%", label: "Alta variabilidad", desc: "Grupo muy heterogéneo", bg: "bg-red-500/20", t: "text-red-400", b: "border-red-500/30" },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 ${item.bg} border ${item.b} rounded-xl`}>
                <span className={`text-sm font-black w-20 ${item.t}`}>{item.range}</span>
                <div>
                  <p className="text-sm font-black text-white">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════
  // ANÁLISIS
  // ════════════════════════════════════════════════════════
  const renderAnalysis = () => {
    const ds = selectedDS ? PRESET_DATASETS[selectedDS] : null;
    const hasData = !loading && !error && rawData.length > 0 && groupStats.length > 0;

    const BarsChart = () => {
      if (!groupStats.length) return null;
      const data = groupStats.map((g, i) => ({
        cat: g.cat.length > 13 ? g.cat.slice(0, 12) + "…" : g.cat,
        mean: parseFloat(g.mean.toFixed(3)),
        error: parseFloat(g.ci95.toFixed(3)),
        color: colors[i % colors.length]
      }));
      const ValLabel = ({ x, y, width, value }) => !showValues ? null : (
        <text x={x + width / 2} y={y - 7} textAnchor="middle" fontSize={11} fill="#e2e8f0" fontWeight="700">
          {parseFloat(value).toFixed(1)}
        </text>
      );
      return (
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={data} margin={{ top: 30, right: 30, bottom: 50, left: 65 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
            <XAxis dataKey="cat" tick={{ fill: "#e2e8f0", fontSize: 11 }}
              label={{ value: catLabel, position: "insideBottom", offset: -15, style: { fill: "#e2e8f0", fontWeight: 700, fontSize: 11 } }} />
            <YAxis tick={{ fill: "#e2e8f0", fontSize: 11 }}
              label={{
                value: numLabel, angle: -90, position: "insideLeft", offset: 20,
                style: { fill: "#a78bfa", fontWeight: 700, fontSize: 11, textAnchor: "middle" }
              }} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 12, padding: "8px 14px" }}
              labelStyle={{ color: "#e2e8f0", fontWeight: 700 }}
              formatter={(v, n) => [parseFloat(v).toFixed(3), n === "mean" ? "Media" : "IC ±95%"]} />
            <Bar dataKey="mean" radius={[8, 8, 0, 0]}>
              {data.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.85} />)}
              <ErrorBar dataKey="error" width={8} strokeWidth={2.5} stroke="#ffffff" opacity={0.55} />
              <LabelList content={<ValLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── PANEL IZQUIERDO ── */}
        <div className="lg:col-span-4 space-y-4">

          {/* Datasets */}
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6">
            <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-violet-400" /> Datasets
            </h3>
            <div className="space-y-2 mb-4">
              {Object.entries(PRESET_DATASETS).map(([key, ds]) => (
                <button key={key} onClick={() => loadDataset(key)}
                  className={`w-full p-3.5 rounded-xl border-2 text-left transition-all
                              ${selectedDS === key
                      ? "bg-violet-500/20 border-violet-400"
                      : "bg-slate-800/50 border-slate-700 hover:border-violet-500/40"}`}>
                  <p className="font-bold text-white text-sm">{ds.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{ds.description}</p>
                </button>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4">
              <input type="file" accept=".csv" onChange={handleUpload} className="hidden" id="fu43" />
              <label htmlFor="fu43"
                className="flex items-center justify-center gap-2 w-full px-4 py-3
                           bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30
                           rounded-xl cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-bold text-violet-300">
                  {uploadedFile ? uploadedFile.name : "Subir CSV propio"}
                </span>
              </label>
            </div>
          </div>

          {/* Variables dinámicas */}
          {rawData.length > 0 && (
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6">
              <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-purple-400" /> Variables
              </h3>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-[10px] font-black text-violet-400 uppercase block mb-1">Categórica (grupos)</label>
                  <select value={catCol}
                    onChange={e => { setCatCol(e.target.value); setCatLabel(e.target.value); setChartTitle(`${numLabel} por ${e.target.value}`); }}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white">
                    {[...availCols.cat, ...availCols.num].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-purple-400 uppercase block mb-1">Numérica (a comparar)</label>
                  <select value={numCol}
                    onChange={e => { setNumCol(e.target.value); setNumLabel(e.target.value); setChartTitle(`${e.target.value} por ${catLabel}`); }}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white">
                    {availCols.num.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {ds?.altCombos && (
                <div className="border-t border-white/10 pt-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Combos rápidos</p>
                  <div className="space-y-1.5">
                    {ds.altCombos.map((combo, i) => (
                      <button key={i} onClick={() => handleCombo(combo)}
                        className={`w-full p-2.5 rounded-lg border text-left text-[11px] font-bold transition-all
                                    ${catCol === combo.cat && numCol === combo.num
                            ? "bg-violet-500/20 border-violet-400 text-violet-300"
                            : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-violet-500/40"}`}>
                        {combo.catLabel} → {combo.numLabel}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Configuración */}
          {hasData && (
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6">
              <button onClick={() => setShowConfig(p => !p)}
                className="w-full flex items-center justify-between">
                <span className="text-base font-black text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-fuchsia-400" /> Configuración
                </span>
                <span className="text-slate-500 text-sm">{showConfig ? "▲" : "▼"}</span>
              </button>
              {showConfig && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5">Título del gráfico</label>
                    <input value={chartTitle} onChange={e => setChartTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm font-bold text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Paleta de colores</label>
                    <div className="grid grid-cols-5 gap-2">
                      {Object.entries(PALETTES).map(([k, p]) => (
                        <button key={k} onClick={() => setPalette(k)} title={p.name}
                          className={`h-8 rounded-lg border-2 transition-all ${palette === k ? "border-white scale-110" : "border-transparent opacity-70 hover:opacity-100"}`}
                          style={{ background: `linear-gradient(135deg,${p.colors[0]},${p.colors[2]})` }} />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 text-center">{PALETTES[palette].name}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5">Ordenar grupos</label>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white">
                      <option value="name">Alfabético</option>
                      <option value="mean_desc">Media ↓ (mayor primero)</option>
                      <option value="mean_asc">Media ↑ (menor primero)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-sm font-bold text-white">Valores sobre barras</span>
                    <button onClick={() => setShowValues(p => !p)}
                      className={`w-12 h-6 rounded-full transition-all relative ${showValues ? "bg-violet-500" : "bg-slate-700"}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${showValues ? "left-6" : "left-0.5"}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Descargas */}
          {hasData && (
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6">
              <h3 className="text-base font-black text-white mb-3 flex items-center gap-2">
                <Download className="w-4 h-4 text-violet-400" /> Descargar
              </h3>
              <div className="space-y-2">
                <button onClick={downloadTable}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-violet-500/15 hover:bg-violet-500/25
                             border border-violet-500/25 rounded-xl font-bold text-sm text-violet-300 transition-all">
                  <Table className="w-4 h-4" /> Tabla de resumen (CSV)
                </button>
                <button onClick={() => downloadPNG("boxplot-chart", "boxplot")}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-purple-500/15 hover:bg-purple-500/25
                             border border-purple-500/25 rounded-xl font-bold text-sm text-purple-300 transition-all">
                  <BarChart2 className="w-4 h-4" /> Boxplot (PNG)
                </button>
                <button onClick={() => downloadPNG("bars-chart", "barras")}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-fuchsia-500/15 hover:bg-fuchsia-500/25
                             border border-fuchsia-500/25 rounded-xl font-bold text-sm text-fuchsia-300 transition-all">
                  <BarChart3 className="w-4 h-4" /> Gráfico de barras (PNG)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── PANEL DERECHO ── */}
        <div className="lg:col-span-8 space-y-5">

          {loading && (
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-20 flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400 font-bold">Cargando dataset…</p>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-red-300 font-bold text-sm">{error}</p>
            </div>
          )}
          {!loading && !error && rawData.length === 0 && (
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-20 flex items-center justify-center">
              <div className="text-center">
                <BarChart2 className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                <p className="text-lg font-bold text-slate-400">Selecciona un dataset para comenzar</p>
                <p className="text-sm text-slate-600 mt-1">Elige uno de los datasets del panel izquierdo</p>
              </div>
            </div>
          )}

          {hasData && (
            <>
              {/* Tabs de visualización */}
              <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6">
                <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
                  <div>
                    <h3 className="text-base font-black text-white">{chartTitle}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {dsLabel} · {rawData.length} filas · {groupStats.length} grupos
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      { id: "table", label: "Tabla", Icon: Table },
                      { id: "boxplot", label: "Boxplot", Icon: BarChart2 },
                      { id: "bars", label: "Barras", Icon: BarChart3 },
                      { id: "ranking", label: "Ranking", Icon: Medal },
                    ].map(v => (
                      <button key={v.id} onClick={() => setActiveViz(v.id)}
                        className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all
                                    ${activeViz === v.id
                            ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                        <v.Icon className="w-3.5 h-3.5" />{v.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ─── TABLA ─── */}
                {activeViz === "table" && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          {["Grupo", "n", "Media", "Mediana", "Desv. Est.", "CV (%)", "Mín", "Máx", "Outliers"].map((h, i) => (
                            <th key={i} className={`py-3 px-2.5 font-black uppercase text-[10px] ${i === 0 ? "text-left text-violet-400" : "text-center text-slate-400"}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {groupStats.map((g, i) => (
                          <tr key={g.cat} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
                                <span className="font-black text-white text-sm">{g.cat}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2.5 text-center text-slate-300">{g.n}</td>
                            <td className="py-3 px-2.5 text-center font-black text-violet-300">{g.mean.toFixed(2)}</td>
                            <td className="py-3 px-2.5 text-center text-slate-300">{g.median.toFixed(2)}</td>
                            <td className="py-3 px-2.5 text-center text-slate-300">{g.std.toFixed(2)}</td>
                            <td className="py-3 px-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                                ${g.cv < 15 ? "bg-green-500/20 text-green-400" : g.cv < 30 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
                                {g.cv.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 px-2.5 text-center text-slate-400">{g.min.toFixed(2)}</td>
                            <td className="py-3 px-2.5 text-center text-slate-400">{g.max.toFixed(2)}</td>
                            <td className="py-3 px-2.5 text-center">
                              {g.outliers.length > 0
                                ? <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold">{g.outliers.length}</span>
                                : <span className="text-slate-600 text-sm">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-[10px] text-slate-500 mt-3 text-right">Unidad: {numLabel}</p>
                  </div>
                )}

                {/* ─── BOXPLOT ─── */}
                {activeViz === "boxplot" && (
                  <div id="boxplot-chart">
                    <BoxplotChart groupStats={groupStats} numLabel={numLabel} catLabel={catLabel} colors={colors} />
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {groupStats.map((g, i) => (
                        <div key={g.cat} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
                            <span className="text-xs font-black text-white truncate">{g.cat}</span>
                          </div>
                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between"><span className="text-slate-400">Mediana</span><span className="text-violet-300 font-bold">{g.median.toFixed(1)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">IQR</span><span className="text-purple-300 font-bold">{g.iqr.toFixed(1)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">CV</span>
                              <span className={`font-bold ${g.cv < 15 ? "text-green-400" : g.cv < 30 ? "text-amber-400" : "text-red-400"}`}>{g.cv.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between"><span className="text-slate-400">Outliers</span>
                              <span className={g.outliers.length > 0 ? "text-orange-400 font-bold" : "text-slate-500"}>{g.outliers.length || "—"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── BARRAS ─── */}
                {activeViz === "bars" && (
                  <div id="bars-chart">
                    <BarsChart />
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {groupStats.map((g, i) => (
                        <div key={g.cat} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
                            <span className="text-xs font-black text-white truncate">{g.cat}</span>
                          </div>
                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between"><span className="text-slate-400">Media</span><span className="text-violet-300 font-bold">{g.mean.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">IC ±</span><span className="text-fuchsia-300 font-bold">{g.ci95.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">n</span><span className="text-slate-300">{g.n}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-3 text-center">
                      Barras de error = IC 95% de la media
                    </p>
                  </div>
                )}

                {/* ─── RANKING ─── */}
                {activeViz === "ranking" && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400 mb-3">Grupos ordenados de mayor a menor media, con diferencias descriptivas</p>
                    {[...groupStats].sort((a, b) => b.mean - a.mean).map((g, i, arr) => {
                      const maxMean = arr[0].mean;
                      const pctOfMax = (g.mean / maxMean) * 100;
                      const diffAbs = (g.mean - maxMean).toFixed(2);
                      const diffPct = maxMean !== 0 ? ((g.mean - maxMean) / maxMean * 100).toFixed(1) : "0.0";
                      return (
                        <div key={g.cat} className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/40">
                          <div className="flex items-center gap-4">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg shrink-0
                                            ${i === 0 ? "bg-amber-500 text-white" : i === 1 ? "bg-slate-400 text-slate-900" : i === 2 ? "bg-amber-700/80 text-white" : "bg-slate-700 text-slate-300"}`}>
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
                                  <span className="font-black text-white text-sm">{g.cat}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs flex-wrap">
                                  <span className="font-black text-violet-300">x̄ = {g.mean.toFixed(2)}</span>
                                  {i === 0
                                    ? <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full font-black text-[10px]">🥇 Máximo</span>
                                    : <span className="text-red-400 font-bold">Δ {diffPct}%</span>}
                                </div>
                              </div>
                              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700"
                                  style={{ width: `${pctOfMax}%`, background: colors[i % colors.length] }} />
                              </div>
                              <div className="flex justify-between mt-1.5 text-[10px] text-slate-500 flex-wrap gap-x-3">
                                <span>s = {g.std.toFixed(2)}</span>
                                <span>CV = <span className={g.cv < 15 ? "text-green-400" : g.cv < 30 ? "text-amber-400" : "text-red-400"}>{g.cv.toFixed(1)}%</span></span>
                                <span>n = {g.n}</span>
                                {i > 0 && <span className="text-slate-400">Diferencia abs: {diffAbs}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Diferencia entre extremos */}
                    {groupStats.length >= 2 && (() => {
                      const s = [...groupStats].sort((a, b) => b.mean - a.mean);
                      const top = s[0], bot = s[s.length - 1];
                      const abs = (top.mean - bot.mean);
                      const pct = bot.mean !== 0 ? (abs / bot.mean * 100) : 0;
                      const avgStd = (top.std + bot.std) / 2;
                      return (
                        <div className="mt-2 p-5 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-2xl">
                          <p className="text-xs font-black text-white mb-3">📊 Diferencia entre grupo máximo y mínimo</p>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-slate-900/40 rounded-xl p-3">
                              <p className="text-[10px] text-slate-400 mb-1">Diferencia absoluta</p>
                              <p className="text-xl font-black text-violet-300">{abs.toFixed(2)}</p>
                            </div>
                            <div className="bg-slate-900/40 rounded-xl p-3">
                              <p className="text-[10px] text-slate-400 mb-1">Diferencia porcentual</p>
                              <p className="text-xl font-black text-fuchsia-300">{pct.toFixed(1)}%</p>
                            </div>
                            <div className="bg-slate-900/40 rounded-xl p-3">
                              <p className="text-[10px] text-slate-400 mb-1">En desv. estándar</p>
                              <p className="text-xl font-black text-purple-300">{avgStd > 0 ? (abs / avgStd).toFixed(2) : "—"}σ</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Interpretación automática descriptiva */}
              <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-3xl p-6">
                <h4 className="font-black text-white mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-violet-400" /> Interpretación Descriptiva Automática
                </h4>
                <div className="space-y-2.5 text-sm">
                  {(() => {
                    const s = [...groupStats].sort((a, b) => b.mean - a.mean);
                    const top = s[0], bot = s[s.length - 1];
                    const maxCV = groupStats.reduce((a, b) => a.cv > b.cv ? a : b);
                    const minCV = groupStats.reduce((a, b) => a.cv < b.cv ? a : b);
                    const totalOut = groupStats.reduce((acc, g) => acc + g.outliers.length, 0);
                    const outGroups = groupStats.filter(g => g.outliers.length > 0);
                    const abs = top.mean - bot.mean;
                    const pct = bot.mean !== 0 ? (abs / bot.mean * 100) : 0;
                    return (<>
                      <p className="p-3 bg-slate-900/50 rounded-xl text-slate-300">
                        ▸ <strong className="text-violet-300">"{top.cat}"</strong> presenta la media más alta
                        (<strong className="text-white">{top.mean.toFixed(2)}</strong>).
                        {" "}<strong className="text-red-300">"{bot.cat}"</strong> tiene la más baja
                        (<strong className="text-white">{bot.mean.toFixed(2)}</strong>).
                      </p>
                      <p className="p-3 bg-slate-900/50 rounded-xl text-slate-300">
                        ▸ Diferencia entre grupos extremos:
                        <strong className="text-white"> {abs.toFixed(2)} unidades</strong>
                        {" "}({pct.toFixed(1)}% respecto al grupo menor).
                      </p>
                      <p className="p-3 bg-slate-900/50 rounded-xl text-slate-300">
                        ▸ <strong className="text-fuchsia-300">"{maxCV.cat}"</strong> muestra la mayor variabilidad interna
                        (CV = <strong className={maxCV.cv < 15 ? "text-green-400" : maxCV.cv < 30 ? "text-amber-400" : "text-red-400"}>
                          {maxCV.cv.toFixed(1)}%</strong> —
                        {maxCV.cv < 15 ? " baja" : maxCV.cv < 30 ? " moderada" : " alta"} dispersión).
                        {maxCV.cat !== minCV.cat && <>
                          {" "}<strong className="text-green-300">"{minCV.cat}"</strong> es el más homogéneo
                          (CV = <strong className="text-green-400">{minCV.cv.toFixed(1)}%</strong>).
                        </>}
                      </p>
                      {totalOut > 0
                        ? <p className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-slate-300">
                          ▸ Se detectaron <strong className="text-orange-400">{totalOut} valor(es) atípico(s)</strong> en:
                          {" "}{outGroups.map(g => `"${g.cat}" (${g.outliers.length})`).join(", ")}.
                          Se recomienda revisar el boxplot para identificarlos visualmente.
                        </p>
                        : <p className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-slate-300">
                          ▸ <strong className="text-green-400">No se detectaron valores atípicos</strong> en ningún grupo.
                          Los datos parecen distribuidos de forma regular dentro de cada categoría.
                        </p>
                      }
                      <p className="p-3 bg-slate-900/50 rounded-xl text-[11px] text-slate-500 italic">
                        ⚠️ Este análisis es <strong className="text-slate-400">descriptivo y exploratorio</strong>.
                        Para confirmar si las diferencias entre grupos son estadísticamente significativas
                        se requieren pruebas formales (ANOVA, t-test), que se abordarán en capítulos posteriores.
                      </p>
                    </>);
                  })()}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════
  // PRÁCTICA
  // ════════════════════════════════════════════════════════
  const renderPractice = () => (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950/20 to-slate-900 border border-violet-500/20 rounded-3xl p-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="relative z-10">
          {/* Encabezado */}
          <div className="flex items-start gap-4 mb-8">
            <div className="p-3 bg-violet-500/20 rounded-xl border border-violet-500/30 shrink-0">
              <Brain className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-1">Quiz de Comprensión</h2>
              <p className="text-slate-400 text-sm">
                Boxplots · Coeficiente de variación · Resúmenes estadísticos · Análisis exploratorio
              </p>
            </div>
          </div>

          {/* Resultado */}
          {Object.keys(pResults).length > 0 && (
            <div className="mb-6 p-5 bg-slate-900/60 rounded-2xl border border-violet-500/30">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">{pScore} / {QUIZ.length} correctas</h3>
                  <div className="mt-2 h-2 w-48 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-700"
                      style={{ width: `${(pScore / QUIZ.length) * 100}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                    {((pScore / QUIZ.length) * 100).toFixed(0)}%
                  </div>
                  <p className={`text-xs font-black mt-1 ${pScore === QUIZ.length ? "text-yellow-400" : pScore >= 6 ? "text-green-400" : "text-orange-400"}`}>
                    {pScore === QUIZ.length ? "🏆 ¡Perfecto!" : pScore >= 6 ? "✅ Muy bien" : "📚 Sigue practicando"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preguntas */}
          <div className="space-y-4">
            {QUIZ.map((q, qi) => {
              const result = pResults[q.id];
              return (
                <div key={q.id} className={`rounded-2xl p-6 border-2 transition-all ${result
                  ? result.correct ? "border-green-500/40 bg-green-500/5" : "border-red-500/40 bg-red-500/5"
                  : "border-slate-700/50 bg-slate-900/40 hover:border-violet-500/30"}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-base shrink-0
                                    ${result ? result.correct ? "bg-green-500 text-white" : "bg-red-500 text-white" : "bg-violet-500 text-white"}`}>
                      {result ? (result.correct ? "✓" : "✗") : qi + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-3 text-sm leading-snug">{q.q}</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {q.opts.map((opt, idx) => {
                          const sel = pAnswers[q.id] === idx;
                          const isCorrect = idx === q.correct;
                          const shown = !!result;
                          return (
                            <button key={idx} onClick={() => !shown && answerQ(q.id, idx)} disabled={shown}
                              className={`w-full text-left p-3.5 rounded-xl border-2 transition-all
                                          ${shown
                                  ? isCorrect ? "border-green-500 bg-green-500/10" : sel ? "border-red-500 bg-red-500/10" : "border-slate-700/40 bg-slate-800/20"
                                  : sel ? "border-violet-500 bg-violet-500/10" : "border-slate-700/40 bg-slate-800/30 hover:border-violet-500/40"
                                } ${shown ? "cursor-default" : "cursor-pointer"}`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0
                                                ${shown ? isCorrect ? "bg-green-500 text-white" : sel ? "bg-red-500 text-white" : "bg-slate-700 text-slate-400"
                                    : sel ? "bg-violet-500 text-white" : "bg-slate-700 text-slate-400"}`}>
                                  {String.fromCharCode(65 + idx)}
                                </div>
                                <span className={`text-sm ${shown && isCorrect ? "text-green-400 font-bold" : "text-slate-300"}`}>{opt}</span>
                                {shown && isCorrect && <CheckCircle className="w-4 h-4 text-green-400 ml-auto shrink-0" />}
                                {shown && sel && !isCorrect && <XCircle className="w-4 h-4 text-red-400 ml-auto shrink-0" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {result && !result.correct && (
                        <div className="mt-3 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                          <p className="text-sm text-violet-200"><strong className="text-violet-400">💡 </strong>{q.exp}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botones acción */}
          {Object.keys(pAnswers).length === QUIZ.length && Object.keys(pResults).length === 0 && (
            <div className="mt-6 flex justify-center">
              <button onClick={checkQuiz}
                className="px-8 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600
                           hover:to-fuchsia-600 rounded-xl font-black text-white flex items-center gap-2
                           shadow-lg shadow-violet-500/30 transition-all hover:scale-105">
                <CheckCircle className="w-5 h-5" /> Verificar Respuestas
              </button>
            </div>
          )}
          {Object.keys(pResults).length > 0 && (
            <div className="mt-6 flex justify-center">
              <button onClick={resetQuiz}
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl
                           font-black text-white flex items-center gap-2 transition-all">
                <RefreshCw className="w-5 h-5" /> Intentar de Nuevo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Fondo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/8 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/8 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => { if (goHome) goHome(); else if (setView) setView("home"); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-violet-500/10
                         border border-white/10 hover:border-violet-500/40 text-sm font-bold text-slate-200
                         transition-all duration-300 hover:scale-105 active:scale-95 group">
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Volver al Índice
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xs text-orange-400 font-bold block uppercase">Capítulo 4</span>
                <span className="font-black text-white block text-sm">Estadística con Dos Variables</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-xs text-violet-400 font-black uppercase">Lab 4.3</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8 relative">
        {/* Header */}
        <section className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8
                            border-l-4 border-l-violet-500 relative overflow-hidden">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none">
            <div className="w-64 h-64 rounded-3xl border-8 border-violet-400 flex items-center justify-center">
              <BarChart2 className="w-40 h-40 text-violet-400" />
            </div>
          </div>
          <div className="flex items-start gap-6 relative z-10">
            <div className="p-4 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-2xl border border-violet-500/30 shrink-0">
              <BarChart2 className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <span className="text-xs font-black text-violet-500 uppercase bg-violet-500/10 px-3 py-1 rounded-full">Sección 4.3</span>
              <h2 className="text-2xl font-black text-white mb-2 mt-2">4.3 Variable Categórica y Numérica</h2>
              <p className="text-slate-400 leading-relaxed max-w-3xl text-sm">
                Analiza cómo se comporta una <strong className="text-white">variable numérica</strong> dentro
                de cada grupo definido por una <strong className="text-white">variable categórica</strong>, usando
                <strong className="text-violet-300"> resúmenes estadísticos</strong>,
                <strong className="text-purple-300"> boxplots</strong>,
                <strong className="text-fuchsia-300"> gráficos de barras</strong> y
                <strong className="text-pink-300"> rankings descriptivos</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-4">
          {[
            { id: "intro", label: "Introducción", Icon: Info },
            { id: "analysis", label: "Análisis", Icon: Database },
            { id: "practice", label: "Práctica", Icon: Brain },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2
                          ${activeTab === tab.id
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                  : "bg-white/5 hover:bg-white/10 text-slate-300"}`}>
              <tab.Icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        {activeTab === "intro" && renderIntro()}
        {activeTab === "analysis" && renderAnalysis()}
        {activeTab === "practice" && renderPractice()}
      </main>
    </div>
  );
}