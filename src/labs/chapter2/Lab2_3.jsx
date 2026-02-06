import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, TrendingUp, Upload, Download, Eye,
  Database, Activity, Target, Lightbulb,
  Info, FileSpreadsheet, BookOpen, LineChart,
  ScatterChart, Box, LayoutGrid, AlertCircle, Settings,
  ChevronDown, ChevronUp, BarChart2, Flame,
  Circle, Square, Grid
} from "lucide-react";
import {
  ResponsiveContainer, LineChart as RechartsLineChart, Line,
  BarChart, Bar, ScatterChart as RechartsScatterChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend,
  Label, ComposedChart, ZAxis
} from "recharts";
import Papa from "papaparse";

// ============================================
// DATASETS PRECARGADOS
// ============================================

const IRIS_DATA = [
  { sepal_length: 5.1, sepal_width: 3.5, petal_length: 1.4, petal_width: 0.2, species: "Setosa" },
  { sepal_length: 4.9, sepal_width: 3.0, petal_length: 1.4, petal_width: 0.2, species: "Setosa" },
  { sepal_length: 4.7, sepal_width: 3.2, petal_length: 1.3, petal_width: 0.2, species: "Setosa" },
  { sepal_length: 7.0, sepal_width: 3.2, petal_length: 4.7, petal_width: 1.4, species: "Versicolor" },
  { sepal_length: 6.4, sepal_width: 3.2, petal_length: 4.5, petal_width: 1.5, species: "Versicolor" },
  { sepal_length: 6.9, sepal_width: 3.1, petal_length: 4.9, petal_width: 1.5, species: "Versicolor" },
  { sepal_length: 6.3, sepal_width: 3.3, petal_length: 6.0, petal_width: 2.5, species: "Virginica" },
  { sepal_length: 5.8, sepal_width: 2.7, petal_length: 5.1, petal_width: 1.9, species: "Virginica" },
  { sepal_length: 7.1, sepal_width: 3.0, petal_length: 5.9, petal_width: 2.1, species: "Virginica" },
];

const TIPS_DATA = [
  { total_bill: 16.99, tip: 1.01, size: 2, day: "Domingo", time: "Cena", sex: "Mujer" },
  { total_bill: 10.34, tip: 1.66, size: 3, day: "Domingo", time: "Cena", sex: "Hombre" },
  { total_bill: 21.01, tip: 3.50, size: 3, day: "Domingo", time: "Cena", sex: "Hombre" },
  { total_bill: 23.68, tip: 3.31, size: 2, day: "Domingo", time: "Cena", sex: "Hombre" },
  { total_bill: 24.59, tip: 3.61, size: 4, day: "Domingo", time: "Cena", sex: "Mujer" },
  { total_bill: 25.29, tip: 4.71, size: 4, day: "Domingo", time: "Cena", sex: "Hombre" },
  { total_bill: 8.77, tip: 2.00, size: 2, day: "Domingo", time: "Cena", sex: "Hombre" },
  { total_bill: 26.88, tip: 3.12, size: 4, day: "Domingo", time: "Cena", sex: "Hombre" },
];

const PENGUINS_DATA = [
  { species: "Adelie", island: "Torgersen", bill_length_mm: 39.1, bill_depth_mm: 18.7, flipper_length_mm: 181, body_mass_g: 3750 },
  { species: "Adelie", island: "Torgersen", bill_length_mm: 39.5, bill_depth_mm: 17.4, flipper_length_mm: 186, body_mass_g: 3800 },
  { species: "Adelie", island: "Torgersen", bill_length_mm: 40.3, bill_depth_mm: 18.0, flipper_length_mm: 195, body_mass_g: 3250 },
  { species: "Gentoo", island: "Biscoe", bill_length_mm: 46.1, bill_depth_mm: 13.2, flipper_length_mm: 211, body_mass_g: 4500 },
  { species: "Gentoo", island: "Biscoe", bill_length_mm: 50.0, bill_depth_mm: 16.3, flipper_length_mm: 230, body_mass_g: 5700 },
  { species: "Gentoo", island: "Biscoe", bill_length_mm: 48.7, bill_depth_mm: 14.1, flipper_length_mm: 210, body_mass_g: 4450 },
  { species: "Chinstrap", island: "Dream", bill_length_mm: 46.5, bill_depth_mm: 17.9, flipper_length_mm: 192, body_mass_g: 3500 },
  { species: "Chinstrap", island: "Dream", bill_length_mm: 50.0, bill_depth_mm: 19.5, flipper_length_mm: 196, body_mass_g: 3900 },
];

