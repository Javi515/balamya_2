import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaExchangeAlt, FaSave, FaFilePdf, FaSyringe, FaListAlt, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import AnimalSelector from '../components/dashboard/AnimalSelector';
import ImageUploader from '../components/common/ImageUploader';
import { generateVaccinationPDF } from '../utils/exportVaccinationPDF';
import { patients } from '../data/mockData';
import styles from '../styles/VaccinationForm.module.css';
import formStyles from '../styles/FormsPage.module.css';
import recordStyles from '../styles/RecordsTable.module.css';
import customStyles from '../styles/CustomTable.module.css';
import hospStyles from '../styles/HospitalizationPage.module.css';
import '../styles/FloatingActions.css';

const emptyRecord = {
    fecha: '',
    viaAdministracion: '',
    vacunaAplicada: '',
    mvzResponsable: '',
    proximaVacunacion: '',
    observaciones: ''
};

const VaccinationsPage = () => {
    const formRef = useRef(null);
    const navigate = useNavigate();
    // viewState: 'menu' | 'selection' | 'form' | 'summary'
    const [viewState, setViewState] = useState('menu');
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    // Records stored per patient: { 'M-2034': [...], 'A-1055': [...] }
    const [allRecords, setAllRecords] = useState(() => {
        try {
            const saved = localStorage.getItem('balamya_vaccination_records');
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState({ ...emptyRecord });
    const [editingIndex, setEditingIndex] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [summaryPage, setSummaryPage] = useState(1);
    const summaryItemsPerPage = 10;

    const getPageNumbers = (current, total) => {
        const delta = 1;
        const range = [];
        const rangeWithDots = [];
        let l;
        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
                range.push(i);
            }
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

    // Persist allRecords to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('balamya_vaccination_records', JSON.stringify(allRecords));
    }, [allRecords]);

    // Get records for current patient
    const records = selectedAnimal ? (allRecords[selectedAnimal.id] || []) : [];

    // --- Navigation ---
    const goToMenu = () => {
        setViewState('menu');
        setSelectedAnimal(null);
        setIsSaved(false);
    };

    const goToRegister = () => {
        setViewState('selection');
    };

    const goToSummary = () => {
        setViewState('summary');
    };

    const handleAnimalSelect = (animal) => {
        setSelectedAnimal(animal);
        setViewState('form');
        setIsSaved(false);
    };

    const handleChangeAnimal = () => {
        setSelectedAnimal(null);
        setViewState('selection');
        setIsSaved(false);
    };

    const viewHistoryFor = (patient) => {
        setSelectedAnimal(patient);
        setViewState('form');
        setIsSaved(false);
    };

    // --- Record CRUD ---
    const handleRecordChange = (e) => {
        const { name, value } = e.target;
        setCurrentRecord(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setCurrentRecord({ ...emptyRecord });
        setEditingIndex(null);
        setIsModalOpen(true);
    };

    const openEditModal = (index) => {
        setCurrentRecord({ ...records[index] });
        setEditingIndex(index);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentRecord({ ...emptyRecord });
        setEditingIndex(null);
    };

    const handleSaveRecord = () => {
        if (!currentRecord.fecha || !currentRecord.vacunaAplicada) {
            alert('Por favor, complete al menos la fecha y la vacuna aplicada.');
            return;
        }
        const recordWithPatient = { ...currentRecord, patientId: selectedAnimal.id };
        const patientRecords = [...records];

        if (editingIndex !== null) {
            patientRecords[editingIndex] = recordWithPatient;
        } else {
            patientRecords.push(recordWithPatient);
        }

        setAllRecords(prev => ({ ...prev, [selectedAnimal.id]: patientRecords }));
        closeModal();
    };

    const handleDeleteRecord = (index) => {
        if (window.confirm('¿Está seguro de eliminar este registro?')) {
            const patientRecords = records.filter((_, i) => i !== index);
            setAllRecords(prev => ({ ...prev, [selectedAnimal.id]: patientRecords }));
        }
    };

    // --- Save & PDF ---
    const handleSave = () => {
        // Records are already persisted via useEffect+localStorage
        // This button confirms the save and enables PDF/clinical review actions
        localStorage.setItem('balamya_vaccination_records', JSON.stringify(allRecords));
        setIsSaved(true);
        alert('✅ Registros guardados correctamente.');
    };

    const getPatientData = () => ({
        nombreCientifico: selectedAnimal.scientificName || '',
        nombreComun: selectedAnimal.commonName || '',
        nombreIndividual: selectedAnimal.name || '',
        sexo: selectedAnimal.sex || '',
        edad: selectedAnimal.age ? `${selectedAnimal.age} años` : '',
        ubicacion: selectedAnimal.location || '',
        identificacion: selectedAnimal.id || ''
    });

    const handleExportPDF = () => {
        const el = formRef.current;
        if (!el) return;
        const getLogoSrc = (selector) => {
            const img = el.querySelector(`${selector} img[class*="uploaded-image"]`);
            return img ? img.src : null;
        };
        const formRefs = {
            logoLeft: getLogoSrc('.header-logo-left'),
            logoRight: getLogoSrc('.header-logo-right'),
        };
        generateVaccinationPDF(getPatientData(), records, formRefs);
    };



    // --- Summary data ---
    const getSummaryData = () => {
        return patients.map(p => {
            const recs = allRecords[p.id] || [];
            const lastRecord = recs.length > 0 ? recs[recs.length - 1] : null;
            return {
                patient: p,
                totalRecords: recs.length,
                lastVaccination: lastRecord ? (lastRecord.fecha || null) : null,
                nextVaccination: lastRecord ? (lastRecord.proximaVacunacion || null) : null
            };
        });
    };

    // ==========================================
    // VIEW: MENU
    // ==========================================
    if (viewState === 'menu') {
        return (
            <div
                className={formStyles['forms-page-wrapper']}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: 'calc(100vh - 140px)',
                    marginTop: '0'
                }}
            >
                <div className={formStyles['forms-page-container']}>
                    <div className={formStyles['forms-page-header']} style={{ textAlign: 'center', marginBottom: '50px' }}>
                        <h1 className={formStyles['forms-page-title']} style={{ fontSize: '2.5rem' }}>Vacunaciones</h1>
                        <p className={formStyles['forms-page-subtitle']} style={{ fontSize: '1.1rem' }}>¿Qué deseas hacer?</p>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '40px',
                        padding: '20px',
                        maxWidth: '1000px',
                        margin: '0 auto'
                    }}>
                        {/* Card: Registrar */}
                        <div className={`${formStyles['form-card']} ${formStyles['form-card-vaccination']}`} onClick={goToRegister} style={{ cursor: 'pointer', minHeight: '350px' }}>
                            <div className={formStyles['form-card-content']} style={{ flexDirection: 'column', textAlign: 'center', justifyContent: 'center', gap: '25px' }}>
                                <FaSyringe className={formStyles['form-card-icon']} style={{ color: '#dc3545', fontSize: '72px' }} />
                                <div className={formStyles['form-card-text']} style={{ textAlign: 'center' }}>
                                    <h3 className={formStyles['form-card-title']} style={{ fontSize: '1.5rem', marginBottom: '15px' }}>REGISTRAR VACUNACIÓN</h3>
                                    <p className={formStyles['form-card-description']} style={{ fontSize: '1.1rem' }}>Selecciona un ejemplar y registra una nueva vacunación en su historial clínico.</p>
                                </div>
                            </div>
                        </div>
                        {/* Card: Ver */}
                        <div className={`${formStyles['form-card']} ${formStyles['form-card-vaccination']}`} onClick={goToSummary} style={{ cursor: 'pointer', minHeight: '350px' }}>
                            <div className={formStyles['form-card-content']} style={{ flexDirection: 'column', textAlign: 'center', justifyContent: 'center', gap: '25px' }}>
                                <FaListAlt className={formStyles['form-card-icon']} style={{ color: '#dc3545', fontSize: '72px' }} />
                                <div className={formStyles['form-card-text']} style={{ textAlign: 'center' }}>
                                    <h3 className={formStyles['form-card-title']} style={{ fontSize: '1.5rem', marginBottom: '15px' }}>VER VACUNACIONES</h3>
                                    <p className={formStyles['form-card-description']} style={{ fontSize: '1.1rem' }}>Consulta el resumen de vacunaciones de todos los pacientes y accede a su historial.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
        const summaryData = getSummaryData();
        return (
            <div className={formStyles['forms-page-wrapper']}>
                <div className={formStyles['form-entry-animation']}>
                    <button onClick={goToMenu} className={formStyles['back-to-menu-btn']}>
                        <FaArrowLeft /> Volver al menú
                    </button>
                    <div className={customStyles['custom-table-container']}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Resumen de Vacunaciones</h3>
                            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>{summaryData.length} PACIENTES</span>
                        </div>
                        <table className={customStyles['custom-table']}>
                            <thead>
                                <tr>
                                    <th>Animal</th>
                                    <th>Identificación</th>
                                    <th>Última Vacunación</th>
                                    <th>Próxima Vacunación</th>
                                    <th>Total Registros</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const totalSummaryPages = Math.ceil(summaryData.length / summaryItemsPerPage);
                                    const startIdx = (summaryPage - 1) * summaryItemsPerPage;
                                    const paginatedData = summaryData.slice(startIdx, startIdx + summaryItemsPerPage);
                                    return paginatedData.map((item) => (
                                        <tr key={item.patient.id}>
                                            <td>
                                                <div className={customStyles['species-info']}>
                                                    <div className={customStyles['highlight-text']}>{item.patient.commonName}</div>
                                                </div>
                                            </td>
                                            <td><span className={customStyles['id-text']}>{item.patient.id}</span></td>
                                            <td>{item.lastVaccination ? item.lastVaccination : <span className={customStyles['empty-value']}>Sin registro</span>}</td>
                                            <td>{item.nextVaccination ? item.nextVaccination : <span className={customStyles['empty-value']}>Pendiente</span>}</td>
                                            <td style={{ textAlign: 'center' }}>{item.totalRecords}</td>
                                            <td>
                                                <button
                                                    className={customStyles['action-button']}
                                                    onClick={() => viewHistoryFor(item.patient)}
                                                >
                                                    <FaEye /> Ver
                                                </button>
                                            </td>
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                        {(() => {
                            const totalSummaryPages = Math.ceil(summaryData.length / summaryItemsPerPage);
                            if (totalSummaryPages <= 1) return null;
                            return (
                                <div className={hospStyles['pagination']}>
                                    <div className={hospStyles['pagination-controls']}>
                                        <button
                                            className={hospStyles['page-btn-nav']}
                                            disabled={summaryPage === 1}
                                            onClick={() => setSummaryPage(prev => Math.max(prev - 1, 1))}
                                        >
                                            <FaChevronLeft /> Anterior
                                        </button>
                                        {getPageNumbers(summaryPage, totalSummaryPages).map((pageNumber, index) => (
                                            <button
                                                key={index}
                                                className={`${hospStyles['page-btn']} ${pageNumber === summaryPage ? hospStyles['active'] : ''} ${pageNumber === '...' ? hospStyles['dots'] : ''}`}
                                                disabled={pageNumber === '...'}
                                                onClick={() => pageNumber !== '...' && setSummaryPage(pageNumber)}
                                            >
                                                {pageNumber}
                                            </button>
                                        ))}
                                        <button
                                            className={hospStyles['page-btn-nav']}
                                            disabled={summaryPage === totalSummaryPages}
                                            onClick={() => setSummaryPage(prev => Math.min(prev + 1, totalSummaryPages))}
                                        >
                                            Siguiente <FaChevronRight />
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // VIEW: VACCINATION FORM
    // ==========================================
    return (
        <div className={formStyles['forms-page-wrapper']}>
            <div className={formStyles['form-entry-animation']}>
                {/* Header controls */}
                <div className={formStyles['form-header-controls']}>
                    <button onClick={goToMenu} className={formStyles['back-to-menu-btn']}>
                        <FaArrowLeft /> Volver al menú
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

                {/* Vaccination Card */}
                <div className={`${styles['vaccination-card']} global-form-width`} ref={formRef}>
                    <div className={styles['vaccination-header']}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', width: '100%' }}>
                            <ImageUploader placeholderText="Logo" className="header-logo-left" />
                            <div className="text-center" style={{ flex: 1 }}>
                                <h2 className={styles['vaccination-header-title']}>FORMATO DE VACUNACIÓN</h2>
                                <p className={styles['vaccination-header-subtitle']}>MANTENIMIENTO PREVENTIVO</p>
                            </div>
                            <ImageUploader placeholderText="Logo" className="header-logo-right" />
                        </div>
                    </div>

                    <h4>DATOS GENERALES</h4>
                    <div className={styles['vaccination-form-grid']}>
                        <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Nombre científico</label><input type="text" className={styles['vaccination-form-input']} value={selectedAnimal.scientificName || ''} readOnly /></div>
                        <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Nombre común</label><input type="text" className={styles['vaccination-form-input']} value={selectedAnimal.commonName || ''} readOnly /></div>
                        <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Nombre individual</label><input type="text" className={styles['vaccination-form-input']} value={selectedAnimal.name || ''} readOnly /></div>
                        <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Sexo</label><input type="text" className={styles['vaccination-form-input']} value={selectedAnimal.sex || ''} readOnly /></div>
                        <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Edad</label><input type="text" className={styles['vaccination-form-input']} value={selectedAnimal.age ? `${selectedAnimal.age} años` : ''} readOnly /></div>
                        <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Identificación</label><input type="text" className={styles['vaccination-form-input']} value={selectedAnimal.id || ''} readOnly /></div>
                        <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Ubicación</label><input type="text" className={styles['vaccination-form-input']} value={selectedAnimal.location || ''} readOnly /></div>
                    </div>

                    <div className={styles['add-record-button-container']}>
                        <button onClick={openAddModal} className={styles['add-record-button']}>
                            <FaPlus /> Agregar Registro
                        </button>
                    </div>

                    <div className={styles['table-container']}>
                        <table className={styles['vaccination-table']}>
                            <thead>
                                <tr>
                                    <th>FECHA</th>
                                    <th>VÍA DE ADMINISTRACIÓN</th>
                                    <th>VACUNA APLICADA (o producto biológico)</th>
                                    <th>MVZ RESPONSABLE</th>
                                    <th>PRÓXIMA VACUNACIÓN</th>
                                    <th>OBSERVACIONES</th>
                                    <th>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.length === 0 ? (
                                    <tr><td colSpan="7" className={styles['no-records-cell']}>No hay registros</td></tr>
                                ) : (
                                    records.map((rec, index) => (
                                        <tr key={index}>
                                            <td>{rec.fecha}</td>
                                            <td>{rec.viaAdministracion}</td>
                                            <td>{rec.vacunaAplicada}</td>
                                            <td>{rec.mvzResponsable}</td>
                                            <td>{rec.proximaVacunacion}</td>
                                            <td>{rec.observaciones}</td>
                                            <td>
                                                <div className={styles['action-buttons']}>
                                                    <button className={styles['btn-edit']} onClick={() => openEditModal(index)} title="Editar"><FaEdit /></button>
                                                    <button className={styles['btn-delete']} onClick={() => handleDeleteRecord(index)} title="Eliminar"><FaTrash /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="floating-actions">
                        {!isSaved ? (
                            <button className="floating-btn save-btn" onClick={handleSave} title="Guardar"><FaSave /></button>
                        ) : (
                            <button className="floating-btn pdf-btn" onClick={handleExportPDF} title="Descargar PDF"><FaFilePdf /></button>
                        )}
                    </div>
                </div>

                {/* Modal */}
                {isModalOpen && ReactDOM.createPortal(
                    <div className={styles['modal-overlay']} onClick={closeModal}>
                        <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
                            <h3 className={styles['modal-title']}>
                                {editingIndex !== null ? 'Editar Registro de Vacunación' : 'Nuevo Registro de Vacunación'}
                            </h3>
                            <div className={styles['modal-form-grid']}>
                                <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Fecha</label><input type="date" className={styles['vaccination-form-input']} name="fecha" value={currentRecord.fecha} onChange={handleRecordChange} /></div>
                                <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Vía de Administración</label><input type="text" className={styles['vaccination-form-input']} name="viaAdministracion" value={currentRecord.viaAdministracion} onChange={handleRecordChange} /></div>
                                <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Vacuna Aplicada (o Producto)</label><input type="text" className={styles['vaccination-form-input']} name="vacunaAplicada" value={currentRecord.vacunaAplicada} onChange={handleRecordChange} /></div>
                                <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>MVZ Responsable</label><input type="text" className={styles['vaccination-form-input']} name="mvzResponsable" value={currentRecord.mvzResponsable} onChange={handleRecordChange} /></div>
                                <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Próxima Vacunación</label><input type="date" className={styles['vaccination-form-input']} name="proximaVacunacion" value={currentRecord.proximaVacunacion} onChange={handleRecordChange} /></div>
                                <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Observaciones</label><input type="text" className={styles['vaccination-form-input']} name="observaciones" value={currentRecord.observaciones} onChange={handleRecordChange} /></div>
                            </div>

                            <div className={styles['modal-actions']}>
                                <button onClick={closeModal} className={`${styles['footer-button']} ${styles['cancel-button']}`}>Cancelar</button>
                                <button onClick={handleSaveRecord} className={`${styles['footer-button']} ${styles['save-button']}`}>
                                    {editingIndex !== null ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </div>
    );
};

export default VaccinationsPage;
