import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FaEye, FaArrowLeft, FaExchangeAlt, FaStethoscope, FaListAlt, FaChevronLeft, FaChevronRight, FaClipboardList, FaSearch, FaSort } from 'react-icons/fa';
import AnimalSelector from '../../../components/common/AnimalSelector/AnimalSelector';
import ClinicalReviewForm from '../components/ClinicalReviewForm/ClinicalReviewForm';
import formStyles from '../../forms/pages/FormsPage.module.css';
import customStyles from './ClinicalReviewsPage.module.css';
import '../../../styles/FloatingActions.css';
import { createClinicalReviewApi, updateClinicalReviewApi, updateClinicalReviewAvesApi, updateClinicalReviewReptilesApi, getClinicalReviewsApi, getAllClinicalReviewsApi } from '../../../services/clinicalService';
import { fetchPatientById } from '../../../services/patientsService';

const ClinicalReviewsPage = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [searchParams, setSearchParams] = useSearchParams();

    // viewState: 'menu' | 'selection' | 'summary' | 'animal-reviews' | 'clinical-form'
    const [viewState, setViewState] = useState(() => {
        const v = searchParams.get('view');
        return ['selection', 'summary', 'clinical-form'].includes(v) ? v : 'menu';
    });
    const [activeTab, setActiveTab] = useState('general');
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [allRecords, setAllRecords] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [clinicalFormOrigin, setClinicalFormOrigin] = useState('selection');

    // Summary pagination + search
    const [summaryPage, setSummaryPage] = useState(1);
    const summaryItemsPerPage = 10;
    const [summarySearch, setSummarySearch] = useState('');

    // Animal reviews pagination + filters
    const [reviewsPage, setReviewsPage] = useState(1);
    const reviewsPerPage = 20;
    const [reviewSortAsc, setReviewSortAsc] = useState(false);
    const [reviewDateFrom, setReviewDateFrom] = useState('');
    const [reviewDateTo, setReviewDateTo] = useState('');

    const records = selectedAnimal ? (allRecords[selectedAnimal.id] || []) : [];

    // Re-fetch summary data when reloading directly on ?view=summary (skip if patientId present — mount effect handles that)
    useEffect(() => {
        if (viewState === 'summary' && Object.keys(allRecords).length === 0 && !searchParams.get('patientId')) {
            setSummaryLoading(true);
            getAllClinicalReviewsApi()
                .then(all => {
                    const grouped = all.reduce((acc, r) => {
                        if (!acc[r.idEjemplar]) acc[r.idEjemplar] = [];
                        acc[r.idEjemplar].push(r);
                        return acc;
                    }, {});
                    setAllRecords(grouped);
                })
                .catch(err => console.error('Error al cargar resumen:', err))
                .finally(() => setSummaryLoading(false));
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const v = searchParams.get('view');
        const animalId = searchParams.get('animalId');
        const reviewId = searchParams.get('reviewId');
        const mode = searchParams.get('mode');
        const patientId = searchParams.get('patientId');

        if (v === 'clinical-form' && animalId) {
            if (mode === 'view' && reviewId) {
                // Restore viewing an existing review
                const cachedAnimal = sessionStorage.getItem('balamya_animal_' + animalId);
                const cachedReview = sessionStorage.getItem('balamya_review_' + reviewId);
                if (cachedAnimal && cachedReview) {
                    const animal = JSON.parse(cachedAnimal);
                    const review = JSON.parse(cachedReview);
                    setSelectedAnimal(animal);
                    setSelectedReview(review);
                    setSelectedPatientId(animalId);
                    setClinicalFormOrigin('animal-reviews');
                    setViewState('clinical-form');
                    return;
                }
                // No cache: load from API and find by reviewId
                setSummaryLoading(true);
                getAllClinicalReviewsApi()
                    .then(all => {
                        const grouped = all.reduce((acc, r) => {
                            if (!acc[r.idEjemplar]) acc[r.idEjemplar] = [];
                            acc[r.idEjemplar].push(r);
                            return acc;
                        }, {});
                        setAllRecords(grouped);
                        const review = all.find(r => String(r.idRevision) === reviewId);
                        if (review) {
                            const synth = {
                                id: review.idEjemplar,
                                idEjemplar: review.idEjemplar,
                                commonName: review.nombreComun || review.idEjemplar,
                                scientificName: review.nombreCientifico || '',
                                taxonomicGroup: review.variante === 'aves' ? 'aves' : 'mamifero',
                            };
                            setSelectedAnimal(synth);
                            setSelectedReview(review);
                            setSelectedPatientId(review.idEjemplar);
                            setClinicalFormOrigin('animal-reviews');
                            setViewState('clinical-form');
                        } else {
                            setSearchParams({ view: 'summary' });
                            setViewState('summary');
                        }
                    })
                    .catch(() => { setSearchParams({ view: 'summary' }); setViewState('summary'); })
                    .finally(() => setSummaryLoading(false));
            } else {
                // Restore registering new review
                const cached = sessionStorage.getItem('balamya_animal_' + animalId);
                if (cached) { handleAnimalSelect(JSON.parse(cached)); return; }
                fetchPatientById(animalId)
                    .then(animal => {
                        if (animal) handleAnimalSelect(animal);
                        else { setSearchParams({ view: 'selection' }); setViewState('selection'); }
                    })
                    .catch(() => { setSearchParams({ view: 'selection' }); setViewState('selection'); });
            }
        } else if (v === 'summary' && patientId) {
            // Restore animal-reviews sub-view
            setSelectedPatientId(patientId);
            setReviewsPage(1);
            setViewState('animal-reviews');
            setSummaryLoading(true);
            getAllClinicalReviewsApi()
                .then(all => {
                    const grouped = all.reduce((acc, r) => {
                        if (!acc[r.idEjemplar]) acc[r.idEjemplar] = [];
                        acc[r.idEjemplar].push(r);
                        return acc;
                    }, {});
                    setAllRecords(grouped);
                })
                .catch(err => console.error('Error al cargar revisiones:', err))
                .finally(() => setSummaryLoading(false));
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // --- Navigation ---
    const goToMenu = () => { setSearchParams({}); setViewState('menu'); setSelectedAnimal(null); };
    const goToRegister = () => { setSearchParams({ view: 'selection' }); setViewState('selection'); };
    const goToSummary = async () => {
        setSearchParams({ view: 'summary' });
        setViewState('summary');
        setSummaryLoading(true);
        try {
            const all = await getAllClinicalReviewsApi();
            const grouped = all.reduce((acc, r) => {
                if (!acc[r.idEjemplar]) acc[r.idEjemplar] = [];
                acc[r.idEjemplar].push(r);
                return acc;
            }, {});
            setAllRecords(grouped);
        } catch (error) {
            console.error('Error al cargar resumen:', error);
        } finally {
            setSummaryLoading(false);
        }
    };

    const handleAnimalSelect = (animal) => {
        setSelectedAnimal(animal);
        sessionStorage.setItem('balamya_animal_' + animal.id, JSON.stringify(animal));
        setSelectedReview(null);
        setClinicalFormOrigin('selection');
        setSearchParams({ view: 'clinical-form', animalId: animal.id });
        setViewState('clinical-form');
    };

    const handleChangeAnimal = () => {
        setSelectedAnimal(null);
        setSelectedReview(null);
        setSearchParams({ view: 'selection' });
        setViewState('selection');
    };

    const viewHistoryFor = (patient) => {
        setSelectedAnimal(patient);
        setSelectedReview(null);
        setClinicalFormOrigin('selection');
        setViewState('clinical-form');
    };

    const closeForm = () => {
        if (clinicalFormOrigin === 'animal-reviews') {
            const pid = selectedPatientId || selectedAnimal?.id;
            setSearchParams({ view: 'summary', patientId: pid });
            setViewState('animal-reviews');
            if (Object.keys(allRecords).length === 0) {
                setSummaryLoading(true);
                getAllClinicalReviewsApi()
                    .then(all => {
                        const grouped = all.reduce((acc, r) => {
                            if (!acc[r.idEjemplar]) acc[r.idEjemplar] = [];
                            acc[r.idEjemplar].push(r);
                            return acc;
                        }, {});
                        setAllRecords(grouped);
                    })
                    .catch(err => console.error('Error al cargar revisiones:', err))
                    .finally(() => setSummaryLoading(false));
            }
        } else {
            setSearchParams({});
            setViewState('menu');
            setSelectedAnimal(null);
        }
        setSelectedReview(null);
    };

    const viewReview = (review) => {
        const syntheticAnimal = {
            id:            review.idEjemplar,
            idEjemplar:    review.idEjemplar,
            commonName:    review.nombreComun || review.idEjemplar,
            scientificName: review.nombreCientifico || '',
            taxonomicGroup: review.variante === 'aves' ? 'aves' : 'mamifero',
        };
        sessionStorage.setItem('balamya_animal_' + review.idEjemplar, JSON.stringify(syntheticAnimal));
        sessionStorage.setItem('balamya_review_' + review.idRevision, JSON.stringify(review));
        setSelectedAnimal(syntheticAnimal);
        setSelectedReview(review);
        setSelectedPatientId(review.idEjemplar);
        setClinicalFormOrigin('animal-reviews');
        setSearchParams({ view: 'clinical-form', animalId: review.idEjemplar, reviewId: review.idRevision, mode: 'view' });
        setViewState('clinical-form');
    };

    const handleUpdateForm = async (formData) => {
        if (!selectedReview?.idRevision) {
            throw new Error('No se puede actualizar: ID de revisión no encontrado.');
        }
        try {
            if (selectedReview.variante === 'aves') {
                await updateClinicalReviewAvesApi(selectedReview.idRevision, formData);
            } else if (selectedReview.variante === 'reptiles') {
                await updateClinicalReviewReptilesApi(selectedReview.idRevision, formData);
            } else {
                await updateClinicalReviewApi(selectedReview.idRevision, formData);
            }
            // Refrescar allRecords para que al volver a ver la revisión los datos sean los actualizados
            const all = await getAllClinicalReviewsApi();
            const grouped = all.reduce((acc, r) => {
                if (!acc[r.idEjemplar]) acc[r.idEjemplar] = [];
                acc[r.idEjemplar].push(r);
                return acc;
            }, {});
            setAllRecords(grouped);
        } catch (error) {
            if (error?.status === 403) {
                throw new Error('No tienes permiso para editar esta revisión.');
            }
            throw error;
        }
    };

    const handleSaveForm = async (formData) => {
        setIsSaving(true);
        try {
            await createClinicalReviewApi(selectedAnimal, formData);
            const updatedRecords = await getClinicalReviewsApi(selectedAnimal);
            setAllRecords(prev => ({
                ...prev,
                [selectedAnimal.id]: updatedRecords,
            }));
            alert('Revisión clínica guardada correctamente.');
        } catch (error) {
            console.error('Error al guardar revisión clínica:', error);
            alert('No se pudo guardar la revisión:\n' + (error?.message || 'Error desconocido'));
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    const getSummaryData = (varianteFilter) => {
        return Object.entries(allRecords)
            .map(([patientId, recs]) => {
                const filtered = varianteFilter ? recs.filter(r => r.variante === varianteFilter) : recs;
                if (filtered.length === 0) return null;
                const lastRecord = filtered[filtered.length - 1];
                return {
                    patientId,
                    nombre:           lastRecord?.nombre || null,
                    nombreComun:      lastRecord?.nombreComun || null,
                    nombreCientifico: lastRecord?.nombreCientifico || null,
                    totalRecords: filtered.length,
                    lastReview: lastRecord?.fecha || null,
                    responsable: lastRecord?.responsable || null,
                    variante:         lastRecord?.variante || null,
                    grupoTaxonomico:  lastRecord?.grupoTaxonomico || null,
                };
            })
            .filter(Boolean);
    };

    const getPageNumbers = (current, total) => {
        const delta = 1;
        const range = [];
        const rangeWithDots = [];
        let l;
        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) range.push(i);
        }
        for (let i of range) {
            if (l) {
                if (i - l === 2) rangeWithDots.push(l + 1);
                else if (i - l !== 1) rangeWithDots.push('...');
            }
            rangeWithDots.push(i);
            l = i;
        }
        return rangeWithDots;
    };

    // ==========================================
    // VIEW: MENU
    // ==========================================
    if (viewState === 'menu') {
        return (
            <div className={`${formStyles['forms-page-wrapper']} ${formStyles['module-menu-wrapper']}`}>
                <div className={formStyles['forms-page-container']}>
                    <div className={formStyles['forms-page-header']} style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 className={formStyles['forms-page-title']} style={{ fontSize: '2.5rem' }}>Revisiones Clínicas</h1>
                        <p className={formStyles['forms-page-subtitle']}>¿Qué deseas hacer?</p>
                    </div>
                    <div className={formStyles['module-menu-grid']}>
                        <div className={`${formStyles['form-card']} ${formStyles['form-card-general']} ${formStyles['module-menu-card']}`} onClick={goToRegister} style={{ borderColor: '#8b5cf6' }}>
                            <div className={`${formStyles['form-card-content']} ${formStyles['module-menu-card-content']}`}>
                                <FaStethoscope className={`${formStyles['form-card-icon']} ${formStyles['module-menu-icon']}`} style={{ color: '#8b5cf6' }} />
                                <div className={formStyles['form-card-text']}>
                                    <h3 className={`${formStyles['form-card-title']} ${formStyles['module-menu-title']}`}>REGISTRAR REVISIÓN</h3>
                                    <p className={`${formStyles['form-card-description']} ${formStyles['module-menu-desc']}`}>Selecciona un ejemplar y registra su revisión clínica correspondiente.</p>
                                </div>
                            </div>
                        </div>
                        <div className={`${formStyles['form-card']} ${formStyles['form-card-general']} ${formStyles['module-menu-card']}`} onClick={goToSummary} style={{ borderColor: '#8b5cf6' }}>
                            <div className={`${formStyles['form-card-content']} ${formStyles['module-menu-card-content']}`}>
                                <FaListAlt className={`${formStyles['form-card-icon']} ${formStyles['module-menu-icon']}`} style={{ color: '#8b5cf6' }} />
                                <div className={formStyles['form-card-text']}>
                                    <h3 className={`${formStyles['form-card-title']} ${formStyles['module-menu-title']}`}>VER REVISIONES</h3>
                                    <p className={`${formStyles['form-card-description']} ${formStyles['module-menu-desc']}`}>Consulta el resumen de revisiones clínicas registradas en esta sesión.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // VIEW: VARIANT SELECTION
    // ==========================================
    // VIEW: ANIMAL SELECTION
    // ==========================================
    if (viewState === 'selection') {
        return (
            <div className={formStyles['forms-page-wrapper']}>
                <div className={formStyles['form-entry-animation']}>
                    <button onClick={goToMenu} className={formStyles['back-to-menu-btn']}>
                        <FaArrowLeft /> Volver al menú
                    </button>
                    <AnimalSelector onSelect={handleAnimalSelect} />
                </div>
            </div>
        );
    }

    // ==========================================
    // VIEW: SUMMARY TABLE
    // ==========================================
    if (viewState === 'summary') {
        const specialtyToVariante = { aves: 'aves', reptiles: 'reptiles', mamiferos: 'normal', anfibios: 'normal' };
        const varianteFilter = isAdmin
            ? (activeTab === 'general' ? null : activeTab)
            : (user?.specialty && user.specialty !== 'all' ? (specialtyToVariante[user.specialty] || null) : null);
        const rawSummaryData = getSummaryData(varianteFilter);
        const summaryData = summarySearch.trim()
            ? rawSummaryData.filter(item => {
                const q = summarySearch.toLowerCase();
                return (
                    (item.patientId || '').toLowerCase().includes(q) ||
                    (item.nombre || '').toLowerCase().includes(q) ||
                    (item.nombreComun || '').toLowerCase().includes(q) ||
                    (item.nombreCientifico || '').toLowerCase().includes(q)
                );
            })
            : rawSummaryData;
        const totalSummaryPages = Math.ceil(summaryData.length / summaryItemsPerPage);
        const startIdx = (summaryPage - 1) * summaryItemsPerPage;
        const paginatedData = summaryData.slice(startIdx, startIdx + summaryItemsPerPage);

        const TABS = [
            { key: 'general',  label: 'General' },
            { key: 'aves',     label: 'Aves' },
            { key: 'reptiles', label: 'Reptiles' },
        ];

        return (
            <div className={formStyles['forms-page-wrapper']}>
                <div className={formStyles['form-entry-animation']}>
                    <button onClick={goToMenu} className={formStyles['back-to-menu-btn']}>
                        <FaArrowLeft /> Volver al menú
                    </button>
                    <div className={customStyles['custom-table-container']}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Resumen de Revisiones Clínicas</h3>
                            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>{summaryData.length} PACIENTES</span>
                        </div>

                        <div className={customStyles['search-wrapper']}>
                            <FaSearch className={customStyles['search-icon']} />
                            <input
                                type="text"
                                className={customStyles['search-input']}
                                placeholder="Buscar por ID, nombre propio, nombre común o nombre científico..."
                                value={summarySearch}
                                onChange={e => { setSummarySearch(e.target.value); setSummaryPage(1); }}
                            />
                            {summarySearch && (
                                <button className={customStyles['search-clear']} onClick={() => { setSummarySearch(''); setSummaryPage(1); }}>✕</button>
                            )}
                        </div>

                        {isAdmin && (
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '0' }}>
                                {TABS.map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => { setActiveTab(tab.key); setSummaryPage(1); setSummarySearch(''); }}
                                        style={{
                                            padding: '8px 20px',
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer',
                                            fontWeight: activeTab === tab.key ? 700 : 400,
                                            color: activeTab === tab.key ? '#8b5cf6' : '#64748b',
                                            borderBottom: activeTab === tab.key ? '2px solid #8b5cf6' : '2px solid transparent',
                                            marginBottom: '-2px',
                                            fontSize: '0.95rem',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {summaryLoading ? (
                            <div className={customStyles['loading-container']}>
                                <div className={customStyles['loading-spinner']} />
                                <p className={customStyles['loading-text']}>Cargando revisiones clínicas...</p>
                            </div>
                        ) : summaryData.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontStyle: 'italic' }}>No hay revisiones registradas.</p>
                        ) : (
                            <>
                                <table className={customStyles['custom-table']}>
                                    <thead>
                                        <tr>
                                            <th>ID Paciente</th>
                                            <th>Nombre Propio</th>
                                            <th>Nombre Común</th>
                                            <th>Nombre Científico</th>
                                            <th>Grupo</th>
                                            <th>Última Revisión</th>
                                            <th>Resp. Clínico</th>
                                            <th>Total Revisiones</th>
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.map((item) => (
                                            <tr key={item.patientId}>
                                                <td><span className={customStyles['id-text']}>{item.patientId}</span></td>
                                                <td>{item.nombre ?? <span className={customStyles['empty-value']}>—</span>}</td>
                                                <td>{item.nombreComun ?? <span className={customStyles['empty-value']}>N/A</span>}</td>
                                                <td><em>{item.nombreCientifico ?? <span className={customStyles['empty-value']}>N/A</span>}</em></td>
                                                <td>{item.grupoTaxonomico ?? <span className={customStyles['empty-value']}>N/A</span>}</td>
                                                <td>{item.lastReview ?? <span className={customStyles['empty-value']}>Sin registro</span>}</td>
                                                <td>{item.responsable ?? <span className={customStyles['empty-value']}>N/A</span>}</td>
                                                <td style={{ textAlign: 'center' }}>{item.totalRecords}</td>
                                                <td>
                                                    <button
                                                        className={customStyles['action-button']}
                                                        onClick={() => { setSelectedPatientId(item.patientId); setReviewsPage(1); setSearchParams({ view: 'summary', patientId: item.patientId }); setViewState('animal-reviews'); }}
                                                    >
                                                        <FaEye /> Ver
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {totalSummaryPages > 1 && (
                                    <div className={customStyles['pagination']}>
                                        <div className={customStyles['pagination-controls']}>
                                            <button className={customStyles['page-btn-nav']} disabled={summaryPage === 1} onClick={() => setSummaryPage(p => Math.max(p - 1, 1))}>
                                                <FaChevronLeft /> Anterior
                                            </button>
                                            {getPageNumbers(summaryPage, totalSummaryPages).map((n, i) => (
                                                <button
                                                    key={i}
                                                    className={`${customStyles['page-btn']} ${n === summaryPage ? customStyles['active'] : ''} ${n === '...' ? customStyles['dots'] : ''}`}
                                                    disabled={n === '...'}
                                                    onClick={() => n !== '...' && setSummaryPage(n)}
                                                >{n}</button>
                                            ))}
                                            <button className={customStyles['page-btn-nav']} disabled={summaryPage === totalSummaryPages} onClick={() => setSummaryPage(p => Math.min(p + 1, totalSummaryPages))}>
                                                Siguiente <FaChevronRight />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // VIEW: ANIMAL REVIEWS LIST
    // ==========================================
    if (viewState === 'animal-reviews') {
        const patientReviews = allRecords[selectedPatientId] || [];

        // Stable numbering: position from oldest (Revisión Clínica 1 = oldest)
        const allByAge = [...patientReviews].sort((a, b) => (a.idRevision || 0) - (b.idRevision || 0));
        const getReviewNumber = (rev) => allByAge.findIndex(r => r.idRevision === rev.idRevision) + 1;

        // Sort
        const sorted = [...patientReviews].sort((a, b) =>
            reviewSortAsc
                ? (a.idRevision || 0) - (b.idRevision || 0)
                : (b.idRevision || 0) - (a.idRevision || 0)
        );

        // Date filter
        const filtered = sorted.filter(rev => {
            if (reviewDateFrom && rev.fecha && rev.fecha < reviewDateFrom) return false;
            if (reviewDateTo && rev.fecha && rev.fecha > reviewDateTo) return false;
            return true;
        });

        const hasFilters = reviewDateFrom || reviewDateTo;
        const totalReviewPages = Math.ceil(filtered.length / reviewsPerPage);
        const paginatedReviews = filtered.slice((reviewsPage - 1) * reviewsPerPage, reviewsPage * reviewsPerPage);

        const formatHora = (creadoEn) => {
            if (!creadoEn) return null;
            try {
                const ts = /Z|[+-]\d{2}:\d{2}$/.test(creadoEn) ? creadoEn : creadoEn + 'Z';
                return new Intl.DateTimeFormat('es-MX', {
                    timeZone: 'America/Mexico_City',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                }).format(new Date(ts));
            } catch {
                return null;
            }
        };

        const firstRecord = patientReviews[0];

        return (
            <div className={formStyles['forms-page-wrapper']}>
                <div className={formStyles['form-entry-animation']}>
                    <button onClick={() => { setSearchParams({ view: 'summary' }); setViewState('summary'); }} className={formStyles['back-to-menu-btn']}>
                        <FaArrowLeft /> Volver al resumen
                    </button>
                    <div className={customStyles['custom-table-container']}>
                        {/* Header: nombre + badge conteo */}
                        <div className={customStyles['reviews-header']}>
                            <div>
                                <h3 className={customStyles['reviews-header-title']}>
                                    {firstRecord?.nombreComun || selectedPatientId}
                                </h3>
                                {firstRecord?.nombreCientifico && (
                                    <p className={customStyles['reviews-header-subtitle']}>
                                        {firstRecord.nombreCientifico}
                                    </p>
                                )}
                            </div>
                            <span className={customStyles['reviews-header-badge']}>
                                {patientReviews.length} {patientReviews.length === 1 ? 'revisión' : 'revisiones'}
                            </span>
                        </div>

                        {/* Toolbar: filtro de fechas + orden */}
                        <div className={customStyles['reviews-toolbar']}>
                            <div className={customStyles['reviews-toolbar-left']}>
                                <span className={customStyles['reviews-toolbar-label']}>Periodo</span>
                                <input
                                    type="date"
                                    className={customStyles['reviews-date-input']}
                                    value={reviewDateFrom}
                                    onChange={e => { setReviewDateFrom(e.target.value); setReviewsPage(1); }}
                                />
                                <span className={customStyles['reviews-toolbar-sep']}>—</span>
                                <input
                                    type="date"
                                    className={customStyles['reviews-date-input']}
                                    value={reviewDateTo}
                                    onChange={e => { setReviewDateTo(e.target.value); setReviewsPage(1); }}
                                />
                                {hasFilters && (
                                    <button
                                        className={customStyles['reviews-clear-btn']}
                                        onClick={() => { setReviewDateFrom(''); setReviewDateTo(''); setReviewsPage(1); }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            <button
                                className={`${customStyles['reviews-sort-btn']} ${reviewSortAsc ? customStyles['reviews-sort-btn-active'] : ''}`}
                                onClick={() => { setReviewSortAsc(v => !v); setReviewsPage(1); }}
                            >
                                <FaSort />
                                {reviewSortAsc ? 'Más antiguas primero' : 'Más recientes primero'}
                            </button>
                        </div>

                        {hasFilters && (
                            <p className={customStyles['reviews-filter-info']}>
                                Mostrando {filtered.length} de {patientReviews.length} revisiones
                            </p>
                        )}

                        <div className={customStyles['reviews-list']}>
                            {filtered.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 0', fontStyle: 'italic' }}>
                                    No hay revisiones en el rango seleccionado.
                                </p>
                            ) : paginatedReviews.map((rev) => (
                                <div key={rev.idRevision ?? rev.fecha} className={customStyles['review-card']}>
                                    <div className={customStyles['review-card-left']}>
                                        <FaClipboardList className={customStyles['review-card-icon']} />
                                        <div>
                                            <div className={customStyles['review-card-title']}>Revisión Clínica {getReviewNumber(rev)}</div>
                                            <div className={customStyles['review-card-meta']}>
                                                {rev.fecha ?? 'Sin fecha'}{formatHora(rev.creadoEn) ? ` · ${formatHora(rev.creadoEn)}` : ''} · {rev.responsable ?? 'Sin responsable'}
                                            </div>
                                        </div>
                                    </div>
                                    <button className={customStyles['review-card-btn']} onClick={() => viewReview(rev)}>
                                        <FaEye /> Ver
                                    </button>
                                </div>
                            ))}
                        </div>
                        {totalReviewPages > 1 && (
                            <div className={customStyles['pagination']}>
                                <div className={customStyles['pagination-controls']}>
                                    <button className={customStyles['page-btn-nav']} disabled={reviewsPage === 1} onClick={() => setReviewsPage(p => Math.max(p - 1, 1))}>
                                        <FaChevronLeft /> Anterior
                                    </button>
                                    {getPageNumbers(reviewsPage, totalReviewPages).map((n, i) => (
                                        <button
                                            key={i}
                                            className={`${customStyles['page-btn']} ${n === reviewsPage ? customStyles['active'] : ''} ${n === '...' ? customStyles['dots'] : ''}`}
                                            disabled={n === '...'}
                                            onClick={() => n !== '...' && setReviewsPage(n)}
                                        >{n}</button>
                                    ))}
                                    <button className={customStyles['page-btn-nav']} disabled={reviewsPage === totalReviewPages} onClick={() => setReviewsPage(p => Math.min(p + 1, totalReviewPages))}>
                                        Siguiente <FaChevronRight />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // VIEW: CLINICAL FULL FORM
    // ==========================================
    if (!selectedAnimal) return null;

    return (
        <div className={formStyles['forms-page-wrapper']}>
            <div className={formStyles['form-entry-animation']}>
                <div className={formStyles['form-header-controls']}>
                    <button onClick={closeForm} className={formStyles['back-to-menu-btn']}>
                        <FaArrowLeft /> {clinicalFormOrigin === 'animal-reviews' ? 'Volver al listado' : 'Volver al menú'}
                    </button>
                    <div className={`${formStyles['selected-animal-banner']} ${formStyles.compact}`}>
                        <div className={formStyles['animal-banner-info']}>
                            <span className={formStyles['banner-label']}>Paciente:</span>
                            <span className={formStyles['banner-name']}>{selectedAnimal.commonName || 'Sin Nombre Común'}</span>
                            <span className={formStyles['banner-id']}>{selectedAnimal.id}</span>
                        </div>
                        <button onClick={handleChangeAnimal} className={formStyles['change-animal-btn']}>
                            <FaExchangeAlt /> Cambiar
                        </button>
                    </div>
                </div>

                {isSaving && (
                    <p style={{ textAlign: 'center', color: '#8b5cf6', padding: '8px 0', fontSize: '0.9rem' }}>Guardando revisión...</p>
                )}

                <ClinicalReviewForm
                    patient={selectedAnimal}
                    existingRecord={selectedReview}
                    onSave={selectedReview ? null : handleSaveForm}
                    onUpdate={selectedReview ? handleUpdateForm : null}
                />
            </div>
        </div>
    );
};

export default ClinicalReviewsPage;
