const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function getToday() {
    return new Date().toISOString().slice(0, 10);
}

function prepareEvidence(scriptName) {
    const BASE_DIR = path.join(__dirname, 'evidencias');
    const SCRIPT_DIR = path.join(BASE_DIR, scriptName);
    const TODAY_DIR = path.join(SCRIPT_DIR, getToday());

    const VIDEO_DIR = path.join(TODAY_DIR, 'videos');
    const TRACE_DIR = path.join(TODAY_DIR, 'traces');
    const SCREENSHOT_DIR = path.join(TODAY_DIR, 'screenshots');
    const REPORT_DIR = path.join(TODAY_DIR, 'reportes');

    if (fs.existsSync(TODAY_DIR)) {
        fs.rmSync(TODAY_DIR, { recursive: true, force: true });
    }

    for (const dir of [BASE_DIR, SCRIPT_DIR, TODAY_DIR, VIDEO_DIR, TRACE_DIR, SCREENSHOT_DIR, REPORT_DIR]) {
        fs.mkdirSync(dir, { recursive: true });
    }

    return {
        BASE_DIR,
        SCRIPT_DIR,
        TODAY_DIR,
        VIDEO_DIR,
        TRACE_DIR,
        SCREENSHOT_DIR,
        REPORT_DIR
    };
}

