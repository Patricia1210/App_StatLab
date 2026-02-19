// ============================================================
// LAB 4.1 - PARTE 1 de 3
// Dos Variables Cualitativas (Categóricas)
// CON PRÁCTICA APLICADA INTEGRADA
// ============================================================
// INSTRUCCIONES: 
// 1. Copia este contenido al inicio de tu archivo Lab4_1.jsx
// 2. Luego agrega la Parte 2
// 3. Finalmente agrega la Parte 3
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, BarChart3, Database, Eye, Download,
  Activity, Info, Upload, Lightbulb, AlertCircle,
  Settings, Target, Zap, CheckCircle, XCircle, Award, Brain,
  Users, ShoppingCart, Heart, Percent, TrendingUp, Grid
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, Legend, Treemap
} from "recharts";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { jStat } from "jstat";

// ============================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================

const PRESET_DATASETS = {
  genero_fumar: {
    label: "Género y Hábito de Fumar",
    icon: Users,
    description: "200 personas clasificadas por género y hábito de fumar",
    var1: "Género",
    var2: "Hábito de Fumar",
    categories1: ["Masculino", "Femenino"],
    categories2: ["Fumador", "No Fumador"],
    data: [
      { var1: "Masculino", var2: "Fumador", count: 50 },
      { var1: "Masculino", var2: "No Fumador", count: 70 },
      { var1: "Femenino", var2: "Fumador", count: 30 },
      { var1: "Femenino", var2: "No Fumador", count: 50 }
    ]
  },
  preferencia_edad: {
    label: "Preferencia de Producto por Edad",
    icon: ShoppingCart,
    description: "200 consumidores clasificados por edad y preferencia",
    var1: "Grupo de Edad",
    var2: "Preferencia",
    categories1: ["Joven (18-30)", "Adulto (31-50)", "Mayor (51+)"],
    categories2: ["Le gusta", "No le gusta"],
    data: [
      { var1: "Joven (18-30)", var2: "Le gusta", count: 60 },
      { var1: "Joven (18-30)", var2: "No le gusta", count: 40 },
      { var1: "Adulto (31-50)", var2: "Le gusta", count: 30 },
      { var1: "Adulto (31-50)", var2: "No le gusta", count: 30 },
      { var1: "Mayor (51+)", var2: "Le gusta", count: 10 },
      { var1: "Mayor (51+)", var2: "No le gusta", count: 30 }
    ]
  },
  titanic: {
    label: "Sobrevivencia en el Titanic",
    icon: Activity,
    description: "Pasajeros del Titanic por clase y sobrevivencia",
    var1: "Clase",
    var2: "Sobrevivió",
    categories1: ["First", "Second", "Third"],
    categories2: ["yes", "no"],
    data: [
      { var1: "First", var2: "yes", count: 136 },
      { var1: "First", var2: "no", count: 80 },
      { var1: "Second", var2: "yes", count: 87 },
      { var1: "Second", var2: "no", count: 97 },
      { var1: "Third", var2: "yes", count: 119 },
      { var1: "Third", var2: "no", count: 372 }
    ]
  },
  preferencia_producto: {
    label: "Preferencia por Producto según Género",
    icon: Heart,
    description: "170 personas clasificadas por género y producto preferido",
    var1: "Género",
    var2: "Producto",
    categories1: ["Masculino", "Femenino"],
    categories2: ["Producto A", "Producto B", "Producto C"],
    data: [
      { var1: "Masculino", var2: "Producto A", count: 40 },
      { var1: "Masculino", var2: "Producto B", count: 25 },
      { var1: "Masculino", var2: "Producto C", count: 5 },
      { var1: "Femenino", var2: "Producto A", count: 30 },
      { var1: "Femenino", var2: "Producto B", count: 50 },
      { var1: "Femenino", var2: "Producto C", count: 20 }
    ]
  }
};

const PRACTICE_QUESTIONS = [
  {
    id: 1,
    question: "¿Qué es una tabla de contingencia?",
    options: [
      "Una tabla que muestra frecuencias de dos variables categóricas",
      "Una tabla que calcula la media de dos variables",
      "Una tabla que solo muestra porcentajes",
      "Una tabla para variables numéricas"
    ],
    correct: 0,
    explanation: "Una tabla de contingencia organiza las frecuencias de dos variables categóricas en filas y columnas."
  },
  {
    id: 2,
    question: "¿Cuándo se usa la prueba Chi-Cuadrado?",
    options: [
      "Para calcular la media",
      "Para determinar si dos variables categóricas son independientes",
      "Para encontrar la mediana",
      "Para calcular la correlación"
    ],
    correct: 1,
    explanation: "La prueba Chi-Cuadrado determina si existe asociación estadísticamente significativa entre dos variables categóricas."
  },
  {
    id: 3,
    question: "Si p-value < 0.05 en Chi-Cuadrado, ¿qué concluimos?",
    options: [
      "No hay evidencia de asociación",
      "Las variables son independientes",
      "Existe evidencia de asociación significativa",
      "Los datos son normales"
    ],
    correct: 2,
    explanation: "Un p-value menor a 0.05 indica evidencia estadística suficiente para rechazar la hipótesis nula de independencia."
  },
  {
    id: 4,
    question: "¿Qué muestra un gráfico de barras agrupadas?",
    options: [
      "Solo una variable",
      "Comparación de categorías de dos variables lado a lado",
      "Suma acumulada de datos",
      "Distribución normal"
    ],
    correct: 1,
    explanation: "Los gráficos de barras agrupadas permiten comparar visualmente las frecuencias de diferentes combinaciones de categorías."
  },
  {
    id: 5,
    question: "En una tabla de contingencia, ¿qué representa el total marginal?",
    options: [
      "El error del cálculo",
      "La suma de una fila o columna completa",
      "El valor máximo",
      "La diferencia entre categorías"
    ],
    correct: 1,
    explanation: "Los totales marginales son las sumas de cada fila o columna, representando el total de cada categoría individual."
  },
  {
    id: 6,
    question: "¿Qué ventaja tiene un diagrama de mosaico?",
    options: [
      "Calcula automáticamente porcentajes",
      "Visualiza proporciones y frecuencias simultáneamente",
      "Solo funciona con datos numéricos",
      "Muestra la media de los datos"
    ],
    correct: 1,
    explanation: "El diagrama de mosaico permite visualizar tanto las frecuencias absolutas como las proporciones relativas de forma intuitiva."
  },
  {
    id: 7,
    question: "¿Cuál es la hipótesis nula (H0) en Chi-Cuadrado?",
    options: [
      "Las variables están asociadas",
      "Las variables son independientes (no hay asociación)",
      "Los datos son normales",
      "Existe correlación perfecta"
    ],
    correct: 1,
    explanation: "La hipótesis nula en Chi-Cuadrado establece que no existe asociación entre las dos variables categóricas."
  },
  {
    id: 8,
    question: "¿Qué tipo de datos requiere el análisis de dos variables cualitativas?",
    options: [
      "Datos numéricos continuos",
      "Datos categóricos o nominales",
      "Solo datos ordinales",
      "Datos de intervalo"
    ],
    correct: 1,
    explanation: "Este análisis se aplica a variables categóricas (cualitativas) que clasifican observaciones en grupos o categorías."
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
  },
  pastel: {
    name: "Pastel",
    colors: ['#93c5fd', '#c4b5fd', '#f9a8d4', '#fde68a', '#a7f3d0']
  }
};