const DATASETS = {
  military_us: {
    label: "Gasto Militar EUA (2013-2022)",
    icon: TrendingUp,
    kind: "series",
    data: [
      { year: 2013, value: 640 },
      { year: 2014, value: 610 },
      { year: 2015, value: 596 },
      { year: 2016, value: 611 },
      { year: 2017, value: 605 },
      { year: 2018, value: 649 },
      { year: 2019, value: 732 },
      { year: 2020, value: 778 },
      { year: 2021, value: 801 },
      { year: 2022, value: 877 }
    ],
    xDefault: "year",
    yDefault: "value",
    xLabel: "Año",
    yLabel: "Miles de millones USD"
  },

  gdp_comparison: {
    label: "PIB Japón vs China (2010-2020)",
    icon: BarChart2,
    kind: "multiseries",
    data: [
      { year: 2010, Japan: 5.70, China: 6.10 },
      { year: 2012, Japan: 6.20, China: 8.53 },
      { year: 2014, Japan: 4.85, China: 10.48 },
      { year: 2016, Japan: 4.94, China: 11.23 },
      { year: 2018, Japan: 4.97, China: 13.89 },
      { year: 2020, Japan: 5.05, China: 14.72 }
    ],
    xDefault: "year",
    seriesDefault: ["Japan", "China"],
    xLabel: "Año",
    yLabel: "Billones USD"
  },

  exchange_rate: {
    label: "Tipo de Cambio MXN/USD (2020-2024)",
    icon: Activity,
    kind: "series",
    data: [
      { year: 2020, value: 21.49 },
      { year: 2021, value: 20.29 },
      { year: 2022, value: 20.13 },
      { year: 2023, value: 17.76 },
      { year: 2024, value: 17.15 }
    ],
    xDefault: "year",
    yDefault: "value",
    xLabel: "Año",
    yLabel: "Pesos por Dólar"
  },

  temperature: {
    label: "Temperatura Promedio Mensual (°C)",
    icon: Flame,
    kind: "series",
    data: [
      { month: "Ene", value: 18 },
      { month: "Feb", value: 19 },
      { month: "Mar", value: 21 },
      { month: "Abr", value: 23 },
      { month: "May", value: 25 },
      { month: "Jun", value: 27 },
      { month: "Jul", value: 26 },
      { month: "Ago", value: 26 },
      { month: "Sep", value: 25 },
      { month: "Oct", value: 23 },
      { month: "Nov", value: 21 },
      { month: "Dic", value: 19 }
    ],
    xDefault: "month",
    yDefault: "value",
    xLabel: "Mes",
    yLabel: "Temperatura (°C)"
  },

  iris: {
    label: "Iris - Medidas de Flores",
    icon: ScatterChart,
    kind: "table",
    data: IRIS_DATA,
    numericKeys: ["sepal_length", "sepal_width", "petal_length", "petal_width"],
    categoricalKeys: ["species"]
  },

  tips: {
    label: "Propinas - Restaurante",
    icon: Database,
    kind: "table",
    data: TIPS_DATA,
    numericKeys: ["total_bill", "tip", "size"],
    categoricalKeys: ["day", "time", "sex"]
  },

  penguins: {
    label: "Pingüinos Palmer",
    icon: Box,
    kind: "table",
    data: PENGUINS_DATA,
    numericKeys: ["bill_length_mm", "bill_depth_mm", "flipper_length_mm", "body_mass_g"],
    categoricalKeys: ["species", "island"]
  }
};

// ============================================
// FUNCIONES HELPER
// ============================================

