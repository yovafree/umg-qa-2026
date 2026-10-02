// Reglas de negocio de la factura (separadas de la UI para que sean fáciles de leer)

export const TASA_IVA = 0.12

// Cupones válidos y su porcentaje de descuento
export const CUPONES = {
  UMG10: 0.1,
  QA2026: 0.2,
}

export const redondear = (valor) => Math.round(valor * 100) / 100

export const formatearQ = (valor) =>
  'Q ' +
  valor.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export function calcularTotales(items, porcentajeDescuento = 0) {
  const subtotal = redondear(
    items.reduce((suma, item) => suma + item.precio * item.cantidad, 0)
  )
  const descuento = redondear(subtotal * porcentajeDescuento)
  const base = redondear(subtotal - descuento)
  const iva = redondear(base * TASA_IVA)
  const total = redondear(base + iva)
  return { subtotal, descuento, iva, total }
}

// El NIT puede ser "CF" (consumidor final) o solo dígitos con un guion y dígito/K opcional
export const nitValido = (nit) => /^(CF|\d{4,12}(-?[\dK])?)$/i.test(nit.trim())
