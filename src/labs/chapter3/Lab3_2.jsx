import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Calculator, TrendingUp, Database, Eye, Download,
  Activity, Info, Upload, BarChart3, Lightbulb, AlertCircle,
  Settings, Target, Zap, CheckCircle, XCircle, Award, Brain,
  Percent, Hash, ArrowRight, TrendingDown, Minimize2, Maximize2
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ReferenceLine, ComposedChart, Line
} from "recharts";
import Papa from "papaparse";
import * as XLSX from "xlsx";

// ============================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================

const PRESET_DATASETS = {
  calificaciones: {
    label: "Calificaciones de Estudiantes",
    icon: BarChart3,
    data: [4, 5, 6, 7, 5, 8, 6, 7, 9, 5, 6, 7, 8, 6, 5, 4, 7, 8, 9, 6, 5, 6, 7, 8, 9, 5, 6, 7, 8, 6, 5, 4, 7, 8, 9, 6, 5, 6, 7, 8, 9, 5, 6, 7, 8, 6, 5, 4, 7, 8],
    description: "50 calificaciones (escala 4-9)",
    unit: "pts"
  },
  estaturas: {
    label: "Estaturas de Personas",
    icon: TrendingUp,
    data: [160.5, 165.3, 170.1, 155.7, 162.4, 168.9, 172.3, 158.2, 163.8, 167.5, 171.2, 159.6, 164.7, 169.4, 173.1, 156.8, 161.9, 166.5, 170.8, 157.4, 162.7, 167.8, 171.9, 159.1, 164.2, 168.7, 172.5, 158.9, 163.5, 167.2, 170.5, 156.3, 161.5, 166.2, 169.8, 157.8, 162.9, 167.4, 171.1, 159.3, 164.5, 168.3, 172.0, 158.5, 163.2, 166.9, 170.2, 156.7, 161.8, 165.9],
    description: "50 estaturas en centímetros",
    unit: "cm"
  },
  pequeno: {
    label: "Ejemplo Didáctico",
    icon: Target,
    data: [2, 4, 6, 8],
    description: "4 valores simples para práctica",
    unit: ""
  },
  con_outliers: {
    label: "Dataset con Outliers",
    icon: AlertCircle,
    data: [12, 14, 15, 13, 14, 16, 15, 14, 13, 15, 14, 16, 15, 13, 50, 14, 15, 16, 14, 13],
    description: "Datos con valor atípico (50)",
    unit: ""
  },
  concentrado: {
    label: "Datos Concentrados",
    icon: Minimize2,
    data: [6, 7, 8, 9, 10, 7, 8, 6, 7, 8, 9, 7, 8, 6, 7],
    description: "Baja variabilidad (s ≈ 1.2)",
    unit: ""
  },
  disperso: {
    label: "Datos Dispersos",
    icon: Maximize2,
    data: [1, 5, 8, 11, 15, 2, 12, 3, 14, 6, 9, 4, 13, 7, 10],
    description: "Alta variabilidad (s ≈ 4.5)",
    unit: ""
  }
};

const PRACTICE_QUESTIONS = [
  {
    id: 1,
    question: "¿Qué mide la desviación estándar?",
    options: [
      "El valor central de los datos",
      "La dispersión promedio de los datos respecto a la media",
      "La diferencia entre el máximo y el mínimo",
      "El valor más frecuente"
    ],
    correct: 1,
    explanation: "La desviación estándar mide qué tan dispersos están los datos alrededor de la media. Es la raíz cuadrada de la varianza."
  },
  {
    id: 2,
    question: "Si la desviación estándar es 0, ¿qué significa?",
    options: [
      "Hay outliers en los datos",
      "Todos los valores son iguales",
      "La distribución es asimétrica",
      "Hay valores negativos"
    ],
    correct: 1,
    explanation: "s = 0 significa que no hay variabilidad: todos los datos tienen el mismo valor, por lo que no hay dispersión."
  },
  {
    id: 3,
    question: "¿Cuál medida de dispersión es más robusta ante outliers?",
    options: [
      "Rango",
      "Varianza",
      "Desviación estándar",
      "Rango intercuartílico (IQR)"
    ],
    correct: 3,
    explanation: "El IQR solo considera el 50% central de los datos, por lo que no se ve afectado por valores extremos en las colas."
  },
  {
    id: 4,
    question: "Dataset A: s=2.5 | Dataset B: s=8.3. ¿Cuál es más homogéneo?",
    options: [
      "Dataset A (menor desviación estándar)",
      "Dataset B (mayor desviación estándar)",
      "Ambos son igual de homogéneos",
      "No se puede determinar"
    ],
    correct: 0,
    explanation: "A menor desviación estándar, menos dispersos están los datos, lo que indica mayor homogeneidad (valores más similares)."
  },
  {
    id: 5,
    question: "¿Qué representa Q3 - Q1?",
    options: [
      "La mediana",
      "El rango total",
      "El rango intercuartílico (IQR)",
      "La desviación estándar"
    ],
    correct: 2,
    explanation: "IQR = Q3 - Q1 es la diferencia entre el tercer y primer cuartil, que representa la dispersión del 50% central de los datos."
  },
  {
    id: 6,
    question: "Según la regla empírica (68-95-99.7), ¿qué % de datos está en μ ± 2σ?",
    options: ["68%", "95%", "99.7%", "50%"],
    correct: 1,
    explanation: "En una distribución normal, aproximadamente el 95% de los datos están dentro de 2 desviaciones estándar de la media."
  },
  {
    id: 7,
    question: "¿Cuándo el rango NO es una buena medida de dispersión?",
    options: [
      "Con distribuciones simétricas",
      "Con presencia de outliers",
      "Con datos continuos",
      "Nunca es buena medida"
    ],
    correct: 1,
    explanation: "El rango solo considera el máximo y mínimo, por lo que un solo outlier puede distorsionarlo completamente."
  },
  {
    id: 8,
    question: "Si CV = 45%, ¿cómo interpretarías la variabilidad?",
    options: [
      "Baja variabilidad (datos homogéneos)",
      "Moderada variabilidad",
      "Alta variabilidad (datos heterogéneos)",
      "No se puede interpretar"
    ],
    correct: 2,
    explanation: "El coeficiente de variación (CV) ≥ 30% indica alta variabilidad relativa respecto a la media."
  }
];

const PALETTES = {
  modern: {
    name: "Moderno",
    colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']
  },
  ocean: {
    name: "Océano",
    colors: ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc']
  },
  forest: {
    name: "Bosque",
    colors: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b']
  },
  sunset: {
    name: "Atardecer",
    colors: ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5']
  }
};

// ============================================
// FUNCIONES ESTADÍSTICAS
// ============================================

const calculateMean = (data) => {
  if (!data || data.length === 0) return null;
  return data.reduce((a, b) => a + b, 0) / data.length;
};

const calculateMedian = (data) => {
  if (!data || data.length === 0) return null;
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

const calculateMode = (data) => {
  if (!data || data.length === 0) return null;

  const frequency = {};

  // 🔹 Redondeamos a 2 decimales para evitar errores de precisión
  data.forEach(val => {
    const rounded = Number(parseFloat(val).toFixed(2));
    frequency[rounded] = (frequency[rounded] || 0) + 1;
  });

  const maxFreq = Math.max(...Object.values(frequency));

  // Si todos aparecen una sola vez → no hay moda
  if (maxFreq === 1) return null;

  const modes = Object.keys(frequency)
    .filter(k => frequency[k] === maxFreq)
    .map(Number);

  // 🔹 Para visualización SOLO mostramos una
  return modes.length > 0 ? modes[0] : null;
};

const calculateRange = (data) => {
  if (!data || data.length === 0) return null;
  return Math.max(...data) - Math.min(...data);
};

const calculateVariance = (data) => {
  if (!data || data.length < 2) return null;
  const mean = calculateMean(data);
  return data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (data.length - 1);
};

const calculateStdDev = (data) => {
  const v = calculateVariance(data);
  return v !== null ? Math.sqrt(v) : null;
};

const quantile = (sorted, q) => {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] !== undefined
    ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
    : sorted[base];
};

const calculateQuartiles = (data) => {
  if (!data || data.length === 0)
    return { q1: null, q2: null, q3: null, iqr: null };

  const sorted = [...data].sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25);
  const q2 = quantile(sorted, 0.50);
  const q3 = quantile(sorted, 0.75);

  return { q1, q2, q3, iqr: q3 - q1 };
};

