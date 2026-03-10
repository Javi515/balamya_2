import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaHospital, FaNotesMedical, FaPills, FaSignOutAlt, FaCalendarAlt, FaUserMd, FaExternalLinkAlt, FaFolderOpen } from 'react-icons/fa';
import styles from '../../styles/HospitalRecordModal.module.css';

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=800';

// Mock records per type for demo purposes
const generateMockRecords = (patient) => ({
    seguimiento: [
        {
            id: 's1',
            title: 'Seguimiento hospitalario',
            detail: 'Signos vitales estables. Temperatura 38.2°C, frecuencia cardíaca normal.',
            date: '2024-01-16',
            responsible: 'Dr. Alejandro Vera',
        },
        {
            id: 's2',
            title: 'Seguimiento hospitalario',
            detail: 'Mejoría notable. Paciente tolera alimento sin dificultad.',
            date: '2024-01-18',
            responsible: 'Dra. Sofia Mendez',
        },
        {
            id: 's3',
            title: 'Seguimiento hospitalario',
            detail: 'Continúa evolución favorable. Se reduce dosis de medicamento.',
            date: '2024-01-20',
            responsible: 'Dr. Alejandro Vera',
        },
    ],
    revisiones: [
        {
            id: 'r1',
            title: 'Revisión clínica general',
            detail: 'Exploración física completa. Sin alteraciones adicionales detectadas.',
            date: '2024-01-15',
            responsible: 'Dr. Alejandro Vera',
        },
        {
            id: 'r2',
            title: 'Revisión clínica de seguimiento',
            detail: 'Análisis de sangre con resultados dentro de parámetros normales.',
            date: '2024-01-19',
            responsible: 'Dra. Sofia Mendez',
        },
    ],
    tratamientos: [
        {
            id: 't1',
            title: 'Tratamiento farmacológico',
            detail: 'Metronidazol 15mg/kg BID por 7 días. Suero IV 50ml/hr.',
            date: '2024-01-15',
            responsible: 'Dr. Alejandro Vera',
        },
        {
            id: 't2',
            title: 'Ajuste de tratamiento',
            detail: 'Reducción de dosis IV. Inicio de probióticos orales.',
            date: '2024-01-18',
            responsible: 'Dr. Alejandro Vera',
        },
    ],
    altas: [],
});

const TABS = [
    { key: 'seguimiento', label: 'Seguimiento',  icon: <FaHospital />,    iconClass: 'icon-follow', formKey: 'hospFollowUp' },
    { key: 'revisiones',  label: 'Revisiones',   icon: <FaNotesMedical />, iconClass: 'icon-review', formKey: 'clinicalReview' },
    { key: 'tratamientos',label: 'Tratamientos', icon: <FaPills />,        iconClass: 'icon-treat',  formKey: 'treatment' },
    { key: 'altas',       label: 'Altas',         icon: <FaSignOutAlt />,   iconClass: 'icon-alta',   formKey: 'notificacionAlta' },
];

const HospitalRecordModal = ({ patient, onClose, onOpenForm }) => {
    const [activeTab, setActiveTab] = useState('seguimiento');
    const records = generateMockRecords(patient);
    const currentRecords = records[activeTab] || [];

    const photo = patient.imageUrl || DEFAULT_PHOTO;

    return createPortal(
        <div className={styles['overlay']} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles['modal']}>

                {/* Header */}
                <div className={styles['modal-header']}>
                    <img src={photo} alt={patient.name} className={styles['header-photo']} />
                    <div className={styles['header-info']}>
                        <p className={styles['header-name']}>{patient.name}</p>
                        <p className={styles['header-species']}>{patient.species || patient.scientificName}</p>
                        <div className={styles['header-meta']}>
                            <span className={styles['meta-chip']}>
                                <FaCalendarAlt /> Ingreso: {patient.admissionDate || '2024-01-15'}
                            </span>
                            <span className={styles['meta-chip']}>
                                <FaUserMd /> {patient.responsible || 'Dr. Alejandro Vera'}
                            </span>
                        </div>
                    </div>
                    <button className={styles['close-btn']} onClick={onClose} title="Cerrar">
                        <FaTimes />
                    </button>
                </div>

                {/* Tab bar */}
                <div className={styles['tab-bar']}>
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            className={`${styles['tab']} ${activeTab === tab.key ? styles['tab-active'] : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.icon}
                            {tab.label}
                            <span className={styles['tab-count']}>{records[tab.key]?.length || 0}</span>
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className={styles['modal-body']}>
                    {currentRecords.length === 0 ? (
                        <div className={styles['empty-state']}>
                            <FaFolderOpen className={styles['empty-icon']} />
                            <p>No hay registros de este tipo para este paciente.</p>
                        </div>
                    ) : (
                        <div className={styles['record-list']}>
                            {currentRecords.map(record => {
                                const tab = TABS.find(t => t.key === activeTab);
                                return (
                                    <div key={record.id} className={styles['record-card']}>
                                        <div className={`${styles['record-icon-wrap']} ${styles[tab.iconClass]}`}>
                                            {tab.icon}
                                        </div>
                                        <div className={styles['record-content']}>
                                            <p className={styles['record-title']}>{record.title}</p>
                                            <p className={styles['record-detail']}>{record.detail}</p>
                                            <div className={styles['record-footer']}>
                                                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                                                    <span className={styles['record-date']}>
                                                        <FaCalendarAlt /> {record.date}
                                                    </span>
                                                    <span className={styles['record-responsible']}>
                                                        <FaUserMd /> {record.responsible}
                                                    </span>
                                                </div>
                                                <button
                                                    className={styles['open-btn']}
                                                    onClick={() => onOpenForm(tab.formKey, patient)}
                                                    title="Abrir formulario"
                                                >
                                                    <FaExternalLinkAlt /> Abrir
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={styles['modal-footer']}>
                    <button className={styles['btn-close-footer']} onClick={onClose}>
                        Cerrar
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default HospitalRecordModal;
