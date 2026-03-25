# Instalación de Playwright en Linux

## Requisitos previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js**
- **npm**

### Verificar instalación

```bash
node -v
npm -v
```

Si no están instalados, en Ubuntu / Debian puedes hacerlo con:

```bash
sudo apt update
sudo apt install -y nodejs npm
```

---

## Crear un nuevo proyecto

### 1. Crear la carpeta del proyecto

```bash
mkdir mi-proyecto-playwright
cd mi-proyecto-playwright
```

### 2. Inicializar proyecto Node.js

```bash
npm init -y
```

---

## Instalar Playwright

### 1. Instalar Playwright

```bash
npm install playwright
```

### 2. Instalar navegadores

```bash
npx playwright install
```

### 3. Instalar dependencias del sistema (Linux)

```bash
npx playwright install-deps
```

---

## Crear un proyecto Playwright estándar (opcional)

Si quieres crear la estructura oficial de Playwright automáticamente:

```bash
npm init playwright@latest
```

---

## Ejecutar un script

Si tienes un archivo, por ejemplo:

```bash
entrada.js
```

lo ejecutas así:

```bash
node entrada.js
```