// ============================================
// FUNCIONES ESTADÍSTICAS
// ============================================

const calculateContingencyTable = (data) => {
  if (!data || data.length === 0) return null;

  const table = {};
  const row_totals = {};
  const col_totals = {};
  let grand_total = 0;

  data.forEach(item => {
    const { var1, var2, count } = item;

    if (!table[var1]) table[var1] = {};
    table[var1][var2] = count;

    row_totals[var1] = (row_totals[var1] || 0) + count;
    col_totals[var2] = (col_totals[var2] || 0) + count;
    grand_total += count;
  });

  return { table, row_totals, col_totals, grand_total };
};

const calculateChiSquare = (data) => {
  const contingency = calculateContingencyTable(data);
  if (!contingency) return null;

  const { table, row_totals, col_totals, grand_total } = contingency;

  let chi_square = 0;
  const expected = {};

  // Calcular chi-cuadrado y valores esperados
  Object.keys(table).forEach(row => {
    expected[row] = {};
    Object.keys(table[row]).forEach(col => {
      const observed = table[row][col];
      const exp = (row_totals[row] * col_totals[col]) / grand_total;
      expected[row][col] = exp;
      chi_square += Math.pow(observed - exp, 2) / exp;
    });
  });

  const rows = Object.keys(row_totals).length;
  const cols = Object.keys(col_totals).length;
  const df = (rows - 1) * (cols - 1);

  // Usar jStat para p-value correcto
  const p_value = 1 - jStat.chisquare.cdf(chi_square, df);

  // Calcular V de Cramer
  const minDim = Math.min(rows - 1, cols - 1);
  const cramerV = Math.sqrt(chi_square / (grand_total * minDim));

  // Interpretación de V de Cramer
  let effectInterpretation = "";
  if (cramerV < 0.1) effectInterpretation = "Asociación muy débil";
  else if (cramerV < 0.3) effectInterpretation = "Asociación débil";
  else if (cramerV < 0.5) effectInterpretation = "Asociación moderada";
  else effectInterpretation = "Asociación fuerte";

  // Calcular tablas porcentuales
  const percentageTotal = {};
  const percentageRow = {};
  const percentageColumn = {};

  Object.keys(table).forEach(row => {
    percentageTotal[row] = {};
    percentageRow[row] = {};
    percentageColumn[row] = {};

    Object.keys(table[row]).forEach(col => {
      const cell = table[row][col];
      percentageTotal[row][col] = (cell / grand_total) * 100;
      percentageRow[row][col] = (cell / row_totals[row]) * 100;
      percentageColumn[row][col] = (cell / col_totals[col]) * 100;
    });
  });

  return {
    chi_square: chi_square.toFixed(4),
    df,
    p_value: p_value.toFixed(4),
    significant: p_value < 0.05,
    expected,
    cramerV: cramerV.toFixed(3),
    effectInterpretation,
    percentageTotal,
    percentageRow,
    percentageColumn,
    rows,
    cols
  };
};

const prepareBarChartData = (data, chartType = 'grouped') => {
  if (!data || data.length === 0) return [];

  const contingency = calculateContingencyTable(data);
  if (!contingency) return [];

  const { table } = contingency;

  if (chartType === 'grouped') {
    // Datos para gráfico agrupado
    return Object.keys(table).map(category => {
      const item = { category };
      Object.keys(table[category]).forEach(subcat => {
        item[subcat] = table[category][subcat];
      });
      return item;
    });
  } else {
    // Datos para gráfico apilado
    return Object.keys(table).map(category => {
      const item = { category };
      let cumulative = 0;
      Object.keys(table[category]).forEach(subcat => {
        item[subcat] = table[category][subcat];
        cumulative += table[category][subcat];
      });
      item.total = cumulative;
      return item;
    });
  }
};

