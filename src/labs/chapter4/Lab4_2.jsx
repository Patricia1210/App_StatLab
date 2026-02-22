import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowLeft, BarChart3, Database, Eye, Download,
  Activity, Info, Upload, Lightbulb, AlertCircle,
  Settings, Target, Zap, CheckCircle, XCircle, Award, Brain,
  TrendingUp, TrendingDown, Minus, Crosshair, Sigma, LineChart,
  FlaskConical, AlertTriangle, Scale
} from "lucide-react";
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Label, Line, ComposedChart
} from "recharts";
import Papa from "papaparse";
import * as XLSX from "xlsx";

// ============================================
// DATASETS PREDEFINIDOS
// ============================================

const PRESET_DATASETS = {
  publicidad_ventas: {
    label: "Gasto en Publicidad vs Ventas",
    icon: TrendingUp,
    description: "24 meses — relación positiva fuerte",
    xLabel: "Gasto en Publicidad (Miles USD)",
    yLabel: "Ingresos por Ventas (Miles USD)",
    expectedTrend: "positive",
    data: [
      { x: 3.0, y: 0.5 }, { x: 2.6, y: 6.3 }, { x: 6.4, y: 1.4 },
      { x: 10.6, y: 24.9 }, { x: 6.8, y: 7.6 }, { x: 8.3, y: 13.7 },
      { x: 15.2, y: 24.5 }, { x: 14.3, y: 47.1 }, { x: 12.1, y: 24.0 },
      { x: 16.6, y: 22.7 }, { x: 15.1, y: 38.4 }, { x: 16.6, y: 21.0 },
      { x: 20.2, y: 42.5 }, { x: 15.3, y: 10.9 }, { x: 17.3, y: 21.4 },
      { x: 22.3, y: 46.6 }, { x: 22.5, y: 52.3 }, { x: 27.9, y: 57.6 },
      { x: 25.8, y: 50.4 }, { x: 25.8, y: 48.5 }, { x: 35.9, y: 57.0 },
      { x: 32.3, y: 57.4 }, { x: 34.7, y: 64.8 }, { x: 31.7, y: 74.0 }
    ]
  },
  altitud_temperatura: {
    label: "Altitud vs Temperatura",
    icon: TrendingDown,
    description: "30 estaciones — relación negativa fuerte",
    xLabel: "Altitud (m)",
    yLabel: "Temperatura Promedio (°C)",
    expectedTrend: "negative",
    data: [
      { x: 100, y: 25.4 }, { x: 200, y: 23.5 }, { x: 300, y: 24.5 },
      { x: 400, y: 25.6 }, { x: 500, y: 21.5 }, { x: 600, y: 20.9 },
      { x: 700, y: 24.0 }, { x: 800, y: 21.7 }, { x: 900, y: 18.7 },
      { x: 1000, y: 20.1 }, { x: 1100, y: 17.5 }, { x: 1200, y: 16.9 },
      { x: 1300, y: 17.7 }, { x: 1400, y: 12.8 }, { x: 1500, y: 12.6 },
      { x: 1600, y: 14.3 }, { x: 1700, y: 12.8 }, { x: 1800, y: 14.8 },
      { x: 1900, y: 11.8 }, { x: 2000, y: 10.2 }, { x: 2100, y: 15.3 },
      { x: 2200, y: 11.3 }, { x: 2300, y: 11.3 }, { x: 2400, y: 7.8 },
      { x: 2500, y: 8.9 }, { x: 2600, y: 9.6 }, { x: 2700, y: 6.5 },
      { x: 2800, y: 9.0 }, { x: 2900, y: 6.4 }, { x: 3000, y: 6.4 }
    ]
  },
  altura_ci: {
    label: "Altura vs Coeficiente Intelectual",
    icon: Minus,
    description: "Sin tendencia — variables independientes",
    xLabel: "Altura (cm)",
    yLabel: "Coeficiente Intelectual (CI)",
    expectedTrend: "none",
    data: [
      { x: 155, y: 82 }, { x: 158, y: 110 }, { x: 160, y: 95 },
      { x: 160, y: 92 }, { x: 161, y: 88 }, { x: 162, y: 101 },
      { x: 163, y: 94 }, { x: 163, y: 90 }, { x: 165, y: 80 },
      { x: 165, y: 115 }, { x: 166, y: 125 }, { x: 167, y: 98 },
      { x: 168, y: 105 }, { x: 170, y: 60 }, { x: 170, y: 120 },
      { x: 171, y: 110 }, { x: 172, y: 115 }, { x: 173, y: 100 },
      { x: 175, y: 88 }, { x: 175, y: 115 }, { x: 176, y: 108 },
      { x: 178, y: 95 }, { x: 180, y: 102 }, { x: 180, y: 100 },
      { x: 182, y: 90 }, { x: 183, y: 105 }, { x: 185, y: 108 },
      { x: 187, y: 112 }, { x: 190, y: 105 }, { x: 193, y: 108 }
    ]
  },
  marketing: {
    label: "Marketing — Gasto vs Ventas Mensuales",
    icon: TrendingUp,
    description: "24 meses — regresión lineal aplicada",
    xLabel: "Gasto en Publicidad (Miles USD)",
    yLabel: "Ventas Mensuales (Miles USD)",
    expectedTrend: "positive",
    data: [
      { x: 4.5, y: 55.3 }, { x: 3.3, y: 61.6 }, { x: 9.2, y: 60.5 },
      { x: 15.6, y: 102.5 }, { x: 8.8, y: 67.5 }, { x: 10.8, y: 78.1 },
      { x: 21.9, y: 106.7 }, { x: 19.8, y: 137.3 }, { x: 15.7, y: 96.8 },
      { x: 22.7, y: 102.3 }, { x: 19.7, y: 121.4 }, { x: 21.7, y: 96.7 },
      { x: 27.2, y: 134.8 }, { x: 18.4, y: 75.9 }, { x: 21.4, y: 94.2 },
      { x: 29.2, y: 140.5 }, { x: 28.9, y: 147.9 }, { x: 37.6, y: 165.3 },
      { x: 33.5, y: 148.6 }, { x: 32.9, y: 144.3 }, { x: 49.3, y: 175.8 },
      { x: 42.9, y: 167.8 }, { x: 46.3, y: 182.1 }, { x: 40.9, y: 188.5 }
    ]
  },
  calefaccion: {
    label: "Temperatura vs Gasto en Calefacción",
    icon: TrendingDown,
    description: "11 observaciones — R² ≈ 0.997",
    xLabel: "Temperatura Exterior (°C)",
    yLabel: "Gasto en Calefacción (Pesos)",
    expectedTrend: "negative",
    data: [
      { x: 2, y: 150 }, { x: 4, y: 135 }, { x: 8, y: 110 },
      { x: 12, y: 80 }, { x: 16, y: 45 }, { x: 20, y: 20 },
      { x: 11, y: 90 }, { x: 6, y: 120 }, { x: 3, y: 145 },
      { x: 18, y: 30 }, { x: 5, y: 128 }
    ]
  }
};

