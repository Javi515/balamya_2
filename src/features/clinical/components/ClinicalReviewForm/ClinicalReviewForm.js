import { useState, useRef } from 'react';
import { FaDove, FaFileAlt, FaLeaf } from 'react-icons/fa';

import { useAuth } from '../../../../context/AuthContext';
import useFormState from '../../../../hooks/useFormState';
import { generateClinicalReviewPDF } from '../../utils/exportClinicalReviewPDF';

import ReptilesReviewVariant from './ReptilesReviewVariant';
import NormalAvesReviewVariant from './NormalAvesReviewVariant';

const initFields = (ex, patient) => ({
  // Datos generales
  fecha: ex?.fecha || (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })(),
  familia: ex?.familia || patient?.family || '',
  nombreCientifico: ex?.nombreCientifico || patient?.scientificName || '',
  nombreComun: ex?.nombreComun || patient?.commonName || '',
  ubicacion: ex?.ubicacion || patient?.location || '',
  identificacion: ex?.identificacion || patient?.id || '',
  edad: ex?.edad || (patient?.age ? `${patient.age} años` : ''),
  peso: ex?.peso || patient?.weight || '',
  sexo: ex?.sexo || patient?.sex || '',
  nombre: ex?.nombre || patient?.name || '',
  // Constantes fisiológicas
  frecuenciaCardiaca: ex?.frecuenciaCardiaca || '',
  frecuenciaRespiratoria: ex?.frecuenciaRespiratoria || '',
  temperatura: ex?.temperatura || '',
  tllc: ex?.tllc || '',
  // Sistemas (texto para normal/aves, "Afectado"/'' para reptiles)
  anamnesis: ex?.anamnesis || '',
  aspectoGeneral: ex?.aspectoGeneral || '',
  pielPlumas: ex?.pielPlumas || '',
  cardiovascular: ex?.cardiovascular || '',
  respiratorio: ex?.respiratorio || '',
  digestivo: ex?.digestivo || '',
  musculoesqueletico: ex?.musculoesqueletico || '',
  visualAuditivo: ex?.visualAuditivo || '',
  urogenital: ex?.urogenital || '',
  nervioso: ex?.nervioso || '',
  gangliosLinfaticos: ex?.gangliosLinfaticos || '',
  impresionesdiagnosticas: ex?.impresionesdiagnosticas || '',
  tratamientos: ex?.tratamientos || '',
  // Pruebas de laboratorio — general/normal
  bh: ex?.bh || '',
  qs: ex?.qs || '',
  frotis: ex?.frotis || '',
  paf: ex?.paf || '',
  ego: ex?.ego || '',
  coproparasitoscopico: ex?.coproparasitoscopico || '',
  rayosX: ex?.rayosX || '',
  ultrasonido: ex?.ultrasonido || '',
  // Pruebas de laboratorio — aves
  h: ex?.h || '',
  numeroHoja: ex?.numeroHoja || '',
  // Reptiles
  entornoAmbiente: ex?.entornoAmbiente || '',
  descripcionProblema: ex?.descripcionProblema || '',
  hemograma: ex?.hemograma || '',
  quimiaSanguinea: ex?.quimiaSanguinea || '',
  observaciones: ex?.observaciones || '',
  metabolico: ex?.metabolico || '',
  otroEspecificar: ex?.otroEspecificar || '',
});

