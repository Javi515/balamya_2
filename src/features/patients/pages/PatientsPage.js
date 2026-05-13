import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    FaSearch,
    FaFrog,
    FaUsers,
    FaUser,
    FaClinicMedical,
    FaSlidersH,
    FaMapMarkerAlt,
    FaTh,
    FaThList,
    FaTimes,
    FaPaw,
    FaFeatherAlt,
    FaSkull,
    FaHandshake,
    FaExchangeAlt,
    FaGift,
    FaLeaf,
    FaHeart,
    FaBaby,
    FaBuilding,
    FaStethoscope,
    FaHospital,
    FaHome,
} from 'react-icons/fa';
import { GiSnake } from 'react-icons/gi';
import { useAuth } from '../../../context/AuthContext';
import PatientGrid from '../components/PatientGrid/PatientGrid';
import Modal from '../../../components/common/Modal/Modal';
import styles from './PatientsPage.module.css';
import {
    fetchPatientListings,
    createPreregistro,
    uploadPatientPhoto,
} from '../../../services/patientsService';
import { getBajas } from '../../../services/bajaService';

const getPatientsErrorState = (message) => {
    const normalizedMessage = String(message || '').toLowerCase();

    if (
        normalizedMessage.includes('401') ||
        normalizedMessage.includes('token') ||
        normalizedMessage.includes('sesion')
    ) {
        return {
            title: 'Sesion requerida',
            description: 'Tu acceso expiro o no es valido. Inicia sesion nuevamente para consultar pacientes.',
        };
    }

    if (
        normalizedMessage.includes('403') ||
        normalizedMessage.includes('permiso') ||
        normalizedMessage.includes('autoriz')
    ) {
        return {
            title: 'Sin permisos para consultar pacientes',
            description: 'Tu usuario no tiene acceso a este listado.',
        };
    }

    return {
        title: 'No pudimos cargar pacientes',
        description: 'Ocurrio un problema al consultar el backend. Intenta de nuevo en un momento.',
    };
};

