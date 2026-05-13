import { apiFetch, buildUrl } from './api';

const BAJA_ENDPOINT = '/api/baja-ejemplar';

const CATEGORY_BY_TAXONOMIC_GROUP = {
    ave: 'aves',
    aves: 'aves',
    mamifero: 'mamiferos',
    mamiferos: 'mamiferos',
    reptil: 'reptiles',
    reptiles: 'reptiles',
    anfibio: 'anfibios',
    anfibios: 'anfibios',
};

const normalizeKey = (value) =>
    String(value || '').trim().toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');

const getTodayDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return { age: null, ageText: '' };
    const nacimiento = new Date(fechaNacimiento);
    if (isNaN(nacimiento.getTime())) return { age: null, ageText: '' };

    const hoy = new Date();
    let años = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();
    let dias = hoy.getDate() - nacimiento.getDate();

    if (dias < 0) {
        meses--;
        dias += new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
    }
    if (meses < 0) {
        años--;
        meses += 12;
    }

    if (años > 0) {
        const ageText = meses > 0
            ? `${años} año${años !== 1 ? 's' : ''} ${meses} mes${meses !== 1 ? 'es' : ''}`
            : `${años} año${años !== 1 ? 's' : ''}`;
        return { age: años, ageText };
    }
    if (meses > 0) {
        const ageText = dias > 0
            ? `${meses} mes${meses !== 1 ? 'es' : ''} ${dias} día${dias !== 1 ? 's' : ''}`
            : `${meses} mes${meses !== 1 ? 'es' : ''}`;
        return { age: 0, ageText };
    }
    return { age: 0, ageText: `${dias} día${dias !== 1 ? 's' : ''}` };
};

const normalizeBajaRecord = (record) => {
    const taxonomicGroup = String(record.grupo_taxonomico || '');
    const { age, ageText } = calcularEdad(record.fecha_nacimiento);
    const specimenCount = record.numero_ejemplares ? Number(record.numero_ejemplares) : null;
    const grouping = specimenCount > 1 ? 'Grupal' : specimenCount === 1 ? 'Individual' : '';
    return {
        id: record.identificacion_marcaje || String(record.id_ejemplar),
        idEjemplar: String(record.id_ejemplar),
        name: record.nombre_propio || '',
        commonName: record.nombre_comun || '',
        scientificName: record.nombre_cientifico || '',
        species: record.nombre_cientifico || '',
        taxonomicGroup,
        category: CATEGORY_BY_TAXONOMIC_GROUP[normalizeKey(taxonomicGroup)] || '',
        casualtyType: record.motivo || '',
        casualtyReason: record.motivo || null,
        procedencia: record.procedencia || '',
        family: record.familia || '',
        location: record.recinto_ubicacion || '',
        locationType: record.recinto_ubicacion || '',
        status: 'Dado de baja',
        fecha: record.fecha || '',
        registradoPor: record.nombre_usuario || '',
        idNecropsia: record.id_necropsia ?? null,
        imageUrl: record.foto_url ? buildUrl(record.foto_url) : '',
        sex: record.sexo || null,
        specimenCount,
        grouping,
        isGroup: specimenCount > 1,
        age,
        ageText,
        fechaNacimiento: record.fecha_nacimiento || '',
    };
};

const createBaja = async (idEjemplar, motivo, idNecropsia = null) => {
    return apiFetch(BAJA_ENDPOINT, {
        method: 'POST',
        auth: true,
        body: JSON.stringify({
            idEjemplar,
            motivo,
            fecha: getTodayDate(),
            ...(motivo === 'Muerte' ? { idNecropsia } : {}),
        }),
    });
};

const getBajas = async () => {
    const data = await apiFetch(BAJA_ENDPOINT, { auth: true });
    const records = Array.isArray(data?.records) ? data.records : [];
    return records.map(normalizeBajaRecord);
};

export { createBaja, getBajas };
