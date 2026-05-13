import { apiFetch } from './api';

const uploadArchivo = (tipo, id, file) => {
    const formData = new FormData();
    formData.append('archivo', file);
    return apiFetch(`/api/archivos/${tipo}/${id}`, {
        method: 'POST',
        auth: true,
        body: formData,
    });
};

const getArchivos = (tipo, id) =>
    apiFetch(`/api/archivos/${tipo}/${id}`, { auth: true });

const deleteArchivo = (idArchivo) =>
    apiFetch(`/api/archivos/${idArchivo}`, {
        method: 'DELETE',
        auth: true,
    });

export { uploadArchivo, getArchivos, deleteArchivo };
