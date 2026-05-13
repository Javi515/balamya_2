import React from 'react';
import { FaBug, FaListAlt } from 'react-icons/fa';
import formStyles from '../../../forms/pages/FormsPage.module.css';

const DewormingMenu = ({ onRegister, onViewSummary }) => (
    <div className={`${formStyles['forms-page-wrapper']} ${formStyles['module-menu-wrapper']}`}>
        <div className={formStyles['forms-page-container']}>
            <div className={formStyles['forms-page-header']} style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 className={formStyles['forms-page-title']} style={{ fontSize: '2.5rem' }}>Desparasitaciones</h1>
                <p className={formStyles['forms-page-subtitle']}>¿Qué deseas hacer?</p>
            </div>
            <div className={formStyles['module-menu-grid']}>
                <div
                    className={`${formStyles['form-card']} ${formStyles['form-card-deworming']} ${formStyles['module-menu-card']}`}
                    onClick={onRegister}
                >
                    <div className={`${formStyles['form-card-content']} ${formStyles['module-menu-card-content']}`}>
                        <FaBug className={`${formStyles['form-card-icon']} ${formStyles['module-menu-icon']}`} style={{ color: '#28a745' }} />
                        <div className={formStyles['form-card-text']}>
                            <h3 className={`${formStyles['form-card-title']} ${formStyles['module-menu-title']}`}>REGISTRAR DESPARASITACIÓN</h3>
                            <p className={`${formStyles['form-card-description']} ${formStyles['module-menu-desc']}`}>Selecciona un ejemplar y registra una nueva desparasitación en su historial clínico.</p>
                        </div>
                    </div>
                </div>
                <div
                    className={`${formStyles['form-card']} ${formStyles['form-card-deworming']} ${formStyles['module-menu-card']}`}
                    onClick={onViewSummary}
                >
                    <div className={`${formStyles['form-card-content']} ${formStyles['module-menu-card-content']}`}>
                        <FaListAlt className={`${formStyles['form-card-icon']} ${formStyles['module-menu-icon']}`} style={{ color: '#28a745' }} />
                        <div className={formStyles['form-card-text']}>
                            <h3 className={`${formStyles['form-card-title']} ${formStyles['module-menu-title']}`}>VER DESPARASITACIONES</h3>
                            <p className={`${formStyles['form-card-description']} ${formStyles['module-menu-desc']}`}>Consulta el resumen de desparasitaciones de todos los pacientes y accede a su historial.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default DewormingMenu;
