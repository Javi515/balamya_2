import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import styles from '../../styles/VaccinationForm.module.css';

import '../../styles/FloatingActions.css';
import { FaPlus, FaFilePdf, FaSave } from 'react-icons/fa';
import ImageUploader from '../common/ImageUploader';
import { generateVaccinationPDF } from '../../utils/exportVaccinationPDF';

const VaccinationForm = () => {
    const formRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [patientData, setPatientData] = useState({
        nombreCientifico: '',
        nombreComun: '',
        nombreIndividual: '',
        sexo: '',
        edad: '',
        ubicacion: '',
        identificacion: ''
    });
    const [records, setRecords] = useState([]);
    const [newRecord, setNewRecord] = useState({
        fecha: '',
        viaAdministracion: '',
        vacunaAplicada: '',
        mvzResponsable: '',
        proximaVacunacion: '',
        observaciones: ''
    });

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setNewRecord({
            fecha: '',
            viaAdministracion: '',
            vacunaAplicada: '',
            mvzResponsable: '',
            proximaVacunacion: '',
            observaciones: ''
        });
    };

    const handlePatientDataChange = (e) => {
        const { name, value } = e.target;
        setPatientData(prev => ({ ...prev, [name]: value }));
    };

    const handleNewRecordChange = (e) => {
        const { name, value } = e.target;
        setNewRecord(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveRecord = () => {
        if (!newRecord.fecha || !newRecord.vacunaAplicada) {
            alert('Por favor, complete al menos la fecha y la vacuna aplicada.');
            return;
        }
        setRecords([...records, { ...newRecord, id: Date.now() }]);
        closeModal();
    };

    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        alert('Datos guardados (simulación).');
        setIsSaved(true);
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

        generateVaccinationPDF(patientData, records, formRefs);
    };

    return (
        <div className={`${styles['vaccination-card']} global-form-width`} ref={formRef}>
            <div className={styles['vaccination-header']}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', width: '100%' }}>
                    <ImageUploader
                        placeholderText="Logo"
                        className="header-logo-left"
                    />

                    <div className={`${styles['header-titles']} text-center`} style={{ flex: 1 }}>
                        <h2 className={styles['vaccination-header-title']}>FORMATO DE VACUNACIÓN</h2>
                        <p className={styles['vaccination-header-subtitle']}>MANTENIMIENTO PREVENTIVO</p>
                    </div>

                    <ImageUploader
                        placeholderText="Logo"
                        className="header-logo-right"
                    />
                </div>
            </div>

            {/* Patient Data Section */}
            <h4>DATOS GENERALES</h4>
            <div className={styles['vaccination-form-grid']}>
                <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Nombre científico</label><input type="text" className={styles['vaccination-form-input']} name="nombreCientifico" value={patientData.nombreCientifico} onChange={handlePatientDataChange} /></div>
                <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Nombre común</label><input type="text" className={styles['vaccination-form-input']} name="nombreComun" value={patientData.nombreComun} onChange={handlePatientDataChange} /></div>

                <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Sexo</label><input type="text" className={styles['vaccination-form-input']} name="sexo" value={patientData.sexo} onChange={handlePatientDataChange} /></div>
                <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Edad</label><input type="text" className={styles['vaccination-form-input']} name="edad" value={patientData.edad} onChange={handlePatientDataChange} /></div>
                <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Ubicación</label><input type="text" className={styles['vaccination-form-input']} name="ubicacion" value={patientData.ubicacion} onChange={handlePatientDataChange} /></div>
                <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Identificación</label><input type="text" className={styles['vaccination-form-input']} name="identificacion" value={patientData.identificacion} onChange={handlePatientDataChange} /></div>
            </div>

            {/* Action Button to show the modal */}
            <div className={`${styles['add-record-button-container']}`}>
                <button onClick={openModal} className={styles['add-record-button']}>
                    <FaPlus /> Agregar Registro
                </button>
            </div>

            {/* Records Table */}
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
                        </tr>
                    </thead>
                    <tbody>
                        {records.length === 0 ? (
                            <tr><td colSpan="6" className={styles['no-records-cell']}>No hay registros</td></tr>
                        ) : (
                            records.map((rec) => (
                                <tr key={rec.id}>
                                    <td>{rec.fecha}</td>
                                    <td>{rec.viaAdministracion}</td>
                                    <td>{rec.vacunaAplicada}</td>
                                    <td>{rec.mvzResponsable}</td>
                                    <td>{rec.proximaVacunacion}</td>
                                    <td>{rec.observaciones}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Floating action buttons */}
            <div className="floating-actions ">
                {!isSaved ? (
                    <button className="floating-btn save-btn" onClick={handleSave} title="Guardar">
                        <FaSave />
                    </button>
                ) : (
                    <button className="floating-btn pdf-btn" onClick={handleExportPDF} title="Descargar PDF">
                        <FaFilePdf />
                    </button>
                )}
            </div>

            {/* Modal for adding a new record */}
            {isModalOpen && ReactDOM.createPortal(
                <div className={styles['modal-overlay']} onClick={closeModal}>
                    <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles['modal-title']}>Nuevo Registro de Vacunación</h3>
                        <div className={styles['modal-form-grid']}>
                            <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Fecha</label><input type="date" className={styles['vaccination-form-input']} name="fecha" value={newRecord.fecha} onChange={handleNewRecordChange} /></div>
                            <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Vía de Administración</label><input type="text" className={styles['vaccination-form-input']} name="viaAdministracion" value={newRecord.viaAdministracion} onChange={handleNewRecordChange} /></div>
                            <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Vacuna Aplicada (o Producto)</label><input type="text" className={styles['vaccination-form-input']} name="vacunaAplicada" value={newRecord.vacunaAplicada} onChange={handleNewRecordChange} /></div>
                            <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>MVZ Responsable</label><input type="text" className={styles['vaccination-form-input']} name="mvzResponsable" value={newRecord.mvzResponsable} onChange={handleNewRecordChange} /></div>
                            <div className={styles['vaccination-form-field']}><label className={styles['vaccination-form-label']}>Próxima Vacunación</label><input type="date" className={styles['vaccination-form-input']} name="proximaVacunacion" value={newRecord.proximaVacunacion} onChange={handleNewRecordChange} /></div>
                            <div className={`${styles['vaccination-form-field']} ${styles['modal-field-full-width']}`}><label className={styles['vaccination-form-label']}>Observaciones</label><input type="text" className={styles['vaccination-form-input']} name="observaciones" value={newRecord.observaciones} onChange={handleNewRecordChange} /></div>
                        </div>
                        <div className={styles['modal-actions']}>
                            <button onClick={closeModal} className={`${styles['footer-button']} ${styles['cancel-button']}`}>Cancelar</button>
                            <button onClick={handleSaveRecord} className={`${styles['footer-button']} ${styles['save-button']}`}>Guardar</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default VaccinationForm;
