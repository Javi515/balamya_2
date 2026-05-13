import { apiFetch } from './api';
import { getPatients, getPatientPhotoByScientificName } from './patientsService';

const TREATMENTS_STORAGE_KEY = 'balamya_treatments';
const GROUP_TREATMENTS_STORAGE_KEY = 'balamya_group_treatments';

const DEFAULT_PHOTO =
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=800';

// ─── Mock data helpers (fallback while backend is not available) ──────────────

const HISTORY_DOCTORS = ['Dr. Alejandro Vera', 'Dra. Maria Solis', 'Dr. Carlos Mendez', 'Dra. Lucia Ramos'];
const CRITICAL_STATUSES = new Set(['Crítico', 'Critico']);
const MONITORED_STATUSES = new Set(['Estable', 'Observacion', 'Observación']);

const GROUP_TREATMENT_CONFIG = {
    mamiferos: {
        name: 'Tratamiento grupal de mamiferos',
        diagnosis: 'Protocolo grupal de recuperacion nutricional y observacion conductual.',
        anamnesis: 'Grupo bajo seguimiento nutricional y conductual por cambios recientes en dieta y socializacion.',
        observations: 'Respuesta favorable al manejo clinico grupal; continuar monitoreo semanal.',
        responsible: 'Dr. Alejandro Vera',
    },
    aves: {
        name: 'Tratamiento grupal de aves',
        diagnosis: 'Suplementacion, control respiratorio y seguimiento de plumaje.',
        anamnesis: 'Lote con antecedente de estres por muda y vigilancia respiratoria preventiva.',
        observations: 'Mantener suplemento vitaminico y control de calidad ambiental.',
        responsible: 'Dra. Maria Solis',
    },
    reptiles: {
        name: 'Tratamiento grupal de reptiles',
        diagnosis: 'Manejo termico, hidratacion asistida y observacion de apetito.',
        anamnesis: 'Grupo con variaciones en consumo de alimento y ajustes recientes de temperatura.',
        observations: 'Continuar hidratacion asistida y registrar cambios de conducta.',
        responsible: 'Dr. Carlos Mendez',
    },
    anfibios: {
        name: 'Tratamiento grupal de anfibios',
        diagnosis: 'Control de calidad del agua, soporte dermatologico y monitoreo general.',
        anamnesis: 'Grupo sensible a cambios de calidad del agua con seguimiento preventivo de piel.',
        observations: 'Parametros estables; mantener inspeccion diaria del habitat.',
        responsible: 'Dr. Carlos Mendez',
    },
};

const getMockCaseLifecycle = (index, group = false) => {
    const isAlta = group ? index % 3 === 1 : index % 4 === 0;
    return {
        treatmentStatus: isAlta ? 'alta' : 'enTratamiento',
        dischargeDate: isAlta ? '2024-01-26' : null,
    };
};

const getMockHistoryProfile = (status, treatmentStatus = 'enTratamiento') => {
    if (treatmentStatus === 'alta') {
        return {
            stage: 'Alta clinica',
            objective: 'Mantener el caso cerrado con trazabilidad completa del tratamiento y acceso a la documentacion final.',
            nextCheckpoint: null,
            dischargeReadiness: 'Alta registrada',
            summary: 'Caso concluido con alta clinica documentada y seguimiento cerrado.',
            emphasis: 'Alta',
        };
    }
    if (CRITICAL_STATUSES.has(status)) {
        return {
            stage: 'Vigilancia intensiva',
            objective: 'Contener el riesgo clinico, mantener estabilidad fisiologica y revisar respuesta terapeutica por turno.',
            nextCheckpoint: '2024-01-24',
            dischargeReadiness: 'No elegible',
            summary: 'Caso con prioridad alta y necesidad de seguimiento continuo.',
            emphasis: 'Alta prioridad',
        };
    }
    if (MONITORED_STATUSES.has(status)) {
        return {
            stage: 'Control intermedio',
            objective: 'Consolidar la respuesta al tratamiento, documentar cambios clinicos y ajustar el plan si es necesario.',
            nextCheckpoint: '2024-01-27',
            dischargeReadiness: 'En valoracion',
            summary: 'Caso estable con revisiones programadas y monitoreo activo.',
            emphasis: 'Monitoreo programado',
        };
    }
    return {
        stage: 'Seguimiento terapeutico',
        objective: 'Mantener el plan actual, registrar evolucion y preparar criterios de alta clinica.',
        nextCheckpoint: '2024-01-29',
        dischargeReadiness: 'Candidato a alta',
        summary: 'Caso controlado con buena respuesta al manejo terapeutico.',
        emphasis: 'Controlado',
    };
};

