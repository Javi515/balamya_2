import { apiFetch, buildUrl } from './api';
import { patients } from '../data/mockData';

const PATIENTS_ENDPOINT = '/api/patients';
const patientStore = patients;
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

const normalizeText = (value) => String(value || '').trim();

const normalizeKey = (value) =>
    normalizeText(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

const parseAgeYears = (ageValue) => {
    const match = normalizeText(ageValue).match(/(\d+)/);
    return match ? Number(match[1]) : null;
};

const parseInteger = (value) => {
    const normalizedValue = normalizeText(value);

    if (!normalizedValue) {
        return null;
    }

    const parsedValue = Number(normalizedValue);
    return Number.isFinite(parsedValue) ? parsedValue : null;
};

const parseNumber = (value) => {
    const normalizedValue = normalizeText(value).replace(',', '.');

    if (!normalizedValue) {
        return null;
    }

    const parsedValue = Number(normalizedValue);
    return Number.isFinite(parsedValue) ? parsedValue : null;
};

const normalizePatientListing = (patient = {}) => {
    const taxonomicGroup = normalizeText(patient.grupoTaxonomico);
    const ageText = normalizeText(patient.edad);
    const specimenCount = parseInteger(patient.numeroEjemplares);
    const grouping = normalizeText(patient.agrupacion)
        || (specimenCount && specimenCount > 1 ? 'Grupal' : specimenCount === 1 ? 'Individual' : '');

    return {
        id: normalizeText(patient.identificacionMarcaje),
        idEjemplar: normalizeText(patient.idEjemplar),
        name: normalizeText(patient.nombrePropio),
        commonName: normalizeText(patient.nombreComun),
        scientificName: normalizeText(patient.nombreCientifico),
        species: normalizeText(patient.nombreCientifico),
        family: normalizeText(patient.familia),
        sex: normalizeText(patient.sexo),
        age: parseAgeYears(ageText),
        ageText,
        taxonomicGroup,
        category: CATEGORY_BY_TAXONOMIC_GROUP[normalizeKey(taxonomicGroup)] || '',
        location: normalizeText(patient.recintoUbicacion),
        specimenCount,
        grouping,
        isGroup: grouping.toLowerCase() === 'grupal' || (specimenCount !== null && specimenCount > 1),
        weight: parseNumber(
            patient.peso
            ?? patient.pesoKg
            ?? patient.peso_kg
            ?? patient.pesoActual
            ?? patient.peso_actual
            ?? patient.weight
        ),
        status: '',
        estadoActual: normalizeText(patient.estadoActual || patient.estado_actual),
        imageUrl: normalizeText(patient.fotoUrl) ? buildUrl(normalizeText(patient.fotoUrl)) : '',
        locationType: normalizeText(patient.recintoUbicacion),
        procedencia: normalizeText(patient.procedencia),
        fechaNacimiento: normalizeText(patient.fechaNacimiento),
        tipoIngreso: normalizeText(patient.tipoIngreso),
    };
};

const getPatients = () => patientStore;

const getPatientById = (id) => patientStore.find((patient) => patient.id === id) || null;

const getPatientByNameOrId = (value) =>
    patientStore.find(
        (patient) => patient.id === value || patient.name === value || patient.commonName === value
    ) || null;

const getRecentPatients = (limit = 5) => patientStore.slice(0, limit);

const getPatientPhotoByScientificName = (scientificName, fallback = null) =>
    patientStore.find((patient) => patient.scientificName === scientificName)?.imageUrl || fallback;

const fetchPatientListings = async () => {
    const response = await apiFetch(PATIENTS_ENDPOINT, { auth: true });
    return {
        message: normalizeText(response?.message),
        meta: response?.meta || null,
        patients: Array.isArray(response?.patients)
            ? response.patients.map(normalizePatientListing)
            : [],
    };
};

const fetchPatientById = async (id) => {
    const response = await apiFetch(`${PATIENTS_ENDPOINT}/${id}`, { auth: true });
    const raw = response?.patient || null;
    return raw ? normalizePatientListing(raw) : null;
};

const createPatient = async (patient) => {
    patientStore.push(patient);
    return patient;
};

const createPreregistro = async (fields) => {
    const response = await apiFetch(`${PATIENTS_ENDPOINT}/preregistro`, {
        method: 'POST',
        auth: true,
        body: JSON.stringify(fields),
    });
    return response;
};

const uploadPatientPhoto = async (idEjemplar, file) => {
    const formData = new FormData();
    formData.append('foto', file);
    return apiFetch(`${PATIENTS_ENDPOINT}/${idEjemplar}/foto`, {
        method: 'POST',
        auth: true,
        body: formData,
    });
};

const updatePatient = async (idEjemplar, fields) => {
    const response = await apiFetch(`${PATIENTS_ENDPOINT}/${idEjemplar}`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(fields),
    });
    const raw = response?.patient || null;
    return raw ? normalizePatientListing(raw) : null;
};

export {
    createPatient,
    createPreregistro,
    fetchPatientById,
    fetchPatientListings,
    getPatientById,
    getPatientByNameOrId,
    getPatientPhotoByScientificName,
    getPatients,
    getRecentPatients,
    updatePatient,
    uploadPatientPhoto,
};
