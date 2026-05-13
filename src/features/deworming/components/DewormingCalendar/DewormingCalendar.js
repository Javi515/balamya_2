import { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FaPlus, FaSave, FaFilePdf, FaEdit } from 'react-icons/fa';
import ImageUploader from '../../../../components/common/ImageUploader/ImageUploader';
import styles from './DewormingCalendar.module.css';

import '../../../../styles/FloatingActions.css';
import { generateDewormingPDF } from '../../utils/exportDewormingPDF';
import { updateDewormingApi } from '../../../../services/dewormingService';

const normalizeDewormingRecord = (r) => ({
    fecha: r.fecha || '',
    principioActivo: r.principioActivo || r.principio_activo || '',
    dosisMgKg: r.dosisMgKg || r.dosis_mg_kg || '',
    productoComercial: r.productoComercial || r.producto_comercial || '',
    dosisTotal: r.dosisTotal || r.dosis_total || '',
    via: r.via || r.viaAdministracion || r.via_administracion || '',
    frecuencia: r.frecuencia || '',
    proxima: r.proxima || r.proximaDesparasitacion || r.proxima_desparasitacion || '',
});

const EMPTY_MODAL = { fecha: '', principioActivo: '', dosisMgKg: '', productoComercial: '', dosisTotal: '', via: '', frecuencia: '', proxima: '' };

