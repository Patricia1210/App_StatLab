// src/components/labs/LabBase.jsx
import React from "react";
import {
  ArrowRight, BookOpen, Info, Upload, RefreshCw, FileJson,
  Database, TrendingUp, Download, Activity, Calculator, Eye, EyeOff, BarChart3
} from "lucide-react";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  LineChart, Line, ScatterChart, Scatter
} from "recharts";

/**
 * LabBase: plantilla reusable para TODOS los laboratorios.
 * - Renderiza: header/nav + intro + panel izq (upload/settings/stats) + panel der (chart + tabla)
 * - Permite "extras" por laboratorio sin duplicar código: extraTop, extraLeftBottom, extraRightTop, extraRightBottom
 */
export default function LabBase({
  // navegación/estado
  setView,
  selectedSection,
  activeSectionData,

  // datos
  data,
  columns,
  fileName,
  isUploading,
  handleFileUpload,

  // config (chart)
  config,
  setConfig,
  chartData,
  stats,
  showStats,
  setShowStats,

  // visual
  PALETTES,
  BACKGROUND_COLORS,

  // acciones
  downloadChart,

  // tooltip personalizado (si lo tienes)
  CustomTooltip,

  // EXTRAS opcionales por laboratorio
  extraTop = null,
  extraLeftBottom = null,
  extraRightTop = null,
  extraRightBottom = null,
}) {
  const currentPalette = PALETTES[config.colorPalette];
  const currentBgColor = BACKGROUND_COLORS[config.backgroundColor];
  const isLightBg = ["white", "cream"].includes(config.backgroundColor);

  // Solo mostrar gráfico si hay variables
  const hasSelectedVariables = config.xAxis && config.yAxis;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Fondo animado */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      {/* NAV */}
      <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 shadow-2xl shadow-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setView("home");
                window.history.pushState({}, "", window.location.pathname);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-all group"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Volver al Índice
            </button>

            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${activeSectionData.chapter.color} flex items-center justify-center shadow-lg`}>
                <div className="scale-75 text-white">{activeSectionData.chapter.icon}</div>
              </div>
              <div>
                <span className="text-xs text-indigo-400 font-bold block">Capítulo {activeSectionData.chapter.chapter}</span>
                <span className="font-black tracking-tight text-white block text-sm">{activeSectionData.chapter.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs text-indigo-400 font-black uppercase tracking-wider">Lab {selectedSection}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8 relative">
        {/* EXTRA TOP (opcional por sección) */}
        {extraTop}

        {/* Intro */}
        <section className="glass rounded-3xl p-8 border-l-4 border-l-indigo-500 relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <BookOpen className="w-32 h-32" />
          </div>
          <div className="flex items-start gap-6 relative z-10">
            <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30 shrink-0">
              <Info className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-black text-indigo-500 uppercase tracking-wider bg-indigo-500/10 px-3 py-1 rounded-full">
                  Sección {selectedSection}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{activeSectionData.title}</h2>
              <p className="text-slate-400 leading-relaxed max-w-3xl font-medium">
                Bienvenido al laboratorio práctico de la sección <strong className="text-white">{selectedSection}</strong>.
                Carga el dataset correspondiente desde los recursos del curso para comenzar el análisis.
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-4 space-y-6">
            {/* Upload + Settings */}
            <div className="glass rounded-3xl p-6 space-y-6 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black flex items-center gap-2 text-white">
                  <Upload className="w-5 h-5 text-indigo-400" /> Cargar Dataset
                </h3>
              </div>

              <div className="relative group/upload">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={isUploading}
                />
                <div
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                    isUploading
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-slate-700 bg-slate-900/50 group-hover/upload:border-indigo-500 group-hover/upload:bg-slate-900"
                  }`}
                >
                  {isUploading ? (
                    <RefreshCw className="w-10 h-10 text-indigo-400 mx-auto mb-3 animate-spin" />
                  ) : (
                    <FileJson className="w-10 h-10 text-slate-500 mx-auto mb-3 group-hover/upload:text-indigo-400 transition-colors group-hover/upload:scale-110 transition-transform" />
                  )}
                  <p className="text-sm font-bold text-slate-300">
                    {isUploading ? "Procesando..." : (fileName || "Seleccionar Archivo CSV")}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 uppercase font-bold tracking-wider">
                    {isUploading ? "Por favor espera" : "Datos para Sección " + selectedSection}
                  </p>
                </div>
              </div>

              {/* Settings visibles cuando hay datos */}
              {data.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Título del Gráfico</label>
                    <input
                      type="text"
                      value={config.chartTitle}
                      onChange={(e) => setConfig({ ...config, chartTitle: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Título del gráfico"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Database className="w-3 h-3" /> Eje X
                    </label>
                    <select
                      value={config.xAxis}
                      onChange={(e) => setConfig({ ...config, xAxis: e.target.value, xAxisLabel: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Seleccionar variable...</option>
                      {columns.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>

                    {config.xAxis && (
                      <input
                        type="text"
                        value={config.xAxisLabel || config.xAxis}
                        onChange={(e) => setConfig({ ...config, xAxisLabel: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs font-medium text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none mt-2"
                        placeholder="Título del eje X"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="w-3 h-3" /> Eje Y
                    </label>
                    <select
                      value={config.yAxis}
                      onChange={(e) => setConfig({ ...config, yAxis: e.target.value, yAxisLabel: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Seleccionar variable...</option>
                      {columns.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>

                    {config.yAxis && (
                      <input
                        type="text"
                        value={config.yAxisLabel || config.yAxis}
                        onChange={(e) => setConfig({ ...config, yAxisLabel: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs font-medium text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none mt-2"
                        placeholder="Título del eje Y"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Tipo de Gráfico</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["bar", "line", "scatter"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setConfig({ ...config, chartType: t })}
                          className={`py-3 rounded-xl text-[10px] font-black tracking-widest border transition-all ${
                            config.chartType === t
                              ? "bg-indigo-600 border-indigo-500 text-white shadow-lg scale-105"
                              : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                          }`}
                        >
                          {t.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Paleta de Colores</label>
                    <select
                      value={config.colorPalette}
                      onChange={(e) => setConfig({ ...config, colorPalette: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {Object.entries(PALETTES).map(([key, palette]) => (
                        <option key={key} value={key}>{palette.name}</option>
                      ))}
                    </select>

                    <div className="flex gap-1.5 mt-3 p-3 bg-slate-900/50 rounded-xl">
                      {currentPalette.colors.map((color, i) => (
                        <div
                          key={i}
                          className="h-8 flex-1 rounded-lg shadow-lg hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Color de Fondo</label>
                    <select
                      value={config.backgroundColor}
                      onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {Object.entries(BACKGROUND_COLORS).map(([key, bg]) => (
                        <option key={key} value={key}>{bg.name}</option>
                      ))}
                    </select>

                    <div
                      className="mt-3 p-4 rounded-xl shadow-lg border-2 border-white/10"
                      style={{ backgroundColor: BACKGROUND_COLORS[config.backgroundColor].color }}
                    >
                      <p className={`text-xs font-bold text-center ${isLightBg ? "text-slate-800" : "text-white"}`}>
                        Vista previa del fondo
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* EXTRA debajo de settings (opcional) */}
              {extraLeftBottom}
            </div>

            {/* Stats */}
            {stats && (
              <div className="glass rounded-3xl p-6 border border-purple-500/20 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black flex items-center gap-2 text-white">
                    <Calculator className="w-5 h-5 text-purple-400" /> Estadísticas
                  </h3>
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  >
                    {showStats ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>

                {showStats && (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Promedio", val: stats.mean, color: "from-blue-500 to-cyan-500", icon: "μ" },
                      { label: "Mediana", val: stats.median, color: "from-purple-500 to-pink-500", icon: "M" },
                      { label: "Desv. Est.", val: stats.stdDev, color: "from-pink-500 to-rose-500", icon: "σ" },
                      { label: "Máximo", val: stats.max, color: "from-emerald-500 to-teal-500", icon: "↑" },
                      { label: "Mínimo", val: stats.min, color: "from-orange-500 to-red-500", icon: "↓" },
                      { label: "Muestras", val: stats.count, color: "from-indigo-500 to-purple-500", icon: "n" },
                    ].map((s, i) => (
                      <div key={i} className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-black text-slate-500">{s.label}</span>
                          <span className={`text-xs font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.icon}</span>
                        </div>
                        <span className={`text-2xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent block`}>
                          {s.val}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-8 space-y-6">
            {/* EXTRA arriba del chart (opcional) */}
            {extraRightTop}

            <div
              className="glass rounded-[2.5rem] p-10 min-h-[600px] border border-white/10 relative overflow-hidden"
              style={{ backgroundColor: currentBgColor.color }}
            >
              <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
                {data.length > 0 && hasSelectedVariables && (
                  <>
                    <button
                      onClick={downloadChart}
                      className="p-3 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 transition-all shadow-lg"
                      title="Descargar gráfico"
                    >
                      <Download className="w-5 h-5 text-indigo-400" />
                    </button>
                    <div className="bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-indigo-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">En Vivo</span>
                    </div>
                  </>
                )}
              </div>

              {data.length > 0 && hasSelectedVariables ? (
                <div className="w-full h-[550px] pt-12">
                  <h4 className={`text-2xl font-black mb-6 text-center ${isLightBg ? "text-slate-900" : "text-white"}`}>
                    {config.chartTitle}
                  </h4>

                  <div style={{ width: "100%", height: "480px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {config.chartType === "bar" ? (
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                          {config.showGrid && (
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke={isLightBg ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.05)"}
                            />
                          )}
                          <XAxis
                            dataKey={config.xAxis}
                            label={{
                              value: config.xAxisLabel || config.xAxis,
                              position: "insideBottom",
                              offset: -10,
                              style: { fill: isLightBg ? "#1e293b" : "#94a3b8", fontWeight: 700, fontSize: 12 },
                            }}
                            tick={{ fill: isLightBg ? "#475569" : "#64748b", fontSize: 11, fontWeight: 700 }}
                            axisLine={false}
                            tickLine={false}
                            angle={-30}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis
                            label={{
                              value: config.yAxisLabel || config.yAxis,
                              angle: -90,
                              position: "insideLeft",
                              style: { textAnchor: "middle", fill: isLightBg ? "#1e293b" : "#94a3b8", fontWeight: 700, fontSize: 12 },
                            }}
                            tick={{ fill: isLightBg ? "#475569" : "#64748b", fontSize: 11, fontWeight: 700 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip content={CustomTooltip ? <CustomTooltip /> : undefined} cursor={{ fill: "rgba(99, 102, 241, 0.1)" }} />
                          <Bar dataKey={config.yAxis} radius={[12, 12, 0, 0]} barSize={50} animationDuration={config.animationDuration}>
                            {chartData.map((_, i) => (
                              <Cell key={i} fill={currentPalette.colors[i % currentPalette.colors.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      ) : config.chartType === "line" ? (
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                          {config.showGrid && (
                            <CartesianGrid strokeDasharray="3 3" stroke={isLightBg ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.05)"} />
                          )}
                          <XAxis
                            dataKey={config.xAxis}
                            label={{
                              value: config.xAxisLabel || config.xAxis,
                              position: "insideBottom",
                              offset: -10,
                              style: { fill: isLightBg ? "#1e293b" : "#94a3b8", fontWeight: 700, fontSize: 12 },
                            }}
                            tick={{ fill: isLightBg ? "#475569" : "#64748b", fontWeight: 700 }}
                            axisLine={false}
                            angle={-30}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis
                            label={{
                              value: config.yAxisLabel || config.yAxis,
                              angle: -90,
                              position: "insideLeft",
                              style: { textAnchor: "middle", fill: isLightBg ? "#1e293b" : "#94a3b8", fontWeight: 700, fontSize: 12 },
                            }}
                            tick={{ fill: isLightBg ? "#475569" : "#64748b", fontWeight: 700 }}
                            axisLine={false}
                          />
                          <Tooltip content={CustomTooltip ? <CustomTooltip /> : undefined} />
                          <Line
                            type="monotone"
                            dataKey={config.yAxis}
                            stroke={currentPalette.colors[0]}
                            strokeWidth={4}
                            dot={{ r: 6, fill: currentPalette.colors[0], strokeWidth: 3, stroke: "#fff" }}
                            activeDot={{ r: 8, strokeWidth: 3 }}
                            animationDuration={config.animationDuration}
                          />
                        </LineChart>
                      ) : (
                        <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                          {config.showGrid && (
                            <CartesianGrid strokeDasharray="3 3" stroke={isLightBg ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.05)"} />
                          )}
                          <XAxis
                            dataKey={config.xAxis}
                            name={config.xAxisLabel || config.xAxis}
                            label={{
                              value: config.xAxisLabel || config.xAxis,
                              position: "insideBottom",
                              offset: -10,
                              style: { fill: isLightBg ? "#1e293b" : "#94a3b8", fontWeight: 700, fontSize: 12 },
                            }}
                            tick={{ fill: isLightBg ? "#475569" : "#64748b", fontWeight: 700 }}
                            axisLine={false}
                          />
                          <YAxis
                            dataKey={config.yAxis}
                            name={config.yAxisLabel || config.yAxis}
                            label={{
                              value: config.yAxisLabel || config.yAxis,
                              angle: -90,
                              position: "insideLeft",
                              style: { textAnchor: "middle", fill: isLightBg ? "#1e293b" : "#94a3b8", fontWeight: 700, fontSize: 12 },
                            }}
                            tick={{ fill: isLightBg ? "#475569" : "#64748b", fontWeight: 700 }}
                            axisLine={false}
                          />
                          <Tooltip content={CustomTooltip ? <CustomTooltip /> : undefined} cursor={{ strokeDasharray: "3 3" }} />
                          <Scatter name="Muestras" data={chartData} fill={currentPalette.colors[2]} shape="circle" />
                        </ScatterChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-6 animate-pulse">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl" />
                    <div className="relative w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                      <BarChart3 className="w-16 h-16 text-slate-700" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-black text-2xl text-slate-300 mb-2">
                      {data.length > 0 ? "Selecciona las Variables" : "Esperando Datos"}
                    </p>
                    <p className="text-sm font-medium text-slate-500">
                      {data.length > 0 ? "Elige las variables para los ejes X e Y" : "Sube un archivo CSV para comenzar el análisis"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tabla */}
            {data.length > 0 && (
              <div className="glass rounded-3xl overflow-hidden border border-white/10">
                <div className="px-8 py-5 border-b border-white/5 bg-slate-900/30 flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Vista de Datos
                  </h4>
                  <span className="text-xs font-bold text-slate-500">
                    Mostrando {Math.min(data.length, 10)} de {data.length} registros
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950">
                        <th className="px-8 py-5 font-black text-slate-500 uppercase tracking-wider border-b border-white/5">#</th>
                        {columns.map((c) => (
                          <th key={c} className="px-8 py-5 font-black text-slate-300 uppercase tracking-wider border-b border-white/5">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-indigo-500/5 transition-colors">
                          <td className="px-8 py-5 text-slate-500 font-bold">{i + 1}</td>
                          {columns.map((c) => (
                            <td key={c} className="px-8 py-5 text-slate-400 font-medium">
                              {String(row[c])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* EXTRA debajo de la tabla (opcional) */}
                {extraRightBottom}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