const PRACTICE_QUESTIONS = [
  {
    id: 1,
    question: "¿Qué indica un Coeficiente de Correlación de Pearson igual a -0.96?",
    options: [
      "No hay relación entre las variables",
      "Existe una relación negativa fuerte: al aumentar X, Y disminuye",
      "Existe una relación positiva fuerte",
      "Los datos están distribuidos normalmente"
    ],
    correct: 1,
    explanation: "Un valor cercano a -1 indica una relación negativa fuerte y lineal entre las dos variables."
  },
  {
    id: 2,
    question: "En la ecuación de regresión y = a + bx, ¿qué representa 'b'?",
    options: [
      "El valor de y cuando x = 0",
      "El coeficiente de determinación",
      "La pendiente: cambio en y por cada unidad de cambio en x",
      "El error estándar del modelo"
    ],
    correct: 2,
    explanation: "La pendiente 'b' representa cuánto cambia y en promedio por cada unidad que aumenta x."
  },
  {
    id: 3,
    question: "¿Qué mide el coeficiente R² (R-cuadrado)?",
    options: [
      "La pendiente de la recta",
      "La proporción de variabilidad en y explicada por x",
      "El número de observaciones",
      "La diferencia entre media y mediana"
    ],
    correct: 1,
    explanation: "R² indica qué porcentaje de la variación en y queda explicado por el modelo de regresión lineal con x."
  },
  {
    id: 4,
    question: "Si r = 0.11, ¿qué concluimos sobre la relación entre las variables?",
    options: [
      "Relación positiva fuerte",
      "Relación negativa moderada",
      "No existe relación lineal significativa entre las variables",
      "Las variables son idénticas"
    ],
    correct: 2,
    explanation: "Un r muy cercano a 0 indica que no hay relación lineal apreciable entre las dos variables."
  },
  {
    id: 5,
    question: "¿Para qué sirve un diagrama de dispersión?",
    options: [
      "Solo para calcular la media",
      "Para visualizar la relación entre dos variables cuantitativas",
      "Para comparar categorías",
      "Para calcular frecuencias relativas"
    ],
    correct: 1,
    explanation: "El diagrama de dispersión muestra la relación entre dos variables numéricas y permite identificar tendencias."
  },
  {
    id: 6,
    question: "Si R² = 0.90, ¿qué significa?",
    options: [
      "El modelo explica el 10% de la variación",
      "El modelo explica el 90% de la variación en y",
      "La correlación es 0.90",
      "Hay un 90% de probabilidad de error"
    ],
    correct: 1,
    explanation: "R² = 0.90 significa que el 90% de la variabilidad en la variable dependiente es explicada por el modelo."
  },
  {
    id: 7,
    question: "¿Cuál es el rango posible del coeficiente de correlación de Pearson?",
    options: [
      "De 0 a 1",
      "De 0 a ∞",
      "De -1 a +1",
      "De -100 a +100"
    ],
    correct: 2,
    explanation: "El coeficiente de Pearson siempre está entre -1 (relación negativa perfecta) y +1 (relación positiva perfecta)."
  },
  {
    id: 8,
    question: "¿La correlación implica causalidad?",
    options: [
      "Sí, siempre que r > 0.8",
      "No, la correlación solo indica relación estadística, no causa",
      "Sí, si el p-value es menor a 0.05",
      "Solo cuando las variables son numéricas continuas"
    ],
    correct: 1,
    explanation: "La correlación mide asociación estadística. Que dos variables estén correlacionadas no significa que una cause a la otra."
  },
  // ── NUEVAS: p-value ──────────────────────────────────────────────────────
  {
    id: 9,
    question: "¿Qué mide el p-value en el contexto de la correlación?",
    options: [
      "La fuerza de la relación entre las variables",
      "La probabilidad de obtener un r igual o mayor si la correlación real fuera 0",
      "El porcentaje de varianza explicada",
      "El valor esperado de la variable Y"
    ],
    correct: 1,
    explanation: "El p-value indica qué tan probable sería observar ese r (o uno más extremo) si en realidad no existiera correlación en la población. Un p < 0.05 sugiere que la correlación es estadísticamente significativa."
  },
  {
    id: 10,
    question: "Tienes n = 500 y obtienes r = 0.09, p = 0.04. ¿Qué debes concluir?",
    options: [
      "Hay una correlación fuerte y significativa",
      "La correlación es estadísticamente significativa pero prácticamente despreciable",
      "El modelo explica el 9% de la varianza",
      "El p-value confirma que la pendiente es negativa"
    ],
    correct: 1,
    explanation: "Con muestras grandes (n = 500) el p-value puede ser significativo incluso para correlaciones ínfimas. r = 0.09 implica R² ≈ 0.008: apenas el 0.8% de la varianza explicada. Significancia estadística ≠ relevancia práctica."
  }
];

// ============================================
// CÁLCULOS ESTADÍSTICOS
// ============================================

const computeStats = (data) => {
  if (!data || data.length < 2) return null;
  const n = data.length;
  const xs = data.map(d => d.x);
  const ys = data.map(d => d.y);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  const ssXX = xs.reduce((s, x) => s + (x - meanX) ** 2, 0);
  const ssYY = ys.reduce((s, y) => s + (y - meanY) ** 2, 0);
  const ssXY = data.reduce((s, d) => s + (d.x - meanX) * (d.y - meanY), 0);
  const r = ssXX === 0 || ssYY === 0 ? 0 : ssXY / Math.sqrt(ssXX * ssYY);
  // FIX: use rawB/rawA with full precision numbers to avoid rounding errors
  const rawB = ssXX === 0 ? 0 : ssXY / ssXX;
  const rawA = meanY - rawB * meanX;
  const r2 = r * r;

  // t-statistic for H0: rho = 0
  const t = r * Math.sqrt((n - 2) / (1 - r * r + 1e-12));
  const df = n - 2;
  const pValue = approximatePValue(Math.abs(t), df);

  // Strength classification — unified across the entire component
  const getStrength = (absR) => {
    if (absR < 0.1) return { label: "Sin correlación", key: "ninguna", color: "#64748b" };
    if (absR < 0.3) return { label: "Correlación débil", key: "debil", color: "#f59e0b" };
    if (absR < 0.7) return { label: "Correlación moderada", key: "moderada", color: "#f97316" };
    return { label: "Correlación fuerte", key: "fuerte", color: "#10b981" };
  };

  const abs = Math.abs(r);
  const strengthInfo = getStrength(abs);
  const trendLabel = r > 0.1 ? "positiva" : r < -0.1 ? "negativa" : "nula";

  // Detect misleading significance: significant but very weak
  const misleadingSignificance = pValue < 0.05 && abs < 0.1;

  return {
    n, meanX, meanY,
    r: r.toFixed(4), r2: r2.toFixed(4),
    a: rawA.toFixed(3), b: rawB.toFixed(3),
    tStat: t.toFixed(3), df, pValue: pValue.toFixed(4),
    significant: pValue < 0.05,
    misleadingSignificance,
    strengthInfo,
    trendLabel,
    rawR: r, rawA, rawB,
    getStrength
  };
};