const prepareMosaicData = (data) => {
  if (!data || data.length === 0) return [];

  const contingency = calculateContingencyTable(data);
  if (!contingency) return [];

  const { table, row_totals, col_totals, grand_total } = contingency;

  const mosaicData = [];
  const rowLabels = Object.keys(table);
  const colLabels = Object.keys(table[rowLabels[0]] || {});

  rowLabels.forEach((rowLabel, i) => {
    colLabels.forEach((colLabel, j) => {
      const value = table[rowLabel][colLabel];
      mosaicData.push({
        name: `${rowLabel} - ${colLabel}`,
        x: colLabel,
        y: rowLabel,
        value: value,
        size: value,
        percentage: ((value / grand_total) * 100).toFixed(2),
        rowIndex: i,
        colIndex: j
      });
    });
  });

  return mosaicData;
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const Lab4_1 = ({ goHome, setView }) => {
  const [activeTab, setActiveTab] = useState('intro');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [activeData, setActiveData] = useState([]);
  const [uploadedColumns, setUploadedColumns] = useState([]);
  const [selectedVar1, setSelectedVar1] = useState('');
  const [selectedVar2, setSelectedVar2] = useState('');
  const [datasetLabel, setDatasetLabel] = useState('');
  const [var1Label, setVar1Label] = useState('Variable 1');
  const [var2Label, setVar2Label] = useState('Variable 2');
  const [categories1, setCategories1] = useState([]);
  const [categories2, setCategories2] = useState([]);

  const [chartTitle, setChartTitle] = useState("Relación entre Variables");
  const [xAxisLabel, setXAxisLabel] = useState("");
  const [yAxisLabel, setYAxisLabel] = useState("Frecuencia");
  const [chartBgColor, setChartBgColor] = useState('transparent');
  const [chartType, setChartType] = useState('grouped');
  const [showPercentages, setShowPercentages] = useState(false);
  const [tableType, setTableType] = useState('frequency');
  const [colorPalette, setColorPalette] = useState('modern');
  const [chartKey, setChartKey] = useState(0);

  const [contingencyTable, setContingencyTable] = useState(null);
  const [chiSquareResult, setChiSquareResult] = useState(null);
  const [interpretation, setInterpretation] = useState('');

  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [practiceResults, setPracticeResults] = useState({});
  const [practiceScore, setPracticeScore] = useState(0);
  const [practiceMode, setPracticeMode] = useState('quiz');

  // Estados para práctica aplicada
  const [appliedConcept, setAppliedConcept] = useState({
    hasAssociation: null,
    cramerStrength: null,
    mostFrequent: null
  });
  const [appliedFeedback, setAppliedFeedback] = useState(null);

  const chartRef = useRef(null);

  useEffect(() => {
    if (activeData.length > 0) {
      const ct = calculateContingencyTable(activeData);
      setContingencyTable(ct);

      const chiResult = calculateChiSquare(activeData);
      setChiSquareResult(chiResult);

      if (chiResult) {
        let interp = '';
        if (chiResult.significant) {
          interp = `✅ Con un p-value de ${chiResult.p_value} (< 0.05), existe evidencia estadística significativa de asociación entre ${var1Label} y ${var2Label}. Las variables NO son independientes.`;
        } else {
          interp = `❌ Con un p-value de ${chiResult.p_value} (≥ 0.05), NO existe evidencia suficiente para afirmar que hay asociación entre ${var1Label} y ${var2Label}. Las variables podrían ser independientes.`;
        }
        setInterpretation(interp);
      }
    }
  }, [activeData, var1Label, var2Label]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleDatasetSelect = (key) => {
    setSelectedDataset(key);
    const dataset = PRESET_DATASETS[key];
    setActiveData(dataset.data);
    setDatasetLabel(dataset.label);
    setVar1Label(dataset.var1);
    setVar2Label(dataset.var2);
    setCategories1(dataset.categories1);
    setCategories2(dataset.categories2);
    setUploadedFile(null);
    setUploadedColumns([]);
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

    setUploadedColumns(keys);
    setSelectedDataset('');
    setDatasetLabel(filename.replace(/\.(csv|xlsx|xls)$/i, ''));

    if (keys.length >= 2) {
      setSelectedVar1(keys[0]);
      setSelectedVar2(keys[1]);
      processCustomData(data, keys[0], keys[1]);
    }
  };

  const processCustomData = (rawData, var1Key, var2Key) => {
    const counts = {};
    const cats1 = new Set();
    const cats2 = new Set();

    rawData.forEach(row => {
      const val1 = String(row[var1Key] || '').trim();
      const val2 = String(row[var2Key] || '').trim();

      if (!val1 || !val2) return;

      cats1.add(val1);
      cats2.add(val2);

      const key = `${val1}|||${val2}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    const processedData = [];
    Object.keys(counts).forEach(key => {
      const [var1, var2] = key.split('|||');
      processedData.push({ var1, var2, count: counts[key] });
    });

    setActiveData(processedData);
    setCategories1(Array.from(cats1));
    setCategories2(Array.from(cats2));
    setVar1Label(var1Key);
    setVar2Label(var2Key);
    setChartKey(prev => prev + 1);
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

  const checkAppliedAnswers = () => {
    if (activeData.length === 0 || !chiSquareResult) {
      setAppliedFeedback({
        ok: false,
        msg: "⚠️ Primero selecciona un dataset en la pestaña 'Análisis'."
      });
      return;
    }

    let score = 0;
    const details = {};

    // 1. Verificar asociación significativa
    const hasAssociationReal = chiSquareResult.significant;
    const hasAssociationCorrect = appliedConcept.hasAssociation === (hasAssociationReal ? 'si' : 'no');
    if (hasAssociationCorrect) score++;
    details.hasAssociation = { correct: hasAssociationCorrect, real: hasAssociationReal };

    // 2. Verificar fuerza de V de Cramér
    const v = parseFloat(chiSquareResult.cramerV);
    let cramerReal;
    if (v < 0.1) cramerReal = 'muy_debil';
    else if (v < 0.3) cramerReal = 'debil';
    else if (v < 0.5) cramerReal = 'moderada';
    else cramerReal = 'fuerte';

    const cramerCorrect = appliedConcept.cramerStrength === cramerReal;
    if (cramerCorrect) score++;
    details.cramerStrength = { correct: cramerCorrect, real: cramerReal, value: v };

    // 3. Encontrar combinación más frecuente
    let maxCount = 0;
    let mostFrequentReal = '';
    Object.keys(contingencyTable.table).forEach(row => {
      Object.keys(contingencyTable.table[row]).forEach(col => {
        const count = contingencyTable.table[row][col];
        if (count > maxCount) {
          maxCount = count;
          mostFrequentReal = `${row}-${col}`;
        }
      });
    });

    const mostFrequentCorrect = appliedConcept.mostFrequent === mostFrequentReal;
    if (mostFrequentCorrect) score++;
    details.mostFrequent = { correct: mostFrequentCorrect, real: mostFrequentReal, count: maxCount };

    setAppliedFeedback({
      ok: score >= 2,
      score,
      total: 3,
      details,
      datasetName: datasetLabel,
      chiSquare: chiSquareResult.chi_square,
      pValue: chiSquareResult.p_value,
      cramerV: chiSquareResult.cramerV
    });
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
      link.download = `analisis_categorico_${datasetLabel.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // ============================================================
  // LAB 4.1 - PARTE 2 de 3
  // Secciones: renderIntroTab() y renderDatasetsTab()
  // ============================================================
  // INSTRUCCIONES: 
  // 1. Esta parte va DESPUÉS de la Parte 1
  // 2. Copia este contenido continuando desde donde terminó la Parte 1
  // 3. Luego agrega la Parte 3 al final
  // ============================================================

  // ============================================
  // RENDER: INTRODUCCIÓN
  // ============================================

  const renderIntroTab = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-3xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-orange-500/20 rounded-xl">
            <Lightbulb className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2">¿Qué son las Variables Cualitativas?</h2>
            <p className="text-slate-400 leading-relaxed">
              Las variables cualitativas (o categóricas) clasifican observaciones en categorías o grupos.
              Por ejemplo: <strong className="text-white">género</strong>, <strong className="text-white">preferencia</strong>,
              <strong className="text-white">nivel educativo</strong>, etc.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
              <Grid className="w-5 h-5 text-indigo-400" />
              Variables Nominales
            </h3>
            <p className="text-sm text-slate-300 mb-3">
              Categorías sin orden inherente
            </p>
            <div className="space-y-2">
              <div className="px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-300">
                • Género: Masculino, Femenino
              </div>
              <div className="px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-300">
                • Color: Rojo, Azul, Verde
              </div>
              <div className="px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-300">
                • Estado civil: Soltero, Casado
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Variables Ordinales
            </h3>
            <p className="text-sm text-slate-300 mb-3">
              Categorías con orden lógico
            </p>
            <div className="space-y-2">
              <div className="px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-300">
                • Nivel educativo: Primaria → Universidad
              </div>
              <div className="px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-300">
                • Satisfacción: Bajo → Alto
              </div>
              <div className="px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-300">
                • Talla: S, M, L, XL
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Tablas de Contingencia",
            symbol: "📊",
            desc: "Organizan frecuencias de dos variables en filas y columnas",
            gradient: "from-blue-500 to-cyan-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
          },
          {
            title: "Gráficos de Barras",
            symbol: "📈",
            desc: "Permiten comparar visualmente categorías (agrupadas o apiladas)",
            gradient: "from-purple-500 to-pink-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
          },
          {
            title: "Prueba Chi-Cuadrado",
            symbol: "χ²",
            desc: "Determina si existe asociación estadísticamente significativa",
            gradient: "from-orange-500 to-amber-400",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20"
          }
        ].map((item, idx) => (
          <div key={idx} className={`${item.bg} border-2 ${item.border} rounded-3xl p-6 transition-all hover:scale-[1.02] hover:shadow-2xl`}>
            <div className="text-4xl mb-4">{item.symbol}</div>
            <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-400" />
          Prueba de Independencia Chi-Cuadrado (χ²)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
            <h4 className="font-bold text-green-400 mb-3">Hipótesis Nula (H₀)</h4>
            <p className="text-sm text-slate-300">
              Las dos variables son <strong className="text-white">independientes</strong>.
              No existe asociación entre ellas.
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6">
            <h4 className="font-bold text-orange-400 mb-3">Hipótesis Alternativa (H₁)</h4>
            <p className="text-sm text-slate-300">
              Las variables <strong className="text-white">están asociadas</strong>.
              Existe relación entre ellas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h4 className="font-bold text-white mb-4">Interpretación del p-value</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">p-value &lt; 0.05</p>
                  <p className="text-xs text-slate-400">Rechazamos H₀: Existe evidencia de asociación significativa</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">p-value ≥ 0.05</p>
                  <p className="text-xs text-slate-400">No rechazamos H₀: No hay evidencia suficiente de asociación</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h4 className="font-bold text-white mb-4">V de Cramér (Tamaño del Efecto)</h4>
            <p className="text-sm text-slate-300 mb-3">
              Mide la <strong className="text-cyan-400">fuerza de asociación</strong> entre variables (0 a 1).
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                <span className="text-slate-400"><strong>V &lt; 0.1:</strong> Muy débil</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-slate-400"><strong>0.1 ≤ V &lt; 0.3:</strong> Débil</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-slate-400"><strong>0.3 ≤ V &lt; 0.5:</strong> Moderada</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-slate-400"><strong>V ≥ 0.5:</strong> Fuerte</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-2">📌 Diferencia entre Significancia y Tamaño del Efecto</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold mt-0.5">•</span>
                  <span><strong className="text-white">p-value:</strong> Indica si la asociación es estadísticamente significativa (confiabilidad)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold mt-0.5">•</span>
                  <span><strong className="text-white">V de Cramér:</strong> Indica qué tan fuerte es la asociación (magnitud práctica)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold mt-0.5">•</span>
                  <span>Una asociación puede ser <strong className="text-cyan-400">significativa pero débil</strong> (común con muestras grandes)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl p-8">
        <div className="flex items-start gap-4">
          <Lightbulb className="w-6 h-6 text-yellow-400 shrink-0 mt-1" />
          <div>
            <h4 className="font-black text-white mb-3">💡 Ejemplos de Uso</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold mt-0.5">•</span>
                <span>¿El género influye en la preferencia de productos?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold mt-0.5">•</span>
                <span>¿La clase social está relacionada con la sobrevivencia?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 font-bold mt-0.5">•</span>
                <span>¿El nivel educativo afecta las preferencias políticas?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 font-bold mt-0.5">•</span>
                <span>¿La edad determina el tipo de tecnología preferida?</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER: DATASETS Y VISUALIZACIÓN
  // ============================================

  const renderDatasetsTab = () => {
    const barData = prepareBarChartData(activeData, chartType);
    const currentColors = PALETTES[colorPalette].colors;
    const allCategories2 = categories2;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              Datasets Disponibles
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
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-xl cursor-pointer transition-all"
              >
                <Upload className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-indigo-300">
                  {uploadedFile ? uploadedFile.name : 'Seleccionar archivo'}
                </span>
              </label>

              {uploadedColumns.length >= 2 && (
                <div className="mt-3 space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase">Variable 1</label>
                  <select
                    value={selectedVar1}
                    onChange={(e) => {
                      setSelectedVar1(e.target.value);
                      if (selectedVar2) {
                        // Re-procesar datos
                      }
                    }}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white"
                  >
                    {uploadedColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>

                  <label className="block text-xs font-bold text-slate-400 uppercase mt-3">Variable 2</label>
                  <select
                    value={selectedVar2}
                    onChange={(e) => {
                      setSelectedVar2(e.target.value);
                      if (selectedVar1) {
                        // Re-procesar datos
                      }
                    }}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white"
                  >
                    {uploadedColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {activeData.length > 0 && (
            <>
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  Configuración
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Título del Gráfico</label>
                    <input
                      type="text"
                      value={chartTitle}
                      onChange={(e) => setChartTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm font-bold text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Etiqueta Eje X</label>
                    <input
                      type="text"
                      value={xAxisLabel}
                      onChange={(e) => setXAxisLabel(e.target.value)}
                      placeholder={var1Label}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm font-bold text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Etiqueta Eje Y</label>
                    <input
                      type="text"
                      value={yAxisLabel}
                      onChange={(e) => setYAxisLabel(e.target.value)}
                      placeholder="Frecuencia"
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm font-bold text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Fondo del Gráfico</label>
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
                      <option value="#1e293b">Pizarra</option>
                      <option value="#000000">Negro</option>
                    </select>
                    <div
                      className="mt-2 h-8 rounded-lg border border-slate-600"
                      style={{ backgroundColor: chartBgColor }}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Tipo de Gráfico</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => { setChartType('grouped'); setChartKey(p => p + 1); }}
                        className={`p-3 rounded-lg font-bold text-xs ${chartType === 'grouped'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                          }`}
                      >
                        Agrupadas
                      </button>
                      <button
                        onClick={() => { setChartType('stacked'); setChartKey(p => p + 1); }}
                        className={`p-3 rounded-lg font-bold text-xs ${chartType === 'stacked'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                          }`}
                      >
                        Apiladas
                      </button>
                      <button
                        onClick={() => { setChartType('mosaic'); setChartKey(p => p + 1); }}
                        className={`p-3 rounded-lg font-bold text-xs ${chartType === 'mosaic'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                          }`}
                      >
                        Mosaico
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Paleta de Colores</label>
                    <select
                      value={colorPalette}
                      onChange={(e) => setColorPalette(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white"
                    >
                      {Object.entries(PALETTES).map(([k, p]) => (
                        <option key={k} value={k}>{p.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-1 mt-2">
                      {PALETTES[colorPalette].colors.map((c, i) => (
                        <div key={i} className="h-6 flex-1 rounded" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-8">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Eye className="w-6 h-6 text-indigo-400" />
                Visualización de Datos Categóricos
              </h3>
              {activeData.length > 0 && (
                <button
                  onClick={exportChart}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Download className="w-4 h-4" />
                  Exportar
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
              <div ref={chartRef} key={chartKey} style={{ backgroundColor: chartBgColor }} className="rounded-xl p-4">
                <div className="mb-4 text-center">
                  <h4 className="text-lg font-bold" style={{ color: chartBgColor === '#ffffff' || chartBgColor === '#f5f5f5' ? '#000' : '#fff' }}>
                    {chartTitle}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {var1Label} vs {var2Label} | n = {contingencyTable?.grand_total || 0}
                  </p>
                </div>

                {chartType === 'mosaic' ? (
                  <ResponsiveContainer width="100%" height={500}>
                    <Treemap
                      data={prepareMosaicData(activeData)}
                      dataKey="size"
                      stroke="#ffffff"
                      strokeWidth={3}
                      isAnimationActive={false}
                      content={(props) => {
                        const { x, y, width, height, name, value, index } = props;

                        if (!name || !value) return null;

                        const colors = PALETTES[colorPalette].colors;
                        const parts = name.split(" - ");
                        const label = parts[1] || parts[0];
                        const colorIndex = index % colors.length;

                        const percentage = contingencyTable
                          ? ((value / contingencyTable.grand_total) * 100).toFixed(1)
                          : "0.0";

                        if (width < 100 || height < 80) {
                          return (
                            <rect
                              x={x}
                              y={y}
                              width={width}
                              height={height}
                              fill={colors[colorIndex]}
                              stroke="#ffffff"
                              strokeWidth={3}
                            />
                          );
                        }

                        return (
                          <g>
                            <rect
                              x={x}
                              y={y}
                              width={width}
                              height={height}
                              fill={colors[colorIndex]}
                              stroke="#ffffff"
                              strokeWidth={3}
                            />

                            <text
                              x={x + width / 2}
                              y={y + height / 2 - 20}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="18"
                              fontWeight="bold"
                              style={{
                                textShadow: '2px 2px 4px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.7)',
                                paintOrder: 'stroke fill',
                                stroke: 'rgba(0,0,0,0.8)',
                                strokeWidth: '3px',
                                pointerEvents: 'none'
                              }}
                            >
                              {label}
                            </text>

                            <text
                              x={x + width / 2}
                              y={y + height / 2 + 5}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="16"
                              fontWeight="600"
                              style={{
                                textShadow: '2px 2px 4px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.7)',
                                paintOrder: 'stroke fill',
                                stroke: 'rgba(0,0,0,0.8)',
                                strokeWidth: '2px',
                                pointerEvents: 'none'
                              }}
                            >
                              n = {value}
                            </text>

                            <text
                              x={x + width / 2}
                              y={y + height / 2 + 28}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="15"
                              fontWeight="500"
                              style={{
                                textShadow: '2px 2px 4px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.7)',
                                paintOrder: 'stroke fill',
                                stroke: 'rgba(0,0,0,0.8)',
                                strokeWidth: '2px',
                                pointerEvents: 'none'
                              }}
                            >
                              {percentage}%
                            </text>
                          </g>
                        );
                      }}
                    />
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height={500}>
                    <BarChart
                      data={barData}
                      margin={{ top: 20, right: 30, left: 60, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="category"
                        tick={{ fill: chartBgColor === '#ffffff' || chartBgColor === '#f5f5f5' ? '#000' : '#94a3b8', fontSize: 11 }}
                        label={{
                          value: xAxisLabel || var1Label,
                          position: 'insideBottom',
                          offset: -10,
                          style: { fill: chartBgColor === '#ffffff' || chartBgColor === '#f5f5f5' ? '#000' : '#cbd5e1', fontWeight: 700, fontSize: 12 }
                        }}
                      />
                      <YAxis
                        tick={{ fill: chartBgColor === '#ffffff' || chartBgColor === '#f5f5f5' ? '#000' : '#94a3b8', fontSize: 11 }}
                        label={{
                          value: yAxisLabel,
                          angle: -90,
                          position: 'insideLeft',
                          style: { fill: chartBgColor === '#ffffff' || chartBgColor === '#f5f5f5' ? '#000' : '#cbd5e1', fontWeight: 700, fontSize: 12 }
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          border: '1px solid rgba(148, 163, 184, 0.3)',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="square"
                      />

                      {chartType === 'grouped' ? (
                        allCategories2.map((cat, idx) => (
                          <Bar
                            key={cat}
                            dataKey={cat}
                            fill={currentColors[idx % currentColors.length]}
                            radius={[8, 8, 0, 0]}
                          />
                        ))
                      ) : (
                        allCategories2.map((cat, idx) => (
                          <Bar
                            key={cat}
                            dataKey={cat}
                            stackId="a"
                            fill={currentColors[idx % currentColors.length]}
                          />
                        ))
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}

            {chiSquareResult && (
              <div className="mt-6 p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
                <h4 className="font-black text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  Resultados de Chi-Cuadrado (χ²)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Estadístico χ²</p>
                    <p className="text-2xl font-black text-indigo-400">{chiSquareResult.chi_square}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Grados de Libertad</p>
                    <p className="text-2xl font-black text-purple-400">{chiSquareResult.df}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">p-value</p>
                    <p className="text-2xl font-black text-pink-400">{chiSquareResult.p_value}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">V de Cramér</p>
                    <p className="text-2xl font-black text-cyan-400">{chiSquareResult.cramerV}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{chiSquareResult.effectInterpretation}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${chiSquareResult.significant
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-orange-500/10 border-orange-500/30'
                  }`}>
                  <div className="flex items-start gap-3">
                    {chiSquareResult.significant ? (
                      <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold text-white mb-2">
                        {chiSquareResult.significant ? 'Asociación Significativa' : 'Sin Asociación Significativa'}
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed">{interpretation}</p>
                      <div className="mt-3 p-3 bg-slate-900/30 rounded-lg">
                        <p className="text-xs text-slate-400 mb-2 font-bold uppercase">Interpretación de V de Cramér:</p>
                        <p className="text-sm text-slate-300">
                          Con V = {chiSquareResult.cramerV}, la fuerza de asociación es <strong className="text-cyan-400">{chiSquareResult.effectInterpretation.toLowerCase()}</strong>.
                          {parseFloat(chiSquareResult.cramerV) < 0.3 && ' Aunque existe evidencia estadística de asociación, el efecto es pequeño.'}
                          {parseFloat(chiSquareResult.cramerV) >= 0.3 && parseFloat(chiSquareResult.cramerV) < 0.5 && ' La asociación tiene un tamaño de efecto moderado, lo cual es notable.'}
                          {parseFloat(chiSquareResult.cramerV) >= 0.5 && ' La asociación es fuerte, indicando una relación sustancial entre las variables.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {contingencyTable && (
              <div className="mt-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-white">Tabla de Contingencia</h3>
                  <select
                    value={tableType}
                    onChange={(e) => setTableType(e.target.value)}
                    className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm font-bold"
                  >
                    <option value="frequency">Frecuencias</option>
                    <option value="percentTotal">% del Total</option>
                    <option value="percentRow">% por Fila</option>
                    <option value="percentColumn">% por Columna</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-slate-400 font-bold">{var1Label} / {var2Label}</th>
                        {categories2.map(cat => (
                          <th key={cat} className="text-center p-2 text-indigo-400 font-bold">{cat}</th>
                        ))}
                        <th className="text-center p-2 text-cyan-400 font-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories1.map(cat1 => (
                        <tr key={cat1} className="border-b border-slate-800">
                          <td className="p-2 font-bold text-white">{cat1}</td>
                          {categories2.map(cat2 => {
                            let displayValue;
                            if (tableType === 'frequency') {
                              displayValue = contingencyTable.table[cat1]?.[cat2] || 0;
                            } else if (tableType === 'percentTotal' && chiSquareResult) {
                              displayValue = (chiSquareResult.percentageTotal[cat1]?.[cat2] || 0).toFixed(2) + '%';
                            } else if (tableType === 'percentRow' && chiSquareResult) {
                              displayValue = (chiSquareResult.percentageRow[cat1]?.[cat2] || 0).toFixed(2) + '%';
                            } else if (tableType === 'percentColumn' && chiSquareResult) {
                              displayValue = (chiSquareResult.percentageColumn[cat1]?.[cat2] || 0).toFixed(2) + '%';
                            }
                            return (
                              <td key={cat2} className="text-center p-2 text-slate-300">
                                {displayValue}
                              </td>
                            );
                          })}
                          <td className="text-center p-2 font-bold text-cyan-400">
                            {tableType === 'frequency' ? (
                              contingencyTable.row_totals[cat1]
                            ) : tableType === 'percentRow' ? (
                              '100.00%'
                            ) : (
                              ((contingencyTable.row_totals[cat1] / contingencyTable.grand_total) * 100).toFixed(2) + '%'
                            )}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-800/30">
                        <td className="p-2 font-bold text-white">Total</td>
                        {categories2.map(cat2 => (
                          <td key={cat2} className="text-center p-2 font-bold text-indigo-400">
                            {tableType === 'frequency' ? (
                              contingencyTable.col_totals[cat2]
                            ) : tableType === 'percentColumn' ? (
                              '100.00%'
                            ) : (
                              ((contingencyTable.col_totals[cat2] / contingencyTable.grand_total) * 100).toFixed(2) + '%'
                            )}
                          </td>
                        ))}
                        <td className="text-center p-2 font-black text-purple-400">
                          {tableType === 'frequency' ? (
                            contingencyTable.grand_total
                          ) : (
                            '100.00%'
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // LAB 4.1 - PARTE 3 de 3 (FINAL)
  // Sección: renderPracticeTab() CON PRÁCTICA APLICADA + Render Principal
  // ============================================================
  // INSTRUCCIONES: 
  // 1. Esta es la ÚLTIMA parte
  // 2. Copia este contenido DESPUÉS de la Parte 2
  // 3. ¡Listo! Archivo completo
  // ============================================================

  // ============================================
  // RENDER: PRÁCTICA (CON QUIZ Y PRÁCTICA APLICADA)
  // ============================================

  const renderPracticeTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-3xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-green-500/20 rounded-xl">
            <Brain className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2">Modo Práctica</h2>
            <p className="text-slate-400">Pon a prueba tus conocimientos sobre variables categóricas</p>
          </div>
        </div>

        {/* SELECTOR DE MODO */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => {
              setPracticeMode('applied');
              setAppliedFeedback(null);
            }}
            className={`flex-1 px-6 py-4 rounded-xl font-black text-sm transition-all ${practiceMode === 'applied'
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
          >
            <Target className="w-5 h-5 inline-block mr-2" />
            Práctica Aplicada
          </button>
          <button
            onClick={() => {
              setPracticeMode('quiz');
              setPracticeResults({});
              setPracticeAnswers({});
            }}
            className={`flex-1 px-6 py-4 rounded-xl font-black text-sm transition-all ${practiceMode === 'quiz'
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
          >
            <Brain className="w-5 h-5 inline-block mr-2" />
            Quiz Teórico
          </button>
        </div>

        {/* MODO: PRÁCTICA APLICADA */}
        {practiceMode === 'applied' && (
          <div className="space-y-6">
            {/* Instrucciones */}
            <div className="p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-2">📊 Analiza el Dataset Actual</h4>
                  <p className="text-sm text-slate-300">
                    Usa los datos que seleccionaste en la pestaña <strong className="text-cyan-400">"Análisis"</strong> para responder las siguientes preguntas.
                  </p>
                  {activeData.length === 0 && (
                    <p className="text-sm text-orange-400 mt-2">
                      ⚠️ No hay dataset seleccionado. Ve a "Análisis" y elige uno.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {activeData.length > 0 && (
              <>
                {/* Resumen del dataset */}
                <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700">
                  <h4 className="font-bold text-white mb-3">Dataset: {datasetLabel}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Variable 1:</span>
                      <span className="text-white font-bold ml-2">{var1Label}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Variable 2:</span>
                      <span className="text-white font-bold ml-2">{var2Label}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">n total:</span>
                      <span className="text-white font-bold ml-2">{contingencyTable?.grand_total || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Categorías:</span>
                      <span className="text-white font-bold ml-2">{categories1.length} × {categories2.length}</span>
                    </div>
                  </div>
                </div>

                {/* Preguntas */}
                <div className="space-y-5">
                  {/* Pregunta 1 */}
                  <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-700">
                    <h4 className="font-bold text-white mb-4">
                      1️⃣ Observa la tabla de contingencia. ¿Existe asociación estadísticamente significativa? (α = 0.05)
                    </h4>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setAppliedConcept({ ...appliedConcept, hasAssociation: 'si' })}
                        className={`flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all ${appliedConcept.hasAssociation === 'si'
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                      >
                        ✅ Sí, existe asociación
                      </button>
                      <button
                        onClick={() => setAppliedConcept({ ...appliedConcept, hasAssociation: 'no' })}
                        className={`flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all ${appliedConcept.hasAssociation === 'no'
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                      >
                        ❌ No, son independientes
                      </button>
                    </div>
                  </div>

                  {/* Pregunta 2 */}
                  <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-700">
                    <h4 className="font-bold text-white mb-4">
                      2️⃣ ¿Qué tan fuerte es la asociación? (según V de Cramér)
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'muy_debil', label: 'Muy débil (V < 0.1)', color: 'slate' },
                        { id: 'debil', label: 'Débil (0.1 ≤ V < 0.3)', color: 'yellow' },
                        { id: 'moderada', label: 'Moderada (0.3 ≤ V < 0.5)', color: 'orange' },
                        { id: 'fuerte', label: 'Fuerte (V ≥ 0.5)', color: 'red' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setAppliedConcept({ ...appliedConcept, cramerStrength: opt.id })}
                          className={`px-4 py-3 rounded-lg font-bold text-sm transition-all ${appliedConcept.cramerStrength === opt.id
                            ? (opt.color === 'slate' ? 'bg-slate-500' :
                              opt.color === 'yellow' ? 'bg-yellow-500' :
                                opt.color === 'orange' ? 'bg-orange-500' : 'bg-red-500') + ' text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pregunta 3 */}
                  <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-700">
                    <h4 className="font-bold text-white mb-4">
                      3️⃣ ¿Cuál es la combinación más frecuente?
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {categories1.flatMap(cat1 =>
                        categories2.map(cat2 => {
                          const key = `${cat1}-${cat2}`;
                          const count = contingencyTable?.table[cat1]?.[cat2] || 0;
                          return (
                            <button
                              key={key}
                              onClick={() => setAppliedConcept({ ...appliedConcept, mostFrequent: key })}
                              className={`px-4 py-3 rounded-lg font-bold text-sm transition-all text-left ${appliedConcept.mostFrequent === key
                                ? 'bg-purple-500 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                              <div>{cat1}</div>
                              <div className="text-xs opacity-70">{cat2}</div>
                              <div className="text-xs mt-1">n = {count}</div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Botón Verificar */}
                <div className="flex justify-center">
                  <button
                    onClick={checkAppliedAnswers}
                    disabled={!appliedConcept.hasAssociation || !appliedConcept.cramerStrength || !appliedConcept.mostFrequent}
                    className="px-8 py-4 bg-green-500 hover:bg-green-600 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-black text-white flex items-center gap-2 transition-all shadow-lg"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Verificar Respuestas
                  </button>
                </div>

                {/* Feedback */}
                {appliedFeedback && (
                  <div className={`p-6 rounded-2xl border-2 ${appliedFeedback.ok
                    ? 'bg-green-500/10 border-green-500/50'
                    : appliedFeedback.msg
                      ? 'bg-orange-500/10 border-orange-500/50'
                      : 'bg-red-500/10 border-red-500/50'
                    }`}>
                    {appliedFeedback.msg ? (
                      <p className="text-orange-300 font-bold">{appliedFeedback.msg}</p>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-black text-white">Resultados</h3>
                          <div className="text-3xl font-black text-cyan-400">
                            {appliedFeedback.score} / {appliedFeedback.total}
                          </div>
                        </div>

                        <div className="space-y-3">
                          {/* Asociación */}
                          <div className={`p-4 rounded-lg ${appliedFeedback.details.hasAssociation.correct
                            ? 'bg-green-500/20 border border-green-500/30'
                            : 'bg-red-500/20 border border-red-500/30'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                              {appliedFeedback.details.hasAssociation.correct ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-400" />
                              )}
                              <span className="font-bold text-white">Asociación Significativa</span>
                            </div>
                            <p className="text-sm text-slate-300">
                              {appliedFeedback.details.hasAssociation.real ? (
                                <>✅ Sí existe asociación (p = {appliedFeedback.pValue} &lt; 0.05)</>
                              ) : (
                                <>❌ No hay asociación (p = {appliedFeedback.pValue} ≥ 0.05)</>
                              )}
                            </p>
                          </div>

                          {/* V de Cramér */}
                          <div className={`p-4 rounded-lg ${appliedFeedback.details.cramerStrength.correct
                            ? 'bg-green-500/20 border border-green-500/30'
                            : 'bg-red-500/20 border border-red-500/30'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                              {appliedFeedback.details.cramerStrength.correct ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-400" />
                              )}
                              <span className="font-bold text-white">Fuerza de Asociación</span>
                            </div>
                            <p className="text-sm text-slate-300">
                              V de Cramér = {appliedFeedback.cramerV} →
                              {appliedFeedback.details.cramerStrength.real === 'muy_debil' && ' Muy débil'}
                              {appliedFeedback.details.cramerStrength.real === 'debil' && ' Débil'}
                              {appliedFeedback.details.cramerStrength.real === 'moderada' && ' Moderada'}
                              {appliedFeedback.details.cramerStrength.real === 'fuerte' && ' Fuerte'}
                            </p>
                          </div>

                          {/* Más frecuente */}
                          <div className={`p-4 rounded-lg ${appliedFeedback.details.mostFrequent.correct
                            ? 'bg-green-500/20 border border-green-500/30'
                            : 'bg-red-500/20 border border-red-500/30'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                              {appliedFeedback.details.mostFrequent.correct ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-400" />
                              )}
                              <span className="font-bold text-white">Combinación Más Frecuente</span>
                            </div>
                            <p className="text-sm text-slate-300">
                              {appliedFeedback.details.mostFrequent.real.replace('-', ' → ')} con n = {appliedFeedback.details.mostFrequent.count}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setAppliedFeedback(null);
                            setAppliedConcept({
                              hasAssociation: null,
                              cramerStrength: null,
                              mostFrequent: null
                            });
                          }}
                          className="mt-4 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-bold text-white transition-all"
                        >
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

        {/* MODO: QUIZ TEÓRICO */}
        {practiceMode === 'quiz' && (
          <>
            {Object.keys(practiceResults).length > 0 && (
              <div className="mb-6 p-6 bg-slate-900/50 rounded-xl border-2 border-indigo-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white mb-1">Resultado Final</h3>
                    <p className="text-sm text-slate-400">{practiceScore} de {PRACTICE_QUESTIONS.length} correctas</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-indigo-400">
                      {((practiceScore / PRACTICE_QUESTIONS.length) * 100).toFixed(0)}%
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {practiceScore === PRACTICE_QUESTIONS.length ? (
                        <>
                          <Award className="w-4 h-4 text-yellow-400" />
                          <span className="text-xs text-yellow-400 font-bold">¡Perfecto!</span>
                        </>
                      ) : practiceScore >= PRACTICE_QUESTIONS.length * 0.7 ? (
                        <span className="text-xs text-green-400 font-bold">¡Muy bien!</span>
                      ) : (
                        <span className="text-xs text-orange-400 font-bold">Sigue practicando</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {PRACTICE_QUESTIONS.map((q, qIdx) => {
                const result = practiceResults[q.id];

                return (
                  <div
                    key={q.id}
                    className={`bg-slate-900/50 rounded-2xl p-6 border-2 transition-all ${result
                      ? (result.correct ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5')
                      : 'border-slate-700 hover:border-slate-600'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${result
                        ? (result.correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                        : 'bg-indigo-500 text-white'
                        }`}>
                        {result ? (result.correct ? '✓' : '✗') : qIdx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-3">{q.question}</h4>
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
                                  ? isCorrect
                                    ? 'border-green-500 bg-green-500/10'
                                    : isSelected
                                      ? 'border-red-500 bg-red-500/10'
                                      : 'border-slate-700 bg-slate-800/30'
                                  : isSelected
                                    ? 'border-indigo-500 bg-indigo-500/10'
                                    : 'border-slate-700 bg-slate-800/50 hover:border-indigo-500/50 hover:bg-slate-800'
                                  } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${showResult
                                    ? (isCorrect ? 'bg-green-500 text-white' : isSelected ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-400')
                                    : isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'
                                    }`}>
                                    {String.fromCharCode(65 + idx)}
                                  </div>
                                  <span className={`text-sm ${showResult && isCorrect ? 'text-green-400 font-bold' : 'text-slate-300'}`}>
                                    {opt}
                                  </span>
                                  {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />}
                                  {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 ml-auto" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {result && !result.correct && (
                          <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                            <p className="text-sm text-indigo-300">
                              <strong className="text-indigo-400">Explicación:</strong> {q.explanation}
                            </p>
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
                <button
                  onClick={checkPracticeAnswers}
                  className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-black text-white flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all"
                >
                  <CheckCircle className="w-5 h-5" />
                  Verificar Respuestas
                </button>
              </div>
            )}

            {Object.keys(practiceResults).length > 0 && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => {
                    setPracticeAnswers({});
                    setPracticeResults({});
                    setPracticeScore(0);
                  }}
                  className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-black text-white flex items-center gap-2 transition-all"
                >
                  <Zap className="w-5 h-5" />
                  Intentar de Nuevo
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
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
                bg-white/5 hover:bg-orange-500/10 
                border border-white/10 hover:border-orange-500/40
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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xs text-orange-400 font-bold block uppercase">Capítulo 4</span>
                <span className="font-black text-white block text-sm">Estadística con Dos Variables</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs text-orange-400 font-black uppercase">Lab 4.1</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8 relative">
        <section className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 border-l-4 border-l-orange-500 relative overflow-hidden">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <div className="w-64 h-64 rounded-3xl border-8 border-orange-400 flex items-center justify-center">
              <Activity className="w-40 h-40 text-orange-400" />
            </div>
          </div>
          <div className="flex items-start gap-6 relative z-10">
            <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl border border-orange-500/30 shrink-0">
              <Grid className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-black text-orange-500 uppercase bg-orange-500/10 px-3 py-1 rounded-full">
                  Sección 4.1
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">4.1 Dos Variables Cualitativas</h2>
              <p className="text-slate-400 leading-relaxed max-w-3xl">
                Aprende a analizar la relación entre dos variables categóricas usando <strong className="text-white">tablas de contingencia</strong>,
                <strong className="text-white"> gráficos de barras</strong> y la <strong className="text-white">prueba Chi-Cuadrado</strong>.
              </p>
            </div>
          </div>
        </section>

        <div className="flex gap-3 border-b border-white/10 pb-4 flex-wrap">
          {[
            { id: 'intro', label: 'Introducción', icon: Info },
            { id: 'datasets', label: 'Análisis', icon: Database },
            { id: 'practice', label: 'Práctica', icon: Brain }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === tab.id
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'intro' && renderIntroTab()}
        {activeTab === 'datasets' && renderDatasetsTab()}
        {activeTab === 'practice' && renderPracticeTab()}
      </main>
    </div>
  );
};

export default Lab4_1;

