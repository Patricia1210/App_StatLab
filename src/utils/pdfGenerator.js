// src/utils/pdfGenerator.js
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

async function inlineImages(container) {
  const imgs = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    imgs.map(async (img) => {
      const src = img.getAttribute("src");
      if (!src || src.startsWith("data:")) return;
      try {
        const res = await fetch(src, { mode: "cors" });
        const blob = await res.blob();
        const dataUrl = await new Promise((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.readAsDataURL(blob);
        });
        img.setAttribute("src", dataUrl);
      } catch (e) {
        console.warn("No se pudo inlinear imagen:", src, e);
      }
    })
  );
}

// 🔥 DETECTA LA POSICIÓN DE LA SECCIÓN AMARILLA
function getYellowSectionBounds(container) {
  const yellowSection = container.querySelector(".precision-section-complete");
  if (!yellowSection) return null;
  
  const rect = yellowSection.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  
  return {
    start: rect.top - containerRect.top,
    end: rect.bottom - containerRect.top,
    height: rect.height
  };
}

// 🔥 PARTE INTELIGENTE: evita cortar la sección amarilla
function addCanvasAsPages(pdf, canvas, yellowBounds, opts) {
  const { pageWidth, pageHeight, margin } = opts;
  const imgWidth = pageWidth - margin * 2;
  const scale = imgWidth / canvas.width;
  const pageUsableHeight = pageHeight - margin * 2;
  const sliceHeightPx = Math.floor(pageUsableHeight / scale);
  
  let yPx = 0;
  let firstPage = true;
  
  while (yPx < canvas.height) {
    let nextSliceHeight = Math.min(sliceHeightPx, canvas.height - yPx);
    
    // 🔥 SI LA SIGUIENTE REBANADA CORTARÍA LA SECCIÓN AMARILLA
    if (yellowBounds) {
      const nextEnd = yPx + nextSliceHeight;
      const yellowStart = yellowBounds.start / scale;
      const yellowEnd = yellowBounds.end / scale;
      
      // Si cortaríamos la sección amarilla, hacer salto ANTES
      if (yPx < yellowStart && nextEnd > yellowStart && nextEnd < yellowEnd) {
        // Cortar ANTES de la sección amarilla
        nextSliceHeight = Math.floor(yellowStart - yPx);
      }
    }
    
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = nextSliceHeight;
    
    const ctx = sliceCanvas.getContext("2d");
    ctx.drawImage(
      canvas,
      0, yPx,
      canvas.width, sliceCanvas.height,
      0, 0,
      canvas.width, sliceCanvas.height
    );
    
    const imgData = sliceCanvas.toDataURL("image/png");
    
    if (!firstPage) pdf.addPage();
    firstPage = false;
    
    const sliceHeightMm = sliceCanvas.height * scale;
    pdf.addImage(
      imgData, 
      "PNG", 
      margin, 
      margin, 
      imgWidth, 
      sliceHeightMm,
      undefined,
      "FAST"
    );
    
    yPx += sliceCanvas.height;
  }
}

export const generatePDF = async (htmlContent, filename = "reporte.pdf") => {
  try {
    const container = document.createElement("div");
    container.innerHTML = htmlContent;
    
    const style = document.createElement("style");
    style.textContent = `
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body { background: #fff !important; }
      a { color: #2563eb !important; text-decoration: underline !important; }
    `;
    
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "210mm";
    container.style.background = "#ffffff";
    
    document.head.appendChild(style);
    document.body.appendChild(container);
    
    await inlineImages(container);
    await new Promise(r => setTimeout(r, 500));
    
    // 🔥 DETECTAR SECCIÓN AMARILLA
    const yellowBounds = getYellowSectionBounds(container);
    
    const pdf = new jsPDF({ 
      orientation: "portrait", 
      unit: "mm", 
      format: "a4", 
      compress: true 
    });
    
    const opts = { pageWidth: 210, pageHeight: 297, margin: 8 };
    
    const canvas = await html2canvas(container, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: container.scrollWidth,
      windowHeight: container.scrollHeight,
    });
    
    // 🔥 PARTE INTELIGENTE CON DETECCIÓN
    addCanvasAsPages(pdf, canvas, yellowBounds, opts);
    
    document.body.removeChild(container);
    document.head.removeChild(style);
    
    pdf.save(filename);
    return true;
    
  } catch (error) {
    console.error("Error generando PDF:", error);
    alert("Error al generar el PDF: " + error.message);
    return false;
  }
};