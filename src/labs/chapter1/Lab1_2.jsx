import React, { useState, useEffect, useMemo } from 'react';
import { Users, Shuffle, RefreshCw, TrendingUp, BarChart3, ArrowLeft, Upload, FileSpreadsheet, X, Download, FileDown, Play, Zap, GitCompare } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { generateReportHTML } from "../../utils/reporteLab12Template";
import { generatePDF } from "../../utils/pdfGenerator";



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
  const [availableColumns, setAvailableColumns] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('single');
  const [multipleSamples, setMultipleSamples] = useState([]);
  const [isRunningMultiple, setIsRunningMultiple] = useState(false);
  const [numMultipleSamples, setNumMultipleSamples] = useState(50);
  const [comparisonSamples, setComparisonSamples] = useState({ random: null, systematic: null, stratified: null });

  useEffect(() => {
    if (dataSource === 'generated') {
      generatePopulation();
    }
  }, [populationSize, dataSource]);

  const generatePopulation = () => {
    const pop = [];
    for (let i = 0; i < populationSize; i++) {
      pop.push({
        id: i,
        value: Math.round(Math.random() * 100),
        age: Math.floor(Math.random() * 60) + 18,
        group: i % 4
      });
    }
    setPopulation(pop);
    setSample([]);
    setMultipleSamples([]);
    setComparisonSamples({ random: null, systematic: null, stratified: null });
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
    
    const numericColumn = columns.find(col => {
      const value = data[0]?.[col];
      return typeof value === 'number' || !isNaN(parseFloat(value));
    });
    
    if (numericColumn) {
      setSelectedColumn(numericColumn);
      createPopulationFromColumn(data, numericColumn);
    }
  };

  const createPopulationFromColumn = (data, column) => {
    const pop = data
      .map((row, idx) => {
        const value = parseFloat(row[column]);
        if (!isNaN(value)) {
          return {
            id: idx,
            value: value,
            rawData: row,
            group: idx % 4
          };
        }
        return null;
      })
      .filter(item => item !== null);
    
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
    setDataSource('generated');
    generatePopulation();
  };

  const handleColumnChange = (column) => {
    setSelectedColumn(column);
    createPopulationFromColumn(fileData, column);
  };

  const randomSampling = () => {
    const shuffled = [...population].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, sampleSize);
  };

  const systematicSampling = () => {
    const k = Math.floor(population.length / sampleSize);
    const start = Math.floor(Math.random() * k);
    const sampled = [];
    for (let i = start; i < population.length && sampled.length < sampleSize; i += k) {
      sampled.push(population[i]);
    }
    return sampled;
  };

  const stratifiedSampling = () => {
    const groups = [[], [], [], []];
    population.forEach(p => groups[p.group].push(p));
    
    const sampled = [];
    const perGroup = Math.floor(sampleSize / 4);
    
    groups.forEach(group => {
      const shuffled = group.sort(() => 0.5 - Math.random());
      sampled.push(...shuffled.slice(0, perGroup));
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
          break;
        case 'systematic':
          newSample = systematicSampling();
          break;
        case 'stratified':
          newSample = stratifiedSampling();
          break;
        default:
          newSample = randomSampling();
      }
      setSample(newSample);
      setIsAnimating(false);
    }, 800);
  };

  const runMultipleSamples = () => {
    setIsRunningMultiple(true);
    const samples = [];
    
    for (let i = 0; i < numMultipleSamples; i++) {
      let newSample;
      switch (samplingMethod) {
        case 'random':
          newSample = randomSampling();
          break;
        case 'systematic':
          newSample = systematicSampling();
          break;
        case 'stratified':
          newSample = stratifiedSampling();
          break;
        default:
          newSample = randomSampling();
      }
      const stats = calculateStats(newSample);
      samples.push({
        id: i,
        mean: parseFloat(stats.mean),
        median: parseFloat(stats.median),
        stdDev: parseFloat(stats.stdDev)
      });
    }
    
    setMultipleSamples(samples);
    setIsRunningMultiple(false);
  };

  const compareAllMethods = () => {
    setComparisonSamples({
      random: randomSampling(),
      systematic: systematicSampling(),
      stratified: stratifiedSampling()
    });
  };

  const calculateStats = (data) => {
    if (data.length === 0) return null;
    
    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
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
      Valor: item.value,
      Edad: item.age,
      Grupo: item.group
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `muestra_${samplingMethod}_n${sampleSize}.csv`;
    link.click();
  };

  const downloadReport = async () => {
  if (!sample.length || !popStats || !sampleStats) {
    alert('Toma una muestra primero');
    return;
  }

  // 🔒 CONGELAR la página ANTES de generar el PDF
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;
  
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = `-${scrollX}px`;
  document.body.style.width = '100%';

  try {
    const errorMedia = Math.abs(parseFloat(popStats.mean) - parseFloat(sampleStats.mean));
    const errorMediana = Math.abs(parseFloat(popStats.median) - parseFloat(sampleStats.median));
    const errorStdDev = Math.abs(parseFloat(popStats.stdDev) - parseFloat(sampleStats.stdDev));

    const precisionMedia = (1 - (errorMedia / parseFloat(popStats.mean))) * 100;
    const precisionMediana = (1 - (errorMediana / parseFloat(popStats.median))) * 100;
    const precisionStdDev = (1 - (errorStdDev / parseFloat(popStats.stdDev))) * 100;
    const precisionGlobal = (precisionMedia + precisionMediana + precisionStdDev) / 3;

    const z = 1.96;
    const se = parseFloat(sampleStats.stdDev) / Math.sqrt(sampleSize);
    const intervaloMin = (parseFloat(sampleStats.mean) - z * se).toFixed(2);
    const intervaloMax = (parseFloat(sampleStats.mean) + z * se).toFixed(2);

    const fechaCompleta = new Date().toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const reportData = {
      fecha: fechaCompleta,
      fuente: dataSource === 'generated' ? 'Datos Generados' : uploadedFile?.name || 'Archivo Cargado',
      metodo: samplingMethod,
      poblacionSize: populationSize,
      muestraSize: sampleSize,
      columna: dataSource === 'file' ? selectedColumn : null,
      popStats,
      sampleStats,
      errorMedia: errorMedia.toFixed(2),
      errorMediana: errorMediana.toFixed(2),
      errorStdDev: errorStdDev.toFixed(2),
      precisionMedia,
      precisionMediana,
      precisionStdDev,
      precisionGlobal,
      intervaloConfianza: { min: intervaloMin, max: intervaloMax },
    };

    const htmlContent = generateReportHTML(reportData);

    const metodosNombres = {
      random: 'Aleatorio',
      systematic: 'Sistematico',
      stratified: 'Estratificado',
    };

    const filename = `Reporte_Lab12_${metodosNombres[samplingMethod] || samplingMethod}_${new Date()
      .toISOString()
      .split('T')[0]}.pdf`;

    await generatePDF(htmlContent, filename);

  } catch (error) {
    console.error('Error generando PDF:', error);
    alert('Falló la descarga. Revisa Console (F12).');
  } finally {
    // 🔓 DESCONGELAR la página DESPUÉS de generar el PDF
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.width = '';
    window.scrollTo(scrollX, scrollY);
  }
};
  const popStats = useMemo(() => calculateStats(population), [population]);
  const sampleStats = useMemo(() => calculateStats(sample), [sample]);

  const histogramData = useMemo(() => {
    if (population.length === 0) return [];
    
    const bins = 10;
    const min = Math.min(...population.map(p => p.value));
    const max = Math.max(...population.map(p => p.value));
    const binSize = (max - min) / bins;
    
    const popHist = Array(bins).fill(0);
    const sampleHist = Array(bins).fill(0);
    
    population.forEach(p => {
      const binIndex = Math.min(Math.floor((p.value - min) / binSize), bins - 1);
      popHist[binIndex]++;
    });
    
    sample.forEach(s => {
      const binIndex = Math.min(Math.floor((s.value - min) / binSize), bins - 1);
      sampleHist[binIndex]++;
    });
    
    return Array(bins).fill(0).map((_, i) => ({
      rango: `${(min + i * binSize).toFixed(0)}`,
      Población: popHist[i],
      Muestra: sampleHist[i]
    }));
  }, [population, sample]);

  const samplingDistData = useMemo(() => {
    if (multipleSamples.length === 0) return [];
    
    const bins = 15;
    const means = multipleSamples.map(s => s.mean);
    const min = Math.min(...means);
    const max = Math.max(...means);
    const binSize = (max - min) / bins;
    
    const hist = Array(bins).fill(0);
    
    means.forEach(mean => {
      const binIndex = Math.min(Math.floor((mean - min) / binSize), bins - 1);
      hist[binIndex]++;
    });
    
    return Array(bins).fill(0).map((_, i) => ({
      media: ((min + i * binSize) + (min + (i + 1) * binSize)) / 2,
      frecuencia: hist[i]
    }));
  }, [multipleSamples]);

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
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor"/>
                  <circle cx="18" cy="6" r="2" fill="currentColor"/>
                  <circle cx="6" cy="18" r="1.5" fill="currentColor"/>
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
        
        <section className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 border-l-4 border-l-indigo-500 relative overflow-hidden">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <Users className="w-64 h-64 text-indigo-400" />
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
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">1.2 La población y la muestra</h2>
              <p className="text-slate-400 leading-relaxed max-w-3xl font-medium">
                Explora cómo las muestras representan poblaciones. Simula métodos de muestreo, visualiza distribuciones, compara técnicas y descarga resultados.
              </p>
            </div>
          </div>
        </section>

        <div className="flex gap-3 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'single'
                ? 'bg-indigo-500 text-white'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <Shuffle className="w-4 h-4 inline mr-2" />
            Muestra Única
          </button>
          <button
            onClick={() => setActiveTab('multiple')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'multiple'
                ? 'bg-indigo-500 text-white'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <Zap className="w-4 h-4 inline mr-2" />
            Múltiples Muestras
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'comparison'
                ? 'bg-indigo-500 text-white'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <GitCompare className="w-4 h-4 inline mr-2" />
            Comparar Métodos
          </button>
        </div>

        {activeTab === 'single' && (
          <>
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
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                      dataSource === 'generated'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    Datos Generados
                  </button>
                  <button
                    onClick={() => setDataSource('file')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                      dataSource === 'file'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    Cargar Archivo
                  </button>
                </div>
              </div>

              {dataSource === 'file' && (
                <div>
                  {!uploadedFile ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                        isDragging
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
                            Columna
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
                    {dataSource === 'generated' && (
                      <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                          Población (N)
                        </label>
                        <input
                          type="range"
                          min="100"
                          max="2000"
                          step="100"
                          value={populationSize}
                          onChange={(e) => setPopulationSize(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-center mt-2">
                          <span className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            {populationSize}
                          </span>
                        </div>
                      </div>
                    )}

                    {dataSource === 'file' && (
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-indigo-500/20">
                        <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                          Población (N)
                        </div>
                        <div className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent text-center">
                          {populationSize}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                        Muestra (n)
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

                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                        Método
                      </label>
                      <select
                        value={samplingMethod}
                        onChange={(e) => setSamplingMethod(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="random">Aleatorio Simple</option>
                        <option value="systematic">Sistemático</option>
                        <option value="stratified">Estratificado</option>
                      </select>
                    </div>

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
                      <div className="flex gap-2">
                        <button
                          onClick={downloadSampleCSV}
                          className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          CSV
                        </button>
                        <button
                          onClick={downloadReport}
                          className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                          <FileDown className="w-4 h-4" />
                          Reporte
                        </button>
                      </div>
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
                {sample.length > 0 && histogramData.length > 0 && (
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                    <h3 className="text-xl font-black text-white mb-6">Distribución: Población vs Muestra</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={histogramData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="rango" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155'}} />
                        <Legend />
                        <Bar dataKey="Población" fill="#6366f1" />
                        <Bar dataKey="Muestra" fill="#ec4899" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {sample.length > 0 && popStats && sampleStats && (
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                    <h3 className="text-xl font-black text-white mb-6">Comparación Estadística</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="text-center">
                          <h4 className="font-bold text-indigo-400 mb-4">Población</h4>
                        </div>
                        
                        {[
                          { label: "Media (μ)", value: popStats.mean, color: "from-blue-500 to-cyan-500" },
                          { label: "Mediana", value: popStats.median, color: "from-indigo-500 to-purple-500" },
                          { label: "Desv. Est. (σ)", value: popStats.stdDev, color: "from-purple-500 to-pink-500" },
                        ].map((stat, i) => (
                          <div key={i} className="bg-slate-950/50 p-4 rounded-xl border border-indigo-500/20">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">{stat.label}</div>
                            <div className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                              {stat.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <div className="text-center">
                          <h4 className="font-bold text-pink-400 mb-4">Muestra</h4>
                        </div>
                        
                        {[
                          { label: "Media (x̄)", value: sampleStats.mean, diff: Math.abs(popStats.mean - sampleStats.mean).toFixed(2) },
                          { label: "Mediana", value: sampleStats.median, diff: Math.abs(popStats.median - sampleStats.median).toFixed(2) },
                          { label: "Desv. Est. (s)", value: sampleStats.stdDev, diff: Math.abs(popStats.stdDev - sampleStats.stdDev).toFixed(2) },
                        ].map((stat, i) => (
                          <div key={i} className="bg-slate-950/50 p-4 rounded-xl border border-pink-500/20">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-xs text-slate-500 uppercase font-bold">{stat.label}</div>
                              <div className="text-xs text-slate-500">Δ: {stat.diff}</div>
                            </div>
                            <div className={`text-3xl font-black bg-gradient-to-r ${i === 0 ? 'from-blue-500 to-cyan-500' : i === 1 ? 'from-indigo-500 to-purple-500' : 'from-purple-500 to-pink-500'} bg-clip-text text-transparent`}>
                              {stat.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {sample.length === 0 && (
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
                    <div className="text-6xl mb-4">👈</div>
                    <h3 className="text-2xl font-black text-white mb-2">Toma tu Primera Muestra</h3>
                    <p className="text-slate-400">
                      Configura los parámetros y presiona "Tomar Muestra"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'multiple' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-black text-white mb-6">Simulador de Múltiples Muestras</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                    Número de Muestras
                  </label>
                  <select
                    value={numMultipleSamples}
                    onChange={(e) => setNumMultipleSamples(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value={10}>10 muestras</option>
                    <option value={50}>50 muestras</option>
                    <option value={100}>100 muestras</option>
                    <option value={200}>200 muestras</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                    Tamaño de Muestra
                  </label>
                  <input
                    type="number"
                    value={sampleSize}
                    onChange={(e) => setSampleSize(Number(e.target.value))}
                    min="10"
                    max={Math.min(500, populationSize)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                    Método
                  </label>
                  <select
                    value={samplingMethod}
                    onChange={(e) => setSamplingMethod(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="random">Aleatorio</option>
                    <option value="systematic">Sistemático</option>
                    <option value="stratified">Estratificado</option>
                  </select>
                </div>
              </div>

              <button
                onClick={runMultipleSamples}
                disabled={isRunningMultiple || population.length === 0}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-black text-lg hover:scale-105 transition-transform shadow-2xl shadow-purple-500/50 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isRunningMultiple ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Ejecutando...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Ejecutar Simulación
                  </>
                )}
              </button>
            </div>

            {multipleSamples.length > 0 && (
              <>
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                  <h3 className="text-xl font-black text-white mb-6">Distribución de Medias Muestrales</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={samplingDistData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis 
                        dataKey="media" 
                        stroke="#94a3b8"
                        tickFormatter={(value) => value.toFixed(1)}
                      />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155'}} />
                      <Bar dataKey="frecuencia" fill="#a855f7" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                    <p className="text-sm text-slate-300 text-center">
                      <strong className="text-purple-400">💡 Teorema del Límite Central:</strong> La distribución de las medias muestrales tiende a una distribución normal, sin importar la distribución original.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                  <h3 className="text-xl font-black text-white mb-6">Estadísticas de las Simulaciones</h3>
                  
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { 
                        label: "Media de Medias", 
                        value: (multipleSamples.reduce((sum, s) => sum + s.mean, 0) / multipleSamples.length).toFixed(2),
                        color: "from-blue-500 to-cyan-500"
                      },
                      { 
                        label: "Media Poblacional", 
                        value: popStats?.mean || '0',
                        color: "from-indigo-500 to-purple-500"
                      },
                      { 
                        label: "Diferencia", 
                        value: Math.abs((multipleSamples.reduce((sum, s) => sum + s.mean, 0) / multipleSamples.length) - parseFloat(popStats?.mean || 0)).toFixed(2),
                        color: "from-purple-500 to-pink-500"
                      },
                    ].map((stat, i) => (
                      <div key={i} className="bg-slate-950/50 p-6 rounded-xl border border-purple-500/20">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-2">{stat.label}</div>
                        <div className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {multipleSamples.length === 0 && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-black text-white mb-2">Ejecuta la Simulación</h3>
                <p className="text-slate-400">
                  Toma múltiples muestras para observar el Teorema del Límite Central en acción
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-black text-white mb-6">Comparador de Métodos de Muestreo</h3>
              
              <button
                onClick={compareAllMethods}
                disabled={population.length === 0}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-black text-lg hover:scale-105 transition-transform shadow-2xl shadow-cyan-500/50 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <GitCompare className="w-5 h-5" />
                Comparar los 3 Métodos
              </button>
            </div>

            {comparisonSamples.random && comparisonSamples.systematic && comparisonSamples.stratified && (
              <>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { name: 'Aleatorio Simple', data: comparisonSamples.random, color: 'blue' },
                    { name: 'Sistemático', data: comparisonSamples.systematic, color: 'purple' },
                    { name: 'Estratificado', data: comparisonSamples.stratified, color: 'pink' }
                  ].map((method, idx) => {
                    const stats = calculateStats(method.data);
                    return (
                      <div key={idx} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                        <h4 className={`text-lg font-black mb-4 text-${method.color}-400`}>{method.name}</h4>
                        <div className="space-y-3">
                          {[
                            { label: "Media", value: stats.mean },
                            { label: "Mediana", value: stats.median },
                            { label: "Desv. Est.", value: stats.stdDev }
                          ].map((stat, i) => (
                            <div key={i} className="bg-slate-950/50 p-3 rounded-xl">
                              <div className="text-xs text-slate-500 uppercase font-bold mb-1">{stat.label}</div>
                              <div className="text-2xl font-black text-white">{stat.value}</div>
                              <div className="text-xs text-slate-400 mt-1">
                                Error: {Math.abs(parseFloat(stat.value) - parseFloat(popStats[stat.label === "Media" ? "mean" : stat.label === "Mediana" ? "median" : "stdDev"])).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                  <h3 className="text-xl font-black text-white mb-6">¿Cuál método fue más preciso?</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: 'Aleatorio', data: comparisonSamples.random },
                      { name: 'Sistemático', data: comparisonSamples.systematic },
                      { name: 'Estratificado', data: comparisonSamples.stratified }
                    ].map((method, idx) => {
                      const stats = calculateStats(method.data);
                      const error = Math.abs(parseFloat(stats.mean) - parseFloat(popStats.mean));
                      const score = Math.max(0, 100 - (error * 10));
                      
                      return (
                        <div key={idx} className="bg-slate-950/50 p-6 rounded-xl border border-indigo-500/20 text-center">
                          <div className="text-sm font-bold text-slate-400 mb-2">{method.name}</div>
                          <div className="text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                            {score.toFixed(0)}
                          </div>
                          <div className="text-xs text-slate-500">Puntuación</div>
                          <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500" 
                              style={{width: `${score}%`}}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {!comparisonSamples.random && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
                <div className="text-6xl mb-4">⚖️</div>
                <h3 className="text-2xl font-black text-white mb-2">Compara los Métodos</h3>
                <p className="text-slate-400">
                  Descubre cuál método de muestreo es más representativo
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <h3 className="text-2xl font-black text-white mb-6">Conceptos Clave</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950/50 p-6 rounded-2xl border border-indigo-500/20">
              <div className="flex items-start gap-4">
                <div className="text-4xl">👥</div>
                <div>
                  <h4 className="font-black text-lg text-indigo-400 mb-2">Población (N)</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Conjunto completo de elementos que queremos estudiar.
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
                    Subconjunto representativo de la población.
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
                    Una buena muestra refleja las características de la población.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/50 p-6 rounded-2xl border border-cyan-500/20">
              <div className="flex items-start gap-4">
                <div className="text-4xl">📊</div>
                <div>
                  <h4 className="font-black text-lg text-cyan-400 mb-2">Error Muestral</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Diferencia entre estadísticas de muestra y parámetros poblacionales.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Lab12PoblacionMuestra;