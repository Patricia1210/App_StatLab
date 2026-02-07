import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, BarChart3, Upload, Download, Eye,
  Database, Activity, Target, Lightbulb,
  Info, AlertCircle, Settings,
  ChevronDown, ChevronUp, Sliders, Grid,
  BookOpen, TrendingUp, Calculator, Zap,
  FileSpreadsheet, PieChart, Layers
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, Label, Line, ComposedChart, ReferenceLine
} from "recharts";
import Papa from "papaparse";
import * as XLSX from 'xlsx';

const Lab2_4_Enhanced = ({ goHome, setView }) => {
  const [activeTab, setActiveTab] = useState('intro');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [chartKey, setChartKey] = useState(0);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [numericColumns, setNumericColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');

  const [numBins, setNumBins] = useState(10);
  const [binMethod, setBinMethod] = useState('equal');
  const [showCumulative, setShowCumulative] = useState(false);
  const [showNormalCurve, setShowNormalCurve] = useState(false);
  const [colorPalette, setColorPalette] = useState('modern');
  const [backgroundColor, setBackgroundColor] = useState('white');
  const [showGrid, setShowGrid] = useState(true);
  const [chartTitle, setChartTitle] = useState('');
  const [xLabel, setXLabel] = useState('');
  const [yLabel, setYLabel] = useState('Frecuencia');
  const [showTable, setShowTable] = useState(false);
  const [showOutliers, setShowOutliers] = useState(false);

  const chartRef = useRef(null);

  // Datasets más completos
  const DATASETS = {
    calificaciones: {
      name: "Calificaciones de Estudiantes",
      description: "50 calificaciones de un examen (0-10)",
      icon: BookOpen,
      data: [
        4, 5, 6, 7, 5, 8, 6, 7, 9, 5, 6, 7, 8, 6, 5, 4, 7, 8, 9, 6,
        5, 6, 7, 8, 9, 5, 6, 7, 8, 6, 5, 4, 7, 8, 9, 6, 5, 6, 7, 8,
        9, 5, 6, 7, 8, 6, 5, 4, 7, 8
      ],
      defaultBins: 6,
      xLabel: "Calificación",
      interpretation: "Distribución aproximadamente normal con ligero sesgo hacia calificaciones medias (6-7). No se observan valores atípicos significativos."
    },
    estaturas: {
      name: "Estaturas (cm)",
      description: "50 mediciones de altura",
      icon: TrendingUp,
      data: [
        160.5, 165.3, 170.1, 155.7, 162.4, 168.9, 172.3, 158.2, 163.8, 167.5,
        171.2, 159.6, 164.7, 169.4, 173.1, 156.8, 161.9, 166.5, 170.8, 157.4,
        162.7, 167.8, 171.9, 159.1, 164.2, 168.7, 172.5, 158.9, 163.5, 167.2,
        170.5, 156.3, 161.5, 166.2, 169.8, 157.8, 162.9, 167.4, 171.1, 159.3,
        164.5, 168.3, 172.0, 158.5, 163.2, 166.9, 170.2, 156.7, 161.8, 165.9
      ],
      defaultBins: 10,
      xLabel: "Altura (cm)",
      interpretation: "Distribución normal (campana de Gauss) con media ≈165cm. La simetría indica una población homogénea."
    },
    vehiculos_potencia: {
      name: "Potencia de Vehículos (HP)",
      description: "Caballos de fuerza de 392 vehículos",
      icon: Zap,
      data: Array(392).fill(0).map(() => {
        const base = Math.random() < 0.7 ? 90 : 180;
        return Math.round(base + (Math.random() - 0.5) * 60);
      }),
      defaultBins: 15,
      xLabel: "Caballos de Fuerza (HP)",
      interpretation: "Distribución bimodal con picos en ~90HP (vehículos compactos) y ~180HP (vehículos deportivos)."
    },
    pinguinos_masa: {
      name: "Masa Corporal Pingüinos (g)",
      description: "344 mediciones de pingüinos Palmer",
      icon: Database,
      data: Array(344).fill(0).map(() => {
        const species = Math.random();
        if (species < 0.44) return Math.round(3700 + (Math.random() - 0.5) * 800); // Adelie
        if (species < 0.64) return Math.round(3733 + (Math.random() - 0.5) * 900); // Chinstrap
        return Math.round(5076 + (Math.random() - 0.5) * 1100); // Gentoo
      }),
      defaultBins: 20,
      xLabel: "Masa Corporal (g)",
      interpretation: "Distribución trimodal reflejando las tres especies de pingüinos con diferente masa corporal."
    },
    edad_titanic: {
      name: "Edad Pasajeros Titanic",
      description: "714 edades registradas",
      icon: Activity,
      data: Array(714).fill(0).map(() => {
        const ageGroup = Math.random();
        if (ageGroup < 0.15) return Math.round(5 + Math.random() * 10); // Niños
        if (ageGroup < 0.70) return Math.round(20 + Math.random() * 25); // Adultos jóvenes
        return Math.round(45 + Math.random() * 35); // Adultos mayores
      }),
      defaultBins: 16,
      xLabel: "Edad (años)",
      interpretation: "Distribución sesgada a la derecha con pico en adultos jóvenes (25-30 años). Notable presencia de niños y ancianos."
    }
  };

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
    },
    purple: {
      name: "Púrpura",
      colors: ['#9333ea', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff', '#7c3aed', '#6d28d9', '#5b21b6']
    }
  };

  const BACKGROUNDS = {
    white: { name: "Blanco", color: "#ffffff" },
    light: { name: "Gris Claro", color: "#f8fafc" },
    cream: { name: "Crema", color: "#fefce8" },
    slate: { name: "Pizarra", color: "#f1f5f9" }
  };

  useEffect(() => {
    setSelectedDataset('');
    setUploadedFile(null);
    setRawData([]);
    setNumericColumns([]);
    setSelectedColumn('');
    setChartTitle('');
    setXLabel('');
    setYLabel('Frecuencia');
    setNumBins(10);
    setBinMethod('equal');
    setShowCumulative(false);
    setShowNormalCurve(false);
    setShowTable(false);
    setShowOutliers(false);
    setChartKey(prev => prev + 1);
  }, [activeTab]);

  // Calcular curva normal
  const normalDistribution = (x, mean, stdDev) => {
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
    return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
  };

  // Método de Sturges para bins
  const calculateSturgesBins = (n) => {
    return Math.ceil(1 + 3.322 * Math.log10(n));
  };

  // Detectar outliers (IQR method)
  const detectOutliers = (data) => {
    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;
    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return data.filter(val => val < lowerBound || val > upperBound);
  };

  const calculateHistogram = (data, bins, method = 'equal') => {
    if (!data || data.length === 0) return [];

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;

    let actualBins = bins;
    if (method === 'sturges') {
      actualBins = calculateSturgesBins(data.length);
    }

    const binWidth = range / actualBins;

    const histogram = Array(actualBins).fill(0).map((_, i) => ({
      binStart: min + (i * binWidth),
      binEnd: min + ((i + 1) * binWidth),
      binCenter: min + (i * binWidth) + (binWidth / 2),
      frequency: 0
    }));

    data.forEach(value => {
      let binIndex = Math.floor((value - min) / binWidth);
      if (binIndex >= actualBins) binIndex = actualBins - 1;
      if (binIndex < 0) binIndex = 0;
      histogram[binIndex].frequency++;
    });

    let cumulative = 0;
    const total = data.length;

    return histogram.map(bin => {
      cumulative += bin.frequency;
      return {
        ...bin,
        density: (bin.frequency / (total * binWidth)).toFixed(4),
        percentage: ((bin.frequency / total) * 100).toFixed(1),
        cumulative: ((cumulative / total) * 100).toFixed(1),
        label: `${bin.binStart.toFixed(1)}-${bin.binEnd.toFixed(1)}`
      };
    });
  };

  const getActiveData = () => {
    if (selectedDataset && DATASETS[selectedDataset]) {
      return DATASETS[selectedDataset].data;
    }

    if (selectedColumn && rawData.length > 0) {
      return rawData
        .map(row => parseFloat(row[selectedColumn]))
        .filter(val => !isNaN(val) && isFinite(val));
    }

    return [];
  };

  const getStats = (data) => {
    if (!data || data.length === 0) return null;

    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    const min = sorted[0];
    const max = sorted[n - 1];
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];

    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;

    // Skewness (sesgo)
    const skewness = data.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 3), 0) / n;

    // Kurtosis (curtosis)
    const kurtosis = data.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 4), 0) / n - 3;

    const outliers = detectOutliers(data);

    return {
      n,
      min: min.toFixed(2),
      max: max.toFixed(2),
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      stdDev: stdDev.toFixed(2),
      range: (max - min).toFixed(2),
      q1: q1.toFixed(2),
      q3: q3.toFixed(2),
      iqr: iqr.toFixed(2),
      skewness: skewness.toFixed(3),
      kurtosis: kurtosis.toFixed(3),
      outliers: outliers.length,
      cv: ((stdDev / mean) * 100).toFixed(2) // Coeficiente de variación
    };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'csv' || fileExtension === 'tsv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        delimiter: fileExtension === 'tsv' ? '\t' : ',',
        complete: (results) => {
          setRawData(results.data);

          const firstRow = results.data[0];
          const numeric = Object.keys(firstRow).filter(key => {
            const values = results.data.map(row => row[key]).filter(v => v != null);
            return values.every(v => !isNaN(parseFloat(v)) && isFinite(parseFloat(v)));
          });

          setNumericColumns(numeric);
          setSelectedColumn('');
          setChartTitle(file.name.replace(/\.(csv|tsv)$/i, ''));
        }
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          setRawData(jsonData);

          const firstRow = jsonData[0];
          const numeric = Object.keys(firstRow).filter(key => {
            const values = jsonData.map(row => row[key]).filter(v => v != null);
            return values.every(v => !isNaN(parseFloat(v)) && isFinite(parseFloat(v)));
          });

          setNumericColumns(numeric);
          setSelectedColumn('');
          setChartTitle(file.name.replace(/\.(xlsx|xls)$/i, ''));
        } catch (error) {
          console.error('Error leyendo Excel:', error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileExtension === 'json') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const jsonData = JSON.parse(evt.target.result);
          const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];

          setRawData(dataArray);

          const firstRow = dataArray[0];
          const numeric = Object.keys(firstRow).filter(key => {
            const values = dataArray.map(row => row[key]).filter(v => v != null);
            return values.every(v => !isNaN(parseFloat(v)) && isFinite(parseFloat(v)));
          });

          setNumericColumns(numeric);
          setSelectedColumn('');
          setChartTitle(file.name.replace('.json', ''));
        } catch (error) {
          console.error('Error leyendo JSON:', error);
        }
      };
      reader.readAsText(file);
    }
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
      link.download = `${chartTitle || 'histograma'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
          <p className="text-white font-semibold text-xs mb-1">
            Intervalo: {data.label}
          </p>
          <p className="text-blue-400 font-bold text-sm">
            Frecuencia: {data.frequency}
          </p>
          <p className="text-green-400 text-xs">
            Porcentaje: {data.percentage}%
          </p>
          {showCumulative && (
            <p className="text-purple-400 text-xs">
              Acumulado: {data.cumulative}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const data = getActiveData();

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-slate-400">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="font-semibold text-lg">No hay datos para visualizar</p>
            <p className="text-sm mt-2 text-slate-500">
              {activeTab === 'upload'
                ? 'Sube un archivo (CSV, Excel o JSON) y selecciona una columna numérica'
                : 'Selecciona un dataset para comenzar'}
            </p>
          </div>
        </div>
      );
    }

    const histogram = calculateHistogram(data, numBins, binMethod);
    const stats = getStats(data);
    const currentColors = PALETTES[colorPalette].colors;
    const bgColor = BACKGROUNDS[backgroundColor].color;
    const isLight = ['white', 'light', 'cream', 'slate'].includes(backgroundColor);
    const textColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? 'rgba(71, 85, 105, 0.2)' : 'rgba(148, 163, 184, 0.2)';

    // Calcular curva normal si está activada
    let normalCurveData = [];
    if (showNormalCurve && stats) {
      const mean = parseFloat(stats.mean);
      const stdDev = parseFloat(stats.stdDev);
      const binWidth = histogram[0].binEnd - histogram[0].binStart;
      const scaleFactor = data.length * binWidth;

      normalCurveData = histogram.map(bin => ({
        ...bin,
        normal: normalDistribution(bin.binCenter, mean, stdDev) * scaleFactor
      }));
    }

    const chartData = showNormalCurve ? normalCurveData : histogram;

    return (
      <div key={chartKey} ref={chartRef} style={{ backgroundColor: bgColor }} className="rounded-xl p-6">
        {chartTitle && (
          <h3 className="text-center font-bold text-lg mb-4" style={{ color: isLight ? '#1e293b' : '#e2e8f0' }}>
            {chartTitle}
          </h3>
        )}

        <ResponsiveContainer width="100%" height={450}>
          {showCumulative ? (
            <ComposedChart data={chartData} margin={{ top: 20, right: 60, left: 60, bottom: 80 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} strokeWidth={1.5} />}

              <XAxis
                dataKey="label"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fill: textColor, fontSize: 10, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              >
                {xLabel && (
                  <Label
                    value={xLabel}
                    position="insideBottom"
                    offset={-20}
                    style={{ fill: isLight ? '#1e293b' : '#cbd5e1', fontWeight: 700, fontSize: 12 }}
                  />
                )}
              </XAxis>

              <YAxis
                yAxisId="left"
                tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              >
                <Label
                  value="Frecuencia"
                  angle={-90}
                  position="insideLeft"
                  style={{ fill: isLight ? '#1e293b' : '#cbd5e1', fontWeight: 700, fontSize: 12, textAnchor: 'middle' }}
                />
              </YAxis>

              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              >
                <Label
                  value="% Acumulado"
                  angle={-90}
                  position="insideRight"
                  style={{ fill: isLight ? '#1e293b' : '#cbd5e1', fontWeight: 700, fontSize: 12, textAnchor: 'middle' }}
                />
              </YAxis>

              <Tooltip content={<CustomTooltip />} />

              <Bar yAxisId="left" dataKey="frequency" radius={[8, 8, 0, 0]} maxBarSize={60}>
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={currentColors[idx % currentColors.length]} />
                ))}
              </Bar>

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulative"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4, fill: '#ef4444' }}
              />

              {stats && (
                <>
                  <ReferenceLine yAxisId="left" y={parseFloat(stats.mean)} stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" label={{ value: `Media: ${stats.mean}`, fill: '#10b981', fontSize: 11, fontWeight: 700 }} />
                  <ReferenceLine yAxisId="left" y={parseFloat(stats.median)} stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" label={{ value: `Mediana: ${stats.median}`, fill: '#3b82f6', fontSize: 11, fontWeight: 700 }} />
                </>
              )}
            </ComposedChart>
          ) : (
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} strokeWidth={1.5} />}

              <XAxis
                dataKey="label"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fill: textColor, fontSize: 10, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              >
                {xLabel && (
                  <Label
                    value={xLabel}
                    position="insideBottom"
                    offset={-20}
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

              <Bar
                dataKey="frequency"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              >
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={currentColors[idx % currentColors.length]} />
                ))}
              </Bar>

              {showNormalCurve && (
                <Line
                  type="monotone"
                  dataKey="normal"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={false}
                />
              )}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  const renderFrequencyTable = () => {
    const data = getActiveData();
    if (data.length === 0) return null;

    const histogram = calculateHistogram(data, numBins, binMethod);
    const total = data.length;

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-3 font-bold text-slate-300">Intervalo</th>
              <th className="text-center p-3 font-bold text-slate-300">Marca de Clase</th>
              <th className="text-right p-3 font-bold text-slate-300">Frecuencia</th>
              <th className="text-right p-3 font-bold text-slate-300">Porcentaje</th>
              <th className="text-right p-3 font-bold text-slate-300">% Acumulado</th>
            </tr>
          </thead>
          <tbody>
            {histogram.map((bin, idx) => (
              <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/30">
                <td className="p-3 font-mono text-white">{bin.label}</td>
                <td className="text-center p-3 font-mono text-slate-300">{bin.binCenter.toFixed(1)}</td>
                <td className="text-right p-3 font-mono text-slate-300">{bin.frequency}</td>
                <td className="text-right p-3 font-mono text-slate-300">{bin.percentage}%</td>
                <td className="text-right p-3 font-mono text-blue-400">{bin.cumulative}%</td>
              </tr>
            ))}
            <tr className="border-t-2 border-slate-600 bg-slate-800/50">
              <td colSpan="2" className="p-3 font-bold text-blue-400">Total</td>
              <td className="text-right p-3 font-bold text-blue-400 font-mono">{total}</td>
              <td className="text-right p-3 font-bold text-blue-400 font-mono">100.0%</td>
              <td className="text-right p-3 font-bold text-blue-400 font-mono">100.0%</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderIntroTab = () => (
    <div className="space-y-8">
      <section className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 border-l-4 border-l-purple-500">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 shrink-0">
            <BarChart3 className="w-8 h-8 text-purple-400" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
              ¿Qué es un Histograma?
            </h2>
            <p className="text-slate-400 leading-relaxed max-w-3xl font-medium">
              Un histograma es un gráfico de barras que muestra la <strong className="text-white">distribución de frecuencias</strong> de
              una variable cuantitativa continua. A diferencia de un gráfico de barras simple, agrupa los valores en intervalos
              (llamados <strong className="text-white">bins</strong> o <strong className="text-white">clases</strong>).
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
            <h3 className="text-lg font-black text-white">Características Principales</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="p-3 bg-slate-800/30 rounded-lg">
              <h4 className="font-bold text-blue-400 mb-1">Eje X (horizontal)</h4>
              <p className="text-slate-300">Representa los intervalos de valores (bins)</p>
            </div>

            <div className="p-3 bg-slate-800/30 rounded-lg">
              <h4 className="font-bold text-green-400 mb-1">Eje Y (vertical)</h4>
              <p className="text-slate-300">Representa la frecuencia de cada intervalo</p>
            </div>

            <div className="p-3 bg-slate-800/30 rounded-lg">
              <h4 className="font-bold text-purple-400 mb-1">Barras juntas</h4>
              <p className="text-slate-300">Sin espacios, porque representan valores continuos</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-black text-white">¿Cuándo Usar Histogramas?</h3>
          </div>

          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></div>
              <span>Analizar la distribución de datos continuos</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></div>
              <span>Identificar patrones, tendencias o valores atípicos</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></div>
              <span>Comparar distribuciones entre grupos</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-2 shrink-0"></div>
              <span>Verificar si los datos siguen una distribución normal</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-black text-white mb-4">Conceptos Clave</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-800/30 rounded-lg">
            <h4 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Bins (Clases)
            </h4>
            <p className="text-sm text-slate-300">
              Intervalos en los que se agrupan los datos. El número de bins afecta
              la visualización: pocos bins = menos detalle, muchos bins = más ruido.
            </p>
          </div>

          <div className="p-4 bg-slate-800/30 rounded-lg">
            <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Marca de Clase
            </h4>
            <p className="text-sm text-slate-300">
              Es el punto medio de cada intervalo, calculado como (límite inferior + límite superior) / 2.
            </p>
          </div>

          <div className="p-4 bg-slate-800/30 rounded-lg">
            <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Frecuencia Acumulada
            </h4>
            <p className="text-sm text-slate-300">
              Suma de las frecuencias hasta un determinado intervalo. Útil para
              identificar percentiles y medianas.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-6">
        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-yellow-400" />
          Formas de Distribución
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <h4 className="font-bold text-green-400 mb-2">Normal (Campana)</h4>
            <p className="text-sm text-slate-300">Simétrica, la mayoría de datos cerca de la media. Típica en fenómenos naturales.</p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <h4 className="font-bold text-blue-400 mb-2">Sesgada a la Derecha</h4>
            <p className="text-sm text-slate-300">Cola larga hacia la derecha. Común en ingresos, edades de muerte.</p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <h4 className="font-bold text-purple-400 mb-2">Sesgada a la Izquierda</h4>
            <p className="text-sm text-slate-300">Cola larga hacia la izquierda. Calificaciones en exámenes fáciles.</p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <h4 className="font-bold text-orange-400 mb-2">Bimodal/Multimodal</h4>
            <p className="text-sm text-slate-300">Dos o más picos. Indica mezcla de poblaciones diferentes.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBasicsTab = () => {
    const hasData = selectedDataset && DATASETS[selectedDataset];
    const data = getActiveData();
    const stats = getStats(data);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              Datasets
            </h3>

            <div className="space-y-3">
              {Object.entries(DATASETS).map(([key, ds]) => {
                const IconComponent = ds.icon;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedDataset(key);
                      setNumBins(ds.defaultBins);
                      setChartTitle(ds.name);
                      setXLabel(ds.xLabel);
                      setYLabel('Frecuencia');
                      setChartKey(prev => prev + 1);
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
                        <div className="font-bold text-white text-sm">{ds.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{ds.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {hasData && (
            <>
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  Configuración
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Método de Intervalos
                    </label>
                    <select
                      value={binMethod}
                      onChange={(e) => {
                        setBinMethod(e.target.value);
                        setChartKey(prev => prev + 1);
                      }}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="equal">Intervalos Iguales</option>
                      <option value="sturges">Regla de Sturges</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Número de Intervalos</span>
                      <span className="text-purple-400 text-sm">
                        {binMethod === 'sturges' ? calculateSturgesBins(data.length) : numBins}
                      </span>
                    </label>
                    {binMethod === 'equal' && (
                      <>
                        <input
                          type="range"
                          min="5"
                          max="30"
                          value={numBins}
                          onChange={(e) => {
                            setNumBins(parseInt(e.target.value));
                            setChartKey(prev => prev + 1);
                          }}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>5</span>
                          <span>30</span>
                        </div>
                      </>
                    )}
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

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-all">
                      <input
                        type="checkbox"
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                        className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm font-semibold text-white">Mostrar cuadrícula</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-all">
                      <input
                        type="checkbox"
                        checked={showCumulative}
                        onChange={(e) => {
                          setShowCumulative(e.target.checked);
                          if (e.target.checked) setShowNormalCurve(false);
                          setChartKey(prev => prev + 1);
                        }}
                        className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm font-semibold text-white">Curva acumulada</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-all">
                      <input
                        type="checkbox"
                        checked={showNormalCurve}
                        onChange={(e) => {
                          setShowNormalCurve(e.target.checked);
                          if (e.target.checked) setShowCumulative(false);
                          setChartKey(prev => prev + 1);
                        }}
                        className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm font-semibold text-white">Curva normal teórica</span>
                    </label>
                  </div>
                </div>
              </div>

              {stats && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                  <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    Estadísticas Avanzadas
                  </h3>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">N</div>
                        <div className="text-xl font-black text-white">{stats.n}</div>
                      </div>

                      <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Rango</div>
                        <div className="text-xl font-black text-white">{stats.range}</div>
                      </div>

                      <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Media</div>
                        <div className="text-xl font-black text-blue-400">{stats.mean}</div>
                      </div>

                      <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Mediana</div>
                        <div className="text-xl font-black text-green-400">{stats.median}</div>
                      </div>

                      <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Desv. Est.</div>
                        <div className="text-xl font-black text-orange-400">{stats.stdDev}</div>
                      </div>

                      <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">CV (%)</div>
                        <div className="text-xl font-black text-purple-400">{stats.cv}%</div>
                      </div>

                      <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Q1</div>
                        <div className="text-xl font-black text-cyan-400">{stats.q1}</div>
                      </div>

                      <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Q3</div>
                        <div className="text-xl font-black text-pink-400">{stats.q3}</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-3 rounded-xl border border-purple-500/20">
                      <div className="text-xs text-slate-400 uppercase font-bold mb-2">Forma de Distribución</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400">Sesgo: </span>
                          <span className={`font-bold ${Math.abs(parseFloat(stats.skewness)) < 0.5 ? 'text-green-400' :
                            parseFloat(stats.skewness) > 0 ? 'text-orange-400' : 'text-blue-400'
                            }`}>
                            {parseFloat(stats.skewness) > 0.5 ? 'Derecha' :
                              parseFloat(stats.skewness) < -0.5 ? 'Izquierda' : 'Simétrica'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Curtosis: </span>
                          <span className={`font-bold ${Math.abs(parseFloat(stats.kurtosis)) < 1 ? 'text-green-400' :
                            parseFloat(stats.kurtosis) > 0 ? 'text-purple-400' : 'text-blue-400'
                            }`}>
                            {parseFloat(stats.kurtosis) > 1 ? 'Leptocúrtica' :
                              parseFloat(stats.kurtosis) < -1 ? 'Platicúrtica' : 'Normal'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {stats.outliers > 0 && (
                      <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-xl">
                        <div className="text-xs text-red-400 uppercase font-bold mb-1">Valores Atípicos</div>
                        <div className="text-lg font-black text-red-400">{stats.outliers} detectados</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Eye className="w-6 h-6 text-purple-400" />
                Histograma Interactivo
              </h3>
              {hasData && (
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

            {hasData && DATASETS[selectedDataset] && (
              <div className="mt-6 p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white mb-2 text-sm">Interpretación Estadística</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {DATASETS[selectedDataset].interpretation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {hasData && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-6 h-6 text-purple-400" />
                  Tabla de Distribución de Frecuencias
                </h3>
                <button
                  onClick={() => setShowTable(!showTable)}
                  className="text-sm font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-2"
                >
                  {showTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {showTable ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>

              {showTable && renderFrequencyTable()}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUploadTab = () => {
    const hasData = selectedColumn && rawData.length > 0;
    const data = getActiveData();
    const stats = getStats(data);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-orange-400" />
              Tus Datos
            </h3>

            <div className="space-y-4">
              <input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls,.json,.tsv"
                onChange={handleFileUpload}
                className="hidden"
              />

              <label
                htmlFor="file-upload"
                className="block w-full"
              >
                <div className="w-full px-4 py-3 rounded-lg bg-orange-500/20 text-orange-300 font-bold text-sm cursor-pointer hover:bg-orange-500/30 transition-all text-center border-2 border-dashed border-orange-500/40 hover:border-orange-500/60">
                  📁 Seleccionar archivo
                </div>
              </label>

              <div className="text-xs text-slate-400 text-center">
                Formatos: CSV, TSV, Excel (.xlsx, .xls), JSON
              </div>

              {uploadedFile && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400 flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="font-semibold truncate">{uploadedFile.name}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {rawData.length} filas · {numericColumns.length} columnas numéricas
                  </p>
                </div>
              )}
            </div>

            {numericColumns.length > 0 && (
              <div className="mt-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Columna Numérica
                </label>
                <select
                  value={selectedColumn}
                  onChange={(e) => {
                    setSelectedColumn(e.target.value);
                    setXLabel(e.target.value);
                    setChartKey(prev => prev + 1);
                  }}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Selecciona...</option>
                  {numericColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {hasData && (
            <>
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-400" />
                  Configuración
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Método de Intervalos
                    </label>
                    <select
                      value={binMethod}
                      onChange={(e) => {
                        setBinMethod(e.target.value);
                        setChartKey(prev => prev + 1);
                      }}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                    >
                      <option value="equal">Intervalos Iguales</option>
                      <option value="sturges">Regla de Sturges</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Número de Intervalos</span>
                      <span className="text-orange-400 text-sm">
                        {binMethod === 'sturges' ? calculateSturgesBins(data.length) : numBins}
                      </span>
                    </label>
                    {binMethod === 'equal' && (
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={numBins}
                        onChange={(e) => {
                          setNumBins(parseInt(e.target.value));
                          setChartKey(prev => prev + 1);
                        }}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Paleta
                    </label>
                    <select
                      value={colorPalette}
                      onChange={(e) => setColorPalette(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
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
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                    >
                      {Object.entries(BACKGROUNDS).map(([key, bg]) => (
                        <option key={key} value={key}>{bg.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-all">
                      <input
                        type="checkbox"
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm font-semibold text-white">Mostrar cuadrícula</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-all">
                      <input
                        type="checkbox"
                        checked={showCumulative}
                        onChange={(e) => {
                          setShowCumulative(e.target.checked);
                          if (e.target.checked) setShowNormalCurve(false);
                          setChartKey(prev => prev + 1);
                        }}
                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm font-semibold text-white">Curva acumulada</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-all">
                      <input
                        type="checkbox"
                        checked={showNormalCurve}
                        onChange={(e) => {
                          setShowNormalCurve(e.target.checked);
                          if (e.target.checked) setShowCumulative(false);
                          setChartKey(prev => prev + 1);
                        }}
                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm font-semibold text-white">Curva normal</span>
                    </label>
                  </div>
                </div>
              </div>

              {stats && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                  <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-400" />
                    Estadísticas
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/30 p-3 rounded-xl">
                      <div className="text-xs text-slate-400 uppercase font-bold mb-1">N</div>
                      <div className="text-xl font-black text-white">{stats.n}</div>
                    </div>

                    <div className="bg-slate-800/30 p-3 rounded-xl">
                      <div className="text-xs text-slate-400 uppercase font-bold mb-1">Media</div>
                      <div className="text-xl font-black text-blue-400">{stats.mean}</div>
                    </div>

                    <div className="bg-slate-800/30 p-3 rounded-xl">
                      <div className="text-xs text-slate-400 uppercase font-bold mb-1">Mediana</div>
                      <div className="text-xl font-black text-green-400">{stats.median}</div>
                    </div>

                    <div className="bg-slate-800/30 p-3 rounded-xl">
                      <div className="text-xs text-slate-400 uppercase font-bold mb-1">Desv. Est.</div>
                      <div className="text-xl font-black text-orange-400">{stats.stdDev}</div>
                    </div>
                  </div>

                  {stats.outliers > 0 && (
                    <div className="mt-3 bg-red-900/20 border border-red-500/30 p-3 rounded-xl">
                      <div className="text-xs text-red-400 uppercase font-bold mb-1">⚠️ Outliers</div>
                      <div className="text-lg font-black text-red-400">{stats.outliers} detectados</div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Eye className="w-6 h-6 text-orange-400" />
                Tu Histograma
              </h3>
              {hasData && (
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
          </div>

          {hasData && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-6 h-6 text-orange-400" />
                  Tabla de Frecuencias
                </h3>
                <button
                  onClick={() => setShowTable(!showTable)}
                  className="text-sm font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-2"
                >
                  {showTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {showTable ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>

              {showTable && renderFrequencyTable()}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '4s' }}></div>
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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10"></div>
                <BarChart3 className="w-7 h-7 text-white relative z-10" />
              </div>
              <div>
                <span className="text-xs text-purple-400 font-bold block uppercase tracking-wider">
                  Capítulo 2
                </span>
                <span className="font-black tracking-tight text-white block text-sm">
                  Histogramas
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
              <span className="text-xs text-purple-400 font-black uppercase tracking-wider">Lab 2.4</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8 relative">
        <section className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 border-l-4 border-l-purple-500 relative overflow-hidden">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <BarChart3 className="w-64 h-64 text-purple-400" />
          </div>

          <div className="flex items-start gap-6 relative z-10">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 shrink-0">
              <Sliders className="w-8 h-8 text-purple-400" />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-black text-purple-500 uppercase tracking-wider bg-purple-500/10 px-3 py-1 rounded-full">
                  Sección 2.4
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
                2.4 Histogramas
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-3xl font-medium">
                Visualiza la distribución de frecuencias de variables continuas. Descubre patrones,
                identifica la forma de la distribución y comprende cómo se agrupan tus datos.
              </p>
            </div>
          </div>
        </section>

        <div className="flex gap-3 border-b border-white/10 pb-4 flex-wrap">
          {[
            { id: 'intro', label: 'Introducción', icon: Info },
            { id: 'basics', label: 'Ejemplos Avanzados', icon: BarChart3 },
            { id: 'upload', label: 'Tus Datos', icon: Upload }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === tab.id
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'intro' && renderIntroTab()}
        {activeTab === 'basics' && renderBasicsTab()}
        {activeTab === 'upload' && renderUploadTab()}
      </main>
    </div>
  );
};

export default Lab2_4_Enhanced;