import React, { useState, useEffect, useMemo } from 'react';
import { Users, Shuffle, RefreshCw, TrendingUp, BarChart3, ArrowLeft, Upload, FileSpreadsheet, X, Download, Info, AlertCircle, BookOpen, ChevronDown, ChevronUp, Target } from 'lucide-react';
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
  const [availableColumns, setAvailableColumns] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [categoricalColumns, setCategoricalColumns] = useState([]);
  const [selectedStratColumn, setSelectedStratColumn] = useState('');
  const [availableMethods, setAvailableMethods] = useState(['random', 'systematic']);
  const [showGuide, setShowGuide] = useState(true);
  
  useEffect(() => {
    if (dataSource === 'generated') {
      generatePopulation();
      setAvailableMethods(['random', 'systematic', 'stratified']);
      setSelectedStratColumn('group');
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
  };

  const detectCategoricalColumns = (data, columns, numericColumn) => {
    const categorical = [];
    
    columns.forEach(col => {
      if (col === numericColumn) return;
      
      const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined);
      const uniqueValues = [...new Set(values)];
      const isNumeric = values.every(v => typeof v === 'number' || !isNaN(parseFloat(v)));
      const uniqueCount = uniqueValues.length;
      
      if (!isNumeric || (isNumeric && uniqueCount <= 20)) {
        categorical.push({
          name: col,
          uniqueCount: uniqueCount,
          sampleValues: uniqueValues.slice(0, 5),
          isNumeric: isNumeric
        });
      }
    });
    
    return categorical;
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
      
      const categorical = detectCategoricalColumns(data, columns, numericColumn);
      setCategoricalColumns(categorical);
      
      if (categorical.length > 0) {
        setAvailableMethods(['random', 'systematic', 'stratified']);
        setSelectedStratColumn(categorical[0].name);
      } else {
        setAvailableMethods(['random', 'systematic']);
        setSelectedStratColumn('');
        if (samplingMethod === 'stratified') {
          setSamplingMethod('random');
        }
      }
      
      createPopulationFromColumn(data, numericColumn, categorical.length > 0 ? categorical[0].name : null);
    }
  };

  const createPopulationFromColumn = (data, column, stratColumn = null) => {
    const pop = data
      .map((row, idx) => {
        const value = parseFloat(row[column]);
        if (!isNaN(value)) {
          return {
            id: idx,
            value: value,
            rawData: row,
            stratGroup: stratColumn ? row[stratColumn] : (idx % 4)
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
    setCategoricalColumns([]);
    setSelectedStratColumn('');
    setAvailableMethods(['random', 'systematic']);
    setDataSource('generated');
    generatePopulation();
  };

  const handleColumnChange = (column) => {
    setSelectedColumn(column);
    
    const categorical = detectCategoricalColumns(fileData, availableColumns, column);
    setCategoricalColumns(categorical);
    
    if (categorical.length > 0) {
      setAvailableMethods(['random', 'systematic', 'stratified']);
      setSelectedStratColumn(categorical[0].name);
      createPopulationFromColumn(fileData, column, categorical[0].name);
    } else {
      setAvailableMethods(['random', 'systematic']);
      setSelectedStratColumn('');
      if (samplingMethod === 'stratified') {
        setSamplingMethod('random');
      }
      createPopulationFromColumn(fileData, column, null);
    }
  };

  const handleStratColumnChange = (stratCol) => {
    setSelectedStratColumn(stratCol);
    createPopulationFromColumn(fileData, selectedColumn, stratCol);
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
    const groups = {};
    population.forEach(p => {
      const key = p.stratGroup;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    
    const sampled = [];
    const groupKeys = Object.keys(groups);
    const perGroup = Math.floor(sampleSize / groupKeys.length);
    
    groupKeys.forEach(key => {
      const group = groups[key];
      const shuffled = [...group].sort(() => 0.5 - Math.random());
      sampled.push(...shuffled.slice(0, Math.min(perGroup, group.length)));
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
      ...item.rawData
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `muestra_${samplingMethod}_n${sampleSize}.csv`;
    link.click();
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

  // Interpretación automática del histograma
  const getHistogramInterpretation = () => {
    if (sample.length === 0) return null;
    
    const meanDiff = Math.abs(parseFloat(popStats.mean) - parseFloat(sampleStats.mean));
    const medianDiff = Math.abs(parseFloat(popStats.median) - parseFloat(sampleStats.median));
    
    if (meanDiff < 5 && medianDiff < 5) {
      return {
        icon: '✅',
        text: 'La muestra conserva la forma general de la población',
        color: 'emerald'
      };
    } else if (meanDiff < 10 && medianDiff < 10) {
      return {
        icon: '⚠️',
        text: 'La muestra tiene algunas diferencias con la población',
        color: 'yellow'
      };
    } else {
      return {
        icon: '❌',
        text: 'La muestra se aleja significativamente de la población',
        color: 'red'
      };
    }
  };

  const interpretation = getHistogramInterpretation();

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
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">1.2 La población y la muestra</h2>
              <p className="text-slate-400 leading-relaxed max-w-3xl font-medium mb-3">
                Explora cómo una muestra representa a la población usando distintos métodos de muestreo.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <Target className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-400">
                  <strong>Objetivo:</strong> Comprender cómo distintos métodos de muestreo afectan la representatividad de una muestra
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
              <h3 className="text-lg font-black text-white">¿Qué estoy viendo?</h3>
            </div>
            {showGuide ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          
          {showGuide && (
            <div className="px-6 pb-6 space-y-4">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-blue-500/10">
                <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  ¿Qué significa esta gráfica?
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  El histograma compara la <strong className="text-white">distribución de valores</strong> entre la población completa (azul) y tu muestra (rosa). 
                  Si ambas barras tienen <strong className="text-white">formas similares</strong>, significa que tu muestra es representativa. 
                  Si son muy diferentes, la muestra podría no reflejar bien la población.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-emerald-500/10">
                  <h4 className="font-bold text-emerald-400 mb-2 text-sm">Aleatorio Simple</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Cada elemento tiene la misma probabilidad de ser seleccionado. Simple y sin sesgos.
                  </p>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-xl border border-purple-500/10">
                  <h4 className="font-bold text-purple-400 mb-2 text-sm">Sistemático</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Se selecciona cada k-ésimo elemento. Útil cuando hay un orden natural en los datos.
                  </p>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-xl border border-pink-500/10">
                  <h4 className="font-bold text-pink-400 mb-2 text-sm">Estratificado</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Divide la población en grupos y muestrea de cada uno. Asegura representación de todos los subgrupos.
                  </p>
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

          {dataSource === 'generated' && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300">
                <strong className="text-blue-400">Datos simulados:</strong> Distribución controlada con fines educativos. 
                Ideal para experimentar sin necesidad de archivos.
              </p>
            </div>
          )}

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
                            Estas columnas pueden usarse para muestreo estratificado
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {categoricalColumns.map((col, idx) => (
                          <div key={idx} className="bg-slate-900/50 p-3 rounded-lg border border-blue-500/10">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-white">{col.name}</span>
                              <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded">
                                {col.uniqueCount} categorías
                              </span>
                            </div>
                            <div className="text-xs text-slate-400">
                              <span className="font-bold">Ejemplos:</span> {col.sampleValues.map(v => String(v)).join(', ')}
                              {col.uniqueCount > 5 && '...'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {categoricalColumns.length === 0 && availableColumns.length > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-yellow-400 mb-1">Sin Columnas Categóricas</h4>
                        <p className="text-xs text-slate-400">
                          No se detectaron columnas categóricas. Solo estarán disponibles los métodos Aleatorio Simple y Sistemático.
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
                    Método de Muestreo
                  </label>
                  <select
                    value={samplingMethod}
                    onChange={(e) => setSamplingMethod(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="random">Aleatorio Simple</option>
                    <option value="systematic">Sistemático</option>
                    <option value="stratified" disabled={!availableMethods.includes('stratified')}>
                      Estratificado {!availableMethods.includes('stratified') && '(No disponible)'}
                    </option>
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
                      {categoricalColumns.map((col) => (
                        <option key={col.name} value={col.name}>
                          {col.name} ({col.uniqueCount} grupos)
                        </option>
                      ))}
                    </select>
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
            {sample.length > 0 && histogramData.length > 0 && (
              <>
                <div className="glass rounded-3xl p-8 min-h-[500px]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-white">Distribución: Población vs Muestra</h3>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="rango" 
                        stroke="#94a3b8"
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                        label={{
                          value: 'Rango de Valores',
                          position: 'insideBottom',
                          offset: -50,
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

                  {interpretation && (
                    <div className={`mt-6 p-4 bg-${interpretation.color}-500/10 border border-${interpretation.color}-500/20 rounded-xl flex items-start gap-3`}>
                      <span className="text-2xl">{interpretation.icon}</span>
                      <div>
                        <h4 className={`font-bold text-${interpretation.color}-400 mb-1`}>Interpretación Automática</h4>
                        <p className="text-sm text-slate-300">{interpretation.text}</p>
                      </div>
                    </div>
                  )}
                </div>

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

                  <div className="mt-6 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20">
                    <p className="text-sm text-slate-300 text-center">
                      <strong className="text-indigo-400">💡 Observación:</strong> Una muestra bien tomada debe tener 
                      estadísticas similares a la población. Mientras más grande la muestra, más precisas las estimaciones.
                    </p>
                  </div>
                </div>
              </>
            )}

            {sample.length === 0 && (
              <div className="glass rounded-3xl p-12 text-center min-h-[500px] flex flex-col items-center justify-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl" />
                  <div className="relative w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                    <BarChart3 className="w-16 h-16 text-slate-700" />
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

      <style jsx>{`
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