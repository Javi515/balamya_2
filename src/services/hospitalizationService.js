import { getPatientPhotoByScientificName } from './patientsService';
import { apiFetch } from './api';

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=800';
const HOSPITALIZATION_ENDPOINT = '/api/hospitalization';

const mapAdmissionRecord = (record) => ({
    id: record.id_ejemplar,
    identificacionMarcaje: record.identificacion_marcaje || record.id_ejemplar,
    name: record.nombre_propio,
    commonName: record.nombre_comun,
    species: record.nombre_cientifico || record.especie || null,
    area: record.ubicacion,
    admissionDate: record.fecha_ingreso_hospitalizacion,
    diagnosis: record.observaciones,
    responsible: record.responsable,
    imageUrl: record.foto_url || null,
    age: record.edad || '',
    sex: record.sexo || '',
    taxonomicGroup: record.grupo_taxonomico || null,
});

const getAdmissions = async () => {
    const data = await apiFetch('/api/hospitalization/admissions', { auth: true });
    return (data.records || []).map(mapAdmissionRecord);
};

const mapAltaRecord = (record) => ({
    id: record.id_ejemplar,
    identificacionMarcaje: record.identificacion_marcaje,
    name: record.nombre_propio,
    commonName: record.nombre_comun,
    species: record.nombre_cientifico || record.especie || null,
    area: '—',
    dischargeDate: record.fecha,
    horaAlta: record.hora_alta || '',
    diagnosis: record.descripcion_motivo_alta,
    responsible: record.nombre_usuario,
    imageUrl: record.foto_url || null,
    taxonomicGroup: record.grupo_taxonomico || null,
});

const getAltas = async () => {
    const data = await apiFetch('/api/hospitalization/altas', { auth: true });
    return (data.records || []).map(mapAltaRecord);
};

const getNotificacionAlta = async (idEjemplar) => {
    return apiFetch(`${HOSPITALIZATION_ENDPOINT}/notificacion-alta/${idEjemplar}`, { auth: true });
};

const mapFollowUpRecord = (record) => ({
    idSeguimiento: record.id_seguimiento,
    numSeguimiento: record.num_seguimiento,
    idEjemplar: record.id_ejemplar,
    name: record.nombre_propio,
    commonName: record.nombre_comun,
    species: record.nombre_cientifico || record.especie || null,
    identificacionMarcaje: record.identificacion_marcaje,
    imageUrl: record.foto_url || null,
    fecha: record.fecha,
    hora: record.hora,
    peso: record.peso,
    frecuenciaCardiaca: record.frecuencia_cardiaca,
    frecuenciaRespiratoria: record.frecuencia_respiratoria,
    temperatura: record.temperatura,
    pulso: record.pulso,
    mucosas: record.mucosas,
    tllc: record.tllc,
    observaciones: record.observaciones,
    responsible: record.nombre_usuario,
});

const getFollowUps = async () => {
    const data = await apiFetch(`${HOSPITALIZATION_ENDPOINT}/seguimiento`, { auth: true });
    return (data.records || data || []).map(mapFollowUpRecord);
};

const getHospitalizationPhoto = (scientificName) =>
    getPatientPhotoByScientificName(scientificName, DEFAULT_PHOTO);

const createAdmission = async (admission) => admission;

const createHospitalizationFollowUp = async (followUp) => {
    return apiFetch(HOSPITALIZATION_ENDPOINT, {
        method: 'POST',
        auth: true,
        body: JSON.stringify(followUp),
    });
};

const createNotificacionAlta = async (data) => {
    return apiFetch(`${HOSPITALIZATION_ENDPOINT}/notificacion-alta`, {
        method: 'POST',
        auth: true,
        body: JSON.stringify(data),
    });
};

const discharge = async (idEjemplar) => {
    return apiFetch(`${HOSPITALIZATION_ENDPOINT}/${idEjemplar}/alta`, {
        method: 'PUT',
        auth: true,
    });
};

const updateNotificacionAlta = async (idAlta, data) => {
    return apiFetch(`${HOSPITALIZATION_ENDPOINT}/notificacion-alta/${idAlta}`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(data),
    });
};

export {
    createAdmission,
    createHospitalizationFollowUp,
    createNotificacionAlta,
    discharge,
    getAdmissions,
    getAltas,
    getFollowUps,
    getHospitalizationPhoto,
    getNotificacionAlta,
    updateNotificacionAlta,
};
