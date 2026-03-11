# Estructura Propuesta — BALAMYA (v4 final)

## Principios

1. **Organización por feature/dominio**: Cada módulo veterinario tiene su propia carpeta
2. **CSS Module junto a su componente**: Nada de carpeta styles/ plana (excepto globales y shared)
3. **Cada componente en su propia carpeta**: ComponentName/ComponentName.js + ComponentName.module.css
4. **Shared vs Feature**: Si un componente lo usan 2+ features, va en components/. Si es de una sola feature, va dentro de esa feature.
5. **CSS compartido sin JS**: Si un CSS Module es importado por 3+ archivos sin tener componente JS propio, va en styles/shared/
6. **Cero cross-CSS-imports**: Ningún archivo debe importar el CSS Module de otro componente o página. Si necesita esas clases, se extraen a styles/shared/

---

## Correcciones acumuladas (v1 → v2 → v3 → v4)

| # | Problema | Corrección |
|---|----------|------------|
| 1 | AnimalSelector lo usan 6+ features | Movido a components/common/ |
| 2 | Profile tenía 4 sub-componentes sin JS | Los 5 CSS van juntos en features/profile/pages/, sin subcarpetas components/ |
| 3 | PatientRow.module.css sin destino | Ubicado en PatientList/ como sub-componente |
| 4 | StatCard.module.css sin destino | Ubicado en StatGrid/ como sub-componente |
| 5 | Card.module.css usado por 7 archivos sin JS | Movido a styles/shared/ |
| 6 | CustomTable.module.css usado por 4 archivos sin JS | Movido a styles/shared/ |
| 7 | HospitalizationPage.module.css usado por 6 archivos de 5 features | Renombrado a ModulePage.module.css y movido a styles/shared/ |
| 8 | FiltersBar no tiene CSS propio, usa PatientsPage.module.css | Crear FiltersBar.module.css extrayendo las clases relevantes |
| 9 | RecordsTable usa clases de PatientGrid.module.css | Extraer clases de paginación a styles/shared/Pagination.module.css |
| 10 | FormButtons.module.css solo lo usa TreatmentForm | Movido dentro de TreatmentForm/ |
| 11 | LoginPage.module.css está vacío | Eliminar, no incluir en estructura |
| 12 | NecropsyReportForm.css no es Module | Renombrar a .module.css y actualizar imports |
| 13 | FloatingActions.css no es Module | Mantener en styles/ global |
| 14 | Sidebar no tiene CSS propio | Estilos en MainLayout.module.css, nota agregada |
| 15 | ErrorBoundary.css no es Module (faltaba en v3) | Renombrar a .module.css y actualizar import de `import './ErrorBoundary.css'` a `import styles from './ErrorBoundary.module.css'` |
| 16 | MedicalHistoryPage.js importa PatientsPage.module.css (faltaba en v3) | Extraer `patients-page-header-row` y `view-toggle-btn` a styles/shared/PageHeader.module.css |
| 17 | DewormingPage.js y VaccinationsPage.js importan RecordsTable.module.css directamente (faltaba en v3) | Extraer las clases usadas a styles/shared/ o confirmar si importar desde common/ es aceptable |
| 18 | Topbar.js importa Modal.module.css para modal de logout (faltaba en v3) | Extraer las clases usadas a Topbar.module.css propio |
| 19 | GroupTreatmentForm.js importa TreatmentForm.module.css (faltaba en v4) | Crear GroupTreatmentForm.module.css propio, o mover GroupTreatmentForm dentro de TreatmentForm/ si comparten todo el CSS |

---

## Estructura Objetivo