const buildMockTreatmentHistory = (patient, index, responsibleClinico, lifecycle) => {
    const profile = getMockHistoryProfile(patient.status, lifecycle.treatmentStatus);
    const primaryDoctor = responsibleClinico || HISTORY_DOCTORS[index % HISTORY_DOCTORS.length];
    const supportDoctor = HISTORY_DOCTORS[(index + 1) % HISTORY_DOCTORS.length];
    const reviewDoctor = HISTORY_DOCTORS[(index + 2) % HISTORY_DOCTORS.length];

    const events = [
        {
            id: `${patient.id}-hist-1`,
            date: '2024-01-15',
            type: 'Ingreso',
            title: 'Apertura del caso terapeutico',
            clinician: primaryDoctor,
            note: 'Se abre el episodio de tratamiento con valoracion inicial, anamnesis base y plan de seguimiento diario.',
            outcome: 'Caso activo y protocolo inicial definido.',
            tone: 'primary',
        },
        {
            id: `${patient.id}-hist-2`,
            date: '2024-01-17',
            type: 'Revision',
            title: 'Revision clinica de control',
            clinician: supportDoctor,
            note: 'Se revisa evolucion temprana, tolerancia al manejo y respuesta a las indicaciones del primer turno.',
            outcome: 'Sin hallazgos de deterioro agudo; continuar observacion.',
            tone: 'support',
        },
        {
            id: `${patient.id}-hist-3`,
            date: '2024-01-20',
            type: 'Ajuste',
            title: 'Ajuste del plan terapeutico',
            clinician: reviewDoctor,
            note: 'Se actualizan observaciones clinicas, se registran cambios del caso y se redefine la prioridad operativa.',
            outcome: profile.summary,
            tone: 'warning',
        },
        {
            id: `${patient.id}-hist-4`,
            date: '2024-01-23',
            type: 'Seguimiento',
            title: 'Cierre del ultimo control',
            clinician: primaryDoctor,
            note: 'Se consolida la informacion del turno mas reciente y se dejan indicaciones para la siguiente revision.',
            outcome: lifecycle.treatmentStatus === 'alta'
                ? 'Caso listo para cierre clinico y documentacion de alta.'
                : `Proximo control programado para ${profile.nextCheckpoint}.`,
            tone: 'neutral',
        },
    ];

    if (lifecycle.treatmentStatus === 'alta' && lifecycle.dischargeDate) {
        events.push({
            id: `${patient.id}-hist-5`,
            date: lifecycle.dischargeDate,
            type: 'Alta',
            title: 'Alta clinica registrada',
            clinician: primaryDoctor,
            note: 'Se documenta el cierre del caso por respuesta favorable al tratamiento y cumplimiento de criterios clinicos.',
            outcome: 'Caso cerrado y alta registrada en el historial.',
            tone: 'support',
        });
    }

    return {
        caseStage: profile.stage,
        careObjective: profile.objective,
        nextCheckpoint: profile.nextCheckpoint,
        dischargeReadiness: profile.dischargeReadiness,
        summary: profile.summary,
        emphasis: profile.emphasis,
        lastUpdated: lifecycle.dischargeDate || '2024-01-23',
        events,
    };
};

