import { useState, useEffect } from 'react';
import { FaSearch, FaChevronDown, FaChevronRight, FaChevronLeft, FaSyringe, FaArrowLeft } from 'react-icons/fa';
import formStyles from '../../../forms/pages/FormsPage.module.css';
import styles from './VaccinationSearch.module.css';
import paginationStyles from '../../../../styles/shared/Pagination.module.css';
import { fetchPatientListings } from '../../../../services/patientsService';
import { getVaccinationsForPatient } from '../../../../services/vaccinationsService';

const MAX_RECORDS_PER_SHEET = 6;
const ITEMS_PER_PAGE = 20;

const VaccinationSearch = ({ onBack, onViewVaccinations, initialPatientId, onPatientSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [allPatients, setAllPatients] = useState([]);
    const [isLoadingPatients, setIsLoadingPatients] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [patientData, setPatientData] = useState({});
    const [expandedCalendarIdx, setExpandedCalendarIdx] = useState({});
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [calPage, setCalPage] = useState(1);

    useEffect(() => {
        const loadPatients = async () => {
            try {
                const { patients } = await fetchPatientListings();
                setAllPatients(patients);
            } catch (err) {
                console.warn('Error cargando pacientes:', err.message);
                setLoadError('No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.');
            }
            setIsLoadingPatients(false);
        };
        loadPatients();
    }, []);

    useEffect(() => {
        if (initialPatientId && allPatients.length > 0 && !selectedPatient) {
            const p = allPatients.find(a => a.id === initialPatientId || a.idEjemplar === initialPatientId);
            if (p) setSelectedPatient(p);
        }
    }, [allPatients, initialPatientId]); // eslint-disable-line react-hooks/exhaustive-deps

    const filteredPatients = searchQuery.trim()
        ? allPatients.filter(p => {
            const q = searchQuery.toLowerCase();
            return (
                (p.id || '').toLowerCase().includes(q) ||
                (p.name || '').toLowerCase().includes(q) ||
                (p.commonName || '').toLowerCase().includes(q) ||
                (p.scientificName || '').toLowerCase().includes(q)
            );
        })
        : allPatients;

    useEffect(() => {
        filteredPatients.forEach(patient => {
            const key = patient.idEjemplar || patient.id;
            if (patientData[key]) return;
            setPatientData(prev => ({ ...prev, [key]: { calendars: [], isLoading: true } }));
            getVaccinationsForPatient(patient)
                .then(records => {
                    const sheetsMap = {};
                    records.forEach(r => {
                        const idx = (r.numCalendario || 1) - 1;
                        if (!sheetsMap[idx]) sheetsMap[idx] = [];
                        sheetsMap[idx].push(r);
                    });
                    const calendars = Object.keys(sheetsMap)
                        .sort((a, b) => Number(b) - Number(a))
                        .map(k => ({ num: Number(k) + 1, records: sheetsMap[k] }));
                    setPatientData(prev => ({ ...prev, [key]: { calendars, isLoading: false } }));
                })
                .catch(() => {
                    setPatientData(prev => ({ ...prev, [key]: { calendars: [], isLoading: false } }));
                });
        });
    }, [filteredPatients.map(p => p.idEjemplar || p.id).join(',')]);

    const isLoadingVaccinations = !isLoadingPatients && filteredPatients.some(p => {
        const key = p.idEjemplar || p.id;
        return !patientData[key] || patientData[key].isLoading;
    });

    const isLoading = isLoadingPatients || isLoadingVaccinations;

    const displayPatients = filteredPatients
        .filter(p => {
            const key = p.idEjemplar || p.id;
            const data = patientData[key];
            if (!data || data.isLoading) return false;
            return data.calendars.length > 0;
        })
        .sort((a, b) => {
            const getMaxId = (p) => {
                const data = patientData[p.idEjemplar || p.id];
                if (!data) return 0;
                const allIds = data.calendars.flatMap(c => c.records.map(r => Number(r.id) || 0));
                return allIds.length > 0 ? Math.max(...allIds) : 0;
            };
            return getMaxId(b) - getMaxId(a);
        });

    const getPageNumbers = (current, total) => {
        const delta = 1;
        const range = [];
        const result = [];
        let l;
        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) range.push(i);
        }
        for (let i of range) {
            if (l && i - l === 2) result.push(l + 1);
            else if (l && i - l !== 1) result.push('...');
            result.push(i);
            l = i;
        }
        return result;
    };

    const toggleCalendar = (patientKey, idx) => {
        setExpandedCalendarIdx(prev => ({
            ...prev,
            [patientKey]: prev[patientKey] === idx ? null : idx,
        }));
    };

    // ── PANTALLA 2: Calendarios del animal seleccionado ──
    if (selectedPatient) {
        const key = selectedPatient.idEjemplar || selectedPatient.id;
        const data = patientData[key];
        const totalCalPages = Math.ceil((data?.calendars?.length || 0) / ITEMS_PER_PAGE);
        const pagedCalendars = (data?.calendars || []).slice(
            (calPage - 1) * ITEMS_PER_PAGE,
            calPage * ITEMS_PER_PAGE
        );

        return (
            <div className={formStyles['forms-page-wrapper']}>
                <div className={formStyles['form-entry-animation']}>
                    <button onClick={() => { setSelectedPatient(null); if (onPatientSelect) onPatientSelect(null); }} className={formStyles['back-to-menu-btn']}>
                        <FaArrowLeft /> Volver a la lista
                    </button>

                    <div className={styles['detail-container']}>
                        <div className={styles['patient-detail-header']}>
                            <div className={styles['patient-info-grid']}>
                                <div className={styles['patient-info-item']}>
                                    <span className={styles['info-label']}>ID</span>
                                    <span className={styles['info-value']}>{selectedPatient.id || '—'}</span>
                                </div>
                                <div className={styles['patient-info-item']}>
                                    <span className={styles['info-label']}>Nombre</span>
                                    <span className={styles['info-value']}>{selectedPatient.name || '—'}</span>
                                </div>
                                <div className={styles['patient-info-item']}>
                                    <span className={styles['info-label']}>Nombre Común</span>
                                    <span className={styles['info-value']}>{selectedPatient.commonName || '—'}</span>
                                </div>
                                <div className={styles['patient-info-item']}>
                                    <span className={styles['info-label']}>Nombre Científico</span>
                                    <span className={`${styles['info-value']} ${styles['scientific-name']}`}>{selectedPatient.scientificName || '—'}</span>
                                </div>
                                <div className={styles['patient-info-item']}>
                                    <span className={styles['info-label']}>Sexo</span>
                                    <span className={styles['info-value']}>{selectedPatient.sex || '—'}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles['calendars-container']}>
                            {data?.isLoading && (
                                <div className={styles['loading-container']}>
                                    <div className={styles['loading-spinner']} />
                                    <p className={styles['loading-text']}>Cargando calendarios...</p>
                                </div>
                            )}
                            {data && !data.isLoading && data.calendars.length === 0 && (
                                <div className={styles['status-text']}>Este animal no tiene registros de vacunación.</div>
                            )}
                            {data && !data.isLoading && pagedCalendars.map(({ num, records: calRecords }, calIdx) => {
                                const isCalExpanded = expandedCalendarIdx[key] === calIdx;
                                const isFull = calRecords.length >= MAX_RECORDS_PER_SHEET;
                                const fillPct = Math.round((calRecords.length / MAX_RECORDS_PER_SHEET) * 100);
                                return (
                                    <div key={num} className={styles['calendar-item']}>
                                        <div className={styles['calendar-header']} onClick={() => toggleCalendar(key, calIdx)}>
                                            <div className={styles['calendar-header-left']}>
                                                <span className={styles['toggle-icon']}>
                                                    {isCalExpanded ? <FaChevronDown /> : <FaChevronRight />}
                                                </span>
                                                <FaSyringe className={styles['calendar-icon']} />
                                                <span className={styles['calendar-title']}>Calendario {num}</span>
                                                <div className={styles['progress-wrap']}>
                                                    <div className={styles['progress-track']}>
                                                        <div
                                                            className={`${styles['progress-fill']} ${isFull ? styles['progress-fill--full'] : ''}`}
                                                            style={{ width: `${fillPct}%` }}
                                                        />
                                                    </div>
                                                    <span className={`${styles['progress-label']} ${isFull ? styles['progress-label--full'] : ''}`}>
                                                        {calRecords.length}/{MAX_RECORDS_PER_SHEET}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                className={styles['view-btn']}
                                                onClick={(e) => { e.stopPropagation(); onViewVaccinations(selectedPatient, num - 1); }}
                                            >
                                                Ver
                                            </button>
                                        </div>

                                        {isCalExpanded && (
                                            <div className={styles['records-wrapper']}>
                                                <table className={styles['records-table']}>
                                                    <thead>
                                                        <tr>
                                                            <th>Fecha</th>
                                                            <th>Vía de Administración</th>
                                                            <th>Vacuna Aplicada</th>
                                                            <th>MVZ Responsable</th>
                                                            <th>Próxima Vacunación</th>
                                                            <th>Observaciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {calRecords.map((rec, recIdx) => (
                                                            <tr key={rec.id || recIdx}>
                                                                <td>{rec.fecha || '—'}</td>
                                                                <td>{rec.viaAdministracion || '—'}</td>
                                                                <td>{rec.vacunaAplicada || '—'}</td>
                                                                <td className={styles['mvz-cell']}>{rec.mvzResponsable || '—'}</td>
                                                                <td>{rec.proximaVacunacion || '—'}</td>
                                                                <td>{rec.observaciones || '—'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {totalCalPages > 1 && (
                            <div className={paginationStyles.pagination}>
                                <div className={paginationStyles['pagination-controls']}>
                                    <button
                                        className={paginationStyles['page-btn-nav']}
                                        disabled={calPage === 1}
                                        onClick={() => setCalPage(p => p - 1)}
                                    >
                                        <FaChevronLeft style={{ marginRight: '6px', fontSize: '0.8rem' }} />
                                        Anterior
                                    </button>
                                    <div className={paginationStyles['pagination-numbers']}>
                                        {getPageNumbers(calPage, totalCalPages).map((num, i) => (
                                            <button
                                                key={i}
                                                className={`${paginationStyles['page-btn']} ${num === calPage ? paginationStyles.active : ''} ${num === '...' ? paginationStyles.dots : ''}`}
                                                disabled={num === '...'}
                                                onClick={() => num !== '...' && setCalPage(num)}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        className={paginationStyles['page-btn-nav']}
                                        disabled={calPage === totalCalPages}
                                        onClick={() => setCalPage(p => p + 1)}
                                    >
                                        Siguiente
                                        <FaChevronLeft style={{ marginLeft: '6px', fontSize: '0.8rem', transform: 'rotate(180deg)' }} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ── PANTALLA 1: Lista de animales con registros ──
    return (
        <div className={formStyles['forms-page-wrapper']}>
            <div className={formStyles['form-entry-animation']}>
                <button onClick={onBack} className={formStyles['back-to-menu-btn']}>
                    <FaArrowLeft /> Volver al menú
                </button>

                <div className={styles['search-container']}>
                    <h3 className={styles['search-title']}>Ver Vacunaciones</h3>

                    <div className={styles['search-input-wrapper']}>
                        <FaSearch className={styles['search-icon']} />
                        <input
                            type="text"
                            className={styles['search-input']}
                            placeholder="Buscar por ID, nombre, nombre común o nombre científico..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        {searchQuery && (
                            <button className={styles['clear-btn']} onClick={() => setSearchQuery('')}>✕</button>
                        )}
                    </div>

                    {isLoading && (
                        <div className={styles['loading-container']}>
                            <div className={styles['loading-spinner']} />
                            <p className={styles['loading-text']}>Cargando pacientes...</p>
                        </div>
                    )}
                    {!isLoading && loadError && (
                        <div className={styles['status-text']}>{loadError}</div>
                    )}
                    {!isLoading && !loadError && displayPatients.length === 0 && (
                        <div className={styles['status-text']}>
                            {searchQuery.trim()
                                ? 'No se encontraron animales con ese criterio.'
                                : 'No hay vacunaciones que mostrar.'}
                        </div>
                    )}
                    {!isLoading && displayPatients.length > 0 && (
                        <p className={styles['results-count']}>
                            {displayPatients.length} animal{displayPatients.length !== 1 ? 'es' : ''} con registros
                        </p>
                    )}

                    <div className={styles['results-list']}>
                        {!isLoading && displayPatients.map(patient => {
                            const key = patient.idEjemplar || patient.id;
                            const data = patientData[key];
                            const calCount = data?.calendars?.length ?? 0;

                            return (
                                <div key={key} className={styles['patient-card']} onClick={() => { setSelectedPatient(patient); setCalPage(1); if (onPatientSelect) onPatientSelect(patient); }}>
                                    <div className={styles['patient-header']}>
                                        <div className={styles['patient-info-grid']}>
                                            <div className={styles['patient-info-item']}>
                                                <span className={styles['info-label']}>ID</span>
                                                <span className={styles['info-value']}>{patient.id || '—'}</span>
                                            </div>
                                            <div className={styles['patient-info-item']}>
                                                <span className={styles['info-label']}>Nombre</span>
                                                <span className={styles['info-value']}>{patient.name || '—'}</span>
                                            </div>
                                            <div className={styles['patient-info-item']}>
                                                <span className={styles['info-label']}>Nombre Común</span>
                                                <span className={styles['info-value']}>{patient.commonName || '—'}</span>
                                            </div>
                                            <div className={styles['patient-info-item']}>
                                                <span className={styles['info-label']}>Nombre Científico</span>
                                                <span className={`${styles['info-value']} ${styles['scientific-name']}`}>{patient.scientificName || '—'}</span>
                                            </div>
                                            <div className={styles['patient-info-item']}>
                                                <span className={styles['info-label']}>Sexo</span>
                                                <span className={styles['info-value']}>{patient.sex || '—'}</span>
                                            </div>
                                            <div className={styles['patient-info-item']}>
                                                <span className={styles['info-label']}>Grupo</span>
                                                <span className={styles['info-value']}>{patient.category || '—'}</span>
                                            </div>
                                            <div className={styles['patient-info-item']}>
                                                <span className={styles['info-label']}>Calendarios</span>
                                                <span className={styles['info-value']}>{calCount}</span>
                                            </div>
                                        </div>
                                        <span className={styles['expand-icon']}><FaChevronRight /></span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VaccinationSearch;
