import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { FaPlus, FaArrowLeft, FaExchangeAlt, FaSave, FaFilePdf, FaSyringe, FaListAlt, FaEdit } from 'react-icons/fa';
import AnimalSelector from '../../../components/common/AnimalSelector/AnimalSelector';
import ImageUploader from '../../../components/common/ImageUploader/ImageUploader';
import { generateVaccinationPDF } from '../utils/exportVaccinationPDF';
import styles from '../components/VaccinationForm/VaccinationForm.module.css';
import formStyles from '../../forms/pages/FormsPage.module.css';
import '../../../styles/FloatingActions.css';
import { useAuth } from '../../../context/AuthContext';
import { createVaccinationApi, getVaccinationsForPatient, updateVaccinationApi } from '../../../services/vaccinationsService';
import { fetchPatientById } from '../../../services/patientsService';
import VaccinationSearch from '../components/VaccinationSearch/VaccinationSearch';
import Modal from '../../../components/common/Modal/Modal';
import modalStyles from '../../../components/common/Modal/Modal.module.css';

const MAX_RECORDS_PER_SHEET = 6;

const emptyRecord = {
    fecha: '',
    viaAdministracion: '',
    vacunaAplicada: '',
    proximaVacunacion: '',
    observaciones: '',
};

const VaccinationsPage = () => {
    const { user } = useAuth();
    const formRef = useRef(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [viewState, setViewState] = useState(() => {
        const v = searchParams.get('view');
        return ['selection', 'summary', 'form'].includes(v) ? v : 'menu';
    });
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [allRecords, setAllRecords] = useState({});
    const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
    const [, setRecordsLoading] = useState(false);
    const [recordsError, setRecordsError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState({ ...emptyRecord });
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [warningModal, setWarningModal] = useState({ isOpen: false, message: '' });
    const [isOpeningCalendar, setIsOpeningCalendar] = useState(false);

    const sheets = selectedAnimal ? (allRecords[selectedAnimal.id] || [[]]) : [[]];
    const records = sheets[currentSheetIndex] || [];

    const loadRecordsForAnimal = async (animal, targetSheetIndex = null) => {
        setRecordsLoading(true);
        setRecordsError('');
        try {
            const data = await getVaccinationsForPatient(animal);
            if (data.length > 0) {
                // Group by numCalendario (same pattern as deworming)
                const sheetsMap = {};
                data.forEach(r => {
                    const idx = (r.numCalendario || 1) - 1;
                    if (!sheetsMap[idx]) sheetsMap[idx] = [];
                    sheetsMap[idx].push({ ...r, _saved: true });
                });
                const loadedSheets = Object.keys(sheetsMap)
                    .sort((a, b) => a - b)
                    .map(k => sheetsMap[k]);

                if (targetSheetIndex !== null) {
                    // Navigate to a specific calendar (from VaccinationSearch)
                    setAllRecords(prev => ({ ...prev, [animal.id]: loadedSheets }));
                    setCurrentSheetIndex(Math.min(targetSheetIndex, loadedSheets.length - 1));
                } else {
                    const lastSheet = loadedSheets[loadedSheets.length - 1];
                    if (lastSheet.length >= MAX_RECORDS_PER_SHEET) {
                        // Last calendar is full — add a new empty one
                        setAllRecords(prev => ({ ...prev, [animal.id]: [...loadedSheets, []] }));
                        setCurrentSheetIndex(loadedSheets.length);
                    } else {
                        setAllRecords(prev => ({ ...prev, [animal.id]: loadedSheets }));
                        setCurrentSheetIndex(loadedSheets.length - 1);
                    }
                }
            } else {
                setAllRecords(prev => ({ ...prev, [animal.id]: [[]] }));
                setCurrentSheetIndex(0);
            }
        } catch (err) {
            setRecordsError(err?.message || 'Error al cargar registros');
            setAllRecords(prev => ({ ...prev, [animal.id]: [[]] }));
            setCurrentSheetIndex(0);
        } finally {
            setRecordsLoading(false);
        }
    };

    useEffect(() => {
        const v = searchParams.get('view');
        const animalId = searchParams.get('animalId');
        if (v === 'form' && animalId) {
            const mode = searchParams.get('mode');
            const restore = (animal) => mode === 'view' ? viewHistoryFor(animal) : handleAnimalSelect(animal);
            const cached = sessionStorage.getItem('balamya_animal_' + animalId);
            if (cached) { restore(JSON.parse(cached)); return; }
            fetchPatientById(animalId)
                .then(animal => {
                    if (animal) restore(animal);
                    else { setSearchParams({ view: 'selection' }); setViewState('selection'); }
                })
                .catch(() => { setSearchParams({ view: 'selection' }); setViewState('selection'); });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // --- Navigation ---
    const goToMenu = () => {
        setSearchParams({});
        setViewState('menu');
        setSelectedAnimal(null);
        setIsSaved(false);
    };

    const goToRegister = () => { setSearchParams({ view: 'selection' }); setViewState('selection'); };

    const goToSummary = () => { setSearchParams({ view: 'summary' }); setViewState('summary'); };

    const handleAnimalSelect = async (animal) => {
        setSelectedAnimal(animal);
        sessionStorage.setItem('balamya_animal_' + animal.id, JSON.stringify(animal));
        setSearchParams({ view: 'form', animalId: animal.id });
        setViewState('form');
        setIsSaved(false);
        setIsViewMode(false);
        setAllRecords(prev => ({ ...prev, [animal.id]: [[]] }));
        setCurrentSheetIndex(0);
        await loadRecordsForAnimal(animal);
    };

    const handleChangeAnimal = () => {
        setSelectedAnimal(null);
        setIsSaved(false);
        setSearchParams({ view: 'selection' });
        setViewState('selection');
    };

    const viewHistoryFor = async (patient, calendarIndex = null) => {
        sessionStorage.setItem('balamya_animal_' + patient.id, JSON.stringify(patient));
        setSearchParams({ view: 'form', animalId: patient.id, mode: 'view' });
        setSelectedAnimal(patient);
        setViewState('form');
        setIsSaved(true);
        setIsViewMode(true);
        setAllRecords(prev => ({ ...prev, [patient.id]: [[]] }));
        setCurrentSheetIndex(0);
        await loadRecordsForAnimal(patient, calendarIndex);
    };

    // --- Record CRUD ---
    const handleRecordChange = (e) => {
        const { name, value } = e.target;
        setCurrentRecord(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        const hasPending = records.some(r => r._pending);
        if (hasPending) {
            setWarningModal({ isOpen: true, message: 'Por favor guarda el registro que acabas de crear, antes de crear un nuevo registro.' });
            return;
        }
        setCurrentRecord({ ...emptyRecord });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentRecord({ ...emptyRecord });
        setEditingId(null);
    };

    const openEditModal = (rec) => {
        setCurrentRecord({
            fecha: rec.fecha || '',
            viaAdministracion: rec.viaAdministracion || '',
            vacunaAplicada: rec.vacunaAplicada || '',
            proximaVacunacion: rec.proximaVacunacion || '',
            observaciones: rec.observaciones || '',
            ubicacion: rec.ubicacion || '',
            mvzResponsable: rec.mvzResponsable || '',
        });
        setEditingId(rec.id);
        setIsModalOpen(true);
    };

    // Crear: agrega a la tabla local, NO llama al API aún
    const handleSaveRecord = () => {
        if (!currentRecord.fecha || !currentRecord.vacunaAplicada || !currentRecord.viaAdministracion) {
            alert('Por favor, completa la Fecha, Vacuna Aplicada y Vía de Administración.');
            return;
        }
        const newRecord = { ...currentRecord, _pending: true, mvzResponsable: user?.name || '' };
        const updatedSheets = sheets.map((sheet, idx) => {
            if (idx !== currentSheetIndex) return sheet;
            return [...sheet, newRecord];
        });
        setAllRecords(prev => ({ ...prev, [selectedAnimal.id]: updatedSheets }));
        setIsSaved(false);
        closeModal();
    };

    // Editar: llama directamente al PUT API
    const handleUpdateRecord = async () => {
        if (!currentRecord.fecha || !currentRecord.vacunaAplicada) {
            alert('Fecha y Vacuna Aplicada son obligatorios.');
            return;
        }
        setIsSaving(true);
        try {
            await updateVaccinationApi(editingId, currentRecord);
            await loadRecordsForAnimal(selectedAnimal, currentSheetIndex);
            closeModal();
        } catch (err) {
            if (err.status === 403) {
                alert('No tienes permiso para editar este registro.');
            } else {
                alert('No se pudo actualizar: ' + (err?.message || 'Error desconocido'));
            }
        } finally {
            setIsSaving(false);
        }
    };

    // Botón flotante: guarda todos los registros pendientes al servidor
    const handleSave = async () => {
        const pending = records.filter(r => r._pending);
        if (pending.length === 0) {
            alert('No hay registros nuevos por guardar.');
            return;
        }
        setIsSaving(true);
        try {
            const numCalendario = currentSheetIndex + 1;
            for (const record of pending) {
                await createVaccinationApi(selectedAnimal, record, numCalendario);
            }
            await loadRecordsForAnimal(selectedAnimal);
            setIsSaved(true);
            if (records.length >= MAX_RECORDS_PER_SHEET) {
                setIsOpeningCalendar(true);
                setTimeout(() => {
                    setAllRecords(prev => {
                        const currentSheets = prev[selectedAnimal.id] || [[]];
                        return { ...prev, [selectedAnimal.id]: [...currentSheets, []] };
                    });
                    setCurrentSheetIndex(prev => prev + 1);
                    setIsSaved(false);
                    setIsOpeningCalendar(false);
                }, 1800);
            } else {
                alert('Registros guardados correctamente.');
            }
        } catch (error) {
            alert('No se pudo guardar: ' + (error?.message || 'Error desconocido'));
        } finally {
            setIsSaving(false);
        }
    };

    const getPatientData = () => ({
        nombreCientifico: selectedAnimal.scientificName || '',
        nombreComun: selectedAnimal.commonName || '',
        nombreIndividual: selectedAnimal.name || '',
        sexo: selectedAnimal.sex || '',
        edad: selectedAnimal.age ? `${selectedAnimal.age} años` : '',
        ubicacion: selectedAnimal.location || '',
        identificacion: selectedAnimal.id || '',
    });

    const handleExportPDF = () => {
        const el = formRef.current;
        if (!el) return;
        const getLogoSrc = (selector) => {
            const img = el.querySelector(`${selector} img[class*="uploaded-image"]`);
            return img ? img.src : null;
        };
        generateVaccinationPDF(getPatientData(), records, {
            logoLeft: getLogoSrc('.header-logo-left'),
            logoRight: getLogoSrc('.header-logo-right'),
        });
    };

    // ==========================================
    // VIEW: MENU
    // ==========================================
    if (viewState === 'menu') {
        return (
            <div className={`${formStyles['forms-page-wrapper']} ${formStyles['module-menu-wrapper']}`}>
                <div className={formStyles['forms-page-container']}>
                    <div className={formStyles['forms-page-header']} style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 className={formStyles['forms-page-title']} style={{ fontSize: '2.5rem' }}>Vacunaciones</h1>
                        <p className={formStyles['forms-page-subtitle']}>¿Qué deseas hacer?</p>
                    </div>
                    <div className={formStyles['module-menu-grid']}>
                        <div className={`${formStyles['form-card']} ${formStyles['form-card-vaccination']} ${formStyles['module-menu-card']}`} onClick={goToRegister}>
                            <div className={`${formStyles['form-card-content']} ${formStyles['module-menu-card-content']}`}>
                                <FaSyringe className={`${formStyles['form-card-icon']} ${formStyles['module-menu-icon']}`} style={{ color: '#dc3545' }} />
                                <div className={formStyles['form-card-text']}>
                                    <h3 className={`${formStyles['form-card-title']} ${formStyles['module-menu-title']}`}>REGISTRAR VACUNACIÓN</h3>
                                    <p className={`${formStyles['form-card-description']} ${formStyles['module-menu-desc']}`}>Selecciona un ejemplar y registra una nueva vacunación en su historial clínico.</p>
                                </div>
                            </div>
                        </div>
                        <div className={`${formStyles['form-card']} ${formStyles['form-card-vaccination']} ${formStyles['module-menu-card']}`} onClick={goToSummary}>
                            <div className={`${formStyles['form-card-content']} ${formStyles['module-menu-card-content']}`}>
                                <FaListAlt className={`${formStyles['form-card-icon']} ${formStyles['module-menu-icon']}`} style={{ color: '#dc3545' }} />
                                <div className={formStyles['form-card-text']}>
                                    <h3 className={`${formStyles['form-card-title']} ${formStyles['module-menu-title']}`}>VER VACUNACIONES</h3>
                                    <p className={`${formStyles['form-card-description']} ${formStyles['module-menu-desc']}`}>Consulta el resumen de vacunaciones de todos los pacientes y accede a su historial.</p>
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
    // VIEW: SUMMARY
    // ==========================================
    if (viewState === 'summary') {
        const handleSummaryPatientSelect = (patient) => {
            if (patient) {
                sessionStorage.setItem('balamya_animal_' + patient.id, JSON.stringify(patient));
                setSearchParams({ view: 'summary', patientId: patient.id });
            } else setSearchParams({ view: 'summary' });
        };
        return (
            <VaccinationSearch
                onBack={goToMenu}
                onViewVaccinations={viewHistoryFor}
                initialPatientId={searchParams.get('patientId')}
                onPatientSelect={handleSummaryPatientSelect}
            />
        );
    }

    // ==========================================
    // VIEW: VACCINATION FORM
    // ==========================================
    if (!selectedAnimal) return null;

    const hasPending = records.some(r => r._pending);

    return (
        <>
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

                    {!isViewMode && (
                        <div className={styles['add-record-button-container']}>
                            <button onClick={openAddModal} className={styles['add-record-button']}>
                                <FaPlus /> Agregar Registro
                            </button>
                        </div>
                    )}


                    <div className={styles['table-container']}>
                        {recordsError ? (
                            <p style={{ textAlign: 'center', padding: '30px', color: '#ef4444' }}>Error: {recordsError}</p>
                        ) : (
                            <table className={styles['vaccination-table']}>
                                <thead>
                                    <tr>
                                        <th>FECHA</th>
                                        <th>VÍA DE ADMINISTRACIÓN</th>
                                        <th>VACUNA APLICADA (o producto biológico)</th>
                                        <th>PRÓXIMA VACUNACIÓN</th>
                                        <th>OBSERVACIONES</th>
                                        {isViewMode && <th>MVZ RESPONSABLE</th>}
                                        {isViewMode && <th>ACCIONES</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.length === 0 ? (
                                        <tr><td colSpan={isViewMode ? 7 : 5} className={styles['no-records-cell']}>No hay registros</td></tr>
                                    ) : (
                                        records.map((rec, index) => (
                                            <tr key={rec.id || index}>
                                                <td>{rec.fecha}</td>
                                                <td>{rec.viaAdministracion}</td>
                                                <td>{rec.vacunaAplicada}</td>
                                                <td>{rec.proximaVacunacion}</td>
                                                <td>{rec.observaciones}</td>
                                                {isViewMode && <td>{rec.mvzResponsable}</td>}
                                                {isViewMode && (
                                                    <td onClick={(e) => e.stopPropagation()}>
                                                        {(user?.role === 'admin' || (rec.idUsuario != null && user?.idUsuario != null && String(rec.idUsuario) === String(user.idUsuario))) && (
                                                            <button
                                                                className={styles['edit-record-btn']}
                                                                onClick={() => openEditModal(rec)}
                                                                title="Editar registro"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="floating-actions">
                        {isViewMode ? (
                            <button className="floating-btn pdf-btn" onClick={handleExportPDF} title="Descargar PDF">
                                <FaFilePdf />
                            </button>
                        ) : !isSaved || hasPending ? (
                            <button className="floating-btn save-btn" onClick={handleSave} title="Guardar" disabled={isSaving}>
                                <FaSave />
                            </button>
                        ) : (
                            <button className="floating-btn pdf-btn" onClick={handleExportPDF} title="Descargar PDF">
                                <FaFilePdf />
                            </button>
                        )}
                    </div>
                </div>

                {isModalOpen && ReactDOM.createPortal(
                    <div className={styles['modal-overlay']} onClick={closeModal}>
                        <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
                            <h3 className={styles['modal-title']}>
                                {editingId ? 'Editar Registro de Vacunación' : 'Nuevo Registro de Vacunación'}
                            </h3>
                            <div className={styles['modal-form-grid']}>
                                <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Fecha *</label><input type="date" className={styles['vaccination-form-input']} style={{ color: currentRecord.fecha ? 'inherit' : 'transparent', textAlign: 'center', textAlignLast: 'center' }} name="fecha" value={currentRecord.fecha} onChange={handleRecordChange} /></div>
                                <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Vía de Administración *</label><input type="text" className={styles['vaccination-form-input']} name="viaAdministracion" value={currentRecord.viaAdministracion} onChange={handleRecordChange} /></div>
                                <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Vacuna Aplicada *</label><input type="text" className={styles['vaccination-form-input']} name="vacunaAplicada" value={currentRecord.vacunaAplicada} onChange={handleRecordChange} /></div>
                                <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Próxima Vacunación</label><input type="date" className={styles['vaccination-form-input']} style={{ color: currentRecord.proximaVacunacion ? 'inherit' : 'transparent', textAlign: 'center', textAlignLast: 'center' }} name="proximaVacunacion" value={currentRecord.proximaVacunacion} onChange={handleRecordChange} /></div>
                                <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Observaciones</label><input type="text" className={styles['vaccination-form-input']} name="observaciones" value={currentRecord.observaciones} onChange={handleRecordChange} /></div>
                            </div>
                            <div className={styles['modal-actions']}>
                                <button onClick={closeModal} className={`${styles['footer-button']} ${styles['cancel-button']}`}>Cancelar</button>
                                <button
                                    onClick={editingId ? handleUpdateRecord : handleSaveRecord}
                                    className={`${styles['footer-button']} ${styles['save-button']}`}
                                    disabled={isSaving}
                                >
                                    {editingId ? 'Actualizar' : 'Aceptar'}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </div>
        <Modal
            isOpen={warningModal.isOpen}
            onClose={() => setWarningModal({ isOpen: false, message: '' })}
            title="Atención"
            footer={
                <button
                    className={`${modalStyles['btn-modal']} ${modalStyles['btn-confirm']}`}
                    onClick={() => setWarningModal({ isOpen: false, message: '' })}
                >
                    Entendido
                </button>
            }
        >
            {warningModal.message}
        </Modal>
        <Modal isOpen={isOpeningCalendar} onClose={null} title="Registro guardado">
            <div className={modalStyles['loading-body']}>
                <div className={modalStyles['loading-spinner']} />
                <p className={modalStyles['loading-text']}>Espere un momento, estamos abriendo el nuevo calendario.</p>
            </div>
        </Modal>
        </>
    );
};

export default VaccinationsPage;
