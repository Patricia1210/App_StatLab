import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Calculator, TrendingUp, Database, Eye, Download,
  Activity, Info, Upload, BarChart3, Lightbulb, AlertCircle,
  Settings, Target, Zap, CheckCircle, XCircle, Award, Brain,
  Percent, Hash, ArrowRight, TrendingDown
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
    data: [2, 4, 6, 8, 10],
    description: "5 valores simples para práctica",
    unit: ""
  },
  con_outliers: {
    label: "Dataset con Outliers",
    icon: AlertCircle,
    data: [12, 14, 15, 13, 14, 16, 15, 14, 13, 15, 14, 16, 15, 13, 50, 14, 15, 16, 14, 13],
    description: "Datos con valor atípico (50)",
    unit: ""
  }
};

const PRACTICE_QUESTIONS = [
  {
    id: 1,
    question: "¿Qué medida de tendencia central es más robusta ante valores atípicos (outliers)?",
    options: ["Media", "Mediana", "Moda", "Todas son igual de robustas"],
    correct: 1,
    explanation: "La mediana es más robusta porque no se ve afectada por valores extremos, ya que solo depende del valor central ordenado."
  },
  {
    id: 2,
    question: "Si la media es mayor que la mediana, ¿cómo está sesgada la distribución?",
    options: ["Sesgada a la izquierda", "Simétrica", "Sesgada a la derecha", "No se puede determinar"],
    correct: 2,
    explanation: "Cuando media > mediana, hay valores altos que jalan el promedio hacia arriba, creando un sesgo positivo (a la derecha)."
  },
  {
    id: 3,
    question: "Dado el dataset [2, 3, 5, 7, 8], ¿cuál es la mediana?",
    options: ["3", "5", "5.5", "7"],
    correct: 1,
    explanation: "En un dataset ordenado con n impar, la mediana es el valor central. Posición (5+1)/2 = 3, entonces la mediana es 5."
  },
  {
    id: 4,
    question: "¿Para qué tipo de datos es más útil la moda?",
    options: ["Datos continuos", "Datos categóricos", "Datos negativos", "Datos grandes"],
    correct: 1,
    explanation: "La moda es especialmente útil para datos categóricos (ej: colores, marcas) donde queremos saber la categoría más frecuente."
  },
  {
    id: 5,
    question: "Dataset: [10, 12, 12, 15, 18, 18, 20]. ¿Cuál es la característica de este conjunto?",
    options: ["Unimodal", "Bimodal", "Trimodal", "Sin moda"],
    correct: 1,
    explanation: "El dataset tiene dos modas (12 y 18), cada una aparece dos veces. Esto lo hace bimodal."
  },
  {
    id: 6,
    question: "Si agregas un valor muy grande a un dataset, ¿qué medida cambiará más?",
    options: ["La mediana", "La moda", "La media", "Todas cambian igual"],
    correct: 2,
    explanation: "La media es sensible a valores extremos porque se calcula sumando todos los valores. La mediana y la moda son más robustas."
  },
  {
    id: 7,
    question: "Dataset: [5, 5, 6, 7, 8, 9, 100]. ¿Qué medida recomendarías usar?",
    options: ["Media, porque incluye todos los valores", "Mediana, porque hay un outlier", "Moda, porque es la más común", "Cualquiera es válida"],
    correct: 1,
    explanation: "Con el outlier (100), la media sería 20, que no representa bien los datos. La mediana (7) es más representativa del centro real."
  },
  {
    id: 8,
    question: "¿En qué situación la media, mediana y moda son exactamente iguales?",
    options: ["Distribución asimétrica", "Distribución bimodal", "Distribución normal perfecta", "Nunca son iguales"],
    correct: 2,
    explanation: "En una distribución normal perfecta (simétrica y unimodal), las tres medidas coinciden en el centro de la distribución."
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
  data.forEach(val => frequency[val] = (frequency[val] || 0) + 1);

  const maxFreq = Math.max(...Object.values(frequency));
  if (maxFreq === 1) return null;

  const modes = Object.keys(frequency)
    .filter(k => frequency[k] === maxFreq)
    .map(Number);

  return modes.length === 1 ? modes[0] : modes;
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
    return { q1: null, q3: null, iqr: null };

  const sorted = [...data].sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);

  return { q1, q3, iqr: q3 - q1 };
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

const getDistributionType = (mean, median) => {
  if (mean == null || median == null) return "desconocida";

  const denom = (mean + median) / 2;
  const diff = denom === 0
    ? Math.abs(mean - median)
    : Math.abs(mean - median) / Math.abs(denom);

  if (diff < 0.02) return "simétrica";
  return mean > median ? "sesgada a la derecha" : "sesgada a la izquierda";
};

const calculateBinSize = (data, method = 'sturges') => {
  if (!data || data.length < 2) return 1;

  const n = data.length;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  if (range === 0) return 1;

  const { iqr } = calculateQuartiles(data);
  const std = calculateStdDev(data);

  let binWidth;

  switch (method) {
    case 'sturges':
      binWidth = range / (Math.ceil(Math.log2(n)) + 1);
      break;

    case 'fd':
      if (!iqr || iqr === 0) return 1;
      binWidth = 2 * iqr * Math.pow(n, -1 / 3);
      break;

    case 'scott':
      if (!std || std === 0) return 1;
      binWidth = 3.5 * std * Math.pow(n, -1 / 3);
      break;

    default:
      binWidth = range / 20;
  }

  if (!isFinite(binWidth) || binWidth <= 0) return 1;

  return binWidth;
};

const interpretStatistics = (mean, median, mode, data) => {
  const dist = getDistributionType(mean, median);
  const { count } = detectOutliers(data);
  const cv = calculateCV(data);

  let text = "";

  if (dist === "simétrica")
    text += "📊 Distribución simétrica: media y mediana similares, indicando equilibrio. ";
  else if (dist === "sesgada a la derecha")
    text += "📈 Sesgo positivo: media > mediana debido a valores altos. ";
  else if (dist === "sesgada a la izquierda")
    text += "📉 Sesgo negativo: media < mediana debido a valores bajos. ";

  if (count > 0)
    text += `⚠️ ${count} outlier(s) detectado(s). La mediana es más representativa. `;
  else
    text += "✅ Sin outliers. La media es confiable. ";

  if (!mode)
    text += "Sin moda clara. ";
  else if (Array.isArray(mode)) {
    if (mode.length === 2)
      text += `Bimodal (${mode.join(', ')}). `;
    else if (mode.length === 3)
      text += `Trimodal (${mode.join(', ')}). `;
    else
      text += `Multimodal (${mode.length} modas). `;
  } else {
    text += `Moda única: ${mode}. `;
  }

  if (cv != null) {
    if (cv < 15)
      text += "Variabilidad baja (CV < 15%). ";
    else if (cv < 30)
      text += "Variabilidad moderada (15% ≤ CV < 30%). ";
    else
      text += "Variabilidad alta (CV ≥ 30%). ";
  }

  return text;
};

const round2 = (x) => (x == null ? null : Number(x.toFixed(2)));

const withinTol = (a, b, tol = 0.05) =>
  a != null && b != null && Math.abs(a - b) <= tol;

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const Lab3_1 = ({ goHome, setView }) => {
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
  const [variance, setVariance] = useState(null);
  const [stdDev, setStdDev] = useState(null);
  const [quartiles, setQuartiles] = useState({ q1: null, q3: null, iqr: null });
  const [cv, setCV] = useState(null);
  const [outlierInfo, setOutlierInfo] = useState({ outliers: [], count: 0 });
  const [interpretation, setInterpretation] = useState('');
  const [dataQuality, setDataQuality] = useState(null);

  const [showMean, setShowMean] = useState(true);
  const [showMedian, setShowMedian] = useState(true);
  const [showMode, setShowMode] = useState(true);
  const [showNormalCurve, setShowNormalCurve] = useState(false);
  const [showOutlierBounds, setShowOutlierBounds] = useState(false);
  const [yAxisType, setYAxisType] = useState('count');
  const [binMethod, setBinMethod] = useState('sturges');
  const [binSize, setBinSize] = useState('auto');
  const [colorPalette, setColorPalette] = useState('modern');
  const [chartKey, setChartKey] = useState(0);

  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [practiceResults, setPracticeResults] = useState({});
  const [practiceScore, setPracticeScore] = useState(0);

  const [practiceMode, setPracticeMode] = useState('applied');
  const [appliedPred, setAppliedPred] = useState({ meanVsMedian: null, hasOutliers: null, bestMeasure: null });
  const [appliedInputs, setAppliedInputs] = useState({ mean: '', median: '', mode: '' });
  const [appliedFeedback, setAppliedFeedback] = useState(null);

  const [appliedConcept, setAppliedConcept] = useState({
    dist: null,
    cv: null,
    bestMeasure: null,
    outImpact: null
  });

  const chartRef = useRef(null);

  useEffect(() => {
    if (activeData.length > 0) {
      const m = calculateMean(activeData);
      const med = calculateMedian(activeData);
      const mod = calculateMode(activeData);
      const v = calculateVariance(activeData);
      const sd = calculateStdDev(activeData);
      const q = calculateQuartiles(activeData);
      const cvVal = calculateCV(activeData);
      const outInfo = detectOutliers(activeData);

      setMean(m);
      setMedian(med);
      setMode(mod);
      setVariance(v);
      setStdDev(sd);
      setQuartiles(q);
      setCV(cvVal);
      setOutlierInfo(outInfo);
      setInterpretation(interpretStatistics(m, med, mod, activeData));
    }
  }, [activeData]);

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
        msg: "Primero selecciona un dataset en 'Calculadora'."
      });
      return;
    }

    const realMean = round2(mean);
    const realMedian = round2(median);
    const realMode = mode == null
      ? null
      : (Array.isArray(mode) ? round2(mode[0]) : round2(mode));

    const userMean = appliedInputs.mean === ''
      ? null
      : Number(parseFloat(appliedInputs.mean).toFixed(2));

    const userMedian = appliedInputs.median === ''
      ? null
      : Number(parseFloat(appliedInputs.median).toFixed(2));

    const userMode = appliedInputs.mode === ''
      ? null
      : Number(parseFloat(appliedInputs.mode).toFixed(2));

    const outCount = outlierInfo?.count || 0;
    const dist = getDistributionType(mean, median);

    const distReal = getDistributionType(mean, median);
    const distOk =
      appliedConcept.dist === 'simetrica' && distReal === 'simétrica' ||
      appliedConcept.dist === 'sesgo_pos' && distReal === 'sesgada a la derecha' ||
      appliedConcept.dist === 'sesgo_neg' && distReal === 'sesgada a la izquierda' ||
      appliedConcept.dist === 'no_det' && distReal === 'desconocida';

    let cvCategory = null;
    if (cv == null) cvCategory = 'no_interpretable';
    else if (cv < 15) cvCategory = 'baja';
    else if (cv < 30) cvCategory = 'moderada';
    else cvCategory = 'alta';

    const cvOk = appliedConcept.cv === cvCategory;

    let predicted = { bestMeasure: null };
    if (dist !== 'simétrica' || outCount > 0) {
      predicted.bestMeasure = 'median';
    } else {
      predicted.bestMeasure = 'mean';
    }

    const bestMeasureOk = appliedConcept.bestMeasure === predicted.bestMeasure;

    let outImpactReal;
    if (outlierInfo.count === 0) {
      outImpactReal = 'nada';
    } else {
      outImpactReal = 'media';
    }

    const outImpactOk = appliedConcept.outImpact === outImpactReal;

    const predMeanVsMedianOk =
      appliedPred.meanVsMedian == null ? false :
        (appliedPred.meanVsMedian === 'mean_gt_median' && mean > median) ||
        (appliedPred.meanVsMedian === 'mean_lt_median' && mean < median) ||
        (appliedPred.meanVsMedian === 'approx_equal' && dist === 'simétrica');

    const predOutliersOk =
      appliedPred.hasOutliers == null ? false :
        (appliedPred.hasOutliers === 'yes' && outCount > 0) ||
        (appliedPred.hasOutliers === 'no' && outCount === 0);

    const meanOk = withinTol(userMean, realMean);
    const medianOk = withinTol(userMedian, realMedian);
    const modeOk =
      (realMode == null && userMode == null) ||
      withinTol(userMode, realMode);

    const score = [
      distOk,
      cvOk,
      bestMeasureOk,
      outImpactOk,
      predMeanVsMedianOk,
      predOutliersOk,
      meanOk,
      medianOk,
      modeOk
    ].filter(Boolean).length;

    setAppliedFeedback({
      ok: score >= 5,
      score,
      totalQuestions: 9,
      details: {
        distOk,
        cvOk,
        bestMeasureOk,
        outImpactOk,
        predMeanVsMedianOk,
        predOutliersOk,
        meanOk,
        medianOk,
        modeOk
      },
      real: {
        mean: realMean,
        median: realMedian,
        mode: realMode,
        dist,
        outCount,
        cvCategory,
        bestMeasure: predicted.bestMeasure,
        outImpactReal
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
      link.download = `medidas_tendencia_${datasetLabel.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const prepareHistogramData = () => {
    if (activeData.length === 0) return { bins: [] };

    const min = Math.min(...activeData);
    const max = Math.max(...activeData);
    const range = max - min;

    if (range === 0) {
      return {
        bins: [{
          start: min,
          end: min,
          center: min,
          count: activeData.length,
          relFreq: 100,
          normalY: null,
          hasOutliers: false
        }]
      };
    }

    const actualBinSize = binSize === 'auto'
      ? calculateBinSize(activeData, binMethod)
      : Math.max(1e-9, parseFloat(binSize));

    const numBins = Math.max(5, Math.min(30, Math.ceil(range / actualBinSize)));
    const binWidth = range / numBins;

    const bins = Array.from({ length: numBins }, (_, i) => ({
      start: min + i * binWidth,
      end: min + (i + 1) * binWidth,
      center: min + i * binWidth + binWidth / 2,
      count: 0,
      relFreq: 0,
      normalY: null,
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

    if (showNormalCurve && mean != null && stdDev != null && stdDev > 0) {
      const n = activeData.length;
      const inv = 1 / (stdDev * Math.sqrt(2 * Math.PI));

      bins.forEach(b => {
        const x = b.center;
        const exp = -((x - mean) ** 2) / (2 * (stdDev ** 2));
        const pdf = inv * Math.exp(exp);
        const expectedProb = pdf * binWidth;

        if (yAxisType === 'count') {
          b.normalY = expectedProb * n;
        } else {
          b.normalY = expectedProb * 100;
        }
      });
    }

    return { bins };
  };
  const renderIntroTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Media",
            symbol: "μ",
            desc: "Promedio aritmético",
            formula: "x̄ = Σx / n",
            gradient: "from-blue-500 to-cyan-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            icon: "bg-blue-500",
            note: "Sensible a outliers",
            noteIcon: "text-yellow-400"
          },
          {
            title: "Mediana",
            symbol: "Me",
            desc: "Valor central ordenado",
            formula: "50% ≤ Me ≤ 50%",
            gradient: "from-purple-500 to-pink-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
            icon: "bg-purple-500",
            note: "Robusta ante outliers",
            noteIcon: "text-green-400"
          },
          {
            title: "Moda",
            symbol: "Mo",
            desc: "Valor más frecuente",
            formula: "max(frecuencia)",
            gradient: "from-pink-500 to-rose-400",
            bg: "bg-pink-500/10",
            border: "border-pink-500/20",
            icon: "bg-pink-500",
            note: "Puede no existir",
            noteIcon: "text-orange-400"
          }
        ].map((item, idx) => (
          <div key={idx} className={`${item.bg} border-2 ${item.border} rounded-3xl p-8 transition-all hover:scale-[1.02] hover:shadow-2xl`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 ${item.icon} rounded-2xl flex items-center justify-center shadow-xl`}>
                <span className="text-white font-black text-2xl">{item.symbol}</span>
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
            <h3 className="text-xl font-black text-white mb-2">Demo Rápida: Efecto de Outliers</h3>
            <p className="text-slate-400">Observa cómo un valor atípico afecta la media pero no la mediana</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
            <h4 className="text-sm font-bold text-slate-400 mb-3">Dataset: [12, 13, 14, 50]</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Media (μ):</span>
                <span className="text-2xl font-black text-cyan-400">22.25</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Mediana (Me):</span>
                <span className="text-2xl font-black text-purple-400">13.5</span>
              </div>
              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg mt-4">
                <div className="flex items-center gap-2 text-xs text-orange-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-bold">El valor 50 es un outlier que infla la media</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
            <h4 className="text-sm font-bold text-indigo-400 mb-3 uppercase">Análisis</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold mt-0.5">•</span>
                <span>La <strong className="text-cyan-400">media (22.25)</strong> está muy influenciada por el outlier (50)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold mt-0.5">•</span>
                <span>La <strong className="text-purple-400">mediana (13.5)</strong> representa mejor el centro real de los datos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold mt-0.5">✓</span>
                <span><strong className="text-white">Recomendación:</strong> Usa la mediana cuando hay outliers</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-3xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <XCircle className="w-8 h-8 text-red-400 shrink-0" />
          <div>
            <h3 className="text-xl font-black text-white mb-2">Errores Comunes a Evitar</h3>
            <p className="text-slate-400">Aprende de estos errores frecuentes al trabajar con medidas de tendencia central</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              error: "Usar media con outliers",
              fix: "Usa mediana cuando hay valores atípicos",
              icon: TrendingDown
            },
            {
              error: "Confundir moda con mediana",
              fix: "Moda = más frecuente, Mediana = valor central",
              icon: AlertCircle
            },
            {
              error: "No ordenar datos para mediana",
              fix: "Siempre ordena los datos antes de calcular la mediana",
              icon: BarChart3
            }
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-900/50 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-red-400" />
                </div>
                <XCircle className="w-4 h-4 text-red-400" />
              </div>
              <h4 className="text-sm font-bold text-red-400 mb-2">{item.error}</h4>
              <p className="text-xs text-slate-400">{item.fix}</p>
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
                <span><strong className="text-white">Media:</strong> Datos simétricos sin outliers extremos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span><strong className="text-white">Mediana:</strong> Cuando hay valores atípicos o distribución asimétrica</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 font-bold">•</span>
                <span><strong className="text-white">Moda:</strong> Datos categóricos o identificar el valor más común</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCalculatorTab = () => {
    const { bins } = prepareHistogramData();
    const currentColors = PALETTES[colorPalette].colors;
    const displayValue = yAxisType === 'percent' ? 'relFreq' : 'count';

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              Datasets
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

          {/* CORRECCIÓN: Inputs para título y ejes en el panel izquierdo */}
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
                      { key: 'showMedian', label: 'Mediana (Me)', checked: showMedian, setter: setShowMedian },
                      { key: 'showMode', label: 'Moda (Mo)', checked: showMode, setter: setShowMode },
                      { key: 'showNormalCurve', label: 'Curva Normal', checked: showNormalCurve, setter: (v) => { setShowNormalCurve(v); setChartKey(p => p + 1); } },
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
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Método bins</label>
                  <select value={binMethod} onChange={(e) => { setBinMethod(e.target.value); setBinSize('auto'); setChartKey(p => p + 1); }} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white">
                    <option value="sturges">Sturges</option>
                    <option value="fd">Freedman-Diaconis</option>
                    <option value="scott">Scott</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Colores</label>
                  <select value={colorPalette} onChange={(e) => setColorPalette(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white">
                    {Object.entries(PALETTES).map(([k, p]) => <option key={k} value={k}>{p.name}</option>)}
                  </select>
                  <div className="flex gap-1 mt-2">{PALETTES[colorPalette].colors.map((c, i) => <div key={i} className="h-6 flex-1 rounded" style={{ backgroundColor: c }} />)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Eye className="w-6 h-6 text-indigo-400" />Histograma
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
              <div ref={chartRef} key={chartKey}>
                <div className="mb-4 text-center">
                  <h4 className="text-lg font-bold text-white">{chartTitle}</h4>
                  <p className="text-xs text-slate-500 mt-1">n = {activeData.length} | Rango: {Math.min(...activeData).toFixed(2)} - {Math.max(...activeData).toFixed(2)} {dataUnit}</p>
                </div>

                <ResponsiveContainer width="100%" height={500}>
                  <ComposedChart data={bins} margin={{ top: 40, right: 30, left: 60, bottom: 80 }}>
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
                      domain={['dataMin - 1', 'dataMax + 1']}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      label={{
                        value: xLabel,
                        position: 'insideBottom',
                        offset: -10,
                        style: { fill: '#cbd5e1', fontWeight: 700, fontSize: 12 }
                      }}
                    />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      label={{
                        value: yLabel,
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
                            <p className="text-white font-bold text-xs mb-1">{d.start.toFixed(2)} - {d.end.toFixed(2)} {dataUnit}</p>
                            <p className="text-indigo-400 text-sm">Frecuencia: {d.count}</p>
                            <p className="text-purple-400 text-xs">{d.relFreq}% del total</p>
                            {d.hasOutliers && <p className="text-orange-400 text-xs font-bold mt-1">⚠️ Contiene outliers</p>}
                          </div>
                        );
                      }
                      return null;
                    }} />

                    <Bar dataKey={displayValue} fill="url(#barGrad)" barCategoryGap={0} barGap={0}>
                      {bins.map((entry, idx) => (
                        <Cell key={idx} fill={entry.hasOutliers ? '#f59e0b' : currentColors[idx % currentColors.length]} opacity={entry.hasOutliers ? 1 : 0.8} />
                      ))}
                    </Bar>

                    {showNormalCurve && (
                      <Line
                        type="monotone"
                        dataKey="normalY"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={false}
                        isAnimationActive={false}
                      />
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

                    {showMean && mean && <ReferenceLine x={mean} stroke="#22d3ee" strokeWidth={3} strokeDasharray="5 5" label={{ value: `μ=${mean.toFixed(2)}`, position: 'top', fill: '#22d3ee', fontWeight: 700, fontSize: 11 }} />}

                    {showMedian && median && <ReferenceLine x={median} stroke="#c084fc" strokeWidth={3} strokeDasharray="3 3" label={{ value: `Me=${median.toFixed(2)}`, position: 'top', fill: '#c084fc', fontWeight: 700, fontSize: 11, offset: 15 }} />}

                    {showMode && mode != null && typeof mode === 'number' && (
                      <ReferenceLine
                        x={mode}
                        stroke="#f472b6"
                        strokeWidth={2.5}
                        label={{
                          value: `Mo=${mode.toFixed(2)}`,
                          position: 'bottom',
                          fill: '#f472b6',
                          fontWeight: 700,
                          fontSize: 11
                        }}
                      />
                    )}

                    {showMode && mode && Array.isArray(mode) && mode.slice(0, 3).map((m, i) => (
                      <ReferenceLine
                        key={i}
                        x={m}
                        stroke="#f472b6"
                        strokeWidth={2.5}
                        label={{ value: `Mo=${m.toFixed(2)}`, position: 'bottom', fill: '#f472b6', fontWeight: 700, fontSize: 11, offset: i * 15 }}
                      />
                    ))}
                  </ComposedChart>
                </ResponsiveContainer>

                <div className="mt-6 p-4 bg-slate-800/30 rounded-xl">
                  <div className="flex items-center justify-center gap-6 flex-wrap">
                    {showMean && mean && <div className="flex items-center gap-2"><div className="w-8 h-1 bg-cyan-400 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #22d3ee 0, #22d3ee 5px, transparent 5px, transparent 10px)' }} /><span className="text-xs font-bold text-cyan-400">Media</span></div>}
                    {showMedian && median && <div className="flex items-center gap-2"><div className="w-8 h-1 bg-purple-400 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #c084fc 0, #c084fc 3px, transparent 3px, transparent 6px)' }} /><span className="text-xs font-bold text-purple-400">Mediana</span></div>}
                    {showMode && mode && <div className="flex items-center gap-2"><div className="w-8 h-1 bg-pink-400 rounded" /><span className="text-xs font-bold text-pink-400">Moda</span></div>}
                    {showNormalCurve && <div className="flex items-center gap-2"><div className="w-8 h-1 bg-green-400 rounded" /><span className="text-xs font-bold text-green-400">Normal</span></div>}
                    {showOutlierBounds && outlierInfo.count > 0 && <div className="flex items-center gap-2"><div className="w-8 h-1 bg-orange-400 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 8px, transparent 8px, transparent 12px)' }} /><span className="text-xs font-bold text-orange-400">Límites</span></div>}
                  </div>
                </div>
              </div>
            )}

            {/* CORRECCIÓN: Interpretación con estilo mejorado */}
            {interpretation && (
              <div className="mt-6 p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-2 text-sm flex items-center gap-2">
                      Interpretación Estadística
                      {outlierInfo.count > 0 && <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-black rounded-full">{outlierInfo.count} OUTLIER{outlierInfo.count > 1 ? 'S' : ''}</span>}
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{interpretation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* CORRECCIÓN: Tabla de Resumen con estilo del laboratorio */}
            {activeData.length > 0 && (
              <div className="mt-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-6">
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-400" />
                  Resumen Estadístico
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <span className="font-bold text-slate-300">Media</span>
                    <span className="text-xl font-black text-cyan-400">{round2(mean)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <span className="font-bold text-slate-300">Mediana</span>
                    <span className="text-xl font-black text-purple-400">{round2(median)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <span className="font-bold text-slate-300">Moda</span>
                    <span className="text-xl font-black text-pink-400">
                      {mode == null ? "Sin moda" : Array.isArray(mode) ? mode.join(", ") : mode}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  const renderPracticeTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-3xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-green-500/20 rounded-xl"><Brain className="w-8 h-8 text-green-400" /></div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2">Modo Práctica</h2>
            <p className="text-slate-400">Pon a prueba tus conocimientos sobre medidas de tendencia central</p>
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
                      <span>Primero ve a la pestaña <strong className="text-white">Calculadora</strong> y selecciona un dataset (o sube tu propio archivo)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-black text-green-400 mt-0.5">2.</span>
                      <span>Analiza la distribución y responde las preguntas conceptuales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-black text-green-400 mt-0.5">3.</span>
                      <span><strong className="text-white">Calcula manualmente</strong> la media, mediana y moda (puedes usar calculadora)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-black text-green-400 mt-0.5">4.</span>
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
                  <p className="text-sm text-slate-400 mb-4">
                    Ve a la pestaña <strong className="text-white">Calculadora</strong> y selecciona un dataset para empezar
                  </p>
                  <button onClick={() => setActiveTab('calculator')} className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-black text-white text-sm flex items-center gap-2 mx-auto transition-all">
                    <ArrowRight className="w-4 h-4" />
                    Ir a Calculadora
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* CORRECCIÓN: Práctica Aplicada con diseño mejorado del laboratorio */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-black text-white mb-4">Práctica Aplicada</h2>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                          <span className="text-indigo-400 font-black">1</span>
                        </div>
                        <h4 className="font-bold text-white">Forma de la distribución</h4>
                      </div>
                      <select
                        value={appliedConcept.dist || ""}
                        onChange={(e) => setAppliedConcept({ ...appliedConcept, dist: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-semibold focus:border-indigo-500 focus:outline-none transition-all"
                      >
                        <option value="">Selecciona</option>
                        <option value="simetrica">Simétrica</option>
                        <option value="sesgo_pos">Sesgada positiva</option>
                        <option value="sesgo_neg">Sesgada negativa</option>
                        <option value="no_det">No se puede determinar</option>
                      </select>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <span className="text-purple-400 font-black">2</span>
                        </div>
                        <h4 className="font-bold text-white">Variabilidad (CV)</h4>
                      </div>
                      <select
                        value={appliedConcept.cv || ""}
                        onChange={(e) => setAppliedConcept({ ...appliedConcept, cv: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-semibold focus:border-purple-500 focus:outline-none transition-all"
                      >
                        <option value="">Selecciona</option>
                        <option value="baja">Baja</option>
                        <option value="moderada">Moderada</option>
                        <option value="alta">Alta</option>
                        <option value="no_interpretable">No interpretable</option>
                      </select>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                          <span className="text-pink-400 font-black">3</span>
                        </div>
                        <h4 className="font-bold text-white">Mejor medida para reportar el centro</h4>
                      </div>
                      <select
                        value={appliedConcept.bestMeasure || ""}
                        onChange={(e) => setAppliedConcept({ ...appliedConcept, bestMeasure: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-semibold focus:border-pink-500 focus:outline-none transition-all"
                      >
                        <option value="">Selecciona</option>
                        <option value="mean">Media</option>
                        <option value="median">Mediana</option>
                        <option value="mode">Moda</option>
                      </select>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                          <span className="text-orange-400 font-black">4</span>
                        </div>
                        <h4 className="font-bold text-white">Si eliminaras los outliers, ¿qué cambiaría más?</h4>
                      </div>
                      <select
                        value={appliedConcept.outImpact || ""}
                        onChange={(e) => setAppliedConcept({ ...appliedConcept, outImpact: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-semibold focus:border-orange-500 focus:outline-none transition-all"
                      >
                        <option value="">Selecciona</option>
                        <option value="media">Media</option>
                        <option value="mediana">Mediana</option>
                        <option value="moda">Moda</option>
                        <option value="nada">Nada</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
                    <h4 className="font-black text-white mb-3 text-sm">Calcula los valores (2 decimales)</h4>

                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { k: 'mean', label: 'Media (μ)' },
                        { k: 'median', label: 'Mediana (Me)' },
                        { k: 'mode', label: 'Moda (Mo)' },
                      ].map(f => (
                        <div key={f.k} className="flex items-center gap-3">
                          <div className="w-28 text-xs font-black text-slate-300">{f.label}</div>
                          <input value={appliedInputs[f.k]} onChange={(e) => setAppliedInputs(s => ({ ...s, [f.k]: e.target.value }))} placeholder="Ej. 13.50" className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white" />
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button onClick={checkApplied} className="px-5 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-black text-white text-sm flex items-center gap-2 transition-all">
                        <CheckCircle className="w-4 h-4" />
                        Verificar
                      </button>
                      <button onClick={() => {
                        setAppliedPred({ meanVsMedian: null, hasOutliers: null, bestMeasure: null });
                        setAppliedInputs({ mean: '', median: '', mode: '' });
                        setAppliedConcept({ dist: null, cv: null, bestMeasure: null, outImpact: null });
                        setAppliedFeedback(null);
                      }} className="px-5 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-black text-slate-200 text-sm transition-all">
                        Reiniciar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {appliedFeedback && (
                <div className={`mt-6 p-5 rounded-xl border ${appliedFeedback.ok ? 'bg-green-500/10 border-green-500/30' : 'bg-orange-500/10 border-orange-500/30'}`}>
                  <div className="flex items-start gap-3">
                    {appliedFeedback.ok ? <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />}
                    <div className="flex-1">
                      <p className="font-black text-white">
                        {appliedFeedback.ok ? '¡Excelente!' : 'Casi — revisa esto:'}
                        <span className="ml-2 text-slate-400 font-bold text-sm">Puntaje: {appliedFeedback.score}/9</span>
                      </p>
                      <p className="text-sm text-slate-300 mt-2">
                        <span className="text-indigo-300 font-black">Distribución:</span> {appliedFeedback.real.dist} ·
                        <span className="text-orange-300 font-black"> Outliers:</span> {appliedFeedback.real.outCount}
                      </p>
                      <p className="text-sm text-slate-300 mt-2">
                        <span className="text-cyan-300 font-black">μ:</span> {appliedFeedback.real.mean} ·
                        <span className="text-purple-300 font-black"> Me:</span> {appliedFeedback.real.median} ·
                        <span className="text-pink-300 font-black"> Mo:</span> {appliedFeedback.real.mode || 'Sin moda'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {practiceMode === 'quiz' && (
          <>
            {/* CORRECCIÓN: Título único "Quiz" sin división por niveles */}
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

  const renderComparisonTab = () => {
    if (activeData.length === 0) {
      return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-slate-700" />
          <h3 className="text-xl font-bold text-slate-400 mb-2">Sin datos cargados</h3>
          <p className="text-slate-500">Selecciona un dataset en "Calculadora"</p>
        </div>
      );
    }

    const compData = [
      { measure: 'Media', value: mean, color: '#22d3ee', icon: 'μ' },
      { measure: 'Mediana', value: median, color: '#c084fc', icon: 'Me' },
      { measure: 'Moda', value: mode ? (Array.isArray(mode) ? mode[0] : mode) : null, color: '#f472b6', icon: 'Mo', note: mode && Array.isArray(mode) && mode.length > 1 ? `${mode.length} modas` : null }
    ].filter(i => i.value !== null);

    const diff = mean && median ? Math.abs(mean - median) : 0;
    const dist = getDistributionType(mean, median);

    return (
      <div className="space-y-6">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <h3 className="text-2xl font-black text-white mb-2">Comparación Visual</h3>
          <p className="text-sm text-slate-400 mb-6">Distribución: <strong className="text-indigo-400">{dist}</strong></p>
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
                      {payload[0].payload.note && <p className="text-pink-400 text-xs mt-1">{payload[0].payload.note}</p>}
                    </div>
                  );
                }
                return null;
              }} />
              <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={80}>{compData.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {compData.map((item, idx) => (
            <div key={idx} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg" style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}99)` }}>{item.icon}</div>
                <div><h4 className="font-black text-white">{item.measure}</h4>{item.note && <p className="text-xs text-pink-400">{item.note}</p>}</div>
              </div>
              <div className="text-4xl font-black mb-2" style={{ color: item.color }}>{item.value.toFixed(2)}</div>
              <div className="text-xs text-slate-500">
                {item.measure === 'Media' && 'Promedio aritmético'}
                {item.measure === 'Mediana' && 'Valor central (50%)'}
                {item.measure === 'Moda' && 'Valor más frecuente'}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6">
          <h4 className="font-black text-white mb-4 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-yellow-400" />Análisis Comparativo</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Diferencia Media-Mediana</p>
              <p className="text-2xl font-black text-cyan-400">{diff.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">{diff < 0.5 ? '✅ Distribución simétrica' : '⚠️ Distribución sesgada'}</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Tipo de Distribución</p>
              <p className="text-lg font-black text-purple-400 capitalize">{dist}</p>
              <p className="text-xs text-slate-500 mt-1">
                {dist.includes('derecha') && 'Media > Mediana (valores altos)'}
                {dist.includes('izquierda') && 'Media < Mediana (valores bajos)'}
                {dist === 'simétrica' && 'Media ≈ Mediana (equilibrado)'}
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">Recomendación:</strong> {dist === 'simétrica' ? 'Usa la media como medida representativa, ya que la distribución es equilibrada.' : 'Prefiere la mediana como medida representativa, ya que es más robusta ante el sesgo.'}
            </p>
          </div>
        </div>
      </div>
    );
  };

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
            <button onClick={() => { if (goHome) goHome(); else if (setView) setView("home"); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-all group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />Volver al Índice
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-xl"><Calculator className="w-7 h-7 text-white" /></div>
              <div><span className="text-xs text-indigo-400 font-bold block uppercase">Capítulo 3</span><span className="font-black text-white block text-sm">Estadística con Números</span></div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs text-indigo-400 font-black uppercase">Lab 3.1</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8 relative">
        <section className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 border-l-4 border-l-indigo-500 relative overflow-hidden">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <div className="w-64 h-64 rounded-3xl border-8 border-indigo-400 flex items-center justify-center"><Calculator className="w-40 h-40 text-indigo-400" /></div>
          </div>
          <div className="flex items-start gap-6 relative z-10">
            <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30 shrink-0"><Calculator className="w-8 h-8 text-indigo-400" /></div>
            <div>
              <div className="flex items-center gap-3 mb-2"><span className="text-xs font-black text-indigo-500 uppercase bg-indigo-500/10 px-3 py-1 rounded-full">Sección 3.1</span></div>
              <h2 className="text-2xl font-black text-white mb-2">3.1 Medidas de Tendencia Central</h2>
              <p className="text-slate-400 leading-relaxed max-w-3xl">Explora cómo resumir datos en valores representativos: <strong className="text-white">media</strong>, <strong className="text-white"> mediana</strong> y <strong className="text-white">moda</strong>.</p>
            </div>
          </div>
        </section>

        <div className="flex gap-3 border-b border-white/10 pb-4 flex-wrap">
          {[
            { id: 'intro', label: 'Introducción', icon: Info },
            { id: 'calculator', label: 'Calculadora', icon: Calculator },
            { id: 'practice', label: 'Práctica', icon: Brain },
            { id: 'comparison', label: 'Comparación', icon: Activity }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'intro' && renderIntroTab()}
        {activeTab === 'calculator' && renderCalculatorTab()}
        {activeTab === 'practice' && renderPracticeTab()}
        {activeTab === 'comparison' && renderComparisonTab()}
      </main>
    </div>
  );
};

export default Lab3_1;