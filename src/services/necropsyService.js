import { apiFetch } from './api';

const NECROPSY_ENDPOINT = '/api/necropsia';

const getNextFolio = async () => {
    const response = await apiFetch(`${NECROPSY_ENDPOINT}/next-folio`, { auth: true });
    return response?.folio ?? '';
};

const createNecropsy = async (data) => {
    return apiFetch(NECROPSY_ENDPOINT, {
        method: 'POST',
        auth: true,
        body: JSON.stringify(data),
    });
};

const getNecropsyById = async (id) => {
    const response = await apiFetch(`${NECROPSY_ENDPOINT}/${id}`, { auth: true });
    return response?.necropsia || response?.data || response;
};

const updateNecropsy = async (id, data) => {
    return apiFetch(`${NECROPSY_ENDPOINT}/${id}`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(data),
    });
};

export { createNecropsy, getNecropsyById, getNextFolio, updateNecropsy };
