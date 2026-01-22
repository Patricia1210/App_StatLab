// src/utils/pdfGenerator.js
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generatePDF = async (htmlContent, filename = "reporte.pdf") => {
  try {
    // 1) Contenedor temporal
    const container = document.createElement("div");
    container.innerHTML = htmlContent;

    container.style.position = "absolute";
    container.style.left = "-999999px";
    container.style.top = "0";
    container.style.width = "210mm"; // A4
    container.style.background = "#fff";

    document.body.appendChild(container);

    // Esperar render
    await new Promise((r) => setTimeout(r, 400));

    // 2) Captura
    const canvas = await html2canvas(container, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      // IMPORTANTE: que capture el alto real completo
      windowWidth: container.scrollWidth,
      windowHeight: container.scrollHeight,
      scrollY: -window.scrollY,
    });

    document.body.removeChild(container);

    // 3) PDF A4
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageWidthMm = 210;
    const pageHeightMm = 297;

    // Altura en px que corresponde a 1 página cuando escalamos al ancho A4
    const pageHeightPx = Math.floor((canvas.width * pageHeightMm) / pageWidthMm);

    let y = 0;
    let pageIndex = 0;

    while (y < canvas.height) {
      const sliceHeightPx = Math.min(pageHeightPx, canvas.height - y);

      // Canvas de página
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeightPx;

      const ctx = pageCanvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      // Copiar “tira”
      ctx.drawImage(
        canvas,
        0,
        y,
        canvas.width,
        sliceHeightPx,
        0,
        0,
        canvas.width,
        sliceHeightPx
      );

      const imgData = pageCanvas.toDataURL("image/jpeg", 0.95);

      if (pageIndex > 0) pdf.addPage();

      // Alto en mm proporcional
      const sliceHeightMm = (sliceHeightPx * pageWidthMm) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pageWidthMm, sliceHeightMm, undefined, "FAST");

      y += sliceHeightPx;
      pageIndex++;
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error("Error generando PDF:", error);
    alert("Error al generar el PDF: " + error.message);
    return false;
  }
};
