import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FaArrowLeft, FaCamera, FaPaw, FaPencilAlt, FaSkull, FaFileAlt } from 'react-icons/fa';
import RecordsTable from '../../../components/common/RecordsTable/RecordsTable';
import Modal from '../../../components/common/Modal/Modal';
import styles from './PatientDetails.module.css';
import { getMedicalHistoryForPatient } from '../../../services/medicalHistoryService';
import { getNotificacionAlta, getFollowUps } from '../../../services/hospitalizationService';
import { fetchPatientById, updatePatient, uploadPatientPhoto } from '../../../services/patientsService';
import { buildUrl } from '../../../services/api';
import { createBaja } from '../../../services/bajaService';
import { getNecropsyById } from '../../../services/necropsyService';
import { getAllClinicalReviewsApi } from '../../../services/clinicalService';
import { getVaccinationsForPatient } from '../../../services/vaccinationsService';
import { getDewormingsByAnimal } from '../../../services/dewormingService';

const HISTORY_FILTERS = [
    { key: 'all', label: 'Todos' },
    { key: 'deworming', label: 'Desparasitaciones' },
    { key: 'vaccinations', label: 'Vacunaciones' },
    { key: 'clinical', label: 'Revisiones Clínicas' },
    { key: 'necropsy', label: 'Reporte de Necropsia' },
    { key: 'hospitalization', label: 'Seguimiento Hosp.' },
    { key: 'alta', label: 'Notificación Alta' },
];

const PatientDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(() => {
        const t = searchParams.get('tab');
        if (['summary', 'history'].includes(t)) return t;
        return location.state?.initialTab || 'summary';
    });
    const [historyTab, setHistoryTab] = useState(() => {
        const ht = searchParams.get('htab');
        return ['all','deworming','vaccinations','clinical','necropsy','hospitalization','alta'].includes(ht) ? ht : 'all';
    });
    const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
    const [dischargeReason, setDischargeReason] = useState('');
    const [patientHistory, setPatientHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [patient, setPatient] = useState(location.state?.patient || null);
    const [patientLoading, setPatientLoading] = useState(!location.state?.patient);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFields, setEditFields] = useState({});
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState('');
    const [photoChanged, setPhotoChanged] = useState(false);
    const [editPhotoFile, setEditPhotoFile] = useState(null);
    const [photoDeleted, setPhotoDeleted] = useState(false);
    const [photoUploading, setPhotoUploading] = useState(false);
    const photoInputRef = useRef(null);

    const isBajasView = location.pathname.includes('/casualties') || location.pathname.includes('/bajas');

    useEffect(() => {
        if (location.state?.patient) return;
        setPatientLoading(true);
        fetchPatientById(id)
            .then(setPatient)
            .catch(() => setPatient(null))
            .finally(() => setPatientLoading(false));
    }, [id, location.state?.patient]);

    useEffect(() => {
        if (!patient) return;
        setHistoryLoading(true);
        getMedicalHistoryForPatient(patient)
            .then(setPatientHistory)
            .catch(() => setPatientHistory([]))
            .finally(() => setHistoryLoading(false));
    }, [patient]);


    if (patientLoading) {
        return (
            <div className={styles['patient-details-container']}>
                <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>
                    Cargando paciente...
                </p>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className={styles['patient-details-container']}>
                <h2>Paciente no encontrado</h2>
                <button onClick={() => navigate('/patients')} className={styles['btn-secondary']}>Volver</button>
            </div>
        );
    }

    const handleHistoryView = async (record) => {
        const idRegistro = String(record.id || '').replace('ZOO-', '');
        const patientId = patient.idEjemplar || patient.id;
        const formByTabla = {
            revision_clinica: 'clinicalReview',
            calendario_vacunacion: 'vaccination',
            calendario_desparasitacion: 'deworming',
            necropsia: 'necropsy',
            hospitalizacion_seguimiento: 'hospFollowUp',
            notificacion_alta: 'notificacionAlta',
        };
        const form = formByTabla[record.tipoTabla];
        if (!form) return;

        try {
            if (record.tipoTabla === 'necropsia') {
                const data = await getNecropsyById(idRegistro);
                const queryParams = new URLSearchParams({
                    form: 'necropsy',
                    animalName: patient.id,
                    origin: isBajasView ? 'casualties' : 'history',
                    patientId,
                    idNecropsia: idRegistro,
                }).toString();
                navigate(`/forms?${queryParams}`, { state: { patient, existingNecropsy: data, viewOnly: true } });
                return;
            }

            let existingRecord = null;
            let patientOverride = null;

            if (record.tipoTabla === 'revision_clinica') {
                const reviews = await getAllClinicalReviewsApi();
                existingRecord = reviews.find(r => String(r.idRevision) === idRegistro) || null;
            } else if (record.tipoTabla === 'calendario_vacunacion') {
                const vaccinations = await getVaccinationsForPatient(patient);
                existingRecord = vaccinations.find(v => String(v.id) === idRegistro) || null;
            } else if (record.tipoTabla === 'calendario_desparasitacion') {
                const dewormings = await getDewormingsByAnimal(patientId);
                existingRecord = dewormings.find(d =>
                    String(d.id_calendario || d.idCalendario || d.id) === idRegistro
                ) || null;
            } else if (record.tipoTabla === 'notificacion_alta') {
                const res = await getNotificacionAlta(patientId);
                const data = res?.notificacion || res || {};
                patientOverride = {
                    ...patient,
                    fecha: data.fecha || '',
                    area_anexo: data.area_anexo || data.areaAnexo || '',
                    no_albergue: data.no_albergue || data.noAlbergue || '',
                    descripcion_motivo_alta: data.descripcion_motivo_alta || data.descripcionMotivoAlta || '',
                    hora_alta: data.hora_alta || data.horaAlta || '',
                    nombre_notifico: data.nombre_notifico || data.nombreNotifico || '',
                    id_alta: data.id_alta || data.idAlta || '',
                    _viewMode: true,
                    _readOnly: true,
                };
            } else if (record.tipoTabla === 'hospitalizacion_seguimiento') {
                const allFollowUps = await getFollowUps();
                const clicked = allFollowUps.find(f => String(f.idSeguimiento) === idRegistro);
                if (clicked) {
                    const sessionRecords = allFollowUps.filter(
                        f => f.numSeguimiento === clicked.numSeguimiento
                    );
                    patientOverride = {
                        ...patient,
                        fecha: clicked.fecha || '',
                        _viewMode: true,
                        _sessionRecords: sessionRecords.length ? sessionRecords : [clicked],
                    };
                }
            }

            const queryParams = new URLSearchParams({
                form,
                animalName: patient.id,
                origin: isBajasView ? 'casualties' : 'history',
                patientId,
            }).toString();
            navigate(`/forms?${queryParams}`, { state: { patient: patientOverride || patient, existingRecord, viewOnly: true } });
        } catch (err) {
            console.error('[handleHistoryView]', err);
        }
    };

    const handleHistoryEdit = async (record) => {
        const idRegistro = String(record.id || '').replace('ZOO-', '');
        const patientId = patient.idEjemplar || patient.id;
        const formByTabla = {
            revision_clinica: 'clinicalReview',
            calendario_vacunacion: 'vaccination',
            calendario_desparasitacion: 'deworming',
            notificacion_alta: 'notificacionAlta',
            hospitalizacion_seguimiento: 'hospFollowUp',
            necropsia: 'necropsy',
        };
        const form = formByTabla[record.tipoTabla];
        if (!form) return;
        try {
            let existingRecord = null;
            let patientOverride = null;

            if (record.tipoTabla === 'necropsia') {
                const data = await getNecropsyById(idRegistro);
                const queryParams = new URLSearchParams({
                    form: 'necropsy',
                    animalName: patient.id,
                    origin: isBajasView ? 'casualties' : 'history',
                    patientId,
                    idNecropsia: idRegistro,
                }).toString();
                navigate(`/forms?${queryParams}`, { state: { patient, existingNecropsy: data } });
                return;
            }

            if (record.tipoTabla === 'revision_clinica') {
                const reviews = await getAllClinicalReviewsApi();
                existingRecord = reviews.find(r => String(r.idRevision) === idRegistro) || null;
            } else if (record.tipoTabla === 'calendario_vacunacion') {
                const vaccinations = await getVaccinationsForPatient(patient);
                existingRecord = vaccinations.find(v => String(v.id) === idRegistro) || null;
            } else if (record.tipoTabla === 'calendario_desparasitacion') {
                const dewormings = await getDewormingsByAnimal(patientId);
                existingRecord = dewormings.find(d =>
                    String(d.id_calendario || d.idCalendario || d.id) === idRegistro
                ) || null;
            } else if (record.tipoTabla === 'notificacion_alta') {
                const res = await getNotificacionAlta(patientId);
                const data = res?.notificacion || res || {};
                patientOverride = {
                    ...patient,
                    fecha: data.fecha || '',
                    area_anexo: data.area_anexo || data.areaAnexo || '',
                    no_albergue: data.no_albergue || data.noAlbergue || '',
                    descripcion_motivo_alta: data.descripcion_motivo_alta || data.descripcionMotivoAlta || '',
                    hora_alta: data.hora_alta || data.horaAlta || '',
                    nombre_notifico: data.nombre_notifico || data.nombreNotifico || '',
                    id_alta: data.id_alta || data.idAlta || '',
                    _viewMode: true,
                    _readOnly: false,
                };
            } else if (record.tipoTabla === 'hospitalizacion_seguimiento') {
                const allFollowUps = await getFollowUps();
                const clicked = allFollowUps.find(f => String(f.idSeguimiento) === idRegistro);
                if (clicked) {
                    const sessionRecords = allFollowUps.filter(
                        f => f.numSeguimiento === clicked.numSeguimiento
                    );
                    patientOverride = {
                        ...patient,
                        fecha: clicked.fecha || '',
                        _viewMode: true,
                        _sessionRecords: sessionRecords.length ? sessionRecords : [clicked],
                    };
                }
            }

            const queryParams = new URLSearchParams({
                form,
                animalName: patient.id,
                origin: isBajasView ? 'casualties' : 'history',
                patientId,
            }).toString();
            navigate(`/forms?${queryParams}`, { state: { patient: patientOverride || patient, existingRecord } });
        } catch (err) {
            console.error('[handleHistoryEdit]', err);
        }
    };

    const handleViewNecropsy = async () => {
        if (!patient.idNecropsia) {
            alert('La necropsia de este animal aún no ha sido registrada en el sistema.');
            return;
        }
        try {
            const data = await getNecropsyById(patient.idNecropsia);
            const queryParams = new URLSearchParams({
                form: 'necropsy',
                animalName: patient.id,
                origin: 'casualties',
                patientId: patient.idEjemplar || patient.id,
                idNecropsia: patient.idNecropsia,
            }).toString();
            navigate(`/forms?${queryParams}`, {
                state: { patient, existingNecropsy: data, viewOnly: true },
            });
        } catch (err) {
            alert(err?.message || 'No se pudo cargar el reporte de necropsia.');
        }
    };

    const handleReportDeath = () => {
        setIsDischargeModalOpen(true);
        setDischargeReason('');
    };

    const confirmDischarge = async () => {
        if (!dischargeReason) {
            alert('Por favor, selecciona un motivo de baja.');
            return;
        }

        const idEjemplar = patient.idEjemplar || patient.id;

        if (dischargeReason === 'Muerte') {
            const queryParams = new URLSearchParams({
                form: 'necropsy',
                animalName: patient.id,
                origin: 'history',
                patientId: patient.id,
            }).toString();
            navigate(`/forms?${queryParams}`, {
                state: { patient, pendingBaja: true, pendingBajaIdEjemplar: idEjemplar },
            });
            return;
        }

        try {
            await createBaja(idEjemplar, dischargeReason);
        } catch (err) {
            console.error('[createBaja] error:', err);
            alert(err?.data?.message || err?.message || 'No se pudo registrar la baja.');
            return;
        }

        setIsDischargeModalOpen(false);
        navigate('/patients');
    };

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

    const handleOpenEdit = () => {
        console.log('[edit] patient.sex:', patient.sex);
        setPhotoChanged(false);
        setEditPhotoFile(null);
        setPhotoDeleted(false);
        setEditFields({
            nombrePropio: patient.name || '',
            recintoUbicacion: patient.location || '',
            procedencia: patient.procedencia || '',
            numeroEjemplares: patient.specimenCount ?? '',
            fotoUrl: patient.imageUrl || '',
            sexo: '',
        });
        setEditError('');
        setIsEditModalOpen(true);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setEditPhotoFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setEditFields(prev => ({ ...prev, fotoUrl: ev.target.result }));
            setPhotoChanged(true);
        };
        reader.readAsDataURL(file);
    };

    const handleEditSave = async () => {
        setEditSaving(true);
        setEditError('');
        try {
            const patientKey = patient.idEjemplar || patient.id || id;
            const payload = {
                nombrePropio: editFields.nombrePropio || undefined,
                recintoUbicacion: editFields.recintoUbicacion || undefined,
                procedencia: editFields.procedencia || undefined,
                numeroEjemplares: editFields.numeroEjemplares !== '' ? Number(editFields.numeroEjemplares) : undefined,
                sexo: editFields.sexo || undefined,
                ...(photoDeleted ? { fotoUrl: null } : {}),
            };
            await updatePatient(patientKey, payload);

            // Cerrar modal y actualizar datos inmediatamente
            setPatient(prev => ({
                ...prev,
                name: editFields.nombrePropio || prev.name,
                location: editFields.recintoUbicacion || prev.location,
                locationType: editFields.recintoUbicacion || prev.locationType,
                procedencia: editFields.procedencia || prev.procedencia,
                specimenCount: editFields.numeroEjemplares !== '' ? Number(editFields.numeroEjemplares) : prev.specimenCount,
                sex: editFields.sexo || prev.sex,
                ...(photoDeleted ? { imageUrl: '' } : {}),
                ...(editPhotoFile ? { imageUrl: editFields.fotoUrl } : {}),
            }));
            setIsEditModalOpen(false);

            // Subir foto en segundo plano y reemplazar con URL real
            if (editPhotoFile) {
                setPhotoUploading(true);
                uploadPatientPhoto(patientKey, editPhotoFile)
                    .then((photoRes) => {
                        const rawUrl = photoRes?.url || photoRes?.fotoUrl || photoRes?.foto_url || null;
                        if (rawUrl) setPatient(prev => ({ ...prev, imageUrl: buildUrl(rawUrl) }));
                    })
                    .catch(() => {})
                    .finally(() => setPhotoUploading(false));
            }
        } catch (err) {
            console.error('[updatePatient] error:', err);
            const backendMsg = err?.data?.message || err?.message || '';
            setEditError(backendMsg || 'No se pudo guardar. Intenta de nuevo.');
        } finally {
            setEditSaving(false);
        }
    };

    const renderEditModalFooter = () => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
                onClick={() => setIsEditModalOpen(false)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}
            >
                Cancelar
            </button>
            <button
                onClick={handleEditSave}
                disabled={editSaving}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#16a34a', color: '#fff', cursor: editSaving ? 'default' : 'pointer', fontWeight: 'bold' }}
            >
                {editSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
        </div>
    );

    const filteredHistory = historyTab === 'deworming'
        ? patientHistory.filter((record) => record.tipoTabla === 'calendario_desparasitacion')
        : historyTab === 'vaccinations'
        ? patientHistory.filter((record) => record.tipoTabla === 'calendario_vacunacion')
        : historyTab === 'clinical'
        ? patientHistory.filter((record) => record.tipoTabla === 'revision_clinica')
        : historyTab === 'necropsy'
        ? patientHistory.filter((record) => record.tipoTabla === 'necropsia')
        : historyTab === 'hospitalization'
        ? patientHistory.filter((record) => record.tipoTabla === 'hospitalizacion_seguimiento')
        : historyTab === 'alta'
        ? patientHistory.filter((record) => record.tipoTabla === 'notificacion_alta')
        : patientHistory;

    return (
        <div className={styles['patient-details-container']}>
            <div className={styles['back-button-container']}>
                <button className={styles['back-button']} onClick={() => navigate(isBajasView ? '/casualties' : '/patients')}>
                    <FaArrowLeft /> {isBajasView ? 'Volver a Bajas' : 'Volver a Pacientes'}
                </button>
            </div>

            <div className={styles['patient-hero']}>
                <div className={styles['patient-photo-large']} style={{ position: 'relative' }}>
                    {patient.imageUrl ? (
                        <img
                            src={patient.imageUrl}
                            alt={patient.commonName}
                            className={styles['patient-photo-img']}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className={styles['patient-photo-placeholder']}>
                            <FaPaw />
                        </div>
                    )}
                    {photoUploading && (
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#16a34a', animation: 'spin 0.8s linear infinite', pointerEvents: 'none' }} />
                    )}
                </div>

                <div className={styles['patient-info-header']}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ID: {patient.id}</span>
                    <div style={{ marginTop: '2px', fontSize: '0.85rem', color: '#64748b' }}>
                        <span style={{ fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>Nombre común: </span>
                        <span style={{ fontWeight: 500, color: '#334155' }}>{patient.commonName || '—'}</span>
                    </div>
                    <div style={{ marginTop: '2px', fontSize: '0.85rem', color: '#64748b' }}>
                        <span style={{ fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>Nombre científico: </span>
                        <span style={{ fontStyle: 'italic', color: '#475569' }}>{patient.species || '—'}</span>
                    </div>
                    {patient.name && patient.name !== patient.commonName && (
                        <div style={{ marginTop: '2px', fontSize: '0.85rem', color: '#64748b' }}>
                            <span style={{ fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>Nombre propio: </span>
                            <span style={{ fontWeight: 500, color: '#334155' }}>{patient.name}</span>
                        </div>
                    )}
                    {patient.status && (
                        <div className={`${styles['patient-status-indicator']} ${styles[`status-${patient.status.toLowerCase()}`]}`}>
                            ● {patient.status}
                        </div>
                    )}
                </div>

                {!isBajasView && (
                    <div className={styles['patient-actions-group']}>
                        <button
                            className={`${styles['action-button']} ${styles['btn-danger']}`}
                            onClick={handleReportDeath}
                        >
                            <FaSkull /> Dar de baja
                        </button>
                    </div>
                )}
                {isBajasView && patient.casualtyReason === 'Muerte' && (
                    <div className={styles['patient-actions-group']}>
                        <button
                            className={`${styles['action-button']} ${styles['btn-danger']}`}
                            onClick={handleViewNecropsy}
                        >
                            <FaFileAlt /> Ver Necropsia
                        </button>
                    </div>
                )}
            </div>

            <div className={styles['patient-tabs']}>
                <button
                    className={`${styles['tab-btn']} ${activeTab === 'summary' ? styles.active : ''}`}
                    onClick={() => { navigate(`${location.pathname}?tab=summary&htab=${historyTab}`, { replace: true, state: location.state }); setActiveTab('summary'); }}
                >
                    Resumen
                </button>
                <button
                    className={`${styles['tab-btn']} ${activeTab === 'history' ? styles.active : ''}`}
                    onClick={() => { navigate(`${location.pathname}?tab=history&htab=${historyTab}`, { replace: true, state: location.state }); setActiveTab('history'); }}
                >
                    Historial Médico
                </button>
            </div>

            <div className={styles['tab-content']}>
                {activeTab === 'summary' && (
                    <div>
                    {user?.role === 'admin' && !isBajasView && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                        <button
                            onClick={handleOpenEdit}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#16a34a', color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
                        >
                            <FaPencilAlt size={12} /> Editar datos
                        </button>
                    </div>
                    )}
                    <div className={styles['info-grid']}>
                        <div className={styles['info-box']}>
                            <span className={styles['info-label']}>Familia</span>
                            <div className={styles['info-value']}>{patient.family || '—'}</div>
                        </div>
                        <div className={styles['info-box']}>
                            <span className={styles['info-label']}>Grupo Taxonómico</span>
                            <div className={styles['info-value']}>{patient.taxonomicGroup || '—'}</div>
                        </div>
                        <div className={styles['info-box']}>
                            <span className={styles['info-label']}>Sexo</span>
                            <div className={styles['info-value']}>{patient.sex || '—'}</div>
                        </div>
                        <div className={styles['info-box']}>
                            <span className={styles['info-label']}>Edad</span>
                            <div className={styles['info-value']}>{patient.ageText || (patient.age ? `${patient.age} años` : '—')}</div>
                        </div>
                        <div className={styles['info-box']}>
                            <span className={styles['info-label']}>Fecha de Nacimiento</span>
                            <div className={styles['info-value']}>{patient.fechaNacimiento?.split('T')[0] || '—'}</div>
                        </div>
                        <div className={styles['info-box']}>
                            <span className={styles['info-label']}>Ubicación Actual</span>
                            <div className={styles['info-value']}>{patient.location || '—'}</div>
                        </div>
                        <div className={styles['info-box']}>
                            <span className={styles['info-label']}>N° Ejemplares</span>
                            <div className={styles['info-value']}>{patient.specimenCount ?? '—'}</div>
                        </div>
                        <div className={styles['info-box']}>
                            <span className={styles['info-label']}>Agrupación</span>
                            <div className={styles['info-value']}>{patient.grouping || '—'}</div>
                        </div>
                        <div className={styles['info-box']}>
                            <span className={styles['info-label']}>Procedencia</span>
                            <div className={styles['info-value']}>{patient.procedencia || '—'}</div>
                        </div>
                    </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div>
                        <div className={styles['history-subtabs']}>
                            {HISTORY_FILTERS.map(({ key, label, disabled }) => (
                                <button
                                    key={key}
                                    type="button"
                                    className={`${styles['subtab-btn']} ${historyTab === key ? styles['subtab-active'] : ''} ${disabled ? styles['subtab-disabled'] : ''}`}
                                    onClick={() => !disabled && (navigate(`${location.pathname}?tab=${activeTab}&htab=${key}`, { replace: true, state: location.state }), setHistoryTab(key))}
                                    disabled={disabled}
                                    title={disabled ? 'Próximamente' : label}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {historyLoading ? (
                            <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                                Cargando historial...
                            </p>
                        ) : (
                            <>
                                <RecordsTable records={filteredHistory} viewMode="table" origin="history" iconActions={true} onView={handleHistoryView} onEdit={isBajasView ? undefined : handleHistoryEdit} />
                                {filteredHistory.length === 0 && (
                                    <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                                        No hay registros para esta categoría.
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Editar datos del paciente"
                footer={renderEditModalFooter()}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Foto</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {editFields.fotoUrl && (
                                <img src={editFields.fotoUrl} alt="preview" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                            )}
                            <button
                                type="button"
                                onClick={() => photoInputRef.current?.click()}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '7px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer', fontSize: '0.875rem' }}
                            >
                                <FaCamera size={13} /> Subir foto
                            </button>
                            {editFields.fotoUrl && (
                                <button
                                    type="button"
                                    onClick={() => { setEditFields(p => ({ ...p, fotoUrl: null })); setPhotoDeleted(true); setEditPhotoFile(null); }}
                                    style={{ padding: '7px 14px', borderRadius: '7px', border: '1px solid #fecaca', backgroundColor: '#fff5f5', color: '#ef4444', cursor: 'pointer', fontSize: '0.875rem' }}
                                >
                                    Borrar foto
                                </button>
                            )}
                            <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Nombre propio</label>
                        <input
                            value={editFields.nombrePropio || ''}
                            onChange={(e) => setEditFields(p => ({ ...p, nombrePropio: e.target.value }))}
                            style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#334155' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Ubicación actual</label>
                        <select
                            value={editFields.recintoUbicacion || ''}
                            onChange={(e) => setEditFields(p => ({ ...p, recintoUbicacion: e.target.value }))}
                            style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#334155', backgroundColor: '#fff' }}
                        >
                            <option value="">-- Seleccionar --</option>
                            <option value="Cuarentena">Cuarentena</option>
                            <option value="Recinto">Recinto</option>
                            <option value="Clinica">Clinica</option>
                            <option value="Guarderia">Guarderia</option>
                            <option value="Recuperacion">Recuperacion</option>
                            <option value="Recien nacido">Recien nacido</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Procedencia</label>
                        <select
                            value={editFields.procedencia || ''}
                            onChange={(e) => setEditFields(p => ({ ...p, procedencia: e.target.value }))}
                            style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#334155', backgroundColor: '#fff' }}
                        >
                            <option value="">-- Seleccionar --</option>
                            <option value="Vida libre">Vida libre</option>
                            <option value="Abandono">Abandono</option>
                            <option value="Colección">Colección</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>N° Ejemplares</label>
                        <input
                            type="number"
                            min="1"
                            value={editFields.numeroEjemplares ?? ''}
                            onChange={(e) => setEditFields(p => ({ ...p, numeroEjemplares: e.target.value }))}
                            style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#334155', width: '120px' }}
                        />
                    </div>
                    {!(patient.sex || '').toLowerCase().includes('castrad') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Sexo</label>
                            <select
                                value={editFields.sexo || ''}
                                onChange={(e) => setEditFields(p => ({ ...p, sexo: e.target.value }))}
                                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#334155', backgroundColor: '#fff' }}
                            >
                                <option value="">{patient.sex || 'Sin cambio'}</option>
                                {(patient.sex || '').toLowerCase() === 'macho' && <option value="Macho castrado">Macho castrado</option>}
                                {(patient.sex || '').toLowerCase() === 'hembra' && <option value="Hembra castrada">Hembra castrada</option>}
                                {(patient.sex || '').toLowerCase() !== 'macho' && (patient.sex || '').toLowerCase() !== 'hembra' && (
                                    <>
                                        <option value="Macho castrado">Macho castrado</option>
                                        <option value="Hembra castrada">Hembra castrada</option>
                                    </>
                                )}
                            </select>
                        </div>
                    )}
                    {editError && <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0 }}>{editError}</p>}
                </div>
            </Modal>

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
                                outline: 'none',
                            }}
                        >
                            <option value="" disabled>Seleccione un motivo</option>
                            <option value="Muerte">Muerte (Requiere Necropsia)</option>
                            <option value="Prestamo">Préstamo</option>
                            <option value="Intercambio">Intercambio</option>
                            <option value="Donacion">Donación</option>
                            <option value="Liberacion">Liberación</option>
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
