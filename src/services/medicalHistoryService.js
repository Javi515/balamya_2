import { apiFetch } from './api';

const HISTORIAL_ENDPOINT = '/api/historial';

const formatAge = (edad) => {
    if (!edad) return '-';
    if (typeof edad === 'string') return edad;
    const years = edad.years || 0;
    const months = edad.months || 0;
    const days = edad.days || 0;
    if (years > 0) return `${years} año${years !== 1 ? 's' : ''}`;
    if (months > 0) return `${months} mes${months !== 1 ? 'es' : ''}`;
    if (days > 0) return `${days} día${days !== 1 ? 's' : ''}`;
    return '-';
};

const formatTime12h = (isoString) => {
    if (!isoString) return null;
    // Si no tiene indicador de zona horaria, forzar UTC
    const normalized = /Z|[+-]\d{2}:\d{2}$/.test(isoString) ? isoString : isoString + 'Z';
    const date = new Date(normalized);
    if (isNaN(date)) return null;
    return date.toLocaleTimeString('es-MX', { timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', hour12: true });
};

const normalizeRecord = (record) => ({
    id: `ZOO-${record.id_registro}`,
    patientId: String(record.id_ejemplar),
    name: record.nombre_comun || '',
    commonName: record.nombre_comun || '',
    scientificName: record.especie || '',
    category: record.categoria || '',
    location: record.ubicacion || '',
    date: (record.fecha_atencion || '').split('T')[0],
    time: formatTime12h(record.fecha_atencion),
    type: (record.procedimiento || '').toUpperCase(),
    tipoTabla: record.tipo_tabla || '',
    doctor: record.veterinario || '',
    age: formatAge(record.edad_en_atencion),
    status: '',
    imageUrl: null,
});

const getMedicalHistory = async () => {
    const response = await apiFetch(HISTORIAL_ENDPOINT, { auth: true });
    const records = response?.historial || [];
    return records.map(normalizeRecord);
};

const getMedicalHistoryForPatient = async (patient) => {
    const idEjemplar = patient.idEjemplar || patient.id;
    console.log('[historial] URL:', `${HISTORIAL_ENDPOINT}/${idEjemplar}`, '| idEjemplar:', idEjemplar, '| patient.id:', patient.id);
    try {
        const response = await apiFetch(`${HISTORIAL_ENDPOINT}/${idEjemplar}`, { auth: true });
        console.log('[historial] respuesta:', response);
        const records = response?.historial || [];
        return records.map(record => ({ ...normalizeRecord(record), patientId: patient.id }));
    } catch (error) {
        console.error('[historial] ERROR:', error);
        return [];
    }
};

const createMedicalHistoryRecord = (record) => {
    return Promise.resolve(record);
};

export { createMedicalHistoryRecord, getMedicalHistory, getMedicalHistoryForPatient };
