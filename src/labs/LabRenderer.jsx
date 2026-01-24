// src/labs/LabRenderer.jsx
import React, { Suspense } from "react";
import { getLab } from "./labRegistry";

export default function LabRenderer({ labKey, fallback = null, ...passProps }) {
  // labKey debe ser algo como: "chapter2/Lab2_1"
  const LazyLab = getLab(labKey);

  if (!LazyLab) {
    console.error("❌ Lab no encontrado:", labKey);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 p-10">
        <h2 className="text-2xl font-black text-white">Lab no encontrado</h2>
        <p className="mt-2 text-slate-300">
          Clave: <b>{labKey}</b>
        </p>
        <p className="mt-2 text-slate-400 text-sm">
          Verifica que exista en <code className="text-slate-200">src/labs</code> como{" "}
          <code className="text-slate-200">src/labs/{labKey}.jsx</code>
        </p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        fallback ?? (
          <div className="min-h-screen bg-slate-950 text-slate-200 p-10">
            <h2 className="text-2xl font-black text-white">Cargando…</h2>
          </div>
        )
      }
    >
      <LazyLab {...passProps} />
    </Suspense>
  );
}