const buildMockGroupTreatmentHistory = (groupRecord, representative, index, responsibleClinico, lifecycle) => {
    const profile = getMockHistoryProfile(representative?.status, lifecycle.treatmentStatus);
    const primaryDoctor = responsibleClinico || HISTORY_DOCTORS[index % HISTORY_DOCTORS.length];
    const supportDoctor = HISTORY_DOCTORS[(index + 1) % HISTORY_DOCTORS.length];
    const reviewDoctor = HISTORY_DOCTORS[(index + 2) % HISTORY_DOCTORS.length];

    const events = [
        {
            id: `${groupRecord.id}-hist-1`,
            date: '2024-01-15',
            type: 'Ingreso',
            title: 'Apertura del tratamiento grupal',
            clinician: primaryDoctor,
            note: `Se inicia el caso grupal para ${groupRecord.memberCount} ejemplares con revision de criterios compartidos y organizacion por prioridad.`,
            outcome: 'Grupo registrado y protocolo base definido.',
            tone: 'primary',
        },
        {
            id: `${groupRecord.id}-hist-2`,
            date: '2024-01-18',
            type: 'Revision',
            title: 'Revision por lote',
            clinician: supportDoctor,
            note: 'Se comparan respuestas clinicas entre integrantes, adherencia al manejo y cambios observados en el grupo.',
            outcome: 'Se mantiene control por subgrupos y observacion clinica.',
            tone: 'support',
        },
        {
            id: `${groupRecord.id}-hist-3`,
            date: '2024-01-20',
            type: 'Ajuste',
            title: 'Ajuste de protocolo compartido',
            clinician: reviewDoctor,
            note: 'Se refinan indicaciones clinicas comunes y se priorizan integrantes con seguimiento mas cercano.',
            outcome: groupRecord.observations,
            tone: 'warning',
        },
        {
            id: `${groupRecord.id}-hist-4`,
            date: '2024-01-23',
            type: 'Seguimiento',
            title: 'Cierre del ultimo control grupal',
            clinician: primaryDoctor,
            note: 'Se consolida la nota grupal mas reciente y se agenda la siguiente reevaluacion.',
            outcome: lifecycle.treatmentStatus === 'alta'
                ? 'Grupo listo para cierre clinico y documentacion final.'
                : `Proximo control programado para ${profile.nextCheckpoint}.`,
            tone: 'neutral',
        },
    ];

    if (lifecycle.treatmentStatus === 'alta' && lifecycle.dischargeDate) {
        events.push({
            id: `${groupRecord.id}-hist-5`,
            date: lifecycle.dischargeDate,
            type: 'Alta',
            title: 'Alta grupal registrada',
            clinician: primaryDoctor,
            note: 'Se documenta el cierre del caso grupal tras respuesta favorable del lote y cumplimiento de criterios clinicos.',
            outcome: 'Grupo dado de alta y cierre registrado.',
            tone: 'support',
        });
    }

    return {
        caseStage: profile.stage,
        careObjective: `Coordinar manejo clinico compartido para ${groupRecord.memberCount} ejemplares y documentar variaciones relevantes del lote.`,
        nextCheckpoint: profile.nextCheckpoint,
        dischargeReadiness: lifecycle.treatmentStatus === 'alta'
            ? profile.dischargeReadiness
            : groupRecord.memberCount > 2
              ? 'Evaluacion por subgrupo'
              : profile.dischargeReadiness,
        summary: `Grupo en seguimiento clinico con prioridad ${profile.emphasis.toLowerCase()}.`,
        emphasis: profile.emphasis,
        lastUpdated: lifecycle.dischargeDate || '2024-01-23',
        events,
    };
};

const buildMockTreatments = () => {
    const patients = getPatients();
    return Array.from({ length: 12 }, (_, index) => {
        const patient = patients[index % patients.length];
        const responsibleClinico = HISTORY_DOCTORS[index % HISTORY_DOCTORS.length];
        const lifecycle = getMockCaseLifecycle(index);
        const history = buildMockTreatmentHistory(patient, index, responsibleClinico, lifecycle);
        return {
            ...patient,
            area: patient.location || 'Cuarentena A',
            admissionDate: '2024-01-15',
            hospitalizacionId: index % 3 === 0 ? `HOSP-${String(index + 1).padStart(3, '0')}` : null,
            diagnosis: CRITICAL_STATUSES.has(patient.status)
                ? 'Atencion urgente requerida'
                : 'Chequeo rutinario',
            anamnesis: CRITICAL_STATUSES.has(patient.status)
                ? 'Paciente con antecedentes recientes de descompensacion clinica y necesidad de vigilancia estrecha.'
                : 'Paciente en seguimiento por evolucion clinica y control terapeutico programado.',
            observations: CRITICAL_STATUSES.has(patient.status)
                ? 'Se recomienda monitoreo frecuente y reevaluacion de parametros vitales.'
                : 'Evolucion estable; continuar protocolo y seguimiento de rutina.',
            responsible: responsibleClinico,
            responsibleClinico,
            currentStage: history.caseStage,
            nextCheckpoint: history.nextCheckpoint,
            dischargeReadiness: history.dischargeReadiness,
            treatmentStatus: lifecycle.treatmentStatus,
            dischargeDate: lifecycle.dischargeDate,
            history,
        };
    });
};

