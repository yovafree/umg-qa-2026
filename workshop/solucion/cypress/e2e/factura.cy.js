// SOLUCIÓN DE REFERENCIA DEL TALLER (para el instructor)
// Cada bloque `describe` corresponde a un ejercicio del README.

describe('Factura Electrónica - Pruebas E2E', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  // ---------------------------------------------------------------
  // Ejercicio 1: Primer test
  // ---------------------------------------------------------------
  describe('Ejercicio 1: Carga inicial', () => {
    it('muestra el título, el estado BORRADOR y la tabla vacía', () => {
      cy.get('[data-cy=titulo]').should('have.text', 'Factura Electrónica')
      cy.get('[data-cy=factura-numero]').should('have.text', 'BORRADOR')
      cy.get('[data-cy=tabla-vacia]').should('be.visible')
      cy.get('[data-cy=total-general]').should('have.text', 'Q 0.00')
    })
  })

  // ---------------------------------------------------------------
  // Ejercicio 2: Validaciones
  // ---------------------------------------------------------------
  describe('Ejercicio 2: Validaciones del formulario', () => {
    it('no permite emitir sin NIT', () => {
      cy.get('[data-cy=btn-emitir]').click()
      cy.get('[data-cy=mensaje]')
        .should('be.visible')
        .and('have.class', 'error')
        .and('contain.text', 'NIT válido')
    })

    it('no permite emitir sin nombre', () => {
      cy.get('[data-cy=cliente-nit]').type('1234567-8')
      cy.get('[data-cy=btn-emitir]').click()
      cy.get('[data-cy=mensaje]').should('contain.text', 'nombre del cliente es obligatorio')
    })

    it('no permite emitir sin productos', () => {
      cy.get('[data-cy=cliente-nit]').type('1234567-8')
      cy.get('[data-cy=cliente-nombre]').type('Ana López')
      cy.get('[data-cy=btn-emitir]').click()
      cy.get('[data-cy=mensaje]').should('contain.text', 'Agregue al menos un producto')
    })

    it('no permite agregar una cantidad inválida', () => {
      cy.get('[data-cy=producto-select]').select('Mochila - Q 250.00')
      cy.get('[data-cy=producto-cantidad]').clear().type('0')
      cy.get('[data-cy=btn-agregar]').click()
      cy.get('[data-cy=mensaje]').should('contain.text', 'La cantidad debe ser')
      cy.get('[data-cy=fila-item]').should('not.exist')
    })
  })

  // ---------------------------------------------------------------
  // Ejercicio 3: Consumidor Final
  // ---------------------------------------------------------------
  describe('Ejercicio 3: Consumidor Final', () => {
    it('al marcar CF el NIT se llena con "CF" y se deshabilita', () => {
      cy.get('[data-cy=cliente-cf]').check()
      cy.get('[data-cy=cliente-nit]').should('have.value', 'CF').and('be.disabled')

      cy.get('[data-cy=cliente-cf]').uncheck()
      cy.get('[data-cy=cliente-nit]').should('have.value', '').and('be.enabled')
    })
  })

  // ---------------------------------------------------------------
  // Ejercicio 4: Productos y totales
  // ---------------------------------------------------------------
  describe('Ejercicio 4: Agregar productos y calcular totales', () => {
    it('calcula subtotal, IVA y total', () => {
      cy.agregarProducto('Cuaderno universitario', 2)
      cy.agregarProducto('Calculadora científica', 1)

      cy.get('[data-cy=fila-item]').should('have.length', 2)
      cy.get('[data-cy=fila-item]').first().within(() => {
        cy.get('[data-cy=item-nombre]').should('have.text', 'Cuaderno universitario')
        cy.get('[data-cy=item-cantidad]').should('have.text', '2')
        cy.get('[data-cy=item-subtotal]').should('have.text', 'Q 50.00')
      })

      cy.get('[data-cy=total-subtotal]').should('have.text', 'Q 235.00')
      cy.get('[data-cy=total-iva]').should('have.text', 'Q 28.20')
      cy.get('[data-cy=total-general]').should('have.text', 'Q 263.20')
    })

    it('suma la cantidad si se agrega el mismo producto dos veces', () => {
      cy.agregarProducto('Lapicero azul', 2)
      cy.agregarProducto('Lapicero azul', 3)

      cy.get('[data-cy=fila-item]').should('have.length', 1)
      cy.get('[data-cy=item-cantidad]').should('have.text', '5')
      cy.get('[data-cy=item-subtotal]').should('have.text', 'Q 17.50')
    })

    it('elimina un producto y recalcula', () => {
      cy.agregarProducto('Mochila', 1)
      cy.agregarProducto('Resaltador', 4)

      cy.contains('[data-cy=fila-item]', 'Mochila').find('[data-cy=btn-eliminar]').click()

      cy.get('[data-cy=fila-item]').should('have.length', 1)
      cy.get('[data-cy=total-subtotal]').should('have.text', 'Q 27.00')
    })
  })

  // ---------------------------------------------------------------
  // Ejercicio 5: Cupones
  // ---------------------------------------------------------------
  describe('Ejercicio 5: Cupones de descuento', () => {
    beforeEach(() => {
      cy.agregarProducto('Cuaderno universitario', 2)
      cy.agregarProducto('Calculadora científica', 1)
    })

    it('aplica un cupón válido', () => {
      cy.get('[data-cy=cupon-input]').type('umg10')
      cy.get('[data-cy=btn-cupon]').click()

      cy.get('[data-cy=cupon-mensaje]').should('have.class', 'success').and('contain.text', 'UMG10')
      cy.get('[data-cy=total-descuento]').should('have.text', '- Q 23.50')
      cy.get('[data-cy=total-iva]').should('have.text', 'Q 25.38')
      cy.get('[data-cy=total-general]').should('have.text', 'Q 236.88')
    })

    it('rechaza un cupón inválido', () => {
      cy.get('[data-cy=cupon-input]').type('GRATIS')
      cy.get('[data-cy=btn-cupon]').click()

      cy.get('[data-cy=cupon-mensaje]').should('have.class', 'error').and('have.text', 'Cupón inválido')
      cy.get('[data-cy=total-descuento]').should('have.text', '- Q 0.00')
    })
  })

  // ---------------------------------------------------------------
  // Ejercicio 6: Emitir contra el backend simulado de Vite
  // ---------------------------------------------------------------
  describe('Ejercicio 6: Emitir factura (sin mock)', () => {
    it('emite la factura y bloquea el formulario', () => {
      cy.llenarCliente({ nit: 'CF', nombre: 'Consumidor de prueba' })
      cy.agregarProducto('Mochila', 1)
      cy.get('[data-cy=btn-emitir]').click()

      cy.get('[data-cy=mensaje]')
        .should('have.class', 'success')
        .and('contain.text', 'emitida correctamente')
      cy.get('[data-cy=factura-numero]').invoke('text').should('match', /^FAC-\d{4}$/)
      cy.get('[data-cy=cliente-nombre]').should('be.disabled')
      cy.get('[data-cy=btn-nueva]').should('be.visible')
    })
  })

  // ---------------------------------------------------------------
  // Ejercicio 7 y 8: Interceptar la API
  // ---------------------------------------------------------------
  describe('Ejercicio 7: Mock de la API (cy.intercept)', () => {
    it('envía los datos correctos y muestra el número devuelto por la API', () => {
      cy.intercept('POST', '/api/facturas', {
        statusCode: 201,
        body: { numero: 'FAC-9999' },
      }).as('crearFactura')

      cy.llenarCliente({ nit: '1234567-8', nombre: 'Ana López', direccion: 'Zona 1' })
      cy.agregarProducto('Cuaderno universitario', 2)
      cy.get('[data-cy=btn-emitir]').click()

      cy.wait('@crearFactura').then(({ request }) => {
        expect(request.body.cliente).to.deep.equal({
          nit: '1234567-8',
          nombre: 'Ana López',
          direccion: 'Zona 1',
        })
        expect(request.body.items).to.have.length(1)
        expect(request.body.items[0]).to.include({ nombre: 'Cuaderno universitario', cantidad: 2 })
        expect(request.body.totales.total).to.equal(56)
      })

      cy.get('[data-cy=factura-numero]').should('have.text', 'FAC-9999')
      cy.get('[data-cy=mensaje]').should('contain.text', 'Factura FAC-9999 emitida correctamente')
    })

    it('muestra "Emitiendo..." mientras espera la respuesta', () => {
      cy.intercept('POST', '/api/facturas', {
        delay: 1000,
        body: { numero: 'FAC-0001' },
      }).as('crearFactura')

      cy.llenarCliente({ nit: 'CF', nombre: 'Juan' })
      cy.agregarProducto('Resaltador', 1)
      cy.get('[data-cy=btn-emitir]').click()

      cy.get('[data-cy=btn-emitir]').should('be.disabled').and('have.text', 'Emitiendo...')
      cy.wait('@crearFactura')
      cy.get('[data-cy=btn-nueva]').should('be.visible')
    })
  })

  describe('Ejercicio 8: Errores del servidor', () => {
    it('muestra un error si la API responde 500 y permite reintentar', () => {
      cy.intercept('POST', '/api/facturas', { statusCode: 500 }).as('falla')

      cy.llenarCliente({ nit: 'CF', nombre: 'Juan' })
      cy.agregarProducto('Mochila', 1)
      cy.get('[data-cy=btn-emitir]').click()
      cy.wait('@falla')

      cy.get('[data-cy=mensaje]').should('have.class', 'error').and('contain.text', 'Error al emitir')
      cy.get('[data-cy=factura-numero]').should('have.text', 'BORRADOR')
      cy.get('[data-cy=btn-emitir]').should('be.enabled')
    })

    it('muestra un error si el catálogo no carga', () => {
      cy.intercept('GET', '/api/productos.json', { statusCode: 500 }).as('catalogo')
      cy.visit('/')
      cy.wait('@catalogo')
      cy.get('[data-cy=catalogo-error]').should('be.visible')
      cy.get('[data-cy=producto-select]').should('be.disabled')
    })
  })

  // ---------------------------------------------------------------
  // Ejercicio 9: Fixtures
  // ---------------------------------------------------------------
  describe('Ejercicio 9: Catálogo desde un fixture', () => {
    it('usa productos de prueba controlados', () => {
      cy.intercept('GET', '/api/productos.json', { fixture: 'productos.json' }).as('catalogo')
      cy.visit('/')
      cy.wait('@catalogo')

      cy.get('[data-cy=producto-select] option').should('have.length', 3) // opción vacía + 2
      cy.agregarProducto('Producto de prueba', 1)
      cy.get('[data-cy=total-general]').should('have.text', 'Q 112.00')
    })
  })

  // ---------------------------------------------------------------
  // Reto final: flujo completo de punta a punta
  // ---------------------------------------------------------------
  describe('Reto final: flujo E2E completo', () => {
    it('crea una factura con cupón, la emite y comienza una nueva', () => {
      cy.intercept('POST', '/api/facturas').as('crearFactura') // sin mock: solo espía

      cy.llenarCliente({ nit: '1234567-8', nombre: 'Ana López', direccion: 'Zona 10' })
      cy.agregarProducto('Cuaderno universitario', 2)
      cy.agregarProducto('Calculadora científica', 1)
      cy.agregarProducto('Lapicero azul', 3)
      cy.contains('[data-cy=fila-item]', 'Lapicero azul').find('[data-cy=btn-eliminar]').click()

      cy.get('[data-cy=cupon-input]').type('UMG10')
      cy.get('[data-cy=btn-cupon]').click()
      cy.get('[data-cy=total-general]').should('have.text', 'Q 236.88')

      cy.get('[data-cy=btn-emitir]').click()
      cy.wait('@crearFactura').its('response.statusCode').should('eq', 200)

      cy.get('[data-cy=mensaje]').should('have.class', 'success')
      cy.get('[data-cy=factura-numero]').should('not.have.text', 'BORRADOR')

      cy.get('[data-cy=btn-nueva]').click()
      cy.get('[data-cy=factura-numero]').should('have.text', 'BORRADOR')
      cy.get('[data-cy=tabla-vacia]').should('be.visible')
      cy.get('[data-cy=cliente-nombre]').should('have.value', '').and('be.enabled')
    })
  })
})