const ClinicalReviewForm = ({ patient, existingRecord, onSave, onUpdate }) => {
  const formRef = useRef(null);
  const { step, isSaved, handleNext, handleBack, handleSave: originalHandleSave } = useFormState(1, Boolean(existingRecord));
  const { user } = useAuth();

  const animalCategory = (patient?.category || patient?.taxonomicGroup || '').toLowerCase();
  const isAnimalAves = animalCategory.includes('ave');
  const isAnimalReptil = animalCategory.includes('reptil');

  const getDefaultVariant = () => {
    if (existingRecord?.variante === 'aves') return 'aves';
    if (existingRecord?.variante === 'reptiles') return 'reptiles';
    if (isAnimalAves) return 'aves';
    if (isAnimalReptil) return 'reptiles';
    return 'normal';
  };

  const [variant, setVariant] = useState(getDefaultVariant);
  const [fields, setFields] = useState(() => initFields(existingRecord, patient));
  const [isDirty, setIsDirty] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState(existingRecord?.idRevision || null);
  const canToggle = false;

  const handleChange = (field, value) => {
    setFields(prev => ({ ...prev, [field]: value }));
    if (existingRecord) setIsDirty(true);
  };

  const handleUpdateSave = async () => {
    if (!onUpdate) return;

    const isNum = (val) => val === '' || !isNaN(Number(val));
    const numericFields = [
      { key: 'frecuenciaCardiaca', label: 'F.C. (lpm)', example: 'ej: 68.5' },
      { key: 'frecuenciaRespiratoria', label: 'F.R. (rpm)', example: 'ej: 18.5' },
      { key: 'temperatura', label: 'Temp. (°C)', example: 'ej: 38.5' },
      { key: 'tllc', label: 'T.LL.C. (seg)', example: 'ej: 2.5' },
      { key: 'numeroHoja', label: 'Hoja', example: 'ej: 1' },
    ];
    const invalid = numericFields.filter(f => fields[f.key] !== undefined && !isNum(fields[f.key]));
    if (invalid.length > 0) {
      alert('Corrige los siguientes campos antes de guardar:\n' + invalid.map(f => `• ${f.label}: debe ser un número (${f.example})`).join('\n'));
      return;
    }

    try {
      await onUpdate(fields);
      setIsDirty(false);
      alert('Revisión clínica actualizada correctamente.');
    } catch (err) {
      alert(err?.message || 'No se pudo guardar la revisión clínica.');
    }
  };

  const canUpdate = Boolean(existingRecord) && (variant === 'normal' || variant === 'aves' || variant === 'reptiles') && Boolean(onUpdate);

  const getTitle = () => {
    switch (variant) {
      case 'aves': return 'FORMATO DE REVISIÓN CLÍNICA DE EJEMPLARES (AVES)';
      case 'reptiles': return 'FORMATO DE REVISIÓN CLÍNICA (REPTILES)';
      default: return 'FORMATO DE REVISIÓN CLÍNICA DE EJEMPLARES';
    }
  };

  const handleExportPDF = () => {
    const el = formRef.current;
    if (!el) return;

    const getLogoSrc = (selector) => {
      const img = el.querySelector(`${selector} img[class*="uploaded-image"]`);
      return img ? img.src : null;
    };

    const responsableClinico = existingRecord?.responsable || user?.name || '';

    const formRefs = {
      logoLeft: getLogoSrc('.header-logo-left'),
      logoRight: getLogoSrc('.header-logo-right'),
    };

    if (variant === 'aves') {
      formRefs.familia = fields.familia;
      formRefs.nombreCientifico = fields.nombreCientifico;
      formRefs.nombreComun = fields.nombreComun;
      formRefs.ubicacion = fields.ubicacion;
      formRefs.identificacion = fields.identificacion;
      formRefs.edad = fields.edad;
      formRefs.peso = fields.peso;
      formRefs.sexo = fields.sexo;
      formRefs.anamnesis = fields.anamnesis;
      formRefs.fc = fields.frecuenciaCardiaca;
      formRefs.fr = fields.frecuenciaRespiratoria;
      formRefs.temp = fields.temperatura;
      formRefs.tllc = fields.tllc;
      formRefs.aspectoGeneral = fields.aspectoGeneral;
      formRefs.pielPlumas = fields.pielPlumas;
      formRefs.cardiovascular = fields.cardiovascular;
      formRefs.respiratorio = fields.respiratorio;
      formRefs.digestivo = fields.digestivo;
      formRefs.musculoEsqueletico = fields.musculoesqueletico;
      formRefs.visualAuditivo = fields.visualAuditivo;
      formRefs.urogenital = fields.urogenital;
      formRefs.nervioso = fields.nervioso;
      formRefs.pruebaH = fields.h;
      formRefs.pruebaQs = fields.qs;
      formRefs.pruebaFrotis = fields.frotis;
      formRefs.pruebaPaf = fields.paf;
      formRefs.pruebaCopro = fields.coproparasitoscopico;
      formRefs.pruebaRx = fields.rayosX;
      formRefs.pruebaUsg = fields.ultrasonido;
      formRefs.impresionesDiagnosticas = fields.impresionesdiagnosticas;
      formRefs.responsableClinico = responsableClinico;
      formRefs.numeroHoja = fields.numeroHoja;

    } else if (variant === 'reptiles') {
      const sistemaLabels = {
        pielPlumas: 'Piel', digestivo: 'Digestivo', respiratorio: 'Respiratorio',
        cardiovascular: 'Cardiovascular', visualAuditivo: 'Visual/auditivo',
        musculoesqueletico: 'Musculoesquelético', urogenital: 'Urinario/genital',
        nervioso: 'Nervioso', metabolico: 'Metabólico',
      };
      formRefs.fecha = fields.fecha;
      formRefs.especie = fields.nombreCientifico;
      formRefs.nombreComun = fields.nombreComun;
      formRefs.nombre = fields.nombre;
      formRefs.identificacion = fields.identificacion;
      formRefs.ubicacion = fields.ubicacion;
      formRefs.edad = fields.edad;
      formRefs.sexo = fields.sexo;
      formRefs.peso = fields.peso;
      formRefs.anamnesis = fields.anamnesis;
      formRefs.aspectoGeneral = fields.aspectoGeneral;
      formRefs.entornoAmbiente = fields.entornoAmbiente;
      formRefs.sistemasAfectados = Object.entries(sistemaLabels)
        .filter(([k]) => fields[k] === 'Afectado')
        .map(([, label]) => label);
      formRefs.descripcionProblema = fields.descripcionProblema;
      formRefs.pruebaBh = fields.hemograma;
      formRefs.pruebaQs = fields.quimiaSanguinea;
      formRefs.pruebaCopro = fields.coproparasitoscopico;
      formRefs.pruebaOtra = '';
      formRefs.pruebaRx = fields.rayosX;
      formRefs.pruebaUsg = fields.ultrasonido;
      formRefs.observacionesLab = fields.observaciones;
      formRefs.impresionesDiagnosticas = fields.impresionesdiagnosticas;
      formRefs.responsableClinico = responsableClinico;

    } else {
      formRefs.fecha = fields.fecha;
      formRefs.nombreCientifico = fields.nombreCientifico;
      formRefs.nombreComun = fields.nombreComun;
      formRefs.ubicacion = fields.ubicacion;
      formRefs.identificacion = fields.identificacion;
      formRefs.edad = fields.edad;
      formRefs.peso = fields.peso;
      formRefs.sexo = fields.sexo;
      formRefs.anamnesis = fields.anamnesis;
      formRefs.fc = fields.frecuenciaCardiaca;
      formRefs.fr = fields.frecuenciaRespiratoria;
      formRefs.temp = fields.temperatura;
      formRefs.tllc = fields.tllc;
      formRefs.aspectoGeneral = fields.aspectoGeneral;
      formRefs.pielPlumas = fields.pielPlumas;
      formRefs.cardiovascular = fields.cardiovascular;
      formRefs.respiratorio = fields.respiratorio;
      formRefs.digestivo = fields.digestivo;
      formRefs.musculoEsqueletico = fields.musculoesqueletico;
      formRefs.visualAuditivo = fields.visualAuditivo;
      formRefs.urogenital = fields.urogenital;
      formRefs.nervioso = fields.nervioso;
      formRefs.gangliosLinfaticos = fields.gangliosLinfaticos;
      formRefs.pruebaBh = fields.bh;
      formRefs.pruebaQs = fields.qs;
      formRefs.pruebaFrotis = fields.frotis;
      formRefs.pruebaPaf = fields.paf;
      formRefs.pruebaEgo = fields.ego;
      formRefs.pruebaCopro = fields.coproparasitoscopico;
      formRefs.pruebaRx = fields.rayosX;
      formRefs.pruebaUsg = fields.ultrasonido;
      formRefs.impresionesDiagnosticas = fields.impresionesdiagnosticas;
      formRefs.responsableClinico = responsableClinico;
    }

    generateClinicalReviewPDF(formRefs, variant);
  };

  const handleFormSave = async () => {
    const formData = { ...fields, variante: variant };

    const isNum = (val) => val === '' || !isNaN(Number(val));
    const numericFields = [
      { key: 'peso', label: 'Peso (kg)', example: 'ej: 72.5' },
      { key: 'frecuenciaCardiaca', label: 'F.C. (lpm)', example: 'ej: 68' },
      { key: 'frecuenciaRespiratoria', label: 'F.R. (rpm)', example: 'ej: 18' },
      { key: 'temperatura', label: 'Temp. (°C)', example: 'ej: 38.5' },
    ];
    const invalidFields = numericFields.filter(
      f => formData[f.key] !== undefined && !isNum(formData[f.key])
    );
    if (invalidFields.length > 0) {
      const msg = invalidFields.map(f => `• ${f.label}: debe ser un número (${f.example})`).join('\n');
      alert('Corrige los siguientes campos antes de guardar:\n' + msg);
      return;
    }

    if (onSave) {
      const res = await onSave(formData);
      const id = res?.id_revision || res?.idRevision || res?.revision?.id_revision || null;
      if (id) setSavedRecordId(id);
    }
    originalHandleSave();
  };

  const responsable = existingRecord?.responsable || user?.name || '';

  return (
    <div className="flex flex-col gap-4">
      {canToggle && (
        <div className="flex justify-center w-full">
          <div className="flex gap-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-md border border-gray-100">
            <button
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${variant === 'normal' ? 'bg-blue-600 text-white shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
              onClick={() => setVariant('normal')}
            >
              <FaFileAlt /> General
            </button>
            <button
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${variant === 'aves' ? 'bg-blue-600 text-white shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
              onClick={() => setVariant('aves')}
            >
              <FaDove /> Aves
            </button>
            <button
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${variant === 'reptiles' ? 'bg-blue-600 text-white shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
              onClick={() => setVariant('reptiles')}
            >
              <FaLeaf /> Reptiles
            </button>
          </div>
        </div>
      )}

      <div className="bg-transparent global-form-width" ref={formRef}>
        <style>{`.page-separator { height: 20px; background-color: transparent; }`}</style>
        <div className="block">
          {variant === 'reptiles' ? (
            <ReptilesReviewVariant
              patient={patient}
              fields={fields}
              handleChange={handleChange}
              getTitle={getTitle}
              isSaved={isSaved}
              handleSave={handleFormSave}
              handleExportPDF={handleExportPDF}
              responsable={responsable}
              canUpdate={canUpdate}
              isDirty={isDirty}
              onUpdateSave={handleUpdateSave}
              idRegistro={savedRecordId}
            />
          ) : (
            <NormalAvesReviewVariant
              patient={patient}
              fields={fields}
              handleChange={handleChange}
              step={step}
              getTitle={getTitle}
              isSaved={isSaved}
              handleNext={handleNext}
              handleBack={handleBack}
              handleSave={handleFormSave}
              handleExportPDF={handleExportPDF}
              isAves={variant === 'aves'}
              responsable={responsable}
              canUpdate={canUpdate}
              isDirty={isDirty}
              onUpdateSave={handleUpdateSave}
              idRegistro={savedRecordId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicalReviewForm;