function coerceNumber(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (v === null || v === undefined) return null;
  const s = String(v).trim().replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function inferColumnTypes(rows) {
  const keys = Object.keys(rows?.[0] || {});
  const numeric = [];
  const categorical = [];

  keys.forEach((k) => {
    let numericCount = 0, total = 0;

    for (const r of rows) {
      const v = r[k];
      if (v === null || v === undefined || v === "") continue;
      total++;
      const n = coerceNumber(v);
      if (n !== null) numericCount++;
    }

    if (total > 0 && numericCount / total >= 0.7) {
      numeric.push(k);
    } else {
      categorical.push(k);
    }
  });

  return { numeric, categorical };
}

function quantile(sorted, q) {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

function summarizeBox(values) {
  const v = values.filter(x => x !== null).sort((a, b) => a - b);
  if (v.length < 4) return null;

  const q1 = quantile(v, 0.25);
  const med = quantile(v, 0.50);
  const q3 = quantile(v, 0.75);
  const iqr = q3 - q1;

  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;

  const whiskerMin = Math.min(...v.filter(x => x >= lowerFence));
  const whiskerMax = Math.max(...v.filter(x => x <= upperFence));

  const outliers = v.filter(x => x < lowerFence || x > upperFence);

  return {
    min: whiskerMin,
    q1,
    med,
    q3,
    max: whiskerMax,
    outliers,
    n: v.length
  };
}

function pearson(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return null;

  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;

  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const x = xs[i] - mx;
    const y = ys[i] - my;
    num += x * y;
    dx += x * x;
    dy += y * y;
  }

  const den = Math.sqrt(dx * dy);
  return den === 0 ? null : num / den;
}

// ============================================
// FUNCIONES DE ANÁLISIS
// ============================================

function analyzeSeries(chartData, xKey, yKey) {
  if (chartData.length < 3) return "No hay suficientes puntos para interpretar tendencia.";

  const ys = chartData.map(d => d[yKey]).filter(v => typeof v === "number");
  if (ys.length < 3) return "No hay suficientes valores numéricos válidos.";

  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const trend = ys[ys.length - 1] - ys[0];

  const trendText = trend > 0 ? "tendencia creciente" : trend < 0 ? "tendencia decreciente" : "tendencia estable";

  return `Se observa una ${trendText}. El valor mínimo es ${min.toFixed(2)} y el máximo es ${max.toFixed(2)}.`;
}

function analyzeScatter(points) {
  if (points.length < 5) return "No hay suficientes puntos para evaluar relación.";

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const r = pearson(xs, ys);

  if (r === null) return "No fue posible estimar relación lineal.";

  const strength = Math.abs(r) > 0.7 ? "fuerte" : Math.abs(r) > 0.4 ? "moderada" : "débil";
  const direction = r > 0 ? "positiva" : "negativa";

  return `La relación lineal estimada es ${direction} y ${strength} (r ≈ ${r.toFixed(2)}).`;
}

function analyzeBox(boxData) {
  if (boxData.length < 2) return "Se requiere al menos 2 grupos para comparar.";

  const sorted = [...boxData].sort((a, b) => b.med - a.med);
  const top = sorted[0];
  const low = sorted[sorted.length - 1];

  return `La mediana más alta corresponde a "${top.group}" (≈ ${top.med.toFixed(2)}), y la más baja a "${low.group}" (≈ ${low.med.toFixed(2)}).`;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const Lab2_3 = ({ goHome, setView }) => {
  const [activeTab, setActiveTab] = useState('intro');
  const [dataSource, setDataSource] = useState('preset');
  const [selectedDataset, setSelectedDataset] = useState('military_us');
  const [chartType, setChartType] = useState('line');
  const [chartKey, setChartKey] = useState(0);

  const [xKey, setXKey] = useState('year');
  const [yKey, setYKey] = useState('value');
  const [seriesKeys, setSeriesKeys] = useState([]);

  const [xNumKey, setXNumKey] = useState('');
  const [yNumKey, setYNumKey] = useState('');
  const [colorKey, setColorKey] = useState('');
  const [sizeKey, setSizeKey] = useState('');

  const [boxNumKey, setBoxNumKey] = useState('');
  const [boxGroupKey, setBoxGroupKey] = useState('');
  const [showOutliers, setShowOutliers] = useState(true);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [cleanData, setCleanData] = useState([]);
  const [numericColumns, setNumericColumns] = useState([]);
  const [categoricalColumns, setCategoricalColumns] = useState([]);

  const [chartTitle, setChartTitle] = useState('');
  const [xLabel, setXLabel] = useState('');
  const [yLabel, setYLabel] = useState('');
  const [analysisText, setAnalysisText] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [showTable, setShowTable] = useState(false);

  const chartRef = useRef(null);

  const PALETTES = {
    modern: {
      name: "Moderno",
      colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#f97316']
    },
    ocean: {
      name: "Océano",
      colors: ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#0e7490', '#155e75', '#164e63']
    },
    forest: {
      name: "Bosque",
      colors: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#6ee7b7', '#34d399', '#10b981']
    }
  };

  const [colorPalette, setColorPalette] = useState('modern');
  const [backgroundColor, setBackgroundColor] = useState('white');
  const [showGrid, setShowGrid] = useState(true);

  const BACKGROUNDS = {
    white: { name: "Blanco", color: "#ffffff" },
    light: { name: "Gris Claro", color: "#f8fafc" },
    cream: { name: "Crema", color: "#fefce8" },
    slate: { name: "Pizarra", color: "#f1f5f9" }
  };

  useEffect(() => {
    setWarnings([]);
    setAnalysisText('');
    setChartKey(prev => prev + 1);
  }, [activeTab]);

  const getActiveRows = () => {
    if (dataSource === 'upload') return cleanData;
    const ds = DATASETS[selectedDataset];
    return ds?.data || [];
  };

  const buildSeriesChart = (rows) => {
    const isMulti = seriesKeys?.length > 0;

    if (!xKey) {
      setWarnings(prev => [...prev, 'Selecciona variable X (tiempo/categoría).']);
      return { chartData: [], meta: { invalid: true } };
    }

    if (!isMulti && !yKey) {
      setWarnings(prev => [...prev, 'Selecciona variable Y (numérica).']);
      return { chartData: [], meta: { invalid: true } };
    }

    const chartData = rows
      .map(r => {
        const x = r[xKey];
        if (x === null || x === undefined || x === '') return null;

        if (!isMulti) {
          const y = coerceNumber(r[yKey]);
          return y === null ? null : { [xKey]: x, [yKey]: y };
        }

        const obj = { [xKey]: x };
        for (const s of seriesKeys) {
          obj[s] = coerceNumber(r[s]);
        }
        return obj;
      })
      .filter(Boolean);

    return { chartData, meta: { mode: isMulti ? 'multiseries' : 'series' } };
  };

  const buildScatterChart = (rows) => {
    if (!xNumKey || !yNumKey) {
      setWarnings(prev => [...prev, 'Selecciona X e Y numéricas.']);
      return { chartData: [], meta: { invalid: true } };
    }

    const chartData = rows
      .map(r => {
        const x = coerceNumber(r[xNumKey]);
        const y = coerceNumber(r[yNumKey]);
        if (x === null || y === null) return null;

        const point = { x, y, name: `(${x.toFixed(1)}, ${y.toFixed(1)})` };

        if (colorKey) point.group = r[colorKey] ?? 'Sin categoría';
        if (sizeKey) {
          const s = coerceNumber(r[sizeKey]);
          point.size = s === null ? 100 : s;
        } else {
          point.size = 100;
        }

        return point;
      })
      .filter(Boolean);

    return { chartData, meta: { mode: 'scatter' } };
  };

  const buildBoxChart = (rows) => {
    if (!boxNumKey || !boxGroupKey) {
      setWarnings(prev => [...prev, 'Selecciona variable numérica y grupo.']);
      return { chartData: [], meta: { invalid: true } };
    }

    const groups = new Map();
    for (const r of rows) {
      const g = String(r[boxGroupKey] ?? 'Sin categoría');
      const val = coerceNumber(r[boxNumKey]);
      if (val === null) continue;
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(val);
    }

    const chartData = Array.from(groups.entries())
      .map(([group, vals]) => {
        const s = summarizeBox(vals);
        return s ? { group, ...s } : null;
      })
      .filter(Boolean);

    return { chartData, meta: { mode: 'box' } };
  };

  const getChartData = () => {
    const rows = getActiveRows();
    if (!rows.length) return { chartData: [], meta: {} };

    switch (chartType) {
      case 'bar':
      case 'line':
        return buildSeriesChart(rows);
      case 'scatter':
        return buildScatterChart(rows);
      case 'box':
        return buildBoxChart(rows);
      default:
        return { chartData: [], meta: {} };
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        setRawData(results.data);
        setCleanData(results.data);

        const { numeric, categorical } = inferColumnTypes(results.data);
        setNumericColumns(numeric);
        setCategoricalColumns(categorical);

        setXNumKey('');
        setYNumKey('');
        setColorKey('');
        setSizeKey('');
        setBoxNumKey('');
        setBoxGroupKey('');
        setChartTitle('');
      }
    });
  };

  const exportChart = () => {
    if (!chartRef.current) return;

    const svg = chartRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = svg.width.baseVal.value;
    canvas.height = svg.height.baseVal.value;

    img.onload = () => {
      ctx.fillStyle = BACKGROUNDS[backgroundColor].color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const link = document.createElement('a');
      link.download = `${chartTitle || 'grafico'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
          <p className="text-white font-semibold text-xs mb-1">
            {payload[0].payload[xKey] || payload[0].name}
          </p>
          {payload.map((entry, idx) => (
            <p key={idx} className="text-blue-400 font-bold text-sm">
              {entry.name && entry.name !== 'value' ? `${entry.name}: ` : ''}
              {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // useEffect para análisis automático
  useEffect(() => {
    const { chartData, meta } = getChartData();

    if (chartData.length > 0) {
      let analysis = '';

      if (chartType === 'line' || chartType === 'bar') {
        if (meta.mode === 'series') {
          analysis = analyzeSeries(chartData, xKey, yKey);
        } else {
          analysis = 'Comparación de múltiples series a través del tiempo.';
        }
      } else if (chartType === 'scatter') {
        analysis = analyzeScatter(chartData);
      } else if (chartType === 'box') {
        analysis = analyzeBox(chartData);
      }

      setAnalysisText(analysis);
    }
  }, [selectedDataset, xKey, yKey, xNumKey, yNumKey, boxNumKey, boxGroupKey, chartType]);

  const renderChart = () => {
    const { chartData, meta } = getChartData();

    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-slate-400">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="font-semibold text-lg">No hay datos para visualizar</p>
            <p className="text-sm mt-2 text-slate-500">
              {activeTab === 'upload'
                ? 'Sube un archivo CSV y selecciona las variables'
                : 'Selecciona un dataset para comenzar'}
            </p>
          </div>
        </div>
      );
    }

    const currentColors = PALETTES[colorPalette].colors;
    const bgColor = BACKGROUNDS[backgroundColor].color;
    const isLight = ['white', 'light', 'cream', 'slate'].includes(backgroundColor);
    const textColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.05)';

    return (
      <div key={chartKey} ref={chartRef} style={{ backgroundColor: bgColor }} className="rounded-xl p-6">
        {chartTitle && (
          <h3 className="text-center font-bold text-lg mb-4" style={{ color: isLight ? '#1e293b' : '#e2e8f0' }}>
            {chartTitle}
          </h3>
        )}

        <ResponsiveContainer width="100%" height={450}>
          {chartType === 'line' ? (
            <RechartsLineChart data={chartData} margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />}

              <XAxis
                dataKey={xKey}
                tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              >
                {xLabel && (
                  <Label
                    value={xLabel}
                    position="insideBottom"
                    offset={-15}
                    style={{ fill: isLight ? '#1e293b' : '#cbd5e1', fontWeight: 700, fontSize: 12 }}
                  />
                )}
              </XAxis>

              <YAxis
                tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              >
                {yLabel && (
                  <Label
                    value={yLabel}
                    angle={-90}
                    position="insideLeft"
                    style={{ fill: isLight ? '#1e293b' : '#cbd5e1', fontWeight: 700, fontSize: 12, textAnchor: 'middle' }}
                  />
                )}
              </YAxis>

              <Tooltip content={<CustomTooltip />} />
              {meta.mode === 'multiseries' && <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />}

              {meta.mode === 'series' ? (
                <Line
                  type="monotone"
                  dataKey={yKey}
                  stroke={currentColors[0]}
                  strokeWidth={3}
                  dot={{ r: 5, fill: currentColors[0] }}
                />
              ) : (
                seriesKeys.map((key, idx) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={currentColors[idx % currentColors.length]}
                    strokeWidth={3}
                    dot={{ r: 5, fill: currentColors[idx % currentColors.length] }}
                  />
                ))
              )}
            </RechartsLineChart>
          ) : chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />}

              <XAxis
                dataKey={xKey}
                tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              >
                {xLabel && (
                  <Label
                    value={xLabel}
                    position="insideBottom"
                    offset={-15}
                    style={{ fill: isLight ? '#1e293b' : '#cbd5e1', fontWeight: 700, fontSize: 12 }}
                  />
                )}
              </XAxis>

              <YAxis
                tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              >
                {yLabel && (
                  <Label
                    value={yLabel}
                    angle={-90}
                    position="insideLeft"
                    style={{ fill: isLight ? '#1e293b' : '#cbd5e1', fontWeight: 700, fontSize: 12, textAnchor: 'middle' }}
                  />
                )}
              </YAxis>

              <Tooltip content={<CustomTooltip />} />
              {meta.mode === 'multiseries' && <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />}

              {meta.mode === 'series' ? (
                <Bar dataKey={yKey} radius={[8, 8, 0, 0]} maxBarSize={60}>
                  {chartData.map((_, idx) => (
                    <Cell key={idx} fill={currentColors[idx % currentColors.length]} />
                  ))}
                </Bar>
              ) : (
                seriesKeys.map((key, idx) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={currentColors[idx % currentColors.length]}
                    radius={[8, 8, 0, 0]}
                  />
                ))
              )}
            </BarChart>
          ) : chartType === 'scatter' ? (
            <RechartsScatterChart margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>

              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}

              <XAxis
                type="number"
                dataKey="x"
                name={xNumKey}
                tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              >
                {xLabel && (
                  <Label
                    value={xLabel}
                    position="insideBottom"
                    offset={-15}
                    style={{ fill: isLight ? '#1e293b' : '#cbd5e1', fontWeight: 700, fontSize: 12 }}
                  />
                )}
              </XAxis>

              <YAxis
                type="number"
                dataKey="y"
                name={yNumKey}
                tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              >
                {yLabel && (
                  <Label
                    value={yLabel}
                    angle={-90}
                    position="insideLeft"
                    style={{ fill: isLight ? '#1e293b' : '#cbd5e1', fontWeight: 700, fontSize: 12, textAnchor: 'middle' }}
                  />
                )}
              </YAxis>

              <ZAxis type="number" dataKey="size" range={[60, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />

              {colorKey ? (
                (() => {
                  const groups = [...new Set(chartData.map(d => d.group))];
                  return (
                    <>
                      <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                      {groups.map((g, idx) => (
                        <RechartsScatter
                          key={g}
                          name={g}
                          data={chartData.filter(d => d.group === g)}
                          fill={currentColors[idx % currentColors.length]}
                        />
                      ))}
                    </>
                  );
                })()
              ) : (
                <RechartsScatter data={chartData} fill={currentColors[0]} />
              )}
            </RechartsScatterChart>

          ) : null}
        </ResponsiveContainer>
      </div>
    );
  };

  const renderIntroTab = () => (
    <div className="space-y-8">
      <section className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 border-l-4 border-l-green-500">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-2xl border border-green-500/30 shrink-0">
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
              Datos Cuantitativos: Análisis Visual
            </h2>
            <p className="text-slate-400 leading-relaxed max-w-3xl font-medium">
              Los gráficos cuantitativos permiten analizar <strong className="text-white">cómo cambian</strong>,
              <strong className="text-white"> cómo se relacionan</strong> y <strong className="text-white">cómo se distribuyen</strong> los datos numéricos.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Info className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-black text-white">Variables Cuantitativas</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="p-3 bg-slate-800/30 rounded-lg">
              <h4 className="font-bold text-green-400 mb-1">Discretas</h4>
              <p className="text-slate-300">Valores enteros y contables (número de hijos, goles, estudiantes)</p>
            </div>

            <div className="p-3 bg-slate-800/30 rounded-lg">
              <h4 className="font-bold text-blue-400 mb-1">Continuas</h4>
              <p className="text-slate-300">Pueden tomar cualquier valor (altura, temperatura, ingresos)</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-black text-white">Preguntas que Responden</h3>
          </div>

          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></div>
              <span>¿Cómo varía una magnitud en el tiempo?</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></div>
              <span>¿Existe relación entre dos variables?</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></div>
              <span>¿Cómo se distribuyen los valores entre grupos?</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-2 shrink-0"></div>
              <span>¿Existen valores atípicos (outliers)?</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: LineChart, title: 'Líneas', desc: 'Tendencias temporales', color: 'blue' },
          { icon: ScatterChart, title: 'Dispersión', desc: 'Relaciones entre variables', color: 'purple' },
          { icon: Box, title: 'Cajas', desc: 'Comparación de distribuciones', color: 'green' }
        ].map((item, idx) => (
          <div key={idx} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
            <div className={`p-3 bg-${item.color}-500/10 rounded-xl border border-${item.color}-500/20 w-fit mb-3`}>
              <item.icon className={`w-7 h-7 text-${item.color}-400`} />
            </div>
            <h4 className="font-bold text-white mb-1">{item.title}</h4>
            <p className="text-sm text-slate-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSeriesTab = () => {
    const ds = DATASETS[selectedDataset];
    const hasData = ds && (ds.kind === 'series' || ds?.kind === 'multiseries');

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-green-400" />
              Dataset
            </h3>

            <div className="space-y-3">
              {Object.entries(DATASETS)
                .filter(([_, ds]) => ds.kind === 'series' || ds.kind === 'multiseries')
                .map(([key, ds]) => {
                  const IconComponent = ds.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedDataset(key);
                        setXKey(ds.xDefault);
                        setYKey(ds.yDefault || '');
                        setSeriesKeys(ds.seriesDefault || []);
                        setChartTitle(ds.label);
                        setXLabel(ds.xLabel);
                        setYLabel(ds.yLabel);
                      }}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedDataset === key
                        ? 'bg-green-500/20 border-green-400 shadow-lg shadow-green-500/20'
                        : 'bg-slate-800/50 border-slate-700 hover:border-green-500/50 hover:bg-slate-800'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${selectedDataset === key ? 'bg-green-500/30' : 'bg-slate-700/50'}`}>
                          <IconComponent className={`w-5 h-5 ${selectedDataset === key ? 'text-green-300' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-white text-sm">{ds.label}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-green-400" />
              Configuración
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Tipo de Gráfico
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setChartType('bar')}
                    className={`p-3 rounded-lg font-semibold text-xs transition-all flex flex-col items-center gap-1 ${chartType === 'bar'
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                      }`}
                  >
                    <BarChart2 className="w-5 h-5" />
                    Barras
                  </button>

                  <button
                    onClick={() => setChartType('line')}
                    className={`p-3 rounded-lg font-semibold text-xs transition-all flex flex-col items-center gap-1 ${chartType === 'line'
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                      }`}
                  >
                    <LineChart className="w-5 h-5" />
                    Líneas
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Paleta de Colores
                </label>
                <select
                  value={colorPalette}
                  onChange={(e) => setColorPalette(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-green-500 focus:outline-none"
                >
                  {Object.entries(PALETTES).map(([key, pal]) => (
                    <option key={key} value={key}>{pal.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Fondo
                </label>
                <select
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-green-500 focus:outline-none"
                >
                  {Object.entries(BACKGROUNDS).map(([key, bg]) => (
                    <option key={key} value={key}>{bg.name}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-all">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
                />
                <span className="text-sm font-semibold text-white">Mostrar cuadrícula</span>
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Eye className="w-6 h-6 text-green-400" />
                Visualización
              </h3>
              {hasData && (
                <button
                  onClick={exportChart}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-lg shadow-green-500/20"
                >
                  <Download className="w-4 h-4" />
                  Exportar PNG
                </button>
              )}
            </div>

            {renderChart()}

            {hasData && analysisText && (
              <div className="mt-6 p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white mb-2 text-sm">Interpretación</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{analysisText}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderScatterTab = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              Dataset
            </h3>

            <div className="space-y-3">
              {Object.entries(DATASETS)
                .filter(([_, ds]) => ds.kind === 'table')
                .map(([key, ds]) => {
                  const IconComponent = ds.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedDataset(key);
                        setDataSource('preset');
                        setXNumKey('');
                        setYNumKey('');
                        setColorKey('');
                        setSizeKey('');
                        setChartTitle(ds.label);
                        setChartType('scatter');
                      }}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedDataset === key
                        ? 'bg-purple-500/20 border-purple-400 shadow-lg shadow-purple-500/20'
                        : 'bg-slate-800/50 border-slate-700 hover:border-purple-500/50 hover:bg-slate-800'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${selectedDataset === key ? 'bg-purple-500/30' : 'bg-slate-700/50'}`}>
                          <IconComponent className={`w-5 h-5 ${selectedDataset === key ? 'text-purple-300' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-white text-sm">{ds.label}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {selectedDataset && DATASETS[selectedDataset]?.kind === 'table' && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Variables
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Eje X (numérica)
                  </label>
                  <select
                    value={xNumKey}
                    onChange={(e) => {
                      setXNumKey(e.target.value);
                      setXLabel(e.target.value);
                    }}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Selecciona...</option>
                    {DATASETS[selectedDataset].numericKeys.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Eje Y (numérica)
                  </label>
                  <select
                    value={yNumKey}
                    onChange={(e) => {
                      setYNumKey(e.target.value);
                      setYLabel(e.target.value);
                    }}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Selecciona...</option>
                    {DATASETS[selectedDataset].numericKeys.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Color por (opcional)
                  </label>
                  <select
                    value={colorKey}
                    onChange={(e) => setColorKey(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Sin agrupar</option>
                    {DATASETS[selectedDataset].categoricalKeys.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Eye className="w-6 h-6 text-purple-400" />
              Gráfico de Dispersión
            </h3>
            {xNumKey && yNumKey && (
              <button
                onClick={exportChart}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20"
              >
                <Download className="w-4 h-4" />
                Exportar PNG
              </button>
            )}
          </div>

          {renderChart()}

          {xNumKey && yNumKey && analysisText && (
            <div className="mt-6 p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-2 text-sm">Interpretación</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{analysisText}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBoxTab = () => {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-slate-400">
            <Box className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="font-semibold text-lg">Boxplot disponible próximamente</p>
            <p className="text-sm mt-2 text-slate-500">
              Implementación de visualización de cajas y bigotes en desarrollo
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderClassicTab = () => {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
        <h2 className="text-xl font-black text-white mb-6">Exploración Libre de Datasets</h2>
        <p className="text-slate-400 mb-8">
          Próximamente: Explora datasets clásicos con total libertad para elegir el tipo de gráfico y variables.
        </p>
      </div>
    );
  };

  const renderUploadTab = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-orange-400" />
              Tus Datos (CSV)
            </h3>

            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-bold
                file:bg-orange-500/20 file:text-orange-300
                hover:file:bg-orange-500/30"
            />

            {numericColumns.length > 0 && (
              <div className="mt-4 p-4 bg-slate-800/30 rounded-lg">
                <p className="text-xs text-slate-400 mb-2">
                  <strong className="text-green-400">{numericColumns.length}</strong> columnas numéricas detectadas
                </p>
                <p className="text-xs text-slate-400">
                  <strong className="text-blue-400">{categoricalColumns.length}</strong> columnas categóricas detectadas
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center text-slate-400">
              <Upload className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="font-semibold text-lg">Carga tus propios datos</p>
              <p className="text-sm mt-2 text-slate-500">
                Sube un archivo CSV para comenzar el análisis
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'intro':
        return renderIntroTab();
      case 'series':
        return renderSeriesTab();
      case 'scatter':
        return renderScatterTab();
      case 'box':
        return renderBoxTab();
      case 'classic':
        return renderClassicTab();
      case 'upload':
        return renderUploadTab();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 shadow-2xl shadow-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (goHome) goHome();
                else if (setView) setView("home");
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-all group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Volver al Índice
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10"></div>
                <TrendingUp className="w-7 h-7 text-white relative z-10" />
              </div>
              <div>
                <span className="text-xs text-green-400 font-bold block uppercase tracking-wider">
                  Capítulo 2
                </span>
                <span className="font-black tracking-tight text-white block text-sm">
                  Gráficos Cuantitativos
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-green-400 font-black uppercase tracking-wider">Lab 2.3</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8 relative">
        <section className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 border-l-4 border-l-green-500 relative overflow-hidden">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <TrendingUp className="w-64 h-64 text-green-400" />
          </div>

          <div className="flex items-start gap-6 relative z-10">
            <div className="p-4 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-2xl border border-green-500/30 shrink-0">
              <LineChart className="w-8 h-8 text-green-400" />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-black text-green-500 uppercase tracking-wider bg-green-500/10 px-3 py-1 rounded-full">
                  Sección 2.3
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
                2.3 Gráficos de Datos Cuantitativos
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-3xl font-medium">
                Visualiza tendencias, relaciones y distribuciones de variables numéricas. Descubre cómo los datos cambian
                a través del tiempo, cómo se relacionan entre sí y cómo se comparan entre diferentes grupos.
              </p>
            </div>
          </div>
        </section>

        <div className="flex gap-3 border-b border-white/10 pb-4 flex-wrap">
          {[
            { id: 'intro', label: 'Introducción', icon: Info },
            { id: 'series', label: 'Series (Barras/Líneas)', icon: LineChart },
            { id: 'scatter', label: 'Dispersión', icon: ScatterChart },
            { id: 'box', label: 'Cajas', icon: Box },
            { id: 'classic', label: 'Datasets Clásicos', icon: Database },
            { id: 'upload', label: 'Tus Datos', icon: Upload }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === tab.id
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {warnings.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
            {warnings.map((warn, idx) => (
              <p key={idx} className="text-orange-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {warn}
              </p>
            ))}
          </div>
        )}

        {renderTabContent()}
      </main>
    </div>
  );
};

export default Lab2_3;