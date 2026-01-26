// src/labs/labRegistry.js
import React from "react";

// Vite: detecta automáticamente todos los labs dentro de src/labs/**
const modules = import.meta.glob([
  "./**/Lab*.jsx",
  "./**/Lab*.js",
  "./**/Lab*.tsx",
]);

export const LABS = Object.fromEntries(
  Object.entries(modules).map(([path, loader]) => {
    // "./chapter0/Lab0_2.jsx" -> "chapter0/Lab0_2"
    const key = path.replace("./", "").replace(/\.(jsx|js|tsx)$/, "");
    return [key, React.lazy(loader)];
  })
);

export function getLab(labKey) {
  return LABS[labKey] || null;
}
