import React, { useState } from 'react';
import { FaSave, FaFilePdf } from 'react-icons/fa';
import { generateHospFollowUpPDF } from '../../utils/exportHospFollowUpPDF';
import styles from '../../styles/HospFollowUpForm.module.css';
import cardStyles from '../../styles/Card.module.css';

import '../../styles/FloatingActions.css';

import useFormState from '../../hooks/useFormState';
import ImageUploader from '../common/ImageUploader';

const HospFollowUpForm = ({ onBack, patient }) => {
    const { isSaved, handleSave } = useFormState();

    // Dynamic Rows for Seguimiento Hospitalizado
    const [hospRows, setHospRows] = useState([
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 },
        { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 }
    ]);

    const addHospRow = () => setHospRows([...hospRows, { id: Date.now() }]);
    const removeHospRow = (idToRemove) => setHospRows(hospRows.filter(row => row.id !== idToRemove));

    const formRef = React.useRef(null);

    const handleExportPDF = () => {
        const el = formRef.current;
        if (!el) return;

        const getLogoSrc = (selector) => {
            const img = el.querySelector(`${selector} img[class*="uploaded-image"]`);
            return img ? img.src : null;
        };

        const getTableData = (tableSelector) => {
            const table = el.querySelector(tableSelector);
            if (!table) return [];
            const rows = Array.from(table.querySelectorAll('tbody tr'));
            return rows.map(row => {
                const inputs = Array.from(row.querySelectorAll('input'));
                return inputs.map(input => input.value || '');
            });
        };

        const topInputs = Array.from(el.querySelectorAll(`div[class*="hosp-field"] input`));

        const formRefs = {
            logoLeft: getLogoSrc('.header-logo-left'),
            logoRight: getLogoSrc('.header-logo-right'),
            fecha: topInputs[0]?.value || '',
            responsable: topInputs[1]?.value || '',
            tableData: getTableData('table')
        };

        generateHospFollowUpPDF(formRefs);
    };

    return (
        <div className={`${cardStyles['card']} form-container-standard`} ref={formRef}>
            <div className={styles['hosp-followup-form']}>

                {/* Encabezado */}
                <div className={styles['hosp-header']} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', width: '100%' }}>
                    <ImageUploader placeholderText="Logo" className="header-logo-left" />
                    <div className={styles['hosp-header-center']} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>
                            COORDINACIÓN ESTATAL<br />
                            CURADURÍA GENERAL DE NUTRICIÓN Y SALUD ANIMAL
                        </div>
                        <h3 style={{ fontSize: '1.1rem', margin: '10px 0' }}>FORMATO DE SEGUIMIENTO DE PACIENTES HOSPITALIZADOS EN CLÍNICA VETERINARIA</h3>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                            Calzada Cerro Hueco S/N, Col. El Zapotal, C.P. 29094, Tuxtla Gutiérrez, Chiapas
                        </div>
                    </div>
                    <ImageUploader placeholderText="Logo" className="header-logo-right" />
                </div>

                {/* Datos del formulario */}
                <div className={styles['hosp-data-row']}>
                    <div className={styles['hosp-field']}>
                        <label>Fecha:</label>
                        <input type="date" className={styles['form-input']} />
                    </div>
                    <div className={styles['hosp-field']}>
                        <label>Responsable:</label>
                        <input type="text" className={styles['form-input']} placeholder="Nombre del responsable" />
                    </div>
                </div>

                {/* Tabla de seguimiento */}
                <div className={styles['form-section']}>
                    <table className={styles['hosp-table']}>
                        <thead>
                            <tr>
                                <th rowSpan="2" className={styles['th-patient']}>Paciente<br /><small>Nombre / ID</small></th>
                                <th>Hora</th>
                                <th>Peso</th>
                                <th>F.C.</th>
                                <th>F.R.</th>
                                <th>Temp.</th>
                                <th>Pulso</th>
                                <th>Mucosas</th>
                                <th>TLLC</th>
                                <th className={styles['th-obs']}>Observaciones</th>
                                <th className={`${styles['action-col']}`}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {hospRows.map((row) => (
                                <tr key={row.id} className={styles['protocol-row']}>
                                    <td className={styles['td-patient']}>
                                        <input type="text" className={styles['table-input']} placeholder="" />
                                    </td>
                                    <td><input type="time" className={styles['table-input']} /></td>
                                    <td><input type="text" className={styles['table-input']} /></td>
                                    <td><input type="text" className={styles['table-input']} /></td>
                                    <td><input type="text" className={styles['table-input']} /></td>
                                    <td><input type="text" className={styles['table-input']} /></td>
                                    <td><input type="text" className={styles['table-input']} /></td>
                                    <td><input type="text" className={styles['table-input']} /></td>
                                    <td><input type="text" className={styles['table-input']} /></td>
                                    <td><input type="text" className={`${styles['table-input']} ${styles['wide']}`} /></td>
                                    <td className={`${styles['action-col']}`} style={{ verticalAlign: 'middle' }}>
                                        <button className={styles['delete-row-btn']} onClick={() => removeHospRow(row.id)} title="Eliminar fila">-</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className={`${styles['add-row-container']}`}>
                        <button className={styles['add-row-btn']} onClick={addHospRow}>
                            + Agregar fila
                        </button>
                    </div>
                </div>

                {/* Botones Flotantes */}
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

            </div>
        </div>
    );
};

export default HospFollowUpForm;
