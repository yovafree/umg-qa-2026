import { useState } from 'react'
import { formatearQ } from '../calculos'

export default function AgregarProducto({ catalogo, cargando, errorCatalogo, onAgregar, bloqueado }) {
  const [productoId, setProductoId] = useState('')
  const [cantidad, setCantidad] = useState('1')

  const agregar = (e) => {
    e.preventDefault()
    const producto = catalogo.find((p) => String(p.id) === productoId)
    const ok = onAgregar(producto, Number(cantidad))
    if (ok) {
      setProductoId('')
      setCantidad('1')
    }
  }

  return (
    <section className="tarjeta">
      <h2>Agregar producto</h2>
      {errorCatalogo && (
        <p className="alerta error" data-cy="catalogo-error">
          No se pudo cargar el catálogo de productos.
        </p>
      )}
      <form className="fila-agregar" onSubmit={agregar}>
        <select
          data-cy="producto-select"
          value={productoId}
          onChange={(e) => setProductoId(e.target.value)}
          disabled={bloqueado || cargando || errorCatalogo}
        >
          <option value="">{cargando ? 'Cargando...' : 'Seleccione un producto'}</option>
          {catalogo.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} - {formatearQ(p.precio)}
            </option>
          ))}
        </select>
        <input
          type="number"
          data-cy="producto-cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          disabled={bloqueado}
        />
        <button type="submit" data-cy="btn-agregar" disabled={bloqueado}>
          Agregar
        </button>
      </form>
    </section>
  )
}
