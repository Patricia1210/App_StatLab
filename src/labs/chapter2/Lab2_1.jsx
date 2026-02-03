import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Upload, FileSpreadsheet, X, Download,
  CheckCircle, XCircle, Target, Lightbulb, AlertCircle,
  Shuffle, Brain, BookOpen, BarChart3
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const Lab2_1 = ({ goHome, setView, setSelectedSection, goToSection }) => {
  const [activeTab, setActiveTab] = useState('classifier');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [difficulty, setDifficulty] = useState('basic');
  const [currentCards, setCurrentCards] = useState([]);
  const [classifications, setClassifications] = useState({
    nominal: [],
    ordinal: [],
    discrete: [],
    continuous: []
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [analyzedColumns, setAnalyzedColumns] = useState([]);
  const [selectedArea, setSelectedArea] = useState('health');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [comparisonScenario, setComparisonScenario] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [areaProgress, setAreaProgress] = useState({});
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [areaScore, setAreaScore] = useState(0);
  const [instantFeedback, setInstantFeedback] = useState(null);
  const [cardResults, setCardResults] = useState({});
  const [areaFeedback, setAreaFeedback] = useState(null);
  const areaFeedbackTimerRef = useRef(null);
  const [roundFinished, setRoundFinished] = useState(false);
  const [roundStats, setRoundStats] = useState({ correct: 0, total: 0 });
  const [pool, setPool] = useState([]);
  const [poolIndex, setPoolIndex] = useState(0);


  const dataExamples = {
    basic: [
      { id: 1, text: 'Color de ojos', correct: 'nominal', explanation: 'Categórico sin orden (azul, verde, café)' },
      { id: 2, text: 'Número de hermanos', correct: 'discrete', explanation: 'Cuantitativo discreto (0, 1, 2, 3...)' },
      { id: 3, text: 'Temperatura en °C', correct: 'continuous', explanation: 'Cuantitativo continuo (36.5, 37.2...)' },
      { id: 4, text: 'Nivel educativo', correct: 'ordinal', explanation: 'Categórico con orden (primaria < secundaria < universidad)' },
      { id: 5, text: 'Género', correct: 'nominal', explanation: 'Categórico sin orden' },
      { id: 6, text: 'Edad en años', correct: 'discrete', explanation: 'Cuantitativo discreto' },
      { id: 7, text: 'Peso en kg', correct: 'continuous', explanation: 'Cuantitativo continuo (65.5, 70.2...)' },
      { id: 8, text: 'Calificación (A, B, C)', correct: 'ordinal', explanation: 'Categórico con orden (A > B > C)' },
    ],
    intermediate: [
      { id: 9, text: 'Tipo de sangre', correct: 'nominal', explanation: 'Categórico sin orden (A, B, AB, O)' },
      { id: 10, text: 'Escala Likert (1-5)', correct: 'ordinal', explanation: 'Categórico ordenado' },
      { id: 11, text: 'Número de clics', correct: 'discrete', explanation: 'Conteo de eventos' },
      { id: 12, text: 'Tiempo en segundos', correct: 'continuous', explanation: 'Medición continua' },
      { id: 13, text: 'Estado civil', correct: 'nominal', explanation: 'Categorías sin orden' },
      { id: 14, text: 'Ranking de productos', correct: 'ordinal', explanation: '1° > 2° > 3°' },
      { id: 15, text: 'Cantidad de productos', correct: 'discrete', explanation: 'Números enteros' },
      { id: 16, text: 'Altura en metros', correct: 'continuous', explanation: '1.75, 1.82...' },
    ],
    advanced: [
      { id: 17, text: 'Código postal', correct: 'nominal', explanation: 'Aunque son números, son categorías' },
      { id: 18, text: 'pH del agua', correct: 'continuous', explanation: 'Escala continua 0-14' },
      { id: 19, text: 'Nivel socioeconómico', correct: 'ordinal', explanation: 'Bajo < Medio < Alto' },
      { id: 20, text: 'Número de accidentes', correct: 'discrete', explanation: 'Conteo de eventos' },
      { id: 21, text: 'Dirección IP', correct: 'nominal', explanation: 'Identificador categórico' },
      { id: 22, text: 'Talla de ropa (S, M, L)', correct: 'ordinal', explanation: 'S < M < L' },
      { id: 23, text: 'Concentración (mg/L)', correct: 'continuous', explanation: 'Medición continua' },
      { id: 24, text: 'Etapa de cáncer (I-IV)', correct: 'ordinal', explanation: 'Progresión ordenada' },
    ]
  };

  const areaExamples = {
    health: {
      name: 'Salud',
      icon: '🏥',
      dataset: {
        name: 'Pacientes Hospital Central',
        rows: [
          { id: 'P001', tipo_sangre: 'O+', edad: 45, presion: 120.5, estado: 'Estable' },
          { id: 'P002', tipo_sangre: 'A-', edad: 32, presion: 115.2, estado: 'Crítico' },
          { id: 'P003', tipo_sangre: 'B+', edad: 58, presion: 135.8, estado: 'Grave' },
          { id: 'P004', tipo_sangre: 'AB-', edad: 27, presion: 110.3, estado: 'Recuperado' },
        ],
        columns: [
          { key: 'id', name: 'ID Paciente', type: 'nominal', explanation: 'Identificador único (categórico sin orden)', chart: 'N/A' },
          { key: 'tipo_sangre', name: 'Tipo de Sangre', type: 'nominal', explanation: 'Categorías sin orden natural (O+, A-, B+, AB-)', chart: 'Gráfico de Barras' },
          { key: 'edad', name: 'Edad', type: 'discrete', explanation: 'Números enteros contables (años completos)', chart: 'Histograma' },
          { key: 'presion', name: 'Presión Arterial', type: 'continuous', explanation: 'Medición continua con decimales (mmHg)', chart: 'Gráfico de Línea' },
          { key: 'estado', name: 'Estado del Paciente', type: 'ordinal', explanation: 'Categorías con orden: Crítico < Grave < Estable < Recuperado', chart: 'Gráfico de Barras Ordenado' },
        ]
      }
    },
    business: {
      name: 'Negocios',
      icon: '💼',
      dataset: {
        name: 'Empleados Empresa Tech',
        rows: [
          { id: 'E001', departamento: 'Ventas', salario: 45000.50, años: 3, satisfaccion: 'Alto' },
          { id: 'E002', departamento: 'IT', salario: 65000.75, años: 5, satisfaccion: 'Medio' },
          { id: 'E003', departamento: 'Marketing', salario: 52000.00, años: 2, satisfaccion: 'Alto' },
          { id: 'E004', departamento: 'RRHH', salario: 48000.25, años: 4, satisfaccion: 'Bajo' },
        ],
        columns: [
          { key: 'id', name: 'ID Empleado', type: 'nominal', explanation: 'Identificador único sin significado numérico', chart: 'N/A' },
          { key: 'departamento', name: 'Departamento', type: 'nominal', explanation: 'Categorías sin orden (Ventas, IT, Marketing, RRHH)', chart: 'Gráfico de Pastel' },
          { key: 'salario', name: 'Salario ($)', type: 'continuous', explanation: 'Cantidad monetaria con decimales', chart: 'Histograma' },
          { key: 'años', name: 'Años Experiencia', type: 'discrete', explanation: 'Números enteros (años completos)', chart: 'Gráfico de Barras' },
          { key: 'satisfaccion', name: 'Nivel Satisfacción', type: 'ordinal', explanation: 'Categorías ordenadas: Bajo < Medio < Alto', chart: 'Gráfico de Barras Ordenado' },
        ]
      }
    },
    education: {
      name: 'Educación',
      icon: '🎓',
      dataset: {
        name: 'Estudiantes Universidad',
        rows: [
          { id: 'EST001', carrera: 'Ingeniería', promedio: 8.5, materias: 6, nivel: 'Licenciatura' },
          { id: 'EST002', carrera: 'Medicina', promedio: 9.2, materias: 8, nivel: 'Maestría' },
          { id: 'EST003', carrera: 'Derecho', promedio: 7.8, materias: 5, nivel: 'Licenciatura' },
          { id: 'EST004', carrera: 'Psicología', promedio: 8.9, materias: 7, nivel: 'Doctorado' },
        ],
        columns: [
          { key: 'id', name: 'ID Estudiante', type: 'nominal', explanation: 'Código identificador (categórico)', chart: 'N/A' },
          { key: 'carrera', name: 'Carrera', type: 'nominal', explanation: 'Categorías sin orden inherente', chart: 'Gráfico de Pastel' },
          { key: 'promedio', name: 'Promedio', type: 'continuous', explanation: 'Calificación con decimales (escala continua)', chart: 'Histograma' },
          { key: 'materias', name: 'Número de Materias', type: 'discrete', explanation: 'Conteo de cursos (números enteros)', chart: 'Gráfico de Barras' },
          { key: 'nivel', name: 'Nivel Académico', type: 'ordinal', explanation: 'Grados ordenados: Licenciatura < Maestría < Doctorado', chart: 'Gráfico de Barras Ordenado' },
        ]
      }
    },
    science: {
      name: 'Ciencias',
      icon: '🔬',
      dataset: {
        name: 'Experimento de Laboratorio',
        rows: [
          { id: 'M001', especie: 'Rata', ph: 7.2, mutaciones: 3, dureza: 'Medio' },
          { id: 'M002', especie: 'Ratón', ph: 6.8, mutaciones: 1, dureza: 'Bajo' },
          { id: 'M003', especie: 'Conejo', ph: 7.5, mutaciones: 0, dureza: 'Alto' },
          { id: 'M004', especie: 'Cobayo', ph: 7.0, mutaciones: 2, dureza: 'Medio' },
        ],
        columns: [
          { key: 'id', name: 'ID Muestra', type: 'nominal', explanation: 'Identificador de muestra (categórico)', chart: 'N/A' },
          { key: 'especie', name: 'Especie Animal', type: 'nominal', explanation: 'Categorías biológicas sin orden', chart: 'Gráfico de Pastel' },
          { key: 'ph', name: 'Nivel de pH', type: 'continuous', explanation: 'Medición continua en escala 0-14', chart: 'Gráfico de Línea' },
          { key: 'mutaciones', name: 'Número Mutaciones', type: 'discrete', explanation: 'Conteo de eventos (enteros)', chart: 'Gráfico de Barras' },
          { key: 'dureza', name: 'Escala de Dureza', type: 'ordinal', explanation: 'Categorías ordenadas: Bajo < Medio < Alto', chart: 'Gráfico de Barras Ordenado' },
        ]
      }
    }
  };

  const comparisonScenarios = [
    {
      id: 1,
      title: 'Edad de Empleados',
      description: 'Analizar la edad del personal',
      wrong: {
        classification: 'Cualitativo Nominal',
        reasoning: 'Tratar la edad como categorías sin orden',
        visualization: 'Gráfico de Pie',
        consequence: 'Perdemos información valiosa sobre distribución y tendencias'
      },
      correct: {
        classification: 'Cuantitativo Discreto',
        reasoning: 'La edad son números enteros con significado numérico',
        visualization: 'Histograma',
        consequence: 'Podemos calcular promedios, medianas y ver tendencias'
      }
    },
    {
      id: 2,
      title: 'Códigos Postales',
      description: 'Análisis de ubicaciones por código postal',
      wrong: {
        classification: 'Cuantitativo Continuo',
        reasoning: 'Son números, entonces podemos calcular promedios',
        visualization: 'Gráfico de Línea',
        consequence: 'Calcular "promedio de códigos postales" no tiene sentido'
      },
      correct: {
        classification: 'Cualitativo Nominal',
        reasoning: 'Son identificadores categóricos, no cantidades',
        visualization: 'Gráfico de Barras',
        consequence: 'Contamos frecuencias por zona correctamente'
      }
    },
    {
      id: 3,
      title: 'Rangos de Salario',
      description: 'Clasificación de empleados por salario',
      wrong: {
        classification: 'Cuantitativo Continuo',
        reasoning: 'Usar rangos como "<$30k", "$30k-50k", ">$50k" y tratarlos como números',
        visualization: 'Gráfico de Dispersión',
        consequence: 'No podemos calcular salarios promedio reales ni hacer comparaciones precisas'
      },
      correct: {
        classification: 'Cualitativo Ordinal',
        reasoning: 'Son categorías con orden natural (Bajo < Medio < Alto)',
        visualization: 'Gráfico de Barras Ordenado',
        consequence: 'Respetamos el orden y usamos estadísticas apropiadas como la mediana categórica'
      }
    },
    {
      id: 4,
      title: 'Fechas como Texto',
      description: 'Análisis de ventas por fecha',
      wrong: {
        classification: 'Cualitativo Nominal',
        reasoning: 'Guardar fechas como texto: "15-Ene-2024", "20-Feb-2024"',
        visualization: 'Gráfico de Barras',
        consequence: 'Imposible hacer análisis de tendencias temporales, estacionalidad o proyecciones'
      },
      correct: {
        classification: 'Cuantitativo Continuo (Temporal)',
        reasoning: 'Las fechas son mediciones continuas en el tiempo',
        visualization: 'Serie de Tiempo',
        consequence: 'Podemos identificar tendencias, patrones estacionales y hacer pronósticos'
      }
    },
    {
      id: 5,
      title: 'Escala de Satisfacción',
      description: 'Encuesta de satisfacción del cliente (1-5)',
      wrong: {
        classification: 'Cuantitativo Continuo',
        reasoning: 'Tratar 1,2,3,4,5 como números continuos y calcular media',
        visualization: 'Histograma de Frecuencias',
        consequence: 'Una media de 3.2 no tiene significado real cuando las opciones son discretas y ordinales'
      },
      correct: {
        classification: 'Cualitativo Ordinal',
        reasoning: 'Son categorías ordenadas: Muy Insatisfecho < Insatisfecho < Neutral < Satisfecho < Muy Satisfecho',
        visualization: 'Gráfico de Barras Apiladas',
        consequence: 'Usamos mediana y moda, que son más apropiadas para datos ordinales'
      }
    }
  ];

  const getNumCards = () => (difficulty === 'basic' ? 4 : difficulty === 'intermediate' ? 6 : 8);

  useEffect(() => {
    return () => {
      if (areaFeedbackTimerRef.current) clearTimeout(areaFeedbackTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const examples = [...dataExamples[difficulty]].sort(() => Math.random() - 0.5);
    setPool(examples);
    setPoolIndex(0);
    setScore(0);
    setAttempts(0);
    generateNewRoundFromPool(examples, 0);
  }, [difficulty]);

  const generateNewRoundFromPool = (poolArr = pool, startIndex = poolIndex) => {
    const numCards = getNumCards();
    let idx = startIndex;
    let nextPool = poolArr;

    if (idx + numCards > poolArr.length) {
      nextPool = [...dataExamples[difficulty]].sort(() => Math.random() - 0.5);
      idx = 0;
      setPool(nextPool);
    }

    const selected = nextPool.slice(idx, idx + numCards);
    setPoolIndex(idx + numCards);

    setCurrentCards(selected);
    setClassifications({
      nominal: [],
      ordinal: [],
      discrete: [],
      continuous: []
    });
    setShowFeedback(false);
    setSelectedCard(null);
    setInstantFeedback(null);
    setCardResults({});
    setRoundFinished(false);
  };

  const handleCardSelect = (card) => {
    setSelectedCard(card);
  };

  const categoryNames = {
    nominal: 'Cualitativo Nominal',
    ordinal: 'Cualitativo Ordinal',
    discrete: 'Cuantitativo Discreto',
    continuous: 'Cuantitativo Continuo'
  };

  const handleCategoryClick = (category) => {
    if (!selectedCard) {
      alert('Primero selecciona un dato de la lista de abajo');
      return;
    }

    const newClassifications = { ...classifications };
    Object.keys(newClassifications).forEach(key => {
      newClassifications[key] = newClassifications[key].filter(c => c.id !== selectedCard.id);
    });
    newClassifications[category].push(selectedCard);
    setClassifications(newClassifications);

    const ok = selectedCard.correct === category;
    setAttempts(a => a + 1);
    setScore(s => s + (ok ? 1 : 0));

    const nextCardResults = {
      ...cardResults,
      [selectedCard.id]: ok
    };
    setCardResults(nextCardResults);

    setInstantFeedback({
      ok,
      text: selectedCard.text,
      explanation: selectedCard.explanation,
      correctLabel: categoryNames[selectedCard.correct]
    });

    setSelectedCard(null);

    setTimeout(() => setInstantFeedback(null), 1400);

    const allPlacedAfter = currentCards.every(c =>
      Object.values(newClassifications).some(arr => arr.some(x => x.id === c.id))
    );

    if (allPlacedAfter) {
      const total = currentCards.length;
      const correct = currentCards.reduce((acc, c) => acc + (nextCardResults[c.id] ? 1 : 0), 0);
      setRoundStats({ correct, total });
      setRoundFinished(true);
    }
  };

  const handleColumnClassification = (column, selectedType) => {
    const isCorrect = column.type === selectedType;

    setAreaProgress(prev => {
      const next = { ...prev };
      if (!next[selectedArea]) next[selectedArea] = {};
      next[selectedArea][column.key] = {
        classified: true,
        correct: isCorrect,
        selectedType
      };
      return next;
    });

    if (isCorrect) setAreaScore(s => s + 10);

    setAreaFeedback({
      column,
      isCorrect,
      selectedType,
      areaKey: selectedArea,
      ts: Date.now()
    });

    if (areaFeedbackTimerRef.current) clearTimeout(areaFeedbackTimerRef.current);
    areaFeedbackTimerRef.current = setTimeout(() => {
      setAreaFeedback(null);
    }, 4500);
  };


  const downloadClassifierResults = () => {
    const csvData = [];

    csvData.push(['Dato', 'Clasificación Asignada', 'Clasificación Correcta', 'Estado', 'Explicación']);

    Object.entries(classifications).forEach(([category, cards]) => {
      cards.forEach(card => {
        const isCorrect = card.correct === category;

        csvData.push([
          card.text,
          categoryNames[category],
          categoryNames[card.correct],
          isCorrect ? 'Correcto' : 'Incorrecto',
          card.explanation
        ]);
      });
    });

    csvData.push([]);
    csvData.push(['RESUMEN']);
    csvData.push(['Puntuación Total', score]);
    csvData.push(['Intentos', attempts]);
    csvData.push(['Nivel de Dificultad', difficulty === 'basic' ? 'Básico' : difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado']);

    const csvContent = csvData.map(row =>
      row.map(cell => {
        const s = String(cell ?? '');
        return `"${s.replace(/"/g, '""')}"`;
      }).join(',')
    ).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resultados_clasificador_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadAnalysisResults = () => {
    if (analyzedColumns.length === 0) {
      alert('No hay datos analizados para exportar');
      return;
    }

    const csvData = [];

    csvData.push(['Columna', 'Tipo de Dato', 'Subtipo', 'Razonamiento', 'Valores Únicos', 'Total Registros', 'Ejemplos']);

    analyzedColumns.forEach(col => {
      csvData.push([
        col.name,
        col.type,
        col.subtype,
        col.reasoning,
        col.uniqueCount,
        col.totalCount,
        col.examples.join('; ')
      ]);
    });

    csvData.push([]);
    csvData.push(['RESUMEN DEL ANÁLISIS']);
    csvData.push(['Archivo', uploadedFile?.name || 'N/A']);
    csvData.push(['Total de Columnas', analyzedColumns.length]);
    csvData.push(['Total de Registros', fileData.length]);
    csvData.push(['Fecha de Análisis', new Date().toLocaleString('es-MX')]);

    csvData.push([]);
    csvData.push(['DISTRIBUCIÓN POR TIPO DE DATO']);
    const typeCount = analyzedColumns.reduce((acc, col) => {
      acc[col.subtype] = (acc[col.subtype] || 0) + 1;
      return acc;
    }, {});
    Object.entries(typeCount).forEach(([type, count]) => {
      csvData.push([type, count]);
    });

    const csvContent = csvData.map(row =>
      row.map(cell => {
        const s = String(cell ?? '');
        return `"${s.replace(/"/g, '""')}"`;
      }).join(',')
    ).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analisis_datos_${uploadedFile?.name.split('.')[0] || 'archivo'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetGame = () => {
    setScore(0);
    setAttempts(0);
    const examples = [...dataExamples[difficulty]].sort(() => Math.random() - 0.5);
    setPool(examples);
    setPoolIndex(0);
    generateNewRoundFromPool(examples, 0);
  };

  const processFile = async (file) => {
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => analyzeData(results.data),
        error: () => alert('No se pudo leer el CSV. Verifica el formato.')
      });

    } else if (extension === 'xlsx' || extension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          analyzeData(jsonData);
        } catch (err) {
          alert('No se pudo leer el Excel. Verifica que no esté dañado.');
        }
      };
      reader.readAsArrayBuffer(file);
    }

  };

  const looksOrdinalByValues = (valuesRaw) => {
    const values = valuesRaw
      .map(v => String(v).trim().toLowerCase())
      .filter(Boolean);

    const uniq = [...new Set(values)];

    const orderedSets = [
      ['bajo', 'medio', 'alto'],
      ['muy bajo', 'bajo', 'medio', 'alto', 'muy alto'],
      ['malo', 'regular', 'bueno'],
      ['muy malo', 'malo', 'regular', 'bueno', 'muy bueno'],
      ['primaria', 'secundaria', 'preparatoria', 'universidad'],
      ['licenciatura', 'maestría', 'doctorado'],
      ['s', 'm', 'l', 'xl'],
      ['a', 'b', 'c', 'd', 'f'],
      ['crítico', 'grave', 'estable', 'recuperado']
    ];

    const set = new Set(uniq);
    const match = orderedSets.some(arr => arr.every(x => set.has(x)));

    return match;
  };

  const looksLikertNumeric = (colName, numericUniques) => {
    const name = (colName || '').toLowerCase();
    const nameSuggestsLikert =
      /likert|satisf|satisfaccion|calif|rating|evaluaci|opini|escala/i.test(name);

    const uniq = [...new Set(numericUniques)].sort((a, b) => a - b);
    const max = uniq[uniq.length - 1];
    const min = uniq[0];

    const smallScale = (min >= 0 && max <= 10 && uniq.length <= 10);
    return nameSuggestsLikert && smallScale;
  };

  const analyzeData = (data) => {
    setFileData(data);
    if (data.length === 0) return;

    const columns = Object.keys(data[0]);
    const analyzed = columns.map(col => {
      const values = data.map(row => row[col]).filter(v => v != null);
      const uniqueCount = new Set(values).size;
      const totalCount = values.length;

      let type = 'nominal';
      let subtype = '';
      let reasoning = '';

      const numericParsed = values
        .map(v => (typeof v === 'number' ? v : Number(String(v).replace(',', '.'))))
        .filter(v => Number.isFinite(v));

      const looksLikeId = values.some(v => {
        const s = String(v).trim();
        return (/^0\d+$/.test(s) || /[a-zA-Z]/.test(s));
      });

      const numericRatio = totalCount > 0 ? (numericParsed.length / totalCount) : 0;


      if (!looksLikeId && numericRatio > 0.8) {
        const hasDecimals = numericParsed.some(v => v % 1 !== 0);
        if (hasDecimals) {
          type = 'continuous';
          subtype = 'Cuantitativo Continuo';
          reasoning = 'Contiene números con decimales (mediciones continuas)';
        } else {
          type = 'discrete';
          subtype = 'Cuantitativo Discreto';
          reasoning = 'Contiene números enteros (conteos o cantidades discretas)';
        }
      } else {
        const sampleValues = values.slice(0, 200);
        const numericUniq = [...new Set(numericParsed)];

        if (looksOrdinalByValues(sampleValues) || looksLikertNumeric(col, numericUniq)) {
          type = 'ordinal';
          subtype = 'Cualitativo Ordinal';
          reasoning = 'Categorías con orden claro (detectado por patrones comunes)';
        } else {
          type = 'nominal';
          subtype = 'Cualitativo Nominal';
          reasoning = 'Categorías sin orden inherente (nombres/etiquetas/identificadores)';
        }
      }

      return {
        name: col,
        type,
        subtype,
        reasoning,
        uniqueCount,
        totalCount,
        examples: [...new Set(values)].slice(0, 5)
      };
    });

    setAnalyzedColumns(analyzed);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setFileData([]);
    setAnalyzedColumns([]);
    processFile(file);

    // ✅ permite volver a seleccionar el mismo archivo
    event.target.value = '';
  };


  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      setUploadedFile(file);
      setFileData([]);
      setAnalyzedColumns([]);
      processFile(file);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      nominal: 'from-blue-500 to-cyan-500',
      ordinal: 'from-purple-500 to-pink-500',
      discrete: 'from-green-500 to-emerald-500',
      continuous: 'from-orange-500 to-yellow-500'
    };
    return colors[type] || colors.nominal;
  };

  const getTypeIcon = (type) => {
    const icons = {
      nominal: '🏷️',
      ordinal: '📊',
      discrete: '🔢',
      continuous: '📈'
    };
    return icons[type] || '📌';
  };

  const isCardPlaced = (cardId) => {
    return Object.values(classifications).some(cat =>
      cat.find(c => c.id === cardId)
    );
  };

  // Calcular progreso
  const placedCount = currentCards.filter(c => isCardPlaced(c.id)).length;
  const totalCount = currentCards.length;
  const correctCount = currentCards.reduce((acc, c) => acc + (cardResults[c.id] ? 1 : 0), 0);
  const wrongCount = placedCount - correctCount;

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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10"></div>
                <BarChart3 className="w-7 h-7 text-white relative z-10" />
              </div>
              <div>
                <span className="text-xs text-blue-400 font-bold block uppercase tracking-wider">Capítulo 2</span>
                <span className="font-black tracking-tight text-white block text-sm">Organización de Datos</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-xs text-blue-400 font-black uppercase tracking-wider">Lab 2.1</span>
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
              <Target className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-black text-blue-500 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full">
                  Sección 2.1
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">2.1 Tipos de Datos</h2>
              <p className="text-slate-400 leading-relaxed max-w-3xl font-medium">
                Aprende a identificar y clasificar correctamente los tipos de datos: cualitativos (nominales y ordinales) y cuantitativos (discretos y continuos). La clasificación correcta es fundamental para elegir análisis y visualizaciones apropiadas.
              </p>
            </div>
          </div>
        </section>

        <div className="flex gap-3 border-b border-white/10 pb-4 flex-wrap">
          <button
            onClick={() => setActiveTab('classifier')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'classifier'
              ? 'bg-blue-500 text-white'
              : 'bg-white/5 hover:bg-white/10'
              }`}
          >
            <Brain className="w-4 h-4 inline mr-2" />
            Clasificador Interactivo
          </button>
          <button
            onClick={() => setActiveTab('explorer')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'explorer'
              ? 'bg-blue-500 text-white'
              : 'bg-white/5 hover:bg-white/10'
              }`}
          >
            <FileSpreadsheet className="w-4 h-4 inline mr-2" />
            Explorador de Datos
          </button>
          <button
            onClick={() => setActiveTab('examples')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'examples'
              ? 'bg-blue-500 text-white'
              : 'bg-white/5 hover:bg-white/10'
              }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Ejemplos por Área
          </button>
          <button
            onClick={() => setActiveTab('consequences')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'consequences'
              ? 'bg-blue-500 text-white'
              : 'bg-white/5 hover:bg-white/10'
              }`}
          >
            <AlertCircle className="w-4 h-4 inline mr-2" />
            Consecuencias
          </button>
        </div>

        {activeTab === 'classifier' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                {/* IZQUIERDA: título + instrucción */}
                <div className="min-w-0 lg:flex-1">
                  <h3 className="text-2xl font-black text-white mb-2">Clasificador Interactivo</h3>
                  <p className="text-slate-400">
                    <span className="font-bold text-blue-400">Paso 1:</span> Selecciona un dato de abajo →
                    <span className="font-bold text-purple-400 ml-2">Paso 2:</span> Haz clic en su categoría correcta
                  </p>
                </div>

                {/* DERECHA: panel y controles (se quedan a la derecha en desktop) */}
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 lg:ml-auto shrink-0">
                  <div className="text-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                    <div className="text-xs text-slate-400 uppercase font-bold">Progreso</div>
                    <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {placedCount}/{totalCount}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      ✅ {correctCount} · ❌ {wrongCount}
                    </div>
                  </div>

                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white"
                  >
                    <option value="basic">Básico</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>

                  <button
                    onClick={resetGame}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-sm"
                  >
                    <Shuffle className="w-4 h-4 inline mr-2" />
                    Reiniciar
                  </button>

                  <button
                    onClick={downloadClassifierResults}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-sm"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Exportar Resultados
                  </button>
                </div>
              </div>
              <div className="bg-slate-950/50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    Datos para Clasificar
                  </h4>
                  {selectedCard && (
                    <div className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-xl">
                      <span className="text-sm font-bold text-blue-400">
                        Seleccionado: "{selectedCard.text}"
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {currentCards.map(card => {
                    if (isCardPlaced(card.id)) return null;

                    const isSelected = selectedCard?.id === card.id;

                    return (
                      <button
                        key={card.id}
                        onClick={() => handleCardSelect(card)}
                        className={`p-4 rounded-xl transition-all border-2 ${isSelected
                          ? 'bg-blue-500 border-blue-400 scale-105 shadow-xl shadow-blue-500/50'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-600 hover:border-slate-500 hover:scale-105'
                          }`}
                      >
                        <div className={`font-bold text-center text-sm ${isSelected ? 'text-white' : 'text-slate-200'
                          }`}>
                          {card.text}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {currentCards.every(card => isCardPlaced(card.id)) && (
                  <div className="mt-4 text-center text-slate-500 text-sm">
                    ✅ Todos los datos han sido clasificados
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { key: 'nominal', label: 'Cualitativo Nominal', desc: 'Sin orden', icon: '🏷️', borderColor: 'border-blue-500/30', hoverColor: 'hover:bg-blue-500/20' },
                  { key: 'ordinal', label: 'Cualitativo Ordinal', desc: 'Con orden', icon: '📊', borderColor: 'border-purple-500/30', hoverColor: 'hover:bg-purple-500/20' },
                  { key: 'discrete', label: 'Cuantitativo Discreto', desc: 'Números enteros', icon: '🔢', borderColor: 'border-green-500/30', hoverColor: 'hover:bg-green-500/20' },
                  { key: 'continuous', label: 'Cuantitativo Continuo', desc: 'Decimales', icon: '📈', borderColor: 'border-orange-500/30', hoverColor: 'hover:bg-orange-500/20' }
                ].map(category => (
                  <button
                    key={category.key}
                    onClick={() => handleCategoryClick(category.key)}
                    className={`bg-slate-950/50 border-2 ${category.borderColor} rounded-2xl p-4 min-h-[300px] text-left transition-all ${category.hoverColor} ${selectedCard ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                  >
                    <div className="text-center mb-4 pointer-events-none">
                      <div className="text-4xl mb-2">{category.icon}</div>
                      <h4 className="font-black text-white text-sm mb-1">{category.label}</h4>
                      <p className="text-xs text-slate-500">{category.desc}</p>
                    </div>
                    <div className="space-y-2 pointer-events-none">
                      {classifications[category.key].map(card => {
                        const isCorrect = cardResults[card.id];
                        return (
                          <div
                            key={card.id}
                            className={`p-3 rounded-xl border-2 transition-all ${isCorrect !== undefined
                              ? (isCorrect
                                ? 'bg-green-500/20 border-green-500/50'
                                : 'bg-red-500/20 border-red-500/50')
                              : 'bg-slate-800/50 border-slate-700'
                              }`}
                          >
                            <div className="font-bold text-sm text-white">{card.text}</div>
                            {isCorrect !== undefined && !isCorrect && (
                              <div className="text-xs text-slate-400 mt-1">{card.explanation}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </button>
                ))}
              </div>

              {instantFeedback && (
                <div className={`mt-4 p-4 rounded-2xl border-2 ${instantFeedback.ok ? 'bg-green-500/15 border-green-500/40' : 'bg-red-500/15 border-red-500/40'
                  }`}>
                  <div className="font-black text-white">
                    {instantFeedback.ok ? '✅ Correcto' : '❌ Incorrecto'} — {instantFeedback.text}
                  </div>
                  {!instantFeedback.ok && (
                    <div className="text-sm text-slate-300 mt-1">
                      Tipo correcto: <span className="font-bold">{instantFeedback.correctLabel}</span>
                    </div>
                  )}
                </div>
              )}

              {roundFinished && (
                <div className="mt-6 p-5 rounded-2xl border border-green-500/30 bg-green-500/10">
                  <div className="font-black text-white text-lg">✅ Ronda completada</div>
                  <div className="text-slate-300 text-sm mt-1">
                    Resultado: <span className="font-bold text-green-300">{roundStats.correct}/{roundStats.total}</span>
                    {' '}— Presiona <span className="font-bold">"Nuevos Datos"</span> para continuar.
                  </div>
                </div>
              )}

              <div className="flex gap-4 flex-wrap mt-6">
                <button
                  onClick={() => {
                    if (!roundFinished) return;
                    generateNewRoundFromPool();
                  }}
                  disabled={!roundFinished}
                  className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all border
                    ${roundFinished
                      ? 'bg-white/5 hover:bg-white/10 border-white/10'
                      : 'bg-slate-800/40 border-slate-700/50 opacity-60 cursor-not-allowed'
                    }`}
                >
                  <Shuffle className="w-5 h-5 inline mr-2" />
                  {roundFinished ? 'Nuevos Datos' : 'Termina la ronda para continuar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'explorer' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl font-black text-white mb-6">Explorador de Datos</h3>

              {!uploadedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/50'
                    }`}
                >
                  <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-white mb-2">Arrastra tu archivo aquí</h4>
                  <p className="text-sm text-slate-400 mb-4">
                    Formatos soportados: CSV, XLSX, XLS
                  </p>
                  <label className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold cursor-pointer hover:scale-105 transition-transform">
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
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-green-500/30">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-8 h-8 text-green-400" />
                      <div>
                        <p className="font-bold text-white">{uploadedFile.name}</p>
                        <p className="text-sm text-slate-400">{fileData.length} registros</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setUploadedFile(null);
                        setFileData([]);
                        setAnalyzedColumns([]);
                      }}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5 text-red-400" />
                    </button>
                  </div>

                  {analyzedColumns.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-black text-white">Análisis Automático</h4>
                        <button
                          onClick={downloadAnalysisResults}
                          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold transition-all flex items-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          Exportar Análisis (CSV)
                        </button>
                      </div>

                      {analyzedColumns.map((col, idx) => (
                        <div key={idx} className="bg-slate-950/50 rounded-2xl p-6 border border-white/10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="text-4xl">{getTypeIcon(col.type)}</div>
                              <div>
                                <h5 className="font-black text-white text-lg">{col.name}</h5>
                                <p className={`text-sm font-bold bg-gradient-to-r ${getTypeColor(col.type)} bg-clip-text text-transparent`}>
                                  {col.subtype}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-500 uppercase font-bold">Valores únicos</div>
                              <div className="text-2xl font-black text-white">{col.uniqueCount}</div>
                            </div>
                          </div>

                          <div className="bg-slate-900/50 p-4 rounded-xl mb-4">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-2">Razón de Clasificación</div>
                            <p className="text-sm text-slate-300">{col.reasoning}</p>
                          </div>

                          <div className="bg-slate-900/50 p-4 rounded-xl">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-2">Ejemplos de Valores</div>
                            <div className="flex flex-wrap gap-2">
                              {col.examples.map((ex, i) => (
                                <span key={i} className="px-3 py-1 bg-slate-800 rounded-lg text-sm text-white border border-slate-700">
                                  {String(ex)}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <div className="text-xs text-blue-400 font-bold mb-1">💡 Visualización Recomendada</div>
                            <div className="text-sm text-slate-300">
                              {col.type === 'nominal' && 'Gráfico de Barras o Pastel'}
                              {col.type === 'ordinal' && 'Gráfico de Barras Ordenado'}
                              {col.type === 'discrete' && 'Histograma o Gráfico de Barras'}
                              {col.type === 'continuous' && 'Histograma, Box Plot o Gráfico de Línea'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">Ejemplos por Área de Estudio</h3>
                  <p className="text-slate-400">Analiza datasets reales y clasifica cada columna</p>
                </div>
                <div className="text-center px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                  <div className="text-xs text-slate-400 uppercase font-bold">Puntos</div>
                  <div className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {areaScore}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-6 flex-wrap">
                {Object.entries(areaExamples).map(([key, area]) => {
                  const totalColumns = area.dataset.columns.filter(c => c.key !== 'id').length;
                  const classified = areaProgress[key] ? Object.keys(areaProgress[key]).length : 0;

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedArea(key)}
                      className={`px-6 py-3 rounded-xl font-bold text-sm transition-all relative ${selectedArea === key
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 hover:bg-white/10'
                        }`}
                    >
                      <span className="mr-2">{area.icon}</span>
                      {area.name}
                      {classified > 0 && (
                        <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                          {classified}/{totalColumns}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="bg-slate-950/50 rounded-2xl p-6 mb-6">
                <h4 className="text-xl font-black text-white mb-4">
                  {areaExamples[selectedArea].icon} {areaExamples[selectedArea].dataset.name}
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {areaExamples[selectedArea].dataset.columns.map((col) => {
                          const progress = areaProgress[selectedArea]?.[col.key];
                          const isClassified = progress?.classified;
                          const isCorrect = progress?.correct;

                          return (
                            <th
                              key={col.key}
                              onClick={() => { setSelectedArea(key); setSelectedColumn(null); }}
                              className={`p-4 text-left font-bold text-sm border-2 transition-all ${col.key === 'id'
                                ? 'bg-slate-800/50 border-slate-700 cursor-not-allowed'
                                : selectedColumn?.key === col.key
                                  ? 'bg-blue-500 border-blue-400 cursor-pointer'
                                  : isClassified
                                    ? isCorrect
                                      ? 'bg-green-500/20 border-green-500/50 cursor-pointer hover:bg-green-500/30'
                                      : 'bg-red-500/20 border-red-500/50 cursor-pointer hover:bg-red-500/30'
                                    : 'bg-slate-800/30 border-slate-700 cursor-pointer hover:bg-slate-700/50'
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-white">{col.name}</span>
                                {isClassified && (
                                  <span className="text-xl">
                                    {isCorrect ? '✅' : '❌'}
                                  </span>
                                )}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {areaExamples[selectedArea].dataset.rows.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {areaExamples[selectedArea].dataset.columns.map((col) => (
                            <td key={col.key} className="p-4 border border-slate-700 text-slate-300 text-sm">
                              {String(row[col.key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedColumn && selectedColumn.key !== 'id' && (
                  <div className="mt-6 p-6 bg-blue-500/10 border-2 border-blue-500/30 rounded-2xl">
                    <h5 className="text-lg font-black text-blue-400 mb-4">
                      Clasificar: "{selectedColumn.name}"
                    </h5>
                    <p className="text-sm text-slate-400 mb-4">
                      ¿Qué tipo de dato es esta columna?
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'nominal', label: 'Cualitativo Nominal', icon: '🏷️' },
                        { key: 'ordinal', label: 'Cualitativo Ordinal', icon: '📊' },
                        { key: 'discrete', label: 'Cuantitativo Discreto', icon: '🔢' },
                        { key: 'continuous', label: 'Cuantitativo Continuo', icon: '📈' }
                      ].map((type) => (
                        <button
                          key={type.key}
                          onClick={() => handleColumnClassification(selectedColumn, type.key)}
                          className="p-4 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-blue-500 rounded-xl transition-all text-left"
                        >
                          <div className="text-2xl mb-2">{type.icon}</div>
                          <div className="text-sm font-bold text-white">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {areaProgress[selectedArea]?.[selectedColumn?.key]?.classified && (
                  <div className={`mt-6 p-6 rounded-2xl border-2 ${areaProgress[selectedArea][selectedColumn.key].correct
                    ? 'bg-green-500/20 border-green-500/50'
                    : 'bg-red-500/20 border-red-500/50'
                    }`}>
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">
                        {areaProgress[selectedArea][selectedColumn.key].correct ? '✅' : '❌'}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-xl font-black text-white mb-2">
                          {areaProgress[selectedArea][selectedColumn.key].correct ? '¡Correcto!' : 'Incorrecto'}
                        </h5>
                        <div className="bg-slate-950/50 p-4 rounded-xl mb-3">
                          <div className="text-xs text-slate-500 uppercase font-bold mb-1">Tipo Correcto</div>
                          <div className={`text-lg font-bold bg-gradient-to-r ${getTypeColor(selectedColumn.type)} bg-clip-text text-transparent`}>
                            {selectedColumn.type === 'nominal' ? 'Cualitativo Nominal' :
                              selectedColumn.type === 'ordinal' ? 'Cualitativo Ordinal' :
                                selectedColumn.type === 'discrete' ? 'Cuantitativo Discreto' :
                                  'Cuantitativo Continuo'}
                          </div>
                        </div>
                        <div className="bg-slate-950/50 p-4 rounded-xl mb-3">
                          <div className="text-xs text-slate-500 uppercase font-bold mb-1">Explicación</div>
                          <div className="text-sm text-slate-300">{selectedColumn.explanation}</div>
                        </div>
                        <div className="bg-slate-950/50 p-4 rounded-xl">
                          <div className="text-xs text-slate-500 uppercase font-bold mb-1">📊 Gráfico Recomendado</div>
                          <div className="text-sm text-slate-300">{selectedColumn.chart}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'consequences' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl font-black text-white mb-4">Consecuencias de Mala Clasificación</h3>
              <p className="text-slate-400 mb-6">
                Clasificar incorrectamente los datos puede llevar a análisis erróneos, conclusiones equivocadas y malas decisiones de negocio.
              </p>

              <div className="flex gap-3 mb-6 flex-wrap">
                {comparisonScenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => setComparisonScenario(scenario)}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${comparisonScenario?.id === scenario.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 hover:bg-white/10'
                      }`}
                  >
                    {scenario.title}
                  </button>
                ))}
              </div>

              {comparisonScenario && (
                <div className="space-y-6">
                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/10">
                    <h4 className="text-xl font-black text-white mb-2">{comparisonScenario.title}</h4>
                    <p className="text-slate-400">{comparisonScenario.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <XCircle className="w-8 h-8 text-red-400" />
                        <h5 className="text-xl font-black text-red-400">Clasificación INCORRECTA</h5>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-slate-950/50 p-4 rounded-xl">
                          <div className="text-xs text-slate-500 uppercase font-bold mb-1">Clasificado como</div>
                          <div className="text-lg font-bold text-white">{comparisonScenario.wrong.classification}</div>
                        </div>

                        <div className="bg-slate-950/50 p-4 rounded-xl">
                          <div className="text-xs text-slate-500 uppercase font-bold mb-1">Razonamiento Erróneo</div>
                          <div className="text-sm text-slate-300">{comparisonScenario.wrong.reasoning}</div>
                        </div>

                        <div className="bg-slate-950/50 p-4 rounded-xl">
                          <div className="text-xs text-slate-500 uppercase font-bold mb-1">Visualización Usada</div>
                          <div className="text-sm text-slate-300">{comparisonScenario.wrong.visualization}</div>
                        </div>

                        <div className="bg-red-500/20 p-4 rounded-xl border border-red-500/30">
                          <div className="text-xs text-red-400 uppercase font-bold mb-1">⚠️ Consecuencia</div>
                          <div className="text-sm text-red-300">{comparisonScenario.wrong.consequence}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-500/10 border-2 border-green-500/30 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                        <h5 className="text-xl font-black text-green-400">Clasificación CORRECTA</h5>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-slate-950/50 p-4 rounded-xl">
                          <div className="text-xs text-slate-500 uppercase font-bold mb-1">Clasificado como</div>
                          <div className="text-lg font-bold text-white">{comparisonScenario.correct.classification}</div>
                        </div>

                        <div className="bg-slate-950/50 p-4 rounded-xl">
                          <div className="text-xs text-slate-500 uppercase font-bold mb-1">Razonamiento Correcto</div>
                          <div className="text-sm text-slate-300">{comparisonScenario.correct.reasoning}</div>
                        </div>

                        <div className="bg-slate-950/50 p-4 rounded-xl">
                          <div className="text-xs text-slate-500 uppercase font-bold mb-1">Visualización Usada</div>
                          <div className="text-sm text-slate-300">{comparisonScenario.correct.visualization}</div>
                        </div>

                        <div className="bg-green-500/20 p-4 rounded-xl border border-green-500/30">
                          <div className="text-xs text-green-400 uppercase font-bold mb-1">✅ Beneficio</div>
                          <div className="text-sm text-green-300">{comparisonScenario.correct.consequence}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!comparisonScenario && (
                <div className="bg-slate-950/50 rounded-2xl p-12 text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-2xl font-black text-white mb-2">Selecciona un Escenario</h3>
                  <p className="text-slate-400">
                    Explora ejemplos de cómo la mala clasificación afecta el análisis
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-black text-white mb-2">Guía Rápida de Clasificación</h3>
            <p className="text-slate-400">Referencia visual de los tipos de datos y sus características</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 rounded-2xl border border-blue-500/20">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">🏷️</div>
                <div>
                  <h4 className="font-black text-lg text-blue-400 mb-2">Cualitativos / Categóricos</h4>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">
                    Datos que representan características o atributos no numéricos.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-950/50 p-4 rounded-xl">
                  <div className="font-bold text-white mb-1">📊 Nominales (sin orden)</div>
                  <div className="text-sm text-slate-400 mb-2">Color, género, ciudad, tipo de sangre</div>
                  <div className="text-xs text-blue-400">Operaciones: Moda, Frecuencia, Porcentajes</div>
                  <div className="text-xs text-blue-400">Gráficos: Barras, Pastel</div>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl">
                  <div className="font-bold text-white mb-1">📈 Ordinales (con orden)</div>
                  <div className="text-sm text-slate-400 mb-2">Nivel educativo, calificaciones (A, B, C), tallas (S, M, L)</div>
                  <div className="text-xs text-purple-400">Operaciones: Moda, Mediana, Percentiles</div>
                  <div className="text-xs text-purple-400">Gráficos: Barras Ordenadas</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-2xl border border-green-500/20">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">🔢</div>
                <div>
                  <h4 className="font-black text-lg text-green-400 mb-2">Cuantitativos / Numéricos</h4>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">
                    Datos que representan cantidades medibles o contables.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-950/50 p-4 rounded-xl">
                  <div className="font-bold text-white mb-1">🎯 Discretos (contables)</div>
                  <div className="text-sm text-slate-400 mb-2">Número de hijos, estudiantes, productos vendidos</div>
                  <div className="text-xs text-green-400">Operaciones: Media, Mediana, Desv. Estándar</div>
                  <div className="text-xs text-green-400">Gráficos: Barras, Histograma</div>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl">
                  <div className="font-bold text-white mb-1">📏 Continuos (medibles)</div>
                  <div className="text-sm text-slate-400 mb-2">Altura, peso, temperatura, tiempo, precio</div>
                  <div className="text-xs text-orange-400">Operaciones: Media, Mediana, Varianza, Correlación</div>
                  <div className="text-xs text-orange-400">Gráficos: Histograma, Línea, Dispersión</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
            <div className="flex items-start gap-4">
              <Lightbulb className="w-8 h-8 text-yellow-400 shrink-0" />
              <div>
                <h4 className="font-black text-white mb-2">💡 Consejo Clave</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  La clasificación correcta determina qué estadísticas calcular (media, moda, mediana) y qué visualizaciones usar (barras, pastel, histograma).
                  <strong className="text-purple-400"> Un código postal puede parecer numérico, pero es categórico nominal</strong> porque los números son solo etiquetas sin significado matemático.
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
export default Lab2_1;