```
src/
│
├── app/
│   ├── App.js                          # Solo renderiza <RouterProvider> o <Routes>
│   └── routes.js                       # Configuración centralizada de rutas
│
├── assets/
│   ├── logo_zoo.png
│   └── unnamed.png
│
├── components/                          # SOLO componentes compartidos (usados por 2+ features)
│   ├── common/
│   │   ├── AnimalSelector/              # Compartido por 6+ features
│   │   │   ├── AnimalSelector.js
│   │   │   └── AnimalSelector.module.css
│   │   ├── CategoryTabs/
│   │   │   ├── CategoryTabs.js
│   │   │   └── CategoryTabs.module.css
│   │   ├── FiltersBar/
│   │   │   ├── FiltersBar.js
│   │   │   └── FiltersBar.module.css    # CREAR: extraer clases de PatientsPage.module.css
│   │   ├── Modal/
│   │   │   ├── Modal.js
│   │   │   └── Modal.module.css
│   │   ├── RecordsTable/
│   │   │   ├── RecordsTable.js
│   │   │   └── RecordsTable.module.css
│   │   ├── ImageUploader/
│   │   │   ├── ImageUploader.js
│   │   │   └── ImageUploader.module.css
│   │   ├── MedicalActivityChart/
│   │   │   └── MedicalActivityChart.js
│   │   └── ErrorBoundary/
│   │       ├── ErrorBoundary.js
│   │       └── ErrorBoundary.module.css # RENOMBRAR de .css a .module.css
│   └── layout/
│       ├── MainLayout/
│       │   ├── MainLayout.js
│       │   └── MainLayout.module.css    # Incluye estilos de Sidebar
│       ├── Sidebar/
│       │   ├── Sidebar.js
│       │   └── sidebar.config.js        # Sin CSS propio, estilos en MainLayout.module.css
│       └── Topbar/
│           ├── Topbar.js
│           └── Topbar.module.css        # Agregar clases de modal que actualmente importa de Modal.module.css
│
├── context/
│   └── AuthContext.js
│
├── data/
│   └── mockData.js
│
├── hooks/                               # SOLO hooks compartidos
│   ├── useFormState.js
│   ├── useFormsPage.js
│   └── useSidebar.js
│
├── services/                            # Capa de comunicación con el backend (APIs)
│   ├── api.js                           # Instancia centralizada de axios/fetch con baseURL desde .env
│   ├── authService.js                   # login(), logout(), getCurrentUser()
│   ├── patientsService.js               # getPatients(), getPatientById(), createPatient()
│   ├── treatmentsService.js             # getTreatments(), createTreatment()
│   ├── hospitalizationService.js        # getAdmissions(), createAdmission(), discharge()
│   ├── vaccinationsService.js           # getVaccinations(), createVaccination()
│   ├── dewormingService.js              # getDewormings(), createDeworming()
│   ├── clinicalService.js               # getClinicalReviews(), createReview()
│   ├── anesthesiaService.js             # getAnesthesiaRecords(), createRecord()
│   └── labService.js                    # getLabResults(), createLabResult()
│   # Por ahora cada servicio retorna datos de mockData.js
│   # Cuando el backend esté listo, solo se cambia la implementación aquí
│
├── styles/
│   ├── index.css                        # CSS global (resets, fonts) — actualizar import en index.js
│   ├── App.css                          # CSS global de App
│   ├── FloatingActions.css              # CSS global sin Module
│   └── shared/                          # CSS Modules compartidos SIN componente JS propio
│       ├── Card.module.css              # Usado por 7 componentes (tarjetas genéricas)
│       ├── CustomTable.module.css       # Usado por 4 páginas (tablas de módulos)
│       ├── ModulePage.module.css        # RENOMBRAR de HospitalizationPage.module.css — usado por 6 archivos
│       ├── Pagination.module.css        # EXTRAER de PatientGrid.module.css — clases de paginación usadas por RecordsTable
│       └── PageHeader.module.css        # EXTRAER de PatientsPage.module.css — clases patients-page-header-row y view-toggle-btn usadas por MedicalHistoryPage
│
│
│   ╔══════════════════════════════════════════════════════════════╗
│   ║                    FEATURES (por dominio)                   ║
│   ║  Cada feature contiene: pages/, components/, utils/         ║
│   ╚══════════════════════════════════════════════════════════════╝
│
├── features/
│   │
│   ├── auth/                            # ── Autenticación ──
│   │   └── pages/
│   │       ├── LoginPage.js             # Usa Tailwind puro, sin CSS Module
│   │       └── RegisterPage.js
│   │
│   ├── dashboard/                       # ── Dashboard principal ──
│   │   ├── components/
│   │   │   ├── StatGrid/
│   │   │   │   ├── StatGrid.js
│   │   │   │   ├── StatGrid.module.css
│   │   │   │   └── StatCard.module.css  # Sub-componente de StatGrid
│   │   │   └── HealthChart/
│   │   │       ├── HealthChart.js
│   │   │       └── HealthChart.module.css
│   │   └── pages/
│   │       ├── DashboardPage.js
│   │       └── DashboardPage.module.css
│   │
│   ├── patients/                        # ── Gestión de animales/pacientes ──
│   │   ├── components/
│   │   │   ├── PatientCard/
│   │   │   │   ├── PatientCard.js
│   │   │   │   └── PatientCard.module.css
│   │   │   ├── PatientGrid/
│   │   │   │   ├── PatientGrid.js
│   │   │   │   └── PatientGrid.module.css  # Después de extraer clases de paginación a shared/
│   │   │   └── PatientList/
│   │   │       ├── PatientList.js
│   │   │       ├── PatientList.module.css
│   │   │       └── PatientRow.module.css # Sub-componente de PatientList
│   │   └── pages/
│   │       ├── PatientsPage.js
│   │       ├── PatientsPage.module.css   # Después de extraer clases de FiltersBar y PageHeader a shared/
│   │       ├── PatientDetailsPage.js
│   │       └── PatientDetails.module.css
│   │
│   ├── treatments/                      # ── Tratamientos ──
│   │   ├── components/
│   │   │   ├── TreatmentForm/
│   │   │   │   ├── TreatmentForm.js
│   │   │   │   ├── TreatmentForm.module.css
│   │   │   │   └── FormButtons.module.css  # Solo lo usa TreatmentForm
│   │   │   └── GroupTreatmentForm/
│   │   │       ├── GroupTreatmentForm.js
│   │   │       └── GroupTreatmentForm.module.css  # CREAR: extraer clases de TreatmentForm.module.css, o mover dentro de TreatmentForm/
│   │   ├── pages/
│   │   │   └── TreatmentsPage.js
│   │   └── utils/
│   │       └── exportTreatmentPDF.js
│   │
│   ├── hospitalization/                 # ── Hospitalización ──
│   │   ├── components/
│   │   │   ├── HospFollowUpForm/
│   │   │   │   ├── HospFollowUpForm.js
│   │   │   │   └── HospFollowUpForm.module.css
│   │   │   ├── HospitalRecordModal/
│   │   │   │   ├── HospitalRecordModal.js
│   │   │   │   └── HospitalRecordModal.module.css
│   │   │   └── NotificacionAltaForm/
│   │   │       ├── NotificacionAltaForm.js
│   │   │       └── NotificacionAltaForm.module.css
│   │   ├── pages/
│   │   │   └── HospitalizationPage.js   # Usa styles/shared/ModulePage.module.css
│   │   └── utils/
│   │       ├── exportHospFollowUpPDF.js
│   │       └── exportNotificacionAltaPDF.js
│   │
│   ├── vaccinations/                    # ── Vacunaciones ──
│   │   ├── components/
│   │   │   └── VaccinationForm/
│   │   │       ├── VaccinationForm.js
│   │   │       └── VaccinationForm.module.css
│   │   ├── pages/
│   │   │   └── VaccinationsPage.js      # Resolver: actualmente importa RecordsTable.module.css directamente
│   │   └── utils/
│   │       └── exportVaccinationPDF.js
│   │
│   ├── deworming/                       # ── Desparasitaciones ──
│   │   ├── components/
│   │   │   └── DewormingCalendar/
│   │   │       ├── DewormingCalendar.js
│   │   │       └── DewormingCalendar.module.css
│   │   ├── pages/
│   │   │   └── DewormingPage.js         # Resolver: actualmente importa RecordsTable.module.css directamente
│   │   └── utils/
│   │       └── exportDewormingPDF.js
│   │
│   ├── clinical/                        # ── Revisiones clínicas ──
│   │   ├── components/
│   │   │   └── ClinicalReviewForm/
│   │   │       ├── ClinicalReviewForm.js
│   │   │       ├── ClinicalHelpers.js
│   │   │       ├── NormalAvesReviewVariant.js
│   │   │       └── ReptilesReviewVariant.js
│   │   ├── pages/
│   │   │   ├── ClinicalReviewsPage.js
│   │   │   └── ClinicalReviewRoute.js
│   │   └── utils/
│   │       └── exportClinicalReviewPDF.js
│   │
│   ├── anesthesia/                      # ── Anestesia ──
│   │   ├── components/
│   │   │   └── AnesthesiaForm/
│   │   │       ├── AnesthesiaForm.js
│   │   │       ├── AnesthesiaForm.module.css
│   │   │       ├── AnesthesiaSheet1.js
│   │   │       └── AnesthesiaSheet2.js
│   │   ├── pages/
│   │   │   └── AnesthesiaPage.js
│   │   └── utils/
│   │       └── exportAnesthesiaPDF.js
│   │
│   ├── lab/                             # ── Laboratorio ──
│   │   └── pages/
│   │       └── LabPage.js
│   │
│   ├── welfare/                         # ── Bienestar animal ──
│   │   └── pages/
│   │       └── WelfarePage.js
│   │
│   ├── necropsy/                        # ── Necropsias (sin página propia, se accede desde FormsPage) ──
│   │   ├── components/
│   │   │   └── NecropsyReportForm/
│   │   │       ├── NecropsyReportForm.js
│   │   │       └── NecropsyReportForm.module.css  # RENOMBRAR de .css a .module.css
│   │   └── utils/
│   │       └── exportNecropsyReportPDF.js
│   │
│   ├── medical-history/                 # ── Historial médico ──
│   │   └── pages/
│   │       ├── MedicalHistoryPage.js    # Después de resolver: usa PageHeader.module.css de shared/ en vez de PatientsPage.module.css
│   │       └── MedicalHistoryPage.module.css
│   │
│   ├── forms/                           # ── Hub de formularios (cross-feature por diseño) ──
│   │   └── pages/
│   │       ├── FormsPage.js
│   │       └── FormsPage.module.css
│   │
│   ├── reports/                         # ── Reportes ──
│   │   └── pages/
│   │       └── ReportsPage.js
│   │
│   ├── notifications/                   # ── Notificaciones ──
│   │   └── pages/
│   │       ├── NotificationsPage.js
│   │       └── NotificationsPage.module.css
│   │
│   └── profile/                         # ── Perfil de usuario ──
│       └── pages/                       # Sin subcarpetas components/, ProfilePage importa los 5 CSS directamente
│           ├── ProfilePage.js
│           ├── ProfilePage.module.css
│           ├── ProfileHeader.module.css
│           ├── ProfileHero.module.css
│           ├── ProfileSettings.module.css
│           └── ProfileStats.module.css
│
└── index.js                             # Entry point React
```

