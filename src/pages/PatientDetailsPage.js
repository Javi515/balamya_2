import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaPaw, FaSyringe, FaPrint, FaEdit, FaArrowLeft, FaSkull, FaPlus } from 'react-icons/fa';
import { patients, MOCK_HISTORY } from '../data/mockData';
import RecordsTable from '../components/common/RecordsTable';
import Modal from '../components/common/Modal';
import styles from '../styles/PatientDetails.module.css';

const PatientDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.initialTab || 'summary');
    const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
    const [dischargeReason, setDischargeReason] = useState('');

    // Detectamos si la URL actual pertenece a la sección de "Bajas"
    const isBajasView = location.pathname.includes('/casualties') || location.pathname.includes('/bajas');

    // Buscar al paciente
    const patient = patients.find(p => p.id === id);

    if (!patient) {
        return (
            <div className={styles['patient-details-container']}>
                <h2>Paciente no encontrado</h2>
                <button onClick={() => navigate('/patients')} className={styles['btn-secondary']}>Volver</button>
            </div>
        );
    }

    // Filtrar el historial
    const patientHistory = MOCK_HISTORY.filter(
        record => record.name === patient.name || record.commonName === patient.species
    ).map(record => ({ ...record, patientId: patient.id }));

    // Función para manejar el clic en "Dar de baja"
    const handleReportDeath = () => {
        setIsDischargeModalOpen(true);
        setDischargeReason(''); // Reset reason
    };

    const confirmDischarge = () => {
        if (!dischargeReason) {
            alert("Por favor, selecciona un motivo de baja.");
            return;
        }

        if (dischargeReason === 'Muerte') {
            // Usamos URLSearchParams para construir los parámetros de forma limpia
            const queryParams = new URLSearchParams({
                form: 'necropsy',
                animalName: patient.id,
                origin: 'history',
                patientId: patient.id
            }).toString();

            // Navegamos a la ruta de formularios
            navigate(`/forms?${queryParams}`);
        } else {
            // "Préstamo", "Intercambio", "Donación"
            // Guardamos el motivo y marcamos como dado de baja en el estado local (mock)
            patient.status = 'Dado de baja';
            patient.dischargeReason = dischargeReason;
            patient.isActive = false; // Propiedad ilustrativa

            // Cerramos el modal
            setIsDischargeModalOpen(false);

            // Opcional: Para reflejar el cambio inmediato en UI forzamos un update local si tuvieramos un state completo, 
            // pero como react re-evalua al cambiar el modal state, puede que el status actualizado se muestre.
        }
    };

    // Render footer del modal
    const renderModalFooter = () => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
            <button
                onClick={() => setIsDischargeModalOpen(false)}
                className={styles['btn-secondary']}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}
            >
                Cancelar
            </button>
            <button
                onClick={confirmDischarge}
                className={styles['btn-danger']}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
            >
                Confirmar Baja
            </button>
        </div>
    );

    return (
        <div className={styles['patient-details-container']}>
            <div className={styles['back-button-container']}>
                <button className={styles['back-button']} onClick={() => navigate(isBajasView ? '/casualties' : '/patients')}>
                    <FaArrowLeft /> {isBajasView ? 'Volver a Bajas' : 'Volver a Pacientes'}
                </button>
            </div>

            {/* Hero Section */}
            <div className={styles['patient-hero']}>
                <div className={styles['patient-photo-large']}>
                    {patient.imageUrl ? (
                        <img
                            src={patient.imageUrl}
                            alt={patient.commonName}
                            className={styles['patient-photo-img']}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex'; // Show fallback
                            }}
                        />
                    ) : null}
                    {/* Fallback */}
                    <div className={styles['patient-photo-placeholder']} style={{ display: patient.imageUrl ? 'none' : 'flex' }}>
                        <FaPaw />
                    </div>
                </div>

                <div className={styles['patient-info-header']}>
                    <span className={styles['patient-id-badge']}>ID: {patient.id}</span>
                    <h1 className={styles['patient-name-large']}>{patient.commonName || 'Sin Nombre Común'}</h1>
                    <div className={styles['patient-species-scientific']}>
                        {patient.species}
                    </div>
                    <div className={`${styles['patient-status-indicator']} ${styles[`status-${patient.status.toLowerCase()}`]}`}>
                        ● {patient.status}
                    </div>
                </div>

                {/* Botones de acción */}
                {!isBajasView && (
                    <div className={styles['patient-actions-group']}>
                        <button
                            className={`${styles['action-button']} ${styles['btn-new']}`}
                            onClick={() => navigate(`/forms?animalName=${patient.id}&origin=history&patientId=${patient.id}`)}
                        >
                            <FaPlus /> Nuevo Registro
                        </button>
                        <button className={`${styles['action-button']} ${styles['btn-edit']}`}>
                            <FaEdit /> Editar Registro
                        </button>
                        {/* MODIFICADO: Agregamos el evento onClick aquí */}
                        <button
                            className={`${styles['action-button']} ${styles['btn-danger']}`}
                            onClick={handleReportDeath}
                        >
                            <FaSkull /> Dar de baja
                        </button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className={styles['patient-tabs']}>
                <button
                    className={`${styles['tab-btn']} ${activeTab === 'summary' ? styles.active : ''}`}
                    onClick={() => setActiveTab('summary')}
                >
                    Resumen
                </button>
                <button
                    className={`${styles['tab-btn']} ${activeTab === 'history' ? styles.active : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    Historial Médico
                </button>
            </div>

            {/* Content */}
            <div className={styles['tab-content']}>
                {activeTab === 'summary' && (
                    <div className={styles['info-grid']}>
                        <div className={styles['info-box']}>
                            <span className={styles['info-label']}>Edad</span>
                            <div className={styles['info-value']}>{patient.age} años</div>
                        </div>
                        <div className={styles['info-box']}>
                            <span className={styles['info-label']}>Sexo</span>
                            <div className={styles['info-value']}>{patient.sex || 'No definido'}</div>
                        </div>
                        <div className={styles['info-box']}>
                            <span className={styles['info-label']}>Ubicación Actual</span>
                            <div className={styles['info-value']}>{patient.location}</div>
                        </div>
                        <div className={styles['info-box']}>
                            <span className={styles['info-label']}>Dieta</span>
                            <div className={styles['info-value']}>{patient.diet || 'Consultar veterinario'}</div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div>
                        <RecordsTable records={patientHistory} viewMode="table" />
                        {patientHistory.length === 0 && <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>No hay registros médicos recientes para este paciente.</p>}
                    </div>
                )}
            </div>

            {/* Modal de Baja */}
            <Modal
                isOpen={isDischargeModalOpen}
                onClose={() => setIsDischargeModalOpen(false)}
                title="Confirmar Baja del Paciente"
                footer={renderModalFooter()}
            >
                <div style={{ padding: '10px 0' }}>
                    <p style={{ marginBottom: '15px', color: '#334155' }}>
                        Está a punto de dar de baja al paciente <strong>{patient.commonName} ({patient.id})</strong>.
                        Este proceso requiere un motivo oficial.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="discharge-reason" style={{ fontWeight: '600', color: '#1e293b' }}>
                            ¿Cuál es el motivo de la baja?
                        </label>
                        <select
                            id="discharge-reason"
                            value={dischargeReason}
                            onChange={(e) => setDischargeReason(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '1rem',
                                color: '#334155',
                                backgroundColor: '#fff',
                                outline: 'none'
                            }}
                        >
                            <option value="" disabled>Seleccione un motivo</option>
                            <option value="Muerte">Muerte (Requiere Necropsia)</option>
                            <option value="Préstamo">Préstamo</option>
                            <option value="Intercambio">Intercambio</option>
                            <option value="Donación">Donación</option>
                        </select>
                        {dischargeReason === 'Muerte' && (
                            <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#ef4444', fontWeight: '500' }}>
                                Al confirmar, será redirigido al Formato de Reporte de Necropsia obligatoriamente.
                            </p>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PatientDetailsPage;