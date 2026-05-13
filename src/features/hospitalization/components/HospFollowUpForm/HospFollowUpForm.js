import React, { useEffect, useRef, useState } from 'react';
import { FaSave, FaFilePdf } from 'react-icons/fa';
import { generateHospFollowUpPDF } from '../../utils/exportHospFollowUpPDF';
import { createHospitalizationFollowUp, getFollowUps } from '../../../../services/hospitalizationService';
import { useAuth } from '../../../../context/AuthContext';
import styles from './HospFollowUpForm.module.css';
import cardStyles from '../../../../styles/shared/Card.module.css';

import '../../../../styles/FloatingActions.css';

import ImageUploader from '../../../../components/common/ImageUploader/ImageUploader';

const MAX_HOSPITALIZATION_ROWS = 10;

const getPatientId = (patient) =>
    String(patient?.idEjemplar || patient?.id || patient?.identificacionMarcaje || '').trim();

const getPatientLabel = (patient) =>
    String(patient?.id || patient?.identificacionMarcaje || patient?.idEjemplar || '').trim();

const getPatientWeight = (patient) => {
    const weight = patient?.weight ?? patient?.peso ?? patient?.pesoKg ?? patient?.peso_kg ?? '';
    return weight === null || weight === undefined ? '' : String(weight);
};

const toNumber = (value) => {
    const normalizedValue = String(value ?? '').trim().replace(',', '.');

    if (!normalizedValue) {
        return null;
    }

    const exactValue = Number(normalizedValue);
    if (Number.isFinite(exactValue)) return exactValue;

    const match = normalizedValue.match(/-?\d+(\.\d+)?/);
    if (!match) return null;

    const parsedValue = Number(match[0]);
    return Number.isFinite(parsedValue) ? parsedValue : null;
};

const sanitizeNumericInput = (value, { allowDecimal = false } = {}) => {
    const normalizedValue = String(value ?? '').replace(',', '.');

    if (!allowDecimal) {
        return normalizedValue.replace(/\D/g, '');
    }

    const numericParts = normalizedValue.replace(/[^\d.]/g, '').split('.');
    return numericParts.length > 1
        ? `${numericParts[0]}.${numericParts.slice(1).join('')}`
        : numericParts[0];
};

const blockInvalidNumericKey = (event, { allowDecimal = false } = {}) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const allowedControlKeys = [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'Home',
        'End',
    ];

    if (allowedControlKeys.includes(event.key)) return;
    if (/^\d$/.test(event.key)) return;
    if (allowDecimal && ['.', ','].includes(event.key) && !String(event.currentTarget.value).includes('.')) return;

    event.preventDefault();
};

