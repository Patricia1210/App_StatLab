import React, { useState } from 'react';
import { BookOpen, Info, ArrowRight, ChevronDown } from 'lucide-react';

const Lab1_1 = ({ goHome }) => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastAnswer, setLastAnswer] = useState(null);
  const [activeStep, setActiveStep] = useState(null);

  const processSteps = [
    { 
      emoji: '📥', 
      label: 'RECOLECTAR', 
      color: 'cyan',
      title: 'Recolección de Datos',
      description: 'Obtener información relevante mediante encuestas, experimentos, observación o bases de datos existentes.',
      examples: ['Encuestas a clientes', 'Mediciones en laboratorio', 'Registros de ventas']
    },
    { 
      emoji: '📋', 
      label: 'ORGANIZAR', 
      color: 'blue',
      title: 'Organización de Datos',
      description: 'Estructurar la información en tablas, categorías o formatos que faciliten su análisis.',
      examples: ['Tablas de frecuencia', 'Bases de datos', 'Hojas de cálculo']
    },
    { 
      emoji: '🔍', 
      label: 'ANALIZAR', 
      color: 'indigo',
      title: 'Análisis de Datos',
      description: 'Aplicar métodos estadísticos para encontrar patrones, tendencias y relaciones en los datos.',
      examples: ['Cálculo de promedios', 'Gráficos estadísticos', 'Pruebas de hipótesis']
    },
    { 
      emoji: '💡', 
      label: 'INTERPRETAR', 
      color: 'purple',
      title: 'Interpretación de Resultados',
      description: 'Traducir los hallazgos estadísticos en conclusiones significativas para la toma de decisiones.',
      examples: ['Reportes ejecutivos', 'Recomendaciones', 'Predicciones']
    }
  ];

  const quizzes = {
    tipos: {
      title: "Identificar Tipos de Estadística",
      icon: "🧩",
      color: "indigo",
      questions: [
        {
          text: "Calcular el promedio de calificaciones de un salón",
          answer: "descriptiva",
          explanation: "Solo resume datos existentes, no hace predicciones"
        },
        {
          text: "Estimar la intención de voto en unas elecciones",
          answer: "inferencial",
          explanation: "Usa una muestra para inferir sobre toda la población"
        },
        {
          text: "Crear un histograma de edades en una empresa",
          answer: "descriptiva",
          explanation: "Organiza y presenta datos, no hace generalizaciones"
        },
        {
          text: "Probar si un nuevo medicamento es más efectivo",
          answer: "inferencial",
          explanation: "Prueba hipótesis y hace conclusiones sobre la población"
        }
      ]
    },
    conceptos: {
      title: "Conceptos Fundamentales",
      icon: "🎯",
      color: "purple",
      questions: [
        {
          text: "¿Cuál es el objetivo principal de la estadística?",
          options: [
            { text: "Tomar decisiones en presencia de incertidumbre", correct: true },
            { text: "Crear gráficos bonitos", correct: false },
            { text: "Memorizar fórmulas matemáticas", correct: false }
          ],
          explanation: "La estadística ayuda a tomar decisiones informadas cuando hay incertidumbre"
        },
        {
          text: "¿Qué etapa NO es parte del proceso estadístico?",
          options: [
            { text: "Recolección", correct: false },
            { text: "Organización", correct: false },
            { text: "Adivinación", correct: true }
          ],
          explanation: "El proceso estadístico incluye: recolección, organización, análisis e interpretación"
        },
        {
          text: "¿Cuándo usarías estadística inferencial?",
          options: [
            { text: "Al resumir datos de una clase", correct: false },
            { text: "Al predecir tendencias futuras", correct: true },
            { text: "Al crear una tabla de frecuencias", correct: false }
          ],
          explanation: "La estadística inferencial se usa para hacer predicciones y generalizaciones"
        }
      ]
    },
    aplicaciones: {
      title: "Aplicaciones Prácticas",
      icon: "💡",
      color: "cyan",
      questions: [
        {
          text: "Un hospital quiere saber si un nuevo tratamiento funciona mejor. ¿Qué tipo de estadística usa?",
          options: [
            { text: "Descriptiva", correct: false },
            { text: "Inferencial", correct: true },
            { text: "Exploratoria", correct: false }
          ],
          explanation: "Necesita probar hipótesis sobre la efectividad del tratamiento en toda la población"
        },
        {
          text: "Una empresa presenta un reporte de ventas del último trimestre. ¿Qué tipo de estadística es?",
          options: [
            { text: "Descriptiva", correct: true },
            { text: "Inferencial", correct: false },
            { text: "Predictiva", correct: false }
          ],
          explanation: "Solo describe y resume los datos históricos de ventas"
        },
        {
          text: "¿Qué área NO usa estadística regularmente?",
          options: [
            { text: "Medicina", correct: false },
            { text: "Deportes", correct: false },
            { text: "Ninguna, todas la usan", correct: true }
          ],
          explanation: "La estadística se aplica en prácticamente todas las áreas del conocimiento"
        },
        {
          text: "Netflix recomienda series basándose en tu historial. ¿Qué tipo de estadística usa?",
          options: [
            { text: "Descriptiva", correct: false },
            { text: "Inferencial", correct: true },
            { text: "No usa estadística", correct: false }
          ],
          explanation: "Usa modelos estadísticos para predecir qué te podría gustar basándose en patrones"
        }
      ]
    }
  };

  const toggleCard = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const startQuiz = (quizKey) => {
    setActiveQuiz(quizKey);
    setCurrentQuestion(0);
    setScore(0);
    setQuizCompleted(false);
    setShowResult(false);
    setLastAnswer(null);
  };

  const checkAnswer = (answer) => {
    const quiz = quizzes[activeQuiz];
    const q = quiz.questions[currentQuestion];
    let isCorrect = false;

    if (activeQuiz === 'tipos') {
      isCorrect = answer === q.answer;
    } else {
      isCorrect = answer;
    }
    
    if (isCorrect) setScore(score + 1);
    
    setLastAnswer({ isCorrect, explanation: q.explanation });
    setShowResult(true);
    
    setTimeout(() => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setShowResult(false);
      } else {
        setQuizCompleted(true);
        setShowResult(false);
      }
    }, 2500);
  };

  const resetQuiz = () => {
    setActiveQuiz(null);
    setCurrentQuestion(0);
    setScore(0);
    setQuizCompleted(false);
    setShowResult(false);
    setLastAnswer(null);
  };

  const getQuizColorClass = (color) => {
    const colors = {
      indigo: 'from-indigo-500 to-purple-500',
      purple: 'from-purple-500 to-pink-500',
      cyan: 'from-cyan-500 to-blue-500'
    };
    return colors[color] || colors.indigo;
  };

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
            type="button"
            onClick={(e) => {
                 e.preventDefault();
                   e.stopPropagation();
                     if (goHome) goHome(e);
                     }}
                       className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-all group"
                       >
                        <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                         Volver al Índice
                         </button>

            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div>
                <span className="text-xs text-cyan-400 font-bold block">Capítulo 1</span>
                <span className="font-black tracking-tight text-white block text-sm">Introducción a la Estadística</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
              <span className="text-xs text-cyan-400 font-black uppercase tracking-wider">Lab 1.1</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8 relative">
        
        <section className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 border-l-4 border-l-cyan-500 relative overflow-hidden group hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <BookOpen className="w-32 h-32" />
          </div>
          <div className="flex items-start gap-6 relative z-10">
            <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl border border-cyan-500/30 shrink-0">
              <Info className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-black text-cyan-500 uppercase tracking-wider bg-cyan-500/10 px-3 py-1 rounded-full">
                  Sección 1.1
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Definición de Estadística</h2>
              <p className="text-slate-400 leading-relaxed max-w-3xl font-medium">
                Explora los conceptos fundamentales de la estadística a través de visualizaciones interactivas. 
                Comprende qué es la estadística, sus objetivos y aplicaciones en el mundo real.
              </p>
            </div>
          </div>
        </section>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-10 relative overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/10 transition-all">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-start gap-6 mb-8">
              <div className="text-6xl">📊</div>
              <div>
                <h3 className="text-3xl font-black text-white mb-4">¿Qué es la Estadística?</h3>
                <p className="text-xl text-slate-300 leading-relaxed max-w-4xl">
                  La estadística es la <strong className="text-cyan-400">ciencia</strong> que se encarga de la 
                  <strong className="text-cyan-400"> recolección, organización, análisis e interpretación</strong> de datos 
                  para tomar decisiones informadas en presencia de incertidumbre.
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-cyan-400 font-bold text-center mb-4">
                ✨ Haz clic en cada paso para conocer más detalles
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {processSteps.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(activeStep === i ? null : i)}
                  className={`bg-slate-950/50 p-6 rounded-2xl border text-center hover:scale-105 transition-all cursor-pointer ${
                    activeStep === i 
                      ? 'border-cyan-500 shadow-lg shadow-cyan-500/30 scale-105' 
                      : 'border-white/20 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20'
                  }`}
                >
                  <div className="text-3xl mb-3">{item.emoji}</div>
                  <div className="font-black text-sm text-white">{item.label}</div>
                </button>
              ))}
            </div>

            {activeStep !== null && (
              <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-2xl p-6 animate-slideDown">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl">{processSteps[activeStep].emoji}</div>
                  <div className="flex-1">
                    <h4 className="font-black text-2xl text-white mb-2">{processSteps[activeStep].title}</h4>
                    <p className="text-slate-300 leading-relaxed">
                      {processSteps[activeStep].description}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveStep(null)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all shrink-0"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="bg-slate-950/50 p-5 rounded-xl border border-cyan-500/20">
                  <p className="text-sm font-bold text-cyan-400 mb-3">💡 Ejemplos prácticos:</p>
                  <ul className="space-y-2">
                    {processSteps[activeStep].examples.map((example, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-3">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div 
            onClick={() => toggleCard('descriptiva')}
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/10 transition-all cursor-pointer"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-3xl">
                    📈
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Estadística Descriptiva</h3>
                    <p className="text-sm text-emerald-400 font-bold">Describir y resumir datos</p>
                  </div>
                </div>
                <ChevronDown className={`w-6 h-6 text-slate-500 transition-transform ${expandedCard === 'descriptiva' ? 'rotate-180' : ''}`} />
              </div>

              <p className="text-slate-300 leading-relaxed">
                Se enfoca en <strong className="text-emerald-400">organizar, resumir y presentar</strong> datos de manera comprensible 
                mediante tablas, gráficos y medidas numéricas.
              </p>

              {expandedCard === 'descriptiva' && (
                <div className="space-y-4">
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-emerald-500/20">
                    <h4 className="font-bold text-emerald-400 mb-3 text-sm">📊 Ejemplos de uso:</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>Calcular el promedio de ventas mensuales</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>Crear histogramas de distribución de edades</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>Resumir calificaciones de estudiantes</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-4 rounded-xl border border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🎯</span>
                      <span className="font-bold text-emerald-400 text-sm">Objetivo Principal</span>
                    </div>
                    <p className="text-sm text-slate-300">Responder: <strong>"¿Qué ha pasado?"</strong> con los datos disponibles</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div 
            onClick={() => toggleCard('inferencial')}
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 transition-all cursor-pointer"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl">
                    🔮
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Estadística Inferencial</h3>
                    <p className="text-sm text-purple-400 font-bold">Predecir y generalizar</p>
                  </div>
                </div>
                <ChevronDown className={`w-6 h-6 text-slate-500 transition-transform ${expandedCard === 'inferencial' ? 'rotate-180' : ''}`} />
              </div>

              <p className="text-slate-300 leading-relaxed">
                Utiliza muestras para hacer <strong className="text-purple-400">predicciones, estimaciones y conclusiones </strong> 
                sobre una población completa mediante pruebas de hipótesis y modelos estadísticos.
              </p>

              {expandedCard === 'inferencial' && (
                <div className="space-y-4">
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-purple-500/20">
                    <h4 className="font-bold text-purple-400 mb-3 text-sm">🔍 Ejemplos de uso:</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        <span>Estimar preferencias electorales con encuestas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        <span>Probar la efectividad de un nuevo medicamento</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        <span>Predecir ventas futuras</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-500/20">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🎯</span>
                      <span className="font-bold text-purple-400 text-sm">Objetivo Principal</span>
                    </div>
                    <p className="text-sm text-slate-300">Responder: <strong>"¿Qué va a pasar?"</strong> basándose en evidencia</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="text-5xl">🎓</div>
            <div>
              <h3 className="text-2xl font-black text-white">Centro de Evaluación</h3>
              <p className="text-slate-400">Pon a prueba tu comprensión con estos quizzes interactivos</p>
            </div>
          </div>

          {!activeQuiz ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(quizzes).map(([key, quiz]) => (
                <button
                  key={key}
                  onClick={() => startQuiz(key)}
                  className="p-6 rounded-2xl bg-slate-950/50 border-2 border-white/10 hover:border-indigo-500/40 hover:scale-105 transition-all text-left group"
                >
                  <div className="text-5xl mb-4">{quiz.icon}</div>
                  <h4 className="font-black text-xl text-white mb-2 group-hover:text-indigo-400 transition-colors">
                    {quiz.title}
                  </h4>
                  <p className="text-sm text-slate-400 mb-4">
                    {quiz.questions.length} preguntas
                  </p>
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <span>Comenzar</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <>
              {!quizCompleted ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{quizzes[activeQuiz].icon}</span>
                      <div>
                        <h4 className="font-black text-xl text-white">{quizzes[activeQuiz].title}</h4>
                        <p className="text-sm text-slate-400">Pregunta {currentQuestion + 1} de {quizzes[activeQuiz].questions.length}</p>
                      </div>
                    </div>
                    <button
                      onClick={resetQuiz}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all"
                    >
                      ← Volver
                    </button>
                  </div>

                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/10">
                    <p className="text-lg font-bold text-white mb-6">
                      {quizzes[activeQuiz].questions[currentQuestion].text}
                    </p>
                    
                    {activeQuiz === 'tipos' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => checkAnswer('descriptiva')}
                          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all font-bold text-emerald-400"
                        >
                          📈 Descriptiva
                        </button>
                        <button 
                          onClick={() => checkAnswer('inferencial')}
                          className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all font-bold text-purple-400"
                        >
                          🔮 Inferencial
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {quizzes[activeQuiz].questions[currentQuestion].options.map((option, i) => (
                          <button
                            key={i}
                            onClick={() => checkAnswer(option.correct)}
                            className="w-full p-4 rounded-xl border-2 bg-white/5 border-white/10 hover:bg-white/10 text-left font-medium transition-all hover:scale-[1.02]"
                          >
                            {option.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {showResult && lastAnswer && (
                    <div className={`mt-6 p-6 rounded-2xl border-2 ${lastAnswer.isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{lastAnswer.isCorrect ? '✅' : '❌'}</div>
                        <div>
                          <div className={`font-black text-xl mb-2 ${lastAnswer.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                            {lastAnswer.isCorrect ? '¡Correcto!' : 'Incorrecto'}
                          </div>
                          <p className="text-slate-300 text-sm">{lastAnswer.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-8 rounded-2xl border-2 border-indigo-500/30 text-center">
                  <div className="text-6xl mb-4">
                    {score === quizzes[activeQuiz].questions.length ? '🏆' : score >= quizzes[activeQuiz].questions.length * 0.7 ? '🎉' : '📚'}
                  </div>
                  <h4 className="text-3xl font-black text-white mb-2">
                    {score === quizzes[activeQuiz].questions.length ? '¡Perfecto!' : score >= quizzes[activeQuiz].questions.length * 0.7 ? '¡Muy Bien!' : '¡Sigue Practicando!'}
                  </h4>
                  <p className="text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
                    {score}/{quizzes[activeQuiz].questions.length}
                  </p>
                  <p className="text-slate-300 mb-6">
                    {score === quizzes[activeQuiz].questions.length 
                      ? '¡Dominas este tema!' 
                      : (score / quizzes[activeQuiz].questions.length) * 100 >= 70 
                        ? '¡Excelente comprensión!' 
                        : 'Revisa el material y vuelve a intentarlo'}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button 
                      onClick={() => startQuiz(activeQuiz)}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold hover:scale-105 transition-transform"
                    >
                      🔄 Reintentar
                    </button>
                    <button 
                      onClick={resetQuiz}
                      className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
                    >
                      ← Otros Quizzes
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">🌍</span>
            Aplicaciones en el Mundo Real
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: '🏥', title: 'Medicina', desc: 'Ensayos clínicos, efectividad de tratamientos, análisis epidemiológico' },
              { emoji: '💼', title: 'Negocios', desc: 'Análisis de mercado, predicción de ventas, optimización de procesos' },
              { emoji: '🔬', title: 'Ciencia', desc: 'Validación de hipótesis, análisis de experimentos, modelado de fenómenos' },
              { emoji: '📱', title: 'Tecnología', desc: 'Machine Learning, análisis de usuarios, A/B testing' },
              { emoji: '🎓', title: 'Educación', desc: 'Evaluación de programas, análisis de desempeño, políticas educativas' },
              { emoji: '🏛️', title: 'Gobierno', desc: 'Censos, políticas públicas, análisis socioeconómico' }
            ].map((item, i) => (
              <div key={i} className="bg-slate-950/50 p-6 rounded-2xl border border-white/20 hover:scale-105 hover:shadow-xl transition-all">
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h4 className="font-black text-lg text-white mb-2">{item.title}</h4>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Lab1_1;