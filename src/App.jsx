import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart3, Calculator, TrendingUp, Mail, Play,
  CheckCircle2, ArrowRight, Database, Quote, Share2,
  Sparkles, BookOpen, Layers, Activity, PieChart,
  TrendingDown, Target, ChevronDown, Users
} from 'lucide-react';

import statlabLogo from './assets/logo-statlab.png';
import LabRenderer from "./labs/LabRenderer";
import Lab0_2 from "./labs/chapter0/Lab0_2";

// ============================================================
// ESTRUCTURA DEL CURSO
// ============================================================
const BOOK_STRUCTURE = [
  {
    chapter: 0,
    title: "Presentación del Curso",
    icon: <BookOpen className="w-6 h-6" />,
    color: "from-slate-500 to-gray-600",
    sections: [
      { id: "0.1", title: "Bienvenida al curso", hasLab: false },
      { id: "0.2", title: "Laboratorio de prácticas (presentación)", hasLab: true }
    ]
  },
  {
    chapter: 1,
    title: "Introducción a la Estadística",
    icon: <Sparkles className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-600",
    sections: [
      { id: "1.1", title: "Definición de estadística", hasLab: false },
      { id: "1.2", title: "La población y la muestra", hasLab: true },
    ]
  },
  {
    chapter: 2,
    title: "Estadística con Gráficos",
    icon: <BarChart3 className="w-6 h-6" />,
    color: "from-purple-500 to-pink-600",
    sections: [
      { id: "2.1", title: "Tipos de datos", hasLab: true },
      { id: "2.2", title: "Gráficos de datos cualitativos (categóricos)", hasLab: true },
      { id: "2.3", title: "Gráficos de datos cuantitativos (numéricos)", hasLab: true },
      { id: "2.4", title: "Histogramas", hasLab: true }
    ]
  },
  {
    chapter: 3,
    title: "Estadística con Números",
    icon: <Calculator className="w-6 h-6" />,
    color: "from-emerald-500 to-teal-600",
    sections: [
      { id: "3.1", title: "Medidas de tendencia central", hasLab: true },
      { id: "3.2", title: "Medidas de dispersión", hasLab: true },
      { id: "3.3", title: "Medidas de posición relativa", hasLab: true }
    ]
  },
  {
    chapter: 4,
    title: "Estadística con Dos Variables",
    icon: <Activity className="w-6 h-6" />,
    color: "from-orange-500 to-red-600",
    sections: [
      { id: "4.1", title: "Dos variables cualitativas", hasLab: true },
      { id: "4.2", title: "Dos variables cuantitativas", hasLab: true },
      { id: "4.3", title: "Dos variables: cualitativa y cuantitativa", hasLab: true }
    ]
  },
  {
    chapter: 5,
    title: "Distribuciones de Probabilidad Discretas",
    icon: <PieChart className="w-6 h-6" />,
    color: "from-indigo-500 to-purple-600",
    sections: [
      { id: "5.1", title: "Conceptos Básicos", hasLab: true },
      { id: "5.2", title: "Distribución Binomial", hasLab: true },
      { id: "5.3", title: "Distribución Uniforme", hasLab: true },
      { id: "5.4", title: "Distribución de Poisson", hasLab: true },
      { id: "5.5", title: "Distribución Hipergeométrica", hasLab: true },
      { id: "5.6", title: "Distribución Normal", hasLab: true }
    ]
  },
  {
    chapter: 6,
    title: "Distribuciones Muestrales",
    icon: <Layers className="w-6 h-6" />,
    color: "from-pink-500 to-rose-600",
    sections: [
      { id: "6.1", title: "Métodos de Muestreo", hasLab: true },
      { id: "6.2", title: "Distribuciones Muestrales", hasLab: true }
    ]
  },
  {
    chapter: 7,
    title: "Inferencia Estadística",
    icon: <Target className="w-6 h-6" />,
    color: "from-cyan-500 to-blue-600",
    sections: [
      { id: "7.1", title: "Introducción", hasLab: false },
      { id: "7.2", title: "Estimación Puntual", hasLab: true },
      { id: "7.3", title: "Estimación de Intervalo", hasLab: true },
      { id: "7.4", title: "Estimación de la Diferencia", hasLab: true }
    ]
  },
  {
    chapter: 8,
    title: "Pruebas de Hipótesis (Muestras Grandes)",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "from-violet-500 to-purple-600",
    sections: [
      { id: "8.1", title: "Introducción", hasLab: false },
      { id: "8.2", title: "Prueba de Hipótesis para la Media Poblacional", hasLab: true },
      { id: "8.3", title: "Diferencia entre dos Medias Poblacionales", hasLab: true },
      { id: "8.4", title: "Prueba de Hipótesis para una Proporción Binomial", hasLab: true },
      { id: "8.5", title: "Diferencia entre dos Proporciones Binomiales", hasLab: true }
    ]
  },
  {
    chapter: 9,
    title: "Inferencia a partir de Muestras Pequeñas",
    icon: <TrendingDown className="w-6 h-6" />,
    color: "from-amber-500 to-orange-600",
    sections: [
      { id: "9.1", title: "Distribución t de Student", hasLab: true },
      { id: "9.2", title: "Inferencias de una Media Poblacional", hasLab: true },
      { id: "9.3", title: "Inferencias para la Diferencia Entre Dos Medias", hasLab: true },
      { id: "9.4", title: "Inferencias de la Varianza Poblacional", hasLab: true },
      { id: "9.5", title: "Comparación de Dos Varianzas Poblacionales", hasLab: true }
    ]
  },
  {
    chapter: 10,
    title: "Análisis de Varianza",
    icon: <Activity className="w-6 h-6" />,
    color: "from-red-500 to-pink-600",
    sections: [
      { id: "10.1", title: "Introducción al ANOVA", hasLab: false },
      { id: "10.2", title: "Conceptos y Suposiciones", hasLab: true },
      { id: "10.3", title: "ANOVA de un Factor (One-way ANOVA)", hasLab: true },
      { id: "10.4", title: "Pruebas Post-Hoc (Comparaciones Múltiples)", hasLab: true }
    ]
  },
  {
    chapter: 11,
    title: "Regresión Lineal",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "from-green-500 to-emerald-600",
    sections: [
      { id: "11.1", title: "Introducción", hasLab: false },
      { id: "11.2", title: "La línea recta", hasLab: true },
      { id: "11.3", title: "Mínimos cuadrados", hasLab: true },
      { id: "11.4", title: "Modelo de regresión lineal", hasLab: true },
      { id: "11.5", title: "Análisis de correlación", hasLab: true }
    ]
  },
  {
    chapter: 12,
    title: "Regresión Múltiple",
    icon: <Activity className="w-6 h-6" />,
    color: "from-teal-500 to-cyan-600",
    sections: [
      { id: "12.1", title: "Introducción", hasLab: false },
      { id: "12.2", title: "Modelo de regresión múltiple", hasLab: true },
      { id: "12.3", title: "Modelo de regresión polinomial", hasLab: true },
      { id: "12.4", title: "Variables predictoras en un modelo de regresión", hasLab: true },
      { id: "12.5", title: "Interpretación de gráficas residuales", hasLab: true }
    ]
  },
  {
    chapter: 13,
    title: "Análisis de Datos Categóricos",
    icon: <PieChart className="w-6 h-6" />,
    color: "from-fuchsia-500 to-purple-600",
    sections: [
      { id: "13.1", title: "Introducción", hasLab: false },
      { id: "13.2", title: "Estadística chi cuadrada de Pearson", hasLab: true },
      { id: "13.3", title: "Prueba de bondad del ajuste", hasLab: true }
    ]
  }
];

