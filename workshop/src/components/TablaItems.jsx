import { formatearQ } from '../calculos'

export default function TablaItems({ items, onEliminar, bloqueado }) {
  return (
    <section className="tarjeta">
      <h2>Detalle</h2>
      <table data-cy="tabla-items">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan="5" className="vacio" data-cy="tabla-vacia">
                No hay productos en la factura
              </td>
            </tr>
          )}
          {items.map((item) => (
            <tr key={item.id} data-cy="fila-item">
              <td data-cy="item-nombre">{item.nombre}</td>
              <td data-cy="item-cantidad">{item.cantidad}</td>
              <td data-cy="item-precio">{formatearQ(item.precio)}</td>
              <td data-cy="item-subtotal">{formatearQ(item.precio * item.cantidad)}</td>
              <td>
                <button
                  className="btn-eliminar"
                  data-cy="btn-eliminar"
                  onClick={() => onEliminar(item.id)}
                  disabled={bloqueado}
                  title="Eliminar"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
