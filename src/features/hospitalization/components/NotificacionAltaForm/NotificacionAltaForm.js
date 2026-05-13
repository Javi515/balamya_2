import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaFilePdf } from 'react-icons/fa';
import { useAuth } from '../../../../context/AuthContext';
import { generateNotificacionAltaPDF } from '../../utils/exportNotificacionAltaPDF';
import { createNotificacionAlta, discharge, updateNotificacionAlta } from '../../../../services/hospitalizationService';
import styles from './NotificacionAltaForm.module.css';
import cardStyles from '../../../../styles/shared/Card.module.css';

import '../../../../styles/FloatingActions.css';

import ImageUploader from '../../../../components/common/ImageUploader/ImageUploader';

const toDateInputValue = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};
const toTimeInputValue = (d) => d.toTimeString().slice(0, 5);

const NotificacionAltaForm = ({ patient }) => {
    const navigate = useNavigate();
    const isViewMode = !!patient?._viewMode;
    const isReadOnly = !!patient?._readOnly;
    const [isDirty, setIsDirty] = React.useState(false);
    const [isSaved, setIsSaved] = React.useState(isViewMode);
    const [isSaving, setIsSaving] = React.useState(false);
    const { user } = useAuth();
    const markDirty = () => setIsDirty(true);

    const handleFechaChange = () => {
        if (fechaAltaRef.current) fechaAltaRef.current.value = fechaRef.current?.value || '';
        markDirty();
    };

    const handleFechaAltaChange = () => {
        if (fechaRef.current) fechaRef.current.value = fechaAltaRef.current?.value || '';
        markDirty();
    };
    const now = React.useMemo(() => new Date(), []);
    const todayStr = toDateInputValue(now);
    const nowTimeStr = toTimeInputValue(now);

    const formRef = React.useRef(null);
    const fechaRef = React.useRef(null);
    const areaAnexoRef = React.useRef(null);
    const noAlbergueRef = React.useRef(null);
    const edadRef = React.useRef(null);
    const descripcionRef = React.useRef(null);
    const horaAltaRef = React.useRef(null);
    const fechaAltaRef = React.useRef(null);

    const buildPayload = () => ({
        fecha: fechaRef.current?.value || '',
        horaAlta: horaAltaRef.current?.value || '',
        areaAnexo: areaAnexoRef.current?.value || '',
        noAlbergue: noAlbergueRef.current?.value || '',
        descripcionMotivoAlta: descripcionRef.current?.value || '',
        edad: edadRef.current?.value || '',
        sexo: patient?.sex || '',
        nombreNotifico: user?.name || '',
        nombreEnterado: '',
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (isViewMode) {
                await updateNotificacionAlta(patient?.id_alta, buildPayload());
                setIsDirty(false);
                alert('Notificación de alta editada correctamente.');
            } else {
                await createNotificacionAlta({ idEjemplar: String(patient?.id || ''), ...buildPayload() });
                await discharge(patient?.id);
                setIsSaved(true);
                alert('Notificación de alta creada correctamente.');
                navigate('/hospitalization');
            }
        } catch (err) {
            if (err?.status === 403) {
                alert('No tienes permiso para editar esta notificación de alta. Solo el usuario que la creó puede modificarla.');
            } else {
                alert(err?.message || 'No se pudo guardar el alta.');
            }
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

        generateNotificacionAltaPDF({
            logoLeft:      getLogoSrc('.header-logo-left'),
            logoRight:     getLogoSrc('.header-logo-right'),
            fecha:         fechaRef.current?.value || '',
            area:          areaAnexoRef.current?.value || '',
            identificacion: patient?.identificacionMarcaje || patient?.id || '',
            especie:       patient?.scientificName || patient?.species || '',
            nombreComun:   patient?.commonName || '',
            albergue:      noAlbergueRef.current?.value || '',
            edad:          edadRef.current?.value || '',
            descripcion:   descripcionRef.current?.value || '',
            horaAlta:      horaAltaRef.current?.value || '',
            fechaAlta:     fechaAltaRef.current?.value || '',
            pacienteAlta:  patient?.commonName || '',
        });
    };

    return (
        <div className={`${cardStyles['card']} form-container-standard`} ref={formRef}>
            <div className={styles['notificacion-form']}>

                {/* Encabezado */}
                <div className={styles['form-header']}
                    style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', width: '100%' }}>
                    <ImageUploader placeholderText="Logo" className="header-logo-left" />
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <h1>Zoológico Regional Miguel Álvarez del Toro</h1>
                        <h2>Clínica Veterinaria</h2>
                        <h3>Notificación de Alta</h3>
                    </div>
                    <ImageUploader placeholderText="Logo" className="header-logo-right" />
                </div>

                {/* Datos del Ejemplar */}
                <div className={styles['form-section']}>
                    <h4 className={styles['section-title']}>Datos del Ejemplar</h4>

                    <div className={styles['form-grid-2']}>
                        <div className={styles['form-group']}>
                            <label>Fecha</label>
                            <input ref={fechaRef} type="date" className={styles['form-input']} defaultValue={patient?.fecha || todayStr} onChange={handleFechaChange} />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Área / Anexo Veterinaria</label>
                            <input ref={areaAnexoRef} type="text" className={styles['form-input']} placeholder="Área o anexo" defaultValue={patient?.area_anexo || ''} onChange={markDirty} />
                        </div>
                    </div>

                    <div className={styles['form-grid-3']}>
                        <div className={styles['form-group']}>
                            <label>Identificación</label>
                            <input
                                type="text"
                                className={styles['form-input']}
                                placeholder="ID del ejemplar"
                                defaultValue={patient?.identificacionMarcaje || patient?.id || ''}
                                readOnly
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Especie</label>
                            <input
                                type="text"
                                className={styles['form-input']}
                                placeholder="Nombre científico"
                                defaultValue={patient?.scientificName || patient?.species || ''}
                                readOnly
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Nombre Común</label>
                            <input
                                type="text"
                                className={styles['form-input']}
                                placeholder="Nombre común"
                                defaultValue={patient?.commonName || ''}
                                readOnly
                            />
                        </div>
                    </div>

                    <div className={styles['form-grid-2']}>
                        <div className={styles['form-group']}>
                            <label>No. de Albergue / Jaula / Terrario</label>
                            <input ref={noAlbergueRef} type="text" className={styles['form-input']} placeholder="No. de albergue" defaultValue={patient?.no_albergue || ''} onChange={markDirty} />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Edad</label>
                            <input
                                ref={edadRef}
                                type="text"
                                className={styles['form-input']}
                                placeholder="Edad"
                                defaultValue={patient?.edad ?? patient?.age ?? ''}
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                {/* Descripción */}
                <div className={styles['form-section']}>
                    <h4 className={styles['section-title']}>Descripción del Alta</h4>
                    <div className={styles['form-group']}>
                        <label>Descripción / Motivo del alta</label>
                        <textarea
                            ref={descripcionRef}
                            className={styles['form-textarea']}
                            rows="4"
                            placeholder="Describa el motivo y condiciones del alta del paciente..."
                            defaultValue={patient?.descripcion_motivo_alta || ''}
                            onChange={markDirty}
                        />
                    </div>
                </div>

                {/* Hora de Alta */}
                <div className={styles['form-section']}>
                    <h4 className={styles['section-title']}>Hora de Alta</h4>
                    <div className={styles['hora-row']}>
                        <span>Hora:</span>
                        <input ref={horaAltaRef} type="time" className={styles['hora-input']} defaultValue={patient?.hora_alta || nowTimeStr} onChange={markDirty} />
                        <span>de</span>
                        <input ref={fechaAltaRef} type="date" className={`${styles['hora-input']} ${styles['wide']}`} defaultValue={patient?.fecha || todayStr} onChange={handleFechaAltaChange} />
                        <span>del</span>
                        <span>Alta del paciente:</span>
                        <input type="text" className={`${styles['hora-input']} ${styles['wide']}`} placeholder="Nombre del paciente" defaultValue={patient?.commonName || ''} />
                    </div>
                </div>

                {/* Firmas */}
                <div className={styles['signature-section']}>
                    <div className={styles['signature-block']}>
                        <span style={{ display: 'block', textAlign: 'center', fontSize: '0.85rem', color: '#334155', marginBottom: '6px' }}>{patient?.nombre_notifico || user?.name || ''}</span>
                        <div className={styles['signature-line']}></div>
                        <label>Notificó</label>
                    </div>
                    <div className={styles['signature-block']}>
                        <span style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', visibility: 'hidden' }}>—</span>
                        <div className={styles['signature-line']}></div>
                        <label>Enterado</label>
                    </div>
                </div>

                {/* Botones Flotantes */}
                <div className="floating-actions">
                    {(!isReadOnly && (!isSaved || isDirty)) ? (
                        <button className="floating-btn save-btn" onClick={handleSave} disabled={isSaving} title={isViewMode ? 'Guardar cambios' : 'Guardar y dar de alta'}>
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

export default NotificacionAltaForm;