const getTodayDateValue = () => {
    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const getResponsibleName = (user) =>
    user?.name
    || user?.nombreCompleto
    || user?.nombre_usuario
    || user?.nombreUsuario
    || (getResponsibleId(user) ? `Usuario ${getResponsibleId(user)}` : '');

const getResponsibleId = (user) =>
    user?.idUsuario ?? user?.id_usuario ?? user?.id ?? null;

const createBlankRow = () => ({
    id: `row-${Date.now()}-${Math.random()}`,
    idEjemplar: '',
    patientLabel: '',
    lockedPatient: false,
    hora: '',
    peso: '',
    frecuenciaCardiaca: '',
    frecuenciaRespiratoria: '',
    temperatura: '',
    pulso: '',
    mucosas: '',
    tllc: '',
    observaciones: '',
});

const createPatientRow = (patient, index) => ({
    ...createBlankRow(),
    id: `patient-${getPatientId(patient) || index}-${index}`,
    idEjemplar: getPatientId(patient),
    patientLabel: getPatientLabel(patient),
    lockedPatient: true,
    peso: sanitizeNumericInput(getPatientWeight(patient), { allowDecimal: true }),
});

const buildViewRows = (sessionRecords) =>
    (sessionRecords || []).map((rec, index) => ({
        id: `view-${rec.idSeguimiento || index}`,
        idEjemplar: String(rec.idEjemplar || ''),
        patientLabel: rec.identificacionMarcaje || rec.idEjemplar || '',
        lockedPatient: true,
        hora: rec.hora || '',
        peso: rec.peso !== null && rec.peso !== undefined ? String(rec.peso) : '',
        frecuenciaCardiaca: rec.frecuenciaCardiaca !== null && rec.frecuenciaCardiaca !== undefined ? String(rec.frecuenciaCardiaca) : '',
        frecuenciaRespiratoria: rec.frecuenciaRespiratoria !== null && rec.frecuenciaRespiratoria !== undefined ? String(rec.frecuenciaRespiratoria) : '',
        temperatura: rec.temperatura !== null && rec.temperatura !== undefined ? String(rec.temperatura) : '',
        pulso: rec.pulso || '',
        mucosas: rec.mucosas || '',
        tllc: rec.tllc || '',
        observaciones: rec.observaciones || '',
        responsible: rec.responsible || '',
    }));

const buildExistingRow = (rec, index) => ({
    id: `existing-${rec.idSeguimiento || index}`,
    idEjemplar: String(rec.idEjemplar || ''),
    patientLabel: rec.name || rec.commonName || rec.identificacionMarcaje || '',
    lockedPatient: true,
    isExistingRecord: true,
    hora: rec.hora || '',
    peso: rec.peso !== null && rec.peso !== undefined ? String(rec.peso) : '',
    frecuenciaCardiaca: rec.frecuenciaCardiaca !== null && rec.frecuenciaCardiaca !== undefined ? String(rec.frecuenciaCardiaca) : '',
    frecuenciaRespiratoria: rec.frecuenciaRespiratoria !== null && rec.frecuenciaRespiratoria !== undefined ? String(rec.frecuenciaRespiratoria) : '',
    temperatura: rec.temperatura !== null && rec.temperatura !== undefined ? String(rec.temperatura) : '',
    pulso: rec.pulso || '',
    mucosas: rec.mucosas || '',
    tllc: rec.tllc || '',
    observaciones: rec.observaciones || '',
});

const buildInitialRows = (patient, sessionRecords) => {
    const existingRows = (sessionRecords || []).map(buildExistingRow);
    const remaining = MAX_HOSPITALIZATION_ROWS - existingRows.length;

    const selectedPatients = (Array.isArray(patient) ? patient : patient ? [patient] : [])
        .filter(Boolean)
        .slice(0, remaining);

    if (selectedPatients.length > 0) {
        return [...existingRows, ...selectedPatients.map((p, i) => createPatientRow(p, i))];
    }

    return [...existingRows, ...Array.from({ length: remaining }, () => createBlankRow())];
};

const buildPayload = (row, fecha, idUsuario, numSeguimiento) => {
    const payload = {
        idEjemplar: Number(row.idEjemplar.trim()),
        fecha,
        hora: row.hora,
        pulso: row.pulso.trim(),
        mucosas: row.mucosas.trim(),
        tllc: row.tllc.trim(),
        observaciones: row.observaciones.trim(),
        numSeguimiento,
    };

    if (idUsuario !== null && idUsuario !== undefined && String(idUsuario).trim()) {
        payload.idUsuario = idUsuario;
    }

    const numericFields = [
        ['peso', row.peso],
        ['frecuenciaCardiaca', row.frecuenciaCardiaca],
        ['frecuenciaRespiratoria', row.frecuenciaRespiratoria],
        ['temperatura', row.temperatura],
    ];

    numericFields.forEach(([field, value]) => {
        const numberValue = toNumber(value);
        if (numberValue !== null) {
            payload[field] = numberValue;
        }
    });

    return payload;
};

const HospFollowUpForm = ({ patient, currentSessionRecords = [], initialNumSeguimiento = null }) => {
    const { user } = useAuth();
    const isViewMode = Boolean(patient?._viewMode);
    const [generalData, setGeneralData] = useState(() => ({
        fecha: isViewMode ? (patient?.fecha || getTodayDateValue()) : getTodayDateValue(),
        responsable: isViewMode ? (patient?.responsible || '') : getResponsibleName(user),
    }));
    const [hospRows, setHospRows] = useState(() =>
        isViewMode ? buildViewRows(patient?._sessionRecords) : buildInitialRows(patient, currentSessionRecords)
    );
    const [isSaved, setIsSaved] = useState(isViewMode);
    const [isSaving, setIsSaving] = useState(false);

    const [numSeguimiento, setNumSeguimiento] = useState(initialNumSeguimiento || 1);
    const [availableSlots, setAvailableSlots] = useState(MAX_HOSPITALIZATION_ROWS - (currentSessionRecords || []).length);
    const formRef = useRef(null);

    useEffect(() => {
        if (isViewMode) return;
        if (initialNumSeguimiento != null) return;
        getFollowUps()
            .then((records) => {
                if (records.length === 0) {
                    setNumSeguimiento(1);
                    setAvailableSlots(MAX_HOSPITALIZATION_ROWS);
                    return;
                }
                const max = Math.max(...records.map((r) => r.numSeguimiento || 0));
                const countInLastSession = records.filter((r) => r.numSeguimiento === max).length;
                if (countInLastSession >= MAX_HOSPITALIZATION_ROWS) {
                    setNumSeguimiento(max + 1);
                    setAvailableSlots(MAX_HOSPITALIZATION_ROWS);
                } else {
                    setNumSeguimiento(max);
                    setAvailableSlots(MAX_HOSPITALIZATION_ROWS - countInLastSession);
                }
            })
            .catch(() => {
                setNumSeguimiento(1);
                setAvailableSlots(MAX_HOSPITALIZATION_ROWS);
            });
    }, [isViewMode, initialNumSeguimiento]);

    useEffect(() => {
        if (isViewMode) return;
        setHospRows(buildInitialRows(patient, currentSessionRecords));
        setIsSaved(false);
    }, [patient, isViewMode]); // currentSessionRecords is stable from navigation state

    useEffect(() => {
        if (isViewMode) return;
        setHospRows((prev) => {
            if (prev.length <= MAX_HOSPITALIZATION_ROWS) return prev;
            const existing = prev.filter((r) => r.isExistingRecord);
            const newRows = prev.filter((r) => !r.isExistingRecord);
            return [...existing, ...newRows.slice(0, MAX_HOSPITALIZATION_ROWS - existing.length)];
        });
    }, [availableSlots, isViewMode]);

    useEffect(() => {
        setGeneralData((previous) => ({
            ...previous,
            fecha: previous.fecha || getTodayDateValue(),
            responsable: getResponsibleName(user),
        }));
    }, [user]);

    const updateGeneralData = (field, value) => {
        setGeneralData((previous) => ({ ...previous, [field]: value }));
        setIsSaved(false);
    };

    const updateRow = (rowId, field, value) => {
        setHospRows((previousRows) =>
            previousRows.map((row) => {
                if (row.id !== rowId) return row;

                const nextRow = { ...row, [field]: value };

                if (field === 'patientLabel' && !row.lockedPatient) {
                    nextRow.idEjemplar = value.trim();
                }

                return nextRow;
            })
        );
        setIsSaved(false);
    };

    const updateNumericRow = (rowId, field, value, options) => {
        updateRow(rowId, field, sanitizeNumericInput(value, options));
    };


    const validateRows = (rowsToSave) => {
        if (!generalData.fecha) {
            return 'Selecciona la fecha del seguimiento.';
        }

        if (rowsToSave.length === 0) {
            return 'Selecciona al menos un paciente o captura un ID de ejemplar.';
        }

        const rowWithoutHour = rowsToSave.find((row) => !row.hora);
        if (rowWithoutHour) {
            return `Captura la hora para ${rowWithoutHour.patientLabel || rowWithoutHour.idEjemplar}.`;
        }

        const rowWithoutWeight = rowsToSave.find((row) => toNumber(row.peso) === null);
        if (rowWithoutWeight) {
            return `Captura un peso valido para ${rowWithoutWeight.patientLabel || rowWithoutWeight.idEjemplar}.`;
        }

        return '';
    };

    const handleSaveFollowUp = async () => {
        const rowsToSave = hospRows.filter((row) => row.idEjemplar.trim() && !row.isExistingRecord);
        const validationMessage = validateRows(rowsToSave);

        if (validationMessage) {
            alert(validationMessage);
            return;
        }

        setIsSaving(true);

        try {
            const idUsuario = getResponsibleId(user);
            const payloads = rowsToSave.map((row) => buildPayload(row, generalData.fecha, idUsuario, numSeguimiento));
            await Promise.all(payloads.map((payload) => createHospitalizationFollowUp(payload)));
            setIsSaved(true);
            alert('Registros guardados correctamente.');
        } catch (error) {
            console.error('[hospitalization follow-up]', error);
            setIsSaved(false);
            alert(error?.message || 'No fue posible guardar el seguimiento hospitalario.');
        } finally {
            setIsSaving(false);
        }
    };

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

                <div className={styles['hosp-data-row']}>
                    <div className={styles['hosp-field']}>
                        <label>Fecha:</label>
                        <input
                            type="date"
                            className={styles['form-input']}
                            value={generalData.fecha}
                            onChange={(event) => updateGeneralData('fecha', event.target.value)}
                        />
                    </div>
                </div>

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
                                {isViewMode && <th>Responsable</th>}
                                {!isViewMode && <th className={`${styles['action-col']}`}></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {hospRows.map((row) => {
                                const rowReadOnly = isViewMode || Boolean(row.isExistingRecord);
                                return (
                                <tr key={row.id} className={styles['protocol-row']} style={row.isExistingRecord ? { background: '#f8fafc', opacity: 0.85 } : undefined}>
                                    <td className={styles['td-patient']}>
                                        <input
                                            type="text"
                                            className={styles['table-input']}
                                            value={row.patientLabel}
                                            readOnly={row.lockedPatient || isViewMode}
                                            placeholder="ID ejemplar"
                                            onChange={(event) => updateRow(row.id, 'patientLabel', event.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="time"
                                            className={styles['table-input']}
                                            value={row.hora}
                                            readOnly={rowReadOnly}
                                            onChange={(event) => !rowReadOnly && updateRow(row.id, 'hora', event.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            className={styles['table-input']}
                                            placeholder="Ej. 40"
                                            value={row.peso}
                                            readOnly={rowReadOnly}
                                            onKeyDown={(event) => !rowReadOnly && blockInvalidNumericKey(event, { allowDecimal: true })}
                                            onChange={(event) => !rowReadOnly && updateNumericRow(row.id, 'peso', event.target.value, { allowDecimal: true })}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className={styles['table-input']}
                                            placeholder="Ej. 80"
                                            value={row.frecuenciaCardiaca}
                                            readOnly={rowReadOnly}
                                            onKeyDown={(event) => !rowReadOnly && blockInvalidNumericKey(event)}
                                            onChange={(event) => !rowReadOnly && updateNumericRow(row.id, 'frecuenciaCardiaca', event.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className={styles['table-input']}
                                            placeholder="Ej. 20"
                                            value={row.frecuenciaRespiratoria}
                                            readOnly={rowReadOnly}
                                            onKeyDown={(event) => !rowReadOnly && blockInvalidNumericKey(event)}
                                            onChange={(event) => !rowReadOnly && updateNumericRow(row.id, 'frecuenciaRespiratoria', event.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            className={styles['table-input']}
                                            placeholder="Ej. 25"
                                            value={row.temperatura}
                                            readOnly={rowReadOnly}
                                            onKeyDown={(event) => !rowReadOnly && blockInvalidNumericKey(event, { allowDecimal: true })}
                                            onChange={(event) => !rowReadOnly && updateNumericRow(row.id, 'temperatura', event.target.value, { allowDecimal: true })}
                                        />
                                    </td>
                                    <td><input type="text" className={styles['table-input']} value={row.pulso} readOnly={rowReadOnly} onChange={(event) => !rowReadOnly && updateRow(row.id, 'pulso', event.target.value)} /></td>
                                    <td><input type="text" className={styles['table-input']} value={row.mucosas} readOnly={rowReadOnly} onChange={(event) => !rowReadOnly && updateRow(row.id, 'mucosas', event.target.value)} /></td>
                                    <td><input type="text" className={styles['table-input']} value={row.tllc} readOnly={rowReadOnly} onChange={(event) => !rowReadOnly && updateRow(row.id, 'tllc', event.target.value)} /></td>
                                    <td><input type="text" className={`${styles['table-input']} ${styles['wide']}`} value={row.observaciones} readOnly={rowReadOnly} onChange={(event) => !rowReadOnly && updateRow(row.id, 'observaciones', event.target.value)} /></td>
                                    {isViewMode && <td style={{ fontSize: '0.78rem', color: '#475569', whiteSpace: 'nowrap' }}>{row.responsible || generalData.responsable || '—'}</td>}
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>


                <div className="floating-actions ">
                    {!isSaved ? (
                        <button
                            className="floating-btn save-btn"
                            onClick={handleSaveFollowUp}
                            title="Guardar"
                            disabled={isSaving}
                        >
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