---

## Tareas de Migración Especiales (Fase 2)

| # | Tarea | Detalle |
|---|-------|---------|
| 1 | Renombrar `NecropsyReportForm.css` → `.module.css` | Cambiar import en NecropsyReportForm.js a `import styles from './NecropsyReportForm.module.css'` y actualizar clases a `styles.className` |
| 2 | Renombrar `ErrorBoundary.css` → `.module.css` | Cambiar import en ErrorBoundary.js de `import './ErrorBoundary.css'` a `import styles from './ErrorBoundary.module.css'` y actualizar clases |
| 3 | Mover `src/index.css` → `src/styles/index.css` | Actualizar el import en `src/index.js` |
| 4 | Renombrar `HospitalizationPage.module.css` → `ModulePage.module.css` | Mover a styles/shared/ y actualizar los 6 imports |
| 5 | Extraer clases de paginación de `PatientGrid.module.css` | Crear styles/shared/Pagination.module.css, actualizar import en RecordsTable.js |
| 6 | Extraer clases de FiltersBar de `PatientsPage.module.css` | Crear components/common/FiltersBar/FiltersBar.module.css |
| 7 | Extraer `patients-page-header-row` y `view-toggle-btn` de `PatientsPage.module.css` | Crear styles/shared/PageHeader.module.css, actualizar import en MedicalHistoryPage.js |
| 8 | Resolver `DewormingPage.js` import de RecordsTable.module.css | Hacer grep de qué clases usa, extraer a shared/ si es necesario |
| 9 | Resolver `VaccinationsPage.js` import de RecordsTable.module.css | Hacer grep de qué clases usa, extraer a shared/ si es necesario |
| 10 | Resolver `Topbar.js` import de Modal.module.css | Extraer las clases de modal de logout a Topbar.module.css |
| 11 | Resolver `GroupTreatmentForm.js` import de TreatmentForm.module.css | Crear GroupTreatmentForm.module.css propio con las clases que necesita, o mover GroupTreatmentForm dentro de TreatmentForm/ si comparten todo el CSS |