const calculateCV = (data) => {
  const mean = calculateMean(data);
  const std = calculateStdDev(data);

  if (mean == null || std == null || mean === 0) return null;

  return (std / Math.abs(mean)) * 100;
};

const detectOutliers = (data) => {
  const { q1, q3, iqr } = calculateQuartiles(data);
  if (q1 === null || iqr === null)
    return { outliers: [], count: 0, lowerBound: null, upperBound: null };

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  const outliers = data.filter(x => x < lowerBound || x > upperBound);

  return { outliers, count: outliers.length, lowerBound, upperBound };
};

const interpretDispersion = (stdDev, cv, iqr, range, data) => {
  let text = "";

  if (stdDev !== null) {
    if (stdDev < 2) {
      text += "📊 Baja dispersión: los datos están muy concentrados cerca de la media. ";
    } else if (stdDev < 5) {
      text += "📊 Dispersión moderada: existe cierta variabilidad en los datos. ";
    } else {
      text += "📊 Alta dispersión: los datos están muy dispersos respecto a la media. ";
    }
  }

  if (cv !== null) {
    if (cv < 15) {
      text += "✅ CV bajo (<15%): variabilidad relativa baja, datos homogéneos. ";
    } else if (cv < 30) {
      text += "⚠️ CV moderado (15-30%): variabilidad relativa moderada. ";
    } else {
      text += "⚠️ CV alto (≥30%): variabilidad relativa alta, datos heterogéneos. ";
    }
  }

  const outlierInfo = detectOutliers(data);
  if (outlierInfo.count > 0) {
    text += `🔴 Se detectaron ${outlierInfo.count} outlier(s) que afectan las medidas de dispersión. `;
  }

  if (iqr !== null && range !== null) {
    const iqrRatio = (iqr / range) * 100;
    if (iqrRatio > 70) {
      text += "📈 El IQR representa >70% del rango total: distribución concentrada. ";
    } else if (iqrRatio < 30) {
      text += "📉 El IQR representa <30% del rango total: colas largas o outliers. ";
    }
  }

  return text;
};

const round2 = (x) => (x == null ? null : Number(x.toFixed(2)));

