import React from "react";

// Vite: detecta automáticamente todos los labs que estén en src/labs/**/Lab*.jsx
const modules = import.meta.glob("./**/Lab*.jsx");

export const LABS = Object.fromEntries(
  Object.entries(modules).map(([path, loader]) => {
    // "./chapter0/Lab0_2.jsx" -> "chapter0/Lab0_2"
    const key = path.replace("./", "").replace(".jsx", "");
    return [key, React.lazy(loader)];
  })
);

export function getLab(labKey) {
  return LABS[labKey] || null;
}
