import { apiFetch } from './api';

const CLINICAL_ENDPOINT          = '/api/clinical-reviews';
const CLINICAL_AVES_ENDPOINT     = '/api/clinical-reviews-aves';
const CLINICAL_REPTILES_ENDPOINT = '/api/clinical-reviews-reptiles';

const toNum = (val) => { const n = Number(val); return isNaN(n) ? null : n; };

const createClinicalReviewAvesApi = async (patient, formData) => {
    const idEjemplar = parseInt(patient.idEjemplar || patient.id, 10) || patient.idEjemplar || patient.id;

    const body = {
        idEjemplar,
        fecha: formData.fecha,
        ...(formData.peso && toNum(formData.peso) !== null                          ? { peso: toNum(formData.peso) } : {}),
        ...(formData.anamnesis               ? { anamnesis: formData.anamnesis } : {}),
        ...(formData.frecuenciaCardiaca && toNum(formData.frecuenciaCardiaca) !== null ? { frecuenciaCardiaca: toNum(formData.frecuenciaCardiaca) } : {}),
        ...(formData.frecuenciaRespiratoria && toNum(formData.frecuenciaRespiratoria) !== null ? { frecuenciaRespiratoria: toNum(formData.frecuenciaRespiratoria) } : {}),
        ...(formData.temperatura && toNum(formData.temperatura) !== null             ? { temperatura: toNum(formData.temperatura) } : {}),
        ...(formData.tllc                    ? { tllc: formData.tllc } : {}),
        ...(formData.aspectoGeneral          ? { aspectoGeneral: formData.aspectoGeneral } : {}),
        ...(formData.pielPlumas              ? { pielPlumas: formData.pielPlumas } : {}),
        ...(formData.cardiovascular          ? { cardiovascular: formData.cardiovascular } : {}),
        ...(formData.respiratorio            ? { respiratorio: formData.respiratorio } : {}),
        ...(formData.digestivo               ? { digestivo: formData.digestivo } : {}),
        ...(formData.musculoesqueletico      ? { musculoesqueletico: formData.musculoesqueletico } : {}),
        ...(formData.visualAuditivo          ? { visualAuditivo: formData.visualAuditivo } : {}),
        ...(formData.urogenital              ? { urogenital: formData.urogenital } : {}),
        ...(formData.nervioso                ? { nervioso: formData.nervioso } : {}),
        ...(formData.gangliosLinfaticos      ? { gangliosLinfaticos: formData.gangliosLinfaticos } : {}),
        ...(formData.impresionesdiagnosticas ? { impresionesdiagnosticas: formData.impresionesdiagnosticas } : {}),
        ...(formData.tratamientos            ? { tratamientos: formData.tratamientos } : {}),
        ...(formData.rayosX                  ? { rayosX: formData.rayosX } : {}),
        ...(formData.ultrasonido             ? { ultrasonido: formData.ultrasonido } : {}),
        ...(formData.h                       ? { h: formData.h } : {}),
        ...(formData.qs                      ? { qs: formData.qs } : {}),
        ...(formData.frotis                  ? { frotis: formData.frotis } : {}),
        ...(formData.paf                     ? { paf: formData.paf } : {}),
        ...(formData.coproparasitoscopico    ? { coproparasitoscopico: formData.coproparasitoscopico } : {}),
        ...(formData.numeroHoja && toNum(formData.numeroHoja) !== null ? { numeroHoja: toNum(formData.numeroHoja) } : {}),
    };

    return apiFetch(CLINICAL_AVES_ENDPOINT, {
        method: 'POST',
        auth: true,
        body: JSON.stringify(body),
    });
};

