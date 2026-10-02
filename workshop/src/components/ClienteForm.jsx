export default function ClienteForm({ cliente, onChange, bloqueado }) {
  const actualizar = (campo) => (e) => onChange({ ...cliente, [campo]: e.target.value })

  const toggleConsumidorFinal = (e) => {
    const marcado = e.target.checked
    onChange({ ...cliente, consumidorFinal: marcado, nit: marcado ? 'CF' : '' })
  }

  return (
    <section className="tarjeta">
      <h2>Datos del cliente</h2>
      <div className="grid-cliente">
        <label>
          NIT
          <input
            data-cy="cliente-nit"
            value={cliente.nit}
            onChange={actualizar('nit')}
            disabled={bloqueado || cliente.consumidorFinal}
            placeholder="Ej. 1234567-8"
          />
        </label>
        <label className="check">
          <input
            type="checkbox"
            data-cy="cliente-cf"
            checked={cliente.consumidorFinal}
            onChange={toggleConsumidorFinal}
            disabled={bloqueado}
          />
          Consumidor Final (CF)
        </label>
        <label>
          Nombre
          <input
            data-cy="cliente-nombre"
            value={cliente.nombre}
            onChange={actualizar('nombre')}
            disabled={bloqueado}
            placeholder="Nombre completo"
          />
        </label>
        <label>
          Dirección
          <input
            data-cy="cliente-direccion"
            value={cliente.direccion}
            onChange={actualizar('direccion')}
            disabled={bloqueado}
            placeholder="Ciudad"
          />
        </label>
      </div>
    </section>
  )
}
