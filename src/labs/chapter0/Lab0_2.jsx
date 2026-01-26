// src/labs/chapter0/Lab0_2.jsx
import React, { useMemo, useState } from "react";
import LabBase from "../../components/labs/LabBase";

export default function Lab0_2(props) {
  const [config, setConfig] = useState({
    chartTitle: "Lab 0.2",
    xAxis: "",
    yAxis: "",
    xAxisLabel: "",
    yAxisLabel: "",
    chartType: "bar",
    colorPalette: "indigo",
    backgroundColor: "dark",
    showGrid: true,
    animationDuration: 800,
  });

  const PALETTES = useMemo(
    () => ({
      indigo: { name: "Índigo", colors: ["#6366F1", "#8B5CF6", "#EC4899", "#22C55E", "#F59E0B"] },
    }),
    []
  );

  const BACKGROUND_COLORS = useMemo(
    () => ({
      dark: { name: "Oscuro", color: "rgba(2, 6, 23, 0.6)" },
      white: { name: "Blanco", color: "#FFFFFF" },
      cream: { name: "Crema", color: "#FFF7ED" },
    }),
    []
  );

  // ✅ Usar lo que viene del App (no pisarlo)
  const data = props.data ?? [];
  const columns = props.columns ?? [];
  const fileName = props.fileName ?? null;
  const isUploading = props.isUploading ?? false;

  const handleFileUpload = props.handleFileUpload; // ✅ ESTE era el bug

  const chartData = props.chartData ?? [];
  const stats = props.stats ?? null;
  const [showStats, setShowStats] = useState(false);

  const downloadChart = () => {
    alert("En este Lab 0.2 aún no hay gráfico para descargar 🙂");
  };

  return (
    <LabBase
      {...props}
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
      extraTop={
        <div className="glass rounded-3xl p-6 border border-white/10">
          <h3 className="text-white font-black text-xl">Lab 0.2 — Introducción</h3>
          <p className="text-slate-400 mt-2">
            Este laboratorio es introductorio. Aquí puedes colocar instrucciones, objetivos, y un ejemplo sencillo
            antes de pasar a los labs con carga de datos.
          </p>
        </div>
      }
    />
  );
}