---

## Dependencias Cross-Feature Aceptadas

Estas dependencias cruzan features por diseño y son correctas:

| Componente/CSS | Ubicación | Lo usan |
|----------------|-----------|---------|
| `AnimalSelector` | `components/common/` | clinical, anesthesia, vaccinations, deworming, treatments, hospitalization |
| `FormsPage` | `features/forms/` | Importa formularios de todas las features (es un hub por diseño) |
| `RecordsTable` | `components/common/` | medical-history, patients, y potencialmente otros |
| `FiltersBar` | `components/common/` | medical-history y potencialmente otros |
| `mockData.js` | `data/` | Prácticamente todo el frontend |
| `ModulePage.module.css` | `styles/shared/` | hospitalization, treatments, anesthesia, clinical, deworming, vaccinations |
| `Card.module.css` | `styles/shared/` | 7 componentes de múltiples features |
| `CustomTable.module.css` | `styles/shared/` | 4 páginas de módulos |
| `Pagination.module.css` | `styles/shared/` | RecordsTable y potencialmente otros |
| `PageHeader.module.css` | `styles/shared/` | MedicalHistoryPage y potencialmente otros |

---

## Archivos a ELIMINAR (no migrar)

| Archivo | Motivo |
|---------|--------|
| `LoginPage.module.css` | Vacío, solo comentario roto. LoginPage usa Tailwind puro |
| `backend/` (carpeta completa) | Ya no se usa backend |
| `backend/.env` | Del backend eliminado |
| `build.log`, `build2.log`, etc. (8+ archivos) | Logs de build basura |
| `.git_head_GroupTreatmentForm.js` | Archivo suelto |
| `.git_head_TreatmentForm.js` | Archivo suelto |
| `.git_history_treatment.txt` | Archivo suelto |
| `eslint_report.txt` | Vacío |

---

## Regla de Oro para Escalar

Cuando agregues un nuevo módulo (ej: "Cirugías"), solo creas:

```
features/surgeries/
├── components/
│   └── SurgeryForm/
│       ├── SurgeryForm.js
│       └── SurgeryForm.module.css
├── pages/
│   └── SurgeriesPage.js
└── utils/
    └── exportSurgeryPDF.js
```

No tocas ninguna otra feature. Solo agregas la ruta en `app/routes.js` y listo.
