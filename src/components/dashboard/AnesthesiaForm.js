import React, { useState, useRef } from 'react';
import styles from '../../styles/AnesthesiaForm.module.css';
import '../../styles/FloatingActions.css';
import { useLocation } from 'react-router-dom';
import { FaSave, FaFilePdf } from 'react-icons/fa';

import useFormState from '../../hooks/useFormState';

// Import subcomponents
import AnesthesiaSheet1 from './anesthesia/AnesthesiaSheet1';
import AnesthesiaSheet2 from './anesthesia/AnesthesiaSheet2';
import { generateAnesthesiaPDF } from '../../utils/exportAnesthesiaPDF';

const AnesthesiaForm = ({ patient: patientProp, existingRecord, onSave }) => {
    const formRef = useRef(null);
    const { isSaved, handleSave: originalHandleSave } = useFormState();
    const location = useLocation();
    const patient = patientProp || location.state?.patient;

    // State for Anesthesia Protocol Table
    const [protocolRows, setProtocolRows] = useState([
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }
    ]);

    // State for Anesthesia Monitoring Table
    const [monitoringRows, setMonitoringRows] = useState([
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }
    ]);

    const addProtocolRow = () => {
        setProtocolRows([...protocolRows, { id: Date.now() }]);
    };

    const removeProtocolRow = (idToRemove) => {
        setProtocolRows(protocolRows.filter(row => row.id !== idToRemove));
    };

    const addMonitoringRow = () => {
        setMonitoringRows([...monitoringRows, { id: Date.now() }]);
    };

    const removeMonitoringRow = (idToRemove) => {
        setMonitoringRows(monitoringRows.filter(row => row.id !== idToRemove));
    };

    const handleExportPDF = () => {
        const el = formRef.current;
        if (!el) return;

        // Collect all form values manually to pass to our vector PDF generator
        const getVal = (selector) => {
            const input = el.querySelector(selector);
            return input ? input.value : '';
        };

        const getSelectVal = (selector) => {
            const select = el.querySelector(selector);
            if (!select) return '';
            return select.options[select.selectedIndex]?.text || '';
        };

        const getRadioVal = (name) => {
            const checked = el.querySelector(`input[name="${name}"]:checked`);
            return checked ? checked.nextSibling?.textContent?.trim() || checked.value : '';
        };

        const getCheckVal = (index) => {
            const checks = el.querySelectorAll('input[type="checkbox"]');
            return checks[index] ? checks[index].checked : false;
        };

        const getTableData = (sheetId, tableIndex) => {
            const table = el.querySelectorAll(`#${sheetId} table`)[tableIndex];
            if (!table) return [];
            const rows = Array.from(table.querySelectorAll('tbody tr'));
            return rows.map(row => {
                const inputs = Array.from(row.querySelectorAll('input'));
                return inputs.map(input => input.value || '');
            });
        };

        const getLogoSrc = (selector) => {
            const img = el.querySelector(`${selector} img[class*="uploaded-image"]`);
            return img ? img.src : null;
        };

        const generalTextInputs = Array.from(el.querySelectorAll('input[type="text"]')).filter(i => !i.closest('table'));
        const generalTimeInputs = Array.from(el.querySelectorAll('input[type="time"]')).filter(i => !i.closest('table'));
        const generalSelects = Array.from(el.querySelectorAll('select')).filter(i => !i.closest('table'));

        const formRefs = {
            logoLeft: getLogoSrc('.header-logo-left'),
            logoRight: getLogoSrc('.header-logo-right'),
            protocolDataRaw: getTableData('anesthesia-hoja1', 0),
            monitoringDataRaw: getTableData('anesthesia-hoja2', 0),
            // Hoja 1
            fecha: el.querySelector('input[type="date"]')?.value || '',
            especie: generalTextInputs[0]?.value || '',
            identificacion: generalTextInputs[1]?.value || '',
            sexo: generalSelects[0] ? generalSelects[0].options[generalSelects[0].selectedIndex]?.text : '',
            pesoAnterior: generalTextInputs[2]?.value || '',
            pesoActualizado: generalTextInputs[3]?.value || '',
            edad: generalTextInputs[4]?.value || '',
            metodo: generalSelects[1] ? generalSelects[1].options[generalSelects[1].selectedIndex]?.text : '',

            procedimiento: el.querySelector('textarea')?.value || '',

            estadoFisico: getRadioVal('estadoFisico'),
            estadoFisiologico: getRadioVal('estadoFisiologico'),
            condicionFisica: getRadioVal('condicionFisica'),

            horaInicio: generalTimeInputs[0]?.value || '',
            sonda: generalTextInputs[5]?.value || '',
            tiempoInduccion: el.querySelectorAll('input[type="text"]')[6]?.value || '',
            tiempoRecuperacion: el.querySelectorAll('input[type="text"]')[7]?.value || '',
            tiempoTotal: el.querySelectorAll('input[type="text"]')[8]?.value || '',

            hemograma: el.querySelectorAll('input[type="text"]')[9]?.value || '',
            bioquimica: el.querySelectorAll('input[type="text"]')[10]?.value || '',
            deshidratacion: getRadioVal('deshidratacion'),

            comentarios: el.querySelectorAll('textarea')[1]?.value || '',

            // Hoja 2
            muestraSangre: getCheckVal(0),
            muestraHeces: getCheckVal(1),
            muestraPiel: getCheckVal(2),
            muestraOrina: getCheckVal(3),
            muestraLcr: getCheckVal(4),
            muestraParasitos: getCheckVal(5),
            muestraRx: getCheckVal(6),
            muestraEndos: getCheckVal(7),
            muestraUs: getCheckVal(8),

            medicoResponsable: el.querySelector('.signature-block input[type="text"]')?.value || ''
        };

        generateAnesthesiaPDF(patient, protocolRows, monitoringRows, formRefs);
    };

    const handleFormSave = () => {
        const el = formRef.current;
        if (!el) {
            originalHandleSave();
            return;
        }

        const generalTextInputs = Array.from(el.querySelectorAll('input[type="text"]')).filter(i => !i.closest('table'));
        const generalSelects = Array.from(el.querySelectorAll('select')).filter(i => !i.closest('table'));

        const recordMeta = {
            fecha: el.querySelector('input[type="date"]')?.value || new Date().toISOString().split('T')[0],
            procedimiento: el.querySelector('textarea')?.value || '',
            metodo: generalSelects[1] ? generalSelects[1].options[generalSelects[1].selectedIndex]?.text : '',
            tiempoTotal: el.querySelectorAll('input[type="text"]')[8]?.value || '',
            medico: el.querySelector('.signature-block input[type="text"]')?.value || '',
        };

        originalHandleSave();
        if (onSave) {
            onSave(recordMeta);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div
                className={`${styles['anesthesia-form']} form-container-standard`}
                ref={formRef}
            >
                <AnesthesiaSheet1
                    patient={patient}
                    protocolRows={protocolRows}
                    addProtocolRow={addProtocolRow}
                    removeProtocolRow={removeProtocolRow}
                />

                <AnesthesiaSheet2
                    monitoringRows={monitoringRows}
                    addMonitoringRow={addMonitoringRow}
                    removeMonitoringRow={removeMonitoringRow}
                />
            </div>

            {/* Floating actions */}
            <div className="floating-actions ">
                {!isSaved ? (
                    <button className="floating-btn save-btn" onClick={handleFormSave} title="Guardar">
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

export default AnesthesiaForm;