async function runFlow(flowFunction) {
    const scriptName = path.basename(process.argv[1], '.js');

    const {
        TODAY_DIR,
        VIDEO_DIR,
        TRACE_DIR,
        SCREENSHOT_DIR,
        REPORT_DIR
    } = prepareEvidence(scriptName);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const steps = [];
    let shotCounter = 1;
    let executionStatus = '✅ Flujo ejecutado correctamente';

    function addStep(nombre, descripcion, archivo = '') {
        steps.push({
            hora: new Date().toISOString(),
            nombre,
            descripcion,
            archivo
        });
    }

    async function takeShot(page, nombre, descripcion) {
        const fileName = `${String(shotCounter).padStart(2, '0')}-${nombre}-${timestamp}.png`;
        const filePath = path.join(SCREENSHOT_DIR, fileName);

        await page.screenshot({
            path: filePath,
            fullPage: true
        });

        addStep(nombre, descripcion, filePath);
        shotCounter++;
    }

    const browser = await chromium.launch({
        headless: false,
        slowMo: 300
    });

    const context = await browser.newContext({
        recordVideo: {
            dir: VIDEO_DIR,
            size: { width: 1440, height: 900 }
        },
        viewport: { width: 1440, height: 900 }
    });

    const page = await context.newPage();

    await context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true
    });

    let traceFile = '';
    let traceCommand = '';
    let traceTxt = '';
    let traceBat = '';
    let traceSh = '';
    let reportJson = '';
    let reportMd = '';

    try {
        addStep('inicio', 'Inicio del flujo de prueba');

        // =========================================================
        // 👉 AQUÍ SE EJECUTA EL FLUJO PERSONALIZADO
        // =========================================================
        await flowFunction({
            page,
            context,
            browser,
            takeShot,
            addStep
        });

        addStep('fin_ok', 'Flujo ejecutado correctamente');
        console.log('✅ Flujo ejecutado correctamente.');

    } catch (error) {
        executionStatus = '❌ Flujo finalizado con error';
        addStep('error', `Error: ${error.message}`);

        const errorShot = path.join(SCREENSHOT_DIR, `99-error-${timestamp}.png`);
        try {
            await page.screenshot({
                path: errorShot,
                fullPage: true
            });
            addStep('captura_error', 'Captura del error', errorShot);
        } catch (_) {}

        console.error('❌ Error durante la ejecución:', error);
        throw error;

    } finally {
        traceFile = path.join(TRACE_DIR, `trace-${timestamp}.zip`);

        await context.tracing.stop({
            path: traceFile
        });

        traceCommand = `npx playwright show-trace "${traceFile}"`;

        addStep('trace_generado', 'Trace generado', traceFile);

        traceTxt = path.join(TRACE_DIR, 'abrir-trace.txt');
        fs.writeFileSync(traceTxt, traceCommand, 'utf8');

        traceBat = path.join(TRACE_DIR, 'abrir-trace.bat');
        fs.writeFileSync(traceBat, `${traceCommand}\npause`, 'utf8');

        traceSh = path.join(TRACE_DIR, 'abrir-trace.sh');
        fs.writeFileSync(traceSh, `#!/bin/bash\n${traceCommand}\n`, 'utf8');

        addStep('comando_trace', 'Archivo con comando para abrir trace', traceTxt);

        reportJson = path.join(REPORT_DIR, `steps-${timestamp}.json`);
        fs.writeFileSync(reportJson, JSON.stringify(steps, null, 2), 'utf8');

        reportMd = path.join(REPORT_DIR, `README-${timestamp}.md`);
        fs.writeFileSync(
            reportMd,
            `# Reporte de ejecución - ${scriptName}

## 1. Información general

- **Script ejecutado:** ${scriptName}.js
- **Fecha de ejecución:** ${new Date().toLocaleString()}
- **Entorno:** Automatización Web con Playwright
- **Navegador:** Chromium
- **Modo ejecución:** Visible (\`headless: false\`)
- **Resolución usada:** 1440 x 900
- **SlowMo:** 300 ms

---

## 2. Objetivo del flujo

Este script automatiza el flujo funcional correspondiente al archivo **${scriptName}.js**, incluyendo navegación, interacción con formularios y generación de evidencias de ejecución.

---

## 3. Evidencias generadas

### 3.1 Carpeta base de evidencias
- ${TODAY_DIR}

### 3.2 Archivos relevantes
- **Trace:** ${traceFile}
- **Comando para abrir trace:** ${traceTxt}
- **Script Windows para abrir trace:** ${traceBat}
- **Script Linux/Mac para abrir trace:** ${traceSh}
- **Reporte JSON de pasos:** ${reportJson}
- **Reporte Markdown:** ${reportMd}

---

## 4. Estructura de evidencias generadas

\`\`\`text
${TODAY_DIR}
├── screenshots/
├── traces/
├── videos/
└── reportes/
\`\`\`

### 4.1 Contenido por carpeta

- **screenshots/**  
  Capturas de pantalla tomadas durante la ejecución del flujo.

- **traces/**  
  Archivo \`.zip\` de trazabilidad Playwright para análisis detallado de la sesión.

- **videos/**  
  Grabación completa de la sesión automatizada.

- **reportes/**  
  Reportes de ejecución en formato JSON y Markdown.

---

## 5. Resultado de la ejecución

**Estado final:** ${executionStatus}

> Si ocurrió un error durante la ejecución, este reporte contendrá el paso \`error\` y una captura adicional \`99-error-*.png\`.

---

## 6. Pasos ejecutados

${steps.map((s, i) => `### ${i + 1}. ${s.nombre}

- **Hora:** ${s.hora}
- **Descripción:** ${s.descripcion}
${s.archivo ? `- **Archivo asociado:** ${s.archivo}` : ''}
`).join('\n')}

---

## 7. Cómo abrir el trace

### Opción 1 - manual
\`\`\`bash
${traceCommand}
\`\`\`

### Opción 2 - Windows
Ejecutar:
\`\`\`bat
${traceBat}
\`\`\`

### Opción 3 - Linux / Mac
Ejecutar:
\`\`\`bash
bash "${traceSh}"
\`\`\`

---

## 8. Cómo reproducir la ejecución

Desde la carpeta del proyecto:

\`\`\`bash
node ${scriptName}.js
\`\`\`

---

## 9. Dependencias requeridas

- Node.js
- Playwright

Instalación recomendada:

\`\`\`bash
npm install playwright
\`\`\`

Si es primera vez:

\`\`\`bash
npx playwright install
\`\`\`

---

## 10. Observaciones técnicas

- El script crea automáticamente la estructura de evidencias por **nombre de archivo** y **fecha actual**.
- Cada ejecución elimina previamente la carpeta del día para evitar mezcla de evidencias.
- Se generan capturas automáticas en puntos clave del flujo.
- Se registra traza completa de la sesión para análisis posterior.
- Se registra video de la ejecución completa.

---

## 11. Recomendaciones

- No guardar credenciales en texto plano dentro del script.
- Migrar usuario y contraseña a variables de entorno.
- Mantener nombres de archivos descriptivos para organizar evidencias correctamente.

---

## 12. Conclusión

La ejecución del flujo **${scriptName}.js** finalizó y generó las evidencias necesarias para auditoría, validación funcional y trazabilidad técnica.
`,
            'utf8'
        );

        await context.close();
        await browser.close();
    }
}

module.exports = { runFlow };