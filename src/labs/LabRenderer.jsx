// src/labs/LabRenderer.jsx
import React, { Suspense } from "react";
import { getLab } from "./labRegistry";

export default function LabRenderer({ labKey, fallback = null, ...passProps }) {
  // labKey esperado: "chapter2/Lab2_2"
  const LazyLab = getLab(labKey);

  // 🟢 Debug útil
  console.log("LabRenderer → labKey:", labKey);
  console.log("LabRenderer → LazyLab:", LazyLab ? "OK" : "NO ENCONTRADO");

  if (!LazyLab) {
    console.error("❌ Lab no encontrado:", labKey);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 p-10">
        <h2 className="text-2xl font-black text-white">Lab no encontrado</h2>

        <p className="mt-2 text-slate-300">
          Clave solicitada: <b>{labKey}</b>
        </p>

        <p className="mt-2 text-slate-400 text-sm">
          Verifica que exista como:
        </p>

        <pre className="mt-2 p-4 bg-slate-900/70 rounded-xl text-slate-200 text-sm overflow-x-auto">
          src/labs/{labKey}.jsx
        </pre>

        <p className="mt-4 text-xs text-slate-500">
          Revisa mayúsculas, guiones bajos y la carpeta <code>chapterX</code>.
        </p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        fallback ?? (
          <div className="min-h-screen bg-slate-950 text-slate-200 p-10 flex items-center justify-center">
            <h2 className="text-2xl font-black text-white animate-pulse">
              Cargando laboratorio…
            </h2>
          </div>
        )
      }
    >
      <LazyLab {...passProps} />
    </Suspense>
  );
}
