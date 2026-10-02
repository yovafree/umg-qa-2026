import { useEffect, useState } from 'react'
import ClienteForm from './components/ClienteForm'
import AgregarProducto from './components/AgregarProducto'
import TablaItems from './components/TablaItems'
import Totales from './components/Totales'
import { CUPONES, calcularTotales, nitValido } from './calculos'

const CLIENTE_VACIO = { nit: '', nombre: '', direccion: '', consumidorFinal: false }

export default function App() {
  const [catalogo, setCatalogo] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCatalogo, setErrorCatalogo] = useState(false)

  const [cliente, setCliente] = useState(CLIENTE_VACIO)
  const [items, setItems] = useState([])
  const [cupon, setCupon] = useState(null)
  const [mensajeCupon, setMensajeCupon] = useState(null)

  // mensaje = { tipo: 'error' | 'success', texto }
  const [mensaje, setMensaje] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [facturaEmitida, setFacturaEmitida] = useState(null)

  // Carga del catálogo desde la "API" (archivo estático en /public/api)
  useEffect(() => {
    fetch('/api/productos.json')
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status)
        return res.json()
      })
      .then(setCatalogo)
      .catch(() => setErrorCatalogo(true))
      .finally(() => setCargando(false))
  }, [])

  const totales = calcularTotales(items, cupon ? CUPONES[cupon] : 0)
  const bloqueado = Boolean(facturaEmitida) || enviando

  const agregarItem = (producto, cantidad) => {
    if (!producto) {
      setMensaje({ tipo: 'error', texto: 'Seleccione un producto' })
      return false
    }
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      setMensaje({ tipo: 'error', texto: 'La cantidad debe ser un número entero mayor a 0' })
      return false
    }
    setMensaje(null)
    setItems((actuales) => {
      const existente = actuales.find((i) => i.id === producto.id)
      if (existente) {
        // Si el producto ya está en la factura, solo se suma la cantidad
        return actuales.map((i) =>
          i.id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i
        )
      }
      return [...actuales, { ...producto, cantidad }]
    })
    return true
  }

  const eliminarItem = (id) => setItems((actuales) => actuales.filter((i) => i.id !== id))

  const aplicarCupon = (codigo) => {
    const normalizado = codigo.trim().toUpperCase()
    if (CUPONES[normalizado]) {
      setCupon(normalizado)
      setMensajeCupon({
        tipo: 'success',
        texto: `Cupón ${normalizado} aplicado (${CUPONES[normalizado] * 100}%)`,
      })
    } else {
      setCupon(null)
      setMensajeCupon({ tipo: 'error', texto: 'Cupón inválido' })
    }
  }

  const validar = () => {
    if (!nitValido(cliente.nit)) return 'Ingrese un NIT válido o marque Consumidor Final'
    if (!cliente.nombre.trim()) return 'El nombre del cliente es obligatorio'
    if (items.length === 0) return 'Agregue al menos un producto'
    return null
  }

  const emitir = async () => {
    const error = validar()
    if (error) {
      setMensaje({ tipo: 'error', texto: error })
      return
    }

    setEnviando(true)
    setMensaje(null)
    try {
      const res = await fetch('/api/facturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: {
            nit: cliente.nit.trim().toUpperCase(),
            nombre: cliente.nombre.trim(),
            direccion: cliente.direccion.trim() || 'Ciudad',
          },
          items: items.map(({ id, nombre, precio, cantidad }) => ({ id, nombre, precio, cantidad })),
          cupon,
          totales,
        }),
      })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()
      setFacturaEmitida(data.numero)
      setMensaje({ tipo: 'success', texto: `Factura ${data.numero} emitida correctamente` })
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al emitir la factura. Intente de nuevo.' })
    } finally {
      setEnviando(false)
    }
  }

  const nuevaFactura = () => {
    setCliente(CLIENTE_VACIO)
    setItems([])
    setCupon(null)
    setMensajeCupon(null)
    setMensaje(null)
    setFacturaEmitida(null)
  }

  return (
    <main className="contenedor">
      <header className="encabezado">
        <div>
          <h1 data-cy="titulo">Factura Electrónica</h1>
          <p className="empresa">Librería UMG, S.A. · NIT 9876543-2</p>
        </div>
        <div className="meta">
          <span data-cy="factura-numero">{facturaEmitida ?? 'BORRADOR'}</span>
          <span data-cy="factura-fecha">{new Date().toLocaleDateString('es-GT')}</span>
        </div>
      </header>

      <ClienteForm cliente={cliente} onChange={setCliente} bloqueado={bloqueado} />

      <AgregarProducto
        catalogo={catalogo}
        cargando={cargando}
        errorCatalogo={errorCatalogo}
        onAgregar={agregarItem}
        bloqueado={bloqueado}
      />

      <TablaItems items={items} onEliminar={eliminarItem} bloqueado={bloqueado} />

      <Totales
        totales={totales}
        cupon={cupon}
        mensajeCupon={mensajeCupon}
        onAplicarCupon={aplicarCupon}
        bloqueado={bloqueado}
      />

      {mensaje && (
        <p data-cy="mensaje" className={`alerta ${mensaje.tipo}`}>
          {mensaje.texto}
        </p>
      )}

      <div className="acciones">
        {facturaEmitida ? (
          <button data-cy="btn-nueva" onClick={nuevaFactura}>
            Nueva factura
          </button>
        ) : (
          <button data-cy="btn-emitir" className="principal" onClick={emitir} disabled={enviando}>
            {enviando ? 'Emitiendo...' : 'Emitir factura'}
          </button>
        )}
      </div>
    </main>
  )
}
