import { getPatients } from './patientsService';

const STORAGE_KEY = 'balamya_anesthesia_records';

const getAnesthesiaPatients = () => getPatients();

const getAnesthesiaRecords = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
};

const saveAnesthesiaRecords = (records) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return records;
};

const createRecord = async (patientId, record) => {
    const records = getAnesthesiaRecords();
    const patientRecords = [...(records[patientId] || []), record];
    const nextRecords = { ...records, [patientId]: patientRecords };
    saveAnesthesiaRecords(nextRecords);
    return record;
};

export {
    createRecord,
    getAnesthesiaPatients,
    getAnesthesiaRecords,
    saveAnesthesiaRecords,
};