const approximatePValue = (t, df) => {
  if (df <= 0) return 1;
  const x = df / (df + t * t);
  const a = df / 2;
  const b = 0.5;
  const betaInc = incompleteBeta(x, a, b);
  return Math.min(1, Math.max(0, betaInc));
};

const incompleteBeta = (x, a, b) => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta = lgamma(a) + lgamma(b) - lgamma(a + b);
  const logx = Math.log(x);
  const log1mx = Math.log(1 - x);
  let sum = 0;
  for (let i = 0; i < 200; i++) {
    sum += Math.exp(i * log1mx + a * logx - lbeta - Math.log(a + i) + lgamma(a + i + 1) - lgamma(i + 1) - lgamma(a + 1));
    if (Math.abs(Math.exp(i * log1mx)) < 1e-10) break;
  }
  const result = Math.exp(a * logx - lbeta) / a;
  return Math.min(1, Math.max(0, result + sum * 0.01));
};

const lgamma = (n) => {
  if (n <= 0) return 0;
  if (n < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * n)) - lgamma(1 - n);
  n -= 1;
  let x = 0.99999999999980993;
  const g = 7;
  const c = [676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7];
  for (let i = 0; i < g; i++) x += c[i] / (n + i + 1);
  const t = n + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (n + 0.5) * Math.log(t) - t + Math.log(x);
};

