import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import AnimalSelector from '../../../components/common/AnimalSelector/AnimalSelector';
import { generateDewormingPDF } from '../utils/exportDewormingPDF';
import formStyles from '../../forms/pages/FormsPage.module.css';
import {
    createDewormingApi,
    getDewormingsByAnimal,
    updateDewormingApi,
} from '../../../services/dewormingService';
import { useAuth } from '../../../context/AuthContext';
import { fetchPatientById } from '../../../services/patientsService';
import DewormingMenu from '../components/DewormingMenu/DewormingMenu';
import DewormingSearch from '../components/DewormingSearch/DewormingSearch';
import DewormingCalendarView from '../components/DewormingCalendarView/DewormingCalendarView';
import Modal from '../../../components/common/Modal/Modal';
import modalStyles from '../../../components/common/Modal/Modal.module.css';

const MAX_RECORDS_PER_SHEET = 12;

const normalizeRecord = (r, patientId) => ({
    fecha:            r.fecha                   || '',
    principioActivo:  r.principio_activo        || '',
    productoComercial:r.producto_comercial       || '',
    dosisMgKg:        r.dosis_mg_kg             || '',
    dosisTotal:       r.dosis_total             || '',
    via:              r.via_administracion       || '',
    frecuencia:       r.frecuencia              || '',
    proxima:          r.proxima_desparasitacion  || '',
    peso:             r.peso != null ? String(r.peso) : '',
    estadoFisiologico:r.estado_fisiologico       || '',
    idCalendario:     r.id_calendario            || r.id || null,
    registradoPor:    r.nombre_usuario           || '',
    idUsuario:        r.id_usuario               || null,
    patientId,
    _saved: true,
});

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
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [viewState, setViewState] = useState(() => {
        const v = searchParams.get('view');
        return ['selection', 'summary', 'form'].includes(v) ? v : 'menu';
    });
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [allRecords, setAllRecords] = useState({});
    const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState({ ...emptyRecord });
    const [editingIndex, setEditingIndex] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [editableGrupo, setEditableGrupo] = useState('');
    const [editablePeso, setEditablePeso] = useState('');
    const [editableEstadoFisiologico, setEditableEstadoFisiologico] = useState('');
    const [isViewMode, setIsViewMode] = useState(false);
    const [previousView, setPreviousView] = useState('menu');
    const [selectedRow, setSelectedRow] = useState(null);
    const [isEditingSaved, setIsEditingSaved] = useState(false);
    const [warningModal, setWarningModal] = useState({ isOpen: false, message: '' });
    const [isOpeningCalendar, setIsOpeningCalendar] = useState(false);
    const [isLoadingRecords, setIsLoadingRecords] = useState(false);

    const sheets = selectedAnimal ? (allRecords[selectedAnimal.id] || [[]]) : [[]];
    const records = sheets[currentSheetIndex] || [];

    useEffect(() => {
        if (!isViewMode || !selectedRow) return;

        if (selectedRow.sheetIndex !== currentSheetIndex) return;

        const selectedRecord = records[selectedRow.recordIndex];
        if (!selectedRecord) {
            setSelectedRow(null);
            return;
        }

        setEditablePeso(selectedRecord.peso || '');
        setEditableEstadoFisiologico(selectedRecord.estadoFisiologico || '');
    }, [currentSheetIndex, isViewMode, records, selectedRow]);

    useEffect(() => {
        const v = searchParams.get('view');
        const animalId = searchParams.get('animalId');
        if (v === 'form' && animalId) {
            const mode = searchParams.get('mode');
            const restore = (animal) => mode === 'view' ? viewCalendarFor(animal, 0) : handleAnimalSelect(animal);
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
        setSelectedRow(null);
    };

    const goToRegister = () => {
        setSearchParams({ view: 'selection' });
        setViewState('selection');
    };

    const goToSummary = () => { setSearchParams({ view: 'summary' }); setViewState('summary'); };

    const handleAnimalSelect = async (animal) => {
        setSelectedAnimal(animal);
        sessionStorage.setItem('balamya_animal_' + animal.id, JSON.stringify(animal));
        setSearchParams({ view: 'form', animalId: animal.id });
        setEditableGrupo(animal.category || '');
        setEditablePeso(animal.weight ? String(animal.weight) : '');
        setEditableEstadoFisiologico('');
        setSelectedRow(null);
        setCurrentSheetIndex(0);
        setAllRecords(prev => ({ ...prev, [animal.id]: [[]] }));
        setPreviousView('selection');
        setViewState('form');
        setIsSaved(false);
        setIsViewMode(false);
        setIsLoadingRecords(true);
        try {
            const idEjemplar = animal.idEjemplar || animal.id;
            const existing = await getDewormingsByAnimal(idEjemplar);
            if (existing.length > 0) {
                const sheetsMap = {};
                existing.forEach(r => {
                    const idx = (r.num_calendario || 1) - 1;
                    if (!sheetsMap[idx]) sheetsMap[idx] = [];
                    sheetsMap[idx].push(normalizeRecord(r, animal.id));
                });
                const loadedSheets = Object.keys(sheetsMap)
                    .sort((a, b) => a - b)
                    .map(k => sheetsMap[k]);
                const lastSheet = loadedSheets[loadedSheets.length - 1];
                if (lastSheet.length < MAX_RECORDS_PER_SHEET) {
                    setAllRecords(prev => ({ ...prev, [animal.id]: loadedSheets }));
                    setCurrentSheetIndex(loadedSheets.length - 1);
                } else {
                    setAllRecords(prev => ({ ...prev, [animal.id]: [...loadedSheets, []] }));
                    setCurrentSheetIndex(loadedSheets.length);
                }
            }
        } catch (err) {
            console.warn('No se pudieron cargar registros existentes:', err.message);
        } finally {
            setIsLoadingRecords(false);
        }
    };

    const handleChangeAnimal = () => {
        setSelectedAnimal(null);
        setSearchParams({ view: 'selection' });
        setViewState('selection');
        setIsSaved(false);
        setSelectedRow(null);
    };


    const viewCalendarFor = async (patient, calendarIndex) => {
        sessionStorage.setItem('balamya_animal_' + patient.id, JSON.stringify(patient));
        setSearchParams({ view: 'form', animalId: patient.id, mode: 'view' });
        setSelectedAnimal(patient);
        setEditableGrupo(patient.category || '');
        setEditablePeso(patient.weight ? `${patient.weight} kg` : '');
        setEditableEstadoFisiologico('');
        setSelectedRow(null);
        setCurrentSheetIndex(0);
        setAllRecords(prev => ({ ...prev, [patient.id]: [[]] }));
        setPreviousView('summary');
        setViewState('form');
        setIsSaved(true);
        setIsViewMode(true);
        setIsLoadingRecords(true);
        try {
            const idEjemplar = patient.idEjemplar || patient.id;
            const existing = await getDewormingsByAnimal(idEjemplar);
            if (existing.length > 0) {
                const sheetsMap = {};
                existing.forEach(r => {
                    const idx = (r.num_calendario || 1) - 1;
                    if (!sheetsMap[idx]) sheetsMap[idx] = [];
                    sheetsMap[idx].push(normalizeRecord(r, patient.id));
                });
                const loadedSheets = Object.keys(sheetsMap)
                    .sort((a, b) => a - b)
                    .map(k => sheetsMap[k]);
                setAllRecords(prev => ({ ...prev, [patient.id]: loadedSheets }));
                setCurrentSheetIndex(Math.min(calendarIndex, loadedSheets.length - 1));
            }
        } catch (err) {
            console.warn('No se pudieron cargar registros:', err.message);
        } finally {
            setIsLoadingRecords(false);
        }
    };

    // --- Record CRUD ---
    const handleRecordChange = (e) => {
        const { name, value } = e.target;
        setCurrentRecord(prev => ({ ...prev, [name]: value }));
    };

    const handleRowSelect = (recordIndex) => {
        const selectedRecord = records[recordIndex];
        if (!selectedRecord) return;

        setSelectedRow({ sheetIndex: currentSheetIndex, recordIndex });
        setEditablePeso(selectedRecord.peso || '');
        setEditableEstadoFisiologico(selectedRecord.estadoFisiologico || '');
    };

    const openAddModal = async () => {
        if (!editablePeso || !editableEstadoFisiologico) {
            alert('Completa el Peso y el Estado Fisiológico antes de agregar un registro.');
            return;
        }
        const hasUnsaved = records.some(r => !r._saved);
        if (hasUnsaved) {
            setWarningModal({ isOpen: true, message: 'Por favor guarda el registro que acabas de crear, antes de crear un nuevo registro.' });
            return;
        }
        setCurrentRecord({ ...emptyRecord });
        setEditingIndex(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentRecord({ ...emptyRecord });
        setEditingIndex(null);
        setIsEditingSaved(false);
    };

    const openEditModalForSaved = (recordIndex) => {
        const rec = records[recordIndex];
        if (!rec) return;
        setCurrentRecord({
            fecha: rec.fecha || '',
            principioActivo: rec.principioActivo || '',
            productoComercial: rec.productoComercial || '',
            dosisMgKg: rec.dosisMgKg || '',
            dosisTotal: rec.dosisTotal || '',
            via: rec.via || '',
            frecuencia: rec.frecuencia || '',
            proxima: rec.proxima || '',
            peso: rec.peso || '',
            estadoFisiologico: rec.estadoFisiologico || '',
            idCalendario: rec.idCalendario,
            numCalendario: currentSheetIndex + 1,
        });
        setEditingIndex(recordIndex);
        setIsEditingSaved(true);
        setIsModalOpen(true);
    };

    const handleSaveRecord = async () => {
        const missing = [];
        if (!currentRecord.fecha) missing.push('Fecha');
        if (!currentRecord.principioActivo) missing.push('Principio Activo');
        if (!currentRecord.productoComercial) missing.push('Producto Comercial');
        if (!currentRecord.dosisMgKg) missing.push('Dosis mg/kg');
        if (!currentRecord.dosisTotal) missing.push('Dosis Total');
        if (!currentRecord.via) missing.push('Vía de Administración');
        if (!currentRecord.frecuencia) missing.push('Frecuencia');
        if (missing.length > 0) {
            alert('Los siguientes campos son obligatorios:\n- ' + missing.join('\n- '));
            return;
        }

        if (isEditingSaved) {
            try {
                const payload = {
                    fecha: currentRecord.fecha,
                    principioActivo: currentRecord.principioActivo,
                    productoComercial: currentRecord.productoComercial,
                    dosisMgKg: currentRecord.dosisMgKg,
                    dosisTotal: currentRecord.dosisTotal,
                    viaAdministracion: currentRecord.via,
                    frecuencia: currentRecord.frecuencia,
                    grupo: editableGrupo,
                    peso: currentRecord.peso ? Number(currentRecord.peso) : undefined,
                    ubicacion: selectedAnimal.location,
                    estadoFisiologico: currentRecord.estadoFisiologico,
                    proximaDesparasitacion: currentRecord.proxima,
                    numCalendario: currentSheetIndex + 1,
                };
                await updateDewormingApi(currentRecord.idCalendario, payload);
                const updatedSheets = sheets.map((sheet, idx) => {
                    if (idx !== currentSheetIndex) return sheet;
                    return sheet.map((r, i) => {
                        if (i !== editingIndex) return r;
                        return {
                            ...r,
                            fecha: currentRecord.fecha,
                            principioActivo: currentRecord.principioActivo,
                            productoComercial: currentRecord.productoComercial,
                            dosisMgKg: currentRecord.dosisMgKg,
                            dosisTotal: currentRecord.dosisTotal,
                            via: currentRecord.via,
                            frecuencia: currentRecord.frecuencia,
                            proxima: currentRecord.proxima,
                            peso: currentRecord.peso,
                            estadoFisiologico: currentRecord.estadoFisiologico,
                        };
                    });
                });
                setAllRecords(prev => ({ ...prev, [selectedAnimal.id]: updatedSheets }));
                closeModal();
                alert('Registro actualizado correctamente.');
            } catch (error) {
                if (error.status === 403) {
                    alert('No tienes permiso para editar este registro.');
                } else {
                    alert(error.message);
                }
            }
            return;
        }

        const recordWithPatient = { ...currentRecord, patientId: selectedAnimal.id };
        const updatedSheets = sheets.map((sheet, idx) => {
            if (idx !== currentSheetIndex) return sheet;
            const updated = [...sheet];
            if (editingIndex !== null) {
                updated[editingIndex] = recordWithPatient;
            } else {
                updated.push(recordWithPatient);
            }
            return updated;
        });
        setAllRecords(prev => ({ ...prev, [selectedAnimal.id]: updatedSheets }));
        setIsSaved(false);
        closeModal();
    };

    // --- Save & PDF ---
    const handleSave = async () => {
        if (editablePeso !== '' && isNaN(Number(editablePeso))) {
            alert('El campo Peso (kg) solo acepta números.\nEjemplo: 12.5');
            return;
        }
        const missingGeneral = [];
        if (!editablePeso) missingGeneral.push('Peso');
        if (!editableEstadoFisiologico) missingGeneral.push('Estado Fisiológico');
        if (missingGeneral.length > 0) {
            alert('Los siguientes campos son obligatorios:\n- ' + missingGeneral.join('\n- '));
            return;
        }
        const newRecords = records.filter(r => !r._saved);
        if (newRecords.length === 0) {
            alert('No hay registros nuevos que guardar.');
            return;
        }
        try {
            const numCalendario = currentSheetIndex + 1;
            for (const record of newRecords) {
                await createDewormingApi(selectedAnimal, record, {
                    grupo: editableGrupo,
                    peso: editablePeso,
                    ubicacion: selectedAnimal.location,
                    estadoFisiologico: editableEstadoFisiologico,
                    idUsuario: user?.id,
                }, numCalendario);
            }
            const savedSheets = sheets.map((sheet, idx) => {
                if (idx !== currentSheetIndex) return sheet;
                return sheet.map(r => ({ ...r, _saved: true }));
            });
            setAllRecords(prev => ({ ...prev, [selectedAnimal.id]: savedSheets }));
            setIsSaved(true);
            setEditablePeso('');
            setEditableEstadoFisiologico('');
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
                alert('Registros guardados y enviados al servidor correctamente.');
            }
        } catch (error) {
            console.error('Error al enviar al servidor:', error);
            alert(`⚠️ No se pudo enviar al servidor: ${error.message}`);
        }
    };

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
        const generalData = {
            grupo: editableGrupo,
            nombreCientifico: selectedAnimal.scientificName || '',
            nombreComun: selectedAnimal.commonName || '',
            peso: editablePeso,
            edad: selectedAnimal.age ? `${selectedAnimal.age} años` : '',
            identificacion: selectedAnimal.id || '',
            ubicacion: selectedAnimal.location || '',
            sexo: selectedAnimal.sex || '',
            estadoFisiologico: editableEstadoFisiologico,
        };
        generateDewormingPDF(generalData, records, formRefs);
    };

    // ==========================================
    // RENDER
    // ==========================================
    if (viewState === 'menu') {
        return <DewormingMenu onRegister={goToRegister} onViewSummary={goToSummary} />;
    }

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

    if (viewState === 'summary') {
        const handleSummaryPatientSelect = (patient) => {
            if (patient) {
                sessionStorage.setItem('balamya_animal_' + patient.id, JSON.stringify(patient));
                setSearchParams({ view: 'summary', patientId: patient.id });
            } else setSearchParams({ view: 'summary' });
        };
        return (
            <DewormingSearch
                onBack={goToMenu}
                onViewCalendar={viewCalendarFor}
                initialPatientId={searchParams.get('patientId')}
                onPatientSelect={handleSummaryPatientSelect}
            />
        );
    }

    if (!selectedAnimal) return null;

    const registradoresActuales = [...new Set(records.map(r => r.registradoPor).filter(Boolean))];

    return (
        <>
            <DewormingCalendarView
                selectedAnimal={selectedAnimal}
                onBack={previousView === 'summary' ? goToSummary : goToMenu}
                onChangeAnimal={handleChangeAnimal}
                formRef={formRef}
                editableGrupo={editableGrupo}
                editablePeso={editablePeso}
                onPesoChange={setEditablePeso}
                editableEstadoFisiologico={editableEstadoFisiologico}
                onEstadoChange={setEditableEstadoFisiologico}
                sheets={sheets}
                currentSheetIndex={currentSheetIndex}
                onSheetIndexChange={setCurrentSheetIndex}
                onSetSaved={setIsSaved}
                isViewMode={isViewMode}
                isSaved={isSaved}
                records={records}
                registradoresActuales={registradoresActuales}
                onAddRecord={openAddModal}
                isModalOpen={isModalOpen}
                currentRecord={currentRecord}
                onRecordChange={handleRecordChange}
                onSaveRecord={handleSaveRecord}
                onCloseModal={closeModal}
                editingIndex={editingIndex}
                onSave={handleSave}
                onExportPDF={handleExportPDF}
                selectedRow={selectedRow}
                onSelectRow={handleRowSelect}
                onEditRecord={openEditModalForSaved}
                isEditingSaved={isEditingSaved}
                currentUserId={user?.idUsuario ?? user?.id}
                isAdmin={user?.role === 'admin'}
                isLoadingRecords={isLoadingRecords}
            />
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

export default DewormingPage;
