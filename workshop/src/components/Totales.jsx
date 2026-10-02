import { useState } from 'react'
import { formatearQ } from '../calculos'

export default function Totales({ totales, cupon, mensajeCupon, onAplicarCupon, bloqueado }) {
  const [codigo, setCodigo] = useState('')

  const aplicar = (e) => {
    e.preventDefault()
    onAplicarCupon(codigo)
  }

  return (
    <section className="tarjeta">
      <h2>Resumen</h2>
      <form className="fila-cupon" onSubmit={aplicar}>
        <input
          data-cy="cupon-input"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Código de cupón"
          disabled={bloqueado}
        />
        <button type="submit" data-cy="btn-cupon" disabled={bloqueado}>
          Aplicar
        </button>
      </form>
      {mensajeCupon && (
        <p data-cy="cupon-mensaje" className={`alerta ${mensajeCupon.tipo}`}>
          {mensajeCupon.texto}
        </p>
      )}
      <dl className="totales">
        <dt>Subtotal</dt>
        <dd data-cy="total-subtotal">{formatearQ(totales.subtotal)}</dd>
        <dt>Descuento{cupon ? ` (${cupon})` : ''}</dt>
        <dd data-cy="total-descuento">- {formatearQ(totales.descuento)}</dd>
        <dt>IVA (12%)</dt>
        <dd data-cy="total-iva">{formatearQ(totales.iva)}</dd>
        <dt className="gran-total">Total</dt>
        <dd className="gran-total" data-cy="total-general">
          {formatearQ(totales.total)}
        </dd>
      </dl>
    </section>
  )
}
