// Comandos personalizados del taller (Ejercicio 10)

// Selecciona un producto por su nombre y lo agrega con la cantidad indicada
Cypress.Commands.add('agregarProducto', (nombre, cantidad = 1) => {
  cy.get('[data-cy=producto-select]')
    .find('option')
    .contains(nombre)
    .then(($opcion) => {
      cy.get('[data-cy=producto-select]').select($opcion.val())
    })
  cy.get('[data-cy=producto-cantidad]').clear().type(String(cantidad))
  cy.get('[data-cy=btn-agregar]').click()
})

// Llena los datos del cliente. Si el NIT es "CF" marca la casilla de Consumidor Final
Cypress.Commands.add('llenarCliente', ({ nit, nombre, direccion }) => {
  if (nit.toUpperCase() === 'CF') {
    cy.get('[data-cy=cliente-cf]').check()
  } else {
    cy.get('[data-cy=cliente-nit]').type(nit)
  }
  cy.get('[data-cy=cliente-nombre]').type(nombre)
  if (direccion) cy.get('[data-cy=cliente-direccion]').type(direccion)
})
