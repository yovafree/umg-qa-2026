import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Backend simulado: responde POST /api/facturas con un número de factura correlativo.
// Solo existe mientras corre `npm run dev`. En las pruebas se puede reemplazar con cy.intercept().
function apiFacturasSimulada() {
  let correlativo = 0
  return {
    name: 'api-facturas-simulada',
    configureServer(server) {
      server.middlewares.use('/api/facturas', (req, res, next) => {
        if (req.method !== 'POST') return next()
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', () => {
          correlativo += 1
          const factura = JSON.parse(body || '{}')
          const numero = 'FAC-' + String(correlativo).padStart(4, '0')
          // Pequeña espera para que se note el estado "Emitiendo..."
          setTimeout(() => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ numero, total: factura.totales?.total ?? 0 }))
          }, 500)
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), apiFacturasSimulada()],
  server: {
    // Puerto fijo para que la baseUrl de Cypress siempre coincida
    port: 5173,
    strictPort: true,
  },
})
