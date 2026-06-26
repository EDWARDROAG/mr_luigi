# Historial de Usuario — Mr. Luigi

Bitácora de historias de usuario descubiertas durante desarrollo y pruebas.
Las entradas con estado **Pendiente** se asignan al equipo en sprints futuros.

---

## Formato

```markdown
### HU-XXX — Título
- **Fecha:** YYYY-MM-DD
- **Rol:** administrador | cajero | cliente
- **Estado:** Pendiente | En progreso | Hecho
- **Descripción:** Como [rol], quiero [acción] para [beneficio].
- **Criterios de aceptación:**
  - [ ] Criterio 1
- **Notas:** observaciones de pruebas
```

---

## Historias registradas en la migración inicial

### HU-001 — Puertos dedicados Mr. Luigi
- **Fecha:** 2026-06-23
- **Rol:** administrador
- **Estado:** Hecho
- **Descripción:** Como administrador del sistema, quiero que Mr. Luigi use puertos 3007 (API) y 5507 (frontend) para no conflictuar con otros proyectos.
- **Criterios de aceptación:**
  - [x] Backend escucha en 3007
  - [x] Frontend escucha en 5507
  - [x] Variables documentadas en environments

### HU-002 — Autenticación por roles
- **Fecha:** 2026-06-23
- **Rol:** administrador, cajero
- **Estado:** En progreso
- **Descripción:** Como usuario interno, quiero iniciar sesión con mi rol para acceder solo a las funciones permitidas.
- **Criterios de aceptación:**
  - [x] Login JWT contra `/api/auth/login`
  - [x] Guards de ruta por rol en Angular
  - [ ] Recuperación de contraseña (futuro)

### HU-003 — Vitrina pública (rol cliente)
- **Fecha:** 2026-06-23
- **Rol:** cliente
- **Estado:** En progreso
- **Descripción:** Como cliente, quiero navegar el catálogo gaming sin login para ver productos y contactar por WhatsApp.
- **Criterios de aceptación:**
  - [x] Rutas públicas sin autenticación
  - [ ] Catálogo conectado a API de productos
  - [ ] Identidad visual Luigi (no CoreX)

### HU-004 — Módulo de ventas POS
- **Fecha:** 2026-06-23
- **Rol:** cajero
- **Estado:** En progreso
- **Descripción:** Como cajero, quiero registrar ventas con efectivo o transferencia para actualizar inventario automáticamente.
- **Criterios de aceptación:**
  - [x] Pantalla POS base
  - [ ] Integración completa POST `/api/sales`
  - [ ] Comprobante PDF

### HU-005 — Inventario de productos
- **Fecha:** 2026-06-23
- **Rol:** administrador
- **Estado:** En progreso
- **Descripción:** Como administrador, quiero gestionar productos y categorías para mantener el catálogo actualizado.
- **Criterios de aceptación:**
  - [x] Pantalla de inventario base
  - [ ] CRUD completo con imágenes
  - [ ] Export CSV

### HU-006 — Cierre de caja
- **Fecha:** 2026-06-23
- **Rol:** administrador
- **Estado:** En progreso
- **Descripción:** Como administrador, quiero ver el cierre de caja diario por vendedor y método de pago.
- **Criterios de aceptación:**
  - [x] Pantalla de reportes base
  - [ ] Integración GET `/api/reports/cashier-closure`

### HU-007 — Área adicional (pendiente definición)
- **Fecha:** 2026-06-23
- **Rol:** TBD
- **Estado:** Pendiente
- **Descripción:** Módulo adicional por definir con el dueño del negocio.
- **Notas:** Dejar para fase posterior según indicación del cliente.

---

## Plantilla para nuevas historias

Copiar y completar al detectar necesidades en pruebas:

```markdown
### HU-XXX — Título
- **Fecha:** 
- **Rol:** 
- **Estado:** Pendiente
- **Descripción:** Como ..., quiero ... para ...
- **Criterios de aceptación:**
  - [ ] 
- **Notas:** 
```