const createClinicalReviewReptilesApi = async (patient, formData) => {
    const idEjemplar = parseInt(patient.idEjemplar || patient.id, 10) || patient.idEjemplar || patient.id;

    const body = {
        idEjemplar,
        fecha: formData.fecha,
        anamnesis:               formData.anamnesis               || '',
        aspectoGeneral:          formData.aspectoGeneral          || '',
        impresionesdiagnosticas: formData.impresionesdiagnosticas || '',
        ...(formData.tratamientos ? { tratamientos: formData.tratamientos } : {}),
        ...(formData.peso && toNum(formData.peso) !== null         ? { peso: toNum(formData.peso) } : {}),
        ...(formData.ubicacion               ? { ubicacion: formData.ubicacion } : {}),
        ...(formData.sexo                    ? { sexo: formData.sexo } : {}),
        ...(formData.pielPlumas              ? { pielPlumas: formData.pielPlumas } : {}),
        ...(formData.cardiovascular          ? { cardiovascular: formData.cardiovascular } : {}),
        ...(formData.respiratorio            ? { respiratorio: formData.respiratorio } : {}),
        ...(formData.digestivo               ? { digestivo: formData.digestivo } : {}),
        ...(formData.musculoesqueletico      ? { musculoesqueletico: formData.musculoesqueletico } : {}),
        ...(formData.visualAuditivo          ? { visualAuditivo: formData.visualAuditivo } : {}),
        ...(formData.urogenital              ? { urogenital: formData.urogenital } : {}),
        ...(formData.nervioso                ? { nervioso: formData.nervioso } : {}),
        ...(formData.metabolico              ? { metabolico: formData.metabolico } : {}),
        ...(formData.entornoAmbiente         ? { entornoAmbiente: formData.entornoAmbiente } : {}),
        ...(formData.descripcionProblema     ? { descripcionProblema: formData.descripcionProblema } : {}),
        ...(formData.hemograma               ? { hemograma: formData.hemograma } : {}),
        ...(formData.quimiaSanguinea         ? { quimiaSanguinea: formData.quimiaSanguinea } : {}),
        ...(formData.coproparasitoscopico    ? { coproparasitoscopico: formData.coproparasitoscopico } : {}),
        ...(formData.rayosX                  ? { rayosX: formData.rayosX } : {}),
        ...(formData.ultrasonido             ? { ultrasonido: formData.ultrasonido } : {}),
        ...(formData.observaciones           ? { observaciones: formData.observaciones } : {}),
        ...(formData.otroEspecificar         ? { otroEspecificar: formData.otroEspecificar } : {}),
    };

    return apiFetch(CLINICAL_REPTILES_ENDPOINT, {
        method: 'POST',
        auth: true,
        body: JSON.stringify(body),
    });
};