const buildMockGroupTreatments = () => {
    const patients = getPatients();
    const groupedPatients = patients.reduce((accumulator, patient) => {
        const key = patient.category || 'general';
        if (!accumulator[key]) accumulator[key] = [];
        accumulator[key].push(patient);
        return accumulator;
    }, {});

    return Object.entries(groupedPatients).map(([category, members], index) => {
        const representative = members[0];
        const config = GROUP_TREATMENT_CONFIG[category] || {
            name: 'Tratamiento grupal',
            diagnosis: 'Seguimiento grupal clinico.',
            anamnesis: 'Grupo en control clinico general.',
            observations: 'Continuar observacion grupal.',
            responsible: 'Dr. Alejandro Vera',
        };
        const groupRecord = {
            id: `GT-${String(index + 1).padStart(3, '0')}`,
            name: config.name,
            category,
            commonName: representative?.commonName || 'Grupo clinico',
            scientificName: representative?.scientificName || '',
            species: representative?.species || representative?.scientificName || 'Grupo',
            area: representative?.location || 'Area clinica',
            locationType: representative?.locationType || 'Recinto',
            admissionDate: '2024-01-15',
            diagnosis: config.diagnosis,
            anamnesis: config.anamnesis,
            observations: config.observations,
            responsible: config.responsible,
            responsibleClinico: config.responsible,
            memberCount: members.length,
            memberPreview: members.slice(0, 4).map((member) => member.name),
            formPatientId: representative?.id || null,
            representativeName: representative?.name || representative?.commonName || 'Representante',
        };
        const lifecycle = getMockCaseLifecycle(index, true);
        const history = buildMockGroupTreatmentHistory(groupRecord, representative, index, config.responsible, lifecycle);
        return {
            ...groupRecord,
            currentStage: history.caseStage,
            nextCheckpoint: history.nextCheckpoint,
            dischargeReadiness: history.dischargeReadiness,
            treatmentStatus: lifecycle.treatmentStatus,
            dischargeDate: lifecycle.dischargeDate,
            history,
        };
    });
};

// ─── Storage ──────────────────────────────────────────────────────────────────

const getTreatmentRecords = () => {
    try {
        const stored = localStorage.getItem(TREATMENTS_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch {
        // ignore parse errors
    }
    return null;
};

const saveTreatments = (records) => {
    localStorage.setItem(TREATMENTS_STORAGE_KEY, JSON.stringify(records));
    return records;
};

const getGroupTreatmentRecords = () => {
    try {
        const stored = localStorage.getItem(GROUP_TREATMENTS_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch {
        // ignore parse errors
    }
    return null;
};

const saveGroupTreatments = (records) => {
    localStorage.setItem(GROUP_TREATMENTS_STORAGE_KEY, JSON.stringify(records));
    return records;
};

// ─── Public API ───────────────────────────────────────────────────────────────

const getTreatments = () => getTreatmentRecords() ?? buildMockTreatments();

const getGroupTreatments = () => getGroupTreatmentRecords() ?? buildMockGroupTreatments();

const getTreatmentPhoto = (scientificName) =>
    getPatientPhotoByScientificName(scientificName, DEFAULT_PHOTO);

const getTreatmentHistory = (recordId) =>
    [...getTreatments(), ...getGroupTreatments()].find((record) => record.id === recordId)?.history || null;

const createTreatment = async (treatment) => {
    const records = getTreatments();
    const next = [...(Array.isArray(records) ? records : []), treatment];
    saveTreatments(next);
    return treatment;
};

const createGroupTreatment = async (treatment) => {
    const records = getGroupTreatments();
    const next = [...(Array.isArray(records) ? records : []), treatment];
    saveGroupTreatments(next);
    return treatment;
};

const createGroupTreatmentApi = async (payload) => {
    return apiFetch('/api/tratamiento-grupal', {
        method: 'POST',
        auth: true,
        body: JSON.stringify(payload),
    });
};

export {
    createGroupTreatment,
    createGroupTreatmentApi,
    createTreatment,
    getGroupTreatments,
    getTreatmentHistory,
    getTreatmentPhoto,
    getTreatments,
    saveGroupTreatments,
    saveTreatments,
};
