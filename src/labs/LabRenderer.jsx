import React, { Suspense, lazy, useMemo } from "react";

export default function LabRenderer({ labKey, fallback = null, ...passProps }) {
  // ✅ Memo para que no regenere el import en cada render
  const LazyLab = useMemo(() => {
    return lazy(() => import(`./${labKey}.jsx`)); // ✅ CORREGIDO: paréntesis añadido
  }, [labKey]);

  return (
    <Suspense fallback={fallback}>
      {/* ✅ IMPORTANTÍSIMO: reenviar props directo al Lab */}
      <LazyLab {...passProps} />
    </Suspense>
  );
}