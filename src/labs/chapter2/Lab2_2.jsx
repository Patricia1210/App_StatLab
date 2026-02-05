import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, BarChart3, Upload, Download, Eye,
  Database, TrendingUp, Target, Lightbulb,
  Info, FileSpreadsheet, Activity, BookOpen, PieChart,
  Layers, LayoutGrid, AlertCircle, Palette, Settings,
  ChevronDown, ChevronUp, Table as TableIcon, Flame,
  Grid, BarChart2, Square, Circle
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, PieChart as RechartsPieChart, Pie, Legend,
  Label, ComposedChart, Line, LabelList
} from "recharts";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const Lab2_2 = ({ goHome, setView }) => {
  const [activeTab, setActiveTab] = useState('basicos');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedData, setUploadedData] = useState([]);
  const [uploadedColumns, setUploadedColumns] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const chartRef = useRef(null);

  // ============================================
  // NUEVO: Key única para forzar remontaje del gráfico
  // ============================================
  const [chartKey, setChartKey] = useState(0);

  const [config, setConfig] = useState({
    chartType: 'bar',
    showPercentage: false,
    sortOrder: 'none',
    colorPalette: 'modern',
    selectedVariable: '',
    selectedVariable2: '',
    variableMode: '1var',
    showGrid: true,
    showValues: true,
    backgroundColor: 'white',
    chartTitle: '',
    xAxisLabel: '',
    yAxisLabel: 'Frecuencia',
    pieType: 'pie'
  });

  const datasets = {
    colores: {
      name: "Color Favorito",
      description: "Encuesta a 100 personas sobre su color favorito",
      icon: Palette,
      data: [
        { categoria: "Azul", frecuencia: 30 },
        { categoria: "Rojo", frecuencia: 25 },
        { categoria: "Verde", frecuencia: 20 },
        { categoria: "Amarillo", frecuencia: 15 },
        { categoria: "Otros", frecuencia: 10 }
      ]
    },
    educacion: {
      name: "Calificación Educación",
      description: "400 administradores califican educación en EE.UU.",
      icon: BookOpen,
      data: [
        { categoria: "A", frecuencia: 35 },
        { categoria: "B", frecuencia: 260 },
        { categoria: "C", frecuencia: 93 },
        { categoria: "D", frecuencia: 12 }
      ]
    },
    titanic_clase: {
      name: "Titanic - Clase",
      description: "Distribución de pasajeros por clase",
      icon: Layers,
      data: [
        { categoria: "1ra Clase", frecuencia: 216 },
        { categoria: "2da Clase", frecuencia: 184 },
        { categoria: "3ra Clase", frecuencia: 491 }
      ]
    },
    titanic_embarque: {
      name: "Titanic - Embarque",
      description: "Puerto de embarque de pasajeros",
      icon: Target,
      data: [
        { categoria: "Southampton", frecuencia: 644 },
        { categoria: "Cherbourg", frecuencia: 168 },
        { categoria: "Queenstown", frecuencia: 77 }
      ]
    },
    penguins: {
      name: "Pingüinos - Especies",
      description: "Distribución de especies Palmer",
      icon: Database,
      data: [
        { categoria: "Adelie", frecuencia: 152 },
        { categoria: "Chinstrap", frecuencia: 68 },
        { categoria: "Gentoo", frecuencia: 124 }
      ]
    },
    iris: {
      name: "Iris - Especies",
      description: "Frecuencia de especies de flores",
      icon: Activity,
      data: [
        { categoria: "Setosa", frecuencia: 50 },
        { categoria: "Versicolor", frecuencia: 50 },
        { categoria: "Virginica", frecuencia: 50 }
      ]
    },
    tips_dias: {
      name: "Propinas - Días",
      description: "Propinas por día de la semana",
      icon: TrendingUp,
      data: [
        { categoria: "Jueves", frecuencia: 62 },
        { categoria: "Viernes", frecuencia: 19 },
        { categoria: "Sábado", frecuencia: 87 },
        { categoria: "Domingo", frecuencia: 76 }
      ]
    }
  };

  const advancedDatasets = {
    tips_sexo_dia: {
      name: "Propinas - Sexo por Día",
      description: "Distribución de propinas por género y día",
      icon: BarChart2,
      type: "grouped",
      data: [
        { dia: "Jueves", Hombre: 30, Mujer: 32 },
        { dia: "Viernes", Hombre: 10, Mujer: 9 },
        { dia: "Sábado", Hombre: 45, Mujer: 42 },
        { dia: "Domingo", Hombre: 38, Mujer: 38 }
      ],
      categories: ["Hombre", "Mujer"]
    },
    tips_sexo_dia_apilado: {
      name: "Propinas - Sexo por Día (Apilado)",
      description: "Composición de propinas por género",
      icon: Layers,
      type: "stacked",
      data: [
        { dia: "Jueves", Hombre: 30, Mujer: 32 },
        { dia: "Viernes", Hombre: 10, Mujer: 9 },
        { dia: "Sábado", Hombre: 45, Mujer: 42 },
        { dia: "Domingo", Hombre: 38, Mujer: 38 }
      ],
      categories: ["Hombre", "Mujer"]
    },
    penguins_isla: {
      name: "Pingüinos - Especie por Isla",
      description: "Distribución de especies en islas",
      icon: Grid,
      type: "stacked",
      data: [
        { isla: "Biscoe", Adelie: 44, Chinstrap: 0, Gentoo: 124 },
        { isla: "Dream", Adelie: 56, Chinstrap: 68, Gentoo: 0 },
        { isla: "Torgersen", Adelie: 52, Chinstrap: 0, Gentoo: 0 }
      ],
      categories: ["Adelie", "Chinstrap", "Gentoo"]
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
      colors: ['#f59e0b', '#f97316', '#ef4444', '#dc2626', '#991b1b', '#fbbf24', '#fb923c', '#fca5a5']
    },
    professional: {
      name: "Profesional",
      colors: ['#1e40af', '#7c3aed', '#be123c', '#ca8a04', '#15803d', '#0e7490', '#9333ea', '#dc2626']
    }
  };

  const BACKGROUNDS = {
    white: { name: "Blanco", color: "#ffffff" },
    light: { name: "Gris Claro", color: "#f8fafc" },
    cream: { name: "Crema", color: "#fefce8" },
    slate: { name: "Pizarra", color: "#f1f5f9" }
  };

  // ============================================
  // NUEVO: RESET COMPLETO AL CAMBIAR DE PESTAÑA
  // ============================================
  useEffect(() => {
    // Resetear todos los estados
    setSelectedDataset('');
    setUploadedFile(null);
    setUploadedData([]);
    setUploadedColumns([]);
    setShowTable(false);

    // Resetear configuración a valores por defecto
    setConfig({
      chartType: 'bar',
      showPercentage: false,
      sortOrder: 'none',
      colorPalette: 'modern',
      selectedVariable: '',
      selectedVariable2: '',
      variableMode: '1var',
      showGrid: true,
      showValues: true,
      backgroundColor: 'white',
      chartTitle: '',
      xAxisLabel: '',
      yAxisLabel: 'Frecuencia',
      pieType: 'pie'
    });

    // Incrementar key para forzar remontaje del gráfico
    setChartKey(prev => prev + 1);
  }, [activeTab]);

  // Auto-generar título (solo cuando hay datos)
  useEffect(() => {
    if (!config.chartTitle && (selectedDataset || config.selectedVariable)) {
      if (activeTab === 'upload' && config.selectedVariable) {
        setConfig(prev => ({
          ...prev,
          chartTitle: prev.variableMode === '2var' && prev.selectedVariable2
            ? `${prev.selectedVariable} por ${prev.selectedVariable2}`
            : `Distribución de ${prev.selectedVariable}`,
          xAxisLabel: prev.variableMode === '2var' && prev.selectedVariable2 ? prev.selectedVariable2 : prev.selectedVariable
        }));
      } else if (activeTab === 'avanzados' && advancedDatasets[selectedDataset]) {
        setConfig(prev => ({
          ...prev,
          chartTitle: advancedDatasets[selectedDataset].name,
          xAxisLabel: advancedDatasets[selectedDataset].name.includes("Pingüinos") ? "Isla" : "Día"
        }));
      } else if (datasets[selectedDataset]) {
        setConfig(prev => ({
          ...prev,
          chartTitle: datasets[selectedDataset].name,
          xAxisLabel: datasets[selectedDataset].name.split(' - ')[0]
        }));
      }
    }
  }, [selectedDataset, config.selectedVariable, config.selectedVariable2, config.variableMode, activeTab, config.chartTitle]);

  // Actualizar yAxisLabel
  useEffect(() => {
    setConfig(prev => ({
      ...prev,
      yAxisLabel:
        prev.chartType === 'stacked100' ? 'Porcentaje (%)'
          : prev.showPercentage ? 'Porcentaje (%)'
            : 'Frecuencia'
    }));
  }, [config.showPercentage, config.chartType]);

  // Función para datos de Pareto (SIN CAMBIOS - MANTENER EXACTAMENTE IGUAL)
  const getParetoData = (chartDataRaw) => {
    if (!chartDataRaw || chartDataRaw.length === 0) return [];

    const base = chartDataRaw.map(d => ({
      categoria: d.categoria,
      frecuencia: Number(d.frecuencia ?? d.value ?? 0)
    }));

    base.sort((a, b) => b.frecuencia - a.frecuencia);

    const total = base.reduce((s, d) => s + d.frecuencia, 0) || 1;

    let acum = 0;
    return base.map(d => {
      acum += d.frecuencia;
      return {
        ...d,
        porcentaje: Number(((d.frecuencia / total) * 100).toFixed(1)),
        acumulado: Number(((acum / total) * 100).toFixed(1))
      };
    });
  };

  // Construir matriz de contingencia para heatmap
  const buildContingencyMatrix = () => {
    if (!uploadedData.length || !config.selectedVariable || !config.selectedVariable2) return null;

    const rowKey = config.selectedVariable;
    const colKey = config.selectedVariable2;

    const rowsSet = new Set();
    const colsSet = new Set();
    const counts = {};

    uploadedData.forEach(r => {
      const a = r[rowKey];
      const b = r[colKey];
      if (a === null || a === undefined || a === '') return;
      if (b === null || b === undefined || b === '') return;

      const ra = String(a);
      const cb = String(b);

      rowsSet.add(ra);
      colsSet.add(cb);

      if (!counts[ra]) counts[ra] = {};
      counts[ra][cb] = (counts[ra][cb] || 0) + 1;
    });

    const rows = Array.from(rowsSet);
    const cols = Array.from(colsSet);

    let max = 0;
    rows.forEach(rw => cols.forEach(cl => {
      max = Math.max(max, counts[rw]?.[cl] || 0);
    }));

    return { rows, cols, counts, max };
  };

  // Procesar datos para gráficos
  const getChartData = () => {
    if (activeTab === 'avanzados' && advancedDatasets[selectedDataset]) {
      return advancedDatasets[selectedDataset].data;
    }

    if (datasets[selectedDataset]) {
      let data = [...datasets[selectedDataset].data];

      if (config.sortOrder === 'desc') {
        data.sort((a, b) => b.frecuencia - a.frecuencia);
      } else if (config.sortOrder === 'asc') {
        data.sort((a, b) => a.frecuencia - b.frecuencia);
      }

      if (config.showPercentage && config.chartType !== 'pareto') {
        const total = data.reduce((sum, item) => sum + item.frecuencia, 0);
        return data.map(item => ({
          ...item,
          value: parseFloat(((item.frecuencia / total) * 100).toFixed(1))
        }));
      }

      return data.map(item => ({ ...item, value: item.frecuencia }));
    }

    if (uploadedData.length > 0 && config.selectedVariable && config.variableMode === '1var') {
      const frequency = {};
      uploadedData.forEach(row => {
        const val = row[config.selectedVariable];
        if (val !== null && val !== undefined && val !== '') {
          frequency[val] = (frequency[val] || 0) + 1;
        }
      });

      let data = Object.entries(frequency).map(([categoria, frecuencia]) => ({
        categoria: String(categoria),
        frecuencia,
        value: frecuencia
      }));

      if (config.sortOrder === 'desc') data.sort((a, b) => b.frecuencia - a.frecuencia);
      if (config.sortOrder === 'asc') data.sort((a, b) => a.frecuencia - b.frecuencia);

      if (config.showPercentage && config.chartType !== 'pareto') {
        const total = data.reduce((sum, item) => sum + item.frecuencia, 0);
        return data.map(item => ({
          ...item,
          value: parseFloat(((item.frecuencia / total) * 100).toFixed(1))
        }));
      }

      return data;
    }

    if (uploadedData.length > 0 && config.selectedVariable && config.selectedVariable2 && config.variableMode === '2var') {
      const contingency = {};
      const categories = new Set();

      uploadedData.forEach(row => {
        const var1 = row[config.selectedVariable];
        const var2 = row[config.selectedVariable2];

        const ok1 = var1 !== null && var1 !== undefined && var1 !== '';
        const ok2 = var2 !== null && var2 !== undefined && var2 !== '';

        if (ok1 && ok2) {
          if (!contingency[var2]) contingency[var2] = {};
          contingency[var2][var1] = (contingency[var2][var1] || 0) + 1;
          categories.add(var1);
        }
      });

      const categoriesArray = Array.from(categories);
      const out = Object.entries(contingency).map(([key, values]) => ({
        [config.selectedVariable2]: key,
        ...Object.fromEntries(categoriesArray.map(cat => [cat, values[cat] || 0]))
      }));

      // Normalizar para stacked100
      if (config.chartType === 'stacked100') {
        return out.map(row => {
          const totalRow = categoriesArray.reduce((s, cat) => s + (row[cat] || 0), 0) || 1;
          const normalized = {};
          categoriesArray.forEach(cat => {
            normalized[cat] = Number((((row[cat] || 0) / totalRow) * 100).toFixed(1));
          });
          return { ...row, ...normalized };
        });
      }

      return out;
    }

    return [];
  };

  const getStats = (data) => {
    if (!data || data.length === 0) return null;

    if (config.variableMode === '2var' && activeTab === 'upload') {
      const allValues = data.flatMap(row =>
        Object.entries(row)
          .filter(([key]) => key !== config.selectedVariable2)
          .map(([_, val]) => val)
      );
      const total = allValues.reduce((sum, val) => sum + val, 0);
      return { total, count: data.length };
    }

    const total = data.reduce((sum, item) => sum + Number(item.frecuencia ?? item.value ?? 0), 0);
    const freqs = data.map(item => Number(item.frecuencia ?? item.value ?? 0));
    const max = Math.max(...freqs);
    const min = Math.min(...freqs);
    return { total, max, min, count: data.length };
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
          <p className="text-white font-semibold text-xs mb-1">
            {payload[0].payload.categoria || payload[0].payload[config.selectedVariable2] || payload[0].name}
          </p>
          {payload.map((entry, idx) => (
            <p key={idx} className="text-blue-400 font-bold text-sm">
              {entry.name && entry.name !== 'value' ? `${entry.name}: ` : ''}
              {entry.value}{entry.name === '% acumulado' || config.chartType === 'stacked100' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
        setUploadedData(results.data);
        setUploadedColumns(Object.keys(results.data[0] || {}));
        setConfig(prev => ({ ...prev, selectedVariable: '', selectedVariable2: '', chartTitle: '' }));
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
      ctx.fillStyle = BACKGROUNDS[config.backgroundColor].color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const link = document.createElement('a');
      link.download = `${config.chartTitle || 'grafico'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const renderFrequencyTable = () => {
    const data = getChartData();
    if (!data || data.length === 0) return null;

    if (config.variableMode === '2var' && activeTab === 'upload') {
      const categories = Object.keys(data[0] || {}).filter(k => k !== config.selectedVariable2);
      const rowTotals = data.map(row =>
        categories.reduce((sum, cat) => sum + (row[cat] || 0), 0)
      );
      const colTotals = categories.map(cat =>
        data.reduce((sum, row) => sum + (row[cat] || 0), 0)
      );
      const grandTotal = rowTotals.reduce((sum, val) => sum + val, 0);

      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-3 font-bold text-slate-300">{config.selectedVariable2}</th>
                {categories.map(cat => (
                  <th key={cat} className="text-right p-3 font-bold text-slate-300">{cat}</th>
                ))}
                <th className="text-right p-3 font-bold text-blue-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="p-3 font-semibold text-white">{row[config.selectedVariable2]}</td>
                  {categories.map(cat => (
                    <td key={cat} className="text-right p-3 text-slate-300 font-mono">
                      {row[cat] || 0}
                    </td>
                  ))}
                  <td className="text-right p-3 font-bold text-blue-400 font-mono">{rowTotals[idx]}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-600 bg-slate-800/50">
                <td className="p-3 font-bold text-blue-400">Total</td>
                {colTotals.map((total, idx) => (
                  <td key={idx} className="text-right p-3 font-bold text-blue-400 font-mono">{total}</td>
                ))}
                <td className="text-right p-3 font-black text-blue-400 font-mono">{grandTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    const total = data.reduce((sum, item) => sum + Number(item.frecuencia ?? item.value ?? 0), 0);

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-3 font-bold text-slate-300">Categoría</th>
              <th className="text-right p-3 font-bold text-slate-300">Frecuencia</th>
              <th className="text-right p-3 font-bold text-slate-300">Porcentaje</th>
              <th className="text-right p-3 font-bold text-slate-300">% Acumulado</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => {
              const freq = Number(item.frecuencia ?? item.value ?? 0);
              const percentage = ((freq / total) * 100).toFixed(1);

              const accumulated = data
                .slice(0, idx + 1)
                .reduce((sum, d) => sum + Number(d.frecuencia ?? d.value ?? 0), 0);

              const accPercentage = ((accumulated / total) * 100).toFixed(1);

              return (
                <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="p-3 font-semibold text-white">{item.categoria}</td>
                  <td className="text-right p-3 text-slate-300 font-mono">{freq}</td>
                  <td className="text-right p-3 text-slate-300 font-mono">{percentage}%</td>
                  <td className="text-right p-3 text-blue-400 font-mono">{accPercentage}%</td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-slate-600 bg-slate-800/50">
              <td className="p-3 font-bold text-blue-400">Total</td>
              <td className="text-right p-3 font-bold text-blue-400 font-mono">{total}</td>
              <td className="text-right p-3 font-bold text-blue-400 font-mono">100.0%</td>
              <td className="text-right p-3 font-bold text-blue-400 font-mono">100.0%</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // ========================================
  // CONTINÚA EN PARTE 2
  // ========================================// ========================================
  // CONTINUACIÓN DESDE PARTE 1
  // ========================================

  const renderChart = () => {
    const chartData = getChartData();
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

    const currentColors = PALETTES[config.colorPalette].colors;
    const bgColor = BACKGROUNDS[config.backgroundColor].color;
    const isLight = ['white', 'light', 'cream', 'slate'].includes(config.backgroundColor);
    const textColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? 'rgba(148, 163, 184, 0.35)' : 'rgba(148, 163, 184, 0.18)';

    // HEATMAP para 2 variables
    if (activeTab === 'upload' && config.variableMode === '2var' && config.chartType === 'heatmap') {
      const m = buildContingencyMatrix();
      if (!m) return null;

      const { rows, cols, counts, max } = m;

      return (
        <div key={chartKey} ref={chartRef} style={{ backgroundColor: bgColor }} className="rounded-xl p-6">
          {config.chartTitle && (
            <h3
              className="text-center font-bold text-lg mb-4"
              style={{ color: isLight ? '#1e293b' : '#e2e8f0' }}
            >
              {config.chartTitle}
            </h3>
          )}

          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div
                className="grid"
                style={{ gridTemplateColumns: `220px repeat(${cols.length}, minmax(70px, 1fr))` }}
              >
                <div className="p-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {config.selectedVariable} \ {config.selectedVariable2}
                </div>

                {cols.map(c => (
                  <div key={c} className="p-2 text-xs font-bold text-slate-300 text-center">
                    {c}
                  </div>
                ))}

                {rows.map(rw => (
                  <React.Fragment key={rw}>
                    <div className="p-2 text-xs font-semibold text-slate-200">
                      {rw}
                    </div>

                    {cols.map(cl => {
                      const v = counts[rw]?.[cl] || 0;
                      const intensity = max ? v / max : 0;
                      const alpha = 0.15 + intensity * 0.75;

                      return (
                        <div
                          key={`${rw}__${cl}`}
                          className="m-1 rounded-lg border border-white/10 flex items-center justify-center h-12"
                          style={{ backgroundColor: `rgba(59,130,246,${alpha})` }}
                          title={`${rw} / ${cl}: ${v}`}
                        >
                          <span className="text-xs font-bold text-white">{v}</span>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>

              <p className="mt-4 text-xs text-slate-400">
                Intensidad = mayor frecuencia en la celda (más oscuro = más casos).
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Gráficos avanzados (agrupado/apilado/stacked100)
    if (
      (activeTab === 'avanzados' && advancedDatasets[selectedDataset]) ||
      (activeTab === 'upload' && config.variableMode === '2var' && config.chartType !== 'heatmap')
    ) {
      const dataset = activeTab === 'avanzados'
        ? advancedDatasets[selectedDataset]
        : {
          categories: Object.keys(chartData[0] || {}).filter(k => k !== config.selectedVariable2),
          type: config.chartType === 'stacked' || config.chartType === 'stacked100' ? 'stacked' : 'grouped'
        };

      const isStacked =
        dataset.type === 'stacked' ||
        config.chartType === 'stacked' ||
        config.chartType === 'stacked100';

      const xKey = activeTab === 'avanzados'
        ? (dataset.name.includes("Pingüinos") ? "isla" : "dia")
        : config.selectedVariable2;

      return (
        <div key={chartKey} ref={chartRef} style={{ backgroundColor: bgColor }} className="rounded-xl p-6">
          {config.chartTitle && (
            <h3
              className="text-center font-bold text-lg mb-4"
              style={{ color: isLight ? '#1e293b' : '#e2e8f0' }}
            >
              {config.chartTitle}
            </h3>
          )}

          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>
              {config.showGrid && (
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              )}

              <XAxis
                dataKey={xKey}
                angle={-30}
                textAnchor="end"
                height={100}
                tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              >
                {config.xAxisLabel && (
                  <Label
                    value={config.xAxisLabel}
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
                {config.yAxisLabel && (
                  <Label
                    value={config.yAxisLabel}
                    angle={-90}
                    position="insideLeft"
                    style={{
                      fill: isLight ? '#1e293b' : '#cbd5e1',
                      fontWeight: 700,
                      fontSize: 12,
                      textAnchor: 'middle'
                    }}
                  />
                )}
              </YAxis>

              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />

              {dataset.categories.map((cat, idx) => (
                <Bar
                  key={cat}
                  dataKey={cat}
                  fill={currentColors[idx % currentColors.length]}
                  stackId={isStacked ? "a" : undefined}
                  radius={
                    isStacked
                      ? (idx === dataset.categories.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0])
                      : [8, 8, 0, 0]
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    // Gráficos simples (bar/pareto/pie/donut)
    return (
      <div key={chartKey} ref={chartRef} style={{ backgroundColor: bgColor }} className="rounded-xl p-6">
        {config.chartTitle && (
          <h3
            className="text-center font-bold text-lg mb-4"
            style={{ color: isLight ? '#1e293b' : '#e2e8f0' }}
          >
            {config.chartTitle}
          </h3>
        )}

        <ResponsiveContainer width="100%" height={450}>
          {config.chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>
              {config.showGrid && (
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              )}

              <XAxis
                dataKey="categoria"
                angle={-30}
                textAnchor="end"
                height={100}
                tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              >
                {config.xAxisLabel && (
                  <Label
                    value={config.xAxisLabel}
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
                {config.yAxisLabel && (
                  <Label
                    value={config.yAxisLabel}
                    angle={-90}
                    position="insideLeft"
                    style={{
                      fill: isLight ? '#1e293b' : '#cbd5e1',
                      fontWeight: 700,
                      fontSize: 12,
                      textAnchor: 'middle'
                    }}
                  />
                )}
              </YAxis>

              <Tooltip content={<CustomTooltip />} />

              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={60}>
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={currentColors[idx % currentColors.length]} />
                ))}

                {config.showValues && (
                  <LabelList
                    dataKey="value"
                    position="top"
                    formatter={(v) => (config.showPercentage ? `${v}%` : v)}
                    fill={isLight ? "#334155" : "#e2e8f0"}
                    fontSize={11}
                    fontWeight={700}
                  />
                )}
              </Bar>

            </BarChart>
          ) : config.chartType === 'pareto' ? (
            (() => {
              const paretoData = getParetoData(chartData);

              return (
                <ComposedChart data={paretoData} margin={{ top: 20, right: 60, left: 60, bottom: 80 }}>
                  {config.showGrid && (
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  )}

                  <XAxis
                    dataKey="categoria"
                    angle={-30}
                    textAnchor="end"
                    height={100}
                    tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  >
                    {config.xAxisLabel && (
                      <Label
                        value={config.xAxisLabel}
                        position="insideBottom"
                        offset={-15}
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
                      style={{
                        fill: isLight ? '#1e293b' : '#cbd5e1',
                        fontWeight: 700,
                        fontSize: 12,
                        textAnchor: 'middle'
                      }}
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
                      style={{
                        fill: isLight ? '#1e293b' : '#cbd5e1',
                        fontWeight: 700,
                        fontSize: 12,
                        textAnchor: 'middle'
                      }}
                    />
                  </YAxis>

                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />

                  <Bar
                    yAxisId="left"
                    dataKey="frecuencia"
                    name="Frecuencia"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  >
                    {paretoData.map((_, idx) => (
                      <Cell key={idx} fill={currentColors[idx % currentColors.length]} />
                    ))}
                  </Bar>

                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="acumulado"
                    name="% acumulado"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#ef4444' }}
                  />
                </ComposedChart>
              );
            })()
          ) : (
            <RechartsPieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="categoria"
                cx="50%"
                cy="50%"
                innerRadius={config.pieType === 'donut' ? 80 : 0}
                outerRadius={140}
                label={(entry) => `${entry.categoria}: ${entry.value}${config.showPercentage ? '%' : ''}`}
                labelLine
              >
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={currentColors[idx % currentColors.length]} />
                ))}
              </Pie>

              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} />
            </RechartsPieChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  const stats = getStats(getChartData());
  const hasData = getChartData().length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] animate-pulse"></div>
        <div
          className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px] animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/10 rounded-full blur-[150px] animate-pulse"
          style={{ animationDelay: '4s' }}
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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10"></div>
                <BarChart3 className="w-7 h-7 text-white relative z-10" />
              </div>
              <div>
                <span className="text-xs text-blue-400 font-bold block uppercase tracking-wider">
                  Capítulo 2
                </span>
                <span className="font-black tracking-tight text-white block text-sm">
                  Organización de Datos
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-xs text-blue-400 font-black uppercase tracking-wider">Lab 2.2</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8 relative">
        <section className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 border-l-4 border-l-blue-500 relative overflow-hidden">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <Target className="w-64 h-64 text-blue-400" />
          </div>

          <div className="flex items-start gap-6 relative z-10">
            <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-500/30 shrink-0">
              <PieChart className="w-8 h-8 text-blue-400" />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-black text-blue-500 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full">
                  Sección 2.2
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
                2.2 Gráficos de Datos Cualitativos
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-3xl font-medium">
                Aprende a crear visualizaciones efectivas para variables categóricas. Domina gráficos de barras, pastel,
                barras agrupadas y apiladas. Una imagen dice más que mil palabras.
              </p>
            </div>
          </div>
        </section>

        <div className="flex gap-3 border-b border-white/10 pb-4 flex-wrap">
          {[
            { id: 'basicos', label: 'Gráficos Básicos', icon: BarChart3 },
            { id: 'datasets', label: 'Datasets Clásicos', icon: Database },
            { id: 'avanzados', label: 'Gráficos Avanzados', icon: Layers },
            { id: 'decision', label: 'Guía de Selección', icon: LayoutGrid },
            { id: 'upload', label: 'Tus Datos', icon: Upload }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === tab.id
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {(activeTab === 'basicos' || activeTab === 'datasets') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  Dataset
                </h3>

                <div className="space-y-3">
                  {Object.entries(datasets)
                    .filter(([key]) => {
                      if (activeTab === 'basicos') return ['colores', 'educacion'].includes(key);
                      return !['colores', 'educacion'].includes(key);
                    })
                    .map(([key, ds]) => {
                      const IconComponent = ds.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedDataset(key);
                            setConfig(prev => ({
                              ...prev,
                              chartTitle: '',
                              xAxisLabel: '',
                              yAxisLabel: prev.showPercentage ? 'Porcentaje (%)' : 'Frecuencia'
                            }));
                          }}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedDataset === key
                            ? 'bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-500/20'
                            : 'bg-slate-800/50 border-slate-700 hover:border-blue-500/50 hover:bg-slate-800'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${selectedDataset === key ? 'bg-blue-500/30' : 'bg-slate-700/50'
                                }`}
                            >
                              <IconComponent
                                className={`w-5 h-5 ${selectedDataset === key ? 'text-blue-300' : 'text-slate-400'
                                  }`}
                              />
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

              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-400" />
                  Configuración
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Título del Gráfico
                    </label>
                    <input
                      type="text"
                      value={config.chartTitle}
                      onChange={(e) => setConfig({ ...config, chartTitle: e.target.value })}
                      placeholder="Título automático"
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Eje X
                      </label>
                      <input
                        type="text"
                        value={config.xAxisLabel}
                        onChange={(e) => setConfig({ ...config, xAxisLabel: e.target.value })}
                        placeholder="Automático"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Eje Y
                      </label>
                      <input
                        type="text"
                        value={config.yAxisLabel}
                        onChange={(e) => setConfig({ ...config, yAxisLabel: e.target.value })}
                        placeholder="Automático"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Tipo de Gráfico
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => setConfig({ ...config, chartType: 'bar' })}
                        className={`p-3 rounded-lg font-semibold text-xs transition-all flex flex-col items-center gap-1 ${config.chartType === 'bar'
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                          }`}
                      >
                        <BarChart2 className="w-5 h-5" />
                        Barras
                      </button>

                      <button
                        onClick={() => setConfig({ ...config, chartType: 'pie', pieType: 'pie' })}
                        className={`p-3 rounded-lg font-semibold text-xs transition-all flex flex-col items-center gap-1 ${config.chartType === 'pie' && config.pieType === 'pie'
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                          }`}
                      >
                        <Circle className="w-5 h-5" />
                        Pastel
                      </button>

                      <button
                        onClick={() => setConfig({ ...config, chartType: 'pie', pieType: 'donut' })}
                        className={`p-3 rounded-lg font-semibold text-xs transition-all flex flex-col items-center gap-1 ${config.chartType === 'pie' && config.pieType === 'donut'
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                          }`}
                      >
                        <Square className="w-5 h-5" />
                        Donut
                      </button>

                      <button
                        onClick={() => setConfig({ ...config, chartType: 'pareto' })}
                        className={`p-3 rounded-lg font-semibold text-xs transition-all flex flex-col items-center gap-1 ${config.chartType === 'pareto'
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                          }`}
                      >
                        <Flame className="w-5 h-5" />
                        Pareto
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Ordenar
                    </label>
                    <select
                      value={config.sortOrder}
                      onChange={(e) => setConfig({ ...config, sortOrder: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="none">Sin ordenar</option>
                      <option value="desc">Mayor a Menor</option>
                      <option value="asc">Menor a Mayor</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Paleta de Colores
                    </label>
                    <select
                      value={config.colorPalette}
                      onChange={(e) => setConfig({ ...config, colorPalette: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
                    >
                      {Object.entries(PALETTES).map(([key, pal]) => (
                        <option key={key} value={key}>
                          {pal.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-1.5 mt-3">
                      {PALETTES[config.colorPalette].colors.slice(0, 6).map((color, i) => (
                        <div key={i} className="h-7 flex-1 rounded-md shadow-sm" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Fondo
                    </label>
                    <select
                      value={config.backgroundColor}
                      onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
                    >
                      {Object.entries(BACKGROUNDS).map(([key, bg]) => (
                        <option key={key} value={key}>
                          {bg.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    {config.chartType !== 'pareto' && (
                      <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-all">
                        <input
                          type="checkbox"
                          checked={config.showPercentage}
                          onChange={(e) => setConfig({ ...config, showPercentage: e.target.checked })}
                          className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-semibold text-white">Mostrar como porcentaje</span>
                      </label>
                    )}

                    <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-all">
                      <input
                        type="checkbox"
                        checked={config.showGrid}
                        onChange={(e) => setConfig({ ...config, showGrid: e.target.checked })}
                        className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-semibold text-white">Mostrar cuadrícula</span>
                    </label>
                  </div>
                </div>
              </div>

              {stats && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                  <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Estadísticas
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                      <div className="text-xs text-slate-400 uppercase font-bold mb-1">Total</div>
                      <div className="text-2xl font-black text-white">{stats.total}</div>
                    </div>

                    <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                      <div className="text-xs text-slate-400 uppercase font-bold mb-1">Categorías</div>
                      <div className="text-2xl font-black text-white">{stats.count}</div>
                    </div>

                    {stats.max !== undefined && (
                      <>
                        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                          <div className="text-xs text-slate-400 uppercase font-bold mb-1">Máximo</div>
                          <div className="text-2xl font-black text-green-400">{stats.max}</div>
                        </div>

                        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                          <div className="text-xs text-slate-400 uppercase font-bold mb-1">Mínimo</div>
                          <div className="text-2xl font-black text-red-400">{stats.min}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Eye className="w-6 h-6 text-blue-400" />
                    Visualización
                  </h3>

                  {hasData && (
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

                {hasData && (
                  <div className="mt-6 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-white mb-2 text-sm">Interpretación</h4>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {config.chartType === 'bar'
                            ? 'El gráfico de barras permite comparar directamente las frecuencias entre categorías. La altura de cada barra representa la magnitud, facilitando la identificación de máximos, mínimos y diferencias relativas.'
                            : config.chartType === 'pareto'
                              ? 'El diagrama de Pareto combina barras (frecuencias) con una línea acumulada (%). Útil para identificar las categorías que representan el 80% del total (principio 80/20).'
                              : config.pieType === 'donut'
                                ? 'El gráfico de donut muestra la composición porcentual con un diseño moderno. El espacio central puede incluir totales o información adicional. Ideal para 3-7 categorías principales.'
                                : 'El gráfico de pastel visualiza proporciones como porciones de un todo. Cada sector representa el porcentaje de una categoría. Recomendado para 3-6 categorías con diferencias claras.'}
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
                      <TableIcon className="w-6 h-6 text-blue-400" />
                      Tabla de Frecuencias
                    </h3>

                    <button
                      onClick={() => setShowTable(!showTable)}
                      className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-2"
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
        )}

        {/* ========================================
      CONTINÚA CON PESTAÑA AVANZADOS
      ======================================== */}
        {/* ========================================
      CONTINUACIÓN PARTE 3 - PESTAÑAS RESTANTES
      ======================================== */}

        {/* AVANZADOS */}
        {activeTab === 'avanzados' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  Gráficos Multivariados
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Visualiza relaciones entre dos variables categóricas
                </p>

                <div className="space-y-3">
                  {Object.entries(advancedDatasets).map(([key, ds]) => {
                    const IconComponent = ds.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedDataset(key);
                          setConfig(prev => ({
                            ...prev,
                            chartTitle: '',
                            chartType: ds.type === 'stacked' ? 'stacked' : 'grouped'
                          }));
                        }}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedDataset === key
                          ? 'bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-500/20'
                          : 'bg-slate-800/50 border-slate-700 hover:border-blue-500/50 hover:bg-slate-800'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${selectedDataset === key ? 'bg-blue-500/30' : 'bg-slate-700/50'}`}>
                            <IconComponent className={`w-5 h-5 ${selectedDataset === key ? 'text-blue-300' : 'text-slate-400'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-white text-sm">{ds.name}</div>
                            <div className="text-xs text-slate-400 mt-1">{ds.description}</div>
                            <div className="mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-bold ${ds.type === 'grouped'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                }`}>
                                {ds.type === 'grouped' ? 'Barras Agrupadas' : 'Barras Apiladas'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-400" />
                  Configuración
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Paleta de Colores
                    </label>
                    <select
                      value={config.colorPalette}
                      onChange={(e) => setConfig({ ...config, colorPalette: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
                    >
                      {Object.entries(PALETTES).map(([key, pal]) => (
                        <option key={key} value={key}>{pal.name}</option>
                      ))}
                    </select>

                    <div className="flex gap-1.5 mt-3">
                      {PALETTES[config.colorPalette].colors.slice(0, 6).map((color, i) => (
                        <div
                          key={i}
                          className="h-7 flex-1 rounded-md shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Fondo
                    </label>
                    <select
                      value={config.backgroundColor}
                      onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
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
                      checked={config.showGrid}
                      onChange={(e) => setConfig({ ...config, showGrid: e.target.checked })}
                      className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-white">Mostrar cuadrícula</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Eye className="w-6 h-6 text-blue-400" />
                  Visualización Multivariada
                </h3>
                {hasData && (
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
            </div>
          </div>
        )}

        {/* DECISIÓN */}
        {activeTab === 'decision' && (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
                <LayoutGrid className="w-7 h-7 text-blue-400" />
                Guía de Selección de Gráficos
              </h2>
              <p className="text-slate-400 text-sm">
                Elige el tipo de gráfico adecuado según tu objetivo de análisis y características de los datos
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-700">
                    <th className="text-left p-4 font-black text-white text-sm">Tipo de Gráfico</th>
                    <th className="text-left p-4 font-black text-white text-sm">Objetivo Principal</th>
                    <th className="text-left p-4 font-black text-white text-sm">Cuándo Usar</th>
                    <th className="text-left p-4 font-black text-white text-sm">Evitar Si</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      icon: BarChart2,
                      type: "Barras Simples",
                      goal: "Comparar frecuencias absolutas",
                      when: "Necesitas identificar máximos, mínimos o diferencias entre categorías. Funciona con cualquier número de categorías.",
                      avoid: "Las categorías tienen valores muy similares o necesitas enfatizar proporciones sobre valores absolutos."
                    },
                    {
                      icon: Circle,
                      type: "Pastel / Donut",
                      goal: "Mostrar proporciones del total",
                      when: "Tienes 3-6 categorías y quieres visualizar composición porcentual. El total suma 100%.",
                      avoid: "Tienes más de 8 categorías, valores muy similares, o necesitas comparaciones precisas."
                    },
                    {
                      icon: BarChart2,
                      type: "Barras Agrupadas",
                      goal: "Comparar subgrupos dentro de categorías",
                      when: "Quieres contrastar 2-4 subgrupos en cada categoría principal. Ideal para comparaciones directas.",
                      avoid: "Tienes más de 4 subgrupos por categoría o los totales son más importantes que las comparaciones."
                    },
                    {
                      icon: Layers,
                      type: "Barras Apiladas",
                      goal: "Visualizar composición y totales",
                      when: "Necesitas mostrar tanto el total como la distribución interna de cada categoría.",
                      avoid: "Quieres comparar valores específicos de subgrupos (difícil sin base común)."
                    },
                    {
                      icon: Grid,
                      type: "Mosaico / Heatmap",
                      goal: "Explorar asociaciones entre variables",
                      when: "Buscas patrones de relación entre dos variables categóricas con múltiples niveles.",
                      avoid: "Tienes más de 5-6 categorías por variable o los datos son escasos (celdas vacías)."
                    },
                    {
                      icon: Flame,
                      type: "Pareto",
                      goal: "Identificar categorías principales (80/20)",
                      when: "Quieres priorizar las categorías que acumulan la mayor parte del total.",
                      avoid: "Todas las categorías tienen importancia similar o no buscas priorización."
                    }
                  ].map((row, idx) => {
                    const IconComponent = row.icon;
                    return (
                      <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                              <IconComponent className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="font-bold text-white">{row.type}</span>
                          </div>
                        </td>
                        <td className="p-4 text-blue-400 font-semibold text-sm">{row.goal}</td>
                        <td className="p-4 text-slate-300 text-sm leading-relaxed">{row.when}</td>
                        <td className="p-4 text-orange-400/90 text-sm leading-relaxed">{row.avoid}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* UPLOAD */}
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-400" />
                  Tus Datos
                </h3>

                <div className="flex items-center gap-4 flex-wrap">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <label
                    htmlFor="file-upload"
                    className="px-5 py-3 bg-blue-500/20 hover:bg-blue-500/30 
               text-blue-300 font-bold rounded-xl cursor-pointer 
               transition-all whitespace-nowrap"
                  >
                    Seleccionar archivo
                  </label>

                  <span
                    className={`text-sm ${uploadedFile ? "text-green-400 font-semibold" : "text-slate-400"
                      } capitalize break-all`}
                  >
                    {uploadedFile ? uploadedFile.name : "Nada seleccionado"}
                  </span>
                </div>


                {uploadedColumns.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Modo
                      </label>
                      <select
                        value={config.variableMode}
                        onChange={(e) =>
                          setConfig(prev => ({
                            ...prev,
                            variableMode: e.target.value,
                            selectedVariable: '',
                            selectedVariable2: '',
                            chartType: 'bar',
                            chartTitle: ''
                          }))
                        }
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="1var">1 variable</option>
                        <option value="2var">2 variables</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Variable 1
                      </label>
                      <select
                        value={config.selectedVariable}
                        onChange={(e) =>
                          setConfig(prev => ({
                            ...prev,
                            selectedVariable: e.target.value,
                            chartTitle: ''
                          }))
                        }
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Selecciona...</option>
                        {uploadedColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    {config.variableMode === '2var' && (
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Variable 2 (grupo)
                        </label>
                        <select
                          value={config.selectedVariable2}
                          onChange={(e) =>
                            setConfig(prev => ({
                              ...prev,
                              selectedVariable2: e.target.value,
                              chartTitle: ''
                            }))
                          }
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Selecciona...</option>
                          {uploadedColumns.map(col => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {config.selectedVariable && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                  <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-400" />
                    Configuración
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Tipo de Gráfico
                      </label>

                      {config.variableMode === '1var' ? (
                        <div className="grid grid-cols-4 gap-2">
                          <button
                            onClick={() => setConfig({ ...config, chartType: 'bar' })}
                            className={`p-3 rounded-lg font-semibold text-xs transition-all flex flex-col items-center gap-1 ${config.chartType === 'bar'
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                              }`}
                          >
                            <BarChart2 className="w-5 h-5" />
                            Barras
                          </button>

                          <button
                            onClick={() => setConfig({ ...config, chartType: 'pie', pieType: 'pie' })}
                            className={`p-3 rounded-lg font-semibold text-xs transition-all flex flex-col items-center gap-1 ${config.chartType === 'pie' && config.pieType === 'pie'
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                              }`}
                          >
                            <Circle className="w-5 h-5" />
                            Pastel
                          </button>

                          <button
                            onClick={() => setConfig({ ...config, chartType: 'pie', pieType: 'donut' })}
                            className={`p-3 rounded-lg font-semibold text-xs transition-all flex flex-col items-center gap-1 ${config.chartType === 'pie' && config.pieType === 'donut'
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                              }`}
                          >
                            <Square className="w-5 h-5" />
                            Donut
                          </button>

                          <button
                            onClick={() => setConfig({ ...config, chartType: 'pareto' })}
                            className={`p-3 rounded-lg font-semibold text-xs transition-all flex flex-col items-center gap-1 ${config.chartType === 'pareto'
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                              }`}
                          >
                            <Flame className="w-5 h-5" />
                            Pareto
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          <button
                            onClick={() => setConfig({ ...config, chartType: 'grouped' })}
                            className={`p-3 rounded-lg font-semibold text-xs transition-all ${config.chartType === 'grouped'
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                              }`}
                          >
                            Agrupadas
                          </button>

                          <button
                            onClick={() => setConfig({ ...config, chartType: 'stacked' })}
                            className={`p-3 rounded-lg font-semibold text-xs transition-all ${config.chartType === 'stacked'
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                              }`}
                          >
                            Apiladas
                          </button>

                          <button
                            onClick={() => setConfig({ ...config, chartType: 'stacked100' })}
                            className={`p-3 rounded-lg font-semibold text-xs transition-all ${config.chartType === 'stacked100'
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                              }`}
                          >
                            100%
                          </button>

                          <button
                            onClick={() => setConfig({ ...config, chartType: 'heatmap' })}
                            className={`p-3 rounded-lg font-semibold text-xs transition-all ${config.chartType === 'heatmap'
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                              }`}
                          >
                            Heatmap
                          </button>
                        </div>
                      )}
                    </div>

                    {config.variableMode === '1var' && (
                      <>
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                            Ordenar
                          </label>
                          <select
                            value={config.sortOrder}
                            onChange={(e) => setConfig({ ...config, sortOrder: e.target.value })}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
                          >
                            <option value="none">Sin ordenar</option>
                            <option value="desc">Mayor a Menor</option>
                            <option value="asc">Menor a Mayor</option>
                          </select>
                        </div>

                        <label
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all ${config.chartType === 'pareto'
                            ? 'bg-slate-800/10 opacity-60 cursor-not-allowed'
                            : 'bg-slate-800/30 cursor-pointer hover:bg-slate-800/50'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={config.showPercentage}
                            disabled={config.chartType === 'pareto'}
                            onChange={(e) => setConfig({ ...config, showPercentage: e.target.checked })}
                            className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-semibold text-white">Mostrar como porcentaje</span>
                            {config.chartType === 'pareto' && (
                              <div className="text-[11px] text-slate-400 mt-1">
                                Pareto usa frecuencias + % acumulado (80/20).
                              </div>
                            )}
                          </div>
                        </label>
                      </>
                    )}

                    <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-all">
                      <input
                        type="checkbox"
                        checked={config.showGrid}
                        onChange={(e) => setConfig({ ...config, showGrid: e.target.checked })}
                        className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-semibold text-white">Mostrar cuadrícula</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-all">
                      <input
                        type="checkbox"
                        checked={config.showValues}
                        onChange={(e) => setConfig({ ...config, showValues: e.target.checked })}
                        className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-semibold text-white">Mostrar valores</span>
                    </label>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Paleta de Colores
                      </label>
                      <select
                        value={config.colorPalette}
                        onChange={(e) => setConfig({ ...config, colorPalette: e.target.value })}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
                      >
                        {Object.entries(PALETTES).map(([key, pal]) => (
                          <option key={key} value={key}>{pal.name}</option>
                        ))}
                      </select>

                      <div className="flex gap-1.5 mt-3">
                        {PALETTES[config.colorPalette].colors.slice(0, 6).map((color, i) => (
                          <div key={i} className="h-7 flex-1 rounded-md shadow-sm" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Fondo
                      </label>
                      <select
                        value={config.backgroundColor}
                        onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:border-blue-500 focus:outline-none"
                      >
                        {Object.entries(BACKGROUNDS).map(([key, bg]) => (
                          <option key={key} value={key}>{bg.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {stats && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                  <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Estadísticas
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                      <div className="text-xs text-slate-400 uppercase font-bold mb-1">Total</div>
                      <div className="text-2xl font-black text-white">{stats.total}</div>
                    </div>

                    <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                      <div className="text-xs text-slate-400 uppercase font-bold mb-1">
                        {config.variableMode === '2var' ? 'Grupos' : 'Categorías'}
                      </div>
                      <div className="text-2xl font-black text-white">{stats.count}</div>
                    </div>

                    {stats.max !== undefined && (
                      <>
                        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                          <div className="text-xs text-slate-400 uppercase font-bold mb-1">Máximo</div>
                          <div className="text-2xl font-black text-green-400">{stats.max}</div>
                        </div>

                        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                          <div className="text-xs text-slate-400 uppercase font-bold mb-1">Mínimo</div>
                          <div className="text-2xl font-black text-red-400">{stats.min}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Eye className="w-6 h-6 text-blue-400" />
                    Tu Visualización
                  </h3>

                  {hasData && (
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
              </div>

              {hasData && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <TableIcon className="w-6 h-6 text-blue-400" />
                      {config.variableMode === '2var'
                        ? 'Tabla de Contingencia'
                        : 'Tabla de Frecuencias'}
                    </h3>

                    <button
                      onClick={() => setShowTable(prev => !prev)}
                      className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-2"
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
        )}
      </main>
    </div>
  );
};

export default Lab2_2;