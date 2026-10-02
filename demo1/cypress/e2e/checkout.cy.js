describe('Flujo E2E: Checkout de Compra', () => {
  
  beforeEach(() => {
    // Visitamos el archivo HTML local. 
    // En un proyecto real esto sería cy.visit('http://localhost:3000/checkout')
    cy.visit('index.html')
  })

  it('1. Debe validar campos requeridos (Retest de validación de UI)', () => {
    cy.get('#btn-pagar').click()
    cy.get('#mensaje')
      .should('be.visible')
      .and('contain.text', 'Error: Ingrese un número de tarjeta')
      .and('have.class', 'error')
  })

  it('2. Debe procesar el pago exitosamente usando un MOCK de la API (Camino Feliz)', () => {
    // Cypress permite interceptar llamadas de red para simular el Backend
    cy.intercept('POST', '/api/pagos', {
      statusCode: 200,
      body: { success: true }
    }).as('pagoAprobado')

    // Llenamos el formulario
    cy.get('#cantidad').clear().type('2')
    cy.get('#tarjeta').type('4111222233334444')
    cy.get('#btn-pagar').click()

    // Esperamos a que la petición sea interceptada
    cy.wait('@pagoAprobado')

    // Verificamos el síntoma visual para el usuario
    cy.get('#mensaje')
      .should('be.visible')
      .and('contain.text', '¡Pago exitoso!')
      .and('have.class', 'success')
  })

  it('3. Debe manejar un error del servidor HTTP 500 (Prueba Negativa / Regresión)', () => {
    // Simulamos que la API de pagos se cayó
    cy.intercept('POST', '/api/pagos', {
      statusCode: 500,
      body: { success: false, error: 'Internal Server Error' }
    }).as('pagoFalloServidor')

    cy.get('#tarjeta').type('4111222233334444')
    cy.get('#btn-pagar').click()

    cy.wait('@pagoFalloServidor')
    
    // Verificamos que la UI maneje el error elegantemente
    cy.get('#mensaje')
      .should('be.visible')
      .and('contain.text', 'Error')
      .and('have.class', 'error')
  })
})