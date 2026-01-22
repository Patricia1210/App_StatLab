import React from "react";
import {
  BarChart3, ArrowRight, Sparkles, BookOpen, Info,
  Play, Download, Database, TrendingUp, ChevronDown
} from "lucide-react";

export default function Lab0_1({ setView, goHome, goToSection }) {
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
                e.stopPropagation();
                if (goHome) {
                  goHome(e);
                } else {
                  setView('home');
                  window.history.pushState({}, '', window.location.pathname);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-all group"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Volver al Índice
            </button>

            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span className="text-xs text-indigo-400 font-black uppercase tracking-wider">Bienvenida</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-12 relative">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/30 mb-6">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            ¡Bienvenido al <br/>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Laboratorio de Estadística!
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Este es tu espacio interactivo para practicar todos los conceptos del curso de Fundamentos de Estadística.
          </p>
        </div>

        <div className="glass rounded-3xl p-10 border border-white/10 space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Info className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white">Guía de Uso</h2>
          </div>

          <div className="space-y-6">
            {[
              { step: "1", title: "Sigue el curso en Udemy", description: "Cada lección del curso tiene un laboratorio correspondiente aquí.", icon: <Play className="w-5 h-5" /> },
              { step: "2", title: "Descarga los datasets", description: "En la sección de recursos de cada clase de Udemy encontrarás los archivos CSV necesarios.", icon: <Download className="w-5 h-5" /> },
              { step: "3", title: "Accede al laboratorio correspondiente", description: "Busca el capítulo y sección que corresponda a tu clase actual en el índice principal.", icon: <Database className="w-5 h-5" /> },
              { step: "4", title: "Sube tus datos y analiza", description: "Carga el archivo CSV en el laboratorio, configura los ejes y genera tus visualizaciones.", icon: <TrendingUp className="w-5 h-5" /> }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 hover:bg-slate-900 transition-all group">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-xl shadow-lg group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-indigo-400">{item.icon}</div>
                    <h3 className="text-lg font-black text-white">{item.title}</h3>
                  </div>
                  <p className="text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-10 border-l-4 border-l-purple-500 relative overflow-hidden group hover:shadow-2xl hover:shadow-purple-500/10 transition-all">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Play className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-black text-white mb-2">¿Aún no estás inscrito en el curso?</h3>
              <p className="text-slate-400 leading-relaxed">
                Accede al curso completo de Fundamentos de Estadística en Udemy con clases en video, ejercicios y recursos descargables.
              </p>
            </div>
            <a
              href="https://www.udemy.com/course/fundamentos-de-estadistica/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105 group"
            >
              <Play className="w-5 h-5 fill-current" />
              Ir al Curso en Udemy
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        <div className="glass rounded-3xl p-10 border border-white/10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Info className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white">Preguntas Frecuentes</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "¿Necesito instalar algo para usar los laboratorios?", a: "No, los laboratorios funcionan 100% en línea desde tu navegador. Solo necesitas los archivos CSV que descargarás de Udemy." },
              { q: "¿Qué formato deben tener mis datos?", a: "Los archivos deben estar en formato CSV (valores separados por comas). Desde Excel puedes exportar tus archivos a formato CSV." },
              { q: "¿Puedo usar mis propios datos?", a: "¡Por supuesto! Puedes cargar cualquier archivo CSV con tus propios datos para experimentar y practicar." },
              { q: "¿Los laboratorios guardan mi progreso?", a: "Actualmente los laboratorios no guardan progreso. Te recomendamos descargar tus gráficos cuando termines cada análisis." },
              { q: "¿Qué navegadores son compatibles?", a: "Los laboratorios funcionan en Chrome, Firefox, Safari y Edge actualizados. Recomendamos Chrome para mejor rendimiento." },
              { q: "¿Puedo compartir el enlace de un laboratorio específico?", a: "Sí, cada laboratorio tiene un botón para copiar su enlace directo. Así puedes marcarlo o compartirlo fácilmente." }
            ].map((faq, i) => (
              <details key={i} className="group/faq p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/30 hover:bg-slate-900 transition-all">
                <summary className="font-bold text-white cursor-pointer list-none flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black">
                      {i + 1}
                    </span>
                    {faq.q}
                  </span>
                  <ChevronDown className="w-5 h-5 text-slate-400 group-open/faq:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-slate-400 leading-relaxed pl-9">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        <div className="text-center space-y-6 pt-8">
          <p className="text-xl text-slate-300 font-bold">¿Listo para comenzar?</p>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (goHome) {
                goHome(e);
                setTimeout(() => {
                  document.getElementById('chapters')?.scrollIntoView({ behavior: 'smooth' });
                }, 200);
              } else {
                setView('home');
                window.history.pushState({}, '', window.location.pathname);
                setTimeout(() => {
                  document.getElementById('chapters')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:shadow-2xl hover:shadow-indigo-500/50 transition-all hover:scale-105 inline-flex items-center gap-3"
          >
            <BarChart3 className="w-5 h-5" />
            Explorar Laboratorios
            <ArrowRight className="w-5 h-5" />
          </button>
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
}