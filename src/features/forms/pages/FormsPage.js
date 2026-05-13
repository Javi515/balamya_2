import React from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
    FaArrowLeft,
    FaArrowRight,
    FaCalendarAlt,
    FaExchangeAlt,
    FaFileMedical,
    FaHospital,
    FaNotesMedical,
    FaProcedures,
    FaSignOutAlt,
    FaSkull,
    FaSyringe,
    FaUsers,
} from 'react-icons/fa';
import ClinicalReviewForm from '../../clinical/components/ClinicalReviewForm/ClinicalReviewForm';
import DewormingCalendar from '../../deworming/components/DewormingCalendar/DewormingCalendar';
import VaccinationForm from '../../vaccinations/components/VaccinationForm/VaccinationForm';
import NecropsyReportForm from '../../necropsy/components/NecropsyReportForm/NecropsyReportForm';
import AnesthesiaForm from '../../anesthesia/components/AnesthesiaForm/AnesthesiaForm';
import TreatmentForm from '../../treatments/components/TreatmentForm/TreatmentForm';
import GroupTreatmentForm from '../../treatments/components/TreatmentForm/GroupTreatmentForm';
import HospFollowUpForm from '../../hospitalization/components/HospFollowUpForm/HospFollowUpForm';
import NotificacionAltaForm from '../../hospitalization/components/NotificacionAltaForm/NotificacionAltaForm';
import AnimalSelector from '../../../components/common/AnimalSelector/AnimalSelector';
import styles from './FormsPage.module.css';
import useFormsPage from '../../../hooks/useFormsPage';
import { createClinicalReviewApi, updateClinicalReviewApi, updateClinicalReviewAvesApi, updateClinicalReviewReptilesApi } from '../../../services/clinicalService';

