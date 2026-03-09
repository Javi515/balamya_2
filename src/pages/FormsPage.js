import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ClinicalReviewForm from '../components/dashboard/ClinicalReviewForm';
import DewormingCalendar from '../components/dashboard/DewormingCalendar';
import VaccinationForm from '../components/dashboard/VaccinationForm';
import NecropsyReportForm from '../components/dashboard/NecropsyReportForm';
import AnesthesiaForm from '../components/dashboard/AnesthesiaForm';
import TreatmentForm from '../components/dashboard/TreatmentForm';
import GroupTreatmentForm from '../components/dashboard/GroupTreatmentForm';
import HospFollowUpForm from '../components/dashboard/HospFollowUpForm';
import NotificacionAltaForm from '../components/dashboard/NotificacionAltaForm';
import AnimalSelector from '../components/dashboard/AnimalSelector';
import { FaFileMedical, FaSyringe, FaCalendarAlt, FaArrowLeft, FaSkull, FaPaw, FaExchangeAlt, FaProcedures, FaNotesMedical, FaHospital, FaUsers, FaArrowRight, FaSignOutAlt } from 'react-icons/fa';
import styles from '../styles/FormsPage.module.css';

import useFormsPage from '../hooks/useFormsPage';

const FormsPage = () => {
    const [searchParams] = useSearchParams();
    const {
        selectedAnimal,
        viewState,
        targetForm,
        handleSelectForm,
        handleAnimalSelect,
        cancelSelection,
        backToSelection,
        handleChangeAnimal,
        backToMenu
    } = useFormsPage();

    const formCards = [
        {
            key: 'deworming',
            icon: <FaCalendarAlt className={styles['form-card-icon']} style={{ color: '#28a745' }} />,
            title: 'CALENDARIO DE DESPARASITACIÓN',
            description: 'Calendario de desparasitación y control preventivo.',
        },
        {
            key: 'vaccination',
            icon: <FaSyringe className={styles['form-card-icon']} style={{ color: '#dc3545' }} />,
            title: 'FORMATO DE VACUNACIÓN',
            description: 'Registro oficial de vacunación y medicina preventiva.',
        },
        {
            key: 'clinicalReview',
            icon: <FaFileMedical className={styles['form-card-icon']} style={{ color: '#007bff' }} />,
            title: 'REVISIÓN CLÍNICA',
            description: 'Formato para la revisión clínica detallada de ejemplares.',
        },
        {
            key: 'necropsy',
            icon: <FaSkull className={styles['form-card-icon']} style={{ color: '#333' }} />,
            title: 'REPORTE DE NECROPSIA',
            description: 'Formato oficial para el reporte de necropsias.',
        },
        {
            key: 'anesthesia',
            icon: <FaProcedures className={styles['form-card-icon']} style={{ color: '#8b5cf6' }} />,
            title: 'REGISTRO DE ANESTESIA',
            description: 'Formato para el registro y monitorización de anestesia.',
        },
        {
            key: 'treatment',
            icon: <FaNotesMedical className={styles['form-card-icon']} style={{ color: '#059669' }} />,
            title: 'FORMATO DE TRATAMIENTO',
            description: 'Formato para el registro y seguimiento de tratamientos.',
        },
        {
            key: 'groupTreatment',
            icon: <FaUsers className={styles['form-card-icon']} style={{ color: '#0891b2' }} />,
            title: 'TRATAMIENTO GRUPAL',
            description: 'Formato para tratamiento de grupos de ejemplares.',
        },
        {
            key: 'hospFollowUp',
            icon: <FaHospital className={styles['form-card-icon']} style={{ color: '#dc2626' }} />,
            title: 'SEGUIMIENTO HOSPITALIZACIÓN',
            description: 'Formato de seguimiento de pacientes hospitalizados.',
        },
        {
            key: 'notificacionAlta',
            icon: <FaSignOutAlt className={styles['form-card-icon']} style={{ color: '#d97706' }} />,
            title: 'NOTIFICACIÓN DE ALTA',
            description: 'Formato oficial de notificación de alta del paciente.',
        }
    ];

    const renderContent = () => {
        // View 1: Menu
        if (viewState === 'menu') {
            const isFromHistory = searchParams.get('origin') === 'history';
            return (
                <div className={styles['forms-page-container']}>
                    {isFromHistory && (
                        <div className={styles['form-header-controls']} style={{ marginBottom: '20px' }}>
                            <button onClick={backToMenu} className={styles['back-to-menu-btn']}>
                                <FaArrowLeft /> Volver al Historial
                            </button>
                        </div>
                    )}
                    <div className={styles['forms-page-header']}>
                        <h1 className={styles['forms-page-title']}>Herramientas Clínicas</h1>
                        <p className={styles['forms-page-subtitle']}>Formularios y herramientas para la gestión clínica veterinaria.</p>
                    </div>
                    <div className={styles['form-grid-container']}>
                        {formCards.map((card) => {
                            const specificClass = `form-card-${card.key}`;
                            return (
                                <div key={card.key} className={`${styles['form-card']} ${styles[specificClass] || specificClass}`}>
                                    <div className={styles['form-card-content']}>
                                        {card.icon}
                                        <div className={styles['form-card-text']}>
                                            <h3 className={styles['form-card-title']}>{card.title}</h3>
                                            <p className={styles['form-card-description']}>{card.description}</p>
                                        </div>
                                    </div>
                                    <div className={styles['form-card-footer']}>
                                        <button className={styles['form-card-button']} onClick={() => handleSelectForm(card.key)}>
                                            <FaArrowRight />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        // View 2: Animal Selection
        if (viewState === 'selection') {
            return (
                <div className={styles['form-entry-animation']}>
                    <button onClick={cancelSelection} className={styles['back-to-menu-btn']}>
                        <FaArrowLeft /> Volver al menú
                    </button>
                    <AnimalSelector onSelect={handleAnimalSelect} />
                </div>
            );
        }

        // View 3: The Form itself
        if (viewState === 'form' && selectedAnimal) {
            const originStr = searchParams.get('origin');
            let backText = 'Volver al menú';
            if (originStr === 'history') backText = 'Volver al Historial';
            else if (originStr === 'hospitalization') backText = 'Volver a Hospitalizados';
            else if (originStr === 'treatments') backText = 'Volver a Tratamientos';
            else if (originStr === 'vaccinations') backText = 'Volver a Vacunaciones';
            else if (originStr === 'deworming') backText = 'Volver a Desparasitaciones';

            return (
                <div className={styles['form-entry-animation']}>
                    <div className={styles['form-header-controls']}>
                        <button onClick={backToMenu} className={styles['back-to-menu-btn']}>
                            <FaArrowLeft /> {backText}
                        </button>

                        <div className={`${styles['selected-animal-banner']} ${styles.compact}`}>
                            <div className={styles['animal-banner-info']}>
                                <span className={styles['banner-label']}>Paciente:</span>
                                <span className={styles['banner-name']}>{selectedAnimal.commonName || 'Sin Nombre Común'}</span>
                            </div>
                            <button onClick={handleChangeAnimal} className={styles['change-animal-btn']}>
                                <FaExchangeAlt /> Cambiar
                            </button>
                        </div>
                    </div>

                    {targetForm === 'deworming' && <DewormingCalendar onBack={backToSelection} patient={selectedAnimal} />}
                    {targetForm === 'vaccination' && <VaccinationForm onBack={backToSelection} patient={selectedAnimal} />}
                    {targetForm === 'clinicalReview' && <ClinicalReviewForm patient={selectedAnimal} />}
                    {targetForm === 'necropsy' && <NecropsyReportForm onBack={backToSelection} patient={selectedAnimal} />}
                    {targetForm === 'anesthesia' && <AnesthesiaForm onBack={backToSelection} patient={selectedAnimal} />}
                    {targetForm === 'treatment' && <TreatmentForm onBack={backToSelection} patient={selectedAnimal} />}
                    {targetForm === 'groupTreatment' && <GroupTreatmentForm onBack={backToSelection} patient={selectedAnimal} />}
                    {targetForm === 'hospFollowUp' && <HospFollowUpForm onBack={backToSelection} patient={selectedAnimal} />}
                    {targetForm === 'notificacionAlta' && <NotificacionAltaForm onBack={backToSelection} patient={selectedAnimal} />}
                </div>
            );
        }

        return null;
    };

    return (
        <div className={styles['forms-page-wrapper']}>
            {renderContent()}
        </div>
    );
};

export default FormsPage;