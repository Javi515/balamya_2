import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaNotesMedical, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaHospital, FaCheckCircle, FaSkull, FaFolder } from 'react-icons/fa';
import styles from '../styles/HospitalizationPage.module.css';
import { patients as allPatients } from '../data/mockData';
import HospitalRecordModal from '../components/dashboard/HospitalRecordModal';

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=800';

// Look up the real photo from patient data by species match
const getPatientPhoto = (scientificName) => {
    const match = allPatients.find(p => p.scientificName === scientificName);
    return match?.imageUrl || DEFAULT_PHOTO;
};

const MOCK_HOSPITALIZED = Array.from({ length: 12 }, (_, i) => {
    const base = allPatients[i % allPatients.length];
    return {
        ...base,
        area: base.location || 'Cuarentena A',
        admissionDate: '2024-01-15',
        diagnosis: base.status === 'Crítico' ? 'Atención urgente requerida' : 'Chequeo rutinario',
        responsible: 'Dr. Alejandro Vera',
    };
});

// Mock data for discharged patients (Altas)
const MOCK_ALTAS = Array.from({ length: 5 }, (_, i) => {
    const base = allPatients[(i + 3) % allPatients.length];
    return {
        ...base,
        area: base.location || 'Cuarentena A',
        admissionDate: '2023-11-10',
        dischargeDate: '2024-01-05',
        diagnosis: 'Recuperación completa',
        responsible: 'Dra. Sofia Mendez',
    };
});

const HospitalizationPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('historial');
    const [recordPatient, setRecordPatient] = useState(null);

    const handleOpenForm = (formKey, patient) => {
        const queryParams = new URLSearchParams({
            form: formKey,
            animalName: patient.id,
            origin: 'hospitalization',
            patientId: patient.id
        }).toString();
        navigate(`/forms?${queryParams}`);
    };

    const handleNewAdmission = () => {
        navigate('/forms?form=hospFollowUp&origin=hospitalization');
    };

    const handleOpenRecord = (patient) => {
        setRecordPatient(patient);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Helper for smart pagination
    const getPageNumbers = (currentPage, totalPages) => {
        const delta = 1;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    const sourceData = activeTab === 'historial' ? MOCK_HOSPITALIZED : MOCK_ALTAS;

    // Filter Logic
    const filteredPatients = sourceData.filter(patient => {
        const term = searchTerm.toLowerCase();
        return patient.name.toLowerCase().includes(term) ||
            patient.commonName.toLowerCase().includes(term) ||
            String(patient.id).toLowerCase().includes(term);
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    return (
        <div className={styles['hospitalization-container']}>
            {/* 1. Encabezado */}
            <div className={styles['hospitalization-header']}>
                <div className={styles['header-title-group']}>
                    <h1>Pacientes Hospitalizados</h1>
                    <p>Listado de ejemplares en atención clínica activa</p>
                </div>
                <button className={styles['btn-new-admission']} onClick={handleNewAdmission}>
                    <FaPlus /> Nuevo Ingreso
                </button>
            </div>

            {/* 2. Búsqueda */}
            <div className={styles['controls-bar']}>
                <div className={styles['search-wrapper']}>
                    <FaSearch className={styles['search-icon']} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, especie o ID..."
                        className={styles['search-input']}
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            {/* 3. Submenu tabs */}
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
            </div>

            {/* 4. Tabla Principal (Desktop) */}
            <div className={styles['table-container']}>
                <table className={styles['clinical-table']}>
                    <thead>
                        <tr>
                            <th>Ejemplar</th>
                            <th>Especie</th>
                            <th>Ubicación</th>
                            <th>{activeTab === 'altas' ? 'Fecha de Alta' : 'Ingreso'}</th>
                            <th>Diagnóstico Presuntivo</th>
                            <th>Responsable</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map(patient => (
                                <tr key={patient.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img src={getPatientPhoto(patient.species)} alt={patient.name} className={styles['patient-thumb']} />
                                            <div>
                                                <span className={styles['patient-name']}>{patient.name}</span>
                                                <span className={styles['scientific-name']}>{patient.species}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{patient.commonName}</td>
                                    <td>{patient.area}</td>
                                    <td>{activeTab === 'altas' ? patient.dischargeDate : patient.admissionDate}</td>
                                    <td>
                                        <div className={styles['diagnosis-text']} title={patient.diagnosis}>
                                            {patient.diagnosis}
                                        </div>
                                    </td>
                                    <td>{patient.responsible}</td>
                                    <td>
                                        <div className={styles['actions-cell']}>
                                            <button className={`${styles['action-btn']} ${styles['btn-record']}`} title="Expediente Médico" onClick={() => handleOpenRecord(patient)}><FaFolder /></button>
                                            {activeTab === 'historial' && (<>
                                                <button className={styles['action-btn']} title="Revisión Clínica" onClick={() => handleOpenForm('clinicalReview', patient)}><FaNotesMedical /></button>
                                                <button className={`${styles['action-btn']} ${styles['btn-necropsy']}`} title="Reporte de Necropsia" onClick={() => handleOpenForm('necropsy', patient)}><FaSkull /></button>
                                                <button className={`${styles['action-btn']} ${styles['btn-discharge']}`} title="Notificación de Alta" onClick={() => handleOpenForm('notificacionAlta', patient)}><FaSignOutAlt /></button>
                                            </>)}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                    No se encontraron pacientes registrados con los filtros actuales.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Paginación */}
                <div className={styles['pagination']}>
                    <div className={styles['pagination-controls']}>
                        <button
                            className={styles['page-btn-nav']}
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        >
                            <FaChevronLeft /> Anterior
                        </button>

                        {getPageNumbers(currentPage, totalPages).map((pageNumber, index) => (
                            <button
                                key={index}
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
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        >
                            Siguiente <FaChevronRight />
                        </button>
                    </div>
                </div>
            </div>

            {/* 5. Vista Móvil (Cards) */}
            <div className={styles['mobile-cards-container']}>
                {currentItems.map(patient => (
                    <div key={patient.id} className={styles['mobile-patient-card']}>
                        <div className={styles['card-header']}>
                            <div className={styles['card-patient-info']}>
                                <img src={getPatientPhoto(patient.species)} alt={patient.name} className={styles['patient-thumb']} />
                                <div>
                                    <span className={styles['patient-name']}>{patient.name}</span>
                                    <span className={styles['scientific-name']}>{patient.species}</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles['card-body']}>
                            <div className={styles['card-row']}>
                                <span className={styles['card-label']}>Ubicación:</span>
                                <span>{patient.area}</span>
                            </div>
                            <div className={styles['card-row']}>
                                <span className={styles['card-label']}>Diagnóstico:</span>
                                <span>{patient.diagnosis}</span>
                            </div>
                            <div className={styles['card-row']}>
                                <span className={styles['card-label']}>Responsable:</span>
                                <span>{patient.responsible}</span>
                            </div>
                        </div>
                        <div className={styles['card-actions']}>
                            <button className={`${styles['action-btn']} ${styles['btn-record']}`} title="Expediente Médico" onClick={() => handleOpenRecord(patient)}><FaFolder /> Expediente</button>
                            {activeTab === 'historial' && (<>
                                <button className={styles['action-btn']} title="Revisión Clínica" onClick={() => handleOpenForm('clinicalReview', patient)}><FaNotesMedical /> Revisión</button>
                                <button className={`${styles['action-btn']} ${styles['btn-necropsy']}`} title="Reporte de Necropsia" onClick={() => handleOpenForm('necropsy', patient)}><FaSkull /> Necropsia</button>
                                <button className={`${styles['action-btn']} ${styles['btn-discharge']}`} title="Notificación de Alta" onClick={() => handleOpenForm('notificacionAlta', patient)}><FaSignOutAlt /> Alta</button>
                            </>)}
                        </div>
                    </div>
                ))}
            </div>

            {recordPatient && (
                <HospitalRecordModal
                    patient={recordPatient}
                    onClose={() => setRecordPatient(null)}
                    onOpenForm={(formKey, patient) => {
                        setRecordPatient(null);
                        handleOpenForm(formKey, patient);
                    }}
                />
            )}
        </div>
    );
};

export default HospitalizationPage;
