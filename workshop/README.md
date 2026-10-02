# 🧾 Taller: Pruebas E2E con Cypress sobre una Factura en React

En este taller vas a escribir, desde cero, una suite de pruebas **End-to-End (E2E)** con **Cypress** para una aplicación de facturación hecha en **React**.

Al terminar sabrás:

- Instalar y configurar Cypress en un proyecto existente.
- Seleccionar elementos de forma robusta con atributos `data-cy`.
- Interactuar con formularios (`type`, `select`, `check`, `click`) y hacer aserciones (`should`).
- Validar cálculos de negocio (subtotal, descuento, IVA, total).
- Interceptar y simular llamadas HTTP con `cy.intercept()` (mocks, errores y fixtures).
- Crear comandos personalizados para reutilizar pasos.
- Construir un flujo E2E completo de punta a punta.

> ⏱️ Duración estimada: 2 a 3 horas.

---

## 🛠️ 1. Requisitos previos

| Herramienta | Versión recomendada | Verificar con |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18 o superior (LTS) | `node -v` |
| npm | viene con Node | `npm -v` |
| [Visual Studio Code](https://code.visualstudio.com/) | cualquiera | — |
| Google Chrome (opcional) | cualquiera | — |

---

## 🚀 2. Instalar y ejecutar la aplicación

1. Abre la carpeta `workshop` en Visual Studio Code.
2. Abre una terminal (`Ver > Terminal` o `` Ctrl + ` ``) e instala las dependencias:

   ```bash
   npm install
   ```

3. Levanta la aplicación:

   ```bash
   npm run dev
   ```

4. Abre en el navegador: **http://localhost:5173**

> ⚠️ **Deja esta terminal abierta.** Cypress necesita que la aplicación esté corriendo para poder probarla. Para los siguientes pasos abre una **segunda terminal** (botón `+` en el panel de terminal).

> 💡 Si aparece `Port 5173 is already in use`, cierra el otro programa que usa ese puerto (por ejemplo, otro proyecto de Vite que tengas abierto).

---

## 🔍 3. Conoce la aplicación (prueba manual)

Antes de automatizar, **usa la aplicación como lo haría un usuario**. Dedica 10 minutos a explorarla:

| Sección | Qué hace |
|---|---|
| **Datos del cliente** | NIT, nombre y dirección. La casilla *Consumidor Final* llena el NIT con `CF` y lo bloquea. |
| **Agregar producto** | Un catálogo que se carga desde `GET /api/productos.json`. Se elige producto y cantidad. Si agregas el mismo producto dos veces, se suma la cantidad. |
| **Detalle** | Tabla con los productos. Cada fila tiene un botón ✕ para eliminar. |
| **Resumen** | Cupón de descuento, subtotal, descuento, IVA (12 %) y total. |
| **Emitir factura** | Valida el formulario y envía `POST /api/facturas`. Si todo sale bien muestra el número de factura (ej. `FAC-0001`) y bloquea el formulario. |

### Reglas de negocio

- **NIT**: obligatorio. Debe ser `CF` o un número como `1234567-8`.
- **Nombre**: obligatorio.
- Debe haber **al menos un producto**.
- La **cantidad** debe ser un número entero mayor a 0.
- **Cupones válidos**: `UMG10` (10 %) y `QA2026` (20 %). No distingue mayúsculas/minúsculas.
- **Cálculo**: `IVA = (subtotal − descuento) × 12 %` y `total = subtotal − descuento + IVA`.

### Catálogo

| Producto | Precio |
|---|---|
| Cuaderno universitario | Q 25.00 |
| Lapicero azul | Q 3.50 |
| Calculadora científica | Q 185.00 |
| Mochila | Q 250.00 |
| Resaltador | Q 6.75 |

### Selectores disponibles (`data-cy`)

Todos los elementos importantes tienen un atributo `data-cy`. Úsalos siempre en tus pruebas: `cy.get('[data-cy=btn-emitir]')`.

| Área | Selectores |
|---|---|
| Encabezado | `titulo`, `factura-numero`, `factura-fecha` |
| Cliente | `cliente-nit`, `cliente-cf`, `cliente-nombre`, `cliente-direccion` |
| Productos | `producto-select`, `producto-cantidad`, `btn-agregar`, `catalogo-error` |
| Tabla | `tabla-items`, `tabla-vacia`, `fila-item`, `item-nombre`, `item-cantidad`, `item-precio`, `item-subtotal`, `btn-eliminar` |
| Resumen | `cupon-input`, `btn-cupon`, `cupon-mensaje`, `total-subtotal`, `total-descuento`, `total-iva`, `total-general` |
| Acciones | `mensaje`, `btn-emitir`, `btn-nueva` |

> ❓ **¿Por qué `data-cy` y no clases o IDs?** Las clases CSS cambian cuando alguien rediseña la página; los textos cambian con traducciones. Un atributo dedicado a pruebas solo cambia si alguien lo cambia a propósito, así tus pruebas no se rompen por accidente.

---

## ⚙️ 4. Instalar y configurar Cypress

En la **segunda terminal** (dentro de `workshop`):

1. Instala Cypress como dependencia de desarrollo:

   ```bash
   npm install --save-dev cypress@13
   ```

2. Ábrelo por primera vez:

   ```bash
   npx cypress open
   ```

3. En la ventana de Cypress:
   - Elige **E2E Testing**.
   - Cypress te mostrará los archivos de configuración que va a crear (`cypress.config.js`, `cypress/support/...`, `cypress/fixtures/...`). Haz clic en **Continue**.
   - Elige un navegador (Chrome o Electron) y haz clic en **Start E2E Testing**.
   - Si te ofrece crear specs de ejemplo, elige **Create new spec** y nómbralo `cypress/e2e/factura.cy.js`.

4. Cierra Cypress y edita `cypress.config.js` para indicar dónde corre la aplicación:

   ```js
   import { defineConfig } from 'cypress'

   export default defineConfig({
     e2e: {
       baseUrl: 'http://localhost:5173',
       viewportWidth: 1000,
       viewportHeight: 900,
     },
   })
   ```

   > Con `baseUrl` configurada puedes escribir `cy.visit('/')` en lugar de la URL completa.

5. A partir de ahora puedes usar los scripts del proyecto:

   ```bash
   npm run cy:open   # interfaz gráfica (para escribir y depurar)
   npm run cy:run    # modo headless (como en un servidor de integración continua)
   ```

Tu estructura debería verse así:

```
workshop/
├── cypress/
│   ├── e2e/
│   │   └── factura.cy.js      ← aquí escribirás tus pruebas
│   ├── fixtures/
│   └── support/
│       ├── commands.js        ← aquí irán tus comandos personalizados
│       └── e2e.js
├── cypress.config.js
├── public/api/productos.json  ← "API" del catálogo
├── src/                       ← código de la aplicación React
└── package.json
```

---

## 🧪 5. Ejercicios

Escribe todo en `cypress/e2e/factura.cy.js`. Empieza con esta plantilla:

```js
describe('Factura Electrónica - Pruebas E2E', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  // Tus pruebas aquí
})
```

Guarda el archivo y observa cómo Cypress vuelve a ejecutar las pruebas automáticamente. **Haz clic sobre cada paso** en el panel izquierdo para ver cómo estaba la página en ese momento (*time travel*).

### 📘 Chuleta rápida

```js
cy.visit('/')                                   // abrir una página
cy.get('[data-cy=x]')                           // buscar un elemento
cy.contains('[data-cy=fila-item]', 'Mochila')   // buscar por texto
cy.get('[data-cy=x]').type('texto')             // escribir
cy.get('[data-cy=x]').clear()                   // borrar un input
cy.get('[data-cy=x]').click()                   // clic
cy.get('[data-cy=x]').check() / .uncheck()      // checkbox
cy.get('[data-cy=x]').select('Texto visible')   // <select>
cy.get('[data-cy=x]').within(() => { ... })     // buscar solo dentro de x

.should('be.visible')          .should('have.text', 'Q 0.00')
.should('contain.text', '...')  .should('have.value', 'CF')
.should('have.class', 'error')  .should('be.disabled') / ('be.enabled')
.should('have.length', 2)       .should('not.exist')
```

---

### Ejercicio 1 — Tu primer test 🟢

**Objetivo:** comprobar que la página carga correctamente.

Escribe un test que verifique que:
- El título (`titulo`) dice `Factura Electrónica`.
- El número de factura (`factura-numero`) dice `BORRADOR`.
- La tabla muestra el mensaje de vacío (`tabla-vacia`).
- El total general (`total-general`) es `Q 0.00`.

<details>
<summary>💡 Pista</summary>

```js
it('muestra el estado inicial', () => {
  cy.get('[data-cy=titulo]').should('have.text', 'Factura Electrónica')
  // ...continúa con los demás
})
```
</details>

---

### Ejercicio 2 — Validaciones 🟢

**Objetivo:** probar los caminos negativos (lo que el sistema **no** debe permitir).

Crea un `describe('Validaciones')` con un `it` para cada caso:

1. Clic en **Emitir** sin llenar nada → `mensaje` tiene la clase `error` y contiene `NIT válido`.
2. Con NIT pero sin nombre → `mensaje` contiene `nombre del cliente es obligatorio`.
3. Con NIT y nombre pero sin productos → `mensaje` contiene `Agregue al menos un producto`.
4. Seleccionar *Mochila* con cantidad `0` y clic en **Agregar** → aparece un error y **no** se agrega ninguna fila (`fila-item` no existe).

<details>
<summary>💡 Pista</summary>

- Para seleccionar una opción usa el texto visible completo: `.select('Mochila - Q 250.00')`.
- El input de cantidad ya trae un `1`: usa `.clear()` antes de `.type('0')`.
- Para comprobar que algo no existe: `.should('not.exist')`.
</details>

---

### Ejercicio 3 — Consumidor Final 🟢

**Objetivo:** probar un checkbox y el estado de otros campos.

1. Marca `cliente-cf` → el NIT debe tener el valor `CF` y estar deshabilitado.
2. Desmárcalo → el NIT debe quedar vacío y habilitado.

---

### Ejercicio 4 — Productos y totales 🟡

**Objetivo:** validar la lógica de negocio más importante: los cálculos.

1. Agrega **2 × Cuaderno universitario** y **1 × Calculadora científica**. Verifica:
   - Hay **2** filas (`fila-item`).
   - En la primera fila: nombre `Cuaderno universitario`, cantidad `2`, subtotal `Q 50.00`.
   - `total-subtotal` = `Q 235.00`, `total-iva` = `Q 28.20`, `total-general` = `Q 263.20`.
2. Agrega **2 × Lapicero azul** y luego otra vez **3 × Lapicero azul**. Verifica que hay **una sola** fila con cantidad `5` y subtotal `Q 17.50`.
3. Agrega **1 × Mochila** y **4 × Resaltador**, elimina la *Mochila* y verifica que queda 1 fila y el subtotal es `Q 27.00`.

<details>
<summary>💡 Pista</summary>

- Para trabajar dentro de la primera fila:
  ```js
  cy.get('[data-cy=fila-item]').first().within(() => {
    cy.get('[data-cy=item-cantidad]').should('have.text', '2')
  })
  ```
- Para eliminar la fila de un producto específico:
  ```js
  cy.contains('[data-cy=fila-item]', 'Mochila').find('[data-cy=btn-eliminar]').click()
  ```
- ¿Notas que repites mucho los pasos de "seleccionar + cantidad + agregar"? Eso lo resolveremos en el Ejercicio 10.
</details>

---

### Ejercicio 5 — Cupones 🟡

**Objetivo:** probar un camino feliz y uno negativo sobre la misma funcionalidad.

Usa un `beforeEach` dentro del `describe` para agregar **2 × Cuaderno** y **1 × Calculadora** antes de cada test.

1. Aplica el cupón `umg10` (en minúsculas) → `cupon-mensaje` tiene clase `success` y contiene `UMG10`. Verifica:
   - `total-descuento` = `- Q 23.50`
   - `total-iva` = `Q 25.38`
   - `total-general` = `Q 236.88`
2. Aplica el cupón `GRATIS` → `cupon-mensaje` dice exactamente `Cupón inválido` y el descuento es `- Q 0.00`.

> 🤔 **Reflexiona:** calcula a mano los valores esperados antes de escribir la prueba. Una prueba que copia el resultado que muestra la pantalla no está probando nada.

---

### Ejercicio 6 — Emitir la factura 🟡

**Objetivo:** probar el flujo completo contra el backend (simulado) del proyecto.

1. Marca *Consumidor Final*, escribe un nombre y agrega 1 *Mochila*.
2. Clic en **Emitir factura**.
3. Verifica:
   - `mensaje` tiene clase `success` y contiene `emitida correctamente`.
   - `factura-numero` tiene el formato `FAC-0000` (usa una expresión regular).
   - `cliente-nombre` está deshabilitado.
   - `btn-nueva` es visible.

<details>
<summary>💡 Pista</summary>

Para validar con una expresión regular:
```js
cy.get('[data-cy=factura-numero]').invoke('text').should('match', /^FAC-\d{4}$/)
```

¿Por qué no comparamos contra `FAC-0001`? Porque el backend genera un correlativo que aumenta cada vez que se emite una factura. **Las pruebas no deben depender de datos que cambian.** Eso nos lleva al siguiente ejercicio.
</details>

---

### Ejercicio 7 — Simular la API con `cy.intercept()` 🔴

**Objetivo:** controlar la respuesta del servidor y revisar qué datos envía la aplicación.

1. Antes de interactuar con la página, intercepta `POST /api/facturas` y responde con `{ numero: 'FAC-9999' }` y código `201`. Dale un alias con `.as('crearFactura')`.
2. Llena NIT `1234567-8`, nombre `Ana López`, dirección `Zona 1` y agrega **2 × Cuaderno universitario**.
3. Emite la factura y espera la petición con `cy.wait('@crearFactura')`.
4. Revisa el **cuerpo de la petición** (`request.body`):
   - `cliente` es `{ nit: '1234567-8', nombre: 'Ana López', direccion: 'Zona 1' }`.
   - `items` tiene 1 elemento con `nombre: 'Cuaderno universitario'` y `cantidad: 2`.
   - `totales.total` es `56`.
5. Verifica que la pantalla muestra `FAC-9999`.

**Extra:** agrega `delay: 1000` a la respuesta simulada y verifica que, mientras espera, el botón `btn-emitir` está deshabilitado y dice `Emitiendo...`.

<details>
<summary>💡 Pista</summary>

```js
cy.intercept('POST', '/api/facturas', {
  statusCode: 201,
  body: { numero: 'FAC-9999' },
}).as('crearFactura')

// ... llenar y emitir ...

cy.wait('@crearFactura').then(({ request }) => {
  expect(request.body.cliente).to.deep.equal({ /* ... */ })
  expect(request.body.items[0]).to.include({ nombre: 'Cuaderno universitario', cantidad: 2 })
})
```
</details>

---

### Ejercicio 8 — Errores del servidor 🔴

**Objetivo:** comprobar que la aplicación se comporta bien cuando el backend falla.

1. Intercepta `POST /api/facturas` respondiendo con `statusCode: 500`. Emite una factura válida y verifica:
   - `mensaje` tiene clase `error` y contiene `Error al emitir`.
   - `factura-numero` sigue diciendo `BORRADOR`.
   - `btn-emitir` está habilitado (el usuario puede reintentar).
2. Intercepta `GET /api/productos.json` con `statusCode: 500` **y luego** visita la página (`cy.visit('/')`). Verifica que `catalogo-error` es visible y `producto-select` está deshabilitado.

> ❓ ¿Por qué en el caso 2 hay que volver a hacer `cy.visit('/')`? Porque el `beforeEach` ya visitó la página y cargó el catálogo **antes** de que existiera tu intercept. El intercept debe registrarse **antes** de la petición.

---

### Ejercicio 9 — Fixtures 🔴

**Objetivo:** usar datos de prueba controlados en lugar de los datos reales.

1. Crea `cypress/fixtures/productos.json`:

   ```json
   [
     { "id": 10, "nombre": "Producto de prueba", "precio": 100 },
     { "id": 11, "nombre": "Otro producto", "precio": 0.5 }
   ]
   ```

2. Intercepta `GET /api/productos.json` respondiendo con `{ fixture: 'productos.json' }` y visita la página.
3. Verifica que el `<select>` tiene **3** opciones (la opción vacía + 2 productos).
4. Agrega 1 × *Producto de prueba* y verifica que el total es `Q 112.00`.

---

### Ejercicio 10 — Comandos personalizados ♻️

**Objetivo:** eliminar código repetido y hacer las pruebas más legibles.

En `cypress/support/commands.js` crea dos comandos:

```js
// Uso: cy.agregarProducto('Mochila', 2)
Cypress.Commands.add('agregarProducto', (nombre, cantidad = 1) => {
  // 1. seleccionar en producto-select la opción que contiene "nombre"
  // 2. limpiar producto-cantidad y escribir la cantidad
  // 3. clic en btn-agregar
})

// Uso: cy.llenarCliente({ nit: 'CF', nombre: 'Juan', direccion: 'Zona 1' })
Cypress.Commands.add('llenarCliente', ({ nit, nombre, direccion }) => {
  // si nit es 'CF' marcar cliente-cf, si no, escribir el NIT
  // escribir nombre y (si viene) dirección
})
```

Después **refactoriza** los ejercicios 4 a 9 para usar estos comandos. Las pruebas deben seguir pasando.

<details>
<summary>💡 Pista para seleccionar por nombre parcial</summary>

`.select()` necesita el texto completo o el `value`. Puedes buscar la opción por texto parcial y usar su `value`:

```js
cy.get('[data-cy=producto-select]')
  .find('option')
  .contains(nombre)
  .then(($opcion) => {
    cy.get('[data-cy=producto-select]').select($opcion.val())
  })
```
</details>

---

### 🏆 Reto final — Flujo E2E completo

Escribe **un solo test** que represente el recorrido completo de un usuario real, usando tus comandos personalizados:

1. Espía (sin simular) la petición `POST /api/facturas`: `cy.intercept('POST', '/api/facturas').as('crearFactura')`.
2. Llena el cliente: NIT `1234567-8`, nombre `Ana López`, dirección `Zona 10`.
3. Agrega 2 × Cuaderno universitario, 1 × Calculadora científica y 3 × Lapicero azul.
4. Elimina el Lapicero azul.
5. Aplica el cupón `UMG10` y verifica que el total es `Q 236.88`.
6. Emite la factura y verifica que la respuesta real tuvo `statusCode` `200`.
7. Verifica el mensaje de éxito y que `factura-numero` **ya no** dice `BORRADOR`.
8. Clic en **Nueva factura** y verifica que todo volvió al estado inicial (número `BORRADOR`, tabla vacía, nombre vacío y habilitado).

Ejecuta toda tu suite en modo headless y comprueba que todo pasa:

```bash
npm run cy:run
```

---

## ✅ 6. Lista de entrega

- [ ] Cypress instalado y `cypress.config.js` con `baseUrl`.
- [ ] Ejercicios 1 a 9 implementados en `cypress/e2e/factura.cy.js`.
- [ ] Comandos `agregarProducto` y `llenarCliente` en `cypress/support/commands.js`.
- [ ] Fixture `cypress/fixtures/productos.json`.
- [ ] Reto final implementado.
- [ ] `npm run cy:run` termina con **todas las pruebas en verde**.
- [ ] Captura de pantalla del resultado de `npm run cy:run`.

### 🎯 Retos adicionales (opcionales)

- Prueba el cupón `QA2026` (20 %) y calcula los valores esperados.
- Verifica que un NIT con letras (ej. `ABC123`) es rechazado.
- Prueba la aplicación en un viewport de celular: `cy.viewport('iphone-x')`.
- Configura la grabación de video (`video: true` en `cypress.config.js`) y revisa el resultado en `cypress/videos`.
- **Casos borde:** ¿qué pasa si escribes la cantidad `2.5`? ¿Y si aplicas un cupón y luego eliminas todos los productos? Escribe una prueba que documente el comportamiento esperado.

---

## 🧯 Solución de problemas

| Problema | Solución |
|---|---|
| `Cypress could not verify that this server is running` | La app no está corriendo. Ejecuta `npm run dev` en otra terminal. |
| `Port 5173 is already in use` | Otro programa usa el puerto. Ciérralo, o cambia el puerto en `vite.config.js` **y** en la `baseUrl` de `cypress.config.js`. |
| `Cypress failed to start` / `bad option: --smoke-test` | Ejecuta Cypress desde una terminal normal (PowerShell/CMD), no desde una herramienta que establezca `ELECTRON_RUN_AS_NODE`. Si persiste: `npx cypress install --force`. |
| `cy.agregarProducto is not a function` | Verifica que `cypress/support/e2e.js` tenga `import './commands'`. |
| Un test pasa en la interfaz pero falla en `cy:run` | Revisa que no dependas de datos de otro test. Cada `it` debe poder ejecutarse solo. |

---

## 👩‍🏫 Para el instructor

La carpeta [`solucion/`](solucion/) contiene una solución de referencia (18 pruebas) con el spec, los comandos personalizados, el fixture y la configuración. Para usarla, copia su contenido dentro de `workshop/` (después de instalar Cypress) y ejecuta `npm run cy:run` con la app corriendo.

> Se recomienda **no distribuir** la carpeta `solucion/` a los alumnos hasta terminar el taller.
