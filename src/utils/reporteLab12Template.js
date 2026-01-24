// src/utils/reporteLab12Template.js

export const generateReportHTML = (data) => {
  const {
    fecha,
    fuente,
    metodo,
    poblacionSize,
    muestraSize,
    columna,
    popStats,
    sampleStats,
    errorMedia,
    errorMediana,
    errorStdDev,
    precisionMedia,
    precisionMediana,
    precisionStdDev,
    precisionGlobal,
    intervaloConfianza
  } = data;

  // Logo en Base64 - REEMPLAZA ESTO CON TU LOGO REAL
const logoUrl = `${window.location.origin}/assets/logo-statlab.png`;



const getRatingInfo = (precision) => {
    if (precision >= 97) return { stars: '⭐⭐⭐⭐⭐', text: 'EXCELENTE' };
    if (precision >= 90) return { stars: '⭐⭐⭐⭐', text: 'MUY BUENO' };
    if (precision >= 80) return { stars: '⭐⭐⭐', text: 'BUENO' };
    return { stars: '⭐⭐', text: 'ACEPTABLE' };
  };

  const ratingInfo = getRatingInfo(precisionGlobal);

  const metodosNombres = {
    'random': 'Aleatorio Simple',
    'systematic': 'Sistemático',
    'stratified': 'Estratificado'
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte Estadístico - Lab 1.2</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @page {
            size: A4;
            margin: 0;
        }

        body {
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            color: #1e293b;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .report-container {
            max-width: 100% !important;
            margin: 0 !important;
            background: white;
            box-shadow: none !important;
            border-radius: 0 !important;
            overflow: visible !important;
        }

        /* ⚠️ CRÍTICO: EVITAR QUIEBRES DE PÁGINA */
        .precision-section-complete {
            page-break-inside: avoid !important;
            break-inside: avoid-page !important;
            display: block !important;
        }

        .section {
            page-break-inside: auto;
            break-inside: auto;
        }

        .header {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            padding: 32px 40px;
            border-bottom: 4px solid #6366f1;
            page-break-after: avoid;
        }

        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .logo-section {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .logo-icon {
            width: 48px;
            height: 48px;
            background: #6366f1;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .logo-icon img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .brand {
            color: white;
        }

        .brand-name {
            font-size: 18px;
            font-weight: 800;
            letter-spacing: -0.5px;
        }

        .brand-tagline {
            font-size: 9px;
            font-weight: 600;
            color: #94a3b8;
            letter-spacing: 1.2px;
            text-transform: uppercase;
        }

        .report-id {
            background: rgba(255, 255, 255, 0.1);
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            color: #e2e8f0;
            letter-spacing: 0.5px;
        }

        .header-title {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 20px;
        }

        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 6px;
            letter-spacing: -0.8px;
        }

        .header-subtitle {
            color: #94a3b8;
            font-size: 14px;
            font-weight: 500;
        }

        .content {
            padding: 40px;
        }

        .info-cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 32px;
            page-break-inside: avoid;
        }

        .info-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
        }

        .info-card-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.8px;
            margin-bottom: 6px;
        }

        .info-card-value {
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.4;
        }

        .section {
            margin-bottom: 36px;
        }

        .section-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid #f1f5f9;
            page-break-after: avoid;
        }

        .section-number {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            font-weight: 800;
        }

        .section-title {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.3px;
        }

        .stats-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 24px;
        }

        .stat-panel {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
        }

        .stat-panel-header {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 14px 18px;
            border-bottom: 2px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .stat-panel-icon {
            font-size: 20px;
        }

        .stat-panel-title {
            font-size: 13px;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stat-panel-body {
            padding: 18px;
        }

        .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #f1f5f9;
        }

        .stat-item:last-child {
            border-bottom: none;
        }

        .stat-label {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
        }

        .stat-value {
            font-size: 16px;
            font-weight: 800;
            color: #6366f1;
        }

        .precision-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 24px;
        }

        .precision-table thead {
            background: linear-gradient(135deg, #1e293b, #334155);
        }

        .precision-table th {
            color: white;
            padding: 14px 16px;
            text-align: left;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }

        .precision-table td {
            padding: 14px 16px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 13px;
            font-weight: 600;
        }

        .precision-table tbody tr:last-child td {
            border-bottom: none;
        }

        .precision-table tbody tr:nth-child(even) {
            background: #f8fafc;
        }

        .metric-name {
            color: #0f172a;
            font-weight: 700;
        }

        .error-badge {
            display: inline-block;
            background: #fee2e2;
            color: #991b1b;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
        }

        .precision-badge {
            display: inline-block;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
        }

        .rating-card {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 2px solid #f59e0b;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin-bottom: 0;
        }

        .rating-stars {
            font-size: 28px;
            margin-bottom: 10px;
            letter-spacing: 4px;
        }

        .rating-title {
            font-size: 22px;
            font-weight: 900;
            color: #78350f;
            margin-bottom: 6px;
        }

        .rating-score {
            font-size: 13px;
            color: #92400e;
            font-weight: 600;
        }

        .interpretation-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 24px;
        }

        .interpretation-card {
            background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
            border-left: 4px solid #7c3aed;
            border-radius: 8px;
            padding: 16px;
        }

        .interpretation-card h4 {
            font-size: 13px;
            font-weight: 700;
            color: #5b21b6;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .interpretation-card p {
            font-size: 12px;
            color: #4c1d95;
            line-height: 1.6;
            font-weight: 500;
        }

        .methodology-box {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            padding: 20px;
        }

        .methodology-box h4 {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .methodology-box p {
            font-size: 12px;
            color: #475569;
            line-height: 1.7;
            font-weight: 500;
            margin-bottom: 12px;
        }

        .methodology-box p:last-child {
            margin-bottom: 0;
        }

        .confidence-interval {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            margin-top: 12px;
        }

        .confidence-interval strong {
            color: #6366f1;
            font-weight: 700;
        }

        .footer {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            padding: 28px 40px;
            color: white;
            page-break-inside: avoid;
        }

        .footer-content {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 30px;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }

        .footer-logo {
            width: 36px;
            height: 36px;
            background: #6366f1;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .footer-logo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .footer-brand-text h5 {
            font-size: 16px;
            font-weight: 800;
            color: white;
            margin-bottom: 2px;
        }

        .footer-brand-text p {
            font-size: 8px;
            color: #94a3b8;
            letter-spacing: 1px;
            text-transform: uppercase;
            font-weight: 600;
        }

        .footer-description {
            font-size: 11px;
            color: #cbd5e1;
            line-height: 1.5;
            font-weight: 500;
        }

        .footer-section h6 {
            font-size: 10px;
            text-transform: uppercase;
            color: #94a3b8;
            letter-spacing: 1px;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .footer-links {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .footer-link {
            color: #cbd5e1;
            font-size: 11px;
            font-weight: 500;
            line-height: 1.5;
            text-decoration: none;
            display: block;
        }
        
        .footer-link .footer-url {
        display: block;
        font-size: 9px;
        color: #94a3b8;
        margin-top: 2px;
        word-break: break-word;
        text-decoration: underline;
        }

        /* ⚠️ HACER LINKS VISIBLES EN PDF */
        .footer-link.with-url::after {
            content: " " attr(data-url);
            display: block;
            font-size: 9px;
            color: #94a3b8;
            margin-top: 2px;
        }

        .footer-bottom {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9px;
            color: #64748b;
            font-weight: 600;
        }

        .footer-status {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .status-dot {
            width: 6px;
            height: 6px;
            background: #10b981;
            border-radius: 50%;
            box-shadow: 0 0 6px #10b981;
        }
        
        .logo-icon img,
        .footer-logo img {
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
        }


        @media print {
            body {
                padding: 0;
                background: white;
            }
            
            .report-container {
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <div class="header-top">
                <div class="logo-section">
                    <div class="logo-icon">
                         <img src="${logoUrl}" alt="StatLab" crossorigin="anonymous" />
                    </div>
                    <div class="brand">
                        <div class="brand-name">StatLab</div>
                        <div class="brand-tagline">RESEARCH & ANALYTICS</div>
                    </div>
                </div>
                <div class="report-id">LAB 1.2 • REPORTE #2026-${String(Date.now()).slice(-3)}</div>
            </div>
            <div class="header-title">
                <h1>Análisis de Población y Muestra</h1>
                <div class="header-subtitle">Capítulo 1.2 • Métodos de Muestreo Estadístico</div>
            </div>
        </div>

        <div class="content">
            <div class="info-cards">
                <div class="info-card">
                    <div class="info-card-label">Fecha</div>
                    <div class="info-card-value">${fecha}</div>
                </div>
                <div class="info-card">
                    <div class="info-card-label">Fuente</div>
                    <div class="info-card-value">${fuente}${columna ? `<br>${columna}` : ''}</div>
                </div>
                <div class="info-card">
                    <div class="info-card-label">Método</div>
                    <div class="info-card-value">${metodosNombres[metodo] || metodo}</div>
                </div>
                <div class="info-card">
                    <div class="info-card-label">Muestra</div>
                    <div class="info-card-value">n=${muestraSize} / N=${poblacionSize}<br>(${((muestraSize/poblacionSize)*100).toFixed(2)}%)</div>
                </div>
            </div>

            <div class="section">
                <div class="section-header">
                    <div class="section-number">01</div>
                    <div class="section-title">Estadísticas Descriptivas</div>
                </div>

                <div class="stats-container">
                    <div class="stat-panel">
                        <div class="stat-panel-header">
                            <span class="stat-panel-icon">📊</span>
                            <span class="stat-panel-title">Población</span>
                        </div>
                        <div class="stat-panel-body">
                            <div class="stat-item">
                                <span class="stat-label">Media (μ)</span>
                                <span class="stat-value">${popStats.mean}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Mediana</span>
                                <span class="stat-value">${popStats.median}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Desv. Est. (σ)</span>
                                <span class="stat-value">${popStats.stdDev}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Rango</span>
                                <span class="stat-value">${popStats.min} - ${popStats.max}</span>
                            </div>
                        </div>
                    </div>

                    <div class="stat-panel">
                        <div class="stat-panel-header">
                            <span class="stat-panel-icon">🎯</span>
                            <span class="stat-panel-title">Muestra</span>
                        </div>
                        <div class="stat-panel-body">
                            <div class="stat-item">
                                <span class="stat-label">Media (x̄)</span>
                                <span class="stat-value">${sampleStats.mean}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Mediana</span>
                                <span class="stat-value">${sampleStats.median}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Desv. Est. (s)</span>
                                <span class="stat-value">${sampleStats.stdDev}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Rango</span>
                                <span class="stat-value">${sampleStats.min} - ${sampleStats.max}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ⚠️ SECCIÓN CRÍTICA: TABLA + RATING JUNTOS -->
            <div class="section precision-section-complete">
                <div class="section-header">
                    <div class="section-number">02</div>
                    <div class="section-title">Análisis de Precisión</div>
                </div>

                <table class="precision-table">
                    <thead>
                        <tr>
                            <th>Métrica</th>
                            <th>Error Absoluto</th>
                            <th>Error Relativo</th>
                            <th>Precisión</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="metric-name">Media</td>
                            <td><span class="error-badge">${errorMedia}</span></td>
                            <td>${((errorMedia/parseFloat(popStats.mean))*100).toFixed(2)}%</td>
                            <td><span class="precision-badge">${precisionMedia.toFixed(1)}%</span></td>
                        </tr>
                        <tr>
                            <td class="metric-name">Mediana</td>
                            <td><span class="error-badge">${errorMediana}</span></td>
                            <td>${((errorMediana/parseFloat(popStats.median))*100).toFixed(2)}%</td>
                            <td><span class="precision-badge">${precisionMediana.toFixed(1)}%</span></td>
                        </tr>
                        <tr>
                            <td class="metric-name">Desviación Estándar</td>
                            <td><span class="error-badge">${errorStdDev}</span></td>
                            <td>${((errorStdDev/parseFloat(popStats.stdDev))*100).toFixed(2)}%</td>
                            <td><span class="precision-badge">${precisionStdDev.toFixed(1)}%</span></td>
                        </tr>
                    </tbody>
                </table>

                <div class="rating-card">
                    <div class="rating-stars">${ratingInfo.stars}</div>
                    <div class="rating-title">${ratingInfo.text}</div>
                    <div class="rating-score">Precisión Global: ${precisionGlobal.toFixed(1)}%</div>
                </div>
            </div>

            <div class="section">
                <div class="section-header">
                    <div class="section-number">03</div>
                    <div class="section-title">Interpretación de Resultados</div>
                </div>

                <div class="interpretation-grid">
                    <div class="interpretation-card">
                        <h4>🎯 Representatividad</h4>
                        <p>La muestra es ${precisionGlobal >= 95 ? 'altamente representativa' : precisionGlobal >= 85 ? 'representativa' : 'moderadamente representativa'} con un error de ${((errorMedia/parseFloat(popStats.mean))*100).toFixed(2)}% en la media poblacional.</p>
                    </div>
                    <div class="interpretation-card">
                        <h4>✅ Confiabilidad</h4>
                        <p>Los resultados pueden generalizarse a la población total con ${precisionGlobal.toFixed(1)}% de confianza.</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-header">
                    <div class="section-number">04</div>
                    <div class="section-title">Notas Metodológicas</div>
                </div>

                <div class="methodology-box">
                    <h4>📚 Método Aplicado</h4>
                    <p>
                        <strong>${metodosNombres[metodo]}:</strong> ${
                          metodo === 'random' 
                            ? 'Cada elemento de la población tuvo la misma probabilidad de selección, minimizando sesgos y garantizando representatividad estadística.' 
                            : metodo === 'systematic'
                            ? 'Selección a intervalos regulares de la población, eficiente y fácil de implementar.'
                            : 'División de la población en estratos y selección proporcional de cada grupo, garantizando representación de todos los subgrupos.'
                        }
                    </p>
                    
                    <div class="confidence-interval">
                        <p style="margin: 0; font-size: 11px;">
                            <strong>Intervalo de Confianza (95%):</strong> La media poblacional verdadera se encuentra entre 
                            <strong>[${intervaloConfianza.min}, ${intervaloConfianza.max}]</strong> según la distribución t de Student.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="footer-content">
                <div>
                    <div class="footer-brand">
                        <div class="footer-logo">
                            <img src="${logoUrl}" alt="StatLab" crossorigin="anonymous" />
                        </div>
                        <div class="footer-brand-text">
                            <h5>StatLab</h5>
                            <p>RESEARCH & ANALYTICS</p>
                        </div>
                    </div>
                    <p class="footer-description">
                        Plataforma especializada en análisis estadístico para educación y desarrollo profesional.
                    </p>
                </div>

                <div>
                <h6>Recursos</h6>
                <div class="footer-links">
                 <a class="footer-link" href="https://www.udemy.com/statlab-curso" target="_blank"
                 rel="noopener noreferrer">
                 📚 Curso Udemy
                 <span class="footer-url">https://www.udemy.com/statlab-curso</span>
                 </a>
                 <a class="footer-link" href="https://appstatlab.netlify.app" target="_blank" rel="noopener noreferrer">
                 🌐 appstatlab.netlify.app
                 <span class="footer-url">https://appstatlab.netlify.app</span>
                 </a>
                 <div class="footer-link">
                 ✉️ statlabresearch2025@gmail.com
                 </div>
                 </div>
                </div>



                <div>
                    <h6>Ubicación</h6>
                    <p style="font-size: 11px; color: #cbd5e1; line-height: 1.6; font-weight: 500;">
                        Morelia, Michoacán<br>
                        México • CP 58000
                    </p>
                </div>
            </div>

            <div class="footer-bottom">
                <div>© 2026 StatLab Research & Analytics • Todos los derechos reservados</div>
                <div class="footer-status">
                    <span class="status-dot"></span>
                    <span>v1.0.0 • Online</span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
};