const withinTol = (a, b, tol = 0.1) =>
  a != null && b != null && Math.abs(a - b) <= tol;

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const Lab3_2 = ({ goHome, setView }) => {
  const [activeTab, setActiveTab] = useState('intro');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [activeData, setActiveData] = useState([]);
  const [uploadedColumns, setUploadedColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [datasetLabel, setDatasetLabel] = useState('');
  const [dataUnit, setDataUnit] = useState('');

  const [chartTitle, setChartTitle] = useState("Distribución de Datos");
  const [xLabel, setXLabel] = useState("Valores");
  const [yLabel, setYLabel] = useState("Frecuencia");

  const [mean, setMean] = useState(null);
  const [median, setMedian] = useState(null);
  const [mode, setMode] = useState(null);
  const [range, setRange] = useState(null);
  const [variance, setVariance] = useState(null);
  const [stdDev, setStdDev] = useState(null);
  const [quartiles, setQuartiles] = useState({ q1: null, q2: null, q3: null, iqr: null });
  const [cv, setCV] = useState(null);
  const [outlierInfo, setOutlierInfo] = useState({ outliers: [], count: 0 });
  const [interpretation, setInterpretation] = useState('');
  const [dataQuality, setDataQuality] = useState(null);

  const [showMean, setShowMean] = useState(true);
  const [showStdDev, setShowStdDev] = useState(true);
  const [showQuartiles, setShowQuartiles] = useState(false);
  const [showOutlierBounds, setShowOutlierBounds] = useState(false);
  const [show68Rule, setShow68Rule] = useState(false);
  const [show95Rule, setShow95Rule] = useState(false);
  const [yAxisType, setYAxisType] = useState('count');
  const [binMethod, setBinMethod] = useState('sturges');
  const [colorPalette, setColorPalette] = useState('modern');
  const [chartKey, setChartKey] = useState(0);
  const [numIntervals, setNumIntervals] = useState(10);
  const [chartBgColor, setChartBgColor] = useState('transparent');

  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [practiceResults, setPracticeResults] = useState({});
  const [practiceScore, setPracticeScore] = useState(0);

  const [practiceMode, setPracticeMode] = useState('applied');
  const [appliedConcept, setAppliedConcept] = useState({
    variability: null,
    cvLevel: null,
    bestMeasure: null,
    outlierEffect: null
  });
  const [appliedFeedback, setAppliedFeedback] = useState(null);

  // 🔹 NUEVO: Estados para la calculadora manual
  const [manualData, setManualData] = useState(["", "", "", "", ""]);

  const chartRef = useRef(null);

  useEffect(() => {
    if (activeData.length > 0) {
      const m = calculateMean(activeData);
      const med = calculateMedian(activeData);
      const mod = calculateMode(activeData);
      const r = calculateRange(activeData);
      const v = calculateVariance(activeData);
      const sd = calculateStdDev(activeData);
      const q = calculateQuartiles(activeData);
      const cvVal = calculateCV(activeData);
      const outInfo = detectOutliers(activeData);

      setMean(m);
      setMedian(med);
      setMode(mod);
      setRange(r);
      setVariance(v);
      setStdDev(sd);
      setQuartiles(q);
      setCV(cvVal);
      setOutlierInfo(outInfo);
      setInterpretation(interpretDispersion(sd, cvVal, q.iqr, r, activeData));
    }
  }, [activeData]);

  // ============================================
  // HANDLERS Y FUNCIONES AUXILIARES
  // ============================================

  const handleDatasetSelect = (key) => {
    setSelectedDataset(key);
    setActiveData(PRESET_DATASETS[key].data);
    setDatasetLabel(PRESET_DATASETS[key].label);
    setDataUnit(PRESET_DATASETS[key].unit || '');
    setUploadedFile(null);
    setUploadedColumns([]);
    setSelectedColumn('');
    setDataQuality(null);
    setChartKey(prev => prev + 1);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => processUploadedData(results.data, file.name)
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        processUploadedData(jsonData, file.name);
      };
      reader.readAsArrayBuffer(file);
    }
    e.target.value = '';
  };

  const processUploadedData = (data, filename) => {
    if (!data || data.length === 0) return;
    const keys = Object.keys(data[0]);
    const numericCols = [];

    keys.forEach(key => {
      const allValues = data.map(row => row[key]);
      const nonNull = allValues.filter(v => v != null && v !== '');
      const numericValues = nonNull.filter(v => !isNaN(parseFloat(v))).map(v => parseFloat(v));

      const quality = {
        total: allValues.length,
        valid: numericValues.length,
        empty: allValues.length - nonNull.length,
        nonNumeric: nonNull.length - numericValues.length,
        validPercent: (numericValues.length / allValues.length * 100).toFixed(1)
      };

      if (numericValues.length / allValues.length >= 0.5) {
        numericCols.push({ key, label: key, values: numericValues, quality });
      }
    });

    setUploadedColumns(numericCols);
    setSelectedDataset('');
    setDatasetLabel(filename.replace(/\.(csv|xlsx|xls)$/i, ''));

    if (numericCols.length > 0) {
      setSelectedColumn(numericCols[0].key);
      setActiveData(numericCols[0].values);
      setDataQuality(numericCols[0].quality);
      setChartKey(prev => prev + 1);
    }
  };

  const handleColumnChange = (colKey) => {
    setSelectedColumn(colKey);
    const col = uploadedColumns.find(c => c.key === colKey);
    if (col) {
      setActiveData(col.values);
      setDataQuality(col.quality);
      setChartKey(prev => prev + 1);
    }
  };

  const handlePracticeAnswer = (qId, optIdx) => {
    setPracticeAnswers({ ...practiceAnswers, [qId]: optIdx });
  };

  const checkPracticeAnswers = () => {
    const results = {};
    let correct = 0;
    PRACTICE_QUESTIONS.forEach(q => {
      const userAns = practiceAnswers[q.id];
      const isCorrect = userAns === q.correct;
      results[q.id] = { correct: isCorrect, userAnswer: userAns };
      if (isCorrect) correct++;
    });
    setPracticeResults(results);
    setPracticeScore(correct);
  };

  const checkApplied = () => {
    if (activeData.length === 0) {
      setAppliedFeedback({
        ok: false,
        msg: "Primero selecciona un dataset en 'Datasets'."
      });
      return;
    }

    const outCount = outlierInfo?.count || 0;

    let cvCategory = null;
    if (cv == null) cvCategory = 'no_interpretable';
    else if (cv < 15) cvCategory = 'baja';
    else if (cv < 30) cvCategory = 'moderada';
    else cvCategory = 'alta';

    const cvOk = appliedConcept.cvLevel === cvCategory;

    let variabilityReal;
    if (stdDev < 2) variabilityReal = 'baja';
    else if (stdDev < 5) variabilityReal = 'moderada';
    else variabilityReal = 'alta';

    const variabilityOk = appliedConcept.variability === variabilityReal;

    let bestMeasureReal;
    if (outlierInfo.count > 0) {
      bestMeasureReal = 'iqr';
    } else {
      bestMeasureReal = 'stddev';
    }

    const bestMeasureOk = appliedConcept.bestMeasure === bestMeasureReal;

    let outlierEffectReal;
    if (outlierInfo.count === 0) {
      outlierEffectReal = 'ninguno';
    } else {
      outlierEffectReal = 'stddev';
    }

    const outlierEffectOk = appliedConcept.outlierEffect === outlierEffectReal;

    const score = [
      cvOk,
      variabilityOk,
      bestMeasureOk,
      outlierEffectOk
    ].filter(Boolean).length;

    setAppliedFeedback({
      ok: score >= 3,
      score,
      totalQuestions: 4,
      details: {
        cvOk,
        variabilityOk,
        bestMeasureOk,
        outlierEffectOk
      },
      real: {
        range: round2(range),
        variance: round2(variance),
        stdDev: round2(stdDev),
        iqr: round2(quartiles.iqr),
        cvCategory,
        variabilityReal,
        bestMeasureReal,
        outlierEffectReal,
        outCount: outlierInfo.count
      }
    });
  };

  const addOutlierShock = () => {
    if (activeData.length === 0) return;
    const max = Math.max(...activeData);
    const shock = max * 1.5;
    setActiveData(prev => [...prev, shock]);
    setChartKey(p => p + 1);
  };

  const exportChart = () => {
    if (!chartRef.current) return;
    const svg = chartRef.current.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = `medidas_dispersion_${datasetLabel.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const getTextColor = (bgColor) => {
    if (bgColor === '#ffffff' || bgColor === '#f5f5f5' || bgColor === '#e5e5e5') {
      return '#000000';
    }
    return '#ffffff';
  };

  const prepareHistogramData = () => {
    if (activeData.length === 0) return { bins: [] };

    const min = Math.min(...activeData);
    const max = Math.max(...activeData);
    const rangeVal = max - min;

    if (rangeVal === 0) {
      return {
        bins: [{
          start: min,
          end: min,
          center: min,
          count: activeData.length,
          relFreq: 100,
          hasOutliers: false
        }]
      };
    }

    const numBins = numIntervals;
    const binWidth = rangeVal / numBins;

    const bins = Array.from({ length: numBins }, (_, i) => ({
      start: min + i * binWidth,
      end: min + (i + 1) * binWidth,
      center: min + i * binWidth + binWidth / 2,
      count: 0,
      relFreq: 0,
      hasOutliers: false
    }));

    activeData.forEach(val => {
      const idx = Math.min(numBins - 1, Math.floor((val - min) / binWidth));
      bins[idx].count++;
    });

    bins.forEach(b => {
      b.relFreq = Number(((b.count / activeData.length) * 100).toFixed(2));
    });

    if (outlierInfo.outliers.length > 0) {
      outlierInfo.outliers.forEach(outlier => {
        const idx = Math.min(numBins - 1, Math.floor((outlier - min) / binWidth));
        bins[idx].hasOutliers = true;
      });
    }

    return { bins };
  };

  // ============================================
  // RENDER: INTRODUCCIÓN
  // ============================================

  const renderIntroTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            title: "Rango",
            symbol: "R",
            desc: "Diferencia entre máximo y mínimo",
            formula: "R = max - min",
            gradient: "from-blue-500 to-cyan-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            icon: "bg-blue-500",
            note: "Simple pero sensible a outliers",
            noteIcon: "text-yellow-400"
          },
          {
            title: "Varianza",
            symbol: "s²",
            desc: "Promedio de desviaciones al cuadrado",
            formula: "s² = Σ(x-x̄)² / (n-1)",
            gradient: "from-purple-500 to-pink-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
            icon: "bg-purple-500",
            note: "Unidades al cuadrado",
            noteIcon: "text-orange-400"
          },
          {
            title: "Desviación Estándar",
            symbol: "s",
            desc: "Raíz cuadrada de la varianza",
            formula: "s = √s²",
            gradient: "from-pink-500 to-rose-400",
            bg: "bg-pink-500/10",
            border: "border-pink-500/20",
            icon: "bg-pink-500",
            note: "Mismas unidades que los datos",
            noteIcon: "text-green-400"
          },
          {
            title: "Rango Intercuartílico",
            symbol: "IQR",
            desc: "Dispersión del 50% central",
            formula: "IQR = Q3 - Q1",
            gradient: "from-orange-500 to-amber-400",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20",
            icon: "bg-orange-500",
            note: "Robusto ante outliers",
            noteIcon: "text-green-400"
          }
        ].map((item, idx) => (
          <div key={idx} className={`${item.bg} border-2 ${item.border} rounded-3xl p-8 transition-all hover:scale-[1.02] hover:shadow-2xl`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 ${item.icon} rounded-2xl flex items-center justify-center shadow-xl`}>
                <span className="text-white font-black text-xl">{item.symbol}</span>
              </div>
              <h3 className="text-2xl font-black text-white">{item.title}</h3>
            </div>

            <p className="text-slate-300 mb-4 leading-relaxed">{item.desc}</p>

            <div className="bg-slate-900/40 backdrop-blur-sm p-4 rounded-xl mb-4">
              <code className={`text-sm font-mono bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent font-bold`}>
                {item.formula}
              </code>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-white/5">
              <AlertCircle className={`w-4 h-4 ${item.noteIcon}`} />
              <p className="text-xs text-slate-400 font-medium">{item.note}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white mb-2">Demo: Comparación de Dispersión</h3>
            <p className="text-slate-400">Dos datasets con la misma media (8) pero diferente dispersión</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
            <h4 className="text-sm font-bold text-slate-400 mb-3">Dataset A: [6, 7, 8, 9, 10]</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Media (μ):</span>
                <span className="text-2xl font-black text-cyan-400">8.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Desv. Estándar (s):</span>
                <span className="text-2xl font-black text-pink-400">1.58</span>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg mt-4">
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-bold">Baja dispersión - datos concentrados</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
            <h4 className="text-sm font-bold text-slate-400 mb-3">Dataset B: [1, 5, 8, 11, 15]</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Media (μ):</span>
                <span className="text-2xl font-black text-cyan-400">8.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Desv. Estándar (s):</span>
                <span className="text-2xl font-black text-pink-400">5.38</span>
              </div>
              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg mt-4">
                <div className="flex items-center gap-2 text-xs text-orange-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-bold">Alta dispersión - datos dispersos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-indigo-500/20 rounded-xl">
            <Activity className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white mb-2">Regla Empírica (68-95-99.7)</h3>
            <p className="text-slate-400">Para distribuciones normales</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { range: "μ ± 1σ", percent: "68%", color: "bg-blue-500" },
            { range: "μ ± 2σ", percent: "95%", color: "bg-purple-500" },
            { range: "μ ± 3σ", percent: "99.7%", color: "bg-pink-500" }
          ].map((item, idx) => (
            <div key={idx} className="p-6 bg-slate-900/50 rounded-xl border border-slate-700">
              <div className={`w-full h-2 ${item.color} rounded-full mb-4`} />
              <div className="text-center">
                <div className="text-3xl font-black text-white mb-2">{item.percent}</div>
                <div className="text-sm text-slate-400">de los datos en</div>
                <div className="text-sm font-bold text-slate-200 mt-1">{item.range}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-yellow-400 shrink-0 mt-1" />
          <div>
            <h4 className="font-black text-white mb-3">💡 ¿Cuándo usar cada medida?</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span><strong className="text-white">Rango:</strong> Vista rápida de la amplitud total, pero muy sensible a outliers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span><strong className="text-white">Desviación Estándar:</strong> Cuando los datos son aproximadamente normales y sin outliers extremos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 font-bold">•</span>
                <span><strong className="text-white">IQR:</strong> Cuando hay outliers o distribuciones asimétricas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 font-bold">•</span>
                <span><strong className="text-white">Coeficiente de Variación (CV):</strong> Para comparar dispersión entre datasets con diferentes unidades o escalas</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
  // ============================================
  // RENDER: PESTAÑA DATASETS (antes "Calculadora")
  // ============================================

  const renderDatasetsTab = () => {
    const { bins } = prepareHistogramData();
    const currentColors = PALETTES[colorPalette].colors;
    const displayValue = yAxisType === 'percent' ? 'relFreq' : 'count';

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              Datasets Clásicos
            </h3>
            <div className="space-y-3 mb-4">
              {Object.entries(PRESET_DATASETS).map(([key, ds]) => {
                const Icon = ds.icon;
                return (
                  <button
                    key={key}
                    onClick={() => handleDatasetSelect(key)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedDataset === key
                      ? 'bg-indigo-500/20 border-indigo-400 shadow-lg'
                      : 'bg-slate-800/50 border-slate-700 hover:border-indigo-500/50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${selectedDataset === key ? 'text-indigo-300' : 'text-slate-400'}`} />
                      <div className="flex-1">
                        <div className="font-bold text-white text-sm">{ds.label}</div>
                        <div className="text-xs text-slate-400 mt-1">{ds.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-white/10 pt-4">
              <label className="block mb-2 text-sm font-bold text-slate-400">O sube tu archivo</label>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-xl cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-indigo-300">{uploadedFile ? uploadedFile.name : 'Seleccionar archivo'}</span>
              </label>

              {uploadedColumns.length > 0 && (
                <div className="mt-3">
                  <label className="block mb-2 text-xs font-bold text-slate-400 uppercase">Variable a analizar</label>
                  <select value={selectedColumn} onChange={(e) => handleColumnChange(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white">
                    {uploadedColumns.map(col => (
                      <option key={col.key} value={col.key}>{col.label} ({col.values.length} valores)</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {dataQuality && (
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-3xl p-6">
              <h3 className="text-sm font-black text-blue-400 mb-4 uppercase flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Calidad de Datos
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-xs text-slate-400">Total filas:</span><span className="text-sm font-bold text-white">{dataQuality.total}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400">Valores numéricos:</span><span className="text-sm font-bold text-green-400">{dataQuality.valid}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400">Vacíos:</span><span className="text-sm font-bold text-yellow-400">{dataQuality.empty}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400">No numéricos:</span><span className="text-sm font-bold text-orange-400">{dataQuality.nonNumeric}</span></div>
                <div className="pt-3 border-t border-blue-500/20">
                  <div className="flex justify-between mb-2"><span className="text-xs text-slate-400 font-bold">% Válidos:</span><span className="text-lg font-black text-cyan-400">{dataQuality.validPercent}%</span></div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${dataQuality.validPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeData.length > 0 && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Personalización de Texto
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Título del Gráfico</label>
                  <input
                    type="text"
                    value={chartTitle}
                    onChange={(e) => setChartTitle(e.target.value)}
                    placeholder="Título del gráfico"
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Etiqueta Eje X</label>
                  <input
                    type="text"
                    value={xLabel}
                    onChange={(e) => setXLabel(e.target.value)}
                    placeholder="Nombre eje X"
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Etiqueta Eje Y</label>
                  <input
                    type="text"
                    value={yLabel}
                    onChange={(e) => setYLabel(e.target.value)}
                    placeholder="Nombre eje Y"
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm font-bold text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {activeData.length > 0 && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                Configuración
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Mostrar</label>
                  <div className="space-y-2">
                    {[
                      { key: 'showMean', label: 'Media (μ)', checked: showMean, setter: setShowMean },
                      { key: 'showStdDev', label: 'Desviación Estándar (±σ)', checked: showStdDev, setter: (v) => { setShowStdDev(v); setChartKey(p => p + 1); } },
                      { key: 'show68Rule', label: 'Regla 68% (μ ± σ)', checked: show68Rule, setter: (v) => { setShow68Rule(v); setChartKey(p => p + 1); } },
                      { key: 'show95Rule', label: 'Regla 95% (μ ± 2σ)', checked: show95Rule, setter: (v) => { setShow95Rule(v); setChartKey(p => p + 1); } },
                      { key: 'showQuartiles', label: 'Cuartiles (Q1, Q2, Q3)', checked: showQuartiles, setter: setShowQuartiles },
                      { key: 'showOutlierBounds', label: 'Límites de Outliers', checked: showOutlierBounds, setter: setShowOutlierBounds }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-all">
                        <input type="checkbox" checked={item.checked} onChange={(e) => item.setter(e.target.checked)} className="w-4 h-4 rounded" />
                        <span className="text-sm font-bold text-white">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Eje Y</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { setYAxisType('count'); setChartKey(p => p + 1); }} className={`p-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 ${yAxisType === 'count' ? 'bg-indigo-500 text-white' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'}`}>
                      <Hash className="w-4 h-4" />Frecuencia
                    </button>
                    <button onClick={() => { setYAxisType('percent'); setChartKey(p => p + 1); }} className={`p-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 ${yAxisType === 'percent' ? 'bg-indigo-500 text-white' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'}`}>
                      <Percent className="w-4 h-4" />Porcentaje
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Colores</label>
                  <select value={colorPalette} onChange={(e) => setColorPalette(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white">
                    {Object.entries(PALETTES).map(([k, p]) => <option key={k} value={k}>{p.name}</option>)}
                  </select>
                  <div className="flex gap-1 mt-2">{PALETTES[colorPalette].colors.map((c, i) => <div key={i} className="h-6 flex-1 rounded" style={{ backgroundColor: c }} />)}</div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
                    Fondo del gráfico
                  </label>
                  <select
                    value={chartBgColor}
                    onChange={(e) => {
                      setChartBgColor(e.target.value);
                      setChartKey(p => p + 1);
                    }}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white"
                  >
                    <option value="transparent">Transparente</option>
                    <option value="#ffffff">Blanco</option>
                    <option value="#f5f5f5">Gris Claro</option>
                    <option value="#e5e5e5">Crema</option>
                    <option value="#1e293b">Pizarra</option>
                    <option value="#000000">Negro</option>
                  </select>

                  <div className="mt-3 p-4 rounded-lg border border-slate-700" style={{ backgroundColor: chartBgColor }}>
                    <p className="text-xs text-center font-bold" style={{ color: getTextColor(chartBgColor) }}>
                      Vista previa del fondo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Eye className="w-6 h-6 text-indigo-400" />Histograma con Medidas de Dispersión
              </h3>
              {activeData.length > 0 && (
                <button onClick={exportChart} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20">
                  <Download className="w-4 h-4" />Exportar
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
              <div
                ref={chartRef}
                key={chartKey}
                style={{ backgroundColor: chartBgColor }}
                className="rounded-xl p-4"
              >
                <div className="mb-4 text-center">
                  <h4 className="text-lg font-bold" style={{ color: getTextColor(chartBgColor) }}>
                    {chartTitle}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    n = {activeData.length} | Rango: {Math.min(...activeData).toFixed(1)} - {Math.max(...activeData).toFixed(1)} {dataUnit}
                  </p>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <label className="text-sm text-slate-300 font-bold">
                    Intervalos:
                  </label>
                  <select
                    value={numIntervals}
                    onChange={(e) => {
                      setNumIntervals(Number(e.target.value));
                      setChartKey(prev => prev + 1);
                    }}
                    className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                  >
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                    <option value={7}>7</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                  </select>
                </div>

                <ResponsiveContainer width="100%" height={500}>
                  <ComposedChart data={bins} margin={{ top: 40, right: 30, left: 60, bottom: 80 }} barCategoryGap="0%" barGap={"0%"}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={currentColors[0]} stopOpacity={0.8} />
                        <stop offset="100%" stopColor={currentColors[0]} stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="center"
                      type="number"
                      domain={[bins.length ? bins[0].start : 0, bins.length ? bins[bins.length - 1].end : 0]}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(val) => val.toFixed(1)}
                      label={{
                        value: xLabel,
                        position: 'insideBottom',
                        offset: -10,
                        style: { fill: '#cbd5e1', fontWeight: 700, fontSize: 12 }
                      }}
                    />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(val) => val.toFixed(1)}
                      label={{
                        value: yAxisType === 'count' ? 'Frecuencia' : 'Porcentaje (%)',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fill: '#cbd5e1', fontWeight: 700, fontSize: 12 }
                      }}
                    />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload?.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900/95 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
                            <p className="text-white font-bold text-xs mb-1">{d.start.toFixed(1)} - {d.end.toFixed(1)} {dataUnit}</p>
                            <p className="text-indigo-400 text-sm">Frecuencia: {d.count}</p>
                            <p className="text-purple-400 text-xs">{d.relFreq}% del total</p>
                            {d.hasOutliers && <p className="text-orange-400 text-xs font-bold mt-1">⚠️ Contiene outliers</p>}
                          </div>
                        );
                      }
                      return null;
                    }} />

                    <Bar dataKey={displayValue} fill="url(#barGrad)" barSize={undefined}>
                      {bins.map((entry, idx) => (
                        <Cell key={idx} fill={entry.hasOutliers ? '#f59e0b' : currentColors[idx % currentColors.length]} opacity={entry.hasOutliers ? 1 : 0.8} />
                      ))}
                    </Bar>

                    {showMean && mean && (
                      <ReferenceLine
                        x={mean}
                        stroke="#22d3ee"
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        label={{ value: `μ=${mean.toFixed(2)}`, position: 'top', fill: '#22d3ee', fontWeight: 700, fontSize: 11 }}
                      />
                    )}

                    {showStdDev && mean && stdDev && (
                      <>
                        <ReferenceLine
                          x={mean - stdDev}
                          stroke="#f472b6"
                          strokeWidth={2}
                          strokeDasharray="3 3"
                          label={{ value: `-σ`, position: 'top', fill: '#f472b6', fontWeight: 700, fontSize: 10 }}
                        />
                        <ReferenceLine
                          x={mean + stdDev}
                          stroke="#f472b6"
                          strokeWidth={2}
                          strokeDasharray="3 3"
                          label={{ value: `+σ`, position: 'top', fill: '#f472b6', fontWeight: 700, fontSize: 10 }}
                        />
                      </>
                    )}

                    {show68Rule && mean && stdDev && (
                      <ReferenceLine
                        x={mean}
                        stroke="none"
                        label={{
                          value: `68% en μ±σ [${(mean - stdDev).toFixed(1)}, ${(mean + stdDev).toFixed(1)}]`,
                          position: 'insideTopRight',
                          fill: '#3b82f6',
                          fontWeight: 700,
                          fontSize: 10,
                          offset: 10
                        }}
                      />
                    )}

                    {show95Rule && mean && stdDev && (
                      <>
                        <ReferenceLine
                          x={mean - 2 * stdDev}
                          stroke="#a855f7"
                          strokeWidth={2}
                          strokeDasharray="8 4"
                          label={{ value: `-2σ`, position: 'top', fill: '#a855f7', fontWeight: 700, fontSize: 10 }}
                        />
                        <ReferenceLine
                          x={mean + 2 * stdDev}
                          stroke="#a855f7"
                          strokeWidth={2}
                          strokeDasharray="8 4"
                          label={{ value: `+2σ`, position: 'top', fill: '#a855f7', fontWeight: 700, fontSize: 10 }}
                        />
                      </>
                    )}

                    {showQuartiles && (
                      <>
                        {quartiles.q1 && (
                          <ReferenceLine
                            x={quartiles.q1}
                            stroke="#10b981"
                            strokeWidth={2}
                            label={{
                              value: `Q1=${quartiles.q1.toFixed(1)}`,
                              position: 'top',
                              fill: '#10b981',
                              fontSize: 10,
                              fontWeight: 700
                            }}
                          />
                        )}
                        {quartiles.q2 && (
                          <ReferenceLine
                            x={quartiles.q2}
                            stroke="#10b981"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            label={{
                              value: `Q2=${quartiles.q2.toFixed(1)}`,
                              position: 'top',
                              fill: '#10b981',
                              fontSize: 10,
                              fontWeight: 700,
                              offset: 15
                            }}
                          />
                        )}
                        {quartiles.q3 && (
                          <ReferenceLine
                            x={quartiles.q3}
                            stroke="#10b981"
                            strokeWidth={2}
                            label={{
                              value: `Q3=${quartiles.q3.toFixed(1)}`,
                              position: 'top',
                              fill: '#10b981',
                              fontSize: 10,
                              fontWeight: 700,
                              offset: 30
                            }}
                          />
                        )}
                      </>
                    )}

                    {showOutlierBounds && outlierInfo.lowerBound !== null && (
                      <ReferenceLine
                        x={outlierInfo.lowerBound}
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="8 4"
                        label={{ value: `Límite inferior`, position: 'top', fill: '#f59e0b', fontSize: 10 }}
                      />
                    )}
                    {showOutlierBounds && outlierInfo.upperBound !== null && (
                      <ReferenceLine
                        x={outlierInfo.upperBound}
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="8 4"
                        label={{ value: `Límite superior`, position: 'top', fill: '#f59e0b', fontSize: 10 }}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>

                <div className="mt-6 p-4 bg-slate-800/30 rounded-xl">
                  <div className="flex items-center justify-center gap-6 flex-wrap">
                    {showMean && mean && <div className="flex items-center gap-2"><div className="w-8 h-1 bg-cyan-400 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #22d3ee 0, #22d3ee 5px, transparent 5px, transparent 10px)' }} /><span className="text-xs font-bold text-cyan-400">Media</span></div>}
                    {showStdDev && stdDev && <div className="flex items-center gap-2"><div className="w-8 h-1 bg-pink-400 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f472b6 0, #f472b6 3px, transparent 3px, transparent 6px)' }} /><span className="text-xs font-bold text-pink-400">±σ</span></div>}
                    {show95Rule && <div className="flex items-center gap-2"><div className="w-8 h-1 bg-purple-400 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #a855f7 0, #a855f7 8px, transparent 8px, transparent 12px)' }} /><span className="text-xs font-bold text-purple-400">±2σ</span></div>}
                    {showQuartiles && <div className="flex items-center gap-2"><div className="w-8 h-1 bg-green-400 rounded" /><span className="text-xs font-bold text-green-400">Cuartiles</span></div>}
                    {showOutlierBounds && outlierInfo.count > 0 && <div className="flex items-center gap-2"><div className="w-8 h-1 bg-orange-400 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 8px, transparent 8px, transparent 12px)' }} /><span className="text-xs font-bold text-orange-400">Límites</span></div>}
                  </div>
                </div>
              </div>
            )}

            {interpretation && (
              <div className="mt-6 p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-2 text-sm flex items-center gap-2">
                      Interpretación de Dispersión
                      {outlierInfo.count > 0 && <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-black rounded-full">{outlierInfo.count} OUTLIER{outlierInfo.count > 1 ? 'S' : ''}</span>}
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{interpretation}</p>
                  </div>
                </div>
              </div>
            )}

            {activeData.length > 0 && (
              <div className="mt-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-6">
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-400" />
                  Resumen de Medidas de Dispersión
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <span className="font-bold text-slate-300">Rango</span>
                    <span className="text-xl font-black text-blue-400">{round2(range)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <span className="font-bold text-slate-300">Varianza (s²)</span>
                    <span className="text-xl font-black text-purple-400">{round2(variance)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <span className="font-bold text-slate-300">Desv. Estándar (s)</span>
                    <span className="text-xl font-black text-pink-400">{round2(stdDev)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <span className="font-bold text-slate-300">IQR</span>
                    <span className="text-xl font-black text-orange-400">{round2(quartiles.iqr)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <span className="font-bold text-slate-300">CV (%)</span>
                    <span className="text-xl font-black text-cyan-400">{cv ? round2(cv) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <span className="font-bold text-slate-300">Outliers</span>
                    <span className="text-xl font-black text-red-400">{outlierInfo.count}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER: PESTAÑA CALCULADORA MANUAL
  // ============================================

  const renderCalculatorManualTab = () => {
    const numericData = manualData
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v));

    const manualMean = numericData.length > 0
      ? numericData.reduce((a, b) => a + b, 0) / numericData.length
      : null;

    const manualMedian = (() => {
      if (numericData.length === 0) return null;
      const sorted = [...numericData].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
    })();

    const manualMode = (() => {
      if (numericData.length === 0) return "-";
      const freq = {};
      numericData.forEach(n => {
        const rounded = Number(parseFloat(n).toFixed(2));
        freq[rounded] = (freq[rounded] || 0) + 1;
      });
      const maxFreq = Math.max(...Object.values(freq));
      if (maxFreq === 1) return "No hay moda";
      return Object.keys(freq)
        .filter(k => freq[k] === maxFreq)
        .join(", ");
    })();

    const manualRange = numericData.length > 0
      ? Math.max(...numericData) - Math.min(...numericData)
      : null;

    const manualVariance = numericData.length >= 2
      ? numericData.reduce((sum, x) => sum + Math.pow(x - manualMean, 2), 0) / (numericData.length - 1)
      : null;

    const manualStdDev = manualVariance !== null
      ? Math.sqrt(manualVariance)
      : null;

    return (
      <div className="space-y-8">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <h3 className="text-2xl font-black text-white mb-2">
            Calculadora de Medidas
          </h3>
          <p className="text-slate-400 mb-6">
            Ingresa entre 5 y 8 valores numéricos y observa cómo cambian las medidas en tiempo real.
          </p>

          <div className="grid grid-cols-5 gap-4 mb-6">
            {manualData.map((value, index) => (
              <input
                key={index}
                type="number"
                value={value}
                onChange={(e) => {
                  const newData = [...manualData];
                  newData[index] = e.target.value;
                  setManualData(newData);
                }}
                placeholder={`Valor ${index + 1}`}
                className="bg-slate-800 border border-slate-600 rounded-xl p-3 text-white text-center font-bold focus:border-indigo-500 focus:outline-none transition-all"
              />
            ))}
          </div>

          <div className="flex gap-3 mb-8 flex-wrap">
            {manualData.length < 8 && (
              <button
                onClick={() => setManualData([...manualData, ""])}
                className="px-5 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-black text-white text-sm transition-all"
              >
                + Agregar valor
              </button>
            )}
            <button
              onClick={() => setManualData(["", "", "", "", ""])}
              className="px-5 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-black text-slate-200 text-sm transition-all"
            >
              Reiniciar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-2xl p-6 text-center">
              <p className="text-sm text-slate-300 mb-1">Media (μ)</p>
              <p className="text-3xl font-black text-white">
                {manualMean !== null ? manualMean.toFixed(2) : "-"}
              </p>
            </div>
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-2xl p-6 text-center">
              <p className="text-sm text-slate-300 mb-1">Mediana (Me)</p>
              <p className="text-3xl font-black text-white">
                {manualMedian !== null ? manualMedian.toFixed(2) : "-"}
              </p>
            </div>
            <div className="bg-pink-500/20 border border-pink-500/30 rounded-2xl p-6 text-center">
              <p className="text-sm text-slate-300 mb-1">Moda (Mo)</p>
              <p className="text-3xl font-black text-white">
                {manualMode}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-6 text-center">
              <p className="text-sm text-slate-300 mb-1">Rango (R)</p>
              <p className="text-3xl font-black text-white">
                {manualRange !== null ? manualRange.toFixed(2) : "-"}
              </p>
            </div>
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-2xl p-6 text-center">
              <p className="text-sm text-slate-300 mb-1">Varianza (s²)</p>
              <p className="text-3xl font-black text-white">
                {manualVariance !== null ? manualVariance.toFixed(2) : "-"}
              </p>
            </div>
            <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-2xl p-6 text-center">
              <p className="text-sm text-slate-300 mb-1">Desv. Std (s)</p>
              <p className="text-3xl font-black text-white">
                {manualStdDev !== null ? manualStdDev.toFixed(2) : "-"}
              </p>
            </div>
          </div>

          {numericData.length > 0 && (
            <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700">
              <p className="text-sm text-slate-400">
                <strong className="text-white">Valores ingresados:</strong> {numericData.length} de {manualData.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Dataset: [{numericData.join(", ")}]
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };
  // ============================================
  // RENDER: PESTAÑA PRÁCTICA (simplificada - solo conceptual)
  // ============================================

  const renderPracticeTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-3xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-green-500/20 rounded-xl"><Brain className="w-8 h-8 text-green-400" /></div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2">Modo Práctica</h2>
            <p className="text-slate-400">Pon a prueba tus conocimientos sobre medidas de dispersión</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setPracticeMode('applied')} className={`px-5 py-3 rounded-xl font-black text-sm transition-all ${practiceMode === 'applied' ? 'bg-green-500 text-white shadow-lg' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
            Práctica Aplicada
          </button>
          <button onClick={() => setPracticeMode('quiz')} className={`px-5 py-3 rounded-xl font-black text-sm transition-all ${practiceMode === 'quiz' ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
            Quiz
          </button>
        </div>

        {practiceMode === 'applied' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl shrink-0">
                  <Lightbulb className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-3">📋 Instrucciones</h3>
                  <ol className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="font-black text-green-400 mt-0.5">1.</span>
                      <span>Selecciona un dataset aquí mismo o ve a la pestaña <strong className="text-white">Datasets</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-black text-green-400 mt-0.5">2.</span>
                      <span>Analiza la dispersión y responde las preguntas conceptuales basándote en lo que observas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-black text-green-400 mt-0.5">3.</span>
                      <span>Haz clic en <strong className="text-white">"Verificar"</strong> para ver qué tan cerca estuviste</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-black text-orange-400 mt-0.5">💡</span>
                      <span><strong className="text-orange-300">Desafío extra:</strong> Usa el botón "Agregar Outlier" para ver cómo cambian las medidas</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-black text-white">Dataset Activo</h3>
                  <p className="text-sm text-slate-400">
                    {activeData.length > 0 ? (
                      <>
                        <span className="text-indigo-300 font-bold">{datasetLabel}</span>
                        <span className="text-slate-500"> · n={activeData.length} valores</span>
                      </>
                    ) : (
                      <span className="text-orange-400">⚠️ Ningún dataset seleccionado</span>
                    )}
                  </p>
                </div>
                {activeData.length > 0 && (
                  <button onClick={addOutlierShock} className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-xl text-orange-300 font-black text-sm flex items-center gap-2 transition-all">
                    <Zap className="w-4 h-4" />
                    Agregar Outlier (+50%)
                  </button>
                )}
              </div>

              {activeData.length === 0 ? (
                <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/20 rounded-xl text-center">
                  <Database className="w-12 h-12 mx-auto mb-3 text-indigo-400" />
                  <h4 className="font-black text-white mb-2">No hay dataset seleccionado</h4>
                  <p className="text-sm text-slate-400 mb-4">Selecciona un dataset aquí mismo</p>

                  <div className="mt-4 space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Datasets disponibles</label>
                    {Object.entries(PRESET_DATASETS).map(([key, ds]) => {
                      const Icon = ds.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => handleDatasetSelect(key)}
                          className="w-full p-3 rounded-lg border-2 border-slate-700 bg-slate-800/50 hover:border-indigo-500/50 transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-slate-400" />
                            <div className="flex-1">
                              <div className="font-bold text-white text-sm">{ds.label}</div>
                              <div className="text-xs text-slate-400">{ds.description}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-4 mb-4">
                    <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-indigo-400" />
                      Vista rápida de los datos
                    </h4>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                        <p className="text-xs text-slate-400 mb-1">Rango</p>
                        <p className="text-lg font-black text-blue-400">{range?.toFixed(2) || '-'}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                        <p className="text-xs text-slate-400 mb-1">Desv. Std</p>
                        <p className="text-lg font-black text-pink-400">{stdDev?.toFixed(2) || '-'}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                        <p className="text-xs text-slate-400 mb-1">IQR</p>
                        <p className="text-lg font-black text-orange-400">{quartiles.iqr?.toFixed(2) || '-'}</p>
                      </div>
                    </div>

                    {/* 🔹 NUEVO: Mini gráfico */}
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-2">Distribución rápida</p>
                      <div className="flex items-end gap-1 h-20">
                        {(() => {
                          const { bins: quickBins } = prepareHistogramData();
                          const maxCount = Math.max(...quickBins.map(b => b.count));
                          return quickBins.slice(0, 10).map((bin, idx) => (
                            <div
                              key={idx}
                              className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t"
                              style={{
                                height: `${(bin.count / maxCount) * 100}%`,
                                opacity: 0.7
                              }}
                              title={`${bin.count} valores`}
                            />
                          ));
                        })()}
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('datasets')}
                      className="mt-3 w-full px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-lg text-indigo-300 font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <Database className="w-4 h-4" />
                      Cambiar dataset
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h2 className="text-xl font-black text-white mb-4">Práctica Aplicada</h2>

                      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                            <span className="text-indigo-400 font-black">1</span>
                          </div>
                          <h4 className="font-bold text-white">Nivel de variabilidad</h4>
                        </div>
                        <select
                          value={appliedConcept.variability || ""}
                          onChange={(e) => setAppliedConcept({ ...appliedConcept, variability: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-semibold focus:border-indigo-500 focus:outline-none transition-all"
                        >
                          <option value="">Selecciona</option>
                          <option value="baja">Baja (s &lt; 2)</option>
                          <option value="moderada">Moderada (2 ≤ s &lt; 5)</option>
                          <option value="alta">Alta (s ≥ 5)</option>
                        </select>
                      </div>

                      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <span className="text-purple-400 font-black">2</span>
                          </div>
                          <h4 className="font-bold text-white">Coeficiente de Variación (CV)</h4>
                        </div>
                        <select
                          value={appliedConcept.cvLevel || ""}
                          onChange={(e) => setAppliedConcept({ ...appliedConcept, cvLevel: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-semibold focus:border-purple-500 focus:outline-none transition-all"
                        >
                          <option value="">Selecciona</option>
                          <option value="baja">Baja (&lt;15%)</option>
                          <option value="moderada">Moderada (15-30%)</option>
                          <option value="alta">Alta (≥30%)</option>
                          <option value="no_interpretable">No interpretable</option>
                        </select>
                      </div>

                      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                            <span className="text-pink-400 font-black">3</span>
                          </div>
                          <h4 className="font-bold text-white">Mejor medida para reportar dispersión</h4>
                        </div>
                        <select
                          value={appliedConcept.bestMeasure || ""}
                          onChange={(e) => setAppliedConcept({ ...appliedConcept, bestMeasure: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-semibold focus:border-pink-500 focus:outline-none transition-all"
                        >
                          <option value="">Selecciona</option>
                          <option value="range">Rango</option>
                          <option value="stddev">Desviación Estándar</option>
                          <option value="iqr">IQR</option>
                        </select>
                      </div>

                      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <span className="text-orange-400 font-black">4</span>
                          </div>
                          <h4 className="font-bold text-white">¿Qué medida se afecta MÁS por outliers?</h4>
                        </div>
                        <select
                          value={appliedConcept.outlierEffect || ""}
                          onChange={(e) => setAppliedConcept({ ...appliedConcept, outlierEffect: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-semibold focus:border-orange-500 focus:outline-none transition-all"
                        >
                          <option value="">Selecciona</option>
                          <option value="range">Rango</option>
                          <option value="stddev">Desviación Estándar</option>
                          <option value="iqr">IQR</option>
                          <option value="ninguno">Ninguno (sin outliers)</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={checkApplied}
                          className="px-5 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-black text-white text-sm flex items-center gap-2 transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Verificar
                        </button>
                        <button
                          onClick={() => {
                            setAppliedConcept({ variability: null, cvLevel: null, bestMeasure: null, outlierEffect: null });
                            setAppliedFeedback(null);
                          }}
                          className="px-5 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-black text-slate-200 text-sm transition-all"
                        >
                          Reiniciar
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {appliedFeedback && (
                <div className={`mt-6 p-5 rounded-xl border ${appliedFeedback.ok ? 'bg-green-500/10 border-green-500/30' : 'bg-orange-500/10 border-orange-500/30'}`}>
                  <div className="flex items-start gap-3 mb-4">
                    {appliedFeedback.ok ? <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />}
                    <div className="flex-1">
                      <p className="font-black text-white">
                        {appliedFeedback.ok ? '¡Excelente!' : 'Casi — revisa esto:'}
                        <span className="ml-2 text-slate-400 font-bold text-sm">Puntaje: {appliedFeedback.score}/{appliedFeedback.totalQuestions}</span>
                      </p>
                      <p className="text-sm text-slate-300 mt-2">
                        <span className="text-blue-300 font-black">Rango:</span> {appliedFeedback.real.range} ·
                        <span className="text-pink-300 font-black"> s:</span> {appliedFeedback.real.stdDev} ·
                        <span className="text-orange-300 font-black"> IQR:</span> {appliedFeedback.real.iqr}
                      </p>
                      <p className="text-sm text-slate-300 mt-2">
                        <span className="text-indigo-300 font-black">Outliers:</span> {appliedFeedback.real.outCount} ·
                        <span className="text-cyan-300 font-black"> CV:</span> {appliedFeedback.real.cvCategory}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
                    <h4 className="text-xs font-black text-slate-400 uppercase mb-3">Desglose de respuestas</h4>

                    <div className={`flex items-center justify-between p-3 rounded-lg ${appliedFeedback.details.variabilityOk ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                      <div className="flex items-center gap-2">
                        {appliedFeedback.details.variabilityOk ?
                          <CheckCircle className="w-4 h-4 text-green-400" /> :
                          <XCircle className="w-4 h-4 text-red-400" />
                        }
                        <span className="text-sm font-bold text-white">Nivel de variabilidad</span>
                      </div>
                      <span className={`text-xs font-bold ${appliedFeedback.details.variabilityOk ? 'text-green-400' : 'text-red-400'}`}>
                        {appliedFeedback.details.variabilityOk ? '✓' : `✗ (Real: ${appliedFeedback.real.variabilityReal})`}
                      </span>
                    </div>

                    <div className={`flex items-center justify-between p-3 rounded-lg ${appliedFeedback.details.cvOk ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                      <div className="flex items-center gap-2">
                        {appliedFeedback.details.cvOk ?
                          <CheckCircle className="w-4 h-4 text-green-400" /> :
                          <XCircle className="w-4 h-4 text-red-400" />
                        }
                        <span className="text-sm font-bold text-white">Coeficiente de Variación (CV)</span>
                      </div>
                      <span className={`text-xs font-bold ${appliedFeedback.details.cvOk ? 'text-green-400' : 'text-red-400'}`}>
                        {appliedFeedback.details.cvOk ? '✓' : `✗ (Real: ${appliedFeedback.real.cvCategory})`}
                      </span>
                    </div>

                    <div className={`flex items-center justify-between p-3 rounded-lg ${appliedFeedback.details.bestMeasureOk ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                      <div className="flex items-center gap-2">
                        {appliedFeedback.details.bestMeasureOk ?
                          <CheckCircle className="w-4 h-4 text-green-400" /> :
                          <XCircle className="w-4 h-4 text-red-400" />
                        }
                        <span className="text-sm font-bold text-white">Mejor medida para dispersión</span>
                      </div>
                      <span className={`text-xs font-bold ${appliedFeedback.details.bestMeasureOk ? 'text-green-400' : 'text-red-400'}`}>
                        {appliedFeedback.details.bestMeasureOk ? '✓' : `✗ (Real: ${appliedFeedback.real.bestMeasureReal === 'stddev' ? 'Desv. Std' : 'IQR'})`}
                      </span>
                    </div>

                    <div className={`flex items-center justify-between p-3 rounded-lg ${appliedFeedback.details.outlierEffectOk ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                      <div className="flex items-center gap-2">
                        {appliedFeedback.details.outlierEffectOk ?
                          <CheckCircle className="w-4 h-4 text-green-400" /> :
                          <XCircle className="w-4 h-4 text-red-400" />
                        }
                        <span className="text-sm font-bold text-white">Impacto de outliers</span>
                      </div>
                      <span className={`text-xs font-bold ${appliedFeedback.details.outlierEffectOk ? 'text-green-400' : 'text-red-400'}`}>
                        {appliedFeedback.details.outlierEffectOk ? '✓' : `✗ (Real: ${appliedFeedback.real.outlierEffectReal})`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {practiceMode === 'quiz' && (
          <>
            <h3 className="text-2xl font-black text-white mb-6">Quiz</h3>

            {Object.keys(practiceResults).length > 0 && (
              <div className="mb-6 p-6 bg-slate-900/50 rounded-xl border-2 border-indigo-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white mb-1">Resultado Final</h3>
                    <p className="text-sm text-slate-400">{practiceScore} de {PRACTICE_QUESTIONS.length} correctas</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-indigo-400">{((practiceScore / PRACTICE_QUESTIONS.length) * 100).toFixed(0)}%</div>
                    <div className="flex items-center gap-1 mt-1">
                      {practiceScore === PRACTICE_QUESTIONS.length ? <><Award className="w-4 h-4 text-yellow-400" /><span className="text-xs text-yellow-400 font-bold">¡Perfecto!</span></> : practiceScore >= PRACTICE_QUESTIONS.length * 0.7 ? <span className="text-xs text-green-400 font-bold">¡Muy bien!</span> : <span className="text-xs text-orange-400 font-bold">Sigue practicando</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {PRACTICE_QUESTIONS.map((q, qIdx) => {
                const result = practiceResults[q.id];

                return (
                  <div key={q.id} className={`bg-slate-900/50 rounded-2xl p-6 border-2 transition-all ${result ? (result.correct ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5') : 'border-slate-700 hover:border-slate-600'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${result ? (result.correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 'bg-indigo-500 text-white'}`}>
                        {result ? (result.correct ? '✓' : '✗') : qIdx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h4 className="font-bold text-white flex-1">{q.question}</h4>
                        </div>
                        <div className="space-y-2">
                          {q.options.map((opt, idx) => {
                            const isSelected = practiceAnswers[q.id] === idx;
                            const isCorrect = idx === q.correct;
                            const showResult = result !== undefined;
                            return (
                              <button
                                key={idx}
                                onClick={() => !showResult && handlePracticeAnswer(q.id, idx)}
                                disabled={showResult}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${showResult
                                  ? isCorrect ? 'border-green-500 bg-green-500/10' : isSelected ? 'border-red-500 bg-red-500/10' : 'border-slate-700 bg-slate-800/30'
                                  : isSelected ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-indigo-500/50 hover:bg-slate-800'
                                  } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${showResult ? (isCorrect ? 'bg-green-500 text-white' : isSelected ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-400')
                                    : isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'
                                    }`}>
                                    {String.fromCharCode(65 + idx)}
                                  </div>
                                  <span className={`text-sm ${showResult && isCorrect ? 'text-green-400 font-bold' : 'text-slate-300'}`}>{opt}</span>
                                  {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />}
                                  {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 ml-auto" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {result && !result.correct && (
                          <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                            <p className="text-sm text-indigo-300"><strong className="text-indigo-400">Explicación:</strong> {q.explanation}</p>
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
                <button onClick={checkPracticeAnswers} className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-black text-white flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all">
                  <CheckCircle className="w-5 h-5" />Verificar Respuestas
                </button>
              </div>
            )}

            {Object.keys(practiceResults).length > 0 && (
              <div className="mt-6 flex justify-center">
                <button onClick={() => { setPracticeAnswers({}); setPracticeResults({}); setPracticeScore(0); }} className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-black text-white flex items-center gap-2 transition-all">
                  <Zap className="w-5 h-5" />Intentar de Nuevo
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // ============================================
  // RENDER: PESTAÑA COMPARACIÓN
  // ============================================

  const renderComparisonTab = () => {
    if (activeData.length === 0) {
      return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-slate-700" />
          <h3 className="text-xl font-bold text-slate-400 mb-2">Sin datos cargados</h3>
          <p className="text-slate-500">Selecciona un dataset en "Datasets"</p>
        </div>
      );
    }

    const compData = [
      { measure: 'Rango', value: range, color: '#3b82f6', icon: 'R' },
      { measure: 'Varianza', value: variance, color: '#a855f7', icon: 's²' },
      { measure: 'Desv. Std', value: stdDev, color: '#f472b6', icon: 's' },
      { measure: 'IQR', value: quartiles.iqr, color: '#f59e0b', icon: 'IQR' }
    ].filter(i => i.value !== null);

    return (
      <div className="space-y-6">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <h3 className="text-2xl font-black text-white mb-2">Comparación de Medidas de Dispersión</h3>
          <p className="text-sm text-slate-400 mb-6">Dataset: <strong className="text-indigo-400">{datasetLabel}</strong></p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={compData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="measure" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip content={({ active, payload }) => {
                if (active && payload?.length) {
                  return (
                    <div className="bg-slate-900/95 border border-slate-700 rounded-lg px-4 py-2">
                      <p className="text-white font-bold">{payload[0].payload.measure}</p>
                      <p className="text-indigo-400">Valor: {payload[0].value.toFixed(2)}</p>
                    </div>
                  );
                }
                return null;
              }} />
              <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={80}>{compData.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {compData.map((item, idx) => (
            <div key={idx} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg" style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}99)` }}>{item.icon}</div>
                <div><h4 className="font-black text-white">{item.measure}</h4></div>
              </div>
              <div className="text-4xl font-black mb-2" style={{ color: item.color }}>{item.value.toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6">
          <h4 className="font-black text-white mb-4 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-yellow-400" />Análisis de Dispersión</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Coeficiente de Variación</p>
              <p className="text-2xl font-black text-cyan-400">{cv ? cv.toFixed(2) : 'N/A'}%</p>
              <p className="text-xs text-slate-500 mt-1">
                {cv === null ? '⚠️ No calculable' : cv < 15 ? '✅ Baja variabilidad' : cv < 30 ? '⚠️ Variabilidad moderada' : '🔴 Alta variabilidad'}
              </p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Outliers Detectados</p>
              <p className="text-2xl font-black text-orange-400">{outlierInfo.count}</p>
              <p className="text-xs text-slate-500 mt-1">
                {outlierInfo.count === 0 ? '✅ Sin valores atípicos' : `⚠️ ${outlierInfo.count} valor(es) extremo(s)`}
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">Interpretación:</strong> {interpretation}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (goHome) goHome();
                else if (setView) setView("home");
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl 
           bg-white/5 hover:bg-blue-500/10 
           border border-white/10 hover:border-blue-500/40
           text-sm font-bold text-slate-200
           transition-all duration-300 
           hover:scale-105 hover:shadow-lg
           active:scale-95
           group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="tracking-wide">Volver al Índice</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl"><Calculator className="w-7 h-7 text-white animate-pulse" /></div>
              <div><span className="text-xs text-pink-400 font-bold block uppercase">Capítulo 3</span><span className="font-black text-white block text-sm">Estadística con Números</span></div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-xs text-pink-400 font-black uppercase">Lab 3.2</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8 relative">
        <section className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 border-l-4 border-l-pink-500 relative overflow-hidden">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <div className="w-64 h-64 rounded-3xl border-8 border-pink-400 flex items-center justify-center"><Activity className="w-40 h-40 text-pink-400" /></div>
          </div>
          <div className="flex items-start gap-6 relative z-10">
            <div className="p-4 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-2xl border border-pink-500/30 shrink-0"><Activity className="w-8 h-8 text-pink-400" /></div>
            <div>
              <div className="flex items-center gap-3 mb-2"><span className="text-xs font-black text-pink-500 uppercase bg-pink-500/10 px-3 py-1 rounded-full">Sección 3.2</span></div>
              <h2 className="text-2xl font-black text-white mb-2">3.2 Medidas de Dispersión</h2>
              <p className="text-slate-400 leading-relaxed max-w-3xl">Aprende a medir la variabilidad de los datos: <strong className="text-white">rango</strong>, <strong className="text-white">varianza</strong>, <strong className="text-white">desviación estándar</strong> y <strong className="text-white">rango intercuartílico</strong>.</p>
            </div>
          </div>
        </section>

        <div className="flex gap-3 border-b border-white/10 pb-4 flex-wrap">
          {[
            { id: 'intro', label: 'Introducción', icon: Info },
            { id: 'datasets', label: 'Datasets', icon: Database },
            { id: 'practice', label: 'Práctica', icon: Brain },
            { id: 'comparison', label: 'Comparación', icon: Activity },
            { id: 'calculator', label: 'Calculadora', icon: Calculator }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'intro' && renderIntroTab()}
        {activeTab === 'datasets' && renderDatasetsTab()}
        {activeTab === 'practice' && renderPracticeTab()}
        {activeTab === 'comparison' && renderComparisonTab()}
        {activeTab === 'calculator' && renderCalculatorManualTab()}
      </main>
    </div>
  );
};

export default Lab3_2;