const createClinicalReviewApi = async (patient, formData) => {
    if (formData.variante === 'aves') {
        return createClinicalReviewAvesApi(patient, formData);
    }
    if (formData.variante === 'reptiles') {
        return createClinicalReviewReptilesApi(patient, formData);
    }

    const idEjemplar = parseInt(patient.idEjemplar || patient.id, 10) || patient.idEjemplar || patient.id;

    const body = {
        idEjemplar,
        fecha: formData.fecha,
        ...(formData.peso && toNum(formData.peso) !== null                          ? { peso: toNum(formData.peso) } : {}),
        ...(formData.anamnesis               ? { anamnesis: formData.anamnesis } : {}),
        ...(formData.frecuenciaCardiaca && toNum(formData.frecuenciaCardiaca) !== null ? { frecuenciaCardiaca: toNum(formData.frecuenciaCardiaca) } : {}),
        ...(formData.frecuenciaRespiratoria && toNum(formData.frecuenciaRespiratoria) !== null ? { frecuenciaRespiratoria: toNum(formData.frecuenciaRespiratoria) } : {}),
        ...(formData.temperatura && toNum(formData.temperatura) !== null             ? { temperatura: toNum(formData.temperatura) } : {}),
        ...(formData.tllc                    ? { tllc: formData.tllc } : {}),
        ...(formData.aspectoGeneral          ? { aspectoGeneral: formData.aspectoGeneral } : {}),
        ...(formData.pielPlumas              ? { pielPlumas: formData.pielPlumas } : {}),
        ...(formData.cardiovascular          ? { cardiovascular: formData.cardiovascular } : {}),
        ...(formData.respiratorio            ? { respiratorio: formData.respiratorio } : {}),
        ...(formData.digestivo               ? { digestivo: formData.digestivo } : {}),
        ...(formData.musculoesqueletico      ? { musculoesqueletico: formData.musculoesqueletico } : {}),
        ...(formData.visualAuditivo          ? { visualAuditivo: formData.visualAuditivo } : {}),
        ...(formData.urogenital              ? { urogenital: formData.urogenital } : {}),
        ...(formData.nervioso                ? { nervioso: formData.nervioso } : {}),
        ...(formData.gangliosLinfaticos      ? { gangliosLinfaticos: formData.gangliosLinfaticos } : {}),
        ...(formData.rayosX                  ? { rayosX: formData.rayosX } : {}),
        ...(formData.ultrasonido             ? { ultrasonido: formData.ultrasonido } : {}),
        ...(formData.impresionesdiagnosticas ? { impresionesdiagnosticas: formData.impresionesdiagnosticas } : {}),
        ...(formData.tratamientos            ? { tratamientos: formData.tratamientos } : {}),
        ...(formData.bh                      ? { bh: formData.bh } : {}),
        ...(formData.qs                      ? { qs: formData.qs } : {}),
        ...(formData.frotis                  ? { frotis: formData.frotis } : {}),
        ...(formData.paf                     ? { paf: formData.paf } : {}),
        ...(formData.ego                     ? { ego: formData.ego } : {}),
        ...(formData.coproparasitoscopico    ? { coproparasitoscopico: formData.coproparasitoscopico } : {}),
    };

    return apiFetch(CLINICAL_ENDPOINT, {
        method: 'POST',
        auth: true,
        body: JSON.stringify(body),
    });
};

const updateClinicalReviewAvesApi = async (idRevision, formData) => {
    const body = {
        fecha: formData.fecha,
        ubicacion: formData.ubicacion || null,
        peso: formData.peso ? toNum(formData.peso) : null,
        anamnesis: formData.anamnesis || null,
        frecuenciaCardiaca: formData.frecuenciaCardiaca ? toNum(formData.frecuenciaCardiaca) : null,
        frecuenciaRespiratoria: formData.frecuenciaRespiratoria ? toNum(formData.frecuenciaRespiratoria) : null,
        temperatura: formData.temperatura ? toNum(formData.temperatura) : null,
        tllc: formData.tllc || null,
        aspectoGeneral: formData.aspectoGeneral || null,
        pielPlumas: formData.pielPlumas || null,
        cardiovascular: formData.cardiovascular || null,
        respiratorio: formData.respiratorio || null,
        digestivo: formData.digestivo || null,
        musculoesqueletico: formData.musculoesqueletico || null,
        visualAuditivo: formData.visualAuditivo || null,
        urogenital: formData.urogenital || null,
        nervioso: formData.nervioso || null,
        gangliosLinfaticos: formData.gangliosLinfaticos || null,
        rayosX: formData.rayosX || null,
        ultrasonido: formData.ultrasonido || null,
        impresionesdiagnosticas: formData.impresionesdiagnosticas || null,
        tratamientos: formData.tratamientos || null,
        sexo: formData.sexo || null,
        bh: formData.bh || null,
        qs: formData.qs || null,
        frotis: formData.frotis || null,
        paf: formData.paf || null,
        coproparasitoscopico: formData.coproparasitoscopico || null,
        numeroHoja: formData.numeroHoja ? toNum(formData.numeroHoja) : null,
        h: formData.h || null,
    };
    return apiFetch(`${CLINICAL_AVES_ENDPOINT}/${idRevision}`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(body),
    });
};

