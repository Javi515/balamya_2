import React, { useState, useRef } from 'react';
import { FaDove, FaFileAlt, FaLeaf } from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';
import useFormState from '../../hooks/useFormState';
import { generateClinicalReviewPDF } from '../../utils/exportClinicalReviewPDF';

// Import subcomponents
import ReptilesReviewVariant from './clinical/ReptilesReviewVariant';
import NormalAvesReviewVariant from './clinical/NormalAvesReviewVariant';

const ClinicalReviewForm = ({ patient, existingRecord, onSave }) => {
  const formRef = useRef(null);
  const { step, isSaved, handleNext, handleBack, handleSave: originalHandleSave } = useFormState(1);
  const { user } = useAuth();

  const userRole = user?.role || '';
  const isAdmin = userRole === 'admin';
  const isAves = userRole === 'aves';
  const isReptiles = userRole === 'reptiles';

  const getDefaultVariant = () => {
    if (isAves) return 'aves';
    if (isReptiles) return 'reptiles';
    if (isAdmin) return 'normal';
    return 'normal';
  };

  const [variant, setVariant] = useState(getDefaultVariant);
  const canToggle = isAdmin;

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

    const getText = (index) => {
      const inputs = Array.from(el.querySelectorAll('input[type="text"]'));
      return inputs[index] ? inputs[index].value : '';
    };

    const getArea = (index) => {
      const textareas = Array.from(el.querySelectorAll('textarea'));
      return textareas[index] ? textareas[index].value : '';
    };

    const getLogoSrc = (selector) => {
      const img = el.querySelector(`${selector} img[class*="uploaded-image"]`);
      return img ? img.src : null;
    };

    const getCheckboxes = (selector) => {
      const checkboxes = Array.from(el.querySelectorAll(selector));
      return checkboxes.filter(cb => cb.checked).map(cb => cb.nextSibling?.textContent?.trim() || cb.value);
    };

    // Index calculation depends on variant
    const formRefs = {
      logoLeft: getLogoSrc('.header-logo-left'),
      logoRight: getLogoSrc('.header-logo-right'),
    };

    if (variant === 'aves') {
      formRefs.familia = getText(0);
      formRefs.nombreCientifico = getText(1);
      formRefs.nombreComun = getText(2);
      formRefs.ubicacion = getText(3);
      formRefs.identificacion = getText(4);
      formRefs.edad = getText(5);
      formRefs.peso = getText(6);
      formRefs.sexo = getText(7);

      formRefs.anamnesis = getArea(0);

      formRefs.fc = getText(8);
      formRefs.fr = getText(9);
      formRefs.temp = getText(10);
      formRefs.tllc = getText(11);

      formRefs.aspectoGeneral = getArea(1);
      formRefs.pielPlumas = getArea(2);
      formRefs.cardiovascular = getArea(3);
      formRefs.respiratorio = getArea(4);
      formRefs.digestivo = getArea(5);
      formRefs.musculoEsqueletico = getArea(6);
      formRefs.visualAuditivo = getArea(7);
      formRefs.urogenital = getArea(8);
      formRefs.nervioso = getArea(9);

      // Aves specific tests
      formRefs.pruebaH = getText(12);
      formRefs.pruebaQs = getText(13);
      formRefs.pruebaFrotis = getText(14);
      formRefs.pruebaPaf = getText(15);
      formRefs.pruebaCopro = getText(16);
      formRefs.pruebaRx = getText(17);
      formRefs.pruebaUsg = getText(18);

      formRefs.impresionesDiagnosticas = getArea(10);
      formRefs.responsableClinico = getText(19);
      formRefs.numeroHoja = getText(20);

    } else if (variant === 'reptiles') {
      const dateInput = el.querySelector('input[type="date"]');
      formRefs.fecha = dateInput ? dateInput.value : '';
      formRefs.especie = getText(0);
      formRefs.nombreComun = getText(1);
      formRefs.identificacion = getText(2);
      formRefs.ubicacion = getText(3);
      formRefs.edad = getText(4);
      formRefs.sexo = getText(5);
      formRefs.peso = getText(6);
      formRefs.nombre = getText(7);

      formRefs.anamnesis = getArea(0);
      formRefs.aspectoGeneral = getArea(1);
      formRefs.entornoAmbiente = getArea(2);

      formRefs.sistemasAfectados = getCheckboxes('input[type="checkbox"]');
      formRefs.descripcionProblema = getArea(3);

      formRefs.pruebaBh = getText(8);
      formRefs.pruebaQs = getText(9);
      formRefs.pruebaCopro = getText(10);
      formRefs.pruebaOtra = getText(11);
      formRefs.pruebaRx = getText(12);
      formRefs.pruebaUsg = getText(13);

      formRefs.observacionesLab = getArea(4);
      formRefs.impresionesDiagnosticas = getArea(5);

      formRefs.responsableClinico = getText(14);

    } else {
      // variant === 'normal'
      const dateInput = el.querySelector('input[type="date"]');
      formRefs.fecha = dateInput ? dateInput.value : '';
      formRefs.nombreCientifico = getText(0);
      formRefs.nombreComun = getText(1);
      formRefs.ubicacion = getText(2);
      formRefs.identificacion = getText(3);
      formRefs.edad = getText(4);
      formRefs.peso = getText(5);
      formRefs.sexo = getText(6);

      formRefs.anamnesis = getArea(0);

      formRefs.fc = getText(7);
      formRefs.fr = getText(8);
      formRefs.temp = getText(9);
      formRefs.tllc = getText(10);

      formRefs.aspectoGeneral = getArea(1);
      formRefs.pielPlumas = getArea(2);
      formRefs.cardiovascular = getArea(3);
      formRefs.respiratorio = getArea(4);
      formRefs.digestivo = getArea(5);
      formRefs.musculoEsqueletico = getArea(6);
      formRefs.visualAuditivo = getArea(7);
      formRefs.urogenital = getArea(8);
      formRefs.nervioso = getArea(9);
      formRefs.gangliosLinfaticos = getArea(10);

      // General specific tests
      formRefs.pruebaBh = getText(11);
      formRefs.pruebaQs = getText(12);
      formRefs.pruebaFrotis = getText(13);
      formRefs.pruebaPaf = getText(14);
      formRefs.pruebaEgo = getText(15);
      formRefs.pruebaCopro = getText(16);
      formRefs.pruebaRx = getText(17);
      formRefs.pruebaUsg = getText(18);

      formRefs.impresionesDiagnosticas = getArea(11);
      formRefs.responsableClinico = getText(19);
    }

    generateClinicalReviewPDF(formRefs, variant);
  };

  const handleFormSave = () => {
    const el = formRef.current;
    if (!el) {
      originalHandleSave();
      return;
    }

    const dateInput = el.querySelector('input[type="date"]');
    const fecha = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

    let responsable = '';
    const textInputs = Array.from(el.querySelectorAll('input[type="text"]'));
    if (variant === 'aves') {
      responsable = textInputs[19] ? textInputs[19].value : '';
    } else if (variant === 'reptiles') {
      responsable = textInputs[14] ? textInputs[14].value : '';
    } else {
      responsable = textInputs[19] ? textInputs[19].value : '';
    }

    const recordMeta = {
      fecha,
      responsable,
      variante: variant
    };

    originalHandleSave();
    if (onSave) {
      onSave(recordMeta);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Premium Floating Variant Selector (only for admin) */}
      {canToggle && (
        <div className="flex justify-center w-full ">
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

      {/* Main Document Card */}
      <div
        className="bg-transparent global-form-width"
        ref={formRef}
      >
        <style>
          {`
            .page-separator {
              height: 20px;
              background-color: transparent;
            }
          `}
        </style>
        <div className="block">
          {variant === 'reptiles' ? (
            <ReptilesReviewVariant
              patient={patient}
              getTitle={getTitle}
              isSaved={isSaved}
              handleSave={handleFormSave}
              handleExportPDF={handleExportPDF}
            />
          ) : (
            <NormalAvesReviewVariant
              patient={patient}
              step={step}
              getTitle={getTitle}
              isSaved={isSaved}
              handleNext={handleNext}
              handleBack={handleBack}
              handleSave={handleFormSave}
              handleExportPDF={handleExportPDF}
              isAves={variant === 'aves'}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicalReviewForm;
