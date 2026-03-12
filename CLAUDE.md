# CLAUDE.md — BALAMYA (Sistema Veterinario de Zoológico)

## Descripción del Proyecto

BALAMYA es un sistema de gestión veterinaria para zoológico. Aplicación frontend SPA con React. Todos los datos de pacientes/animales se manejan con datos mock en el frontend. La autenticación es local con roles hardcodeados. No hay backend.

---

## Stack Tecnológico

- **Frontend:** React 18.2.0 + Vite 7.3.1 + React Router DOM 7.11.0
- **Estilos:** Tailwind CSS 4.1.18 + CSS Modules (convención: `NombreComponente.module.css`)
- **Gráficas:** Recharts 3.7.0
- **PDF:** jsPDF 4.2.0 + jspdf-autotable 5.0.7
- **Íconos:** React Icons 5.5.0
- **Auth:** localStorage con roles mock en AuthContext

---

## Comandos

```bash
npm run client         # Dev server (Vite, puerto 3000)
npm run build          # Build de producción
npm run preview        # Preview del build
```

---

## Estructura Actual del Proyecto

```
BALAMYA-main/
├── src/
│   ├── App.js                 # Router principal (20+ rutas)
│   ├── index.js               # Entry React
│   ├── index.css              # CSS global base
│   ├── assets/                # Imágenes (logo_zoo.png, unnamed.png)
│   ├── context/AuthContext.js  # Auth global: login, logout, roles
│   ├── hooks/                 # useFormState, useFormsPage, useSidebar
│   ├── data/mockData.js       # TODA la data de animales/pacientes
│   ├── pages/                 # 18 páginas
│   ├── components/
│   │   ├── common/            # FiltersBar, RecordsTable, Modal, etc.
│   │   ├── dashboard/         # Formularios médicos, tarjetas, gráficas (15+ archivos mezclados)
│   │   └── layout/            # MainLayout, Sidebar, Topbar
│   ├── features/clinical/     # Intento de reorganización abandonado (1 archivo)
│   ├── styles/                # ~40 archivos CSS Modules + CSS global (carpeta plana)
│   └── utils/                 # 8 exportadores PDF
├── index.html                 # Entry point Vite
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## Roles y Permisos

- **admin** — Acceso total
- **veterinarian** — Con especialidades: aves, mamiferos, reptiles, anfibios
- **assistant** — Acceso limitado

---

## Reglas para Claude Code

### Convenciones de Código

- Componentes React: PascalCase (`PatientCard.js`)
- Hooks: camelCase con prefijo `use` (`useFormState.js`)
- CSS Modules: `NombreComponente.module.css`
- Utils: camelCase descriptivo (`exportAnesthesiaPDF.js`)
- Páginas: PascalCase con sufijo `Page` (`DashboardPage.js`)
- Formularios: PascalCase con sufijo `Form` (`TreatmentForm.js`)

### Reglas de Estilo

- Usar CSS Modules (`.module.css`) siempre. NO crear archivos `.css` globales nuevos
- Tailwind solo para utilidades rápidas (spacing, flex, grid). Estilos complejos van en CSS Modules
- No mezclar CSS global con CSS Modules en un mismo componente
- Imports con rutas relativas desde el componente
- CSS Modules compartidos (sin componente JS propio, usados por 3+ archivos) van en `src/styles/shared/` nombrados por lo que hacen, no por quién los usa
- PROHIBIDO importar el CSS Module de otro componente o página. Si necesitas esas clases, extráelas a un CSS compartido en `styles/shared/`

### Reglas de Arquitectura

- Cada componente (nuevo y existente) debe vivir en su propia carpeta con su CSS Module al lado
- Los datos de animales/pacientes viven en `mockData.js`. Si se agregan nuevos datos, agregarlos ahí siguiendo la misma estructura
- Cualquier formulario nuevo debe usar el hook `useFormState.js`
- Los exportadores PDF siguen el patrón `exportNombrePDF.js` en `src/utils/`
- El AuthContext es la única fuente de verdad para sesión y roles
- No hay backend en este repositorio. El backend será un proyecto separado
- Toda comunicación con el backend se hará a través de la carpeta `src/services/`
- Cada feature que necesite datos del backend tendrá su propio archivo de servicio (ej: `services/patientsService.js`)
- Los servicios usan una instancia centralizada de API client en `services/api.js` (con baseURL configurable por variable de entorno, usando fetch nativo — NO instalar axios)
- Mientras no exista el backend, los servicios pueden retornar datos de `mockData.js` como fallback
- NUNCA hacer fetch() directamente desde un componente o página. Siempre pasar por un servicio

---

## Zonas Críticas — Entender Antes de Tocar

| Archivo | Riesgo | Por qué |
|---------|--------|---------|
| `src/components/common/FiltersBar.js` | Alto | Filtros complejos, estado pesado, portal DOM. No tiene CSS propio, usa PatientsPage.module.css |
| `src/hooks/useFormsPage.js` | Alto | 5+ estados, params de URL, flujo de navegación |
| `src/pages/FormsPage.js` | Alto | Orquesta selección animal + 10+ formularios cross-feature |
| `src/pages/HospitalizationPage.js` | Alto | Ingresos, seguimiento y altas en un solo archivo |
| `src/styles/HospitalizationPage.module.css` | Alto | Lo importan 6 archivos de 5 features distintas como CSS compartido |
| `src/components/dashboard/AnesthesiaForm.js` | Medio-alto | Multi-hoja con protocolo complejo |
| `src/context/AuthContext.js` | Medio | Auth mock con roles hardcodeados |
| `src/data/mockData.js` | Medio | Fuente de verdad de TODO el frontend |

---

## Zonas "No Tocar" (sin autorización explícita)

- `.env` — Variables de entorno
- `.github/workflows/deploy.yml` — Pipeline de deploy activo
- `package-lock.json` — No modificar manualmente

---

## Cross-CSS-Imports Conocidos (resolver en Fase 2)

Todos estos imports cruzan boundaries y deben resolverse ANTES de mover archivos:

| Archivo que importa | CSS que importa | Clases que usa | Solución |
|---------------------|-----------------|----------------|----------|
| 6 archivos de 5 features | HospitalizationPage.module.css | Múltiples clases de layout | Renombrar → styles/shared/ModulePage.module.css |
| 7 componentes | Card.module.css | Clases de tarjetas | Mover → styles/shared/Card.module.css |
| 4 páginas | CustomTable.module.css | Clases de tablas | Mover → styles/shared/CustomTable.module.css |
| FiltersBar.js | PatientsPage.module.css | Clases de filtros | Extraer → crear FiltersBar.module.css propio |
| RecordsTable.js | PatientGrid.module.css | Clases de paginación | Extraer → styles/shared/Pagination.module.css |
| MedicalHistoryPage.js | PatientsPage.module.css | `patients-page-header-row`, `view-toggle-btn` | Extraer → styles/shared/PageHeader.module.css |
| DewormingPage.js | RecordsTable.module.css | Clases de tabla directamente | Extraer clases usadas → styles/shared/ o confirmar si es aceptable desde common/ |
| VaccinationsPage.js | RecordsTable.module.css | Clases de tabla directamente | Extraer clases usadas → styles/shared/ o confirmar si es aceptable desde common/ |
| Topbar.js | Modal.module.css | Clases de modal para logout | Extraer clases usadas → Topbar.module.css propio |
| GroupTreatmentForm.js | TreatmentForm.module.css | 18 clases del formulario | Mover GroupTreatmentForm.js dentro de TreatmentForm/ para compartir el mismo CSS |

---

## Deuda Técnica Conocida (ordenada por prioridad)

1. **Cross-CSS-imports:** 9 imports cruzados documentados arriba que deben resolverse
2. **CSS no-Module:** ErrorBoundary.css y NecropsyReportForm.css son .css planos que deben renombrarse a .module.css
3. **CSS compartido disfrazado:** HospitalizationPage.module.css, Card.module.css y CustomTable.module.css son compartidos por múltiples features
4. **Organización:** `components/dashboard/` tiene 15+ archivos sin subcategorizar
5. **Organización:** 40 archivos CSS en carpeta `styles/` plana, separados de sus componentes
6. **Organización:** `features/clinical/` tiene 1 solo archivo (reorganización abandonada)
7. **Limpieza:** 8+ archivos de logs de build en la raíz del proyecto
8. **Limpieza:** Archivos sueltos en raíz (`.git_head_*.js`, `.git_history_*.txt`)
9. **Limpieza:** Carpeta `backend/` que ya no se usa
10. **Limpieza:** LoginPage.module.css está vacío (solo un comentario roto)
11. **Calidad:** 0 tests, 0% cobertura, sin framework de testing configurado
12. **Complejidad:** `App.js` con 20+ rutas en un solo archivo

---

## Plan de Rescalamiento (fases sugeridas)

### Fase 1 — Limpieza y Eliminación de Backend
- Eliminar la carpeta `backend/` completa (server.js, models/, routes/)
- Eliminar el archivo `backend/.env`
- Eliminar dependencias de backend del package.json: express, mongoose, dotenv, nodemon, concurrently, cors
- Eliminar scripts de backend del package.json: `npm start` (concurrently), `dev:server`
- Eliminar cualquier import o referencia a endpoints API en el frontend (ej: fetch a localhost:5000 en AuthContext.js)
- CRÍTICO: AuthContext.js tiene un fetch('http://localhost:5000/api/auth/login') activo que rompe el login. Reemplazar por auth 100% mock/local
- Borrar imports huérfanos de RecordsTable.module.css en DewormingPage.js y VaccinationsPage.js (no usan ninguna clase de ese import)
- Eliminar archivos basura de la raíz: build.log, build2.log, build3.log, build4.log, build_error.log, build_output.log, build_output.txt, build_utf8.log, build2_utf8.log, build3_utf8.log, build4_utf8.log
- Eliminar archivos sueltos de la raíz: .git_head_GroupTreatmentForm.js, .git_head_TreatmentForm.js, .git_history_treatment.txt
- Eliminar eslint_report.txt (vacío)
- Eliminar LoginPage.module.css (vacío, solo comentario roto)
- Evaluar si ROLES_CONTEXT.md sigue siendo útil o se puede eliminar
- Ejecutar `npm install` después de limpiar package.json para regenerar el lock file
- Verificar que `npm run client` sigue funcionando después de toda la limpieza

### Fase 2 — Resolver CSS Compartidos y Cross-Imports (ANTES de mover archivos)
- Crear carpeta `src/styles/shared/`
- Mover y renombrar HospitalizationPage.module.css → styles/shared/ModulePage.module.css. Actualizar los 6 imports
- Mover Card.module.css → styles/shared/Card.module.css. Verificar los 7 imports
- Mover CustomTable.module.css → styles/shared/CustomTable.module.css. Verificar los 4 imports
- Extraer clases de paginación de PatientGrid.module.css → styles/shared/Pagination.module.css. Actualizar import en RecordsTable.js
- Extraer clases de FiltersBar de PatientsPage.module.css → crear FiltersBar.module.css propio
- Extraer `patients-page-header-row` y `view-toggle-btn` de PatientsPage.module.css → styles/shared/PageHeader.module.css. Actualizar import en MedicalHistoryPage.js
- Resolver DewormingPage.js y VaccinationsPage.js que importan RecordsTable.module.css directamente: extraer las clases a styles/shared/ o decidir si importar desde common/ es aceptable
- Resolver Topbar.js que importa Modal.module.css: extraer las clases que usa a Topbar.module.css
- Resolver GroupTreatmentForm.js que importa TreatmentForm.module.css: mover GroupTreatmentForm.js dentro de la carpeta TreatmentForm/ para compartir el mismo CSS (misma feature, mismo diseño, cero duplicación)
- Mover FormButtons.module.css → features/treatments/components/TreatmentForm/ (solo lo usa TreatmentForm)
- Renombrar NecropsyReportForm.css → NecropsyReportForm.module.css y actualizar import en NecropsyReportForm.js
- Renombrar ErrorBoundary.css → ErrorBoundary.module.css y actualizar import en ErrorBoundary.js de `import './ErrorBoundary.css'` a `import styles from './ErrorBoundary.module.css'`
- Mover FloatingActions.css → styles/ global
- Verificar que `npm run client` funciona después de cada cambio

### Fase 3 — Reorganización de Estructura
- Seguir ESTRUCTURA_PROPUESTA.md v4 para mover todos los archivos
- Colocar cada CSS Module junto a su componente
- Subcategorizar `components/dashboard/` distribuyendo en features/
- Crear app/App.js + app/routes.js
- Eliminar carpetas vacías que queden (pages/, components/dashboard/, styles/ parcial, features/clinical/forms/)
- Verificar que `npm run client` funciona después de la reorganización completa

### Fase 4 — Testing
- Configurar Vitest (compatible con Vite)
- Tests unitarios para hooks y utils
- Tests de componentes para formularios críticos

---

## Notas para Claude Code

- Siempre hacer `git diff` después de cada cambio para verificar que no hubo efectos colaterales
- Antes de refactorizar un componente, revisar qué páginas lo importan
- El archivo `mockData.js` es la fuente de datos de TODO el frontend. No eliminar ni reestructurar sin verificar todas las dependencias
- Los formularios tienen lógica de exportación PDF acoplada. Si se mueve un formulario, verificar su exportador en `utils/`
- El `App.js` necesita eventualmente dividirse, pero es el punto central de routing. Cambios ahí afectan toda la app
- NO hay backend. No crear servidores, endpoints, ni conexiones a base de datos
- Los estilos de Sidebar están dentro de MainLayout.module.css, no tiene CSS propio
- ANTES de mover cualquier archivo CSS, hacer grep para verificar todos sus consumidores
- La Fase 2 (CSS compartidos) DEBE completarse antes de la Fase 3 (reorganización) para evitar imports rotos
- Todos los cross-CSS-imports documentados en la tabla de arriba DEBEN resolverse en Fase 2
