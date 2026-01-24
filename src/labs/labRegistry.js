// src/labs/labRegistry.js
import React from "react";

// Vite: detecta automáticamente todos los labs dentro de src/labs/**/Lab*.jsx
const modules = import.meta.glob("./**/Lab*.jsx");

export const LABS = Object.fromEntries(
  Object.entries(modules).map(([path, loader]) => {
    // "./chapter2/Lab2_1.jsx" -> "chapter2/Lab2_1"
    const key = path.replace("./", "").replace(".jsx", "");
    return [key, React.lazy(loader)];
  })
);

export function getLab(labKey) {
  return LABS[labKey] || null;
}
