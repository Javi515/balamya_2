import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    FaSearch,
    FaPlus,
    FaSignOutAlt,
    FaChevronLeft,
    FaChevronRight,
    FaChevronDown,
    FaChevronUp,
    FaHospital,
    FaCheckCircle,
    FaPaw,
    FaClipboardList,
} from 'react-icons/fa';
import styles from '../../../styles/shared/ModulePage.module.css';
import {
    getAdmissions,
    getAltas,
    getFollowUps,
    getNotificacionAlta,
} from '../../../services/hospitalizationService';

const SPECIALTY_TO_GROUP = {
    aves: 'ave',
    mamiferos: 'mamifero',
    reptiles: 'reptil',
    anfibios: 'anfibio',
};

const HospitalizationPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState(() => {
        const t = searchParams.get('tab');
        return ['historial', 'altas', 'seguimiento'].includes(t) ? t : 'historial';
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [sourceData, setSourceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [seguimientoData, setSeguimientoData] = useState([]);
    const [seguimientoLoading, setSeguimientoLoading] = useState(false);
    const [expandedSessions, setExpandedSessions] = useState(new Set());
    const itemsPerPage = 10;

    useEffect(() => {
        if (activeTab === 'seguimiento') return;

        let isActive = true;
        setLoading(true);
        setSourceData([]);
        setCurrentPage(1);

        const loader = activeTab === 'historial' ? getAdmissions() : getAltas();
        loader
            .then((data) => { if (isActive) setSourceData(data); })
            .catch(() => { if (isActive) setSourceData([]); })
            .finally(() => { if (isActive) setLoading(false); });

        return () => { isActive = false; };
    }, [activeTab]);

    // Carga silenciosa al montar: garantiza que groupedSeguimientos esté
    // poblado antes de que el usuario presione "Nuevo Seguimiento" desde
    // cualquier pestaña, evitando que numSeguimiento se resetee a 1.
    useEffect(() => {
        let isActive = true;
        getFollowUps()
            .then((data) => { if (isActive) setSeguimientoData(data); })
            .catch(() => {});
        return () => { isActive = false; };
    }, []);

    // Refresca con spinner cuando el usuario navega a la pestaña Seguimiento.
    useEffect(() => {
        if (activeTab !== 'seguimiento') return;
        let isActive = true;
        setSeguimientoLoading(true);
        getFollowUps()
            .then((data) => { if (isActive) setSeguimientoData(data); })
            .catch(() => { if (isActive) setSeguimientoData([]); })
            .finally(() => { if (isActive) setSeguimientoLoading(false); });
        return () => { isActive = false; };
    }, [activeTab]);

    const groupedSeguimientos = useMemo(() => {
        const map = {};
        seguimientoData.forEach((record) => {
            const key = record.numSeguimiento;
            if (!map[key]) {
                map[key] = { numSeguimiento: key, fecha: record.fecha, responsible: record.responsible, records: [] };
            }
            map[key].records.push(record);
        });
        return Object.values(map).sort((a, b) => b.numSeguimiento - a.numSeguimiento);
    }, [seguimientoData]);

    const toggleSession = (num) => {
        setExpandedSessions((prev) => {
            const next = new Set(prev);
            if (next.has(num)) next.delete(num); else next.add(num);
            return next;
        });
    };

    const handleOpenForm = (formKey, patient) => {
        const queryParams = new URLSearchParams({
            form: formKey,
            animalName: patient.id,
            origin: 'hospitalization',
            patientId: patient.id,
        }).toString();

        navigate(`/forms?${queryParams}`, { state: { patient } });
    };

    const handleViewAlta = async (patient) => {
        try {
            const altaData = await getNotificacionAlta(patient.id);
            const enrichedPatient = { ...patient, ...altaData, _viewMode: true };
            navigate(`/forms?form=notificacionAlta&animalName=${patient.id}&origin=hospitalization&patientId=${patient.id}`, {
                state: { patient: enrichedPatient },
            });
        } catch {
            alert('No se pudo cargar la notificación de alta.');
        }
    };


    const handleNewSeguimiento = async () => {
        setSeguimientoLoading(true);
        let freshRecords = [];
        try {
            freshRecords = await getFollowUps();
            setSeguimientoData(freshRecords);
        } catch {
            freshRecords = seguimientoData;
        } finally {
            setSeguimientoLoading(false);
        }

        const map = {};
        freshRecords.forEach((record) => {
            const key = record.numSeguimiento;
            if (!map[key]) map[key] = { numSeguimiento: key, records: [] };
            map[key].records.push(record);
        });
        const groups = Object.values(map).sort((a, b) => b.numSeguimiento - a.numSeguimiento);

        let availableSlots = 10;
        let currentSessionRecords = [];
        let numSeguimiento = 1;

        if (groups.length > 0) {
            const latestSession = groups[0];
            if (latestSession.records.length < 10) {
                availableSlots = 10 - latestSession.records.length;
                currentSessionRecords = latestSession.records;
                numSeguimiento = latestSession.numSeguimiento;
            } else {
                numSeguimiento = latestSession.numSeguimiento + 1;
            }
        }

        navigate(
            '/forms?form=hospFollowUp&origin=hospitalization&selectAnimal=true',
            { state: { availableSlots, currentSessionRecords, numSeguimiento } }
        );
    };

    const handleViewSession = (session) => {
        const patient = {
            _viewMode: true,
            _sessionRecords: session.records,
            fecha: session.fecha,
            responsible: session.responsible,
            numSeguimiento: session.numSeguimiento,
        };
        navigate(
            `/forms?form=hospFollowUp&animalName=seguimiento-${session.numSeguimiento}&origin=hospitalization`,
            { state: { patient } }
        );
    };

    const getPageNumbers = (page, totalPages) => {
        const delta = 1;
        const range = [];
        const rangeWithDots = [];
        let last;

        for (let index = 1; index <= totalPages; index += 1) {
            if (index === 1 || index === totalPages || (index >= page - delta && index <= page + delta)) {
                range.push(index);
            }
        }

        for (const value of range) {
            if (last) {
                if (value - last === 2) {
                    rangeWithDots.push(last + 1);
                } else if (value - last !== 1) {
                    rangeWithDots.push('...');
                }
            }

            rangeWithDots.push(value);
            last = value;
        }

        return rangeWithDots;
    };

    const filteredPatients = sourceData.filter((patient) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            (patient.name || '').toLowerCase().includes(term) ||
            (patient.commonName || '').toLowerCase().includes(term) ||
            (patient.species || '').toLowerCase().includes(term) ||
            String(patient.id).toLowerCase().includes(term);

        if (!matchesSearch) return false;

        if (user?.role !== 'admin' && user?.specialty && user.specialty !== 'all') {
            const groupFilter = SPECIALTY_TO_GROUP[user.specialty.toLowerCase()];
            const patientGroup = (patient.taxonomicGroup || '').toLowerCase();
            if (groupFilter && patientGroup !== groupFilter) return false;
        }

        return true;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

    const handleTabChange = (tab) => {
        setSearchParams({ tab });
        setActiveTab(tab);
        setCurrentPage(1);
    };

    return (
        <div className={styles['hospitalization-container']}>
            <div className={styles['hospitalization-header']}>
                <div className={styles['header-title-group']}>
                    <h1>Pacientes Hospitalizados</h1>
                    <p>Listado de ejemplares en atención clínica activa</p>
                </div>
                <button
                    className={styles['btn-new-admission']}
                    onClick={handleNewSeguimiento}
                    disabled={seguimientoLoading}
                >
                    <FaPlus /> Nuevo Seguimiento
                </button>
            </div>

            <div className={styles['controls-bar']}>
                <div className={styles['search-wrapper']}>
                    <FaSearch className={styles['search-icon']} />
                    <input
                        type="text"
                        placeholder="Buscar por ID, nombre propio, nombre común o nombre científico..."
                        className={styles['search-input']}
                        value={searchTerm}
                        onChange={(event) => {
                            setSearchTerm(event.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            <div className={styles['tab-submenu']}>
                <button
                    className={`${styles['tab-btn']} ${activeTab === 'historial' ? styles['tab-active'] : ''}`}
                    onClick={() => handleTabChange('historial')}
                >
                    <FaHospital className={styles['tab-icon']} />
                    Hospitalizados
                </button>
                <button
                    className={`${styles['tab-btn']} ${activeTab === 'altas' ? styles['tab-active'] : ''}`}
                    onClick={() => handleTabChange('altas')}
                >
                    <FaCheckCircle className={styles['tab-icon']} />
                    Historial / Altas
                </button>
                <button
                    className={`${styles['tab-btn']} ${activeTab === 'seguimiento' ? styles['tab-active'] : ''}`}
                    onClick={() => handleTabChange('seguimiento')}
                >
                    <FaClipboardList className={styles['tab-icon']} />
                    Seguimiento
                </button>
            </div>

            {activeTab === 'seguimiento' ? (
                <div>
                    {seguimientoLoading ? (
                        <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Cargando...</p>
                    ) : groupedSeguimientos.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px' }}>
                            <FaClipboardList style={{ fontSize: '3rem', color: '#cbd5e1' }} />
                            <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>No hay seguimientos registrados aún.</p>
                        </div>
                    ) : (
                        <div className={styles['seguimiento-sessions']}>
                            {groupedSeguimientos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((session) => (
                                <div key={session.numSeguimiento} className={styles['session-card']}>
                                    <div className={styles['session-header']} onClick={() => toggleSession(session.numSeguimiento)}>
                                        <div className={styles['session-header-left']}>
                                            <span className={styles['session-num']}>Seguimiento {session.numSeguimiento}</span>
                                            <div className={styles['session-progress-wrap']}>
                                                <div className={styles['session-progress-bar']}>
                                                    <div
                                                        className={styles['session-progress-fill']}
                                                        style={{ width: `${Math.min((session.records.length / 10) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className={styles['session-progress-label']}>{Math.min(session.records.length, 10)}/10</span>
                                            </div>
                                            <span className={styles['session-meta']}>{session.fecha}</span>
                                        </div>
                                        <div className={styles['session-header-right']}>
                                            <button
                                                className={styles['session-view-btn']}
                                                onClick={(e) => { e.stopPropagation(); handleViewSession(session); }}
                                                title="Ver formato completo"
                                            >
                                                Ver
                                            </button>
                                            {expandedSessions.has(session.numSeguimiento) ? <FaChevronUp className={styles['session-chevron']} /> : <FaChevronDown className={styles['session-chevron']} />}
                                        </div>
                                    </div>
                                    {expandedSessions.has(session.numSeguimiento) && (
                                        <div className={styles['session-body']}>
                                            <table className={styles['session-table']}>
                                                <thead>
                                                    <tr>
                                                        <th>Animal</th>
                                                        <th>Hora</th>
                                                        <th>Peso</th>
                                                        <th>F.C.</th>
                                                        <th>F.R.</th>
                                                        <th>Temp.</th>
                                                        <th>Pulso</th>
                                                        <th>Mucosas</th>
                                                        <th>TLLC</th>
                                                        <th>Observaciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {session.records.map((rec) => (
                                                        <tr key={rec.idSeguimiento}>
                                                            <td>
                                                                <div>
                                                                    <span className={styles['patient-name']}>{rec.name || rec.commonName || '—'}</span>
                                                                    <span className={styles['scientific-name']}>{rec.identificacionMarcaje}</span>
                                                                </div>
                                                            </td>
                                                            <td>{rec.hora || '—'}</td>
                                                            <td>{rec.peso ?? '—'}</td>
                                                            <td>{rec.frecuenciaCardiaca ?? '—'}</td>
                                                            <td>{rec.frecuenciaRespiratoria ?? '—'}</td>
                                                            <td>{rec.temperatura ?? '—'}</td>
                                                            <td>{rec.pulso || '—'}</td>
                                                            <td>{rec.mucosas || '—'}</td>
                                                            <td>{rec.tllc || '—'}</td>
                                                            <td>{rec.observaciones || '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className={styles['pagination']}>
                                <div className={styles['pagination-controls']}>
                                    <button
                                        className={styles['page-btn-nav']}
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    >
                                        <FaChevronLeft /> Anterior
                                    </button>
                                    {getPageNumbers(currentPage, Math.ceil(groupedSeguimientos.length / itemsPerPage)).map((pageNumber, index) => (
                                        <button
                                            key={`${pageNumber}-${index}`}
                                            className={`${styles['page-btn']} ${pageNumber === currentPage ? styles['active'] : ''} ${pageNumber === '...' ? styles['dots'] : ''}`}
                                            disabled={pageNumber === '...'}
                                            onClick={() => pageNumber !== '...' && setCurrentPage(pageNumber)}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}
                                    <button
                                        className={styles['page-btn-nav']}
                                        disabled={currentPage === Math.ceil(groupedSeguimientos.length / itemsPerPage) || groupedSeguimientos.length === 0}
                                        onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.ceil(groupedSeguimientos.length / itemsPerPage)))}
                                    >
                                        Siguiente <FaChevronRight />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
            <>
            <div className={styles['table-container']}>
                <table className={styles['clinical-table']}>
                    <colgroup>
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '12%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '9%' }} />
                        {activeTab !== 'altas' && <col style={{ width: '8%' }} />}
                        <col style={{ width: '8%' }} />
                        <col style={{ width: '11%' }} />
                        <col style={{ width: '12%' }} />
                        <col style={{ width: '38px' }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>Nombre Propio</th>
                            <th>Nombre Común</th>
                            <th style={{ textAlign: 'center' }}>Nombre Científico</th>
                            <th>Identificación</th>
                            <th>Grupo Taxonómico</th>
                            {activeTab !== 'altas' && <th>Ubicación</th>}
                            <th>{activeTab === 'altas' ? 'Fecha de Alta' : 'Ingreso'}</th>
                            <th>Observaciones</th>
                            <th>Responsable</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((patient) => (
                                <tr key={patient.id}>
                                    <td><span className={styles['patient-name']}>{patient.name || '—'}</span></td>
                                    <td>{patient.commonName || '—'}</td>
                                    <td style={{ textAlign: 'center' }}><span style={{ fontStyle: 'italic', color: '#475569' }}>{patient.species || '—'}</span></td>
                                    <td>{patient.identificacionMarcaje || '—'}</td>
                                    <td>{patient.taxonomicGroup || '—'}</td>
                                    {activeTab !== 'altas' && <td>{patient.area}</td>}
                                    <td>
                                        {activeTab === 'altas'
                                            ? <>{patient.dischargeDate}{patient.horaAlta && <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>{patient.horaAlta}</span>}</>
                                            : patient.admissionDate}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div className={styles['diagnosis-text']} title={patient.diagnosis}>
                                            {patient.diagnosis}
                                        </div>
                                    </td>
                                    <td>{patient.responsible}</td>
                                    <td>
                                        <div className={styles['actions-cell']}>
                                            {activeTab === 'historial' && (
                                                <button
                                                    className={`${styles['action-btn']} ${styles['btn-discharge']}`}
                                                    title="Notificación de Alta"
                                                    onClick={() => handleOpenForm('notificacionAlta', patient)}
                                                >
                                                    <FaSignOutAlt />
                                                </button>
                                            )}
                                            {activeTab === 'altas' && (
                                                <button
                                                    className={`${styles['action-btn']} ${styles['btn-discharge']}`}
                                                    title="Ver Notificación de Alta"
                                                    onClick={() => handleViewAlta(patient)}
                                                >
                                                    <FaClipboardList />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                    {loading ? 'Cargando...' : 'No se encontraron pacientes registrados con los filtros actuales.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className={styles['pagination']}>
                    <div className={styles['pagination-controls']}>
                        <button
                            className={styles['page-btn-nav']}
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((previous) => Math.max(previous - 1, 1))}
                        >
                            <FaChevronLeft /> Anterior
                        </button>

                        {getPageNumbers(currentPage, totalPages).map((pageNumber, index) => (
                            <button
                                key={`${pageNumber}-${index}`}
                                className={`${styles['page-btn']} ${pageNumber === currentPage ? styles['active'] : ''} ${pageNumber === '...' ? styles['dots'] : ''}`}
                                disabled={pageNumber === '...'}
                                onClick={() => pageNumber !== '...' && setCurrentPage(pageNumber)}
                            >
                                {pageNumber}
                            </button>
                        ))}

                        <button
                            className={styles['page-btn-nav']}
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage((previous) => Math.min(previous + 1, totalPages))}
                        >
                            Siguiente <FaChevronRight />
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles['mobile-cards-container']}>
                {currentItems.map((patient) => (
                    <div key={patient.id} className={styles['mobile-patient-card']}>
                        {/* Foto de fondo + encabezado */}
                        <div className={styles['mobile-card-top']}>
                            {patient.imageUrl
                                ? <img src={patient.imageUrl} alt={patient.name} className={styles['mobile-card-photo']} />
                                : <div className={styles['mobile-card-photo-placeholder']}><FaPaw /></div>
                            }
                            <div className={styles['mobile-card-top-info']}>
                                <span className={styles['mobile-card-name']}>{patient.name || patient.commonName || '—'}</span>
                                <span className={styles['mobile-card-common']}>{patient.commonName || '—'}</span>
                                <span className={styles['mobile-card-scientific']}>{patient.species || '—'}</span>
                            </div>
                            <span className={styles['mobile-card-id-badge']}>{patient.identificacionMarcaje || '—'}</span>
                        </div>

                        {/* Datos */}
                        <div className={styles['mobile-card-data']}>
                            {activeTab !== 'altas' && patient.area && (
                                <div className={styles['mobile-card-chip']}>
                                    <span className={styles['mobile-card-chip-label']}>Ubicación</span>
                                    <span className={styles['mobile-card-chip-value']}>{patient.area}</span>
                                </div>
                            )}
                            <div className={styles['mobile-card-chip']}>
                                <span className={styles['mobile-card-chip-label']}>{activeTab === 'altas' ? 'Fecha de alta' : 'Ingreso'}</span>
                                <span className={styles['mobile-card-chip-value']}>
                                    {activeTab === 'altas' ? patient.dischargeDate : patient.admissionDate}
                                    {activeTab === 'altas' && patient.horaAlta && ` · ${patient.horaAlta}`}
                                </span>
                            </div>
                            {patient.diagnosis && (
                                <div className={styles['mobile-card-chip']}>
                                    <span className={styles['mobile-card-chip-label']}>Observaciones</span>
                                    <span className={styles['mobile-card-chip-value']}>{patient.diagnosis}</span>
                                </div>
                            )}
                            <div className={styles['mobile-card-chip']}>
                                <span className={styles['mobile-card-chip-label']}>Responsable</span>
                                <span className={styles['mobile-card-chip-value']}>{patient.responsible}</span>
                            </div>
                        </div>

                        {/* Acciones */}
                        {activeTab === 'historial' && (
                            <div className={styles['card-actions']}>
                                <button
                                    className={`${styles['action-btn']} ${styles['btn-discharge']}`}
                                    onClick={() => handleOpenForm('notificacionAlta', patient)}
                                >
                                    <FaSignOutAlt /> Dar de alta
                                </button>
                            </div>
                        )}
                        {activeTab === 'altas' && (
                            <div className={styles['card-actions']}>
                                <button
                                    className={`${styles['action-btn']} ${styles['btn-discharge']}`}
                                    onClick={() => handleViewAlta(patient)}
                                >
                                    <FaClipboardList /> Ver notificación
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            </>
            )}
        </div>
    );
};

export default HospitalizationPage;