const updateClinicalReviewReptilesApi = async (idRevision, formData) => {
    const body = {
        fecha: formData.fecha,
        ubicacion: formData.ubicacion || null,
        peso: formData.peso ? toNum(formData.peso) : null,
        anamnesis: formData.anamnesis || null,
        aspectoGeneral: formData.aspectoGeneral || null,
        pielPlumas: formData.pielPlumas || null,
        cardiovascular: formData.cardiovascular || null,
        respiratorio: formData.respiratorio || null,
        digestivo: formData.digestivo || null,
        musculoesqueletico: formData.musculoesqueletico || null,
        visualAuditivo: formData.visualAuditivo || null,
        urogenital: formData.urogenital || null,
        nervioso: formData.nervioso || null,
        coproparasitoscopico: formData.coproparasitoscopico || null,
        rayosX: formData.rayosX || null,
        ultrasonido: formData.ultrasonido || null,
        impresionesdiagnosticas: formData.impresionesdiagnosticas || null,
        tratamientos: formData.tratamientos || null,
        sexo: formData.sexo || null,
        entornoAmbiente: formData.entornoAmbiente || null,
        metabolico: formData.metabolico || null,
        descripcionProblema: formData.descripcionProblema || null,
        hemograma: formData.hemograma || null,
        quimiaSanguinea: formData.quimiaSanguinea || null,
        observaciones: formData.observaciones || null,
        otroEspecificar: formData.otroEspecificar || null,
    };
    return apiFetch(`${CLINICAL_REPTILES_ENDPOINT}/${idRevision}`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(body),
    });
};

const updateClinicalReviewApi = async (idRevision, formData) => {
    const body = {
        fecha: formData.fecha,
        ubicacion: formData.ubicacion || null,
        peso: formData.peso ? toNum(formData.peso) : null,
        anamnesis: formData.anamnesis || null,
        frecuenciaCardiaca: formData.frecuenciaCardiaca ? toNum(formData.frecuenciaCardiaca) : null,
        frecuenciaRespiratoria: formData.frecuenciaRespiratoria ? toNum(formData.frecuenciaRespiratoria) : null,
        temperatura: formData.temperatura ? toNum(formData.temperatura) : null,
        tllc: formData.tllc || null,
        aspectoGeneral: formData.aspectoGeneral || null,
        pielPlumas: formData.pielPlumas || null,
        cardiovascular: formData.cardiovascular || null,
        respiratorio: formData.respiratorio || null,
        digestivo: formData.digestivo || null,
        musculoesqueletico: formData.musculoesqueletico || null,
        visualAuditivo: formData.visualAuditivo || null,
        urogenital: formData.urogenital || null,
        nervioso: formData.nervioso || null,
        gangliosLinfaticos: formData.gangliosLinfaticos || null,
        rayosX: formData.rayosX || null,
        ultrasonido: formData.ultrasonido || null,
        impresionesdiagnosticas: formData.impresionesdiagnosticas || null,
        tratamientos: formData.tratamientos || null,
        sexo: formData.sexo || null,
        bh: formData.bh || null,
        qs: formData.qs || null,
        frotis: formData.frotis || null,
        paf: formData.paf || null,
        ego: formData.ego || null,
        coproparasitoscopico: formData.coproparasitoscopico || null,
    };
    return apiFetch(`${CLINICAL_ENDPOINT}/${idRevision}`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(body),
    });
};

const getClinicalReviewsApi = async (patient) => {
    const idEjemplar = patient.idEjemplar || patient.id;
    const category = (patient.category || patient.taxonomicGroup || '').toLowerCase();
    const isAves    = category.includes('ave');
    const isReptil  = category.includes('reptil');

    let endpoint;
    let variante;
    if (isAves)        { endpoint = `${CLINICAL_AVES_ENDPOINT}/${idEjemplar}`;     variante = 'aves'; }
    else if (isReptil) { endpoint = `${CLINICAL_REPTILES_ENDPOINT}/${idEjemplar}`; variante = 'reptiles'; }
    else               { endpoint = `${CLINICAL_ENDPOINT}/${idEjemplar}`;          variante = 'normal'; }

    const response = await apiFetch(endpoint, { auth: true });
    return (response.records || []).map((r) => ({
        fecha:       r.fecha || null,
        responsable: r.nombre_usuario || null,
        variante,
    }));
};

