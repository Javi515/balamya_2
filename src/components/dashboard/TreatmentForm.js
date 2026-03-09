import React, { useState, useRef } from 'react';
import { FaSave, FaPrint, FaDove, FaFileAlt, FaFilePdf } from 'react-icons/fa';
import { generateTreatmentPDF } from '../../utils/exportTreatmentPDF';
import styles from '../../styles/TreatmentForm.module.css';

import buttonStyles from '../../styles/FormButtons.module.css';
import cardStyles from '../../styles/Card.module.css';
import { useAuth } from '../../context/AuthContext';

import useFormState from '../../hooks/useFormState';
import ImageUploader from '../common/ImageUploader';

const TreatmentForm = ({ onBack, patient }) => {
    const { isSaved, handleSave } = useFormState();
    const { user } = useAuth();

    // Determine which variant(s) the user can see
    const userRole = user?.role || '';
    const isAdmin = userRole === 'admin';
    const isAves = userRole === 'aves';

    // Default variant based on role
    const getDefaultVariant = () => {
        if (isAves) return 'aves';
        if (isAdmin) return 'normal'; // Admin starts on general
        return 'normal'; // All other roles default to normal
    };

    const [variant, setVariant] = useState(getDefaultVariant);

    // Dynamic Rows for Protocolo de Tratamiento (defaults to 6 rows)
    const [protocolRows, setProtocolRows] = useState([
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }
    ]);

    const addProtocolRow = () => {
        setProtocolRows([...protocolRows, { id: Date.now() }]);
    };

    const removeProtocolRow = (idToRemove) => {
        setProtocolRows(protocolRows.filter(row => row.id !== idToRemove));
    };

    // Dynamic Rows for Tratamiento Aplicado (Aves)
    const [appliedRowsAves, setAppliedRowsAves] = useState([
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }
    ]);

    const addAppliedRowAves = () => setAppliedRowsAves([...appliedRowsAves, { id: Date.now() }]);
    const removeAppliedRowAves = (idToRemove) => setAppliedRowsAves(appliedRowsAves.filter(row => row.id !== idToRemove));

    // Dynamic Rows for Tratamiento Aplicado (Normal)
    const [appliedRowsNormal, setAppliedRowsNormal] = useState([
        { id: 1 }, { id: 2 }, { id: 3 } // Each represents a 3-row block
    ]);

    const addAppliedRowNormal = () => setAppliedRowsNormal([...appliedRowsNormal, { id: Date.now() }]);
    const removeAppliedRowNormal = (idToRemove) => setAppliedRowsNormal(appliedRowsNormal.filter(row => row.id !== idToRemove));

    // Admin can toggle, others are locked
    const canToggle = isAdmin;

    const formRef = useRef(null);

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

        const extractNormalBlocks = () => {
            const blocks = [];
            const tbody = el.querySelector(`.${styles['applied-table']}.${styles['normal-applied-table']} tbody`);
            if (!tbody) return [];

            const allRows = Array.from(tbody.querySelectorAll('tr'));

            let currentBlock = [];
            allRows.forEach(row => {
                if (row.classList.contains(styles['observations-row'])) {
                    const obsText = row.querySelector('textarea, input')?.value || '';
                    currentBlock.push([obsText]);
                } else {
                    const inputs = Array.from(row.querySelectorAll('input, select, textarea'));
                    currentBlock.push(inputs.map(i => i.value || ''));
                }

                if (currentBlock.length === 4) { // Row1, Obs, Row3, Obs
                    blocks.push([...currentBlock]);
                    currentBlock = [];
                }
            });
            return blocks;
        };

        const textInputs = Array.from(el.querySelectorAll(`.${styles['form-grid-2']} input[type="text"], .${styles['form-grid-4']} input[type="text"]`));
        const selects = Array.from(el.querySelectorAll(`.${styles['form-grid-4']} select`));
        const textareas = Array.from(el.querySelectorAll('textarea'));

        const formRefs = {
            logoLeft: getLogoSrc('.header-logo-left'),
            logoRight: getLogoSrc('.header-logo-right'),
            nombreCientifico: textInputs[0]?.value || '',
            nombreComun: textInputs[1]?.value || '',
            sexo: selects[0]?.options[selects[0].selectedIndex]?.text || '',
            peso: textInputs[2]?.value || '',
            edad: textInputs[3]?.value || '',
            ubicacion: textInputs[4]?.value || '',
            identificacion: textInputs[5]?.value || '',
            anamnesis: textareas[0]?.value || '',
            impresionesDiagnosticas: variant === 'aves' ? (textareas[1]?.value || '') : '',
            protocolDataRaw: getTableData(`.${styles['treatment-table']}:not(.${styles['applied-table']})`),
            appliedDataRaw: variant === 'aves' ? getTableData(`.${styles['applied-table']}:not(.${styles['normal-applied-table']})`) : extractNormalBlocks(),
            numeroHoja: el.querySelector(`.${styles['treatment-footer']} input[type="text"]`)?.value || '1'
        };

        generateTreatmentPDF(patient, protocolRows, appliedRowsAves, formRefs, variant);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Premium Floating Variant Selector (only for admin) */}
            {canToggle && (
                <div className="flex justify-center w-full ">
                    <div className="flex gap-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-md border border-gray-100">
                        <button
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${variant === 'normal' ? 'bg-blue-600 text-white shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
                            onClick={() => setVariant('normal')}
                        >
                            <FaFileAlt /> General
                        </button>
                        <button
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${variant === 'aves' ? 'bg-blue-600 text-white shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
                            onClick={() => setVariant('aves')}
                        >
                            <FaDove /> Aves
                        </button>
                    </div>
                </div>
            )}

            {/* Main Document Card */}
            <div className={`${cardStyles['card']} form-container-standard`} ref={formRef}>
                <div className={styles['treatment-form']}>

                    {/* Encabezado */}
                    <div className={styles['treatment-header']} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', width: '100%' }}>
                        <ImageUploader placeholderText="Logo" className="header-logo-left" />
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <h1 style={{ fontSize: '1.2rem', margin: '0 0 5px 0' }}>Zoológico Regional Miguel Álvarez del Toro</h1>
                            <h2 style={{ fontSize: '1rem', fontStyle: 'italic', margin: '0 0 10px 0', color: '#555' }}>Clínica Veterinaria</h2>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0' }}>
                                {variant === 'aves'
                                    ? 'FORMATO DE TRATAMIENTO AVES'
                                    : 'FORMATO DE TRATAMIENTO'}
                            </h3>
                        </div>
                        <ImageUploader placeholderText="Logo" className="header-logo-right" />
                    </div>

                    {/* Datos Generales */}
                    <div className={styles['form-section']}>
                        <h4 className={styles['section-title']}>Datos Generales</h4>
                        <div className={styles['form-grid-2']}>
                            <div className={`${styles['form-group']} ${styles['compact']}`}>
                                <label>Nombre científico</label>
                                <input type="text" className={styles['form-input']} placeholder="Nombre científico" defaultValue={patient?.scientificName || ''} />
                            </div>
                            <div className={`${styles['form-group']} ${styles['compact']}`}>
                                <label>Nombre común</label>
                                <input type="text" className={styles['form-input']} placeholder="Nombre común" defaultValue={patient?.commonName || ''} />
                            </div>
                        </div>
                        <div className={styles['form-grid-4']}>
                            <div className={`${styles['form-group']} ${styles['compact']}`}>
                                <label>Sexo</label>
                                <select className={styles['form-input']}>
                                    <option value="">Seleccionar</option>
                                    <option value="Macho">Macho</option>
                                    <option value="Hembra">Hembra</option>
                                    <option value="Indeterminado">Indeterminado</option>
                                </select>
                            </div>
                            <div className={`${styles['form-group']} ${styles['compact']}`}>
                                <label>Peso</label>
                                <input type="text" className={styles['form-input']} placeholder="kg" />
                            </div>
                            <div className={`${styles['form-group']} ${styles['compact']}`}>
                                <label>Edad</label>
                                <input type="text" className={styles['form-input']} placeholder="Edad" defaultValue={patient?.age ? `${patient.age} años` : ''} />
                            </div>
                            <div className={`${styles['form-group']} ${styles['compact']}`}>
                                <label>Ubicación</label>
                                <input type="text" className={styles['form-input']} placeholder="Ubicación" defaultValue={patient?.location || ''} />
                            </div>
                        </div>
                        <div className={styles['form-grid-2']}>
                            <div className={`${styles['form-group']} ${styles['compact']}`}>
                                <label>Identificación</label>
                                <input type="text" className={styles['form-input']} placeholder="ID del ejemplar" defaultValue={patient?.id || ''} />
                            </div>
                        </div>
                        <div className={`${styles['form-group']} ${styles['full-width']}`}>
                            <label>Anamnesis</label>
                            <textarea className={styles['form-input']} rows="2" placeholder="Anamnesis del paciente"></textarea>
                        </div>
                    </div>

                    {/* Impresiones Diagnósticas - SOLO variante Aves */}
                    {variant === 'aves' && (
                        <div className={styles['form-section']}>
                            <h4 className={styles['section-title']}>Impresiones Diagnósticas</h4>
                            <textarea className={`${styles['form-input']} ${styles['full-textarea']}`} rows="2" placeholder="Impresiones diagnósticas"></textarea>
                        </div>
                    )}

                    {/* Tabla de Protocolo de Tratamiento */}
                    <div className={styles['form-section']}>
                        <h4 className={styles['section-title']}>Protocolo de Tratamiento</h4>
                        <table className={styles['treatment-table']}>
                            <thead>
                                <tr>
                                    <th>Principio activo</th>
                                    <th>{variant === 'normal' ? 'Dosis mg/kg' : 'Dosis'}</th>
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
                                        <td><input type="text" className={styles['table-input']} /></td>
                                        <td><input type="text" className={styles['table-input']} /></td>
                                        <td><input type="text" className={styles['table-input']} /></td>
                                        <td><input type="text" className={styles['table-input']} /></td>
                                        <td><input type="text" className={styles['table-input']} /></td>
                                        <td><input type="text" className={styles['table-input']} /></td>
                                        <td className={`${styles['action-col']}`} style={{ verticalAlign: 'middle' }}>
                                            <button
                                                className={styles['delete-row-btn']}
                                                onClick={() => removeProtocolRow(row.id)}
                                                title="Eliminar fila"
                                            >
                                                -
                                            </button>
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

                        {variant === 'aves' ? (
                            /* === VARIANTE AVES: Fecha, Hora, Tratamiento, Observaciones, Responsable === */
                            <>
                                <table className={`${styles['treatment-table']} ${styles['applied-table']}`}>
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Hora</th>
                                            <th>Tratamiento</th>
                                            <th>Observaciones</th>
                                            <th>Responsable</th>
                                            <th className={`${styles['action-col']}`}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appliedRowsAves.map((row) => (
                                            <tr key={row.id} className={styles['protocol-row']}>
                                                <td><input type="date" className={styles['table-input']} /></td>
                                                <td><input type="time" className={styles['table-input']} /></td>
                                                <td><input type="text" className={`${styles['table-input']} ${styles['wide']}`} /></td>
                                                <td><input type="text" className={`${styles['table-input']} ${styles['wide']}`} /></td>
                                                <td><input type="text" className={styles['table-input']} /></td>
                                                <td className={`${styles['action-col']}`} style={{ verticalAlign: 'middle' }}>
                                                    <button className={styles['delete-row-btn']} onClick={() => removeAppliedRowAves(row.id)} title="Eliminar fila">-</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className={`${styles['add-row-container']}`}>
                                    <button className={styles['add-row-btn']} onClick={addAppliedRowAves}>
                                        + Agregar fila
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* === VARIANTE NORMAL: Fecha, Tratamiento aplicado (ancho), Responsable + filas Observaciones === */
                            <>
                                <table className={`${styles['treatment-table']} ${styles['applied-table']} ${styles['normal-applied-table']}`}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '100px' }}>Fecha</th>
                                            <th>Tratamiento aplicado</th>
                                            <th style={{ width: '120px' }}>Responsable</th>
                                            <th className={`${styles['action-col']}`}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appliedRowsNormal.map((row) => (
                                            <React.Fragment key={row.id}>
                                                <tr className={styles['protocol-row']}>
                                                    <td><input type="date" className={styles['table-input']} /></td>
                                                    <td><input type="text" className={`${styles['table-input']} ${styles['wide']}`} /></td>
                                                    <td><input type="text" className={styles['table-input']} /></td>
                                                    <td rowSpan="4" className={`${styles['action-col']}`} style={{ verticalAlign: 'middle', borderLeft: '1px solid #cbd5e1' }}>
                                                        <button className={styles['delete-row-btn']} onClick={() => removeAppliedRowNormal(row.id)} title="Eliminar bloque">-</button>
                                                    </td>
                                                </tr>
                                                <tr className={`${styles['observations-row']} ${styles['protocol-row']}`}>
                                                    <td colSpan="3">
                                                        <div className={styles['obs-label']}>Observaciones</div>
                                                        <textarea className={`${styles['table-input']} ${styles['wide']} ${styles['obs-input']}`} rows="2"></textarea>
                                                    </td>
                                                </tr>
                                                <tr className={styles['protocol-row']}>
                                                    <td><input type="text" className={styles['table-input']} /></td>
                                                    <td><input type="text" className={`${styles['table-input']} ${styles['wide']}`} /></td>
                                                    <td><input type="text" className={styles['table-input']} /></td>
                                                </tr>
                                                <tr className={`${styles['observations-row']} ${styles['protocol-row']}`}>
                                                    <td colSpan="3">
                                                        <div className={styles['obs-label']}>Observaciones</div>
                                                        <textarea className={`${styles['table-input']} ${styles['wide']} ${styles['obs-input']}`} rows="2"></textarea>
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                                <div className={`${styles['add-row-container']}`}>
                                    <button className={styles['add-row-btn']} onClick={addAppliedRowNormal}>
                                        + Agregar bloque
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Pie del formulario */}
                    <div className={styles['treatment-footer']}>
                        <div className={styles['footer-field']}>
                            <label>Responsable clínico:</label>
                            <div className={styles['signature-line']}></div>
                        </div>
                        <div className={`${styles['footer-field']} ${styles['right']}`}>
                            <label>Hoja:</label>
                            <input type="text" className={`${styles['form-input']} ${styles['small']}`} placeholder="No." />
                        </div>
                    </div>

                </div>
            </div>

            {/* Acciones flotantes */}
            <div className="floating-actions ">
                {!isSaved ? (
                    <button className="floating-btn save-btn" onClick={handleSave} title="Guardar">
                        <FaSave />
                    </button>
                ) : (
                    <button className="floating-btn print-btn" onClick={handleExportPDF} title="Exportar PDF/Imprimir">
                        <FaFilePdf />
                    </button>
                )}
            </div>
        </div>
    );
};

export default TreatmentForm;
