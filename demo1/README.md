# Demo 1: ¿Cómo funciona Cypress? (Checkout)

Este proyecto contiene un entorno preconfigurado para probar el flujo de un checkout con Cypress. Incluye un ejemplo de cómo interceptar llamadas a la API (Mocks) para aislar las pruebas del frontend.

## 🛠️ Requisitos Previos
- [Node.js](https://nodejs.org/) instalado en tu equipo.

## 🚀 Pasos para Ejecutar

1. Abre la carpeta `demo1` en **Visual Studio Code** (o entra a ella con `cd demo1`).
2. Abre la terminal integrada de VS Code (`Ver > Terminal` o `Ctrl + \``).
3. Instala las dependencias necesarias de Node y Cypress ejecutando:
   ```bash
   npm install
   ```
4. Una vez instaladas las dependencias, levanta la interfaz gráfica de Cypress:
   ```bash
   npx cypress open
   ```
5. En la ventana de Launchpad de Cypress:
   - Selecciona **E2E Testing**.
   - Elige el navegador **Chrome** (o el de tu preferencia).
   - Haz clic en **Start E2E Testing**.
6. En la lista de Specs, haz clic en `checkout.cy.js` para ver cómo se ejecuta el código en tiempo real.

## 🗂️ Estructura del proyecto
- `index.html`: Una pantalla de checkout funcional (simulada) para realizar las pruebas.
- `cypress/e2e/checkout.cy.js`: Los scripts de automatización con las pruebas de validación, camino feliz y manejo de errores (mocks).

## ▶️ Ejecución sin interfaz (modo headless)
```bash
npm run test:run
```

> Esta demo solo muestra el funcionamiento básico de Cypress. Para practicar escribiendo tus propias pruebas, ve al taller en la carpeta [`../workshop`](../workshop/README.md).