const FormsPage = () => {
    const [searchParams] = useSearchParams();
    const { state: locationState } = useLocation();
    const existingRecord = locationState?.existingRecord || null;
    const viewOnly = locationState?.viewOnly || false;
    const hospAvailableSlots = locationState?.availableSlots ?? 10;
    const hospCurrentSessionRecords = locationState?.currentSessionRecords || [];
    const hospNumSeguimiento = locationState?.numSeguimiento ?? null;
    const {
        selectedAnimal,
        viewState,
        targetForm,
        handleSelectForm,
        handleAnimalSelect,
        cancelSelection,
        backToSelection,
        handleChangeAnimal,
        backToMenu,
    } = useFormsPage();
    const selectedAnimals = Array.isArray(selectedAnimal) ? selectedAnimal : selectedAnimal ? [selectedAnimal] : [];
    const selectedAnimalLabel = selectedAnimals.length > 1
        ? `${selectedAnimals.length} pacientes seleccionados`
        : selectedAnimals[0]?.commonName || selectedAnimals[0]?.name || 'Sin nombre comun';

    const handleClinicalSave = async (formData) => {
        return await createClinicalReviewApi(selectedAnimal, formData);
    };

    const handleClinicalUpdate = async (fields) => {
        const variant = existingRecord?.variante || 'normal';
        const idRevision = existingRecord?.idRevision;
        if (variant === 'aves') await updateClinicalReviewAvesApi(idRevision, fields);
        else if (variant === 'reptiles') await updateClinicalReviewReptilesApi(idRevision, fields);
        else await updateClinicalReviewApi(idRevision, fields);
    };

    const formCards = [
        {
            key: 'deworming',
            icon: <FaCalendarAlt className={styles['form-card-icon']} style={{ color: '#28a745' }} />,
            title: 'CALENDARIO DE DESPARASITACION',
            description: 'Calendario de desparasitacion y control preventivo.',
        },
        {
            key: 'vaccination',
            icon: <FaSyringe className={styles['form-card-icon']} style={{ color: '#dc3545' }} />,
            title: 'FORMATO DE VACUNACION',
            description: 'Registro oficial de vacunacion y medicina preventiva.',
        },
        {
            key: 'clinicalReview',
            icon: <FaFileMedical className={styles['form-card-icon']} style={{ color: '#007bff' }} />,
            title: 'REVISION CLINICA',
            description: 'Formato para la revision clinica detallada de ejemplares.',
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
            description: 'Formato para el registro y monitorizacion de anestesia.',
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
            title: 'SEGUIMIENTO HOSPITALIZACION',
            description: 'Formato de seguimiento de pacientes hospitalizados.',
        },
        {
            key: 'notificacionAlta',
            icon: <FaSignOutAlt className={styles['form-card-icon']} style={{ color: '#d97706' }} />,
            title: 'NOTIFICACION DE ALTA',
            description: 'Formato oficial de notificacion de alta del paciente.',
        },
    ];

    const getSelectionBackText = (origin) => {
        if (origin === 'treatments') return 'Volver a Tratamientos';
        if (origin === 'hospitalization') return 'Volver a Hospitalizados';
        if (origin === 'medical-history') return 'Volver a Reportes Clinicos';
        return 'Volver al menu';
    };

    const renderContent = () => {
        if (viewState === 'menu') {
            const originStr = searchParams.get('origin');
            const isFromHistory = ['history', 'medical-history'].includes(originStr);
            const menuBackText =
                originStr === 'medical-history' ? 'Volver a Reportes Clinicos' : 'Volver al Historial';

            return (
                <div className={styles['forms-page-container']}>
                    {isFromHistory && (
                        <div className={styles['form-header-controls']} style={{ marginBottom: '20px' }}>
                            <button onClick={backToMenu} className={styles['back-to-menu-btn']}>
                                <FaArrowLeft /> {menuBackText}
                            </button>
                        </div>
                    )}
                    <div className={styles['forms-page-header']}>
                        <h1 className={styles['forms-page-title']}>Herramientas Clinicas</h1>
                        <p className={styles['forms-page-subtitle']}>
                            Formularios y herramientas para la gestion clinica veterinaria.
                        </p>
                    </div>
                    <div className={styles['form-grid-container']}>
                        {formCards.map((card) => {
                            const specificClass = `form-card-${card.key}`;

                            return (
                                <div
                                    key={card.key}
                                    className={`${styles['form-card']} ${styles['form-card--tools']} ${
                                        styles[specificClass] || specificClass
                                    }`}
                                >
                                    <div className={styles['form-card-content']}>
                                        <div className={styles['form-card-icon-wrap']}>{card.icon}</div>
                                        <div className={styles['form-card-text']}>
                                            <h3 className={styles['form-card-title']}>{card.title}</h3>
                                            <p className={styles['form-card-description']}>{card.description}</p>
                                        </div>
                                    </div>
                                    <button
                                        className={styles['form-card-button']}
                                        onClick={() => handleSelectForm(card.key)}
                                    >
                                        Abrir formulario <FaArrowRight />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        if (viewState === 'selection') {
            return (
                <div className={styles['form-entry-animation']}>
                    <button onClick={cancelSelection} className={styles['back-to-menu-btn']}>
                        <FaArrowLeft /> {getSelectionBackText(searchParams.get('origin'))}
                    </button>
                    <AnimalSelector
                        onSelect={handleAnimalSelect}
                        minSpecimenCount={targetForm === 'groupTreatment' ? 2 : undefined}
                        maxSelectionCount={targetForm === 'hospFollowUp' ? hospAvailableSlots : undefined}
                        excludeHospitalized={targetForm === 'hospFollowUp'}
                    />
                </div>
            );
        }

        if (viewState === 'form') {
            const originStr = searchParams.get('origin');
            let backText = 'Volver al menu';
            if (originStr === 'history') backText = 'Volver al Historial';
            else if (originStr === 'medical-history') backText = 'Volver a Reportes Clinicos';
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

                        {selectedAnimals.length > 0 && (
                            <div className={`${styles['selected-animal-banner']} ${styles.compact}`}>
                                <div className={styles['animal-banner-info']}>
                                    <span className={styles['banner-label']}>
                                        {selectedAnimals.length > 1 ? 'Pacientes:' : 'Paciente:'}
                                    </span>
                                    <span className={styles['banner-name']}>
                                        {selectedAnimalLabel}
                                    </span>
                                </div>
                                <button onClick={handleChangeAnimal} className={styles['change-animal-btn']}>
                                    <FaExchangeAlt /> Cambiar
                                </button>
                            </div>
                        )}
                    </div>

                    {targetForm === 'deworming' && <DewormingCalendar onBack={backToSelection} patient={selectedAnimal} existingRecord={existingRecord} viewOnly={viewOnly} />}
                    {targetForm === 'vaccination' && <VaccinationForm onBack={backToSelection} patient={selectedAnimal} existingRecord={existingRecord} viewOnly={viewOnly} />}
                    {targetForm === 'clinicalReview' && <ClinicalReviewForm patient={selectedAnimal} existingRecord={existingRecord} onSave={handleClinicalSave} onUpdate={!viewOnly ? handleClinicalUpdate : undefined} />}
                    {targetForm === 'necropsy' && <NecropsyReportForm onBack={backToSelection} patient={selectedAnimal} />}
                    {targetForm === 'anesthesia' && <AnesthesiaForm onBack={backToSelection} patient={selectedAnimal} />}
                    {targetForm === 'treatment' && <TreatmentForm onBack={backToSelection} patient={selectedAnimal} />}
                    {targetForm === 'groupTreatment' && (
                        <GroupTreatmentForm onBack={backToSelection} patient={selectedAnimal} />
                    )}
                    {targetForm === 'hospFollowUp' && <HospFollowUpForm onBack={backToSelection} patient={selectedAnimal} currentSessionRecords={hospCurrentSessionRecords} initialNumSeguimiento={hospNumSeguimiento} />}
                    {targetForm === 'notificacionAlta' && (
                        <NotificacionAltaForm onBack={backToSelection} patient={selectedAnimal} />
                    )}
                </div>
            );
        }

        return null;
    };

    return <div className={styles['forms-page-wrapper']}>{renderContent()}</div>;
};

export default FormsPage;