const PALETTES = {
  modern: { name: 'Moderno', colors: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'] },
  neon: { name: 'Neón', colors: ['#00d2ff', '#3a7bd5', '#9d50bb', '#6e48aa', '#ff0080'] },
  sunset: { name: 'Atardecer', colors: ['#ff6b6b', '#f06595', '#cc5de8', '#845ef7', '#5c7cfa'] },
  forest: { name: 'Bosque', colors: ['#12b886', '#20c997', '#51cf66', '#94d82d', '#ffd43b'] },
  ocean: { name: 'Océano', colors: ['#1971c2', '#1864ab', '#1098ad', '#0c8599', '#0b7285'] }
};

const BACKGROUND_COLORS = {
  dark: { name: 'Oscuro', color: '#020617' },
  slate: { name: 'Pizarra', color: '#1e293b' },
  gray: { name: 'Gris', color: '#374151' },
  white: { name: 'Blanco', color: '#ffffff' },
  cream: { name: 'Crema', color: '#fef3c7' },
  blue: { name: 'Azul', color: '#1e3a8a' },
  purple: { name: 'Púrpura', color: '#581c87' }
};

const App = () => {
  const [view, setView] = useState('home');
  const [selectedSection, setSelectedSection] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(null);

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [copySuccess, setCopySuccess] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showStats, setShowStats] = useState(true);

  const [config, setConfig] = useState({
    xAxis: '',
    yAxis: '',
    chartTitle: 'Análisis de Datos',
    xAxisLabel: 'Eje X',
    yAxisLabel: 'Eje Y',
    chartType: 'bar',
    colorPalette: 'modern',
    backgroundColor: 'dark',
    showGrid: true,
    showLegend: true,
    animationDuration: 1000
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sectionId = params.get('section');
    if (sectionId) {
      setSelectedSection(sectionId);
      setView('lab');
    }
  }, []);

  const activeSectionData = useMemo(() => {
    if (!selectedSection) return null;
    for (const chapter of BOOK_STRUCTURE) {
      const section = chapter.sections.find(s => s.id === selectedSection);
      if (section) return { ...section, chapter };
    }
    return null;
  }, [selectedSection]);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      setTimeout(() => {
        const text = e.target?.result || "";
        const lines = String(text).split('\n').filter(line => line.trim());

        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim());
          const parsedData = lines.slice(1).map((line, index) => {
            const values = line.split(',').map(v => v.trim());
            const row = { id: index };
            headers.forEach((header, i) => {
              row[header] = values[i];
            });
            return row;
          });

          setData(parsedData);
          setColumns(headers);

          setConfig(prev => ({
            ...prev,
            xAxis: '',
            yAxis: '',
            xAxisLabel: '',
            yAxisLabel: '',
            chartTitle: `Sección ${selectedSection}: ${activeSectionData?.title || 'Análisis'}`
          }));
        }

        setIsUploading(false);
      }, 800);
    };
    reader.readAsText(file);
  };

  const copyToClipboard = (sectionId) => {
    const url = `${window.location.origin}${window.location.pathname}?section=${sectionId}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(sectionId);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const chartData = useMemo(() => {
    if (!config.yAxis) return data;
    return data.map(row => ({
      ...row,
      [config.yAxis]: parseFloat(String(row[config.yAxis])) || 0
    }));
  }, [data, config.yAxis]);

  const stats = useMemo(() => {
    if (!data.length || !config.yAxis) return null;
    const values = data
      .map(d => parseFloat(String(d[config.yAxis])))
      .filter(v => !isNaN(v));
    if (!values.length) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return {
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      stdDev: stdDev.toFixed(2),
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
      count: values.length
    };
  }, [data, config.yAxis]);

  const downloadChart = () => {
    const svg = document.querySelector('.recharts-wrapper svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 1600;
    canvas.height = 900;

    img.onload = () => {
      const bgColor = BACKGROUND_COLORS[config.backgroundColor]?.color || "#020617";
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 50, 50, canvas.width - 100, canvas.height - 100);
      }

      const link = document.createElement('a');
      link.download = `Seccion_${selectedSection}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const xKey = config.xAxis;
      return (
        <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl shadow-indigo-500/20">
          <p className="text-white font-bold text-sm mb-2">
            {xKey ? payload[0].payload?.[xKey] : "Dato"}
          </p>
          <p className="text-indigo-400 font-black text-2xl">
            {Number(payload[0].value).toFixed(2)}
          </p>
          <p className="text-slate-500 text-xs mt-1 font-semibold uppercase tracking-wider">
            {config.yAxis || "Y"}
          </p>
        </div>
      );
    }
    return null;
  };

  // ============================================================
  // DEVELOPERS VIEW
  // ============================================================
  if (view === 'developers') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/10 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 shadow-2xl shadow-black/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setView('home');
                  window.history.pushState({}, '', window.location.pathname);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-all group"
              >
                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Volver al Inicio
              </button>

              <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-xs text-purple-400 font-black uppercase tracking-wider">Equipo Core</span>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-6 py-16 space-y-16 relative">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">
              Equipo de Ingeniería
            </h1>
            <p className="text-lg text-indigo-400 font-black uppercase tracking-[0.3em]">
              StatLab Research & Analytics Core Team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass rounded-3xl p-10 border border-blue-500/20 relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/20 transition-all">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Calculator className="w-32 h-32" />
              </div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute -inset-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-opacity"></div>
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-black shadow-2xl relative">
                    LC
                  </div>
                </div>
                <h3 className="text-3xl font-black text-white mb-2">Luis Corona Alcantar</h3>
                <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6">
                  <span className="text-blue-400 font-black text-xs uppercase tracking-wider">Director de Investigación</span>
                </div>
                <div className="bg-slate-900/50 rounded-2xl p-6 mb-6 border border-white/5">
                  <Quote className="w-6 h-6 text-blue-400/40 mb-3" />
                  <p className="text-slate-300 italic leading-relaxed text-sm">
                    "La estadística no miente, solo espera ser interpretada por los ojos correctos."
                  </p>
                </div>
                <a
                  href="mailto:lca1643@gmail.com"
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group/btn"
                >
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-bold text-slate-300 group-hover/btn:text-white">lca1643@gmail.com</span>
                </a>
              </div>
            </div>

            <div className="glass rounded-3xl p-10 border border-pink-500/20 relative overflow-hidden group hover:shadow-2xl hover:shadow-pink-500/20 transition-all">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <BarChart3 className="w-32 h-32" />
              </div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute -inset-3 bg-gradient-to-br from-pink-500 to-fuchsia-500 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-opacity"></div>
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-500 flex items-center justify-center text-white text-4xl font-black shadow-2xl relative">
                    PH
                  </div>
                </div>
                <h3 className="text-3xl font-black text-white mb-2">Patricia Herrejón Calderón</h3>
                <div className="px-4 py-1.5 bg-pink-500/10 border border-pink-500/30 rounded-full mb-6">
                  <span className="text-pink-400 font-black text-xs uppercase tracking-wider">Arquitecta de Software</span>
                </div>
                <div className="bg-slate-900/50 rounded-2xl p-6 mb-6 border border-white/5">
                  <Quote className="w-6 h-6 text-pink-400/40 mb-3" />
                  <p className="text-slate-300 italic leading-relaxed text-sm">
                    "Creamos herramientas que transforman datos complejos en decisiones estratégicas."
                  </p>
                </div>
                <a
                  href="mailto:phc.research.analytics@gmail.com"
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group/btn"
                >
                  <Mail className="w-4 h-4 text-pink-400" />
                  <span className="text-sm font-bold text-slate-300 group-hover/btn:text-white">phc.research.analytics@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-10 border-l-4 border-l-indigo-500">
            <h2 className="text-2xl font-black text-white mb-6">Sobre el Equipo</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              StatLab Research & Analytics es el resultado de la colaboración entre especialistas en estadística aplicada y desarrollo de software.
              Nuestro objetivo es democratizar el análisis de datos mediante herramientas accesibles, precisas y elegantes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
                <div className="text-3xl font-black text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text mb-2">2026</div>
                <p className="text-slate-500 text-sm font-bold">Fundación del Proyecto</p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
                <div className="text-3xl font-black text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text mb-2">13+</div>
                <p className="text-slate-500 text-sm font-bold">Capítulos de Contenido</p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
                <div className="text-3xl font-black text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text mb-2">50+</div>
                <p className="text-slate-500 text-sm font-bold">Laboratorios Interactivos</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-10 border border-indigo-500/20 text-center">
            <h3 className="text-2xl font-black text-white mb-4">¿Tienes preguntas o sugerencias?</h3>
            <p className="text-slate-400 mb-6">Nuestro equipo está disponible para ayudarte</p>
            <a
              href="mailto:statlabresearch2025@gmail.com"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:shadow-2xl hover:shadow-indigo-500/50 transition-all hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              statlabresearch2025@gmail.com
            </a>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================
  // LABS ROUTER (ÚNICO)  ✅ (con navegación consistente + props a labs)
  // ============================================================

  const goHome = (e) => {
    // ✅ por si el botón vive dentro de <form> o <a>
    if (e?.preventDefault) e.preventDefault();
    if (e?.stopPropagation) e.stopPropagation();

    setView("home");
    setSelectedSection(null);

    // ✅ limpiar querystring
    window.history.pushState({}, "", window.location.pathname);

    // ✅ reset scroll
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToSection = (sectionId, e) => {
    if (e?.preventDefault) e.preventDefault();
    if (e?.stopPropagation) e.stopPropagation();

    setSelectedSection(sectionId);
    setView("lab");

    window.history.pushState({}, "", `?section=${sectionId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (view === "lab") {
    // 0.1 Bienvenida (LabRenderer)
    if (selectedSection === "0.1") {
  return (
    <LabRenderer
      labKey="chapter0/Lab0_1"
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-200 p-10">
          <h2 className="text-2xl font-black text-white">Cargando…</h2>
        </div>
      }
      // ✅ CORRECTO: props directas (sin objeto "props")
      goHome={goHome}
      goToSection={goToSection}
      setView={setView}
      setSelectedSection={setSelectedSection}
      selectedSection={selectedSection}
      activeSectionData={activeSectionData}
    />
  );
}

    // 0.2 Presentación (Lab0_2 directo)
    if (selectedSection === "0.2" && activeSectionData) {
      return (
        <Lab0_2
          // ✅ agrega goHome / goToSection para que los botones funcionen igual
          goHome={goHome}
          goToSection={goToSection}
          setView={setView}
          setSelectedSection={setSelectedSection}
          selectedSection={selectedSection}
          activeSectionData={activeSectionData}
          data={data}
          columns={columns}
          fileName={fileName}
          isUploading={isUploading}
          handleFileUpload={handleFileUpload}
          config={config}
          setConfig={setConfig}
          chartData={chartData}
          stats={stats}
          showStats={showStats}
          setShowStats={setShowStats}
          PALETTES={PALETTES}
          BACKGROUND_COLORS={BACKGROUND_COLORS}
          downloadChart={downloadChart}
          CustomTooltip={CustomTooltip}
        />
      );
    }
    
        // 1.1 Definición de estadística (LabRenderer)
    if (selectedSection === "1.1") {
      return (
        <LabRenderer
        labKey="chapter1/Lab1_1"
        fallback={
        <div className="min-h-screen bg-slate-950 text-slate-200 p-10">
           <h2 className="text-2xl font-black text-white">Cargando…</h2>
        </div>
      }
      goHome={goHome}
      goToSection={goToSection}
      setView={setView}
      setSelectedSection={setSelectedSection}
      selectedSection={selectedSection}
      activeSectionData={activeSectionData}
    />
  );
  }
    
    // 1.2 Población y muestra (LabRenderer)
if (selectedSection === "1.2") {
  return (
    <LabRenderer
      labKey="chapter1/Lab1_2"
      fallback={
      <div className="min-h-screen bg-slate-950 text-slate-200 p-10">
         <h2 className="text-2xl font-black text-white">Cargando…</h2>
      </div>
    }
    goHome={goHome}
    goToSection={goToSection}
    setView={setView}
 />
);
}

    // Cualquier otra sección aún no conectada
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center px-6">
        <div className="glass rounded-3xl p-8 border border-white/10 max-w-xl w-full text-center">
          <p className="text-white font-black text-xl mb-2">Laboratorio en construcción</p>
          <p className="text-slate-400 font-medium">
            La sección <span className="text-indigo-400 font-black">{selectedSection}</span> aún no está conectada.
          </p>

          <button
            type="button"                 // ✅ evita submit accidental si hay <form>
            onClick={goHome}              // ✅ usa el handler único
            className="mt-6 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-sm"
          >
            Volver al índice
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // HOME VIEW
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 shadow-2xl shadow-black/20">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 p-0.5 shadow-2xl">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
                  <img
                    src={statlabLogo}
                    alt="StatLab logo"
                    className="w-full h-full object-cover scale-150 translate-y-0.5"
                  />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-white leading-none tracking-tight">StatLab</h1>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">Research & Analytics</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-400">
            <button
              onClick={() => {
                const el = document.getElementById('chapters');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors"
            >
              Laboratorios
            </button>
            <button
              onClick={() => setView('developers')}
              className="hover:text-white transition-colors"
            >
              Desarrolladores
            </button>
            <a
              href="https://www.udemy.com/course/fundamentos-de-estadistica/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:shadow-indigo-500/30 transition-all"
            >
              Curso Udemy
            </a>
          </div>
        </div>
      </header>

      <section className="relative pt-32 pb-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-5 py-2.5 rounded-full text-[10px] font-black text-indigo-400 mb-12 hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4" />
            LABORATORIOS INTERACTIVOS DEL CURSO DE UDEMY
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>

          <h2 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter text-white">
            Fundamentos de<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent italic">
              Estadística
            </span>
          </h2>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
            Herramienta especializada en análisis estadístico descriptivo e inferencial.
            Combina precisión técnica con una interfaz intuitiva para la exploración y visualización profesional de datos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button
              onClick={() => {
                const el = document.getElementById('chapters');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center justify-center gap-3 group"
            >
              <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
              Ver Capítulos
            </button>
            <a
              href="mailto:statlabresearch2025@gmail.com"
              className="w-full sm:w-auto glass-hover border border-white/10 px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all hover:scale-105 flex items-center justify-center gap-3 group text-white hover:bg-white/5"
            >
              Contacto
              <Mail className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      <section id="chapters" className="max-w-7xl mx-auto px-6 mb-40">
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Índice del Curso</span>
          </div>
          <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">Capítulos y Laboratorios</h3>
          <p className="text-slate-500 text-lg max-w-2xl font-medium leading-relaxed">
            Selecciona el capítulo y la sección correspondiente a tu clase actual para acceder al laboratorio interactivo.
          </p>
        </div>

        <div className="space-y-6">
          {BOOK_STRUCTURE.map((chapter, idx) => (
            <div
              key={chapter.chapter}
              className="glass rounded-3xl overflow-hidden border border-white/10 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <button
                onClick={() => setExpandedChapter(expandedChapter === chapter.chapter ? null : chapter.chapter)}
                className="w-full p-8 flex items-center justify-between group hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${chapter.color} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
                    <div className="text-white">{chapter.icon}</div>
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-black text-indigo-500 uppercase tracking-wider block mb-1">
                      Capítulo {chapter.chapter}
                    </span>
                    <h4 className="text-2xl font-black text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                      {chapter.title}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1 font-semibold">
                      {chapter.sections.filter(s => s.hasLab).length} laboratorios disponibles
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform ${expandedChapter === chapter.chapter ? 'rotate-180' : ''}`} />
              </button>

              {expandedChapter === chapter.chapter && (
                <div className="px-8 pb-8 space-y-3 border-t border-white/5 pt-6">
                  {chapter.sections.map((section) => (
                    <div
                      key={section.id}
                      className="group/section flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 hover:bg-slate-900 transition-all"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-xs font-black text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-lg">
                          {section.id}
                        </span>
                        <span className="text-slate-300 font-bold group-hover/section:text-white transition-colors">
                          {section.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(section.id);
                          }}
                          title="Copiar enlace"
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                        >
                          {copySuccess === section.id ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Share2 className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSection(section.id);
                            setView('lab');
                            window.scrollTo(0, 0);
                            window.history.pushState({}, '', `?section=${section.id}`);
                          }}
                          className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2 group-hover/section:scale-105"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          {section.hasLab ? 'Laboratorio' : 'Ver'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 mb-40">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-[3rem] blur-2xl group-hover:opacity-100 opacity-50 transition-all duration-1000"></div>

          <div className="relative glass rounded-[3.5rem] p-10 md:p-16 border border-white/10 overflow-hidden bg-slate-900/40">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
              <Quote className="w-48 h-48 text-white rotate-12" />
            </div>

            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center mb-10">
                <div className="relative mb-6">
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-20 blur-xl"></div>

                  <div className="w-28 h-28 rounded-full border-4 border-white/20 p-1 bg-slate-950 relative z-10">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
                      <img
                        src={statlabLogo}
                        alt="StatLab logo"
                        className="w-full h-full object-cover scale-150 translate-y-1"
                        draggable={false}
                      />
                    </div>
                  </div>
                </div>

                <h4 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-2">
                  StatLab Research & Analytics
                </h4>
                <div className="px-6 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-full">
                  <span className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">
                    Equipo de Desarrollo
                  </span>
                </div>
              </div>

              <div className="max-w-4xl w-full text-center relative px-10 mb-12">
                <Quote className="w-6 h-6 text-indigo-500/40 absolute -top-4 left-0 rotate-180" />
                <p className="text-xl md:text-2xl font-medium text-slate-300 italic leading-relaxed">
                  "Transformamos datos complejos en conocimiento estadístico mediante herramientas que combinan rigor académico con diseño intuitivo."
                </p>
                <Quote className="w-6 h-6 text-purple-500/40 absolute -bottom-4 right-0" />
              </div>

              <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between pt-10 border-t border-white/5 gap-8">
                <div className="flex gap-16">
                  <div className="space-y-1">
                    <p className="text-4xl font-black text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">
                      13+
                    </p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Capítulos
                    </p>
                  </div>
                  <div className="space-y-1 relative pl-8 border-l border-white/5">
                    <p className="text-4xl font-black text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">
                      50+
                    </p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Laboratorios
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <a
                    href="mailto:statlabresearch2025@gmail.com"
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all"
                  >
                    <Mail className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-black uppercase text-slate-300">
                      Soporte
                    </span>
                  </a>
                  <button
                    onClick={() => setView('developers')}
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 hover:scale-105 transition-all"
                  >
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-black uppercase text-indigo-400">
                      Equipo
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 p-0.5 shadow-xl">
                  <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden">
                    <img
                      src={statlabLogo}
                      alt="StatLab logo"
                      className="w-full h-full object-cover scale-150 translate-y-0.5"
                      draggable={false}
                    />
                  </div>
                </div>

                <div>
                  <span className="font-black text-lg text-white tracking-tight block">
                    StatLab
                  </span>
                  <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">
                    Research & Analytics
                  </span>
                </div>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed">
                Herramienta especializada en análisis estadístico para educación y desarrollo profesional.
              </p>
            </div>

            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-wider mb-4">Contacto</h3>
              <div className="space-y-3">
                <a href="mailto:statlabresearch2025@gmail.com" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors text-sm">
                  <Mail className="w-4 h-4" />
                  statlabresearch2025@gmail.com
                </a>
                <a href="https://statlabresearch.mx" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors text-sm">
                  <Database className="w-4 h-4" />
                  statlabresearch.mx
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-wider mb-4">Ubicación</h3>
              <div className="text-slate-400 text-sm space-y-1">
                <p className="font-semibold text-slate-300">Distrito de Innovación Analítica</p>
                <p>Morelia, Michoacán, México</p>
                <p>Código Postal 58000</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6 text-xs text-slate-500">
                <span className="font-bold">Versión 1.0.0</span>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>Server Online</span>
                </div>
              </div>

              <p className="text-slate-600 text-xs font-bold uppercase tracking-wider text-center">
                © 2026 StatLab Research & Analytics • Todos los derechos reservados
              </p>

              <button
                onClick={() => setView('developers')}
                className="text-xs text-slate-500 hover:text-indigo-400 transition-colors font-bold"
              >
                Ver Desarrolladores →
              </button>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .glass {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .glass-hover:hover {
          background: rgba(15, 23, 42, 0.6);
        }
      `}</style>
    </div>
  );
};

export default App;
