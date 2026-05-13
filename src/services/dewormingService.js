import { apiFetch } from './api';

const getDewormingsByAnimal = async (idEjemplar) => {
    const response = await apiFetch(`/api/deworming/${idEjemplar}`, {
        method: 'GET',
        auth: true,
    });
    return Array.isArray(response) ? response : (response?.records || []);
};

const createDewormingApi = async (animal, record, generalData, numCalendario) => {
    const payload = {
        idEjemplar: animal.idEjemplar || animal.id,
        numCalendario: numCalendario || 1,
        fecha: record.fecha,
        principioActivo: record.principioActivo,
        productoComercial: record.productoComercial,
        dosisMgKg: record.dosisMgKg,
        dosisTotal: record.dosisTotal,
        viaAdministracion: record.via,
        frecuencia: record.frecuencia,
        ...(generalData.grupo && { grupo: generalData.grupo }),
        ...(generalData.peso && { peso: generalData.peso }),
        ...(generalData.ubicacion && { ubicacion: generalData.ubicacion }),
        ...(generalData.estadoFisiologico && { estadoFisiologico: generalData.estadoFisiologico }),
        ...(generalData.idUsuario && { idUsuario: generalData.idUsuario }),
        ...(record.proxima && { proximaDesparasitacion: record.proxima }),
    };

    return apiFetch('/api/deworming', {
        method: 'POST',
        auth: true,
        body: JSON.stringify(payload),
    });
};

const updateDewormingApi = async (idCalendario, payload) => {
    return apiFetch(`/api/deworming/${idCalendario}`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(payload),
    });
};

export {
    createDewormingApi,
    getDewormingsByAnimal,
    updateDewormingApi,
};
