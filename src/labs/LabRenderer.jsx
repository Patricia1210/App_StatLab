import React, { Suspense, useMemo } from "react";

// ✅ Vite: mapa de todos los labs dentro de src/labs
const labModules = import.meta.glob("./**/*.jsx");

export default function LabRenderer({ labKey, fallback = null, ...passProps }) {
  const LazyLab = useMemo(() => {
    const path = `./${labKey}.jsx`;
    const importer = labModules[path];

    if (!importer) {
      console.error("❌ Lab no encontrado:", path);
      return null;
    }

    return React.lazy(importer);
  }, [labKey]);

  if (!LazyLab) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 p-10">
        <h2 className="text-2xl font-black text-white">Lab no encontrado</h2>
        <p className="mt-2 text-slate-300">
          Clave: <b>{labKey}</b>
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={fallback}>
      <LazyLab {...passProps} />
    </Suspense>
  );
}
