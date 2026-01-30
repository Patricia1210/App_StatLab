import React, { useState, useEffect, useMemo } from 'react';
import { Users, Shuffle, RefreshCw, TrendingUp, BarChart3, ArrowLeft, Upload, FileSpreadsheet, X, Download, Info, AlertCircle, ChevronDown, ChevronUp, Target, Table as TableIcon, Layers } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Lab12PoblacionMuestra = ({ goHome, goToSection, setView }) => {
  const [populationSize, setPopulationSize] = useState(1000);
  const [sampleSize, setSampleSize] = useState(100);
  const [population, setPopulation] = useState([]);
  const [sample, setSample] = useState([]);
  const [samplingMethod, setSamplingMethod] = useState('random');
  const [isAnimating, setIsAnimating] = useState(false);
  const [dataSource, setDataSource] = useState('generated');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [selectedColumnLabel, setSelectedColumnLabel] = useState('Valor');
  const [availableColumns, setAvailableColumns] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [categoricalColumns, setCategoricalColumns] = useState([]);
  const [selectedStratColumn, setSelectedStratColumn] = useState('');
  const [availableMethods, setAvailableMethods] = useState(['random', 'cluster']);
  const [showGuide, setShowGuide] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [numClusters, setNumClusters] = useState(20);
  const [numClustersToSelect, setNumClustersToSelect] = useState(2);
  const [selectedClusterIds, setSelectedClusterIds] = useState([]); // IDs de conglomerados seleccionados
  const [strataSummary, setStrataSummary] = useState([]); // Resumen de estratos para muestreo estratificado
  const [selectedClusterColumn, setSelectedClusterColumn] = useState('');
  const [clusterColumns, setClusterColumns] = useState([]); // candidatas a conglomerados
  const [hideUnselectedClusters, setHideUnselectedClusters] = useState(false);


  // --------------------------------------------------------
  // UTILIDADES: Fisher-Yates shuffle y normalización
  // --------------------------------------------------------
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const shuffleInPlace = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const shuffleCopy = (arr) => shuffleInPlace([...arr]);

  const normalizeKey = (v) => {
    if (v === null || v === undefined) return "Sin dato";
    const s = String(v).trim();
    return s.length ? s : "Sin dato";
  };

  const normalizeColName = (name) => {
    return String(name).toLowerCase().trim();
  };

  // --------------------------------------------------------
  // RANGOS DE SALARIO POR ESTRATO (REALISTAS)
  // --------------------------------------------------------
  const SALARY_RANGES = {
    "Soporte": { min: 8000, max: 15000 },
    "Marketing": { min: 12000, max: 22000 },
    "Ingeniería": { min: 18000, max: 35000 },
    "Ventas": { min: 10000, max: 30000 }
  };

  const generateSalaryForStratum = (stratum) => {
    const range = SALARY_RANGES[stratum] || { min: 10000, max: 30000 };
    return Math.round(randInt(range.min, range.max));
  };

  // --------------------------------------------------------
  // GENERACIÓN DE POBLACIÓN CON ESTRATOS Y CONGLOMERADOS VARIABLES
  // --------------------------------------------------------
  const STRATA_LABELS = ["Ingeniería", "Marketing", "Soporte", "Ventas"];
  const STRATA_WEIGHTS = [0.30, 0.20, 0.10, 0.40];

  useEffect(() => {
    if (dataSource === 'generated') {
      generatePopulation();
      setAvailableMethods(['random', 'stratified', 'cluster']);
      setSelectedStratColumn('stratGroup');
      setSelectedColumnLabel('Salario mensual (MXN)');
      setSelectedClusterIds([]);
      setStrataSummary([]);
    }
  }, [dataSource, numClusters]);

  const generatePopulation = () => {
    const pop = [];

    // 1) Generar tamaños variables para cada conglomerado (40-80 elementos)
    const clusterSizes = [];
    for (let c = 0; c < numClusters; c++) {
      clusterSizes.push(randInt(40, 80));
    }

    const totalSize = clusterSizes.reduce((a, b) => a + b, 0);

    // 2) Calcular cuántos de cada estrato (proporciones exactas)
    const targetCounts = STRATA_WEIGHTS.map(w => Math.floor(w * totalSize));
    let diff = totalSize - targetCounts.reduce((a, b) => a + b, 0);
    let idx = 0;
    while (diff > 0) {
      targetCounts[idx % targetCounts.length] += 1;
      diff--;
      idx++;
    }

    // 3) Crear pool de estratos
    const strataPool = [];
    targetCounts.forEach((count, sIdx) => {
      for (let k = 0; k < count; k++) {
        strataPool.push(STRATA_LABELS[sIdx]);
      }
    });

    // 4) Barajar estratos
    shuffleInPlace(strataPool);

    // 5) Construir población con salarios realistas por estrato
    let globalIdx = 0;
    for (let c = 0; c < numClusters; c++) {
      for (let i = 0; i < clusterSizes[c]; i++) {
        const stratum = strataPool[globalIdx];
        pop.push({
          id: globalIdx,
          value: generateSalaryForStratum(stratum), // ✅ Salario realista según estrato
          age: Math.floor(Math.random() * 60) + 18,
          stratGroup: stratum,
          cluster: c,
          clusterSize: clusterSizes[c] // Guardar tamaño del conglomerado
        });
        globalIdx++;
      }
    }

    setPopulation(pop);
    setPopulationSize(totalSize);
    setSample([]);
  };

  const detectCategoricalColumns = (data, columns, numericColumn) => {
    const categorical = [];

    columns.forEach(col => {
      if (col === numericColumn) return;

      const values = data
        .map(row => row[col])
        .filter(v => v !== null && v !== undefined && String(v).trim() !== "");

      const uniqueValues = [...new Set(values.map(v => normalizeKey(v)))];
      const uniqueCount = uniqueValues.length;

      // Heurística: si es string, suele ser categórica; si es numérica pero pocos valores, también.
      const isNumeric = values.every(v => typeof v === 'number' || !isNaN(parseFloat(v)));

      categorical.push({
        name: col,
        uniqueCount,
        sampleValues: uniqueValues.slice(0, 5),
        isNumeric
      });
    });

    return categorical;
  };

  const pickBestStrataColumn = (cats) => {
    // Estratos: pocas categorías (2–20 ideal)
    const candidates = cats
      .filter(c => c.uniqueCount >= 2 && c.uniqueCount <= 20)
      .sort((a, b) => a.uniqueCount - b.uniqueCount);

    return candidates[0]?.name || '';
  };

  const pickBestClusterColumn = (cats) => {
    // Conglomerados: pocas/medias (2–50 ideal, porque "Sede" suele ser 3, 5, 10...)
    const candidates = cats
      .filter(c => c.uniqueCount >= 2 && c.uniqueCount <= 50)
      .sort((a, b) => a.uniqueCount - b.uniqueCount);

    return candidates[0]?.name || '';
  };

  const processFile = async (file) => {
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          handleParsedData(results.data, Object.keys(results.data[0] || {}));
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          alert('Error al procesar el archivo CSV');
        }
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

          const headers = jsonData[0];
          const rows = jsonData.slice(1).map((row, idx) => {
            const obj = { id: idx };
            headers.forEach((header, i) => {
              obj[header] = row[i];
            });
            return obj;
          });

          handleParsedData(rows, headers);
        } catch (error) {
          console.error('Error parsing Excel:', error);
          alert('Error al procesar el archivo Excel');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleParsedData = (data, columns) => {
    setFileData(data);
    setAvailableColumns(columns);

    // ✅ Detectar columna numérica de forma robusta
    const isMostlyNumeric = (col) => {
      const sample = data.slice(0, 20);
      const nums = sample
        .map(r => r?.[col])
        .filter(v => v !== null && v !== undefined && String(v).trim() !== "")
        .map(v => parseFloat(v))
        .filter(v => !isNaN(v));
      return nums.length >= Math.max(5, Math.floor(sample.length * 0.6));
    };

    const numericColumn = columns.find(isMostlyNumeric);

    if (numericColumn) {
      setSelectedColumn(numericColumn);
      setSelectedColumnLabel(numericColumn); // Usar el nombre de la columna

      const categorical = detectCategoricalColumns(data, columns, numericColumn);
      setCategoricalColumns(categorical);

      let bestStrata = pickBestStrataColumn(categorical);
      let bestCluster = pickBestClusterColumn(categorical);

      // ✅ Evitar que estrato y conglomerado sean la misma columna por default
      if (bestStrata && bestCluster && normalizeColName(bestStrata) === normalizeColName(bestCluster)) {
        // intenta buscar otro estrato válido 2–20 que NO sea el cluster
        const alt = categorical
          .filter(c => c.uniqueCount >= 2 && c.uniqueCount <= 20)
          .map(c => c.name)
          .find(name => normalizeColName(name) !== normalizeColName(bestCluster));

        bestStrata = alt || ""; // si no hay alternativa, estratos quedan vacíos
      }

      setSelectedStratColumn(bestStrata);
      setSelectedClusterColumn(bestCluster);

      // columnas candidatas para clusters (para UI)
      setClusterColumns(
        categorical
          .filter(c => c.uniqueCount >= 2 && c.uniqueCount <= 50)
          .sort((a, b) => a.uniqueCount - b.uniqueCount)
      );

      if (bestStrata) {
        setAvailableMethods(['random', 'stratified', 'cluster']);
      } else {
        setAvailableMethods(['random', 'cluster']);
        if (samplingMethod === 'stratified') {
          setSamplingMethod('random');
        }
      }

      createPopulationFromColumn(data, numericColumn, bestStrata || null, bestCluster || null);
    }
  };

  const createPopulationFromColumn = (data, column, stratColumn = null, clusterColumn = null) => {
    const pop = data
      .map((row, idx) => {
        const value = parseFloat(row[column]);
        if (isNaN(value)) return null;

        const stratValue = stratColumn ? normalizeKey(row[stratColumn]) : "Sin estrato";

        // ✅ Si hay columna de conglomerados, úsala (ej. Sede)
        // ✅ Si no, fallback al viejo idx/50 (solo como respaldo)
        const clusterValue = clusterColumn
          ? normalizeKey(row[clusterColumn])
          : String(Math.floor(idx / 50));

        return {
          id: idx,
          value,
          rawData: row,
          stratGroup: stratValue,
          cluster: clusterValue
        };
      })
      .filter(Boolean);

    setPopulation(pop);
    setPopulationSize(pop.length);
    setSampleSize(Math.min(100, Math.floor(pop.length / 10)));
    setSample([]);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setDataSource('file');
      processFile(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      const extension = file.name.split('.').pop().toLowerCase();
      if (['csv', 'xlsx', 'xls'].includes(extension)) {
        setUploadedFile(file);
        setDataSource('file');
        processFile(file);
      } else {
        alert('Por favor sube un archivo CSV o Excel (.xlsx, .xls)');
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFileData([]);
    setAvailableColumns([]);
    setSelectedColumn('');
    setSelectedColumnLabel('Valor');
    setCategoricalColumns([]);
    setSelectedStratColumn('');
    setAvailableMethods(['random', 'cluster']);
    setDataSource('generated');
    generatePopulation();
  };

  const handleColumnChange = (column) => {
    setSelectedColumn(column);
    setSelectedColumnLabel(column);

    const categorical = detectCategoricalColumns(fileData, availableColumns, column);
    setCategoricalColumns(categorical);

    let bestStrata = pickBestStrataColumn(categorical);
    let bestCluster = pickBestClusterColumn(categorical);

    // ✅ Evitar que estrato y conglomerado sean la misma columna por default
    if (bestStrata && bestCluster && normalizeColName(bestStrata) === normalizeColName(bestCluster)) {
      // intenta buscar otro estrato válido 2–20 que NO sea el cluster
      const alt = categorical
        .filter(c => c.uniqueCount >= 2 && c.uniqueCount <= 20)
        .map(c => c.name)
        .find(name => normalizeColName(name) !== normalizeColName(bestCluster));

      bestStrata = alt || ""; // si no hay alternativa, estratos quedan vacíos
    }

    setSelectedStratColumn(bestStrata);
    setSelectedClusterColumn(bestCluster);

    setClusterColumns(
      categorical
        .filter(c => c.uniqueCount >= 2 && c.uniqueCount <= 50)
        .sort((a, b) => a.uniqueCount - b.uniqueCount)
    );

    if (bestStrata) {
      setAvailableMethods(['random', 'stratified', 'cluster']);
    } else {
      setAvailableMethods(['random', 'cluster']);
      if (samplingMethod === 'stratified') {
        setSamplingMethod('random');
      }
    }

    createPopulationFromColumn(fileData, column, bestStrata || null, bestCluster || null);
  };

  const handleStratColumnChange = (stratCol) => {
    setSelectedStratColumn(stratCol);
    createPopulationFromColumn(fileData, selectedColumn, stratCol, selectedClusterColumn || null);
  };

  // --------------------------------------------------------
  // MÉTODOS DE MUESTREO
  // --------------------------------------------------------
  const randomSampling = () => {
    const n = Math.min(sampleSize, population.length);
    const shuffled = shuffleCopy(population);
    return shuffled.slice(0, n).map((item) => ({
      ...item,
      samplingInfo: "Aleatorio Simple (MAS)"
    }));
  };

  const stratifiedSampling = () => {
    const groups = {};
    population.forEach((p) => {
      const key = normalizeKey(p.stratGroup);
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });

    const keys = Object.keys(groups);
    const N = population.length;
    const n = Math.min(sampleSize, N);

    const quotas = keys.map((k) => {
      const Nh = groups[k].length;
      const raw = (Nh / N) * n;
      const base = Math.floor(raw);
      return { k, Nh, raw, base, frac: raw - base };
    });

    let assigned = quotas.reduce((acc, q) => acc + q.base, 0);
    let remaining = n - assigned;

    quotas
      .sort((a, b) => b.frac - a.frac)
      .forEach((q) => {
        if (remaining <= 0) return;
        if (q.base < q.Nh) {
          q.base += 1;
          remaining -= 1;
        }
      });

    const sampled = [];
    const summary = [];

    quotas.forEach((q) => {
      const group = groups[q.k];
      const nh = Math.min(q.base, group.length);
      const shuffled = shuffleCopy(group);

      sampled.push(
        ...shuffled.slice(0, nh).map((item) => ({
          ...item,
          samplingInfo: `Estrato: ${q.k}`
        }))
      );

      summary.push({
        estrato: q.k,
        Nh: group.length,
        Nh_pct: ((group.length / N) * 100).toFixed(1),
        nh,
        nh_pct: ((nh / n) * 100).toFixed(1),
        frac: (nh / group.length).toFixed(2)
      });
    });

    setStrataSummary(summary);
    return sampled.slice(0, n);
  };

  // --------------------------------------------------------
  // CONGLOMERADOS CORREGIDO: El usuario elige CUÁNTOS conglomerados
  // --------------------------------------------------------
  const clusterSampling = () => {
    const clusters = {};
    population.forEach((p) => {
      const cid = normalizeKey(p.cluster);
      if (!clusters[cid]) clusters[cid] = [];
      clusters[cid].push(p);
    });

    const clusterIds = Object.keys(clusters);
    if (clusterIds.length === 0) {
      setSelectedClusterIds([]);
      return [];
    }

    // Seleccionar exactamente numClustersToSelect conglomerados
    const shuffledClusterIds = shuffleCopy(clusterIds);
    const selected = shuffledClusterIds.slice(0, Math.min(numClustersToSelect, clusterIds.length));

    // ✅ Guardar IDs para mostrar en UI
    setSelectedClusterIds(selected);

    // Tomar TODOS los elementos de los conglomerados seleccionados
    const sampled = [];
    selected.forEach((cid) => {
      const items = clusters[cid];
      sampled.push(
        ...items.map((item) => ({
          ...item,
          samplingInfo: `Conglomerado ${cid} (${items.length} elementos)`
        }))
      );
    });

    return sampled;
  };

  const takeSample = () => {
    setIsAnimating(true);

    setTimeout(() => {
      let newSample;
      switch (samplingMethod) {
        case 'random':
          newSample = randomSampling();
          setStrataSummary([]); // Limpiar resumen si no es estratificado
          break;
        case 'stratified':
          newSample = stratifiedSampling();
          break;
        case 'cluster':
          newSample = clusterSampling();
          setStrataSummary([]); // Limpiar resumen si no es estratificado
          break;
        default:
          newSample = randomSampling();
          setStrataSummary([]);
      }
      setSample(newSample);
      setIsAnimating(false);
    }, 800);
  };

  const calculateStats = (data) => {
    if (data.length === 0) return null;

    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    const n = values.length;
    const variance = n > 1
      ? values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1)
      : 0;
    const stdDev = Math.sqrt(variance);

    return {
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      stdDev: stdDev.toFixed(2),
      min: Math.min(...values),
      max: Math.max(...values),
      count: data.length
    };
  };

  const downloadSampleCSV = () => {
    if (sample.length === 0) {
      alert('No hay muestra para descargar');
      return;
    }

    const csvData = sample.map(item => ({
      ID: item.id,
      [selectedColumnLabel]: item.value,
      Método: item.samplingInfo,
      ...item.rawData
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `muestra_${samplingMethod}_n${sample.length}.csv`;
    link.click();
  };

  const popStats = useMemo(() => calculateStats(population), [population]);
  const sampleStats = useMemo(() => calculateStats(sample), [sample]);

  const clusterCount = useMemo(() => {
    const set = new Set(population.map(p => normalizeKey(p.cluster)));
    return set.size;
  }, [population]);

  useEffect(() => {
    if (samplingMethod === 'cluster') {
      setNumClustersToSelect((prev) => Math.min(prev, Math.max(1, clusterCount)));
    }
  }, [clusterCount, samplingMethod]);

  const histogramData = useMemo(() => {
    if (population.length === 0) return [];

    // ✅ Para conglomerados: histograma por conglomerado
    if (samplingMethod === 'cluster') {
      const clusterGroups = {};

      population.forEach((p) => {
        const cid = normalizeKey(p.cluster);
        if (!clusterGroups[cid]) clusterGroups[cid] = { total: 0, sampled: 0 };
        clusterGroups[cid].total++;
      });

      sample.forEach((s) => {
        const cid = normalizeKey(s.cluster);
        if (clusterGroups[cid]) clusterGroups[cid].sampled++;
      });

      return Object.keys(clusterGroups)
        .filter((cid) => !hideUnselectedClusters || clusterGroups[cid].sampled > 0)
        .sort((a, b) => clusterGroups[b].total - clusterGroups[a].total)
        .map((cid) => ({
          rango: cid,
          Población: clusterGroups[cid].total,
          Muestra: clusterGroups[cid].sampled,
        }));
    }

    // ✅ Para otros métodos: histograma por rangos de valores
    const valuesPop = population.map((p) => p.value);
    const min = Math.min(...valuesPop);
    const max = Math.max(...valuesPop);

    if (max === min) {
      return [
        {
          rango: `${min}`,
          Población: population.length,
          Muestra: sample.length,
        },
      ];
    }

    const bins = 10;
    const binSize = (max - min) / bins;

    const popHist = Array(bins).fill(0);
    const sampleHist = Array(bins).fill(0);

    population.forEach((p) => {
      const binIndex = Math.min(Math.floor((p.value - min) / binSize), bins - 1);
      popHist[binIndex]++;
    });

    sample.forEach((s) => {
      const binIndex = Math.min(Math.floor((s.value - min) / binSize), bins - 1);
      sampleHist[binIndex]++;
    });

    return Array(bins)
      .fill(0)
      .map((_, i) => {
        const start = min + i * binSize;
        const end = min + (i + 1) * binSize;
        return {
          rango: `${start.toFixed(0)}–${end.toFixed(0)}`,
          Población: popHist[i],
          Muestra: sampleHist[i],
        };
      });
  }, [population, sample, samplingMethod, hideUnselectedClusters]);


  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 shadow-2xl shadow-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={(e) => {
                e.preventDefault();
                if (goHome) goHome();
                else if (setView) setView("home");
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-all group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Volver al Índice
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10"></div>
                <svg className="w-7 h-7 text-white relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
                  <circle cx="18" cy="6" r="2" fill="currentColor" />
                  <circle cx="6" cy="18" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <div>
                <span className="text-xs text-blue-400 font-bold block uppercase tracking-wider">Capítulo 1</span>
                <span className="font-black tracking-tight text-white block text-sm">Introducción a la Estadística</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-xs text-indigo-400 font-black uppercase tracking-wider">Lab 1.2</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8 relative">

        <section className="glass rounded-3xl p-8 border-l-4 border-l-indigo-500 relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-32 h-32" />
          </div>
          <div className="flex items-start gap-6 relative z-10">
            <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30 shrink-0">
              <Users className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-black text-indigo-500 uppercase tracking-wider bg-indigo-500/10 px-3 py-1 rounded-full">
                  Sección 1.2
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">1.2 Población, Muestra y Métodos de Muestreo</h2>
              <p className="text-slate-400 leading-relaxed max-w-3xl font-medium mb-3">
                Explora cómo una muestra representa a la población usando distintos métodos de muestreo probabilístico.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <Target className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-400">
                  <strong>Objetivo:</strong> Comprender cómo el método de muestreo afecta la representatividad
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Guía colapsable */}
        <div className="glass rounded-3xl overflow-hidden border border-blue-500/20">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-black text-white">Guía de Métodos de Muestreo</h3>
            </div>
            {showGuide ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {showGuide && (
            <div className="px-6 pb-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-emerald-500/10">
                  <h4 className="font-bold text-emerald-400 mb-2 text-sm flex items-center gap-2">
                    <Shuffle className="w-4 h-4" />
                    Aleatorio Simple (MAS)
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">
                    Cada elemento tiene la <strong className="text-white">misma probabilidad</strong> de ser seleccionado.
                  </p>
                  <div className="text-xs text-emerald-400 font-bold">✓ Equiprobabilidad e independencia</div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-xl border border-pink-500/10">
                  <h4 className="font-bold text-pink-400 mb-2 text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Estratificado
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">
                    Divide en grupos homogéneos y muestrea <strong className="text-white">proporcionalmente</strong> de cada estrato.
                  </p>
                  <div className="text-xs text-pink-400 font-bold">✓ Alta precisión + Compara subgrupos</div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-xl border border-purple-500/10">
                  <h4 className="font-bold text-purple-400 mb-2 text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Conglomerados
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">
                    Selecciona <strong className="text-white">grupos completos</strong>. El tamaño final depende de los conglomerados elegidos.
                  </p>
                  <div className="text-xs text-purple-400 font-bold">✓ Eficiente con poblaciones dispersas</div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-400 mb-1">¿Cuándo usar cada método?</h4>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li>• <strong>Aleatorio Simple:</strong> Población homogénea + lista completa disponible</li>
                    <li>• <strong>Estratificado:</strong> Necesitas precisión + comparar subgrupos</li>
                    <li>• <strong>Conglomerados:</strong> Población dispersa geográficamente + presupuesto limitado</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black flex items-center gap-2 text-white">
              <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
              Fuente de Datos
            </h3>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setDataSource('generated');
                  if (uploadedFile) removeFile();
                }}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${dataSource === 'generated'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
              >
                Datos Generados
              </button>
              <button
                onClick={() => {
                  setDataSource('file');
                  // ✅ Resetear estados si no hay archivo cargado
                  if (!uploadedFile) {
                    setPopulation([]);
                    setSample([]);
                    setPopulationSize(0);
                    setSelectedClusterIds([]);
                    setStrataSummary([]);
                  }
                }}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${dataSource === 'file'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
              >
                Cargar Archivo
              </button>
            </div>
          </div>

          {dataSource === 'generated' && (
            <>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3 mb-6">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <p className="mb-2">
                    <strong className="text-blue-400">Población simulada:</strong> {numClusters} conglomerados con tamaños variables (40-80 elementos cada uno).
                  </p>
                  <p className="text-slate-400">
                    <strong>Estratos y rangos salariales:</strong>
                  </p>
                  <ul className="mt-1 space-y-0.5 text-slate-400">
                    <li>• Ingeniería (30%): $18,000 - $35,000 MXN</li>
                    <li>• Marketing (20%): $12,000 - $22,000 MXN</li>
                    <li>• Soporte (10%): $8,000 - $15,000 MXN</li>
                    <li>• Ventas (40%): $10,000 - $30,000 MXN</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                  Número de Conglomerados en la Población
                </label>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="5"
                  value={numClusters}
                  onChange={(e) => setNumClusters(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-center mt-2">
                  <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {numClusters} conglomerados
                  </span>
                  <p className="text-xs text-slate-500 mt-1">(Cada uno con 40-80 elementos)</p>
                </div>
              </div>
            </>
          )}

          {dataSource === 'file' && (
            <div>
              {!uploadedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${isDragging
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50'
                    }`}
                >
                  <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-white mb-2">Arrastra tu archivo aquí</h4>
                  <p className="text-sm text-slate-400 mb-4">
                    Formatos soportados: CSV, XLSX, XLS
                  </p>
                  <label className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold cursor-pointer hover:scale-105 transition-transform">
                    Seleccionar Archivo
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-green-500/30">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-8 h-8 text-green-400" />
                      <div>
                        <p className="font-bold text-white">{uploadedFile.name}</p>
                        <p className="text-sm text-slate-400">{population.length} registros</p>
                      </div>
                    </div>
                    <button onClick={removeFile} className="p-2 hover:bg-red-500/20 rounded-lg">
                      <X className="w-5 h-5 text-red-400" />
                    </button>
                  </div>

                  {availableColumns.length > 0 && (
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                        Columna Numérica a Analizar
                      </label>
                      <select
                        value={selectedColumn}
                        onChange={(e) => handleColumnChange(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        {availableColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {categoricalColumns.length > 0 && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-blue-400 mb-1">Columnas Categóricas Detectadas</h4>
                          <p className="text-xs text-slate-400">
                            Estas columnas pueden usarse para muestreo estratificado (2-20 categorías) o conglomerados (2-50 categorías)
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {categoricalColumns.map((col, idx) => {
                          const isGoodForStrata = col.uniqueCount >= 2 && col.uniqueCount <= 20;
                          const isGoodForCluster = col.uniqueCount >= 2 && col.uniqueCount <= 50;

                          return (
                            <div key={idx} className="bg-slate-900/50 p-3 rounded-lg border border-blue-500/10">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-white">{col.name}</span>
                                <div className="flex gap-2">
                                  <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded">
                                    {col.uniqueCount} categorías
                                  </span>
                                  {isGoodForStrata && (
                                    <span className="text-xs text-pink-400 bg-pink-500/20 px-2 py-1 rounded">
                                      ✓ Estratos
                                    </span>
                                  )}
                                  {isGoodForCluster && (
                                    <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded">
                                      ✓ Clusters
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-slate-400">
                                <span className="font-bold">Ejemplos:</span> {col.sampleValues.map(v => String(v)).join(', ')}
                                {col.uniqueCount > 5 && '...'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {categoricalColumns.length === 0 && availableColumns.length > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-yellow-400 mb-1">Sin Columnas Categóricas</h4>
                        <p className="text-xs text-slate-400">
                          No se detectaron columnas categóricas. Solo estarán disponibles los métodos Aleatorio Simple y Conglomerados.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-6">
              <h3 className="text-lg font-black flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Configuración
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-xl border border-indigo-500/20">
                  <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                    Población (N)
                  </div>
                  <div className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent text-center">
                    {populationSize}
                  </div>
                </div>

                {/* CONGLOMERADOS: Número de conglomerados a seleccionar */}
                {samplingMethod === 'cluster' ? (
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                      Número de Conglomerados a Seleccionar
                    </label>
                    <input
                      type="range"
                      min="1"
                      max={Math.max(1, clusterCount)}
                      step="1"
                      value={numClustersToSelect}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setNumClustersToSelect(v);
                        setSample([]);
                        setSelectedClusterIds([]);
                      }}

                      className="w-full"
                    />
                    <div className="text-center mt-2">
                      <span className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {numClustersToSelect}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        de {clusterCount} conglomerados disponibles
                      </p>

                      <div className="mt-3 bg-slate-950/40 border border-purple-500/20 rounded-xl px-3 py-2">
                        <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-purple-300">
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/25">
                            ✓ Grupos completos
                          </span>
                          <span className="text-slate-400">
                            Seleccionas {numClustersToSelect} de {clusterCount} {clusterCount === 1 ? "conglomerado" : "conglomerados"}
                          </span>
                        </div>

                        <div className="mt-1 text-[11px] text-slate-400 text-center leading-snug">
                          {selectedClusterColumn
                            ? <>Base: <span className="text-white font-bold">{selectedClusterColumn}</span>. La muestra final depende del tamaño de cada conglomerado.</>
                            : <>Sin columna: agrupación automática. La muestra final depende del tamaño de cada conglomerado.</>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                      Tamaño de Muestra (n)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max={Math.min(500, populationSize)}
                      step="10"
                      value={sampleSize}
                      onChange={(e) => setSampleSize(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center mt-2">
                      <span className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {sampleSize}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                    Método de Muestreo
                  </label>
                  <select
                    value={samplingMethod}
                    onChange={(e) => {
                      setSamplingMethod(e.target.value);
                      setSample([]);
                      setSelectedClusterIds([]);
                      setStrataSummary([]);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="random">Aleatorio Simple</option>
                    <option value="stratified" disabled={!availableMethods.includes('stratified')}>
                      Estratificado {!availableMethods.includes('stratified') && '(No disponible)'}
                    </option>
                    <option value="cluster">Conglomerados</option>
                  </select>

                  {!availableMethods.includes('stratified') && (
                    <div className="mt-2 text-xs text-yellow-400 flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" />
                      <span>Requiere columnas categóricas</span>
                    </div>
                  )}
                </div>

                {samplingMethod === 'stratified' && categoricalColumns.length > 0 && dataSource === 'file' && (
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                      Columna para Estratos
                    </label>
                    <select
                      value={selectedStratColumn}
                      onChange={(e) => handleStratColumnChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {categoricalColumns
                        .filter(c => c.uniqueCount >= 2 && c.uniqueCount <= 20)
                        .map((col) => (
                          <option key={col.name} value={col.name}>
                            {col.name} ({col.uniqueCount} grupos)
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {samplingMethod === 'cluster' && dataSource === 'file' && clusterColumns.length > 0 && (
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                      Columna para Conglomerados
                    </label>
                    <select
                      value={selectedClusterColumn}
                      onChange={(e) => {
                        const col = e.target.value;
                        setSelectedClusterColumn(col);
                        createPopulationFromColumn(fileData, selectedColumn, selectedStratColumn || null, col || null);
                        setStrataSummary([]);
                        setSelectedClusterIds([]);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">(Sin columna: usar agrupación automática)</option>
                      {clusterColumns.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.uniqueCount} conglomerados)
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-xs text-slate-400">
                      Los conglomerados serán los grupos definidos por <span className="text-white font-bold">{selectedClusterColumn || "agrupación automática"}</span>.
                    </p>
                  </div>
                )}

                <button
                  onClick={takeSample}
                  disabled={isAnimating || population.length === 0}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-black text-lg hover:scale-105 transition-transform shadow-2xl shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAnimating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Tomando...
                    </>
                  ) : (
                    <>
                      <Shuffle className="w-5 h-5" />
                      Tomar Muestra
                    </>
                  )}
                </button>

                {sample.length > 0 && (
                  <button
                    onClick={downloadSampleCSV}
                    className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar Muestra CSV
                  </button>
                )}

                {dataSource === 'generated' && (
                  <button
                    onClick={generatePopulation}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Nueva Población
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {sample.length > 0 && (
              <>
                {/* Variable analizada */}
                {dataSource === 'generated' && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-300">
                        <strong className="text-blue-400">Variable analizada:</strong> Salario mensual (MXN) – Variable cuantitativa continua
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Cada "valor" en la tabla representa el salario mensual de un individuo. Los rangos varían según el departamento para reflejar la realidad.
                      </p>
                    </div>
                  </div>
                )}
                {dataSource === 'file' && selectedColumn && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-300">
                        <strong className="text-blue-400">Variable analizada:</strong> {selectedColumnLabel}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Esta es la variable numérica que se está analizando en el ejercicio de muestreo.
                      </p>
                    </div>
                  </div>
                )}

                {/* 🔥 RESUMEN DE ESTRATOS (solo para estratificado) */}
                {samplingMethod === 'stratified' && strataSummary.length > 0 && (
                  <div className="bg-slate-800/40 border border-slate-600/40 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-pink-400" />
                      Resumen por Estrato
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-slate-300">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-700">
                            <th className="px-3 py-2 text-left font-bold">Estrato</th>
                            <th className="px-3 py-2 text-right font-bold">Población (Nₕ)</th>
                            <th className="px-3 py-2 text-right font-bold">% Población</th>
                            <th className="px-3 py-2 text-right font-bold">Muestra (nₕ)</th>
                            <th className="px-3 py-2 text-right font-bold">% Muestra</th>
                            <th className="px-3 py-2 text-right font-bold">nₕ / Nₕ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          {strataSummary.map((s) => (
                            <tr key={s.estrato} className="hover:bg-slate-700/20">
                              <td className="px-3 py-2 font-semibold text-white">{s.estrato}</td>
                              <td className="px-3 py-2 text-right">{s.Nh}</td>
                              <td className="px-3 py-2 text-right text-slate-400">{s.Nh_pct}%</td>
                              <td className="px-3 py-2 text-right font-bold text-pink-300">{s.nh}</td>
                              <td className="px-3 py-2 text-right text-pink-400">{s.nh_pct}%</td>
                              <td className="px-3 py-2 text-right font-mono text-indigo-300">{s.frac}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                      En estratificado proporcional, la fracción <strong className="text-white">nₕ/Nₕ</strong> es similar en todos los estratos,
                      garantizando que cada grupo contribuya proporcionalmente a su tamaño en la población.
                    </p>
                  </div>
                )}

                {/* TABLA DE MUESTRA */}
                <div className="glass rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <TableIcon className="w-6 h-6 text-indigo-400" />
                        {samplingMethod === 'stratified'
                          ? `Muestra Obtenida – Muestreo Estratificado Proporcional (n = ${sample.length})`
                          : `Muestra Obtenida (${sample.length} elementos)`
                        }
                      </h3>

                      {dataSource === 'file' && (
                        <div className="mt-2 text-xs text-slate-400 space-y-1">
                          {samplingMethod === 'stratified' && selectedStratColumn && (
                            <div>Estratos basados en: <span className="text-white font-bold">{selectedStratColumn}</span></div>
                          )}
                          {samplingMethod === 'cluster' && selectedClusterColumn && (
                            <div>Conglomerados basados en: <span className="text-white font-bold">{selectedClusterColumn}</span></div>
                          )}
                        </div>
                      )}

                      {samplingMethod === 'cluster' && (
                        <div className="mt-2 text-xs text-slate-400 space-y-1">
                          <div>
                            Conglomerados seleccionados:{" "}
                            <span className="text-white font-bold">{numClustersToSelect}</span> ·
                            Tamaño final:{" "}
                            <span className="text-white font-bold">{sample.length}</span>
                            <span className="text-purple-400 ml-2">✓ Conglomerados completos</span>
                          </div>
                          {selectedClusterIds.length > 0 && (
                            <div>
                              IDs (tamaño):{" "}
                              <span className="text-white font-bold">
                                {selectedClusterIds
                                  .map((cid) => {
                                    const size = sample.filter(s => String(s.cluster) === String(cid)).length;
                                    return `${cid} (${size})`;
                                  })
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950/50 rounded-xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full">
                        <thead className="bg-indigo-500/20 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-black text-indigo-400 uppercase tracking-wider">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-black text-indigo-400 uppercase tracking-wider">{selectedColumnLabel}</th>
                            {samplingMethod === 'stratified' && (
                              <th className="px-4 py-3 text-left text-xs font-black text-indigo-400 uppercase tracking-wider">
                                Estrato
                              </th>
                            )}
                            {samplingMethod === 'cluster' && (
                              <th className="px-4 py-3 text-left text-xs font-black text-indigo-400 uppercase tracking-wider">
                                Conglomerado
                              </th>
                            )}
                            <th className="px-4 py-3 text-left text-xs font-black text-indigo-400 uppercase tracking-wider">Información de Muestreo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {sample.map((item, idx) => (
                            <tr key={`${item.id}-${idx}`} className="hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3 text-sm font-bold text-slate-300">
                                {item.id}
                              </td>
                              <td className="px-4 py-3 text-sm font-bold text-white">
                                {dataSource === 'generated'
                                  ? `$${item.value.toLocaleString()}`
                                  : item.value}
                              </td>
                              {/* ✅ ESTRATO - Solo visible en estratificado */}
                              {samplingMethod === 'stratified' && (
                                <td className="px-4 py-3 text-xs font-bold text-pink-300">
                                  {item.stratGroup ?? "—"}
                                </td>
                              )}
                              {/* ✅ CONGLOMERADO - Solo visible en cluster */}
                              {samplingMethod === 'cluster' && (
                                <td className="px-4 py-3 text-xs font-bold text-purple-300">
                                  {item.cluster ?? "—"}
                                </td>
                              )}
                              <td className="px-4 py-3 text-xs text-slate-400">{item.samplingInfo}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20">
                    <p className="text-sm text-slate-300 text-center">
                      <strong className="text-indigo-400">💡 Observa:</strong> {
                        samplingMethod === 'stratified'
                          ? 'Cada estrato contribuye proporcionalmente a su tamaño en la población'
                          : samplingMethod === 'cluster'
                            ? `Se seleccionaron ${numClustersToSelect} conglomerados completos. El tamaño final (${sample.length}) depende del tamaño de los conglomerados elegidos, NO de un tamaño de muestra predefinido.`
                            : 'Cada elemento fue seleccionado con la misma probabilidad'
                      }
                    </p>
                  </div>
                </div>

                {/* Sección colapsable de estadísticas */}
                <div className="glass rounded-3xl overflow-hidden border border-blue-500/20">
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-black text-white">Análisis Estadístico (Avanzado)</h3>
                    </div>
                    {showStats ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>

                  {showStats && (
                    <div className="px-6 pb-6 space-y-6">
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                        <Info className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-300">
                          <strong className="text-yellow-400">Nota:</strong> Estos conceptos (media, mediana, histogramas) se explicarán en detalle en próximas secciones.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-lg font-black text-white mb-4">
                          {samplingMethod === 'cluster'
                            ? 'Distribución por Conglomerado: Población vs Muestra'
                            : `Distribución de ${selectedColumnLabel}: Población vs Muestra`
                          }
                        </h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                              dataKey="rango"
                              stroke="#94a3b8"
                              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                              axisLine={false}
                              tickLine={false}
                              height={samplingMethod === "cluster" ? 80 : 50}
                              interval={0}
                              angle={samplingMethod === "cluster" ? -35 : 0}
                              textAnchor={samplingMethod === "cluster" ? "end" : "middle"}
                              label={{
                                value: samplingMethod === 'cluster' ? 'Conglomerado' : selectedColumnLabel,
                                position: 'insideBottom',
                                offset: samplingMethod === "cluster" ? -55 : -40,
                                style: { fill: '#94a3b8', fontWeight: 700, fontSize: 12 }
                              }}
                            />

                            <YAxis
                              stroke="#94a3b8"
                              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                              axisLine={false}
                              tickLine={false}
                              label={{
                                value: 'Frecuencia',
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle', fill: '#94a3b8', fontWeight: 700, fontSize: 12 }
                              }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '12px',
                                fontWeight: 700
                              }}
                              cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                            />
                            <Legend
                              wrapperStyle={{ fontWeight: 700 }}
                              iconType="circle"
                              verticalAlign="bottom"
                              align="center"
                            />
                            <Bar dataKey="Población" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="Muestra" fill="#ec4899" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {popStats && sampleStats && (
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="text-center">
                              <h4 className="font-bold text-indigo-400 mb-4">Población</h4>
                            </div>

                            {[
                              { label: "Media (μ)", value: popStats.mean, color: "from-blue-500 to-cyan-500" },
                              { label: "Mediana", value: popStats.median, color: "from-indigo-500 to-purple-500" },
                            ].map((stat, i) => (
                              <div key={i} className="bg-slate-950/50 p-4 rounded-xl border border-indigo-500/20">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-1">{stat.label}</div>
                                <div className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                  {dataSource === 'generated' ? `$${parseFloat(stat.value).toLocaleString()}` : stat.value}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-4">
                            <div className="text-center">
                              <h4 className="font-bold text-pink-400 mb-4">Muestra</h4>
                            </div>

                            {(() => {
                              const popMean = parseFloat(popStats.mean);
                              const sampleMean = parseFloat(sampleStats.mean);
                              const popMedian = parseFloat(popStats.median);
                              const sampleMedian = parseFloat(sampleStats.median);

                              return [
                                { label: "Media (x̄)", value: sampleStats.mean, diff: Math.abs(popMean - sampleMean).toFixed(2) },
                                { label: "Mediana", value: sampleStats.median, diff: Math.abs(popMedian - sampleMedian).toFixed(2) },
                              ].map((stat, i) => (
                                <div key={i} className="bg-slate-950/50 p-4 rounded-xl border border-pink-500/20">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="text-xs text-slate-500 uppercase font-bold">{stat.label}</div>
                                    <div className="text-xs text-slate-500">Δ: {dataSource === 'generated' ? `$${parseFloat(stat.diff).toLocaleString()}` : stat.diff}</div>
                                  </div>
                                  <div className={`text-3xl font-black bg-gradient-to-r ${i === 0 ? 'from-blue-500 to-cyan-500' : 'from-indigo-500 to-purple-500'} bg-clip-text text-transparent`}>
                                    {dataSource === 'generated' ? `$${parseFloat(stat.value).toLocaleString()}` : stat.value}
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {sample.length === 0 && (
              <div className="glass rounded-3xl p-12 text-center min-h-[500px] flex flex-col items-center justify-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl" />
                  <div className="relative w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                    <TableIcon className="w-16 h-16 text-slate-700" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Toma tu Primera Muestra</h3>
                <p className="text-slate-400">
                  Configura los parámetros y presiona "Tomar Muestra" para comenzar
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <h3 className="text-2xl font-black text-white mb-6">Conceptos Clave</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950/50 p-6 rounded-2xl border border-indigo-500/20">
              <div className="flex items-start gap-4">
                <div className="text-4xl">👥</div>
                <div>
                  <h4 className="font-black text-lg text-indigo-400 mb-2">Población (N)</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Conjunto completo de todos los elementos que comparten una característica común y queremos estudiar.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/50 p-6 rounded-2xl border border-pink-500/20">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🎯</div>
                <div>
                  <h4 className="font-black text-lg text-pink-400 mb-2">Muestra (n)</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Subconjunto representativo de la población seleccionado para estudio cuando analizar toda la población es inviable.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/50 p-6 rounded-2xl border border-purple-500/20">
              <div className="flex items-start gap-4">
                <div className="text-4xl">⚖️</div>
                <div>
                  <h4 className="font-black text-lg text-purple-400 mb-2">Representatividad</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Una buena muestra refleja las características de la población. El muestreo probabilístico garantiza esto.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/50 p-6 rounded-2xl border border-cyan-500/20">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🔀</div>
                <div>
                  <h4 className="font-black text-lg text-cyan-400 mb-2">Muestreo Probabilístico</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Cada elemento tiene una probabilidad conocida de ser incluido. Esto permite generalizar resultados a toda la población.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      <style>{`
      .glass {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            }
      `}</style>

    </div>
  );
};

export default Lab12PoblacionMuestra;