const getAllClinicalReviewsApi = async () => {
    const [generalResult, avesResult, reptilesResult] = await Promise.allSettled([
        apiFetch(CLINICAL_ENDPOINT, { auth: true }),
        apiFetch(CLINICAL_AVES_ENDPOINT, { auth: true }),
        apiFetch(CLINICAL_REPTILES_ENDPOINT, { auth: true }),
    ]);

    const normalizeRecord = (r, variante) => ({
        idRevision:              r.id_revision || null,
        idEjemplar:              r.identificacion_marcaje || String(r.id_ejemplar),
        grupoTaxonomico:         r.grupo_taxonomico || null,
        nombre:                  r.nombre_propio || null,
        otroEspecificar:         r.otro_especificar || null,
        nombreComun:             r.nombre_comun || null,
        nombreCientifico:        r.nombre_cientifico || null,
        fecha:                   r.fecha || null,
        creadoEn:                r.created_at || r.fecha_hora || null,
        responsable:             r.nombre_usuario || null,
        variante,
        // Patient header fields
        familia:                 r.familia || null,
        ubicacion:               r.ubicacion || null,
        identificacion:          r.identificacion_marcaje || null,
        edad:                    r.edad_en_atencion || null,
        sexo:                    r.sexo || null,
        peso:                    r.peso != null ? String(r.peso) : null,
        // Vital signs
        frecuenciaCardiaca:      r.frecuencia_cardiaca != null ? String(r.frecuencia_cardiaca) : null,
        frecuenciaRespiratoria:  r.frecuencia_respiratoria != null ? String(r.frecuencia_respiratoria) : null,
        temperatura:             r.temperatura != null ? String(r.temperatura) : null,
        tllc:                    r.tllc || null,
        // Body systems
        anamnesis:               r.anamnesis || null,
        aspectoGeneral:          r.aspecto_general || null,
        pielPlumas:              r.piel_plumas || null,
        cardiovascular:          r.cardiovascular || null,
        respiratorio:            r.respiratorio || null,
        digestivo:               r.digestivo || null,
        musculoesqueletico:      r.musculoesqueletico || null,
        visualAuditivo:          r.visual_auditivo || null,
        urogenital:              r.urogenital || null,
        nervioso:                r.nervioso || null,
        gangliosLinfaticos:      r.ganglios_linfaticos || null,
        impresionesdiagnosticas: r.impresiones_diagnosticas || null,
        tratamientos:            r.tratamientos || null,
        // Lab tests (general)
        bh:                      r.bh || null,
        qs:                      r.qs || null,
        frotis:                  r.frotis || null,
        paf:                     r.paf || null,
        ego:                     r.ego || null,
        coproparasitoscopico:    r.coproparasitoscopico || null,
        rayosX:                  r.rayos_x || null,
        ultrasonido:             r.ultrasonido || null,
        // Lab tests (aves-specific)
        h:                       r.h || null,
        numeroHoja:              r.numero_hoja || null,
        // Lab tests (reptiles-specific)
        hemograma:               r.hemograma || null,
        quimiaSanguinea:         r.quimica_sanguinea || null,
        // Reptiles-specific fields
        entornoAmbiente:         r.entorno_ambiente || null,
        metabolico:              r.metabolico || null,
        descripcionProblema:     r.descripcion_problema || null,
        observaciones:           r.observaciones || null,
    });

    const general = generalResult.status === 'fulfilled'
        ? (generalResult.value.records || []).map((r) => normalizeRecord(r, 'normal'))
        : [];

    const aves = avesResult.status === 'fulfilled'
        ? (avesResult.value.records || []).map((r) => normalizeRecord(r, 'aves'))
        : [];

    const reptiles = reptilesResult.status === 'fulfilled'
        ? (reptilesResult.value.records || []).map((r) => normalizeRecord(r, 'reptiles'))
        : [];

    return [...general, ...aves, ...reptiles];
};

export { createClinicalReviewApi, updateClinicalReviewApi, updateClinicalReviewAvesApi, updateClinicalReviewReptilesApi, getClinicalReviewsApi, getAllClinicalReviewsApi };
