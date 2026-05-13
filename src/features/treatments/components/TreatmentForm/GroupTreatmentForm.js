import React, { useState, useRef } from 'react';
import { FaSave, FaFilePdf } from 'react-icons/fa';
import { generateTreatmentPDF } from '../../utils/exportTreatmentPDF';
import styles from './TreatmentForm.module.css';

import '../../../../styles/FloatingActions.css';
import cardStyles from '../../../../styles/shared/Card.module.css';

import useFormState from '../../../../hooks/useFormState';
import ImageUploader from '../../../../components/common/ImageUploader/ImageUploader';
import { createGroupTreatmentApi } from '../../../../services/treatmentsService';
import { useAuth } from '../../../../context/AuthContext';

const GroupTreatmentForm = ({ onBack, patient }) => {
    const { isSaved, handleSave } = useFormState();
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    // Dynamic Rows for Protocolo de Tratamiento
    const [protocolRows, setProtocolRows] = useState([
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }
    ]);

    const addProtocolRow = () => setProtocolRows([...protocolRows, { id: Date.now() }]);
    const removeProtocolRow = (idToRemove) => setProtocolRows(protocolRows.filter(row => row.id !== idToRemove));

    // Dynamic Rows for Tratamiento Aplicado
    const [appliedRows, setAppliedRows] = useState([
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }
    ]);

    const addAppliedRow = () => setAppliedRows([...appliedRows, { id: Date.now() }]);
    const removeAppliedRow = (idToRemove) => setAppliedRows(appliedRows.filter(row => row.id !== idToRemove));

    const formRef = useRef(null);

    const handleApiSave = async () => {
        const el = formRef.current;
        if (!el) return;

        const textInputs = Array.from(el.querySelectorAll(`.${styles['form-grid-2']} input[type="text"], .${styles['form-grid-2']} input[type="number"]`));
        const textareas = Array.from(el.querySelectorAll('textarea'));

        const getTableRows = (dataTable) => {
            const table = el.querySelector(`[data-table="${dataTable}"]`);
            if (!table) return [];
            return Array.from(table.querySelectorAll('tbody tr')).map((row) =>
                Array.from(row.querySelectorAll('input')).map((input) => input.value || '')
            );
        };

        const medicamentos = getTableRows('protocol')
            .filter((cols) => cols[0])
            .map(([principioActivo, dosisMgKg, productoComercial, cantidadAplicar, viaAdministracion, frecuencia, numeroDias]) => ({
                principioActivo,
                dosisMgKg: dosisMgKg ? Number(dosisMgKg) : null,
                productoComercial,
                cantidadAplicar: cantidadAplicar ? Number(cantidadAplicar) : null,
                viaAdministracion,
                frecuencia,
                numeroDias: numeroDias ? Number(numeroDias) : null,
            }));

        const seguimientos = getTableRows('applied')
            .filter((cols) => cols[0] && cols[1])
            .map(([fecha, tratamientoAplicado]) => ({ fecha, tratamientoAplicado }));

        const payload = {
            idEjemplar: patient?.idEjemplar || patient?.id || '',
            ubicacion: textInputs[2]?.value || '',
            numeroEjemplares: textInputs[3]?.value ? Number(textInputs[3].value) : null,
            anamnesisMotivo: textareas[0]?.value || '',
            observaciones: textareas[1]?.value || '',
            medicamentos,
            seguimientos,
        };

        console.log('[GroupTreatment] payload:', JSON.stringify(payload, null, 2));

        if (!payload.idEjemplar) {
            alert('No hay un ejemplar seleccionado.');
            return;
        }

        try {
            setIsSaving(true);
            await createGroupTreatmentApi(payload);
            handleSave();
        } catch (err) {
            const fieldErrors = Array.isArray(err.data?.errors)
                ? err.data.errors.map((e) => `• ${e.message}`).join('\n')
                : null;
            alert(fieldErrors
                ? `Error al guardar:\n${fieldErrors}`
                : `Error al guardar: ${err.message}`
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportPDF = () => {
        const el = formRef.current;
        if (!el) {
            console.error("Form element not found");
            return;
        }

        const getLogoSrc = (selector) => {
            const img = el.querySelector(`${selector} img[class*="uploaded-image"]`);
            return img ? img.src : null;
        };

        const getTableData = (tableSelector) => {
            const table = el.querySelector(tableSelector);
            if (!table) return [];
            const rows = Array.from(table.querySelectorAll('tbody tr'));
            return rows.map(row => {
                const inputs = Array.from(row.querySelectorAll('input, select, textarea'));
                return inputs.map(input => input.value || '');
            });
        };

        const textInputs = Array.from(el.querySelectorAll(`.${styles['form-grid-2']} input[type="text"], .${styles['form-grid-2']} input[type="number"], .${styles['form-grid-4']} input`));
        const textareas = Array.from(el.querySelectorAll('textarea'));

        const formRefs = {
            logoLeft: getLogoSrc('.header-logo-left'),
            logoRight: getLogoSrc('.header-logo-right'),
            nombreCientifico: textInputs[0]?.value || '',
            nombreComun: textInputs[1]?.value || '',
            ubicacion: textInputs[2]?.value || '',
            numeroEjemplares: textInputs[3]?.value || '',
            anamnesis: textareas[0]?.value || '',
            observaciones: textareas[1]?.value || '',
            protocolDataRaw: getTableData(`.${styles['treatment-table']}`),
            appliedDataRaw: getTableData(`.${styles['applied-table']}`),
            numeroHoja: '1'
        };

        generateTreatmentPDF(patient, protocolRows, appliedRows, formRefs, 'grupal');
    };

    return (
        <div>
            <div className={`${cardStyles['card']} form-container-standard`} ref={formRef}>
                <div className={styles['treatment-form']}>

                    {/* Encabezado */}
                    <div className={styles['treatment-header']} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', width: '100%' }}>
                        <ImageUploader placeholderText="Logo" className="header-logo-left" />
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <h1 style={{ fontSize: '1.2rem', margin: '0 0 5px 0' }}>Zoológico Regional Miguel Álvarez del Toro</h1>
                            <h2 style={{ fontSize: '1rem', fontStyle: 'italic', margin: '0 0 10px 0', color: '#555' }}>Clínica Veterinaria</h2>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0' }}>FORMATO DE TRATAMIENTO GRUPAL</h3>
                        </div>
                        <ImageUploader placeholderText="Logo" className="header-logo-right" />
                    </div>

                    {/* Datos Generales */}
                    <div className={styles['form-section']}>
                        <h4 className={styles['section-title']}>Datos Generales</h4>
                        <div className={styles['form-grid-2']}>
                            <div className={`${styles['form-group']} ${styles['compact']}`}>
                                <label>Nombre científico</label>
                                <input type="text" className={styles['form-input']} placeholder="Nombre científico" defaultValue={patient?.scientificName || ''} readOnly />
                            </div>
                            <div className={`${styles['form-group']} ${styles['compact']}`}>
                                <label>Nombre común</label>
                                <input type="text" className={styles['form-input']} placeholder="Nombre común" defaultValue={patient?.commonName || ''} readOnly />
                            </div>
                        </div>
                        <div className={styles['form-grid-2']}>
                            <div className={`${styles['form-group']} ${styles['compact']}`}>
                                <label>Ubicación</label>
                                <input type="text" className={styles['form-input']} placeholder="Ubicación" defaultValue={patient?.location || ''} readOnly />
                            </div>
                            <div className={`${styles['form-group']} ${styles['compact']}`}>
                                <label>No de ejemplares</label>
                                <input type="number" className={styles['form-input']} placeholder="Cantidad" defaultValue={patient?.specimenCount || ''} readOnly />
                            </div>
                        </div>
                        <div className={`${styles['form-group']} ${styles['full-width']}`}>
                            <label>Anamnesis/motivo del tratamiento</label>
                            <textarea className={styles['form-input']} rows="2" placeholder="Anamnesis o motivo del tratamiento"></textarea>
                        </div>
                    </div>

                    {/* Tabla de Protocolo de Tratamiento */}
                    <div className={styles['form-section']}>
                        <h4 className={styles['section-title']}>Protocolo de Tratamiento</h4>
                        <table className={styles['treatment-table']} data-table="protocol">
                            <thead>
                                <tr>
                                    <th>Principio activo</th>
                                    <th>Dosis mg/kg</th>
                                    <th>Producto comercial</th>
                                    <th>Cantidad a aplicar</th>
                                    <th>Vía de admón.</th>
                                    <th>Frecuencia</th>
                                    <th>No de días</th>
                                    <th className={`${styles['action-col']}`}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {protocolRows.map((row) => (
                                    <tr key={row.id} className={styles['protocol-row']}>
                                        <td><input type="text" className={styles['table-input']} /></td>
                                        <td><input type="number" min="0" step="0.01" placeholder="Ej: 1.5" className={styles['table-input']} onKeyDown={(e) => ['e','E','+','-'].includes(e.key) && e.preventDefault()} /></td>
                                        <td><input type="text" className={styles['table-input']} /></td>
                                        <td><input type="number" min="0" step="0.01" placeholder="Ej: 2.0" className={styles['table-input']} onKeyDown={(e) => ['e','E','+','-'].includes(e.key) && e.preventDefault()} /></td>
                                        <td><input type="text" className={styles['table-input']} /></td>
                                        <td><input type="text" className={styles['table-input']} /></td>
                                        <td><input type="number" min="1" step="1" placeholder="Ej: 7" className={styles['table-input']} onKeyDown={(e) => ['e','E','+','-','.'].includes(e.key) && e.preventDefault()} /></td>
                                        <td className={`${styles['action-col']}`} style={{ verticalAlign: 'middle' }}>
                                            <button className={styles['delete-row-btn']} onClick={() => removeProtocolRow(row.id)} title="Eliminar fila">-</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className={`${styles['add-row-container']}`}>
                            <button className={styles['add-row-btn']} onClick={addProtocolRow}>
                                + Agregar fila
                            </button>
                        </div>
                    </div>

                    {/* Tabla de Tratamiento Aplicado */}
                    <div className={styles['form-section']}>
                        <h4 className={styles['section-title']}>Tratamiento Aplicado</h4>
                        <table className={styles['treatment-table']} data-table="applied">
                            <thead>
                                <tr>
                                    <th style={{ width: '100px' }}>Fecha</th>
                                    <th>Tratamiento aplicado</th>
                                    <th className={`${styles['action-col']}`}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {appliedRows.map((row) => (
                                    <tr key={row.id} className={styles['protocol-row']}>
                                        <td><input type="date" className={styles['table-input']} /></td>
                                        <td><input type="text" className={`${styles['table-input']} ${styles['wide']}`} /></td>
                                        <td className={`${styles['action-col']}`} style={{ verticalAlign: 'middle' }}>
                                            <button className={styles['delete-row-btn']} onClick={() => removeAppliedRow(row.id)} title="Eliminar fila">-</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className={`${styles['add-row-container']}`}>
                            <button className={styles['add-row-btn']} onClick={addAppliedRow}>
                                + Agregar fila
                            </button>
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div className={styles['form-section']}>
                        <h4 className={styles['section-title']}>Observaciones</h4>
                        <textarea className={`${styles['form-input']} ${styles['full-textarea']}`} rows="3" placeholder="Observaciones generales"></textarea>
                    </div>

                    {/* Pie del formulario */}
                    <div className={styles['treatment-footer']}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', minWidth: '200px' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user?.name || ''}</span>
                            <div className={styles['signature-line']}></div>
                            <label style={{ fontSize: '0.8rem', color: '#555' }}>Responsable clínico</label>
                        </div>
                    </div>

                </div>
            </div>

            {/* Acciones flotantes */}
            <div className="floating-actions ">
                {!isSaved ? (
                    <button className="floating-btn save-btn" onClick={handleApiSave} disabled={isSaving} title="Guardar">
                        <FaSave />
                    </button>
                ) : (
                    <button className="floating-btn pdf-btn" onClick={handleExportPDF} title="Descargar PDF">
                        <FaFilePdf />
                    </button>
                )}
            </div>
        </div>
    );
};

export default GroupTreatmentForm;