const buildRegressionLine = (data, stats) => {
  if (!data || !stats) return [];
  const xs = data.map(d => d.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  return [
    { x: minX, y: stats.rawA + stats.rawB * minX },
    { x: maxX, y: stats.rawA + stats.rawB * maxX }
  ];
};

const PALETTES = {
  neon: { name: "Neón", dot: "#6366f1", line: "#ec4899", bg: "#6366f1" },
  ocean: { name: "Océano", dot: "#06b6d4", line: "#0891b2", bg: "#06b6d4" },
  forest: { name: "Bosque", dot: "#10b981", line: "#059669", bg: "#10b981" },
  sunset: { name: "Atardecer", dot: "#f97316", line: "#ef4444", bg: "#f97316" },
  violet: { name: "Violeta", dot: "#a855f7", line: "#7c3aed", bg: "#a855f7" }
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const Lab4_2 = ({ goHome, setView }) => {
  const [activeTab, setActiveTab] = useState("intro");
  const [selectedDataset, setSelectedDataset] = useState("");
  const [activeData, setActiveData] = useState([]);
  const [xLabel, setXLabel] = useState("Variable X");
  const [yLabel, setYLabel] = useState("Variable Y");
  const [datasetLabel, setDatasetLabel] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedColumns, setUploadedColumns] = useState([]);
  const [rawUploadedData, setRawUploadedData] = useState([]);
  const [selectedXCol, setSelectedXCol] = useState("");
  const [selectedYCol, setSelectedYCol] = useState("");

  const [showRegression, setShowRegression] = useState(true);
  const [predictionX, setPredictionX] = useState("");
  const [predictionResult, setPredictionResult] = useState(null);
  const [colorPalette, setColorPalette] = useState("neon");
  const [chartBg, setChartBg] = useState("transparent");
  const [chartTitle, setChartTitle] = useState("Diagrama de Dispersión");
  const [chartKey, setChartKey] = useState(0);

  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [practiceResults, setPracticeResults] = useState({});
  const [practiceScore, setPracticeScore] = useState(0);
  const [practiceMode, setPracticeMode] = useState("quiz");
  const [appliedAnswers, setAppliedAnswers] = useState({ trend: null, rStrength: null, rSign: null });
  const [appliedFeedback, setAppliedFeedback] = useState(null);

  const chartRef = useRef(null);

  const stats = useMemo(() => computeStats(activeData), [activeData]);
  const regressionLine = useMemo(() => buildRegressionLine(activeData, stats), [activeData, stats]);

  const handleDatasetSelect = (key) => {
    const ds = PRESET_DATASETS[key];
    setSelectedDataset(key);
    setActiveData(ds.data);
    setXLabel(ds.xLabel);
    setYLabel(ds.yLabel);
    setDatasetLabel(ds.label);
    setUploadedFile(null);
    setUploadedColumns([]);
    setPredictionResult(null);
    setChartKey(p => p + 1);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "csv") {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: (r) => processUpload(r.data, file.name)
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const wb = XLSX.read(new Uint8Array(ev.target.result), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        processUpload(XLSX.utils.sheet_to_json(ws), file.name);
      };
      reader.readAsArrayBuffer(file);
    }
    e.target.value = "";
  };

  const processUpload = (data, filename) => {
    if (!data || data.length === 0) return;
    const keys = Object.keys(data[0]).filter(k => {
      const sample = data.slice(0, 5).map(r => parseFloat(r[k]));
      return sample.some(v => !isNaN(v));
    });
    setUploadedColumns(keys);
    setRawUploadedData(data);
    setSelectedDataset("");
    setDatasetLabel(filename.replace(/\.(csv|xlsx|xls)$/i, ""));
    if (keys.length >= 2) {
      setSelectedXCol(keys[0]);
      setSelectedYCol(keys[1]);
      buildFromCols(data, keys[0], keys[1]);
    }
  };

  const buildFromCols = (raw, xcol, ycol) => {
    const pts = raw
      .map(r => ({ x: parseFloat(r[xcol]), y: parseFloat(r[ycol]) }))
      .filter(p => !isNaN(p.x) && !isNaN(p.y));
    setActiveData(pts);
    setXLabel(xcol);
    setYLabel(ycol);
    setChartKey(p => p + 1);
  };

  const handlePredict = () => {
    const xVal = parseFloat(predictionX);
    if (isNaN(xVal) || !stats) return;
    // FIX: use rawA and rawB (numbers) for accurate prediction
    const yPred = stats.rawA + stats.rawB * xVal;
    setPredictionResult({ x: xVal, y: yPred.toFixed(3) });
  };

  const handlePracticeAnswer = (qId, idx) => setPracticeAnswers(p => ({ ...p, [qId]: idx }));

  const checkQuiz = () => {
    const results = {};
    let correct = 0;
    PRACTICE_QUESTIONS.forEach(q => {
      const isCorrect = practiceAnswers[q.id] === q.correct;
      results[q.id] = { correct: isCorrect, userAnswer: practiceAnswers[q.id] };
      if (isCorrect) correct++;
    });
    setPracticeResults(results);
    setPracticeScore(correct);
  };

  const checkApplied = () => {
    if (!stats || activeData.length === 0) {
      setAppliedFeedback({ msg: "⚠️ Selecciona un dataset en la pestaña 'Análisis' primero." });
      return;
    }
    const r = parseFloat(stats.r);
    const abs = Math.abs(r);

    // FIX: use same unified thresholds as computeStats
    let strengthReal;
    if (abs < 0.1) strengthReal = "ninguna";
    else if (abs < 0.3) strengthReal = "debil";
    else if (abs < 0.7) strengthReal = "moderada";
    else strengthReal = "fuerte";

    const signReal = r > 0.1 ? "positiva" : r < -0.1 ? "negativa" : "nula";

    let trendReal;
    if (r > 0.1) trendReal = "positiva";
    else if (r < -0.1) trendReal = "negativa";
    else trendReal = "ninguna";

    const s1 = appliedAnswers.trend === trendReal;
    const s2 = appliedAnswers.rStrength === strengthReal;
    const s3 = appliedAnswers.rSign === signReal;
    const score = [s1, s2, s3].filter(Boolean).length;

    setAppliedFeedback({
      score, total: 3,
      details: { trend: { correct: s1, real: trendReal }, rStrength: { correct: s2, real: strengthReal }, rSign: { correct: s3, real: signReal } },
      r: stats.r, r2: stats.r2, a: stats.a, b: stats.b,
      significant: stats.significant,
      pValue: stats.pValue,
      n: stats.n,
      strengthLabel: stats.strengthInfo.label,
      misleadingSignificance: stats.misleadingSignificance
    });
  };

  const exportChart = () => {
    if (!chartRef.current) return;
    const svg = chartRef.current.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = `scatter_${datasetLabel.replace(/\s+/g, "_")}.png`;
      link.href = canvas.toDataURL(); link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  // ===================== INTRO =====================
  const renderIntro = () => (
    <div className="space-y-8">
      {/* Qué son variables cuantitativas */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-3xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-cyan-500/20 rounded-xl"><LineChart className="w-8 h-8 text-cyan-400" /></div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2">¿Qué son las Variables Cuantitativas?</h2>
            <p className="text-slate-400 leading-relaxed">
              Las variables cuantitativas tienen valores <strong className="text-white">numéricos medibles</strong>. Cuando analizamos
              dos de ellas simultáneamente podemos estudiar su <strong className="text-cyan-300">relación estadística</strong>.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: "📊", title: "Dispersión", color: "blue", desc: "Visualiza la relación entre X e Y en un plano cartesiano" },
            { icon: "ρ", title: "Correlación", color: "purple", desc: "Cuantifica la fuerza y dirección de la relación lineal (−1 a +1)" },
            { icon: "y=a+bx", title: "Regresión Lineal", color: "cyan", desc: "Modela la relación y permite hacer predicciones" }
          ].map((item, i) => (
            <div key={i} className={`bg-${item.color}-500/10 border-2 border-${item.color}-500/20 rounded-2xl p-6 hover:scale-[1.02] transition-all`}>
              <div className="text-3xl font-black text-white mb-3">{item.icon}</div>
              <h3 className="text-lg font-black text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tipos de tendencia */}
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-8">
        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-400" /> Tipos de Tendencia
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: "Positiva", icon: TrendingUp, color: "green", desc: "Al aumentar X, Y también aumenta", example: "Publicidad → Ventas" },
            { label: "Negativa", icon: TrendingDown, color: "red", desc: "Al aumentar X, Y disminuye", example: "Altitud → Temperatura" },
            { label: "Sin tendencia", icon: Minus, color: "slate", desc: "No hay patrón lineal entre X e Y", example: "Altura → CI" }
          ].map((t, i) => (
            <div key={i} className={`bg-${t.color}-500/10 border border-${t.color}-500/20 rounded-2xl p-5`}>
              <div className="flex items-center gap-3 mb-3">
                <t.icon className={`w-6 h-6 text-${t.color}-400`} />
                <span className="font-black text-white">{t.label}</span>
              </div>
              <p className="text-sm text-slate-300 mb-2">{t.desc}</p>
              <p className={`text-xs font-bold text-${t.color}-400`}>Ej: {t.example}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Correlación de Pearson */}
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-8">
        <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
          <Sigma className="w-6 h-6 text-purple-400" /> Coeficiente de Correlación de Pearson (r)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            {[
              { range: "r = +1", label: "Positiva perfecta", color: "bg-emerald-500" },
              { range: "0.7 ≤ r < 1", label: "Positiva fuerte", color: "bg-green-400" },
              { range: "0.3 ≤ r < 0.7", label: "Positiva moderada", color: "bg-lime-400" },
              { range: "−0.3 < r < 0.3", label: "Sin correlación lineal", color: "bg-slate-500" },
              { range: "−0.7 < r ≤ −0.3", label: "Negativa moderada", color: "bg-orange-400" },
              { range: "−1 < r ≤ −0.7", label: "Negativa fuerte", color: "bg-red-400" },
              { range: "r = −1", label: "Negativa perfecta", color: "bg-red-600" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm font-bold text-white w-32">{item.range}</span>
                <span className="text-sm text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl p-6">
            <h4 className="font-black text-white mb-3">⚠️ Correlación ≠ Causalidad</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Que dos variables tengan una correlación alta <strong className="text-white">no significa</strong> que
              una cause a la otra. Puede haber una <strong className="text-cyan-400">tercera variable</strong> que
              explique ambas, o puede ser una <strong className="text-yellow-400">coincidencia estadística</strong>.
            </p>
            <div className="mt-4 p-3 bg-slate-900/40 rounded-lg">
              <p className="text-xs text-slate-400 italic">
                Ejemplo clásico: El consumo de helado y los ahogamientos están correlacionados… porque ambos aumentan en verano.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── NUEVO BLOQUE: r vs p-value ─────────────────────────────────────── */}
      <div className="bg-slate-900/60 border border-amber-500/20 rounded-3xl p-8">
        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
          <Scale className="w-6 h-6 text-amber-400" />
          📌 Diferencia clave: <span className="text-cyan-400 ml-1">r</span> vs <span className="text-amber-400 ml-1">p-value</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* r */}
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <span className="text-cyan-300 font-black text-lg">r</span>
              </div>
              <div>
                <p className="font-black text-white">Coeficiente de Correlación</p>
                <p className="text-xs text-cyan-400 font-bold">Magnitud del efecto</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">▸</span> Mide la <strong className="text-white">fuerza y dirección</strong> de la relación</li>
              <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">▸</span> Rango: <strong className="text-white">−1 a +1</strong></li>
              <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">▸</span> Indica <strong className="text-white">qué tan grande es el efecto</strong> en los datos</li>
              <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">▸</span> <strong className="text-white">No depende del n</strong> directamente</li>
            </ul>
            <div className="mt-4 p-3 bg-slate-900/40 rounded-lg">
              <p className="text-xs text-slate-400">Ejemplo: <span className="text-cyan-300 font-bold">r = 0.85</span> → relación lineal fuerte y positiva</p>
            </div>
          </div>

          {/* p-value */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-300 font-black text-lg">p</span>
              </div>
              <div>
                <p className="font-black text-white">p-value (valor p)</p>
                <p className="text-xs text-amber-400 font-bold">Significancia estadística</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">▸</span> Evalúa si la correlación es <strong className="text-white">distinta de 0 en la población</strong></li>
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">▸</span> Rango: <strong className="text-white">0 a 1</strong></li>
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">▸</span> Indica <strong className="text-white">evidencia estadística</strong>, no magnitud</li>
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">▸</span> <strong className="text-white">Muy sensible al tamaño de muestra (n)</strong></li>
            </ul>
            <div className="mt-4 p-3 bg-slate-900/40 rounded-lg">
              <p className="text-xs text-slate-400">Ejemplo: <span className="text-amber-300 font-bold">p = 0.03</span> → significativo al 5% (si n es suficiente)</p>
            </div>
          </div>
        </div>

        {/* Zona de advertencia */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-white mb-2">⚠️ Trampa frecuente: Significativo ≠ Importante</h4>
              <p className="text-sm text-slate-300 leading-relaxed mb-3">
                Una correlación puede ser <strong className="text-green-400">estadísticamente significativa</strong> (p &lt; 0.05)
                pero <strong className="text-red-400">prácticamente despreciable</strong> en magnitud, especialmente
                cuando <strong className="text-white">n es muy grande</strong>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { n: "n = 10", r: "r = 0.63", p: "p = 0.049", verdict: "Significativo", color: "text-green-400", bg: "bg-green-500/10" },
                  { n: "n = 100", r: "r = 0.20", p: "p = 0.046", verdict: "Significativo — ¡pero débil!", color: "text-amber-400", bg: "bg-amber-500/10" },
                  { n: "n = 1000", r: "r = 0.06", p: "p = 0.047", verdict: "Significativo — ¡pero ínfimo!", color: "text-red-400", bg: "bg-red-500/10" }
                ].map((ex, i) => (
                  <div key={i} className={`${ex.bg} rounded-xl p-4 border border-white/10`}>
                    <p className="text-xs text-slate-400 mb-1">{ex.n}</p>
                    <p className="text-lg font-black text-white">{ex.r}</p>
                    <p className="text-sm text-slate-300">{ex.p}</p>
                    <p className={`text-xs font-bold mt-2 ${ex.color}`}>{ex.verdict}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3 italic">
                💡 Por eso siempre hay que interpretar <strong className="text-white">r y p-value juntos</strong>,
                considerando también el tamaño de muestra y el contexto.
              </p>
            </div>
          </div>
        </div>

        {/* Resumen visual comparativo */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-slate-400 font-bold">Característica</th>
                <th className="text-center py-3 px-4 text-cyan-400 font-bold">r (correlación)</th>
                <th className="text-center py-3 px-4 text-amber-400 font-bold">p-value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                ["¿Qué mide?", "Fuerza y dirección", "Evidencia contra H₀: ρ = 0"],
                ["Rango", "−1 a +1", "0 a 1"],
                ["¿Depende de n?", "Poco", "Mucho"],
                ["¿Indica magnitud?", "✅ Sí", "❌ No"],
                ["¿Indica significancia?", "❌ No", "✅ Sí"],
                ["Umbral habitual", "|r| ≥ 0.7 = fuerte", "p < 0.05 = significativo"],
              ].map(([feat, rVal, pVal], i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-slate-300 font-medium">{feat}</td>
                  <td className="py-3 px-4 text-center text-cyan-300">{rVal}</td>
                  <td className="py-3 px-4 text-center text-amber-300">{pVal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regresión Lineal */}
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-8">
        <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
          <LineChart className="w-6 h-6 text-cyan-400" /> Regresión Lineal Simple
        </h3>
        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-6 mb-6 text-center">
          <p className="text-3xl font-black text-white tracking-wider">y = a + b·x</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { sym: "y", label: "Variable dependiente (respuesta)" },
              { sym: "x", label: "Variable independiente (predictora)" },
              { sym: "a", label: "Intercepto: valor de y cuando x = 0" },
              { sym: "b", label: "Pendiente: cambio en y por unidad de x" }
            ].map((item, i) => (
              <div key={i} className="bg-slate-900/50 rounded-xl p-4">
                <p className="text-2xl font-black text-cyan-400 mb-1">{item.sym}</p>
                <p className="text-xs text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
            <h4 className="font-bold text-green-400 mb-2">R² cercano a 1.0</h4>
            <p className="text-sm text-slate-300">El modelo explica bien la relación entre las variables. La línea se ajusta a los datos.</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
            <h4 className="font-bold text-red-400 mb-2">R² cercano a 0</h4>
            <p className="text-sm text-slate-300">El modelo no explica la relación. No hay patrón lineal en los datos.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ===================== ANÁLISIS =====================
  const renderAnalysis = () => {
    const palette = PALETTES[colorPalette];
    const isLightBg = chartBg === "#ffffff" || chartBg === "#f5f5f5";
    const textColor = isLightBg ? "#1e293b" : "#e2e8f0";

    const CustomDot = (props) => {
      const { cx, cy } = props;
      return <circle cx={cx} cy={cy} r={5} fill={palette.dot} fillOpacity={0.8} stroke="white" strokeWidth={1} />;
    };

    const CustomTooltip = ({ active, payload }) => {
      if (!active || !payload?.length) return null;
      const { x, y } = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-white/20 rounded-xl p-3 shadow-2xl text-sm">
          <p className="text-slate-400">{xLabel}: <span className="text-white font-bold">{x}</span></p>
          <p className="text-slate-400">{yLabel}: <span className="text-white font-bold">{y}</span></p>
          {stats && (
            <p className="text-cyan-400 text-xs mt-1">
              Predicción: {(stats.rawA + stats.rawB * x).toFixed(2)}
            </p>
          )}
        </div>
      );
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel Izquierdo */}
        <div className="lg:col-span-4 space-y-5">
          {/* Datasets */}
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" /> Datasets Disponibles
            </h3>
            <div className="space-y-2 mb-4">
              {Object.entries(PRESET_DATASETS).map(([key, ds]) => {
                const Icon = ds.icon;
                return (
                  <button key={key} onClick={() => handleDatasetSelect(key)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedDataset === key
                      ? "bg-cyan-500/20 border-cyan-400"
                      : "bg-slate-800/50 border-slate-700 hover:border-cyan-500/50"}`}>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${selectedDataset === key ? "text-cyan-300" : "text-slate-400"}`} />
                      <div>
                        <p className="font-bold text-white text-sm">{ds.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{ds.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="border-t border-white/10 pt-4">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">O sube tu archivo</label>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" id="file-upload-42" />
              <label htmlFor="file-upload-42"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-cyan-300">
                  {uploadedFile ? uploadedFile.name : "Seleccionar archivo"}
                </span>
              </label>
              {uploadedColumns.length >= 2 && (
                <div className="mt-3 space-y-3">
                  {[["Variable X (independiente)", selectedXCol, setSelectedXCol], ["Variable Y (dependiente)", selectedYCol, setSelectedYCol]].map(([lbl, val, setter], i) => (
                    <div key={i}>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{lbl}</label>
                      <select value={val} onChange={e => { setter(e.target.value); const xc = i === 0 ? e.target.value : selectedXCol; const yc = i === 1 ? e.target.value : selectedYCol; buildFromCols(rawUploadedData, xc, yc); }}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white">
                        {uploadedColumns.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Configuración */}
          {activeData.length > 0 && (
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" /> Configuración
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Título del gráfico</label>
                  <input type="text" value={chartTitle} onChange={e => setChartTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm font-bold text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Etiqueta Eje X</label>
                  <input type="text" value={xLabel} onChange={e => setXLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm font-bold text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Etiqueta Eje Y</label>
                  <input type="text" value={yLabel} onChange={e => setYLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm font-bold text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Paleta de colores</label>
                  <select value={colorPalette} onChange={e => setColorPalette(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white">
                    {Object.entries(PALETTES).map(([k, p]) => <option key={k} value={k}>{p.name}</option>)}
                  </select>
                  <div className="mt-2 h-5 rounded-lg" style={{ background: `linear-gradient(90deg, ${PALETTES[colorPalette].dot}, ${PALETTES[colorPalette].line})` }} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Fondo del gráfico</label>
                  <select value={chartBg} onChange={e => { setChartBg(e.target.value); setChartKey(p => p + 1); }}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white">
                    <option value="transparent">Transparente</option>
                    <option value="#ffffff">Blanco</option>
                    <option value="#f5f5f5">Gris Claro</option>
                    <option value="#1e293b">Pizarra</option>
                    <option value="#000000">Negro</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-sm font-bold text-white">Mostrar regresión</span>
                  <button onClick={() => setShowRegression(p => !p)}
                    className={`w-12 h-6 rounded-full transition-all ${showRegression ? "bg-cyan-500" : "bg-slate-700"}`}>
                    <div className={`w-5 h-5 bg-white rounded-full transition-all mx-0.5 ${showRegression ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Predictor */}
          {stats && showRegression && (
            <div className="bg-slate-900/60 border border-cyan-500/20 rounded-3xl p-6">
              <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-cyan-400" /> Predictor
              </h3>
              <p className="text-xs text-slate-400 mb-3">y = {stats.a} + {stats.b}·x</p>
              <div className="flex gap-2">
                <input type="number" value={predictionX} onChange={e => setPredictionX(e.target.value)}
                  placeholder={`Valor de x`}
                  className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-sm font-bold text-white" />
                <button onClick={handlePredict}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-bold text-white text-sm transition-all">
                  =
                </button>
              </div>
              {predictionResult && (
                <div className="mt-3 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Para x = {predictionResult.x}:</p>
                  <p className="text-xl font-black text-cyan-400">ŷ = {predictionResult.y}</p>
                  <p className="text-xs text-slate-500 mt-1">{yLabel}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel Derecho */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Eye className="w-6 h-6 text-cyan-400" /> Diagrama de Dispersión
              </h3>
              {activeData.length > 0 && (
                <button onClick={exportChart}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-bold text-sm flex items-center gap-2 transition-all">
                  <Download className="w-4 h-4" /> Exportar
                </button>
              )}
            </div>

            {activeData.length === 0 ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                  <p className="text-lg font-bold text-slate-400">Selecciona un dataset</p>
                </div>
              </div>
            ) : (
              <div ref={chartRef} key={chartKey} style={{ backgroundColor: chartBg }} className="rounded-xl p-4">
                <h4 className="text-center text-sm font-bold mb-1" style={{ color: textColor }}>{chartTitle}</h4>
                <p className="text-center text-xs text-slate-500 mb-4">{xLabel} vs {yLabel} | n = {activeData.length}</p>
                <ResponsiveContainer width="100%" height={420}>
                  <ComposedChart margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                    <XAxis dataKey="x" type="number" name={xLabel} domain={["auto", "auto"]}
                      tick={{ fill: textColor, fontSize: 11 }}
                      label={{ value: xLabel, position: "insideBottom", offset: -15, style: { fill: textColor, fontWeight: 700, fontSize: 11 } }} />
                    <YAxis dataKey="y" type="number" name={yLabel} domain={["auto", "auto"]}
                      tick={{ fill: textColor, fontSize: 11 }}
                      label={{
                        value: yLabel,
                        angle: -90,
                        position: "insideLeft",
                        offset: 20,
                        style: { fill: textColor, fontWeight: 700, fontSize: 11, textAnchor: "middle" }
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Scatter data={activeData} shape={<CustomDot />} />
                    {showRegression && regressionLine.length === 2 && (
                      <Line
                        data={regressionLine}
                        type="linear"
                        dataKey="y"
                        stroke={palette.line}
                        strokeWidth={2.5}
                        dot={false}
                        strokeDasharray="0"
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Resultados estadísticos */}
            {stats && (
              <div className="mt-6 space-y-4">
                {/* Métricas clave */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Correlación (r)", value: stats.r, color: "text-cyan-400", sub: stats.strengthInfo.label },
                    { label: "R² (coef. det.)", value: stats.r2, color: "text-purple-400", sub: `${(parseFloat(stats.r2) * 100).toFixed(1)}% varianza explicada` },
                    { label: "Intercepto (a)", value: stats.a, color: "text-pink-400", sub: `y cuando x = 0` },
                    { label: "Pendiente (b)", value: stats.b, color: "text-amber-400", sub: "cambio en y por unidad x" }
                  ].map((m, i) => (
                    <div key={i} className="bg-slate-900/50 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">{m.label}</p>
                      <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{m.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Ecuación y decisión */}
                <div className="p-5 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-1 font-bold">Ecuación de Regresión:</p>
                      <p className="text-xl font-black text-white">
                        ŷ = {stats.a} + ({stats.b})·x
                      </p>
                    </div>

                    {/* ── MEJORADO: badge de significancia con magnitud y advertencia ── */}
                    <div className="flex flex-col gap-2">
                      <div className={`px-4 py-2 rounded-xl border ${stats.significant
                        ? "bg-green-500/10 border-green-500/30" : "bg-orange-500/10 border-orange-500/30"}`}>
                        <p className="text-xs font-bold mb-0.5" style={{ color: stats.significant ? "#4ade80" : "#fb923c" }}>
                          {stats.significant ? "✅ Correlación Significativa" : "⚠️ No significativa"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          p-value ≈ {stats.pValue} | n = {stats.n} | {stats.strengthInfo.label}
                        </p>
                      </div>
                      {/* Advertencia de significancia engañosa */}
                      {stats.misleadingSignificance && (
                        <div className="px-4 py-2 rounded-xl border bg-red-500/10 border-red-500/30 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-red-300 font-bold leading-tight">
                            Significativo estadísticamente, pero r es prácticamente nulo. El n grande infla la significancia.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-slate-900/30 rounded-lg">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      <strong className="text-cyan-400">Interpretación: </strong>
                      {/* FIX: use rawB (number) for conditional, stats.b (string) only for display */}
                      {stats.rawB >= 0
                        ? `Por cada unidad que aumenta ${xLabel}, ${yLabel} aumenta en promedio ${stats.b} unidades.`
                        : `Por cada unidad que aumenta ${xLabel}, ${yLabel} disminuye en promedio ${Math.abs(parseFloat(stats.b)).toFixed(3)} unidades.`
                      }
                      {" "}El modelo explica el <strong className="text-purple-400">{(parseFloat(stats.r2) * 100).toFixed(1)}%</strong> de la variabilidad.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ===================== PRÁCTICA =====================
  const renderPractice = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-3xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-green-500/20 rounded-xl"><Brain className="w-8 h-8 text-green-400" /></div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2">Modo Práctica</h2>
            <p className="text-slate-400">Evalúa tus conocimientos sobre correlación y regresión lineal</p>
          </div>
        </div>

        {/* Selector de modo */}
        <div className="flex gap-3 mb-6">
          {[
            { id: "applied", label: "Práctica Aplicada", icon: Target, bg: "bg-green-500", shadow: "shadow-green-500/30" },
            { id: "quiz", label: "Quiz Teórico", icon: Brain, bg: "bg-indigo-500", shadow: "shadow-indigo-500/30" }
          ].map(mode => (
            <button key={mode.id} onClick={() => { setPracticeMode(mode.id); setPracticeResults({}); setPracticeAnswers({}); setAppliedFeedback(null); }}
              className={`flex-1 px-6 py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${practiceMode === mode.id
                ? `${mode.bg} text-white shadow-lg ${mode.shadow}`
                : "bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700"}`}>
              <mode.icon className="w-5 h-5" />{mode.label}
            </button>
          ))}
        </div>

        {/* Práctica Aplicada */}
        {practiceMode === "applied" && (
          <div className="space-y-5">
            <div className="p-5 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">
                  Analiza el dataset seleccionado en <strong className="text-cyan-400">"Análisis"</strong> y responde las preguntas.
                  {activeData.length === 0 && <span className="text-orange-400 block mt-1">⚠️ Primero selecciona un dataset en la pestaña 'Análisis'.</span>}
                </p>
              </div>
            </div>

            {activeData.length > 0 && (
              <>
                <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700">
                  <h4 className="font-bold text-white mb-3">Dataset: <span className="text-cyan-400">{datasetLabel}</span></h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-400">X:</span> <span className="text-white font-bold ml-2">{xLabel}</span></div>
                    <div><span className="text-slate-400">Y:</span> <span className="text-white font-bold ml-2">{yLabel}</span></div>
                    <div><span className="text-slate-400">n:</span> <span className="text-white font-bold ml-2">{activeData.length}</span></div>
                    <div><span className="text-slate-400">r calculado:</span> <span className="text-cyan-400 font-black ml-2">{stats?.r || "—"}</span></div>
                  </div>
                </div>

                {/* Pregunta 1 */}
                <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-700">
                  <h4 className="font-bold text-white mb-4">1️⃣ ¿Qué tipo de tendencia muestra el diagrama de dispersión?</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "positiva", label: "Positiva", icon: TrendingUp },
                      { id: "negativa", label: "Negativa", icon: TrendingDown },
                      { id: "ninguna", label: "Sin tendencia", icon: Minus }
                    ].map(opt => (
                      <button key={opt.id} onClick={() => setAppliedAnswers(p => ({ ...p, trend: opt.id }))}
                        className={`p-4 rounded-xl font-bold text-sm transition-all flex flex-col items-center gap-2 ${appliedAnswers.trend === opt.id
                          ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                        <opt.icon className="w-5 h-5" />{opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pregunta 2 */}
                <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-700">
                  <h4 className="font-bold text-white mb-4">2️⃣ ¿Qué fuerza de correlación tiene r = {stats?.r}?</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "ninguna", label: "Sin correlación (|r| < 0.1)" },
                      { id: "debil", label: "Débil (0.1 ≤ |r| < 0.3)" },
                      { id: "moderada", label: "Moderada (0.3 ≤ |r| < 0.7)" },
                      { id: "fuerte", label: "Fuerte (|r| ≥ 0.7)" }
                    ].map(opt => (
                      <button key={opt.id} onClick={() => setAppliedAnswers(p => ({ ...p, rStrength: opt.id }))}
                        className={`px-4 py-3 rounded-lg font-bold text-sm transition-all ${appliedAnswers.rStrength === opt.id
                          ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pregunta 3 */}
                <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-700">
                  <h4 className="font-bold text-white mb-4">3️⃣ ¿El coeficiente r es positivo, negativo o nulo?</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "positiva", label: "Positivo (r > 0)" },
                      { id: "negativa", label: "Negativo (r < 0)" },
                      { id: "nula", label: "Nulo (r ≈ 0)" }
                    ].map(opt => (
                      <button key={opt.id} onClick={() => setAppliedAnswers(p => ({ ...p, rSign: opt.id }))}
                        className={`px-4 py-3 rounded-lg font-bold text-sm transition-all ${appliedAnswers.rSign === opt.id
                          ? "bg-amber-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <button onClick={checkApplied}
                    disabled={!appliedAnswers.trend || !appliedAnswers.rStrength || !appliedAnswers.rSign}
                    className="px-8 py-4 bg-green-500 hover:bg-green-600 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-black text-white flex items-center gap-2 transition-all shadow-lg">
                    <CheckCircle className="w-5 h-5" /> Verificar Respuestas
                  </button>
                </div>

                {appliedFeedback && (
                  <div className={`p-6 rounded-2xl border-2 ${appliedFeedback.msg
                    ? "bg-orange-500/10 border-orange-500/50"
                    : appliedFeedback.score >= 2 ? "bg-green-500/10 border-green-500/50" : "bg-red-500/10 border-red-500/50"}`}>
                    {appliedFeedback.msg ? (
                      <p className="text-orange-300 font-bold">{appliedFeedback.msg}</p>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-black text-white">Resultados</h3>
                          <div className="text-3xl font-black text-cyan-400">{appliedFeedback.score} / {appliedFeedback.total}</div>
                        </div>
                        <div className="space-y-3">
                          {[
                            { key: "trend", label: "Tendencia", real: appliedFeedback.details.trend.real },
                            { key: "rStrength", label: "Fuerza de correlación", real: appliedFeedback.details.rStrength.real },
                            { key: "rSign", label: "Signo de r", real: appliedFeedback.details.rSign.real }
                          ].map(item => (
                            <div key={item.key} className={`p-4 rounded-lg ${appliedFeedback.details[item.key].correct
                              ? "bg-green-500/20 border border-green-500/30" : "bg-red-500/20 border border-red-500/30"}`}>
                              <div className="flex items-center gap-2">
                                {appliedFeedback.details[item.key].correct
                                  ? <CheckCircle className="w-5 h-5 text-green-400" />
                                  : <XCircle className="w-5 h-5 text-red-400" />}
                                <span className="font-bold text-white">{item.label}</span>
                              </div>
                              <p className="text-sm text-slate-300 mt-1">Respuesta correcta: <strong className="text-cyan-400">{item.real}</strong></p>
                            </div>
                          ))}
                        </div>

                        {/* ── MEJORADO: feedback con r, p-value y magnitud juntos ── */}
                        <div className="mt-4 p-4 bg-slate-900/40 rounded-xl space-y-3">
                          <p className="text-sm font-bold text-white mb-1">Estadísticos del dataset:</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-cyan-500/10 rounded-lg p-3">
                              <p className="text-xs text-slate-400">Correlación (r)</p>
                              <p className="text-lg font-black text-cyan-400">{appliedFeedback.r}</p>
                              <p className="text-xs text-slate-400 mt-1">{appliedFeedback.strengthLabel}</p>
                            </div>
                            <div className={`rounded-lg p-3 ${appliedFeedback.significant ? "bg-green-500/10" : "bg-orange-500/10"}`}>
                              <p className="text-xs text-slate-400">p-value (n={appliedFeedback.n})</p>
                              <p className={`text-lg font-black ${appliedFeedback.significant ? "text-green-400" : "text-orange-400"}`}>
                                {appliedFeedback.pValue}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {appliedFeedback.significant ? "✅ Significativo (p < 0.05)" : "⚠️ No significativo"}
                              </p>
                            </div>
                          </div>
                          {appliedFeedback.misleadingSignificance && (
                            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                              <p className="text-xs text-red-300">
                                <strong>Atención:</strong> el p-value es significativo pero r es casi nulo. Con n grande, la significancia estadística puede ser engañosa. Siempre analiza r y p juntos.
                              </p>
                            </div>
                          )}
                          <p className="text-sm text-slate-300">R² = <span className="text-purple-400 font-black">{appliedFeedback.r2}</span> — Ecuación: ŷ = <span className="text-amber-400 font-bold">{appliedFeedback.a}</span> + <span className="text-amber-400 font-bold">{appliedFeedback.b}</span>·x</p>
                        </div>

                        <button onClick={() => { setAppliedFeedback(null); setAppliedAnswers({ trend: null, rStrength: null, rSign: null }); }}
                          className="mt-4 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-bold text-white transition-all">
                          Intentar de Nuevo
                        </button>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Quiz teórico */}
        {practiceMode === "quiz" && (
          <>
            {Object.keys(practiceResults).length > 0 && (
              <div className="mb-6 p-6 bg-slate-900/50 rounded-xl border-2 border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white mb-1">Resultado Final</h3>
                    <p className="text-sm text-slate-400">{practiceScore} de {PRACTICE_QUESTIONS.length} correctas</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-cyan-400">
                      {((practiceScore / PRACTICE_QUESTIONS.length) * 100).toFixed(0)}%
                    </div>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      {practiceScore === PRACTICE_QUESTIONS.length
                        ? <><Award className="w-4 h-4 text-yellow-400" /><span className="text-xs text-yellow-400 font-bold">¡Perfecto!</span></>
                        : practiceScore >= Math.round(PRACTICE_QUESTIONS.length * 0.75)
                          ? <span className="text-xs text-green-400 font-bold">¡Muy bien!</span>
                          : <span className="text-xs text-orange-400 font-bold">Sigue practicando</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-5">
              {PRACTICE_QUESTIONS.map((q, qi) => {
                const result = practiceResults[q.id];
                return (
                  <div key={q.id} className={`bg-slate-900/50 rounded-2xl p-6 border-2 transition-all ${result
                    ? result.correct ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"
                    : "border-slate-700 hover:border-slate-600"}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${result
                        ? result.correct ? "bg-green-500 text-white" : "bg-red-500 text-white"
                        : "bg-cyan-500 text-white"}`}>
                        {result ? (result.correct ? "✓" : "✗") : qi + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-3">{q.question}</h4>
                        <div className="space-y-2">
                          {q.options.map((opt, idx) => {
                            const isSelected = practiceAnswers[q.id] === idx;
                            const isCorrect = idx === q.correct;
                            const showResult = !!result;
                            return (
                              <button key={idx} onClick={() => !showResult && handlePracticeAnswer(q.id, idx)} disabled={showResult}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${showResult
                                  ? isCorrect ? "border-green-500 bg-green-500/10" : isSelected ? "border-red-500 bg-red-500/10" : "border-slate-700 bg-slate-800/30"
                                  : isSelected ? "border-cyan-500 bg-cyan-500/10" : "border-slate-700 bg-slate-800/50 hover:border-cyan-500/50"
                                  } ${showResult ? "cursor-default" : "cursor-pointer"}`}>
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${showResult
                                    ? isCorrect ? "bg-green-500 text-white" : isSelected ? "bg-red-500 text-white" : "bg-slate-700 text-slate-400"
                                    : isSelected ? "bg-cyan-500 text-white" : "bg-slate-700 text-slate-400"}`}>
                                    {String.fromCharCode(65 + idx)}
                                  </div>
                                  <span className={`text-sm ${showResult && isCorrect ? "text-green-400 font-bold" : "text-slate-300"}`}>{opt}</span>
                                  {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />}
                                  {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 ml-auto" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {result && !result.correct && (
                          <div className="mt-3 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                            <p className="text-sm text-cyan-300"><strong className="text-cyan-400">Explicación: </strong>{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {Object.keys(practiceAnswers).length === PRACTICE_QUESTIONS.length && Object.keys(practiceResults).length === 0 && (
              <div className="mt-6 flex justify-center">
                <button onClick={checkQuiz}
                  className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 rounded-xl font-black text-white flex items-center gap-2 shadow-lg transition-all">
                  <CheckCircle className="w-5 h-5" /> Verificar Respuestas
                </button>
              </div>
            )}
            {Object.keys(practiceResults).length > 0 && (
              <div className="mt-6 flex justify-center">
                <button onClick={() => { setPracticeAnswers({}); setPracticeResults({}); setPracticeScore(0); }}
                  className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 rounded-xl font-black text-white flex items-center gap-2 transition-all">
                  <Zap className="w-5 h-5" /> Intentar de Nuevo
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // ===================== RENDER PRINCIPAL =====================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/8 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/8 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => { if (goHome) goHome(); else if (setView) setView("home"); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/40 text-sm font-bold text-slate-200 transition-all duration-300 hover:scale-105 active:scale-95 group">
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="tracking-wide">Volver al Índice</span>
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
            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-xs text-cyan-400 font-black uppercase">Lab 4.2</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8 relative">
        {/* Header */}
        <section className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 border-l-4 border-l-cyan-500 relative overflow-hidden">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <div className="w-64 h-64 rounded-3xl border-8 border-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-40 h-40 text-cyan-400" />
            </div>
          </div>
          <div className="flex items-start gap-6 relative z-10">
            <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl border border-cyan-500/30 shrink-0">
              <TrendingUp className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-black text-cyan-500 uppercase bg-cyan-500/10 px-3 py-1 rounded-full">Sección 4.2</span>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">4.2 Dos Variables Cuantitativas</h2>
              <p className="text-slate-400 leading-relaxed max-w-3xl">
                Explora la relación entre dos variables numéricas mediante <strong className="text-white">diagramas de dispersión</strong>,
                el <strong className="text-white">coeficiente de correlación de Pearson</strong> y la <strong className="text-white">regresión lineal simple</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="flex gap-3 border-b border-white/10 pb-4">
          {[
            { id: "intro", label: "Introducción", icon: Info },
            { id: "analysis", label: "Análisis", icon: Database },
            { id: "practice", label: "Práctica", icon: Brain }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === tab.id
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                : "bg-white/5 hover:bg-white/10 text-slate-300"}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        {activeTab === "intro" && renderIntro()}
        {activeTab === "analysis" && renderAnalysis()}
        {activeTab === "practice" && renderPractice()}
      </main>
    </div>
  );
};

export default Lab4_2;