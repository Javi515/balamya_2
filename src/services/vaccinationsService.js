import { apiFetch } from './api';

const VACCINATIONS_ENDPOINT = '/api/vaccinations';

const normalizeRecord = (item) => ({
    id: item.id_vacunacion,
    numCalendario: item.num_calendario || 1,
    fecha: item.fecha || '',
    viaAdministracion: item.via_administracion || '',
    vacunaAplicada: item.vacuna_aplicada || '',
    proximaVacunacion: item.proxima_vacunacion || '',
    observaciones: item.observaciones || '',
    mvzResponsable: item.nombre_usuario || '',
    edadEnAtencion: item.edad_en_atencion || '',
    ubicacion: item.ubicacion || '',
    idUsuario: item.id_usuario || null,
});

const getVaccinationsForPatient = async (patient) => {
    const id = patient.idEjemplar || patient.id;
    const response = await apiFetch(`${VACCINATIONS_ENDPOINT}/${id}`, { auth: true });
    return (response?.records || []).map(normalizeRecord);
};

const createVaccinationApi = async (patient, record, numCalendario) => {
    const body = {
        idEjemplar: patient.idEjemplar || patient.id,
        numCalendario: numCalendario || 1,
        fecha: record.fecha,
        vacunaAplicada: record.vacunaAplicada,
        viaAdministracion: record.viaAdministracion,
        ...(record.proximaVacunacion ? { proximaVacunacion: record.proximaVacunacion } : {}),
        ...(record.observaciones ? { observaciones: record.observaciones } : {}),
    };

    const response = await apiFetch(VACCINATIONS_ENDPOINT, {
        method: 'POST',
        auth: true,
        body: JSON.stringify(body),
    });

    return response?.vaccination ? normalizeRecord(response.vaccination) : null;
};

const updateVaccinationApi = async (idVacunacion, record) => {
    const body = {
        fecha: record.fecha,
        vacunaAplicada: record.vacunaAplicada,
        viaAdministracion: record.viaAdministracion || null,
        proximaVacunacion: record.proximaVacunacion || null,
        observaciones: record.observaciones || null,
        ubicacion: record.ubicacion || null,
    };

    const response = await apiFetch(`${VACCINATIONS_ENDPOINT}/${idVacunacion}`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(body),
    });

    return response?.vaccination ? normalizeRecord(response.vaccination) : null;
};

export { createVaccinationApi, getVaccinationsForPatient, updateVaccinationApi };
