import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaExchangeAlt, FaSave, FaFilePdf, FaBug, FaListAlt, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import AnimalSelector from '../components/dashboard/AnimalSelector';
import ImageUploader from '../components/common/ImageUploader';
import { generateDewormingPDF } from '../utils/exportDewormingPDF';
import { patients } from '../data/mockData';
import styles from '../styles/DewormingCalendar.module.css';
import formStyles from '../styles/FormsPage.module.css';
import recordStyles from '../styles/RecordsTable.module.css';
import customStyles from '../styles/CustomTable.module.css';
import hospStyles from '../styles/HospitalizationPage.module.css';
import '../styles/FloatingActions.css';

const emptyRecord = {
    fecha: '',
    principioActivo: '',
    dosisMgKg: '',
    productoComercial: '',
    dosisTotal: '',
    via: '',
    frecuencia: '',
    proxima: ''
};

const DewormingPage = () => {
    const formRef = useRef(null);
    const navigate = useNavigate();
    const [viewState, setViewState] = useState('menu');
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [allRecords, setAllRecords] = useState(() => {
        try {
            const saved = localStorage.getItem('balamya_deworming_records');
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
        localStorage.setItem('balamya_deworming_records', JSON.stringify(allRecords));
    }, [allRecords]);

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
        if (!currentRecord.fecha || !currentRecord.principioActivo) {
            alert('Por favor, complete al menos la fecha y el principio activo.');
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
        localStorage.setItem('balamya_deworming_records', JSON.stringify(allRecords));
        setIsSaved(true);
        alert('✅ Registros guardados correctamente.');
    };

    const getGeneralData = () => ({
        grupo: selectedAnimal.category || '',
        nombreCientifico: selectedAnimal.scientificName || '',
        nombreComun: selectedAnimal.commonName || '',
        peso: selectedAnimal.weight ? `${selectedAnimal.weight} kg` : '',
        edad: selectedAnimal.age ? `${selectedAnimal.age} años` : '',
        identificacion: selectedAnimal.id || '',
        ubicacion: selectedAnimal.location || '',
        sexo: selectedAnimal.sex || '',
        estadoFisiologico: ''
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
        generateDewormingPDF(getGeneralData(), records, formRefs);
    };



    // --- Summary data ---
    const getSummaryData = () => {
        return patients.map(p => {
            const recs = allRecords[p.id] || [];
            const lastRecord = recs.length > 0 ? recs[recs.length - 1] : null;
            return {
                patient: p,
                totalRecords: recs.length,
                lastDeworming: lastRecord ? (lastRecord.fecha || null) : null,
                nextDeworming: lastRecord ? (lastRecord.proxima || null) : null
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
                        <h1 className={formStyles['forms-page-title']} style={{ fontSize: '2.5rem' }}>Desparasitaciones</h1>
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
                        <div className={`${formStyles['form-card']} ${formStyles['form-card-deworming']}`} onClick={goToRegister} style={{ cursor: 'pointer', minHeight: '350px' }}>
                            <div className={formStyles['form-card-content']} style={{ flexDirection: 'column', textAlign: 'center', justifyContent: 'center', gap: '25px' }}>
                                <FaBug className={formStyles['form-card-icon']} style={{ color: '#28a745', fontSize: '72px' }} />
                                <div className={formStyles['form-card-text']} style={{ textAlign: 'center' }}>
                                    <h3 className={formStyles['form-card-title']} style={{ fontSize: '1.5rem', marginBottom: '15px' }}>REGISTRAR DESPARASITACIÓN</h3>
                                    <p className={formStyles['form-card-description']} style={{ fontSize: '1.1rem' }}>Selecciona un ejemplar y registra una nueva desparasitación en su historial clínico.</p>
                                </div>
                            </div>
                        </div>
                        <div className={`${formStyles['form-card']} ${formStyles['form-card-deworming']}`} onClick={goToSummary} style={{ cursor: 'pointer', minHeight: '350px' }}>
                            <div className={formStyles['form-card-content']} style={{ flexDirection: 'column', textAlign: 'center', justifyContent: 'center', gap: '25px' }}>
                                <FaListAlt className={formStyles['form-card-icon']} style={{ color: '#28a745', fontSize: '72px' }} />
                                <div className={formStyles['form-card-text']} style={{ textAlign: 'center' }}>
                                    <h3 className={formStyles['form-card-title']} style={{ fontSize: '1.5rem', marginBottom: '15px' }}>VER DESPARASITACIONES</h3>
                                    <p className={formStyles['form-card-description']} style={{ fontSize: '1.1rem' }}>Consulta el resumen de desparasitaciones de todos los pacientes y accede a su historial.</p>
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
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Resumen de Desparasitaciones</h3>
                            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>{summaryData.length} PACIENTES</span>
                        </div>
                        <table className={customStyles['custom-table']}>
                            <thead>
                                <tr>
                                    <th>Animal</th>
                                    <th>Identificación</th>
                                    <th>Última Desparasitación</th>
                                    <th>Próxima Desparasitación</th>
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
                                            <td>{item.lastDeworming ? item.lastDeworming : <span className={customStyles['empty-value']}>Sin registro</span>}</td>
                                            <td>{item.nextDeworming ? item.nextDeworming : <span className={customStyles['empty-value']}>Pendiente</span>}</td>
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
    // VIEW: DEWORMING FORM
    // ==========================================
    return (
        <div className={formStyles['forms-page-wrapper']}>
            <div className={formStyles['form-entry-animation']}>
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

                <div className={`${styles['deworming-card']} global-form-width`} ref={formRef}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', width: '100%' }}>
                        <ImageUploader placeholderText="Logo" className="header-logo-left" />
                        <div className={styles['deworming-header']} style={{ flex: 1, textAlign: 'center' }}>
                            <div className={styles['deworming-header-subtitle']} style={{ marginBottom: '5px' }}>MANTENIMIENTO PREVENTIVO</div>
                            <div className={styles['deworming-header-title']}>CALENDARIO DE DESPARASITACIÓN</div>
                        </div>
                        <ImageUploader placeholderText="Logo" className="header-logo-right" />
                    </div>

                    <h4>DATOS GENERALES</h4>
                    <div className={styles['deworming-form-grid']}>
                        <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>GRUPO</label><input type="text" className={styles['deworming-form-input']} value={selectedAnimal.category || ''} readOnly /></div>
                        <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>NOMBRE CIENTÍFICO</label><input type="text" className={styles['deworming-form-input']} value={selectedAnimal.scientificName || ''} readOnly /></div>
                        <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>NOMBRE COMÚN</label><input type="text" className={styles['deworming-form-input']} value={selectedAnimal.commonName || ''} readOnly /></div>
                        <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>SEXO</label><input type="text" className={styles['deworming-form-input']} value={selectedAnimal.sex || ''} readOnly /></div>
                        <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>EDAD</label><input type="text" className={styles['deworming-form-input']} value={selectedAnimal.age ? `${selectedAnimal.age} años` : ''} readOnly /></div>
                        <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>IDENTIFICACIÓN</label><input type="text" className={styles['deworming-form-input']} value={selectedAnimal.id || ''} readOnly /></div>
                        <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>PESO</label><input type="text" className={styles['deworming-form-input']} value={selectedAnimal.weight ? `${selectedAnimal.weight} kg` : ''} readOnly /></div>
                        <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>UBICACIÓN</label><input type="text" className={styles['deworming-form-input']} value={selectedAnimal.location || ''} readOnly /></div>
                        <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>ESTADO FISIOLÓGICO</label><input type="text" className={styles['deworming-form-input']} value={''} readOnly /></div>
                    </div>

                    <div className={styles['add-record-button-container']}>
                        <button onClick={openAddModal} className={styles['add-record-button']}>
                            <FaPlus /> Agregar Registro
                        </button>
                    </div>

                    <div className={styles['table-container']}>
                        <table className={styles['deworming-table']}>
                            <thead>
                                <tr>
                                    <th>FECHA</th>
                                    <th>PRINCIPIO ACTIVO</th>
                                    <th>DOSIS MG/KG</th>
                                    <th>PRODUCTO COMERCIAL</th>
                                    <th>DOSIS TOTAL (ml o tabletas)</th>
                                    <th>VÍA DE ADMINISTRACIÓN</th>
                                    <th>FRECUENCIA</th>
                                    <th>PRÓXIMA DESPARASITACIÓN</th>
                                    <th>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.length === 0 ? (
                                    <tr><td colSpan="9" style={{ textAlign: 'center', fontStyle: 'italic', color: '#777' }}>No hay registros.</td></tr>
                                ) : (
                                    records.map((rec, index) => (
                                        <tr key={index}>
                                            <td>{rec.fecha}</td>
                                            <td>{rec.principioActivo}</td>
                                            <td>{rec.dosisMgKg}</td>
                                            <td>{rec.productoComercial}</td>
                                            <td>{rec.dosisTotal}</td>
                                            <td>{rec.via}</td>
                                            <td>{rec.frecuencia}</td>
                                            <td>{rec.proxima}</td>
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
                                {editingIndex !== null ? 'Editar Registro de Desparasitación' : 'Agregar Registro de Desparasitación'}
                            </h3>
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveRecord(); }}>
                                <div className={styles['modal-form-grid']}>
                                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>FECHA</label><input type="date" className={styles['deworming-form-input']} name="fecha" value={currentRecord.fecha} onChange={handleRecordChange} /></div>
                                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>PRINCIPIO ACTIVO</label><input type="text" className={styles['deworming-form-input']} name="principioActivo" value={currentRecord.principioActivo} onChange={handleRecordChange} /></div>
                                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>DOSIS MG/KG</label><input type="text" className={styles['deworming-form-input']} name="dosisMgKg" value={currentRecord.dosisMgKg} onChange={handleRecordChange} /></div>
                                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>PRODUCTO COMERCIAL</label><input type="text" className={styles['deworming-form-input']} name="productoComercial" value={currentRecord.productoComercial} onChange={handleRecordChange} /></div>
                                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>DOSIS TOTAL (ml o tabletas)</label><input type="text" className={styles['deworming-form-input']} name="dosisTotal" value={currentRecord.dosisTotal} onChange={handleRecordChange} /></div>
                                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>VÍA DE ADMINISTRACIÓN</label><input type="text" className={styles['deworming-form-input']} name="via" value={currentRecord.via} onChange={handleRecordChange} /></div>
                                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>FRECUENCIA</label><input type="text" className={styles['deworming-form-input']} name="frecuencia" value={currentRecord.frecuencia} onChange={handleRecordChange} /></div>
                                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>PRÓXIMA DESPARASITACIÓN</label><input type="date" className={styles['deworming-form-input']} name="proxima" value={currentRecord.proxima} onChange={handleRecordChange} /></div>
                                </div>

                                <div className={styles['modal-actions']}>
                                    <button type="button" className={`${styles['footer-button']} ${styles['cancel-button']}`} onClick={closeModal}>Cancelar</button>
                                    <button type="submit" className={`${styles['footer-button']} ${styles['save-button']}`}>
                                        {editingIndex !== null ? 'Actualizar' : 'Guardar Registro'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </div>
    );
};

export default DewormingPage;
