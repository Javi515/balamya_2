import React from 'react';
import { FaSave, FaFilePdf } from 'react-icons/fa';
import { generateNotificacionAltaPDF } from '../../utils/exportNotificacionAltaPDF';
import styles from '../../styles/NotificacionAltaForm.module.css';
import cardStyles from '../../styles/Card.module.css';

import '../../styles/FloatingActions.css';

import ImageUploader from '../common/ImageUploader';

const NotificacionAltaForm = ({ patient }) => {
    const [isSaved, setIsSaved] = React.useState(false);

    const handleSave = () => setIsSaved(true);
    const formRef = React.useRef(null);

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

            fecha: el.querySelectorAll('.form-input[type="date"]')[0]?.value || '',
            area: el.querySelectorAll('.form-input[type="text"]')[0]?.value || '',
            identificacion: el.querySelectorAll('.form-input[type="text"]')[1]?.value || '',
            especie: el.querySelectorAll('.form-input[type="text"]')[2]?.value || '',
            nombreComun: el.querySelectorAll('.form-input[type="text"]')[3]?.value || '',
            albergue: el.querySelectorAll('.form-input[type="text"]')[4]?.value || '',
            edad: el.querySelectorAll('.form-input[type="text"]')[5]?.value || '',
            sexo: el.querySelector('select')?.value || '',

            descripcion: el.querySelector('textarea')?.value || '',

            horaAlta: el.querySelector('.hora-input[type="time"]')?.value || '',
            fechaAlta: el.querySelector('.hora-input[type="date"]')?.value || '',
            pacienteAlta: el.querySelectorAll('.hora-input[type="text"]')[0]?.value || ''
        };

        generateNotificacionAltaPDF(formRefs);
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
                            <input type="date" className={styles['form-input']} />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Área / Anexo Veterinaria</label>
                            <input type="text" className={styles['form-input']} placeholder="Área o anexo" />
                        </div>
                    </div>

                    <div className={styles['form-grid-3']}>
                        <div className={styles['form-group']}>
                            <label>Identificación</label>
                            <input
                                type="text"
                                className={styles['form-input']}
                                placeholder="ID del ejemplar"
                                defaultValue={patient?.id || ''}
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Especie</label>
                            <input
                                type="text"
                                className={styles['form-input']}
                                placeholder="Nombre científico"
                                defaultValue={patient?.scientificName || ''}
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Nombre Común</label>
                            <input
                                type="text"
                                className={styles['form-input']}
                                placeholder="Nombre común"
                                defaultValue={patient?.commonName || ''}
                            />
                        </div>
                    </div>

                    <div className={styles['form-grid-3']}>
                        <div className={styles['form-group']}>
                            <label>No. de Albergue / Jaula / Terrario</label>
                            <input type="text" className={styles['form-input']} placeholder="No. de albergue" />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Edad</label>
                            <input
                                type="text"
                                className={styles['form-input']}
                                placeholder="Edad"
                                defaultValue={patient?.age ? `${patient.age} años` : ''}
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Sexo</label>
                            <select className={styles['form-input']}>
                                <option value="">Seleccionar</option>
                                <option value="Macho">Macho</option>
                                <option value="Hembra">Hembra</option>
                                <option value="Indeterminado">Indeterminado</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Descripción */}
                <div className={styles['form-section']}>
                    <h4 className={styles['section-title']}>Descripción del Alta</h4>
                    <div className={styles['form-group']}>
                        <label>Descripción / Motivo del alta</label>
                        <textarea
                            className={styles['form-textarea']}
                            rows="4"
                            placeholder="Describa el motivo y condiciones del alta del paciente..."
                        />
                    </div>
                </div>

                {/* Hora de Alta */}
                <div className={styles['form-section']}>
                    <h4 className={styles['section-title']}>Hora de Alta</h4>
                    <div className={styles['hora-row']}>
                        <span>Hora:</span>
                        <input type="time" className={styles['hora-input']} />
                        <span>de</span>
                        <input type="date" className={`${styles['hora-input']} ${styles['wide']}`} />
                        <span>del</span>
                        <span>Alta del paciente:</span>
                        <input type="text" className={`${styles['hora-input']} ${styles['wide']}`} placeholder="Nombre del paciente" defaultValue={patient?.commonName || ''} />
                    </div>
                </div>

                {/* Firmas */}
                <div className={styles['signature-section']}>
                    <div className={styles['signature-block']}>
                        <div className={styles['signature-line']}></div>
                        <label>Notificó</label>
                    </div>
                    <div className={styles['signature-block']}>
                        <div className={styles['signature-line']}></div>
                        <label>Enterado</label>
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

export default NotificacionAltaForm;