const DewormingCalendar = ({ patient, existingRecord, viewOnly = false }) => {
    const formRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [modalData, setModalData] = useState(EMPTY_MODAL);
    const [records, setRecords] = useState(existingRecord ? [normalizeDewormingRecord(existingRecord)] : []);
    const [generalData, setGeneralData] = useState({
        grupo: existingRecord?.grupo || '',
        nombreCientifico: patient?.scientificName || patient?.species || '',
        nombreComun: patient?.commonName || '',
        peso: existingRecord?.peso || existingRecord?.peso_kg || '',
        edad: patient?.ageText || (patient?.age ? `${patient.age} años` : ''),
        identificacion: patient?.id || '',
        ubicacion: patient?.location || existingRecord?.ubicacion || '',
        sexo: patient?.sex || '',
        estadoFisiologico: existingRecord?.estadoFisiologico || existingRecord?.estado_fisiologico || '',
    });
    const [isSaved, setIsSaved] = useState(!!existingRecord);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (generalData.peso !== '' && isNaN(Number(generalData.peso))) {
            alert('El campo Peso (kg) solo acepta números.\nEjemplo: 12.5');
            return;
        }
        if (existingRecord) {
            const idCalendario = existingRecord.idCalendario || existingRecord.id_calendario || existingRecord.id;
            const rec = records[0] || {};
            const payload = {
                fecha: rec.fecha,
                principioActivo: rec.principioActivo,
                productoComercial: rec.productoComercial,
                dosisMgKg: rec.dosisMgKg,
                dosisTotal: rec.dosisTotal,
                viaAdministracion: rec.via,
                frecuencia: rec.frecuencia,
                proximaDesparasitacion: rec.proxima,
                ...(generalData.grupo && { grupo: generalData.grupo }),
                ...(generalData.peso && { peso: generalData.peso }),
                ...(generalData.ubicacion && { ubicacion: generalData.ubicacion }),
                ...(generalData.estadoFisiologico && { estadoFisiologico: generalData.estadoFisiologico }),
            };
            try {
                setIsSaving(true);
                await updateDewormingApi(idCalendario, payload);
                alert('Desparasitación actualizada correctamente.');
            } catch (err) {
                alert(`Error al actualizar: ${err.message}`);
                return;
            } finally {
                setIsSaving(false);
            }
        }
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

        generateDewormingPDF(generalData, records, formRefs);
    };

    const openModal = () => { setEditingIndex(null); setModalData(EMPTY_MODAL); setIsModalOpen(true); };
    const openEditModal = (index) => { setEditingIndex(index); setModalData({ ...records[index] }); setIsModalOpen(true); };
    const closeModal = () => setIsModalOpen(false);

    const handleModalChange = (e) => {
        const { name, value } = e.target;
        setModalData(prev => ({ ...prev, [name]: value }));
    };

    const handleDataChange = (e) => {
        const { name, value } = e.target;
        setGeneralData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleAddRecord = async (e) => {
        e.preventDefault();
        if (editingIndex !== null && existingRecord) {
            const idCalendario = existingRecord.idCalendario || existingRecord.id_calendario || existingRecord.id;
            const payload = {
                fecha: modalData.fecha,
                principioActivo: modalData.principioActivo,
                productoComercial: modalData.productoComercial,
                dosisMgKg: modalData.dosisMgKg,
                dosisTotal: modalData.dosisTotal,
                viaAdministracion: modalData.via,
                frecuencia: modalData.frecuencia,
                proximaDesparasitacion: modalData.proxima,
                ...(generalData.grupo && { grupo: generalData.grupo }),
                ...(generalData.peso && { peso: generalData.peso }),
                ...(generalData.ubicacion && { ubicacion: generalData.ubicacion }),
                ...(generalData.estadoFisiologico && { estadoFisiologico: generalData.estadoFisiologico }),
            };
            try {
                setIsSaving(true);
                await updateDewormingApi(idCalendario, payload);
                setRecords(prev => prev.map((r, i) => i === editingIndex ? { ...modalData } : r));
                alert('Desparasitación actualizada correctamente.');
            } catch (err) {
                alert(`Error al actualizar: ${err.message}`);
                return;
            } finally {
                setIsSaving(false);
            }
        } else {
            setRecords(prev => [...prev, { ...modalData }]);
        }
        closeModal();
    };

    return (
        <div className={styles['deworming-container']}>
            <div className={`${styles['deworming-card']} global-form-width`} ref={formRef}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', width: '100%' }}>
                    <ImageUploader
                        placeholderText="Logo"
                        className="header-logo-left"
                    />

                    <div className={styles['deworming-header']} style={{ flex: 1, textAlign: 'center' }}>
                        <div className={styles['deworming-header-subtitle']} style={{ marginBottom: '5px' }}>
                            2025, Año de "Rosario Castellanos Figueroa"
                        </div>
                        <div className={styles['deworming-header-title']}>CALENDARIO DE DESPARASITACIÓN</div>
                    </div>

                    <ImageUploader
                        placeholderText="Logo"
                        className="header-logo-right"
                    />
                </div>

                <h4>DATOS GENERALES</h4>
                <div className={styles['deworming-form-grid']}>
                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>GRUPO</label><input type="text" name="grupo" value={generalData.grupo} onChange={handleDataChange} className={styles['deworming-form-input']} /></div>
                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>NOMBRE CIENTÍFICO</label><input type="text" name="nombreCientifico" value={generalData.nombreCientifico} onChange={handleDataChange} className={styles['deworming-form-input']} /></div>
                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>NOMBRE COMÚN</label><input type="text" name="nombreComun" value={generalData.nombreComun} onChange={handleDataChange} className={styles['deworming-form-input']} /></div>
                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>SEXO</label><input type="text" name="sexo" value={generalData.sexo} onChange={handleDataChange} className={styles['deworming-form-input']} /></div>
                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>PESO</label><input type="text" name="peso" value={generalData.peso} onChange={handleDataChange} className={styles['deworming-form-input']} /></div>
                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>EDAD</label><input type="text" name="edad" value={generalData.edad} onChange={handleDataChange} className={styles['deworming-form-input']} /></div>
                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>UBICACIÓN</label><input type="text" name="ubicacion" value={generalData.ubicacion} onChange={handleDataChange} className={styles['deworming-form-input']} /></div>
                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>ESTADO FISIOLÓGICO</label><input type="text" name="estadoFisiologico" value={generalData.estadoFisiologico} onChange={handleDataChange} className={styles['deworming-form-input']} /></div>
                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>IDENTIFICACIÓN</label><input type="text" name="identificacion" value={generalData.identificacion} onChange={handleDataChange} className={styles['deworming-form-input']} /></div>
                </div>

                {!existingRecord && (
                <div className={`${styles['add-record-button-container']}`}>
                    <button onClick={openModal} className={styles['add-record-button']}>
                        <FaPlus /> Agregar Registro
                    </button>
                </div>
                )}

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
                                {existingRecord && !viewOnly && <th></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {records.length === 0 ? (
                                <tr>
                                    <td colSpan="8">No hay registros.</td>
                                </tr>
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
                                        {existingRecord && !viewOnly && (
                                            <td>
                                                <button type="button" onClick={() => openEditModal(index)} title="Editar registro" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a7c59' }}>
                                                    <FaEdit />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="floating-actions ">
                    {!isSaved ? (
                        <button className="floating-btn save-btn" onClick={handleSave} disabled={isSaving} title="Guardar">
                            <FaSave />
                        </button>
                    ) : (
                        <button className="floating-btn pdf-btn" onClick={handleExportPDF} title="Descargar PDF">
                            <FaFilePdf />
                        </button>
                    )}
                </div>


                {
                    isModalOpen && ReactDOM.createPortal(
                        <div className={styles['modal-overlay']} onClick={closeModal}>
                            <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
                                <h3 className={styles['modal-title']}>Agregar Registro de Desparasitación</h3>
                                <form onSubmit={handleAddRecord}>
                                    <div className={styles['modal-form-grid']}>
                                        <div className={styles['deworming-form-field']}>
                                            <label className={styles['deworming-form-label']}>FECHA</label>
                                            <input name="fecha" type="date" required className={styles['deworming-form-input']} value={modalData.fecha} onChange={handleModalChange} />
                                        </div>
                                        <div className={styles['deworming-form-field']}>
                                            <label className={styles['deworming-form-label']}>PRINCIPIO ACTIVO</label>
                                            <input name="principioActivo" type="text" required className={styles['deworming-form-input']} value={modalData.principioActivo} onChange={handleModalChange} />
                                        </div>
                                        <div className={styles['deworming-form-field']}>
                                            <label className={styles['deworming-form-label']}>DOSIS MG/KG</label>
                                            <input name="dosisMgKg" type="text" required className={styles['deworming-form-input']} value={modalData.dosisMgKg} onChange={handleModalChange} />
                                        </div>
                                        <div className={styles['deworming-form-field']}>
                                            <label className={styles['deworming-form-label']}>PRODUCTO COMERCIAL</label>
                                            <input name="productoComercial" type="text" required className={styles['deworming-form-input']} value={modalData.productoComercial} onChange={handleModalChange} />
                                        </div>
                                        <div className={styles['deworming-form-field']}>
                                            <label className={styles['deworming-form-label']}>DOSIS TOTAL (ml o tabletas)</label>
                                            <input name="dosisTotal" type="text" required className={styles['deworming-form-input']} value={modalData.dosisTotal} onChange={handleModalChange} />
                                        </div>
                                        <div className={styles['deworming-form-field']}>
                                            <label className={styles['deworming-form-label']}>VÍA DE ADMINISTRACIÓN</label>
                                            <input name="via" type="text" required className={styles['deworming-form-input']} value={modalData.via} onChange={handleModalChange} />
                                        </div>
                                        <div className={styles['deworming-form-field']}>
                                            <label className={styles['deworming-form-label']}>FRECUENCIA</label>
                                            <input name="frecuencia" type="text" required className={styles['deworming-form-input']} value={modalData.frecuencia} onChange={handleModalChange} />
                                        </div>
                                        <div className={styles['deworming-form-field']}>
                                            <label className={styles['deworming-form-label']}>PRÓXIMA DESPARASITACIÓN</label>
                                            <input name="proxima" type="date" required className={styles['deworming-form-input']} value={modalData.proxima} onChange={handleModalChange} />
                                        </div>
                                    </div>
                                    <div className={styles['modal-actions']}>
                                        <button type="button" className={`${styles['footer-button']} ${styles['cancel-button']}`} onClick={closeModal}>Cancelar</button>
                                        <button type="submit" className={`${styles['footer-button']} ${styles['save-button']}`}>Guardar Registro</button>
                                    </div>
                                </form>
                            </div>
                        </div>,
                        document.body
                    )
                }
            </div >
        </div >
    );
};

export default DewormingCalendar;