const PatientsPage = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [selectedLocations, setSelectedLocations] = useState(['Todas']);
    const [selectedProcedencia, setSelectedProcedencia] = useState(['Todas']);
    const [selectedSpecies, setSelectedSpecies] = useState(['todos']);
    const [selectedGroups, setSelectedGroups] = useState(['Todos']);
    const [selectedCasualtyTypes, setSelectedCasualtyTypes] = useState(['Todas']);
    const [expandedSections, setExpandedSections] = useState({
        especie: true,
        procedencia: true,
        ubicacion: true,
        agrupacion: true,
        tipoBaja: true,
    });
    const [apiPatients, setApiPatients] = useState([]);
    const [patientsMeta, setPatientsMeta] = useState(null);
    const [patientsLoading, setPatientsLoading] = useState(false);
    const [patientsError, setPatientsError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [isPreregistroOpen, setIsPreregistroOpen] = useState(false);
    const [preregistroFields, setPreregistroFields] = useState({ prefijo: '', identificacionMarcaje: '', nombrePropio: '', nombreComun: '', nombreCientifico: '', familia: '', grupoTaxonomico: '', ubicacion: '', procedencia: '', sexo: '', fechaNacimiento: '', numeroEjemplares: '', fotoUrl: '' });
    const [preregistroSaving, setPreregistroSaving] = useState(false);
    const [preregistroError, setPreregistroError] = useState('');
    const [photoChanged, setPhotoChanged] = useState(false);
    const [preregistroPhotoFile, setPreregistroPhotoFile] = useState(null);
    const preregistroPhotoRef = useRef(null);
    const [bajasPatients, setBajasPatients] = useState([]);
    const [bajasLoading, setBajasLoading] = useState(false);
    const [bajasError, setBajasError] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const isCasualtiesPage = location.pathname.startsWith('/casualties');
    const apiMode = !isCasualtiesPage;

    const searchParams = new URLSearchParams(location.search);
    const category = searchParams.get('category');
    const patients = isCasualtiesPage ? bajasPatients : apiPatients;

    useEffect(() => {
        let isActive = true;

        if (!apiMode) {
            setPatientsLoading(false);
            setPatientsError('');
            setApiPatients([]);
            setPatientsMeta(null);
            return () => {
                isActive = false;
            };
        }

        const loadPatients = async () => {
            console.log('[Pacientes] Iniciando carga...');
            setPatientsLoading(true);
            setPatientsError('');

            try {
                console.log('[Pacientes] Llamando fetchPatientListings...');
                const t0 = Date.now();
                const response = await fetchPatientListings();
                console.log(`[Pacientes] Respuesta recibida en ${Date.now() - t0}ms`, response);
                if (!isActive) return;
                setApiPatients([...response.patients].sort((a, b) => Number(b.idEjemplar) - Number(a.idEjemplar)));
                setPatientsMeta(response.meta);
            } catch (error) {
                if (!isActive) return;
                console.error('[Pacientes] Error al cargar:', error);
                setApiPatients([]);
                setPatientsMeta(null);
                setPatientsError(error?.message || 'No fue posible cargar pacientes.');
            } finally {
                if (isActive) {
                    setPatientsLoading(false);
                }
            }
        };

        loadPatients();

        return () => {
            isActive = false;
        };
    }, [apiMode, refreshKey]);

    useEffect(() => {
        if (!isCasualtiesPage) return;
        let isActive = true;

        const loadBajas = async () => {
            setBajasLoading(true);
            setBajasError('');
            try {
                const records = await getBajas();
                if (!isActive) return;
                setBajasPatients(records);
            } catch (error) {
                if (!isActive) return;
                console.error('[getBajas]', error);
                setBajasError(error?.message || 'No fue posible cargar las bajas.');
            } finally {
                if (isActive) setBajasLoading(false);
            }
        };

        loadBajas();
        return () => { isActive = false; };
    }, [isCasualtiesPage, refreshKey]);

    useEffect(() => {
        if (isCasualtiesPage && user && user.specialty !== 'all') {
            if (category !== user.specialty) {
                navigate(`/casualties?category=${user.specialty}`, { replace: true });
            } else {
                setSelectedSpecies([category]);
            }
            return;
        }

        if (category) {
            setSelectedSpecies([category.toLowerCase()]);
            return;
        }

        setSelectedSpecies(['todos']);
    }, [category, isCasualtiesPage, navigate, user]);

    useEffect(() => {
        if (showFilters) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showFilters]);

    const toggleFilter = (value, currentValues, setValues, allValue) => {
        if (value === allValue) {
            setValues([allValue]);
            return;
        }

        let nextValues = currentValues.filter((currentValue) => currentValue !== allValue);
        if (nextValues.includes(value)) {
            nextValues = nextValues.filter((currentValue) => currentValue !== value);
            if (nextValues.length === 0) nextValues = [allValue];
        } else {
            nextValues.push(value);
        }
        setValues(nextValues);
    };

    const toggleSection = (section) => {
        setExpandedSections((currentSections) => ({
            ...currentSections,
            [section]: !currentSections[section],
        }));
    };

    let pageTitle = 'Todos los Ejemplares';
    const isAllAnimalsView = !category || category === 'todos';

    if (isCasualtiesPage) {
        pageTitle = 'Todas las Bajas';
    } else if (!isAllAnimalsView) {
        if (category === 'mamiferos') pageTitle = 'Mamiferos';
        else if (category === 'aves') pageTitle = 'Aves';
        else if (category === 'reptiles') pageTitle = 'Reptiles';
        else if (category === 'anfibios') pageTitle = 'Anfibios';
    }

    const handleSpeciesClick = (species) => {
        toggleFilter(species.toLowerCase(), selectedSpecies, setSelectedSpecies, 'todos');
    };

    const errorState = getPatientsErrorState(patientsError);

    const renderPatientsContent = () => {
        if (isCasualtiesPage && bajasLoading) {
            return (
                <div className={styles['patients-loading']}>
                    <div className={styles['loading-spinner']} />
                    <p className={styles['loading-text']}>Cargando bajas...</p>
                </div>
            );
        }

        if (isCasualtiesPage && bajasError) {
            return (
                <div className={styles['patients-feedback']}>
                    <h3 className={styles['patients-feedback-title']}>No pudimos cargar las bajas</h3>
                    <p>{bajasError}</p>
                </div>
            );
        }

        if (apiMode && patientsLoading) {
            return (
                <div className={styles['patients-loading']}>
                    <div className={styles['loading-spinner']} />
                    <p className={styles['loading-text']}>Cargando pacientes...</p>
                </div>
            );
        }

        if (apiMode && patientsError) {
            return (
                <div className={styles['patients-feedback']}>
                    <h3 className={styles['patients-feedback-title']}>{errorState.title}</h3>
                    <p>{errorState.description}</p>
                </div>
            );
        }

        return (
            <PatientGrid
                patients={patients}
                searchTerm={searchTerm}
                category={selectedSpecies}
                location={selectedLocations}
                procedencia={selectedProcedencia}
                group={selectedGroups}
                casualtyType={selectedCasualtyTypes}
                viewMode={viewMode}
                isCasualties={isCasualtiesPage}
                apiMode={isCasualtiesPage || apiMode}
                detailsEnabled={true}
            />
        );
    };


    const PREFIJOS = [
        { value: 'RC', label: 'Recién nacidos' },
        { value: 'AB', label: 'Abandono' },
        { value: 'VD', label: 'Vida libre' },
        { value: 'TRS', label: 'Transitorio' },
    ];

    const handleOpenPreregistro = () => {
        setPreregistroFields({ prefijo: '', identificacionMarcaje: '', nombrePropio: '', nombreComun: '', nombreCientifico: '', familia: '', grupoTaxonomico: '', ubicacion: '', procedencia: '', sexo: '', fechaNacimiento: '', numeroEjemplares: '', fotoUrl: '' });
        setPreregistroError('');
        setPhotoChanged(false);
        setPreregistroPhotoFile(null);
        setIsPreregistroOpen(true);
    };

    const handlePreregistroPhoto = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPreregistroPhotoFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPreregistroFields(p => ({ ...p, fotoUrl: ev.target.result }));
            setPhotoChanged(true);
        };
        reader.readAsDataURL(file);
    };

    const handlePreregistroSave = async () => {
        const prefix = preregistroFields.prefijo ? `${preregistroFields.prefijo}-` : '';
        const marcaje = preregistroFields.identificacionMarcaje || '';
        if (marcaje && marcaje === prefix) {
            setPreregistroError('La identificación debe incluir algo después del prefijo (ej: RC-001).');
            return;
        }
        setPreregistroSaving(true);
        setPreregistroError('');
        try {
            const res = await createPreregistro({
                prefijo: preregistroFields.prefijo || undefined,
                identificacionMarcaje: preregistroFields.identificacionMarcaje || undefined,
                nombrePropio: preregistroFields.nombrePropio || undefined,
                nombreComun: preregistroFields.nombreComun || undefined,
                nombreCientifico: preregistroFields.nombreCientifico || undefined,
                familia: preregistroFields.familia || undefined,
                grupoTaxonomico: preregistroFields.grupoTaxonomico || undefined,
                ubicacion: preregistroFields.ubicacion || undefined,
                procedencia: preregistroFields.procedencia || undefined,
                sexo: preregistroFields.sexo || undefined,
                fechaNacimiento: preregistroFields.fechaNacimiento || undefined,
                numeroEjemplares: preregistroFields.numeroEjemplares ? Number(preregistroFields.numeroEjemplares) : undefined,
            });
            const idEjemplar = res?.idEjemplar || res?.id_ejemplar || res?.patient?.id_ejemplar || res?.patient?.idEjemplar;
            if (preregistroPhotoFile && idEjemplar) {
                try { await uploadPatientPhoto(idEjemplar, preregistroPhotoFile); } catch { /* foto opcional */ }
            }
            setIsPreregistroOpen(false);
            setRefreshKey(k => k + 1);
        } catch (err) {
            console.error('[createPreregistro] error:', err);
            setPreregistroError(err?.data?.message || err?.message || 'No se pudo crear el preregistro.');
        } finally {
            setPreregistroSaving(false);
        }
    };

    const renderPreregistroFooter = () => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={() => setIsPreregistroOpen(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}>
                Cancelar
            </button>
            <button onClick={handlePreregistroSave} disabled={preregistroSaving} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#16a34a', color: '#fff', fontWeight: 'bold', cursor: preregistroSaving ? 'default' : 'pointer' }}>
                {preregistroSaving ? 'Guardando...' : 'Crear preregistro'}
            </button>
        </div>
    );

    return (
        <div className={styles['patients-page-container']}>
            <Modal isOpen={isPreregistroOpen} onClose={() => setIsPreregistroOpen(false)} title="Crear preregistro" footer={renderPreregistroFooter()}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '10px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Tipo de ingreso</label>
                        <select value={preregistroFields.prefijo} onChange={e => {
                            const val = e.target.value;
                            setPreregistroFields(p => ({ ...p, prefijo: val, identificacionMarcaje: val ? `${val}-` : '' }));
                        }} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#334155', backgroundColor: '#fff' }}>
                            <option value="">Selecciona un tipo</option>
                            {PREFIJOS.map(p => <option key={p.value} value={p.value}>{p.label} ({p.value})</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Identificación / Marcaje</label>
                        <input
                            value={preregistroFields.identificacionMarcaje}
                            onChange={e => {
                                const prefix = preregistroFields.prefijo ? `${preregistroFields.prefijo}-` : '';
                                const newVal = e.target.value;
                                if (prefix && !newVal.startsWith(prefix)) return;
                                setPreregistroFields(p => ({ ...p, identificacionMarcaje: newVal }));
                            }}
                            placeholder={preregistroFields.prefijo ? `${preregistroFields.prefijo}-001` : 'Selecciona un tipo primero'}
                            disabled={!preregistroFields.prefijo}
                            style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#334155', backgroundColor: preregistroFields.prefijo ? '#fff' : '#f8fafc' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Nombre propio</label>
                        <input value={preregistroFields.nombrePropio} onChange={e => setPreregistroFields(p => ({ ...p, nombrePropio: e.target.value }))} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#334155' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Nombre común</label>
                        <input value={preregistroFields.nombreComun} onChange={e => setPreregistroFields(p => ({ ...p, nombreComun: e.target.value }))} placeholder="Ej: Águila Real" style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#334155' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Nombre científico</label>
                        <input value={preregistroFields.nombreCientifico} onChange={e => setPreregistroFields(p => ({ ...p, nombreCientifico: e.target.value }))} placeholder="Ej: Aquila chrysaetos" style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#334155', fontStyle: 'italic' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Familia <span style={{ color: '#ef4444' }}>*</span></label>
                        <input value={preregistroFields.familia} onChange={e => setPreregistroFields(p => ({ ...p, familia: e.target.value }))} placeholder="Ej: Psittacidae" style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#334155' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Grupo Taxonómico</label>
                        <select value={preregistroFields.grupoTaxonomico} onChange={e => setPreregistroFields(p => ({ ...p, grupoTaxonomico: e.target.value }))} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#334155', backgroundColor: '#fff' }}>
                            <option value="">Sin especificar</option>
                            <option value="Ave">Ave</option>
                            <option value="Reptil">Reptil</option>
                            <option value="Mamifero">Mamífero</option>
                            <option value="Anfibio">Anfibio</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 140px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Ubicación</label>
                            <select value={preregistroFields.ubicacion} onChange={e => setPreregistroFields(p => ({ ...p, ubicacion: e.target.value }))} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#334155', backgroundColor: '#fff' }}>
                                <option value="">Sin especificar</option>
                                <option value="Cuarentena">Cuarentena</option>
                                <option value="Recinto">Recinto</option>
                                <option value="Clinica">Clinica</option>
                                <option value="Guarderia">Guarderia</option>
                                <option value="Recuperacion">Recuperacion</option>
                                <option value="Recien nacido">Recien nacido</option>
                            </select>
                        </div>
                        <div style={{ flex: '1 1 140px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Procedencia</label>
                            <select value={preregistroFields.procedencia} onChange={e => setPreregistroFields(p => ({ ...p, procedencia: e.target.value }))} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#334155', backgroundColor: '#fff' }}>
                                <option value="">Sin especificar</option>
                                <option value="Vida libre">Vida libre</option>
                                <option value="Abandono">Abandono</option>
                                <option value="Colección">Colección</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 140px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Sexo</label>
                            <select value={preregistroFields.sexo} onChange={e => setPreregistroFields(p => ({ ...p, sexo: e.target.value }))} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#334155', backgroundColor: '#fff' }}>
                                <option value="">Sin especificar</option>
                                <option value="Macho">Macho</option>
                                <option value="Hembra">Hembra</option>
                                <option value="Macho castrado">Macho castrado</option>
                                <option value="Hembra castrada">Hembra castrada</option>
                            </select>
                        </div>
                        <div style={{ flex: '1 1 140px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>N° Ejemplares</label>
                            <input type="number" min="1" value={preregistroFields.numeroEjemplares} onKeyDown={e => { if (!/^\d$/.test(e.key) && !['Backspace','ArrowUp','ArrowDown','Tab','Delete'].includes(e.key)) e.preventDefault(); }} onChange={e => setPreregistroFields(p => ({ ...p, numeroEjemplares: e.target.value.replace(/\D/g, '') }))} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#334155' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Fecha de nacimiento</label>
                        <input type="date" value={preregistroFields.fechaNacimiento} onChange={e => setPreregistroFields(p => ({ ...p, fechaNacimiento: e.target.value }))} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#334155' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Foto</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {preregistroFields.fotoUrl && <img src={preregistroFields.fotoUrl} alt="preview" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />}
                            <button type="button" onClick={() => preregistroPhotoRef.current?.click()} style={{ padding: '7px 14px', borderRadius: '7px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer', fontSize: '0.875rem' }}>
                                Subir foto
                            </button>
                            <input ref={preregistroPhotoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePreregistroPhoto} />
                        </div>
                    </div>
                    {preregistroError && <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0 }}>{preregistroError}</p>}
                </div>
            </Modal>
            <div className={styles['patients-page-header-row']}>
                <h1 className={styles['patients-page-title']}>{pageTitle}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    {!isCasualtiesPage && user?.role === 'admin' && (
                        <button
                            className={styles['btn-create-preregistro']}
                            onClick={handleOpenPreregistro}
                        >
                            + Crear preregistro
                        </button>
                    )}
                    <button
                        className={styles['view-toggle-btn']}
                        onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                        title={`Cambiar a vista de ${viewMode === 'grid' ? 'tabla' : 'tarjetas'}`}
                    >
                        {viewMode === 'grid' ? <FaThList /> : <FaTh />}
                    </button>
                </div>
            </div>

            {createPortal(
                <>
                    <div
                        className={`${styles['filters-backdrop']} ${showFilters ? styles.active : ''}`}
                        onClick={() => setShowFilters(false)}
                    />

                    <div className={`${styles['filters-drawer']} ${showFilters ? styles.active : ''}`}>
                        <div className={styles['drawer-header']}>
                            <h2>Filtros Avanzados</h2>
                            <button className={styles['close-drawer-btn']} onClick={() => setShowFilters(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className={styles['drawer-content']}>
                            {user?.role === 'admin' && (
                            <div className={styles['filter-section']}>
                                <div className={styles['section-header']} onClick={() => toggleSection('especie')}>
                                    <span className={styles['filter-label']}>GRUPO TAXONÓMICO</span>
                                    <span className={`${styles['collapse-icon']} ${expandedSections.especie ? styles.expanded : ''}`}>▼</span>
                                </div>
                                {expandedSections.especie && (
                                    <div className={styles['filter-options-grid']}>
                                        {[
                                            { id: 'todos', label: 'Todos', icon: null },
                                            { id: 'mamiferos', label: 'Mamiferos', icon: <FaPaw className={styles['filter-icon']} /> },
                                            { id: 'aves', label: 'Aves', icon: <FaFeatherAlt className={styles['filter-icon']} /> },
                                            { id: 'reptiles', label: 'Reptiles', icon: <GiSnake className={styles['filter-icon']} /> },
                                            { id: 'anfibios', label: 'Anfibios', icon: <FaFrog className={styles['filter-icon']} /> },
                                        ].map((option) => (
                                            <label
                                                key={option.id}
                                                className={`${styles['checkbox-item']} ${selectedSpecies.includes(option.id) ? styles.active : ''} ${option.id === 'todos' ? styles['full-width'] : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSpecies.includes(option.id)}
                                                    onChange={() => handleSpeciesClick(option.id)}
                                                />
                                                <div className={styles['checkbox-custom']}></div>
                                                <div className={styles['checkbox-content']}>
                                                    {option.icon}
                                                    <span>{option.label}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                            )}

                            <div className={styles['filter-section']}>
                                    <div className={styles['section-header']} onClick={() => toggleSection('procedencia')}>
                                        <span className={styles['filter-label']}>PROCEDENCIA</span>
                                        <span className={`${styles['collapse-icon']} ${expandedSections.procedencia ? styles.expanded : ''}`}>▼</span>
                                    </div>
                                    {expandedSections.procedencia && (
                                        <div className={styles['filter-options-grid']}>
                                            {[
                                                { id: 'Todas', label: 'Todas', icon: null },
                                                { id: 'Vida libre', label: 'Vida libre', icon: <FaLeaf className={styles['filter-icon']} /> },
                                                { id: 'Abandono', label: 'Abandono', icon: <FaHeart className={styles['filter-icon']} /> },
                                                { id: 'Colección', label: 'Colección', icon: <FaBuilding className={styles['filter-icon']} /> },
                                            ].map((option) => (
                                                <label
                                                    key={option.id}
                                                    className={`${styles['checkbox-item']} ${selectedProcedencia.includes(option.id) ? styles.active : ''} ${option.id === 'Todas' ? styles['full-width'] : ''}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedProcedencia.includes(option.id)}
                                                        onChange={() => toggleFilter(option.id, selectedProcedencia, setSelectedProcedencia, 'Todas')}
                                                    />
                                                    <div className={styles['checkbox-custom']}></div>
                                                    <div className={styles['checkbox-content']}>
                                                        {option.icon}
                                                        <span>{option.label}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            <div className={styles['filter-section']}>
                                    <div className={styles['section-header']} onClick={() => toggleSection('ubicacion')}>
                                        <span className={styles['filter-label']}>UBICACIÓN</span>
                                        <span className={`${styles['collapse-icon']} ${expandedSections.ubicacion ? styles.expanded : ''}`}>▼</span>
                                    </div>
                                    {expandedSections.ubicacion && (
                                        <div className={styles['filter-options-grid']}>
                                            {[
                                                { id: 'Todas', label: 'Todas las Ubicaciones', icon: null },
                                                { id: 'Cuarentena', label: 'Cuarentena', icon: <FaClinicMedical className={styles['filter-icon']} /> },
                                                { id: 'Recinto', label: 'Recinto', icon: <FaMapMarkerAlt className={styles['filter-icon']} /> },
                                                { id: 'Clinica', label: 'Clinica', icon: <FaStethoscope className={styles['filter-icon']} /> },
                                                { id: 'Guarderia', label: 'Guarderia', icon: <FaHome className={styles['filter-icon']} /> },
                                                { id: 'Recuperacion', label: 'Recuperacion', icon: <FaHospital className={styles['filter-icon']} /> },
                                                ...(!isCasualtiesPage
                                                    ? [{ id: 'Recien nacido', label: 'Recien nacido', icon: <FaBaby className={styles['filter-icon']} /> }]
                                                    : []),
                                            ].map((option) => (
                                                <label
                                                    key={option.id}
                                                    className={`${styles['checkbox-item']} ${selectedLocations.includes(option.id) ? styles.active : ''} ${option.id === 'Todas' ? styles['full-width'] : ''}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedLocations.includes(option.id)}
                                                        onChange={() => toggleFilter(option.id, selectedLocations, setSelectedLocations, 'Todas')}
                                                    />
                                                    <div className={styles['checkbox-custom']}></div>
                                                    <div className={styles['checkbox-content']}>
                                                        {option.icon}
                                                        <span>{option.label}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            {true && (
                                <div className={styles['filter-section']}>
                                    <div className={styles['section-header']} onClick={() => toggleSection('agrupacion')}>
                                        <span className={styles['filter-label']}>AGRUPACION</span>
                                        <span className={`${styles['collapse-icon']} ${expandedSections.agrupacion ? styles.expanded : ''}`}>▼</span>
                                    </div>
                                    {expandedSections.agrupacion && (
                                        <div className={styles['filter-options-grid']}>
                                            {[
                                                { id: 'Todos', label: 'Todos', icon: null },
                                                { id: 'Grupal', label: 'Grupal', icon: <FaUsers className={styles['filter-icon']} /> },
                                                { id: 'Individual', label: 'Individual', icon: <FaUser className={styles['filter-icon']} /> },
                                            ].map((option) => (
                                                <label
                                                    key={option.id}
                                                    className={`${styles['checkbox-item']} ${selectedGroups.includes(option.id) ? styles.active : ''} ${option.id === 'Todos' ? styles['full-width'] : ''}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedGroups.includes(option.id)}
                                                        onChange={() => toggleFilter(option.id, selectedGroups, setSelectedGroups, 'Todos')}
                                                    />
                                                    <div className={styles['checkbox-custom']}></div>
                                                    <div className={styles['checkbox-content']}>
                                                        {option.icon}
                                                        <span>{option.label}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {!apiMode && isCasualtiesPage && (
                                <div className={styles['filter-section']}>
                                    <div className={styles['section-header']} onClick={() => toggleSection('tipoBaja')}>
                                        <span className={styles['filter-label']}>TIPO DE BAJA</span>
                                        <span className={`${styles['collapse-icon']} ${expandedSections.tipoBaja ? styles.expanded : ''}`}>▼</span>
                                    </div>
                                    {expandedSections.tipoBaja && (
                                        <div className={styles['filter-options-grid']}>
                                            {[
                                                { id: 'Todas', label: 'Todas', icon: null },
                                                { id: 'Muerte', label: 'Muerte', icon: <FaSkull className={styles['filter-icon']} /> },
                                                { id: 'Prestamo', label: 'Prestamo', icon: <FaHandshake className={styles['filter-icon']} /> },
                                                { id: 'Intercambio', label: 'Intercambio', icon: <FaExchangeAlt className={styles['filter-icon']} /> },
                                                { id: 'Donacion', label: 'Donacion', icon: <FaGift className={styles['filter-icon']} /> },
                                                { id: 'Liberacion', label: 'Liberacion', icon: <FaLeaf className={styles['filter-icon']} /> },
                                            ].map((option) => (
                                                <label
                                                    key={option.id}
                                                    className={`${styles['checkbox-item']} ${selectedCasualtyTypes.includes(option.id) ? styles.active : ''} ${option.id === 'Todas' ? styles['full-width'] : ''}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCasualtyTypes.includes(option.id)}
                                                        onChange={() => toggleFilter(option.id, selectedCasualtyTypes, setSelectedCasualtyTypes, 'Todas')}
                                                    />
                                                    <div className={styles['checkbox-custom']}></div>
                                                    <div className={styles['checkbox-content']}>
                                                        {option.icon}
                                                        <span>{option.label}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={styles['drawer-footer']}>
                            <button className={styles['apply-filters-btn']} onClick={() => setShowFilters(false)}>
                                Ver Resultados
                            </button>
                        </div>
                    </div>
                </>,
                document.body
            )}

            <div className={styles['filters-card']}>
                <div className={styles['search-bar-row']}>
                    <button
                        className={`${styles['advanced-filters-toggle']} ${showFilters ? styles.active : ''}`}
                        onClick={() => setShowFilters(true)}
                    >
                        <FaSlidersH /> Filtros Avanzados
                    </button>

                    <div className={styles['search-wrapper']}>
                        <FaSearch className={styles['search-icon']} />
                        <input
                            type="text"
                            placeholder="Buscar por ID, nombre propio, nombre común o nombre científico..."
                            className={styles['search-input-ios']}
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </div>
                </div>
            </div>

            {renderPatientsContent()}
        </div>
    );
};

export default PatientsPage;
