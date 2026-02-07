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
  Label, ComposedChart, ZAxis, Scatter as RechartsScatter, ReferenceDot, Customized, ReferenceLine
} from "recharts";
import Papa from "papaparse";
import * as XLSX from 'xlsx';

// ============================================
// CONFIGURACIÓN DE DATASETS
// ============================================

const DATASET_CONFIGS = {
  iris: {
    label: "Iris - Medidas de Flores",
    icon: ScatterChart,
    kind: "table",
    csvPath: "/DATASETS/iris.csv",
    numericKeys: ["sepal_length", "sepal_width", "petal_length", "petal_width"],
    categoricalKeys: ["species"]
  },

  tips: {
    label: "Propinas - Restaurante",
    icon: Database,
    kind: "table",
    csvPath: "/DATASETS/tips.csv",
    numericKeys: ["total_bill", "tip", "size"],
    categoricalKeys: ["sex", "smoker", "day", "time"]
  },

  penguins: {
    label: "Pingüinos Palmer",
    icon: Box,
    kind: "table",
    csvPath: "/DATASETS/penguins.csv",
    numericKeys: ["bill_length_mm", "bill_depth_mm", "flipper_length_mm", "body_mass_g"],
    categoricalKeys: ["species", "island", "sex"]
  },

  military_us: {
    label: "Gasto Militar EUA (2013–2022)",
    icon: TrendingUp,
    kind: "series",
    data: [
      { year: 2013, value: 640 },
      { year: 2014, value: 610 },
      { year: 2015, value: 596 },
      { year: 2016, value: 611 },
      { year: 2017, value: 610 },
      { year: 2018, value: 731 },
      { year: 2020, value: 778 },
      { year: 2021, value: 801 },
      { year: 2022, value: 812 }
    ],
    xDefault: "year",
    yDefault: "value",
    xLabel: "Año",
    yLabel: "Miles de millones USD"
  },

  gdp_comparison: {
    label: "PIB Japón vs China (2005–2015)",
    icon: BarChart2,
    kind: "multiseries",
    data: [
      { year: 2005, Japan: 4.55, China: 2.29 },
      { year: 2006, Japan: 4.35, China: 2.75 },
      { year: 2007, Japan: 4.51, China: 3.55 },
      { year: 2008, Japan: 5.03, China: 4.60 },
      { year: 2009, Japan: 5.29, China: 5.11 },
      { year: 2010, Japan: 5.70, China: 5.93 },
      { year: 2011, Japan: 5.90, China: 7.49 },
      { year: 2012, Japan: 5.95, China: 8.53 },
      { year: 2013, Japan: 5.93, China: 9.61 },
      { year: 2014, Japan: 4.85, China: 10.48 },
      { year: 2015, Japan: 4.38, China: 11.06 }
    ],
    xDefault: "year",
    seriesDefault: ["Japan", "China"],
    xLabel: "Año",
    yLabel: "Billones de USD",
    note: "China supera a Japón por primera vez en 2010."
  },

  exchange_rate: {
    label: "Tipo de Cambio MXN/USD (2014–2023)",
    icon: Activity,
    kind: "series",
    data: [
      { year: 2014, value: 13.30 },
      { year: 2015, value: 15.88 },
      { year: 2016, value: 18.69 },
      { year: 2017, value: 18.91 },
      { year: 2018, value: 19.24 },
      { year: 2019, value: 19.26 },
      { year: 2020, value: 21.50 },
      { year: 2021, value: 20.28 },
      { year: 2022, value: 20.12 },
      { year: 2023, value: 17.73 }
    ],
    xDefault: "year",
    yDefault: "value",
    xLabel: "Año",
    yLabel: "MXN por USD"
  },

  temperature: {
    label: "Temperatura Promedio Mensual CDMX (1985 vs 2024)",
    icon: Flame,
    kind: "multiseries",
    data: [
      { month: "Ene", "1985": 12.5, "2024": 16.4 },
      { month: "Feb", "1985": 14.3, "2024": 17.4 },
      { month: "Mar", "1985": 15.9, "2024": 20.3 },
      { month: "Abr", "1985": 16.8, "2024": 20.9 },
      { month: "May", "1985": 17.8, "2024": 23.5 },
      { month: "Jun", "1985": 17.4, "2024": 27.4 },
      { month: "Jul", "1985": 16.5, "2024": 19.2 },
      { month: "Ago", "1985": 16.9, "2024": 19.3 },
      { month: "Sep", "1985": 16.9, "2024": 19.3 },
      { month: "Oct", "1985": 16.2, "2024": 16.9 },
      { month: "Nov", "1985": 15.0, "2024": 17.4 },
      { month: "Dic", "1985": 13.6, "2024": 15.5 }
    ],
    xDefault: "month",
    seriesDefault: ["1985", "2024"],
    xLabel: "Mes",
    yLabel: "Temperatura (°C)"
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
  const n = v.length;

  if (n === 0) return null;

  if (n === 1) {
    return {
      min: v[0],
      q1: v[0],
      med: v[0],
      q3: v[0],
      max: v[0],
      outliers: [],
      n,
      type: "point"
    };
  }

  if (n === 2) {
    const med = (v[0] + v[1]) / 2;
    return {
      min: v[0],
      q1: v[0],
      med,
      q3: v[1],
      max: v[1],
      outliers: [],
      n,
      type: "line"
    };
  }

  if (n === 3) {
    return {
      min: v[0],
      q1: v[0],
      med: v[1],
      q3: v[2],
      max: v[2],
      outliers: [],
      n,
      type: "small"
    };
  }

  const q1 = quantile(v, 0.25);
  const med = quantile(v, 0.5);
  const q3 = quantile(v, 0.75);
  const iqr = q3 - q1;

  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;

  const inside = v.filter(x => x >= lowerFence && x <= upperFence);
  const whiskerMin = inside.length ? Math.min(...inside) : v[0];
  const whiskerMax = inside.length ? Math.max(...inside) : v[n - 1];

  const outliers = v.filter(x => x < lowerFence || x > upperFence);

  return {
    min: whiskerMin,
    q1,
    med,
    q3,
    max: whiskerMax,
    outliers,
    n,
    type: "box"
  };
}

const BoxWhiskersLayer = (props) => {
  const { xAxisMap, yAxisMap, data, stroke = "#94a3b8", strokeWidth = 2, capWidth = 14 } = props;

  const xAxis =
    (xAxisMap && (xAxisMap[0] || xAxisMap["0"])) ||
    Object.values(xAxisMap || {})[0];

  const yAxis =
    (yAxisMap && (yAxisMap[0] || yAxisMap["0"])) ||
    Object.values(yAxisMap || {})[0];

  if (!xAxis?.scale || !yAxis?.scale || !Array.isArray(data)) return null;

  const xScale = xAxis.scale;
  const yScale = yAxis.scale;

  const band =
    xAxis.bandSize ??
    (typeof xScale.bandwidth === "function" ? xScale.bandwidth() : 0);

  const getXCenter = (cat) => {
    const x0 = xScale(cat);
    if (x0 == null || Number.isNaN(x0)) return null;
    return x0 + (band ? band / 2 : 0);
  };

  const getY = (v) => {
    const y0 = yScale(v);
    if (y0 == null || Number.isNaN(y0)) return null;
    return y0;
  };

  return (
    <g>
      {data.map((d, i) => {
        const cx = getXCenter(d.group);
        const yMin = getY(d.min);
        const yMax = getY(d.max);
        if (cx == null || yMin == null || yMax == null) return null;

        return (
          <g key={`wh-${d.group}-${i}`}>
            <line x1={cx} y1={yMin} x2={cx} y2={yMax} stroke={stroke} strokeWidth={strokeWidth} />
            <line x1={cx - capWidth / 2} y1={yMin} x2={cx + capWidth / 2} y2={yMin} stroke={stroke} strokeWidth={strokeWidth} />
            <line x1={cx - capWidth / 2} y1={yMax} x2={cx + capWidth / 2} y2={yMax} stroke={stroke} strokeWidth={strokeWidth} />
          </g>
        );
      })}
    </g>
  );
};

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

function analyzeMultiseries(chartData, seriesKeys, selectedDataset) {
  if (chartData.length < 2) return "No hay suficientes puntos para interpretar.";

  if (selectedDataset === 'gdp_comparison') {
    const crossoverYear = chartData.find(d => d.China > d.Japan);
    if (crossoverYear) {
      const chinaFinal = chartData[chartData.length - 1].China;
      const japanFinal = chartData[chartData.length - 1].Japan;
      const diff = ((chinaFinal - japanFinal) / japanFinal * 100).toFixed(1);

      return `En ${crossoverYear.year}, China supera a Japón por primera vez. Para 2015, el PIB de China es ${diff}% mayor que el de Japón (${chinaFinal.toFixed(2)} vs ${japanFinal.toFixed(2)} billones USD).`;
    }
  }

  if (selectedDataset === 'temperature') {
    const temps1985 = chartData.map(d => d["1985"]).filter(v => v != null);
    const temps2024 = chartData.map(d => d["2024"]).filter(v => v != null);

    const avg1985 = (temps1985.reduce((a, b) => a + b, 0) / temps1985.length).toFixed(1);
    const avg2024 = (temps2024.reduce((a, b) => a + b, 0) / temps2024.length).toFixed(1);
    const increase = (avg2024 - avg1985).toFixed(1);

    return `La temperatura promedio en CDMX aumentó ${increase}°C entre 1985 (${avg1985}°C) y 2024 (${avg2024}°C). El mayor incremento se observa en los meses de primavera-verano.`;
  }

  const firstSeries = seriesKeys[0];
  const lastSeries = seriesKeys[seriesKeys.length - 1];

  const firstValues = chartData.map(d => d[firstSeries]).filter(v => v != null);
  const lastValues = chartData.map(d => d[lastSeries]).filter(v => v != null);

  const avgFirst = (firstValues.reduce((a, b) => a + b, 0) / firstValues.length).toFixed(2);
  const avgLast = (lastValues.reduce((a, b) => a + b, 0) / lastValues.length).toFixed(2);

  return `Comparación de ${seriesKeys.length} series. Promedio de "${firstSeries}": ${avgFirst}, promedio de "${lastSeries}": ${avgLast}.`;
}

function analyzeScatter(points) {
  if (points.length === 0) return "No hay puntos para analizar.";
  if (points.length < 3) return `Solo hay ${points.length} punto${points.length === 1 ? '' : 's'}. Se necesitan al menos 3 para evaluar correlación.`;

  const xs = points.map(p => p.x).filter(v => v !== null && Number.isFinite(v));
  const ys = points.map(p => p.y).filter(v => v !== null && Number.isFinite(v));

  if (xs.length < 3 || ys.length < 3) {
    return "No hay suficientes valores válidos para evaluar correlación.";
  }

  const r = pearson(xs, ys);

  if (r === null || !Number.isFinite(r)) {
    return "No fue posible estimar correlación lineal (valores constantes o datos insuficientes).";
  }

  const absR = Math.abs(r);
  let strength, interpretation;

  if (absR >= 0.9) {
    strength = "muy fuerte";
    interpretation = "Los puntos están muy cerca de formar una línea recta.";
  } else if (absR >= 0.7) {
    strength = "fuerte";
    interpretation = "Existe una clara tendencia lineal entre las variables.";
  } else if (absR >= 0.5) {
    strength = "moderada";
    interpretation = "Se observa una tendencia lineal, aunque con dispersión considerable.";
  } else if (absR >= 0.3) {
    strength = "débil";
    interpretation = "La relación lineal es débil, con mucha dispersión en los datos.";
  } else {
    strength = "muy débil o inexistente";
    interpretation = "No se observa una relación lineal clara entre las variables.";
  }

  const direction = r > 0 ? "positiva" : "negativa";

  return `Correlación ${direction} y ${strength} (r = ${r.toFixed(3)}). ${interpretation}`;
}

function analyzeBox(boxData) {
  if (boxData.length < 2) return "Se requiere al menos 2 grupos para comparar.";

  const sorted = [...boxData].sort((a, b) => b.med - a.med);
  const top = sorted[0];
  const low = sorted[sorted.length - 1];

  return `La mediana más alta corresponde a "${top.group}" (≈ ${top.med.toFixed(2)}), y la más baja a "${low.group}" (≈ ${low.med.toFixed(2)}).`;
}

function pearson(xs, ys) {
  const n = xs.length;

  if (n === 0 || n !== ys.length || n < 2) return null;

  const allXSame = xs.every(x => x === xs[0]);
  const allYSame = ys.every(y => y === ys[0]);
  if (allXSame || allYSame) return null;

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0);
  const sumX2 = xs.reduce((sum, x) => sum + x * x, 0);
  const sumY2 = ys.reduce((sum, y) => sum + y * y, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0 || !Number.isFinite(denominator)) return null;

  const r = numerator / denominator;

  if (!Number.isFinite(r)) return null;

  return r;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const Lab2_3 = ({ goHome, setView }) => {
  const [activeTab, setActiveTab] = useState('intro');
  const [dataSource, setDataSource] = useState('preset');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [chartType, setChartType] = useState('line');
  const [chartKey, setChartKey] = useState(0);

  const [xKey, setXKey] = useState('');
  const [yKey, setYKey] = useState('');
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

  // ✅ NUEVOS ESTADOS para carga de datasets
  const [loadedDatasets, setLoadedDatasets] = useState({});
  const [loadingDataset, setLoadingDataset] = useState(null);

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
    },
    sunset: {
      name: "Atardecer",
      colors: ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#ea580c', '#c2410c', '#9a3412']
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

  // ✅ Agregar parámetro datasetKey
  const loadDatasetFromCSV = async (csvPath, datasetKey) => {
    const response = await fetch(csvPath);
    const csvText = await response.text();

    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data;

          // ✅ Detectar columnas automáticamente
          const { numeric, categorical } = inferColumnTypes(data);

          // ✅ Actualizar configuración
          if (DATASET_CONFIGS[datasetKey]) {
            DATASET_CONFIGS[datasetKey].numericKeys = numeric;
            DATASET_CONFIGS[datasetKey].categoricalKeys = categorical;
          }

          console.log(`✅ ${datasetKey}: ${data.length} filas | ${numeric.length} numéricas | ${categorical.length} categóricas`);

          resolve(data);
        }
      });
    });
  };

  useEffect(() => {
    setWarnings([]);
    setAnalysisText('');
    setShowTable(false);

    setSelectedDataset('');
    setDataSource('preset');

    setXKey('');
    setYKey('');
    setSeriesKeys([]);
    setXNumKey('');
    setYNumKey('');
    setColorKey('');
    setSizeKey('');
    setBoxNumKey('');
    setBoxGroupKey('');

    setChartTitle('');
    setXLabel('');
    setYLabel('');

    if (activeTab === 'series') setChartType('line');
    else if (activeTab === 'scatter') setChartType('scatter');
    else if (activeTab === 'box') setChartType('box');
    else if (activeTab === 'classic') setChartType('line');
    else if (activeTab === 'upload') setChartType('line');

    setChartKey(prev => prev + 1);
  }, [activeTab]);

  // ✅ ACTUALIZADO: getActiveRows ahora usa loadedDatasets
  const getActiveRows = () => {
    if (dataSource === 'upload') return cleanData;

    const config = DATASET_CONFIGS[selectedDataset];
    if (!config) return [];

    // Si tiene data inline (series/multiseries)
    if (config.data) return config.data;

    // Si es tabla con CSV, usar datos cargados
    if (config.csvPath && loadedDatasets[selectedDataset]) {
      return loadedDatasets[selectedDataset];
    }

    return [];
  };

  const buildSeriesChart = (rows) => {
    const isMulti = seriesKeys?.length > 0;

    if (!xKey) {
      return { chartData: [], meta: { invalid: true } };
    }

    if (!isMulti && !yKey) {
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
      return { chartData: [], meta: { invalid: true } };
    }

    const chartData = rows
      .map(r => {
        const x = coerceNumber(r[xNumKey]);
        const y = coerceNumber(r[yNumKey]);
        if (x === null || y === null) return null;

        const point = {
          x,
          y,
          name: `(${x.toFixed(1)}, ${y.toFixed(1)})`,
          [xNumKey]: x,
          [yNumKey]: y
        };

        if (colorKey) {
          const groupValue = r[colorKey];
          point.group = groupValue !== null && groupValue !== undefined
            ? String(groupValue)
            : 'Sin categoría';
        }

        if (sizeKey) {
          const s = coerceNumber(r[sizeKey]);
          // tamaños más pequeños y con clamp razonable
          point.size = s === null ? 30 : Math.max(12, Math.min(70, s * 2));
        } else {
          // tamaño fijo pequeño
          point.size = 30;
        }


        return point;
      })
      .filter(Boolean);

    return { chartData, meta: { mode: 'scatter' } };
  };

  const buildBoxChart = (rows) => {
    if (!boxNumKey || !boxGroupKey) {
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
        if (!s) return null;

        return {
          group,
          ...s,
          base: s.min,
          w1: s.q1 - s.min,
          box: s.q3 - s.q1,
          w2: s.max - s.q3,
          med: s.med,
        };
      })
      .filter(Boolean);

    const outlierPoints = [];
    chartData.forEach(d => {
      d.outliers.forEach(v => outlierPoints.push({ group: d.group, y: v }));
    });

    return { chartData, meta: { mode: 'box', outlierPoints } };
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

  const canRenderChartNow = () => {
    const rows = getActiveRows();
    if (!rows?.length) return false;

    if (chartType === 'scatter') return !!(xNumKey && yNumKey);
    if (chartType === 'box') return !!(boxNumKey && boxGroupKey);
    if (chartType === 'line' || chartType === 'bar') return !!(xKey && (yKey || seriesKeys.length > 0));

    return false;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    const fileExtension = file.name.split('.').pop().toLowerCase();

    // ✅ Manejar diferentes formatos
    if (fileExtension === 'csv' || fileExtension === 'tsv') {
      // CSV o TSV
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        delimiter: fileExtension === 'tsv' ? '\t' : ',',
        complete: (results) => {
          setRawData(results.data);
          setCleanData(results.data);

          const { numeric, categorical } = inferColumnTypes(results.data);
          setNumericColumns(numeric);
          setCategoricalColumns(categorical);

          setXKey('');
          setYKey('');
          setSeriesKeys([]);
          setXNumKey('');
          setYNumKey('');
          setColorKey('');
          setSizeKey('');
          setBoxNumKey('');
          setBoxGroupKey('');
          setChartTitle(file.name.replace(/\.(csv|tsv)$/i, ''));
          setXLabel('');
          setYLabel('');
          setDataSource('upload');
        }
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      // Excel
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          setRawData(jsonData);
          setCleanData(jsonData);

          const { numeric, categorical } = inferColumnTypes(jsonData);
          setNumericColumns(numeric);
          setCategoricalColumns(categorical);

          setXKey('');
          setYKey('');
          setSeriesKeys([]);
          setXNumKey('');
          setYNumKey('');
          setColorKey('');
          setSizeKey('');
          setBoxNumKey('');
          setBoxGroupKey('');
          setChartTitle(file.name.replace(/\.(xlsx|xls)$/i, ''));
          setXLabel('');
          setYLabel('');
          setDataSource('upload');
        } catch (error) {
          console.error('Error leyendo Excel:', error);
          setWarnings(['No se pudo leer el archivo Excel. Intenta convertirlo a CSV.']);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileExtension === 'json') {
      // JSON
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const jsonData = JSON.parse(evt.target.result);
          const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];

          setRawData(dataArray);
          setCleanData(dataArray);

          const { numeric, categorical } = inferColumnTypes(dataArray);
          setNumericColumns(numeric);
          setCategoricalColumns(categorical);

          setXKey('');
          setYKey('');
          setSeriesKeys([]);
          setXNumKey('');
          setYNumKey('');
          setColorKey('');
          setSizeKey('');
          setBoxNumKey('');
          setBoxGroupKey('');
          setChartTitle(file.name.replace('.json', ''));
          setXLabel('');
          setYLabel('');
          setDataSource('upload');
        } catch (error) {
          console.error('Error leyendo JSON:', error);
          setWarnings(['No se pudo leer el archivo JSON. Verifica que tenga el formato correcto.']);
        }
      };
      reader.readAsText(file);
    } else {
      setWarnings([`Formato no soportado: .${fileExtension}. Usa CSV, TSV, Excel (.xlsx/.xls) o JSON.`]);
    }
  };

  const exportChart = () => {
    if (!chartRef.current) return;

    const svg = chartRef.current.querySelector('svg');
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = BACKGROUNDS[backgroundColor].color;
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const link = document.createElement("a");
      link.download = `${(chartTitle || "grafico").replace(/[^\w\-]+/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      URL.revokeObjectURL(url);
    };

    img.src = url;
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

  const ScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
          {data.group && (
            <p className="text-white font-semibold text-xs mb-1">{data.group}</p>
          )}
          <p className="text-blue-400 text-xs">
            <span className="font-bold">{xNumKey}:</span> {data.x.toFixed(2)}
          </p>
          <p className="text-green-400 text-xs">
            <span className="font-bold">{yNumKey}:</span> {data.y.toFixed(2)}
          </p>
          {data.size && data.size !== 100 && (
            <p className="text-purple-400 text-xs mt-1">
              Tamaño: {(data.size / 10).toFixed(1)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    if (!selectedDataset && dataSource !== 'upload') {
      setAnalysisText('');
      return;
    }

    const { chartData, meta } = getChartData();

    if (chartData.length > 0 && !meta.invalid) {
      let analysis = '';

      if (chartType === 'line' || chartType === 'bar') {
        if (meta.mode === 'series') {
          analysis = analyzeSeries(chartData, xKey, yKey);
        } else if (meta.mode === 'multiseries') {
          analysis = analyzeMultiseries(chartData, seriesKeys, selectedDataset);
        } else {
          analysis = 'Comparación de múltiples series a través del tiempo.';
        }
      } else if (chartType === 'scatter') {
        analysis = analyzeScatter(chartData);
      } else if (chartType === 'box') {
        analysis = analyzeBox(chartData);
      }

      setAnalysisText(analysis);
    } else {
      setAnalysisText('');
    }
  }, [selectedDataset, xKey, yKey, xNumKey, yNumKey, boxNumKey, boxGroupKey, chartType, seriesKeys, cleanData, dataSource]);

  const renderChart = () => {
    const { chartData, meta } = getChartData();

    const shouldShowChart = (selectedDataset || (dataSource === 'upload' && cleanData.length > 0)) && (
      (chartType === 'scatter' && xNumKey && yNumKey) ||
      ((chartType === 'line' || chartType === 'bar') && xKey && (yKey || seriesKeys.length > 0)) ||
      (chartType === 'box' && boxNumKey && boxGroupKey)
    );

    if (!shouldShowChart || !chartData || chartData.length === 0 || meta.invalid) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-slate-400">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="font-semibold text-lg">
              {!selectedDataset && dataSource !== 'upload'
                ? 'Selecciona un dataset'
                : dataSource === 'upload' && cleanData.length === 0
                  ? 'Carga un archivo CSV'
                  : 'Configura las variables del gráfico'}
            </p>
            <p className="text-sm mt-2 text-slate-500">
              {!selectedDataset && dataSource !== 'upload'
                ? 'Elige un dataset de la lista para comenzar'
                : dataSource === 'upload' && cleanData.length === 0
                  ? 'Sube un archivo CSV desde el panel izquierdo'
                  : 'Selecciona las variables necesarias en el panel de configuración'}
            </p>
          </div>
        </div>
      );
    }

    const currentColors = PALETTES[colorPalette].colors;
    const bgColor = BACKGROUNDS[backgroundColor].color;
    const isLight = ['white', 'light', 'cream', 'slate'].includes(backgroundColor);
    const textColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? 'rgba(71, 85, 105, 0.2)' : 'rgba(148, 163, 184, 0.2)';

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
              {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} strokeWidth={1.5} />}

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

              {selectedDataset === 'gdp_comparison' && meta.mode === 'multiseries' && (
                <ReferenceLine
                  x={2010}
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{
                    value: 'China supera a Japón',
                    position: 'top',
                    fill: '#10b981',
                    fontSize: 11,
                    fontWeight: 700
                  }}
                />
              )}

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
              {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} strokeWidth={1.5} />}

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
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeWidth={1.5} />}

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

              <ZAxis type="number" dataKey="size" range={[12, 70]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ScatterTooltip />} />

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
                          fillOpacity={0.65}
                        />
                      ))}
                    </>
                  );
                })()
              ) : (
                <RechartsScatter data={chartData} fill={currentColors[0]} />
              )}
            </RechartsScatterChart>
          ) : chartType === 'box' ? (
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} strokeWidth={1.5} />}

              <XAxis
                dataKey="group"
                tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
                      <p className="text-white font-semibold text-xs mb-2">{d.group}</p>
                      <p className="text-blue-400 text-xs">Min: {d.min.toFixed(2)}</p>
                      <p className="text-green-400 text-xs">Q1: {d.q1.toFixed(2)}</p>
                      <p className="text-yellow-400 text-xs font-bold">Mediana: {d.med.toFixed(2)}</p>
                      <p className="text-green-400 text-xs">Q3: {d.q3.toFixed(2)}</p>
                      <p className="text-blue-400 text-xs">Max: {d.max.toFixed(2)}</p>
                      <p className="text-slate-400 text-xs mt-1">n = {d.n}</p>
                    </div>
                  );
                }
                return null;
              }} />

              <Bar dataKey="base" stackId="box" fill="transparent" />
              <Bar dataKey="w1" stackId="box" fill={currentColors[0]} opacity={0.25} />
              <Bar dataKey="box" stackId="box" fill={currentColors[0]} opacity={0.8} />
              <Bar dataKey="w2" stackId="box" fill={currentColors[0]} opacity={0.25} />

              <Customized
                component={(props) => (
                  <BoxWhiskersLayer
                    {...props}
                    data={chartData}
                    stroke={currentColors[1]}
                    strokeWidth={2}
                    capWidth={14}
                  />
                )}
              />

              {chartData.map((d) => (
                <ReferenceDot
                  key={`med-${d.group}`}
                  x={d.group}
                  y={d.med}
                  r={5}
                  fill={currentColors[2]}
                  stroke="none"
                  ifOverflow="extendDomain"
                />
              ))}

              {showOutliers && meta?.outlierPoints?.length > 0 && (
                meta.outlierPoints.map((p, idx) => (
                  <ReferenceDot
                    key={`out-${p.group}-${idx}`}
                    x={p.group}
                    y={p.y}
                    r={4}
                    fill={currentColors[3]}
                    stroke="none"
                    ifOverflow="extendDomain"
                  />
                ))
              )}
            </ComposedChart>
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
    const ds = selectedDataset ? DATASET_CONFIGS[selectedDataset] : null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-green-400" />
              Dataset
            </h3>

            <div className="space-y-3">
              {Object.entries(DATASET_CONFIGS)
                .filter(([_, ds]) => ds.kind === 'series' || ds.kind === 'multiseries')
                .map(([key, ds]) => {
                  const IconComponent = ds.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedDataset(key);
                        setDataSource('preset');
                        setXKey(ds.xDefault);
                        setYKey(ds.yDefault || '');
                        setSeriesKeys(ds.seriesDefault || []);
                        setChartTitle(ds.label);
                        setXLabel(ds.xLabel);
                        setYLabel(ds.yLabel);
                        setChartKey(prev => prev + 1);
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
              {canRenderChartNow() && (
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

            {canRenderChartNow() && analysisText && (
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
              {Object.entries(DATASET_CONFIGS)
                .filter(([_, ds]) => ds.kind === 'table')
                .map(([key, ds]) => {
                  const IconComponent = ds.icon;
                  const isLoading = loadingDataset === key;

                  return (
                    <button
                      key={key}
                      onClick={async () => {
                        setSelectedDataset(key);
                        setDataSource('preset');
                        setXNumKey('');
                        setYNumKey('');
                        setColorKey('');
                        setSizeKey('');
                        setChartTitle(ds.label);
                        setXLabel('');
                        setYLabel('');
                        setChartType('scatter');
                        setAnalysisText('');

                        // ✅ Cargar dataset si tiene CSV y no está cargado
                        if (ds.csvPath && !loadedDatasets[key]) {
                          setLoadingDataset(key);
                          try {
                            const data = await loadDatasetFromCSV(ds.csvPath, key);
                            setLoadedDatasets(prev => ({ ...prev, [key]: data }));
                          } catch (error) {
                            console.error('Error cargando dataset:', error);
                            setWarnings([`No se pudo cargar el dataset ${ds.label}`]);
                          }
                          setLoadingDataset(null);
                        }

                        setChartKey(prev => prev + 1);
                      }}
                      disabled={isLoading}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${selectedDataset === key
                        ? 'bg-purple-500/20 border-purple-400 shadow-lg shadow-purple-500/20'
                        : 'bg-slate-800/50 border-slate-700 hover:border-purple-500/50 hover:bg-slate-800'
                        } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${selectedDataset === key ? 'bg-purple-500/30' : 'bg-slate-700/50'}`}>
                          <IconComponent className={`w-5 h-5 ${selectedDataset === key ? 'text-purple-300' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-white text-sm">{ds.label}</div>
                          {isLoading && (
                            <div className="text-xs text-purple-400 mt-1">Cargando datos...</div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {selectedDataset && DATASET_CONFIGS[selectedDataset]?.kind === 'table' && (
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
                      setChartKey(prev => prev + 1);
                    }}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Selecciona...</option>
                    {DATASET_CONFIGS[selectedDataset].numericKeys.map(col => (
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
                      setChartKey(prev => prev + 1);
                    }}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Selecciona...</option>
                    {DATASET_CONFIGS[selectedDataset].numericKeys.map(col => (
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
                    onChange={(e) => {
                      setColorKey(e.target.value);
                      setChartKey(prev => prev + 1);
                    }}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Sin agrupar</option>
                    {DATASET_CONFIGS[selectedDataset].categoricalKeys.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Paleta de Colores
                  </label>
                  <select
                    value={colorPalette}
                    onChange={(e) => setColorPalette(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-purple-500 focus:outline-none"
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
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-purple-500 focus:outline-none"
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
                    className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-semibold text-white">Mostrar cuadrícula</span>
                </label>
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
            {canRenderChartNow() && (
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

          {canRenderChartNow() && analysisText && (
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-green-400" />
              Dataset
            </h3>

            <div className="space-y-3">
              {Object.entries(DATASET_CONFIGS)
                .filter(([_, ds]) => ds.kind === 'table')
                .map(([key, ds]) => {
                  const IconComponent = ds.icon;
                  const isLoading = loadingDataset === key;

                  return (
                    <button
                      key={key}
                      onClick={async () => {
                        setSelectedDataset(key);
                        setDataSource('preset');
                        setBoxNumKey('');
                        setBoxGroupKey('');
                        setChartTitle(ds.label);
                        setChartType('box');
                        setAnalysisText('');

                        // ✅ Cargar dataset si tiene CSV
                        if (ds.csvPath && !loadedDatasets[key]) {
                          setLoadingDataset(key);
                          try {
                            const data = await loadDatasetFromCSV(ds.csvPath, key);
                            setLoadedDatasets(prev => ({ ...prev, [key]: data }));
                          } catch (error) {
                            console.error('Error cargando dataset:', error);
                          }
                          setLoadingDataset(null);
                        }

                        setChartKey(prev => prev + 1);
                      }}
                      disabled={isLoading}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedDataset === key
                        ? 'bg-green-500/20 border-green-400 shadow-lg shadow-green-500/20'
                        : 'bg-slate-800/50 border-slate-700 hover:border-green-500/50 hover:bg-slate-800'
                        } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${selectedDataset === key ? 'bg-green-500/30' : 'bg-slate-700/50'}`}>
                          <IconComponent className={`w-5 h-5 ${selectedDataset === key ? 'text-green-300' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-white text-sm">{ds.label}</div>
                          {isLoading && (
                            <div className="text-xs text-green-400 mt-1">Cargando datos...</div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {selectedDataset && DATASET_CONFIGS[selectedDataset]?.kind === 'table' && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-green-400" />
                Variables
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Variable Numérica
                  </label>
                  <select
                    value={boxNumKey}
                    onChange={(e) => {
                      setBoxNumKey(e.target.value);
                      setChartKey(prev => prev + 1);
                    }}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-green-500 focus:outline-none"
                  >
                    <option value="">Selecciona...</option>
                    {DATASET_CONFIGS[selectedDataset].numericKeys.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Agrupar por
                  </label>
                  <select
                    value={boxGroupKey}
                    onChange={(e) => {
                      setBoxGroupKey(e.target.value);
                      setChartKey(prev => prev + 1);
                    }}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-green-500 focus:outline-none"
                  >
                    <option value="">Selecciona...</option>
                    {DATASET_CONFIGS[selectedDataset].categoricalKeys.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
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

                <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-all">
                  <input
                    type="checkbox"
                    checked={showOutliers}
                    onChange={(e) => setShowOutliers(e.target.checked)}
                    className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-semibold text-white">Mostrar valores atípicos</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Eye className="w-6 h-6 text-green-400" />
              Diagrama de Cajas
            </h3>
            {canRenderChartNow() && (
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

          {canRenderChartNow() && analysisText && (
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
    );
  };

  const renderClassicTab = () => {
    const allDatasets = Object.entries(DATASET_CONFIGS);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              Todos los Datasets
            </h3>

            <div className="space-y-3">
              {allDatasets.map(([key, ds]) => {
                const IconComponent = ds.icon;
                const isLoading = loadingDataset === key;

                return (
                  <button
                    key={key}
                    onClick={async () => {
                      setSelectedDataset(key);
                      setDataSource('preset');

                      if (ds.kind === 'series') {
                        setChartType('line');
                        setXKey(ds.xDefault || '');
                        setYKey(ds.yDefault || '');
                        setSeriesKeys([]);
                        setXLabel(ds.xLabel || '');
                        setYLabel(ds.yLabel || '');
                        setXNumKey('');
                        setYNumKey('');
                        setBoxNumKey('');
                        setBoxGroupKey('');
                      } else if (ds.kind === 'multiseries') {
                        setChartType('line');
                        setXKey(ds.xDefault || '');
                        setSeriesKeys(ds.seriesDefault || []);
                        setYKey('');
                        setXLabel(ds.xLabel || '');
                        setYLabel(ds.yLabel || '');
                        setXNumKey('');
                        setYNumKey('');
                        setBoxNumKey('');
                        setBoxGroupKey('');
                      } else if (ds.kind === 'table') {
                        setChartType('scatter');
                        setXKey('');
                        setYKey('');
                        setSeriesKeys([]);
                        setXNumKey('');
                        setYNumKey('');
                        setColorKey('');
                        setBoxNumKey('');
                        setBoxGroupKey('');
                        setXLabel('');
                        setYLabel('');

                        // ✅ Cargar CSV si es tabla
                        if (ds.csvPath && !loadedDatasets[key]) {
                          setLoadingDataset(key);
                          try {
                            const data = await loadDatasetFromCSV(ds.csvPath, key);
                            setLoadedDatasets(prev => ({ ...prev, [key]: data }));
                          } catch (error) {
                            console.error('Error cargando dataset:', error);
                          }
                          setLoadingDataset(null);
                        }
                      }

                      setChartTitle(ds.label);
                      setAnalysisText('');
                      setChartKey(prev => prev + 1);
                    }}
                    disabled={isLoading}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedDataset === key
                      ? 'bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-500/20'
                      : 'bg-slate-800/50 border-slate-700 hover:border-blue-500/50 hover:bg-slate-800'
                      } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${selectedDataset === key ? 'bg-blue-500/30' : 'bg-slate-700/50'}`}>
                        <IconComponent className={`w-5 h-5 ${selectedDataset === key ? 'text-blue-300' : 'text-slate-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white text-sm">{ds.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {ds.kind === 'series' ? 'Serie temporal' : ds.kind === 'multiseries' ? 'Multiserie' : 'Tabla de datos'}
                        </div>
                        {isLoading && (
                          <div className="text-xs text-blue-400 mt-1">Cargando datos...</div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDataset && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Tipo de Gráfico
              </h3>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => setChartType('line')}
                  className={`p-3 rounded-lg font-semibold text-xs transition-all flex flex-col items-center gap-1 ${chartType === 'line'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                    }`}
                >
                  <LineChart className="w-5 h-5" />
                  Líneas
                </button>

                <button
                  onClick={() => setChartType('bar')}
                  className={`p-3 rounded-lg font-semibold text-xs transition-all flex flex-col items-center gap-1 ${chartType === 'bar'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                    }`}
                >
                  <BarChart2 className="w-5 h-5" />
                  Barras
                </button>

                <button
                  onClick={() => setChartType('scatter')}
                  className={`p-3 rounded-lg font-semibold text-xs transition-all flex flex-col items-center gap-1 ${chartType === 'scatter'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                    }`}
                >
                  <ScatterChart className="w-5 h-5" />
                  Dispersión
                </button>

                <button
                  onClick={() => setChartType('box')}
                  className={`p-3 rounded-lg font-semibold text-xs transition-all flex flex-col items-center gap-1 ${chartType === 'box'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                    }`}
                >
                  <Box className="w-5 h-5" />
                  Cajas
                </button>
              </div>

              {selectedDataset && DATASET_CONFIGS[selectedDataset] && (
                <div className="space-y-4">
                  {(chartType === 'line' || chartType === 'bar') && (
                    <>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Variable X
                        </label>
                        <select
                          value={xKey}
                          onChange={(e) => {
                            setXKey(e.target.value);
                            setXLabel(e.target.value);
                            setChartKey(prev => prev + 1);
                          }}
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Selecciona...</option>
                          {Object.keys((DATASET_CONFIGS[selectedDataset].data || [])[0] || {}).map(col => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Variable Y
                        </label>
                        <select
                          value={yKey}
                          onChange={(e) => {
                            setYKey(e.target.value);
                            setYLabel(e.target.value);
                            setChartKey(prev => prev + 1);
                          }}
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Selecciona...</option>
                          {Object.keys((DATASET_CONFIGS[selectedDataset].data || [])[0] || {})
                            .filter(col => col !== xKey)
                            .map(col => (
                              <option key={col} value={col}>{col}</option>
                            ))}
                        </select>
                      </div>
                    </>
                  )}

                  {chartType === 'scatter' && DATASET_CONFIGS[selectedDataset].kind === 'table' && (
                    <>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Eje X (numérica)
                        </label>
                        <select
                          value={xNumKey}
                          onChange={(e) => {
                            setXNumKey(e.target.value);
                            setXLabel(e.target.value);
                            setChartKey(prev => prev + 1);
                          }}
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Selecciona...</option>
                          {DATASET_CONFIGS[selectedDataset].numericKeys.map(col => (
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
                            setChartKey(prev => prev + 1);
                          }}
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Selecciona...</option>
                          {DATASET_CONFIGS[selectedDataset].numericKeys.map(col => (
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
                          onChange={(e) => {
                            setColorKey(e.target.value);
                            setChartKey(prev => prev + 1);
                          }}
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Sin agrupar</option>
                          {DATASET_CONFIGS[selectedDataset].categoricalKeys.map(col => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {chartType === 'box' && DATASET_CONFIGS[selectedDataset].kind === 'table' && (
                    <>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Variable Numérica
                        </label>
                        <select
                          value={boxNumKey}
                          onChange={(e) => {
                            setBoxNumKey(e.target.value);
                            setChartKey(prev => prev + 1);
                          }}
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Selecciona...</option>
                          {DATASET_CONFIGS[selectedDataset].numericKeys.map(col => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Agrupar por
                        </label>
                        <select
                          value={boxGroupKey}
                          onChange={(e) => {
                            setBoxGroupKey(e.target.value);
                            setChartKey(prev => prev + 1);
                          }}
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Selecciona...</option>
                          {DATASET_CONFIGS[selectedDataset].categoricalKeys.map(col => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>

                      <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-all">
                        <input
                          type="checkbox"
                          checked={showOutliers}
                          onChange={(e) => setShowOutliers(e.target.checked)}
                          className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-semibold text-white">Mostrar valores atípicos</span>
                      </label>
                    </>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Paleta de Colores
                    </label>
                    <select
                      value={colorPalette}
                      onChange={(e) => setColorPalette(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
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
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
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
                      className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-white">Mostrar cuadrícula</span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-8 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Eye className="w-6 h-6 text-blue-400" />
              Exploración Libre
            </h3>
            {canRenderChartNow() && (
              <button
                onClick={exportChart}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
              >
                <Download className="w-4 h-4" />
                Exportar PNG
              </button>
            )}
          </div>

          {renderChart()}

          {canRenderChartNow() && analysisText && (
            <div className="mt-6 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
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
  // ===============================
  // ✅ TAB: UPLOAD (CORREGIDO)
  // ===============================
  const renderUploadTab = () => {
    const hasData = cleanData.length > 0;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ===================== Panel izquierdo ===================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* ---- Card: Subir archivo ---- */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-orange-400" />
              Tus Datos
            </h3>

            <div className="space-y-3">
              <input
                id="file-upload"
                type="file"
                accept=".csv,.tsv,.xlsx,.xls,.json"
                onChange={handleFileUpload}
                className="hidden"
              />

              <label
                htmlFor="file-upload"
                className="inline-flex items-center justify-center w-full px-4 py-2 rounded-lg
               bg-orange-500/20 text-orange-300 font-bold text-sm cursor-pointer
               hover:bg-orange-500/30 transition-all"
              >
                Seleccionar archivo
              </label>

              {!uploadedFile ? (
                <p className="text-sm text-slate-500 text-center mt-3">
                  Nada seleccionado
                </p>
              ) : (
                <p className="text-sm text-green-400 text-center mt-3 flex items-center justify-center gap-2">
                  <span className="text-green-500">✓</span> {uploadedFile.name}
                </p>
              )}
            </div>


            {numericColumns.length > 0 && (
              <div className="mt-4 p-4 bg-slate-800/30 rounded-lg">
                <p className="text-xs text-slate-400 mb-2">
                  <strong className="text-green-400">{numericColumns.length}</strong>{" "}
                  columnas numéricas detectadas
                </p>
                <p className="text-xs text-slate-400">
                  <strong className="text-blue-400">{categoricalColumns.length}</strong>{" "}
                  columnas categóricas detectadas
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  <strong className="text-orange-400">{cleanData.length}</strong>{" "}
                  filas totales
                </p>
              </div>
            )}
          </div>

          {/* ---- Card: Configuración (solo si hay datos) ---- */}
          {hasData && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-400" />
                Configuración
              </h3>

              <div className="space-y-4">
                {/* Tipo de gráfico */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Tipo de Gráfico
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setChartType("line")}
                      className={`p-3 rounded-lg font-semibold text-xs transition-all flex flex-col items-center gap-1 ${chartType === "line"
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                        : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
                        }`}
                    >
                      <LineChart className="w-5 h-5" />
                      Líneas
                    </button>

                    <button
                      onClick={() => setChartType("bar")}
                      className={`p-3 rounded-lg font-semibold text-xs transition-all flex flex-col items-center gap-1 ${chartType === "bar"
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                        : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
                        }`}
                    >
                      <BarChart2 className="w-5 h-5" />
                      Barras
                    </button>

                    <button
                      onClick={() => setChartType("scatter")}
                      className={`p-3 rounded-lg font-semibold text-xs transition-all flex flex-col items-center gap-1 ${chartType === "scatter"
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                        : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
                        }`}
                    >
                      <ScatterChart className="w-5 h-5" />
                      Dispersión
                    </button>

                    <button
                      onClick={() => setChartType("box")}
                      className={`p-3 rounded-lg font-semibold text-xs transition-all flex flex-col items-center gap-1 ${chartType === "box"
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                        : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
                        }`}
                    >
                      <Box className="w-5 h-5" />
                      Cajas
                    </button>
                  </div>
                </div>

                {/* Line/Bar: X/Y */}
                {(chartType === "line" || chartType === "bar") && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Variable X
                      </label>
                      <select
                        value={xKey}
                        onChange={(e) => {
                          setXKey(e.target.value);
                          setXLabel(e.target.value);
                          setChartKey((prev) => prev + 1);
                        }}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                      >
                        <option value="">Selecciona...</option>
                        {Object.keys(cleanData[0] || {}).map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Variable Y
                      </label>
                      <select
                        value={yKey}
                        onChange={(e) => {
                          setYKey(e.target.value);
                          setYLabel(e.target.value);
                          setChartKey((prev) => prev + 1);
                        }}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                      >
                        <option value="">Selecciona...</option>
                        {numericColumns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Scatter: X/Y num + color */}
                {chartType === "scatter" && numericColumns.length >= 2 && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Eje X (numérica)
                      </label>
                      <select
                        value={xNumKey}
                        onChange={(e) => {
                          setXNumKey(e.target.value);
                          setXLabel(e.target.value);
                          setChartKey((prev) => prev + 1);
                        }}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                      >
                        <option value="">Selecciona...</option>
                        {numericColumns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
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
                          setChartKey((prev) => prev + 1);
                        }}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                      >
                        <option value="">Selecciona...</option>
                        {numericColumns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>

                    {categoricalColumns.length > 0 && (
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Color por (opcional)
                        </label>
                        <select
                          value={colorKey}
                          onChange={(e) => {
                            setColorKey(e.target.value);
                            setChartKey((prev) => prev + 1);
                          }}
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                        >
                          <option value="">Sin agrupar</option>
                          {categoricalColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                {/* Box: num + group + outliers */}
                {chartType === "box" &&
                  numericColumns.length > 0 &&
                  categoricalColumns.length > 0 && (
                    <>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Variable Numérica
                        </label>
                        <select
                          value={boxNumKey}
                          onChange={(e) => {
                            setBoxNumKey(e.target.value);
                            setChartKey((prev) => prev + 1);
                          }}
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                        >
                          <option value="">Selecciona...</option>
                          {numericColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Agrupar por
                        </label>
                        <select
                          value={boxGroupKey}
                          onChange={(e) => {
                            setBoxGroupKey(e.target.value);
                            setChartKey((prev) => prev + 1);
                          }}
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                        >
                          <option value="">Selecciona...</option>
                          {categoricalColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-all">
                        <input
                          type="checkbox"
                          checked={showOutliers}
                          onChange={(e) => setShowOutliers(e.target.checked)}
                          className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm font-semibold text-white">
                          Mostrar valores atípicos
                        </span>
                      </label>
                    </>
                  )}

                {/* Paleta */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Paleta de Colores
                  </label>
                  <select
                    value={colorPalette}
                    onChange={(e) => setColorPalette(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                  >
                    {Object.entries(PALETTES).map(([key, pal]) => (
                      <option key={key} value={key}>
                        {pal.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fondo */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Fondo
                  </label>
                  <select
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                  >
                    {Object.entries(BACKGROUNDS).map(([key, bg]) => (
                      <option key={key} value={key}>
                        {bg.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cuadrícula */}
                <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-all">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-semibold text-white">
                    Mostrar cuadrícula
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* ===================== Panel derecho ===================== */}
        <div className="lg:col-span-8 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Eye className="w-6 h-6 text-orange-400" />
              Tu Visualización
            </h3>

            {canRenderChartNow() && (
              <button
                onClick={exportChart}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20"
              >
                <Download className="w-4 h-4" />
                Exportar PNG
              </button>
            )}
          </div>

          {renderChart()}

          {canRenderChartNow() && analysisText && (
            <div className="mt-6 p-6 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-2 text-sm">
                    Interpretación
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {analysisText}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ===============================
  // ✅ CONTENIDO POR PESTAÑA (CORREGIDO)
  // ===============================
  const renderTabContent = () => {
    switch (activeTab) {
      case "intro":
        return renderIntroTab();
      case "series":
        return renderSeriesTab();
      case "scatter":
        return renderScatterTab();
      case "box":
        return renderBoxTab();
      case "classic":
        return renderClassicTab();
      case "upload":
        return renderUploadTab();
      default:
        return null;
    }
  };

  // ===============================
  // ✅ RETURN PRINCIPAL (CORREGIDO)
  // ===============================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] animate-pulse"></div>
        <div
          className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px] animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/10 rounded-full blur-[150px] animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
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
              <span className="text-xs text-green-400 font-black uppercase tracking-wider">
                Lab 2.3
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8 relative">
        {/* Header */}
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
                Visualiza tendencias, relaciones y distribuciones de variables numéricas.
                Descubre cómo los datos cambian a través del tiempo, cómo se relacionan entre sí
                y cómo se comparan entre diferentes grupos.
              </p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="flex gap-3 border-b border-white/10 pb-4 flex-wrap">
          {[
            { id: "intro", label: "Introducción", icon: Info },
            { id: "series", label: "Series (Barras/Líneas)", icon: LineChart },
            { id: "scatter", label: "Dispersión", icon: ScatterChart },
            { id: "box", label: "Cajas", icon: Box },
            { id: "classic", label: "Datasets Clásicos", icon: Database },
            { id: "upload", label: "Tus Datos", icon: Upload },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === tab.id
                ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                : "bg-white/5 hover:bg-white/10 text-slate-300"
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Warnings */}
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

        {/* Content */}
        {renderTabContent()}
      </main>
    </div>
  );
};
export default Lab2_3;
